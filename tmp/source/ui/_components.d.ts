import { type InputComponent, type InputProps, type InputHTMLAttributes } from "@agyemanjp/fxui";
import { type OmitX } from "@agyemanjp/standard";
export declare const InputAddress: InputComponent<InputAddressProps>;
type InputAddressProps = InputProps<string> & OmitX<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    suggestions?: string[];
    useCurrentLocation?: boolean;
};
export declare const ToggleSwitch: InputComponent<ToggleSwitchProps>;
type ToggleSwitchProps = {
    value: boolean;
    onValueChanged?: (newValue: boolean) => void;
    style?: React.CSSProperties;
    onLabel?: string;
    offLabel?: string;
};
export {};
