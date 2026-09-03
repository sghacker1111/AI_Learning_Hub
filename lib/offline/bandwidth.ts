import { DataSaverConfig } from "./types";

export const DEFAULT_DATA_SAVER_CONFIG: DataSaverConfig = {
  isDataSaverEnabled: true,
  compressMedia: true,
  disableHighResSimulations: false,
  batchSyncIntervalMinutes: 5,
};

export function getNetworkQualityDescription(effectiveType?: string): {
  type: string;
  label: string;
  isLowBandwidth: boolean;
  tip: string;
} {
  switch (effectiveType) {
    case "slow-2g":
    case "2g":
      return {
        type: "2G_SLOW",
        label: "2G / Slow Network (ग्रामीण नेटवर्क)",
        isLowBandwidth: true,
        tip: "Low-bandwidth mode is recommended; automatic media compression is not connected in this prototype.",
      };
    case "3g":
      return {
        type: "3G",
        label: "3G Network (मध्यम गति)",
        isLowBandwidth: true,
        tip: "The prototype provides a basic offline fallback; complete course packs are not cached.",
      };
    default:
      return {
        type: "4G_FAST",
        label: "High Speed Network (तीव्र गति)",
        isLowBandwidth: false,
        tip: "Interactive demonstrations are available; AI responses still depend on the configured provider.",
      };
  }
}
