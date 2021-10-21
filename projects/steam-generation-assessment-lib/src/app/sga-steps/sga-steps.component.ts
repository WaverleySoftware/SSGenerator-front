import { Component, Input, OnInit } from "@angular/core";

interface StepInterface {
  label: string;
  id?: string | number;
  active?: boolean;
  index?: number;
}

@Component({
  selector: 'sga-steps',
  templateUrl: './sga-steps.component.html',
  styleUrls: ['./sga-steps.component.scss']
})
export class SgaStepsComponent implements OnInit {
  private _steps: StepInterface[] | string[];
  get steps(): StepInterface[] | string[] {
    return this._steps;
  }
  @Input() set steps(steps) {
    this._steps = steps.sort((a, b) => a.index - b.index);
  }
  constructor() { }

  ngOnInit() {
  }

}
