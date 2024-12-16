import { type Icon, type LinkInfo, StackPanel, createElement } from "@agyemanjp/fxui"
import { httpToStdErrorCodeMap, type StatusCode } from "@agyemanjp/http"
import { ensureStartsWith, type StdError } from "@agyemanjp/standard"

import type { PageInfo } from "./base"
import type { FieldSpecs } from "../field"
import { stdRecordEditorCtors } from "../record"

export function makeAuthPage(argsForFactory
	: {
		fields: FieldSpecs<AuthPageProps>
		actionUrl: string,
		path: string,
		title: string,
		links: LinkInfo[],
		icons: { action: Icon, addNew: Icon, trash: Icon }
	}): PageInfo<AuthPageProps> {

	const { path, title, links, actionUrl, fields, icons } = argsForFactory

	return {
		path,
		title: () => title,
		links: () => links,
		ui: Promise.resolve((args) => {
			const { redirectUrl, previousError, id, "data-peer-id": peerId, children, ...authParams } = args
			const EditorInputs = stdRecordEditorCtors.fieldEditorsGroup<AuthPageProps>({
				fieldSpecs: fields,
				layout: StackPanel,
				orientation: "vertical",
				itemsAlignH: "center",
				styles: {
					labels: { width: "100%" },
					values: { width: "100%" },
					fields: { gap: "0.1em", width: "100%" },
					fieldGroups: {},
					main: { width: "100%", gap: "0.75em" }
				},
				labelPosition: "top",
				addNewIcon: icons.addNew,
				trashIcon: icons.trash
				// itemStyle: { width: "100%", gap: "0.15em" }
			})

			return <StackPanel orientation="vertical" itemsAlignH="center" style={{ width: "100%", gap: "0.5em" }}>
				<EditorInputs
					record={authParams}
					commands={[
						["Submit", icons.action, (authInfo) => {
							return fetch(ensureStartsWith(actionUrl, "/"), {
								method: "POST",
								body: JSON.stringify({
									remember: authInfo.remember,
									emaddr: authInfo.emailAddress,
									pwd: authInfo.password
								}),
								headers: { "Content-Type": "application/json", "Accept": "application/json" }
							}).then(async response => {
								if (response.ok) {
									location.href = redirectUrl
								}
								else {
									return {
										errCode: httpToStdErrorCodeMap[response.status as StatusCode] ?? "general",
										description: `${response.statusText === "Unprocessable Entity"
											? "Bad or incomplete input"
											: response.statusText}: ${await response.text()}`
									} satisfies StdError
								}
							})
						}]
					]}
					possibleValsDict={{}}
					style={{ width: "100%" }}

				/>
				{/* <label style={{ color: "maroon", width: "100%" }}>{previousError ?? ""}</label> */}
			</StackPanel>
		}),
		kind: "auth"
	} satisfies PageInfo<AuthPageProps>
}

export type AuthPageProps = {
	emailAddress?: string
	password?: string
	remember?: boolean
	redirectUrl: string
	previousError?: string
}

