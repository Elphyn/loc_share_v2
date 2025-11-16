import { useFileContext } from "../contexts/useFileContext";

export default function FileList() {
  const { files } = useFileContext();

  return (
    <ul>
      {Array.from(files.values()).map((file) => (
        <li key={file}>{file.name}</li>
      ))}
    </ul>
  );
}
