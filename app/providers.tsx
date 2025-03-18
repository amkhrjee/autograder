"use client";
import { ReactNode, useState } from "react";
import { FilesContext } from "./context/FilesContext";
import { SetFilesContext } from "./context/SetFilesContext";
import { Files } from "@/config/definitions";

export function Providers({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<Files>(null);
  return (
    <FilesContext.Provider value={files}>
      <SetFilesContext.Provider value={setFiles}>
        {children}
      </SetFilesContext.Provider>
    </FilesContext.Provider>
  );
}
