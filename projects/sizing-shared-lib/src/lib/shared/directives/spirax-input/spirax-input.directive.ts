import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SimpleChanges
} from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AbstractControl, NgControl, ValidationErrors } from '@angular/forms';
import { UnitsService } from '../../units/units.service';
import { TranslatePipe } from '../../translation/translate.pipe';


@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[spirax-input]',
})
export class SpiraxInputDirective implements OnInit, OnChanges, OnDestroy {
  @Input() unitIds?: [number, number?];
  @Input() unitsStr?: [string?, string?];
  @Input() label?: string;
  @Input() error?: string | ValidationErrors;
  @Input() radio?: any;
  @Output() radioClick: EventEmitter<any> = new EventEmitter<any>();
  private ngUnsubscribe = new Subject<void>();
  private units: {[key: number]: string};
  private wrapperNode: HTMLElement;

  constructor(
    private el: ElementRef,
    private unitsService: UnitsService,
    private translatePipe: TranslatePipe,
    @Optional() private control: NgControl
  ) {}

  ngOnInit() {
    this.generateInputWrapper();
    this.fieldMessageChange();

    if (this.unitsStr && this.unitsStr.length) {
      this.generateUnits(this.unitsStr[0], this.unitsStr[1]);
    } else if (this.unitIds && this.unitIds.length) {
      this.unitsService.unitsChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe((units) => {
        this.units = units.reduce((obj, unit) => ({ ...obj, [unit.id]: unit.units }), {});

        this.generateUnits(this.units[this.unitIds[0]], this.units[this.unitIds[1]]);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      !this.unitsStr && changes.unitIds && !changes.unitIds.firstChange &&
      this.el && this.el.nativeElement && this.el.nativeElement.parentNode
    ) {
      const [left, right] = this.unitIds;
      const units = this.units || this.unitsService.units.reduce((obj, unit) => ({ ...obj, [unit.id]: unit.units }), {});
      const unitWrapper: HTMLElement = this.el.nativeElement.parentNode.querySelector('.spiraxInput_unit');

      this.generateUnits(units[left], units[right], unitWrapper);
    } else if (
      this.unitsStr && this.unitsStr.length && changes.unitsStr && !changes.unitsStr.firstChange &&
      this.el && this.el.nativeElement && this.el.nativeElement.parentNode
    ) {
      const unitWrapper: HTMLElement = this.el.nativeElement.parentNode.querySelector('.spiraxInput_unit');

      this.generateUnits(this.unitsStr[0], this.unitsStr[1], unitWrapper);
    }
  }

  ngOnDestroy() {
    if (this.wrapperNode && this.wrapperNode.removeEventListener && this.radio !== undefined) {
      this.wrapperNode.removeEventListener('click', this.wrapperClickHandle);
    }
  }

  private generateInputWrapper() {
    if (this.el && this.el.nativeElement) {
      this.wrapperNode = document.createElement('div');
      const message = document.createElement('p');

      if ((this.unitIds && this.unitIds.length) || (this.unitsStr && this.unitsStr.length)) {
        this.el.nativeElement.classList.add('loading');
      }

      if (this.label) {
        const label = document.createElement('label');
        label.classList.add('spiraxInput_label');
        label.innerHTML = this.label;
        this.wrapperNode.appendChild(label);
      }

      this.wrapperNode.classList.add('spiraxInput');
      message.classList.add('spiraxInput_message');
      message.innerHTML = this.generateMessage(this.control && this.control.control);

      this.el.nativeElement.setAttribute('placeholder', ' ');
      this.el.nativeElement.classList.add('spiraxInput_control');

      if (this.el.nativeElement.parentNode) {
        this.el.nativeElement.parentNode.insertBefore(this.wrapperNode, this.el.nativeElement);
      }

      this.wrapperNode.appendChild(this.el.nativeElement);

      if (this.radio !== undefined) {
        const radioCheck = document.createElement('span');
        radioCheck.classList.add('spiraxInput_radio');
        this.wrapperNode.appendChild(radioCheck);
        this.wrapperNode.addEventListener('click', this.wrapperClickHandle);
      }

      this.wrapperNode.appendChild(message);
    }
  }

  private wrapperClickHandle = (data: any) => this.radioClick.emit(data);

  private fieldMessageChange(c?: AbstractControl) {
    const control: AbstractControl = c || this.control && this.control.control;

    if (control && control.statusChanges) {
      control.statusChanges.pipe(distinctUntilChanged()).subscribe((status) => {
        const errorNode = this.el.nativeElement.parentNode.querySelector('.spiraxInput_message');

        if (status === 'VALID') {
          errorNode.innerHTML = '';
        } else {
          errorNode.innerHTML = this.generateMessage(control);
        }
      });
    }
  }

  private generateMessage(control: AbstractControl): string {
    const errors = control && control.errors || this.error;

    if (!errors) { return null; }

    if (typeof errors === 'string') { return errors; }

    if (errors.required) {
      return this.translatePipe.transform('REQUIRED');
    }
    if (errors.min) {
      return this.translatePipe.transform(errors.message || 'THE_VALUE_IS_BELOW_THE_MINIMUM_ALLOWED_MESSAGE') + ` ${errors.min.min || ''}`;
    }
    if (errors.max) {
      return this.translatePipe.transform(errors.message || 'THE_VALUE_IS_BELOW_THE_MAXIMUM_ALLOWED_MESSAGE') + ` ${errors.max.max || ''}`;
    }

    return errors.error ? this.translatePipe.transform(errors.error) + ' ' + (errors.message || '') : (errors.message || '');
  }

  private generateUnits(leftUnit: string, rightUnit: string, wrapper?: HTMLElement): HTMLElement {
    let html = '';

    if (!wrapper) {
      html = '<div class="spiraxInput_unit">';
    }

    if (leftUnit) { html += `<span>${leftUnit}</span>`; }
    if (leftUnit && rightUnit) { html += '/'; }
    if (rightUnit) { html += `<span>${rightUnit}</span>`; }

    if (!wrapper) {
      html += '</div>';
      this.el.nativeElement.classList.remove('loading');
      this.el.nativeElement.insertAdjacentHTML('afterend', html);

      return this.el.nativeElement.parentNode.querySelector('.spiraxInput_unit');
    } else {
      if (html) {
        wrapper.innerHTML = html;
      } else {
        wrapper.remove();
      }
    }
  }
}
