import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ChartBarDataInterface } from '../modules/shared/interfaces/chart-bar.interface';
import {
  ProposedDataInterface,
  ProposedSetupChartElements,
  ProposedSetupChartIndex, ProposedSetupChartLabels,
  SteamGeneratorInputsInterface
} from '../steam-generation-form.interface';
import { SteamGenerationAssessmentService } from '../steam-generation-assessment.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-sga-proposed-setup',
  templateUrl: './sga-proposed-setup.component.html',
  styleUrls: ['./sga-proposed-setup.component.scss']
})
export class SgaProposedSetupComponent implements OnInit {
  // Outer data
  @Input() inputData: SteamGeneratorInputsInterface;
  @Input() currency: string;
  @Input() units: { [key: number]: string };
  @Output() generateProposed: EventEmitter<{proposedSetup: any, features: any}> = new EventEmitter<{proposedSetup: any, features: any}>();

  // Setter / Getter
  private proposedResults: any[];
  @Input()
  set results(data: any[]) {
    this.proposedResults = data;
    const { verticalChartData, horizontalChartData } = SgaProposedSetupComponent.generateChartsData(data);
    this.verticalChartData = verticalChartData;
    this.horizontalChartData = horizontalChartData;
  }
  get results() { return this.proposedResults; }
  private proposedData: ProposedDataInterface;
  @Input()
  set data(data: ProposedDataInterface) {
    this.proposedData = data;

    if (data && data.proposedSetup && data.features) {
      this.form.patchValue(
        { proposedSetup: data.proposedSetup, features: data.features },
        { onlySelf: true, emitEvent: false }
      );
    } else {
      this.resetData();
    }
  }
  get data(): ProposedDataInterface { return this.proposedData; }

  // inner data
  private ngUnsubscribe = new Subject<void>();
  public verticalChartData: ChartBarDataInterface[] = [
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Fuel' },
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Water and Chemicals' },
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Effluent' },
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Carbont tax' },
  ];
  public horizontalChartData: ChartBarDataInterface[] = [
    { data: [0, 0], label: 'Fuel' },
    { data: [0, 0], label: 'Water and Chemicals' },
    { data: [0, 0], label: 'Effluent' },
    { data: [0, 0], label: 'Carbont tax' },
  ];
  public verticalChartLabels: string[] = [
    ProposedSetupChartLabels.improvedBoilerEfficiency,
    ProposedSetupChartLabels.condensateReturnPlusCondensateTemperature,
    ProposedSetupChartLabels.changingWaterTreatment,
    ProposedSetupChartLabels.addingAutomaticTdsControl,
    ProposedSetupChartLabels.addingFlashHeatRecoveryToAutoTdsControl,
    ProposedSetupChartLabels.addingHeatExchangerToHeatRecoveryToTdsBlowdown,
    ProposedSetupChartLabels.effectOfDsiOnHotwell,
  ];
  public proposedFormPanel = true;
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
  private static generateChartsData(data: any[]): {
    verticalChartData: ChartBarDataInterface[]; horizontalChartData: ChartBarDataInterface[];
  } {
    const result: { verticalChartData: ChartBarDataInterface[]; horizontalChartData: ChartBarDataInterface[]; } = {
      verticalChartData: [
        { data: [0, 0, 0, 0, 0, 0, 0], label: 'Fuel' },
        { data: [0, 0, 0, 0, 0, 0, 0], label: 'Water and Chemicals' },
        { data: [0, 0, 0, 0, 0, 0, 0], label: 'Effluent' },
        { data: [0, 0, 0, 0, 0, 0, 0], label: 'Carbon tax' },
      ],
      horizontalChartData: [
        { data: [0, 0], label: 'Fuel' },
        { data: [0, 0], label: 'Water and Chemicals' },
        { data: [0, 0], label: 'Effluent' },
        { data: [0, 0], label: 'Carbont tax' },
      ]
    };

    if (!data || !data.length) { return result; }

    for (const col of data) {
      const key = Object.keys(col)[0];
      if (key && (ProposedSetupChartIndex[key] || ProposedSetupChartIndex[key] === 0)) {
        // Fuel
        result.verticalChartData[ProposedSetupChartElements['Fuel']]
          .data[ProposedSetupChartIndex[key]] = col[key].propFuelValueSavings || 0;
        // Water and Chemicals
        result.verticalChartData[ProposedSetupChartElements['Water and Chemicals']]
          .data[ProposedSetupChartIndex[key]] = col[key].propWaterAndChemicalValueSavings || 0;
        // Effluent
        result.verticalChartData[ProposedSetupChartElements['Effluent']]
          .data[ProposedSetupChartIndex[key]] = col[key].propEffluentValueSavings || 0;
        // Carbon tax
        result.verticalChartData[ProposedSetupChartElements['Carbon tax']]
          .data[ProposedSetupChartIndex[key]] = col[key].propCO2emmissionsReducedValueSavings || 0;
      }
    }

    return result;
  }

