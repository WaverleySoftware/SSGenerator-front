import { Component, Input, OnInit } from "@angular/core";
import { ChartBarDataInterface } from "../modules/shared/interfaces/chart-bar.interface";

@Component({
  selector: 'app-sga-benchmark',
  templateUrl: './sga-benchmark.component.html',
  styleUrls: ['./sga-benchmark.component.scss']
})
export class SgaBenchmarkComponent implements OnInit {
  @Input() chartData: ChartBarDataInterface[] = [
    { data: [272], label: 'Fuel' },
    { data: [30], label: 'Water and Chemicals' },
    { data: [10], label: 'Effluent' },
    { data: [46], label: 'Carbont tax' },
  ];

  constructor() { }

  ngOnInit() {
  }
}
