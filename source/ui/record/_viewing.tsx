// import assert from "assert"
import { except, filter, hasValue, initialCaps, isObject, type Predicate, type Rec, spaceCase, Tuple, type TypeGuard } from "@agyemanjp/standard"
import { Fragment, type CSSProperties, View, createElement, StackPanel, type ViewProps, type MediaItem, MediaSetUI, type Icon, inputDomainTuples } from "@agyemanjp/fxui"

import type { RecordViewerUI } from "./common"
import { type FieldSpec, type FieldSpecBase, type FieldSpecs, getOrderedNamedFieldSpecs, type MediaField, type TextField, type ToggleField } from "../field/_spec"
import { stdFieldUICtor } from "../field/_ui"
import type { Primitive } from "../base"

export const stdRecordViewCtors = {
	cardOfTextAndImages: <T extends Rec<Primitive>>(args
		: {
			mapper: (x: T) => StdCardArgs,
			layout: StdCardLayout,
		}): RecordViewerUI<T> => {

		switch (args.layout) {
			case "textOverImage": return (props) => {
				const customRecord = args.mapper(props.record)
				return <StackPanel
					itemsAlignV="start" itemsAlignH="center"
					style={{ ...props.style, position: "relative" }}>

					<img src={customRecord.imageUrl} style={{ position: "absolute", height: "100%", width: "100%" }} />

					<div style={{ position: "absolute", height: "100%", width: "100%", background: "black", opacity: "0.5" }} />

					<StackPanel orientation="vertical"
						style={{
							color: "white",
							gap: "0.25rem",
							padding: "0.25rem",
							height: "100%",
							width: "100%",
							position: "absolute",
							overflow: "hidden"
						}}>
						<span>{customRecord.title}</span>
						{(customRecord.descriptors ?? []).map(_ => <StackPanel style={{ fontSize: "0.75em" }}>
							{typeof _.caption === "function" ? <_.caption /> : <></>}
							{typeof _.caption === "string" ? `${_.caption}: ` : ""}
							{_.text}
						</StackPanel>)}
					</StackPanel>
				</StackPanel>
			}

			case "textAfterImage": return (props) => {
				const customRecord = args.mapper(props.record)
				return <StackPanel
					style={{ gap: "0.25rem", fontSize: "1.25rem", fontWeight: "bold", ...props.style }}>

					<img src={customRecord.imageUrl} style={{ height: "100%", width: "50%" }} />
					<StackPanel orientation="vertical"
						style={{ gap: "0.25rem", height: "100%", width: "50%", overflow: "hidden" }}>
						<span>{customRecord.title}</span>
						{(customRecord.descriptors ?? []).map(_ => <StackPanel style={{ fontSize: "0.75em" }}>
							{typeof _.caption === "function" ? <_.caption /> : <></>}
							{typeof _.caption === "string" ? `${_.caption}: ` : ""}
							{_.text}
						</StackPanel>)}
					</StackPanel>
				</StackPanel>
			}
		}
	},

	listOfFieldUIs: <T extends Rec<Primitive>>(args
		: {
			fieldSpecs: FieldSpecs<T>
			fieldChangeHandlers?: { [k in keyof T]?: () => string },
			layout: ViewProps["layout"],
			orientation?: ViewProps["orientation"]
			labelPosition: "top" | "left" | "bottom" | "off"

			styles: {
				/** Style applied to each field value */
				values?: CSSProperties,

				/** Style applied to each field label */
				labels?: CSSProperties,

				/** Style applied to each field */
				fields?: ViewProps["itemStyle"]

				/** Style applied to each field group */
				fieldGroups?: ViewProps["itemStyle"]

				/** Style applied to entire container */
				main?: CSSProperties
			},
		}): RecordViewerUI<T> => {

		const { fieldSpecs, layout, labelPosition, orientation, styles } = args
		const { main: styleStatic, fields: fieldStyle, fieldGroups: fieldGroupStyle, labels: labelStyle, values: valueStyle } = styles

		const orderedNamedFieldSpecs = getOrderedNamedFieldSpecs(fieldSpecs)

		// const hiddenFieldSpecs = [...specsFilter<HiddenField>(spec => spec.type === "hidden")]
		const longTextFieldSpecs = [...specsFilter<TextField>(spec => spec.type === "text" && spec.isLong === true)]
		const mediaFieldSpecs = [...specsFilter<MediaField>(spec => spec.type === "media")]
		const toggleFieldSpecs = [...specsFilter<ToggleField>(spec => spec.type === "toggle")]
		const remainderFieldSpecs = [...except(orderedNamedFieldSpecs, longTextFieldSpecs, mediaFieldSpecs, toggleFieldSpecs)]
		// console.log(`RemainderFieldSpecs names: ${map(remainderFieldSpecs, _ => _.fieldName)}`)

		function specsFilter<F extends FieldSpecBase<any>>(predicate: Predicate<FieldSpec<any>, undefined>) {
			const guard: TypeGuard<any, F & { fieldName: string }> = (spec): spec is F & { fieldName: string } => {
				return predicate(spec, undefined)
			}
			return filter(orderedNamedFieldSpecs, ["by-typeguard", guard] as const)
		}

		return ({ record, possibleValsDict, style: styleDynamic }) => {
			return <StackPanel orientation="vertical" style={{ ...styleStatic, ...styleDynamic }}>
				{remainderFieldSpecs.length > 0 ? <View data-key="other fields"
					sourceData={remainderFieldSpecs}
					itemTemplate={({ value: fieldSpec, index }) => {
						const { fieldName, customName, title, ordinal } = fieldSpec
						const defaultValue = "defaultValue" in fieldSpec ? fieldSpec.defaultValue : undefined
						const formatter = "formatter" in fieldSpec ? fieldSpec.formatter as (val: any) => string : undefined
						const val = record[fieldName] ?? defaultValue
						const strValue = formatter
							? formatter(val as any)
							: String(hasValue(val, "deep") ? val : "N/A")

						const stdFieldUI = stdFieldUICtor({
							title: title ?? initialCaps(spaceCase(fieldName)),
							labelPosition,
							labelStyle,
							style: { width: "100%", ...fieldStyle, ...fieldSpec.style ?? {} }
						})

						switch (fieldSpec.type) {
							case "choice": {
								const possibleVals = possibleValsDict ? possibleValsDict[fieldName] : undefined
								const possibleValuesNormalized = (fieldSpec.domain === "get-from-provider"
									? (possibleVals ?? [])
									: inputDomainTuples(fieldSpec.domain).map(_ => [String(_[0]), _[1]] as Tuple<string, string>)
								)
								// console.log(`PossibleValuesNormalized: ${JSON.stringify(possibleValuesNormalized)}`)
								// console.log(`field value for toggle field "${fieldSpec.fieldName}": ${record[fieldName]}`)

								const title = possibleValuesNormalized?.find(_ => _[0] === record[fieldName])?.[1]
								// console.log(`field title for toggle field "${fieldSpec.fieldName}": ${title}`)

								const effectiveFieldValue = String(title ?? "N/A")
								// console.log(`effectiveFieldValue of field ${fieldName}: ${effectiveFieldValue}`)

								return stdFieldUI(<span style={valueStyle}>{effectiveFieldValue}</span>)
							}
							// case "text": /*assert((fieldSpec.isLong ?? false) === false)*/
							// case "email":
							// case "password":
							// case "number":
							default: return stdFieldUI(<span style={valueStyle}>{strValue}</span>)
						}
					}}
					layout={layout}
					orientation={orientation}
					itemStyle={fieldStyle}
					style={{ gap: "0.25rem", border: "0 solid orange", ...fieldGroupStyle }}
				/> : <></>}

				{toggleFieldSpecs.length > 0 ? <View data-key="toggle fields"
					sourceData={toggleFieldSpecs}
					itemTemplate={({ value: fieldSpec, index }) => {
						const { fieldName, title, defaultValue } = fieldSpec
						const fieldValue = record[fieldName]
						const id = `${fieldName}-${index}`
						const stdFieldUI = stdFieldUICtor({
							title: title ?? initialCaps(spaceCase(fieldName)),
							labelPosition,
							labelStyle,
							style: { width: "100%", ...fieldStyle, ...fieldSpec.style ?? {} }
						})

						const checked = String(fieldValue ?? defaultValue) === "true"
						return stdFieldUI(<span style={valueStyle}>
							{checked === true ? "Yes" : "No"}
						</span>)
					}}
					layout={layout}
					orientation={orientation}
					itemStyle={fieldStyle}
					style={{ border: "0 solid blue", ...fieldGroupStyle }}
				/> : <></>}

				{longTextFieldSpecs.length > 0 ? <View data-key="long text fields"
					sourceData={longTextFieldSpecs}
					itemTemplate={({ value: fieldSpec, index }) => {
						const { fieldName, customName, defaultValue, title } = fieldSpec
						// const id = `${fieldName}-${index}`
						const stdFieldUI = stdFieldUICtor({
							title: title ?? initialCaps(spaceCase(fieldName)),
							labelPosition,
							labelStyle,
							style: { width: "100%", ...fieldStyle, ...fieldSpec.style ?? {} }
						})

						const strValue = String(record[fieldName] ?? defaultValue ?? "N/A")
						return stdFieldUI(<span style={valueStyle}>{strValue}</span>)
					}}
					layout={layout}
					orientation={orientation}
					itemStyle={fieldStyle}
					style={{ border: "0 solid magenta", ...fieldGroupStyle }}
				/> : <></>}

				{mediaFieldSpecs.length > 0 ? <View data-key="media fields"
					sourceData={mediaFieldSpecs}
					itemTemplate={({ value: fieldSpec, index }) => {
						const { fieldName, customName, title } = fieldSpec
						// const id = `${fieldName}-${index}`

						const mediaItems = (record[fieldName] ?? []) as MediaItem[]

						return (stdFieldUICtor(
							{
								title: title ?? initialCaps(spaceCase(fieldName)),
								labelPosition,
								labelStyle,
								style: { width: "100%", ...fieldStyle, ...fieldSpec.style ?? {} }
							})(<MediaSetUI
								editing={"off"}
								value={mediaItems}
								style={{
									width: "100%", height: "12rem",
									backgroundColor: "whitesmoke" as any,
									borderLeft: "thin solid gray",
									...valueStyle
								}}
							/>)
						)
					}}
					layout={StackPanel}
					orientation={"vertical"}
					itemsAlignH="stretch"
					itemStyle={{}}
					style={{ border: "0 solid cyan", ...fieldGroupStyle }}
				/> : <></>}
			</StackPanel>
		}
	}
} satisfies Rec<(...args: any[]) => RecordViewerUI<any>>


export type StdCardArgs = {
	title: string,
	descriptors?: { caption?: string | Icon, text: string }[],
	imageUrl: string
}
type StdCardLayout = (
	| "textOverImage"
	| "textAfterImage"
)

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
