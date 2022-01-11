import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { ChartBarDataInterface } from "../modules/shared/interfaces/chart-bar.interface";
import { FormGroup } from "@angular/forms";
import { UnitsService } from "sizing-shared-lib";
import { BenchmarkDataInterface } from "../steam-generation-form.interface";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Component({
  selector: 'app-sga-benchmark',
  templateUrl: './sga-benchmark.component.html',
  styleUrls: ['./sga-benchmark.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SgaBenchmarkComponent implements OnInit {
  @Input() data: BenchmarkDataInterface;
  @Input() formGroup: FormGroup;
  @Input() chartData: ChartBarDataInterface[] = [
    { data: [272], label: 'Fuel' },
    { data: [30], label: 'Water and Chemicals' },
    { data: [10], label: 'Effluent' },
    { data: [46], label: 'Carbont tax' },
  ];

  public units$: Observable<{ [key: number]: string }> = this.unitsService.unitsChange
    .pipe(map((data) => data.reduce((obj, item) => ({...obj, [item.id]: item.units}), {})))

  constructor(private unitsService: UnitsService) {}

  ngOnInit() {}
}
