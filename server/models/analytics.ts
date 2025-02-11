export interface Analytics {
    [type: string]: {
      [name: string]: number;
    };
  }
// A record mapping a name to a number.
export type AnalyticsRecord = { [name: string]: number };

// A map of analytics by type.
export type AnalyticsMap = { [type: string]: AnalyticsRecord };
