import type {MetaDescriptor} from "react-router";

function extractTitle(meta: MetaDescriptor[]): string[] {
    for (const descriptor of meta) {
        if(descriptor.hasOwnProperty('title')) {
            return [(descriptor as unknown as {title: string}).title]
        }
    }

    return [];
}

type MetaArgs = {matches: ({meta: MetaDescriptor[] | undefined} | undefined)[]};

export const appendToParentTitle = (title: string, args: MetaArgs): MetaDescriptor => {
    const parentMeta = args.matches[args.matches.length-2]?.meta ?? [];
    const parentTitle = extractTitle(parentMeta);

    return {title: [title, ...parentTitle].join(' | ')};
}
