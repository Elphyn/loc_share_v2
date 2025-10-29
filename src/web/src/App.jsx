import Sockets from "./components/Sockets";
import { useIPCContext } from "./contexts/useIPCContext";

function App() {
  const { serverConnection } = useIPCContext();

  return (
    <>
      <div>Server status: {serverConnection}</div>
      <Sockets />
    </>
  );
}

export default App;
