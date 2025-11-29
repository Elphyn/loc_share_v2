import DropZone from "./components/DropZone";
import Devices from "./components/Devices";
import FileList from "./components/FileList";
import Transfers from "./components/Transfers.jsx";
import { useIPCContext } from "./contexts/useIPCContext.jsx";

function App() {
  const { instanceName } = useIPCContext();
  return (
    <div className="p-5 bg-bg-base w-full h-full text-text-base">
      <h1>Name: {instanceName}</h1>
      <Devices />
      <DropZone />
      <FileList />
      <Transfers />
    </div>
  );
}

export default App;
