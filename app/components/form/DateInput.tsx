import type {$ZodIssue} from "zod/v4/core";
import Input from "~/components/form/Input";
import dayjs from "dayjs";
import "./date-input.scss"
import {z} from "zod";

export interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    defaultFocus?: boolean;
    label?: string,
    name: string,
    errors?: $ZodIssue[]
}

export default function DateInput({defaultFocus, label, name, errors, defaultValue}: DateInputProps) {
    const date = typeof defaultValue === 'string' ? dayjs(defaultValue) : undefined;

    return <fieldset className="date-input">
        <legend>{label}</legend>
        <Input name={`${name}-year`} label={'Year'} defaultValue={date?.format('YYYY')} {...{defaultFocus, errors}} />
        <Input name={`${name}-month`} label={'Month'} defaultValue={date?.format('M')} {...{errors}} />
        <Input name={`${name}-day`} label={'Day'} defaultValue={date?.format('D')} {...{errors}} />
    </fieldset>
}

type FormDataWithDate<Name extends string, Data extends Record<string, unknown>> = (Omit<Data, Name> & {
    [K in `${Name}-year` | `${Name}-month` | `${Name}-day`]: string;
});

type FieldValidators<Name extends string> = {
    [K in `${Name}-year` | `${Name}-month` | `${Name}-day`]: z.ZodString;
};

type DateInputValidator<Name extends string, Data extends Record<string, unknown>> = {
    fieldValidators: FieldValidators<Name>,
    refine(data: FormDataWithDate<Name, Data>, ctx: z.RefinementCtx): void;
    transform(data: FormDataWithDate<Name, Data>): Data;
};

export function dateInputValidator<Data extends Record<string, unknown>, const Name extends string>(name: Name): DateInputValidator<Name, Data> {
    return {
        fieldValidators: {
            [`${name}-year`]: z.string().trim().min(1, "Enter a year"),
            [`${name}-month`]: z.string().trim().min(1, "Enter a month"),
            [`${name}-day`]: z.string().trim().min(1, "Enter a day"),
        } as FieldValidators<Name>,
        refine(data: FormDataWithDate<Name, Data>, ctx: z.RefinementCtx) {
            const year = Number(data[`${name}-year`]);
            const month = Number(data[`${name}-month`]);
            const day = Number(data[`${name}-day`]);

            if (!Number.isInteger(year) || year < 1000 || year > 9999) {
                ctx.addIssue(
                    {
                        code: "custom",
                        path: [`${name}-year`],
                        message: "Enter a valid year",
                    }
                );
            }
            if (!Number.isInteger(month) || month < 1 || month > 12) {
                ctx.addIssue(
                    {
                        code: "custom",
                        path: [`${name}-month`],
                        message: "Enter a valid month",
                    }
                );
            }
            if (!Number.isInteger(day) || day < 1 || day > 31) {
                ctx.addIssue(
                    {
                        code: "custom",
                        path: [`${name}-day`],
                        message: "Enter a valid day",
                    }
                );
            }

            if (ctx.issues.length > 0) return;

            const candidate = new Date(Date.UTC(year, month - 1, day));
            const isRealDate =
                candidate.getUTCFullYear() === year &&
                candidate.getUTCMonth() === month - 1 &&
                candidate.getUTCDate() === day;

            if (!isRealDate) {
                ctx.addIssue(
                    {
                        code: "custom",
                        path: [name],
                        message: "Enter a real date",
                    }
                );
                return;
            }

            // "In the future" as strictly after today (UTC, date-only).
            const today = new Date();
            const todayUtc = new Date(
                Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
            );

            if (candidate <= todayUtc) {
                ctx.addIssue(
                    {
                        code: "custom",
                        path: [name],
                        message: "Enter a date in the future",
                    }
                );
            }
        },
        transform(data: FormDataWithDate<Name, Data>) {
            const year = Number(data[`${name}-year`]);
            const month = Number(data[`${name}-month`]);
            const day = Number(data[`${name}-day`]);

            const date = `${String(year)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const transformed = {...data, [name]: date};

            delete transformed[`${name}-year`];
            delete transformed[`${name}-month`];
            delete transformed[`${name}-day`];

            return transformed as Data;
        }
    }
}
