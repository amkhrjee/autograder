"use client";
import { ChangeEvent, useContext, useState } from "react";
import { Button } from "./button";
import { FaUpload, FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import { FilesContext } from "@/app/context/FilesContext";
import { SetFilesContext } from "@/app/context/SetFilesContext";
import { Status } from "@/config/definitions";
import { getSignedURL } from "@/app/actions";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";

export function FileUploader() {
  const [status, setStatus] = useState<Status>(Status.Uploading);
  const files = useContext(FilesContext);
  const setFiles = useContext(SetFilesContext);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      console.log(e.target.files);
      setFiles!(e.target.files);
      setStatus(Status.Uploaded);
    }
  };

  function handleGoBack(): void {
    setStatus(Status.Uploading);
    setFiles!(null);
  }

  function compressFiles(files: FileList) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    return Promise.all(
      Array.from(files).map(async (file) => imageCompression(file, options))
    );
  }

  async function handleNextStep() {
    const compressedImages = await compressFiles(files!);
    const zip = new JSZip();
    compressedImages.forEach((file) => {
      zip.file(file.name, file);
    });
    const zippedBlob = await zip.generateAsync({ type: "blob" });

    const signedURL = await getSignedURL();
    const url = await signedURL.success.url;
    await fetch(url, {
      method: "PUT",
      body: zippedBlob,
      headers: {
        "Content-Type": zippedBlob.type,
      },
    });
  }

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
          className="text-lg"
          onClick={() => document.getElementById("file_uploader")?.click()}
        >
          <FaUpload /> Upload scanned marksheets
        </Button>
      )}
      {status === Status.Uploaded && (
        <>
          <Button className="text-lg" onClick={handleNextStep}>
            Proceed to next step <FaArrowRight />
          </Button>
          <br />
          <Button
            className="text-lg"
            variant="secondary"
            onClick={handleGoBack}
          >
            <FaArrowLeft /> Go back
          </Button>
        </>
      )}
    </>
  );
}
