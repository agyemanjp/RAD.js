import { createElement, Fragment, StackPanel, View, GridPanel, type CSSProperties, type LinkInfo } from "@agyemanjp/fxui"
import { rollupFilters, type Rec, type RecordFilter, type ResultBasic } from "@agyemanjp/standard"

import type { EntityRecordBase } from "../../schema"
import { getViewUrl, getCreateUrl } from "../../_routing"
import type { PageInfo } from "./base"
import type { FieldSpecs } from "../field"
import { type RecordsFilterUI, stdRecordFilterCtors, type RecordViewerUI, stdRecordViewCtors, type StdCardArgs, type PossibleValsDict } from "../record"
import { icons } from "../_icons"


/** Constructs basic page info out of input record-list page info */
export function makeRecordListPage<T extends EntityRecordBase>(info: RecordListPageInfo<T>): PageInfo<RecordListPageArgs<T>> {
	const { entityBasePath, title, relatedLinks, recordsCardUI, filterPanelUI } = info

	const FilterUI: RecordsFilterUI<T> = ("component" in filterPanelUI
		? filterPanelUI.component
		: stdRecordFilterCtors.listOfFieldUIs<T>({
			fieldSpecs: filterPanelUI.createFromFields,
			layout: StackPanel,
			orientation: "vertical",
			labelPosition: "top",
			valueStyle: { width: "100%" },
			labelStyle: {},
			fieldStyle: { gap: "0.25rem", width: "100%", overflow: "hidden" },
			style: { gap: "0.25rem", paddingRight: "0.5rem" }
		})
	)

	const CardUI: RecordViewerUI<T> = ("component" in recordsCardUI
		? recordsCardUI.component
		: stdRecordViewCtors.cardOfTextAndImages({
			mapper: recordsCardUI.createFromMapper,
			layout: "textOverImage"
		})
	)

	return {
		path: `${entityBasePath}-list`,
		title: () => title,
		links: () => relatedLinks,
		ui: Promise.resolve((args) => {
			// console.log(`Starting UI comp fx for list page "${title}", with args: ${stringify(args)}`)
			const { records, filter, possibleValsDict, allowCreate } = args

			return <>
				<div data-key="filters-&-data" style={{ gap: "0.25rem" }}>
					<StackPanel data-key="filter-panel"
						orientation="vertical"
						itemsAlignV="center"
						style={{
							float: "left",
							width: "20rem",
							overflowX: "hidden",
							borderRight: "thin solid silver"
						}}>

						<FilterUI
							filter={filter ? filter.type === "ok" ? filter.value : undefined : undefined}
							applyCommand={["Apply", icons.Search, (atomicFilters) => {
								return Promise
									.resolve(atomicFilters)
									.then(rollupFilters)
									.then(JSON.stringify)
									.then(btoa)
									.then(strFilter => {
										location.href = `/${entityBasePath}?filter=${strFilter}`
									})
							}]}
							possibleValsDict={possibleValsDict}
						/>

						{filter && filter.type === "error"
							? <i>Filter in request unusable and not applied</i>
							: <></>
						}
					</StackPanel>

					{records.type === "ok"
						? <View data-key="data-panel"
							sourceData={allowCreate ? [undefined, ...records.value] : records.value}
							itemTemplate={({ value: record, index }) => {
								const style = {
									height: "9rem", width: "15rem",
									borderRadius: "0.25rem"
								} satisfies CSSProperties

								const cardElt = record
									? <a href={getViewUrl(entityBasePath, record.id)} style={{}}>
										<CardUI record={record}
											possibleValsDict={{}}
											commands={[]}
											style={{
												fontSize: "1.25rem",
												fontWeight: "bold",
												...style
											}}
										/>
									</a>

									: <a href={getCreateUrl(entityBasePath)}>
										<StackPanel
											itemsAlignH="center"
											itemsAlignV="center"
											orientation="vertical"
											style={{ border: "thin solid silver", ...style }}>
											<icons.PlusThin style={{ height: "40%" }} />Add New
										</StackPanel>
									</a>

								// console.log(`Card element for record: ${(p)} is: ${renderToString(cardElt)}`)
								return cardElt
							}}
							layout={GridPanel}
							orientation="horizontal"
							style={{
								float: "left",
								width: "calc(100% - 20rem)",
								flexGrow: "1",
								gap: "0.5rem",
								padding: "0.5rem",
								overflowX: "hidden"
							}}
						/>

						: <i>Data could not be retrieved: {records.error.errCode}</i>
					}
				</div>
			</>
		}),
		kind: "regular"
	} satisfies PageInfo<RecordListPageArgs<T>>
}

/** Specs for a page that manages a record list */
export type RecordListPageInfo<T extends EntityRecordBase> = {
	/** Base path, without initial slash */
	entityBasePath: string

	title: string

	/** Links to related pages */
	relatedLinks: LinkInfo[]

	/** Component that provides UI for each item in list */
	recordsCardUI: { component: RecordViewerUI<T> } | { createFromMapper: (x: T) => StdCardArgs }

	/** UI component that provides a panel of inputs for filtering the list
	 * If not provided, a default algorithm will be used to generate the filtering panel ui
	 */
	filterPanelUI: (| { component: RecordsFilterUI<T> } | { createFromFields: FieldSpecs<T> })
}

/** Dynamic args for record list page UI component */
export type RecordListPageArgs<T extends Rec> = {
	records: ResultBasic<T[]>,
	filter?: ResultBasic<RecordFilter<T, "AND">>
	possibleValsDict: PossibleValsDict<T>
	allowCreate: boolean
}