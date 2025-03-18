"use client";
import { FileUploader } from "@/components/ui/FileUploader";
import Image from "next/image";
import { useContext } from "react";
import { FilesContext } from "./context/FilesContext";

export default function Home() {
  const files = useContext(FilesContext);
  return (
    <div className="flex flex-col justify-center items-center">
      {!files && (
        <Image src={"./files.svg"} alt="Files" width={120} height={120} />
      )}
      {files && files!.length && (
        <div className="text-center">
          <p>You've uploaded</p>
          <p className="text-4xl bold ">{files!.length}</p>
          <p>marksheet{files!.length == 1 ? "" : "s"}</p>
          <br />
        </div>
      )}
      <FileUploader />
    </div>
  );
}
