import { useCallback, useRef } from "react";
import { useFileContext } from "../contexts/useFileContext";

export default function DropZone() {
  const fileInputRef = useRef(null);
  const { addFile } = useFileContext();

  const handleDrop = (e) => {
    e.preventDefault();
    for (const file of e.dataTransfer.files) {
      addFile(file);
    }
  };

  const handleFiles = (files) => {
    for (const file of files) {
      addFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
  };

  return (
    <div
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()}
      className="border-2 border-dashed border-border-base text-center h-32 my-5 bg-bg-card/30 rounded-xl"
    >
      <p>Drop files here</p>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
