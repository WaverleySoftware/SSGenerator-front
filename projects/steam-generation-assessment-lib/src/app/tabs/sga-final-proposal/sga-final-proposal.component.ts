import { Component, Input, OnInit } from "@angular/core";
import { ChartBarDataInterface } from '../../interfaces/chart-bar.interface';
import { horizontalChart, verticalChart, verticalChartLabels } from '../../utils/proposed-setup-def-data';
import { BenchmarkResBenchmarkInterface } from "../../interfaces/calc-benchmark-res.interface";
import { TranslationService, Enumeration } from "sizing-shared-lib";

@Component({
  selector: 'app-sga-final-proposal',
  templateUrl: './sga-final-proposal.component.html',
  styleUrls: ['./sga-final-proposal.component.scss']
})
export class SgaFinalProposalComponent implements OnInit {
  @Input() current: Partial<BenchmarkResBenchmarkInterface>; // Benchmark
  @Input() potential: Partial<BenchmarkResBenchmarkInterface>; // Overall...
  @Input() currency: string;
  @Input() verticalChart: ChartBarDataInterface[] = verticalChart;
  @Input() horizontalChart: ChartBarDataInterface[] = horizontalChart;
  @Input() units: { [key: number]: string };
  chartLabels: string[] = verticalChartLabels;
  get fuelTypeList() {
    if (this.translationService.displayGroup && this.translationService.displayGroup.enumerations) {
      const enumeration: Enumeration = this.translationService.displayGroup.enumerations
        .find(({enumerationName}) => enumerationName === "FuelTypeList_BoilerHouseInput");
      return enumeration && enumeration.enumerationDefinitions &&
        enumeration.enumerationDefinitions.reduce((acc, {masterTextKey, id}) => ({...acc, [id]: masterTextKey}), {});
    }
    return null;
  }

  constructor(protected translationService: TranslationService) {}

  ngOnInit() {}

  savingPercent(current: number, potential: number): number {
    if (!current || !potential) {
      return 0;
    }

    return (current - potential) / current * 100
  }
}
