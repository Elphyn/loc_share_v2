import DropZone from "./components/DropZone";
import Devices from "./components/Devices";
import FileList from "./components/FileList";
import Transfers from "./components/Transfers.jsx";
import { useIPCContext } from "./contexts/useIPCContext.jsx";

function App() {
  const { instanceName } = useIPCContext();
  return (
    <div className="w-full h-full bg-bg-base  text-text-base flex flex-col justify-between">
      <div className="p-5">
        <h1>Name: {instanceName}</h1>
        <Devices />
        <DropZone />
        <FileList />
        <Transfers />
      </div>
    </div>
  );
}

export default App;
