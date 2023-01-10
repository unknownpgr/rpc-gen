import crypto from "crypto";
import fs from "fs";
import { Project } from "ts-morph";
import { TypeFormatFlags } from "typescript";
import { getFunctionDeclarations } from "./getFunctionDeclarations";
import { resolveType } from "./resolver";

export interface RpcContext {}

export interface RpcGenConfig {
  rpcApiUrl: string;
  frontendFile: string;
  backendFile: string;
}

export function generate(
  config: RpcGenConfig = {
    rpcApiUrl: "api/rpc",
    frontendFile: "./frontend.rpc.ts",
    backendFile: "./backend.rpc.ts",
  }
) {
  console.log("Loading project files...");
  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });
  const checker = project.getTypeChecker();

  let frontendFile = `const rpc = async (module: string, func: string, hash: number, args: any[]) => {
    return fetch("${config.rpcApiUrl}", {
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
    };`;

  let backendFile = 'import { RpcContext } from "rpc/context";\n';
  backendFile += `export const rpc = async (context:RpcContext, { module, func, hash, args }: { module: string, func: string, hash: number, args: any[] }) => {
    const moduleObj = modules[module];
    if (!moduleObj) throw new Error("Module not found");
    const funcObj = moduleObj[func];
    if (!funcObj) throw new Error("Function not found");
    if (funcObj.hash !== hash) throw new Error("Hash mismatch");
    return funcObj.func(context, ...args);
    };`;
  backendFile +=
    "const modules: { [key: string]: { [key: string]: { hash: number, func: (...args: any[]) => Promise<any> } }} = {\n";

  const backendImports = [];
  const moduleNames = new Set<string>();

  const sourceFiles = project.getSourceFiles().filter((sourceFile) => {
    if (!sourceFile.getBaseName().endsWith(".api.ts")) return false;
    return true;
  });

  // Throw error if there are no source files.
  if (sourceFiles.length === 0) {
    throw new Error("No source files found");
  }

  console.log("Analyzing project files...");

  const resolvedTypes: Record<string, string> = {};

  for (const sourceFile of sourceFiles) {
    // Ignore module names that is not ends with ".api".
    if (!sourceFile.getBaseName().endsWith(".api.ts")) continue;

    console.log(`Analyzing ${sourceFile.getBaseName()}...`);
    const moduleName = sourceFile
      .getBaseNameWithoutExtension()
      .replace(".api", "");

    // Check if source file is already imported.
    // If it is already imported, throw error.
    if (moduleNames.has(moduleName)) {
      throw new Error(`Duplicate import: ${moduleName}`);
    }

    // Get relative path to this file from root of project of source file.
    const relativePath = project
      .getRootDirectories()[0]
      .getRelativePathAsModuleSpecifierTo(sourceFile.getFilePath());

    // Add import declaration to backend file.
    backendImports.push(`import * as ${moduleName} from "${relativePath}";`);

    frontendFile += `export const ${moduleName} = {\n`;
    backendFile += `  ${moduleName}:{\n`;

    // Get all exported function declarations.
    const functionDeclarations = getFunctionDeclarations(sourceFile, checker);
    functionDeclarations.forEach(({ params, returnType, functionName }) => {
      const firstParameter = params.shift();

      // Assert the type of first parameter is RpcContext.
      if (!firstParameter) {
        throw new Error(
          `Invalid api function declaration: ${moduleName}.${functionName}. There must be at least one parameter.`
        );
      }

      // Assert the type of first parameter is RpcContext.
      const firstParamTypeString = firstParameter
        .getType()
        .getText(undefined, TypeFormatFlags.NoTypeReduction);
      if (firstParamTypeString !== "RpcContext") {
        throw new Error(
          `Invalid api function declaration: ${moduleName}.${functionName}. First parameter must be RpcContext, but got ${firstParamTypeString}`
        );
      }

      // Calculate md5 hash of string that join all parameter names and types, using crypto module.
      // Then get first 4 byte of hash as integer.
      const hash = crypto.createHash("md5");
      hash.update(
        params
          .map((param) => param.getName() + param.getType().getText())
          .join("")
      );
      const hashInt = parseInt(hash.digest("hex").slice(0, 8), 16);

      // Generate function declaration for frontend.
      const funcName = functionName;
      const funcParams = params.map((param) => param.getName()).join(", ");
      const funcParamsWithTypes = params
        .map(
          (param) =>
            `${param.getName()}: ${resolveType(param.getType(), resolvedTypes)}`
        )
        .join(", ");
      const resolvedReturnType = resolveType(returnType, resolvedTypes);
      frontendFile += `  ${funcName}: async (${funcParamsWithTypes}): Promise<${resolvedReturnType}> => rpc("${moduleName}", "${funcName}", ${hashInt}, [${funcParams}]),\n`;

      // Generate function declaration for backend.
      backendFile += `    ${funcName}: { hash: ${hashInt}, func: ${moduleName}.${funcName} },\n`;
    });
    backendFile += `  },\n`;
    frontendFile += `};\n`;
  }
  backendFile += "};\n";

  // Add imports to backend file.
  backendFile = backendImports.join("\n") + "\n" + backendFile;

  // Add resolved types to frontend file.
  frontendFile += Object.entries(resolvedTypes)
    .map(([key, value]) => `export type ${key} = ${value};`)
    .join("\n");

  console.log("Writing files...");

  // Write files.
  fs.writeFileSync(config.frontendFile, frontendFile);
  fs.writeFileSync(config.backendFile, backendFile);

  console.log("Done!");
}

export function cli() {
  generate();
}
