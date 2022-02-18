import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { SelectedUnitsInterface } from './selectedUnits.interface';
import { BenchmarkInputsInterface } from './benchmarkInputs.interface';

export type FormControls<T> = {
  [key in keyof T]: T[key] extends TForm<any> | FormArray ? T[key] : Omit<AbstractControl, 'value'> & { value: T[key] }
};

export type TForm<T> = FormGroup & {
  controls: FormControls<T>;
};

export interface InputParametersFormInterface {
  selectedUnits: SelectedUnitsInterface;
  benchmarkInputs: BenchmarkInputsInterface;
}

export interface InputParametersTFormInterface {
  selectedUnits: TForm<SelectedUnitsInterface>;
  benchmarkInputs: TForm<BenchmarkInputsInterface>;
}

export interface InputParametersCreateFormInterface {
  selectedUnits: { [key in keyof SelectedUnitsInterface]: any };
  benchmarkInputs: { [key in keyof BenchmarkInputsInterface]: any };
}

export type TFormValueGetterInterface = (names: string | string[] | { [key: string]: any }, subForm?: string, separate?: boolean) => {
  [key: string]: any
};

export type TFormBenchmarkValueSetterInterface = (
  name: keyof BenchmarkInputsInterface | Partial<{[key in keyof BenchmarkInputsInterface]: any}>,
  value?: any,
  opt?: { onlySelf?: boolean; emitEvent?: boolean; disableFilled?: boolean; }
) => AbstractControl | {[key in keyof BenchmarkInputsInterface]: AbstractControl};
