import { ensureStartsWith, map } from "@agyemanjp/standard";
export const getCreateUrl = (basePath) => `${ensureStartsWith(basePath, "/")}/new?mode=create`;
export const getEditUrl = (basePath, id) => `${ensureStartsWith(basePath, "/")}/${id}?mode=edit`;
export const getViewUrl = (basePath, id) => `${ensureStartsWith(basePath, "/")}/${id}`;
export const getPropertyBasePath = (_) => {
    const { propType, transType, initialSlash } = _;
    return `${initialSlash ? "/" : ""}${propType.toLowerCase()}s-for-${transType.toLowerCase()}`;
};
export function appendQueryParams(relativeUrl, params) {
    const x = map(params, _ => String(_ ?? ""));
    const queryString = new URLSearchParams(x).toString();
    const separator = relativeUrl.includes('?') ? '&' : '?';
    return queryString.length > 0 ? relativeUrl + separator + queryString : relativeUrl;
}
//# sourceMappingURL=_routing.js.map