import {
    forwardRef,
    useEffect,
    useId,
    useRef,
    useState,
    type DragEvent,
    type InputHTMLAttributes,
    type ReactNode,
} from "react";
import {cx} from "../../utils/cx";
import styles from "./FileUpload.module.css";

export interface FileUploadProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "size" | "children"> {
    /** Text above the drop area, e.g. "Valid ID". */
    label?: ReactNode;
    /** Helper text under the label, e.g. "PDF or JPG, up to 5 MB". */
    description?: ReactNode;
    /** Error message below. It also turns the border red and tells screen readers. `true` for just the red border. */
    error?: ReactNode;
    /** The largest file allowed, in bytes, e.g. `5 * 1024 * 1024` for 5 MB. */
    maxSize?: number;
    /** The most files allowed (with `multiple`). */
    maxFiles?: number;
    /** The chosen files. Pass this with onFilesChange to control the list yourself. */
    files?: File[];
    /** Called with the full list whenever a file is added or removed. */
    onFilesChange?: (files: File[]) => void;
    /** The text in the drop area. Default "Choose a file or drag it here" ("files… them" with `multiple`). */
    dropText?: ReactNode;
    /** What screen readers call each remove button, before the file name. Default "Remove". */
    removeLabel?: string;
}

// 5242880 -> "5 MB"
export function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Number((bytes / (1024 * 1024)).toFixed(1))} MB`;
}

// Does a file match an `accept` list like ".pdf,image/*,application/msword"?
function isAccepted(file: File, accept: string) {
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return accept
        .split(",")
        .map(rule => rule.trim().toLowerCase())
        .some(rule =>
            rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule,
        );
}

const isSameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

/**
 * Lets people add files by choosing them or dragging them onto the box, then shows the list with
 * remove buttons. Files that are too big or the wrong type are turned away with a message.
 * With a `name`, the files are sent with the form like a normal file field.
 */
export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload(
    {
        label,
        description,
        error,
        maxSize,
        maxFiles,
        files: filesProp,
        onFilesChange,
        dropText,
        removeLabel = "Remove",
        accept,
        multiple = false,
        required,
        disabled,
        id,
        className,
        style,
        "aria-describedby": describedBy,
        ...rest
    },
    ref,
) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const labelId = label ? `${inputId}-label` : undefined;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorMessage = typeof error === "boolean" ? null : error;
    const errorId = errorMessage ? `${inputId}-error` : undefined;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const [internalFiles, setInternalFiles] = useState<File[]>([]);
    const [problems, setProblems] = useState<string[]>([]);
    const [dragging, setDragging] = useState(false);
    const files = filesProp ?? internalFiles;

    function setFiles(next: File[]) {
        if (filesProp === undefined) setInternalFiles(next);
        onFilesChange?.(next);
    }

    // Keep the real <input> holding the whole list (and only accepted files), so forms (FormData,
    // `required`) see exactly what's shown
    function syncInput(list: File[]) {
        const input = inputRef.current;
        if (!input || typeof DataTransfer === "undefined") return;
        try {
            const transfer = new DataTransfer();
            list.forEach(file => transfer.items.add(file));
            input.files = transfer.files;
        } catch {
            // Very old browsers can't set files; the list on screen still works
        }
    }

    useEffect(() => syncInput(files), [files]);

    function addFiles(added: FileList | null) {
        if (!added || disabled) return;
        const accepted: File[] = [];
        const turnedAway: string[] = [];

        for (const file of Array.from(added)) {
            if (accept && !isAccepted(file, accept)) turnedAway.push(`${file.name} isn't an allowed type of file.`);
            else if (maxSize !== undefined && file.size > maxSize) turnedAway.push(`${file.name} is larger than ${formatFileSize(maxSize)}.`);
            else if (!files.some(existing => isSameFile(existing, file))) accepted.push(file);
        }

        // One file: a new choice replaces the old one. Several: they're added to the list.
        let next = multiple ? [...files, ...accepted] : accepted.length > 0 ? accepted.slice(0, 1) : files;
        if (maxFiles !== undefined && next.length > maxFiles) {
            turnedAway.push(`You can add up to ${maxFiles} ${maxFiles === 1 ? "file" : "files"}.`);
            next = next.slice(0, maxFiles);
        }

        setProblems(turnedAway);
        if (next !== files) setFiles(next);
        else syncInput(files); // nothing new: undo the picker's choice of turned-away files
    }

    function removeFile(file: File) {
        setProblems([]);
        setFiles(files.filter(item => item !== file));
        // The button is gone, so put focus back on the drop area
        inputRef.current?.focus();
    }

    function onDragOver(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault(); // allows dropping here
        if (!disabled) setDragging(true);
    }

    function onDrop(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault(); // stops the browser from opening the file
        setDragging(false);
        addFiles(event.dataTransfer.files);
    }

    const invalid = Boolean(error);

    return (
        <div className={cx(styles.root, className)} style={style}>
            {label && (
                <span id={labelId} className={styles.label}>
                    {label}
                    {required && <span className={styles.required} aria-hidden="true"> *</span>}
                </span>
            )}
            {description && <p id={descriptionId} className={styles.description}>{description}</p>}

            {/* A <label> for the hidden input: clicking anywhere in it opens the file picker */}
            <label
                htmlFor={inputId}
                className={styles.dropzone}
                data-dragging={dragging || undefined}
                data-invalid={invalid || undefined}
                data-disabled={disabled || undefined}
                onDragOver={onDragOver}
                onDragLeave={event => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
                }}
                onDrop={onDrop}>
                <svg className={styles.uploadIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 15V3m0 0L7 8m5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
                </svg>
                <span>
                    {dropText ?? (
                        <>
                            <span className={styles.browse}>{multiple ? "Choose files" : "Choose a file"}</span>
                            {multiple ? " or drag them here" : " or drag it here"}
                        </>
                    )}
                </span>
                <input
                    ref={node => {
                        inputRef.current = node;
                        if (typeof ref === "function") ref(node);
                        else if (ref) ref.current = node;
                    }}
                    id={inputId}
                    type="file"
                    className={styles.input}
                    accept={accept}
                    multiple={multiple}
                    required={required}
                    disabled={disabled}
                    aria-labelledby={labelId}
                    aria-invalid={invalid || undefined}
                    aria-describedby={cx(descriptionId, errorId, describedBy) || undefined}
                    onChange={event => addFiles(event.target.files)}
                    {...rest}
                />
            </label>

            {problems.length > 0 && (
                <ul className={styles.problems} role="alert">
                    {problems.map(problem => <li key={problem}>{problem}</li>)}
                </ul>
            )}
            {errorMessage && <p id={errorId} className={styles.error}>{errorMessage}</p>}

            {files.length > 0 && (
                <ul className={styles.files} aria-label="Chosen files">
                    {files.map(file => (
                        <li key={`${file.name}-${file.size}-${file.lastModified}`} className={styles.file}>
                            <svg className={styles.fileIcon} viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6" />
                            </svg>
                            <span className={styles.fileName}>{file.name}</span>
                            <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                            <button
                                type="button"
                                className={styles.remove}
                                aria-label={`${removeLabel} ${file.name}`}
                                disabled={disabled}
                                onClick={() => removeFile(file)}>
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});
