"use client";
import { ReactNode, useState } from "react";
import { FilesContext } from "./context/FilesContext";
import { SetFilesContext } from "./context/SetFilesContext";
import { Files } from "@/config/definitions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function Providers({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<Files>(null);
  return (
    <FilesContext.Provider value={files}>
      <SetFilesContext.Provider value={setFiles}>
        <div className="flex flex-col h-dvh  justify-between">
          {children}
          <footer className="text-center p-4">
            <p>Made for Tezpur University</p>
            <p>
              by{" "}
              <Link
                className="underline"
                target="_blank"
                href={"https://amkhrjee.xyz"}
              >
                Aniruddha
              </Link>{" "}
              &{" "}
              <Link
                className="underline"
                target="_blank"
                href={"https://linkedin.com/in/satyam-sajal-15a90325b"}
              >
                Satyam
              </Link>
            </p>
            <p className="text-sm mt-2 text-gray-600">
              v0.1.2{" "}
              <Badge className="text-gray-600" variant={"outline"}>
                beta
              </Badge>
            </p>
          </footer>
        </div>
      </SetFilesContext.Provider>
    </FilesContext.Provider>
  );
}
