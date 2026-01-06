import { useIPCContext } from "../contexts/useIPCContext";
import FileContainer from "./FileContainer";

export default function TransferCard({ transfer }) {
  const { getNameByID } = useIPCContext();
  return (
    <li className="border border-border-base bg-bg-card p-2 my-2">
      <div className="flex justify-between">
        <div>
          {transfer.type === "incoming"
            ? `from ${getNameByID(transfer.remoteID)}`
            : `to ${getNameByID(transfer.remoteID)}`}
        </div>
        <div>{transfer.state}</div>
      </div>
      <ul>
        {Object.values(transfer.files).map((file) => (
          <FileContainer file={file} />
        ))}
      </ul>
    </li>
  );
}
