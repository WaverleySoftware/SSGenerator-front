import { FormGroup } from "@angular/forms";

export interface IGenericChanges {

  theFormGroup: FormGroup;

  hasUnsavedDataChanges: boolean;
  
}
