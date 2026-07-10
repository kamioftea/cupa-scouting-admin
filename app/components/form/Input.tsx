import React, {forwardRef, useEffect, useRef} from "react";
import type {$ZodIssue} from "zod/v4/core";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  defaultFocus?: boolean
  label?: string
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>
  name: string
  errors?: $ZodIssue[]
  hasParentError?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({errors = [], label, labelProps = {}, name, id = name, type = 'text', defaultFocus, hasParentError, ...props}, ref) => {
    const localRef = useRef<HTMLInputElement>(null);
    // Use the passed ref if provided, otherwise fallback to localRef
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || localRef;
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
    
    const input = <>
      <input
        ref={inputRef}
        id={id}
        autoFocus={true}
        name={name}
        type={type}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={hasError || hasParentError ? "is-invalid-input" : undefined}
        {...props}
      />
      {hasError && (
        <span className="form-error is-visible" id={`${id}-error`}>
          {inputErrors!.map(e => e.message).join(', ')}
        </span>
      )}
    </>;
    
    if (hasError) {
      labelProps.className = `${labelProps.className ?? ''} is-invalid-label`.trim();
    }
    
    return (
      label
      ? <label {...labelProps}>
        {label}
        {input}
      </label>
      : input
    );
  }
);

export default Input;
