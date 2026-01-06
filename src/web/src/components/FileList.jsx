import { useFileContext } from "../contexts/useFileContext";

export default function FileList() {
  const { files, removeFile } = useFileContext();

  String.prototype.truncate = function (maxLength) {
    return this.length > maxLength
      ? this.slice(0, maxLength) + "…"
      : this.toString();
  };

  return (
    <div>
      {Object.keys(files).length !== 0 ? (
        <h2 className="text-text-muted">Added Files:</h2>
      ) : null}
      <ul>
        {Object.entries(files).map(([fileID, fileInfo]) => (
          <li key={fileID} className="flex flex-row justify-between">
            <div>{fileInfo.name.truncate(30)}</div>
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
    </div>
  );
}
