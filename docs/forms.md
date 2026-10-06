# Forms

[← Back to the README](../README.md)

How to read what people type, show errors, and use the password and prefix features.

## Reading the values

All form components render real form elements underneath, so the usual ways work.

**On submit, with `FormData`:** give each field a `name`.

```tsx
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const city = form.get("city");                   // the chosen option
    const agreed = form.get("agree") === "on";        // Checkbox and Switch send "on" when checked
}

<form onSubmit={handleSubmit}>
    <Select name="city" label="City" options={["Davao City", "Tagum City"]} required />
    <RadioGroup name="submitBy" label="How will you submit?">   {/* name goes on the group */}
        <Radio value="online" label="Online" />
        <Radio value="walk-in" label="Walk-in" />
    </RadioGroup>
    <Checkbox name="agree" label="I agree to the terms" required />
    <Button type="submit">Submit</Button>
</form>
```

**While the user types, with state:**

| Component | Value | Example |
|---|---|---|
| `Input`, `Textarea`, `Select` | `value` + `onChange` | `onChange={e => setName(e.target.value)}` |
| `Checkbox`, `Switch` | `checked` + `onChange` | `onChange={e => setOn(e.target.checked)}` |
| `RadioGroup`, `Tabs` | `value` + `onValueChange` | `onValueChange={setChoice}` |
| `DateInput` | `value` + `onValueChange` (a `Date`) | `onValueChange={date => setDate(date)}` |
| `FileUpload` | `files` + `onFilesChange` (a `File[]`) | `onFilesChange={setFiles}` |

`FileUpload` with a `name` also sends its files with the form, like a normal file field.

Show errors with the `error` prop, for example `<Input error="Enter a valid email address" />`.
The form components also accept a `ref`, so form libraries like react-hook-form work with them.

## Passwords, prefixes and buttons in fields

`Input` has `prefix` and `suffix` for fixed text in the field: `<Input prefix="https://" suffix=".gov.ph" />`,
and `rightSection` for a button inside the field.

`PasswordInput` has an eye button to show or hide the password, or control it yourself with `visible` and `onVisibleChange`.
It warns when Caps Lock is on, hides the password again when the form is sent, and turns off spell-check (online
spell-checkers can send what's typed to a server). Use `autoComplete="new-password"` on sign-up forms.

For Philippine numbers and addresses, see [Philippine fields](philippine-fields.md).
