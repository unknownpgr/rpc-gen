// test.api.ts

import { RpcContext } from "rpc-gen";

export function testRpc(context: RpcContext, prefix: string) {
  console.log(context.name);
  return {
    name: prefix + ":" + context.name,
  };
}
