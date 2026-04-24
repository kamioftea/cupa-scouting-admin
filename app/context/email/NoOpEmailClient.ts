import type {Email, EmailClient} from "~/context/emailClientContext";

export class NoOpEmailClient implements EmailClient {
    async sendEmail(email: Email): Promise<void> {
        console.log('NoOp email sender received email:', email);
    }
}
