import {Award, CreditCard, FileText, HandCoins, House, Stamp} from "lucide-react";
import {
    ContactBlock,
    CtaBlock,
    FaqBlock,
    FeaturesBlock,
    FooterBlock,
    HeaderBlock,
    HeroBlock,
    LandingPage,
    NewsBlock,
    StatsBlock,
} from "../../src";
import {compact, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

// ---------- Demo content shared by the block pages ----------

const LINKS = [
    {label: "Services", href: "#services", active: true},
    {label: "Payments", href: "#payments"},
    {label: "News", href: "#news"},
    {label: "Help", href: "#help"},
];

// A drawn city hall instead of a photo, so the demo needs no image file
const CITY_HALL = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d6efd"/><stop offset="1" stop-color="#0b7d90"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#sky)"/><circle cx="320" cy="70" r="28" fill="#ffd43b" opacity=".9"/>
<rect y="240" width="400" height="60" fill="#278039"/>
<polygon points="200,70 90,130 310,130" fill="#f8f9fa"/><rect x="100" y="130" width="200" height="110" fill="#e9ecef"/>
<g fill="#adb5bd"><rect x="118" y="145" width="14" height="80"/><rect x="152" y="145" width="14" height="80"/><rect x="234" y="145" width="14" height="80"/><rect x="268" y="145" width="14" height="80"/></g>
<rect x="184" y="180" width="32" height="60" fill="#495057"/><rect x="198" y="30" width="3" height="42" fill="#495057"/><rect x="201" y="30" width="26" height="16" fill="#e03131"/>
</svg>`)}`;

const SERVICES = [
    {icon: <Stamp />, title: "Business permit", description: "Apply for or renew your Mayor's permit without lining up.", href: "#business-permit"},
    {icon: <House />, title: "Real property tax", description: "See what you owe on your land and buildings, and pay online.", href: "#property-tax"},
    {icon: <FileText />, title: "Barangay clearance", description: "Request a clearance and pick it up at your barangay hall.", href: "#clearance"},
    {icon: <Award />, title: "Civil registry", description: "Get copies of birth, marriage and death certificates.", href: "#civil-registry"},
    {icon: <CreditCard />, title: "Online payments", description: "Pay fees with GCash, Maya or a debit card.", href: "#payments"},
    {icon: <HandCoins />, title: "Assistance programs", description: "Check if you qualify for financial and medical assistance.", href: "#assistance"},
];

const FAQS = [
    {question: "Do I need an account to apply?", answer: "Yes. An account lets you track your applications and get updates by email or text."},
    {question: "How long does a business permit take?", answer: "Usually 3 to 5 working days once your documents are complete."},
    {question: "Which payment methods can I use?", answer: "GCash, Maya, debit cards, or cash at the City Treasurer's Office."},
    {question: "Is my information safe?", answer: "Your data is handled under the Data Privacy Act of 2012 and only used to process your requests."},
];

const FOOTER_COLUMNS = [
    {title: "Services", links: [{label: "Business permit", href: "#bp"}, {label: "Property tax", href: "#rpt"}, {label: "Civil registry", href: "#cr"}]},
    {title: "About", links: [{label: "The project", href: "#about"}, {label: "Offices", href: "#offices"}, {label: "News", href: "#news"}]},
    {title: "Help", links: [{label: "FAQs", href: "#faq"}, {label: "Contact us", href: "#contact"}, {label: "Report a problem", href: "#report"}]},
];

const BOTTOM_LINKS = [{label: "Privacy", href: "#privacy"}, {label: "Accessibility", href: "#accessibility"}];

const demoHeader = (action: string, sticky = false) => (
    <HeaderBlock logo="BetterGov Davao" links={LINKS} action={action || undefined} sticky={sticky} />
);

const demoFooter = (columns = true) => (
    <FooterBlock
        logo="BetterGov Davao"
        description="Government services for the Davao Region, online and in one place."
        columns={columns ? FOOTER_COLUMNS : []}
        copyright="© 2026 BetterGov Region Davao"
        bottomLinks={BOTTOM_LINKS}
    />
);

// `name="value"` when there's a value, nothing when it's empty
const textProp = (name: string, value: string) => value !== "" && (value.includes('"') ? `${name}={${JSON.stringify(value)}}` : `${name}="${value}"`);

// ---------- Hero ----------

const heroControls = {
    eyebrow: {type: "text", default: "Davao Region e-Services"},
    title: {type: "text", default: "Government services, without the long lines"},
    description: {type: "text", default: "Apply for permits, pay your taxes and request documents online, any time of day."},
    primaryAction: {type: "text", default: "Apply for a permit"},
    secondaryAction: {type: "text", default: "See requirements"},
    image: {type: "boolean", default: true},
    align: {type: "select", options: ["auto", "left", "center"] as const, default: "auto"},
    // Not props of the hero itself: what goes in its header and footer slots
    header: {type: "boolean", default: true},
    headerAction: {type: "text", default: "Sign in"},
    footer: {type: "boolean", default: false},
} satisfies Controls;

export const heroBlockEntry = defineEntry({
    name: "HeroBlock",
    category: "Blocks",
    description: "The big opening section: title, description, two buttons and an optional picture. header and footer take any element, e.g. HeaderBlock and FooterBlock.",
    layout: "page",
    controls: heroControls,
    render: values => (
        <HeroBlock
            header={values.header ? demoHeader(values.headerAction) : undefined}
            footer={values.footer ? demoFooter() : undefined}
            eyebrow={values.eyebrow || undefined}
            title={values.title}
            description={values.description || undefined}
            primaryAction={values.primaryAction ? {label: values.primaryAction, href: "#apply"} : undefined}
            secondaryAction={values.secondaryAction ? {label: values.secondaryAction, href: "#requirements"} : undefined}
            image={values.image ? CITY_HALL : undefined}
            imageAlt="Illustration of a city hall"
            align={values.align === "auto" ? undefined : values.align}
        />
    ),
    code: values => {
        const props = compact([
            values.header &&
                `header={<HeaderBlock logo="BetterGov Davao" links={links}${values.headerAction ? ` action="${values.headerAction}"` : ""} />}`,
            values.footer && `footer={<FooterBlock logo="BetterGov Davao" columns={footerColumns} />}`,
            textProp("eyebrow", values.eyebrow),
            textProp("title", values.title),
            textProp("description", values.description),
            values.primaryAction && `primaryAction={{ label: "${values.primaryAction}", href: "/apply" }}`,
            values.secondaryAction && `secondaryAction={{ label: "${values.secondaryAction}", href: "/requirements" }}`,
            values.image && `image="/city-hall.jpg"`,
            values.image && `imageAlt="Davao City Hall"`,
            values.align !== "auto" && `align="${values.align}"`,
        ]);
        const imports = compact(["HeroBlock", values.header && "HeaderBlock", values.footer && "FooterBlock"]);
        return `import { ${imports.join(", ")} } from "bettergovregiondavaoui";

${openTag("HeroBlock", props, "", true)}`;
    },
});

// ---------- Header ----------

const headerControls = {
    logo: {type: "text", default: "BetterGov Davao"},
    action: {type: "text", default: "Sign in"},
    links: {type: "boolean", default: true},
    sticky: {type: "boolean", default: false},
} satisfies Controls;

export const headerBlockEntry = defineEntry({
    name: "HeaderBlock",
    category: "Blocks",
    description: "A site header: logo, links and a button. Try the Phone view: the links move into a ☰ menu.",
    layout: "page",
    controls: headerControls,
    render: values => (
        <HeaderBlock logo={values.logo || undefined} links={values.links ? LINKS : []} action={values.action || undefined} sticky={values.sticky} />
    ),
    code: values => {
        const props = compact([
            textProp("logo", values.logo),
            values.links && "links={links}",
            values.action && `action={{ label: "${values.action}", href: "/sign-in" }}`,
            values.sticky && "sticky",
        ]);
        return `import { HeaderBlock } from "bettergovregiondavaoui";

const links = [
    { label: "Services", href: "/services", active: true },
    { label: "Payments", href: "/payments" },
    { label: "Help", href: "/help" },
];

${openTag("HeaderBlock", props, "", true)}`;
    },
});

// ---------- Features ----------

const featuresControls = {
    eyebrow: {type: "text", default: "Online services"},
    title: {type: "text", default: "What would you like to do today?"},
    description: {type: "text", default: "Start any of these from home. You'll only visit an office when you pick up your documents."},
    columns: {type: "number", min: 1, max: 4, default: 3},
    // Not a prop: whether the demo cards have an href (clickable cards)
    clickable: {type: "boolean", default: true},
} satisfies Controls;

export const featuresBlockEntry = defineEntry({
    name: "FeaturesBlock",
    category: "Blocks",
    description: "A titled grid of cards, e.g. services. Cards with an href are clickable anywhere and lift on hover.",
    layout: "page",
    controls: featuresControls,
    render: values => (
        <FeaturesBlock
            eyebrow={values.eyebrow || undefined}
            title={values.title}
            description={values.description || undefined}
            columns={values.columns}
            features={values.clickable ? SERVICES : SERVICES.map(({href: _href, ...service}) => service)}
        />
    ),
    code: values => {
        const props = compact([
            textProp("eyebrow", values.eyebrow),
            textProp("title", values.title),
            textProp("description", values.description),
            values.columns !== 3 && `columns={${values.columns}}`,
            "features={services}",
        ]);
        return `import { FeaturesBlock } from "bettergovregiondavaoui";
import { House, Stamp } from "lucide-react";

const services = [
    { icon: <Stamp />, title: "Business permit", description: "Apply or renew online."${values.clickable ? `, href: "/business-permit"` : ""} },
    { icon: <House />, title: "Real property tax", description: "See what you owe and pay."${values.clickable ? `, href: "/property-tax"` : ""} },
];

${openTag("FeaturesBlock", props, "", true)}`;
    },
});

// ---------- FAQ ----------

const faqControls = {
    eyebrow: {type: "text", default: "Help"},
    // Empty: the block's own title, in the preview's language
    title: {type: "text", default: ""},
    description: {type: "text", default: "Can't find your answer? Our help desk replies within one working day."},
    action: {type: "text", default: "Contact the help desk"},
    multiple: {type: "boolean", default: false},
} satisfies Controls;

export const faqBlockEntry = defineEntry({
    name: "FaqBlock",
    category: "Blocks",
    description: "Questions and answers (an Accordion) with the title beside them on wide screens and above them on phones.",
    layout: "page",
    controls: faqControls,
    render: values => (
        <FaqBlock
            eyebrow={values.eyebrow || undefined}
            title={values.title || undefined}
            description={values.description || undefined}
            action={values.action ? {label: values.action, href: "#help"} : undefined}
            multiple={values.multiple}
            items={FAQS}
        />
    ),
    code: values => {
        const props = compact([
            textProp("eyebrow", values.eyebrow),
            values.title !== "Frequently asked questions" && textProp("title", values.title),
            textProp("description", values.description),
            values.action && `action={{ label: "${values.action}", href: "/help" }}`,
            values.multiple && "multiple",
            "items={faqs}",
        ]);
        return `import { FaqBlock } from "bettergovregiondavaoui";

const faqs = [
    { question: "Do I need an account to apply?", answer: "Yes. An account lets you track your applications." },
    { question: "Which payment methods can I use?", answer: "GCash, Maya, debit cards, or cash." },
];

${openTag("FaqBlock", props, "", true)}`;
    },
});

// ---------- CTA ----------

const ctaControls = {
    title: {type: "text", default: "Ready to start your application?"},
    description: {type: "text", default: "It takes about 10 minutes. Have a valid ID ready."},
    primaryAction: {type: "text", default: "Start now"},
    secondaryAction: {type: "text", default: "Check requirements"},
} satisfies Controls;

export const ctaBlockEntry = defineEntry({
    name: "CtaBlock",
    category: "Blocks",
    description: "A tinted banner that invites people to take the next step, usually near the end of a page.",
    layout: "page",
    controls: ctaControls,
    render: values => (
        <CtaBlock
            title={values.title}
            description={values.description || undefined}
            primaryAction={values.primaryAction ? {label: values.primaryAction, href: "#apply"} : undefined}
            secondaryAction={values.secondaryAction ? {label: values.secondaryAction, href: "#requirements"} : undefined}
        />
    ),
    code: values => {
        const props = compact([
            textProp("title", values.title),
            textProp("description", values.description),
            values.primaryAction && `primaryAction={{ label: "${values.primaryAction}", href: "/apply" }}`,
            values.secondaryAction && `secondaryAction={{ label: "${values.secondaryAction}", href: "/requirements" }}`,
        ]);
        return `import { CtaBlock } from "bettergovregiondavaoui";

${openTag("CtaBlock", props, "", true)}`;
    },
});

// ---------- Footer ----------

const footerControls = {
    columns: {type: "boolean", default: true},
} satisfies Controls;

export const footerBlockEntry = defineEntry({
    name: "FooterBlock",
    category: "Blocks",
    description: "The bottom of a site: logo and description, columns of links, and the copyright line with Privacy and Accessibility links.",
    layout: "page",
    controls: footerControls,
    render: values => demoFooter(values.columns),
    code: values => `import { FooterBlock } from "bettergovregiondavaoui";

<FooterBlock
    logo="BetterGov Davao"
    description="Government services for the Davao Region, online and in one place."${values.columns ? `
    columns={[
        { title: "Services", links: [{ label: "Business permit", href: "/business-permit" }] },
        { title: "Help", links: [{ label: "Contact us", href: "/contact" }] },
    ]}` : ""}
    copyright="© 2026 BetterGov Region Davao"
    bottomLinks={[{ label: "Privacy", href: "/privacy" }, { label: "Accessibility", href: "/accessibility" }]}
/>`,
});

// ---------- Stats ----------

const STATS = [
    {value: "12,480", label: "Permits issued this year", description: "Up 18% from last year"},
    {value: "3 days", label: "Average processing time", description: "Down from 2 weeks"},
    {value: "86%", label: "Applications filed online"},
    {value: "4.7 / 5", label: "Citizen satisfaction", description: "From 2,300 surveys"},
];

const statsControls = {
    title: {type: "text", default: "Faster service, in numbers"},
    description: {type: "text", default: ""},
    // Not a prop: how many of the demo numbers to show
    count: {type: "number", min: 2, max: 4, default: 4},
} satisfies Controls;

export const statsBlockEntry = defineEntry({
    name: "StatsBlock",
    category: "Blocks",
    description: "A row of big numbers that show results. Screen readers read each as \"label: number\". Leave out the title for a plain band of numbers.",
    layout: "page",
    controls: statsControls,
    render: values => (
        <StatsBlock title={values.title || undefined} description={values.description || undefined} stats={STATS.slice(0, values.count)} />
    ),
    code: values => {
        const props = compact([textProp("title", values.title), textProp("description", values.description), "stats={stats}"]);
        return `import { StatsBlock } from "bettergovregiondavaoui";

const stats = [
    { value: "12,480", label: "Permits issued this year", description: "Up 18% from last year" },
    { value: "3 days", label: "Average processing time" },
];

${openTag("StatsBlock", props, "", true)}`;
    },
});

// ---------- News ----------

// Colored placeholder pictures, so the demo needs no image files
const banner = (from: string, to: string) =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="16" height="9" fill="url(#g)"/></svg>`)}`;

const NEWS = [
    {
        title: "Business permit renewals now fully online",
        href: "#renewals",
        date: "2026-10-01",
        category: "Announcement",
        excerpt: "Renew your Mayor’s permit from home this January. Upload your documents and pay online; no need to visit City Hall.",
        image: banner("#0d6efd", "#7048e8"),
    },
    {
        title: "Road closures for the Kadayawan street parade",
        href: "#kadayawan",
        date: "2026-09-24",
        category: "Advisory",
        excerpt: "Parts of San Pedro Street and C.M. Recto Avenue will be closed from 6 AM to 6 PM. See the alternate routes.",
        image: banner("#ff9800", "#e03131"),
    },
    {
        title: "Free medical mission in Toril this Saturday",
        href: "#medical-mission",
        date: "2026-09-18",
        category: "Event",
        excerpt: "Check-ups, medicines and vaccines at the Toril District Hall. Bring a valid ID and your barangay certificate.",
        image: banner("#278039", "#0b7d90"),
    },
];

const newsControls = {
    // Empty: the block's own title, in the preview's language
    title: {type: "text", default: ""},
    action: {type: "text", default: "All news"},
    images: {type: "boolean", default: true},
    columns: {type: "number", min: 1, max: 3, default: 3},
} satisfies Controls;

export const newsBlockEntry = defineEntry({
    name: "NewsBlock",
    category: "Blocks",
    description: "The latest posts as cards: picture, category, date, title and a short excerpt. Each whole card is a link.",
    layout: "page",
    controls: newsControls,
    render: values => (
        <NewsBlock
            title={values.title || undefined}
            action={values.action ? {label: values.action, href: "#news"} : undefined}
            columns={values.columns}
            items={values.images ? NEWS : NEWS.map(({image: _image, ...post}) => post)}
        />
    ),
    code: values => {
        const props = compact([
            values.title !== "Latest news" && textProp("title", values.title),
            values.action && `action={{ label: "${values.action}", href: "/news" }}`,
            values.columns !== 3 && `columns={${values.columns}}`,
            "items={posts}",
        ]);
        const image = values.images ? `\n        image: "/news/renewals.jpg",` : "";
        return `import { NewsBlock } from "bettergovregiondavaoui";

const posts = [
    {
        title: "Business permit renewals now fully online",
        href: "/news/permit-renewals",
        date: "2026-10-01",
        category: "Announcement",
        excerpt: "Renew your permit from home this January.",${image}
    },
];

${openTag("NewsBlock", props, "", true)}`;
    },
});

// ---------- Contact ----------

// A drawn map instead of a real one, so the demo doesn't load anything from the internet
const MAP = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
<rect width="400" height="300" fill="#e9f2e6"/><path d="M0 210 Q120 170 200 200 T400 180 V300 H0Z" fill="#a5d8ff"/>
<g stroke="#fff" stroke-width="10" fill="none"><path d="M0 120 H400"/><path d="M150 0 V300"/><path d="M290 0 L250 300"/></g>
<g stroke="#ced4da" stroke-width="4" fill="none"><path d="M0 60 H400"/><path d="M60 0 V300"/><path d="M220 0 V200"/></g>
<path d="M200 70c-17 0-30 13-30 30 0 22 30 50 30 50s30-28 30-50c0-17-13-30-30-30z" fill="#e03131"/><circle cx="200" cy="100" r="11" fill="#fff"/>
</svg>`)}`;

const contactControls = {
    title: {type: "text", default: "Visit or call us"},
    description: {type: "text", default: "Our help desk can answer questions about any service."},
    map: {type: "boolean", default: true},
    hours: {type: "boolean", default: true},
    action: {type: "text", default: "Get directions"},
} satisfies Controls;

export const contactBlockEntry = defineEntry({
    name: "ContactBlock",
    category: "Blocks",
    description: "Address, phone, email and office hours, with a map beside them. The phone and email are links that call or open the mail app.",
    layout: "page",
    controls: contactControls,
    render: values => (
        <ContactBlock
            title={values.title || undefined}
            description={values.description || undefined}
            address={<>City Hall, San Pedro Street<br />Davao City 8000</>}
            phone="(082) 241 1000"
            email="help@bettergov-davao.ph"
            hours={values.hours ? [{days: "Monday – Friday", time: "8:00 AM – 5:00 PM"}, {days: "Saturday – Sunday", time: "Closed"}] : undefined}
            action={values.action ? {label: values.action, href: "#directions"} : undefined}
            map={values.map ? <img src={MAP} alt="Map showing City Hall on San Pedro Street" /> : undefined}
        />
    ),
    code: values => {
        const props = compact([
            textProp("title", values.title),
            textProp("description", values.description),
            "address={<>City Hall, San Pedro Street<br />Davao City 8000</>}",
            `phone="(082) 241 1000"`,
            `email="help@bettergov-davao.ph"`,
            values.hours && `hours={[{ days: "Monday – Friday", time: "8:00 AM – 5:00 PM" }]}`,
            values.action && `action={{ label: "${values.action}", href: "https://maps.google.com/?q=Davao+City+Hall" }}`,
            values.map && `map="https://www.google.com/maps/embed?pb=…"`,
        ]);
        return `import { ContactBlock } from "bettergovregiondavaoui";

// map: in Google Maps, choose Share → Embed a map, and copy the link from the code it gives
${openTag("ContactBlock", props, "", true)}`;
    },
});

// ---------- Landing page: all the blocks together ----------

const landingControls = {
    // Not props: which sections the demo page has
    stats: {type: "boolean", default: true},
    features: {type: "boolean", default: true},
    news: {type: "boolean", default: true},
    faq: {type: "boolean", default: true},
    contact: {type: "boolean", default: true},
    cta: {type: "boolean", default: true},
    stickyHeader: {type: "boolean", default: true},
} satisfies Controls;

export const landingPageEntry = defineEntry({
    name: "LandingPage",
    category: "Blocks",
    description: "A whole page from the blocks, with a skip link and the <main> landmark added for you. Turn sections off, try Phone, and press Tab once to see the skip link.",
    layout: "page",
    controls: landingControls,
    render: values => (
        <LandingPage
            header={{logo: "BetterGov Davao", links: LINKS, action: {label: "Sign in", href: "#sign-in"}, sticky: values.stickyHeader}}
            hero={{
                eyebrow: "Davao Region e-Services",
                title: "Government services, without the long lines",
                description: "Apply for permits, pay your taxes and request documents online, any time of day.",
                primaryAction: {label: "Apply for a permit", href: "#apply"},
                secondaryAction: {label: "See requirements", href: "#requirements"},
                image: CITY_HALL,
                imageAlt: "Illustration of a city hall",
            }}
            stats={values.stats && {stats: STATS}}
            features={values.features && {eyebrow: "Online services", title: "What would you like to do today?", features: SERVICES}}
            news={values.news && {items: NEWS, action: {label: "All news", href: "#news"}}}
            faq={values.faq && {eyebrow: "Help", items: FAQS, action: {label: "Contact the help desk", href: "#help"}}}
            contact={
                values.contact && {
                    title: "Visit or call us",
                    address: <>City Hall, San Pedro Street<br />Davao City 8000</>,
                    phone: "(082) 241 1000",
                    email: "help@bettergov-davao.ph",
                    hours: [{days: "Monday – Friday", time: "8:00 AM – 5:00 PM"}],
                    map: <img src={MAP} alt="Map showing City Hall on San Pedro Street" />,
                }
            }
            cta={values.cta && {title: "Ready to start your application?", description: "It takes about 10 minutes. Have a valid ID ready.", primaryAction: {label: "Start now", href: "#apply"}}}
            footer={{
                logo: "BetterGov Davao",
                description: "Government services for the Davao Region, online and in one place.",
                columns: FOOTER_COLUMNS,
                copyright: "© 2026 BetterGov Region Davao",
                bottomLinks: BOTTOM_LINKS,
            }}
        />
    ),
    code: values => {
        const sections = compact([
            `    header={{ logo: "BetterGov Davao", links, action: "Sign in"${values.stickyHeader ? ", sticky: true" : ""} }}`,
            `    hero={{
        title: "Government services, without the long lines",
        primaryAction: { label: "Apply for a permit", href: "/apply" },
        image: "/city-hall.jpg",
        imageAlt: "Davao City Hall",
    }}`,
            values.stats && `    stats={{ stats }}`,
            values.features && `    features={{ title: "What would you like to do today?", features: services }}`,
            values.news && `    news={{ items: posts, action: { label: "All news", href: "/news" } }}`,
            values.faq && `    faq={{ items: faqs }}`,
            values.contact && `    contact={{ address: "City Hall, Davao City", phone: "(082) 241 1000", email: "help@bettergov-davao.ph" }}`,
            values.cta && `    cta={{ title: "Ready to start your application?", primaryAction: { label: "Start now", href: "/apply" } }}`,
            `    footer={{ logo: "BetterGov Davao", columns: footerColumns, copyright: "© 2026 BetterGov Region Davao" }}`,
        ]);
        return `import { LandingPage } from "bettergovregiondavaoui";

// Each section takes that block's props (see its page under Blocks),
// your own element instead (hero={<MyHero />}), or leave it out to skip it.
<LandingPage
${sections.join("\n")}
/>`;
    },
});
