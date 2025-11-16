import { useCallback, useEffect, useState } from "react";

export function useFile() {
  const [files, setFiles] = useState(new Map());
  // TODO: Handle a state change of the transfers
  const [transfers, setTransfers] = useState(new Map());

  // TODO: due to possible timing issues should create a table entry on update
  // just check if there's an entry, if there's none then make one
  const startTransfer = useCallback(
    (id) => {
      const transferId = crypto.randomUUID();
      setTransfers((prev) => {
        const next = new Map(prev);
        const transfer = {
          files,
          state: "Pending",
          to: id,
        };
        next.set(transferId, transfer);
        return next;
      });

      const fileList = Array.from(files.values());
      window.electronAPI.transferRequest(
        id,
        Array.from(files.values()),
        transferId,
      );
    },
    [files],
  );

  const addFile = useCallback((file) => {
    setFiles((prev) => {
      const next = new Map(prev);
      const fileId = crypto.randomUUID();
      const fileEntry = {
        id: fileId,
        bytesSent: 0,
        name: file.name,
        size: file.size,
        type: file.type,
        path: window.electronAPI.getFilePath(file),
      };
      next.set(fileId, fileEntry);
      return next;
    });
  }, []);

  useEffect(() => {}, [files]);

  useEffect(() => {
    const unsubStart = window.electronAPI.onTransferStart((transferId) => {
      setTransfers((prev) => {
        const next = new Map(prev);
        const transfer = next.get(transferId);
        const updatedTrasfer = { ...transfer, state: "Started" };
        next.set(transferId, updatedTrasfer);
        return next;
      });
    });

    const unsubFinish = window.electronAPI.onTransferFinish((transferId) => {
      setTransfers((prev) => {
        const next = new Map(prev);
        const transfer = next.get(transferId);
        const updatedTrasfer = { ...transfer, state: "Finished" };
        next.set(transferId, updatedTrasfer);
        return next;
      });
    });

    const unsubFileProgress = window.electronAPI.onFileProgress(
      ({ transferId, id, bytesSent }) => {
        setTransfers((prev) => {
          const next = new Map(prev);
          const transfer = next.get(transferId);

          const newFiles = new Map(transfer.files);
          const updatedFile = { ...newFiles.get(id), bytesSent };
          newFiles.set(id, updatedFile);

          const updatedTransfer = { ...transfer, files: newFiles };
          next.set(transferId, updatedTransfer);

          return next;
        });
      },
    );

    return () => {
      unsubStart();
      unsubFinish();
      unsubFileProgress();
    };
  }, []);

  return { files, startTransfer, addFile, transfers };
}
