export interface Definition {
    format: string; // The name of the format
    description: string;
    sourceSystem: string; // The name of the source system
    sourceSystemField: string; // The name of the source system field
  }
  
export type Definitions = Record<string, Definition>;