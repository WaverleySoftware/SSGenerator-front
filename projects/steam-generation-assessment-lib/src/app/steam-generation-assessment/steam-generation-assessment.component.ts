import { Component, OnInit } from '@angular/core';
import { BaseSizingModule } from "sizing-shared-lib";

@Component({
  selector: 'app-steam-generation-assessment',
  templateUrl: './steam-generation-assessment.component.html',
  styleUrls: ['./steam-generation-assessment.component.scss']
})
export class SteamGenerationAssessmentComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
    console.log('%c ----- ON INIT "SteamGenerationAssessment" MODULE ------', 'background: #222; color: #bada55; font-size: 16px;');
  }

}
