import type { Email } from '~/context/emailClientContext';
import type { User } from "~/model/user.types";

export class ConfirmChangeEmail implements Email {
    html: string;
    subject: string;
    to: string[];

    constructor(
        name: User["name"],
        email: User["email"],
        verifyUrl: string,
    ) {
        this.subject = `Confirm new email for Curious Tales.`;

        this.html = `
      <p>Hi ${name}</p>
      <p>
          You are recieving this because someone has updated their Curious Tales account to this email address.
      </p>
      <p>
          If this was you, please 
          <a href="${verifyUrl}">verify your email by following this link</a>. 
          If it wasn't, you can ignore this email.
      </p>
      <p>
          Thanks, and welcome,<br />
          Curious Tales Organisers.
      </p>
    `;

        this.to = [email];
    }
}
