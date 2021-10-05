import { Preference } from "../preference/preference.model";

/**
 * The Operating Company Preferences model.
 */
export class DocGen {

  moduleId: number;
  template: string;
  headerImage: string;
  bodyImage: string;
  specItems: Array<SpecSheetItem>;
  userLanguageId: number;
  targetLanguage: string;
  userPreference: Array<Preference>;

}

export class SpecSheetItem {
  name: string;
  type: string;
  masterTextKey: string;
  sectionName: string;
  targetLanguage: string;
  value: string;
  calculation: string;
}

export class TiRequestModel {
  moduleId: number;
  code: string;
  params: string;
  languageId: number = -1; // not supported yet, will get default Ti language, normally 'en'
  //isOnlinePath: boolean;
}

export class TiDocumentInfosModel {
  tiDocumentInfos: TiDocumentInfo[];
}

export class TiDocumentInfo {

  description: string;
  tiFileName: string;
  tiPath: string;
  //isOnlinePath: boolean;
}

