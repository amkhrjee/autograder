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
        <Image
          src={"./college_entrance_exam_amico.svg"}
          alt="Files"
          width={250}
          height={250}
          className="pb-4"
        />
      )}
      {files && files!.length && (
        <div className="text-center text-4xl p-4 ">
          <p>You've uploaded</p>
          <p className="text-6xl font-bold ">{files!.length}</p>
          <p>marksheet{files!.length == 1 ? "" : "s"}</p>
          <br />
        </div>
      )}
      <FileUploader />
    </div>
  );
}
