import { makeRecordListPage } from "./_record-list-page";
import { makeRecordPage } from "./_record-page";
export function makePagesForEntity(pagesInfo) {
    const { list, one, getTitle } = pagesInfo;
    return ({
        list: makeRecordListPage(list),
        one: makeRecordPage(one, getTitle)
    });
}
//# sourceMappingURL=_entity-page.js.map