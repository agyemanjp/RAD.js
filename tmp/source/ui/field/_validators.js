import { hasValue } from "@agyemanjp/standard";
export const standardValidators = {
    unique: (cfg) => val => !cfg.values.includes(val),
    required: (cfg) => val => hasValue(val, cfg.deep === true ? "deep" : undefined),
    emailAddress: () => val => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val),
    password: (rules) => val => val.length >= 3 && val.length <= 20
};
//# sourceMappingURL=_validators.js.map