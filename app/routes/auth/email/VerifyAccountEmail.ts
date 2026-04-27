import type { Email } from '~/context/emailClientContext';
import type { User } from "~/model/user.types";

export class VerifyAccountEmail implements Email {
    html: string;
    subject: string;
    to: string[];

    constructor(
        name: User["name"],
        email: User["email"],
        verifyUrl: string,
    ) {
        this.subject = `Thank you for signing up for CuPa Scouting.`;

        this.html = `
      <p>Hi ${name}</p>
      <p>
          You are receiving this because someone signed up for a CuPa Scouting account.
      </p>
      <p>
          If this was you, please 
          <a href="${verifyUrl}">verify your email by following this link</a>. 
          If it wasn't, you can ignore this email.
      </p>
      <p>
          Thanks, and welcome,<br />
          CuPa Scouting.
      </p>
    `;

        this.to = [email];
    }
}
