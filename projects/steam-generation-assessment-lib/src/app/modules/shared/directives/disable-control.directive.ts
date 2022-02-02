import { NgControl } from '@angular/forms';
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[disableControl]'
})
export class DisableControlDirective {

  @Input() set disableControl(condition: boolean) {
    const action = condition ? 'disable' : 'enable';

    if (this.ngControl && this.ngControl.control) {
      const control = this.ngControl.control;
      control[action]();

      if (action === 'disable' && control.value) {
        control.patchValue(typeof control.value === 'boolean' ? false : 0);
      }
    }
  }

  constructor(private ngControl: NgControl) {}
}
