/**
 * The Document Generator model.
 */
export class DocGen {

  moduleId: number;
  template: string;
  headerImage: string;
  bodyImage: string;
  specItems: Array<SpecSheetItem>;

}

export class SpecSheetItem {
  name: string;
  type: string;
  masterTextKey: string;
  sectionName: string;
  targetLanguage: string;
  value: string;
}
