import { type Component, type HtmlProps, type CSSProperties, type UIElement } from "@agyemanjp/fxui";
/** Returns a function that receives a value ui and wraps a it in a container with a caption label attached.
 * Some members of args are optional since they could be embedded in the value UI directy.
 * The value UI could be anything that renders a field value, e.g., input, view, etc.
 */
export declare function stdFieldUICtor(args: Pick<FieldUIArgs, "title" | "labelPosition" | "style" | "labelStyle">): (valueUIElt: UIElement, opts?: {
    titleCustom?: string;
    styleCustom?: CSSProperties;
}) => JSX.Element;
export type FieldUIArgs = {
    value?: any;
    title: string;
    labelPosition?: "top" | "left" | "bottom" | "off";
    /** Style for label */
    labelStyle?: CSSProperties;
    /** Style for value viewer or editor */
    valueStyle?: CSSProperties;
    /** Overall style */
    style?: CSSProperties;
};
/** Info used to generate UI representing a field */
export type FieldUI<T = string> = (Component<{
    value?: T;
    children?: never;
} & HtmlProps>);
/** Type of function that creates a field ui info based on some parameters */
