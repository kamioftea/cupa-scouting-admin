export function partitionBy<K extends string | number, V>(keyFn: (v: V) => K, arr: V[]): Record<K, V[]> {
    return arr.reduce<Record<K, V[]>>(
        (acc, item) => {
            const key = keyFn(item);
            const group = acc[key] ?? [];
            return {...acc, [key]: [...group, item]};
        },
        {} as Record<K, V[]>
    );
}

export function recordEntries<T extends Record<string, unknown>>(record: T) {
    return Object.entries(record) as { [K in keyof T]: [K, T[K]] }[keyof T][];
}
