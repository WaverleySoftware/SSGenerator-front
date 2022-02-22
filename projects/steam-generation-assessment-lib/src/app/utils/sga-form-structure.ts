import { SgFormStructureInterface } from '../interfaces/steam-generation-form.interface';

export default {
  utility_parameters: {
    status: true,
    panels: {
      fuel: {
        status: true,
        fields: ['fuelEnergyPerUnit', 'fuelCarbonContent', 'costOfFuelPerUnit', 'costOfFuelPerYear', 'fuelConsumptionPerYear']
      },
      co2_emission: {
        status: true,
        fields: ['carbonTaxLevyCostPerUnit', 'costOfCo2PerUnitMass']
      },
      water: {
        status: true,
        fields: ['costOfWaterPerUnit', 'costOfWaterPerYear', 'waterConsumptionPerHour', 'waterConsumptionPerYear']
      },
      water_treatment_chemicals: {
        status: true,
        fields: ['totalChemicalCostPerYear', 'o2ScavengingChemicalsCostSavings']
      },
      water_effluent: {
        status: true,
        fields: ['costOfEffluentPerUnit']
      }
    },
    fields: ['hoursOfOperation']
  },
  boiler_house_parameters: {
    status: false,
    panels: {
      boiler: {
        status: true,
        panels: {
          boiler_parameters: {
            status: true,
            fields: [
              'boilerSteamGeneratedPerHour',
              'boilerSteamGeneratedPerYear',
              'boilerSteamPressure',
              'boilerSteamTemperature',
              'boilerEfficiency'
            ]
          }
        }
      },
      tds_blowdown: {
        status: false,
        panels: {
          blowdown_equipment: {
            status: true,
            fields: ['waterTemperatureLeavingHeatExchanger']
          },
          tds_blowdown_parameters: {
            status: true,
            fields: ['tdsOfFeedwaterInFeedtank', 'boilerAverageTds', 'boilerMaxTds']
          }
        }
      },
      water_treatment: {
        status: false,
        panels: {
          make_up_water: {
            status: true,
            fields: [
              'temperatureOfMakeupWater',
              'makeupWaterAmountPerHour',
              'makeupWaterAmountPerYear'
            ]
          },
          water_treatment_parameters: {
            status: true,
            fields: [
              'percentageWaterRejection',
              'tdsOfMakeupWater'
            ]
          }
        }
      },
      feedwater_and_condensate: {
        status: false,
        panels: {
          deaerator_type: {
            status: true,
          },
          boiler_feedwater: {
            status: true,
            fields: [
              'boilerFeedwaterConsumptionPerHour',
              'boilerFeedwaterConsumptionPerYear',
              'temperatureOfFeedtank',
              'pressureOfSteamSupplyingDsi',
              'pressureOfFeedtank'
            ]
          },
          condensate_return: {
            status: true,
            fields: [
              'percentageOfCondensateReturn',
              'volumeOfCondensateReturn',
              'temperatureOfCondensateReturn',
              'tdsOfCondensateReturn'
            ]
          }
        }
      }
    }
  }
} as SgFormStructureInterface;
