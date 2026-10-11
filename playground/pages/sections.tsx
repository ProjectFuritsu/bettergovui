import {
    Award, Briefcase, Building2, Bus, Calendar, CreditCard, FileText, GraduationCap, HandCoins, Heart, House, Leaf, Phone,
    ShieldCheck, Stamp, Users,
} from "lucide-react";
import {createElement, Fragment, type ComponentType, type ReactNode} from "react";
import {
    Alert, Button, Card, CardDescription, CardFooter, CardTitle, ContactBlock, Container, CtaBlock, FaqBlock, FeaturesBlock,
    FooterBlock, Grid, HeaderBlock, Heading, HeroBlock, NewsBlock, Stack, StatsBlock, Step, Stepper, Table, Text,
} from "../../src";
import {banner, CITY_HALL, MAP} from "../entries/blocks";
import {isObject, type Json, type JsonObject, type SectionData} from "./schema";

// ---------- Things a page's data refers to by name ----------

/** Icons a section can use. The data holds the name ("Stamp"); the code imports it from lucide-react. */
export const ICONS: Record<string, ComponentType> = {
    Award, Briefcase, Building2, Bus, Calendar, CreditCard, FileText, GraduationCap, HandCoins, Heart, House, Leaf, Phone,
    ShieldCheck, Stamp, Users,
};

/** Demo pictures, so shared pages stay small. In the code they become paths for your own files. */
const PICTURES: Record<string, {src: string; path: string}> = {
    "demo:city-hall": {src: CITY_HALL, path: "/images/city-hall.jpg"},
    "demo:map": {src: MAP, path: "/images/map.png"},
    "demo:blue": {src: banner("#0d6efd", "#7048e8"), path: "/images/news-1.jpg"},
    "demo:orange": {src: banner("#ff9800", "#e03131"), path: "/images/news-2.jpg"},
    "demo:green": {src: banner("#278039", "#0b7d90"), path: "/images/news-3.jpg"},
};

export const PICTURE_NAMES = Object.keys(PICTURES);

// ---------- From the page's data to what a component gets ----------

/**
 * Leaves out what was emptied in the editor: empty texts, buttons and links without a label,
 * and list items with nothing left in them.
 */
export function clean(value: Json): Json | undefined {
    if (value === "" || value === null) return undefined;
    if (Array.isArray(value)) return value.map(clean).filter((item): item is Json => item !== undefined);
    if (isObject(value)) {
        const result: JsonObject = {};
        for (const [key, item] of Object.entries(value)) {
            const cleaned = clean(item);
            if (cleaned !== undefined) result[key] = cleaned;
        }
        if ("label" in value && !("label" in result)) return undefined;
        return Object.keys(result).length > 0 ? result : undefined;
    }
    return value;
}

const cleanProps = (props: JsonObject) => (clean(props) ?? {}) as JsonObject;

// Icon names become icons, and demo pictures become real picture addresses
function hydrate(value: Json, key?: string): unknown {
    if (typeof value === "string") {
        if (key === "icon") return ICONS[value] ? createElement(ICONS[value]) : undefined;
        return PICTURES[value]?.src ?? value;
    }
    if (Array.isArray(value)) return value.map(item => hydrate(item));
    if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, hydrate(item, name)]));
    return value;
}

// ---------- From the page's data to code ----------

export interface SectionCode {
    jsx: string;
    /** What to import from the kit */
    imports: string[];
    /** What to import from lucide-react */
    icons: string[];
}

const quote = (text: string) => JSON.stringify(text);
const pad = (depth: number) => "    ".repeat(depth);

// A value as it's written in code, e.g. `[{ icon: <Stamp />, title: "Business permit" }]`
function literal(value: Json, depth: number, icons: Set<string>, key?: string): string {
    if (typeof value === "string") {
        if (key === "icon" && ICONS[value]) {
            icons.add(value);
            return `<${value} />`;
        }
        return quote(PICTURES[value]?.path ?? value);
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        return `[\n${value.map(item => `${pad(depth + 1)}${literal(item, depth + 1, icons)},`).join("\n")}\n${pad(depth)}]`;
    }
    if (isObject(value)) {
        const parts = Object.entries(value).map(([name, item]) => `${name}: ${literal(item, depth + 1, icons, name)}`);
        const oneLine = `{ ${parts.join(", ")} }`;
        if (!oneLine.includes("\n") && oneLine.length + depth * 4 <= 110) return oneLine;
        return `{\n${parts.map(part => `${pad(depth + 1)}${part},`).join("\n")}\n${pad(depth)}}`;
    }
    return String(value);
}

