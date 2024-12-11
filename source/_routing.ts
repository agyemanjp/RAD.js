
import type { ErrorRequestHandler, Handler } from "express"
import { ensureStartsWith, map, type Rec } from "@agyemanjp/standard"

export const getCreateUrl = (basePath: string) => `${ensureStartsWith(basePath, "/")}/new?mode=create`

export const getEditUrl = (basePath: string, id: string) => `${ensureStartsWith(basePath, "/")}/${id}?mode=edit`

export const getViewUrl = (basePath: string, id: string) => `${ensureStartsWith(basePath, "/")}/${id}`

export const getPropertyBasePath = (_: { propType: string, transType: string, initialSlash?: boolean }) => {
	const { propType, transType, initialSlash } = _
	return `${initialSlash ? "/" : ""}${propType.toLowerCase()}s-for-${transType.toLowerCase()}`
}

export function appendQueryParams(relativeUrl: string, params: Rec<string | number>) {
	const x = map(params, _ => String(_ ?? ""))
	const queryString = new URLSearchParams(x).toString()
	const separator = relativeUrl.includes('?') ? '&' : '?'
	return queryString.length > 0 ? relativeUrl + separator + queryString : relativeUrl
}

export type Route = RouteObject | RouteTriple | Handler | ErrorRequestHandler
export type RouteObject = {
	path: string,
	method: "get" | "post" | "put" | "delete" | "use" | "all"
	handler: Handler
}
export type RouteTriple = [
	method: "get" | "post" | "put" | "delete" | "use" | "all",
	path: string,
	handler: Handler
]
