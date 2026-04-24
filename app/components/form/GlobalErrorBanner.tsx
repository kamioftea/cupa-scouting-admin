import type { $ZodIssue} from "zod/v4/core";
import type { FetcherWithComponents } from "react-router";

type GlobalErrorBannerProps = {
    fetcher: FetcherWithComponents<{ errors: $ZodIssue[] }>;
};

export default function GlobalErrorBanner({fetcher}: GlobalErrorBannerProps) {
    const globalErrors = fetcher.data?.errors?.filter(e => e.path.length === 0);

    if (!globalErrors || globalErrors.length === 0) {
        return null;
    }

    return <div className="callout alert">
        {globalErrors.map((error, idx) => (
            <p key={idx}>{error.message}</p>
        ))}
    </div>;
}
