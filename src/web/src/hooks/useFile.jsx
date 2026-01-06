import { useState, useCallback, useEffect } from "react";
export function useFile() {
  const [files, setFiles] = useState({});
  const [transfers, setTransfers] = useState({});

  // to: instanceId to which you wanna send files
  const requestTransfer = useCallback(
    (to) => {
      window.electronAPI.transferRequest(to, Object.values(files));
      setFiles({});
    },
    [files],
  );

  const addFile = useCallback((file) => {
    setFiles((prev) => {
      const fileID = crypto.randomUUID();
      const next = {
        ...prev,
        [fileID]: {
          name: file.name,
          size: file.size,
          type: file.type,
          path: window.electronAPI.getFilePath(file),
        },
      };
      return next;
    });
  }, []);

  const removeFile = useCallback((fileID) => {
    setFiles((prev) => {
      const { [fileID]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  useEffect(() => {
    const unsubOnNewTransfer = window.electronAPI.onNewTransfer(
      ({ id, transfer }) => {
        setTransfers((prev) => ({ ...prev, [id]: transfer }));
      },
    );

    const unsubOnTransferStart = window.electronAPI.onTransferStart(
      (transferID) => {
        console.log("[DEBUG] Transfer started");
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
      ({ transferID, fileID, bytesProcessed }) => {
        setTransfers((prev) => {
          const { files, ...rest } = prev[transferID];
          const file = files[fileID];
          const nextFile = {
            ...file,
            bytesProcessed,
            progress: Math.round((bytesProcessed / file.size) * 100),
          };
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

  return { files, requestTransfer, addFile, removeFile, transfers };
}
