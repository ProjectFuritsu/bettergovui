import {Moon, PanelRightClose, PanelRightOpen, RotateCw, Search, Sun} from "lucide-react";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
// Import from the source, not dist/, so edits show up instantly
import {Button} from "../src";
import {cx} from "../src/utils/cx";
import {entries} from "./entries";
import {CodePanel} from "./workbench/CodePanel";
import {DevicePreview} from "./workbench/DevicePreview";
import {DEVICES, type DeviceName, type Language, type Theme} from "./workbench/devices";
import {PropControl} from "./workbench/PropControl";
import {CATEGORIES, defaultValues} from "./workbench/types";

// The selected component is kept in the URL (#Tabs), so a reload stays on it
function initialEntryName() {
    const fromHash = decodeURIComponent(location.hash.slice(1));
    return entries.some(entry => entry.name === fromHash) ? fromHash : entries[0].name;
}

const THEME_KEY = "playground-theme";
const LANGUAGE_KEY = "playground-language";
const LANGUAGES: {value: Language; label: string; name: string}[] = [
    {value: "en", label: "EN", name: "English"},
    {value: "fil", label: "FIL", name: "Filipino"},
    {value: "ceb", label: "CEB", name: "Bisaya (Cebuano)"},
];

// The preview's language from last time, or English
function initialLanguage(): Language {
    try {
        const saved = localStorage.getItem(LANGUAGE_KEY);
        if (LANGUAGES.some(language => language.value === saved)) return saved as Language;
    } catch {
        // Storage can be blocked; English it is
    }
    return "en";
}
const PROPS_HIDDEN_KEY = "playground-props-hidden";

// Whether the properties pane was hidden last time
function initialPropsHidden() {
    try {
        return localStorage.getItem(PROPS_HIDDEN_KEY) === "true";
    } catch {
        return false;
    }
}

