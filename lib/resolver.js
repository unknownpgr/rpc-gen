"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveType = void 0;
const ts_morph_1 = require("ts-morph");
function getTypeDeclaration(type) {
    // Check if type is primitive
    if (type.isString() || type.isNumber() || type.isBoolean()) {
        return type.getText();
    }
    const symbol = type.getSymbol();
    if (!symbol)
        return UNRESOLVED;
    const declaration = symbol.getDeclarations()[0];
    // Check if given declaration is an interface
    if (declaration?.getKind() === ts_morph_1.ts.SyntaxKind.InterfaceDeclaration) {
        return declaration.getText();
    }
    // Check if given declaration is a type alias
    if (declaration?.getKind() === ts_morph_1.ts.SyntaxKind.TypeAliasDeclaration) {
        return declaration.getText();
    }
    return UNRESOLVED;
}
const UNRESOLVED = "UNRESOLVED";
function resolveType(type, declarations) {
    const typeText = type.getText(undefined, ts_morph_1.TypeFormatFlags.NoTypeReduction);
    console.log("typeText", typeText);
    if (declarations[typeText] && declarations[typeText] !== UNRESOLVED)
        return typeText;
    const declaration = getTypeDeclaration(type);
    console.log("declaration", declaration);
    if (declaration !== UNRESOLVED && declaration.startsWith("export")) {
        declarations[typeText] = declaration;
        console.log(typeText);
        console.log(declaration);
    }
    if (type.isIntersection()) {
        for (const t of type.getIntersectionTypes()) {
            resolveType(t, declarations);
        }
    }
    if (type.isUnion()) {
        for (const t of type.getUnionTypes()) {
            resolveType(t, declarations);
        }
    }
    if (type.isObject()) {
        for (const property of type.getProperties()) {
            const propertyType = property.getTypeAtLocation(property.getDeclarations()[0]);
            resolveType(propertyType, declarations);
        }
    }
    return typeText;
}
exports.resolveType = resolveType;
