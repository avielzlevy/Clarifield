export interface Reports {
  [type: string]: {
    [name: string]: { status: string; description: string }[];
  };
}
