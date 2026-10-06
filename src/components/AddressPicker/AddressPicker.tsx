import {useEffect, useState, type ReactNode} from "react";
import Button from "../Button/Button";
import {Fieldset, type FieldsetProps} from "../Fieldset/Fieldset";
import {Select} from "../Select/Select";
import type {Size} from "../../utils/size";
import {psgcApi, type AddressDataSource, type AddressPlace} from "./psgc";
import styles from "./AddressPicker.module.css";

/** The chosen places, from the region down. Each has its PSGC `code` (save this) and its `name`. */
export interface AddressValue {
    region?: AddressPlace;
    province?: AddressPlace;
    city?: AddressPlace;
    barangay?: AddressPlace;
}

export interface AddressPickerLabels {
    region: string;
    province: string;
    city: string;
    barangay: string;
    /** The empty choice, once the list is ready. */
    choose: string;
    loading: string;
    /** Shown while the field above hasn't been chosen. */
    waiting: string;
    /** The province field for regions without provinces (Metro Manila). */
    none: string;
    failed: string;
    retry: string;
}

const DEFAULT_LABELS: AddressPickerLabels = {
    region: "Region",
    province: "Province",
    city: "City / Municipality",
    barangay: "Barangay",
    choose: "Choose…",
    loading: "Loading…",
    waiting: "Choose the one above first",
    none: "None in this region",
    failed: "Couldn't load the list. Check your internet connection.",
    retry: "Try again",
};

export interface AddressPickerProps extends Omit<FieldsetProps, "legend" | "onChange" | "defaultValue" | "name"> {
    /** The group's title. Default "Address". */
    legend?: ReactNode;
    /** The chosen address. Pass this with onChange to control it yourself, e.g. to load a saved address. */
    value?: AddressValue;
    /** The address chosen at first, when you don't control `value`. */
    defaultValue?: AddressValue;
    /** Called with the whole address whenever a field changes. Fields below the changed one are cleared. */
    onChange?: (value: AddressValue) => void;
    /** Only places in this region, by its PSGC code, e.g. "110000000" for Davao Region. The region field is then hidden. */
    limitToRegion?: string;
    /** Where the lists come from. Default: the public PSGC API (see psgcApi). */
    source?: AddressDataSource;
    /** Sends the PSGC codes with the form as `{name}.region`, `{name}.province`, `{name}.city` and `{name}.barangay`. */
    name?: string;
    /** Every field must be chosen before the form can be sent. */
    required?: boolean;
    /** The size of the fields: a preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
    /** The texts, e.g. in Filipino: `{ city: "Lungsod / Bayan", choose: "Pumili…" }`. */
    labels?: Partial<AddressPickerLabels>;
}

type List = {status: "idle" | "loading" | "ready" | "error"; items: AddressPlace[]};
const IDLE: List = {status: "idle", items: []};

// One list (e.g. the provinces of the chosen region). `key` says what to load; "" means nothing yet.
function useList(key: string, load: () => Promise<AddressPlace[]>, retry: number): List {
    const [list, setList] = useState<List>(IDLE);
    useEffect(() => {
        if (!key) {
            setList(IDLE);
            return;
        }
        // An answer that arrives after the choice above has changed again is ignored
        let current = true;
        setList({status: "loading", items: []});
        load().then(
            items => current && setList({status: "ready", items}),
            () => current && setList({status: "error", items: []}),
        );
        return () => {
            current = false;
        };
        // `load` is a new function every render; `key` is what decides whether to load again
    }, [key, retry]);
    return list;
}

// Shared by every picker that uses the default source, so each list is only fetched once per page
const defaultSource = psgcApi();

/**
 * A Philippine address: Region → Province → City / Municipality → Barangay, from the official PSGC list.
 * Each list loads when the field above is chosen. Gives you PSGC codes and names.
 */
export function AddressPicker({
    legend = "Address",
    value,
    defaultValue,
    onChange,
    limitToRegion,
    source = defaultSource,
    name,
    required = false,
    size,
    labels,
    variant = "plain",
    ...rest
}: AddressPickerProps) {
    const label = {...DEFAULT_LABELS, ...labels};
    const [internal, setInternal] = useState<AddressValue>(defaultValue ?? {});
    const [retry, setRetry] = useState(0);
    const address = value ?? internal;

    const regionCode = limitToRegion ?? address.region?.code ?? "";
    const provinceCode = address.province?.code ?? "";
    const cityCode = address.city?.code ?? "";

    const regions = useList("regions", () => source.regions(), retry);
    const provinces = useList(regionCode && `provinces:${regionCode}`, () => source.provinces(regionCode), retry);
    // Metro Manila has no provinces: its cities come straight from the region
    const noProvinces = provinces.status === "ready" && provinces.items.length === 0;
    const citiesKey = noProvinces ? `cities:region:${regionCode}` : provinceCode && `cities:province:${provinceCode}`;
    const cities = useList(citiesKey, () => source.cities({regionCode, provinceCode: noProvinces ? undefined : provinceCode}), retry);
    const barangays = useList(cityCode && `barangays:${cityCode}`, () => source.barangays(cityCode), retry);

    function update(next: AddressValue) {
        if (value === undefined) setInternal(next);
        onChange?.(next);
    }

    const find = (list: List, code: string) => list.items.find(item => item.code === code);
    const lockedRegion = limitToRegion ? (find(regions, limitToRegion) ?? {code: limitToRegion, name: ""}) : undefined;

    // One field: shows "Loading…" or "Choose the one above first" until its list is ready
    function field(key: keyof AddressValue, list: List, parentChosen: boolean, onPick: (place: AddressPlace | undefined) => void, notApplicable = false) {
        const ready = list.status === "ready" && !notApplicable;
        const placeholder = notApplicable ? label.none : list.status === "loading" ? label.loading : parentChosen ? label.choose : label.waiting;
        return (
            <Select
                label={label[key]}
                name={name ? `${name}.${key}` : undefined}
                size={size}
                required={required && !notApplicable}
                disabled={!ready}
                placeholder={placeholder}
                value={ready ? (address[key]?.code ?? "") : ""}
                options={list.items.map(item => ({value: item.code, label: item.name}))}
                onChange={event => onPick(find(list, event.target.value))}
            />
        );
    }

    const failed = [regions, provinces, cities, barangays].some(list => list.status === "error");
    const loading = [regions, provinces, cities, barangays].some(list => list.status === "loading");

    return (
        <Fieldset legend={legend} variant={variant} aria-busy={loading || undefined} {...rest}>
            <div className={styles.grid}>
                {limitToRegion
                    ? name && <input type="hidden" name={`${name}.region`} value={limitToRegion} />
                    : field("region", regions, true, region => update({region}))}
                {field("province", provinces, Boolean(regionCode), province => update({region: lockedRegion ?? address.region, province}), noProvinces)}
                {field("city", cities, Boolean(noProvinces || provinceCode), city =>
                    update({region: lockedRegion ?? address.region, province: address.province, city}),
                )}
                {field("barangay", barangays, Boolean(cityCode), barangay => update({...address, region: lockedRegion ?? address.region, barangay}))}
            </div>
            {failed && (
                <div className={styles.failed} role="alert">
                    <span>{label.failed}</span>
                    <Button size="sm" variant="outline" onClick={() => setRetry(count => count + 1)}>
                        {label.retry}
                    </Button>
                </div>
            )}
        </Fieldset>
    );
}
