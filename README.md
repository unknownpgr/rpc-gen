# Rpc-Gen

Rpc-Gen is a tool to auto-generate typescript RPC code for your project.

Define function at backend

![a.png](/assets/a.png)

and use it at frontend

![b.png](/assets/b.png)

## Installation

```bash
# Install with npm
npm install --save-dev rpc-gen
# Or install with yarn
yarn add --D rpc-gen
```

## Usage

1. Add RpcContext module augmentation file to your project.

   ```typescript
   // rpc-context.d.ts
   declare module "rpc-gen" {
     interface RpcContext {
       // Add your context here
       // For example:
       name: string;
     }
   }
   ```

2. Make api file with `.api.ts` extension, and implement RPC function. Type of the first parameter must be `RpcContext`.

   ```typescript
   // test.api.ts
   import { RpcContext } from "rpc-gen";

   export function testRpc(context: RpcContext, prefix: string) {
     console.log(context.name);
     return {
       name: prefix + ":" + context.name,
     };
   }
   ```

3. Run `rpc-gen` command in your project root directory.

   ```bash
   # With npx
   npx rpc-gen
   # Or with yarn
   yarn rpc-gen
   ```

4. Then you will `frontend.rpc.ts` and `backend.rpc.ts` in your project root directory.

   ```typescript
   // frontend.rpc.ts
   const rpc = async (
     module: string,
     func: string,
     hash: number,
     args: any[]
   ) => {
     return fetch("/api/rpc", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         module,
         func,
         hash,
         args,
       }),
     }).then((res) => res.json());
   };
   export const test = {
     testRpc: async (prefix: string): Promise<{ name: string }> =>
       rpc("test", "testRpc", 3662805367, [prefix]),
   };
   ```

   ```typescript
   // backend.rpc.ts
   import * as test from "./apis/test.api";
   import { RpcContext } from "rpc-gen";
   export const rpc = async (
     context: RpcContext,
     {
       module,
       func,
       hash,
       args,
     }: { module: string; func: string; hash: number; args: any[] }
   ) => {
     const moduleObj = modules[module];
     if (!moduleObj) throw new Error("Module not found");
     const funcObj = moduleObj[func];
     if (!funcObj) throw new Error("Function not found");
     if (funcObj.hash !== hash) throw new Error("Hash mismatch");
     return await funcObj.func(context, ...args);
   };
   const modules: {
     [key: string]: {
       [key: string]: { hash: number; func: (...args: any[]) => any };
     };
   } = {
     test: {
       testRpc: { hash: 3662805367, func: test.testRpc },
     },
   };
   ```

5. Import `frontend.rpc.ts` in your frontend project, and import `backend.rpc.ts` in your backend project.

   ```typescript
   // frontend.ts
   import { test } from "./frontend.rpc";
   test.testRpc("Hello").then((res) => {
     console.log(res.name); // Hello:World
   });
   ```

   ```typescript
   // backend.ts
   import { rpc } from "./backend.rpc";
   import { RpcContext } from "rpc-gen";
   import express from "express";

   const app = express();

   app.post("/api/rpc", async (req, res) => {
     const context: RpcContext = {
       name: req.session.name,
     };
     const result = await rpc(context, req.body);
     res.json(result);
   });
   ```

## Docs

 ```bash
   Usage: rpc gen [options] [command]

   Commands:
     help     Display help
     version  Display version

   Options:
     -b, --backendFile [value]   Path to backend file (defaults to "./backend.rpc.ts")
     -f, --frontendFile [value]  Path to frontend file (defaults to "./frontend.rpc.ts")
     -h, --help                  Output usage information
     -r, --rpcApiUrl [value]     URL of RPC API (defaults to "/api/rpc")
     -v, --version               Output the version number
 ```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Author

[unknownpgr](https://unknownpgr.com/about)
