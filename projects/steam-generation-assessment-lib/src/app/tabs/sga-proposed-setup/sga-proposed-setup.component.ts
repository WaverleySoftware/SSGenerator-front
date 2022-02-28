import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ChartBarDataInterface } from '../../interfaces/chart-bar.interface';
import {
  ProposedDataInterface,
  ProposedSetupChartElements,
  ProposedSetupChartIndex,
  SteamGeneratorInputsInterface
} from '../../interfaces/steam-generation-form.interface';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SgaApiService } from '../../services/sga-api.service';
import { SgaFormService } from '../../services/sga-form.service';
import { horizontalChart, verticalChart, verticalChartLabels } from '../../utils/proposed-setup-def-data';

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
  @Input() set results(data: any[]) {
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
  @Input() set data(data: ProposedDataInterface) {
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
  public verticalChartData: ChartBarDataInterface[] = verticalChart;
  public horizontalChartData: ChartBarDataInterface[] = horizontalChart;
  public verticalChartLabels: string[] = verticalChartLabels;
  public proposedFormPanel = true;
  public form = this.formService.getProposedSetupForm();
  public totalSaving: {steamGenerationSavings: number, savingsIncludingCondensateEffluent: number};

  constructor(private apiService: SgaApiService, private formService: SgaFormService) {}

  private static generateChartsData(data: any[]): {
    verticalChartData: ChartBarDataInterface[]; horizontalChartData: ChartBarDataInterface[];
    total: { steamGenerationSavings: number, savingsIncludingCondensateEffluent: number, data?: {benchmark: any, proposal: any} }
  } {
    const result: {
      verticalChartData: ChartBarDataInterface[];
      horizontalChartData: ChartBarDataInterface[];
      total: { steamGenerationSavings: number, savingsIncludingCondensateEffluent: number, data?: {benchmark: any, proposal: any} }
    } = {
      verticalChartData: verticalChart,
      horizontalChartData: horizontalChart,
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
    this.verticalChartData = verticalChart;
    this.horizontalChartData = horizontalChart;
    if (this.form && this.form.setValue) { this.form.reset(); }
  }

  get isCondensateReturnDisable(): boolean {
    const fg: FormGroup = this.form.get('proposedSetup') as FormGroup;
    return fg.get('proposalCondensateReturnedPercentage').value === fg.get('benchmarkCondensateReturnedPercentage').value &&
      fg.get('benchmarkCondensateReturn').value === fg.get('proposalCondensateReturned').value;
  }

  ngOnInit() {}

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.proposedFormPanel = false;
    this.form.get('proposedSetup').markAsUntouched();
    this.form.get('proposedSetup').markAsPristine();
    this.generateProposed.emit(this.form.getRawValue());
  }

  economizerChange(economiserRequired) {
    const proposal = this.form.get('proposedSetup.proposalBoilerEfficiency');
    const current = this.form.get('proposedSetup.benchmarkBoilerEfficiency');
    const params = {
      economiserRequired,
      benchmarkBoilerEfficiency: current.value || 0,
      proposalBoilerEfficiency: proposal.value || 0,
    };

    if (proposal.invalid) {
      params.proposalBoilerEfficiency = this.data.proposedSetup.proposalBoilerEfficiency;

      if (!economiserRequired) {
        proposal.markAsUntouched();
        proposal.markAsPristine();
        proposal.patchValue(params.proposalBoilerEfficiency, {emitEvent: false});
        return;
      }
    }

    this.apiService.calculateProposedBoilerEfficiency(params)
      .pipe(takeUntil(this.ngUnsubscribe), filter((res) => !!res && !!res.proposalBoilerEfficiency))
      .subscribe(({proposalBoilerEfficiency}) => {
        proposal.markAsUntouched();
        proposal.markAsPristine();
        proposal.patchValue(proposalBoilerEfficiency, {emitEvent: false});
      });
  }

  changeFeature(changed?: Event) {
    this.form.get('proposedSetup').markAsUntouched();
    this.form.get('proposedSetup').markAsPristine();
    this.generateProposed.emit(this.form.getRawValue());
  }
}
