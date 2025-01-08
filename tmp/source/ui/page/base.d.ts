import { type Component, type LinkInfo } from "@agyemanjp/fxui";
import { type Rec } from "@agyemanjp/standard";
export declare function makePage<T extends Rec>(page: PageInfo<T>): PageInfo<T>;
export declare function mountPage<T extends Rec>(PageComponent: Component<T>, corePageElementId: string, corePageEltPropsAttribName: string): void;
export type PageInfo<T extends Rec> = {
    /** page path without initial slash. Determines route path, bundle file name, etc for the page. */
    path: string;
    /** Main title of page */
    title: (args: T) => string;
    /** Description or sub-title of page */
    description?: (args: T) => string;
    /** Get links to related pages, actions, etc., based on page's runtime args */
    links: (args: T) => LinkInfo[];
    /** Component that provides the UI for the page */
    ui: Promise<Component<T & {
        targetResolution: "mobile" | "desktop";
        children?: never;
    }>>;
    /** Page kind. Determines contextual layout, main/auth menu, etc. Default is "regular" */
    kind?: ("auth" | "hero" | "centered" | "regular");
};
