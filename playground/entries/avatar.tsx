import {Avatar} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

// A drawn "photo" as a data URL, so the demo needs no image file
const PHOTO = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
        <rect width="80" height="80" fill="#a5d8ff"/>
        <circle cx="40" cy="32" r="14" fill="#f4c095"/>
        <path d="M14 80a26 26 0 0 1 52 0" fill="#1c7ed6"/>
    </svg>`,
)}`;

const controls = {
    name: {type: "text", default: "Juan Dela Cruz"},
    // "photo" shows the image, "broken" shows what happens when an image fails to load
    image: {type: "select", options: ["none", "photo", "broken"] as const, default: "none"},
    size: {type: "size", default: "lg"},
    variant: {type: "select", options: ["light", "filled"] as const, default: "light"},
    color: {type: "themeColor", default: "auto", none: "auto"},
    radius: {type: "number", min: 0, max: 40, default: 40},
} satisfies Controls;

export const avatarEntry = defineEntry({
    name: "Avatar",
    category: "Data display",
    description: "A photo, or initials when there's none (or it fails to load). Each name gets its own color automatically.",
    layout: "centered",
    controls,
    render: ({name, image, color, radius, ...props}) => (
        <Avatar
            // Recreated when the image changes, so a fixed image is tried again
            key={image}
            name={name || undefined}
            src={image === "photo" ? PHOTO : image === "broken" ? "/does-not-exist.jpg" : undefined}
            color={color === "auto" ? undefined : color}
            radius={radius === controls.radius.default ? undefined : radius}
            {...props}
        />
    ),
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["image", "color", "radius", "size"]),
            values.image !== "none" && `src="/photos/juan.jpg"`,
            values.size !== "md" && (typeof values.size === "number" ? `size={${values.size}}` : `size="${values.size}"`),
            values.color !== "auto" && `color="${values.color}"`,
            values.radius !== controls.radius.default && `radius={${values.radius}}`,
        ]);
        return `import { Avatar } from "bettergovregiondavaoui";\n\n${openTag("Avatar", props, "", true)}`;
    },
});
