import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ChartBarDataInterface } from '../../interfaces/chart-bar.interface';
import { BenchmarkDataInterface } from '../../interfaces/steam-generation-form.interface';

@Component({
  selector: 'app-sga-benchmark',
  templateUrl: './sga-benchmark.component.html',
  styleUrls: ['./sga-benchmark.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SgaBenchmarkComponent implements OnInit {
  @Input() data: BenchmarkDataInterface;
  @Input() units: { [key: number]: string };
  @Input() currency: string;
  @Input() formGroup: FormGroup;
  @Input() chartData: ChartBarDataInterface[] = [
    { data: [272], label: 'Fuel' },
    { data: [30], label: 'Water and Chemicals' },
    { data: [10], label: 'Effluent' },
    { data: [46], label: 'Carbont tax' },
  ];

  constructor() {}

  ngOnInit() {}
}
