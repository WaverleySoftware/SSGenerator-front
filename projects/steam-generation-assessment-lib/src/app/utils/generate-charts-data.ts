import { ChartBarDataInterface } from '../interfaces/chart-bar.interface';
import { horizontalChart, verticalChart } from './proposed-setup-def-data';
import { ProposedSetupChartElements, ProposedSetupChartIndex } from '../interfaces/steam-generation-form.interface';

export default (data: any[]): {
  verticalChartData: ChartBarDataInterface[]; horizontalChartData: ChartBarDataInterface[];
  total: { steamGenerationSavings: number, savingsIncludingCondensateEffluent: number, data?: {benchmark: any, proposal: any} }
} => {
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
};
