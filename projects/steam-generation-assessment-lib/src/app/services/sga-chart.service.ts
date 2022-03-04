import { Injectable } from "@angular/core";
import { horizontalChart, verticalChart } from "../utils/proposed-setup-def-data";
import { ProposedSetupChartElements, ProposedSetupChartIndex } from "../interfaces/steam-generation-form.interface";
import { SgaChartDataInterface, SgaTotalSavingInterface } from "../interfaces/sga-chart-data.Interface";
import { ChartBarDataInterface } from "../interfaces/chart-bar.interface";
import { BenchmarkResBenchmarkInterface } from "../interfaces/calc-benchmark-res.interface";

@Injectable()
export class SgaChartService {
  private proposal: {[key: string]: Partial<SgaChartDataInterface>} = {};
  private benchmark: {[key: string]: ChartBarDataInterface[]} = {};
  static readonly defChartData: SgaChartDataInterface = {
    horizontal: horizontalChart,
    vertical: verticalChart,
    total: {
      steamGenerationSavings: 0,
      savingsIncludingCondensateEffluent: 0,
    }
  };

  constructor() {}

  generateBenchmark(data: BenchmarkResBenchmarkInterface, name: string): ChartBarDataInterface[] {
    if (!data) {
      return this.benchmark[name] = [
        { data: [0], label: 'Fuel' },
        { data: [0], label: 'Water and chemicals' },
        { data: [0], label: 'Effluent' },
        { data: [0], label: 'Carbon Tax' },
      ];
    }

    const {
      costOfFuelPerYear = 0,
      waterAndChemicalsCostTotalPerYear = 0,
      costOfBoilerHouseEffluent = 0,
      costOfCO2PerYear = 0
    } = data;

    this.benchmark[name] = [
      { data: [costOfFuelPerYear], label: 'Fuel' },
      { data: [waterAndChemicalsCostTotalPerYear], label: 'Water and chemicals' },
      { data: [costOfBoilerHouseEffluent], label: 'Effluent' },
      { data: [costOfCO2PerYear], label: 'Carbon Tax' },
    ];

    return this.benchmark[name];
  }

  generateProposal(
    data: any[],
    name: string = 'defaultName',
    generateOnly?: keyof SgaChartDataInterface | Array<keyof SgaChartDataInterface>,
  ): Partial<SgaChartDataInterface> {
    const result: Partial<SgaChartDataInterface> = {} as Partial<SgaChartDataInterface>;

    if (!data || !data.length) { return result; }

    for (const col of data) {
      if (!generateOnly || generateOnly === 'vertical' || generateOnly.includes('vertical')) {
        result.vertical = SgaChartService.generateVertical(col, result.vertical);
      }

      if (!generateOnly || generateOnly === 'horizontal' || generateOnly.includes('horizontal')) {
        result.horizontal = SgaChartService.generateHorizontalAndTotal(col, result.horizontal);
      }
    }

    if (!generateOnly || generateOnly === 'total' || generateOnly.includes('total')) {
      result.total = SgaChartService.generateTotal(data);
    }

    // Set results
    this.proposal[name] = result;

    return this.proposal[name];
  };

  getProposalByName(name: string = 'defaultName'): Partial<SgaChartDataInterface> {
    if (!this.proposal || !this.proposal[name]) {
      return null;
    }

    return this.proposal[name];
  }

  getBenchmarkByName(name: string = 'defaultName'): ChartBarDataInterface[] {
    if (!this.benchmark || !this.benchmark[name]) {
      return null;
    }

    return this.benchmark[name];
  }

