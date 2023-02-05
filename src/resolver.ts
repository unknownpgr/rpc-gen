import { ts, Type, TypeFormatFlags } from "ts-morph";

function getTypeDeclaration(type: Type) {
  // Check if type is primitive
  if (type.isString() || type.isNumber() || type.isBoolean()) {
    return type.getText();
  }

  const symbol = type.getSymbol();
  if (!symbol) return UNRESOLVED;

  const declaration = symbol.getDeclarations()[0];

  // Check if given declaration is an interface
  if (declaration?.getKind() === ts.SyntaxKind.InterfaceDeclaration) {
    return declaration.getText();
  }

  // Check if given declaration is a type alias
  if (declaration?.getKind() === ts.SyntaxKind.TypeAliasDeclaration) {
    return declaration.getText();
  }

  return UNRESOLVED;
}

const UNRESOLVED = "UNRESOLVED";

export function resolveType(
  type: Type<ts.Type>,
  declarations: { [key: string]: string }
) {
  const typeText = type.getText(undefined, TypeFormatFlags.NoTypeReduction);
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
      const propertyType = property.getTypeAtLocation(
        property.getDeclarations()[0]
      );
      resolveType(propertyType, declarations);
    }
  }

  return typeText;
}
