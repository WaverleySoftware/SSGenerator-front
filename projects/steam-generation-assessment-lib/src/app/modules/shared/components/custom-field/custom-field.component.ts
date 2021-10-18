import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

interface SSelectOptionInterface {
  value: any;
  index?: number;
  text?: string | number;
  title?: string;
}

interface RadioInputDataInterface {
  value: string;
  name: string;
  unit?: string;
  label?: string;
  statusLine?: boolean,
  type?: string;
  disabled?: boolean;
}

@Component({
  selector: 'custom-field',
  templateUrl: './custom-field.component.html',
  styleUrls: ['./custom-field.component.scss']
})
export class CustomFieldComponent implements OnInit {
  @Input() className: string;
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'yesNo' | 'radioInput' | 'test' | 'select' = 'text';
  @Input() radioInputType: string = 'text';
  @Input() unit: string;
  @Input() label: string;
  @Input() name: string;
  @Input() placeholder: string;
  @Input() required: boolean;
  @Input() disabled: boolean;
  @Input() checkMark: boolean = true;
  @Input() statusLine: boolean;
  @Input() options: SSelectOptionInterface[];
  @Input() radioInputData: RadioInputDataInterface[];

  @Input() model: any;
  @Output() modelChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() onChange: EventEmitter<Event> = new EventEmitter<Event>();
  @Input() onKeydown: EventEmitter<Event> = new EventEmitter<Event>();
  @Input() onKeypress: EventEmitter<Event> = new EventEmitter<Event>();
  @Input() onKeyup: EventEmitter<Event> = new EventEmitter<Event>();
  @Input() onFocus: EventEmitter<Event> = new EventEmitter<Event>();
  @Input() onFocusOut: EventEmitter<Event> = new EventEmitter<Event>();

  public radioInputModel: any;
  constructor() { }

  ngOnInit() {
  }

  public sortArrayByIndex(options: SSelectOptionInterface[]): SSelectOptionInterface[] {
    if (!options || !options.length) return [];

    return options
      .map(({ value, text, index, title }) => {
        const result: SSelectOptionInterface = { value, text, index, title };
        if (!text)  result.text = value;
        return result;
      })
      .sort((a, b, ) => a.index - b.index);
  }
}
