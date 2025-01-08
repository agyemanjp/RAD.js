import { type Rec, type ResultBasic } from "@agyemanjp/standard";
import type { EntityRecordBase } from "../../schema";
import type { RecordEditorUI, RecordViewerUI, PossibleValsDict } from "../record";
import type { FieldSpecs } from "../field";
import type { PageInfo } from "./base";
import type { Icon } from "@agyemanjp/fxui/components";
import type { Primitive } from "../base";
export declare function makeRecordPage<T extends EntityRecordBase>(pageInfo: RecordPageInfo<T>, getTitle: (_: T) => string): PageInfo<RecordPageArgs<T>>;
/** Specs used to construct a page that manages a record */
export type RecordPageInfo<T extends Rec<Primitive>> = {
    entityBasePath: string;
    /** Title for record type to use when creating new record */
    newRecordTitle: string;
    /** Collection of field inputs for editing/creating record; Not wrapped in a form, since container will take care of that */
    editUI: ({
        /** Fully self-contained component with inputs and submit button  */
        component: RecordEditorUI<T>;
    } | {
        createFromFields: FieldSpecs<T>;
    });
    /** Collection of field elements for viewing record */
    viewUI: ({
        component: RecordViewerUI<T>;
    } | {
        createFromFields: FieldSpecs<T>;
    });
    /** Optional generator of URLs for various operations. If any such URL is not provided, a default is used */
    urls?: (id: string) => {
        editPage?: string;
        recordPost?: string;
        recordPut?: string;
        recordDelete?: string;
        afterCreate?: string;
        afterEdit?: string;
        afterDelete?: string;
    };
    icons: {
        addNew: Icon;
        save: Icon;
        edit: Icon;
        delete: Icon;
        cancel: Icon;
    };
};
/** Dynamic args for record page UI component */
export type RecordPageArgs<T extends Rec> = ({
    recordResult: ResultBasic<T>;
    mode: "view" | "view-can-edit" | "view-can-edit-&-delete" | "edit" | "delete";
} | {
    newRecord: Partial<T>;
    mode: "create";
}) & {
    possibleValsDict: PossibleValsDict<T>;
};
/** Collects record editor input values and uses them to create a record. Runs on client */
