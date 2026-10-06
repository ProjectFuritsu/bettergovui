export const SIZE_PRESETS = ["xs", "sm", "md", "lg", "xl"] as const;

export type SizePreset = typeof SIZE_PRESETS[number];
// A preset name, a number (pixels), or any CSS length like "1.5rem".
// `string & {}` keeps editor autocomplete for the preset names while still accepting any string.
export type Size = SizePreset | number | (string & {});

export function isSizePreset(size: Size): size is SizePreset {
    return (SIZE_PRESETS as readonly Size[]).includes(size);
}

// Numbers become pixels; strings are used as-is ("1.5rem", "50%")
export function toCssLength(value: number | string) {
    return typeof value === "number" ? `${value}px` : value;
}

// For spacing props: presets point at the --spacing-* tokens, anything else works like toCssLength
export function toSpacing(value: Size) {
    return isSizePreset(value) ? `var(--spacing-${value})` : toCssLength(value);
}
