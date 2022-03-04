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
  @Input() currency: string;
  @Input() units: { [key: number]: string };
  @Input() verticalChart: ChartBarDataInterface[] = verticalChart;
  @Input() horizontalChart: ChartBarDataInterface[] = horizontalChart;

  chartLabels: string[] = verticalChartLabels;

  constructor() { }
}
