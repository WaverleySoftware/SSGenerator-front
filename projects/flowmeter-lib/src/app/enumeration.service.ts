import { Injectable } from '@angular/core';
import { EnumerationDefinition, TranslationService } from 'sizing-shared-lib';

@Injectable()
export class EnumerationService {
  constructor(private translationService: TranslationService) { }

  /**
   * Get enumeration collection
   * @param enumerationName - name of enumeration
   * @param opCoOverride - ???
   * @param filterBy - filters array
   */
  getEnumerationCollection(enumerationName: string, opCoOverride = false, filterBy?: Array<string> ): Array<EnumerationDefinition> | null {
    let enumeration = this.translationService.displayGroup.enumerations.filter(
      us => us.enumerationName === enumerationName && us.opCoOverride === opCoOverride
    )[0];

    // Check if enumerations with overrides NOT found? If so, then populate this with the base enumerations.
    if (!enumeration) {
      enumeration = this.translationService.displayGroup.enumerations.filter(
        us => us.enumerationName === enumerationName && us.opCoOverride === false
      )[0];
    }

    if (!!enumeration) {
      let definitions = enumeration.enumerationDefinitions.sort((currentenumeration, nextenumeration) => {
        if (currentenumeration.sequence > nextenumeration.sequence) {
          return 1;
        }

        if (currentenumeration.sequence < nextenumeration.sequence) {
          return -1;
        }

        return 0;
      });

      if (!!filterBy && filterBy.length > 0) {
        definitions = definitions.filter(ed => filterBy.includes(ed.value));
      }

      return definitions;
    }

    return null;
  }
}
