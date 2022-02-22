import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ChartBarDataInterface } from '../../interfaces/chart-bar.interface';
import {
  ProposedDataInterface,
  ProposedSetupChartElements,
  ProposedSetupChartIndex, ProposedSetupChartLabels, ProposedSetupInterface,
  SteamGeneratorInputsInterface
} from '../../interfaces/steam-generation-form.interface';
import {
  map,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { SgaApiService } from '../../services/sga-api.service';

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
    const { verticalChartData, horizontalChartData, total } = SgaProposedSetupComponent.generateChartsData(data);
    this.verticalChartData = verticalChartData;
    this.horizontalChartData = horizontalChartData;
    this.totalSaving = {
      savingsIncludingCondensateEffluent: total.savingsIncludingCondensateEffluent,
      steamGenerationSavings: total.steamGenerationSavings
    };
  }
  get results() { return this.proposedResults; }
  private proposedData: ProposedDataInterface;
  @Input()
  set data(data: ProposedDataInterface) {
    if (data && data.proposedSetup && data.features && this.form) {
      this.form.patchValue({ proposedSetup: data.proposedSetup, features: data.features }, {emitEvent: false});
    } else if (this.proposedData && !data) {
      this.resetData();
    }

    this.proposedData = data;
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
  public form: FormGroup;
  public totalSaving: {steamGenerationSavings: number, savingsIncludingCondensateEffluent: number};

  constructor(private fb: FormBuilder, private apiService: SgaApiService) {
    this.form = this.fb.group({
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
  }

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
    total: { steamGenerationSavings: number, savingsIncludingCondensateEffluent: number, data?: {benchmark: any, proposal: any} }
  } {
    const result: {
      verticalChartData: ChartBarDataInterface[];
      horizontalChartData: ChartBarDataInterface[];
      total: { steamGenerationSavings: number, savingsIncludingCondensateEffluent: number, data?: {benchmark: any, proposal: any} }
    } = {
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
      ],
      total: {steamGenerationSavings: 0, savingsIncludingCondensateEffluent: 0, data: { benchmark: null, proposal: null }}
    };

    if (!data || !data.length) { return result; }

    for (const col of data) {
      // verticalChartData
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

      // horizontalChartData && set total
      if (col.benchmark || col.overallImpactOnProposalsSelectedOnBoilerHouse) {
        const dataObj = col.benchmark || col.overallImpactOnProposalsSelectedOnBoilerHouse;
        const dataIndex = col.benchmark ? 0 : 1;

        // Fuel: CostOfFuelPerYear,
        result.horizontalChartData[ProposedSetupChartElements['Fuel']].data[dataIndex] = dataObj.costOfFuelPerYear || 0;
        // Water chemicals: WaterAndChemicalsCostTotalPerYear,
        result.horizontalChartData[ProposedSetupChartElements['Water and Chemicals']]
          .data[dataIndex] = dataObj.waterAndChemicalsCostTotalPerYear || 0;
        // Effluent: CostOfBoilerHouseEffluent,
        result.horizontalChartData[ProposedSetupChartElements['Effluent']].data[dataIndex] = dataObj.costOfBoilerHouseEffluent || 0;
        // Carbon Tax: CostOfCO2PerYear
        result.horizontalChartData[ProposedSetupChartElements['Carbon tax']].data[dataIndex] = dataObj.costOfCO2PerYear || 0;

        // Set Total data
        if (col.benchmark) {
          result.total.data.benchmark = col.benchmark;
        }
        if (col.overallImpactOnProposalsSelectedOnBoilerHouse) {
          result.total.data.proposal = col.overallImpactOnProposalsSelectedOnBoilerHouse;
        }
      }
    }

    // Total saving values
    if (result.total.data.benchmark && result.total.data.proposal) {
      const {benchmark, proposal} = result.total.data;

      const deltaCostOfFuelPerYear = Math.round(proposal.costOfFuelPerYear - benchmark.costOfFuelPerYear);
      const deltaWaterAndChemicalsCostTotalPerYear = Math.round(
        proposal.waterAndChemicalsCostTotalPerYear - benchmark.waterAndChemicalsCostTotalPerYear
      );
      const deltaCostOfBoilerHouseEffluent = Math.round(proposal.costOfBoilerHouseEffluent - benchmark.costOfBoilerHouseEffluent) || 0;
      const deltaMCondy = Math.round(proposal.mCondy - benchmark.mCondy) || 0;
      const deltaCostOfEffm3 = Math.round(proposal.costOfEffm3 - benchmark.costOfEffm3) || 0;
      const deltaCostOfCO2PerYear = Math.round(proposal.costOfCO2PerYear - benchmark.costOfCO2PerYear) || 0;

      result.total.steamGenerationSavings = Math.round(proposal.totalCostOfSteamPerYear - benchmark.totalCostOfSteamPerYear) || 0;
      result.total.savingsIncludingCondensateEffluent = deltaCostOfFuelPerYear +
        deltaWaterAndChemicalsCostTotalPerYear +
        deltaCostOfBoilerHouseEffluent +
        (deltaMCondy * deltaCostOfEffm3) +
        deltaCostOfCO2PerYear;
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
    if (this.form && this.form.setValue) { this.form.reset(); }
  }
  private validateProposalForm() {
    const form = this.form.get('proposedSetup') as FormGroup;

    if (form && form.controls) {
      for (const controlsKey in form.controls) {
        if (controlsKey && controlsKey !== 'economiserRequired') {
          const control = form.get(controlsKey);

          if (control) {
            control.valueChanges.pipe(
              takeUntil(this.ngUnsubscribe),
              tap(() => control.markAsPending({emitEvent: false})),
              switchMap((value) => {
                if (!value || value === 0) { return of({isValid: false, errors: [{errorMessage: 'REQUIRED_FIELD'}]}); }
                return this.apiService.proposalValidate(controlsKey as keyof ProposedSetupInterface, form.getRawValue());
              }),
              map(res => {
                if (!res || !res.hasOwnProperty('isValid') || res.isValid) { return null; }

                let error = 'Some Error';

                if (res.errors && Array.isArray(res.errors)) {
                  error = res.errors[0].errorMessage;
                }

                return {
                  error,
                  message: res.errors[0] &&
                    (res.errors[0].customState || res.errors[0].customState === 0) &&
                    `(${res.errors[0].customState})`
                };
              }),
            ).subscribe(
              (error) => control.setErrors(error),
              () => control.updateValueAndValidity({emitEvent: false})
            );
          }
        }
      }
    }
  }

  get isCondensateReturnDisable(): boolean {
    const fg: FormGroup = this.form.get('proposedSetup') as FormGroup;
    return fg.get('proposalCondensateReturnedPercentage').value === fg.get('benchmarkCondensateReturnedPercentage').value &&
      fg.get('benchmarkCondensateReturn').value === fg.get('proposalCondensateReturned').value;
  }

  ngOnInit() {
    this.validateProposalForm();
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.proposedFormPanel = false;
    this.generateProposed.emit(this.form.getRawValue());
  }

  economizerChange(economiserRequired) {
    const proposalBoilerEfficiencyControl = this.form.get('proposedSetup.proposalBoilerEfficiency');

    this.apiService.calculateProposedBoilerEfficiency({
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
