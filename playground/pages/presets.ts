import type {JsonObject} from "./schema";

// Ready-made versions of each page section, and whole pages made of them. All of it is plain data
// (see schema.ts), so every version can be previewed, copied as code, or dropped into the page builder.

export interface Version {
    name: string;
    /** When to pick this one */
    note: string;
    type: string;
    props: JsonObject;
}

export interface SectionGroup {
    /** Its name in the sidebar, e.g. "Heroes" */
    name: string;
    description: string;
    versions: Version[];
}

// ---------- Content shared by the versions ----------

const LINKS: JsonObject[] = [
    {label: "Services", href: "#services", active: true},
    {label: "Payments", href: "#payments"},
    {label: "News", href: "#news"},
    {label: "Help", href: "#help"},
];

const SERVICES: JsonObject[] = [
    {icon: "Stamp", title: "Business permit", description: "Apply for or renew your Mayor's permit without lining up.", href: "#business-permit"},
    {icon: "House", title: "Real property tax", description: "See what you owe on your land and buildings, and pay online.", href: "#property-tax"},
    {icon: "FileText", title: "Barangay clearance", description: "Request a clearance and pick it up at your barangay hall.", href: "#clearance"},
    {icon: "Award", title: "Civil registry", description: "Get copies of birth, marriage and death certificates.", href: "#civil-registry"},
    {icon: "CreditCard", title: "Online payments", description: "Pay fees with GCash, Maya or a debit card.", href: "#payments"},
    {icon: "HandCoins", title: "Assistance programs", description: "Check if you qualify for financial and medical assistance.", href: "#assistance"},
];

const STATS: JsonObject[] = [
    {value: "12,480", label: "Permits issued this year", description: "Up 18% from last year"},
    {value: "3 days", label: "Average processing time", description: "Down from 2 weeks"},
    {value: "86%", label: "Applications filed online"},
    {value: "4.7 / 5", label: "Citizen satisfaction", description: "From 2,300 surveys"},
];

const NEWS: JsonObject[] = [
    {title: "Business permit renewals now fully online", href: "#renewals", date: "2026-10-01", category: "Announcement", excerpt: "Renew your Mayor’s permit from home this January. Upload your documents and pay online; no need to visit City Hall.", image: "demo:blue"},
    {title: "Road closures for the Kadayawan street parade", href: "#kadayawan", date: "2026-09-24", category: "Advisory", excerpt: "Parts of San Pedro Street and C.M. Recto Avenue will be closed from 6 AM to 6 PM. See the alternate routes.", image: "demo:orange"},
    {title: "Free medical mission in Toril this Saturday", href: "#medical-mission", date: "2026-09-18", category: "Event", excerpt: "Check-ups, medicines and vaccines at the Toril District Hall. Bring a valid ID and your barangay certificate.", image: "demo:green"},
];

const withoutImages = NEWS.map(({image: _image, ...post}) => post);

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

const FOOTER_LINE = "Government services for the Davao Region, online and in one place.";
const COPYRIGHT = "© 2026 BetterGov Region Davao";
const BOTTOM_LINKS = [{label: "Privacy", href: "#privacy"}, {label: "Accessibility", href: "#accessibility"}];
const HOURS = [{days: "Monday – Friday", time: "8:00 AM – 5:00 PM"}, {days: "Saturday – Sunday", time: "Closed"}];
const ADDRESS = "City Hall, San Pedro Street\nDavao City 8000";

// ---------- Versions of each section ----------

