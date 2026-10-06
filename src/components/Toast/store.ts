import type {ReactNode} from "react";
import type {Color} from "../../utils/color";

export interface ToastOptions {
    /** Bold first line. */
    title?: ReactNode;
    /** The message. */
    description?: ReactNode;
    /** "info" (default), "success", "warning", "danger", or any CSS color. */
    color?: Color;
    /** Milliseconds before it hides by itself. 0 keeps it until closed. Default 5000. */
    duration?: number;
    /** An icon on the left. By default one that matches the color. `false` hides it. */
    icon?: ReactNode;
    /** A button in the toast, e.g. `{label: "Undo", onClick: undo}`. Clicking it also closes the toast. */
    action?: {label: string; onClick: () => void};
    /** Give a toast an id to update it later (calling toast again with the same id replaces it). */
    id?: string;
}

export interface ToastData extends ToastOptions {
    id: string;
}

type Listener = () => void;

// The toasts on screen, shared by toast() and every <Toaster />
let toasts: ToastData[] = [];
const listeners = new Set<Listener>();
let nextId = 1;

function emit() {
    listeners.forEach(listener => listener());
}

export const toastStore = {
    subscribe(listener: Listener) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
    getSnapshot: () => toasts,
    getServerSnapshot: (): ToastData[] => [],
    add(data: ToastData) {
        const index = toasts.findIndex(item => item.id === data.id);
        toasts = index === -1 ? [...toasts, data] : toasts.map(item => (item.id === data.id ? data : item));
        emit();
    },
    remove(id?: string) {
        toasts = id === undefined ? [] : toasts.filter(item => item.id !== id);
        emit();
    },
};

/**
 * Shows a toast message. Needs a <Toaster /> somewhere in your app.
 * Returns the toast's id, which you can pass to `toast.dismiss(id)`.
 *
 * toast("Saved")
 * toast({title: "Application submitted", description: "We'll email you.", color: "success"})
 */
export function toast(options: ToastOptions | string): string {
    const data = typeof options === "string" ? {title: options} : options;
    const id = data.id ?? `toast-${nextId++}`;
    toastStore.add({...data, id});
    return id;
}

/** Closes one toast, or all of them when no id is given. */
toast.dismiss = (id?: string) => toastStore.remove(id);
