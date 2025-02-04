export interface Field {
  label: string;
  type: 'definition' | 'entity';
  // You can extend this interface with more properties as needed
}

export interface Entity {
  label: string;
  fields: Field[];
}