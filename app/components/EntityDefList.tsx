import {Fragment, type ReactNode, useCallback} from "react";

export type FieldRenderers<T> = {
    [K in keyof T]: [
        string,
        (value: T[K]) => ReactNode
    ]
};

function typedEntries<T extends Record<string, unknown>>(obj: T) {
    return Object.entries(obj) as {
        [K in keyof T]-?: [K, T[K]];
    }[keyof T][];
}

type EntityDefListProps<T extends Record<string, unknown>> = {
    renderers: FieldRenderers<T>,
    data: T
}

export default function EntityDefList<T extends Record<string, unknown>>(
    {renderers, data}: EntityDefListProps<T>
)  {
    const renderField =
        useCallback(
            function renderField<K extends keyof T>(fieldName: K, value: T[K]) {
                if (value == null || value === "") return null;

                const [label, renderer] = renderers[fieldName]

                return (
                    <Fragment key={String(fieldName)}>
                        <dt>{label}</dt>
                        <dd>{renderer(value)}</dd>
                    </Fragment>
                );
            },
            [renderers]
        );


    return <dl className={'dl-horizontal'}>
        {typedEntries(renderers).map(
            ([k]) =>
                renderField(k, data[k])
        )}
    </dl>
}

