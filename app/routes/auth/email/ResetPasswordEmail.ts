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
        this.subject = `Password reset requested for CuPa Scouting.`;

        this.html = `
      <p>Hi ${name}</p>
      <p>
          You are receiving this because someone requested a password reset for your CuPa Scouting 
          account.
      </p>
      <p>
          If this was you, 
          <a href="${verifyUrl}">use this link to set a new password</a>. 
          If it wasn't, you can ignore this email.
      </p>
      <p>
          Thanks,<br />
          CCuPa Scouting.
      </p>
    `;

        this.to = [email];
    }
}
