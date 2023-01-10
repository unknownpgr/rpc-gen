import { ParameterDeclaration, SourceFile, Type, TypeChecker } from "ts-morph";
import ts from "typescript";
interface NormalizedFunctionDeclaration {
    params: ParameterDeclaration[];
    returnType: Type<ts.Type>;
    functionName: string;
}
export declare function getFunctionDeclarations(sourceFile: SourceFile, checker: TypeChecker): NormalizedFunctionDeclaration[];
export {};
