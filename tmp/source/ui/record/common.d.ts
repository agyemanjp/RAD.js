import type { Component, CSSProperties, Icon } from "@agyemanjp/fxui";
import type { FilterSingle, Rec, RecordFilter, StdError, Tuple } from "@agyemanjp/standard";
export type RecordViewerUI<T extends Rec> = Component<{
    record: T;
    commands: (CommandInfo<T> | undefined)[];
    possibleValsDict: PossibleValsDict<T>;
    style?: CSSProperties;
    children?: never;
}>;
export type RecordEditorUI<T extends Rec> = Component<{
    /** The record to edit */
    record: Partial<T>;
    commands: (CommandInfo<T> | undefined)[];
    lastError?: string;
    possibleValsDict: PossibleValsDict<T>;
    style?: CSSProperties;
    children?: never;
}>;
export type RecordsFilterUI<T extends Rec> = Component<{
    filter?: RecordFilter<T, "AND">;
    applyCommand?: CommandInfo<FilterSingle<T>[]>;
    lastError?: string;
    possibleValsDict: PossibleValsDict<T>;
    style?: CSSProperties;
    children?: never;
}>;
export type PossibleValsDict<T extends Rec> = {
    [k in keyof T]?: Tuple<string, string>[];
};
export type CommandInfo<T> = [
    caption: string,
    icon: Icon | undefined,
    action: (record: T) => Promise<void | StdError>
];
/** Get the effective name of an input element, by combining its field name with a form id for
 * indicating which group/form of inputs it belongs to
 */
