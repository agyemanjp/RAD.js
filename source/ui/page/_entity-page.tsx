import type { EntityRecordBase } from "../../schema"
import { type RecordListPageInfo, makeRecordListPage } from "./_record-list-page"
import { type RecordPageInfo, makeRecordPage } from "./_record-page"

export function makePagesForEntity<T extends EntityRecordBase>(pagesInfo:
	{
		list: RecordListPageInfo<T>,
		one: RecordPageInfo<T>,
		getTitle: (_: T) => string
	}) {
	const { list, one, getTitle } = pagesInfo
	return ({
		list: makeRecordListPage(list),
		one: makeRecordPage(one, getTitle)
	})
}
