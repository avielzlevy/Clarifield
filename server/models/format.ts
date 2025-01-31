export interface Format {
  pattern: string;
  description: string;
}

export type Formats = Record<string, Format>;
