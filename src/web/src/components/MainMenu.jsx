import { useIPCContext } from "../contexts/useIPCContext";

export default function MainMenu() {
  const { instanceName } = useIPCContext();

  return (
    <div>
      <h1>LocShare</h1>
      <h2>Name on the network: {instanceName}</h2>
    </div>
  );
}
