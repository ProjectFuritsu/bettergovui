import {useState} from "react";
import {Button, Checkbox, Drawer, Select, type DrawerProps} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    title: {type: "text", default: "Filter permits"},
    description: {type: "text", default: ""},
    position: {type: "select", options: ["right", "left", "top", "bottom"] as const, default: "right"},
    size: {type: "size", default: "md"},
    withCloseButton: {type: "boolean", default: true},
    closeOnBackdropClick: {type: "boolean", default: true},
    closeOnEscape: {type: "boolean", default: true},
} satisfies Controls;

type DemoProps = Omit<DrawerProps, "open" | "onClose">;

// A "Filters" button that opens a drawer with a small filter form
function DrawerDemo(props: DemoProps) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>Open filters</Button>
            <Drawer
                {...props}
                open={open}
                onClose={() => setOpen(false)}
                footer={
                    <>
                        <Button variant="text" onClick={() => setOpen(false)}>Clear</Button>
                        <Button onClick={() => setOpen(false)}>Show results</Button>
                    </>
                }>
                <div style={{display: "flex", flexDirection: "column", gap: 16}}>
                    <Select label="City" placeholder="Any city" options={["Davao City", "Digos City", "Tagum City"]} />
                    <Checkbox label="Approved" defaultChecked />
                    <Checkbox label="Pending review" defaultChecked />
                    <Checkbox label="Rejected" />
                </div>
            </Drawer>
        </>
    );
}

export const drawerEntry = defineEntry({
    name: "Drawer",
    category: "Overlays",
    description: "A panel that slides in from an edge, e.g. for filters or a menu. Try every position on the Phone view.",
    layout: "centered",
    controls,
    render: ({title, description, ...props}) => (
        <DrawerDemo title={title || undefined} description={description || undefined} {...props} />
    ),
    code: values => {
        const props = compact([
            "open={open}",
            "onClose={() => setOpen(false)}",
            ...jsxProps(controls, values),
            `footer={<Button onClick={() => setOpen(false)}>Show results</Button>}`,
        ]);
        return `import { useState } from "react";
import { Button, Drawer } from "bettergovregiondavaoui";

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open filters</Button>
${openTag("Drawer", props)}
    …your filters…
</Drawer>`;
    },
});
