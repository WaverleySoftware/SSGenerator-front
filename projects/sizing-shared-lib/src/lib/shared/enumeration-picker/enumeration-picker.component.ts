import { Component, Input, Output, forwardRef, EventEmitter, OnInit, ViewChild } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { TranslationService } from "../translation/translation.service";

import { Enumeration } from "../translation/translation.model";
import { EnumerationDefinition } from "../translation/translation.model";

import { TranslatePipe } from "../translation/translate.pipe";

import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  selector: 'enumeration-picker',
  exportAs: 'enumeration-picker',
  templateUrl: './enumeration-picker.component.html',
  styleUrls: ['./enumeration-picker.component.scss'],
  providers: [{
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => EnumerationPickerComponent),
    }]
})
export class EnumerationPickerComponent implements ControlValueAccessor, OnInit {

  @Input("enumeration-picker-name") enumerationPickerName: string;  

  /* Boilerplate directive component code */
  @Input('value') internalValue: EnumerationDefinition[] = [];  

  // To notifiy a selection change to an external component's method.
  // Example html template usage: <enumeration formControlName = "tradeEnum"(on - change) = "handleTradeEnumChanging($event)"... </enumeration> 
  @Output("on-change") externalOnChange: EventEmitter<EnumerationDefinition[]> = new EventEmitter<EnumerationDefinition[]>();

  @ViewChild("enumerationPickerTable", { static: false }) enumerationPickerTable: DatatableComponent;
  @ViewChild("enumerationPickerOpCoTable", { static: false }) enumerationPickerOpCoTable: DatatableComponent;

  get enumerationPickerOpCoCollection(): EnumerationDefinition[] {
    return this.internalValue;
  }
  set enumerationPickerOpCoCollection(val: EnumerationDefinition[]) {    
    this.internalValue = val;    

    this.onChange(this.internalValue);
    this.onTouched();
  }

  enumerationPickerCollection: EnumerationDefinition[] = [];
  
  public internalSelectedItem: EnumerationDefinition[] = [];
  public internalOpCoSelectedItem: EnumerationDefinition[] = [];

  onChange: any = () => { };
  onTouched: any = () => { };

  public moveOptionsDownSelected: boolean = false;
  public moveOptionsUpSelected: boolean = false;

  /* Available Options*/
  get enumerationPickerSelectedItem(): any {
    return this.internalSelectedItem;
  }  
  set enumerationPickerSelectedItem(enumerationPickerValue: any) {   
    if (enumerationPickerValue !== this.internalSelectedItem) {
      this.internalSelectedItem = enumerationPickerValue;
      //this.onChange(this.internalValue);
    }

    //this.onTouched();
  }

  /* OpCo Selected Options*/
  get enumerationPickerOpCoSelectedItem(): any {
    return this.internalOpCoSelectedItem;
  }
  set enumerationPickerOpCoSelectedItem(enumerationPickerValue: any) {
    if (enumerationPickerValue !== this.internalOpCoSelectedItem) {
      this.internalOpCoSelectedItem = enumerationPickerValue;
      //this.onChange(this.internalOpCoSelectedItem);
    }

    //this.onTouched();
  }

  constructor(private translationService: TranslationService, private fb: FormBuilder, public translatePipe: TranslatePipe) {    
  }

  ngOnInit(): void {    

    this.enumerationPickerCollection = this.getEnumerationPickerCollection(this.enumerationPickerName, false);
  }

  getEnumerationPickerCollection(enumerationPickerName, opCoOverride)
  {
    const enumeration = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === enumerationPickerName && us.opCoOverride === opCoOverride);