const headers: Version[] = [
    {name: "Links and a button", note: "The full header: logo, the main links and Sign in.", type: "header", props: {logo: "BetterGov Davao", links: LINKS, action: {label: "Sign in", href: "#sign-in"}}},
    {name: "Sticky", note: "Stays at the top while the page scrolls. Good for long pages.", type: "header", props: {logo: "BetterGov Davao", links: LINKS, action: {label: "Apply now", href: "#apply"}, sticky: true}},
    {name: "Logo and a button", note: "For a page about one service: nothing to wander off to.", type: "header", props: {logo: "Business Permits · Davao City", action: {label: "Track my application", href: "#track"}}},
    {name: "Pill", note: "A rounded capsule floating in the middle of the page.", type: "header", props: {logo: "BetterGov Davao", links: LINKS.slice(0, 3).map(({active: _active, ...link}) => link), action: {label: "Get started", href: "#apply"}, variant: "pill"}},
    {name: "Links only", note: "For information sites with no accounts.", type: "header", props: {logo: "City Health Office", links: LINKS.map(({active: _active, ...link}) => link)}},
];

const heroes: Version[] = [
    {
        name: "With a picture",
        note: "Text on the left, picture on the right. The picture moves under the text on phones.",
        type: "hero",
        props: {
            eyebrow: "Davao Region e-Services",
            title: "Government services, without the long lines",
            description: "Apply for permits, pay your taxes and request documents online, any time of day.",
            primaryAction: {label: "Apply for a permit", href: "#apply"},
            secondaryAction: {label: "See requirements", href: "#requirements"},
            image: "demo:city-hall",
            imageAlt: "Illustration of a city hall",
        },
    },
    {
        name: "With reviews and cards",
        note: "Faces and a rating above the title, and a quote and pictures under it. Goes well with the Pill header.",
        type: "hero",
        props: {
            proof: {text: "Rated 4.7 out of 5 by 2,300 residents", avatars: [{name: "Ana Reyes"}, {name: "Ben Cruz"}, {name: "Carla Dizon"}, {name: "Dan Uy"}, {name: "Ella Lim"}]},
            title: "Turning long lines into a few taps",
            description: "Permits, taxes and documents from City Hall, on your phone, any time of day.",
            primaryAction: {label: "Start an application", href: "#apply"},
            secondaryAction: {label: "Learn more", href: "#about"},
            align: "center",
            cards: [
                {quote: "“I renewed my business permit from my store, in ten minutes.”", name: "Liza Mendoza", role: "Sari-sari store owner, Toril"},
                {image: "demo:city-hall", imageAlt: "Illustration of a city hall"},
                {image: "demo:green", imageAlt: ""},
            ],
        },
    },
    {
        name: "Centered",
        note: "No picture: the title carries the page. The quickest one to set up.",
        type: "hero",
        props: {
            eyebrow: "Davao Region e-Services",
            title: "Government services, without the long lines",
            description: "Apply for permits, pay your taxes and request documents online, any time of day.",
            primaryAction: {label: "Apply for a permit", href: "#apply"},
            secondaryAction: {label: "See requirements", href: "#requirements"},
            align: "center",
        },
    },
    {
        name: "Left, text only",
        note: "For inner pages, like one office or one program.",
        type: "hero",
        props: {
            eyebrow: "City Health Office",
            title: "Free check-ups in every district",
            description: "Health centers are open on weekdays. Bring a valid ID and your barangay certificate.",
            primaryAction: {label: "Find a health center", href: "#centers"},
            align: "left",
        },
    },
    {
        name: "One button",
        note: "For a page with a single job: one title, one thing to do.",
        type: "hero",
        props: {
            title: "Renew your business permit online",
            description: "It takes about 10 minutes. You can pay with GCash, Maya or a debit card.",
            primaryAction: {label: "Start my renewal", href: "#renew"},
            align: "center",
        },
    },
];

const stats: Version[] = [
    {name: "Four numbers with a title", note: "A full section with its own heading.", type: "stats", props: {eyebrow: "Results", title: "The numbers so far", description: "Updated every month from the city's own records.", stats: STATS}},
    {name: "Three numbers", note: "Fits right under a hero, as proof.", type: "stats", props: {stats: STATS.slice(0, 3)}},
    {name: "Numbers only", note: "The shortest one: no notes under the numbers.", type: "stats", props: {stats: STATS.map(({description: _description, ...stat}) => stat)}},
];

