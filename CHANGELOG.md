# Changelog

What changed in each version. While the kit is 0.x, a new minor version (0.2, 0.3…) may change how existing
components work; check here before updating.

## Unreleased

- **`DateInput` opens its own calendar** instead of the browser's date picker. It looks the same in every
  browser, works with the keyboard and follows the `LanguageProvider`. What changes for your code:
  - It is now a `<button>`, so its `ref` is an `HTMLButtonElement` and it has no `onChange`; use `onValueChange`.
  - Input-only props (`leftIcon`, `prefix`, `suffix`, `rightSection`, `readOnly`…) are gone.
  - New props: `placeholder`, `weekStartsOn` and `labels`. With a `name` it still sends "2026-10-31" with the form.
  - `required` shows the asterisk, but the browser no longer blocks submitting an empty date; check it yourself.
- **`Select` opens its own list** right under the field, on top of everything else (also inside a `Modal` or
  `Drawer`), with a search box when there are more than 8 choices (`searchable` turns it on or off).
  `name`, `required`, `onChange`, `ref`, `options` and `<option>` children work as before, because a real
  `<select>` is still inside. What changes for your code:
  - `id` is now on the button people click, not on the `<select>`.
  - Add `native` to get the browser's own `<select>` back, e.g. for the system picker on phones.
  - A `multiple` select always stays native.
- **`Toast` animates in and out**: a new toast slides in while the others glide to make room, and a closed
  toast fades out while the gap closes. No change to `toast()` or `Toaster`.
- **`FaqBlock` has `align="center"`**: the title centered above the questions, in one column no wider than 48rem.
- **`FooterBlock` has more looks**, which can be combined: `layout` ("columns", "centered", "grid"),
  `tone` ("default", "muted", "dark"), `card`, `heading` + `action` (a call to action above the links) and
  `wordmark` (the site's name in very large letters along the bottom). Without them it looks as before.
- **`HeaderBlock` has `variant="pill"`**: a rounded capsule floating in the middle of the page.
- **`HeroBlock` has `proof` and `cards`**: a row of faces with a line above the title, and a row of quote and
  picture cards under the text.

## 0.1.0

The first release.

- **48 components**: typography, layout (including `Scaffold`), buttons, forms, feedback, navigation, data
  display and overlays.
- **Philippine fields**: `AddressPicker` (PSGC), `MobileNumberInput`, `PesoInput`, `PhilSysInput`, `TinInput`
  and `GroupedNumberInput`.
- **10 blocks**: `LandingPage` plus header, hero, stats, features, news, FAQ, contact, call-to-action and footer blocks.
- **Languages**: every built-in text in English, Filipino and Bisaya, with `LanguageProvider`.
- **Themes**: CSS variables and a built-in dark mode.
- Works in Next.js server components: the package is marked `"use client"`.
