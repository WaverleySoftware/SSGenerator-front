import { Component, Input, OnInit } from "@angular/core";
import { ChartBarDataInterface } from '../../interfaces/chart-bar.interface';
import { horizontalChart, verticalChart, verticalChartLabels } from '../../utils/proposed-setup-def-data';
import { BenchmarkResBenchmarkInterface } from "../../interfaces/calc-benchmark-res.interface";
import { TranslationService, Enumeration } from "sizing-shared-lib";
import { InputParametersTFormInterface, TForm } from "../../interfaces/forms.interface";
import { SelectedUnitsInterface } from "../../interfaces/selectedUnits.interface";

@Component({
  selector: 'app-sga-final-proposal',
  templateUrl: './sga-final-proposal.component.html',
  styleUrls: ['./sga-final-proposal.component.scss']
})
export class SgaFinalProposalComponent implements OnInit {
  @Input() current: Partial<BenchmarkResBenchmarkInterface>; // Benchmark
  @Input() potential: Partial<BenchmarkResBenchmarkInterface>; // Overall...
  @Input() formGroup: TForm<InputParametersTFormInterface>;
  @Input() currency: string;
  @Input() verticalChart: ChartBarDataInterface[] = verticalChart;
  @Input() horizontalChart: ChartBarDataInterface[] = horizontalChart;
  @Input() units: { [key: number]: string };
  chartLabels: string[] = verticalChartLabels;
  get fuelTypeList() {
    if (this.translationService.displayGroup && this.translationService.displayGroup.enumerations) {
      const enumeration: Enumeration = this.translationService.displayGroup.enumerations
        .find(({enumerationName, opCoOverride}) => enumerationName === "FuelTypeList_BoilerHouseInput" && !opCoOverride);
      return enumeration && enumeration.enumerationDefinitions &&
        enumeration.enumerationDefinitions.reduce((acc, {masterTextKey, id}) => ({...acc, [id]: masterTextKey}), {});
    }
    return null;
  }

  constructor(protected translationService: TranslationService) {}

  get selectedUnits(): SelectedUnitsInterface {
    return this.formGroup.get('selectedUnits') && this.formGroup.get('selectedUnits').value;
  }

  ngOnInit() {}

  savingPercent(current: number, potential: number): number {
    if (!current || !potential) {
      return 0;
    }

    return (current - potential) / current * 100
  }
}
