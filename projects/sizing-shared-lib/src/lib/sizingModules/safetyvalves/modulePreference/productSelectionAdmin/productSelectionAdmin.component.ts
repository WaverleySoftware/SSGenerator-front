import { Component, OnInit, Output, Input, EventEmitter, forwardRef, ChangeDetectorRef} from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators, NG_VALIDATORS, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SaveSafetyValvesProductSelection } from './productSelectionAdminModel';
//import { isNullOrUndefined } from '@swimlane/ngx-datatable';
import { isNullOrUndefined } from 'util';
import { SafetyValvesProductSelection } from './safetyValvesProductSelection.model';
import { ProductSelectionAdminService } from './productSelectionAdmin.service';
import { ExcludedSafetyValves } from "./excludedSafetyValves.model";
import { TranslationService } from "../../../../shared/translation/translation.service";

@Component({
  selector: 'product-selection-admin',
  exportAs: 'product-selection-admin',
  templateUrl: './productSelectionAdmin.component.html',
  styleUrls: ['./productSelectionAdmin.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => ProductSelectionAdminComponent),
  }, {
    provide: NG_VALIDATORS,
    useExisting: ProductSelectionAdminComponent,
    multi: true
  }
  ]
})


export class ProductSelectionAdminComponent implements OnInit, ControlValueAccessor {

  userForm: FormGroup;
  isSuccess: boolean = false;
  isError: boolean = false;
  saveButtonFade: boolean = true;

  constructor(
    private productSelectionAdminService: ProductSelectionAdminService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  )
  {
  

  }
  readonly moduleGroupId: number = 1;
  readonly moduleName: string = "Safety Valves";

  @Output('productSelectorOnChange') productSelectorOnChange: EventEmitter<string[]> = new EventEmitter<string[]>();

  //@Input("module-name") moduleName: string;
  //@Input("module-group-id") moduleGroupId: number = 0;

  public saveNewSafetyValvesSelection = new SaveSafetyValvesProductSelection();
  public products: SafetyValvesProductSelection[] = [];
  public excludedProducts: ExcludedSafetyValves[] = [];
  public internalModuleName: string;

  /* Boilerplate directive component code */
  @Input('value') internalValue: string[] = null;
  //@Input('productId') internalIdValue: number[] = null;
  onChange: any = () => { };
  onTouched: any = () => { };
  valvesToSave: number[];



  get selectedProducts(): string[] {
    return this.internalValue;
  }

  set selectedProducts(products: string[]) {
    this.internalValue = products;

    this.onChange(this.internalValue);
    this.onTouched();
  
  }

  validate({ value }: FormControl) {
    const isNotValid = this.selectedProducts.length === 0;
    return isNotValid && {
      invalid: true
    }
  }

  /**
   * Registers any changes to the directive and applies the provided callback function.
   * @param fn The callback function.
   */
  registerOnChange(fn) {
    const bespokeChange = (newValue: string[]) => {
      fn(newValue);
    };

    this.onChange = bespokeChange;
  }

  /**
   * Registers the touched event to the directive and applies the provided callback function.
   * @param fn The callback function.
   */
  registerOnTouched(fn) {
    const bespokeTouched = () => {
      fn();
    };

    this.onTouched = bespokeTouched;
  }

  /**
   * Registers a final change to the provided directive's value and provides a space to apply it.
   * @param value The directive's implicit value.
   */
  writeValue(value) {
    if (!!value) {
      this.selectedProducts = value;

      // Enable selected products!
      this.products.forEach(p => p.productNames.some(r => this.selectedProducts.indexOf(r) >= 0) ? p.isSelected = true : p.isSelected = false);

    } else {
      // If no value is specified, use a default and set it to an empty array.
      this.selectedProducts = [];

      // Set the products to be no longer selected
      this.products.forEach(p => p.isSelected = false);
    }
  }

 

