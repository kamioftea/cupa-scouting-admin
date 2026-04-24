import type {$ZodIssue} from "zod/v4/core";
import {type ChangeEvent, Fragment, type ReactNode, useCallback} from "react";

type ValueOption = { label: string; value: string, exclusive?: boolean, reveal?: ReactNode }
type SeparatorOption = { separator: string }

export type CheckboxOption = ValueOption | SeparatorOption

export type CheckboxGroupProps = {
    id?: string;
    name: string;
    legend?: string;
    hint?: string;
    options: CheckboxOption[];
    defaultSelected: string[];
    errors?: $ZodIssue[];
}

function isValueOption(option: CheckboxOption): option is ValueOption {
    return !('separator' in option);
}

export default function CheckboxGroup({name, id = name,legend, hint, options, defaultSelected, errors}: CheckboxGroupProps) {
    const inputErrors = errors?.filter(i => i.path[0] === name);
    const hasError = (errors?.length ?? 0) > 0;

    // Enforce invariant that if an exclusive checkbox is selected, no other checkboxes are.
    const handleChange = useCallback(
        ({target, currentTarget: fieldset}: ChangeEvent<HTMLFieldSetElement>)=> {
            if (!(target instanceof HTMLInputElement)
                || target.type !== "checkbox"
                || !target.checked
            ) {
                return;
            }

            const checkboxes = Array.from(
                fieldset.querySelectorAll<HTMLInputElement>(`input[type="checkbox"][name="${CSS.escape(name)}"]`)
            );
            const targetIsExclusive = target.dataset.exclusive === 'true'

            for (const checkbox of checkboxes) {
                if (checkbox !== target && (targetIsExclusive || checkbox.dataset.exclusive === 'true')) {
                    checkbox.checked = false;
                }
            }
        },
        []
    );

    return <fieldset className="checkbox-group" onChange={handleChange}>
        {legend && <legend>{legend}</legend>}
        {hint && <p className="hint">{hint}</p>}
        {options.map(
            (option, idx) =>
                isValueOption(option)
                ? <Fragment key={option.value}>
                    <label>
                        <input
                            type="checkbox"
                            name={name}
                            value={option.value}
                            defaultChecked={defaultSelected.includes(option.value)}
                            {...(option.exclusive ? {'data-exclusive': 'true'} : {})}
                        />
                        {option.label}
                    </label>
                    {option.reveal
                     ? <div className="reveal">{option.reveal}</div>
                     : null
                    }
                </Fragment>
                : <span key={idx} className="separator">{option.separator}</span>
        )}
        {hasError && (
            <span className="form-error is-visible" id={`${id}-error`}>
                {inputErrors!.map(e => e.message).join(', ')}
            </span>
        )}
    </fieldset>
}
