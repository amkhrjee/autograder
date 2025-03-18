import { Files } from "@/config/definitions";
import { createContext, Dispatch, SetStateAction } from "react";

export const SetFilesContext = createContext<
  Dispatch<SetStateAction<Files>> | undefined
>(undefined);
