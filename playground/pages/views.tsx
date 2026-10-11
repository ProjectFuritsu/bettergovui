import {ArrowDown, ArrowUp, Check, Code2, Copy, CopyPlus, Download, FilePlus2, Link2, PencilRuler, Plus, SlidersHorizontal, Trash2, Upload} from "lucide-react";
import {useEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {Button, LanguageProvider, Modal, Textarea, toast} from "../../src";
import {cx} from "../../src/utils/cx";
import {writeToClipboard} from "../workbench/clipboard";
import {CodePanel} from "../workbench/CodePanel";
import type {DeviceName, Language, Theme} from "../workbench/devices";
import {Fields} from "./JsonForm";
import {SECTION_GROUPS, TEMPLATES, type SectionGroup, type Template} from "./presets";
import {blankPage, encodePage, newId, readShared, savePages, SHARE_HASH, shareLink, toShareJson, type PageDoc, type SectionData} from "./schema";
import {SectionFrame} from "./SectionFrame";
import {KNOWN_TYPES, PageRenderer, pageCode, sectionCode, TYPE_BY_NAME} from "./sections";
import {addPage, addToCurrentPage, freeName, readStore} from "./store";

export const BUILDER = "Page builder";
export const TEMPLATES_PAGE = "Templates";

export interface ViewProps {
    theme: Theme;
    language: Language;
    device: DeviceName;
    /** Opens another page of the toolkit, by its name in the sidebar */
    onOpen: (name: string) => void;
}

// A button that copies text and says so for a moment
function CopyButton({text, children, icon = <Copy />, variant = "outline"}: {text: string | (() => string | Promise<string>); children: ReactNode; icon?: ReactNode; variant?: "outline" | "filled" | "text"}) {
    const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
    const timer = useRef<number | undefined>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);

    async function copy() {
        try {
            await writeToClipboard(typeof text === "string" ? text : await text());
            setState("copied");
        } catch {
            setState("failed");
        }
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setState("idle"), 1500);
    }

    return (
        <Button size="sm" variant={variant} leftIcon={state === "copied" ? <Check /> : icon} onClick={copy}>
            {state === "copied" ? "Copied!" : state === "failed" ? "Copy failed" : children}
        </Button>
    );
}

const toSections = (items: Array<Pick<SectionData, "type" | "props">>): SectionData[] =>
    items.map(item => ({id: newId(), type: item.type, props: structuredClone(item.props)}));

// A small picture of a section: the real thing, drawn 1200px wide and shrunk. It can't be clicked
// or tabbed into, and screen readers skip it (the name and note next to it say what it is).
function Thumbnail({section, language}: {section: Pick<SectionData, "type" | "props">; language: Language}) {
    const sections = useMemo(() => toSections([section]), [section]);
    return (
        <div className="thumb" aria-hidden="true" ref={element => element?.setAttribute("inert", "")}>
            <div className="thumb-page">
                <LanguageProvider language={language}>
                    <PageRenderer sections={sections} />
                </LanguageProvider>
            </div>
        </div>
    );
}

// ---------- One kind of section, in several versions ----------

