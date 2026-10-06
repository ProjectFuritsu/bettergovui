import {Grid} from "../../src";
import {isListElement, LAYOUT_ELEMENTS} from "../../src/utils/element";
import {DemoBox, DemoItem} from "../workbench/DemoBox";
import {LayoutGuides} from "../workbench/LayoutGuides";
import {compact, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const SERVICES = ["Business permit", "Building permit", "Cedula", "Birth certificate", "Barangay clearance", "Tax payment"];

const controls = {
    as: {type: "select", options: LAYOUT_ELEMENTS, default: "div"},
    columns: {type: "number", min: 1, max: 6, default: 3},
    // in pixels; 240 = the component's default of 15rem
    minColumnWidth: {type: "number", min: 80, max: 400, step: 20, default: 240},
    gap: {type: "size", default: "md"},
    // Not a prop: draws the layout guides (columns, gaps, padding) over the preview
    showGuides: {type: "boolean", default: true},
} satisfies Controls;

export const gridEntry = defineEntry({
    name: "Grid",
    category: "Layout",
    description: "Equal columns that adjust by themselves: up to `columns`, fewer when they'd get narrower than minColumnWidth. Try the Phone view. as=\"ul\" makes it a list.",
    layout: "full",
    controls,
    render: ({minColumnWidth, showGuides, ...props}) => {
        const list = isListElement(props.as);
        return (
            <LayoutGuides enabled={showGuides}>
                <Grid minColumnWidth={minColumnWidth === 240 ? undefined : minColumnWidth} {...props}>
                    {SERVICES.map(service => <DemoItem key={service} list={list}><DemoBox>{service}</DemoBox></DemoItem>)}
                </Grid>
            </LayoutGuides>
        );
    },
    code: values => {
        const props = compact([
            values.as !== "div" && `as="${values.as}"`,
            values.columns !== 3 && `columns={${values.columns}}`,
            values.minColumnWidth !== 240 && `minColumnWidth={${values.minColumnWidth}}`,
            values.gap !== "md" && (typeof values.gap === "number" ? `gap={${values.gap}}` : `gap="${values.gap}"`),
        ]);
        // In a list, each card is an <li>: <Card as="li"> does that without an extra element
        const item = isListElement(values.as)
            ? `<Card as="li" key={service.id}>{service.name}</Card>`
            : `<Card key={service.id}>{service.name}</Card>`;
        return `import { Card, Grid } from "bettergovregiondavaoui";

${openTag("Grid", props)}
    {services.map(service => ${item})}
</Grid>`;
    },
});
