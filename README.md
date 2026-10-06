# bettergovregiondavaoui

Accessible React UI components with light and dark themes, made for government web services in the Davao Region.

- **46 components:** a page scaffold, text, layout, forms, feedback, navigation, data display and overlays
- **9 ready-made blocks:** header, hero, stats, features, news, FAQ, contact, call to action and footer, to build a page in minutes
- **Accessible by default:** keyboard support, screen reader labels, readable contrast in both themes
- **Themeable** with CSS variables, including a built-in dark mode
- **Works on every screen size:** components adjust to phones on their own
- **No extra dependencies:** only React

## What makes it different

Most UI kits are general-purpose. This one is made for one job: **public service websites in the Philippines**.

- **Made for citizen services.** The blocks and examples speak the language of government sites: services and permits,
  advisories, office hours, fees in pesos. Dates are handled in local time (no "day before" bug from UTC) and shown in
  Philippine formats. There are fields for Philippine addresses, mobile numbers, peso amounts, PhilSys and TIN numbers.
- **In English, Filipino and Bisaya.** Every built-in text (buttons, messages, labels read by screen readers) comes in
  all three. One `LanguageProvider` switches them all.
- **Accessible by default.** Text contrast is checked in light and dark mode, pages use real HTML landmarks
  (`<header>`, `<nav>`, `<main>`, `<footer>`), lists, `<address>` and `<time>`, page layouts include a skip link, everything works
  with a keyboard, and animations stop for people who turn them off. Government sites serve everyone, including
  seniors and people with disabilities.
- **Light for slow phones and connections.** No dependencies besides React; the whole kit is under 50 KB gzipped
  (about 30 KB JavaScript + 14 KB CSS). It uses the browser's own date picker, dialogs and `<details>`, which work well on
  low-cost phones.
- **A page in minutes.** `LandingPage` and 9 blocks, plus a toolkit to try every component on phone, tablet and
  desktop and copy the code.

## Installation

```bash
npm install bettergovregiondavaoui
```

It needs React 18 or newer (tested with React 19).

## Setup

Import the stylesheet **once**, in your app's entry file (for example `main.tsx` or your root layout):

```tsx
import "bettergovregiondavaoui/styles.css";
```

Give your page the theme's background and text color, so it matches the components:

```css
body {
    margin: 0;
    background: var(--surface);
    color: var(--text);
}
```

## Quick example

```tsx
import { Button, Container, Heading, Input, Stack, Text } from "bettergovregiondavaoui";

export function SignUp() {
    return (
        <Container size="sm">
            <Stack gap="lg">
                <Heading level={1}>Create an account</Heading>
                <Text muted>It only takes a minute.</Text>
                <Input label="Email address" type="email" required />
                <Button fullWidth>Continue</Button>
            </Stack>
        </Container>
    );
}
```

## Components

| Group | Components |
|---|---|
| Typography | `Text`, `Heading`, `Link`, `List` / `ListItem`, `Code`, `Kbd` |
| Layout | `Scaffold` (`ScaffoldHeader`, `ScaffoldNavbar`, `ScaffoldMain`, `ScaffoldAside`, `ScaffoldFooter`, `ScaffoldBurger`), `Container`, `Stack`, `Group`, `Grid`, `Divider` |
| Buttons | `Button` |
| Forms | `Input`, `Textarea`, `Select`, `Checkbox`, `Radio` / `RadioGroup`, `Switch`, `DateInput`, `FileUpload`, `Fieldset`, `AddressPicker`, `MobileNumberInput`, `PesoInput`, `PhilSysInput`, `TinInput`, `GroupedNumberInput` |
| Feedback | `Alert`, `Badge`, `Loader`, `Progress`, `Skeleton`, `Toast` (`Toaster` + `toast()`) |
| Navigation | `Navbar` + `NavLink`, `Tabs` (`TabList`, `Tab`, `TabPanel`), `Breadcrumbs`, `Pagination`, `Stepper` (`Step`, `StepperCompleted`) |
| Data display | `Table`, `Accordion` (`AccordionItem`), `Card` (`CardTitle`, `CardDescription`, `CardSection`, `CardFooter`), `Avatar`, `Tooltip` |
| Overlays | `Modal`, `Drawer` |

