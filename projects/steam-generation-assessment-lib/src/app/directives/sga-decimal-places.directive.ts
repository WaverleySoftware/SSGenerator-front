import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[sga-decimal-places]'
})
export class SgaDecimalPlacesDirective implements OnChanges {
  @Input('sga-decimal-places') decimal?: number;
  private readonly maxLength = 20;

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent) {
    if (
      [46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      return;
    }

    if (this.value.length >= this.maxLength) {
      e.preventDefault();
    }
  }

  @HostListener('blur', ['$event']) onBlur() {
    this.roundNumbers();
  }

  get value() {
    return this.el && this.el.nativeElement && this.el.nativeElement.value;
  }

  set value(value) {
    if (this.el && this.el.nativeElement) {
      this.el.nativeElement.value = value;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.decimal && changes.decimal.currentValue && changes.decimal.currentValue !== changes.decimal.previousValue) {
      this.roundNumbers();
    }
  }

  private roundNumbers() {
    if (this.value) {
      this.value = Math.round(Number(this.value) * Math.pow(10, this.decimal || 0)) / Math.pow(10, this.decimal || 0);
    }
  }
}
