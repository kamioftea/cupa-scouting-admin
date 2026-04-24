import type {Email, EmailClient} from "~/context/emailClientContext";

export class CloudflareEmailClient implements EmailClient {
    private readonly client: SendEmail;
    private readonly fromAddress: string;

    constructor(env: Env) {
        this.client = env.SEND_EMAIL;
        this.fromAddress = env.ADMIN_EMAIL;
    }

    async sendEmail(email: Email): Promise<void> {
        await this.client.send(
            {
                from: this.fromAddress,
                to: email.to ?? this.fromAddress,
                cc: email.cc,
                bcc: email.bcc,
                subject: email.subject,
                text: email.text,
                html: email.html,
            }
        );
    }
}
