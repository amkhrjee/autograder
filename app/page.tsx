"use client";
import { FileUploader } from "@/components/ui/FileUploader";
import { motion } from "motion/react";
import Image from "next/image";
import { useContext } from "react";
import { FilesContext } from "./context/FilesContext";

export default function Home() {
  const files = useContext(FilesContext);
  return (
    <div className="flex flex-col justify-center items-center md:text-2xl">
      {!files && (
        <>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, translateY: -40 }}
            animate={{ opacity: 1, translateY: 0 }}
          >
            <p>marksheets -{">"} spreadsheet</p>
            <p>
              in <s>hours</s> minutes
            </p>
            <Image
              src={"./college_entrance_exam_amico.svg"}
              alt="Files"
              width={250}
              height={250}
              className="pb-4 md:h-96 md:w-96"
            />
          </motion.div>
        </>
      )}
      {files && files!.length && (
        <div className="text-center text-4xl p-4 ">
          <p>you&apos;ve uploaded</p>
          <p className="text-6xl font-bold">{files!.length}</p>
          <p>marksheet{files!.length == 1 ? "" : "s"}</p>
          <br />
        </div>
      )}
      <motion.div
        className="flex flex-col justify-center items-center"
        initial={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
      >
        <FileUploader />
      </motion.div>
    </div>
  );
}
