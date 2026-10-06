# Philippine fields

[← Back to the README](../README.md)

Fields for what Philippine government forms always ask for: mobile numbers, pesos, PhilSys and TIN numbers, and addresses from the official PSGC list.

## Numbers and amounts

They format as you type, clean up pasted text, and send plain
values with the form (through a hidden field named with `name`).

```tsx
import { MobileNumberInput, PesoInput } from "bettergovregiondavaoui";

// Shows +63 and "917 123 4567". Pasting "0917-123-4567" or "+63 917 123 4567" works too.
<MobileNumberInput name="mobile" onValueChange={(number, { e164 }) => setMobile(e164)} />   // e164: "+639171234567"

// Shows ₱ and "15,000.00". min/max block the form with a clear message.
<PesoInput label="Amount to pay" name="amount" min={100} onValueChange={setAmount} />          // 15000 (a number)
```

| Field | Gives you | The form sends |
|---|---|---|
| `MobileNumberInput` | the digits after +63, plus `{ valid, e164 }` | `+639171234567` (empty until complete) |
| `PesoInput` | the amount as a number, or `null` | `15000.00` (no ₱ or commas) |
| `PhilSysInput` | the 16 digits of the PhilSys Card Number (PCN) | `1234567890123456` |
| `TinInput` | the digits, plus `{ tin, branch }` split out | `123456789` (or with the branch code: `branchCode`) |
| `GroupedNumberInput` | any number in digit groups, e.g. SSS `groups={[2, 7, 1]}`, PhilHealth `[2, 9, 1]`, Pag-IBIG `[4, 4, 4]` | the digits |

**ID numbers are personal data.** Under the Data Privacy Act, only ask for the ones a service really needs, and
don't keep them longer than necessary. These fields don't send the numbers anywhere; they only go where your form sends them.
PhilSysInput asks for the 16-digit card number (PCN) printed on the PhilID, not the 12-digit PhilSys Number (PSN),
which is meant to stay private.

## Philippine addresses

`AddressPicker` asks for Region → Province → City / Municipality → Barangay, using the official
Philippine Standard Geographic Code (PSGC) list. Each list loads when the field above it is chosen.

```tsx
import { AddressPicker } from "bettergovregiondavaoui";

<AddressPicker
    legend="Business address"
    name="address"                 // the form sends address.region, address.province, address.city, address.barangay (PSGC codes)
    onChange={setAddress}          // { region, province, city, barangay }, each { code, name }
    limitToRegion="110000000"      // optional: Davao Region only (the region field is hidden)
    required
/>
```

- **Save the codes, not just the names.** Codes like `112402000` (City of Davao) stay the same when names are respelled.
- **Metro Manila** has no provinces, so that field says "None in this region" and the cities load from the region.
- **Translate it** with `labels`, e.g. `labels={{ city: "Lungsod / Bayan", choose: "Pumili…" }}`.
- **Where the data comes from:** by default, the free public PSGC API at `psgc.gitlab.io`. Users' browsers load it
  directly, so your site works without a server of its own. For a production government site, host your own copy
  with the same paths and use `source={psgcApi("https://your-site.gov.ph/psgc")}`, so you don't depend on a third party.
  Or pass your own `source` (any object with `regions`, `provinces`, `cities` and `barangays` functions).
