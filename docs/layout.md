# Page layout

[← Back to the README](../README.md)

The frame of a whole page (`Scaffold`), and how to use the right HTML elements (`as`).

## Scaffold

`Scaffold` is the frame of a whole page. Each part is the matching HTML element, so screen readers can
jump straight to the navigation or the main content. Leave out the parts you don't need.

```tsx
import {
    Scaffold, ScaffoldHeader, ScaffoldBurger, ScaffoldNavbar, ScaffoldMain, ScaffoldAside, ScaffoldFooter, Navbar, NavLink,
} from "bettergovregiondavaoui";

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <Scaffold>
            <ScaffoldHeader sticky>                       {/* <header> */}
                <ScaffoldBurger />                        {/* ☰, only on phones */}
                <strong>BetterGov Davao</strong>
            </ScaffoldHeader>
            <ScaffoldNavbar>                              {/* <nav aria-label="Main"> */}
                <Navbar>                                  {/* the links, in a column */}
                    <NavLink href="/" active>Dashboard</NavLink>
                    <NavLink href="/permits" badge={3}>Permits</NavLink>
                </Navbar>
            </ScaffoldNavbar>
            <ScaffoldMain>{children}</ScaffoldMain>       {/* <main> */}
            <ScaffoldAside>…help, related links…</ScaffoldAside>   {/* <aside> */}
            <ScaffoldFooter>© 2026 BetterGov Region Davao</ScaffoldFooter>   {/* <footer> */}
        </Scaffold>
    );
}
```

| Screen | Layout |
|---|---|
| Wide (1024px and up) | navbar, main and aside side by side |
| Tablet (768–1023px) | the aside moves under the main content |
| Phone (under 768px) | the navbar becomes a menu that slides in from the left, opened with `ScaffoldBurger` |

- **In the navbar**, use `Navbar` + `NavLink` (`active` marks the current page). There the Navbar shows as a column
  and doesn't add a second `<nav>`. Plain `<a>` links work too and get the same look.
- **On phones**, the menu closes when a link is followed, on Escape, when the backdrop is tapped or when focus
  leaves it. The page behind it doesn't scroll while it's open.
- **A "Skip to main content" link** is built in. It's the first thing keyboard users reach and only shows when focused.
  Change its text with `skipLinkLabel`, or turn it off with `skipLinkLabel={false}`.
- **Sizes:** `<ScaffoldNavbar width={280}>`, `<ScaffoldAside width="20rem">`, `<ScaffoldMain padding="xl">`.

## Semantic HTML

Elements like `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>` and `<footer>` look like a plain
`<div>`, but they tell screen readers, search engines and reader modes what each part of the page is. Screen reader
users can jump between them like a table of contents.

You can always write them yourself in JSX (`<section>…</section>`). The layout components also take an **`as`**
prop, so the component *is* that element and you don't need an extra wrapper:

```tsx
<Container as="main">…</Container>

<Stack as="section" aria-labelledby="services-heading">
    <Heading level={2} id="services-heading">Services</Heading>
    <Grid as="ul">                        {/* a list: screen readers say "list, 6 items" */}
        <Card as="li">…</Card>
        <Card as="li">…</Card>
    </Grid>
</Stack>

<Card as="article">
    <CardTitle>Business permit</CardTitle>
    <CardFooter as="footer">…</CardFooter>
</Card>

<Group as="nav" aria-label="Footer">…links…</Group>
```

| Component | `as` can be |
|---|---|
| `Stack`, `Group`, `Grid` | `div` (default), `main`, `header`, `footer`, `nav`, `section`, `article`, `aside`, `ul`, `ol` |
| `Container` | the same, without `ul` and `ol` |
| `Card` | `div` (default), `article`, `section`, `aside`, `li` |
| `CardFooter` | `div` (default), `footer` |
| `CardTitle` | `h2` – `h6` (default `h3`) |
| `Text` | `p` (default), `span`, `div`, `strong`, `em`, `small` |

Which one to use:

- **`main`**: the page's own content. Only one per page.
- **`header` / `footer`**: the top and bottom of the page. Inside an `article` or `section`, they're that part's header and footer instead.
- **`nav`**: a group of links for getting around. With more than one, name each: `aria-label="Main"`, `aria-label="Footer"`.
- **`section`**: a part of the page with its own heading. Point `aria-labelledby` at the heading so it shows up as a region.
- **`article`**: something complete on its own, like a news post or a service card.
- **`aside`**: side content, like help or related links.
- **`ul` / `ol`**: a list of things. Each child must be an `<li>` (`<Card as="li">` works). The bullets are removed for you.

The other components already use the right elements: `Heading` is `h1`–`h6`, `Breadcrumbs` and `Pagination` are
`<nav>` with a list, `Stepper` is an `<ol>`, `Divider` is an `<hr>`, `Modal` and `Drawer` are `<dialog>`, `RadioGroup`
is a `<fieldset>` with a `<legend>`, `Code` is `<code>`/`<pre>` and `Kbd` is `<kbd>`.
