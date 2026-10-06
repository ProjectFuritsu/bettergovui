# Components

[← Back to the README](../README.md)

Every component, the props they share, and toasts. Every prop is also documented in your editor: hover over a component or a prop to see what it does.

## Components

| Group | Components |
|---|---|
| Typography | `Text`, `Heading`, `Link`, `List` / `ListItem`, `Code`, `Kbd` |
| Layout | `Scaffold` (`ScaffoldHeader`, `ScaffoldNavbar`, `ScaffoldMain`, `ScaffoldAside`, `ScaffoldFooter`, `ScaffoldBurger`), `Container`, `Stack`, `Group`, `Grid`, `Divider` |
| Buttons | `Button` |
| Forms | `Input`, `PasswordInput`, `Textarea`, `Select`, `Checkbox`, `Radio` / `RadioGroup`, `Switch`, `DateInput`, `FileUpload`, `Fieldset`, `AddressPicker`, `MobileNumberInput`, `PesoInput`, `PhilSysInput`, `TinInput`, `GroupedNumberInput` |
| Feedback | `Alert`, `Badge`, `Loader`, `Progress`, `Skeleton`, `StatusChecker`, `Toast` (`Toaster` + `toast()`) |
| Navigation | `Navbar` + `NavLink`, `Tabs` (`TabList`, `Tab`, `TabPanel`), `Breadcrumbs`, `Pagination`, `Stepper` (`Step`, `StepperCompleted`) |
| Data display | `Table`, `Accordion` (`AccordionItem`), `Card` (`CardTitle`, `CardDescription`, `CardSection`, `CardFooter`), `Avatar`, `Tooltip` |
| Overlays | `Modal`, `Drawer` |

To try every component and copy ready-made code, run the toolkit (see [Try it in the toolkit](../README.md#try-it-in-the-toolkit)).

## Shared props

Most components accept the same kinds of values:

- **`size`**: a preset `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`, a number in pixels (`size={20}`), or any CSS length (`size="1.5rem"`).
- **`color`**: a theme color, `"primary"`, `"secondary"`, `"tertiary"`, `"accent"`, `"info"`, `"success"`, `"warning"` or `"danger"`, or any CSS color (`color="#2f9e44"`).
- **`gap`** and other spacing props: the same presets, mapped to the spacing scale (4, 8, 12, 16 and 24px).
- **`variant`**: describes the look, for example `"filled"`, `"outline"` or `"text"` for buttons.
- **`as`**: which HTML element a layout component uses, e.g. `<Stack as="section">` (see [Semantic HTML](layout.md#semantic-html)).
- **`className`** and **`style`** work on every component.

```tsx
<Button variant="outline" color="danger" size="lg">Delete</Button>
<Badge color="success">Approved</Badge>
<Stack gap="xl">…</Stack>
```

## Toasts

Put a `Toaster` once in your app, then call `toast()` from anywhere:

```tsx
import { Toaster, toast } from "bettergovregiondavaoui";

<Toaster />   // once, e.g. in your root layout

toast({ title: "Application submitted", description: "We'll email you.", color: "success" });
```
