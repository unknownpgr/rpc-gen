function getErrorObject(message: string) {
  return {
    type: "error",
    message,
  };
}

function getSuccessObject(data: any) {
  return {
    type: "success",
    data: JSON.stringify(data),
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
