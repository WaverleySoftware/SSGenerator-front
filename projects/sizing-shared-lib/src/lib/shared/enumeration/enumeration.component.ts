import { Component, Input, Output, forwardRef, EventEmitter, OnInit, OnChanges, AfterContentInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { TranslationService } from "../translation/translation.service";
import { EnumerationDefinition, Enumeration } from "../translation/translation.model";

import * as cloneDeep_ from 'lodash/cloneDeep';

@Component({
  selector: 'enumeration',
  exportAs: 'enumeration',
  templateUrl: './enumeration.component.html',
  styleUrls: ['./enumeration.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => EnumerationComponent),
  }]
})
export class EnumerationComponent implements ControlValueAccessor, OnInit, OnChanges {

  @Input("enumeration-name") enumerationName: string;

  @Input("filter-by") filterBy: string[];

  @Input("opco-override") opCoOverride: boolean = false;

  // To notifiy a selection change to an external component's method.
  // Example html template usage: <enumeration formControlName = "tradeEnum"(on - change) = "handleTradeEnumChanging($event)"... </enumeration> 
  @Output("on-change") externalOnChange = new EventEmitter<{ selectedValue: string, itemsCount: number }>();

  @Output("on-load") externalOnLoad = new EventEmitter<{selectedValue: string, itemsCount: number}>();

  /* Boilerplate directive component code */
  @Input('value') internalValue: string;
  onChange: any = () => { };
  onTouched: any = () => { };

  public isDisabled: boolean;
  public isInitialised: boolean;
  public cloneDeep = cloneDeep_;

  enumerationCollection: EnumerationDefinition[] = [];
  enumeration: Enumeration;

  get enumerationItem(): string {

    return this.internalValue;
  }

  get enumerationItemTranslationText(): string {

    if (!!this.enumeration && this.enumeration.enumerationDefinitions.length > 0
      && !!this.enumeration.enumerationDefinitions.find(e => this.enumeration.enumerationName && e.value === this.internalValue)) {
      var translationText = this.enumeration.enumerationDefinitions.find(e => this.enumeration.enumerationName && e.value === this.internalValue).translationText;
      var extraPostText = this.enumeration.enumerationDefinitions.find(e => this.enumeration.enumerationName && e.value === this.internalValue).extraPostText;
      return translationText + extraPostText;
    }

    return "";
  }


  set enumerationItem(enumerationValue: string) {

     if (enumerationValue !== this.internalValue) { 
       this.internalValue = enumerationValue;
       this.onChange(this.internalValue);
    }

    this.onTouched();
  }

  constructor(protected translationService: TranslationService) { }

  /**
   * Gets the enumerations that matches the specified @Input enumeration name.
   * @returns The array of enumerations sorted by Sequence order.
   */ 
  getEnumerationCollection() { //: EnumerationDefinition[] {
    this.enumeration = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === this.enumerationName && us.opCoOverride === this.opCoOverride)[0];

    // Check if enumerations with overrides NOT found? If so, then populate this with the base enumerations.
    if (!this.enumeration) {
      this.enumeration = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === this.enumerationName && us.opCoOverride === false)[0];
    }

    if (!!this.enumeration) {
      let definitions = this.enumeration.enumerationDefinitions.sort((currentenumeration, nextenumeration) => {
        if (currentenumeration.sequence > nextenumeration.sequence) {
          return 1;
        }

        if (currentenumeration.sequence < nextenumeration.sequence) {
          return -1;
        }

        return 0;
      });

      if (!!this.filterBy && this.filterBy.length > 0) {
        //definitions = cloneDeep(definitions.filter(ed => this.filterBy.includes(ed.value))); // deep clone prevents the UI trans text from being changed on the UI list item.
        definitions = definitions.filter(ed => this.filterBy.includes(ed.value));
      }

      // Disable selection if list has got one item only.
      this.isDisabled = (definitions && definitions.length === 1);

      return definitions;
    }

    return null;
  }

  ngOnChanges(): void {
    if (this.isInitialised) {
      this.initialiseEnumerationCollection();
      if (this.enumerationItem && this.enumerationCollection) {
        this.externalOnLoad.emit({ selectedValue: this.enumerationItem, itemsCount: this.enumerationCollection.length });
      }
    }
  }

  ngOnInit(): void {
    this.initialiseEnumerationCollection();

    if (this.enumerationItem && this.enumerationCollection) {
      this.externalOnLoad.emit({ selectedValue: this.enumerationItem, itemsCount: this.enumerationCollection.length });
    } 

    this.isInitialised = true;
  }

  initialiseEnumerationCollection()
  {
     this.enumerationCollection = this.getEnumerationCollection();

    // If no value has initially been set for the enumerationItem, set it to the first item
    if ((!this.enumerationItem || this.isInitialised) && !!this.enumerationCollection) {

      if (this.enumerationCollection.length > 0) {
        this.internalValue = this.enumerationCollection[0].value; // DO NOT use the setter for this.enumerationItem as it fire OnChange that breaks P&Js when selecting a project with both Trade and Industry lists set.
      }
      
    }
    else if (!this.opCoOverride) {
      console.error(`enumerationCollection should not be empty? Routing / resolver problem?`);
    }
  }
    
  /**
   * Registers any changes to the directive and applies the provided callback function.
   * @param fn The callback function.
   */
  registerOnChange(fn) {
    const bespokeChange = (newValue: string) => {
      //console.log(`bespokeChange err=${newValue}`);
      // The Enumeration Definition is still in memory, so only apply the changed value.
      
      this.internalValue = newValue; //this.enumerationItem = newValue; this changes the setter that then fires the onchange again, multiple onChange events generated.
      this.onTouched();

      fn(this.enumerationItem);

      // Emit the latest change to anything that may be listening.
      this.externalOnChange.emit({ selectedValue: newValue, itemsCount: (this.enumerationCollection ? this.enumerationCollection.length : 0) });
    };
    
    this.onChange = bespokeChange; 
  }

  /**
   * Registers the touched event to the directive and applies the provided callback function.
   * @param fn The callback function.
   */
  registerOnTouched(fn) {
    const bespokeTouched = () => {
      //console.log(`onTouched set`);
      fn();
    };    

    this.onTouched = bespokeTouched;
  }

  /**
   * Registers a final change to the provided directive's value and provides a space to apply it.
   * @param value The directive's implicit value.
   */
  writeValue(value) {
       this.enumerationItem = value;

        if (!value) {
      this.ngOnInit();
    }
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
