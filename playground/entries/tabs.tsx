import {Bell, CreditCard, Lock, User} from "lucide-react";
import {Button, Tab, TabList, TabPanel, Tabs} from "../../src";
import {jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";
import {LayoutGuides} from "../workbench/LayoutGuides";

// The demo tabs, with the lucide icon each one uses
const TABS = [
    {value: "account", label: "Account", icon: User, iconName: "User"},
    {value: "password", label: "Password", icon: Lock, iconName: "Lock"},
    {value: "billing", label: "Billing", icon: CreditCard, iconName: "CreditCard", disabled: true},
    {value: "notifications", label: "Notifications", icon: Bell, iconName: "Bell"},
];

const controls = {
    variant: {type: "select", options: ["underline", "outline", "pills", "segmented"] as const, default: "underline"},
    size: {type: "size", default: "md"},
    color: {type: "themeColor", default: "primary"},
    radius: {type: "number", min: 0, max: 24, default: 8},
    orientation: {type: "select", options: ["horizontal", "vertical"] as const, default: "horizontal"},
    gap: {type: "size", default: "", optional: true},
    panelGap: {type: "size", default: "", optional: true},
    // Not a Tabs prop: shows where the icons go on each Tab
    icons: {type: "select", options: ["none", "left", "right", "only"] as const, default: "none"},
    grow: {type: "boolean", default: false},
    keepMounted: {type: "boolean", default: false},
    // Not a prop: draws the spacing guides over the preview
    showGuides: {type: "boolean", default: false},
} satisfies Controls;

export const tabsEntry = defineEntry({
    name: "Tabs",
    category: "Navigation",
    description: "Switch between panels. Variants follow Mantine (underline, outline, pills) and shadcn/ui (segmented).",
    layout: "fill",
    controls,
    render: ({showGuides, color, radius, gap, panelGap, icons, ...props}) => (
        <LayoutGuides enabled={showGuides} getTargets={element => [element, element.querySelector("[role=tablist]")]}>
            <Tabs
                defaultValue="account"
                // Leave these unset at their defaults so the theme tokens (--primary, --radius) still apply
                color={color === controls.color.default ? undefined : color}
                radius={radius === controls.radius.default ? undefined : radius}
                // "" is the "default" choice: no prop, so each variant uses its own spacing
                gap={gap === "" ? undefined : gap}
                panelGap={panelGap === "" ? undefined : panelGap}
                {...props}>
                <TabList aria-label="Account settings">
                    {TABS.map(({value, label, icon: Icon, disabled}) => (
                        <Tab
                            key={value}
                            value={value}
                            disabled={disabled}
                            leftIcon={icons === "left" || icons === "only" ? <Icon /> : undefined}
                            rightIcon={icons === "right" ? <Icon /> : undefined}
                            // Icon-only tabs need a label for screen readers
                            aria-label={icons === "only" ? label : undefined}>
                            {icons === "only" ? undefined : label}
                        </Tab>
                    ))}
                </TabList>
                <TabPanel value="account">
                    <p className="hint">Type here, switch tabs and come back. The text survives only with keepMounted.</p>
                    <input className="text-input" placeholder="Your name" />
                </TabPanel>
                <TabPanel value="password">
                    <p className="hint">Change your password here.</p>
                    <Button size="sm">Update password</Button>
                </TabPanel>
                <TabPanel value="billing">Billing details</TabPanel>
                <TabPanel value="notifications">Notification preferences</TabPanel>
            </Tabs>
        </LayoutGuides>
    ),
    code: values => {
        const tabLines = TABS.map(({value, label, iconName, disabled}) => {
            const props = [
                `value="${value}"`,
                disabled && "disabled",
                (values.icons === "left" || values.icons === "only") && `leftIcon={<${iconName} />}`,
                values.icons === "right" && `rightIcon={<${iconName} />}`,
                values.icons === "only" && `aria-label="${label}"`,
            ].filter((prop): prop is string => Boolean(prop));

            return values.icons === "only"
                ? openTag("Tab", props, "        ", true)
                : `${openTag("Tab", props, "        ")}${label}</Tab>`;
        });

        const imports = [`import { Tabs, TabList, Tab, TabPanel } from "bettergovregiondavaoui";`];
        if (values.icons !== "none") {
            imports.push(`import { ${TABS.map(tab => tab.iconName).join(", ")} } from "lucide-react";`);
        }

        return `${imports.join("\n")}

${openTag("Tabs", ['defaultValue="account"', ...jsxProps(controls, values, ["icons", "showGuides"])])}
    <TabList aria-label="Account settings">
${tabLines.join("\n")}
    </TabList>
    <TabPanel value="account">Account settings</TabPanel>
    <TabPanel value="password">Change your password</TabPanel>
    <TabPanel value="billing">Billing details</TabPanel>
    <TabPanel value="notifications">Notification preferences</TabPanel>
</Tabs>`;
    },
});
