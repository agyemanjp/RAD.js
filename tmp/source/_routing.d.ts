import type { ErrorRequestHandler, Handler } from "express";
import { type Rec } from "@agyemanjp/standard";
export declare const getCreateUrl: (basePath: string) => string;
export declare const getEditUrl: (basePath: string, id: string) => string;
export declare const getViewUrl: (basePath: string, id: string) => string;
export declare const getPropertyBasePath: (_: {
    propType: string;
    transType: string;
    initialSlash?: boolean;
}) => string;
export declare function appendQueryParams(relativeUrl: string, params: Rec<string | number>): string;
export type Route = RouteObject | RouteTriple | Handler | ErrorRequestHandler;
export type RouteObject = {
    path: string;
    method: "get" | "post" | "put" | "delete" | "use" | "all";
    handler: Handler;
};
export type RouteTriple = [
    method: "get" | "post" | "put" | "delete" | "use" | "all",
    path: string,
    handler: Handler
];
