import { useFileContext } from "../contexts/useFileContext";

export default function FileList() {
  const { files, removeFile } = useFileContext();

  return (
    // <ul>
    //   {files.values().map((file) => (
    //     <li key={file}>{file.name}</li>
    //   ))}
    // </ul>

    <ul>
      {Object.entries(files).map(([fileID, fileInfo]) => (
        <li key={fileID}>
          <div>{fileInfo.name}</div>
          <button
            type="button"
            onClick={() => {
              removeFile(fileID);
            }}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