  private resetData() {
    this.verticalChartData = [
      { data: [0, 0, 0, 0, 0, 0, 0], label: 'Fuel' },
      { data: [0, 0, 0, 0, 0, 0, 0], label: 'Water and Chemicals' },
      { data: [0, 0, 0, 0, 0, 0, 0], label: 'Effluent' },
      { data: [0, 0, 0, 0, 0, 0, 0], label: 'Carbont tax' },
    ];
    this.horizontalChartData = [
      { data: [0, 0], label: 'Fuel' },
      { data: [0, 0], label: 'Water and Chemicals' },
      { data: [0, 0], label: 'Effluent' },
      { data: [0, 0], label: 'Carbont tax' },
    ];
    this.form.setValue({
      proposedSetup: {
        benchmarkBoilerEfficiency: 0,
        benchmarkCondensateReturn: 0,
        benchmarkCondensateReturnedPercentage: 0,
        benchmarkCondensateTemperature: 0,
        benchmarkDsiPressure: 0,
        benchmarkTemperatureOfFeedtank: 0,
        benchmarkWaterRejectionRate: 0,
        condensateReturnUnit: 0,
        condensateTemperatureUnit: 0,
        dsiPressureUnit: 0,
        economiserRequired: false,
        proposalBoilerEfficiency: 0,
        proposalCondensateReturned: 0,
        proposalCondensateReturnedPercentage: 0,
        proposalCondensateTemperature: 0,
        proposalCostOfSodiumSulphite: 0,
        proposalDsiPressure: 0,
        proposalTemperatureOfFeedtank: 0,
        proposalWaterRejectionRate: 0,
        temperatureOfFeedtankUnit: 0,
      },
      features: {
        boilerEfficiencyImprovements: false,
        increaseCondensateReturn: false,
        addWaterTreatmentPlant: false,
        addAutoTdsControls: false,
        addAutoTdsAndFlashRecovery: false,
        addAutoTdsAndFlashRecoveryPlusHearExchanger: false,
        addDirectSteamInjectionToFeedtank: false,
      },
    }, { onlySelf: true, emitEvent: false });
  }

  get isCondensateReturnDisable(): boolean {
    const fg: FormGroup = this.form.get('proposedSetup') as FormGroup;
    return fg.get('proposalCondensateReturnedPercentage').value === fg.get('benchmarkCondensateReturnedPercentage').value &&
      fg.get('benchmarkCondensateReturn').value === fg.get('proposalCondensateReturned').value;
  }

  ngOnInit() {}

  onSubmit() {
    this.proposedFormPanel = false;
    this.generateProposed.emit(this.form.getRawValue());
  }

  economizerChange(economiserRequired) {
    const proposalBoilerEfficiencyControl = this.form.get('proposedSetup.proposalBoilerEfficiency');

    this.sgaService.calcProposedBoilerEfficiency({
      economiserRequired,
      benchmarkBoilerEfficiency: this.form.get('proposedSetup.benchmarkBoilerEfficiency').value,
      proposalBoilerEfficiency: proposalBoilerEfficiencyControl.value,
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res && res.proposalBoilerEfficiency) {
        proposalBoilerEfficiencyControl.patchValue(res.proposalBoilerEfficiency, { onlySelf: true, emitEvent: false });
      }
    });
  }

  changeFeature(changed?: Event) {
    this.generateProposed.emit(this.form.getRawValue());
  }
}
