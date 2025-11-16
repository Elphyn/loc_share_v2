import { useFileContext } from "../contexts/useFileContext";
import TransferCard from "./TransferCard";

export default function Transfers() {
  const { transfers } = useFileContext();

  return (
    <ul>
      {Array.from(transfers.values()).map((transfer) => (
        <TransferCard transfer={transfer} />
      ))}
    </ul>
  );
}
