import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-results-ancillaries',
  templateUrl: './results-ancillaries.component.html',
  styleUrls: ['./results-ancillaries.component.scss']
})
export class ResultsAncillariesComponent implements OnInit {
  @Input() ancillariesForm: FormGroup;

  constructor() { }

  ngOnInit() {
  }

}