const features: Version[] = [
    {name: "Three columns with icons", note: "Six services, each a link. The usual choice.", type: "features", props: {eyebrow: "Services", title: "What you can do online", description: "Every service has a list of what to bring, so you only go once.", features: SERVICES}},
    {name: "Two columns", note: "Fewer, bigger items. Good for four main services.", type: "features", props: {title: "Most used services", features: SERVICES.slice(0, 4), columns: 2}},
    {name: "Four columns, no icons", note: "Compact: for many short items.", type: "features", props: {title: "Everything in one place", features: SERVICES.slice(0, 4).map(({icon: _icon, ...service}) => service), columns: 4}},
    {name: "Not links", note: "Plain points, e.g. reasons to use the service.", type: "features", props: {eyebrow: "Why online", title: "Easier than going to City Hall", features: [
        {icon: "Calendar", title: "Open all day", description: "Apply at night or on a Sunday. We process it on the next working day."},
        {icon: "ShieldCheck", title: "Safe", description: "Your data is handled under the Data Privacy Act of 2012."},
        {icon: "Phone", title: "Works on any phone", description: "Made to be light, so it loads on slow connections too."},
    ]}},
];

const news: Version[] = [
    {name: "Three cards with pictures", note: "The usual news row, with a link to all news.", type: "news", props: {title: "Latest news", items: NEWS, action: {label: "All news", href: "#news"}}},
    {name: "Without pictures", note: "For advisories: quicker to read and to load.", type: "news", props: {eyebrow: "Advisories", title: "What's happening this week", items: withoutImages}},
    {name: "Two columns", note: "Two bigger posts.", type: "news", props: {title: "From the Mayor's office", items: NEWS.slice(0, 2), columns: 2}},
];

const faqs: Version[] = [
    {name: "Questions with a button", note: "Ends with a way to ask something that isn't listed.", type: "faq", props: {title: "Frequently asked questions", description: "Can't find your answer? Send us a message.", items: FAQS, action: {label: "Ask a question", href: "#contact"}}},
    {name: "Centered", note: "The title centered above the questions, in one column no wider than 768px.", type: "faq", props: {eyebrow: "Help", title: "Frequently asked questions", description: "Can't find your answer? Send us a message.", items: FAQS, action: {label: "Ask a question", href: "#contact"}, align: "center"}},
    {name: "Questions only", note: "The short one, e.g. at the end of a service page.", type: "faq", props: {items: FAQS.slice(0, 3)}},
    {name: "Several open at once", note: "People can keep answers open to compare them.", type: "faq", props: {eyebrow: "Help", title: "Before you apply", items: FAQS, multiple: true}},
];

const contacts: Version[] = [
    {name: "With a map", note: "Details on the left, the map beside them.", type: "contact", props: {title: "Visit or call us", description: "We answer messages within one working day.", address: ADDRESS, phone: "(082) 241 1000", email: "help@bettergov-davao.ph", hours: HOURS, action: {label: "Get directions", href: "#directions"}, map: "demo:map", mapTitle: "Map showing City Hall on San Pedro Street"}},
    {name: "Details only", note: "No map: lighter, and enough for a help desk.", type: "contact", props: {title: "Contact the help desk", address: ADDRESS, phone: "(082) 241 1000", email: "help@bettergov-davao.ph", hours: HOURS}},
    {name: "Phone and email", note: "For an online-only service with no counter to visit.", type: "contact", props: {eyebrow: "Help", title: "Need a hand?", description: "Call or email us on working days.", phone: "(082) 241 1000", email: "help@bettergov-davao.ph"}},
];

const ctas: Version[] = [
    {name: "Two buttons", note: "The main thing to do, and a quieter second choice.", type: "cta", props: {title: "Ready to start your application?", description: "It takes about 10 minutes. Have a valid ID ready.", primaryAction: {label: "Start now", href: "#apply"}, secondaryAction: {label: "Check requirements", href: "#requirements"}}},
    {name: "One button", note: "One clear next step.", type: "cta", props: {title: "Pay your real property tax before March 31", description: "Pay early and get 10% off.", primaryAction: {label: "Pay now", href: "#pay"}}},
    {name: "Title and a button", note: "The shortest one.", type: "cta", props: {title: "Track your application", primaryAction: {label: "Enter your reference number", href: "#track"}}},
];

