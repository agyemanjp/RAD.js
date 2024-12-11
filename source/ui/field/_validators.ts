import { hasValue, type Rec, type Primitive } from "@agyemanjp/standard"

export const standardValidators = {
	unique: <T,>(cfg: { values: T[] }): Validator<T> => val => !cfg.values.includes(val),
	required: (cfg: { deep?: boolean }): Validator<any> => val => hasValue(val, cfg.deep === true ? "deep" : undefined),
	emailAddress: (): Validator<string> => val => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val),
	password: (rules?: {}): Validator<string> => val => val.length >= 3 && val.length <= 20
} satisfies Rec<ValidatorFactory>

export type Validator<T = Primitive> = (val: T) => boolean

export type ValidatorFactory<Cfg = any, T extends Primitive = any> = (cfg: Cfg) => Validator<T>

