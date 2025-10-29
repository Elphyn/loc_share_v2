import { useIPCContext } from "./contexts/useIPCContext"

function App() {

  const { serverConnection, socketList } = useIPCContext()


  return (
    <>
      <div>Server status: {serverConnection}</div>
      <div>
        <h1>Sockets:</h1>
        <ul>
          {socketList.map(id => (<li key={id}>{id}</li>))}
        </ul>
      </div>
    </>
  )
}

export default App

