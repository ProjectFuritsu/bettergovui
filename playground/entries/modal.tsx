import {useState} from "react";
import {Button, Modal, type ModalProps} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    title: {type: "text", default: "Submit your application?"},
    description: {type: "text", default: "You won't be able to edit it after submitting."},
    size: {type: "size", default: "md"},
    withCloseButton: {type: "boolean", default: true},
    closeOnBackdropClick: {type: "boolean", default: true},
    closeOnEscape: {type: "boolean", default: true},
} satisfies Controls;

type DemoProps = Omit<ModalProps, "open" | "onClose">;

// A button that opens the modal; the modal's buttons close it
function ModalDemo(props: DemoProps) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setOpen(true)}>Open modal</Button>
            <Modal
                {...props}
                open={open}
                onClose={() => setOpen(false)}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={() => setOpen(false)} data-autofocus>Submit</Button>
                    </>
                }>
                Your business permit renewal for <strong>Dela Cruz Sari-Sari Store</strong> will be sent to the
                Business Permits and Licensing Office for review.
            </Modal>
        </>
    );
}

export const modalEntry = defineEntry({
    name: "Modal",
    category: "Overlays",
    description: "A box the user must answer before going back to the page. Escape, the ×, or a click outside closes it.",
    layout: "centered",
    controls,
    render: ({title, description, ...props}) => (
        <ModalDemo title={title || undefined} description={description || undefined} {...props} />
    ),
    code: values => {
        const props = compact([
            "open={open}",
            "onClose={() => setOpen(false)}",
            ...jsxProps(controls, values),
            `footer={\n        <>\n            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>\n            <Button onClick={submit} data-autofocus>Submit</Button>\n        </>\n    }`,
        ]);
        return `import { useState } from "react";
import { Button, Modal } from "bettergovregiondavaoui";

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open modal</Button>
${openTag("Modal", props)}
    Your business permit renewal will be sent for review.
</Modal>`;
    },
});
