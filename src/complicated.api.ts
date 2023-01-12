import { RpcContext } from ".";

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
  console.log(context);
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
    name: `context: ${context}`,
    value,
  };
}

export async function testRpcCall4(
  context: RpcContext,
  param: CustomGenericType<NotExportedInterface>
) {
  return param;
}

export async function testRpcCall5(
  context: RpcContext,
  param: CustomGenericType<CustomGenericType<NotExportedInterface>>
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