// `<HeroBlock title="…" primaryAction={{…}} />`, one prop per line
function element(name: string, props: JsonObject, depth: number, icons: Set<string>, children?: string) {
    const lines = Object.entries(props).map(([key, value]) => {
        if (value === true) return key;
        if (typeof value === "string" && !value.includes('"') && !value.includes("\n")) return `${key}="${PICTURES[value]?.path ?? value}"`;
        return `${key}={${literal(value, depth + 1, icons, key)}}`;
    });
    const open = lines.length === 0 ? `<${name}` : `<${name}\n${lines.map(line => `${pad(depth + 1)}${line}`).join("\n")}\n${pad(depth)}`;
    return children === undefined ? `${pad(depth)}${open}${lines.length === 0 ? " " : ""}/>` : `${pad(depth)}${open}>\n${children}\n${pad(depth)}</${name}>`;
}

// ---------- The kinds of section ----------

export interface SectionType {
    type: string;
    /** Its name in the builder, e.g. "Hero" */
    label: string;
    /** The component it's made of, shown next to the name */
    component: string;
    /** The props editor's link: the page where every prop of the block can be tried */
    entry?: string;
    /** Every field the editor offers, with an example value: the form is built from this shape */
    shape: JsonObject;
    /** Fields that are a choice between a few values */
    choices?: Record<string, readonly (string | number)[]>;
    render: (props: JsonObject) => ReactNode;
    code: (props: JsonObject, depth: number) => SectionCode;
}

// A block that takes the data as its props, as is
function block(type: string, label: string, name: string, Component: ComponentType<never>, shape: JsonObject, choices?: SectionType["choices"]): SectionType {
    return {
        type,
        label,
        component: name,
        entry: name,
        shape,
        choices,
        render: props => createElement(Component as ComponentType<Record<string, unknown>>, hydrate(props) as Record<string, unknown>),
        code: (props, depth) => {
            const icons = new Set<string>();
            return {jsx: element(name, props, depth, icons), imports: [name], icons: [...icons]};
        },
    };
}

const ACTION = {label: "Apply now", href: "#apply"};
const SECTION_SPACE = {paddingBlock: "clamp(2rem, 6vw, 4rem)"};
const SPACE_CODE = `style={{ paddingBlock: "clamp(2rem, 6vw, 4rem)" }}`;

// An address typed on several lines keeps its lines
const lines = (text: string) => text.split("\n").map((line, index) => <Fragment key={index}>{index > 0 && <br />}{line}</Fragment>);

const contact = block("contact", "Contact", "ContactBlock", ContactBlock as ComponentType<never>, {
    eyebrow: "",
    title: "Visit or call us",
    description: "We answer within one working day.",
    address: "City Hall, San Pedro Street\nDavao City 8000",
    phone: "(082) 241 1000",
    email: "help@bettergov-davao.ph",
    hours: [{days: "Monday – Friday", time: "8:00 AM – 5:00 PM"}],
    action: {label: "Get directions", href: "#directions"},
    map: "demo:map",
    mapTitle: "Map showing City Hall",
});

