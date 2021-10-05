import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-results-filters',
  templateUrl: './results-filters.component.html',
  styleUrls: ['./results-filters.component.scss']
})
export class ResultsFiltersComponent implements OnInit {
  @Input() filtersForm: FormGroup;

  @Input() productOptions: Array<string> = [];
  @Input() flangeSpecificationOptions: Array<string> = [];
  @Input() materialOptions: Array<string> = [];
  @Input() orientationOptions: Array<string> = [];
  @Input() meterSizeOptions: Array<string> = [];

  constructor() { }

  ngOnInit() {
  }

}
