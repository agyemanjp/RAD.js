import { type LinkInfo, type Icon } from "@agyemanjp/fxui";
import { type Rec, type RecordFilter, type ResultBasic } from "@agyemanjp/standard";
import type { EntityRecordBase } from "../../schema";
import type { PageInfo } from "./base";
import type { FieldSpecs } from "../field";
import { type RecordsFilterUI, type RecordViewerUI, type StdCardArgs, type PossibleValsDict } from "../record";
/** Constructs basic page info out of input record-list page info */
export declare function makeRecordListPage<T extends EntityRecordBase>(info: RecordListPageInfo<T>): PageInfo<RecordListPageArgs<T>>;
/** Specs for creating a page that manages a record list */
export type RecordListPageInfo<T extends EntityRecordBase> = {
    /** Base path, without initial slash */
    entityBasePath: string;
    title: string;
    /** Links to related pages */
    relatedLinks: LinkInfo[];
    /** Component that provides UI for each item in list */
    recordsCardUI: {
        component: RecordViewerUI<T>;
    } | {
        createFromMapper: (x: T) => StdCardArgs;
    };
    /** UI component that provides a panel of inputs for filtering the list
     * If not provided, a default algorithm will be used to generate the filtering panel ui
     */
    filterPanelUI: ({
        component: RecordsFilterUI<T>;
    } | {
        createFromFields: FieldSpecs<T>;
    });
    icons: {
        addNew: Icon;
        search: Icon;
    };
};
/** Dynamic args for record list page UI component */
export type RecordListPageArgs<T extends Rec> = {
    records: ResultBasic<T[]>;
    filter?: ResultBasic<RecordFilter<T, "AND">>;
    possibleValsDict: PossibleValsDict<T>;
    allowCreate: boolean;
};
