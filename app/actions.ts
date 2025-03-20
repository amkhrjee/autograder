"use server";

import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getSignedURL() {
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: "archive.zip",
  });

  const signedURL = getSignedUrl(s3, putObjectCommand, {
    expiresIn: 60,
  });

  return {
    success: {
      url: signedURL,
    },
  };
}

export async function checkAvailibility() {
  const headObjectCommand = new HeadObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: "final_output.xlsx",
  });

  try {
    const response = await s3.send(headObjectCommand);
    const lastModified = response.LastModified;

    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - lastModified?.getTime()!;
    const oneMinuteInMs = 5 * 1000;

    if (timeDifference <= oneMinuteInMs) {
      return true;
    }

    return false;
  } catch (err) {
    console.error(err);
  }
}

export async function getDownloadURL() {
  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: "final_output.xlsx",
  });

  const signedUrl = await getSignedUrl(s3, getObjectCommand, {
    expiresIn: 3600,
  });

  return signedUrl;
}
