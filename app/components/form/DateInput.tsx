import type {$ZodIssue} from "zod/v4/core";
import Input from "~/components/form/Input";
import dayjs, {Dayjs} from "dayjs";
import "./date-input.scss"
import {z} from "zod";
import React from "react";

export interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  defaultFocus?: boolean;
  label?: string,
  name: string,
  errors?: $ZodIssue[]
}

export default function DateInput({defaultFocus, label, name, id = name, errors, defaultValue}: DateInputProps) {
  const date = typeof defaultValue === 'string' ? dayjs(defaultValue) : undefined;
  
  const fieldsetErrors =
    errors?.filter(i => i.path[0] === name && i.path.length === 1) ?? [];
  
  const hasErrors = errors?.find(i =>
                                   i.path[0] === name ||
                                   i.path[0]?.toString()?.startsWith(`${name}-`)
  ) !== undefined;
  
  return (
    <div className={`fieldset-wrapper${(hasErrors ? ' is-invalid-fieldset' : '')}`}>
      <fieldset
        className={`date-input`}
        aria-invalid={hasErrors || undefined}
        aria-describedby={fieldsetErrors.length > 0 ? `${id}-error` : undefined}
      >
        <legend>{label}</legend>
        {fieldsetErrors.length > 0
         ? <span className="form-error is-visible" id={`${id}-error`}>
             {fieldsetErrors!.map(e => e.message).join(', ')}
           </span>
          : null
        }
        <Input
          name={`${name}-day`}
          labelProps={{className: 'day'}}
          label={'Day'}
          defaultValue={date?.format('D')}
          hasParentError={fieldsetErrors.length > 0}
          {...{errors}}
        />
        <Input
          name={`${name}-month`}
          labelProps={{className: 'month'}}
          label={'Month'}
          defaultValue={date?.format('M')}
          hasParentError={fieldsetErrors.length > 0}
          {...{errors}}
        />
        <Input
          name={`${name}-year`}
          labelProps={{className: 'year'}}
          label={'Year'}
          defaultValue={date?.format('YYYY')}
          hasParentError={fieldsetErrors.length > 0}
          {...{defaultFocus, errors}}
        />
      </fieldset>
    </div>
  );
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

type DateInputValidatorOptions = {
  minDate?: Dayjs | boolean,
  maxDate?: Dayjs | boolean,
}

export function dateInputValidator<
  Data extends Record<string, unknown>,
  const Name extends string
>(name: Name, options: DateInputValidatorOptions = {}): DateInputValidator<Name, Data> {
  return {
    fieldValidators: {
      [`${name}-year`]: z.string().trim().min(1, "Enter a year"),
      [`${name}-month`]: z.string().trim().min(1, "Enter a month"),
      [`${name}-day`]: z.string().trim().min(1, "Enter a day"),
    } as FieldValidators<Name>,
    refine: function (data: FormDataWithDate<Name, Data>, ctx: z.RefinementCtx) {
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
      
      if (options.minDate) {
        const minDate =
          options.minDate === true
          ? dayjs().endOf("day")
          : options.minDate;
          
        if (minDate.isAfter(candidate)) {
          let message =
            `Enter a date ${
            options.minDate === true
            ? 'in the future'
            : `after ${minDate.format('YYYY-MM-DD')}`
          }`;
          
          ctx.addIssue({code: "custom", path: [name], message});
        }
      }
      
      if (options.maxDate) {
        const maxDate =
          options.maxDate === true
          ? dayjs().startOf("day")
          : options.maxDate;
        
        if (maxDate.isBefore(candidate)) {
          let message =
            `Enter a date ${
            options.minDate === true
            ? 'in the future'
            : `before ${maxDate.format('YYYY-MM-DD')}`
          }`;
          
          ctx.addIssue({code: "custom", path: [name], message});
        }
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
