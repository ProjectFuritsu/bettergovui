import {Button, Toaster, toast} from "../../src";
import {compact} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    title: {type: "text", default: "Application submitted"},
    description: {type: "text", default: "We'll email you once it has been reviewed."},
    color: {type: "themeColor", default: "success"},
    // seconds, 0 = stays until closed
    duration: {type: "number", min: 0, max: 10, default: 5},
    action: {type: "boolean", default: false},
    position: {
        type: "select",
        options: ["bottom-right", "bottom-center", "bottom-left", "top-right", "top-center", "top-left"] as const,
        default: "bottom-right",
    },
} satisfies Controls;

export const toastEntry = defineEntry({
    name: "Toast",
    category: "Feedback",
    description: "Short messages that appear in a corner and hide by themselves. Hovering pauses the timer.",
    layout: "centered",
    controls,
    render: ({title, description, color, duration, action, position}) => (
        <>
            <Toaster position={position} />
            <div style={{display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center"}}>
                <Button
                    onClick={() => toast({
                        title: title || undefined,
                        description: description || undefined,
                        color,
                        duration: duration * 1000,
                        action: action ? {label: "Undo", onClick: () => toast({title: "Undone", color: "info"})} : undefined,
                    })}>
                    Show toast
                </Button>
                <Button variant="text" onClick={() => toast.dismiss()}>Close all</Button>
            </div>
        </>
    ),
    code: values => {
        const options = compact([
            values.title && `    title: "${values.title}",`,
            values.description && `    description: "${values.description}",`,
            values.color !== "info" && `    color: "${values.color}",`,
            values.duration !== 5 && `    duration: ${values.duration * 1000},`,
            values.action && `    action: { label: "Undo", onClick: undo },`,
        ]);
        const toaster = values.position === "bottom-right" ? "<Toaster />" : `<Toaster position="${values.position}" />`;
        return `import { Toaster, toast } from "bettergovregiondavaoui";

// Once, near the root of your app:
${toaster}

// Anywhere, e.g. after saving:
toast({
${options.join("\n")}
});`;
    },
});
