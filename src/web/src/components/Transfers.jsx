import { useFileContext } from "../contexts/useFileContext";
import TransferCard from "./TransferCard";
import TransferCardArtifact from "./TransferCardArtifact";

export default function Transfers() {
  const { transfers } = useFileContext();

  return (
    <ul>
      {Object.values(transfers).map((transfer) => (
        <TransferCard transfer={transfer} />
      ))}
      <TransferCardArtifact />
    </ul>
  );
}
