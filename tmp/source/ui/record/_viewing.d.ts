import { type Rec } from "@agyemanjp/standard";
import { type CSSProperties, type ViewProps, type Icon } from "@agyemanjp/fxui";
import type { RecordViewerUI } from "./common";
import { type FieldSpecs } from "../field/_spec";
import type { Primitive } from "../base";
export declare const stdRecordViewCtors: {
    cardOfTextAndImages: <T extends Rec<Primitive>>(args: {
        mapper: (x: T) => StdCardArgs;
        layout: StdCardLayout;
    }) => RecordViewerUI<T>;
    listOfFieldUIs: <T extends Rec<Primitive>>(args: {
        fieldSpecs: FieldSpecs<T>;
        fieldChangeHandlers?: { [k in keyof T]?: () => string; };
        layout: ViewProps["layout"];
        orientation?: ViewProps["orientation"];
        labelPosition: "top" | "left" | "bottom" | "off";
        styles: {
            /** Style applied to each field value */
            values?: CSSProperties;
            /** Style applied to each field label */
            labels?: CSSProperties;
            /** Style applied to each field */
            fields?: ViewProps["itemStyle"];
            /** Style applied to each field group */
            fieldGroups?: ViewProps["itemStyle"];
            /** Style applied to entire container */
            main?: CSSProperties;
        };
    }) => RecordViewerUI<T>;
};
export type StdCardArgs = {
    title: string;
    descriptors?: {
        caption?: string | Icon;
        text: string;
    }[];
    imageUrl: string;
};
type StdCardLayout = ("textOverImage" | "textAfterImage");
export {};
