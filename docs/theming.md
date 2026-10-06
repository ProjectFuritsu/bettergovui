# Theming

[← Back to the README](../README.md)

Colors, corner radius, spacing and dark mode, all with CSS variables.

The colors, corner radius and spacing are CSS variables. Override them in your own CSS:

```css
:root {
    --primary: #1864ab;   /* your brand color */
    --radius: 4px;        /* less rounded corners */
}
```

| Variable | Used for |
|---|---|
| `--primary` (blue), `--secondary` (slate gray), `--tertiary` (teal), `--accent` (violet) | the brand colors |
| `--info`, `--success`, `--warning`, `--danger` | the status colors |
| `--surface`, `--surface-muted` | backgrounds |
| `--text`, `--text-muted` | text |
| `--border`, `--border-strong` | lines and form control outlines |
| `--radius` | rounded corners |
| `--spacing-xs` … `--spacing-xl` | what the spacing presets mean |

## Dark mode

Add `data-theme="dark"` to `<html>`, and every component switches. It also works on a single element, to make just that part of the page dark.

```html
<html data-theme="dark">
```

Colored text and outlines automatically get a lighter shade in dark mode, so they stay readable.
