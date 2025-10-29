import { useIPCContext } from "../contexts/useIPCContext";

export default function Sockets() {
  const { socketList, localID } = useIPCContext();

  return (
    <div>
      <ul>
        {socketList
          .filter((id) => id !== localID)
          .map((id) => {
            const handler = () => {
              window.electronAPI.onClickConnect(id);
            };
            return (
              <div className="flex justify-content: space-evenly">
                <li key={id}>{id}</li>
                <button onClick={handler}>Connect</button>
              </div>
            );
          })}
      </ul>
    </div>
  );
}
