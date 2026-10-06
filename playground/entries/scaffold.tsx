import {Award, CreditCard, FileText, LayoutDashboard, Settings, type LucideIcon} from "lucide-react";
import {useState} from "react";
import {
    Badge,
    Button,
    Card,
    CardDescription,
    CardTitle,
    Grid,
    Group,
    Heading,
    Link,
    Navbar,
    NavLink,
    Scaffold,
    ScaffoldAside,
    ScaffoldBurger,
    ScaffoldFooter,
    ScaffoldHeader,
    ScaffoldMain,
    ScaffoldNavbar,
    Stack,
    Text,
} from "../../src";
import {compact, openTag} from "../workbench/code";
import {LayoutGuides} from "../workbench/LayoutGuides";
import {defineEntry, type Controls, type ValuesOf} from "../workbench/types";

const LINKS: {label: string; icon: LucideIcon; badge?: number}[] = [
    {label: "Dashboard", icon: LayoutDashboard},
    {label: "Permits", icon: FileText, badge: 3},
    {label: "Payments", icon: CreditCard},
    {label: "Certificates", icon: Award},
    {label: "Settings", icon: Settings},
];

const APPLICATIONS = [
    {name: "Business permit", detail: "Ready for pickup at City Hall, Window 4.", status: "Approved", color: "success"},
    {name: "Real property tax", detail: "Second quarter, due October 31.", status: "Due soon", color: "warning"},
    {name: "Barangay clearance", detail: "Submitted September 28.", status: "In review", color: "info"},
] as const;

const controls = {
    header: {type: "boolean", default: true},
    stickyHeader: {type: "boolean", default: false},
    navbar: {type: "boolean", default: true},
    // in pixels; 256 = the default of 16rem
    navbarWidth: {type: "number", min: 160, max: 360, step: 8, default: 256},
    aside: {type: "boolean", default: true},
    // in pixels; 288 = the default of 18rem
    asideWidth: {type: "number", min: 200, max: 400, step: 8, default: 288},
    footer: {type: "boolean", default: true},
    mainPadding: {type: "size", default: "", optional: true},
    // Not a prop: draws the layout guides (the grid's columns) over the preview
    showGuides: {type: "boolean", default: false},
} satisfies Controls;

type Values = ValuesOf<typeof controls>;

// A component (not just the render function) so it can remember which link was clicked
function ScaffoldDemo(values: Values) {
    const [current, setCurrent] = useState("Dashboard");

    return (
        <LayoutGuides enabled={values.showGuides}>
            <Scaffold>
                {values.header && (
                    <ScaffoldHeader sticky={values.stickyHeader}>
                        {values.navbar && <ScaffoldBurger />}
                        <Text as="span" size="lg" weight="bold">BetterGov Davao</Text>
                        <Button size="sm" variant="outline" style={{marginLeft: "auto"}}>Sign in</Button>
                    </ScaffoldHeader>
                )}

                {values.navbar && (
                    <ScaffoldNavbar width={values.navbarWidth === 256 ? undefined : values.navbarWidth}>
                        <Navbar>
                            {LINKS.map(({label, icon: Icon, badge}) => (
                                <NavLink
                                    key={label}
                                    href="#"
                                    active={label === current}
                                    icon={<Icon />}
                                    badge={badge}
                                    onClick={event => {
                                        event.preventDefault(); // stay on the demo page
                                        setCurrent(label);
                                    }}>
                                    {label}
                                </NavLink>
                            ))}
                        </Navbar>
                    </ScaffoldNavbar>
                )}

                <ScaffoldMain padding={values.mainPadding === "" ? undefined : values.mainPadding}>
                    <Stack gap="lg">
                        <Stack gap="xs">
                            <Heading level={1} size={2}>{current}</Heading>
                            <Text muted>Welcome back, Juan. Here's where your applications stand.</Text>
                        </Stack>
                        {/* A list of cards: screen readers say "list, 3 items" */}
                        <Grid as="ul" minColumnWidth="12rem">
                            {APPLICATIONS.map(application => (
                                <Card as="li" key={application.name}>
                                    <Badge color={application.color} style={{alignSelf: "flex-start"}}>{application.status}</Badge>
                                    <CardTitle as="h2">{application.name}</CardTitle>
                                    <CardDescription>{application.detail}</CardDescription>
                                </Card>
                            ))}
                        </Grid>
                    </Stack>
                </ScaffoldMain>

                {values.aside && (
                    <ScaffoldAside width={values.asideWidth === 288 ? undefined : values.asideWidth}>
                        <Stack gap="sm">
                            <Heading level={2} size={5}>Need help?</Heading>
                            <Text size="sm" muted>The help desk answers within one working day.</Text>
                            <Link href="#" onClick={event => event.preventDefault()}>Contact the help desk</Link>
                        </Stack>
                    </ScaffoldAside>
                )}

                {values.footer && (
                    <ScaffoldFooter>
                        <Group justify="space-between" gap="sm">
                            <Text size="sm" muted>© 2026 BetterGov Region Davao</Text>
                            <Group as="nav" aria-label="Footer" gap="md">
                                {["Privacy", "Accessibility", "Contact"].map(label => (
                                    <Link key={label} href="#" onClick={event => event.preventDefault()}>{label}</Link>
                                ))}
                            </Group>
                        </Group>
                    </ScaffoldFooter>
                )}
            </Scaffold>
        </LayoutGuides>
    );
}

