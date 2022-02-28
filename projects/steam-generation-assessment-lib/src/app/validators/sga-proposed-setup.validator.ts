import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

const disableControl = (fields: string[] | string) => (control: AbstractControl): ValidationErrors => {
  if (control && control.value) {
    const fg = control.parent as FormGroup;

    const disable = (name: string) => {
      if (fg) {
        const field = fg.get(name);
        if (field && field.value) {
          field.patchValue(false, {emitEvent: false});
        }
      }
    };

    if (fg) {
      if (typeof fields === 'string') {
        disable(fields);
      } else {
        for (const fieldName of fields) { disable(fieldName); }
      }
    }
  }

  return null;
};

export { disableControl };
