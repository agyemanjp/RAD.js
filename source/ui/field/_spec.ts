import type { InputHTMLAttributes, CSSProperties } from "@agyemanjp/fxui"
import { type Rec, type Primitive, createRanker, hasValue, Vector, Tuple, isArray } from "@agyemanjp/standard"

import type { Validator } from "./_validators"


/** Gets ordered named field specs */
export function getOrderedNamedFieldSpecs<T extends Rec>(fields: FieldSpecs<T>): Vector<FieldSpec<T[keyof T]> & { fieldName: string }> {
	return isArray(fields)
		? new Vector(fields).map(_ => ({ ..._[1], fieldName: _[0] as string }))
		: (new Vector(Object.entries(fields))
			.map((_: [keyof T, undefined | FieldSpec<T[keyof T]>]) => ({ fieldName: _[0], field: _[1] }))
			.filter(["by-typeguard", (_): _ is { fieldName: keyof T; field: FieldSpec<T[keyof T]> } => hasValue(_.field)])
			.sort(createRanker(_ => _.field.ordinal ?? 0))
			.map(_ => ({ ..._.field, fieldName: _.fieldName }) as FieldSpec<T[keyof T]> & { fieldName: string })
		)
}

/** Record of field specs for a record type T */
export type FieldSpecs<T extends Rec> = { [k in keyof T]?: FieldSpec<T[k]> } | Tuple<keyof T, FieldSpec<T[keyof T]>>[]

/** Specs that define fundamental UI-related properties of a field */
export type FieldSpec<T> = (
	| NumericField
	| TextField
	| ToggleField
	| ChoiceField<T>
	| EmailField
	| PasswordField
	| MediaField
	// | HiddenField<T>
)

/** Field for choosing a boolean value, as a toggle 
 * (i.e. a value is always chosen, there is no undefined state) 
 */
export type ToggleField = FieldSpecBase & {
	type: "toggle",
	defaultValue: boolean // initial value
}
/** Field for choosing a value from two or more values */
export type ChoiceField<T = Primitive> = FieldSpecBase & {
	type: "choice",
	possibleVals: "get-from-provider" | T[] | { value: T, title: string }[],
	defaultValue?: T
	isRequired?: boolean
}
/** Field for selecting media */
export type MediaField = FieldSpecBase & {
	type: "media",

	/** Maximum size of individual media items accepted by field */
	maxItemSizeKb?: number

	/** Maximum number of media items needed for this field to have a valid value */
	maxItemsCount?: number

	/** Minimum number of media items needed for this field to have a valid value */
	minItemsCount?: number

	/** Comma-separated list of media types accepted, e.g., 'image/*,video/*,etc' */
	mediaTypesAllowed?: InputHTMLAttributes<HTMLInputElement>["accept"]
}
export type NumericField = FieldSpecBase & {
	type: "number"
	isRequired?: boolean
	defaultValue?: number
	// possibleValues: number[] | { value: number, title: string }[],

	/** Validators (in addition to the type-based defaults) */
	validators?: Validator<number>[]
	/** Formatter (overrides the type-based default */
	formatter?: (val: number) => string
}
export type TextField = FieldSpecBase & {
	type: "text"
	isRequired?: boolean
	defaultValue?: string

	/** Validators (in addition to the type-based defaults) */
	validators?: Validator<string>[]
	/** Formatter (overrides the type-based default */
	formatter?: (val: string) => string,

	isLong?: boolean
}
export type PasswordField = FieldSpecBase & {
	type: "password"
	/** Validators (in addition to type-based defaults) */
	validators?: Validator<string>[]
	/** Formatter (overrides the type-based default */
	formatter?: (val: string) => string
}
export type EmailField = FieldSpecBase & {
	type: "email"
	/** Validators (in addition to type-based defaults) */
	validators?: Validator<string>[]
	/** Formatter (overrides the type-based default */
	formatter?: (val: string) => string
}
// export type HiddenField<T = any> = FieldSpecBase & {
// 	type: "hidden"
// 	getDefaultValue?: () => T
// }

type FieldSpecBase = {
	/** Optional name that overrides the field key in a FieldSpecs record */
	customName?: string,

	/** Optional title for the field, used for captions, etc */
	title?: string,

	/** Ordinal position of this field for display */
	ordinal?: number

	style?: CSSProperties
}