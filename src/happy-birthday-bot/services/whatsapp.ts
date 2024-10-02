import twilio from "twilio";

export class WhatsappService {
  private client: twilio.Twilio;
  private phoneNumber: string;

  constructor(number: string) {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    this.phoneNumber = number;

    if (process.env.NODE_ENV !== "production") {
      this.phoneNumber = "+554599598308";
    }
  }

  public async send(mediaUrl: string) {
    console.info(`Sending message to ${this.phoneNumber}`);
    this.client.messages
      .create({
        from: "whatsapp:+14155238886",
        mediaUrl: [mediaUrl],
        to: `whatsapp:${this.phoneNumber}`,
      })
      .then((message) => console.log(`Message sent: ${message.sid}`));
  }
}
