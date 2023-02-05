import { getFunctionDeclarations } from "./getFunctionDeclarations";
import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  ScriptTarget,
  ts,
  Type,
  TypeFormatFlags,
} from "ts-morph";

const project = new Project({
  compilerOptions: {
    esModuleInterop: true,
    moduleResolution: ModuleResolutionKind.NodeJs,
    module: ModuleKind.CommonJS,
    target: ScriptTarget.ES2020,
    baseUrl: "./",
    noImplicitAny: true,
    strictNullChecks: true,
    noImplicitThis: true,
    alwaysStrict: true,
    declaration: true,
  },
});

project.addSourceFilesAtPaths("../**/*{.d.ts,.ts}");
project.resolveSourceFileDependencies();
const checker = project.getTypeChecker();
const sourceFiles = project.getSourceFiles();
const rpcSourceFiles = sourceFiles.filter((sourceFile) =>
  sourceFile.getBaseName().endsWith(".api.ts")
);

function getTypeName(type: Type) {
  if (type.isObject()) {
    const symbol = type.getSymbol();
    if (symbol) {
      return symbol.getName();
    }
  }
  return type.getText(undefined, TypeFormatFlags.NoTypeReduction);
}

function getTypeDeclaration(type: Type) {
  if (type.isObject()) {
    const symbol = type.getSymbol();
    if (symbol) {
      return symbol.getDeclarations()[0];
    }
  }
  return undefined;
}

const dp = new Set<string>();

export function resolveType(type: Type<ts.Type>) {
  const typeName = getTypeName(type);
  if (dp.has(typeName)) return;
  dp.add(typeName);

  console.log(typeName);
  console.log("  ", type.getText(undefined, TypeFormatFlags.NoTypeReduction));
  console.log("  ", getTypeDeclaration(type)?.getText());

  if (type.isIntersection()) {
    for (const t of type.getIntersectionTypes()) {
      resolveType(t);
    }
  }
  if (type.isUnion()) {
    for (const t of type.getUnionTypes()) {
      resolveType(t);
    }
  }
  if (type.isObject()) {
    for (const property of type.getProperties()) {
      const propertyType = property.getTypeAtLocation(
        property.getDeclarations()[0]
      );
      resolveType(propertyType);
    }
  }
}

for (const sourceFile of rpcSourceFiles) {
  const functions = getFunctionDeclarations(sourceFile, checker);
  for (const func of functions) {
    for (const param of func.params) {
      resolveType(param.getType());
    }
  }
}
