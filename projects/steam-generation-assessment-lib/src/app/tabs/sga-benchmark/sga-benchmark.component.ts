import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ChartBarDataInterface } from '../../interfaces/chart-bar.interface';
import { BenchmarkResBenchmarkInterface } from "../../interfaces/calc-benchmark-res.interface";
import { InputParametersTFormInterface, TForm } from "../../interfaces/forms.interface";
import { UnitsService } from 'sizing-shared-lib';
import { loadSgaUnits } from "../../utils/load-sga-units";

@Component({
  selector: 'app-sga-benchmark',
  templateUrl: './sga-benchmark.component.html',
  styleUrls: ['./sga-benchmark.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SgaBenchmarkComponent implements OnInit {
  @Input() data: BenchmarkResBenchmarkInterface;
  @Input() currency: string;
  @Input() formGroup: TForm<InputParametersTFormInterface>;
  @Input() chartData: ChartBarDataInterface[] = [
    { data: [0], label: 'Fuel' },
    { data: [0], label: 'Water and Chemicals' },
    { data: [0], label: 'Effluent' },
    { data: [0], label: 'Carbont tax' },
  ];

  units: { [key: number]: string };

  constructor(private unitsService: UnitsService) {}

  ngOnInit() {
    loadSgaUnits(this.unitsService).then(units => this.units = units);
  }
}
