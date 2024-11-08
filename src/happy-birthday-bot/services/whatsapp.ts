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

    // if (process.env.NODE_ENV !== "production") {
    this.phoneNumber = "+595971835923";
    // this.phoneNumber = "+5545999598308";
    // }
  }

  public async send(mediaUrl: string) {
    console.info(`Sending message to ${this.phoneNumber}`);
    this.client.messages
      .create({
        from: "+15202143324",
        mediaUrl: [mediaUrl],
        to: `${this.phoneNumber}`,
      })
      .then((message) => console.log(`Message sent: ${message.sid}`));
  }
}
