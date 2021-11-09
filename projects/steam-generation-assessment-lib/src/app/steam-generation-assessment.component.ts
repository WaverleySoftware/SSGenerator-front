import { Component, ElementRef, OnInit } from "@angular/core";
import {
  BaseSizingModule,
  JobSizing,
  PreferenceService,
  Project,
  UnitsService,
} from "sizing-shared-lib";
import { FormGroup } from "@angular/forms";
import { SteamGenerationAssessmentService } from "./steam-generation-assessment.service";
import { SteamGenerationFormInterface } from "./steam-generation-form.interface";

interface ErrorInterface {
  attemptedValue: any;
  customState: any;
  errorCode: string;
  errorMessage: string | null;
  formattedMessagePlaceholderValues: {
    PropertyName: string;
    PropertyValue: any
  }
  propertyName: string;
  severity: number;
}

@Component({
  selector: 'app-steam-generation-assessment',
  templateUrl: './steam-generation-assessment.component.html',
  styleUrls: ['./steam-generation-assessment.component.scss']
})
export class SteamGenerationAssessmentComponent extends BaseSizingModule implements OnInit {
  readonly moduleGroupId: number = 9;
  readonly moduleName: string = 'steamGenerationAssessment';
  moduleId = 2;
  productName = 'Steam Generation Assessment';
  sizingModuleForm: FormGroup;

  public errors: ErrorInterface[];

  constructor(
    private steamGenerationAssessmentService: SteamGenerationAssessmentService,
    private preferenceService: PreferenceService,
    private unitsService: UnitsService,
    private elRef: ElementRef
  ) {
    super();
    this.getSettings();
    // Get Base form from service FormBuilder
    this.sizingModuleForm = this.steamGenerationAssessmentService.getForm();
  }

  ngOnInit() {
  }

  onCalculateSizing(formGroup: FormGroup): any {
    console.log(formGroup.getRawValue(), '-------CALCULATE');
    return true;
  }

  onEnterHeaderDetailsForm(): any {
    return true;
  }

  onExcelSubmit(): any {
    return true;
  }

  onGetTiSheet(): any {
    return true;
  }

  onNewSizingForm(): any {
    return true;
  }

  onPdfSubmit(): any {
    return true;
  }

  onResetModuleForm(): any {
    return true;
  }

  onSave(savedProjectDetails: Project): JobSizing {
    return undefined;
  }

  onSaveJob(): any {
    return true;
  }

  onUnitsChanged(): any {
    return true;
  }

  repackageSizing(): any {
    return true;
  }

  private getSettings(): void {
    this.preferenceService.getAllPreferences().subscribe(data => {
      // console.log(data, '-----getAllPreferences')
    });
    this.preferenceService.getUserPreferences().subscribe(data => {
      // console.log(data, '----getUserPreferences');
    });
    this.unitsService.getAllUnitsByAllTypes().subscribe(data => {
      // console.log(data, '----getAllUnitsByAllTypes')
    });
  }

  private focusFirstErrorField(formGroup: FormGroup): void {
    // check all fields
    for (const key of Object.keys(formGroup.controls)) {
      // get first invalid control
      if (formGroup.controls[key].invalid) {
        // get field by formcontrolname === name
        const field = this.elRef.nativeElement.querySelector(`[formcontrolname="${key}"] input[ng-reflect-model]`);
        // Focus on field
        field && field.focus();
        // loop stop
        break;
      }
    }
  }

  private validate(field: keyof SteamGenerationFormInterface): void {
    const control = this.sizingModuleForm.controls[field];
    if (!control) return null;

    const value = Number.isNaN(Number(control.value)) ? control.value : +control.value;

    this.steamGenerationAssessmentService
      .validateSgInput(field, { [field]: value || null }).subscribe(
      () => control.setErrors(null),
      ({error}) => {
        const errors  = (error.errors[`$.${field}`] || error.errors);
        if (errors) {
          control.setErrors({ validation: errors[0] });
        }
      }
    );
  }
}
