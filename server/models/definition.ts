export interface Definition {
    format: string; // The name of the format
    description: string;
  }
  
export type Definitions = Record<string, Definition>;