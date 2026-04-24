import type { Email } from '~/context/emailClientContext';
import type { User } from "~/model/user.types";

export class ResetPasswordEmail implements Email {
    html: string;
    subject: string;
    to: string[];

    constructor(
        name: User["name"],
        email: User["email"],
        verifyUrl: string,
    ) {
        this.subject = `Password reset requested for Curious Tales.`;

        this.html = `
      <p>Hi ${name}</p>
      <p>
          You are recieving this because someone requested a password reset for your Curious Tales account.
      </p>
      <p>
          If this was you, 
          <a href="${verifyUrl}">use this link to set a new password</a>. 
          If it wasn't, you can ignore this email.
      </p>
      <p>
          Thanks,<br />
          Curious Tales Organisers.
      </p>
    `;

        this.to = [email];
    }
}
