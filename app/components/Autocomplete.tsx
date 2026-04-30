import {useId, useMemo, useState, type KeyboardEventHandler} from "react";
import "./autocomplete.scss";
import type {$ZodIssue} from "zod/v4/core";

export type AutocompleteProps = {
    options: { value: number | string, label: string }[];
    label: string;
    name?: string;
    id?: string;
    placeholder?: string;
    value?: string;
    defaultValue?: string | number;
    required?: boolean;
    disabled?: boolean;
    noResultsText?: string;
    errors: $ZodIssue[];
};

export default function Autocomplete(
    {
        options,
        label,
        name,
        id,
        placeholder = "Search...",
        defaultValue = "",
        required = false,
        disabled = false,
        noResultsText = "No matches",
        errors,
    }: AutocompleteProps) {
    const generatedId = useId();
    const inputId = id ?? `autocomplete-${generatedId}`;
    const listboxId = `${inputId}-listbox`;
    const errorId = `${inputId}-error`;

    const inputErrors = errors?.filter(i => i.path[0] === name);
    const hasError = (inputErrors?.length ?? 0) > 0;

    const [selectedId, setSelectedId] = useState(defaultValue)
    const selectedLabel = useMemo(
        () => options.find(option => option.value === selectedId)?.label ?? "",
        [options, selectedId]
    );

    const [internalLabel, setInternalLabel] = useState(selectedLabel);
    const [prevInternalLabel, setPrevInternalLabel] = useState(internalLabel);

    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    const filteredOptions = useMemo(() => {
        const normalized = internalLabel.trim().toLowerCase();
        if (!normalized) {
            return options;
        }

        return options.filter(
            (option) =>
                option.label.toLocaleLowerCase().includes(normalized)
        );
    }, [options, internalLabel]);

    if (prevInternalLabel !== internalLabel) {
        setPrevInternalLabel(internalLabel);
        setSelectedId(options.find(option => option.label === internalLabel)?.value ?? "");
        setActiveIndex(-1)
    }

    const commitSelection = (selectedValue: string) => {
        setInternalLabel(selectedValue);
        setIsOpen(false);
        setActiveIndex(-1);
    };

    const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (disabled) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                return;
            }

            setActiveIndex((prevIndex) => {
                const nextIndex = prevIndex + 1;
                return nextIndex >= filteredOptions.length ? 0 : nextIndex;
            });
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                return;
            }

            setActiveIndex((prevIndex) => {
                if (prevIndex <= 0) {
                    return filteredOptions.length - 1;
                }
                return prevIndex - 1;
            });
            return;
        }

        if (event.key === "Enter") {
            if (!isOpen || activeIndex < 0 || activeIndex >= filteredOptions.length) {
                return;
            }

            event.preventDefault();
            commitSelection(filteredOptions[activeIndex].label);
            return;
        }

        if (event.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };

    return <label
        className={`autocomplete${hasError ? " is-invalid-label" : ""}`}
        htmlFor={inputId}
    >
        {label}
        <input type={'hidden'} value={selectedId} name={name}/>
        <input
            id={inputId}
            type="text"
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={
                isOpen && activeIndex >= 0
                ? `${inputId}-option-${activeIndex}`
                : undefined
            }
            aria-invalid={hasError ? true : undefined}
            aria-describedby={hasError ? errorId : undefined}
            value={internalLabel}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={hasError ? "is-invalid-input" : undefined}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
                setIsOpen(false);
                setActiveIndex(-1);
                if (!selectedId) {
                    setInternalLabel("");
                }
            }}
            onChange={(event) => {
                setInternalLabel(event.target.value);
                setIsOpen(true);
            }}
            onKeyDown={onKeyDown}
        />
        {hasError && (
            <span className="form-error is-visible" id={`${id}-error`}>
                {inputErrors!.map(e => e.message).join(', ')}
            </span>
        )}
        {isOpen
         ? <ul id={listboxId} role="listbox" className="menu vertical">
             {filteredOptions.length > 0
              ? filteredOptions.map((option, index) => {
                     const isActive = activeIndex === index;
                     return <li key={`${option}-${index}`} className={isActive ? "is-active" : undefined}>
                         <button
                             id={`${inputId}-option-${index}`}
                             type="button"
                             role="option"
                             aria-selected={isActive}
                             // Keep focus on input so blur does not close before selection.
                             onMouseDown={(event) => event.preventDefault()}
                             onClick={() => commitSelection(option.label)}
                         >
                             {option.label}
                         </button>
                     </li>;
                 })
              : <li aria-disabled="true"><span>{noResultsText}</span></li>
             }
         </ul>
         : null}
    </label>;
}
