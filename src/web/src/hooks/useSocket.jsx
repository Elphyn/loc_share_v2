import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";

export function useSocket() {
  const [localID, setLocalID] = useState(null)
  const [service, setService] = useState(null)
  const [socket, setSocket] = useState(null)
  const [connections, setConnections] = useState([])

  const updateConnections = useCallback(() => {
    if (!socket) return
    socket.emit("get-connections", (response) => {
      console.log("response on connections: ", response)
      setConnections(response)
    })
  }, [socket])

  useEffect(() => {
    if (!connections) return
    console.log("connections changed")
    connections.forEach(item => {
      console.log(item)
    })
  }, [connections])

  useEffect(() => {
    const getService = async () => {
      let link = await window.electronAPI.getService()
      setService(link)
    }
    getService()
  }, [])

  useEffect(() => {
    if (!service) return
    const newSocket = io(service)
    setSocket(newSocket)
    return () => {
      newSocket.disconnect()
    }
  }, [service])

  useEffect(() => {
    if (!socket) return

    const onConnect = () => {
      updateConnections()
      setLocalID(socket.id)
    }

    const onDisconnect = () => {
      console.log("Dissconnected from socket server")
    }

    const onNewConnection = (newID) => {
      console.log(`adding: ${newID}`)
      setConnections(prev => {
        if (prev.includes(newID)) {
          return prev
        }
        return [...prev, newID]
      })
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("new-connection", onNewConnection)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("new-connection", onNewConnection)
    }

  }, [socket, updateConnections])


  return { connections, localID, socket }
}
