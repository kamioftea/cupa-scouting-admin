import type {ReactNode} from "react";

export type ListOrNoneProps = {
    values?: string[]
}

export default function ListOrNone({values}: ListOrNoneProps): ReactNode {
    const normalised = (values ?? []).filter(v => v.trim() !== '');

    return <>{
        normalised.length > 0
           ? normalised.join(', ')
           : <em>None</em>
    }</>
}
