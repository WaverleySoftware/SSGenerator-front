import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { EnumerationComponent } from 'sizing-shared-lib';

@Component({
  selector: 'app-flow-meter-enumeration',
  template: `
    <!-- Layout for enumerations -->
    <div> <!--class="col-lg-4 col-xs-12">-->
      <select [disabled]="isDisabled" class="form-control" (blur)="onTouched()" (ngModelChange)="onChange($event)" [ngModel]="enumerationItem" title="{{enumerationItemTranslationText}}">
        <option *ngFor="let enumerationDefinition of enumerationCollection; let i = index" [value]="enumerationDefinition.value" title="{{enumerationDefinition.translationText}}{{enumerationDefinition.extraPostText}}">{{enumerationDefinition.translationText}}{{enumerationDefinition.extraPostText}}</option>
      </select>
    </div>
  `,
  styles: [],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => FlowMeterEnumerationComponent),
  }]
})
export class FlowMeterEnumerationComponent extends EnumerationComponent {

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
      // TODO: This creates problems with Angular reactive forms
      // TODO: Implement another mechanism for this
      // this.isDisabled = (definitions && definitions.length === 1);

      return definitions;
    }
  }

  initialiseEnumerationCollection()
  {
     this.enumerationCollection = this.getEnumerationCollection();

    // If no value has initially been set for the enumerationItem, set it to the first item
    if ((!this.enumerationItem || this.isInitialised) && !!this.enumerationCollection) {

      if (this.enumerationCollection.length > 0) {
        const internalValueExistsInCollection = this.enumerationCollection.find(item => item.value === this.internalValue);

        this.internalValue = internalValueExistsInCollection ? this.internalValue : this.enumerationCollection[0].value;
        // DO NOT use the setter for this.enumerationItem as it fire OnChange that breaks P&Js when selecting a
        // project with both Trade and Industry lists set.
      }
      
    }
    else if (!this.opCoOverride) {
      console.error(`enumerationCollection should not be empty? Routing / resolver problem?`);
    }
  }
}
