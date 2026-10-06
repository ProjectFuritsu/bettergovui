import {
    createContext,
    useContext,
    useId,
    useState,
    type ButtonHTMLAttributes,
    type CSSProperties,
    type HTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
} from "react";
import {isLightThemeColor, resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {hasContent} from "../../utils/hasContent";
import {isSizePreset, toCssLength, toSpacing, type Size} from "../../utils/size";
import styles from "./Tabs.module.css";

export type TabsVariant = "underline" | "outline" | "pills" | "segmented";
export type TabsOrientation = "horizontal" | "vertical";

interface TabsContextValue {
    selectedValue: string | undefined;
    select: (value: string) => void;
    baseId: string;
    variant: TabsVariant;
    orientation: TabsOrientation;
    grow: boolean;
    keepMounted: boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error(`<${component}> must be used inside <Tabs>`);
    }
    return context;
}

// Links each tab to its panel for screen readers (aria-controls / aria-labelledby)
function tabId(baseId: string, value: string) {
    return `${baseId}-tab-${value.replace(/\s+/g, "-")}`;
}

function panelId(baseId: string, value: string) {
    return `${baseId}-panel-${value.replace(/\s+/g, "-")}`;
}

/* ---------- Tabs ---------- */

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "color"> {
    /** The selected tab. Pass this with onValueChange to control the tabs yourself. */
    value?: string;
    /** The tab selected at first, when you don't pass `value`. */
    defaultValue?: string;
    /** Called with the new tab's value whenever the user selects a tab. */
    onValueChange?: (value: string) => void;
    /** "underline", "outline" and "pills" follow Mantine; "segmented" follows shadcn/ui. Default "underline". */
    variant?: TabsVariant;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
    /** Color of the active tab: "primary" (default), "accent", "success"… or any CSS color. */
    color?: Color;
    /** Corner rounding. A number in pixels or any CSS length. Default: the --radius token. */
    radius?: number | string;
    /** "vertical" puts the tab list on the left of the panels. Default "horizontal". */
    orientation?: TabsOrientation;
    /**
     * Space between the tabs. A preset ("xs" 4px – "xl" 24px), a number in pixels, or any CSS length.
     * Default: 4px (2px for "segmented").
     */
    gap?: Size;
    /**
     * Space between the tab list and the panel. A preset ("xs" 4px – "xl" 24px), a number in pixels,
     * or any CSS length. Default: 16px.
     */
    panelGap?: Size;
    /** Stretch the tabs to fill the whole list. */
    grow?: boolean;
    /** Keep hidden panels in the page so their state (e.g. typed text) survives switching tabs. */
    keepMounted?: boolean;
}

export function Tabs({
    value,
    defaultValue,
    onValueChange,
    variant = "underline",
    size = "md",
    color,
    radius,
    orientation = "horizontal",
    gap,
    panelGap,
    grow = false,
    keepMounted = false,
    className,
    style,
    children,
    ...rest
}: TabsProps) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = value !== undefined;
    const selectedValue = isControlled ? value : internalValue;
    const baseId = useId();
    const preset = isSizePreset(size);

    function select(next: string) {
        if (!isControlled) {
            setInternalValue(next);
        }
        onValueChange?.(next);
    }

    // Settings become CSS variables that Tabs.module.css reads. Undefined ones are left out.
    const settings = {
        "--tabs-size": preset ? undefined : toCssLength(size),
        "--tabs-color": color === undefined ? undefined : resolveColor(color),
        "--tabs-radius": radius === undefined ? undefined : toCssLength(radius),
        "--tabs-gap": gap === undefined ? undefined : toSpacing(gap),
        "--tabs-panel-gap": panelGap === undefined ? undefined : toSpacing(panelGap),
    } as CSSProperties;

    return (
        <TabsContext.Provider value={{selectedValue, select, baseId, variant, orientation, grow, keepMounted}}>
            <div
                className={cx(styles.tabs, className)}
                data-orientation={orientation}
                data-size={preset ? size : undefined}
                data-auto-contrast={isLightThemeColor(color) || undefined}
                style={{...settings, ...style}}
                {...rest}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

/* ---------- TabList ---------- */

export type TabListProps = HTMLAttributes<HTMLDivElement>;

export function TabList({className, onKeyDown, children, ...rest}: TabListProps) {
    const {variant, orientation, grow} = useTabsContext("TabList");
    const [prevKey, nextKey] = orientation === "vertical"
        ? ["ArrowUp", "ArrowDown"]
        : ["ArrowLeft", "ArrowRight"];

    // Arrow keys move between tabs, Home/End jump to the first/last one
    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        onKeyDown?.(event);

        const tabs = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
        );
        const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
        if (index === -1) return;

        let next: number;
        switch (event.key) {
            case nextKey: next = (index + 1) % tabs.length; break;
            case prevKey: next = (index - 1 + tabs.length) % tabs.length; break;
            case "Home": next = 0; break;
            case "End": next = tabs.length - 1; break;
            default: return;
        }

        event.preventDefault();
        tabs[next].focus();
        tabs[next].click();
    }

    return (
        <div
            role="tablist"
            aria-orientation={orientation}
            className={cx(styles.list, className)}
            data-variant={variant}
            data-orientation={orientation}
            data-grow={grow || undefined}
            onKeyDown={handleKeyDown}
            {...rest}>
            {children}
        </div>
    );
}

/* ---------- Tab ---------- */

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Matches the `value` of the TabPanel this tab opens. */
    value: string;
    /** An icon before the label, e.g. `<User />`. It's sized to match the tab automatically. */
    leftIcon?: ReactNode;
    /** An icon after the label. */
    rightIcon?: ReactNode;
}

/**
 * An icon-only tab (an icon and no label) is square.
 * Give it an `aria-label` so screen readers can say what it opens.
 */
export function Tab({value, leftIcon, rightIcon, className, onClick, children, ...rest}: TabProps) {
    const {selectedValue, select, baseId, variant, orientation, grow} = useTabsContext("Tab");
    const selected = value === selectedValue;
    const iconOnly = !hasContent(children) && Boolean(leftIcon || rightIcon);

    return (
        <button
            type="button"
            role="tab"
            id={tabId(baseId, value)}
            aria-selected={selected}
            aria-controls={panelId(baseId, value)}
            // Only the selected tab is reachable with the Tab key; arrows move between tabs.
            // If nothing is selected yet, every tab stays reachable.
            tabIndex={selected || selectedValue === undefined ? 0 : -1}
            className={cx(styles.tab, iconOnly && styles.iconOnly, className)}
            data-variant={variant}
            data-orientation={orientation}
            data-grow={grow || undefined}
            onClick={event => {
                onClick?.(event);
                if (!event.defaultPrevented) {
                    select(value);
                }
            }}
            {...rest}>
            {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
            {children}
            {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
        </button>
    );
}

/* ---------- TabPanel ---------- */

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
    /** Matches the `value` of the Tab that opens this panel. */
    value: string;
}

export function TabPanel({value, className, children, ...rest}: TabPanelProps) {
    const {selectedValue, baseId, keepMounted} = useTabsContext("TabPanel");
    const selected = value === selectedValue;

    return (
        <div
            role="tabpanel"
            id={panelId(baseId, value)}
            aria-labelledby={tabId(baseId, value)}
            hidden={!selected}
            tabIndex={0}
            className={cx(styles.panel, className)}
            {...rest}>
            {(selected || keepMounted) && children}
        </div>
    );
}
