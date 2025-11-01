import { useCallback, useRef, useState } from "react";

export function useFile() {
  const [files, setFiles] = useState([]);
  const nextIdRef = useRef(0);

  const sendFile = useCallback((file) => {
    console.log("[USE_FILE] Received: ", file);
    const name = file.name;
    setFiles((prev) => [...prev, { id: nextIdRef.current, name }]);
    nextIdRef.current++;
    window.electronAPI.sendFile(file);
  }, []);

  return { files, sendFile };
}
