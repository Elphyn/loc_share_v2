import { useState } from "react";

export function useTransfer() {
  const [transfers, setTransfers] = useState(new Map());
}
