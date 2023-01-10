"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctionDeclarations = void 0;
const ts_morph_1 = require("ts-morph");
function getFunctionDeclarations(sourceFile, checker) {
    const f1 = sourceFile
        .getDescendantsOfKind(ts_morph_1.SyntaxKind.FunctionDeclaration)
        .map((node) => {
        //Ignore unexported functions.
        if (!node.isExported())
            return null;
        const params = node.getParameters();
        const returnType = node.getReturnType();
        const functionName = node.getName();
        return { params, returnType, functionName };
    })
        .filter((node) => node !== null);
    const f2 = sourceFile
        .getDescendantsOfKind(ts_morph_1.SyntaxKind.VariableDeclaration)
        .map((node) => {
        //Ignore unexported functions.
        if (!node.isExported())
            return null;
        const functionName = node.getName();
        const type = node.getType();
        // Check type has call signature
        if (!type.getCallSignatures().length)
            return null;
        const functionDeclaration = type
            .getCallSignatures()[0]
            .getDeclaration();
        const params = functionDeclaration.getParameters();
        const returnType = functionDeclaration.getReturnType();
        return { params, returnType, functionName };
    })
        .filter((node) => node !== null);
    return [...f1, ...f2];
}
exports.getFunctionDeclarations = getFunctionDeclarations;
