import { StackPanel, createElement } from "@agyemanjp/fxui";
import { httpToStdErrorCodeMap } from "@agyemanjp/http";
import { ensureStartsWith } from "@agyemanjp/standard";
import { recordEditorGenerators } from "../record";
export function makeAuthPage(argsForFactory) {
    const { path, title, links, actionUrl, fields, icons } = argsForFactory;
    return {
        path,
        title: () => title,
        links: () => links,
        ui: Promise.resolve((args) => {
            const { redirectUrl, previousError, id, "data-peer-id": peerId, children, ...authParams } = args;
            const EditorInputs = recordEditorGenerators.fieldEditorsGroup({
                fieldSpecs: fields,
                layout: StackPanel,
                orientation: "vertical",
                itemsAlignH: "center",
                styles: {
                    labels: { width: "100%" },
                    inputs: { width: "100%" },
                    fields: { gap: "0.1em", width: "100%" },
                    fieldGroups: {},
                    main: { width: "100%", gap: "0.75em" }
                },
                labelPosition: "top",
                addNewIcon: icons.addNew,
                trashIcon: icons.trash
                // itemStyle: { width: "100%", gap: "0.15em" }
            });
            return createElement(StackPanel, { orientation: "vertical", itemsAlignH: "center", style: { width: "100%", gap: "0.5em" } },
                createElement(EditorInputs, { record: authParams, commands: [
                        ["Submit", icons.action, (authInfo) => {
                                return fetch(ensureStartsWith(actionUrl, "/"), {
                                    method: "POST",
                                    body: JSON.stringify({
                                        remember: authInfo.remember,
                                        emaddr: authInfo.emailAddress,
                                        pwd: authInfo.password
                                    }),
                                    headers: { "Content-Type": "application/json", "Accept": "application/json" }
                                }).then(async (response) => {
                                    if (response.ok) {
                                        location.href = redirectUrl;
                                    }
                                    else {
                                        return {
                                            errCode: httpToStdErrorCodeMap[response.status] ?? "general",
                                            description: `${response.statusText === "Unprocessable Entity"
                                                ? "Bad or incomplete input"
                                                : response.statusText}: ${await response.text()}`
                                        };
                                    }
                                });
                            }]
                    ], possibleValsDict: {}, style: { width: "100%" } }));
        }),
        kind: "auth"
    };
}
//# sourceMappingURL=_auth-page.js.map