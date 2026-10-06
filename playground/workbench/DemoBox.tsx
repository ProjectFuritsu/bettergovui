import type {CSSProperties, ReactNode} from "react";

// A tinted placeholder box, used to show how the layout components arrange things
export function DemoBox({children, style}: {children: ReactNode; style?: CSSProperties}) {
    return (
        <div
            style={{
                padding: "12px 16px",
                border: "1px dashed color-mix(in srgb, var(--primary) 45%, transparent)",
                borderRadius: 6,
                background: "color-mix(in srgb, var(--primary) 10%, var(--surface))",
                color: "var(--text)",
                fontSize: 14,
                fontWeight: 600,
                textAlign: "center",
                ...style,
            }}>
            {children}
        </div>
    );
}

// Wraps a demo child in an <li> when the layout renders as a list (as="ul" / "ol"), since a list may only
// hold <li>s. The <li> is a flex column, so the child still fills it the way it would fill the layout's cell.
export function DemoItem({list, children}: {list: boolean; children: ReactNode}) {
    return list ? <li style={{display: "flex", flexDirection: "column"}}>{children}</li> : <>{children}</>;
}