const footers: Version[] = [
    {name: "With link columns", note: "The full footer for a site with many pages.", type: "footer", props: {logo: "BetterGov Davao", description: "Government services for the Davao Region, online and in one place.", columns: FOOTER_COLUMNS, copyright: "© 2026 BetterGov Region Davao", bottomLinks: BOTTOM_LINKS}},
    {name: "Simple", note: "Name, a line about the site, and the legal links.", type: "footer", props: {logo: "BetterGov Davao", description: "Government services for the Davao Region, online and in one place.", copyright: "© 2026 BetterGov Region Davao", bottomLinks: BOTTOM_LINKS}},
    {name: "One line", note: "Only the copyright and the legal links.", type: "footer", props: {copyright: "© 2026 City Government of Davao", bottomLinks: BOTTOM_LINKS}},
    {name: "Dark", note: "Ends the page on a dark band, in light mode too.", type: "footer", props: {logo: "BetterGov Davao", description: FOOTER_LINE, columns: FOOTER_COLUMNS, copyright: COPYRIGHT, bottomLinks: BOTTOM_LINKS, tone: "dark"}},
    {name: "Big name", note: "The site's name in very large letters along the bottom, as wide as the footer.", type: "footer", props: {logo: "BetterGov Davao", description: FOOTER_LINE, columns: FOOTER_COLUMNS, copyright: COPYRIGHT, bottomLinks: BOTTOM_LINKS, wordmark: "BetterGov"}},
    {name: "With a call to action", note: "One last thing to do, above the links.", type: "footer", props: {heading: "Need help with your application?", action: {label: "Contact the help desk", href: "#contact"}, logo: "BetterGov Davao", description: FOOTER_LINE, columns: FOOTER_COLUMNS, copyright: COPYRIGHT, bottomLinks: BOTTOM_LINKS, tone: "muted"}},
    {name: "Lined grid", note: "The link columns in cells with lines between them.", type: "footer", props: {logo: "BetterGov Davao", description: FOOTER_LINE, columns: FOOTER_COLUMNS, copyright: COPYRIGHT, bottomLinks: BOTTOM_LINKS, layout: "grid"}},
    {name: "Card", note: "A rounded box with space around it, instead of edge to edge.", type: "footer", props: {logo: "BetterGov Davao", description: FOOTER_LINE, columns: FOOTER_COLUMNS, copyright: COPYRIGHT, bottomLinks: BOTTOM_LINKS, card: true, tone: "muted"}},
    {name: "Dark card with a big name", note: "The three ideas together: card, dark and the big name.", type: "footer", props: {heading: "Government services, without the long lines", action: {label: "Apply for a permit", href: "#apply"}, columns: FOOTER_COLUMNS, copyright: COPYRIGHT, bottomLinks: BOTTOM_LINKS, card: true, tone: "dark", wordmark: "BetterGov"}},
    {name: "Centered", note: "Everything in the middle. Good for a short page.", type: "footer", props: {logo: "BetterGov Davao", description: FOOTER_LINE, copyright: COPYRIGHT, bottomLinks: [...FOOTER_COLUMNS[2].links, ...BOTTOM_LINKS], layout: "centered"}},
];

const STEPS = [
    {label: "Fill in the form", description: "About 10 minutes"},
    {label: "Upload your documents", description: "Photos from your phone are fine"},
    {label: "Pay online", description: "GCash, Maya or debit card"},
    {label: "Get your permit", description: "By email, in 3 to 5 working days"},
];

const FEES = {
    columns: {first: "Document", second: "Fee", third: "Ready in"},
    rows: [
        {first: "Barangay clearance", second: "₱100", third: "1 day"},
        {first: "Business permit (new)", second: "₱2,500", third: "3 to 5 days"},
        {first: "Business permit (renewal)", second: "₱1,800", third: "1 to 3 days"},
        {first: "Birth certificate copy", second: "₱155", third: "1 day"},
    ],
};

