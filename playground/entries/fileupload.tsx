import {FileUpload} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    label: {type: "text", default: "Valid ID"},
    description: {type: "text", default: "PDF, JPG or PNG, up to 5 MB each."},
    error: {type: "text", default: ""},
    accept: {type: "select", options: [".pdf,.jpg,.jpeg,.png", "image/*", ".pdf", "any"] as const, default: ".pdf,.jpg,.jpeg,.png"},
    multiple: {type: "boolean", default: true},
    // in MB; 0 = no limit
    maxSizeMb: {type: "number", min: 0, max: 20, default: 5},
    // 0 = no limit
    maxFiles: {type: "number", min: 0, max: 10, default: 3},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

export const fileUploadEntry = defineEntry({
    name: "FileUpload",
    category: "Forms",
    description: "Choose files or drag them onto the box. Files that are too big or the wrong type are turned away with a message; each chosen file can be removed.",
    layout: "centered",
    controls,
    render: ({description, error, accept, maxSizeMb, maxFiles, ...props}) => (
        <FileUpload
            // Start over when the rules change
            key={`${accept}-${props.multiple}-${maxSizeMb}-${maxFiles}`}
            description={description || undefined}
            error={error || undefined}
            accept={accept === "any" ? undefined : accept}
            maxSize={maxSizeMb ? maxSizeMb * 1024 * 1024 : undefined}
            maxFiles={maxFiles || undefined}
            {...props}
        />
    ),
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["accept", "maxSizeMb", "maxFiles"]),
            values.accept !== "any" && `accept="${values.accept}"`,
            values.maxSizeMb > 0 && `maxSize={${values.maxSizeMb} * 1024 * 1024}`,
            values.multiple && values.maxFiles > 0 && `maxFiles={${values.maxFiles}}`,
            `name="validId"`,
        ]);
        return `import { FileUpload } from "bettergovregiondavaoui";

// With a name, the files are sent with the form like any file field
${openTag("FileUpload", props, "", true)}`;
    },
});
