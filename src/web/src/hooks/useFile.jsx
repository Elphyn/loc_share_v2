import { useState, useCallback, useEffect } from "react";

export function useFile() {
  const [files, setFiles] = useState([]);
  // TODO: Handle a state change of the transfers
  const [transfers, setTransfers] = useState({});

  // to: instanceId to which you wanna send files
  const requestTransfer = useCallback(
    (to) => {
      window.electronAPI.transferRequest(to, files);
    },
    [files],
  );

  const addFile = useCallback((file) => {
    setFiles((prev) => [
      ...prev,
      {
        name: file.name,
        size: file.size,
        // adding type for future handling of sending directories
        type: file.type,
        path: window.electronAPI.getFilePath(file),
      },
    ]);
  }, []);

  useEffect(() => {
    const unsubOnNewTransfer = window.electronAPI.onNewTransfer(
      ({ id, transfer }) => {
        console.log("[DEBUG] New transfer arrived");
        setTransfers((prev) => ({ ...prev, [id]: transfer }));
      },
    );

    const unsubOnTransferStart = window.electronAPI.onTransferStart(
      (transferID) => {
        setTransfers((prev) => ({
          ...prev,
          [transferID]: { ...prev[transferID], state: "Started" },
        }));
      },
    );

    const unsubOnTransferFinish = window.electronAPI.onTransferFinish(
      (transferID) => {
        setTransfers((prev) => ({
          ...prev,
          [transferID]: { ...prev[transferID], state: "Finished" },
        }));
      },
    );

    const unsubOnFileProgress = window.electronAPI.onFileProgress(
      ({ transferID, fileID, bytesSent }) => {
        console.log("[DEBUG] file update arrived");
        console.log("With these params: ", { transferID, fileID, bytesSent });
        setTransfers((prev) => {
          const { files, ...rest } = prev[transferID];
          const file = files[fileID];
          const nextFile = { ...file, bytesSent };
          const nextFiles = { ...files, [fileID]: nextFile };
          return { ...prev, [transferID]: { ...rest, files: nextFiles } };
        });
      },
    );

    return () => {
      unsubOnNewTransfer();
      unsubOnTransferStart();
      unsubOnTransferFinish();
      unsubOnFileProgress();
    };
  }, []);

  useEffect(() => {
    console.log("[DEBUG] Transfers changed: ", transfers);
  }, [transfers]);

  return { files, requestTransfer, addFile, transfers };
}
