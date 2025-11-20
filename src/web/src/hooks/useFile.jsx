import { useState, useCallback, useEffect } from "react";

export function useFile() {
  const [files, setFiles] = useState([]);
  const [transfers, setTransfers] = useState({});

  // to: instanceId to which you wanna send files
  const requestTransfer = useCallback(
    (to) => {
      window.electronAPI.transferRequest(to, files);
      setFiles([]);
    },
    [files],
  );

  const addFile = useCallback((file) => {
    setFiles((prev) => [
      ...prev,
      {
        name: file.name,
        size: file.size,
        type: file.type,
        path: window.electronAPI.getFilePath(file),
      },
    ]);
  }, []);

  useEffect(() => {
    const unsubOnNewTransfer = window.electronAPI.onNewTransfer(
      ({ id, transfer }) => {
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

  return { files, requestTransfer, addFile, transfers };
}
