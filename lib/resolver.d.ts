import { ts, Type } from "ts-morph";
export declare function resolveType(type: Type<ts.Type>, declarations: {
    [key: string]: string;
}): string;
