import { Indicator } from "./components/indicator"
import { SocketList } from "./components/socketList"
import { SocketProvider } from "./contexts/useSocketContext"
import { WrtcProvider } from "./contexts/useWRTCContext"

function App() {

  return (
    <SocketProvider>
      <WrtcProvider>
        <div>
          <Indicator />
          <SocketList />
        </div>
      </WrtcProvider>
    </SocketProvider>
  )
}

export default App

