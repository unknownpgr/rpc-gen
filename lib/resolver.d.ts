import * as ts from "typescript";
import { Type } from "ts-morph";
export declare function resolveType(type: Type<ts.Type>, resolvedTypes?: Record<string, string>): string;
