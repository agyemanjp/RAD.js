import { type Component, createElement, type UIElement, mountElement, type LinkInfo } from "@agyemanjp/fxui"
import { type Rec, assert, type ArgsType } from "@agyemanjp/standard"

export function makePage<T extends Rec>(page: PageInfo<T>): PageInfo<T> { return page }

// executed on client
export function mountPage<T extends Rec>(PageComponent: Component<T>, corePageElementId: string, corePageEltPropsAttribName: string) {
	// console.log(`Starting page mount on client`)

	const corePageDomElt = document.getElementById(corePageElementId)
	assert(corePageDomElt, `corePageDomElt ${corePageElementId} not found`)
	// console.log(`corePageDomElt: ${corePageDomElt}`)

	const strData = corePageDomElt.getAttribute(corePageEltPropsAttribName) ?? ""
	// console.log(`strData: ${strData}`)
	const data = JSON.parse(atob(strData)) as ArgsType<typeof PageComponent>[0]
	// console.log(`data: ${stringify(data)}`)

	const pageEltUI = createElement(PageComponent, { id: corePageElementId, ...data }) as UIElement
	mountElement(pageEltUI, corePageDomElt)
}


export type PageInfo<T extends Rec> = {
	/** Determines corresponding route path, bundle file name, etc for the page. Should not have initial slash */
	path: string

	/** Main title of page */
	title: (args: T) => string

	/** Generates links to related server actions, pages, etc., based on runtime args for the page */
	links: (args: T) => LinkInfo[]

	/** Component that provides the UI for the page */
	ui: Promise<Component<T & { targetResolution: "mobile" | "desktop", children?: never }>>

	/** The page kind, which affects the contextual layout, main/auth menu, and more. Default is "regular" */
	kind?: (
		| "auth" // a page involved in user auth, e.g., login, registration, password reset, etc
		| "hero" // a page with the title as a prominent slogan
		| "centered" // a regular page centered in the screen
		| "regular" // a regular page
	)
}

