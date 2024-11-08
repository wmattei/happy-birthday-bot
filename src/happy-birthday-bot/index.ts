import { EventBridgeHandler } from "aws-lambda";
import { DbService } from "./services/db";
import { ImageService } from "./services/image";
import { WhatsappService } from "./services/whatsapp";

export const handler = async (event: any, context: any): Promise<void> => {
  // require("dotenv").config();

  console.info("Starting Happy Birthday Bot");
  // return;

  // const imageService = new ImageService();
  // imageService.setName("Thalia");
  // await imageService.build();
  // await imageService.upload();
  // return

  try {
    const dbServices = new DbService();
    await dbServices.load();
    const numbers = dbServices.getTodaysNumbers();

    console.info("Numbers to congratulate: ", numbers);

    for (const { name, number } of numbers) {
      try {
        const firstName = name.split(" ")[0];

        const imageService = new ImageService();
        imageService.setName(firstName);
        await imageService.build();
        await imageService.upload();

        const wp = new WhatsappService(
          `${number?.toString().includes("+") ? number : `+595${number}`}`
        );

        await wp.send(
          `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${firstName}.png`
        );

        console.info("Message sent to: ", name);
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    }

    console.info("Happy Birthday Bot finished");
  } catch (error) {
    console.info(error);
  }
};

handler(null as any, null as any);
