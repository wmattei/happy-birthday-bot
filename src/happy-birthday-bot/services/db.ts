import CsvReadableStream from "csv-reader";
import { createReadStream } from "fs";
import path from "path";

export class DbService {
  private data: any;

  constructor() {}

  public async load() {
    const inputStream = createReadStream(
      path.resolve(
        __dirname,
        process.env.NODE_ENV === "production"
          ? "assets/numbers.csv"
          : "../../assets/numbers.csv"
      ),
      "utf8"
    );

    this.data = await new Promise((res, rej) => {
      let data: any = [];
      inputStream
        .pipe(
          new CsvReadableStream({
            parseNumbers: true,
            parseBooleans: true,
            trim: true,
          })
        )
        .on("data", function (row) {
          data.push(row);
        })
        .on("end", function () {
          res(data);
        })
        .on("error", function (err) {
          rej(err);
        });
    });
  }

  public getTodaysNumbers(): Array<{ name: string; number: string }> {
    const timeZone = "America/Asuncion";
    const today = getCurrentTimeInTimeZoneIntl(timeZone);
    // const today = "15/12";

    return this.data
      .filter((row: any) => row[1] === today)
      .map((row: any) => ({ name: row[0], number: row[2] }));
  }
}

function getCurrentTimeInTimeZoneIntl(timeZone: string) {
  const now = new Date();

  const dayMonth = new Intl.DateTimeFormat("en-US", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
  }).format(now);

  return dayMonth;
}
