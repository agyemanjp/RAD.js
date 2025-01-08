import { type Primitive } from "@agyemanjp/standard";
export declare const standardValidators: {
    unique: <T>(cfg: {
        values: T[];
    }) => Validator<T>;
    required: (cfg: {
        deep?: boolean;
    }) => Validator<any>;
    emailAddress: () => Validator<string>;
    password: (rules?: {}) => Validator<string>;
};
export type Validator<T = Primitive> = (val: T) => boolean;
export type ValidatorFactory<Cfg = any, T extends Primitive = any> = (cfg: Cfg) => Validator<T>;
