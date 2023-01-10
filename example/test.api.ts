import { RpcContext } from "rpc-gen/lib/context";
import { TypeFromOtherFile } from "./test-type";

interface NotExportedInterface {
  name: string;
  value: number;
}

interface ExportedInterface {
  key: string;
  test: NotExportedInterface;
}

interface TestInterface {
  prop1: NotExportedInterface;
  prop2: ExportedInterface;
}

export function testRpcCall1(
  context: RpcContext,
  test: TestInterface
): ExportedInterface {
  console.log(context.name);
  return {
    key: "test",
    test: {
      name: "test",
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

export function testRpcCall3(context: RpcContext, param: TypeFromOtherFile) {
  return param;
}

export function notExportedRpcCall(context: RpcContext) {}
