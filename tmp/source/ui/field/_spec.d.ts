import type { InputHTMLAttributes, CSSProperties } from "@agyemanjp/fxui";
import { type Rec, Vector, Tuple } from "@agyemanjp/standard";
import type { Validator } from "./_validators";
import type { Primitive } from "../base";
/** Gets ordered named field specs */
export declare function getOrderedNamedFieldSpecs<T extends Rec<Primitive>>(fields: FieldSpecs<T>): Vector<FieldSpec<any> & {
    fieldName: string;
}>;
/** Record of field specs for a record type T */
export type FieldSpecs<T extends Rec<Primitive>> = {
    [k in keyof T]?: FieldSpec<T[k]>;
} | Tuple<keyof T, FieldSpec<T[keyof T]>>[];
/** Specs that define fundamental UI-related properties of a field */
export type FieldSpec<T extends Primitive> = (T extends Date ? (DateField) : T extends string ? (TextField | EmailField | PasswordField | AddressField | ChoiceField | MultiChoiceField | MediaField) : T extends number ? (NumericField | NumericChoiceField | NumericMultiChoiceField | TimeOfDayField) : T extends boolean ? (ToggleField) : never);
/** Field for choosing a boolean value, as a toggle
 * (i.e. a value is always chosen, there is no undefined state)
 */
export type ToggleField = FieldSpecBase & {
    type: "toggle";
    defaultValue: boolean;
};
/** Field for choosing a value from two or more values */
export type ChoiceField = FieldSpecBase<string> & {
    type: "choice";
    domain: "get-from-provider" | Tuple<string, string>[];
};
/** Field for choosing a value from two or more values */
export type NumericChoiceField = FieldSpecBase<number> & {
    type: "num-choice";
    domain: "get-from-provider" | Tuple<number, string>[];
};
/** Field for choosing multiple values (stored & read as comma-separated values) from two or more values. */
export type MultiChoiceField = FieldSpecBase<string> & {
    type: "multi-choice";
    domain: "get-from-provider" | Tuple<string, string>[];
};
/** Field for choosing multiple values (stored & read as comma-separated values) from two or more values. */
export type NumericMultiChoiceField = FieldSpecBase<number> & {
    type: "num-multi-choice";
    domain: "get-from-provider" | Tuple<number, string>[];
};
/** Field for selecting media, stored & read as JSON formatted string of arrays of media items */
export type MediaField = FieldSpecBase<string> & {
    type: "media";
    /** Maximum size of individual media items accepted by field */
    maxItemSizeKb?: number;
    /** Maximum number of media items needed for this field to have a valid value */
    maxItemsCount?: number;
    /** Minimum number of media items needed for this field to have a valid value */
    minItemsCount?: number;
    /** Comma-separated list of media types accepted, e.g., 'image/*,video/*,etc' */
    mediaTypesAllowed?: InputHTMLAttributes<HTMLInputElement>["accept"];
};
/** Field for a single image, stored & read as a uRL string */
export type ImageField = FieldSpecBase<string> & {
    type: "image";
    /** Maximum size of image file accepted */
    maxItemSizeKb?: number;
};
export type NumericField = FieldSpecBase<number> & {
    type: "number";
};
/** Date field based on ISO 8601 (yyyy-mm-dd) string values */
export type DateField = FieldSpecBase<string> & {
    type: "date";
};
/** Date-time-stamp field based Unix/JS epochs */
export type DateTimeStampField = FieldSpecBase<number> & {
    type: "date-time-stamp";
};
/** Time field based on number of minutes since start of day */
export type TimeOfDayField = FieldSpecBase<number> & {
    type: "time-of-day";
};
export type TextField = FieldSpecBase<string> & {
    type: "text";
    isLong?: boolean;
};
export type PasswordField = FieldSpecBase<string> & {
    type: "password";
};
export type EmailField = FieldSpecBase<string> & {
    type: "email";
};
export type AddressField = FieldSpecBase<string> & {
    type: "address";
};
export type FieldSpecBase<T extends Primitive = Primitive> = {
    /** Optional name that overrides the field key in a FieldSpecs record */
    customName?: string;
    /** Optional title for the field, used for captions, etc */
    title?: string;
    isRequired?: boolean;
    /** Optional default value */
    defaultValue?: T;
    /** Validators (in addition to the type-based defaults) */
    validators?: Validator<T>[];
    /** Formatter (overrides the type-based default */
    formatter?: (val: T) => string;
    /** Ordinal position of this field for display */
    ordinal?: number;
    style?: CSSProperties;
};
