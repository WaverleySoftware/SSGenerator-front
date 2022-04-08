import { Component, OnInit } from "@angular/core";
import { IGenericChanges } from "../../../modules/generic.changes.interface";
import { FormGroup } from "@angular/forms";

@Component({
  selector: 'steamGenerationAssessment-module-preferences',
  templateUrl: './steamGenerationAssessment.component.html',
  styleUrls: ['./steamGenerationAssessment.component.scss'],
})

export class SteamGenerationAssessmentModulePreferencesComponent implements OnInit, IGenericChanges {
  readonly moduleId: string = "2";
  readonly moduleGroupId: number = 9;
  readonly moduleName: string = "Steam Generation Assessment";


  constructor() {
  }

  ngOnInit() {
  }

  hasUnsavedDataChanges: boolean;
  theFormGroup: FormGroup;
}
