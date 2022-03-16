import { UnitsService } from "sizing-shared-lib";

const generateUnits = (units) => units.reduce((acc, item) => ({...acc, [item.id]: item.units}), {});

export const loadSgaUnits = (unitsService: UnitsService): Promise<{ [key: number]: string }> =>
  new Promise<{[p: number]: string}>(resolve => {
    if (unitsService.units && unitsService.units.length) {
      resolve(generateUnits(unitsService.units));
    } else {
      unitsService.getAllUnitsByAllTypes().subscribe(units => resolve(generateUnits(units)));
    }
  });
