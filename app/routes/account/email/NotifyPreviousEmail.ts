import type { Email } from '~/context/emailClientContext';
import type { User } from "~/model/user.types";

export class NotifyPreviousEmail implements Email {
    html: string;
    subject: string;
    to: string[];

    constructor(
        name: User["name"],
        email: User["email"]
    ) {
        this.subject = `Email updated for Curious Tales.`;

        this.html = `
      <p>Hi ${name}</p>
      <p>
          You are recieving this because someone has updated their Curious Tales account no longer use this address.
      </p>
      <p>
          If this was you, you will also have received an email to verify your new address. You will need to follow
          the link in that email to confirm the change.
      </p>
      <p>
            If you did not request this change, please contact 
            <a href="mailto:admin@curious-tales.org.uk">admin@curious-tales.org.uk</a>.
      </p>
      <p>
          Thanks,<br />
          Curious Tales Organisers.
      </p>
    `;

        this.to = [email];
    }
}
