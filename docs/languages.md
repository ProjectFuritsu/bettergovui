# Languages

[← Back to the README](../README.md)

English, Filipino and Bisaya (Cebuano), and how to change the wording.

The components' own texts (close buttons, "Loading", address labels, error messages, and the names screen readers
say for menus and lists) come in **English**, **Filipino** and **Bisaya (Cebuano)**. Put `LanguageProvider` around
your app to choose one:

```tsx
import { LanguageProvider } from "bettergovregiondavaoui";

<LanguageProvider language="ceb">   {/* "en" (the default), "fil" or "ceb" */}
    <App />
</LanguageProvider>
```

- Also set the page's language, `<html lang="ceb">`, so screen readers pronounce it correctly.
- **Your own text always wins:** `<Alert closeLabel="Sirado" />` uses "Sirado" whatever the language.
- **Change a few texts for the whole app** with `messages`, e.g. `messages={{ close: "Sirado", address: { city: "Lungsod" } }}`.
- **Dates** in blocks follow the language (`fil-PH`). Browsers that don't have Bisaya date names yet use English ones.
- **Have the translations checked.** The Filipino and Bisaya texts were written with care, but a native speaker should
  review them before a site goes live. They're all in one file, `src/i18n/messages.ts`.

The toolkit has a language switch (EN / FIL / CEB) next to the dark mode toggle.
