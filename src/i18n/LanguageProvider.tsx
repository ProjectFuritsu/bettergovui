import {createContext, useContext, useMemo, type ReactNode} from "react";
import {ceb, en, fil, type Messages} from "./messages";

/** The built-in languages: English, Filipino, and Bisaya (Cebuano). */
export type Language = "en" | "fil" | "ceb";

export const MESSAGES: Record<Language, Messages> = {en, fil, ceb};

/** Some of the texts to change; groups like `address` can be given in part. */
export type MessageOverrides = {
    [Key in keyof Messages]?: Messages[Key] extends (...args: never[]) => unknown
        ? Messages[Key]
        : Messages[Key] extends object
          ? Partial<Messages[Key]>
          : Messages[Key];
};

const LanguageContext = createContext<{language: Language; messages: Messages}>({language: "en", messages: en});

export interface LanguageProviderProps {
    /** "en" (English, the default without a provider), "fil" (Filipino) or "ceb" (Bisaya / Cebuano). */
    language: Language;
    /** Your own wording for some texts, e.g. `{ close: "Sirado" }` or `{ address: { city: "Lungsod" } }`. */
    messages?: MessageOverrides;
    children?: ReactNode;
}

/**
 * Sets the language of every component inside it: close buttons, "Loading…", address labels,
 * error messages and so on. Put it around your whole app. Also set `<html lang="fil">` (or "ceb", "en"),
 * so screen readers pronounce the page correctly.
 */
export function LanguageProvider({language, messages, children}: LanguageProviderProps) {
    const value = useMemo(() => {
        const base = MESSAGES[language] ?? en;
        const merged = {...base} as Record<string, unknown>;
        // Groups (like `address`) are merged one level deep, so you can change just one text in them
        for (const [key, override] of Object.entries(messages ?? {})) {
            const original = (base as unknown as Record<string, unknown>)[key];
            merged[key] =
                override && typeof override === "object" && original && typeof original === "object"
                    ? {...original, ...override}
                    : override;
        }
        return {language, messages: merged as unknown as Messages};
    }, [language, messages]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** The texts for the current language. English when there's no LanguageProvider. */
export function useMessages() {
    return useContext(LanguageContext).messages;
}

/** The current language: "en", "fil" or "ceb". */
export function useLanguage() {
    return useContext(LanguageContext).language;
}

/**
 * The locale for dates and numbers in a language, e.g. "fil-PH". Falls back to "en-PH" when the browser
 * doesn't have that language's date names (Bisaya isn't in every browser yet).
 */
export function dateLocale(language: Language) {
    const locale = `${language}-PH`;
    try {
        return Intl.DateTimeFormat.supportedLocalesOf([locale]).length > 0 ? locale : "en-PH";
    } catch {
        return "en-PH";
    }
}
