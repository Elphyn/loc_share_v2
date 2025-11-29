import { useFileContext } from "../contexts/useFileContext";
import TransferCard from "./TransferCard";

export default function Transfers() {
  const { transfers } = useFileContext();

  return (
    <div>
      <h2 className="text-text-muted ">TRANSFERS</h2>
      <ul>
        {Object.values(transfers).map((transfer) => (
          <TransferCard transfer={transfer} />
        ))}
      </ul>
    </div>
  );
}
