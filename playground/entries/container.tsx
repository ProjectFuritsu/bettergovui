import {Container, Heading, Stack, Text} from "../../src";
import {compact, openTag} from "../workbench/code";
import {LayoutGuides} from "../workbench/LayoutGuides";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    as: {type: "select", options: ["div", "main", "header", "footer", "nav", "section", "article", "aside"] as const, default: "div"},
    size: {type: "size", default: "lg"},
    // Not a prop: draws the layout guides (columns, gaps, padding) over the preview
    showGuides: {type: "boolean", default: true},
} satisfies Controls;

export const containerEntry = defineEntry({
    name: "Container",
    category: "Layout",
    description: "Centers page content with a maximum width (dashed outline). Try Desktop view: on smaller screens it fills the width. `as` picks the HTML element, e.g. main.",
    layout: "full",
    controls,
    render: ({as, size, showGuides}) => (
        // The demo frame is narrower than the page, so let the container use the frame's full width
        <div style={{margin: "0 -16px"}}>
            <LayoutGuides enabled={showGuides}>
                <Container
                    as={as}
                    size={size}
                    // With the guides off, a dashed line still shows the container's edges
                    style={{outline: showGuides ? undefined : "1px dashed var(--border-strong)", paddingTop: 16, paddingBottom: 16}}>
                    <Stack gap="sm">
                        <Heading level={3}>Davao Region e-Services</Heading>
                        <Text muted>
                            Everything inside stays at a comfortable reading width and centered, with space at the sides on phones.
                        </Text>
                    </Stack>
                </Container>
            </LayoutGuides>
        </div>
    ),
    code: values => {
        const props = compact([
            values.as !== "div" && `as="${values.as}"`,
            values.size !== "lg" && (typeof values.size === "number" ? `size={${values.size}}` : `size="${values.size}"`),
        ]);
        return `import { Container } from "bettergovregiondavaoui";

${openTag("Container", props)}
    …your page…
</Container>`;
    },
});
