import { RpcContext } from "./";

type RpcErrorType = {
  type: "error";
  message: string;
};

type RpcSuccessType = {
  type: "success";
  data: any;
};

function getErrorObject(message: string): RpcErrorType {
  return {
    type: "error",
    message,
  };
}

function getSuccessObject(data: any): RpcSuccessType {
  return {
    type: "success",
    data,
  };
}

export async function handler(
  moduleObj: any,
  func: string,
  hash: number,
  args: any[]
) {
  if (!moduleObj) return getErrorObject("Module not found");
  const funcObj = moduleObj[func];
  if (!funcObj) return getErrorObject("Function not found");
  if (funcObj.hash !== hash) return getErrorObject("Hash mismatch");
  try {
    const result = await funcObj.func(args);
    return getSuccessObject(result);
  } catch (e) {
    return getErrorObject(e.message);
  }
}

export type RpcModule = {
  [key: string]: {
    [key: string]: { hash: number; func: (...args: any[]) => any };
  };
};

export type RpcFunction = (
  context: RpcContext,
  {
    module,
    func,
    hash,
    args,
  }: { module: string; func: string; hash: number; args: any[] }
) => Promise<RpcErrorType | RpcSuccessType>;
