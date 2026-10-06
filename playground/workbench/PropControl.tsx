import {useRef} from "react";
import {THEME_COLORS} from "../../src/utils/color";
import {SIZE_PRESETS} from "../../src/utils/size";
import type {Control} from "./types";

type Value = string | number | boolean;

interface PropControlProps {
    name: string;
    control: Control;
    value: Value;
    onChange: (value: Value) => void;
}

// One row in the properties pane: the prop name on the left, its input on the right
export function PropControl({name, control, value, onChange}: PropControlProps) {
    const id = `prop-${name}`;
    // The last color picked with the color picker, so "custom…" brings it back
    const lastCustomColor = useRef("#e8590c");

    return (
        <div className="prop">
            <label className="prop-name" htmlFor={id}>{name}</label>
            <div className="prop-input">
                {renderInput()}
            </div>
        </div>
    );

    function renderInput() {
        switch (control.type) {
            case "text":
                return <input id={id} type="text" value={String(value)} onChange={e => onChange(e.target.value)} />;

            case "boolean":
                return (
                    <input id={id} type="checkbox" checked={Boolean(value)}
                           onChange={e => onChange(e.target.checked)} />
                );

            case "select":
                return (
                    <select id={id} value={String(value)} onChange={e => onChange(e.target.value)}>
                        {control.options.map(option => <option key={option}>{option}</option>)}
                    </select>
                );

            case "number":
                return (
                    <>
                        <input id={id} type="range" min={control.min} max={control.max} step={control.step ?? 1}
                               value={Number(value)} onChange={e => onChange(Number(e.target.value))} />
                        <span className="prop-value">{String(value)}</span>
                    </>
                );

            case "color":
                return (
                    <>
                        <input id={id} type="color" value={String(value)} onChange={e => onChange(e.target.value)} />
                        <span className="prop-value">{String(value)}</span>
                    </>
                );

            case "size": {
                const isCustom = typeof value === "number";
                return (
                    <>
                        <select id={id} value={isCustom ? "custom" : String(value)}
                                onChange={e => onChange(e.target.value === "custom" ? 20 : e.target.value)}>
                            {control.optional && <option value="">default</option>}
                            {SIZE_PRESETS.map(preset => <option key={preset}>{preset}</option>)}
                            <option value="custom">custom (px)</option>
                        </select>
                        {isCustom && (
                            <input type="number" min={1} max={96} value={value} aria-label={`${name} in pixels`}
                                   onChange={e => onChange(Number(e.target.value))} />
                        )}
                    </>
                );
            }

            case "themeColor": {
                const text = String(value);
                const isCustom = text.startsWith("#");
                const isThemeColor = (THEME_COLORS as readonly string[]).includes(text);
                // The swatch shows the real color: a theme color through its token, or the picked color
                const swatch = isCustom ? text : isThemeColor ? `var(--${text})` : undefined;

                return (
                    <>
                        <span className="color-swatch" style={{background: swatch}} data-empty={swatch ? undefined : true} />
                        <select
                            id={id}
                            value={isCustom ? "custom" : text}
                            onChange={e => onChange(e.target.value === "custom" ? lastCustomColor.current : e.target.value)}>
                            {control.none && <option value={control.none}>{control.none}</option>}
                            {THEME_COLORS.map(color => <option key={color}>{color}</option>)}
                            <option value="custom">custom…</option>
                        </select>
                        {isCustom && (
                            <input
                                type="color"
                                value={text}
                                aria-label={`${name}: custom color`}
                                onChange={e => {
                                    lastCustomColor.current = e.target.value;
                                    onChange(e.target.value);
                                }}
                            />
                        )}
                    </>
                );
            }
        }
    }
}