const PROGRAMS = [
    {title: "Scholarship program", description: "For college students who live in the city and keep a passing grade.", action: {label: "See who qualifies", href: "#scholarship"}},
    {title: "Medical assistance", description: "Help with hospital bills and medicines for residents in need.", action: {label: "How to apply", href: "#medical"}},
    {title: "Livelihood training", description: "Free short courses in cooking, sewing, welding and repair.", action: {label: "See the schedule", href: "#training"}},
];

const components: Version[] = [
    {name: "Announcement", note: "An Alert across the page, e.g. for a holiday or an outage.", type: "alert", props: {color: "info", variant: "light", title: "Offices are closed on October 31", message: "Online services stay open. Payments made that day are posted on the next working day."}},
    {name: "Warning", note: "The same, for something people must act on.", type: "alert", props: {color: "warning", variant: "light", title: "Renew before January 20", message: "Permits renewed after January 20 pay a 25% surcharge."}},
    {name: "Steps", note: "A Stepper that shows how a service works.", type: "steps", props: {title: "How it works", orientation: "horizontal", active: 0, steps: STEPS}},
    {name: "Cards", note: "A Grid of Cards, e.g. programs or offices.", type: "cards", props: {title: "Programs for residents", columns: 3, cards: PROGRAMS}},
    {name: "Table", note: "A Table, e.g. fees. It stacks into cards on phones.", type: "table", props: {title: "Fees", caption: "Fees as of 2026", ...FEES}},
    {name: "Text", note: "A heading, a paragraph and a button.", type: "text", props: {title: "About this service", body: "Online permits are a project of the City Government of Davao with the Business Bureau.\nIt started in 2024 and now covers every barangay.", align: "left", action: {label: "Read the ordinance", href: "#ordinance"}}},
];

export const SECTION_GROUPS: SectionGroup[] = [
    {name: "Headers", description: "The top of the page: logo, links and a button. On phones the links move into a ☰ menu.", versions: headers},
    {name: "Heroes", description: "The big opening section: what the site is for, and the first thing to do.", versions: heroes},
    {name: "Stats", description: "A few big numbers.", versions: stats},
    {name: "Features", description: "A grid of services or points, with icons.", versions: features},
    {name: "News", description: "The latest posts and advisories.", versions: news},
    {name: "FAQ", description: "Questions that open to show their answers.", versions: faqs},
    {name: "Contact", description: "How to reach an office: address, phone, email, hours and a map.", versions: contacts},
    {name: "Call to action", description: "A box that asks for one thing, usually near the end of the page.", versions: ctas},
    {name: "Footers", description: "The bottom of the page.", versions: footers},
    {name: "Content", description: "Sections made of the kit's components, for what the blocks don't cover.", versions: components},
];

// ---------- Whole pages ----------

export interface Template {
    name: string;
    description: string;
    sections: Array<Pick<Version, "type" | "props">>;
}

const pick = (versions: Version[], index = 0) => ({type: versions[index].type, props: versions[index].props});

export const TEMPLATES: Template[] = [
    {
        name: "City portal",
        description: "The front page of a city or province: every service, the news, and how to reach City Hall.",
        sections: [pick(headers), pick(heroes), pick(stats, 1), pick(features), pick(news), pick(faqs), pick(contacts), pick(ctas), pick(footers)],
    },
    {
        name: "One service",
        description: "A page for a single service, e.g. business permits: what it is, the steps, the fees and the questions people ask.",
        sections: [pick(headers, 2), pick(heroes, 4), pick(components, 2), pick(components, 4), pick(faqs, 2), pick(ctas, 1), pick(footers, 1)],
    },
    {
        name: "Office page",
        description: "A page for one office or program: an announcement, what it offers, and where to find it.",
        sections: [pick(headers, 4), pick(components, 0), pick(heroes, 3), pick(components, 3), pick(features, 3), pick(contacts), pick(footers, 2)],
    },
];
