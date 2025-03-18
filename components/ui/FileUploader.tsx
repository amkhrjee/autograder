"use client";
import { ChangeEvent, useContext, useState } from "react";
import { Button } from "./button";
import { FaUpload, FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import { FilesContext } from "@/app/context/FilesContext";
import { SetFilesContext } from "@/app/context/SetFilesContext";
import { Status } from "@/config/definitions";
import sharp from "sharp";

export function FileUploader() {
  const [status, setStatus] = useState<Status>(Status.Uploading);
  const files = useContext(FilesContext);
  const setFiles = useContext(SetFilesContext);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("Button Clicked!");

    if (e.target.files?.length) {
      console.log(e.target.files);
      setFiles!(e.target.files);
      setStatus(Status.Uploaded);
    }
  };

  const compressImage = async (image: ArrayBuffer) => {
    "use server";
    return await sharp(image).jpeg({ quality: 80 }).toBuffer();
  };

  const handleNextStep = async () => {
    "use server";
    console.log("SIZES BEFORE COMPRESSION");
    for (let file in files!) {
      console.log(file);
    }

    const compressedImages = Array.from(files!).map(async (file) =>
      compressImage(await file.arrayBuffer())
    );
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        multiple
        id="file_uploader"
        className="hidden"
        onChange={handleFileChange}
      />
      {status === Status.Uploading && (
        <Button
          onClick={() => document.getElementById("file_uploader")?.click()}
        >
          <FaUpload /> Upload scanned marksheets
        </Button>
      )}
      {status === Status.Uploaded && (
        <>
          <Button>
            Proceed to next step <FaArrowRight />
          </Button>
          <br />
          <Button variant="secondary" onClick={handleNextStep}>
            <FaArrowLeft /> Go back
          </Button>
        </>
      )}
    </>
  );
}
