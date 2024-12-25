// Only type imports can be static?

import type { StdError, Rec, ResultBasic } from "@agyemanjp/standard"
import { httpToStdErrorCodeMap, type Method, type StatusCode } from "@agyemanjp/http"

import type { EntityRecordBase } from "../../schema"
import type { RecordEditorUI, RecordViewerUI, PossibleValsDict } from "../record"
import type { FieldSpecs } from "../field"
import type { PageInfo } from "./base"
import type { Icon } from "@agyemanjp/fxui/components"
import type { Primitive } from "../base"

export function makeRecordPage<T extends EntityRecordBase>(pageInfo: RecordPageInfo<T>, getTitle: (_: T) => string): PageInfo<RecordPageArgs<T>> {
	const { entityBasePath, newRecordTitle, editUI, viewUI, icons } = pageInfo

	return {
		path: `${entityBasePath}-rec`,

		title: (args) => (args.mode === "create"
			? newRecordTitle
			: args.recordResult.type === "ok"
				? getTitle(args.recordResult.value)
				: `Data for generating title could not be retrived: ${args.recordResult.error.errCode}`
		),

		links: (args) => {
			const mode = args.mode
			switch (mode) {
				case "create":
				case "edit":
				case "view":
				case "delete": return []

				default: {
					if (args.recordResult.type === "error") return []
					const entityPath = `${entityBasePath}/${args.recordResult.value.id}`
					const editPath = `${entityPath}?mode=edit`

					return (mode === "view-can-edit-&-delete")
						? [
							{ anchor: "Edit", url: editPath },
							{ anchor: "Delete", url: `${entityPath}?mode=delete` },
						]

						: [
							{ anchor: "Edit", url: editPath }
						]
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
				const { getIdUnique } = _modules[0]
				const { createElement, Fragment, StackPanel, GridPanel, CmdButton: CommandBox } = _modules[1]
				const { recordEditorGenerators: stdRecordEditorCtors, stdRecordViewCtors } = _modules[2]

				const EditUI: RecordEditorUI<T> = ("component" in editUI
					? editUI.component
					: stdRecordEditorCtors.fieldEditorsGroup<T>({
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
					})
				)
				const ViewUI: RecordViewerUI<T> = ("component" in viewUI
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
					})
				)

				return (args) => {
					const recordId = ("newRecord" in args
						? (args.newRecord as Partial<T>).id
						: args.recordResult.type === "ok"
							? args.recordResult.value.id
							: undefined
					) ?? getIdUnique()

					const urls: Required<ReturnType<Required<RecordPageInfo<T>>["urls"]>> = {
						recordPost: `${entityBasePath}`, // no id since they are embedded in the records already
						recordPut: `${entityBasePath}`,
						recordDelete: `${entityBasePath}/${recordId}`,

						afterCreate: `${entityBasePath}`,
						afterEdit: `${entityBasePath}/${recordId}?mode=view`,
						afterDelete: `${entityBasePath}`,

						editPage: `${entityBasePath}/${recordId}?mode=edit`,

						...(pageInfo.urls ? pageInfo.urls(recordId) : {})
					}

					const action = (mode: "insert" | "update" | "delete", record: T): Promise<undefined | StdError> => {
						const methodMap = {
							"insert": "POST",
							"update": "PUT",
							"delete": "DELETE"
						} satisfies Rec<Method, typeof mode>
						const actionUrlMap = {
							"insert": "recordPost",
							"update": "recordPut",
							"delete": "recordDelete"
						} satisfies Rec<keyof typeof urls, typeof mode>
						const redirectUrlMap = {
							"insert": "afterCreate",
							"update": "afterEdit",
							"delete": "afterDelete"
						} satisfies Rec<keyof typeof urls, typeof mode>

						return fetch(`${actionUrlMap[mode]}`, {
							method: methodMap[mode],
							headers: mode === "delete" ? {} : {
								"Content-Type": "application/json",
								"Accept": "application/json"
							},
							body: mode === "delete" ? undefined : JSON.stringify(record)
						}).then(response => {
							if (response.ok) {
								location.href = redirectUrlMap[mode]
							}
							else {
								return {
									errCode: httpToStdErrorCodeMap[response.status as StatusCode] ?? "general",
									description: `Unable to ${mode} data: ${response.statusText === "Unprocessable Entity"
										? "Bad or Incomplete Input"
										: response.statusText}`
								} satisfies StdError
							}
						})
					}

					return <StackPanel data-key="fields-&-media" orientation="vertical" style={{ gap: "0.5rem" }}>
						{(() => {
							switch (args.mode) {
								case "create": return <EditUI
									record={args.newRecord}
									commands={[["Save", icons.save, rec => action("insert", rec)]]}
									possibleValsDict={args.possibleValsDict}
								/>

								case "edit": return (args.recordResult.type === "ok"
									? <EditUI
										record={args.recordResult.value}
										commands={[["Save", icons.save, rec => action("update", rec)]]}
										possibleValsDict={args.possibleValsDict}
									/>

									: <>Error fetching/displaying data: {args.recordResult.error.errCode}</>
								)

								case "delete": return <StackPanel
									itemsAlignH="center"
									itemsAlignV="center"
									orientation="vertical"
									style={{ gap: "1rem", width: "100%", height: "100%", border: "0 solid orange" }}>

									<h3 style={{ textAlign: "center", width: "25%" }}>Are you sure you want to delete this record?</h3>

									<StackPanel itemsAlignH="center" itemsAlignV="center" style={{ gap: "1rem", width: "25%", border: "0 solid blue" }}>
										<CommandBox data-key="delete-button" icon={icons.delete} style={{ width: "12rem", height: "2rem" }}
											onClick={(e) => { action("delete", {} as T) }}>
											<span style={{ whiteSpace: "nowrap" }}>Yes, Delete</span>
										</CommandBox>

										<CommandBox data-key="cancel-button" icon={icons.cancel} style={{ width: "12rem", height: "2rem" }}
											onClick={e => `location.href="${entityBasePath}/${recordId}"`}>
											<span style={{ whiteSpace: "nowrap" }}>No, Cancel</span>
										</CommandBox>
									</StackPanel>
								</StackPanel>

								// view mode variants 
								default: args.mode; return args.recordResult.type === "ok"
									? <ViewUI
										record={args.recordResult.value}
										commands={[
											args.mode !== "view"
												? ["Edit", icons.edit, rec => action("insert", rec)]
												: undefined,
											args.mode === "view-can-edit-&-delete"
												? ["Delete", icons.delete, rec => action("delete", rec)]
												: undefined
										]}
										possibleValsDict={args.possibleValsDict}
									/>
									: <>Error fetching/displaying data: {args.recordResult.error.errCode}</>
							}
						})()}
					</StackPanel>
				}
			}),
		kind: "regular"
	} //satisfies PageInfo<RecordUIArgs<T>>
}

