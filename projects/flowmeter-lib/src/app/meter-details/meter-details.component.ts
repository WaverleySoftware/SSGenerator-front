import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-meter-details',
  templateUrl: './meter-details.component.html',
  styleUrls: ['./meter-details.component.scss']
})
export class MeterDetailsComponent {
  @Input() form: FormGroup;
  @Input() moduleGroupId: number;
  @Input() moduleName: string;
}
