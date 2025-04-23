import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  unlinkSync,
} from "fs";
export async function POST(request: Request) {
  const formData = await request.formData();
  const files: File[] = [];
  for (const entry of formData.entries()) {
    if (entry[1] instanceof File) {
      files.push(entry[1]);
    }
  }
  console.log(files);

  const projectName = process.env.GOOGLE_CLOUD_PROJECT_NAME;

  const client = new DocumentProcessorServiceClient();

  const expectedFields = ["Enrollment"].concat(
    ...["A", "B", "C", "D", "E", "F", "G", "H"].map((prefix) =>
      Array.from({ length: 14 }, (_, i) => `${prefix}${i + 1}`)
    ),
    ["Total"]
  );

  if (existsSync("temp.csv")) {
    unlinkSync("temp.csv");
  }
  if (!existsSync("temp.csv")) {
    createWriteStream("temp.csv").end();
  }
  const targetCSV = createWriteStream("temp.csv", {
    flags: "w",
  });

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer()).toString("base64");
    const requestPayload = {
      name: file.name,
      rawDocument: {
        content: buffer,
        mimeType: "image/*",
      },
    };

    const [{ document }] = await client.processDocument(requestPayload);

    const rowData = Object.fromEntries(expectedFields.map((f) => [f, "0"]));
    rowData["Enrollment"] = "";
    rowData["Total"] = "";
    for (const entity of document!.entities!) {
      const type = entity.type;
      const value = entity.normalizedValue?.text || entity.mentionText || "0";

      if (type!.toLowerCase().includes("enrollment")) {
        rowData["Enrollment"] = value;
      } else if (type!.toLowerCase() === "total") {
        rowData["Total"] = value;
      } else if (expectedFields.includes(type!)) {
        rowData[type!] = value;
      }
    }

    const csvRow = expectedFields.map((f) => `${rowData[f]}`);
    targetCSV.write(csvRow);
  }

  targetCSV.end();

  const fileStream = createReadStream("temp.csv");
  return new Response(fileStream as any, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=temp.csv",
    },
  });
}
