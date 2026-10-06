/**
 * The HTML elements a layout component can render as, with its `as` prop. They look the same, but they
 * tell screen readers, search engines and browser reader modes what each part of the page is:
 * - `"div"`: no meaning, just a box (the default)
 * - `"main"`: the page's main content. One per page.
 * - `"header"` / `"footer"`: the top / bottom of the page, or of an article or section
 * - `"nav"`: a group of navigation links. Add an `aria-label` when a page has more than one.
 * - `"section"`: a part of the page with its own heading. Point `aria-labelledby` at that heading.
 * - `"article"`: a complete item that makes sense on its own, e.g. a news post or a service
 * - `"aside"`: side content, e.g. related links or a help box
 * - `"ul"` / `"ol"`: a list (ordered for steps or rankings). Each child must then be an `<li>`.
 */
export const LAYOUT_ELEMENTS = ["div", "main", "header", "footer", "nav", "section", "article", "aside", "ul", "ol"] as const;

export type LayoutElement = typeof LAYOUT_ELEMENTS[number];

export function isListElement(element: string) {
    return element === "ul" || element === "ol";
}
