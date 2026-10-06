import {isValidElement, type ReactElement, type ReactNode} from "react";
import Button, {type ButtonProps} from "../components/Button/Button";

export interface BlockActionLink {
    /** The button's text. */
    label: ReactNode;
    /** Where it goes. With an href, the button is a link. */
    href?: string;
    /** What happens on click, when it isn't a link. */
    onClick?: () => void;
}

/**
 * A button in a block. Any of:
 * - text: `"Apply now"` (a button; add an onClick by using the object form)
 * - an object: `{ label: "Apply now", href: "/apply" }`
 * - your own element: `<Button leftIcon={<Send />}>Apply now</Button>`
 */
export type BlockAction = string | BlockActionLink | ReactElement;

// Turns a BlockAction into a Button with the block's chosen look (size, variant…)
export function renderAction(action: BlockAction | undefined, look: Partial<ButtonProps> = {}) {
    if (action === undefined) return null;
    if (isValidElement(action)) return action;
    const {label, href, onClick} = typeof action === "string" ? {label: action} : action;
    return (
        <Button href={href} onClick={onClick} {...look}>
            {label}
        </Button>
    );
}