export const SECTION_TYPES: SectionType[] = [
    block("header", "Header", "HeaderBlock", HeaderBlock as ComponentType<never>, {
        logo: "BetterGov Davao",
        logoHref: "/",
        links: [{label: "Services", href: "#services", active: false}],
        action: {label: "Sign in", href: "#sign-in"},
        sticky: false,
        variant: "bar",
    }, {variant: ["bar", "pill"]}),
    block("hero", "Hero", "HeroBlock", HeroBlock as ComponentType<never>, {
        eyebrow: "Davao Region e-Services",
        title: "Government services, without the long lines",
        description: "Apply for permits, pay your taxes and request documents online.",
        primaryAction: ACTION,
        secondaryAction: {label: "See requirements", href: "#requirements"},
        image: "demo:city-hall",
        imageAlt: "Illustration of a city hall",
        align: "left",
        proof: {text: "Rated 4.7 out of 5 by 2,300 residents", avatars: [{name: "Ana Reyes", src: ""}]},
        cards: [{quote: "I renewed my permit from my store, in ten minutes.", name: "Liza Mendoza", role: "Sari-sari store owner, Toril", image: "", imageAlt: ""}],
    }, {align: ["left", "center"], image: ["", ...PICTURE_NAMES]}),
    block("stats", "Stats", "StatsBlock", StatsBlock as ComponentType<never>, {
        eyebrow: "",
        title: "The numbers so far",
        description: "",
        stats: [{value: "12,480", label: "Permits issued this year", description: "Up 18% from last year"}],
    }),
    block("features", "Features", "FeaturesBlock", FeaturesBlock as ComponentType<never>, {
        eyebrow: "Services",
        title: "What you can do online",
        description: "",
        columns: 3,
        features: [{icon: "Stamp", title: "Business permit", description: "Apply for or renew your Mayor's permit.", href: "#business-permit"}],
    }, {columns: [2, 3, 4], icon: ["", ...Object.keys(ICONS)]}),
    block("news", "News", "NewsBlock", NewsBlock as ComponentType<never>, {
        eyebrow: "",
        title: "Latest news",
        description: "",
        columns: 3,
        action: {label: "All news", href: "#news"},
        items: [{title: "Business permit renewals now fully online", href: "#renewals", date: "2026-10-01", category: "Announcement", excerpt: "Renew your Mayor’s permit from home.", image: "demo:blue", imageAlt: ""}],
    }, {columns: [2, 3, 4], image: ["", ...PICTURE_NAMES]}),
    block("faq", "FAQ", "FaqBlock", FaqBlock as ComponentType<never>, {
        eyebrow: "",
        title: "Frequently asked questions",
        description: "",
        multiple: false,
        align: "left",
        items: [{question: "Do I need an account to apply?", answer: "Yes. An account lets you track your applications."}],
        action: {label: "Ask a question", href: "#contact"},
    }, {align: ["left", "center"]}),
    {
        ...contact,
        choices: {map: ["", "demo:map"]},
        render: ({address, map, mapTitle, ...props}) =>
            createElement(ContactBlock, {
                ...(hydrate(props) as Record<string, unknown>),
                address: typeof address === "string" ? lines(address) : undefined,
                // The demo map is a picture; your own would be a Google Maps embed link
                map: typeof map === "string" ? (map in PICTURES ? <img src={PICTURES[map].src} alt={String(mapTitle ?? "Map")} /> : map) : undefined,
                mapTitle: typeof mapTitle === "string" ? mapTitle : undefined,
            }),
        code: ({address, map, ...props}, depth) => {
            const icons = new Set<string>();
            const addressCode = typeof address === "string" ? `<>${address.split("\n").join("<br />")}</>` : undefined;
            let jsx = element("ContactBlock", {...props, ...(addressCode ? {address: "@address"} : {}), ...(map ? {map: "@map"} : {})}, depth, icons);
            if (addressCode) jsx = jsx.replace(`address="@address"`, `address={${addressCode}}`);
            // In Google Maps: Share → Embed a map, and copy the link from the code it gives
            jsx = jsx.replace(`map="@map"`, `map="https://www.google.com/maps/embed?pb=…"`);
            return {jsx, imports: ["ContactBlock"], icons: []};
        },
    },
    block("cta", "Call to action", "CtaBlock", CtaBlock as ComponentType<never>, {
        title: "Ready to start your application?",
        description: "It takes about 10 minutes. Have a valid ID ready.",
        primaryAction: {label: "Start now", href: "#apply"},
        secondaryAction: {label: "Check requirements", href: "#requirements"},
    }),
    block("footer", "Footer", "FooterBlock", FooterBlock as ComponentType<never>, {
        logo: "BetterGov Davao",
        description: "Government services for the Davao Region, online and in one place.",
        columns: [{title: "Services", links: [{label: "Business permit", href: "#bp"}]}],
        copyright: "© 2026 BetterGov Region Davao",
        bottomLinks: [{label: "Privacy", href: "#privacy"}],
        layout: "columns",
        tone: "default",
        card: false,
        heading: "",
        action: {label: "", href: ""},
        wordmark: "",
    }, {layout: ["columns", "centered", "grid"], tone: ["default", "muted", "dark"]}),

    // ----- Sections made of components -----
    {
        type: "alert",
        label: "Announcement",
        component: "Alert",
        entry: "Alert",
        shape: {color: "info", variant: "light", title: "Offices are closed on October 31", message: "Online services stay open. Payments made that day are posted on the next working day."},
        choices: {color: ["info", "success", "warning", "danger", "primary"], variant: ["light", "filled", "outline"]},
        render: ({color, variant, title, message}) => (
            <Container style={{paddingBlock: "1rem"}}>
                <Alert color={color as string} variant={variant as "light"} title={title as string}>{message as string}</Alert>
            </Container>
        ),
        code: ({message, ...props}, depth) => {
            const icons = new Set<string>();
            const alert = element("Alert", props, depth + 1, icons, `${pad(depth + 2)}${message ?? ""}`);
            return {jsx: `${pad(depth)}<Container style={{ paddingBlock: "1rem" }}>\n${alert}\n${pad(depth)}</Container>`, imports: ["Alert", "Container"], icons: []};
        },
    },
    {
        type: "text",
        label: "Text",
        component: "Heading + Text",
        entry: "Heading",
        shape: {title: "About this service", body: "Write a short paragraph here: who the service is for and what they need to bring.", align: "left", action: {label: "Learn more", href: "#more"}},
        choices: {align: ["left", "center"]},
        render: ({title, body, align, action}) => (
            <Container as="section" size="md" style={SECTION_SPACE}>
                <Stack gap="md" align={align === "center" ? "center" : "start"}>
                    {title && <Heading level={2} align={align as "left"}>{title as string}</Heading>}
                    {body && <Text muted align={align as "left"}>{lines(body as string)}</Text>}
                    {isObject(action) && <Button href={action.href as string} variant="outline">{action.label as string}</Button>}
                </Stack>
            </Container>
        ),
        code: ({title, body, align, action}, depth) => {
            const center = align === "center";
            const inner = [
                title && `<Heading level={2}${center ? ` align="center"` : ""}>${title}</Heading>`,
                body && `<Text muted${center ? ` align="center"` : ""}>${String(body).split("\n").join("<br />")}</Text>`,
                isObject(action) && `<Button href=${quote(String(action.href ?? "#"))} variant="outline">${action.label}</Button>`,
            ].filter(Boolean).map(line => `${pad(depth + 2)}${line}`).join("\n");
            const jsx = `${pad(depth)}<Container as="section" size="md" ${SPACE_CODE}>\n${pad(depth + 1)}<Stack gap="md" align="${center ? "center" : "start"}">\n${inner}\n${pad(depth + 1)}</Stack>\n${pad(depth)}</Container>`;
            return {jsx, imports: ["Container", "Stack", ...(title ? ["Heading"] : []), ...(body ? ["Text"] : []), ...(action ? ["Button"] : [])], icons: []};
        },
    },
    {
        type: "steps",
        label: "Steps",
        component: "Stepper",
        entry: "Stepper",
        shape: {title: "How it works", orientation: "horizontal", active: 0, steps: [{label: "Fill in the form", description: "About 10 minutes"}]},
        choices: {orientation: ["horizontal", "vertical"]},
        render: ({title, orientation, active, steps}) => (
            <Container as="section" style={SECTION_SPACE}>
                <Stack gap="xl">
                    {title && <Heading level={2}>{title as string}</Heading>}
                    <Stepper active={Number(active ?? 0)} orientation={orientation as "horizontal"}>
                        {(Array.isArray(steps) ? steps : []).filter(isObject).map((step, index) => (
                            <Step key={index} label={step.label as string} description={step.description as string} />
                        ))}
                    </Stepper>
                </Stack>
            </Container>
        ),
        code: ({title, orientation, active, steps}, depth) => {
            const items = (Array.isArray(steps) ? steps : []).filter(isObject)
                .map(step => `${pad(depth + 3)}<Step label=${quote(String(step.label ?? ""))}${step.description ? ` description=${quote(String(step.description))}` : ""} />`).join("\n");
            const jsx = [
                `${pad(depth)}<Container as="section" ${SPACE_CODE}>`,
                `${pad(depth + 1)}<Stack gap="xl">`,
                title && `${pad(depth + 2)}<Heading level={2}>${title}</Heading>`,
                `${pad(depth + 2)}<Stepper active={${Number(active ?? 0)}}${orientation === "vertical" ? ` orientation="vertical"` : ""}>`,
                items,
                `${pad(depth + 2)}</Stepper>`,
                `${pad(depth + 1)}</Stack>`,
                `${pad(depth)}</Container>`,
            ].filter(Boolean).join("\n");
            return {jsx, imports: ["Container", "Stack", "Stepper", "Step", ...(title ? ["Heading"] : [])], icons: []};
        },
    },
    {
        type: "cards",
        label: "Cards",
        component: "Grid + Card",
        entry: "Card",
        shape: {title: "Programs", columns: 3, cards: [{title: "Scholarship program", description: "For college students who live in the city.", action: {label: "See who qualifies", href: "#scholarship"}}]},
        choices: {columns: [2, 3, 4]},
        render: ({title, columns, cards}) => (
            <Container as="section" style={SECTION_SPACE}>
                <Stack gap="xl">
                    {title && <Heading level={2}>{title as string}</Heading>}
                    <Grid columns={Number(columns ?? 3)} gap="lg">
                        {(Array.isArray(cards) ? cards : []).filter(isObject).map((card, index) => (
                            <Card key={index} variant="outline">
                                <CardTitle>{card.title as string}</CardTitle>
                                {card.description && <CardDescription>{card.description as string}</CardDescription>}
                                {isObject(card.action) && (
                                    <CardFooter>
                                        <Button size="sm" variant="outline" href={card.action.href as string}>{card.action.label as string}</Button>
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </Grid>
                </Stack>
            </Container>
        ),
        code: ({title, columns, cards}, depth) => {
            const list = (Array.isArray(cards) ? cards : []).filter(isObject);
            const items = list.map(card => [
                `${pad(depth + 3)}<Card variant="outline">`,
                `${pad(depth + 4)}<CardTitle>${card.title ?? ""}</CardTitle>`,
                card.description && `${pad(depth + 4)}<CardDescription>${card.description}</CardDescription>`,
                isObject(card.action) && `${pad(depth + 4)}<CardFooter>\n${pad(depth + 5)}<Button size="sm" variant="outline" href=${quote(String(card.action.href ?? "#"))}>${card.action.label}</Button>\n${pad(depth + 4)}</CardFooter>`,
                `${pad(depth + 3)}</Card>`,
            ].filter(Boolean).join("\n")).join("\n");
            const jsx = [
                `${pad(depth)}<Container as="section" ${SPACE_CODE}>`,
                `${pad(depth + 1)}<Stack gap="xl">`,
                title && `${pad(depth + 2)}<Heading level={2}>${title}</Heading>`,
                `${pad(depth + 2)}<Grid columns={${Number(columns ?? 3)}} gap="lg">`,
                items,
                `${pad(depth + 2)}</Grid>`,
                `${pad(depth + 1)}</Stack>`,
                `${pad(depth)}</Container>`,
            ].filter(Boolean).join("\n");
            const hasAction = list.some(card => isObject(card.action));
            return {jsx, imports: ["Container", "Stack", "Grid", "Card", "CardTitle", "CardDescription", ...(hasAction ? ["CardFooter", "Button"] : []), ...(title ? ["Heading"] : [])], icons: []};
        },
    },
    {
        type: "table",
        label: "Table",
        component: "Table",
        entry: "Table",
        shape: {
            title: "Fees",
            caption: "Fees as of 2026",
            striped: false,
            columns: {first: "Document", second: "Fee", third: "Ready in"},
            rows: [{first: "Barangay clearance", second: "₱100", third: "1 day"}],
        },
        render: ({title, caption, striped, columns, rows}) => {
            const heads = isObject(columns) ? columns : {};
            return (
                <Container as="section" size="md" style={SECTION_SPACE}>
                    <Stack gap="lg">
                        {title && <Heading level={2}>{title as string}</Heading>}
                        <Table
                            caption={caption as string}
                            striped={Boolean(striped)}
                            columns={Object.entries(heads).map(([key, header]) => ({key, header: String(header)}))}
                            data={(Array.isArray(rows) ? rows : []).filter(isObject) as Record<string, string>[]}
                        />
                    </Stack>
                </Container>
            );
        },
        code: ({title, caption, striped, columns, rows}, depth) => {
            const heads = isObject(columns) ? columns : {};
            const icons = new Set<string>();
            const table = element("Table", {
                ...(caption ? {caption} : {}),
                ...(striped ? {striped: true} : {}),
                columns: Object.entries(heads).map(([key, header]) => ({key, header})),
                data: Array.isArray(rows) ? rows : [],
            }, depth + 2, icons);
            const jsx = [
                `${pad(depth)}<Container as="section" size="md" ${SPACE_CODE}>`,
                `${pad(depth + 1)}<Stack gap="lg">`,
                title && `${pad(depth + 2)}<Heading level={2}>${title}</Heading>`,
                table,
                `${pad(depth + 1)}</Stack>`,
                `${pad(depth)}</Container>`,
            ].filter(Boolean).join("\n");
            return {jsx, imports: ["Container", "Stack", "Table", ...(title ? ["Heading"] : [])], icons: []};
        },
    },
];

export const TYPE_BY_NAME = new Map(SECTION_TYPES.map(type => [type.type, type]));
export const KNOWN_TYPES: ReadonlySet<string> = new Set(TYPE_BY_NAME.keys());

// ---------- A whole page ----------

/** Shows the sections one under the other, like on the real page. */
export function PageRenderer({sections}: {sections: SectionData[]}) {
    return (
        <>
            {sections.map(section => {
                const type = TYPE_BY_NAME.get(section.type);
                return type ? <Fragment key={section.id}>{type.render(cleanProps(section.props))}</Fragment> : null;
            })}
        </>
    );
}

function importLines(parts: SectionCode[]) {
    const kit = [...new Set(parts.flatMap(part => part.imports))].sort();
    const icons = [...new Set(parts.flatMap(part => part.icons))].sort();
    return [`import { ${kit.join(", ")} } from "bettergovregiondavaoui";`, icons.length > 0 && `import { ${icons.join(", ")} } from "lucide-react";`].filter(Boolean).join("\n");
}

/** The code for one section, ready to paste. */
export function sectionCode(section: Pick<SectionData, "type" | "props">) {
    const type = TYPE_BY_NAME.get(section.type);
    if (!type) return "";
    const part = type.code(cleanProps(section.props), 0);
    return `${importLines([part])}\n\n${part.jsx}`;
}

/** The code for a whole page: a component with every section in order. */
export function pageCode(name: string, sections: SectionData[]) {
    const parts = sections.flatMap(section => {
        const type = TYPE_BY_NAME.get(section.type);
        return type ? [type.code(cleanProps(section.props), 3)] : [];
    });
    if (parts.length === 0) return "// Add a section to see the page's code";
    const component = name.replace(/[^A-Za-z0-9]+(.)?/g, (_, next: string | undefined) => (next ?? "").toUpperCase()).replace(/^[^A-Za-z]+/, "");
    const title = component ? component[0].toUpperCase() + component.slice(1) : "Page";
    return `${importLines(parts)}

export default function ${title.endsWith("Page") ? title : `${title}Page`}() {
    return (
        <>
${parts.map(part => part.jsx).join("\n")}
        </>
    );
}`;
}
