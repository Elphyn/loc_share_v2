import { useCallback, useState } from "react";
import { useIPCContext } from "../contexts/useIPCContext";

export function useFile() {
  const [files, setFiles] = useState([]);
  const { notifyTranferRequest } = useIPCContext();

  const startTranfer = useCallback(
    (id) => {
      notifyTranferRequest(id, files);
    },
    [files],
  );

  const addFile = useCallback((file) => {
    file.id = crypto.randomUUID();
    file.bytesSent = 0;
    setFiles((prev) => [...prev, file]);
  }, []);

  return { files, startTranfer, addFile };
}
