import { useFileContext } from "../contexts/useFileContext";
import { useIPCContext } from "../contexts/useIPCContext";

export default function Devices() {
  const { devices } = useIPCContext();
  const { startTranfer } = useFileContext();

  return (
    <div>
      <ul>
        {devices.map((device) => {
          const handleClick = () => {
            startTranfer(device.id);
          };
          return (
            <li className="border-solid border-black m-5 flex justify-between">
              <h1>{device.id}</h1>
              <button onClick={handleClick}>Send</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
