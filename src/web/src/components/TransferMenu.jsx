import DropZone from "./DropZone";
import Devices from "./Devices";
import FileList from "./FileList";
import Transfers from "./Transfers.jsx";

export default function TransferMenu() {
  return (
    <div className="p-5">
      <Devices />
      <DropZone />
      <FileList />
      <Transfers />
    </div>
  );
}
