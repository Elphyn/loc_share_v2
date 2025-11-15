import { useFileContext } from "../contexts/useFileContext";

export default function Tranfer() {
  const { files } = useFileContext();

  return (
    <div>
      <ul>
        {files.map((file) => (
          <li>
            <h3>{file.name}</h3>
            <h2>{}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
}
