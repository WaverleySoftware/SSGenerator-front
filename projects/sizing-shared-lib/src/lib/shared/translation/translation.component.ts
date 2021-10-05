import { Component, OnInit, ViewChild} from '@angular/core';

import { TranslationService } from "./translation.service";
import { TranslatePipe } from "./translate.pipe";

import { DisplayGroup, Translation, Enumeration } from "./translation.model";
import { DatatableComponent } from '@swimlane/ngx-datatable';

import * as cloneDeep_ from 'lodash/cloneDeep';
import { UserProfileService } from "../../modules/user-profile/user-profile.service";
import { AdminService } from "../../modules/admin/admin.service";
import { Language } from "../../modules/admin/language.model";
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';

const swal: SweetAlert = _swal as any;

@Component({
  selector: 'app-translation',
  templateUrl: './translation.component.html',
  styleUrls: ['./translation.component.scss']
})
export class TranslationComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) table: DatatableComponent;
  @ViewChild('translationsTable', { static: false }) tableExp: any;

  public parentSubmitIsDisabled = true; // Modal parent container component submit button state (enabled/disabled)
  public cloneDeep = cloneDeep_;
  displayGroup: DisplayGroup; // The active display group on the content page
  
  rows: Translation[] = []; // Display Data in the UI grid/table (filtered/sorted)
  rowsEnum: Enumeration[] = []; // Initial Enumeration translations collection
  rowsBackingData: Translation[] = []; // Current state of all the backing data rows for the UI, latest changes.
  editing = {}; // Edited row indexe, forced to only 1 at a time.

  timeout: any;
  selected = [];
  changedTranslations: Translation[] = [];
  changedEnumerationTranslations: Translation[] = [];

  transForm: FormGroup;
  languageIsoNameControl: FormControl;
  languageName: string = "-";
  languages: Language[];
  userLanguageIsoName: string;
  
  constructor(private translationService: TranslationService, public translatePipe: TranslatePipe, private userProfileService: UserProfileService, private adminService: AdminService, private fb: FormBuilder) {
  }
  
    fetchTranslations(cb) {
      cb(JSON.parse(JSON.stringify(this.displayGroup.translations)));
    }
    fetchEnumerations(cb) {
      cb(JSON.parse(JSON.stringify(this.displayGroup.enumerations)));

      this.languageIsoNameControl = new FormControl('');

      this.transForm = this.fb.group({
        languageIsoName: this.languageIsoNameControl
    });
  }

  /**
   * Get the Active Display Gropup Translations, the translation changes for the LAYOUT display group or for a regular display group?
   */
  getActiveDisplayGropup(): DisplayGroup {
      
    return (this.translationService.displayGroup.name === "LAYOUT") ? this.translationService.layoutDisplayGroup : this.translationService.displayGroup; // loaded displayGroup.
  }

  /**
   * Support this method is you require Modal Submit button state handling. ie. disable the submit button if any validation errors exist.
   */
  public checkIfSubmitIsDisabled(): boolean {
    return this.parentSubmitIsDisabled;
  }


  ngOnInit() {
    this.displayGroup = this.getActiveDisplayGropup();

    this.fetchEnumerations((data) => {
      // cache translation data
      this.rowsEnum = this.cloneDeep(data);
    });

    this.fetchTranslations((data) => {
      // cache translation data
      this.rowsBackingData = this.cloneDeep(data);
      this.rows = this.cloneDeep(data);

      // Include all the Enumeration Definitions (list items)
      for (var enumeration of this.rowsEnum) {
        for (var edef of enumeration.enumerationDefinitions) {

          // Avoid adding the duplicate MasterTextKeys (label translations may also occur in the Enumeration Definitions).
          if (!this.rows.find(t => t.masterTextKey === edef.masterTextKey)) {

            let edefTranslation: Translation = new Translation;
            edefTranslation.masterTextKey = edef.masterTextKey;
            edefTranslation.defaultText = edef.defaultText;
            edefTranslation.translationText = edef.translationText;
            edefTranslation.textTypeId = 0; // Enum ToDo: Can/should we drive this more correctly that hard coded?

            this.rows.push(JSON.parse(JSON.stringify(edefTranslation)));
            this.rowsBackingData.push(JSON.parse(JSON.stringify(edefTranslation)));
          }
        }
      }
    });

    // Get the target language name
    this.adminService.getLanguages().subscribe((languages: Language[]) => {
      if (!!languages) {
        this.languages = languages;
        this.userProfileService.getUserDetails().subscribe(user => {
          if (!!user) {
            var userLanguage = languages.find(l => user.languageIsoName === l.isoName);
            this.languageName = userLanguage.masterTextKey;

            // Disable translation editing and submit button on modal for English translastions, as it is the master/system language text already.
            if (this.languageName === 'LANGUAGE_ENGLISH_UK') {
              this.parentSubmitIsDisabled = true;

              // Simple popup message box
              swal('Information', 'Translations for English (en-gb) cannot be edited as they are the default system text.', 'warning');           
            }
          } 
        });
      }
    });
  }

  /**
     * Callback function that is dynamically called by a modal popup when "Save/Submit/Ok" is clicked.
     */
  modalSubmitCallback(): void {
    
    if (this.changedTranslations.length <= 0) {
      // nothing to do
      console.info(`Translation submit - There where no translation changes to save.`);
      return;
    }

    let displayGroup = new DisplayGroup();
    displayGroup.languageId = this.translationService.displayGroup.languageId;
    displayGroup.translations = this.changedTranslations;
    
    console.info(`Saving translation changes....`);
    this.translationService.manageTranslationTexts(displayGroup).subscribe((response: boolean) => {});


    console.info(`Updating UI with translations changes....`);
    // Translation changes for the LAYOUT display group or regular display group?
    var displayGroupUI = this.getActiveDisplayGropup();

    // Update UI with changes:
    // For each translation change, search the UI display groups for masterKeys and update translationTexts
    // both Translations array and Enumerations->Definitions arrays.
    for (var change of this.changedTranslations) {

      // Set newTRanslationText to defaultText if string is empty. Empty Translations are removed from the database, thus reverts to default Text.
      let newTRanslationText: string = change.translationText.length > 0 ? change.translationText : change.defaultText;

      // Apply changes to the current Active Display Group (page), DisplayGroup and Layout Group
      // UI regular Translations
      if (!!displayGroupUI.translations.find(t => t.masterTextKey === change.masterTextKey)) {
        displayGroupUI.translations.find(t => t.masterTextKey === change.masterTextKey).translationText = newTRanslationText;
      }

      // UI Enumeration Translations on page Display Group, set changed translationText      
      for (var enumeration of displayGroupUI.enumerations) {
        if (!!enumeration.enumerationDefinitions.find(t => t.masterTextKey === change.masterTextKey)) {
          enumeration.enumerationDefinitions.find(t => t.masterTextKey === change.masterTextKey).translationText = newTRanslationText;
        }
      }

      // Apply UI changes to the LAYOUT group
      if (this.translationService.layoutDisplayGroup.translations.find(t => t.masterTextKey === change.masterTextKey)) {
        this.translationService.layoutDisplayGroup.translations.find(t => t.masterTextKey === change.masterTextKey).translationText = newTRanslationText;
      }

      // UI Enumerations Translations changes to the LAYOUT group, set changed translationText   
      for (var enumeration of this.translationService.layoutDisplayGroup.enumerations) {
        if (!!enumeration.enumerationDefinitions.find(t => t.masterTextKey === change.masterTextKey)) {
          enumeration.enumerationDefinitions.find(t => t.masterTextKey === change.masterTextKey).translationText = newTRanslationText;
        }
      }
    }
    
    console.info(`Translation submit done. ${JSON.stringify(this.changedTranslations[0])}`);
  }


  /**
   * Handle paging
   * @param $event The page event.
   */
  onPage(event) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      console.log('paged!', event);
    }, 100);
  }

  /**
   * Update tranlation in modal, add to list changes by MasterKeyText
   * @param $event The event data, cell The name of the cell column changing, rowMasterKey The key whos translation data has changed.
   */
  updateValue(event, cell, rowMasterTextKey) {
    //console.log('inline editing rowMasterTextKey', rowMasterTextKey);    

    if (this.languageName === 'LANGUAGE_ENGLISH_UK') {
      this.parentSubmitIsDisabled = true;
      return;
    }
    
    // Has the translation changed for the edited rowMasterTextKey? This is the cell is being edited?
    if (this.rows.find(t => t.masterTextKey === rowMasterTextKey).translationText !== event.target.value && this.editing[rowMasterTextKey + '-' + cell]) {
      this.editing[rowMasterTextKey + '-' + cell] = false;

      const theUpdatingRow = this.rows.find(t => t.masterTextKey === rowMasterTextKey);

      // Update the row for UI display data. Set a blank/empty/deletion back to defaultText for display, when saved to DB the translation will be deleted.
      theUpdatingRow.translationText = !!event.target.value ? event.target.value : theUpdatingRow.defaultText;

      // Enable submit button in parent Modal
      this.parentSubmitIsDisabled = false;

      this.rows = [...this.rows];

      // Update backing data or a filter change will loose this update in the modal row data
      this.rowsBackingData.find(t => t.masterTextKey === rowMasterTextKey).translationText = theUpdatingRow.translationText;

      // Add change or update existing change
      if (!this.changedTranslations.find(t => t.masterTextKey === rowMasterTextKey)) {
        this.changedTranslations.push(theUpdatingRow);
        console.log('Translation change added: ', theUpdatingRow);
      } else {
        // A change has already stored for this masterKeyText
        }
    }
  }

  /**
   * Updates the filteed rows on UI data grid.
   * @param $event The filter event.
   */
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
   
    // filter our data
    const rowsBackingData = this.rowsBackingData.filter(function (d) {

      // Test if the defaultText is like the filter text
      if (!!d.defaultText) {
        if (d.defaultText.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }

      // Test if the translationText is like the filter text
      if (!!d.translationText) {
        if (d.translationText.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }

      // Missing translatioText, allow all if filter text is empty
      if (!d.translationText) {
        return !val;
      }

      // default allow all
      return d.defaultText.indexOf(val) !== -1 || d.translationText.indexOf(val) !== -1 || !val;
      
    });

    // update the rows
    this.rows = rowsBackingData;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  
  /**
   * Allows a custom sort for translations not set, equal to the default Text
   * @param rowA The row data to compare and sort.
   */
    translationComparator(rowA) {
    //console.log('Sorting Comparator', rowA);

    //do compare with fields in rowA.
    if (rowA.translationText === rowA.defaultText) {
      return -1;
    } else {
      return 1;
    }
  }
  
 /**
   * Build text data for TextTypeId.
   * ToDo: Create an Enumeration in the databse and use to drive UI?
   * @param id The TextTypeId.
   */
  getTextTypeFromId(id: number): string {
    // console.log(`getTextTypeFromId(${id}) called.`);

    let textypeName: string;

    switch (id) {
      case 0:
        textypeName = `LIST`;
        break;
      case 1:
        textypeName = `WORD`;
        break;
      case 2:
        textypeName = `MESSAGE`;
        break;
      case 3:
        textypeName = `HELP`;
        break;
      case 4:
        textypeName = `GRID`;
        break;
      case 5:
        textypeName = `SHEET`;
        break;
      
      default:
        textypeName = `UNKNOWN`;
    }
    return textypeName;
  }
}