// Your last choice, or your system's light/dark setting the first time
function initialTheme(): Theme {
    try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === "light" || saved === "dark") return saved;
    } catch {
        // Storage can be blocked (e.g. private windows); fall back to the system setting
    }
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
    const [selectedName, setSelectedName] = useState(initialEntryName);
    // Each component keeps its own edited values, so switching between them doesn't lose changes
    const [valuesByName, setValuesByName] = useState(() =>
        Object.fromEntries(entries.map(entry => [entry.name, defaultValues(entry.controls)])),
    );
    const [device, setDevice] = useState<DeviceName>("responsive");
    const [landscape, setLandscape] = useState(false);
    const [propsHidden, setPropsHidden] = useState(initialPropsHidden);

    useEffect(() => {
        try {
            localStorage.setItem(PROPS_HIDDEN_KEY, String(propsHidden));
        } catch {
            // Not saved; it still works for this visit
        }
    }, [propsHidden]);
    const canRotate = DEVICES[device].rotatable;
    const [theme, setTheme] = useState<Theme>(initialTheme);
    const [language, setLanguage] = useState<Language>(initialLanguage);

    useEffect(() => {
        try {
            localStorage.setItem(LANGUAGE_KEY, language);
        } catch {
            // Not saved; it still works for this visit
        }
    }, [language]);

    // data-theme="dark" on <html> switches both the workbench colors and the library's tokens.
    // A layout effect applies it before the browser paints, so there's no flash of the wrong theme.
    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme;
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
            // Not saved, but the toggle still works for this visit
        }
    }, [theme]);

    const entry = entries.find(item => item.name === selectedName) ?? entries[0];
    const values = valuesByName[entry.name];
    const code = entry.code(values);

    function selectEntry(name: string) {
        setSelectedName(name);
        history.replaceState(null, "", `#${encodeURIComponent(name)}`);
    }

    function setValue(key: string, value: string | number | boolean) {
        setValuesByName(previous => ({...previous, [entry.name]: {...previous[entry.name], [key]: value}}));
    }

    // Sidebar search: matches component names and group names ("forms" shows all form controls)
    const [query, setQuery] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);
    const search = query.trim().toLowerCase();
    const matches = entries.filter(item => `${item.name} ${item.category}`.toLowerCase().includes(search));
    // What Enter opens: a name that starts with the text, then one that contains it, then a group match
    const rank = (name: string) => (name.toLowerCase().startsWith(search) ? 0 : name.toLowerCase().includes(search) ? 1 : 2);
    const bestMatch = [...matches].sort((a, b) => rank(a.name) - rank(b.name))[0];

    // Press "/" anywhere (except while typing in a field) to jump to the search box
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
            if ((event.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
            event.preventDefault();
            searchRef.current?.focus();
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    function reset() {
        setValuesByName(previous => ({...previous, [entry.name]: defaultValues(entry.controls)}));
    }

    return (
        <div className={cx("workbench", propsHidden && "workbench--props-hidden")}>
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="brand">UI Kit</div>
                    <div className="sidebar-tools">
                        {/* The language of the components' built-in texts in the preview */}
                        <select
                            className="language-select"
                            aria-label="Preview language"
                            title={`Preview language: ${LANGUAGES.find(item => item.value === language)?.name}`}
                            value={language}
                            onChange={event => setLanguage(event.target.value as Language)}>
                            {LANGUAGES.map(item => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                        </select>
                        <Button
                            size="sm"
                            variant="text"
                            color="var(--pg-muted)"
                            leftIcon={theme === "dark" ? <Sun /> : <Moon />}
                            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                            onClick={() => setTheme(current => (current === "dark" ? "light" : "dark"))}
                        />
                    </div>
                </div>
                <div className="sidebar-search">
                    <Search className="sidebar-search-icon" aria-hidden="true" />
                    <input
                        ref={searchRef}
                        type="search"
                        className="sidebar-search-input"
                        placeholder="Search"
                        aria-label="Search components"
                        aria-keyshortcuts="/"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        onKeyDown={event => {
                            // Enter opens the first match; Escape clears the search
                            if (event.key === "Enter" && search && bestMatch) selectEntry(bestMatch.name);
                            if (event.key === "Escape") setQuery("");
                        }}
                    />
                    {!query && <kbd className="sidebar-search-key" aria-hidden="true">/</kbd>}
                </div>
                <nav className="nav" aria-label="Components">
                    {matches.length === 0 && (
                        <p className="sidebar-empty" role="status">No components match “{query.trim()}”.</p>
                    )}
                    {CATEGORIES.map(category => {
                        const items = matches.filter(item => item.category === category);
                        if (items.length === 0) return null;
                        return (
                            <div key={category} className="nav-group">
                                <p className="sidebar-heading">{category}</p>
                                {items.map(item => (
                                    <button
                                        key={item.name}
                                        type="button"
                                        className={cx("nav-item", item.name === entry.name && "is-active")}
                                        aria-current={item.name === entry.name ? "page" : undefined}
                                        onClick={() => selectEntry(item.name)}>
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            <main className="canvas">
                <header className="canvas-toolbar">
                    <div>
                        <h1>{entry.name}</h1>
                        <p>{entry.description}</p>
                    </div>
                    <div className="toolbar-actions">
                        <div className="device-switch" role="group" aria-label="Preview size">
                            {(Object.keys(DEVICES) as DeviceName[]).map(name => {
                                const {label, icon: Icon} = DEVICES[name];
                                const active = name === device;
                                return (
                                    <Button
                                        key={name}
                                        size="sm"
                                        variant={active ? "filled" : "text"}
                                        color={active ? undefined : "var(--pg-muted)"}
                                        leftIcon={<Icon />}
                                        aria-label={label}
                                        aria-pressed={active}
                                        title={label}
                                        onClick={() => setDevice(name)}
                                    />
                                );
                            })}
                            <span className="device-switch-divider" />
                            <Button
                                size="sm"
                                variant="text"
                                color="var(--pg-muted)"
                                leftIcon={<RotateCw />}
                                aria-label={landscape ? "Rotate to portrait" : "Rotate to landscape"}
                                title={canRotate ? (landscape ? "Rotate to portrait" : "Rotate to landscape") : "Only phone and tablet rotate"}
                                aria-pressed={canRotate && landscape}
                                disabled={!canRotate}
                                onClick={() => setLandscape(current => !current)}
                            />
                        </div>
                        <Button
                            size="sm"
                            variant="text"
                            color="var(--pg-muted)"
                            leftIcon={propsHidden ? <PanelRightOpen /> : <PanelRightClose />}
                            aria-label={propsHidden ? "Show properties" : "Hide properties"}
                            title={propsHidden ? "Show properties" : "Hide properties"}
                            aria-expanded={!propsHidden}
                            aria-controls="props-pane"
                            onClick={() => setPropsHidden(current => !current)}
                        />
                    </div>
                </header>

                <DevicePreview
                    device={device}
                    landscape={landscape}
                    entryName={entry.name}
                    values={values}
                    theme={theme}
                    language={language}
                />

                <CodePanel code={code} />
            </main>

            <aside id="props-pane" className="props" hidden={propsHidden}>
                <div className="props-header">
                    <h2>Properties</h2>
                    <button type="button" className="link-button" onClick={reset}>Reset</button>
                </div>
                {Object.entries(entry.controls).map(([name, control]) => (
                    <PropControl
                        key={`${entry.name}-${name}`}
                        name={name}
                        control={control}
                        value={values[name]}
                        onChange={value => setValue(name, value)}
                    />
                ))}
            </aside>
        </div>
    );
}
