import { assert, except, filter, hasValue, initialCaps, isArray, isObject, type Predicate, type Rec, spaceCase, Tuple, type TypeGuard } from "@agyemanjp/standard"
import { createElement, Fragment, StackPanel, MediaSetUI, InputChoiceButtons, DropdownChoiceInput, SwitchUI, View, InputText, CmdButton, InputMultiChoiceButtons, inputDomainTuples } from "@agyemanjp/fxui"
import type { CSSProperties, Icon, MediaItem, ViewProps } from "@agyemanjp/fxui"

import type { RecordEditorUI } from "./common"
import { type AddressField, type ChoiceField, type DateField, type DateTimeStampField, type EmailField, type FieldSpec, type FieldSpecBase, type FieldSpecs, getOrderedNamedFieldSpecs, type MediaField, type MultiChoiceField, type NumericChoiceField, type NumericField, type NumericMultiChoiceField, type PasswordField, type TextField, type ToggleField } from "../field/_spec"
import { stdFieldUICtor } from "../field/_ui"
import type { Primitive } from "../base"

export const recordEditorGenerators = {
	/** Field UIs (one for each field in input field specs arg) laid out according to layout arg */
	fieldEditorsGroup: <T extends Rec<Primitive>>(args
		: {
			fieldSpecs: FieldSpecs<T>
			// fieldChangeHandlers?: { [k in keyof T]?: () => string },
			labelPosition: "top" | "left" | "bottom" | "off"
			styles: {
				/** Style applied to each field input */
				inputs?: CSSProperties,

				/** Style applied to each field label */
				labels?: CSSProperties,

				/** Style applied to each field container */
				fields?: CSSProperties

				/** Style applied to each group of field containers */
				fieldGroups?: CSSProperties

				cmdItems?: CSSProperties
				cmdsContainer?: CSSProperties


				/** Style applied to entire container */
				main?: CSSProperties
			},
			addNewIcon: Icon,
			trashIcon: Icon
		} & Pick<ViewProps, "layout" | "orientation" | "itemsAlignH" | "itemsAlignV">): RecordEditorUI<T> => {

		const { fieldSpecs, layout, labelPosition, orientation, itemsAlignH, itemsAlignV, styles, addNewIcon, trashIcon } = args
		const { main: styleStatic, cmdItems: cmdItemStyle, cmdsContainer: cmdsContainerStyle, fields: fieldStyle, fieldGroups: fieldGroupStyle, labels: labelStyle, inputs: valueStyle } = styles
		// console.log(`Editor field specs keys: ${Object.keys(fieldSpecs)}`)

		const orderedNamedFieldSpecs = getOrderedNamedFieldSpecs(fieldSpecs)
		const specsFilter = <F extends FieldSpecBase<any>>(predicate: Predicate<FieldSpec<T[keyof T]>, undefined>) => {
			const guard: TypeGuard<any, F & { fieldName: string }> =
				(spec): spec is F & { fieldName: string } => predicate(spec, undefined)
			return filter(orderedNamedFieldSpecs, ["by-typeguard", guard] as const)
		}
		const longTextFieldSpecs = [...specsFilter<TextField>(spec => spec.type === "text" && spec.isLong === true)]
		const mediaFieldSpecs = [...specsFilter<MediaField>(spec => spec.type === "media")]
		const toggleFieldSpecs = [...specsFilter<ToggleField>(spec => spec.type === "toggle")]
		const otherFieldSpecs = [
			...except(orderedNamedFieldSpecs,
				longTextFieldSpecs,
				mediaFieldSpecs,
				toggleFieldSpecs)
		] as ((TextField | ChoiceField | NumericChoiceField | NumericMultiChoiceField | MultiChoiceField | EmailField | PasswordField | AddressField | NumericField | DateField | DateTimeStampField) & {
			fieldName: string
		})[]
		// const hiddenFieldSpecs = [...specsFilter<HiddenField>(spec => spec.type === "hidden")]
		// console.log(`RemainderFieldSpecs names: ${map(remainderFieldSpecs, _ => _.fieldName)}`)

		const getStdFieldUI = (field: FieldSpec<any> & { fieldName: string }) => stdFieldUICtor({
			title: field.title ?? initialCaps(spaceCase(field.fieldName)),
			labelPosition,
			labelStyle,
			style: { width: "100%", ...fieldStyle, ...field.style ?? {} }
		})

		return ({ record, commands, lastError, possibleValsDict, style: styleDynamic }, setProps) => {
			// console.log(`Record input to editor: ${stringify(record)}`)
			const recordState = { ...record }
			const onValChangeCtor = (fieldName: string) => (newValue: any) => {
				(recordState as Rec)[fieldName] = newValue
				setProps?.({ record: { ...recordState } }, false)
				// console.log(`RecordState is now: ${stringify(recordState)}`)
				// onRecordChanged?.({ fieldName, newValue })
				if (lastError) { setProps?.({ lastError: undefined }) }
			}

			return <StackPanel
				orientation="vertical"
				style={{ gap: "inherit", ...styleStatic, ...styleDynamic }}>

				{otherFieldSpecs.length > 0 ? <View data-key="other fields"
					sourceData={otherFieldSpecs}
					itemTemplate={({ value: fieldSpec, index }) => {
						const { fieldName, type } = fieldSpec
						const stdFieldUI = getStdFieldUI(fieldSpec as FieldSpec<any> & { fieldName: string })
						const onValChange = onValChangeCtor(fieldName)

						switch (type) {
							case "choice":
							case "num-choice":
							case "multi-choice":
							case "num-multi-choice": {
								const possibleValsNormalized = (fieldSpec.domain === "get-from-provider"
									? (possibleValsDict ? possibleValsDict[fieldName]! : [])
									: (fieldSpec.domain).map(_ => [String(_[0]), _[1]] as Tuple<string, string>)
								)
								// console.log(`PossibleValuesNormalized: ${JSON.stringify(possibleValuesNormalized)}`)
								const possibleValueStrings = possibleValsNormalized.map(v => String(v[0]))
								// console.log(`possibleValueStrings for ${fieldName}: ${JSON.stringify(possibleValueStrings)}`)

								const value = String(recordState[fieldName] ?? fieldSpec.defaultValue ?? "")

								return stdFieldUI(possibleValueStrings.length < 5
									? (type === "choice"
										? <InputChoiceButtons
											onValueChanged={onValChange}
											value={value}
											domain={possibleValsNormalized}
											layout={StackPanel}
											orientation="horizontal"
											itemStyle={{}}
											selectedItemStyle={{}}
											style={{ ...valueStyle }}
										/>
										: <InputMultiChoiceButtons
											onValueChanged={onValChange}
											value={value.split(",").map(_ => _.trim())}
											domain={possibleValsNormalized}
											layout={StackPanel}
											orientation="horizontal"
											itemStyle={{}}
											selectedItemStyle={{}}
											style={{ ...valueStyle }}
										/>
									)
									: possibleValueStrings.length < 25
										? <DropdownChoiceInput
											onValueChanged={onValChange}
											choices={possibleValsNormalized}
											value={value}
											style={valueStyle}
										/>

										: <InputText
											value={value}
											onValueChanged={onValChange}
											choices={possibleValueStrings}
											style={valueStyle}
										/>
								)
							}

							case "date-time-stamp":
							case "address": {
								return <input />
							}

							default: {
								// assert(type !== "toggle" && type !== "media")
								const defaultValue = "defaultValue" in fieldSpec ? fieldSpec.defaultValue : ""
								const value = String(recordState[fieldName] ?? defaultValue ?? "")

								return stdFieldUI(<InputText
									type={type} value={value}
									onValueChanged={onValChange}
									style={valueStyle}
								/>)
							}
						}
					}}
					layout={layout}
					orientation={orientation}
					itemsAlignH={itemsAlignH}
					itemsAlignV={itemsAlignV}
					itemStyle={fieldStyle}
					style={{ gap: "0.25rem", border: "0 solid orange", ...fieldGroupStyle }}
				/> : <></>}

				{toggleFieldSpecs.length > 0 ? <View data-key="toggle fields"
					sourceData={toggleFieldSpecs}
					itemTemplate={({ value: fieldSpec, index }) => {
						const { fieldName, customName, title, defaultValue, ordinal } = fieldSpec
						const fieldValue = recordState[fieldName]

						return getStdFieldUI(fieldSpec)(<SwitchUI
							value={String(fieldValue ?? defaultValue) === "true"}
							style={valueStyle}
						/>)
					}}
					layout={layout}
					orientation={orientation}
					itemsAlignH={itemsAlignH}
					itemsAlignV={itemsAlignV}
					itemStyle={fieldStyle}
					style={{ border: "0 solid blue", ...fieldGroupStyle }}
				/> : <></>}

				{longTextFieldSpecs.length > 0 ? <View data-key="long text fields"
					sourceData={longTextFieldSpecs}
					itemTemplate={({ value: fieldSpec, index }) => {
						const { fieldName, customName, defaultValue, title } = fieldSpec
						return getStdFieldUI(fieldSpec)(<InputText onValueChanged={onValChangeCtor(fieldName)}
							value={String(recordState[fieldName] ?? defaultValue ?? "")}
							style={valueStyle}
						/>)
					}}
					layout={layout}
					orientation={orientation}
					itemsAlignH={itemsAlignH}
					itemsAlignV={itemsAlignV}
					itemStyle={fieldStyle}
					style={{ border: "0 solid magenta", ...fieldGroupStyle }}
				/> : <></>}

				{mediaFieldSpecs.length > 0
					? <View data-key="media fields"
						sourceData={mediaFieldSpecs}
						itemTemplate={({ value: fieldSpec, index }) => {
							const { fieldName, customName, title } = fieldSpec
							const mediaItems = (recordState[fieldName] ?? []) as MediaItem[]

							return getStdFieldUI(fieldSpec)(<MediaSetUI
								value={mediaItems}
								onValueChanged={onValChangeCtor(fieldName)}
								editing={{
									maxItems: fieldSpec.maxItemsCount,
									addNewIcon,
									trashIcon
								}}
								style={{
									width: "100%",
									height: "12rem",
									backgroundColor: "whitesmoke" as any,
									borderLeft: "thin solid gray",
									...valueStyle
								}}
							/>)
						}}
						layout={StackPanel}
						orientation={"vertical"}
						itemsAlignH="stretch"
						itemStyle={{}}
						style={{ border: "0 solid cyan", ...fieldGroupStyle }}
					/>
					: <></>
				}

				<StackPanel data-key="commands" style={{ gap: "1rem", ...cmdsContainerStyle }} itemsAlignV="center" itemsAlignH="center">
					{[...filter(commands, ["by-typeguard", hasValue])].map(([caption, icon, action]) => <CmdButton
						icon={icon}
						onClick={(e) => {
							// console.log(`RecordState input to editor action: ${stringify(recordState)}`)
							action(recordState as T).then(err => {
								if (err) setProps?.({ lastError: err.description })
							})
						}}
						style={{ ...cmdItemStyle ?? {} }}>
						{caption}
					</CmdButton>)}
				</StackPanel>

				<div data-key="error-box" style={{ color: "maroon", textAlign: "center", flexGrow: "1" }}>
					{lastError}
				</div>

			</StackPanel>
		}
	}
} satisfies Rec<(...args: any[]) => RecordEditorUI<any>>


