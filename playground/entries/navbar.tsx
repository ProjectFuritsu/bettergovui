import {CreditCard, FileText, House, Settings} from "lucide-react";
import {useState} from "react";
import {Navbar, NavLink} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls, type ValuesOf} from "../workbench/types";

const LINKS = [
    {label: "Home", icon: House, iconName: "House", badge: undefined},
    {label: "Permits", icon: FileText, iconName: "FileText", badge: 3},
    {label: "Payments", icon: CreditCard, iconName: "CreditCard", badge: undefined},
    {label: "Settings", icon: Settings, iconName: "Settings", badge: undefined},
];

const controls = {
    orientation: {type: "select", options: ["horizontal", "vertical"] as const, default: "horizontal"},
    gap: {type: "size", default: "", optional: true},
    // Not props: what the demo links have
    icons: {type: "boolean", default: true},
    badge: {type: "boolean", default: true},
} satisfies Controls;

// A component so it can remember which link was clicked
function NavbarDemo({icons, badge, gap, ...props}: ValuesOf<typeof controls>) {
    const [current, setCurrent] = useState("Home");
    return (
        <Navbar gap={gap === "" ? undefined : gap} style={{width: props.orientation === "vertical" ? 240 : undefined}} {...props}>
            {LINKS.map(({label, icon: Icon, ...link}) => (
                <NavLink
                    key={label}
                    href="#"
                    active={label === current}
                    icon={icons ? <Icon /> : undefined}
                    badge={badge ? link.badge : undefined}
                    onClick={event => {
                        event.preventDefault(); // stay on the demo page
                        setCurrent(label);
                    }}>
                    {label}
                </NavLink>
            ))}
        </Navbar>
    );
}

export const navbarEntry = defineEntry({
    name: "Navbar",
    category: "Navigation",
    description: "A row (or column) of NavLinks in a <nav>. active marks the current page; links can have an icon and a badge, e.g. a count.",
    layout: "centered",
    controls,
    render: values => <NavbarDemo {...values} />,
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["gap", "icons", "badge"]),
            values.gap !== "" && (typeof values.gap === "number" ? `gap={${values.gap}}` : `gap="${values.gap}"`),
        ]);
        const links = LINKS.map(link => {
            const linkProps = compact([
                `href="/${link.label.toLowerCase()}"`,
                link.label === "Home" && "active",
                values.icons && `icon={<${link.iconName} />}`,
                values.badge && link.badge !== undefined && `badge={${link.badge}}`,
            ]);
            return `${openTag("NavLink", linkProps, "    ")}${link.label}</NavLink>`;
        });
        return compact([
            `import { Navbar, NavLink } from "bettergovregiondavaoui";`,
            values.icons && `import { ${LINKS.map(link => link.iconName).join(", ")} } from "lucide-react";`,
        ]).join("\n") + `

${openTag("Navbar", props)}
${links.join("\n")}
</Navbar>`;
    },
});
