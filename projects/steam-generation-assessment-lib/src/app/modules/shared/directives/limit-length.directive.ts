import { Directive, Input } from "@angular/core";
import { NgControl } from "@angular/forms";
import { filter, map } from "rxjs/operators";

@Directive({
  selector: '[inputLimitTo]',
})
export class InputLimitToDirective {
  @Input() inputLimitTo: string | number = 10;

  constructor(private ngControl: NgControl) {}

  ngOnInit() {
    const ctrl = this.ngControl.control;

    ctrl && ctrl.valueChanges
      .pipe(
        filter((v) => !!v && v.length),
        map(v => (v || '').toString().slice(0, this.inputLimitTo))
      )
      .subscribe(v => ctrl.setValue(v, { emitEvent: false }));
  }
}