  private static generateVertical(col, chartData: ChartBarDataInterface[] = verticalChart): ChartBarDataInterface[] {
    const key = Object.keys(col)[0];

    if (key && (ProposedSetupChartIndex[key] || ProposedSetupChartIndex[key] === 0)) {
      // Fuel
      chartData[ProposedSetupChartElements['Fuel']].data[ProposedSetupChartIndex[key]] = col[key].propFuelValueSavings || 0;
      // Water and Chemicals
      chartData[ProposedSetupChartElements['Water and Chemicals']].data[ProposedSetupChartIndex[key]] = col[key].propWaterAndChemicalValueSavings || 0;
      // Effluent
      chartData[ProposedSetupChartElements['Effluent']].data[ProposedSetupChartIndex[key]] = col[key].propEffluentValueSavings || 0;
      // Carbon tax
      chartData[ProposedSetupChartElements['Carbon tax']].data[ProposedSetupChartIndex[key]] = col[key].propCO2emmissionsReducedValueSavings || 0;
    }

    return chartData;
  }

  private static generateHorizontalAndTotal(col, horizontal: ChartBarDataInterface[] = horizontalChart): ChartBarDataInterface[] {
    if (col.benchmark || col.overallImpactOnProposalsSelectedOnBoilerHouse) {
      const dataObj = col.benchmark || col.overallImpactOnProposalsSelectedOnBoilerHouse;
      const dataIndex = col.benchmark ? 0 : 1;

      // Fuel: CostOfFuelPerYear,
      horizontal[ProposedSetupChartElements['Fuel']].data[dataIndex] = dataObj.costOfFuelPerYear || 0;
      // Water chemicals: WaterAndChemicalsCostTotalPerYear,
      horizontal[ProposedSetupChartElements['Water and Chemicals']].data[dataIndex] = dataObj.waterAndChemicalsCostTotalPerYear || 0;
      // Effluent: CostOfBoilerHouseEffluent,
      horizontal[ProposedSetupChartElements['Effluent']].data[dataIndex] = dataObj.costOfBoilerHouseEffluent || 0;
      // Carbon Tax: CostOfCO2PerYear
      horizontal[ProposedSetupChartElements['Carbon tax']].data[dataIndex] = dataObj.costOfCO2PerYear || 0;
    }

    return horizontal
  }

  private static generateTotal(data: any[]): SgaTotalSavingInterface {
    const [one, two] = data.filter(v => v.benchmark || v.overallImpactOnProposalsSelectedOnBoilerHouse);
    const benchmark = one.benchmark || two.benchmark;
    const proposal = one.overallImpactOnProposalsSelectedOnBoilerHouse || two.overallImpactOnProposalsSelectedOnBoilerHouse;

    if (benchmark && proposal) {
      const deltaCostOfFuelPerYear = Math.round(proposal.costOfFuelPerYear - benchmark.costOfFuelPerYear);
      const deltaWaterAndChemicalsCostTotalPerYear = Math.round(
        proposal.waterAndChemicalsCostTotalPerYear - benchmark.waterAndChemicalsCostTotalPerYear
      );
      const deltaCostOfBoilerHouseEffluent = Math.round(proposal.costOfBoilerHouseEffluent - benchmark.costOfBoilerHouseEffluent) || 0;
      const deltaMCondy = Math.round(proposal.mCondy - benchmark.mCondy) || 0;
      const deltaCostOfEffm3 = Math.round(proposal.costOfEffm3 - benchmark.costOfEffm3) || 0;
      const deltaCostOfCO2PerYear = Math.round(proposal.costOfCO2PerYear - benchmark.costOfCO2PerYear) || 0;

      return {
        steamGenerationSavings: Math.round(proposal.totalCostOfSteamPerYear - benchmark.totalCostOfSteamPerYear) || 0,
        savingsIncludingCondensateEffluent: deltaCostOfFuelPerYear +
          deltaWaterAndChemicalsCostTotalPerYear + deltaCostOfBoilerHouseEffluent +
          (deltaMCondy * deltaCostOfEffm3) + deltaCostOfCO2PerYear
      }
    }

    return {steamGenerationSavings: 0, savingsIncludingCondensateEffluent: 0};
  }
}
