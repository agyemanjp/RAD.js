import { createElement, mountElement } from "@agyemanjp/fxui";
import { assert } from "@agyemanjp/standard";
export function makePage(page) { return page; }
// executed on client
export function mountPage(PageComponent, corePageElementId, corePageEltPropsAttribName) {
    // console.log(`Starting page mount on client`)
    const pageEltDOM = document.getElementById(corePageElementId);
    assert(pageEltDOM, `corePageDomElt ${corePageElementId} not found`);
    // console.log(`corePageDomElt: ${corePageDomElt}`)
    const strData = pageEltDOM.getAttribute(corePageEltPropsAttribName) ?? "";
    // console.log(`strData: ${strData}`)
    const data = JSON.parse(atob(strData));
    // console.log(`data: ${stringify(data)}`)
    const pageEltUI = createElement(PageComponent, { id: corePageElementId, ...data });
    mountElement(pageEltUI, pageEltDOM);
}
//# sourceMappingURL=base.js.map