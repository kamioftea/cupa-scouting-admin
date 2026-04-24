import type {$ZodIssue} from "zod/v4/core";
import {Fragment, type ReactNode} from "react";
import {Option} from "@bodil/opt";

export type RadioGroupProps = {
    id?: string;
    name: string;
    options: {
        label: string;
        value: string;
        reveal?: ReactNode
    }[];
    defaultSelected?: string;
    legend?: ReactNode;
    errors?: $ZodIssue[];

}

export default function RadioGroup({name, id = name, options, defaultSelected, legend, errors}: RadioGroupProps) {
    const inputErrors = errors?.filter(i => i.path[0] === name);
    const hasError = (errors?.length ?? 0) > 0;

    return <fieldset className="radio-group">
        {legend && <legend>{legend}</legend>}
        {options.map(
            ({label, value, reveal}) =>
                <Fragment key={value}>
                    <label>
                        <input
                            type="radio"
                            name={name}
                            value={value}
                            defaultChecked={defaultSelected === value}
                        />
                        {label}
                    </label>
                    {reveal
                     ? <div className="reveal">{reveal}</div>
                     : null
                    }
                </Fragment>
        )}
        {hasError && (
            <span className="form-error is-visible" id={`${id}-error`}>
                {inputErrors!.map(e => e.message).join(', ')}
            </span>
        )}
    </fieldset>
}

export type YesNoRadioGroupProps =
    Omit<RadioGroupProps, 'options' | 'defaultSelected'> &
    {
        revealForYes?: ReactNode
        revealForNo?: ReactNode
        defaultSelected: boolean | undefined
    }

export function YesNoRadioGroup({name, id = name, legend, defaultSelected, errors, revealForYes, revealForNo}: YesNoRadioGroupProps)  {
    return <RadioGroup
        id={id}
        name={name}
        legend={legend}
        options={[
            {value: 'yes', label: 'Yes', reveal: revealForYes},
            {value: 'no', label: 'No', reveal: revealForNo},
        ]}
        defaultSelected={
            Option.from(defaultSelected)
                  .map(v => v ? 'yes' : 'no')
                  .unwrap()
        }
        errors={errors}
    />
}
