import {useRouteLoaderData} from "react-router";

function calloutClass(type: "success" | "error" | "info") {
    switch (type) {
        case "success":
            return "success";
        case "error":
            return "alert";
        case "info":
            return "info";
    }
}

export type FlashMessage = {
    message: string,
    type: "success" | "error" | "info",
};

export default function FlashMessageBanner() {
    const { flashMessage } = useRouteLoaderData<{ flashMessage?: FlashMessage }>('root') ?? {};

    if (!flashMessage) {
        return null;
    }

    return <div className={`callout ${calloutClass(flashMessage.type)}`} role={'banner'}>
        {flashMessage.message}
    </div>;
}
