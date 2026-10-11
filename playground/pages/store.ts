import {blankPage, loadCurrentId, loadPages, newId, savePages, type JsonObject, type PageDoc} from "./schema";
import {KNOWN_TYPES} from "./sections";

// The pages saved in this browser, for the parts of the toolkit that add to them from outside the builder

/** The saved pages and which one is open. There is always at least one. */
export function readStore() {
    const pages = loadPages(KNOWN_TYPES);
    if (pages.length === 0) pages.push(blankPage());
    const saved = loadCurrentId();
    const currentId = pages.some(page => page.id === saved) ? saved! : pages[0].id;
    return {pages, currentId};
}

/** Adds a section to the end of the open page (above its footer, if it ends with one). Returns the page's name. */
export function addToCurrentPage(type: string, props: JsonObject) {
    const {pages, currentId} = readStore();
    const page = pages.find(item => item.id === currentId)!;
    const section = {id: newId(), type, props: structuredClone(props)};
    const last = page.sections[page.sections.length - 1];
    if (last?.type === "footer" && type !== "footer") page.sections.splice(page.sections.length - 1, 0, section);
    else page.sections.push(section);
    page.updatedAt = Date.now();
    savePages(pages, currentId);
    return page.name;
}

/** Saves a new page (e.g. a copy of a template) and opens it. */
export function addPage(page: PageDoc) {
    const {pages} = readStore();
    // Not next to an untouched empty "My page"
    const kept = pages.filter(item => item.sections.length > 0);
    savePages([...kept, page], page.id);
}

/** A name that isn't taken yet: "City portal", then "City portal 2"… */
export function freeName(name: string, pages: PageDoc[]) {
    const taken = new Set(pages.map(page => page.name));
    if (!taken.has(name)) return name;
    for (let count = 2; ; count++) {
        if (!taken.has(`${name} ${count}`)) return `${name} ${count}`;
    }
}
