import { createElement, Fragment, StackPanel, View, GridPanel } from "@agyemanjp/fxui";
import { rollupFilters } from "@agyemanjp/standard";
import { getViewUrl, getCreateUrl } from "../../_routing";
import { stdRecordFilterCtors, stdRecordViewCtors } from "../record";
/** Constructs basic page info out of input record-list page info */
export function makeRecordListPage(info) {
    const { entityBasePath, title, relatedLinks, recordsCardUI, filterPanelUI, icons } = info;
    const FilterUI = ("component" in filterPanelUI
        ? filterPanelUI.component
        : stdRecordFilterCtors.listOfFieldUIs({
            fieldSpecs: filterPanelUI.createFromFields,
            layout: StackPanel,
            orientation: "vertical",
            labelPosition: "top",
            valueStyle: { width: "100%" },
            labelStyle: {},
            fieldStyle: { gap: "0.25rem", width: "100%", overflow: "hidden" },
            style: { gap: "0.25rem", paddingRight: "0.5rem" }
        }));
    const CardUI = ("component" in recordsCardUI
        ? recordsCardUI.component
        : stdRecordViewCtors.cardOfTextAndImages({
            mapper: recordsCardUI.createFromMapper,
            layout: "textOverImage"
        }));
    return {
        path: `${entityBasePath}-list`,
        title: () => title,
        links: () => relatedLinks,
        ui: Promise.resolve((args) => {
            // console.log(`Starting UI comp fx for list page "${title}", with args: ${stringify(args)}`)
            const { records, filter, possibleValsDict, allowCreate } = args;
            return createElement(Fragment, null,
                createElement("div", { "data-key": "filters-&-data", style: { gap: "0.25rem" } },
                    createElement(StackPanel, { "data-key": "filter-panel", orientation: "vertical", itemsAlignV: "center", style: {
                            float: "left",
                            width: "20rem",
                            overflowX: "hidden",
                            borderRight: "thin solid silver"
                        } },
                        createElement(FilterUI, { filter: filter ? filter.type === "ok" ? filter.value : undefined : undefined, applyCommand: ["Apply", icons.search, (atomicFilters) => {
                                    return Promise
                                        .resolve(atomicFilters)
                                        .then(rollupFilters)
                                        .then(JSON.stringify)
                                        .then(btoa)
                                        .then(strFilter => {
                                        location.href = `/${entityBasePath}?filter=${strFilter}`;
                                    });
                                }], possibleValsDict: possibleValsDict }),
                        filter && filter.type === "error"
                            ? createElement("i", null, "Filter in request unusable and not applied")
                            : createElement(Fragment, null)),
                    records.type === "ok"
                        ? createElement(View, { "data-key": "data-panel", sourceData: allowCreate ? [undefined, ...records.value] : records.value, itemTemplate: ({ value: record, index }) => {
                                const style = {
                                    height: "9rem", width: "15rem",
                                    borderRadius: "0.25rem"
                                };
                                const cardElt = record
                                    ? createElement("a", { href: getViewUrl(entityBasePath, record.id), style: {} },
                                        createElement(CardUI, { record: record, possibleValsDict: {}, commands: [], style: {
                                                fontSize: "1.25rem",
                                                fontWeight: "bold",
                                                ...style
                                            } }))
                                    : createElement("a", { href: getCreateUrl(entityBasePath) },
                                        createElement(StackPanel, { itemsAlignH: "center", itemsAlignV: "center", orientation: "vertical", style: { border: "thin solid silver", ...style } },
                                            createElement(icons.addNew, { style: { height: "40%" } }),
                                            "Add New"));
                                // console.log(`Card element for record: ${(p)} is: ${renderToString(cardElt)}`)
                                return cardElt;
                            }, layout: GridPanel, orientation: "horizontal", style: {
                                float: "left",
                                width: "calc(100% - 20rem)",
                                flexGrow: "1",
                                gap: "0.5rem",
                                padding: "0.5rem",
                                overflowX: "hidden"
                            } })
                        : createElement("i", null,
                            "Data could not be retrieved: ",
                            records.error.errCode)));
        }),
        kind: "regular"
    };
}
//# sourceMappingURL=_record-list-page.js.map