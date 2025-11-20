import DropZone from "./components/DropZone";
import Devices from "./components/Devices";
import FileList from "./components/FileList";
import Transfers from "./components/Transfers.jsx";

function App() {
  return (
    <>
      <Devices />
      <DropZone />
      <FileList />
      <Transfers />
    </>
  );
}

export default App;
