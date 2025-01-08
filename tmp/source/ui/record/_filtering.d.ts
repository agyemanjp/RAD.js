import { type CSSProperties, type ViewProps } from "@agyemanjp/fxui";
import { type Rec } from "@agyemanjp/standard";
import { type RecordsFilterUI } from "./common";
import { type FieldSpecs } from "../field/_spec";
import type { Primitive } from "../base";
export declare const stdRecordFilterCtors: {
    listOfFieldUIs: <T extends Rec<Primitive>>(args: {
        fieldSpecs: FieldSpecs<T>;
        layout: ViewProps["layout"];
        orientation?: ViewProps["orientation"];
        labelPosition: "top" | "left" | "bottom" | "off";
        /** Style applied to each field */
        fieldStyle?: ViewProps["itemStyle"];
        /** Style applied to each field value */
        valueStyle?: CSSProperties;
        /** Style applied to each field label */
        labelStyle?: CSSProperties;
        /** Style applied to entire container */
        style?: CSSProperties;
        wrapInForm?: boolean;
    }) => RecordsFilterUI<T>;
};
