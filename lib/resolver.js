"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveType = void 0;
const ts_morph_1 = require("ts-morph");
function getTypeDeclaration(type) {
    // Check if type is primitive
    if (type.isString() || type.isNumber() || type.isBoolean()) {
        return UNRESOLVED;
    }
    // List of native generic types like Array, Promise, Set, Map, etc.
    const nativeGenerics = [
        "Array",
        "Promise",
        "Set",
        "Map",
        "ReadonlyArray",
        "ReadonlySet",
        "ReadonlyMap",
    ];
    // Check if typeText starts with any of the native generics+<
    if (nativeGenerics.some((generic) => type.getText().startsWith(`${generic}<`))) {
        return UNRESOLVED;
    }
    const symbol = type.getSymbol();
    if (!symbol)
        return UNRESOLVED;
    const declaration = symbol.getDeclarations()[0];
    // Check if given declaration is an interface
    if (declaration?.getKind() === ts_morph_1.ts.SyntaxKind.InterfaceDeclaration) {
        return declaration.getText();
    }
    // Check if given declaration is a type literal
    if (declaration?.getKind() === ts_morph_1.ts.SyntaxKind.TypeLiteral) {
        // Check if parent of type literal is an type alias
        const parent = declaration.getParent();
        if (!parent)
            return UNRESOLVED;
        if (parent.getKind() === ts_morph_1.ts.SyntaxKind.TypeAliasDeclaration) {
            return parent.getText();
        }
    }
    return UNRESOLVED;
}
const UNRESOLVED = "UNRESOLVED";
function resolveType(type, declarations) {
    const typeText = type.getText(undefined, ts_morph_1.TypeFormatFlags.NoTypeReduction);
    console.log(typeText);
    if (declarations[typeText] && declarations[typeText] !== UNRESOLVED)
        return typeText;
    const declaration = getTypeDeclaration(type);
    if (declaration !== UNRESOLVED)
        declarations[typeText] = declaration;
    // Check if type is generic
    if (type.getTypeArguments().length > 0) {
        for (const typeArgument of type.getTypeArguments()) {
            resolveType(typeArgument, declarations);
        }
    }
    if (type.isArray()) {
        const elementType = type.getArrayElementType();
        if (elementType)
            resolveType(elementType, declarations);
    }
    else if (type.isTuple()) {
        for (const elementType of type.getTupleElements()) {
            resolveType(elementType, declarations);
        }
    }
    else if (type.isIntersection()) {
        for (const t of type.getIntersectionTypes()) {
            resolveType(t, declarations);
        }
    }
    else if (type.isUnion()) {
        for (const t of type.getUnionTypes()) {
            resolveType(t, declarations);
        }
    }
    else if (type.isObject()) {
        for (const property of type.getProperties()) {
            const propertyType = property.getTypeAtLocation(property.getDeclarations()[0]);
            resolveType(propertyType, declarations);
        }
    }
    return typeText;
}
exports.resolveType = resolveType;
