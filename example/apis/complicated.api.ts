import { RpcContext } from "rpc-gen";
import { TypeFromOtherFile } from "../test-type";

interface NotExportedInterface {
  name: string;
  value: number;
}

export interface ExportedInterface {
  key: string;
  test: NotExportedInterface;
}

interface TestInterface {
  prop1: NotExportedInterface;
  prop2: ExportedInterface;
}

export type CustomGenericType<T> = {
  name: string;
  value: T;
};

export function testRpcCall1(
  context: RpcContext,
  test: TestInterface
): ExportedInterface {
  console.log(context.name);
  return {
    key: "test",
    test: {
      name: test.prop1.name,
      value: 1,
    },
  };
}

export function testRpcCall2(
  context: RpcContext,
  value: number
): NotExportedInterface {
  return {
    name: context.name,
    value,
  };
}

export async function testRpcCall3(
  context: RpcContext,
  param: TypeFromOtherFile
) {
  return param;
}

export async function testRpcCall4(
  context: RpcContext,
  param: CustomGenericType<TypeFromOtherFile>
) {
  return param;
}

export async function testRpcCall5(
  context: RpcContext,
  param: CustomGenericType<CustomGenericType<TypeFromOtherFile>>
) {
  return param;
}

export async function testRpcCall6(
  context: RpcContext,
  param: CustomGenericType<number>
) {
  return param;
}

function notExportedRpcCall(context: RpcContext) {}
