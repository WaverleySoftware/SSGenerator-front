import { Component, Input } from '@angular/core';
import { ChartBarDataInterface } from '../../interfaces/chart-bar.interface';
import { horizontalChart, verticalChart, verticalChartLabels } from '../../utils/proposed-setup-def-data';
import generateChartsData from '../../utils/generate-charts-data';

@Component({
  selector: 'app-sga-final-proposal',
  templateUrl: './sga-final-proposal.component.html',
  styleUrls: ['./sga-final-proposal.component.scss']
})
export class SgaFinalProposalComponent {
  @Input() set data(v: any[]) {
    if (v && v.length) {
      const { verticalChartData, horizontalChartData, total } = generateChartsData(v);
      this.verticalChartData = verticalChartData;
      this.horizontalChartData = horizontalChartData;
    }
  }
  verticalChartData: ChartBarDataInterface[] = verticalChart;
  horizontalChartData: ChartBarDataInterface[] = horizontalChart;
  chartLabels: string[] = verticalChartLabels;

  constructor() { }
}
