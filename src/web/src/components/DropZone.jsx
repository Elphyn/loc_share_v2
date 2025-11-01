import { useCallback } from "react";
import { useFileContext } from "../contexts/useFileContext";

export default function DropZone() {
  const { sendFile } = useFileContext();

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      sendFile(e.dataTransfer.files[0]);
    },
    [sendFile],
  );

  const handleDrag = (e) => {
    e.preventDefault();
  };

  return (
    <div
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className="border-2 border-dashed text-center h-32"
    >
      Drop File here
    </div>
  );
}
