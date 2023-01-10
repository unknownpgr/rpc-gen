import {
  FunctionDeclaration,
  ParameterDeclaration,
  SourceFile,
  SyntaxKind,
  Type,
  TypeChecker,
} from "ts-morph";
import ts from "typescript";

interface NormalizedFunctionDeclaration {
  params: ParameterDeclaration[];
  returnType: Type<ts.Type>;
  functionName: string;
}

export function getFunctionDeclarations(
  sourceFile: SourceFile,
  checker: TypeChecker
): NormalizedFunctionDeclaration[] {
  const f1 = sourceFile
    .getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
    .map((node) => {
      //Ignore unexported functions.
      if (!node.isExported()) return null;
      const params = node.getParameters();
      const returnType = node.getReturnType();
      const functionName = node.getName();
      return { params, returnType, functionName };
    })
    .filter((node): node is NormalizedFunctionDeclaration => node !== null);

  const f2 = sourceFile
    .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
    .map((node) => {
      //Ignore unexported functions.
      if (!node.isExported()) return null;
      const functionName = node.getName();
      const type = node.getType();

      // Check type has call signature
      if (!type.getCallSignatures().length) return null;

      const functionDeclaration = type
        .getCallSignatures()[0]
        .getDeclaration() as FunctionDeclaration;
      const params = functionDeclaration.getParameters();
      const returnType = functionDeclaration.getReturnType();
      return { params, returnType, functionName };
    })
    .filter((node): node is NormalizedFunctionDeclaration => node !== null);

  return [...f1, ...f2];
}
