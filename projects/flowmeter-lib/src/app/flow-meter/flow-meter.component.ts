import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,

  FormControl
} from '@angular/forms';
import { FlowMeterService } from '../flow-meter.service';
import {
  BaseSizingModule,
  GetSizingJobRequest,
  Job,
  JobSizing,
  MessagesService,
  OutputGrid,
  OutputGridRow,
  OutputItem,
  Preference,
  PreferenceDecimalPipe,
  PreferenceService,
  ProcessCondition,
  ProcessInput,
  Project,
  ProjectsJobsService,
  SizingData,
  SizingOutput,
  TranslatePipe,
  UnitConvert,
  UnitsConverter,
  UnitsService,
  DocGen,
  UserProfileService,
  User

} from 'sizing-shared-lib';
import { SpecSheetItem } from "../doc-gen.model";
import { flowMeterDocGenService } from "../flowMeterDocGen.service";
import { Subscription } from 'rxjs/Subscription';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  startWith,
  switchMap,
  tap
} from 'rxjs/operators';
import {
  BehaviorSubject,
  combineLatest,
  merge,
  Observable,
  of
} from 'rxjs';
import { DesignationModel } from '../models/designation.model';
import { NominalSizeModel } from '../models/nominal-size.model';
import { PipeSizeModel } from '../models/pipe-size.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcessConditionsModel } from '../models/process-conditions.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { CalculateVelocityRequestPayloadModel } from '../models/calculate-velocity-request-payload.model';
import swal from 'sweetalert';
import { CalculateSizingRequestPayloadModel } from '../models/calculate-sizing-request-payload.model';
import { LocaleService } from 'node_modules/angular-l10n';
import {
  ActivatedRoute,
  Params
} from '@angular/router';
import { ItemDetailsService } from '../item-details.service';
import { SizingMessage } from '../models/calculate-sizing-response-body.model';
import { ResultsItemDetailsComponent } from '../results-item-details/results-item-details.component';
import { ProcessConditionsComponent } from '../process-conditions/process-conditions.component';
import { EnumerationService } from '../enumeration.service';
import { Unit } from '../../../../../dist/sizing-shared-lib/lib/shared/units/unit.model';
import { SizingUnitPreference } from '../../../../sizing-shared-lib/src/lib/shared/preference/sizing-unit-preference.model';
import { isUndefined } from 'util';


@Component({
  selector: 'app-flow-meter',
  templateUrl: './flow-meter.component.html',
  styleUrls: ['./flow-meter.component.scss']
})
export class FlowMeterComponent extends BaseSizingModule implements OnInit, OnDestroy {
  readonly moduleGroupId: number = 4;
  readonly moduleName: string = 'flowmeter';
  moduleId = 6;
  productName = 'Flow Meter';

  @ViewChild('inputsContentTop', { static: false }) inputsContent: ElementRef; // for scroll to view

  sizingModuleForm: FormGroup;
  projectName: string;
  isInitialised = true; // TODO: reset this value based on convertBaseToDefaultValuesInPageUnits method that needs
  // to be imported here

  userPrefs: Preference[];
  specSheetLanguage: string;
  volumetricFlowSelectedPageUnitId: number;
  designations: DesignationModel[];
  nominalSizes: NominalSizeModel[];

  // save/load job mechanism
  project: Project = new Project();
  job: Job = new Job();
  loadedJobSizingData: SizingData;
  areProjectsAndJobsLoaded = false;
  jobStatusId = 1;
  pipeSizeWasCalculatedInJob = false;

  velocityCheckResult: number | undefined = undefined;

  @BlockUI('process-conditions-section') processConditionsBlockUi: NgBlockUI;
  @BlockUI('pipe-selection-section') pipeSelectionBlockUi: NgBlockUI;

  public docGen: DocGen;

  private blockUiTimeout;

  private isLoadingJob = false;
  public isLoadingPage = true;

  private formsValueChangesSubscriptions: Subscription;
  private processConditionsChangeSubscription: Subscription;
  private pipeSizeBlockDropdownsChangesSubscription: Subscription;
  private pipeSizeManualControlsChangesSubscription: Subscription;
  private specifyDiameterCheckboxChangesSubscription: Subscription;
  private formGroupsStatusesChangesSubscription: Subscription;
  private paramsSubscription: Subscription;
  private projectsAndJobsSubscription: Subscription;
  private processConditionsControlsRationalizationFinished$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private processConditionsLatestFormStatus$: BehaviorSubject<string> = new BehaviorSubject<string>('INVALID');

  private pipeSelectionFormState: { [key: string]: any };

  private mediaStateFromPPDS: string = '';
  private volumetricFlowChanged: boolean;
  private massDensity: number;
  private isVolumetricFlowMaster: boolean = false;
  private isCalculatingFlow: boolean = false;
  private lastSelectedMedia: string;

  private temperatureBaseValue: number = 0; // Base 0 DegC
  private normalTemperatureBaseValue: number = 20; // Base 20 DegC
  private standardTemperatureBaseValue: number = 0; // Base 0 DegC
  private pressureMinSV40xBaseValue: number = 1.65; // 1.65 Barg

  private temperatureDefaultValue: number = 0; // default 0 DegC
  private normalTemperatureDefaultValue: number = 20; // default 20 DegC
  private standardTemperatureDefaultValue: number = 0; // default 0 DegC
  private pressureMinSV40xDefaultValue: number = 1.65; // 1.65 Barg

  //Spec sheet
  public media: string;
  public massFlow: string;
  public volumetricFlow: string;
  public inletPressure: string;
  public inletTemperature: string;
  public state: string;
  public fluidDensity: string;
  public dynamicViscosity: string;
  public reynoldsNumber: string;
  public pipeVelocity: string;
  public standard: string;
  public internalDiameter: string;
  public nominalSize: string;
  public specSheetDesignation: string;
  public isSpecifyPipe: boolean;
  public inletPressureUnit: string;
  public massFlowUnit: string;
  public volumetricFlowUnit: string;
  public temperatureUnit: string;
  public velocityUnit: string;
  public lengthUnit: string;
  public inletPressureName: string;
  public viscosityUnitId: number;
  public fluidDensityUnitId: number;
  public viscosityUnit: string;
  public fluidDensityUnit: string;
  public pressureDropUnit: string;

  //pressureSensingKit: ["-"],
  //uSyphonAssembly: ["-"],
  //transducerModelUTM: ["-"],
  //transducerCode: ["-"],
  //bushKitCodeTFA: ["-"],
  //rtdKitUTM: ["-"],
  //rtdKitCode: ["-"],
  //mountingTrackUTM: ["-"],
  //mountingTrackCodeUTM: ["-"],
  //pressureTransmitter: ["-"],
  //temperatureTransmitter: ["-"]

  //TVA
  private pressureSensingKitTVA: boolean;
  private uSyphonAssemblyTVA: boolean;
  private orientationTVA: string;
  private powerSupplyTVA: string;

  //TFA
  private bushKitCodeTFA: string;
  private orientationTFA: string;
  private powerSupplyTFA: string;

  //Rim20 / Vim 20
  private processTemperature20: string;
  private outputSignal20: string;
  private powerSupply20: string;
  private removableRetractor: string;

  //ELM
  private liningMaterialELM: string;
  private electrodeMaterialELM: string;
  private transmitterELM: string;
  private inspectionMaterialCertificateELM: string;
  private displayControlUnitELM: string;
  private powerSupplyELM: string;
  private currentOutputELM: string;

  //Ilva20 + MVT10
  private flexHoseKit: string;

  private transducerCode: string;
  private rtdKitUTM: string;
  private rtdKitCode: string;
  private mountingTrackUTM: string;
  private mountingTrackCode: string;
  private pressureTransmitter: string;
  private temperatureTransmitter: string;

  // Result table related variables
  // Sizing in progress flag
  private isSizing: boolean = false;
  // Sizing done flag
  private isSizingDone: boolean = false;
  // Sizing data retrieved from server
  sizingData: any;
  // Sizing data for table
  tableRows: Array<any> = [];
  // Selected table row
  tableRowsSelected: Array<any> = [];
  // Selected item in table
  selectedFlowMeter: any;
  ancillariesForm: FormGroup;

  public user: User;

  // Filters
  filtersForm: FormGroup;
  productOptions: Array<string> = [];
  flangeSpecificationOptions: Array<string> = [];
  materialOptions: Array<string> = [];
  orientationOptions: Array<string> = [];
  meterSizeOptions: Array<string> = [];

  private savedWallThicknessCustomErrors: ValidationErrors;

  /**
   * Filter table results
   */
  get filteredTableResults(): Array<any> {
    const { product, flangeSpecification, material, orientation, meterSize, hideMetersWithWarnings } = this.filtersForm.value;
    return this.tableRows.filter(row => {
      return (
        (!product || product === row.type) &&
        (!flangeSpecification || flangeSpecification === row.connection) &&
        (!material || material === row.translatedMaterial) &&
        (!orientation || orientation === row.transOrientation) &&
        (!meterSize || meterSize === row.size) &&
        !(hideMetersWithWarnings && row.messages && row.messages.length)
      );
    });
  }

  get resultsFlowType() {
    return this.filtersForm.get('flowType').value;
  }


  // TODO: Implement normal temperature error getter
  // But what error should it look for?s
  get normalTemperatureHasError(): boolean {
    return false;
  }

  get isNormalTemperatureEnabled(): boolean {
    let normalTemperatureInputEnabled = false;
    const volumetricFlowUnit = this.getSizingUnitPreferencesByName('VolumetricFlowUnit');
    const media = this.sizingModuleForm.get('processConditions.media');
    if (this.isInitialised && volumetricFlowUnit) {
      if (
        !volumetricFlowUnit ||
        !media ||
        media.value === 'Dry Saturated Steam'
        || media.value === 'Superheated Steam'
        || media.value === 'Water'
        || this.mediaStateFromPPDS.toUpperCase() !== 'GAS'
      ) {
        normalTemperatureInputEnabled = false;
      } else {
        const activeVolumetricFlowUnit = this.getUnitId('VolumetricFlowUnit');

        if (
          (activeVolumetricFlowUnit >= 207 && activeVolumetricFlowUnit <= 211)
          || (activeVolumetricFlowUnit >= 217 && activeVolumetricFlowUnit <= 222)
        ) {
          normalTemperatureInputEnabled = true;  // only enabled for editing the Normal Temperature but not for Standard
        }
      }
    }

    return normalTemperatureInputEnabled;
  }

  get selectedProduct() {
    return this.selectedFlowMeter;
  }

  constructor(
    private fb: FormBuilder,
    private flowMeterService: FlowMeterService,
    private translatePipe: TranslatePipe,
    private unitsService: UnitsService,
    private preferenceService: PreferenceService,
    private preferenceDecimalPipe: PreferenceDecimalPipe,
    private localeService: LocaleService,
    private projectsJobsService: ProjectsJobsService,
    private activatedRoute: ActivatedRoute,
    private itemDetailsService: ItemDetailsService,
    private messagesService: MessagesService,
    private flowMeterDocGenService: flowMeterDocGenService,
    private userProfileService: UserProfileService,
    private resultsItemDetails: ResultsItemDetailsComponent,
    private enumerationService: EnumerationService,
    private processConditionsDetails: ProcessConditionsComponent
  ) {
    super();


    this.sizingModuleForm = fb.group({
      processConditions: fb.group({
        media: ['Dry Saturated Steam'],
        inletPressure: ['', {
          updateOn: 'blur',
          asyncValidators: this.createFlowMeterControlValidator('InletPressure', 'PressureUnit'),
          validators: [Validators.required]
        }],
        temperature: ['', {
          updateOn: 'blur',
          asyncValidators: this.createFlowMeterControlValidator('InletTemperature', 'TemperatureUnit'),
          validators: [Validators.required]
        }],
        state: [''],
        massFlow: ['', {
          updateOn: 'blur',
          asyncValidators: this.createFlowMeterControlValidator('MassFlow', 'MassFlowUnit'),
          validators: [Validators.required]
        }],
        volumetricFlow: ['', {
          updateOn: 'blur',
          asyncValidators: this.createFlowMeterControlValidator('VolumetricFlow', 'VolumetricFlowUnit'),
          validators: [Validators.required]
        }],
        normalTemperature: ['', {
          updateOn: 'blur',
          asyncValidators: this.createFlowMeterControlValidator('NormalTemperature', 'TemperatureUnit'),
          validators: [Validators.required]
        }],
      }),
      meterDetails: fb.group({
        selectedMeters: [[], [
          Validators.required,
          this.validateFormControlSelectedProducts()
        ]
        ],
      }),
      specifyPipeSize: [false]
    });    

    this.ancillariesForm = fb.group({
      downstreamCheckValve: [false],
      upstreamStrainer: [false],
      upstreamIsolationValve: [false],
      downstreamIsolationValve: [false],
      separator: [false],
      separatorTrapSet: [false],
    });

    this.filtersForm = fb.group({
      product: [null],
      flangeSpecification: [null],
      material: [null],
      orientation: [null],
      meterSize: [null],
      hideMetersWithWarnings: [false],
      flowType: ['volumetric'], // can be 'mass' or 'volumetric'
    });

    //this.sheet = new FormControl('');
    //this.quantity = new FormControl('');
    //this.revisionNumber = new FormControl('');
    //this.aoNumber = new FormControl('');
    //this.projectType = new FormControl('');
    //this.orderNumber = new FormControl('');
    //this.notes = new FormControl('');
  }

  ngOnInit() {
    this.isLoadingPage = false;
    this.preferenceService.sizingUnitPreferences = [];

    if (this.sizingModuleForm.get('processConditions.media').value === 'Dry Saturated Steam') {
      this.sizingModuleForm.get('processConditions.temperature').disable();
    } else {
      this.sizingModuleForm.get('processConditions.temperature').enable();
    }

    this.processConditionsChangeSubscription = this.sizingModuleForm.get('processConditions').valueChanges.subscribe(
      value => this.handleProcessConditionsChange(value)
    );

    this.formsValueChangesSubscriptions = this.onSpecifyPipeSizeCheckboxChanges();
    this.preferenceService.getUserPreferences().subscribe((prefs: Array<Preference>) => {

      this.userPrefs = prefs;
      this.specSheetLanguage = this.userPrefs.find(m => m.name === 'SpecLanguage').value;
      // Initial page pref
      this.volumetricFlowSelectedPageUnitId = parseInt(this.userPrefs.find(p => p.name === 'VolumetricFlowUnit').value, 10);

      this.convertBaseToDefaultValuesInPageUnits();

      // process the unit selector based on media selection
      this.processVolumetricFlowUnitSelector();

      this.userProfileService.getUserDetails().subscribe(user => {
        this.user = user;
      });

    });

    this.handleLoadingJob();
  }

