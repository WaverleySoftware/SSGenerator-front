export interface SgaBoilerSchemeInterface {
  isEconomizerPresent?: boolean;
  isBlowdownVesselPresent?: boolean;
  isCoolingWaterUsed?: boolean;
  isAutoTdsControlPResent?: boolean;
  isFlashVesselPresent?: boolean;
  isHeatExchangerPresent?: boolean;
  pressurisedDeaerator?: boolean;
  isDsiPresent?: boolean;
}

export interface SgaBoilerSchemeTabsInterface {
  boiler: { status: boolean },
  tds_blowdown: { status: boolean },
  water_treatment: { status: boolean },
  feedwater_and_condensate: { status: boolean }
}
