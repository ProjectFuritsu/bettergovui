// Joins class names, skipping empty ones (undefined, false, "")
export function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}