/** Specs used to construct a page that manages a record */
export type RecordPageInfo<T extends Rec<Primitive>> = {
	entityBasePath: string

	/** Title for record type to use when creating new record */
	newRecordTitle: string

	/** Collection of field inputs for editing/creating record; Not wrapped in a form, since container will take care of that */
	editUI: (
		| {
			/** Fully self-contained component with inputs and submit button  */
			component: RecordEditorUI<T>
		}
		| { createFromFields: FieldSpecs<T> }
	)

	/** Collection of field elements for viewing record */
	viewUI: (
		| { component: RecordViewerUI<T> }
		| { createFromFields: FieldSpecs<T> }
	)

	/** Optional generator of URLs for various operations. If any such URL is not provided, a default is used */
	urls?: (id: string) => {
		editPage?: string

		recordPost?: string
		recordPut?: string
		recordDelete?: string

		afterCreate?: string
		afterEdit?: string,
		afterDelete?: string
	}

	icons: { addNew: Icon, save: Icon, edit: Icon, delete: Icon, cancel: Icon }
}

/** Dynamic args for record page UI component */
export type RecordPageArgs<T extends Rec> = (
	| { recordResult: ResultBasic<T>, mode: "view" | "view-can-edit" | "view-can-edit-&-delete" | "edit" | "delete" }
	| { newRecord: Partial<T>, mode: "create" }
) & {
	possibleValsDict: PossibleValsDict<T>
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



