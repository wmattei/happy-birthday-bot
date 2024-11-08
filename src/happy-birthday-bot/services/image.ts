import { Jimp, JimpInstance, loadFont } from "jimp";
import { createCanvas, registerFont } from "canvas";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

import path from "path";

export class ImageService {
  private name: string;
  private baseImage: JimpInstance;
  constructor() {
    if (process.env.NODE_ENV !== "production") {
      this.name = "Milton";
    }

    this.baseImage = new Jimp({ height: 1599, width: 1039 });
    this.baseImage.background = 0x000000;

    registerFont(path.resolve(__dirname, "../../assets/gagalin.otf"), {
      family: "Gagalin",
    });
  }

  public setName(name: string) {
    this.name = name;
    return this;
  }

  public async build() {
    const assetsPath =
      process.env.NODE_ENV === "production" ? "assets" : "../../assets";
    console.log("Adding text to image...");
    const background = await Jimp.read(
      path.resolve(__dirname, `${assetsPath}/background.jpg`)
    );

    const logoCibb = await Jimp.read(
      path.resolve(__dirname, `${assetsPath}/logo-cibb.png`)
    );
    logoCibb.resize({ w: 350 });

    const logo50 = await Jimp.read(
      path.resolve(__dirname, `${assetsPath}/logo_50.png`)
    );
    logo50.resize({ w: 400 });

    this.baseImage.composite(background, 0, 0);
    this.baseImage.composite(
      logoCibb,
      this.baseImage.width - logoCibb.width - 25,
      100
    );
    this.baseImage.composite(
      logo50,
      25,
      this.baseImage.height - logo50.height - 25
    );

    const textImg = await this.generateMainTextImage(
      `${this.name}!! Hoy es tu cumpleaños; La Iglesia Bautista Betel juntamente con su pastor te felicitan en este dia. Eres muy precioso para Dios y amado por nosotros`
    );
    const textJimp = await Jimp.read(textImg);

    const bibleVerseImg = await this.generateBibleVerseTextImage(
      `            **Números 6:24** Dice:\n**"El Señor te bendiga y te guarde.**"`
    );
    const bibleVerseJimp = await Jimp.read(bibleVerseImg);

    const happyBirthdayImg = await this.generateHappyBirthdayImage(
      `Felicidades!`
    );
    const happyBirthdayJimp = await Jimp.read(happyBirthdayImg);

    this.baseImage.composite(
      textJimp,
      this.baseImage.width / 2 - textJimp.width / 2,
      this.baseImage.height * 0.24
    );
    this.baseImage.composite(
      bibleVerseJimp,
      0,
      textJimp.height + this.baseImage.height * 0.24
    );
    this.baseImage.composite(
      happyBirthdayJimp,
      0,
      textJimp.height + this.baseImage.height * 0.25 + bibleVerseJimp.height
    );

    return this;
  }

  async upload() {
    // if (process.env.NODE_ENV !== "production") {
    //   console.log("Uploading image...");

    //   this.baseImage.write(`./uploads/${this.name}.png`);
    //   return;
    // }

    try {
      const s3Client = new S3Client({});
      const buffer = await this.baseImage.getBuffer("image/png");

      const uploadParams: PutObjectCommandInput = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${this.name}.png`,
        Body: buffer,
        ContentType: "image/png",
        // ACL: "public-read",
      };

      const data = await s3Client.send(new PutObjectCommand(uploadParams));
      console.log("File uploaded successfully", data);
    } catch (err) {
      console.error("Error uploading file:", err);
    }

    // Upload to S3

    return this;
  }

  private async generateMainTextImage(text: string) {
    let tempCanvas = createCanvas(this.baseImage.width, 2000);
    const ctx = tempCanvas.getContext("2d");

    ctx.font = '62px "Gagalin"';
    ctx.fillStyle = "#000";
    const height = wrapAndCenterText(
      ctx,
      text,
      tempCanvas.width * 0.9,
      tempCanvas.width / 2,
      100,
      100
    );

    const finalCanvas = createCanvas(this.baseImage.width, height);
    const finalCtx = finalCanvas.getContext("2d");

    // Copy the content from the temp canvas to the final canvas
    finalCtx.drawImage(
      tempCanvas,
      0,
      0,
      this.baseImage.width,
      height,
      0,
      0,
      this.baseImage.width,
      height
    );

    const buffer = finalCanvas.toBuffer("image/png");
    return buffer;
  }

  private async generateBibleVerseTextImage(text: string) {
    let tempCanvas = createCanvas(this.baseImage.width, 2000);

    const ctx = tempCanvas.getContext("2d");

    ctx.font = '32px "Gagalin"';
    ctx.fillStyle = "#000";

    const height = wrapAndCenterText(
      ctx,
      text,
      tempCanvas.width,
      tempCanvas.width * 0.7,
      100,
      100
    );

    const finalCanvas = createCanvas(this.baseImage.width, height + 100);
    const finalCtx = finalCanvas.getContext("2d");

    // Copy the content from the temp canvas to the final canvas
    finalCtx.drawImage(
      tempCanvas,
      0,
      0,
      this.baseImage.width,
      height + 100,
      0,
      0,
      this.baseImage.width,
      height + 100
    );

    const buffer = finalCanvas.toBuffer("image/png");
    return buffer;
  }

  private async generateHappyBirthdayImage(text: string) {
    let tempCanvas = createCanvas(this.baseImage.width, 2000);

    const ctx = tempCanvas.getContext("2d");

    ctx.font = '110px "Gagalin"';
    ctx.fillStyle = "#000";

    const height = wrapAndCenterText(
      ctx,
      text,
      tempCanvas.width,
      tempCanvas.width * 0.33,
      100,
      100
    );

    const finalCanvas = createCanvas(this.baseImage.width, height + 100);
    const finalCtx = finalCanvas.getContext("2d");

    // Copy the content from the temp canvas to the final canvas
    finalCtx.drawImage(
      tempCanvas,
      0,
      0,
      this.baseImage.width,
      height + 100,
      0,
      0,
      this.baseImage.width,
      height + 100
    );

    const buffer = finalCanvas.toBuffer("image/png");
    return buffer;
  }
}

function wrapAndCenterText(
  ctx: any,
  text: string,
  maxWidth: number,
  x: number,
  y: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  const lines = [];

  // Break the text into lines based on maxWidth
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line); // Push the last line

  // Center each line horizontally and draw the text
  lines.forEach((line, index) => {
    const textWidth = ctx.measureText(line).width;
    const textX = x - textWidth / 2; // Adjust x to center the line
    ctx.fillText(line, textX, y + index * lineHeight);
  });

  return lines.length * lineHeight;
}
