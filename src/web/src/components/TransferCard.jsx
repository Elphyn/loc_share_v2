import { useIPCContext } from "../contexts/useIPCContext";

export default function TransferCard({ transfer }) {
  const { getNameByID } = useIPCContext();
  return (
    <li className="bg-border-black">
      <div></div>
      <div>
        {transfer.type === "incoming"
          ? `from ${getNameByID(transfer.remoteID)}`
          : `to ${getNameByID(transfer.remoteID)}`}
      </div>
      <div>{transfer.state}</div>
      <ul>
        {Object.values(transfer.files).map((file) => (
          <li>
            <div>
              <h1>{file.name}</h1>
              <h2>
                Progress: {file.bytesProcessed || 0} / {file.size}
              </h2>
            </div>
          </li>
        ))}
      </ul>
    </li>
  );
}
