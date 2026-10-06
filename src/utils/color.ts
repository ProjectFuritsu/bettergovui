// Color names that point at the theme tokens in tokens.css
export const THEME_COLORS = [
    "primary",
    "secondary",
    "tertiary",
    "accent",
    "info",
    "success",
    "warning",
    "danger",
] as const;

export type ThemeColor = typeof THEME_COLORS[number];
// A theme color name or any CSS color. `string & {}` keeps autocomplete for the names.
export type Color = ThemeColor | (string & {});

// Theme colors too light for white text (orange): text and marks on them are picked automatically
// (black or white, whichever is easier to read), like the autoContrast prop does
const LIGHT_THEME_COLORS: readonly string[] = ["warning"];

export function isLightThemeColor(color: Color | undefined) {
    return color !== undefined && LIGHT_THEME_COLORS.includes(color);
}

// "success" -> "var(--success)"; anything else is used as-is ("#e03131", "crimson")
export function resolveColor(color: Color) {
    return (THEME_COLORS as readonly string[]).includes(color) ? `var(--${color})` : color;
}
