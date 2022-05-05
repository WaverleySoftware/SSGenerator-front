import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ChartBarDataInterface } from '../../interfaces/chart-bar.interface';
import { BenchmarkResBenchmarkViewInterface } from "../../interfaces/calc-benchmark-res.interface";
import { InputParametersTFormInterface, TForm } from "../../interfaces/forms.interface";
import { SelectedUnitsInterface } from "../../interfaces/selectedUnits.interface";

@Component({
  selector: 'app-sga-benchmark',
  templateUrl: './sga-benchmark.component.html',
  styleUrls: ['./sga-benchmark.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SgaBenchmarkComponent {
  @Input() data: BenchmarkResBenchmarkViewInterface;
  @Input() currency: string;
  @Input() formGroup: TForm<InputParametersTFormInterface>;
  @Input() chartData: ChartBarDataInterface[];
  @Input() units: { [key: number]: string };

  constructor() {}

  get selectedUnits(): SelectedUnitsInterface {
    return this.formGroup.get('selectedUnits').value;
  }
}
