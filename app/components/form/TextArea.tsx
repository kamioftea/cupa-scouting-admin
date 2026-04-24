import React, {forwardRef, useEffect, useRef} from "react";
import type {$ZodIssue} from "zod/v4/core";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    defaultFocus?: boolean;
    label?: string,
    name: string,
    errors?: $ZodIssue[]
}


export default forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({errors = [], label, name, id = name, defaultFocus, ...props}, ref) => {
        const localRef = useRef<HTMLInputElement>(null);
        // Use the passed ref if provided, otherwise fallback to localRef
        const inputRef = (ref as React.RefObject<HTMLTextAreaElement>) || localRef;
        const inputErrors = errors?.filter(i => i.path[0] === name);
        const hasError = (inputErrors?.length ?? 0) > 0;

        useEffect(
            () => {
                if (errors.findIndex(i => i.path[0] === name) === 0 || (errors.length === 0 && defaultFocus)) {
                    inputRef.current?.focus();
                }
            },
            [errors]
        );

        return (
            <label className={hasError ? "is-invalid-label" : undefined}>
                {label}
                <textarea
                    ref={inputRef}
                    id={id}
                    autoFocus={true}
                    name={name}
                    aria-invalid={hasError ? true : undefined}
                    aria-describedby={hasError ? `${id}-error` : undefined}
                    className={hasError ? "is-invalid-input" : undefined}
                    {...props}
                />
                {hasError && (
                    <span className="form-error is-visible" id={`${id}-error`}>
                        {inputErrors!.map(e => e.message).join(', ')}
                    </span>
                )}
            </label>
        );
    }
);
