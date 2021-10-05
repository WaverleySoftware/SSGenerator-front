import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import {FormGroup} from '@angular/forms';
import { DesignationModel } from '../models/designation.model';
import { NominalSizeModel } from '../models/nominal-size.model';

@Component({
  selector: 'app-pipe-selection',
  templateUrl: './pipe-selection.component.html',
  styleUrls: ['./pipe-selection.component.scss']
})
export class PipeSelectionComponent {
  @Input() form: FormGroup;
  @Input() moduleGroupId: number;
  @Input() designationOptions: DesignationModel[];
  @Input() nominalSizeOptions: NominalSizeModel[];
  @Input() velocity: number | undefined = undefined;
  @Output() pipeStandardDropdownInitialized: EventEmitter<{
    selectedValue: string;
    itemsCount: number;
  }> = new EventEmitter<{ selectedValue: string; itemsCount: number; }>();
}
