import type { Email } from '~/context/emailClientContext';
import type { User } from "~/model/user.types";

export class NotifyPasswordChange implements Email {
    html: string;
    subject: string;
    to: string[];

    constructor(
        name: User["name"],
        email: User["email"]
    ) {
        this.subject = `Password updated for CuPa Scouting.`;

        this.html = `
      <p>Hi ${name}</p>
      <p>
          You are receiving this because your CuPa Scouting account password has been changed.
      </p>
      <p>
          If this was you, please ignore this email.
      </p>
      <p>
            If you did not request this change, please contact 
            <a href="mailto:admin@curious-tales.org.uk">admin@curious-tales.org.uk</a>.
      </p>
      <p>
          Thanks,<br />
          CuPa Scouting.
      </p>
    `;

        this.to = [email];
    }
}
