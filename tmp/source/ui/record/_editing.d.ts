import { type Rec } from "@agyemanjp/standard";
import type { CSSProperties, Icon, ViewProps } from "@agyemanjp/fxui";
import type { RecordEditorUI } from "./common";
import { type FieldSpecs } from "../field/_spec";
import type { Primitive } from "../base";
export declare const recordEditorGenerators: {
    /** Field UIs (one for each field in input field specs arg) laid out according to layout arg */
    fieldEditorsGroup: <T extends Rec<Primitive>>(args: {
        fieldSpecs: FieldSpecs<T>;
        labelPosition: "top" | "left" | "bottom" | "off";
        styles: {
            /** Style applied to each field input */
            inputs?: CSSProperties;
            /** Style applied to each field label */
            labels?: CSSProperties;
            /** Style applied to each field container */
            fields?: CSSProperties;
            /** Style applied to each group of field containers */
            fieldGroups?: CSSProperties;
            cmdItems?: CSSProperties;
            cmdsContainer?: CSSProperties;
            /** Style applied to entire container */
            main?: CSSProperties;
        };
        addNewIcon: Icon;
        trashIcon: Icon;
    } & Pick<ViewProps, "layout" | "orientation" | "itemsAlignH" | "itemsAlignV">) => RecordEditorUI<T>;
};
