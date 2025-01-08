import { createRanker, hasValue, Vector, Tuple, isArray } from "@agyemanjp/standard";
/** Gets ordered named field specs */
export function getOrderedNamedFieldSpecs(fields) {
    return (isArray(fields)
        ? new Vector(fields).map(_ => ({ ..._[1], fieldName: _[0] }))
        : (new Vector(Object.entries(fields))
            .map((_) => ({ fieldName: _[0], field: _[1] }))
            .filter(["by-typeguard", (_) => hasValue(_.field)])
            .sort(createRanker(_ => _.field.ordinal ?? 0))
            .map(_ => ({ ..._.field, fieldName: _.fieldName }))));
}
//# sourceMappingURL=_spec.js.map