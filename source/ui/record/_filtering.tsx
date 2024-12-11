import { createElement, type CSSProperties, View, StackPanel, type ViewProps, SwitchUI, DropdownChoiceInput, InputChoiceButtons, type InputHTMLAttributes, type ComponentElement, CmdButton, InputText } from "@agyemanjp/fxui"
import { type Rec, isObject, initialCaps, spaceCase, flattenFilters, type FilterSingle } from "@agyemanjp/standard"

import { type RecordsFilterUI } from "./common"
import { type FieldSpecs, getOrderedNamedFieldSpecs } from "../field/_spec"
import { stdFieldUICtor } from "../field/_ui"

export const stdRecordFilterCtors = {
	listOfFieldUIs: function <T extends Rec>(args
		: {
			fieldSpecs: FieldSpecs<T>

			layout: ViewProps["layout"],
			orientation?: ViewProps["orientation"]

			labelPosition: "top" | "left" | "bottom" | "off"
			/** Style applied to each field */
			fieldStyle?: ViewProps["itemStyle"]
			/** Style applied to each field value */
			valueStyle?: CSSProperties,
			/** Style applied to each field label */
			labelStyle?: CSSProperties,
			/** Style applied to entire container */
			style?: CSSProperties,

			wrapInForm?: boolean
		}): RecordsFilterUI<T> {

		const { fieldSpecs,
			layout, labelPosition, orientation,
			style: styleStatic, fieldStyle, labelStyle, valueStyle,
			wrapInForm
		} = args

		return ({ filter, applyCommand, lastError, possibleValsDict, style: styleDynamic }, setProps) => {
			const [caption, icon, action] = applyCommand ?? []
			const atomicFilters = filter ? flattenFilters(filter) : []

			const onValChangeCtor = (matchedFilter?: FilterSingle<T>) => (newVal: any) => {
				if (matchedFilter) matchedFilter[2] = newVal
				if (lastError) { setProps?.({ lastError: undefined }) }
			}
			// console.log(`atomicFilters: ${stringify(atomicFilters)}`)

			return <StackPanel orientation="vertical">
				<View
					sourceData={getOrderedNamedFieldSpecs(fieldSpecs)}
					itemTemplate={({ value: fieldSpec, index }) => {
						const { fieldName, title, customName, ordinal } = fieldSpec
						// const matchedFilter = atomicFilters.find(f => f[0] === fieldName)

						const stdFieldUI = stdFieldUICtor({
							title: title ?? initialCaps(spaceCase(fieldName)),
							labelPosition,
							labelStyle,
							style: { ...fieldStyle, ...fieldSpec.style ?? {} }
						})

						switch (fieldSpec.type) {
							case "choice": {
								const matchedFilter = atomicFilters.find(f => f[0] === fieldName && f[1] === "equals")
								const filterValue = String(matchedFilter?.[2] ?? fieldSpec.defaultValue)

								const possibleVals = possibleValsDict ? possibleValsDict[fieldName] : undefined
								const possibleValuesNormalized = (fieldSpec.possibleVals === "get-from-provider"
									? (possibleVals ?? [])
									: fieldSpec.possibleVals.map(v => isObject(v)
										? { value: String(v.value), title: v.title }
										: { value: String(v), title: String(v) }
									)
								)
								// const possibleValueStrings = possibleValuesNormalized.map(v => v.value)

								return stdFieldUI(possibleValuesNormalized.length > 5
									? <DropdownChoiceInput
										choices={possibleValuesNormalized}
										value={filterValue}
										onValueChanged={onValChangeCtor(matchedFilter)}
										style={valueStyle}
									/>

									: <InputChoiceButtons
										choices={possibleValuesNormalized}
										onValueChanged={onValChangeCtor(matchedFilter)}
										value={filterValue}
										layout={StackPanel}
										orientation="horizontal"
										style={valueStyle ?? {}}
									/>
								)
							}

							case "toggle": {
								const matchedFilter = atomicFilters.find(f => f[0] === fieldName && f[1] === "equals")
								return stdFieldUI(<SwitchUI
									value={(matchedFilter?.[2] ?? fieldSpec.defaultValue) === true}
									onValueChanged={onValChangeCtor(matchedFilter)}
									caption=""
									style={valueStyle}
								/>)
							}

							case "number": {
								const matchedMinFilter = atomicFilters.find(f => f[0] === fieldName && f[1] === "greater-than-or-equals")
								const matchedMaxFilter = atomicFilters.find(f => f[0] === fieldName && f[1] === "less-than-or-equals")
								const filterValMin = String(matchedMinFilter?.[2] ?? fieldSpec.defaultValue)
								const filterValMax = String(matchedMaxFilter?.[2] ?? fieldSpec.defaultValue)

								return <StackPanel
									orientation={"horizontal"}
									style={{ gap: "0.25rem", width: "100%"/*, border: "thin solid magenta"*/ }}>

									{stdFieldUI(<InputText value={filterValMin} onValueChanged={onValChangeCtor(matchedMinFilter)} />, {
										titleCustom: `Minimum ${title}`,
										styleCustom: { width: "50%" }
									})}

									{stdFieldUI(<InputText value={filterValMax} onValueChanged={onValChangeCtor(matchedMaxFilter)} />, {
										titleCustom: `Maximum ${title}`,
										styleCustom: { width: "50%" }
									})}
								</StackPanel>
							}

							case "text":
							default: {
								const matchedFilter = atomicFilters.find(f => f[0] === fieldName && f[1] === "starts-with")
								return stdFieldUI(<InputText value={String(matchedFilter?.[2] ?? "")}
									onValueChanged={onValChangeCtor(matchedFilter)}
									style={valueStyle}
								/>)
							}
						}
					}}
					layout={layout}
					orientation={orientation}
					itemStyle={fieldStyle}
					style={{ gap: "inherit", width: "100%", ...styleStatic, ...styleDynamic }}
				/>

				<StackPanel data-key="commands" style={{ gap: "1rem" }} itemsAlignV="center">
					<CmdButton
						icon={icon}
						onClick={(e) => {
							action?.(atomicFilters).then(err => {
								if (err) setProps?.({ lastError: err.description })
							})
						}}>
						{caption}
					</CmdButton>
				</StackPanel>

				<div data-key="error-box" style={{ color: "magenta", flexGrow: "1" }}>
					{lastError}
				</div>

			</StackPanel>
		}
	}
} satisfies Rec<(...args: any[]) => RecordsFilterUI<any>>

