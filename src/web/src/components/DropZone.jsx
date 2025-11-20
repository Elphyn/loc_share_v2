import { useCallback } from "react";
import { useFileContext } from "../contexts/useFileContext";

export default function DropZone() {
  const { addFile } = useFileContext();

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      console.log("[DEBUG] files: ", e.dataTransfer.files);
      for (const file of e.dataTransfer.files) {
        addFile(file);
      }
    },
    [addFile],
  );

  const handleDrag = (e) => {
    e.preventDefault();
  };

  return (
    <div
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className="border-2 border-dashed text-center h-32 m-5"
    >
      Drop File here
    </div>
  );
}
