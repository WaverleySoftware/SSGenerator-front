import { Component, Input, OnInit } from '@angular/core';
import { ItemDetailsService } from '../item-details.service';
import { AbstractControl, FormControl } from '@angular/forms';
import { TranslatePipe } from 'sizing-shared-lib';

@Component({
  selector: 'app-results-item-details',
  templateUrl: './results-item-details.component.html',
  styleUrls: ['./results-item-details.component.scss']
})
export class ResultsItemDetailsComponent implements OnInit {
  @Input() processConditions = null;

  @Input()
  get selectedProduct() {
    return this._selectedProduct;
  }
  set selectedProduct(value: any) {
    this._selectedProduct = value;
    this.interceptProductChange();
  }
  private _selectedProduct = null;

  get isTfaProduct() {
    return this.selectedProduct && this.selectedProduct.type === 'TFA';
  }

  get tfaForm() {
    return this.itemDetailsService.tfaForm;
  }

  get isTvaProduct() {
    return this.selectedProduct && this.selectedProduct.type === 'TVA';
  }

  get tvaForm() {
    return this.itemDetailsService.tvaForm;
  }

  get isRim20Product() {
    return this.selectedProduct && this.selectedProduct.type === 'RIM20';
  }

  get isVim20Product() {
    return this.selectedProduct && this.selectedProduct.type === 'VIM20';
  }

  get rim20Form() {
    return this.itemDetailsService.rim20Form;
  }

  get rim20ProbeLengthFilters() {
    return this.itemDetailsService.rim20ProbeLengthFilters;
  }

  get rim20ProcessConnectionFilters() {
    return this.itemDetailsService.rim20ProcessConnectionFilters;
  }

  get rim20OutputSignalFilters() {
    return this.itemDetailsService.rim20OutputSignalFilters;
  }

  get rim20EnclosureFilters() {
    return this.itemDetailsService.rim20EnclosureFilters;
  }

  get rim20PressureSensorFilters() {
    return this.itemDetailsService.rim20PressureSensorFilters;
  }

  get rim20ProcessTemperature() {
    return this.itemDetailsService.rim20ProcessTemperature;
  }

  get vim20Form() {
    return this.itemDetailsService.vim20Form;
  }

  get vim20ProbeLengthFilters() {
    return this.itemDetailsService.vim20ProbeLengthFilters;
  }

  get vim20ProcessConnectionFilters() {
    return this.itemDetailsService.vim20ProcessConnectionFilters;
  }

  get vim20OutputSignalFilters() {
    return this.itemDetailsService.vim20OutputSignalFilters;
  }

  get vim20EnclosureFilters() {
    return this.itemDetailsService.vim20EnclosureFilters;
  }

  get vim20PressureSensorFilters() {
    return this.itemDetailsService.vim20PressureSensorFilters;
  }

  get vim20ProcessTemperatureFilters() {
    return this.itemDetailsService.vim20ProcessTemperatureFilters;
  }

  get utm10ConduitLengthFilters() {
    return this.itemDetailsService.utm10ConduitLengthFilters;
  }

  get utm10RtdFilters() {
    return this.itemDetailsService.utm10RtdFilters;
  }

  get utm10DigitalCommunicationsFilters() {
    return this.itemDetailsService.utm10DigitalCommunicationsFilters;
  }

  get utm10TemperatureRangeFilters() {
    return this.itemDetailsService.utm10TemperatureRangeFilters;
  }

  get utm10Utm10ApprovalsFilters() {
    return this.itemDetailsService.utm10Utm10ApprovalsFilters;
  }

  get utm10SubmersibleFilters() {
    return this.itemDetailsService.utm10SubmersibleFilters;
  }

  get utm10MountingTracksFilters() {
    return this.itemDetailsService.utm10MountingTracksFilters;
  }

  get utm10Utt10ApprovalsFilters() {
    return this.itemDetailsService.utm10Utt10ApprovalsFilters;
  }

  get isElmProduct() {
    return this.selectedProduct && this.selectedProduct.type === 'ELM';
  }

  get elmForm() {
    return this.itemDetailsService.elmForm;
  }

  get isUtm10Product() {
    return this.selectedProduct && this.selectedProduct.type === 'UTM10';
  }

  get utm10Form() {
    return this.itemDetailsService.utm10Form;
  }

  get utm10CustomCableLengthError() {
    const errors = this.utm10Form.get('customCableLength').errors;
    if (errors && errors.LengthUnit && errors.LengthUnit.length) {
      return this.translateErrors(errors.LengthUnit);
    }

    if (errors && errors.required) {
      return this.translateErrors(['REQUIRED_FIELD']);
    }

    if (errors) {
      return this.translateErrors(['UNKNOWN_ERROR']);
    }

    return null;
  }

  get utm10CustomConduitLengthError() {
    const errors = this.utm10Form.get('customConduitLength').errors;
    if (errors && errors.LengthUnit && errors.LengthUnit.length) {
      return this.translateErrors(errors.LengthUnit);
    }

    if (errors && errors.required) {
      return this.translateErrors(['REQUIRED_FIELD']);
    }

    if (errors) {
      return this.translateErrors(['UNKNOWN_ERROR']);
    }

    return null;
  }

  constructor(
    public itemDetailsService: ItemDetailsService,
    private translatePipe: TranslatePipe,
  ) { }

  ngOnInit() {
  }

  decideOnUpdate(control: AbstractControl, newValue: string, filters: string[]) {
    const oldValue = control.value;
    // If filters are set, and filters don't have old value, we should update the value
    if (filters.length && !filters.includes(oldValue)) {
      control.setValue(newValue);
    } else {
      // Otherwise, set control value to the existing one, to update visual state
      control.setValue(oldValue);
    }
  }

  private translateErrors(errors: string[]): string {
    const translated = errors.map(error => this.translatePipe.transform(error));
    return translated.join('\n');
  }

  private interceptProductChange() {
    if (!this.selectedProduct) {
      return;
    }
    this.itemDetailsService.changeProcessConditions(this.processConditions);
    this.itemDetailsService.changeProduct(this.selectedProduct);
  }

}
