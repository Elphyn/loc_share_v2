import { useIPCContext } from "../contexts/useIPCContext";

export default function Devices() {
  const { devices } = useIPCContext();

  return (
    <div>
      <ul></ul>
    </div>
  );
}
