import { createElement, Fragment, StackPanel } from "@agyemanjp/fxui";
// import { Validator } from "./_validators"
/** Returns a function that receives a value ui and wraps a it in a container with a caption label attached.
 * Some members of args are optional since they could be embedded in the value UI directy.
 * The value UI could be anything that renders a field value, e.g., input, view, etc.
 */
export function stdFieldUICtor(args) {
    const { title, labelPosition, style, labelStyle } = args;
    return (valueUIElt, opts) => {
        const { titleCustom, styleCustom } = opts ?? {};
        const labelElt = labelPosition === "off"
            ? createElement(Fragment, null)
            : createElement("label", { style: labelStyle }, titleCustom ?? title);
        return createElement(StackPanel, { itemsAlignH: "start", itemsAlignV: "start", orientation: labelPosition === "left" ? "horizontal" : "vertical", style: { ...style, ...styleCustom ?? {} } }, labelPosition === "bottom" ? [valueUIElt, labelElt] : [labelElt, valueUIElt]);
    };
}
/*function makeFieldCtor<C extends Rec, T extends Primitive>(fieldCtor: FieldUICtor<C, T>): FieldUICtor<C, T> {
    return fieldCtor
}*/
/** Type of function that creates a field ui info based on some parameters */
/*export type FieldUICtor<Cfg extends Rec = Rec, T extends Primitive = Primitive> = (
    (cfg: Cfg & FieldUICtorArgsCore) => FieldUI<T>
)*/
/*export const standardFieldUIs = {
    emailEditor: makeFieldCtor<{ title?: string }, string>(
        ({ orientation, itemStyle: labelStyle, valueStyle, style, title, name }) => {
            // const defaults = {} satisfies typeof arguments
            const DEFAULT_TITLE = "email address"

            return (({ value, id }) => StandardEditor({
                value,
                id,
                name,
                type: "email",
                title: initialCaps(title ?? DEFAULT_TITLE),
                //placeholder: "Enter email address",
                onChange: "",
                orientation,
                style: { ...style, },
                itemStyle: labelStyle,
                valueStyle,
                autocomplete: "off", // "section-red email",
                autocapitalize: "none", autocorrect: "off",
                autofocus: true, required: true
            }))
        }
    ),

    emailViewer: makeFieldCtor<{ title?: string }, string>(
        ({ orientation, itemStyle: labelStyle, valueStyle, style, title, name }) => {
            const DEFAULT_TITLE = "email address"

            return (({ value, id }) => StandardFieldViewer({
                value,
                name,
                title: initialCaps(title ?? DEFAULT_TITLE),
                //placeholder: "Enter email address",
                orientation,
                style: { ...style, }, labelStyle, valueStyle,
            }))
        }
    ),

    passwordEditor: (({ rules, orientation, itemStyle: labelStyle, valueStyle, style, title, name, autocomplete }) => {
        const DEFAULT_TITLE = "password"
        const displayTitle = initialCaps(title ?? DEFAULT_TITLE)
        return makeField<string>({
            validators: [standardValidators.password(rules)],
            viewer: ({ value }) => getStandardViewer({ ...{ value, name, displayTitle, style, labelStyle, valueStyle, orientation } }),
            editor: ({ value, id, onChange, style: inputStyle }) => StandardEditor({
                ...{
                    id: `${id}_input`, name, type: "password",
                    displayTitle, placeholder: "Enter password",
                    autocomplete: autocomplete ?? "off", //"section-blue current-password",
                    onChange,
                    value,
                    style: { ...style, ...inputStyle },
                    itemStyle: labelStyle,
                    valueStyle,
                    orientation,
                    autocapitalize: "none",
                    autocorrect: "off",
                    autofocus: true,
                    required: true
                }
            })
        })
    }) satisfies FieldUICtor<{ rules?: Rec, title?: string, autocomplete?: string }>,

    toggle: (({ orientation, itemStyle: labelStyle, valueStyle, style, title, name }) => {
        const displayTitle = initialCaps(title)
        return makeField({
            validators: [],
            viewer: ({ value }) => <getStandardViewer {...{ value, name, displayTitle, style, labelStyle, valueStyle, orientation }} />,
            editor: ({ value, id, onChange, style: inputStyle }) => <getStandardEditor {
                ...{
                    id: `${id}_input`, type: "checkbox", name,
                    value,
                    displayTitle,
                    style: { ...style, ...inputStyle },
                    labelStyle,
                    valueStyle,
                    orientation,
                    onChange,
                }
            } />
        })
    }) satisfies FieldUICtor<{ title: string }>,

    text: (({ orientation, itemStyle: labelStyle, valueStyle, style, title, name, validators }) => {
        const displayTitle = initialCaps(title)
        return makeField<string>({
            validators: validators,
            viewer: ({ value }) => <getStandardViewer {...{ value, name, displayTitle, style, labelStyle, valueStyle, orientation }} />,
            editor: ({ value, id, onChange, style: inputStyle }) => <getStandardEditor {
                ...{
                    id: `${id}_input`, type: "text", name,
                    value,
                    displayTitle,
                    style: { ...style, ...inputStyle },
                    labelStyle,
                    valueStyle,
                    orientation,
                    onChange,
                }
            } />

        })
    }) satisfies FieldUICtor<{ title: string, validators: Validator[] }>
} satisfies Rec<FieldUICtor<any, any>>
*/
/*export function StandardEditor(args
    : FieldUICtorArgsCore & {
        type: InputHTMLAttributes<any>["type"],
        title: string,
        id?: string,
        value: any,
        onChange?: string,
        autocomplete?: InputHTMLAttributes<any>["autocomplete"],
        autocapitalize?: InputHTMLAttributes<any>["autocapitalize"],
        autocorrect?: InputHTMLAttributes<any>["autocorrect"],
        autofocus?: InputHTMLAttributes<any>["autofocus"],
        placeholder?: InputHTMLAttributes<any>["placeholder"],
        required?: boolean
    }) {
    const { id, name, type, value, style, itemStyle: labelStyle, valueStyle, title, orientation, ...inputProps } = args
    const inputId = `${id}_input`
    return <StackPanel orientation={orientation ?? "vertical"} style={style} id={id} >
        <label htmlFor={inputId} style={labelStyle}>{title}</label>
        <input
            id={inputId}
            name={name}
            type={type}
            value={value ?? ""}
            style={{ border: "solid thin gray", ...valueStyle }}

            {...inputProps}
        />
    </StackPanel>
}*/
//# sourceMappingURL=_ui.js.map