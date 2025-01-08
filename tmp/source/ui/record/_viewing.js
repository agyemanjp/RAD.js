// import assert from "assert"
import { except, filter, hasValue, initialCaps, isObject, spaceCase, Tuple } from "@agyemanjp/standard";
import { Fragment, View, createElement, StackPanel, MediaSetUI, inputDomainTuples } from "@agyemanjp/fxui";
import { getOrderedNamedFieldSpecs } from "../field/_spec";
import { stdFieldUICtor } from "../field/_ui";
export const stdRecordViewCtors = {
    cardOfTextAndImages: (args) => {
        switch (args.layout) {
            case "textOverImage": return (props) => {
                const customRecord = args.mapper(props.record);
                return createElement(StackPanel, { itemsAlignV: "start", itemsAlignH: "center", style: { ...props.style, position: "relative" } },
                    createElement("img", { src: customRecord.imageUrl, style: { position: "absolute", height: "100%", width: "100%" } }),
                    createElement("div", { style: { position: "absolute", height: "100%", width: "100%", background: "black", opacity: "0.5" } }),
                    createElement(StackPanel, { orientation: "vertical", style: {
                            color: "white",
                            gap: "0.25rem",
                            padding: "0.25rem",
                            height: "100%",
                            width: "100%",
                            position: "absolute",
                            overflow: "hidden"
                        } },
                        createElement("span", null, customRecord.title),
                        (customRecord.descriptors ?? []).map(_ => createElement(StackPanel, { style: { fontSize: "0.75em" } },
                            typeof _.caption === "function" ? createElement(_.caption, null) : createElement(Fragment, null),
                            typeof _.caption === "string" ? `${_.caption}: ` : "",
                            _.text))));
            };
            case "textAfterImage": return (props) => {
                const customRecord = args.mapper(props.record);
                return createElement(StackPanel, { style: { gap: "0.25rem", fontSize: "1.25rem", fontWeight: "bold", ...props.style } },
                    createElement("img", { src: customRecord.imageUrl, style: { height: "100%", width: "50%" } }),
                    createElement(StackPanel, { orientation: "vertical", style: { gap: "0.25rem", height: "100%", width: "50%", overflow: "hidden" } },
                        createElement("span", null, customRecord.title),
                        (customRecord.descriptors ?? []).map(_ => createElement(StackPanel, { style: { fontSize: "0.75em" } },
                            typeof _.caption === "function" ? createElement(_.caption, null) : createElement(Fragment, null),
                            typeof _.caption === "string" ? `${_.caption}: ` : "",
                            _.text))));
            };
        }
    },
    listOfFieldUIs: (args) => {
        const { fieldSpecs, layout, labelPosition, orientation, styles } = args;
        const { main: styleStatic, fields: fieldStyle, fieldGroups: fieldGroupStyle, labels: labelStyle, values: valueStyle } = styles;
        const orderedNamedFieldSpecs = getOrderedNamedFieldSpecs(fieldSpecs);
        // const hiddenFieldSpecs = [...specsFilter<HiddenField>(spec => spec.type === "hidden")]
        const longTextFieldSpecs = [...specsFilter(spec => spec.type === "text" && spec.isLong === true)];
        const mediaFieldSpecs = [...specsFilter(spec => spec.type === "media")];
        const toggleFieldSpecs = [...specsFilter(spec => spec.type === "toggle")];
        const remainderFieldSpecs = [...except(orderedNamedFieldSpecs, longTextFieldSpecs, mediaFieldSpecs, toggleFieldSpecs)];
        // console.log(`RemainderFieldSpecs names: ${map(remainderFieldSpecs, _ => _.fieldName)}`)
        function specsFilter(predicate) {
            const guard = (spec) => {
                return predicate(spec, undefined);
            };
            return filter(orderedNamedFieldSpecs, ["by-typeguard", guard]);
        }
        return ({ record, possibleValsDict, style: styleDynamic }) => {
            return createElement(StackPanel, { orientation: "vertical", style: { ...styleStatic, ...styleDynamic } },
                remainderFieldSpecs.length > 0 ? createElement(View, { "data-key": "other fields", sourceData: remainderFieldSpecs, itemTemplate: ({ value: fieldSpec, index }) => {
                        const { fieldName, customName, title, ordinal } = fieldSpec;
                        const defaultValue = "defaultValue" in fieldSpec ? fieldSpec.defaultValue : undefined;
                        const formatter = "formatter" in fieldSpec ? fieldSpec.formatter : undefined;
                        const val = record[fieldName] ?? defaultValue;
                        const strValue = formatter
                            ? formatter(val)
                            : String(hasValue(val, "deep") ? val : "N/A");
                        const stdFieldUI = stdFieldUICtor({
                            title: title ?? initialCaps(spaceCase(fieldName)),
                            labelPosition,
                            labelStyle,
                            style: { width: "100%", ...fieldStyle, ...fieldSpec.style ?? {} }
                        });
                        switch (fieldSpec.type) {
                            case "choice": {
                                const possibleVals = possibleValsDict ? possibleValsDict[fieldName] : undefined;
                                const possibleValuesNormalized = (fieldSpec.domain === "get-from-provider"
                                    ? (possibleVals ?? [])
                                    : inputDomainTuples(fieldSpec.domain).map(_ => [String(_[0]), _[1]]));
                                // console.log(`PossibleValuesNormalized: ${JSON.stringify(possibleValuesNormalized)}`)
                                // console.log(`field value for toggle field "${fieldSpec.fieldName}": ${record[fieldName]}`)
                                const title = possibleValuesNormalized?.find(_ => _[0] === record[fieldName])?.[1];
                                // console.log(`field title for toggle field "${fieldSpec.fieldName}": ${title}`)
                                const effectiveFieldValue = String(title ?? "N/A");
                                // console.log(`effectiveFieldValue of field ${fieldName}: ${effectiveFieldValue}`)
                                return stdFieldUI(createElement("span", { style: valueStyle }, effectiveFieldValue));
                            }
                            // case "text": /*assert((fieldSpec.isLong ?? false) === false)*/
                            // case "email":
                            // case "password":
                            // case "number":
                            default: return stdFieldUI(createElement("span", { style: valueStyle }, strValue));
                        }
                    }, layout: layout, orientation: orientation, itemStyle: fieldStyle, style: { gap: "0.25rem", border: "0 solid orange", ...fieldGroupStyle } }) : createElement(Fragment, null),
                toggleFieldSpecs.length > 0 ? createElement(View, { "data-key": "toggle fields", sourceData: toggleFieldSpecs, itemTemplate: ({ value: fieldSpec, index }) => {
                        const { fieldName, title, defaultValue } = fieldSpec;
                        const fieldValue = record[fieldName];
                        const id = `${fieldName}-${index}`;
                        const stdFieldUI = stdFieldUICtor({
                            title: title ?? initialCaps(spaceCase(fieldName)),
                            labelPosition,
                            labelStyle,
                            style: { width: "100%", ...fieldStyle, ...fieldSpec.style ?? {} }
                        });
                        const checked = String(fieldValue ?? defaultValue) === "true";
                        return stdFieldUI(createElement("span", { style: valueStyle }, checked === true ? "Yes" : "No"));
                    }, layout: layout, orientation: orientation, itemStyle: fieldStyle, style: { border: "0 solid blue", ...fieldGroupStyle } }) : createElement(Fragment, null),
                longTextFieldSpecs.length > 0 ? createElement(View, { "data-key": "long text fields", sourceData: longTextFieldSpecs, itemTemplate: ({ value: fieldSpec, index }) => {
                        const { fieldName, customName, defaultValue, title } = fieldSpec;
                        // const id = `${fieldName}-${index}`
                        const stdFieldUI = stdFieldUICtor({
                            title: title ?? initialCaps(spaceCase(fieldName)),
                            labelPosition,
                            labelStyle,
                            style: { width: "100%", ...fieldStyle, ...fieldSpec.style ?? {} }
                        });
                        const strValue = String(record[fieldName] ?? defaultValue ?? "N/A");
                        return stdFieldUI(createElement("span", { style: valueStyle }, strValue));
                    }, layout: layout, orientation: orientation, itemStyle: fieldStyle, style: { border: "0 solid magenta", ...fieldGroupStyle } }) : createElement(Fragment, null),
                mediaFieldSpecs.length > 0 ? createElement(View, { "data-key": "media fields", sourceData: mediaFieldSpecs, itemTemplate: ({ value: fieldSpec, index }) => {
                        const { fieldName, customName, title } = fieldSpec;
                        // const id = `${fieldName}-${index}`
                        const mediaItems = (record[fieldName] ?? []);
                        return (stdFieldUICtor({
                            title: title ?? initialCaps(spaceCase(fieldName)),
                            labelPosition,
                            labelStyle,
                            style: { width: "100%", ...fieldStyle, ...fieldSpec.style ?? {} }
                        })(createElement(MediaSetUI, { editing: "off", value: mediaItems, style: {
                                width: "100%", height: "12rem",
                                backgroundColor: "whitesmoke",
                                borderLeft: "thin solid gray",
                                ...valueStyle
                            } })));
                    }, layout: StackPanel, orientation: "vertical", itemsAlignH: "stretch", itemStyle: {}, style: { border: "0 solid cyan", ...fieldGroupStyle } }) : createElement(Fragment, null));
        };
    }
};
/*const StandardFieldView = function (args: StandardFieldViewerArgs) {
    const { value, title, orientation, style, labelStyle, valueStyle } = args
    return <StackPanel orientation={orientation ?? "vertical"} style={style} >
        <label style={labelStyle}> {title} </label>
        <div style={valueStyle}>{value ?? ""}</div>
    </StackPanel>
}*/
/*type StandardFieldViewerArgs = {
    value: any,
    name: string,
    title: string,
    orientation?: LayoutProps["orientation"]
    labelStyle?: CSSProperties,
    valueStyle?: CSSProperties,
    style?: CSSProperties,
}*/
//# sourceMappingURL=_viewing.js.map