import {Badge, Button, Card, CardDescription, CardFooter, CardSection, CardTitle} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";
import {LayoutGuides} from "../workbench/LayoutGuides";

const controls = {
    // "li" is left out here: it only belongs inside a list (see the Grid page with as="ul")
    as: {type: "select", options: ["div", "article", "section", "aside"] as const, default: "div"},
    title: {type: "text", default: "Business permit"},
    description: {type: "text", default: "Ready for pickup at City Hall, Window 4."},
    variant: {type: "select", options: ["outline", "elevated", "filled"] as const, default: "outline"},
    padding: {type: "size", default: "", optional: true},
    radius: {type: "number", min: 0, max: 24, default: 8},
    hoverable: {type: "boolean", default: false},
    // Not props: which parts the demo card has
    image: {type: "boolean", default: true},
    badge: {type: "boolean", default: true},
    footer: {type: "boolean", default: true},
    // Not a prop: draws the spacing guides over the preview
    showGuides: {type: "boolean", default: false},
} satisfies Controls;

export const cardEntry = defineEntry({
    name: "Card",
    category: "Data display",
    description: "A box for grouped content. CardSection goes edge to edge (e.g. an image); CardFooter holds buttons. hoverable lifts it on hover, for clickable cards. `as` picks the HTML element, e.g. article.",
    layout: "centered",
    controls,
    render: ({showGuides, title, description, padding, radius, image, badge, footer, ...props}) => (
        <LayoutGuides enabled={showGuides}>
            <Card
                padding={padding === "" ? undefined : padding}
                radius={radius === controls.radius.default ? undefined : radius}
                style={{width: "100%", maxWidth: 360}}
                {...props}>
                {image && (
                    <CardSection>
                        {/* A drawn placeholder instead of a photo, so the demo needs no image file */}
                        <div
                            role="img"
                            aria-label="City hall"
                            style={{height: 140, background: "linear-gradient(135deg, #1c7ed6, #0c8599 55%, #2f9e44)"}}
                        />
                    </CardSection>
                )}
                {badge && <Badge color="success" style={{alignSelf: "flex-start"}}>Approved</Badge>}
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
                {footer && (
                    <CardFooter as={props.as === "article" || props.as === "section" ? "footer" : undefined}>
                        <Button size="sm">View details</Button>
                        <Button size="sm" variant="outline">Download</Button>
                    </CardFooter>
                )}
            </Card>
        </LayoutGuides>
    ),
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["title", "description", "padding", "image", "badge", "footer", "showGuides"]),
            values.padding !== "" && (typeof values.padding === "number" ? `padding={${values.padding}}` : `padding="${values.padding}"`),
        ]);
        // A real <footer> only inside an article or section; anywhere else it would mean the page's footer
        const footerTag = values.as === "article" || values.as === "section" ? `CardFooter as="footer"` : "CardFooter";
        const lines = compact([
            values.image && `    <CardSection>\n        <img src="/city-hall.jpg" alt="City hall" />\n    </CardSection>`,
            values.badge && `    <Badge color="success">Approved</Badge>`,
            values.title && `    <CardTitle>${values.title}</CardTitle>`,
            values.description && `    <CardDescription>${values.description}</CardDescription>`,
            values.footer && `    <${footerTag}>\n        <Button size="sm">View details</Button>\n        <Button size="sm" variant="outline">Download</Button>\n    </CardFooter>`,
        ]);
        const parts = compact([
            "Card",
            values.title && "CardTitle",
            values.description && "CardDescription",
            values.image && "CardSection",
            values.footer && "CardFooter",
            values.badge && "Badge",
            values.footer && "Button",
        ]);
        return `import { ${parts.join(", ")} } from "bettergovregiondavaoui";

${openTag("Card", props)}
${lines.join("\n")}
</Card>`;
    },
});
