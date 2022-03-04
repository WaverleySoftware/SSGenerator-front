import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ChartBarDataInterface } from '../../interfaces/chart-bar.interface';
import { BenchmarkResBenchmarkInterface } from "../../interfaces/calc-benchmark-res.interface";
import { InputParametersTFormInterface, TForm } from "../../interfaces/forms.interface";

@Component({
  selector: 'app-sga-benchmark',
  templateUrl: './sga-benchmark.component.html',
  styleUrls: ['./sga-benchmark.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SgaBenchmarkComponent implements OnInit {
  @Input() data: BenchmarkResBenchmarkInterface;
  @Input() units: { [key: number]: string };
  @Input() currency: string;
  @Input() formGroup: TForm<InputParametersTFormInterface>;
  @Input() chartData: ChartBarDataInterface[] = [
    { data: [0], label: 'Fuel' },
    { data: [0], label: 'Water and Chemicals' },
    { data: [0], label: 'Effluent' },
    { data: [0], label: 'Carbont tax' },
  ];

  constructor() {}

  ngOnInit() {}
}