export const scaffoldEntry = defineEntry({
    name: "Scaffold",
    category: "Layout",
    description:
        "The frame of a whole page: header, navbar, main, aside and footer, each the matching HTML element. Leave out the parts you don't need. Try Tablet (the aside moves down) and Phone (☰ opens the navbar).",
    layout: "page",
    controls,
    render: values => <ScaffoldDemo {...values} />,
    code: values => {
        const parts = compact([
            "Scaffold",
            values.header && "ScaffoldHeader",
            values.header && values.navbar && "ScaffoldBurger",
            values.navbar && "ScaffoldNavbar",
            values.navbar && "Navbar",
            values.navbar && "NavLink",
            "ScaffoldMain",
            values.aside && "ScaffoldAside",
            values.footer && "ScaffoldFooter",
        ]);
        const indent = "            ";
        const mainProps = compact([
            values.mainPadding !== "" &&
                (typeof values.mainPadding === "number" ? `padding={${values.mainPadding}}` : `padding="${values.mainPadding}"`),
        ]);
        const body = compact([
            values.header &&
                [
                    openTag("ScaffoldHeader", compact([values.stickyHeader && "sticky"]), indent),
                    values.navbar && `${indent}    <ScaffoldBurger />`,
                    `${indent}    <strong>BetterGov Davao</strong>`,
                    `${indent}</ScaffoldHeader>`,
                ].filter(Boolean).join("\n"),
            values.navbar &&
                [
                    openTag("ScaffoldNavbar", compact([values.navbarWidth !== 256 && `width={${values.navbarWidth}}`]), indent),
                    `${indent}    <Navbar>`,
                    `${indent}        <NavLink href="/" active icon={<LayoutDashboard />}>Dashboard</NavLink>`,
                    `${indent}        <NavLink href="/permits" icon={<FileText />} badge={3}>Permits</NavLink>`,
                    `${indent}        <NavLink href="/payments" icon={<CreditCard />}>Payments</NavLink>`,
                    `${indent}    </Navbar>`,
                    `${indent}</ScaffoldNavbar>`,
                ].join("\n"),
            `${openTag("ScaffoldMain", mainProps, indent)}{children}</ScaffoldMain>`,
            values.aside &&
                `${openTag("ScaffoldAside", compact([values.asideWidth !== 288 && `width={${values.asideWidth}}`]), indent)}…help, related links…</ScaffoldAside>`,
            values.footer && `${indent}<ScaffoldFooter>© 2026 BetterGov Region Davao</ScaffoldFooter>`,
        ]);
        const icons = values.navbar ? `\nimport { CreditCard, FileText, LayoutDashboard } from "lucide-react";` : "";
        return `import {
    ${parts.join(",\n    ")},
} from "bettergovregiondavaoui";${icons}

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <Scaffold>
${body.join("\n")}
        </Scaffold>
    );
}`;
    },
});
