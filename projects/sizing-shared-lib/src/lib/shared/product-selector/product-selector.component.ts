import { Component, OnInit, Input, forwardRef, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, NG_VALIDATORS } from '@angular/forms';
import { ProductSelectorService } from "./product-selector.service";
import { ProductSelection } from "./product-selection.model";

@Component({
  selector: 'product-selector',
  exportAs: 'product-selector',
  templateUrl: './product-selector.component.html',
  styleUrls: ['./product-selector.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => ProductSelectorComponent),
  }, {
      provide: NG_VALIDATORS,
      useExisting: ProductSelectorComponent,
      multi: true
    }
  ]
})
export class ProductSelectorComponent implements OnInit, ControlValueAccessor {
  
  constructor(private productSelectorService: ProductSelectorService) {

  }
  @Output('productSelectorOnChange') productSelectorOnChange: EventEmitter<string[]> = new EventEmitter<string[]>();

  @Input("module-name") moduleName: string;
  @Input("module-group-id") moduleGroupId: number = 0;
  @Input("product-type-id") productTypeId: number = 0;

  public products: ProductSelection[] = [];
  public internalModuleName: string;

  /* Boilerplate directive component code */
  @Input('value') internalValue: string[] = null;
  onChange: any = () => { };
  onTouched: any = () => { };

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
      this.products.forEach(p => p.productNames.some(r => this.selectedProducts.indexOf(r) >= 0) ? p.isSelected = true : p.isSelected = false );

    } else {
      // If no value is specified, use a default and set it to an empty array.
      this.selectedProducts = [];

      // Set the products to be no longer selected
      this.products.forEach(p => p.isSelected = false);
    }
  }

  ngOnInit(): void {
    // Call the service that gets the product ranges for the given module group Id.
    if (this.moduleGroupId > 0) {
      this.productSelectorService.getAllProductRanges(this.moduleGroupId, this.productTypeId).subscribe(products => {
        // The returned array of products is for every single iteration of a product for a given product range.
        // This should be condensed into product ranges only, with each product listed as an array item of that product range.
        for (const product of products) {

          const index = this.products.findIndex(p => p.productRangeId === product.productRangeId);

          if (index > -1) {
            // It already exists in the array, so push the product name
            this.products[index].productNames.push(product.productName);
          } else {
            // No item found, so create a new product selection item
            const productSelectionItem = new ProductSelection();

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
            this.products.push(productSelectionItem);
          }
        }
      });
    }

    this.internalModuleName = this.moduleName.toLowerCase().replace(/\s/g, '');
  }

  /**
   * Clicking on a product range should either add all the products in the range
   * or remove all the products from the range that has been de-selected.
   * @param product
   */
  public productRangeClick(product: ProductSelection): void {
    product.isSelected = !product.isSelected;

    // If the product range is now selected, add the products of the range to the array of selected products.
    if (product.isSelected) {
      this.selectedProducts = this.selectedProducts.concat(product.productNames);
    } else {
      // Otherwise remove all the products from the list of products for that range.
      for (const productName of product.productNames) {
        const index = this.selectedProducts.findIndex(sp => sp === productName);

        this.selectedProducts.splice(index, 1);
      }
    }

    this.onChange(this.selectedProducts);

    this.productSelectorOnChange.emit(this.selectedProducts);
  }
}
