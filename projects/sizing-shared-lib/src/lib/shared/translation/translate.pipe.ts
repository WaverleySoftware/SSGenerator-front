import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from "./translation.service";
import { DisplayGroup } from "./translation.model";

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform {

  constructor(private translationService: TranslationService) { }

  transform(value: any, isLayout: boolean = false): any {
    let result: DisplayGroup;

    // Normalise isLayout
    isLayout = !!isLayout;

    if (isLayout) {
      result = this.translationService.layoutDisplayGroup; // loaded layoutDisplayGroup.
    }
    else {
      result = this.translationService.displayGroup; // loaded displayGroup.
    }

    const defaultTrans = `** ${value} **`;

    if (!!result) {
      const translation = result.translations.find(t => t.masterTextKey === value);

      if (!translation) {
        // log missing translations
        //console.log(`-- Missing MasterTextKey: DisplayGroupId=${result.id}, DisplayGroupName=${result.name}, value=${value}, isLayout=${isLayout}, translationText=${!!translation ? translation.translationText : defaultTrans}`);

        //// SQL helpers
        //console.log(` SELECT * FROM [SizingSuite_V2].[trans].[MasterTexts] WHERE  DefaultText LIKE '${value.replace('_', ' ')}%' OR [Key] LIKE '${value.replace(' ', '_').toUpperCase()}%'  -- INSERT #MasterTextData SELECT '${value.replace(' ', '_').toUpperCase()}', '${value.replace('_', ' ')}'  `);
        //console.log(` SELECT * FROM [SizingSuite_V2].[trans].[DisplayGroups_MasterTexts] WHERE  [MasterTextKey] LIKE '${value.replace(' ', '_')}%' AND DisplayGroupId=${result.id} `);
        //console.log(`-- INSERT #MasterTexts SELECT N'${value.replace(' ', '_').toUpperCase()}', N'${result.name}' `) ;
        //console.log(`-- INSERT #DisplayGroups_MasterTexts SELECT 0, (SELECT TOP 1 DG.Id FROM trans.DisplayGroups DG WHERE DG.Name = N'${result.name}'), N'${value.replace(' ', '_').toUpperCase()}', (SELECT TOP 1 TT.Id FROM trans.TextTypes TT WHERE TT.Name = 'Word') ; `);

        let listTranslationText: string = defaultTrans;
        // Try to find a match in the lists on page:
        for (let e of this.translationService.displayGroup.enumerations) {
          var ed = e.enumerationDefinitions.find(ed => ed.masterTextKey == value && !!ed.translationText);
          if (!!ed) {
            listTranslationText = JSON.parse(JSON.stringify(ed.translationText)); // clone string or it will be linked to the trans of the list item in the UI and reflect any changes.
            break;
          }
        }
        return !!listTranslationText ? listTranslationText : defaultTrans; // find and return first match

      }

      return !!translation ? translation.translationText : defaultTrans;
    }

    // console.log(`value=${value}, isLayout=${isLayout}, defaultTrans=${defaultTrans}`);
    return defaultTrans;
  }

}
