import {List, ListItem} from "../../src";
import {compact, openTag} from "../workbench/code";
import {ICON_OPTIONS, iconImport, renderIcon} from "../workbench/icons";
import {defineEntry, type Controls} from "../workbench/types";
import {LayoutGuides} from "../workbench/LayoutGuides";

const ITEMS = ["Barangay business clearance", "Valid government-issued ID", "Lease contract or land title", "Community tax certificate (cedula)"];

const controls = {
    type: {type: "select", options: ["unordered", "ordered"] as const, default: "unordered"},
    icon: {type: "select", options: ICON_OPTIONS, default: "none"},
    spacing: {type: "size", default: "xs"},
    size: {type: "size", default: "md"},
    // Not a prop: draws the spacing guides over the preview
    showGuides: {type: "boolean", default: false},
    color: {type: "themeColor", default: "default", none: "default"},
} satisfies Controls;

export const listEntry = defineEntry({
    name: "List",
    category: "Typography",
    description: "A bulleted or numbered list, or one with an icon per item (e.g. a checklist of requirements).",
    layout: "centered",
    controls,
    render: ({showGuides, icon, color, ...props}) => (
        <LayoutGuides enabled={showGuides}>
            <List icon={renderIcon(icon)} color={color === "default" ? undefined : color} style={{width: "100%"}} {...props}>
                {ITEMS.map(item => <ListItem key={item}>{item}</ListItem>)}
            </List>
        </LayoutGuides>
    ),
    code: values => {
        const props = compact([
            values.type !== "unordered" && `type="${values.type}"`,
            values.icon !== "none" && `icon={<${values.icon} />}`,
            values.spacing !== "xs" && (typeof values.spacing === "number" ? `spacing={${values.spacing}}` : `spacing="${values.spacing}"`),
            values.color !== "default" && `color="${values.color}"`,
            values.size !== "md" && (typeof values.size === "number" ? `size={${values.size}}` : `size="${values.size}"`),
        ]);
        const imports = compact([`import { List, ListItem } from "bettergovregiondavaoui";`, iconImport([values.icon])]);
        return `${imports.join("\n")}

${openTag("List", props)}
${ITEMS.map(item => `    <ListItem>${item}</ListItem>`).join("\n")}
</List>`;
    },
});
