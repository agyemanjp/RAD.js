import { type Component, createElement, type UIElement, mountElement, type LinkInfo } from "@agyemanjp/fxui"
import { type Rec, assert, type ArgsType } from "@agyemanjp/standard"

export function makePage<T extends Rec>(page: PageInfo<T>): PageInfo<T> { return page }

// executed on client
export function mountPage<T extends Rec>(PageComponent: Component<T>, corePageElementId: string, corePageEltPropsAttribName: string) {
	// console.log(`Starting page mount on client`)

	const pageEltDOM = document.getElementById(corePageElementId)
	assert(pageEltDOM, `corePageDomElt ${corePageElementId} not found`)
	// console.log(`corePageDomElt: ${corePageDomElt}`)

	const strData = pageEltDOM.getAttribute(corePageEltPropsAttribName) ?? ""
	// console.log(`strData: ${strData}`)
	const data = JSON.parse(atob(strData)) as ArgsType<typeof PageComponent>[0]
	// console.log(`data: ${stringify(data)}`)

	const pageEltUI = createElement(PageComponent, { id: corePageElementId, ...data }) as UIElement
	mountElement(pageEltUI, pageEltDOM)
}

export type PageInfo<T extends Rec> = {
	/** page path without initial slash. Determines route path, bundle file name, etc for the page. */
	path: string

	/** Main title of page */
	title: (args: T) => string

	/** Description or sub-title of page */
	description?: (args: T) => string

	/** Get links to related pages, actions, etc., based on page's runtime args */
	links: (args: T) => LinkInfo[]

	/** Component that provides the UI for the page */
	ui: Promise<Component<T & { targetResolution: "mobile" | "desktop", children?: never }>>

	/** Page kind. Determines contextual layout, main/auth menu, etc. Default is "regular" */
	kind?: (
		| "auth" // a page involved in user auth, e.g., login, registration, password reset, etc
		| "hero" // a page with the title as a prominent slogan
		| "centered" // a page centered in the screen
		| "regular" // a regular page
	)
}

