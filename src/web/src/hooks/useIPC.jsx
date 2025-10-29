import { useEffect, useState } from "react";


export function useIPC() {
  const [serverConnection, setServerConnection] = useState("Disconnected")
  const [socketList, setSocketList] = useState([])

  useEffect(() => {
    const unsubConnected = window.electronAPI.onConnection(() => {
      console.log("Server is connected")
      setServerConnection("Connected")
    })
    const unsubListReset = window.electronAPI.onConnectionReset((list) => {
      console.log("Resetting a list")
      setSocketList(list)
    })
    const unsubSocketConnection = window.electronAPI.onSocketConnection((id) => {
      console.log("New addition: ", id)
      setSocketList(prev => (
        prev.includes(id) ? prev : [...prev, id]
      ))
    })
    const unsubOnSocketDisconnection = window.electronAPI.onSocketDisconnection((id) => {
      console.log("Removing id: ", id)
      setSocketList(prev => (
        prev.filter(socket => socket !== id)
      ))
    })
    window.electronAPI.sendRendererReady()
    return () => {
      unsubConnected()
      unsubListReset()
      unsubSocketConnection()
      unsubOnSocketDisconnection()
    }
  }, [])

  useEffect(() => {
    console.log(socketList)
  }, [socketList])


  return { serverConnection, socketList }
}
