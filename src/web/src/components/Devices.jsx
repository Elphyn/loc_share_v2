import { useFileContext } from "../contexts/useFileContext";
import { useIPCContext } from "../contexts/useIPCContext";

export default function Devices() {
  const { devices } = useIPCContext();
  const { requestTransfer } = useFileContext();

  return (
    <div>
      <h2 className="text-text-muted">NEARBY DEVICES</h2>
      <ul className="bg-bg-card border border-border-base">
        {devices.map((device) => {
          const handleClick = () => {
            requestTransfer(device.id);
          };
          return (
            <li className="border-solid border-black m-5 flex justify-between">
              <h1>{device.name}</h1>
              <button onClick={handleClick}>Send</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