export function SectionGallery({group, theme, language, device, onOpen}: ViewProps & {group: SectionGroup}) {
    // Stable ids, so a preview isn't reloaded on every render
    const previews = useMemo(() => group.versions.map(version => toSections([version])), [group]);

    return (
        <div className="gallery">
            {group.versions.map((version, index) => {
                const type = TYPE_BY_NAME.get(version.type)!;
                const code = sectionCode(version);
                return (
                    <section key={version.name} className="gallery-item" aria-labelledby={`version-${index}`}>
                        <header className="gallery-item-header">
                            <div>
                                <h2 id={`version-${index}`}>{version.name} <span className="gallery-item-component">{type.component}</span></h2>
                                <p>{version.note}</p>
                            </div>
                            <div className="gallery-item-actions">
                                {type.entry && (
                                    <Button size="sm" variant="text" leftIcon={<SlidersHorizontal />} onClick={() => onOpen(type.entry!)}>All props</Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    leftIcon={<Plus />}
                                    onClick={() => {
                                        const page = addToCurrentPage(version.type, version.props);
                                        toast({title: `Added to “${page}”`, color: "success", action: {label: "Open the page builder", onClick: () => onOpen(BUILDER)}});
                                    }}>
                                    Add to my page
                                </Button>
                                <CopyButton text={code} variant="filled">Copy code</CopyButton>
                            </div>
                        </header>
                        <SectionFrame sections={previews[index]} theme={theme} language={language} device={device} autoHeight title={`${group.name}: ${version.name}`} />
                        <details className="gallery-code">
                            <summary><Code2 aria-hidden="true" /> Code</summary>
                            <pre><code>{code}</code></pre>
                        </details>
                    </section>
                );
            })}
        </div>
    );
}

// ---------- Whole pages, ready to use ----------

export function TemplatesView({theme, language, device, onOpen}: ViewProps) {
    const [selected, setSelected] = useState(0);
    const template: Template = TEMPLATES[selected];
    const sections = useMemo(() => toSections(template.sections), [template]);
    const code = pageCode(template.name, sections);

    function customize() {
        const {pages} = readStore();
        addPage({...blankPage(freeName(template.name, pages)), sections: toSections(template.sections)});
        onOpen(BUILDER);
    }

    return (
        <>
            <div className="templates-bar">
                <div className="templates-tabs" role="tablist" aria-label="Templates">
                    {TEMPLATES.map((item, index) => (
                        <button key={item.name} type="button" role="tab" aria-selected={index === selected} className={cx("templates-tab", index === selected && "is-active")} onClick={() => setSelected(index)}>
                            {item.name}
                        </button>
                    ))}
                </div>
                <p className="templates-note">{template.description}</p>
                <div className="gallery-item-actions">
                    <Button size="sm" variant="outline" leftIcon={<PencilRuler />} onClick={customize}>Customize in the page builder</Button>
                    <CopyButton text={code} variant="filled">Copy code</CopyButton>
                </div>
            </div>
            <div className="page-preview">
                <SectionFrame sections={sections} theme={theme} language={language} device={device} title={`${template.name} template`} />
            </div>
            <CodePanel code={code} />
        </>
    );
}

// ---------- The page builder ----------

// Share links that were already opened, so React's double run in development doesn't import one twice
const opened = new Set<string>();

export function BuilderView({theme, language, device, onOpen, incoming}: ViewProps & {incoming?: string}) {
    const [{pages, currentId}, setStore] = useState(readStore);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [adding, setAdding] = useState(false);
    const [importing, setImporting] = useState(false);
    const [pasted, setPasted] = useState("");
    const [importError, setImportError] = useState("");

    const page = pages.find(item => item.id === currentId) ?? pages[0];
    const selected = page.sections.find(section => section.id === selectedId);
    const selectedType = selected && TYPE_BY_NAME.get(selected.type);

    // Everything is saved in this browser as it changes
    useEffect(() => savePages(pages, page.id), [pages, page.id]);

    const setPages = (next: PageDoc[], openId = page.id) => setStore({pages: next, currentId: openId});
    const updatePage = (change: Partial<PageDoc>) => setPages(pages.map(item => (item.id === page.id ? {...item, ...change, updatedAt: Date.now()} : item)));
    const setSections = (sections: SectionData[]) => updatePage({sections});

    function openPage(next: PageDoc, message: string) {
        // An untouched empty page makes way for the new one
        const kept = pages.filter(item => item.sections.length > 0);
        setStore({pages: [...kept, next], currentId: next.id});
        setSelectedId(undefined);
        toast({title: message, color: "success"});
    }

    // A share link opens as a copy of your own, which you can change freely
    useEffect(() => {
        if (!incoming || opened.has(incoming)) return;
        opened.add(incoming);
        void readShared(incoming, KNOWN_TYPES).then(shared => {
            history.replaceState(null, "", `#${encodeURIComponent(BUILDER)}`);
            if (!shared) {
                toast({title: "That link doesn't hold a page", description: "It may have been cut off when it was copied.", color: "danger"});
                return;
            }
            setStore(store => {
                const kept = store.pages.filter(item => item.sections.length > 0);
                const copy = {...shared, name: freeName(shared.name, kept)};
                return {pages: [...kept, copy], currentId: copy.id};
            });
            toast({title: `Opened “${shared.name}” as your own copy`, color: "success"});
        });
    }, [incoming]);

    async function importPasted() {
        const shared = await readShared(pasted, KNOWN_TYPES);
        if (!shared) {
            setImportError("That isn't a page. Paste a share link, or the JSON from “Copy JSON”.");
            return;
        }
        openPage({...shared, name: freeName(shared.name, pages)}, `Opened “${shared.name}” as your own copy`);
        setImporting(false);
        setPasted("");
        setImportError("");
    }

    function addSection(type: string, props: SectionData["props"]) {
        const section = {id: newId(), type, props: structuredClone(props)};
        // After the selected section, or at the end
        const at = selected ? page.sections.indexOf(selected) + 1 : page.sections.length;
        setSections([...page.sections.slice(0, at), section, ...page.sections.slice(at)]);
        setSelectedId(section.id);
        setAdding(false);
    }

    function move(index: number, to: number) {
        const next = [...page.sections];
        next.splice(to, 0, ...next.splice(index, 1));
        setSections(next);
    }

    function removePage() {
        const rest = pages.filter(item => item.id !== page.id);
        const next = rest.length > 0 ? rest : [blankPage()];
        setStore({pages: next, currentId: next[0].id});
        setSelectedId(undefined);
    }

    const code = pageCode(page.name, page.sections);
    const empty = page.sections.length === 0;

    return (
        <div className="builder">
            <div className="builder-bar">
                <div className="builder-bar-group">
                    <select className="builder-select" aria-label="Your pages" value={page.id} onChange={event => { setStore({pages, currentId: event.target.value}); setSelectedId(undefined); }}>
                        {pages.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                    <input className="builder-name" aria-label="Page name" value={page.name} onChange={event => updatePage({name: event.target.value})} />
                    <Button size="sm" variant="text" leftIcon={<FilePlus2 />} title="New empty page" onClick={() => openPage(blankPage(freeName("My page", pages)), "New page")}>New</Button>
                    <Button size="sm" variant="text" leftIcon={<CopyPlus />} title="Make a copy of this page" disabled={empty}
                        onClick={() => openPage({...page, id: newId(), name: freeName(page.name, pages), sections: toSections(page.sections)}, "Copied the page")}>Duplicate</Button>
                    <Button size="sm" variant="text" color="danger" leftIcon={<Trash2 />} title="Delete this page from this browser" onClick={removePage}>Delete</Button>
                </div>
                <div className="builder-bar-group">
                    <Button size="sm" variant="outline" leftIcon={<Upload />} onClick={() => setImporting(true)}>Import</Button>
                    {!empty && (
                        <>
                            <CopyButton text={() => toShareJson(page)} icon={<Download />}>Copy JSON</CopyButton>
                            <CopyButton text={async () => shareLink(await encodePage(page))} icon={<Link2 />}>Copy share link</CopyButton>
                            <CopyButton text={code} variant="filled">Copy code</CopyButton>
                        </>
                    )}
                </div>
            </div>

            <div className="builder-body">
                <aside className="builder-outline" aria-label="Sections of the page">
                    <p className="sidebar-heading">Sections</p>
                    <ol>
                        {page.sections.map((section, index) => {
                            const type = TYPE_BY_NAME.get(section.type)!;
                            const name = `${type.label} ${index + 1}`;
                            return (
                                <li key={section.id} className={cx("builder-row", section.id === selectedId && "is-active")}>
                                    <button type="button" className="builder-row-name" aria-current={section.id === selectedId || undefined} onClick={() => setSelectedId(section.id)}>
                                        {type.label}
                                        <small>{String(section.props.title ?? section.props.logo ?? section.props.copyright ?? type.component)}</small>
                                    </button>
                                    <span className="builder-row-tools">
                                        <button type="button" title="Move up" aria-label={`Move ${name} up`} disabled={index === 0} onClick={() => move(index, index - 1)}><ArrowUp /></button>
                                        <button type="button" title="Move down" aria-label={`Move ${name} down`} disabled={index === page.sections.length - 1} onClick={() => move(index, index + 1)}><ArrowDown /></button>
                                        <button type="button" title="Duplicate" aria-label={`Duplicate ${name}`} onClick={() => setSections([...page.sections.slice(0, index + 1), ...toSections([section]), ...page.sections.slice(index + 1)])}><CopyPlus /></button>
                                        <button type="button" title="Remove" aria-label={`Remove ${name}`} onClick={() => setSections(page.sections.filter(item => item.id !== section.id))}><Trash2 /></button>
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                    <Button size="sm" variant="outline" fullWidth leftIcon={<Plus />} onClick={() => setAdding(true)}>Add a section</Button>
                </aside>

                <div className="builder-main">
                    {empty ? (
                        <div className="builder-empty">
                            <h2>This page is empty</h2>
                            <p>Add sections one by one, start from a ready-made page, or import a page someone shared with you.</p>
                            <div className="gallery-item-actions">
                                <Button leftIcon={<Plus />} onClick={() => setAdding(true)}>Add a section</Button>
                                <Button variant="outline" onClick={() => onOpen(TEMPLATES_PAGE)}>Start from a template</Button>
                                <Button variant="outline" leftIcon={<Upload />} onClick={() => setImporting(true)}>Import</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="page-preview">
                            <SectionFrame sections={page.sections} theme={theme} language={language} device={device} title={`${page.name} preview`} />
                        </div>
                    )}
                    {!empty && <CodePanel code={code} />}
                </div>

                <aside className="builder-props" aria-label="Section settings">
                    {selected && selectedType ? (
                        <>
                            <div className="props-header">
                                <h2>{selectedType.label}</h2>
                                <CopyButton text={() => sectionCode(selected)} variant="text">Copy code</CopyButton>
                            </div>
                            <Fields
                                key={selected.id}
                                shape={selectedType.shape}
                                value={selected.props}
                                choices={selectedType.choices ?? {}}
                                path={selected.id}
                                onChange={props => setSections(page.sections.map(section => (section.id === selected.id ? {...section, props} : section)))}
                            />
                        </>
                    ) : (
                        <p className="builder-hint">{empty ? "Sections you add show up here to edit." : "Choose a section on the left to change its texts, links and options."}</p>
                    )}
                </aside>
            </div>

            <Modal open={adding} onClose={() => setAdding(false)} title="Add a section" description="It goes after the selected section, or at the end of the page." size={1180}>
                {/* Only drawn while it's open: it shows every version at once */}
                {adding && (
                    <div className="picker">
                        {SECTION_GROUPS.map(group => (
                            <div key={group.name} className="picker-group">
                                <h3>{group.name}</h3>
                                <div className="picker-items">
                                    {group.versions.map(version => (
                                        // The picture is not inside the button (it has buttons and links of its own);
                                        // the button stretches over the whole card instead
                                        <div key={version.name} className="picker-item">
                                            <Thumbnail section={version} language={language} />
                                            <button type="button" className="picker-item-button" onClick={() => addSection(version.type, version.props)}>
                                                <strong>{version.name}</strong>
                                                <span>{version.note}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>

            <Modal
                open={importing}
                onClose={() => setImporting(false)}
                title="Import a page"
                description="Paste a share link, or the JSON from “Copy JSON”. It opens as a new page of your own; your other pages stay as they are."
                footer={
                    <>
                        <Button variant="outline" onClick={() => setImporting(false)}>Cancel</Button>
                        <Button disabled={!pasted.trim()} onClick={() => void importPasted()}>Import</Button>
                    </>
                }>
                <Textarea
                    label="Link or JSON"
                    rows={8}
                    placeholder={`${location.origin}/#${SHARE_HASH}…   or   { "v": 1, "name": "…", "sections": [ … ] }`}
                    value={pasted}
                    error={importError || undefined}
                    onChange={event => { setPasted(event.target.value); setImportError(""); }}
                />
            </Modal>
        </div>
    );
}
