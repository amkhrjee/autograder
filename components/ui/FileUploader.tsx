"use client";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { Button } from "./button";
import { FaUpload, FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import { FilesContext } from "@/app/context/FilesContext";
import { SetFilesContext } from "@/app/context/SetFilesContext";
import { Status } from "@/config/definitions";
import { getSignedURL } from "@/app/actions";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import { Bell, DownloadIcon, Loader2, UploadIcon } from "lucide-react";
import { ImNotification } from "react-icons/im";
import { title } from "process";
import { buttonVariants } from "@/components/ui/button";

export function FileUploader() {
  const [status, setStatus] = useState<Status>(Status.Uploading);
  useEffect(() => {
    if (status === Status.Processed && shouldNotify) {
      new Notification("Done processing marksheets!", {
        body: "You can download the .xlsx file or close the tab.",
      });
    }
  }, [status]);
  const [shouldNotify, setShouldNotify] = useState<boolean>(false);
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
    setStatus(Status.Processing);
    setTimeout(() => {
      setStatus(Status.Processed);
    }, 1000);
    // const compressedImages = await compressFiles(files!);
    // const zip = new JSZip();
    // compressedImages.forEach((file) => {
    //   zip.file(file.name, file);
    // });
    // const zippedBlob = await zip.generateAsync({ type: "blob" });

    // const signedURL = await getSignedURL();
    // const url = await signedURL.success.url;
    // await fetch(url, {
    //   method: "PUT",
    //   body: zippedBlob,
    //   headers: {
    //     "Content-Type": zippedBlob.type,
    //   },
    // });
  }

  function getNotificationPermission() {
    if (Notification.permission === "granted") {
      setShouldNotify(true);
    } else {
      Notification.requestPermission().then((result) => {
        if (result === "granted") {
          setShouldNotify(true);
        }
      });
    }
  }

  async function handleDownload() {
    try {
      const response = await fetch("https://github.com/shadcn.png");
      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "image.png";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
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
          <UploadIcon /> Upload scanned marksheets
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
      {status === Status.Processing && (
        <>
          <Button disabled className="text-lg" onClick={handleNextStep}>
            <Loader2 className="animate-spin" /> Processing
          </Button>
          <br />
          <p>This can take a while, so keep this tab open.</p>
          <br />
          <Button disabled={shouldNotify} onClick={getNotificationPermission}>
            <Bell />{" "}
            {shouldNotify
              ? "You'll be notified when done"
              : "Get notified when done"}
          </Button>
        </>
      )}
      {status === Status.Processed && (
        <Button onClick={handleDownload}>
          <DownloadIcon /> Download result.xlsx
        </Button>
      )}
    </>
  );
}
