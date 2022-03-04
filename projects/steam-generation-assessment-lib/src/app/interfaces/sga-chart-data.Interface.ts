import { ChartBarDataInterface } from "./chart-bar.interface";

export interface SgaChartDataInterface {
  vertical: ChartBarDataInterface[];
  horizontal: ChartBarDataInterface[];
  total: SgaTotalSavingInterface
}

export interface SgaTotalSavingInterface {
  steamGenerationSavings: number,
  savingsIncludingCondensateEffluent: number,
}