  ngOnDestroy() {
    this.formsValueChangesSubscriptions.unsubscribe();
    this.processConditionsControlsRationalizationFinished$.unsubscribe();
    this.processConditionsLatestFormStatus$.unsubscribe();
    this.paramsSubscription.unsubscribe();
    if (this.projectsAndJobsSubscription) {
      this.projectsAndJobsSubscription.unsubscribe();
    }
  }

  /**
   * Handle process conditions form changes
   * @param value
   */
  handleProcessConditionsChange(value: any) {
    this.rationalizeFlowMeterInputs();
  }

  /**
   * Update form value programmatically
   * E.g. when we need to update values after server calculations
   * @param value
   */
  updateFormValue(value: any, emitEvent: boolean = false) {
    // emitEvent false will skip creating valueChanges event, so we don't get into the loop
    this.sizingModuleForm.patchValue(value, { emitEvent });
  }

  validateFormControlSelectedProducts(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const hasError = this.isInitialised && control.value.length <= 0;

      if (hasError) {
        const message = this.translatePipe.transform('INVALID_SELECTED_VALVES_ERROR_MSG', false);

        return { incorrect: message };
      }

      return null;
    };
  }

  /**
   * Create Async FlowMeter Control Validator
   * Validates a single control value on the server
   * @param controlName - control name (one, that servers knows)
   * @param unitName - unit preference name (we have it in the preference service)
   */
  private createFlowMeterControlValidator(
    controlName: string,
    unitName: string,
  ): AsyncValidatorFn {
    if (!this.isLoadingPage) {
      return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {

        const data = {
          [controlName]: control.value,
          [`${controlName}Unit`]: this.getUnitId(unitName),
          [`${controlName}DecimalPlaces`]: this.getUnitDecimalPlaces(unitName),
        };

        // Validation needs selected Media
        data.Media = this.sizingModuleForm.get('processConditions.media').value;
        // Also, Inlet Pressure field needs temperature unit id to work
        if (controlName === 'InletPressure') {
          data.InletTemperatureUnit = this.getUnitId('TemperatureUnit');
        }

        // Toggle mass/volumetric flow
        if (controlName === 'MassFlow') {
          this.isVolumetricFlowMaster = false;
        }

        // Toggle mass/volumetric flow
        if (controlName === 'VolumetricFlow') {
          this.isVolumetricFlowMaster = true;
        }

        this.disableInputs();

        return this.flowMeterService.validateFlowMeterInput(data as ProcessConditionsModel).pipe(
          map(response => {
            // If status is OK, that means no validation errors from server
            // So just mark validator as OK:
            // Return nothing if no errors encountered
            this.enableInputs();
            return null;
          }),
          catchError((response) => {
            console.log('ERR', response);
            this.enableInputs();

            if (response && response.error && response.error.errors) {
              return of(response.error.errors);
            }

            // At this point, something strange happened, probably the server is down.
            console.error('UNEXPECTED ERROR (Flow Meter Process Conditions Validation)', response);
            return of(null);
          }),
          finalize(() => this.processConditionsLatestFormStatus$.next(this.sizingModuleForm.get('processConditions').status))
        );
      };
    }
    
  }

  /**
   * Get sizing unit preferences from the different place
   * Now we are using the same reference, as DisplayPreferenceDirective
   * @param unitName - unit group name
   */
  private getSizingUnitPreferencesByName(unitName) {
    const units = this.preferenceService.sizingUnitPreferences;
    const unit = units.find(sizingUnit => sizingUnit.preference.name === unitName);

    if (!unit) {
      console.error('Trying to use sizing unit preference, that was not found');
      return null;
    }

    return unit.preference;
  }

  /**
   * Get numeric unitId for unit
   * @param unitName - unit group name
   */
  private getUnitId(unitName) {
    const unit = this.getSizingUnitPreferencesByName(unitName);
    return parseInt(unit.value ? unit.value.toString() : '0', 10);
  }

  /**
   * Get decimal places for unit
   * @param unitName - unit group name
   */
  private getUnitDecimalPlaces(unitName) {
    const unit = this.getSizingUnitPreferencesByName(unitName);
    return parseInt(unit.decimalPlaces ? unit.decimalPlaces.toString() : '0', 10);
  }

  /**
   * Recalculate flow meter inputs
   * Please, do not invoke method unless the form is valid.
   *
   * NOTE:
   * This is a method imported from other module.
   * The behavior is quite complicated and has many side-effects.
   * Many nested API calls
   */
  private rationalizeFlowMeterInputs() {
    // Skip calculation if no media (for reset button)
    if (!this.sizingModuleForm.get('processConditions.media').value) {
      return;
    }

    this.disableInputs();
    this.processConditionsControlsRationalizationFinished$.next(false);

    // Doesn't matter which field was last entered, get all the necessary form values.
    // It's up to the server to decide what needs verifying/rationalising/validating.
    const flowMeter: ProcessConditionsModel = {};

    // Media
    flowMeter.Media = this.sizingModuleForm.get('processConditions.media').value;

    // If media has not changed, send media state
    if (this.lastSelectedMedia === flowMeter.Media) {
      if (this.mediaStateFromPPDS) {
        flowMeter.MediaState = this.mediaStateFromPPDS; // Untranslated value
      }
    } else { // If media changed - toggle temperature input and reset media state
      if (this.sizingModuleForm.get('processConditions.media').value === 'Dry Saturated Steam') {
        this.sizingModuleForm.get('processConditions.temperature').disable({ emitEvent: false });
      } else {
        this.sizingModuleForm.get('processConditions.temperature').enable({ emitEvent: false });
      }

      this.mediaStateFromPPDS = '';
      this.sizingModuleForm.get('processConditions.state').setValue(this.mediaStateFromPPDS.toUpperCase(), { emitEvent: false });
    }

    // Pressure
    if (this.sizingModuleForm.get('processConditions.inletPressure').value) {
      flowMeter.InletPressure = this.sizingModuleForm.get('processConditions.inletPressure').value;
    }
    flowMeter.InletPressureUnit = this.getUnitId('PressureUnit');
    flowMeter.InletPressureDecimalPlaces = this.getUnitDecimalPlaces('PressureUnit');

    // Temperature
    if (this.sizingModuleForm.get('processConditions.temperature').value) {
      flowMeter.InletTemperature = this.sizingModuleForm.get('processConditions.temperature').value;
    }
    flowMeter.InletTemperatureUnit = this.getUnitId('TemperatureUnit');
    flowMeter.InletTemperatureDecimalPlaces = this.getUnitDecimalPlaces('TemperatureUnit');

    // NormalTemperature
    if (this.sizingModuleForm.get('processConditions.normalTemperature').value) {
      flowMeter.NormalTemperature = this.sizingModuleForm.get('processConditions.normalTemperature').value;
    }
    flowMeter.NormalTemperatureUnit = this.getUnitId('TemperatureUnit');
    flowMeter.NormalTemperatureDecimalPlaces = this.getUnitDecimalPlaces('TemperatureUnit');

    // Mass flow
    if (this.sizingModuleForm.get('processConditions.massFlow').value) {
      flowMeter.MassFlow = this.sizingModuleForm.get('processConditions.massFlow').value;
    }
    flowMeter.MassFlowUnit = this.getUnitId('MassFlowUnit');
    flowMeter.MassFlowDecimalPlaces = this.getUnitDecimalPlaces('MassFlowUnit');

    // Volumetric flow
    if (this.sizingModuleForm.get('processConditions.volumetricFlow').value) {
      flowMeter.VolumetricFlow = this.sizingModuleForm.get('processConditions.volumetricFlow').value;
    }
    flowMeter.VolumetricFlowUnit = this.getUnitId('VolumetricFlowUnit');
    flowMeter.VolumetricFlowDecimalPlaces = this.getUnitDecimalPlaces('VolumetricFlowUnit');

    // Toggle Normal temperature
    if (this.isNormalTemperatureEnabled || this.normalTemperatureHasError) {
      this.enableNormalTemperature();
    } else {
      this.disableNormalTemperature();
    }


    // If Media is not "Dry Saturated Steam" and Temperature is not yet set then set it to 0 (zero is a default value) 
    if (flowMeter.Media !== 'Dry Saturated Steam' && isUndefined(flowMeter.InletTemperature)) {
      flowMeter.InletTemperature = 0;
    }

    // TODO: maybe we will need this later
    // Collect selected products
    // flowMeter.selectedMeters = [
    //   ...this.sizingModuleForm.get('meterDetails.selectedMeters').value
    // ];
    // this.sizingModuleForm.get('meterDetails.selectedMeters').updateValueAndValidity();
    // Run process condition validation and calculate PPDS dependencies if Set Pressure has a useful value.
    if (flowMeter.InletPressure && flowMeter.InletPressure > 0) {
      // Run the validation
      this.flowMeterService.validateProcessCondition(flowMeter).subscribe(result => {
        this.enableInputs();

        if (this.isLoadingJob = false) {
          if (this.isSizingDone) {
            this.isSizingDone = false;
            this.selectedFlowMeter = undefined;
            this.tableRows = [];
            this.tableRowsSelected = [];
          }
        }


        if (!result) { // any data?
          this.processConditionsControlsRationalizationFinished$.next(true);
          return;
        }

        // Set the form control with the returned value.
        // ToUpper for Trans MasterKeyText on UI
        if (result.mediaState && this.mediaStateFromPPDS.toUpperCase() !== result.mediaState.toUpperCase()) {
          const mediaStateTranslated = this.translatePipe.transform(result.mediaState.toUpperCase());
          this.mediaStateFromPPDS = result.mediaState;
          this.sizingModuleForm.get('processConditions.state').setValue(mediaStateTranslated, { emitEvent: false });
        }

        if (result.inletTemperature && this.preferenceDecimalPipe.transform(result.inletTemperature, 'TemperatureUnit') === +flowMeter.InletTemperature) {
          this.sizingModuleForm.get('processConditions.temperature').setValue(
            this.preferenceDecimalPipe.transform(result.inletTemperature, 'TemperatureUnit'),
            { emitEvent: false }
          );
        }

        if (!!result.inletTemperature && this.preferenceDecimalPipe.transform(result.inletTemperature, 'TemperatureUnit') !== +flowMeter.InletTemperature) {
          this.sizingModuleForm.get('processConditions.temperature').setValue(
            this.preferenceDecimalPipe.transform(result.inletTemperature, 'TemperatureUnit'),
            { emitEvent: false }
          );
          const translatedMedia = this.sizingModuleForm.get('processConditions.media').value;

          // If SuperHeated Steam and the Temperature has been adjusted (to 1 kelvin above saturation point) then inform user.
          const superheatedSteamCheckTitle = this.translatePipe.transform('SUPERHEAT_TEMPERATURE_CHECK');
          const superheatedSteamCheckMessage = this.translatePipe.transform(
            'STEAM_IS_NOT_SUPERHEATED_AT_THIS_TEMPERATURE_AND_PRESSURE_THEREFORE_THE_ENTERED_TEMPERATURE_HAS_BEEN_RAISED_TO_1_DEGREE_ABOVE_T_MESSAGE',
            false
          );
          const volumetricFlowUnitsHaveBeenChangedTitle = this.translatePipe.transform('VOLUMETRIC_FLOW_CHANGED');
          const volumetricFlowUnitsHaveBeenChangedMessage = this.translatePipe.transform('VOLUMETRIC_FLOW_CHANGED_MESSAGE');
          const oldVolumetricFlowUnitName = this.translatePipe.transform(
            this.getSizingUnitPreferencesByName('VolumetricFlowUnit').masterTextKey
          );
          const newVolumetricFlowUnitName = this.translatePipe.transform(
            this.getSizingUnitPreferencesByName('VolumetricFlowUnit').masterTextKey
          );

          // TODO: handle the comment
          // !!! Temp Fix!!! -- This is a join messagge for SuperHeated Steam Temperature and Volumetric Flow.(Need to be revise and split in to two separate pop up messages in the future.)
          if (flowMeter.Media === 'Superheated Steam' && this.volumetricFlowChanged) {
            const message = (
              superheatedSteamCheckMessage + ' (' +
              this.preferenceDecimalPipe.transform(result.inletTemperature + 1, 'TemperatureUnit') + ' ' +
              this.getSizingUnitPreferencesByName('TemperatureUnit').unitName + ') \n\n' +
              // TODO: oldVolumetricFlowUnitName and newVolumetricFlowUnitName is the same value!
              volumetricFlowUnitsHaveBeenChangedMessage + ' from ' + oldVolumetricFlowUnitName + ' to ' + newVolumetricFlowUnitName
            );

            this.volumetricFlowChanged = false;

            swal({
              closeOnClickOutside: false, closeOnEsc: false,
              title: superheatedSteamCheckTitle + ' & ' + volumetricFlowUnitsHaveBeenChangedTitle,
              text: message,
              icon: 'warning',
              dangerMode: true,
            }).then((okButtonClicked?: boolean) => {
              console.log('Ok clicked...');
            }); // end of swal
          } else if (flowMeter.Media === 'Superheated Steam') {
            const message = (
              superheatedSteamCheckMessage + ' (' +
              this.sizingModuleForm.get('processConditions.temperature').value + ' ' +
              this.getSizingUnitPreferencesByName('TemperatureUnit').unitName + ')'
            );

            swal({
              closeOnClickOutside: false, closeOnEsc: false,
              title: superheatedSteamCheckTitle,
              text: message,
              icon: 'warning',
              dangerMode: true,
            }).then((okButtonClicked?: boolean) => {
              console.log('Ok clicked...');
            }); // end of swal
            // end of "Superheated Steam"
          } else if (flowMeter.Media === 'Water') {
            // WaterCheck or Melting point Check has moved temperature result.
            if (this.preferenceDecimalPipe.transform(result.inletTemperature, 'TemperatureUnit') < flowMeter.InletTemperature) {
              // Temp moved lower, moved from Gas into Liquid state
              const waterCheckTitle = this.translatePipe.transform('WATER_TEMPERATURE_CHECK');
              const waterCheckMessage = translatedMedia + ' ' + this.translatePipe.transform('IS_NOT_A_LIQUID_AT_THIS_TEMPERATURE_AND_PRESSURE_SATURATION_TEMPERATURE_AT_THIS_PRESSURE_IS_MESSAGE');

              const message = (
                waterCheckMessage + ' (' +
                this.sizingModuleForm.get('processConditions.temperature').value + ' ' +
                this.getSizingUnitPreferencesByName('TemperatureUnit').unitName + ')'
              );

              swal({
                closeOnClickOutside: false, closeOnEsc: false,
                title: waterCheckTitle,
                text: message,
                icon: 'warning',
                dangerMode: true,
              }).then((okButtonClicked?: boolean) => {
                console.log('Ok clicked...');
              }); // end of swal
            } // end of WaterCheck message
          } // end of else if "Water"

          if (flowMeter.Media !== 'Superheated Steam' && flowMeter.Media !== 'Dry Saturated Steam') {
            if (this.preferenceDecimalPipe.transform(result.inletTemperature, 'TemperatureUnit') > flowMeter.InletTemperature) {
              // Temp moved upward, moved from solid into Liquid state
              const meltingPointCheckTitle = this.translatePipe.transform('MELTING_POINT_CHECK');
              const meltingPointCheckMessage = translatedMedia + ' ' + this.translatePipe.transform('IS_SOLID_AT_THIS_TEMPERATURE_AND_PRESSURE_MELTING_POINT_AT_THIS_PRESSURE_IS_MESSAGE');

              const message = (
                meltingPointCheckMessage + ' (' +
                this.sizingModuleForm.get('processConditions.temperature').value + ' ' +
                this.getSizingUnitPreferencesByName('TemperatureUnit').unitName + ')'
              );

              swal({
                closeOnClickOutside: false, closeOnEsc: false,
                title: meltingPointCheckTitle,
                text: message,
                icon: 'warning',
                dangerMode: true,
              }).then((okButtonClicked?: boolean) => {
                console.log('Ok clicked...');
              }); // end of swal

            }  // end of MeltingPointCheck message
          } // end of Melting check for all but Dry Sat and SuperHeated Steam
        } // end of Temperature has been modified by Validation and PPDS results


        if (!result.massFlow && !result.volumetricFlow) {
          this.processConditionsControlsRationalizationFinished$.next(true);
          return;
        }
        // Collect flow rates from initial saturation checks, must be performed last and after initial PPDS sat checks.
        // Current Mass Flow
        flowMeter.MassFlow = result.massFlow;
        // Current Volumetric flow
        flowMeter.VolumetricFlow = result.volumetricFlow;
        // The current working temperature (may be already adjusted for state eg. SuperHeatedSteam).
        flowMeter.InletTemperature = result.inletTemperature;
        // NormalTemperature
        flowMeter.NormalTemperature = result.normalTemperature;
        // The current working media state
        flowMeter.MediaState = this.mediaStateFromPPDS; // untranslated
        // Set flow type
        flowMeter.FlowType = this.isVolumetricFlowMaster ? 'Vol Flow' : '';

        // handle volumetric flow units for Normal/Standard temperature based on possible changes to media and state.
        this.processVolumetricFlowUnitSelector();
        // If media state has changed then Normal/Standard temperature Volumetric flow rates may be implemented.
        flowMeter.VolumetricFlowUnit = this.getUnitId('VolumetricFlowUnit');

        // Start the busy block
        this.disableInputs();
        this.sizingModuleForm.get('processConditions.massFlow').setAsyncValidators(this.createFlowMeterControlValidator('MassFlow', 'MassFlowUnit'));

        //this.isCalculatingFlow = true;
        // Run the flow rate consolidation calculations and validation
        this.flowMeterService.consolidateFlowRates(flowMeter).subscribe(consolidateResult => {
          this.enableInputs();
          if (consolidateResult.massDensity === null) {
            this.massDensity = -1;
          } else {
            this.massDensity = consolidateResult.massDensity;
          }

          if (!consolidateResult) { // any data?
            this.processConditionsControlsRationalizationFinished$.next(true);
            return;
          }

          // remove the async validator from the vol flow control to allow value to be set without triggering function
          //this.sizingModuleForm.get('processConditions.volumetricFlow').clearAsyncValidators();

          // remove the async validator from the mass flow control to allow value to be set without triggering function
          //this.sizingModuleForm.get('processConditions.massFlow').clearAsyncValidators();        

          // If mass flow was entered we are calculating and setting vol flow
          if (consolidateResult.volumetricFlow) {

            // remove the async validator from the vol flow control to allow value to be set without triggering function
            //this.sizingModuleForm.get('processConditions.volumetricFlow').clearAsyncValidators();

            // Set the form control with the returned value.
            this.sizingModuleForm.get('processConditions.volumetricFlow').setValue(
              this.preferenceDecimalPipe.transform(consolidateResult.volumetricFlow, 'VolumetricFlowUnit'),
              { emitEvent: false }
            );

            // Put the async validator back on vol flow so it functions correctly if user cahnges value manually
           // this.sizingModuleForm.get('processConditions.volumetricFlow').setAsyncValidators(this.createFlowMeterControlValidator('VolumetricFlow', 'VolumetricFlowUnit'));
          }

          // If vol flow was entered we are calculating and setting mass flow
          if (consolidateResult.massFlow) {

            // remove the async validator from the mass flow control to allow value to be set without triggering function
            //this.sizingModuleForm.get('processConditions.massFlow').clearAsyncValidators();

            // Set the form control with the returned value.
            this.sizingModuleForm.get('processConditions.massFlow').setValue(
              this.preferenceDecimalPipe.transform(consolidateResult.massFlow, 'MassFlowUnit'),
              { emitEvent: false }
            );

            // Put the async validator back on mass flow so it functions correctly if user cahnges value manually
            //this.sizingModuleForm.get('processConditions.massFlow').setAsyncValidators(this.createFlowMeterControlValidator('MassFlow', 'MassFlowUnit'));
          }

          // Put the async validator back on mass flow so it functions correctly if user cahnges value manually
          this.sizingModuleForm.get('processConditions.massFlow').setAsyncValidators(this.createFlowMeterControlValidator('MassFlow', 'MassFlowUnit'));

          // Put the async validator back on vol flow so it functions correctly if user cahnges value manually
          this.sizingModuleForm.get('processConditions.volumetricFlow').setAsyncValidators(this.createFlowMeterControlValidator('VolumetricFlow', 'VolumetricFlowUnit'));

          //this.isCalculatingFlow = false;
          this.processConditionsControlsRationalizationFinished$.next(true);
        });
      });
    } else { // if pressure value set
      this.enableInputs();
    }

    var inletPressureUnit = new SizingUnitPreference();
    var massFlowUnit = new SizingUnitPreference();
    var volumetricFlowUnit = new SizingUnitPreference();
    var temperatureUnit = new SizingUnitPreference();
    var velocityUnity = new SizingUnitPreference();
    var lengthUnit = new SizingUnitPreference();

    this.unitsService.getAllUnitsByAllTypes().subscribe((units: Unit[]) => {

      inletPressureUnit.units = units.filter(u => u.id === flowMeter.InletPressureUnit);
      massFlowUnit.units = units.filter(u => u.id === flowMeter.MassFlowUnit);
      volumetricFlowUnit.units = units.filter(u => u.id === flowMeter.VolumetricFlowUnit);
      temperatureUnit.units = units.filter(u => u.id === flowMeter.InletTemperatureUnit);
      //velocityUnity.units = units.filter(u => u.id === flowMeter.);
      //lengthUnit.units = units.filter(u => u.id === flowMeter.MassFlowUnit);      

      this.inletPressureUnit = inletPressureUnit.units[0].units;
      this.massFlowUnit = massFlowUnit.units[0].units;
      this.volumetricFlowUnit = volumetricFlowUnit.units[0].units;
      this.temperatureUnit = temperatureUnit.units[0].units;

    });
  }

  onPipeStandardDropdownInitialized({ selectedValue }) {
    if (this.pipeSelectionFormState || this.pipeSizeWasCalculatedInJob) {
      return;
    }

    this.updateFormValue({
      pipeSelection: { pipeStandard: selectedValue }
    }, true);

    this.sizingModuleForm.get('pipeSelection.pipeStandard').markAsDirty();
  }

  /**
   * Calculate sizing for flow meters
   */
  onCalculateSizing(): any {
    // We need to make sure that the PPDS values have settled and the Async finished
    // before we collect the data from the UI to send to the Sizing engine.
    // Eg. change the volflow and use the massflow after ValidateProcessConditions() async server call has returned.
    if (
      this.processConditionsBlockUi.isActive || this.processConditionsBlockUi.blockCount > 0 ||
      this.pipeSelectionBlockUi.isActive || this.pipeSelectionBlockUi.blockCount > 0
    ) {
      if (!this.isSizing) {
        // Defer sizing calc call for 1.5 secs then try again
        setTimeout(() => {
          this.onCalculateSizing();
        }, 1500);
      } else {
        setTimeout(() => {
          this.isSizing = false; // clear blocking flag
        }, 1500);
      }
      return;
    }
    this.isSizing = true;
    this.disableInputs();

    const { meterDetails, processConditions, specifyPipeSize } = this.sizingModuleForm.getRawValue();

    let flowMeter: CalculateSizingRequestPayloadModel = {
      inletPressure: processConditions.inletPressure, //inlet pressure
      inletPressureUnit: this.getUnitId('PressureUnit'),
      inletTemperature: processConditions.temperature, //inlet temperature
      inletTemperatureUnit: this.getUnitId('TemperatureUnit'),
      massFlow: processConditions.massFlow, //mass flow
      massFlowUnit: this.getUnitId('MassFlowUnit'),
      volumetricFlow: processConditions.volumetricFlow, // volumetric flow
      volumetricFlowUnit: this.getUnitId('VolumetricFlowUnit'),
      normalTemperature: processConditions.normalTemperature, //Normal/standard conditions Temperature
      normalTemperatureUnit: this.getUnitId('TemperatureUnit'),
      mediaType: processConditions.media, //Media
      mediaState: this.mediaStateFromPPDS, //state
      productSelectionList: meterDetails.selectedMeters,
      isPipeSelectionChecked: specifyPipeSize,
      velocityUnitId: this.getUnitId('VelocityUnit'),
      lengthUnitId: this.getUnitId('LengthUnit')
    };

    this.media = processConditions.media;
    this.massFlow = processConditions.massFlow;
    this.volumetricFlow = processConditions.volumetricFlow;
    this.inletPressure = processConditions.inletPressure;
    this.inletTemperature = processConditions.inletTemperature;
    this.state = this.mediaStateFromPPDS;


    if (specifyPipeSize) {
      this.isSpecifyPipe = specifyPipeSize;
      const pipeSelectionFormValue = (this.sizingModuleForm.get('pipeSelection') as FormGroup).getRawValue();


      if (pipeSelectionFormValue.specifyDiameterMode) {
        flowMeter = {
          ...flowMeter,
          pipeInternalDiameter: pipeSelectionFormValue.internalDiameter
        };
      } else {
        flowMeter = {
          ...flowMeter,
          pipeId: this.getPipeId(pipeSelectionFormValue.nominalSize)
        };
      }
    }

    this.flowMeterService.calculateResults(flowMeter).subscribe(
      sizingData => {
        if (sizingData.flowMeterSizing) {

          sizingData.flowMeterSizing.meters = sizingData.flowMeterSizing.meters.sort((a, b) => a.turnDown - b.turnDown);

          this.displaySizingData(sizingData.flowMeterSizing.meters);
          this.standard = sizingData.flowMeterSizing["pipeStandard"];
          this.nominalSize = sizingData.flowMeterSizing["nominalSize"];
          this.specSheetDesignation = sizingData.flowMeterSizing["designation"];
          this.dynamicViscosity = sizingData.flowMeterSizing["viscosity"];
          this.fluidDensity = sizingData.flowMeterSizing["density"];
          this.viscosityUnitId = sizingData.flowMeterSizing["viscosityUnit"];
          this.fluidDensityUnitId = sizingData.flowMeterSizing["densityUnit"];
          if (sizingData.flowMeterSizing.messages && sizingData.flowMeterSizing.messages.length) {
            this.showSizingMessages(sizingData.flowMeterSizing.messages);
          }

          var velocityUnity = new SizingUnitPreference();
          var lengthUnit = new SizingUnitPreference();
          var viscosityUnit = new SizingUnitPreference();
          var fluidDensityUnit = new SizingUnitPreference();
          var inletPressureUnit = new SizingUnitPreference();

          var listPressureDrop = [];

          this.unitsService.getAllUnitsByAllTypes().subscribe((units: Unit[]) => {

            inletPressureUnit.units = units.filter(u => u.id === flowMeter.inletPressureUnit)
            velocityUnity.units = units.filter(u => u.id === flowMeter.velocityUnitId);
            lengthUnit.units = units.filter(u => u.id === flowMeter.lengthUnitId);
            viscosityUnit.units = units.filter(u => u.id === this.viscosityUnitId);
            fluidDensityUnit.units = units.filter(u => u.id === this.fluidDensityUnitId);

            this.inletPressureName = inletPressureUnit.units[0].units;
            this.velocityUnit = velocityUnity.units[0].units;
            this.lengthUnit = lengthUnit.units[0].units;
            this.viscosityUnit = viscosityUnit.units[0].units;
            this.fluidDensityUnit = fluidDensityUnit.units[0].units;

            units.forEach(u => {
              if (u.type === "PressureDrop") {
                listPressureDrop.push([u.units, u.id]);
              }
            })

            listPressureDrop.forEach(l => {
              if (this.inletPressureName.includes(l[0])) {
                this.pressureDropUnit = l[0];
              }
            })
          });
        }
      }
    );
    //this.isSpecSheetEnabled = true;

  }

  /**
   * Display sizing data from calculation
   * @param sizingData - data to display
   * @param selectedRow - OPTIONAL, row to select
   */
  private displaySizingData(sizingData: any, selectedRow = -1) {

    this.sizingData = sizingData;

    if (!!sizingData && sizingData.length > 0) {
      this.tableRows = [...this.sizingData];
      if (selectedRow >= 0) {
        // set selected flow meter row
        this.selectedFlowMeter = sizingData[selectedRow];
        // select on grid UI, must be a row of safetyValve data with a shape that exists in the rows table.
        this.tableRowsSelected[0] = this.tableRows[selectedRow];
      }

      this.productOptions = this.populateTableFilterOptions('type');
      this.flangeSpecificationOptions = this.populateTableFilterOptions('connection');
      this.materialOptions = this.populateTableFilterOptions('translatedMaterial');
      this.orientationOptions = this.populateTableFilterOptions('transOrientation');
      this.meterSizeOptions = this.populateTableFilterOptions('size');
    }

    this.localizeOutputData();
    this.enableInputs();
    this.isSizing = false;
    this.isSizingDone = true;
  }

  /**
   * Populate table filter.
   * Returns an array of unique values in given column
   * @param tableColumn - column (property name)
   */
  private populateTableFilterOptions(tableColumn): Array<any> {
    return this.tableRows.map(row => row[tableColumn]).reduce((prev, curr) => prev.includes(curr) ? prev : [...prev, curr], []);
  }

  /**
   * Show global sizing messages
   * @param messages sizing messages
   */
  private showSizingMessages(messages: SizingMessage[]) {
    this.messagesService.addMessage(messages.map(message => ({
      messageKey: message.code,
      value: +message.value,
      unitKey: '',
      severity: +message.severity,
      displayValue: '',
    })));
  }

  /**
   * Localize table output numbers
   */
  private localizeOutputData() {
    if (this.tableRows && this.tableRows.length > 0) {
      this.tableRows.forEach((row, index) => {
        // TODO: temp override
        // row.type = 'UTM10';
        // row.pipeSize = `DN50 (${index+1}")`;
        // row.wireless = 'no';
        // row.orientation = 'Horizontal';
        // row.productCode = '12312';
        // row.size = 'DN100'
        // row.uttType = '050H';
        // row.bushKitList = '10,20,30';
        // if (index % 2) {
        //   row.messages = [{
        //     // value: 'Warning - The calculated velocity for your selected pipe is above the recommended limit',
        //     value: 'Warning',
        //     code: '4096',
        //     severity: '1',
        //   }, {
        //     // value: 'Class 1, Division 1, Group C & D (Includes IS Barriers)',
        //     value: 'Info',
        //     code: '4095',
        //     severity: '0',
        //   }] as SizingMessage[];
        // }

        row.displayMinimumCapacity = this.localizeNumericValue(row.minimumFlow, 'MassFlowUnit');
        row.displayMaximumCapacity = this.localizeNumericValue(row.maximumFlow, 'MassFlowUnit');
        row.displayMinimumVolumetricCapacity = this.localizeNumericValue(row.minimumFlowVol, 'VolumetricFlowUnit');
        row.displayMaximumVolumetricCapacity = this.localizeNumericValue(row.maximumFlowVol, 'VolumetricFlowUnit');
        row.displayPercentageCapacity = this.localizeNumericValue(row.percentageCapacity, '');
        row.displayMeterVelocity = this.localizeNumericValue(row.meterVelocity, 'VelocityUnit');
        row.displayPipeVelocity = this.localizeNumericValue(row.velocity, 'VelocityUnit');
      });
    }
  }

  /**
   * Localize numeric value
   * @param value - numeric value
   * @param unitName - unit group name
   */
  private localizeNumericValue(value, unitName) {
    const unit = this.preferenceService.getUserPreferenceByName(unitName);
    const decimals = parseInt(unit && unit.decimalPlaces ? unit.decimalPlaces.toString() : '2', 10);
    return this.localeService.formatDecimal(value.toFixed(decimals));
  }

  /**
   * Handle table row selection
   * @param tableRow
   */
  onTableRowSelected(tableRow) {
    // TODO: implement method
    this.selectedFlowMeter = tableRow;

    this.isSpecSheetEnabled = true;
  }

  onEnterHeaderDetailsForm() { }

  onGetTiSheet() { }

  onResetModuleForm() {
    this.pipeSelectionFormState = undefined;
    this.velocityCheckResult = undefined;
    this.savedWallThicknessCustomErrors = undefined;
    this.isSpecSheetEnabled = false;

    if (this.isSizingDone) {
      this.isSizingDone = false;
      this.selectedFlowMeter = undefined;
      this.tableRows = [];
      this.tableRowsSelected = [];
    }

    this.sizingModuleForm.get('processConditions').reset({
      media: 'Dry Saturated Steam',
      inletPressure: '',
      temperature: 0,
      state: '',
      massFlow: '',
      volumetricFlow: '',
      normalTemperature: 0,
      specifyPipeSize: false
    });
    this.sizingModuleForm.get('specifyPipeSize').reset(false, { emitEvent: false });

    if (this.sizingModuleForm.contains('pipeSelection')) {
      this.sizingModuleForm.removeControl('pipeSelection');
    }

    if (this.pipeSizeBlockDropdownsChangesSubscription) {
      this.pipeSizeBlockDropdownsChangesSubscription.unsubscribe();
    }
    if (this.formGroupsStatusesChangesSubscription) {
      this.formGroupsStatusesChangesSubscription.unsubscribe();
    }
    if (this.pipeSizeManualControlsChangesSubscription) {
      this.pipeSizeManualControlsChangesSubscription.unsubscribe();
    }
    if (this.specifyDiameterCheckboxChangesSubscription) {
      this.specifyDiameterCheckboxChangesSubscription.unsubscribe();
    }
  }

  saveData(jobSizing: JobSizing,
    sizingData: SizingData,
    processConditions: ProcessCondition[],
    processInputs: ProcessInput[],
    unitPreferences: Preference[],
    outputGridRow: OutputGridRow,
    outputGridRows: OutputGridRow[],
    outputItems: OutputItem[]
  ): JobSizing {
    const {
      processConditions: processConditionsFormValue,
      meterDetails,
      pipeSelection,
      specifyPipeSize
    } = this.sizingModuleForm.getRawValue();
    processInputs = [
      // Save process conditions
      {
        name: 'media',
        value: processConditionsFormValue.media,
        unitId: null,
        listItemId: null,
        value2: '',
        childInputs: null
      },
      {
        name: 'inletPressure',
        value: processConditionsFormValue.inletPressure,
        unitId: this.getUnitId('PressureUnit'),
        listItemId: null,
        value2: '',
        childInputs: null
      },
      {
        name: 'temperature',
        value: processConditionsFormValue.temperature,
        unitId: this.getUnitId('TemperatureUnit'),
        listItemId: null,
        value2: '',
        childInputs: null
      },
      {
        name: 'normalTemperature',
        value: processConditionsFormValue.normalTemperature,
        unitId: this.getUnitId('TemperatureUnit'),
        listItemId: null,
        value2: '',
        childInputs: null
      },
      {
        name: 'massFlow',
        value: processConditionsFormValue.massFlow,
        unitId: this.getUnitId('MassFlowUnit'),
        listItemId: null,
        value2: '',
        childInputs: null
      },
      {
        name: 'state',
        value: processConditionsFormValue.state,
        unitId: null,
        listItemId: null,
        value2: '',
        childInputs: null
      },
      {
        name: 'volumetricFlow',
        value: processConditionsFormValue.volumetricFlow,
        unitId: this.getUnitId('VolumetricFlowUnit'),
        listItemId: null,
        value2: '',
        childInputs: null
      },
      // Save Meter Details
      {
        name: 'selectedMeters',
        value: JSON.stringify(meterDetails.selectedMeters),
        unitId: null,
        listItemId: null,
        value2: '',
        childInputs: null
      },
      {
        name: 'specifyPipeSize',
        value: specifyPipeSize,
        unitId: null,
        listItemId: null,
        value2: '',
        childInputs: null
      }
    ];

    if (this.sizingModuleForm.get('specifyPipeSize').value) {
      processInputs = [
        ...processInputs,
        // Save Pipe Selection
        {
          name: 'specifyDiameterMode',
          value: pipeSelection.specifyDiameterMode,
          unitId: null,
          listItemId: null,
          value2: '',
          childInputs: null
        },
        {
          name: 'outsideDiameter',
          value: pipeSelection.manuals.outsideDiameter,
          unitId: this.getUnitId('LengthUnit'),
          listItemId: null,
          value2: '',
          childInputs: null
        },
        {
          name: 'wallThickness',
          value: pipeSelection.manuals.wallThickness,
          unitId: this.getUnitId('LengthUnit'),
          listItemId: null,
          value2: '',
          childInputs: null
        },
        {
          name: 'internalDiameter',
          value: pipeSelection.internalDiameter,
          unitId: this.getUnitId('LengthUnit'),
          listItemId: null,
          value2: '',
          childInputs: null
        },
        {
          name: 'pipeStandard',
          value: pipeSelection.pipeStandard,
          unitId: null,
          listItemId: null,
          value2: '',
          childInputs: null
        },
        {
          name: 'designation',
          value: pipeSelection.designation,
          unitId: null,
          listItemId: null,
          value2: '',
          childInputs: null
        },
        {
          name: 'nominalSize',
          value: pipeSelection.nominalSize,
          unitId: null,
          listItemId: null,
          value2: '',
          childInputs: null
        }
      ];


      // saving designation and nominal size dropdonws options
      if (pipeSelection.specifyDiameterMode) {
        processInputs = [
          ...processInputs,
          {
            name: 'designations',
            value: JSON.stringify(this.designations),
            unitId: null,
            listItemId: null,
            value2: '',
            childInputs: null
          }
        ];

        processInputs = pipeSelection.designation ? [
          ...processInputs,
          {
            name: 'nominalSizes',
            value: JSON.stringify(this.nominalSizes),
            unitId: null,
            listItemId: null,
            value2: '',
            childInputs: null
          }
        ] : processInputs;
      }
    }

    // Save unit preferences.
    unitPreferences = this.preferenceService.sizingUnitPreferences.map(unit => unit.preference);

    if (this.isSizingDone) {
      const ancillariesFormValue = this.ancillariesForm.value;

      for (const [name, value] of Object.entries<boolean>(ancillariesFormValue)) {
        processInputs = [
          ...processInputs,
          {
            name,
            value: `${value}`,
            unitId: null,
            listItemId: null,
            value2: '',
            childInputs: null
          }
        ];
      }
    }

    sizingData.processConditions = [
      ...processConditions,
      {
        name: 'flow meter sizing',
        processInputs,
        unitPreferences
      }
    ];

    let savedItemDetailsFormGroup;
    outputGridRow.outputItems = [];
    outputGridRow.messages = [];

    // save sizing grid results
    this.tableRows.forEach(obj => {
      let isRowSelected = false;

      if (this.selectedFlowMeter && obj === this.selectedFlowMeter) {
        isRowSelected = true; // This is the selected row!

        if (!!this.selectedFlowMeter.messages) {
          this.selectedFlowMeter.messages.forEach(m => {
            outputGridRow.messages.push({
              messageKey: m.messageKey,
              value: m.value,
              unitKey: m.unitKey,
              severity: m.severity,
              displayValue: m.displayValue
            });
          });
        }
      } else {
        isRowSelected = false;
      }

      // saving rows data
      for (let [name, value] of Object.entries<any>(obj)) {
        if (Array.isArray(value)) {
          value = JSON.stringify(value);
        }

        outputGridRow.outputItems = [
          ...outputGridRow.outputItems,
          {
            name,
            value,
            unitId: null,
            selected: isRowSelected,
            listItemId: null,
            type: null
          }
        ];
      }

      if (isRowSelected) {
        savedItemDetailsFormGroup = this.itemDetailsService.selectedRowFormGroup;
      }

      outputGridRows.push(outputGridRow);

      // clear for next iteration
      outputGridRow = new OutputGridRow();
      outputGridRow.outputItems = [];
      outputGridRow.messages = [];
    });

    // Saving Item Details state
    if (savedItemDetailsFormGroup) {
      for (const [name, value] of Object.entries<any>(savedItemDetailsFormGroup.getRawValue())) {
        outputItems = [
          ...outputItems,
          {
            name,
            value: `${value}`,
            unitId: null,
            selected: false,
            listItemId: null,
            type: null
          }
        ];
      }
    }

    // Reset button status
    outputItems.push({
      name: 'IsResetEnabled',
      value: (!this.sizingModuleForm.pristine).toString(),
      unitId: null,
      selected: false,
      listItemId: null,
      type: null
    });

    // save objects into appropriate sizing data objects
    jobSizing.sizingData = sizingData;
    jobSizing.sizingData.sizingOutput = new SizingOutput();
    jobSizing.sizingData.sizingOutput.outputItems = outputItems;
    jobSizing.sizingData.sizingOutput.outputGrid = new OutputGrid();
    jobSizing.sizingData.sizingOutput.outputGrid.outputGridRows = outputGridRows;

    return jobSizing;
  }

  onSave(savedProjectDetails: Project): JobSizing {
    let jobSizing = new JobSizing();
    const sizingData = new SizingData();
    const processConditions: ProcessCondition[] = [];
    const processInputs: ProcessInput[] = [];
    const unitPreferences: Preference[] = [];

    const outputGridRow = new OutputGridRow();
    const outputGridRows: OutputGridRow[] = [];
    const outputItems: OutputItem[] = [];

    this.project = new Project();
    this.job = new Job();

    if (!savedProjectDetails) {
      return null;
    }

    jobSizing = this.saveData(
      jobSizing,
      sizingData,
      processConditions,
      processInputs,
      unitPreferences,
      outputGridRow,
      outputGridRows,
      outputItems
    );

    // save header details
    this.project.id = this.projectId;
    this.project.name = this.projectName; // savedProjectDetails.name;
    this.job.name = this.jobName;
    this.job.id = (!!this.jobId ? this.jobId : '');

    if (!this.job.id || this.job.id === null) {
      // use new job dialog data
      this.job.plantOwner = savedProjectDetails.jobs[0].plantOwner;
    }
    this.project.customerName = savedProjectDetails.customerName;
    this.project.projectReference = savedProjectDetails.projectReference;

    this.job.moduleId = this.moduleId;
    this.job.productName = this.productName;

    if (this.tableRows.length > 1) {
      this.job.jobStatusId = 2; // Calculated
      this.jobStatusId = 2;
    } else {
      this.job.jobStatusId = 1; // Input
      this.jobStatusId = 1;
    }

    if (this.selectedFlowMeter) {
      this.job.jobStatusId = 3; // Selected
      this.jobStatusId = 3;
    }

    if (typeof savedProjectDetails.id === 'undefined') {
      this.project.id = ''; // new Guid required from API
      this.job.projectId = ''; // new Guid required from API
    } else {
      this.job.projectId = this.projectId; // savedProjectDetails.id;
    }

    // save objects into appropriate sizing data objects
    this.project.jobs = new Array<Job>();
    this.project.jobs[0] = this.job;

    jobSizing.project = this.project;

    this.scrollToElement(this.inputsContent, 'end'); // annoying on anything but Chrome

    return jobSizing;
  }

  scrollToElement = (elementRef: ElementRef, position: string = 'start') => {
    // ToDo: Fix fussy scroll on first sizing bug. Hence the use of timeout delay here.
    setTimeout(() => {
      try {
        elementRef.nativeElement.scrollIntoView({ block: position, behavior: 'smooth' });
      } catch (err) {
        console.log(`scrollToElement err=${err}`);
      }
    }, 200);
  }

  onExcelSubmit() { }

  onPdfSubmit() {
    this.docGen = new DocGen;
    this.docGen.specItems = new Array<SpecSheetItem>();
    this.docGen.moduleId = 4;
    this.docGen.template = "pdf";
    this.docGen.headerImage = "sxsLogo.jpg";
    this.docGen.bodyImage = "FlowMeter.png";



    // Pass data only, labels are retrieved from database in Doc Gen dll.
    this.setSpecSheetValues();

    this.flowMeterDocGenService.getFlowMeterSpecSheet(this.docGen);

    let options = {
      headers: {
        "Content-Type": "application/json", Accept: "application/octet-stream"
      },
      responseType: 'json' as 'json'
    };

  }

  setSpecSheetValues() {
    var currentDate = new Date();

    var projName = this.projectId != "" ? this.project.name : "-";
    var projRef = this.projectId != "" ? this.project.projectReference : "-";
    var projLocation = this.projectId != "" ? this.project.customerLocation : "-";
    var projQuoteRef = this.projectId != "" ? this.project.quoteReference : "-";
    var projCusName = this.projectId != "" ? this.project.customerName : "-";
    var jobName = this.jobId != "" ? this.job.name : "-";

    //TVA
    this.pressureSensingKitTVA = this.resultsItemDetails.tvaForm.controls["pressureSensingKit"].value == null ? "-" : this.resultsItemDetails.tvaForm.controls["pressureSensingKit"].value;
    this.uSyphonAssemblyTVA = this.resultsItemDetails.tvaForm.controls["syphonAssembly"].value == null ? "-" : this.resultsItemDetails.tvaForm.controls["syphonAssembly"].value;

    //TFA
    this.bushKitCodeTFA = this.resultsItemDetails.tfaForm.controls["bushKitCode"].value == null ? "-" : this.resultsItemDetails.tfaForm.controls["bushKitCode"].value;

    //Rim20 / vim20
    const processTempList = this.enumerationService.getEnumerationCollection('RIM20ProcessTemperatureList_FlowMeterSizing');
    this.processTemperature20 = this.resultsItemDetails.rim20Form.get("processTemperature").value == null ? "-" : this.resultsItemDetails.rim20Form.controls["processTemperature"].value;
    const processTemperature20Selected = processTempList.find(i => i.value === this.processTemperature20).defaultText;

    const powerSupplyList = this.enumerationService.getEnumerationCollection('RIM20ElectricalPowerList_FlowMeterSizing');
    this.powerSupply20 = this.resultsItemDetails.rim20Form.get("powerSupply").value == null ? "-" : this.resultsItemDetails.rim20Form.controls["powerSupply"].value;
    const powerSupplySelected20 = powerSupplyList.find(i => i.value === this.powerSupply20).defaultText;

    const outputSignalList = this.enumerationService.getEnumerationCollection('RIM20OutputCommsList_FlowMeterSizing');
    this.outputSignal20 = this.resultsItemDetails.rim20Form.get("outputSignal").value == null ? "-" : this.resultsItemDetails.rim20Form.controls["outputSignal"].value;
    const outputSignal20Selected = outputSignalList.find(i => i.value === this.outputSignal20).defaultText;

    this.bushKitCodeTFA = this.resultsItemDetails.tfaForm.controls["bushKitCode"].value == null ? "-" : this.resultsItemDetails.tfaForm.controls["bushKitCode"].value;

    const retractorList = this.enumerationService.getEnumerationCollection('RIM20Retractor_FlowMeterSizing');
    this.removableRetractor = this.resultsItemDetails.rim20Form.get("retractor").value == null ? "-" : this.resultsItemDetails.rim20Form.controls["retractor"].value;
    const removableRetractorSelected = retractorList.find(i => i.value === this.removableRetractor).defaultText;

    //ELM
    this.liningMaterialELM = this.resultsItemDetails.elmForm.controls["liningMaterial"].value == null ? "-" : this.resultsItemDetails.elmForm.controls["liningMaterial"].value;
    this.electrodeMaterialELM = this.resultsItemDetails.elmForm.controls["electrodeMaterial"].value == null ? "-" : this.resultsItemDetails.elmForm.controls["electrodeMaterial"].value;
    this.transmitterELM = this.resultsItemDetails.elmForm.controls["transmitter"].value == null ? "-" : this.resultsItemDetails.elmForm.controls["transmitter"].value;
    this.inspectionMaterialCertificateELM = this.resultsItemDetails.elmForm.controls["inspectionMaterialCertificate"].value == null ? "-" : this.resultsItemDetails.elmForm.controls["inspectionMaterialCertificate"].value;
    this.displayControlUnitELM = this.resultsItemDetails.elmForm.controls["displayControlUnit"].value == null ? "-" : this.resultsItemDetails.elmForm.controls["displayControlUnit"].value;
    this.powerSupplyELM = this.resultsItemDetails.elmForm.controls["powerSupply"].value == null ? "-" : this.resultsItemDetails.elmForm.controls["powerSupply"].value;
    this.currentOutputELM = this.resultsItemDetails.elmForm.controls["output"].value == null ? "-" : this.resultsItemDetails.elmForm.controls["output"].value;

    //Ilva20 + MVT10
    this.flexHoseKit = this.resultsItemDetails.elmForm.controls["flexHoseKit"].value;

    //utm10Form
    this.transducerCode = this.resultsItemDetails.utm10Form.controls["transducerCode"].value == null ? "-" : this.resultsItemDetails.utm10Form.controls["transducerCode"].value;

    const rtdKitUTMList = this.enumerationService.getEnumerationCollection('RTDKit_FlowMeterSizing');
    this.rtdKitUTM = this.resultsItemDetails.utm10Form.get("rtd").value == null ? "-" : this.resultsItemDetails.utm10Form.controls["rtd"].value;
    const rtdKitUTMSelected = rtdKitUTMList.find(i => i.value === this.rtdKitUTM).defaultText;

    this.rtdKitCode = this.resultsItemDetails.utm10Form.controls["rtd"].value == null ? "-" : this.resultsItemDetails.utm10Form.controls["rtd"].value;

    const mountingTrackUTMList = this.enumerationService.getEnumerationCollection('MountingTrack_FlowMeterSizing');
    this.mountingTrackUTM = this.resultsItemDetails.utm10Form.get("mountingTracks").value == null ? "-" : this.resultsItemDetails.utm10Form.controls["mountingTracks"].value;
    const mountingTrackUTMSelected = mountingTrackUTMList.find(i => i.value === this.mountingTrackUTM).defaultText;

    this.mountingTrackCode = this.resultsItemDetails.utm10Form.controls["mountingTracks"].value == null ? "-" : this.resultsItemDetails.utm10Form.controls["mountingTracks"].value;
    this.pressureTransmitter = "-";//this.resultsItemDetails.utm10Form.controls["pressureTransmitter"].value == null ? "-" : this.resultsItemDetails.utm10Form.controls["pressureTransmitter"].value;
    this.temperatureTransmitter = "-";//this.resultsItemDetails.utm10Form.controls["temperatureTransmitter"].value == null ? "-" : this.resultsItemDetails.utm10Form.controls["temperatureTransmitter"].value;

    var downstreamCheckValve = this.ancillariesForm.controls["downstreamCheckValve"].value;
    var downstreamIsolationValve = this.ancillariesForm.controls["downstreamIsolationValve"].value;
    var separator = this.ancillariesForm.controls["separator"].value;
    var separatorTrapSet = this.ancillariesForm.controls["separatorTrapSet"].value;
    var upstreamIsolationValve = this.ancillariesForm.controls["upstreamIsolationValve"].value;
    var upstreamStrainer = this.ancillariesForm.controls["upstreamStrainer"].value;

    var standard = "-";
    var nominalSize = "-";
    var designation = "-";

    if (this.isSpecifyPipe) {
      standard = this.standard;
      nominalSize = this.nominalSize;
      designation = this.specSheetDesignation;
    }


    // Pass data only, labels are retrieved from database in Doc Gen dll.
    this.docGen.specItems.push({ name: 'Date', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: currentDate.toDateString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Quotation Ref', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projQuoteRef, calculation: "" });
    this.docGen.specItems.push({ name: 'Prepared By', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.user.firstname + ' ' + this.user.lastname, calculation: "" });
    this.docGen.specItems.push({ name: 'Sheet', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: "Sheet Test", calculation: "" });
    this.docGen.specItems.push({ name: 'Revision No', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: "Revision No Test", calculation: "" });
    this.docGen.specItems.push({ name: 'Email', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.user.email, calculation: "" });
    this.docGen.specItems.push({ name: 'Quantity', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: "Quantity Test", calculation: "" });
    this.docGen.specItems.push({ name: 'AO Number', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: "AO Number Test", calculation: "" });
    this.docGen.specItems.push({ name: 'Telephone', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.user.telephone, calculation: "" });
    this.docGen.specItems.push({ name: 'Customer', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projCusName, calculation: "" });
    this.docGen.specItems.push({ name: 'Order No', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: "Order No. Test", calculation: "" });
    this.docGen.specItems.push({ name: 'Project Type', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: "Project Type Test", calculation: "" });
    this.docGen.specItems.push({ name: 'Location', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projLocation, calculation: "" });
    this.docGen.specItems.push({ name: 'Project Name', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projName, calculation: "" });
    this.docGen.specItems.push({ name: 'Project Ref', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projRef, calculation: "" });
    this.docGen.specItems.push({ name: 'Job Name', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: jobName, calculation: "" });

    //Process Data
    this.docGen.specItems.push({ name: 'Media', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.media, calculation: "" });
    this.docGen.specItems.push({ name: 'Mass Flow', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.massFlow, calculation: "" });
    this.docGen.specItems.push({ name: 'Volumetric Flow', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.volumetricFlow, calculation: "" });
    this.docGen.specItems.push({ name: 'Inlet Pressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.inletPressure, calculation: "" });
    this.docGen.specItems.push({ name: 'Inlet Temperature', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.sizingModuleForm.get('processConditions.temperature').value, calculation: "" });
    this.docGen.specItems.push({ name: 'State', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.state, calculation: "" });
    this.docGen.specItems.push({ name: 'Fluid Density', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.fluidDensity, calculation: "" });
    this.docGen.specItems.push({ name: 'Dynamic Viscosity', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.dynamicViscosity, calculation: "" });
    this.docGen.specItems.push({ name: 'Reynolds Number', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["reynoldsNumber"], calculation: "" });
    this.docGen.specItems.push({ name: 'Pipe Velocity', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["velocity"], calculation: "" });

    // Normal/Standard Conditions
    this.docGen.specItems.push({ name: 'Pressure', type: 'Section', masterTextKey: '', sectionName: 'Normal/Standard Conditions', targetLanguage: this.specSheetLanguage, value: this.inletPressure, calculation: "" });
    this.docGen.specItems.push({ name: 'Temperature', type: 'Section', masterTextKey: '', sectionName: 'Normal/Standard Conditions', targetLanguage: this.specSheetLanguage, value: this.sizingModuleForm.get('processConditions.temperature').value, calculation: "" });

    //Pipe Size Selection
    this.docGen.specItems.push({ name: 'Standard', type: 'Section', masterTextKey: '', sectionName: 'Pipe Size Selection', targetLanguage: this.specSheetLanguage, value: standard, calculation: "" });
    this.docGen.specItems.push({ name: 'Nominal Size', type: 'Section', masterTextKey: '', sectionName: 'Pipe Size Selection', targetLanguage: this.specSheetLanguage, value: nominalSize, calculation: "" });
    this.docGen.specItems.push({ name: 'Designation', type: 'Section', masterTextKey: '', sectionName: 'Pipe Size Selection', targetLanguage: this.specSheetLanguage, value: designation, calculation: "" });
    this.docGen.specItems.push({ name: 'Internal Diameter', type: 'Section', masterTextKey: '', sectionName: 'Pipe Size Selection', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["pipeInternalDiameter"], calculation: "" });

    //Product
    this.docGen.specItems.push({ name: 'PRODUCT', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["type"], calculation: "" });
    this.docGen.specItems.push({ name: 'Product Code', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["productCode"], calculation: "" });
    this.docGen.specItems.push({ name: 'Size', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["size"], calculation: "" });
    this.docGen.specItems.push({ name: 'Minimum Flow', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["minimumFlow"], calculation: "" });
    this.docGen.specItems.push({ name: 'Maximum Flow', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["maximumFlow"], calculation: "" });
    this.docGen.specItems.push({ name: 'Product Turndown', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["productTurndown"], calculation: "" });
    this.docGen.specItems.push({ name: 'Actual Turndown', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["turnDown"], calculation: "" });
    this.docGen.specItems.push({ name: 'Material', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["material"], calculation: "" });
    this.docGen.specItems.push({ name: 'Connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["connection"], calculation: "" });
    this.docGen.specItems.push({ name: 'Orientation', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["orientation"], calculation: "" });
    this.docGen.specItems.push({ name: 'Minimum Velocity', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["productMaximumVelocity"], calculation: "" });
    this.docGen.specItems.push({ name: 'Maximum Velocity', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["productMinimumVelocity"], calculation: "" });
    this.docGen.specItems.push({ name: 'Max Differental (Delta P)', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["pressureLoss"], calculation: "" });
    this.docGen.specItems.push({ name: 'Percentage Capacity', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.selectedFlowMeter["percentageCapacity"], calculation: "" });


    //Ancillaries
    this.docGen.specItems.push({ name: 'Downstream Check Valve', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: downstreamCheckValve, calculation: "" });
    this.docGen.specItems.push({ name: 'Upstream Strainer', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: upstreamStrainer, calculation: "" });
    this.docGen.specItems.push({ name: 'Upstream Isolation Valve', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: upstreamIsolationValve, calculation: "" });
    this.docGen.specItems.push({ name: 'Pressure Sensing Kit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: String(this.pressureSensingKitTVA), calculation: "" });
    this.docGen.specItems.push({ name: 'U-Syphon Assembly', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: String(this.uSyphonAssemblyTVA), calculation: "" });
    this.docGen.specItems.push({ name: 'Transducer Model (UTM)', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.transducerCode, calculation: "" });
    this.docGen.specItems.push({ name: 'Transducer Code', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.transducerCode, calculation: "" });
    this.docGen.specItems.push({ name: 'Bush Kit Code (TFA)', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.bushKitCodeTFA, calculation: "" });
    this.docGen.specItems.push({ name: 'Downstream Isolation Valve', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: downstreamIsolationValve, calculation: "" });
    this.docGen.specItems.push({ name: 'Separator', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: separator, calculation: "" });
    this.docGen.specItems.push({ name: 'Separator Trap Set', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: separatorTrapSet, calculation: "" });
    this.docGen.specItems.push({ name: 'RTD Kit (UTM)', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: rtdKitUTMSelected, calculation: "" });
    this.docGen.specItems.push({ name: 'RTD Kit Code', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.rtdKitCode, calculation: "" });
    this.docGen.specItems.push({ name: 'Mounting Track (UTM)', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: mountingTrackUTMSelected, calculation: "" });
    this.docGen.specItems.push({ name: 'Mounting Track Code (UTM)', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.mountingTrackCode, calculation: "" });
    this.docGen.specItems.push({ name: 'Pressure Transmitter', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.pressureTransmitter, calculation: "" });
    this.docGen.specItems.push({ name: 'Temperature Transmitter', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.temperatureTransmitter, calculation: "" });
    this.docGen.specItems.push({ name: 'Process Temperature', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: processTemperature20Selected, calculation: "" });
    this.docGen.specItems.push({ name: 'Power Supply', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: powerSupplySelected20 != null ? powerSupplySelected20 : this.powerSupplyELM, calculation: "" });
    this.docGen.specItems.push({ name: 'Output Signal', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: outputSignal20Selected, calculation: "" });
    this.docGen.specItems.push({ name: 'Lining Material', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.liningMaterialELM, calculation: "" });
    this.docGen.specItems.push({ name: 'Electrode Material', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.electrodeMaterialELM, calculation: "" });
    this.docGen.specItems.push({ name: 'Transmitter', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.transmitterELM, calculation: "" });
    this.docGen.specItems.push({ name: 'Inspection / Material Certificate', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.inspectionMaterialCertificateELM, calculation: "" });
    this.docGen.specItems.push({ name: 'Display and Control Unit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.displayControlUnitELM, calculation: "" });
    // this.docGen.specItems.push({ name: 'Power Supply ELM', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.powerSupplyELM, calculation: "" });
    this.docGen.specItems.push({ name: 'Current Output', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.currentOutputELM, calculation: "" });
    this.docGen.specItems.push({ name: 'Flex Hose Kit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.flexHoseKit, calculation: "" });
    this.docGen.specItems.push({ name: 'Removable Retractor', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: removableRetractorSelected, calculation: "" });

    this.docGen.specItems.push({ name: 'Inlet Pressure Unit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.inletPressureUnit, calculation: "" });
    this.docGen.specItems.push({ name: 'Mass Flow Unit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.massFlowUnit, calculation: "" });
    this.docGen.specItems.push({ name: 'Volumetric Flow Unit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.volumetricFlowUnit, calculation: "" });
    this.docGen.specItems.push({ name: 'Temperature Unit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.temperatureUnit, calculation: "" });
    this.docGen.specItems.push({ name: 'Velocity Unit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.velocityUnit, calculation: "" });
    this.docGen.specItems.push({ name: 'Length Unit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.lengthUnit, calculation: "" });
    this.docGen.specItems.push({ name: 'Fluid Density Unit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.fluidDensityUnit, calculation: "" });
    this.docGen.specItems.push({ name: 'Dynamic Viscosity Unit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.viscosityUnit, calculation: "" });
    this.docGen.specItems.push({ name: 'Max Differential Unit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.pressureDropUnit, calculation: "" });

    // Messages
    let messageMasterTextKey: string = '';
    let messageValue: string = '';
    for (var i = 0; i < 5; i++) {
      messageMasterTextKey = ''; // reset for each message!
      messageValue = '';         // reset for each message!

      //if (!!this.translatedMessagesList[i]) {
      //  messageValue = this.translatedMessagesList[i]
      //}
      this.docGen.specItems.push({ name: 'MESSAGES' + (i + 1).toString(), type: 'Section', masterTextKey: messageMasterTextKey, sectionName: 'Messages', targetLanguage: this.specSheetLanguage, value: messageValue, calculation: "" });
      //}


      // Notes
      // this.docGen.specItems.push({ name: 'Note 1', type: 'Section', masterTextKey: '', sectionName: 'Notes', targetLanguage: this.specSheetLanguage, value: this.notes.value == "" ? "-" : this.notes.value, calculation: "" });
    }


  }

  /**
   * Process event when units were changed
   */
  onUnitsChanged() {
    this.convertBaseToDefaultValuesInPageUnits();

    // We don't need it, because other change detection mechanism
    // this.media_Enumeration.setValue(this.media_Enumeration.value);

    this.volumetricFlowSelectedPageUnitId = this.getUnitId('VolumetricFlowUnit'); // Initial page pref
    this.setStandardOrNormalTemperatureDefault(this.volumetricFlowSelectedPageUnitId);
    this.processVolumetricFlowUnitSelector(); // Set Normal/Standard/Actual VolumetricFlow units.

    this.rationalizeFlowMeterInputs();
  }

  handleLoadingJob() {
    // subscribe to router event
    this.paramsSubscription = this.activatedRoute.params.subscribe((params: Params) => {

      let projectId = params['projectId'];
      let jobId = params['jobId'];
      console.log(`projectId=${projectId}, jobId=${jobId}`);
      if (!!projectId && !!jobId) {

        this.projectId = projectId;
        this.jobId = jobId;

        // first get data, might be navigated link from P&Js or bookmark?
        this.projectsJobsService.getProjectsAndJobs().subscribe(() => {
          // Inform the view that areProjectsAndJobs are now loaded.
          this.areProjectsAndJobsLoaded = true;
        });

        // ToDo: Write slices and chain async call for single dedicated calls to GetProjectById, GetJobById or
        //  GetProjetAndSingleJobByIds all in one server/SP call etc.
        // subject subscription, update as service data has changed (probably changed in memory)
        this.projectsAndJobsSubscription = this.projectsJobsService.projectJobsChange.subscribe(() => {
          // avoid future unwanted events on subject firing this code.
          this.projectsAndJobsSubscription.unsubscribe();

          //Subject has Updated Projects And Jobs Data.
          let notFound = false;
          this.project = this.projectsJobsService.projectsJobs.projects.find(p => p.id === projectId);
          if (!this.project) {
            // projectId not found
            // ToDo: infrom user
            notFound = true;
          }
          else {
            this.job = this.project.jobs.find(j => j.id === jobId);
          }
          if (!this.job) {
            // projectId not found
            // ToDo: infrom user
            notFound = true;
          }

          if (notFound) {
            // Simple popup message box
            let trans_Job_Not_Found = this.translatePipe.transform('SELECTED_JOB_WAS_NOT_FOUND_MESSAGE', true);
            let trans_Error = this.translatePipe.transform('ERROR', true);


            swal({
              closeOnClickOutside: false, closeOnEsc: false,
              title: trans_Error + ':',
              text: trans_Job_Not_Found,
              icon: 'error',
              dangerMode: true
            }).then((okbuttoncClicked?: boolean) => {

              console.info('Ok clicked...');

              // The parameter can also enter as null
              const returnVal = !(okbuttoncClicked === null);

            });

            return;
          }
          this.projectName = this.project.name;
          this.jobName = this.job.name;

          console.log(`Job loaded! ${this.project.name} - ${this.job.name}`);

          const request = new GetSizingJobRequest();
          request.jobId = this.job.id;
          this.productName = this.job.productName;
          this.moduleId = this.job.moduleId;
          this.jobStatusId = this.job.jobStatusId;

          // ToDo: Get the JobSizing XML or as part of the previous call, single round trip.
          this.projectsJobsService.getJobSizing(request).subscribe((response: SizingData) => {
            if (!!response && response != null && !!response.processConditions && response.processConditions != null) {
              this.loadedJobSizingData = response;

              // This is required to prevent any re-validation and re-calculation when a job is loading.
              this.isLoadingJob = true;

              this.loadJob();

              this.sizingModuleForm.markAsPristine();
              this.sizingModuleForm.markAsUntouched();
              this.isLoadingJob = false;
            }
          });

        });
      }
    });
  }

  onSaveJob() {
    return !(this.project.id && this.projectName && this.job.id && this.jobName);
  }

  repackageSizing() {
    const jobSizing = this.onSave(this.project);

    // check save type:
    // update job
    if (jobSizing !== null) {
      this.projectsJobsService.updateJobSizing(jobSizing).subscribe((response) => {
        if (response) {

          // need to display success message
          this.saveJobSuccess = true;
        }
      },
        error => {
          this.saveJobError = true;
        });
    }
  }

  onNewSizingForm() { }

  onSpecifyPipeSizeCheckboxChanges(): Subscription {
    return this.sizingModuleForm.get('specifyPipeSize')
      .valueChanges
      .pipe(
        filter(value => value !== null),
        tap((value: boolean) => {
          if (!value && this.sizingModuleForm.get('pipeSelection')) {
            this.removePipeSelectionForm();
            this.formGroupsStatusesChangesSubscription.unsubscribe();

            if (this.pipeSizeBlockDropdownsChangesSubscription) {
              this.pipeSizeBlockDropdownsChangesSubscription.unsubscribe();
            }

            return;
          }
          this.addPipeSelectionForm();
          this.formGroupsStatusesChangesSubscription = this.checkVelocityIfFormValid();
        }),
        filter(value => value),
        switchMap(() => this.sizingModuleForm.get('pipeSelection').statusChanges),
        filter(status => status === 'INVALID' && !!this.velocityCheckResult)
      )
      .subscribe(() => this.velocityCheckResult = undefined);
  }

  subscribeOnSpecifyDiameterCheckboxChanges(): Subscription {
    return this.sizingModuleForm.get('pipeSelection.specifyDiameterMode')
      .valueChanges
      .pipe(
        filter(value => value !== null),
        tap((value: boolean) => this.setPipeSizeFormState(value)),
        filter(value => {
          const pipeSelectionForm = this.sizingModuleForm.get('pipeSelection');

          return !value &&
            pipeSelectionForm.get('nominalSize').value &&
            (
              pipeSelectionForm.get('manuals').dirty ||
              !pipeSelectionForm.get('manuals.wallThickness').value ||
              !pipeSelectionForm.get('manuals.outsideDiameter').value ||
              !!this.savedWallThicknessCustomErrors
            );
        }),
        switchMap(() => {
          const pipeSelectionForm = this.sizingModuleForm.get('pipeSelection');

          return this.getPipeSizesHelper(
            pipeSelectionForm.get('pipeStandard').value,
            pipeSelectionForm.get('designation').value,
            pipeSelectionForm.get('nominalSize').value,

          ).pipe(
            filter(() => {
              return this.sizingModuleForm.get('processConditions').valid &&
                this.sizingModuleForm.get('pipeSelection').valid;
            }),
            tap(() => this.checkVelocity())
          );

        })
      )
      .subscribe();
  }

  private removePipeSelectionForm() {
    this.pipeSelectionFormState = (this.sizingModuleForm.get('pipeSelection') as FormGroup).getRawValue();

    this.specifyDiameterCheckboxChangesSubscription.unsubscribe();
    this.sizingModuleForm.removeControl('pipeSelection');
  }

  private addPipeSelectionForm() {
    const formGroup = this.fb.group({
      specifyDiameterMode: [false],
      pipeStandard: ['', Validators.required],
      designation: ['', Validators.required],
      nominalSize: ['', Validators.required],
      manuals: this.fb.group({
        outsideDiameter: ['', Validators.required],
        wallThickness: ['', Validators.required]
      }, { updateOn: 'blur' }),
      internalDiameter: [{ value: '', disabled: true }, Validators.required],
    });

    this.sizingModuleForm.addControl('pipeSelection', formGroup);

    if (this.pipeSelectionFormState) {
      this.restorePipeSelectionFormState();
    } else {
      this.pipeSelectionBlockUi.start('Loading...');
    }

    this.setPipeSizeFormState(this.sizingModuleForm.get('pipeSelection.specifyDiameterMode').value);
    this.specifyDiameterCheckboxChangesSubscription = this.subscribeOnSpecifyDiameterCheckboxChanges();
  }

  private setPipeSizeFormState(flag: boolean) {
    const pipeSelectionForm = this.sizingModuleForm.get('pipeSelection');
    const manuals = pipeSelectionForm.get('manuals');

    if (flag) {
      manuals.enable({ emitEvent: false });

      if (this.savedWallThicknessCustomErrors) {
        setTimeout(() => {
          manuals.get('wallThickness').setErrors(this.savedWallThicknessCustomErrors);
        }, 0);
      }

      pipeSelectionForm.get('pipeStandard').disable({ emitEvent: false });
      pipeSelectionForm.get('designation').disable({ emitEvent: false });
      pipeSelectionForm.get('nominalSize').disable({ emitEvent: false });

      this.pipeSizeManualControlsChangesSubscription = this.subscribeOnPipeSizeManualControlsChanges();

      if (this.pipeSizeBlockDropdownsChangesSubscription) {
        this.pipeSizeBlockDropdownsChangesSubscription.unsubscribe();
      }

      return;
    }

    manuals.disable({ emitEvent: false });

    pipeSelectionForm.get('pipeStandard').enable({ emitEvent: false });
    pipeSelectionForm.get('designation').enable({ emitEvent: false });
    pipeSelectionForm.get('nominalSize').enable({ emitEvent: false });

    if (this.pipeSizeManualControlsChangesSubscription) {
      this.pipeSizeManualControlsChangesSubscription.unsubscribe();
    }

    this.pipeSizeBlockDropdownsChangesSubscription = this.subscribeOnDropdownsChanges();
  }
  /**
   * This method only converts default values for inputs.
   */
  private convertBaseToDefaultValuesInPageUnits() {
    // Convert defaults to active page units
    // UnitConvert is a simple interface, no need to make a new object
    const unitsToConvert: UnitConvert[] = [];

    unitsToConvert.push({
      propertyName: 'temperatureDefaultValue',
      initialValue: this.temperatureBaseValue,
      initialUnitId: 146, // Deg c,
      targetUnitId: this.getUnitId('TemperatureUnit'),
      convertedValue: null,
    });

    unitsToConvert.push({
      propertyName: 'normalTemperatureDefaultValue',
      initialValue: this.normalTemperatureBaseValue,
      initialUnitId: 146, // DegC
      targetUnitId: this.getUnitId('TemperatureUnit'),
      convertedValue: null,
    });

    unitsToConvert.push({
      propertyName: 'standardTemperatureDefaultValue',
      initialValue: this.standardTemperatureBaseValue,
      initialUnitId: 146, // DegC
      targetUnitId: this.getUnitId('TemperatureUnit'),
      convertedValue: null,
    });

    unitsToConvert.push({
      propertyName: 'pressureMinSV40xDefaultValue',
      initialValue: this.pressureMinSV40xBaseValue,
      initialUnitId: 50, // BarG
      targetUnitId: this.getUnitId('PressureUnit'),
      convertedValue: null,
    });

    const unitsConverter: UnitsConverter = {
      unitsConverter: unitsToConvert
    };

    this.unitsService.unitsConverter(unitsConverter).subscribe((unitsConvertedData: UnitsConverter) => {

      if (!!unitsConvertedData) {
        this.normalTemperatureDefaultValue = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'normalTemperatureDefaultValue').convertedValue;
        this.normalTemperatureDefaultValue = this.preferenceDecimalPipe.transform(this.normalTemperatureDefaultValue, 'TemperatureUnit'); // set decimal places

        this.standardTemperatureDefaultValue = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'standardTemperatureDefaultValue').convertedValue; // default 0 DegC
        this.standardTemperatureDefaultValue = this.preferenceDecimalPipe.transform(this.standardTemperatureDefaultValue, 'TemperatureUnit'); // set decimal places

        const activeVolumetricFlowUnit = parseInt(this.userPrefs.find(p => p.name === 'VolumetricFlowUnit').value, 10);
        this.setStandardOrNormalTemperatureDefault(activeVolumetricFlowUnit);

        this.temperatureDefaultValue = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'temperatureDefaultValue').convertedValue; // default 0 DegC
        this.temperatureDefaultValue = this.preferenceDecimalPipe.transform(this.temperatureDefaultValue, 'TemperatureUnit'); // set decimal places
        this.sizingModuleForm.get('processConditions.temperature').setValue(this.temperatureDefaultValue);

        this.pressureMinSV40xDefaultValue = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'pressureMinSV40xDefaultValue').convertedValue;
        this.pressureMinSV40xDefaultValue = this.preferenceDecimalPipe.transform(this.pressureMinSV40xDefaultValue, 'PressureUnit'); // set decimal places

        this.isInitialised = true;
        // TODO: will we trigger it?
        // this.selectedProducts.updateValueAndValidity();
      }
    });

  }

  private restorePipeSelectionFormState() {
    this.sizingModuleForm
      .get('pipeSelection')
      .patchValue(this.pipeSelectionFormState, { emitEvent: false });
  }

  private getPipeSizesHelper(standard, designation, nominalSize): Observable<PipeSizeModel> {
    return this.flowMeterService.getPipeSizes(
      standard,
      designation,
      nominalSize,
      this.getUnitId('LengthUnit').toString()
    )
      .pipe(
        tap(pipeSize => {
          const formattedOutsideDiameter = this.preferenceDecimalPipe.transform(pipeSize.outerDiameter, 'LengthUnit');
          const formattedWallThickness = this.preferenceDecimalPipe.transform(pipeSize.wallThickness, 'LengthUnit');
          const formattedInternalDiameter = this.preferenceDecimalPipe.transform(
            pipeSize.internalDiameter,
            'LengthUnit'
          );
          const pipeSelectionForm = this.sizingModuleForm.get('pipeSelection');

          if (this.savedWallThicknessCustomErrors) {
            this.savedWallThicknessCustomErrors = undefined;
          }

          pipeSelectionForm.get('manuals')
            .reset({
              outsideDiameter: formattedOutsideDiameter,
              wallThickness: formattedWallThickness
            }
            );

          pipeSelectionForm.get('internalDiameter').reset(formattedInternalDiameter);

          return;
        })
      );
  }

  private subscribeOnDropdownsChanges(): Subscription {
    const pipeSelectionForm = this.sizingModuleForm.get('pipeSelection');
    type OnControlChangeDataType = {
      value: string;
      controlName: 'pipeStandard' | 'designation' | 'nominalSize';
    };
    const pipeStandardChange$ = pipeSelectionForm.get('pipeStandard')
      .valueChanges
      .pipe(
        filter(value => value !== null),
        distinctUntilChanged(),
        tap(() => this.pipeSelectionBlockUi.start('Loading...')),
        map(value => ({ value, controlName: 'pipeStandard' }))
      );
    const designationChange$ = pipeSelectionForm.get('designation')
      .valueChanges
      .pipe(
        distinctUntilChanged(),
        tap(() => this.pipeSelectionBlockUi.start('Loading...')),
        map(value => ({ value, controlName: 'designation' }))
      );
    const nominalSizeChange$ = pipeSelectionForm.get('nominalSize')
      .valueChanges
      .pipe(
        distinctUntilChanged(),
        tap(() => this.pipeSelectionBlockUi.start('Loading...')),
        map(value => ({ value, controlName: 'nominalSize' }))
      );

    return merge(pipeStandardChange$, designationChange$, nominalSizeChange$)
      .pipe(
        filter<OnControlChangeDataType>((object => object.value && !!object.value.length)),
        concatMap((controlValue: OnControlChangeDataType) => {
          const standardValue = pipeSelectionForm.get('pipeStandard').value;
          const designationValue = pipeSelectionForm.get('designation').value;
          const nominalSizeValue = pipeSelectionForm.get('nominalSize').value;
          const internalDiameterValue = pipeSelectionForm.get('internalDiameter').value;
          const { controlName, value } = controlValue;

          switch (controlName) {
            case 'pipeStandard':
              return this.flowMeterService.getDesignations(value).pipe(
                tap(designations => {
                  this.designations = designations;
                  this.pipeSelectionBlockUi.stop();

                  if (this.nominalSizes) {
                    this.nominalSizes = undefined;
                  }

                  if (designationValue || nominalSizeValue) {

                    pipeSelectionForm.get('designation').patchValue("");
                    pipeSelectionForm.get('nominalSize').patchValue("");
                    pipeSelectionForm.markAsDirty();
                    this.pipeSelectionBlockUi.stop();
                  }
                 
                  if (this.designations.length == 1) {
                    pipeSelectionForm.get('designation').patchValue(this.designations[0].originalName);
                    pipeSelectionForm.markAsDirty();
                    this.pipeSelectionBlockUi.stop();
                  }
                  
                  if (internalDiameterValue) {
                    pipeSelectionForm.patchValue({
                      manuals: {
                        outsideDiameter: '',
                        wallThickness: ''
                      },
                      internalDiameter: ''
                    });
                  }
                }
                )
              );
            case 'designation':
              return this.flowMeterService.getNominalSizes(standardValue, value)
                .pipe(
                  tap(sizes => {
                    this.nominalSizes = sizes;
                    this.pipeSelectionBlockUi.stop();
                  }),
                  filter(() => nominalSizeValue),
                  switchMap(sizes => {
                    const oldValueExistsInNewSizesArray = sizes.find(size => size.dn === nominalSizeValue);

                    if (oldValueExistsInNewSizesArray) {
                      pipeSelectionForm.get('nominalSize').updateValueAndValidity();

                      return this.getPipeSizesHelper(standardValue, value, nominalSizeValue);
                    }

                    pipeSelectionForm.patchValue({
                      nominalSize: '',
                      manuals: {
                        outsideDiameter: '',
                        wallThickness: ''
                      },
                      internalDiameter: ''
                    });

                    return of({});
                  })
                );
            case 'nominalSize':
              if (!designationValue) {
                return of({});
              }

              return this.getPipeSizesHelper(standardValue, designationValue, value);
          }
        })
      )
      .subscribe(() => this.pipeSelectionBlockUi.stop());
  }

  private subscribeOnPipeSizeManualControlsChanges(): Subscription {
    const manualsFormGroup = this.sizingModuleForm.get('pipeSelection.manuals');
    const manualsFormGroupChanges: Observable<{
      wallThickness: number;
      outsideDiameter: number;
    }> = manualsFormGroup.valueChanges;

    return manualsFormGroupChanges
      .pipe(
        filter(value => {
          return value !== null && typeof value.outsideDiameter === 'number' && typeof value.wallThickness === 'number';
        }),
        distinctUntilChanged((prev, curr) => {
          return prev.wallThickness === curr.wallThickness && prev.outsideDiameter === curr.outsideDiameter;
        }),
        tap(() => this.pipeSelectionBlockUi.start('Loading...')),
        switchMap(value => {
          return this.flowMeterService.getInternalDiameter(value.outsideDiameter.toString(), value.wallThickness.toString()).pipe(
            catchError((errorResponse: HttpErrorResponse) => {
              this.pipeSelectionBlockUi.stop();

              manualsFormGroup.get('wallThickness').setErrors({ valueError: errorResponse.error });

              this.savedWallThicknessCustomErrors = { valueError: errorResponse.error };

              return of(null);
            })
          );
        })
      )
      .subscribe(
        (internalDiameter: number | null) => {
          this.pipeSelectionBlockUi.stop();

          const value = typeof internalDiameter === 'number' ?
            this.preferenceDecimalPipe.transform(internalDiameter, 'LengthUnit') : null;

          if (typeof internalDiameter === 'number' && this.savedWallThicknessCustomErrors) {
            manualsFormGroup.get('wallThickness').setErrors(null);
            this.savedWallThicknessCustomErrors = undefined;
          }

          // if we changed wallThickness or outsideDiameter and before leaving ('blur' event) from these
          // controls save internalDiameter
          if (!this.sizingModuleForm.get('pipeSelection') && this.pipeSelectionFormState) {
            this.pipeSelectionFormState = {
              ...this.pipeSelectionFormState,
              internalDiameter: value
            };

            return;
          }

          this.sizingModuleForm.get('pipeSelection').patchValue({ internalDiameter: value });
        }
      );
  }

  /**
   * Select volumetric flow unit for the process conditions
   */
  processVolumetricFlowUnitSelector() {
    const media = this.sizingModuleForm.get('processConditions.media').value;
    if (!this.sizingModuleForm.get('processConditions.media').value || !this.getSizingUnitPreferencesByName('VolumetricFlowUnit')) {
      return;
    }

    let requiredFlowUnit = 0;
    const activeVolumetricFlowUnit = this.getUnitId('VolumetricFlowUnit');

    // if StateDetail is Liquid, or the media is Dry Sat or Superheated Steam, remove N and S entries and switch current unit if needed
    // Note that we cannot rely on this.mediaStateFromPPDS as it reflects the previous state and cannot call PPDS as we need to change the Normal/Standard units to call PPDS. Chicken egg.
    if (media === 'Dry Saturated Steam' || media === 'Superheated Steam' || media === 'Water' || this.mediaStateFromPPDS.toUpperCase() !== 'GAS') {

      // if the user has selected one of the above units we need to switch to its equivalent
      if (activeVolumetricFlowUnit >= 201 && activeVolumetricFlowUnit <= 222) {
        switch (activeVolumetricFlowUnit) {
          case 201:
            requiredFlowUnit = 75;
            break;
          case 202:
            requiredFlowUnit = 76;
            break;
          case 203:
            requiredFlowUnit = 77;
            break;
          case 204:
            requiredFlowUnit = 72;
            break;
          case 205:
            requiredFlowUnit = 74;
            break;
          case 206:
            requiredFlowUnit = 73;
            break;
          case 207:
            requiredFlowUnit = 75;
            break;
          case 208:
            requiredFlowUnit = 76;
            break;
          case 209:
            requiredFlowUnit = 72;
            break;
          case 210:
            requiredFlowUnit = 74;
            break;
          case 211:
            requiredFlowUnit = 73;
            break;
          case 212:
            requiredFlowUnit = 78;
            break;
          case 213:
            requiredFlowUnit = 79;
            break;
          case 214:
            requiredFlowUnit = 80;
            break;
          case 215:
            requiredFlowUnit = 81;
            break;
          case 216:
            requiredFlowUnit = 82;
            break;
          case 217:
            requiredFlowUnit = 77;
            break;
          case 218:
            requiredFlowUnit = 78;
            break;
          case 219:
            requiredFlowUnit = 79;
            break;
          case 220:
            requiredFlowUnit = 80;
            break;
          case 221:
            requiredFlowUnit = 81;
            break;
          case 222:
            requiredFlowUnit = 82;
            break;
        }
      }
    } else {
      // set pref back to selected page unit for Normal/Standard volumetric flow.
      if (!(activeVolumetricFlowUnit >= 201 && activeVolumetricFlowUnit <= 222)) {
        requiredFlowUnit = this.volumetricFlowSelectedPageUnitId;
      }
    }

    if (requiredFlowUnit !== 0 && requiredFlowUnit !== activeVolumetricFlowUnit) {
      this.volumetricFlowChanged = true;
      // set the correct unit of measurement
      // this.preferenceService.allPreferences.find(i => i.value == requiredFlowUnit.toString());
      const vfUnitPref = this.unitsService.units.find(i => i.id == requiredFlowUnit);
      if (!vfUnitPref) {
        return;
      }
      const oldVolumetricFlowUnitName = this.translatePipe.transform(
        this.getSizingUnitPreferencesByName('VolumetricFlowUnit').masterTextKey
      );

      // override current unit properties
      const overrideVolumetricFlow = this.getSizingUnitPreferencesByName('VolumetricFlowUnit');
      overrideVolumetricFlow.masterTextKey = vfUnitPref.masterTextKey;
      overrideVolumetricFlow.unitName = vfUnitPref.name;
      overrideVolumetricFlow.value = vfUnitPref.id.toString();

      const newVolumetricFlowUnitName = this.translatePipe.transform(overrideVolumetricFlow.masterTextKey);
      const volumetricFlowUnitsHaveBeenChangedTitle = this.translatePipe.transform('VOLUMETRIC_FLOW_CHANGED');
      const volumetricFlowUnitsHaveBeenChangedMessage = this.translatePipe.transform('VOLUMETRIC_FLOW_CHANGED_MESSAGE');

      this.setStandardOrNormalTemperatureDefault(vfUnitPref.id);


      swal({
        closeOnClickOutside: false, closeOnEsc: false,
        title: volumetricFlowUnitsHaveBeenChangedTitle,
        text: volumetricFlowUnitsHaveBeenChangedMessage + ' from ' + oldVolumetricFlowUnitName + ' to ' + newVolumetricFlowUnitName,
        icon: 'warning',
        dangerMode: true,
      }).then((okButtonClicked?: boolean) => {
        console.log('Ok clicked...');
      }); // end of swal

      this.enableNormalTemperature();
    }
  }

  /**
   * Set standard/normal temperature default value based on vol flow unit
   * @param volumetricFlowUnitId
   */
  private setStandardOrNormalTemperatureDefault(volumetricFlowUnitId) {
    if (
      (volumetricFlowUnitId >= 207 && volumetricFlowUnitId <= 211) ||
      (volumetricFlowUnitId >= 217 && volumetricFlowUnitId <= 222)
    ) {
      // reset to default 20DegC
      this.sizingModuleForm.get('processConditions.normalTemperature').setValue(this.normalTemperatureDefaultValue);
    } else {
      // reset to default 0DegC
      this.sizingModuleForm.get('processConditions.normalTemperature').setValue(this.standardTemperatureDefaultValue);
    }
  }

  private disableInputs(): void {
    this.processConditionsBlockUi.start(this.translatePipe.transform('CALCULATING_MESSAGE', true) + '...');
    this.blockUiTimeout = setTimeout(() => {
      this.processConditionsBlockUi.reset();
    }, 2000);
  }

  private enableInputs(): void {
    this.processConditionsBlockUi.stop();
    clearTimeout(this.blockUiTimeout);
  }

  private checkHasNullValues(object): boolean {
    let result = false;

    for (const key in object) {
      if (!object.hasOwnProperty(key)) {
        continue;
      }

      if (object[key] === null) {
        result = true;
      }
    }

    return result;
  }

  private checkVelocity() {
    const processConditionsFormValue = this.sizingModuleForm.get('processConditions').value;
    const pipeSelectionForm = this.sizingModuleForm.get('pipeSelection') as FormGroup;
    const pipeSelectionFormValue = pipeSelectionForm.getRawValue();
    let payload: CalculateVelocityRequestPayloadModel = {
      mediaType: processConditionsFormValue.media,
      mediaState: processConditionsFormValue.state,
      inletPressure: processConditionsFormValue.inletPressure,
      inletPressureUnit: this.getUnitId('PressureUnit'),
      inletTemperature: processConditionsFormValue.temperature,
      inletTemperatureUnit: this.getUnitId('TemperatureUnit'),
      massFlow: processConditionsFormValue.massFlow,
      massFlowUnit: this.getUnitId('MassFlowUnit'),
      normalTemperature: processConditionsFormValue.normalTemperature,
      normalTemperatureUnit: this.getUnitId('TemperatureUnit'),
      volumetricFlow: processConditionsFormValue.volumetricFlow,
      volumetricFlowUnit: this.getUnitId('VolumetricFlowUnit'),
      velocityUnitId: this.getUnitId('VelocityUnit'),
      lengthUnitId: this.getUnitId('LengthUnit')
    };

    if (pipeSelectionFormValue.specifyDiameterMode) {
      payload = {
        ...payload,
        pipeInternalDiameter: pipeSelectionFormValue.internalDiameter
      };
    } else {
      payload = {
        ...payload,
        pipeId: this.getPipeId(pipeSelectionForm.get('nominalSize').value)
      };
    }

    if (this.checkHasNullValues(payload)) {
      return;
    }

    this.flowMeterService.calculateVelocity(payload).subscribe(
      (response) => {
        if (response.isOverload) {
          return this.velocityCheckResult = response.velocityValue;
        }

        this.velocityCheckResult = undefined;
      }
    );
  }

  private getPipeId(dnName: string): number | null {
    if (!dnName) {
      return null;
    }

    const nominalSizeObject: NominalSizeModel | undefined = this.nominalSizes.find(size => size.dn === dnName);

    return nominalSizeObject ? nominalSizeObject.id : null;
  }

  private checkVelocityIfFormValid(): Subscription {
    const pipeSelectionForm = this.sizingModuleForm.get('pipeSelection');

    const processConditionsFormValueAndStateChanges$ = combineLatest<[boolean, string, { [key: string]: any }]>([
      this.processConditionsControlsRationalizationFinished$,
      this.processConditionsLatestFormStatus$,
      this.sizingModuleForm
        .get('processConditions')
        .valueChanges
        .pipe(startWith<{ [key: string]: any }>(this.sizingModuleForm.get('processConditions').value))
    ]).pipe(
      filter(([rationalizationFinished, formStatus, formValue]) =>
        rationalizationFinished && formStatus === 'VALID' && !this.checkHasNullValues(formValue)
      ),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    );
    const pipeSelectionControlsValueChanges$ = pipeSelectionForm.get('specifyDiameterMode').valueChanges.pipe(
      startWith(pipeSelectionForm.get('specifyDiameterMode').value),
      switchMap(
        manualControlsEnabled => manualControlsEnabled ?
          pipeSelectionForm.get('internalDiameter').valueChanges :
          pipeSelectionForm.get('nominalSize').valueChanges
      ),
      filter(value => !!value)
    );

    return combineLatest([
      processConditionsFormValueAndStateChanges$,
      pipeSelectionControlsValueChanges$
    ]).subscribe(() => this.checkVelocity());
  }

  /**
   * Enable normal temperature control
   */
  private enableNormalTemperature(): void {
    this.sizingModuleForm.get('processConditions.normalTemperature').enable({ emitEvent: false });
  }

  /**
   * Disable normal temperature control
   */
  private disableNormalTemperature(): void {
    this.sizingModuleForm.get('processConditions.normalTemperature').disable({ emitEvent: false });
  }

  /**
   * Update normal temperature validators at runtime
   * @param normalTemperatureInputEnabled - is normal temperature enabled
   */
  private setNormalTemperatureValidator(normalTemperatureInputEnabled: boolean): void {
    const normalTemperatureControl = this.sizingModuleForm.get('processConditions.normalTemperature');
    if (normalTemperatureInputEnabled) {
      normalTemperatureControl.clearValidators();
      normalTemperatureControl.setValidators([Validators.required]);
      normalTemperatureControl.setAsyncValidators([
        this.createFlowMeterControlValidator('NormalTemperature', 'TemperatureUnit'),
      ]);
      normalTemperatureControl.updateValueAndValidity({ emitEvent: false });
    } else {
      normalTemperatureControl.clearValidators();
      normalTemperatureControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  private recreateStateOfUnits(unitPreferences: Preference[]) {
    let masterTextKey = '';

    for (const pref of unitPreferences) {
      switch (pref.name) {
        case 'PressureUnit':
          masterTextKey = 'PRESSURE';
          break;
        case 'LengthUnit':
          masterTextKey = 'LENGTH';
          break;
        case 'MassFlowUnit':
          masterTextKey = 'MASS_FLOW';
          break;
        case 'VolumetricFlowUnit':
          masterTextKey = 'VOLUMETRIC_FLOW';
          break;
        case 'TemperatureUnit':
          masterTextKey = 'TEMPERATURE';
          break;
        case 'VelocityUnit':
          masterTextKey = 'VELOCITY';
          break;
      }

      this.preferenceService.addSizingUnitPreference(pref, `${pref.name}s`, masterTextKey, this.moduleGroupId);
    }
  }

  private loadJob() {
    try {
      const { sizingOutput, processConditions } = this.loadedJobSizingData;
      const { processInputs, unitPreferences } = processConditions[0];
      const pipeSelectionFormWasEnabled = processInputs.find(m => m.name === 'specifyPipeSize').value === 'true';
      let jobToRecreate: { [key: string]: any } = {
        processConditions: {
          media: processInputs.find(m => m.name === 'media').value,
          inletPressure: +(processInputs.find(m => m.name === 'inletPressure').value),
          temperature: +(processInputs.find(m => m.name === 'temperature').value),
          state: processInputs.find(m => m.name === 'state').value,
          massFlow: +(processInputs.find(m => m.name === 'massFlow').value),
          volumetricFlow: +(processInputs.find(m => m.name === 'volumetricFlow').value),
          normalTemperature: +(processInputs.find(m => m.name === 'normalTemperature').value),
        },
        meterDetails: {
          selectedMeters: JSON.parse(processInputs.find(m => m.name === 'selectedMeters').value)
        }
      };

      if (pipeSelectionFormWasEnabled) {
        const specifyDiameterMode = processInputs.find(m => m.name === 'specifyDiameterMode').value === 'true';

        jobToRecreate = {
          ...jobToRecreate,
          specifyPipeSize: true,
          pipeSelection: {
            specifyDiameterMode,
            pipeStandard: processInputs.find(m => m.name === 'pipeStandard').value,
            designation: processInputs.find(m => m.name === 'designation').value,
            manuals: {
              outsideDiameter: +(processInputs.find(m => m.name === 'outsideDiameter').value),
              wallThickness: +(processInputs.find(m => m.name === 'wallThickness').value)
            },
            nominalSize: processInputs.find(m => m.name === 'nominalSize').value,
            internalDiameter: +(processInputs.find(m => m.name === 'internalDiameter').value)
          }
        };

        if (specifyDiameterMode) {
          const designations = processInputs.find(m => m.name === 'designations');
          const nominalSizes = processInputs.find(m => m.name === 'nominalSizes');

          this.designations = designations ? JSON.parse(designations.value) : undefined;
          this.nominalSizes = nominalSizes ? JSON.parse(nominalSizes.value) : undefined;
        }

        this.pipeSizeWasCalculatedInJob = true;
      }

      this.lastSelectedMedia = processInputs.find(m => m.name === 'media').value;
      this.recreateStateOfUnits(unitPreferences);

      this.sizingModuleForm.patchValue(jobToRecreate);

      // Recreate GRID
      if (
        sizingOutput.outputGrid !== null &&
        sizingOutput.outputGrid.outputGridRows !== null &&
        sizingOutput.outputGrid.outputGridRows.length > 0
      ) {
        this.isSizingDone = true;

        const generateTableFromSavedConfigs = (
          configs: [][] | { [key: string]: any }[],
          tableArray: { [key: string]: any }[],
          rowObject?: { [key: string]: any }
        ) => {
          for (const config of configs) {
            if (Array.isArray(config)) {
              generateTableFromSavedConfigs(config, tableArray, {});
              continue;
            }

            if (config.name === 'messages') {
              rowObject[config.name] = JSON.parse(config.value);
              continue;
            }

            rowObject[config.name] = config.value;
            rowObject.selected = config.selected;
          }

          if (rowObject) {
            tableArray.push(rowObject);
          }

          return tableArray;
        };

        this.tableRows = generateTableFromSavedConfigs(
          sizingOutput.outputGrid.outputGridRows.map(row => row.outputItems),
          []
        );

        // Ancillaries block
        this.ancillariesForm.patchValue({
          downstreamCheckValve: processInputs.find(m => m.name === 'downstreamCheckValve').value === 'true',
          upstreamStrainer: processInputs.find(m => m.name === 'upstreamStrainer').value === 'true',
          upstreamIsolationValve: processInputs.find(m => m.name === 'upstreamIsolationValve').value === 'true',
          downstreamIsolationValve: processInputs.find(m => m.name === 'downstreamIsolationValve').value === 'true',
          separator: processInputs.find(m => m.name === 'separator').value === 'true',
          separatorTrapSet: processInputs.find(m => m.name === 'separatorTrapSet').value === 'true'
        });

        this.formsValueChangesSubscriptions.add(
          this.ancillariesForm.valueChanges.subscribe(() => {
            this.sizingModuleForm.markAsDirty();
          })
        );

        const rowSelected: { [key: string]: any } = this.tableRows.find(row => row.selected);

        // Recreate state of Item Details form
        if (sizingOutput.outputItems && sizingOutput.outputItems.length) {
          const savedItemDetailsFormValue = sizingOutput.outputItems.filter(item => item.name !== 'IsResetEnabled');

          if (savedItemDetailsFormValue.length) {
            this.itemDetailsService.savedFormValue = savedItemDetailsFormValue.reduce(
              (formValue, item) => ({
                ...formValue,
                [item.name]: item.value
              }), {}
            );
          }
        }

        if (rowSelected) {
          // Recreate selected row
          this.tableRowsSelected[0] = rowSelected;

          // Recreate selected row
          this.selectedFlowMeter = rowSelected; // for details block
        }
      }

      // Reset button status
      if (JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === 'IsResetEnabled').value)) {
        this.sizingModuleForm.markAsDirty();
      }

    } catch (err) {
      console.log(`LoadJob() failed err=${err}`);
      this.showJobLoadError();
    }
  }

  private showJobLoadError() {
    console.log('showJobLoadError()');
    this.isLoadingJob = false;

    let trans_Title = this.translatePipe.transform('LOAD_JOB_FAILED_TITLE', true);
    let trans_Message = this.translatePipe.transform('LOAD_JOB_FAILED_MESSAGE', true);

    swal({
      closeOnClickOutside: false, closeOnEsc: false,
      title: trans_Title,
      text: trans_Message,
      icon: 'error',
      dangerMode: true
    }).then((okbuttoncClicked?: boolean) => {

      console.info("Ok clicked...");

      // The parameter can also enter as null
      const returnVal = !(okbuttoncClicked === null);

    }); // end of swal
  }
}
