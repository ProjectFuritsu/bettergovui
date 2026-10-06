# Blocks

[← Back to the README](../README.md)

Ready-made sections of a page, and `LandingPage` to put them together.

## Using blocks

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

`Button` takes an `href` too, which makes it a link that looks like a button: `<Button href="/apply">Apply now</Button>`.
