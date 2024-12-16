import type { Component, CSSProperties, Icon } from "@agyemanjp/fxui"
import type { FilterSingle, Rec, RecordFilter, StdError } from "@agyemanjp/standard"

// export type RecordUI<T extends Rec> = Component<{ record: T | "new", style?: CSSProperties, children?: never }>
export type RecordViewerUI<T extends Rec> = Component<{
	record: T,
	commands: (CommandInfo<T> | undefined)[]
	possibleValsDict: PossibleValsDict<T>
	style?: CSSProperties,
	children?: never
}>
export type RecordEditorUI<T extends Rec> = Component<{
	/** The record to edit */
	record: Partial<T>,
	// onRecordChanged?: (args: { fieldName: string, newValue: any }) => void
	commands: (CommandInfo<T> | undefined)[]
	lastError?: string
	possibleValsDict: PossibleValsDict<T>
	style?: CSSProperties
	children?: never
}>
export type RecordsFilterUI<T extends Rec> = Component<{
	filter?: RecordFilter<T, "AND">,
	applyCommand?: CommandInfo<FilterSingle<T>[]>
	lastError?: string
	possibleValsDict: PossibleValsDict<T>
	style?: CSSProperties,
	children?: never
}>

export type PossibleValsDict<T extends Rec> = { [k in keyof T]?: { value: string, title: string }[] }

export type CommandInfo<T> = [caption: string, icon: Icon | undefined, action: (record: T) => Promise<void | StdError>]



/** Get the effective name of an input element, by combining its field name with a form id for 
 * indicating which group/form of inputs it belongs to 
 */
/*export function getInputName(args: { formId: string, fieldName: string, customFieldName?: string }) {
	const { formId, fieldName, customFieldName } = args
	return formId.trim().length > 0
		? `${customFieldName ?? fieldName}-${formId}`
		: customFieldName ?? fieldName
}*/
