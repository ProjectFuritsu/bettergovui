# Contributing to BetterGov UI

Thank you for helping. This kit is for public service websites, so every improvement reaches people who depend on
government services, including seniors, people with disabilities, and people on slow phones.

You don't need to write code to help:

| You can | How |
|---|---|
| **Check the translations** | If you speak Filipino or Bisaya natively, read [`src/i18n/messages.ts`](src/i18n/messages.ts) and [suggest better wording](https://github.com/ProjectFuritsu/bettergovui/issues/new?template=translation.yml). |
| **Report a bug** | Something broken, hard to read, or confusing with a keyboard or screen reader? [Open a bug report](https://github.com/ProjectFuritsu/bettergovui/issues/new?template=bug_report.yml). |
| **Suggest a component** | Tell us what a government service needs. [Suggest an idea](https://github.com/ProjectFuritsu/bettergovui/issues/new?template=feature_request.yml). |
| **Write code** | Read on. |

## Setting up

You need [Node.js](https://nodejs.org) 20.19 or newer (22 recommended) and Git.

```bash
git clone https://github.com/ProjectFuritsu/bettergovui.git
cd bettergovui
npm install
npm run dev        # the toolkit, at http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Starts the toolkit: a page for every component, with live props, device sizes, themes and languages |
| `npm run typecheck` | Checks the types of the library and the toolkit |
| `npm run build` | Builds the library into `dist/` |

## How the project is organized

```
src/
  components/Name/      a component: Name.tsx and Name.module.css
  blocks/Name/          a block (a whole page section), built from components
  i18n/messages.ts      every built-in text, in English, Filipino and Bisaya
  styles/tokens.css     the theme: colors, spacing, radius, dark mode
  utils/                small shared helpers
  index.ts              everything the package exports
playground/
  entries/name.tsx      the toolkit page for each component
  workbench/            the toolkit itself
docs/                   the guides linked from the README
```

## Adding or changing a component

1. **Create** `src/components/Name/Name.tsx` and `Name.module.css`.
2. **Use the theme variables** (`var(--primary)`, `var(--spacing-md)`, `var(--radius)`…) for colors, spacing and
   corners, never fixed colors, so themes and dark mode work.
3. **Put any text the component shows or says to screen readers in `src/i18n/messages.ts`**, in all three languages,
   and read it with `useMessages()`. A prop with the same text should still win.
4. **Export it** from `src/index.ts`, with its props type.
5. **Add a toolkit page** in `playground/entries/name.tsx` and list it in `playground/entries/index.ts`.
6. **Document it**: a line in the README's tables, and the details in the right guide in `docs/`.

### Before you send it, check that

- [ ] It works with **only a keyboard** (Tab, Shift+Tab, Enter, Space, Escape, arrows where they make sense),
      and you can always see where the focus is.
- [ ] It makes sense with a **screen reader**: names, roles and changes are announced. Use real HTML elements
      (`<button>`, `<nav>`, `<dialog>`…) before ARIA.
- [ ] Text is readable in **light and dark mode** (contrast of at least 4.5:1 for normal text).
- [ ] It fits a **phone** (try the toolkit's Phone view) and doesn't scroll sideways.
- [ ] Animations stop with **reduced motion** (`@media (prefers-reduced-motion: reduce)`).
- [ ] It looks right in **English, Filipino and Bisaya** (try the toolkit's language switch).
- [ ] `npm run typecheck` and `npm run build` pass.

## Style

- **Match the code around you**: 4 spaces, double quotes, small focused files.
- **Write comments and docs in plain English**, for people who are still learning. Say *why*, not just *what*.
- **No new dependencies** without talking about it first in an issue. Staying small is one of the kit's promises.
- **Prefer the browser's own features** (native `<select>`, `<dialog>`, `<details>`, date pickers). They work well
  on low-cost phones and with assistive technology.

## Sending a change

1. Fork the repository and create a branch, e.g. `add-timeline` or `fix-table-phone-layout`.
2. Keep each pull request to one thing. Small ones get reviewed faster.
3. Describe what changed and how you tested it. Screenshots in light and dark mode, and on a phone, help a lot.
4. Fill in the checklist in the pull request form.

## Testing in another app

To try your changes in a real project before they're published:

```bash
npm run build
npm pack           # creates bettergovregiondavaoui-<version>.tgz
```

Then, in the other project: `npm install ../path/to/bettergovregiondavaoui-<version>.tgz`.

## Publishing a release (maintainers)

1. Add the changes to [CHANGELOG.md](CHANGELOG.md) under a new version.
2. Raise the version. While the kit is 0.x: `npm version patch` for fixes, `npm version minor` for new features
   or anything that could break existing code. This also makes a commit and a Git tag.
3. `npm publish`. It checks the types and builds a fresh `dist/` first, then uploads.
4. `git push --follow-tags`, so GitHub gets the commit and the tag.

## Security problems

Please don't post security problems in public issues. See [SECURITY.md](SECURITY.md).

## Be kind

Be patient and respectful. Many people here are learning, and every question is welcome. Explain, don't judge.

## License

By contributing, you agree that your contribution is released under [CC0 1.0](LICENSE), like the rest of the kit:
public domain, free for anyone to use.