    if (!!enumeration && enumeration.length > 0) {
      let definitions = enumeration[0].enumerationDefinitions.sort((currentenumeration, nextenumeration) => {
        if (currentenumeration.sequence > nextenumeration.sequence) {
          return 1;
        }

        if (currentenumeration.sequence < nextenumeration.sequence) {
          return -1;
        }

        return 0;
      });
      
      definitions.forEach(i => i.isDeleted = false);

      this.onChange(definitions);

      return definitions;
    }
  }

  /**
   * Registers any changes to the directive and applies the provided callback function.
   * @param fn The callback function.
   */
  registerOnChange(fn) {
    const bespokeChange = (newValue: EnumerationDefinition[]) => {
      // The Enumeration Definition is still in memory, so only apply the changed value.
      //this.enumerationPickerOpCoCollection = newValue;

      // Now, ensure that the Sequencing is correct?
      newValue.sort((v1, v2) => {
        if (!v1.isDeleted && v2.isDeleted) {
          return -1;
        }
        if (v1.isDeleted && !v2.isDeleted) {
          return 1;
        }
        return 0;
      });

      for (let i of newValue)
      {
        i.sequence = newValue.indexOf(i) + 1;
      }

      fn(newValue);

      //Emit the latest change to anything that may be listening.
      this.externalOnChange.emit(newValue);
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
      this.enumerationPickerOpCoCollection = value;
    }
  }

  onEnumerationPickerSelect(event: any, isSelected: boolean) {
    // Set the flags appropriately
    this.moveOptionsDownSelected = isSelected;
    this.moveOptionsUpSelected = !isSelected;

    // Empty out the appropriate list
    if (!isSelected) {
      this.enumerationPickerSelectedItem = [];
    }
    else {
      this.enumerationPickerOpCoSelectedItem = [];
    }

    const op = event.selected as EnumerationDefinition[];

    // If no items are selected, then nothing is selected
    if (op.length === 0) {
      this.enumerationPickerSelectedItem = false;
      this.enumerationPickerOpCoSelectedItem = false;
    }
  }

  /**
   * Method to add/remove items from the OpCo selected list.  
   */
  moveSelectedOptions($event, isMovingSelectedOptions: boolean) {
    $event.preventDefault();

    // Check if Add is selected?
    if (isMovingSelectedOptions) {

      // Set the selected vetted users back to non-vetted
      for (const selectedOption of this.enumerationPickerSelectedItem) {
               
        const option = this.enumerationPickerCollection.find(o => o.value === selectedOption.value);
        
        if (!!this.enumerationPickerOpCoCollection) {

          if (!this.enumerationPickerOpCoCollection.find(o => o.value === option.value)) {
            this.enumerationPickerOpCoCollection.push(option);
          }
          else {            
            this.enumerationPickerOpCoCollection.find(o => o.value === option.value).isDeleted = false;
          }
        }
      }

    } else {
      // Set the selected items to delete.
      for (const selectedOption of this.enumerationPickerOpCoSelectedItem) {
        // Ensure that at least one item is left in the list.
        if (this.enumerationPickerOpCoCollection.filter(i => i.isDeleted === false).length > 1) {
          selectedOption.isDeleted = true;
        }
      }      
    }

    // Empty out the selected users
    this.enumerationPickerSelectedItem = [];
    this.enumerationPickerOpCoSelectedItem = [];

    // Reset the buttons
    this.moveOptionsDownSelected = false;
    this.moveOptionsUpSelected = false;

    // Reset the rows (to update the view)
    this.enumerationPickerTable.rows = this.enumerationPickerCollection;
    this.enumerationPickerOpCoTable.rows = this.enumerationPickerOpCoCollection.filter(i => i.isDeleted === false);

    // Changes can be saved
    //this.moduleChangesMade = true;

    this.onChange(this.enumerationPickerOpCoCollection);
  }

  /**
   * Method to move item up/down on the OpCo selected list.  
   */
  moveSelectedOptionsSequence($event, isMovingSelectedOptionsSequence: boolean) {
    $event.preventDefault();

    // Set the selected
    for (const selectedOption of this.enumerationPickerOpCoSelectedItem) {
      const option = this.enumerationPickerOpCoCollection.find(o => o.value === selectedOption.value);

      const index = this.enumerationPickerOpCoCollection.indexOf(option);
      const index2 = isMovingSelectedOptionsSequence ? index + 1 : index - 1;

      // Check and ensure that indexs are within range?
      if (index >= 0 && index2 >= 0) {
        this.moveSequence(this.enumerationPickerOpCoCollection, index, index2);
      }      
    }

    // Empty out the selected users    
    this.enumerationPickerOpCoSelectedItem = [];

    // Reset the buttons
    this.moveOptionsUpSelected = false;

    // Reset the rows (to update the view)
    //this.enumerationPickerOpCoTable.rows = this.enumerationPickerOpCoCollection;
    this.enumerationPickerOpCoTable.rows = this.enumerationPickerOpCoCollection.filter(i => i.isDeleted === false);

    // Changes can be saved
    //this.moduleChangesMade = true;

    this.onChange(this.enumerationPickerOpCoCollection);
  }

  /**
  * Method to move sequence of list items in line with the OpCo selection.
  */
  moveSequence(optionList, oldIndex, newIndex) {
    if (newIndex < optionList.length) {
      optionList.splice(newIndex, 0, optionList.splice(oldIndex, 1)[0]);
      return optionList;
    }
  }
}
