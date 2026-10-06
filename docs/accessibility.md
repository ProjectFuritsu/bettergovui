# Accessibility

[← Back to the README](../README.md)

What the components do for you, and the few things that are up to you.

The components are built to work for everyone:

- **Keyboard:** everything works without a mouse, and focus is always visible.
- **Screen readers:** components have proper labels, roles and descriptions. Errors, required fields and the current page or step are announced.
- **Contrast:** text, links, outlines and form controls meet the WCAG contrast guidelines in light and dark mode.
  The default `--primary` (`#0d6efd`) gives white text exactly the 4.5:1 minimum. If you change `--primary`,
  check that white text on it is still readable, or use `autoContrast` (see below).
- **Reduced motion:** animations slow down or stop when the user asks their device for less motion.

A few things are up to you:

- Give **icon-only buttons** an `aria-label`, for example `<Button leftIcon={<Trash2 />} aria-label="Delete" />`.
- Pick the right **heading level**: one `level={1}` per page, then 2, 3 and so on. Use `size` to change only the look.
- With `color="warning"` (orange), text and marks on the solid color switch to black automatically, because white
  isn't readable on it. For your own light colors (e.g. `color="#ffd43b"`), add `autoContrast` to filled buttons,
  badges and alerts to get the same.
