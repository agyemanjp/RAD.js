import { type Icon, type LinkInfo } from "@agyemanjp/fxui";
import type { PageInfo } from "./base";
import type { FieldSpecs } from "../field";
export declare function makeAuthPage(argsForFactory: {
    fields: FieldSpecs<AuthPageProps>;
    actionUrl: string;
    path: string;
    title: string;
    links: LinkInfo[];
    icons: {
        action: Icon;
        addNew: Icon;
        trash: Icon;
    };
}): PageInfo<AuthPageProps>;
export type AuthPageProps = {
    emailAddress?: string;
    password?: string;
    remember?: boolean;
    redirectUrl: string;
    previousError?: string;
};
