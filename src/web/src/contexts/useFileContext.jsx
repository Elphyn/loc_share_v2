import { createContext, useContext } from "react";
import { useFile } from "../hooks/useFile";

const FileContext = createContext(null);

export function FileProvider({ children }) {
  const FileData = useFile();

  return (
    <FileContext.Provider value={FileData}>{children}</FileContext.Provider>
  );
}

export function useFileContext() {
  return useContext(FileContext);
}
