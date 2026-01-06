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
      className="flex justify-center flex-col items-center border-2 border-dashed border-border-base text-center h-32 my-5 bg-bg-card/30"
    >
      <p className="select-none text-text-muted">Drop files here</p>
      <p className="text-text-muted">(or click here to add)</p>
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
