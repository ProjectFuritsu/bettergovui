// Copies text, also on plain http (e.g. when opening the toolkit from a phone on your network)
export async function writeToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        // The clipboard API only works on localhost/https; this older method also works on plain http
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.append(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("Copy failed");
    }
}
