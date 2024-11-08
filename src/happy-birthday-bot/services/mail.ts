import sgMail from "@sendgrid/mail";

export class MailService {
  private email: string;

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    // this.email = email;

    // if (process.env.NODE_ENV !== "production") {
    // this.email = "wagner.mattei@gmail.com";
    this.email = "pr.miltonmattei@gmail.com";
    // this.phoneNumber = "+5545999598308";
    // }
  }

  public async send(attachments: Buffer[]) {
    console.info(`Sending message to ${this.email}`);

    try {
      await sgMail.send({
        to: this.email,
        cc: "wagner.mattei@gmail.com",
        from: {
          email: "wagner.mattei@gmail.com",
          name: "AniversarioBot",
        },
        subject: "Aniversário do Dia 🎉",
        text: "Segue a imagem de aniversário do dia 🎉",
        attachments: attachments.map((at) => {
          const base64 = at.toString("base64");
          return {
            content: base64,
            filename: "aniversario.png",
            type: "image/png",
            disposition: "attachment",
          };
        }),
      });
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }
}
