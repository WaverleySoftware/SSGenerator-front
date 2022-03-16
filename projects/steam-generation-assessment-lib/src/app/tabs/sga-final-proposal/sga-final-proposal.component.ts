import { Component, Input } from '@angular/core';
import { ChartBarDataInterface } from '../../interfaces/chart-bar.interface';
import { horizontalChart, verticalChart, verticalChartLabels } from '../../utils/proposed-setup-def-data';
import { loadSgaUnits } from "../../utils/load-sga-units";
import { UnitsService } from "sizing-shared-lib";

@Component({
  selector: 'app-sga-final-proposal',
  templateUrl: './sga-final-proposal.component.html',
  styleUrls: ['./sga-final-proposal.component.scss']
})
export class SgaFinalProposalComponent {
  @Input() currency: string;
  @Input() verticalChart: ChartBarDataInterface[] = verticalChart;
  @Input() horizontalChart: ChartBarDataInterface[] = horizontalChart;

	units: { [key: number]: string };
  chartLabels: string[] = verticalChartLabels;

  constructor(private unitsService: UnitsService) {
	  loadSgaUnits(this.unitsService).then(units => this.units = units);
  }
}
