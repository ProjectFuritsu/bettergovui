import {Link, Text} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    children: {type: "text", default: "list of requirements"},
    href: {type: "text", default: "/requirements"},
    underline: {type: "select", options: ["always", "hover", "never"] as const, default: "always"},
    external: {type: "boolean", default: false},
    color: {type: "themeColor", default: "primary"},
} satisfies Controls;

export const linkEntry = defineEntry({
    name: "Link",
    category: "Typography",
    description: "A link that follows the surrounding text's size. Underlined by default, so it stands out by more than color.",
    layout: "centered",
    controls,
    render: ({children, href, ...props}) => (
        <Text style={{width: "100%"}}>
            Before you apply, check the{" "}
            {/* The demo link doesn't go anywhere, so the preview stays put */}
            <Link href={href} onClick={event => event.preventDefault()} {...props}>{children}</Link>
            {" "}for your business type.
        </Text>
    ),
    code: values => {
        const props = compact(jsxProps(controls, values, ["children"]));
        return `import { Link } from "bettergovregiondavaoui";\n\n${openTag("Link", props)}${values.children}</Link>`;
    },
});
