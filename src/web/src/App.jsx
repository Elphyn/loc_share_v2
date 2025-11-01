import Sockets from "./components/Sockets";
import DropZone from "./components/DropZone";
import FileList from "./components/FileList";
import { useIPCContext } from "./contexts/useIPCContext";

function App() {
  const { serverConnection } = useIPCContext();

  return (
    <>
      <div>Server status: {serverConnection}</div>
      <Sockets />
      <DropZone />
      <FileList />
    </>
  );
}

export default App;
