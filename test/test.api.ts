import { MoreAbsolutelyNothing } from "./otherfile";
import { RpcContext } from "rpc-gen";
import { Type } from "ts-morph";

interface ComplexInterface {
  a: string;
  b: number;
  c: boolean;
  d: {
    e: string;
    f: number;
    g: boolean;
  };
}

interface MoreComplexInterface {
  a: string;
  b: number;
  c: boolean;
  d: (ComplexInterface & {
    h: string;
  })[];
}

type SexyType = {
  [key in keyof MoreComplexInterface]: MoreComplexInterface[keyof MoreComplexInterface];
};

type ASDFType = keyof MoreComplexInterface;

export const rpc = async (
  context: RpcContext,
  e: MoreComplexInterface,
  f: MoreAbsolutelyNothing,
  g: SexyType,
  h: ASDFType
) => {
  return e;
};

export function rpc2(context: RpcContext): Omit<MoreComplexInterface, "a"> {
  return {
    b: 1,
    c: true,
    d: [
      {
        a: "a",
        b: 1,
        c: true,
        d: {
          e: "e",
          f: 1,
          g: true,
        },
        h: "h",
      },
    ],
  };
}
