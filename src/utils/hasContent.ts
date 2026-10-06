import type {ReactNode} from "react";

// True when children would render something (used to detect icon-only buttons and tabs)
export function hasContent(children: ReactNode) {
    return children !== undefined && children !== null && children !== false && children !== "";
}
