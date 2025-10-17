import { useEffect } from "react"
import { Socket } from "./socket"
import { useSocketContext } from "../contexts/useSocketContext"


export function SocketList() {

  const { localID, connections } = useSocketContext()

  useEffect(() => {
    console.log(connections)
    console.log("localID: ", localID)
  }, [localID, connections])

  return (
    <div>
      {[...connections]
        .filter(item => item !== localID)
        .map(item => (
          <Socket key={item} socketID={item} />
        ))}
    </div>
  )
}
