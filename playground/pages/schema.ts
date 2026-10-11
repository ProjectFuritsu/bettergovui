// A page made in the page builder is plain data: a list of sections, each a kind of block or
// component and its props. Because it's only data (no code), it can be saved in the browser,
// copied as text or put in a link, and it always renders the same way from the same data.

export type Json = string | number | boolean | null | Json[] | {[key: string]: Json};
export type JsonObject = {[key: string]: Json};

export interface SectionData {
    /** Only used to tell sections apart while editing; made fresh on every import */
    id: string;
    /** Which block or component it is, e.g. "hero". See SECTION_TYPES in sections.tsx. */
    type: string;
    props: JsonObject;
}

export interface PageDoc {
    /** The format's version, so older shared pages can still be read later */
    v: 1;
    id: string;
    name: string;
    sections: SectionData[];
    updatedAt: number;
}

export const newId = () => Math.random().toString(36).slice(2, 10);

export const isObject = (value: unknown): value is JsonObject => typeof value === "object" && value !== null && !Array.isArray(value);

// ---------- Reading pages that came from someone else ----------

const MAX_SECTIONS = 60;
const MAX_TEXT = 4000;
const MAX_ITEMS = 60;

// Shared data is never trusted: only plain values get through, long ones are cut, and links that
// would run code ("javascript:…") are replaced.
function safeValue(value: unknown, depth: number): Json | undefined {
    if (typeof value === "string") {
        const text = value.slice(0, MAX_TEXT);
        return /^\s*(javascript|vbscript|data:text\/html)/i.test(text) ? "#" : text;
    }
    if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
    if (typeof value === "boolean") return value;
    if (depth > 6) return undefined;
    if (Array.isArray(value)) {
        return value.slice(0, MAX_ITEMS).map(item => safeValue(item, depth + 1)).filter((item): item is Json => item !== undefined);
    }
    if (typeof value === "object" && value !== null) {
        const result: JsonObject = {};
        for (const [key, item] of Object.entries(value).slice(0, MAX_ITEMS)) {
            // No "__proto__" and friends
            if (!/^[A-Za-z][A-Za-z0-9]*$/.test(key)) continue;
            const safe = safeValue(item, depth + 1);
            if (safe !== undefined) result[key] = safe;
        }
        return result;
    }
    return undefined;
}

/** Checks data from a link or pasted text and returns it as a new page of your own, or null when it isn't one. */
export function toPage(input: unknown, knownTypes: ReadonlySet<string>): PageDoc | null {
    if (!isObject(input) || !Array.isArray(input.sections)) return null;
    const sections: SectionData[] = [];
    for (const section of input.sections.slice(0, MAX_SECTIONS)) {
        if (!isObject(section) || typeof section.type !== "string" || !knownTypes.has(section.type)) continue;
        const props = safeValue(section.props ?? {}, 0);
        sections.push({id: newId(), type: section.type, props: isObject(props) ? props : {}});
    }
    if (sections.length === 0) return null;
    const name = typeof input.name === "string" && input.name.trim() ? input.name.trim().slice(0, 80) : "Shared page";
    return {v: 1, id: newId(), name, sections, updatedAt: Date.now()};
}

// ---------- Sharing: the whole page as text ----------

/** What gets shared: no ids or dates, so the same page always gives the same text. */
export function toShareData(page: PageDoc) {
    return {v: 1, name: page.name, sections: page.sections.map(({type, props}) => ({type, props}))};
}

export const toShareJson = (page: PageDoc) => JSON.stringify(toShareData(page), null, 2);

const toBase64Url = (bytes: Uint8Array) => {
    let binary = "";
    bytes.forEach(byte => (binary += String.fromCharCode(byte)));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (text: string) => {
    const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(binary, char => char.charCodeAt(0));
};

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
    const writer = stream.writable.getWriter();
    void writer.write(bytes as BufferSource);
    void writer.close();
    return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}

/** The page packed into a short piece of text for a link: "1." + compressed, or "0." + plain on older browsers. */
export async function encodePage(page: PageDoc) {
    const bytes = new TextEncoder().encode(JSON.stringify(toShareData(page)));
    if (typeof CompressionStream === "undefined") return `0.${toBase64Url(bytes)}`;
    return `1.${toBase64Url(await pipe(bytes, new CompressionStream("deflate-raw")))}`;
}

async function decodePage(code: string): Promise<unknown> {
    const packed = fromBase64Url(code.slice(2));
    const bytes = code.startsWith("1.") ? await pipe(packed, new DecompressionStream("deflate-raw")) : packed;
    return JSON.parse(new TextDecoder().decode(bytes));
}

export const SHARE_HASH = "build=";

export const shareLink = (code: string) => `${location.origin}${location.pathname}#${SHARE_HASH}${code}`;

/** Reads what someone pasted: a share link, the code from one, or the page's JSON. */
export async function readShared(text: string, knownTypes: ReadonlySet<string>): Promise<PageDoc | null> {
    const pasted = text.trim();
    try {
        const fromLink = pasted.includes(SHARE_HASH) ? pasted.slice(pasted.indexOf(SHARE_HASH) + SHARE_HASH.length) : pasted;
        const data = /^[01]\.[A-Za-z0-9_-]+$/.test(fromLink) ? await decodePage(fromLink) : JSON.parse(pasted);
        return toPage(data, knownTypes);
    } catch {
        return null;
    }
}

// ---------- Saving in this browser ----------

const PAGES_KEY = "playground-pages";
const CURRENT_KEY = "playground-page-current";

export function loadPages(knownTypes: ReadonlySet<string>): PageDoc[] {
    try {
        const saved: unknown = JSON.parse(localStorage.getItem(PAGES_KEY) ?? "[]");
        if (!Array.isArray(saved)) return [];
        return saved.filter(
            (page): page is PageDoc =>
                isObject(page) && typeof page.id === "string" && typeof page.name === "string" && Array.isArray(page.sections) &&
                page.sections.every(section => isObject(section) && typeof section.type === "string" && knownTypes.has(section.type) && isObject(section.props)),
        );
    } catch {
        return [];
    }
}

export function savePages(pages: PageDoc[], currentId: string | undefined) {
    try {
        localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
        if (currentId) localStorage.setItem(CURRENT_KEY, currentId);
    } catch {
        // Storage can be full or blocked; the page still works for this visit
    }
}

export function loadCurrentId() {
    try {
        return localStorage.getItem(CURRENT_KEY) ?? undefined;
    } catch {
        return undefined;
    }
}

export const blankPage = (name = "My page"): PageDoc => ({v: 1, id: newId(), name, sections: [], updatedAt: Date.now()});
