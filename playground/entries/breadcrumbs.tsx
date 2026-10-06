import {House} from "lucide-react";
import {Breadcrumbs} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const TRAIL = [
    {label: "Home", href: "/"},
    {label: "Services", href: "/services"},
    {label: "Business permits", href: "/services/permits"},
    {label: "Renewal", href: "/services/permits/renewal"},
    {label: "Requirements", href: "/services/permits/renewal/requirements"},
];

const SEPARATORS = {chevron: undefined, slash: "/", dot: "·", arrow: "→"} as const;

const controls = {
    items: {type: "number", min: 2, max: 5, default: 4},
    separator: {type: "select", options: ["chevron", "slash", "dot", "arrow"] as const, default: "chevron"},
    homeIcon: {type: "boolean", default: false},
    size: {type: "size", default: "md"},
    color: {type: "themeColor", default: "default", none: "default"},
} satisfies Controls;

export const breadcrumbsEntry = defineEntry({
    name: "Breadcrumbs",
    category: "Navigation",
    description: "Shows where the page sits. Pass your own links (or router Links); the last item is the current page.",
    layout: "fill",
    controls,
    render: ({items, separator, homeIcon, color, ...props}) => {
        const trail = TRAIL.slice(0, items);
        return (
            <Breadcrumbs separator={SEPARATORS[separator]} color={color === "default" ? undefined : color} {...props}>
                {trail.map((item, index) => {
                    const content = <>{index === 0 && homeIcon && <House />}{item.label}</>;
                    // The demo links don't go anywhere, so the preview stays put
                    return index < trail.length - 1
                        ? <a key={item.href} href={item.href} onClick={event => event.preventDefault()}>{content}</a>
                        : <span key={item.href}>{content}</span>;
                })}
            </Breadcrumbs>
        );
    },
    code: values => {
        const trail = TRAIL.slice(0, values.items);
        const props = compact([
            ...jsxProps(controls, values, ["items", "separator", "homeIcon"]),
            values.separator !== "chevron" && `separator="${SEPARATORS[values.separator]}"`,
        ]);
        const lines = trail.map((item, index) => {
            const icon = index === 0 && values.homeIcon ? "<House /> " : "";
            return index < trail.length - 1
                ? `    <a href="${item.href}">${icon}${item.label}</a>`
                : `    <span>${icon}${item.label}</span>`;
        });
        const imports = compact([
            `import { Breadcrumbs } from "bettergovregiondavaoui";`,
            values.homeIcon && `import { House } from "lucide-react";`,
        ]);
        return `${imports.join("\n")}

${openTag("Breadcrumbs", props)}
${lines.join("\n")}
</Breadcrumbs>`;
    },
});
