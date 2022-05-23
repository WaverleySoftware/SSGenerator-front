import { Injectable } from "@angular/core";
import { SgaTotalSavingInterface } from "../interfaces/sga-chart-data.Interface";
import { ChartBarDataInterface } from "../interfaces/chart-bar.interface";
import { BenchmarkResBenchmarkInterface } from "../interfaces/calc-benchmark-res.interface";
import { ProposalCalculationItemInterface } from "../interfaces/proposal-calculation.interface";

@Injectable()
export class SgaChartService {
  constructor() {}

  generateBenchmark(data: BenchmarkResBenchmarkInterface): ChartBarDataInterface[] {
    if (!data) return [
      { data: [0], label: 'Fuel' },
      { data: [0], label: 'Water and chemicals' },
      { data: [0], label: 'Effluent' },
      { data: [0], label: 'Carbon Tax' },
    ];

    const {costOfFuelPerYear, waterAndChemicalsCostTotalPerYear, costOfBoilerHouseEffluent, costOfCO2PerYear} = data;

    return [
      { data: [costOfFuelPerYear || 0], label: 'Fuel' },
      { data: [waterAndChemicalsCostTotalPerYear || 0], label: 'Water and chemicals' },
      { data: [costOfBoilerHouseEffluent || 0], label: 'Effluent' },
      { data: [costOfCO2PerYear || 0], label: 'Carbon Tax' },
    ];
  }

  static generateChartFromArr(
    data: ProposalCalculationItemInterface[],
    keys: [string, string, string, string] = ['propFuelValueSavings', 'propWaterAndChemicalValueSavings', 'propEffluentValueSavings', 'propCO2emmissionsReducedValueSavings']
  ): ChartBarDataInterface[] {
    if (!data) return null;

    return data.reduce((acc, item) => {
      return [
        {...acc[0], data: [...acc[0].data, item[keys[0]] || 0]},
        {...acc[1], data: [...acc[1].data, item[keys[1]] || 0]},
        {...acc[2], data: [...acc[2].data, item[keys[2]] || 0]},
        {...acc[3], data: [...acc[3].data, item[keys[3]] || 0]},
      ]
    }, [
      { data: [], label: 'Fuel' },
      { data: [], label: 'Water and Chemicals' },
      { data: [], label: 'Effluent' },
      { data: [], label: 'Carbon tax' },
    ])
  }

  static getTotalProposalChart(current: BenchmarkResBenchmarkInterface, proposal: BenchmarkResBenchmarkInterface): SgaTotalSavingInterface {
    if (!current || !proposal) return {steamGenerationSavings: 0};

    const deltaCostOfFuelPerYear = Math.round(proposal.costOfFuelPerYear - current.costOfFuelPerYear);
    const deltaWaterAndChemicalsCostTotalPerYear = Math.round(
      proposal.waterAndChemicalsCostTotalPerYear - current.waterAndChemicalsCostTotalPerYear
    );
    const deltaCostOfBoilerHouseEffluent = Math.round(proposal.costOfBoilerHouseEffluent - current.costOfBoilerHouseEffluent) || 0;
    const deltaMCondy = Math.round(proposal.mCondy - current.mCondy) || 0;
    const deltaCostOfEffm3 = Math.round(proposal.costOfEffm3 - current.costOfEffm3) || 0;
    const deltaCostOfCO2PerYear = Math.round(proposal.costOfCO2PerYear - current.costOfCO2PerYear) || 0;

    return {
      steamGenerationSavings: deltaCostOfFuelPerYear +
        deltaWaterAndChemicalsCostTotalPerYear + deltaCostOfBoilerHouseEffluent +
        (deltaMCondy * deltaCostOfEffm3) + deltaCostOfCO2PerYear
    }
  }
}
