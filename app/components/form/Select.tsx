import type {$ZodIssue} from "zod/v4/core";
import React, {forwardRef, Fragment, type ReactNode, useEffect, useRef} from "react";
import {displayEnum} from "~/utils/text";

export type SelectProps = {
    id?: string;
    name: string;
    options: {
        label: string;
        value: string;
    }[];
    defaultSelected?: string;
    label?: ReactNode;
    errors?: $ZodIssue[];
    defaultFocus?: boolean;
}

export function optionsFromEnum(values: string[]): SelectProps['options'] {
    return values.map(e => ({label: displayEnum(e), value: e}));
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({name, id = name, options, defaultSelected, label, errors, defaultFocus}, ref) => {
        const localRef = useRef<HTMLSelectElement>(null);
        // Use the passed ref if provided, otherwise fallback to localRef
        const inputRef = (ref as React.RefObject<HTMLSelectElement>) || localRef;
        const inputErrors = errors?.filter(i => i.path[0] === name);
        const hasError = (inputErrors?.length ?? 0) > 0;

        useEffect(
            () => {
                if (errors && (errors.findIndex(i => i.path[0] === name) === 0 || (errors.length === 0 && defaultFocus))) {
                    inputRef.current?.focus();
                }
            },
            [errors]
        );

        return <label>
            {label}
            <select
                name={name}
                id={id}
                ref={inputRef}
                defaultValue={defaultSelected}
                className={hasError ? 'input-error' : undefined}
                aria-describedby={hasError ? `${id}-error` : undefined}
            >
                {options.map(
                    ({label, value}) =>
                        <Fragment key={value}>
                            <option value={value}>{label}</option>
                        </Fragment>
                )}
                {hasError &&
                    <span className="form-error is-visible" id={`${id}-error`}>
                        {inputErrors!.map(e => e.message).join(', ')}
                    </span>
                }
            </select>
        </label>
    })
