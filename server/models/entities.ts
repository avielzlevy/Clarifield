export interface Entity {
  label: string;
  children?: Entity[];
}
export type Entities = Record<string, Entity>;