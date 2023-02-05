import { RpcContext } from "src";
import { MoreAbsolutelyNothing } from "src/test/otherfile";
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

export const rpc = async (
  context: RpcContext,
  e: MoreComplexInterface,
  f: MoreAbsolutelyNothing
) => {
  return e;
};
