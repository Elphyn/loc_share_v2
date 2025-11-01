import { createContext, useContext } from "react";
import { useIPC } from "../hooks/useIPC";

const IPCContext = createContext(null);

export function IPCProvider({ children }) {
  const ipcData = useIPC();

  return <IPCContext.Provider value={ipcData}>{children}</IPCContext.Provider>;
}

export function useIPCContext() {
  return useContext(IPCContext);
}
