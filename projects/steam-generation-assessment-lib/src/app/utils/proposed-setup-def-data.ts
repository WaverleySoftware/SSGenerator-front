import { ChartBarDataInterface } from '../interfaces/chart-bar.interface';
import { ProposedSetupChartLabels } from '../interfaces/steam-generation-form.interface';

const verticalChart: ChartBarDataInterface[] = [
  { data: [0, 0, 0, 0, 0, 0, 0], label: 'Fuel' },
  { data: [0, 0, 0, 0, 0, 0, 0], label: 'Water and Chemicals' },
  { data: [0, 0, 0, 0, 0, 0, 0], label: 'Effluent' },
  { data: [0, 0, 0, 0, 0, 0, 0], label: 'Carbon tax' },
];

const horizontalChart: ChartBarDataInterface[] = [
  { data: [0, 0], label: 'Fuel' },
  { data: [0, 0], label: 'Water and Chemicals' },
  { data: [0, 0], label: 'Effluent' },
  { data: [0, 0], label: 'Carbont tax' },
];

const verticalChartLabels: string[] = [
  ProposedSetupChartLabels.improvedBoilerEfficiency,
  ProposedSetupChartLabels.condensateReturnPlusCondensateTemperature,
  ProposedSetupChartLabels.changingWaterTreatment,
  ProposedSetupChartLabels.addingAutomaticTdsControl,
  ProposedSetupChartLabels.addingFlashHeatRecoveryToAutoTdsControl,
  ProposedSetupChartLabels.addingHeatExchangerToHeatRecoveryToTdsBlowdown,
  ProposedSetupChartLabels.effectOfDsiOnHotwell,
];


export {
  verticalChart,
  horizontalChart,
  verticalChartLabels
};
