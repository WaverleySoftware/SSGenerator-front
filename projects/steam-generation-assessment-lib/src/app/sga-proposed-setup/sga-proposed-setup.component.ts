import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ChartBarDataInterface, ChartBarOptionsInterface } from '../modules/shared/interfaces/chart-bar.interface';
import { ProposedDataInterface, ProposedSetupInterface } from '../steam-generation-form.interface';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SteamGenerationAssessmentService } from '../steam-generation-assessment.service';

@Component({
  selector: 'app-sga-proposed-setup',
  templateUrl: './sga-proposed-setup.component.html',
  styleUrls: ['./sga-proposed-setup.component.scss']
})
export class SgaProposedSetupComponent implements OnInit, OnChanges {
  @Input() data: ProposedDataInterface;
  @Input() currency: string;
  @Input() units: { [key: number]: string };
  @Output() generateProposed: EventEmitter<{proposedSetup: any, features: any}> = new EventEmitter<{proposedSetup: any, features: any}>();

  public chartData: ChartBarDataInterface[] = [
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Fuel' },
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Water and Chemicals' },
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Effluent' },
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Carbont tax' },
  ];
  public costSteamGenerationChart: ChartBarDataInterface[] = [
    { data: [0, 0], label: 'Fuel' },
    { data: [0, 0], label: 'Water and Chemicals' },
    { data: [0, 0], label: 'Effluent' },
    { data: [0, 0], label: 'Carbont tax' },
  ];
  public chartLabels: string[] = [
    'Increase boiler effiency',
    'Increase condensate return',
    'water treatment plant (RO)',
    'auto tds control',
    'auto TDS and Flash Heat Recovery',
    'Auto tds flash recovery + heat exchanger',
    'Direct steam injection feedtank'
  ];
  public costSteamGenerationChartLabels: string[] = ['POTENTIAL', 'CURRENT'];
  public costSteamGenerationChartOptions: ChartBarOptionsInterface = {
    scales: { xAxes: [{ stacked: true, maxBarThickness: 58, display: false }] }
  };
  public proposedFormPanel = true;
  public loading = false;
  public isAutoTDSControlsChecked = false;
  public form: FormGroup = this.fb.group({
    proposedSetup: this.fb.group({
      benchmarkBoilerEfficiency: [0, Validators.required],
      benchmarkCondensateReturn: [0, Validators.required],
      benchmarkCondensateReturnedPercentage: [0, Validators.required],
      benchmarkCondensateTemperature: [0, Validators.required],
      benchmarkDsiPressure: [0, Validators.required],
      benchmarkTemperatureOfFeedtank: [0, Validators.required],
      benchmarkWaterRejectionRate: [0, Validators.required],
      condensateReturnUnit: [0, Validators.required],
      condensateTemperatureUnit: [0, Validators.required],
      dsiPressureUnit: [0, Validators.required],
      economiserRequired: [false],
      proposalBoilerEfficiency: [0, Validators.required],
      proposalCondensateReturned: [0, Validators.required],
      proposalCondensateReturnedPercentage: [0, Validators.required],
      proposalCondensateTemperature: [0, Validators.required],
      proposalCostOfSodiumSulphite: [0, Validators.required],
      proposalDsiPressure: [0, Validators.required],
      proposalTemperatureOfFeedtank: [0, Validators.required],
      proposalWaterRejectionRate: [0, Validators.required],
      temperatureOfFeedtankUnit: [0, Validators.required],
    }),
    features: this.fb.group({
      boilerEfficiencyImprovements: [false],
      increaseCondensateReturn: [false],
      addWaterTreatmentPlant: [false],
      addAutoTdsControls: [
        false,
        SgaProposedSetupComponent.validateTds(['addAutoTdsAndFlashRecovery', 'addAutoTdsAndFlashRecoveryPlusHearExchanger'])
      ],
      addAutoTdsAndFlashRecovery: [
        false,
        SgaProposedSetupComponent.validateTds(['addAutoTdsControls', 'addAutoTdsAndFlashRecoveryPlusHearExchanger'])
      ],
      addAutoTdsAndFlashRecoveryPlusHearExchanger: [
        false,
        SgaProposedSetupComponent.validateTds(['addAutoTdsControls', 'addAutoTdsAndFlashRecovery'])
      ],
      addDirectSteamInjectionToFeedtank: [false],
    }),
  });

  constructor(private fb: FormBuilder, private sgaService: SteamGenerationAssessmentService) {}

  private static validateTds(setToFalseArr: string[]) {
    return (control: AbstractControl): ValidationErrors => {
      if (control && control.value) {
        const fg: FormGroup = control.parent as FormGroup;

        if (fg) {
          for (const name of setToFalseArr) {
            const field = fg.get(name);

            if (field && field.value) {
              fg.patchValue({ [name]: false }, { emitEvent: false, onlySelf: true });
            }
          }
        }
      }

      return null;
    };
  }

  private static asyncValidatorFn(service): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      if (service && service.validateProposedInput) {
        const parentControls = control && control.parent && control.parent.controls;
        const formGroup: FormGroup = control && control.root as FormGroup;
        const fieldName = parentControls && Object.keys(parentControls)
          .find(name => parentControls[name] === control) as keyof ProposedSetupInterface || null;

        if (fieldName && formGroup) {
          return service
            .validateProposedInput(fieldName, {
              ...formGroup.get('proposedSetup').value,
              ...formGroup.get('features').value
            })
            .pipe(map((response: any) => {
              if (!response || response.isValid) { return null; }

              const { errors } = response;
              let error = 'ERROR';

              if (Array.isArray(errors)) {
                error = errors[0].errorMessage;
              }

              return {
                error,
                message: errors[0] && (errors[0].customState || errors[0].customState === 0) && `(${errors[0].customState})`
              };
            }));
        }
      }

      return of(null);
    };
  }

  private setTestData() {
    this.loading = true;
    setTimeout(() => {
      this.chartData = [
        { data: [272, 152, 80, 81, 56, 55, 0], label: 'Fuel' },
        { data: [0, 84, 40, 19, 86, 27, 0], label: 'Water and Chemicals' },
        { data: [0, 52, 41, 10, 80, 20, 0], label: 'Effluent' },
        { data: [46, 18, 41, 10, 80, 20, 0], label: 'Carbont tax' },
      ];
      this.costSteamGenerationChart = [
        { data: [152, 153], label: 'Fuel' },
        { data: [84, 70], label: 'Water and Chemicals' },
        { data: [52, 45], label: 'Effluent' },
        { data: [18, 10], label: 'Carbont tax' },
      ];
      this.loading = false;
    }, 2000);
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.data && this.data.proposedSetup && this.data.features) {
      this.form.setValue({
        proposedSetup: this.data.proposedSetup,
        features: this.data.features
      }, { onlySelf: true, emitEvent: false });
    }
  }

  onSubmit() {
    this.proposedFormPanel = false;

    this.setTestData();

    this.generateProposed.emit(this.form.getRawValue());
  }
}
