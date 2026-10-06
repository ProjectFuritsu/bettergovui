import {
    ArrowRight,
    Check,
    Clock,
    Download,
    Heart,
    Info,
    Lock,
    Mail,
    Plus,
    Search,
    Send,
    Star,
    Trash2,
    User,
    X,
    type LucideIcon,
} from "lucide-react";

// Icons offered in the properties pane (from lucide-react, the icon set shadcn/ui uses)
export const ICON_OPTIONS = [
    "none", "Plus", "Check", "X", "Download", "Send", "ArrowRight", "Heart", "Star",
    "Trash2", "User", "Mail", "Search", "Lock", "Clock", "Info",
] as const;

export type IconOption = typeof ICON_OPTIONS[number];

const ICONS: Record<Exclude<IconOption, "none">, LucideIcon> = {
    Plus, Check, X, Download, Send, ArrowRight, Heart, Star, Trash2, User, Mail, Search, Lock, Clock, Info,
};

export function renderIcon(name: IconOption) {
    if (name === "none") return undefined;
    const Icon = ICONS[name];
    return <Icon />;
}

// `leftIcon={<Plus />}`, or nothing when no icon is picked
export function iconProp(prop: string, name: IconOption) {
    return name === "none" ? false : `${prop}={<${name} />}`;
}

// The lucide import line for the icons a code sample uses, or nothing
export function iconImport(names: IconOption[]) {
    const used = [...new Set(names.filter(name => name !== "none"))];
    return used.length > 0 ? `import { ${used.join(", ")} } from "lucide-react";` : false;
}
