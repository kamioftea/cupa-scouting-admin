import type {$ZodIssue} from "zod/v4/core";
import {type ReactNode, useState} from "react";
import Input from "~/components/form/Input";
import {FiPlus, FiTrash} from "react-icons/fi";

export interface MultiInputProps {
    name: string;
    id?: string;
    label?: ReactNode;
    defaultValues?: string[];
    defaultFocus?: boolean;
    errors?: $ZodIssue[];
}

function mapDefaults(defaults: string[] | undefined): {key: string, defaultValue: string}[] {
    const atLeastOne = !defaults || defaults.length === 0 ? [''] : defaults;

    return atLeastOne.map(value => ({key: crypto.randomUUID(), defaultValue: value}));
}

export function MultiInput({name, id, label, defaultValues, defaultFocus = false, errors}: MultiInputProps) {
    const [prevValues, setPrevValues] = useState(defaultValues);
    const [values, setValues] = useState(mapDefaults(defaultValues))

    if (defaultValues !== prevValues) {
        setPrevValues(defaultValues);
        setValues(mapDefaults(defaultValues));
    }

    return (
        <fieldset id={id} className={`multi-input ${errors ? 'error' : ''}`}>
            {label && <legend id={`${id}-legend`}>{label}</legend>}
            {values.map(
                ({key, defaultValue}, idx) =>
                <div className='input-group' key={key}>
                    <Input
                        aria-labelledby={`${id}-legend`}
                        className='input-group-field'
                        name={name}
                        defaultValue={defaultValue}
                        defaultFocus={defaultFocus && idx === 0}
                    />
                    <div className='input-group-button'>
                        <button
                            type={"button"}
                            className='button alert'
                            onClick={() => setValues(
                                values.length === 1
                                ? [{key: crypto.randomUUID(), defaultValue: ''}]
                                : values.filter(({key: k}) => k !== key)
                            )}
                        >
                            <FiTrash />
                        </button>
                    </div>
                </div>
            )}
            <button
                type={"button"}
                className='button success tiny'
                onClick={() => setValues([...values, {key: crypto.randomUUID(), defaultValue: ''}])}
            >
                <FiPlus /> Add another
            </button>
        </fieldset>
    );
}
