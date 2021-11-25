import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from "@angular/core";
import {
  BaseSizingModule,
  JobSizing,
  PreferenceService,
  Project,
  UnitsService,
} from "sizing-shared-lib";
import { FormGroup } from "@angular/forms";
import { SteamGenerationAssessmentService } from "./steam-generation-assessment.service";
import { ActivatedRoute, Params } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FormFieldTypesInterface, SteamCalorificRequestInterface } from "./steam-generation-form.interface";

@Component({
  selector: 'app-steam-generation-assessment',
  templateUrl: './steam-generation-assessment.component.html',
  styleUrls: ['./steam-generation-assessment.component.scss']
})
export class SteamGenerationAssessmentComponent extends BaseSizingModule implements OnInit, OnDestroy, AfterViewInit {
  readonly moduleGroupId: number = 9;
  readonly moduleName: string = 'steamGenerationAssessment';
  public moduleId = 2;
  public productName = 'Steam Generation Assessment';
  public sizingModuleForm: FormGroup = this.steamGenerationAssessmentService.getSizingFormGroup();
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private steamGenerationAssessmentService: SteamGenerationAssessmentService,
    private preferenceService: PreferenceService,
    private unitsService: UnitsService,
    private elRef: ElementRef,
    private activatedRoute: ActivatedRoute,
  ) {
    super();
    this.getSettings();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log({
      sizingUnitPreferences: this.preferenceService.sizingUnitPreferences
    }, '---ngAfterViewInit');
    // this.initializedData(); // Load start module data
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.preferenceService.clearUnitPreferences();
  }

  onCalculateSizing(formGroup: FormGroup): any {
    console.log(formGroup.value, '------CALCULATE')
    this.steamGenerationAssessmentService
      .calculateResults(formGroup.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response) => {
        console.log(response, '-----response');
      });
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
    console.log('-----onNewSizingForm----')
    return true;
  }

  onPdfSubmit(): any {
    return true;
  }

  onResetModuleForm(): any {
    return true;
  }

  onSave(savedProjectDetails: Project): JobSizing {
    console.log('-----onSAve-----');
    return undefined;
  }

  onSaveJob(): any {
    console.log('-----onSaveJob-----');
    return true;
  }

  onUnitsChanged(): any {
    console.log('----- CHANGE_UNITS -----');
    this.steamGenerationAssessmentService.changeSizingUnits(this.sizingModuleForm);
    this.changeFuelType(); // Calculate CALORIFIC VALUE request on unit changed
    return true;
  }

  repackageSizing(): any {
    return true;
  }

  public changeFuelType(fuelTypeData?: SteamCalorificRequestInterface): void {
    this.steamGenerationAssessmentService
      .calculateCalorific(this.getFuelTypeData(fuelTypeData))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response) => {
        if (response && typeof response === "object") {
          for (let responseKey in response) {
            this.steamGenerationAssessmentService
              .changeSgaFieldFilled(responseKey as keyof FormFieldTypesInterface, true);
            this.sizingModuleForm
              .get(`steamGeneratorInputs.${responseKey}`)
              .patchValue(response[responseKey], { emitEvent: false, onlySelf: true });
          }
        }
      });
  }

  private getFuelTypeData(staticData?: SteamCalorificRequestInterface): SteamCalorificRequestInterface {
    let energyUnitSelected = staticData && staticData.energyUnitSelected;
    let smallWeightUnitSelected = staticData && staticData.smallWeightUnitSelected ||
      this.sizingModuleForm.get('selectedUnits.smallWeightUnitSelected').value;

    if (!energyUnitSelected) {
      energyUnitSelected = this.steamGenerationAssessmentService
        .getSizingPreferenceValues({energyUnitSelected: 'BoilerHouseEnergyUnits'})
        .energyUnitSelected;
    }

    if (!smallWeightUnitSelected) {
      smallWeightUnitSelected = this.steamGenerationAssessmentService
        .getSizingPreferenceValues({smallWeightUnitSelected: 'WeightUnit'})
        .smallWeightUnitSelected;
    }

    return {
      energyUnitSelected,
      smallWeightUnitSelected,
      inputFuelId: (staticData && staticData.inputFuelId) ||
        this.sizingModuleForm.get('steamGeneratorInputs.inputFuelId').value,
      inputFuelUnit: (staticData && staticData.inputFuelUnit) ||
        this.sizingModuleForm.get('steamGeneratorInputs.inputFuelUnit').value,
    };
  }

  private getSettings(): void {
    this.preferenceService.getAllPreferences().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      // console.log(data, '-----getAllPreferences')
    });
    this.preferenceService.getUserPreferences().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      // console.log(data, '----getUserPreferences');
    });
    this.unitsService.getAllUnitsByAllTypes().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      // console.log(data, '----getAllUnitsByAllTypes')
    });
  }

  // TODO: Function for focus on first invalid field (need to create toggle tabs to first invalid field)
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

  private loadJob(): void {
    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params: Params) => {
        const { projectId, jobId } = params;
        // TODO: Create projects/jobs functionality
        console.log(`projectId=${projectId}, jobId=${jobId}`);
      });
  }

  private initializedData(): void {
    // this.loadJob();
    this.changeFuelType(); // Calculate CALORIFIC VALUE request on init
  }
}