Every prop is documented in your editor: hover over a component or a prop to see what it does.
To try every component and copy ready-made code, run the toolkit (see [Working on the library](#working-on-the-library)).

## Shared props

Most components accept the same kinds of values:

- **`size`**: a preset `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`, a number in pixels (`size={20}`), or any CSS length (`size="1.5rem"`).
- **`color`**: a theme color, `"primary"`, `"secondary"`, `"tertiary"`, `"accent"`, `"info"`, `"success"`, `"warning"` or `"danger"`, or any CSS color (`color="#2f9e44"`).
- **`gap`** and other spacing props: the same presets, mapped to the spacing scale (4, 8, 12, 16 and 24px).
- **`variant`**: describes the look, for example `"filled"`, `"outline"` or `"text"` for buttons.
- **`as`**: which HTML element a layout component uses, e.g. `<Stack as="section">` (see [Semantic HTML](#semantic-html)).
- **`className`** and **`style`** work on every component.

```tsx
<Button variant="outline" color="danger" size="lg">Delete</Button>
<Badge color="success">Approved</Badge>
<Stack gap="xl">…</Stack>
```

## Forms: reading the values

All form components render real form elements underneath, so the usual ways work.

**On submit, with `FormData`:** give each field a `name`.

```tsx
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const city = form.get("city");                   // the chosen option
    const agreed = form.get("agree") === "on";        // Checkbox and Switch send "on" when checked
}

<form onSubmit={handleSubmit}>
    <Select name="city" label="City" options={["Davao City", "Tagum City"]} required />
    <RadioGroup name="submitBy" label="How will you submit?">   {/* name goes on the group */}
        <Radio value="online" label="Online" />
        <Radio value="walk-in" label="Walk-in" />
    </RadioGroup>
    <Checkbox name="agree" label="I agree to the terms" required />
    <Button type="submit">Submit</Button>
</form>
```

**While the user types, with state:**

| Component | Value | Example |
|---|---|---|
| `Input`, `Textarea`, `Select` | `value` + `onChange` | `onChange={e => setName(e.target.value)}` |
| `Checkbox`, `Switch` | `checked` + `onChange` | `onChange={e => setOn(e.target.checked)}` |
| `RadioGroup`, `Tabs` | `value` + `onValueChange` | `onValueChange={setChoice}` |
| `DateInput` | `value` + `onValueChange` (a `Date`) | `onValueChange={date => setDate(date)}` |
| `FileUpload` | `files` + `onFilesChange` (a `File[]`) | `onFilesChange={setFiles}` |

`FileUpload` with a `name` also sends its files with the form, like a normal file field.

Show errors with the `error` prop, for example `<Input error="Enter a valid email address" />`.
The form components also accept a `ref`, so form libraries like react-hook-form work with them.

## Philippine fields

Fields for things Philippine forms always ask for. They format as you type, clean up pasted text, and send plain
values with the form (through a hidden field named with `name`).

```tsx
import { MobileNumberInput, PesoInput } from "bettergovregiondavaoui";

// Shows +63 and "917 123 4567". Pasting "0917-123-4567" or "+63 917 123 4567" works too.
<MobileNumberInput name="mobile" onValueChange={(number, { e164 }) => setMobile(e164)} />   // e164: "+639171234567"

// Shows ₱ and "15,000.00". min/max block the form with a clear message.
<PesoInput label="Amount to pay" name="amount" min={100} onValueChange={setAmount} />          // 15000 (a number)
```

| Field | Gives you | The form sends |
|---|---|---|
| `MobileNumberInput` | the digits after +63, plus `{ valid, e164 }` | `+639171234567` (empty until complete) |
| `PesoInput` | the amount as a number, or `null` | `15000.00` (no ₱ or commas) |
| `PhilSysInput` | the 16 digits of the PhilSys Card Number (PCN) | `1234567890123456` |
| `TinInput` | the digits, plus `{ tin, branch }` split out | `123456789` (or with the branch code: `branchCode`) |
| `GroupedNumberInput` | any number in digit groups, e.g. SSS `groups={[2, 7, 1]}`, PhilHealth `[2, 9, 1]`, Pag-IBIG `[4, 4, 4]` | the digits |

**ID numbers are personal data.** Under the Data Privacy Act, only ask for the ones a service really needs, and
don't keep them longer than necessary. These fields don't send the numbers anywhere; they only go where your form sends them.
PhilSysInput asks for the 16-digit card number (PCN) printed on the PhilID, not the 12-digit PhilSys Number (PSN),
which is meant to stay private.

`Input` also has `prefix` and `suffix` now, for fixed text in the field: `<Input prefix="https://" suffix=".gov.ph" />`.

### Philippine addresses

`AddressPicker` asks for Region → Province → City / Municipality → Barangay, using the official
Philippine Standard Geographic Code (PSGC) list. Each list loads when the field above it is chosen.

```tsx
import { AddressPicker } from "bettergovregiondavaoui";

<AddressPicker
    legend="Business address"
    name="address"                 // the form sends address.region, address.province, address.city, address.barangay (PSGC codes)
    onChange={setAddress}          // { region, province, city, barangay }, each { code, name }
    limitToRegion="110000000"      // optional: Davao Region only (the region field is hidden)
    required
/>
```

- **Save the codes, not just the names.** Codes like `112402000` (City of Davao) stay the same when names are respelled.
- **Metro Manila** has no provinces, so that field says "None in this region" and the cities load from the region.
- **Translate it** with `labels`, e.g. `labels={{ city: "Lungsod / Bayan", choose: "Pumili…" }}`.
- **Where the data comes from:** by default, the free public PSGC API at `psgc.gitlab.io`. Users' browsers load it
  directly, so your site works without a server of its own. For a production government site, host your own copy
  with the same paths and use `source={psgcApi("https://your-site.gov.ph/psgc")}`, so you don't depend on a third party.
  Or pass your own `source` (any object with `regions`, `provinces`, `cities` and `barangays` functions).

## Languages

The components' own texts (close buttons, "Loading", address labels, error messages, and the names screen readers
say for menus and lists) come in **English**, **Filipino** and **Bisaya (Cebuano)**. Put `LanguageProvider` around
your app to choose one:

```tsx
import { LanguageProvider } from "bettergovregiondavaoui";

<LanguageProvider language="ceb">   {/* "en" (the default), "fil" or "ceb" */}
    <App />
</LanguageProvider>
```

- Also set the page's language, `<html lang="ceb">`, so screen readers pronounce it correctly.
- **Your own text always wins:** `<Alert closeLabel="Sirado" />` uses "Sirado" whatever the language.
- **Change a few texts for the whole app** with `messages`, e.g. `messages={{ close: "Sirado", address: { city: "Lungsod" } }}`.
- **Dates** in blocks follow the language (`fil-PH`). Browsers that don't have Bisaya date names yet use English ones.
- **Have the translations checked.** The Filipino and Bisaya texts were written with care, but a native speaker should
  review them before a site goes live. They're all in one file, `src/i18n/messages.ts`.

The toolkit has a language switch (EN / FIL / CEB) next to the dark mode toggle.

## Toasts

Put a `Toaster` once in your app, then call `toast()` from anywhere:

```tsx
import { Toaster, toast } from "bettergovregiondavaoui";

<Toaster />   // once, e.g. in your root layout

toast({ title: "Application submitted", description: "We'll email you.", color: "success" });
```

## Blocks: ready-made page sections

Blocks are whole sections of a page, built from the components. Fill in the text and buttons with props.

```tsx
import { HeaderBlock, HeroBlock, FeaturesBlock, FaqBlock, CtaBlock, FooterBlock } from "bettergovregiondavaoui";

<HeroBlock
    header={<HeaderBlock logo="BetterGov Davao" links={links} action="Sign in" />}   {/* or your own navbar */}
    footer={<FooterBlock logo="BetterGov Davao" columns={footerColumns} />}          {/* or your own footer */}
    title="Government services, without the long lines"
    description="Apply for permits and pay your taxes online."
    primaryAction={{ label: "Apply now", href: "/apply" }}
    secondaryAction="See requirements"
    image="/city-hall.jpg"                                                           {/* optional */}
    imageAlt="Davao City Hall"
/>
```

| Block | What it is |
|---|---|
| `LandingPage` | A whole page from the blocks below, with a skip link and the `<main>` landmark. Pass each section's props, your own element, or leave it out. |
| `HeaderBlock` | Logo, links and a button. On phones the links move into a ☰ menu. |
| `HeroBlock` | The opening section: title, description, two buttons, optional picture. `header` and `footer` take any element. |
| `StatsBlock` | A row of big numbers, e.g. permits issued and processing time. |
| `FeaturesBlock` | A titled grid of cards, e.g. services. Cards with an `href` are clickable anywhere. |
| `NewsBlock` | The latest posts as cards: picture, category, date, title and excerpt. Each card is a link. |
| `FaqBlock` | Questions and answers, with an optional "contact us" button. |
| `ContactBlock` | Address, phone, email and office hours, with an optional map (a Google Maps embed link or your own element). |
| `CtaBlock` | A banner asking people to take the next step. |
| `FooterBlock` | Logo, columns of links, copyright, and Privacy/Accessibility links. |

**Buttons in blocks** (`primaryAction`, `action`…) can be plain text (`"Sign in"`), a link (`{ label: "Apply now", href: "/apply" }`),
a click handler (`{ label: "Open", onClick: … }`), or your own element (`<Button leftIcon={<Send />}>Apply</Button>`).

`Button` also takes an `href` now, which makes it a link that looks like a button: `<Button href="/apply">Apply now</Button>`.

## Page layout: Scaffold

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

## Theming

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

### Dark mode

Add `data-theme="dark"` to `<html>`, and every component switches. It also works on a single element, to make just that part of the page dark.

```html
<html data-theme="dark">
```

Colored text and outlines automatically get a lighter shade in dark mode, so they stay readable.

## Accessibility

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

## Working on the library

```bash
npm install
npm run dev        # the toolkit: try every component, change its props, copy the code
npm run build      # builds the library into dist/
npm run typecheck  # checks the types of the library and the toolkit
```

The toolkit's preview can show **Responsive**, **Desktop**, **Tablet** and **Phone** sizes (portrait or landscape), plus a light/dark switch.

**To add a component:**

1. Create `src/components/Name/Name.tsx` and `Name.module.css`. Use the theme variables for colors and spacing.
2. Export it from `src/index.ts`.
3. Add a toolkit page in `playground/entries/name.tsx` and list it in `playground/entries/index.ts`.

**To test it in another app before publishing:**

```bash
npm run build
npm pack           # creates bettergovregiondavaoui-1.0.0.tgz
```

Then, in the other app, run `npm install ../path/to/bettergovregiondavaoui-1.0.0.tgz`.