  ngOnInit(): void {
    this.selectedProducts = [];
    this.valvesToSave = [];

    this.userForm = new FormGroup({
    formSelectedProducts: new FormControl(this.selectedProducts),
    formValvesToSave: new FormControl(this.valvesToSave)
    });
    

      // Call the service that gets the product ranges for the given module group Id.
      this.productSelectionAdminService.getProductExclusionRanges(this.moduleGroupId).subscribe(excludedProducts => {

        if (!isNullOrUndefined(excludedProducts.excludedSafetyValves))
          for (const x of excludedProducts.excludedSafetyValves) {
            this.selectedProducts.push(x)
          }
      })
    
  }

  ngAfterContentInit(): void{

    
    if (this.moduleGroupId > 0) {
      //this.productSelectionAdminService.getAllProductRanges(this.moduleGroupId, this.productTypeId).subscribe(products => {
      this.productSelectionAdminService.getAllProductSelectionRanges(this.moduleGroupId).subscribe(products => {
        // The returned array of products is for every single iteration of a product for a given product range.
        // This should be condensed into product ranges only, with each product listed as an array item of that product range.
        for (const product of products) {

          const index = this.products.findIndex(p => p.productRangeId === product.productRangeId);

          if (index > -1) {
            // It already exists in the array, so push the product name
            this.products[index].productNames.push(product.productName);
          } else {
            // No item found, so create a new product selection item
            const productSelectionItem = new SafetyValvesProductSelection();

            productSelectionItem.productRangeId = product.productRangeId;
            productSelectionItem.productRangeName = product.productRangeName;
            productSelectionItem.productNames = [];
            productSelectionItem.productNames.push(product.productName);
            productSelectionItem.moduleGroupId = product.moduleGroupId;
            productSelectionItem.productTypeId = product.productTypeId;

            // Determine the selected status depending on whether or not it is contained in the selected products property.
            productSelectionItem.isSelected =
              this.selectedProducts.findIndex(sp => sp === product.productName) > -1;
            // Push the new item into the global products array

            if (productSelectionItem.isSelected) {
              this.valvesToSave.push(product.productRangeId);
            }

            this.products.push(productSelectionItem);
          }
        }
        
      });
    };
  
 

    this.internalModuleName = this.moduleName.toLowerCase().replace(/\s/g, '');
  }

  /**
   * Clicking on a product range should either add all the products in the range
   * or remove all the products from the range that has been de-selected.
   * @param product
   */
  public productRangeClick(product: SafetyValvesProductSelection): void {
    product.isSelected = !product.isSelected;

    // If the product range is now selected, add the products of the range to the array of selected products.
    if (product.isSelected) {
      this.selectedProducts = this.selectedProducts.concat(product.productNames);
      this.valvesToSave = this.valvesToSave.concat(product.productRangeId);
    } else {
      // Otherwise remove all the products from the list of products for that range.
      for (const productName of product.productNames) {
        const index = this.selectedProducts.findIndex(sp => sp === productName);

        this.selectedProducts.splice(index, 1);
      }
      const index = this.valvesToSave.findIndex(vts => vts === product.productRangeId);
      this.valvesToSave.splice(index, 1);
    }

    this.onChange(this.selectedProducts);

    this.productSelectorOnChange.emit(this.selectedProducts);
    this.saveButtonFade = false;
    this.isSuccess = false;

  }

  onSave() {
    //console.log('new Selected Safety Valves IDs: ' + this.valvesToSave.toString());
    this.saveNewSafetyValvesSelection.selectedValvesIds = this.valvesToSave;
    this.saveNewSafetyValvesSelection.safetyValvesModuleId = this.moduleGroupId;


    this.productSelectionAdminService.selectedSafetyValves(this.saveNewSafetyValvesSelection).subscribe((result: SaveSafetyValvesProductSelection) => {
      if (!isNullOrUndefined(result.selectedValvesIds)) {
        console.log('save isNullOrUndefined');
        this.saveButtonFade = true;
        this.isError = true;
      }
      else {
        console.log('save completed');
        this.isSuccess = true;
        this.saveButtonFade = true;
      }
    })
  }
}

