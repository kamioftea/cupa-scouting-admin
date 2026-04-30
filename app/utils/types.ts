export type NonNullProps<T> = {
    [K in keyof T]: Exclude<T[K], null>;
};
