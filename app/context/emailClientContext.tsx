import {createContext} from "react-router";
import {NoOpEmailClient} from "./email/NoOpEmailClient";
import {CloudflareEmailClient} from "~/context/email/CloudflareEmailClient.server";

export type Email = ({
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    html?: string;
    text?: string;
})

export interface EmailClient {
    sendEmail(email: Email): Promise<void>;
}

export type EmailContext = {
    emailClient: EmailClient;
}

export const emailClientContext = createContext<EmailContext>();

export function createEmailContext(env: Env): EmailContext {
    if (env.SEND_EMAIL) {
        return {emailClient: new CloudflareEmailClient(env)};
    }

    return {emailClient: new NoOpEmailClient()};
}

