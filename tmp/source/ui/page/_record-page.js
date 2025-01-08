// Only type imports can be static?
import { stringifyError } from "@agyemanjp/standard";
import { httpToStdErrorCodeMap } from "@agyemanjp/http";
export function makeRecordPage(pageInfo, getTitle) {
    const { entityBasePath, newRecordTitle, editUI, viewUI, icons } = pageInfo;
    return {
        path: `${entityBasePath}-rec`,
        title: (args) => {
            if (args.mode === "create")
                return newRecordTitle;
            else {
                if (args.recordResult.type === "error") {
                    console.error(`Record for generating title could not be retrieved`);
                    console.error(stringifyError(args.recordResult.error));
                    return "?";
                }
                else {
                    return getTitle(args.recordResult.value);
                }
            }
        },
        links: (args) => {
            const mode = args.mode;
            switch (mode) {
                case "create":
                case "edit":
                case "view":
                case "delete": return [];
                default: {
                    if (args.recordResult.type === "error")
                        return [];
                    const entityPath = `${entityBasePath}/${args.recordResult.value.id}`;
                    const editPath = `${entityPath}?mode=edit`;
                    return (mode === "view-can-edit-&-delete")
                        ? [
                            { anchor: "Edit", url: editPath },
                            { anchor: "Delete", url: `${entityPath}?mode=delete` },
                        ]
                        : [
                            { anchor: "Edit", url: editPath }
                        ];
                }
            }
        },
        ui: Promise
            .all([
            import("@agyemanjp/standard"),
            import("@agyemanjp/fxui"),
            import("../record"),
            // import("../../../pages")
        ])
            .then(_modules => {
            const { getIdUnique } = _modules[0];
            const { createElement, Fragment, StackPanel, GridPanel, CmdButton: CommandBox } = _modules[1];
            const { recordEditorGenerators: stdRecordEditorCtors, stdRecordViewCtors } = _modules[2];
            const EditUI = ("component" in editUI
                ? editUI.component
                : stdRecordEditorCtors.fieldEditorsGroup({
                    fieldSpecs: editUI.createFromFields,
                    layout: GridPanel,
                    orientation: "horizontal",
                    labelPosition: "top",
                    styles: {
                        inputs: { width: "100%" },
                        labels: { width: "auto", },
                        fields: { width: "30%", minWidth: "15rem", flexGrow: "1", gap: "0.25em" },
                        fieldGroups: { gap: "0.25rem", borderTop: "0 solid silver" },
                        main: { gap: "1rem" }
                    },
                    trashIcon: icons.delete,
                    addNewIcon: icons.addNew
                }));
            const ViewUI = ("component" in viewUI
                ? viewUI.component
                : stdRecordViewCtors.listOfFieldUIs({
                    fieldSpecs: viewUI.createFromFields,
                    layout: GridPanel,
                    orientation: "horizontal",
                    labelPosition: "top",
                    styles: {
                        values: {},
                        labels: { width: "auto", borderBottom: "thin solid silver" },
                        fields: { width: "30%", minWidth: "15rem", flexGrow: "1", gap: "0.25rem" },
                        fieldGroups: { gap: "0.75rem", borderTop: "0 solid silver" },
                        main: { gap: "1rem" }
                    }
                }));
            return (args) => {
                const recordId = ("newRecord" in args
                    ? args.newRecord.id
                    : args.recordResult.type === "ok"
                        ? args.recordResult.value.id
                        : undefined) ?? getIdUnique();
                const urls = {
                    recordPost: `${entityBasePath}`, // no id since they are embedded in the records already
                    recordPut: `${entityBasePath}`,
                    recordDelete: `${entityBasePath}/${recordId}`,
                    afterCreate: `${entityBasePath}`,
                    afterEdit: `${entityBasePath}/${recordId}?mode=view`,
                    afterDelete: `${entityBasePath}`,
                    editPage: `${entityBasePath}/${recordId}?mode=edit`,
                    ...(pageInfo.urls ? pageInfo.urls(recordId) : {})
                };
                const action = (mode, record) => {
                    const methodMap = {
                        "insert": "POST",
                        "update": "PUT",
                        "delete": "DELETE"
                    };
                    const actionUrlMap = {
                        "insert": "recordPost",
                        "update": "recordPut",
                        "delete": "recordDelete"
                    };
                    const redirectUrlMap = {
                        "insert": "afterCreate",
                        "update": "afterEdit",
                        "delete": "afterDelete"
                    };
                    return fetch(`${actionUrlMap[mode]}`, {
                        method: methodMap[mode],
                        headers: mode === "delete" ? {} : {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: mode === "delete" ? undefined : JSON.stringify(record)
                    }).then(response => {
                        if (response.ok) {
                            location.href = redirectUrlMap[mode];
                        }
                        else {
                            return {
                                errCode: httpToStdErrorCodeMap[response.status] ?? "general",
                                description: `Unable to ${mode} data: ${response.statusText === "Unprocessable Entity"
                                    ? "Bad or Incomplete Input"
                                    : response.statusText}`
                            };
                        }
                    });
                };
                return createElement(StackPanel, { "data-key": "fields-&-media", orientation: "vertical", style: { gap: "0.5rem" } }, (() => {
                    switch (args.mode) {
                        case "create": return createElement(EditUI, { record: args.newRecord, commands: [["Save", icons.save, rec => action("insert", rec)]], possibleValsDict: args.possibleValsDict });
                        case "edit": return (args.recordResult.type === "ok"
                            ? createElement(EditUI, { record: args.recordResult.value, commands: [["Save", icons.save, rec => action("update", rec)]], possibleValsDict: args.possibleValsDict })
                            : createElement(Fragment, null,
                                "Error fetching/displaying data: ",
                                args.recordResult.error.errCode));
                        case "delete": return createElement(StackPanel, { itemsAlignH: "center", itemsAlignV: "center", orientation: "vertical", style: { gap: "1rem", width: "100%", height: "100%", border: "0 solid orange" } },
                            createElement("h3", { style: { textAlign: "center", width: "25%" } }, "Are you sure you want to delete this record?"),
                            createElement(StackPanel, { itemsAlignH: "center", itemsAlignV: "center", style: { gap: "1rem", width: "25%", border: "0 solid blue" } },
                                createElement(CommandBox, { "data-key": "delete-button", icon: icons.delete, style: { width: "12rem", height: "2rem" }, onClick: (e) => { action("delete", {}); } },
                                    createElement("span", { style: { whiteSpace: "nowrap" } }, "Yes, Delete")),
                                createElement(CommandBox, { "data-key": "cancel-button", icon: icons.cancel, style: { width: "12rem", height: "2rem" }, onClick: e => `location.href="${entityBasePath}/${recordId}"` },
                                    createElement("span", { style: { whiteSpace: "nowrap" } }, "No, Cancel"))));
                        // view mode variants 
                        default:
                            args.mode;
                            return args.recordResult.type === "ok"
                                ? createElement(ViewUI, { record: args.recordResult.value, commands: [
                                        args.mode !== "view"
                                            ? ["Edit", icons.edit, rec => action("insert", rec)]
                                            : undefined,
                                        args.mode === "view-can-edit-&-delete"
                                            ? ["Delete", icons.delete, rec => action("delete", rec)]
                                            : undefined
                                    ], possibleValsDict: args.possibleValsDict })
                                : createElement(Fragment, null,
                                    "Error fetching/displaying data: ",
                                    args.recordResult.error.errCode);
                    }
                })());
            };
        }),
        kind: "regular"
    }; //satisfies PageInfo<RecordUIArgs<T>>
}
/** Collects record editor input values and uses them to create a record. Runs on client */
/* function saveRecord<T extends Rec>(args: { record: T, actionUrl: string, redirectUrl: string, mode: "insert" | "update" }) {
    const { record, actionUrl, redirectUrl, mode } = args

    const value = (() => {
        switch (spec?.type) {
            case "numeric": return Number.parseFloat(_value)
            case "toggle": return _value === "on" ? true : false
            default: return _value
        }
    })()
}*/
//# sourceMappingURL=_record-page.js.map