import { ProcessInput } from "sizing-shared-lib";
import { ChartBarDataInterface } from "../interfaces/chart-bar.interface";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ProposalCalculationInterface } from "../interfaces/proposal-calculation.interface";

const convertValue = (v: any) => v === 'false' ? false : v === 'true' ? true : isNaN(Number(v)) ? v : Number(v);

export const generateSavedData = (data: {[key: string]: any}): ProcessInput[] => {
  const results: ProcessInput[] = [];

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const keys = Object.keys(data);

    for (const key of keys) {
      const elem = data[key];

      if ((elem || elem === 0 || elem === false || elem === true) && (typeof elem === 'string' || typeof elem === 'number' || typeof elem === 'boolean')) {
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

export const parseSavedData = (data: ProcessInput[]): {[key: string]: any} => {
  if (!data || !data.length) {
    return null;
  }

  return data.reduce((acc, v) => ({...acc, [v.name]: convertValue(v.value)}), {});
}

export const parseProposalCalcSavedData = (data: {[key: string]: ProcessInput[]}, baseKey = 'proposalCalculation'): ProposalCalculationInterface => {
  let result = null;

  for (const key of Object.keys(data)) {
    if (key.includes('.')) {
      const [parentKey, childKey] = key.split('.');

      if (parentKey === baseKey && childKey) {
        result = { ...result, [childKey]: parseSavedData(data[key]) };
      }
    }
  }

  return result as ProposalCalculationInterface;
}

export const generateSavedDataFromChart = (data: ChartBarDataInterface[]): ProcessInput[] => {
  if (!data) {
    return null;
  }

  return data.map((v, index) => ({
    name: v.label,
    value: JSON.stringify(v.data),
    unitId: null,
    listItemId: index,
    value2: '',
    childInputs: null
  }));
}

export const parseSavedChartData = (data: ProcessInput[]): ChartBarDataInterface[] => {
  if (!data || !data.length) {
    return null;
  }

  return data.map(v => ({
    label: v.name,
    data: v.value && JSON.parse(v.value)
  }))
}

export const patchSavedDataToForm = (data: ProcessInput[], fg: FormGroup): any => {
  if (!data || !data.length) {
    return null;
  }

  const result = {}

  for (const processInput of data) {
    const control = fg.get(processInput.name);
    const value = convertValue(processInput.value);

    if (processInput && control && control.value !== value) {
      result[processInput.name] = value;
      control.patchValue(value, {emitEvent: false});

      if (control.disabled && (
          processInput.name !== 'boilerSteamTemperature' ||
          (processInput.name === 'boilerSteamTemperature' && fg.get('isSuperheatedSteam').value)
        )) control.enable();
    }
  }

  return result;
}
