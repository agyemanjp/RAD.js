import { createElement, View, StackPanel, SwitchUI, DropdownChoiceInput, InputChoiceButtons, CmdButton, InputText, inputDomainTuples } from "@agyemanjp/fxui";
import { initialCaps, spaceCase, flattenFilters } from "@agyemanjp/standard";
import {} from "./common";
import { getOrderedNamedFieldSpecs } from "../field/_spec";
import { stdFieldUICtor } from "../field/_ui";
export const stdRecordFilterCtors = {
    listOfFieldUIs: function (args) {
        const { fieldSpecs, layout, labelPosition, orientation, style: styleStatic, fieldStyle, labelStyle, valueStyle, wrapInForm } = args;
        return ({ filter, applyCommand, lastError, possibleValsDict, style: styleDynamic }, setProps) => {
            const [caption, icon, action] = applyCommand ?? [];
            const atomicFilters = filter ? flattenFilters(filter) : [];
            const onValChangeCtor = (matchedFilter) => (newVal) => {
                if (matchedFilter)
                    matchedFilter[2] = newVal;
                if (lastError) {
                    setProps?.({ lastError: undefined });
                }
            };
            // console.log(`atomicFilters: ${stringify(atomicFilters)}`)
            return createElement(StackPanel, { orientation: "vertical" },
                createElement(View, { sourceData: getOrderedNamedFieldSpecs(fieldSpecs), itemTemplate: ({ value: fieldSpec, index }) => {
                        const { fieldName, title, customName, ordinal } = fieldSpec;
                        // const matchedFilter = atomicFilters.find(f => f[0] === fieldName)
                        const stdFieldUI = stdFieldUICtor({
                            title: title ?? initialCaps(spaceCase(fieldName)),
                            labelPosition,
                            labelStyle,
                            style: { ...fieldStyle, ...fieldSpec.style ?? {} }
                        });
                        switch (fieldSpec.type) {
                            case "choice": {
                                const matchedFilter = atomicFilters.find(f => f[0] === fieldName && f[1] === "equals");
                                const filterValue = String(matchedFilter?.[2] ?? fieldSpec.defaultValue);
                                const possibleVals = possibleValsDict ? possibleValsDict[fieldName] : undefined;
                                const possibleValuesNormalized = (fieldSpec.domain === "get-from-provider"
                                    ? (possibleVals ?? [])
                                    : inputDomainTuples(fieldSpec.domain));
                                // const possibleValueStrings = possibleValuesNormalized.map(v => v.value)
                                return stdFieldUI(possibleValuesNormalized.length > 5
                                    ? createElement(DropdownChoiceInput, { choices: possibleValuesNormalized, value: filterValue, onValueChanged: onValChangeCtor(matchedFilter), style: valueStyle })
                                    : createElement(InputChoiceButtons, { domain: possibleValuesNormalized, onValueChanged: onValChangeCtor(matchedFilter), value: filterValue, layout: StackPanel, orientation: "horizontal", style: valueStyle ?? {} }));
                            }
                            case "toggle": {
                                const matchedFilter = atomicFilters.find(f => f[0] === fieldName && f[1] === "equals");
                                return stdFieldUI(createElement(SwitchUI, { value: (matchedFilter?.[2] ?? fieldSpec.defaultValue) === true, onValueChanged: onValChangeCtor(matchedFilter), caption: "", style: valueStyle }));
                            }
                            case "number": {
                                const matchedMinFilter = atomicFilters.find(f => f[0] === fieldName && f[1] === "greater-than-or-equals");
                                const matchedMaxFilter = atomicFilters.find(f => f[0] === fieldName && f[1] === "less-than-or-equals");
                                const filterValMin = String(matchedMinFilter?.[2] ?? fieldSpec.defaultValue);
                                const filterValMax = String(matchedMaxFilter?.[2] ?? fieldSpec.defaultValue);
                                return createElement(StackPanel, { orientation: "horizontal", style: { gap: "0.25rem", width: "100%" /*, border: "thin solid magenta"*/ } },
                                    stdFieldUI(createElement(InputText, { value: filterValMin, onValueChanged: onValChangeCtor(matchedMinFilter) }), {
                                        titleCustom: `Minimum ${title}`,
                                        styleCustom: { width: "50%" }
                                    }),
                                    stdFieldUI(createElement(InputText, { value: filterValMax, onValueChanged: onValChangeCtor(matchedMaxFilter) }), {
                                        titleCustom: `Maximum ${title}`,
                                        styleCustom: { width: "50%" }
                                    }));
                            }
                            case "text":
                            default: {
                                const matchedFilter = atomicFilters.find(f => f[0] === fieldName && f[1] === "starts-with");
                                return stdFieldUI(createElement(InputText, { value: String(matchedFilter?.[2] ?? ""), onValueChanged: onValChangeCtor(matchedFilter), style: valueStyle }));
                            }
                        }
                    }, layout: layout, orientation: orientation, itemStyle: fieldStyle, style: { gap: "inherit", width: "100%", ...styleStatic, ...styleDynamic } }),
                createElement(StackPanel, { "data-key": "commands", style: { gap: "1rem" }, itemsAlignV: "center" },
                    createElement(CmdButton, { icon: icon, onClick: (e) => {
                            action?.(atomicFilters).then(err => {
                                if (err)
                                    setProps?.({ lastError: err.description });
                            });
                        } }, caption)),
                createElement("div", { "data-key": "error-box", style: { color: "magenta", flexGrow: "1" } }, lastError));
        };
    }
};
//# sourceMappingURL=_filtering.js.map