///** Generates a list of field UIs that comprise a form for editing a record */
/*export function getRecordEditingFieldUIs<T extends Rec>(args
	: {
		fieldSpecs: FieldSpecs<T>,
		panel?: Component<HtmlProps & LayoutProps>
		orientation?: LayoutProps["orientation"]
		itemStyle?: CSSProperties
		style?: CSSProperties
	}): FieldUI<T[keyof T]>[] {

	const { fieldSpecs, panel, orientation, style, itemStyle } = args

	return getOrderedNamedFieldSpecs(fieldSpecs).map(_ => {
		const { fieldName, ...fieldSpec } = _
		const { type, ordinal, title } = fieldSpec

	}).toArray()
}*/

/*case "toggle": {
	return stdFieldUI(<SwitchUI
		// id={id}
		name={inputName}
		isChecked={String(strFieldValue) === "true"}
		style={valueStyle}
	/>)
}*/
/*case "media": {
	const mediaItems = (record[fieldName]) as MediaItem[]
	return stdFieldUI(<MediaSetUI
		value={mediaItems}
		editing={{
			name: inputName,
			onItemsAdded: () => { },
			onItemRemoved: () => { }
		}}
		style={valueStyle}
	/>)
}*/

/*(fieldSpec.isLong ?? false)? <textarea
	// id={id}
	name={inputName}
	value={String(record[fieldName] ?? fieldSpec.defaultValue "")}
	defaultValue={fieldSpec.defaultValue}
	style={valueStyle}
/>:*/