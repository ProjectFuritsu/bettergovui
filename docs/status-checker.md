# Status checker

[← Back to the README](../README.md)

Checking whether websites are up, and what a browser can and can't tell.

`StatusChecker` shows whether a website is up (**Online**, **Slow**, **Offline** or **Can't reach**), how fast it answered, and when
it last checked. It checks again every 60 seconds, but not while the tab is hidden, and it notices when the visitor's
own internet goes off.

```tsx
<StatusChecker url="https://www.gov.ph" label="GOV.PH" />
<StatusChecker url="https://permits.example.gov.ph/health" label="Business permits" strict />
<StatusChecker url="/api/health" variant="badge" />          {/* your own site: strict by default */}
```

**What a browser can and can't tell.** Browsers protect other websites' answers (rules called CORS and CORP):
- Any answer from another site counts as **Online**, even an error page.
- No usable answer shows **Can't reach**. The site may be down, or it may block checks from other sites, which many
  sites behind Cloudflare do (GOV.PH, for one). A browser can't tell those two apart.
- For your own site, or a health address that allows other sites to read it (CORS), add `strict`: then only a
  success answer counts, and a failure shows **Offline**.

**For a real status page, check from your server.** Servers aren't bound by those browser rules:

```tsx
import { StatusChecker, serverCheck } from "bettergovregiondavaoui";

<StatusChecker url="https://www.gov.ph" label="GOV.PH" check={serverCheck("/api/site-status")} />
```

```js
// /api/site-status on your server (here as a Next.js route; any server works the same way)
const ALLOWED = ["https://www.gov.ph", "https://permits.example.gov.ph"];

export async function GET(request) {
    const url = new URL(request.url).searchParams.get("url");
    // Only check your own list. Checking any address people send would let them use your server
    // to probe other machines (an attack called SSRF).
    if (!ALLOWED.includes(url)) return Response.json({ error: "Not allowed" }, { status: 400 });
    try {
        const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
        return Response.json({ online: response.status < 500 });   // 403 from a bot check still means it's up
    } catch {
        return Response.json({ online: false });
    }
}
```
