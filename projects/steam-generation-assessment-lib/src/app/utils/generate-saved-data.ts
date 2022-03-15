import { ProcessInput } from "sizing-shared-lib";

export const generateSavedData = (data: {[key: string]: any}): ProcessInput[] => {
  const results: ProcessInput[] = [];

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const keys = Object.keys(data);

    for (const key of keys) {
      const elem = data[key];

      if (elem && (typeof elem === 'string' || typeof elem === 'number' || typeof elem === 'boolean')) {
        results.push({
          name: key,
          value: elem as string,
          unitId: null,
          listItemId: null,
          value2: null,
          childInputs: null
        });
      } else if (elem && (typeof elem === 'object')) {
        results.push({
          name: key,
          value: null,
          unitId: null,
          listItemId: null,
          value2: null,
          childInputs: generateSavedData(elem)
        });
      }
    }
  }

  return results;
}
