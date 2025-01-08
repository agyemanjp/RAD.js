import type { EntityRecordBase } from "../../schema";
import { type RecordListPageInfo } from "./_record-list-page";
import { type RecordPageInfo } from "./_record-page";
export declare function makePagesForEntity<T extends EntityRecordBase>(pagesInfo: {
    list: RecordListPageInfo<T>;
    one: RecordPageInfo<T>;
    getTitle: (_: T) => string;
}): {
    list: import("./base").PageInfo<import("./_record-list-page").RecordListPageArgs<T>>;
    one: import("./base").PageInfo<import("./_record-page").RecordPageArgs<T>>;
};
