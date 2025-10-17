import { createContext, useContext } from "react";
import { useWRTC } from "../hooks/useWRTC";
import { useSocketContext } from "./useSocketContext";



const WrtcContext = createContext(null)

export function WrtcProvider({ children }) {
  const { socket, localID } = useSocketContext()
  const data = useWRTC(socket, localID)

  return (
    <WrtcContext.Provider value={data}>
      {children}
    </WrtcContext.Provider>
  )
}

export function useWRTCContext() {
  return useContext(WrtcContext)
}
