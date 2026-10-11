import {ArrowDown, ArrowUp, Plus, Trash2} from "lucide-react";
import {isObject, type Json, type JsonObject} from "./schema";

// The builder's editor for one section. It is built from the section type's `shape` (an example
// with every field), so a new kind of section needs no form of its own.

interface FieldsProps {
    /** The example that says which fields exist and what kind each is */
    shape: JsonObject;
    value: JsonObject;
    /** Fields that are a choice between a few values, by field name */
    choices: Record<string, readonly (string | number)[]>;
    onChange: (value: JsonObject) => void;
    /** For the fields' ids, so labels stay tied to the right input */
    path: string;
}

// "primaryAction" -> "Primary action"
const title = (key: string) => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, first => first.toUpperCase()).replace(/ [A-Z]/g, text => text.toLowerCase());

// An empty copy of an example, for "Add": texts emptied, the rest kept
function blank(example: Json): Json {
    if (typeof example === "string") return "";
    if (Array.isArray(example)) return [];
    if (isObject(example)) return Object.fromEntries(Object.entries(example).map(([key, item]) => [key, blank(item)]));
    return example;
}

const LONG_TEXT = new Set(["description", "answer", "excerpt", "message", "body", "address"]);

// What an item in a list is called in its heading
const nameOf = (item: Json, index: number) => {
    const text = isObject(item) ? (item.title ?? item.label ?? item.question ?? item.value ?? item.days ?? item.first) : undefined;
    return typeof text === "string" && text ? text : `Item ${index + 1}`;
};

export function Fields({shape, value, choices, onChange, path}: FieldsProps) {
    const set = (key: string, next: Json) => onChange({...value, [key]: next});

    return (
        <div className="jf-fields">
            {Object.entries(shape).map(([key, example]) => {
                const id = `${path}-${key}`;
                const current = value[key];
                const options = choices[key];

                if (options) {
                    return (
                        <label key={key} className="jf-field" htmlFor={id}>
                            <span>{title(key)}</span>
                            <select
                                id={id}
                                value={String(current ?? "")}
                                onChange={event => set(key, typeof example === "number" ? Number(event.target.value) : event.target.value)}>
                                {/* Not set yet: the component's own default */}
                                {!options.includes((current ?? "") as string) && <option value={String(current ?? "")}>{current === undefined || current === "" ? "default" : String(current)}</option>}
                                {options.map(option => <option key={option} value={option}>{option === "" ? "none" : option}</option>)}
                            </select>
                        </label>
                    );
                }

                if (typeof example === "boolean") {
                    return (
                        <label key={key} className="jf-field jf-field--check" htmlFor={id}>
                            <input id={id} type="checkbox" checked={Boolean(current)} onChange={event => set(key, event.target.checked)} />
                            <span>{title(key)}</span>
                        </label>
                    );
                }

                if (typeof example === "number") {
                    return (
                        <label key={key} className="jf-field" htmlFor={id}>
                            <span>{title(key)}</span>
                            <input id={id} type="number" value={Number(current ?? example)} onChange={event => set(key, Number(event.target.value))} />
                        </label>
                    );
                }

                if (typeof example === "string") {
                    const text = typeof current === "string" ? current : "";
                    return (
                        <label key={key} className="jf-field" htmlFor={id}>
                            <span>{title(key)}</span>
                            {LONG_TEXT.has(key) || text.length > 60
                                ? <textarea id={id} rows={3} value={text} onChange={event => set(key, event.target.value)} />
                                : <input id={id} type="text" value={text} onChange={event => set(key, event.target.value)} />}
                        </label>
                    );
                }

                if (Array.isArray(example)) {
                    const items = Array.isArray(current) ? current : [];
                    const itemShape = isObject(example[0]) ? example[0] : {};
                    const move = (from: number, to: number) => {
                        const next = [...items];
                        next.splice(to, 0, ...next.splice(from, 1));
                        set(key, next);
                    };
                    return (
                        <fieldset key={key} className="jf-group">
                            <legend>{title(key)}</legend>
                            {items.map((item, index) => (
                                <details key={index} className="jf-item">
                                    <summary>
                                        <span className="jf-item-name">{nameOf(item, index)}</span>
                                        <span className="jf-item-tools">
                                            <button type="button" title="Move up" aria-label={`Move ${nameOf(item, index)} up`} disabled={index === 0} onClick={event => { event.preventDefault(); move(index, index - 1); }}><ArrowUp /></button>
                                            <button type="button" title="Move down" aria-label={`Move ${nameOf(item, index)} down`} disabled={index === items.length - 1} onClick={event => { event.preventDefault(); move(index, index + 1); }}><ArrowDown /></button>
                                            <button type="button" title="Remove" aria-label={`Remove ${nameOf(item, index)}`} onClick={event => { event.preventDefault(); set(key, items.filter((_, other) => other !== index)); }}><Trash2 /></button>
                                        </span>
                                    </summary>
                                    <Fields
                                        shape={itemShape}
                                        value={isObject(item) ? item : {}}
                                        choices={choices}
                                        path={`${id}-${index}`}
                                        onChange={next => set(key, items.map((other, otherIndex) => (otherIndex === index ? next : other)))}
                                    />
                                </details>
                            ))}
                            <button type="button" className="jf-add" onClick={() => set(key, [...items, blank(itemShape)])}>
                                <Plus aria-hidden="true" /> Add
                            </button>
                        </fieldset>
                    );
                }

                if (isObject(example)) {
                    return (
                        <fieldset key={key} className="jf-group">
                            <legend>{title(key)}</legend>
                            <Fields shape={example} value={isObject(current) ? current : {}} choices={choices} path={id} onChange={next => set(key, next)} />
                        </fieldset>
                    );
                }

                return null;
            })}
        </div>
    );
}
