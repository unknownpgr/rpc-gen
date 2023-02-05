export interface AbsolutelyNothing {
  a: string;
  b: number;
  c: boolean;
}

export type MoreAbsolutelyNothing = {
  a: string;
  b: number;
  c: boolean;
  d: AbsolutelyNothing;
};
