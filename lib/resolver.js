"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveType = void 0;
const ts_morph_1 = require("ts-morph");
// Check if given type is promise
function isPromise(type) {
    const symbol = type.getSymbol();
    if (!type.isObject() || !symbol) {
        return false;
    }
    const args = type.getTypeArguments();
    return symbol.getName() === "Promise" && args.length === 1;
}
// Check if given type is javascript native class such as Date, Error, Regex, etc.
function isNativeType(type) {
    return (type.isClassOrInterface() &&
        type
            .getSymbolOrThrow()
            .getDeclarations()
            .some((declaration) => declaration.getSourceFile().getBaseName() === "lib.es5.d.ts"));
}
// Check if given type is callable
function isCallable(type) {
    return type.getCallSignatures().length > 0;
}
// Check if given type has generic arguments
function hasGenericArguments(type) {
    return type.getAliasTypeArguments().length > 0;
}
const UNRESOLVABLE = "*UNRESOLVABLE*";
const allowedDeclarationKinds = [
    ts_morph_1.SyntaxKind.InterfaceDeclaration,
    ts_morph_1.SyntaxKind.TypeAliasDeclaration,
    // SyntaxKind.ClassDeclaration,
    // SyntaxKind.EnumDeclaration,
];
function getDeclaration(node) {
    const kind = node.getKind();
    if (allowedDeclarationKinds.includes(kind)) {
        return node;
    }
    const parent = node.getParent();
    if (parent) {
        return getDeclaration(parent);
    }
    return null;
}
function getTypeName(type) {
    const symbol = type.getSymbol();
    if (!symbol)
        return UNRESOLVABLE;
    const declaration = symbol.getDeclarations()[0];
    const namedDeclaration = getDeclaration(declaration);
    if (namedDeclaration) {
        if (!hasGenericArguments(type))
            return namedDeclaration.getName();
        /**
         * Resolving generic is quite tricky. We need to resolve all generic arguments
         * TODO: What if resolved type text cannot be an valid identifier? (e.g. `type A = { a: string }`)
         */
        const args = type.getAliasTypeArguments();
        const argNames = args.map((arg) => resolveType(arg));
        return `${namedDeclaration.getName()}_${argNames.join("_")}`;
    }
    return UNRESOLVABLE;
}
function resolveType(type, resolvedTypes = {}) {
    function resolve(type, stack) {
        const typeName = getTypeName(type);
        // Check if type is already resolved
        if (typeName !== UNRESOLVABLE && typeName in resolvedTypes) {
            return typeName;
        }
        // Check if type is recursive
        if (stack.includes(type)) {
            console.error("Given type is recursive. Returning 'any' instead.");
            return "any";
        }
        // Check if type is too deep
        if (stack.length > 20) {
            console.error("Given type is too deeply nested. Returning 'any' instead.");
            return "any";
        }
        const nextStack = stack.concat(type);
        // Check if type is any
        if (type.isAny()) {
            return "any";
        }
        // Check if type is native type
        if (type.isString() ||
            type.isNumber() ||
            type.isBoolean() ||
            type.isUndefined() ||
            type.isNull() ||
            type.isBooleanLiteral() ||
            type.isStringLiteral() ||
            type.isEnum() ||
            type.isNever() ||
            isNativeType(type)) {
            return type.getText();
        }
        // If type is literal, return the literal value.
        if (type.isLiteral()) {
            return type.getLiteralValueOrThrow().toString();
        }
        // If type is promise, get the type of the promise.
        if (isPromise(type)) {
            return `Promise<${resolve(type.getTypeArguments()[0], nextStack)}>`;
        }
        const ret = (typeText) => {
            if (typeName !== UNRESOLVABLE) {
                resolvedTypes[typeName] = typeText;
                return typeName;
            }
            else
                return typeText;
        };
        // If type is array, get the type of the array.
        if (type.isArray()) {
            const resolvedType = resolve(type.getArrayElementTypeOrThrow(), nextStack);
            if (resolvedType === "never" || resolvedType === "undefined")
                return resolvedType;
            return ret(`${resolvedType}[]`);
        }
        // If type is union, resolve the type of each union.
        if (type.isUnion()) {
            const unionTypes = type.getUnionTypes();
            const resolvedUnionTypes = unionTypes
                .map((unionType) => resolve(unionType, nextStack))
                .filter((type) => type !== "never");
            if (resolvedUnionTypes.length === 0)
                return "never";
            return ret(resolvedUnionTypes.join(" | "));
        }
        // If type is intersection, resolve the type of each intersection.
        if (type.isIntersection()) {
            const intersectionTypes = type.getIntersectionTypes();
            const resolvedIntersectionTypes = intersectionTypes
                .map((intersectionType) => resolve(intersectionType, nextStack))
                .filter((type) => type !== "never");
            if (resolvedIntersectionTypes.length === 0)
                return "never";
            return ret(resolvedIntersectionTypes.join(" & "));
        }
        // If type is tuple, resolve the type of each item.
        if (type.isTuple()) {
            const tupleTypes = type.getTupleElements();
            const resolvedTupleTypes = tupleTypes.map((tupleType) => resolve(tupleType, nextStack));
            return ret(`[${resolvedTupleTypes.join(", ")}]`);
        }
        // If type is callable, return undefined because function cannot be serialized.
        if (isCallable(type)) {
            console.error("Function type detected. Returning 'undefined' instead.");
            console.error("Because any function including toString will be undefined when serialized, Generated frontend code may not work as expected.");
            return "undefined";
        }
        // If type is object, resolve the type of each property.
        // Because many types, including function, are object, this should be the last check.
        if (type.isObject()) {
            const properties = type.getProperties();
            const resolvedProperties = properties
                .map((property) => {
                const propertyType = property.getTypeAtLocation(property.getDeclarations()[0]);
                const resolvedType = resolve(propertyType, nextStack);
                // Ignore undefined property
                if (resolvedType === "undefined")
                    return "";
                return `"${property.getName()}": ${resolvedType}`;
            })
                .filter((property) => property.length > 0);
            // Consider empty object as undefined
            if (resolvedProperties.length === 0)
                return "undefined";
            return ret(`{${resolvedProperties.join(", ")}}`);
        }
        // If type is unknown, return any.
        console.error(`Unknown type (${type.getText()}) detected. Returning 'any' instead.`);
        return "any";
    }
    return resolve(type, []);
}
exports.resolveType = resolveType;
