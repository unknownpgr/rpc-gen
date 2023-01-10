import { Type } from "ts-morph";
import * as ts from "typescript";
export declare function resolveType(type: Type<ts.Type>, resolvedTypes?: Record<string, string>): string;
