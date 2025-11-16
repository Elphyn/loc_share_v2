export default function TransferCard({ transfer }) {
  return (
    <li className="bg-border-black">
      <div>{transfer.state}</div>
      <ul>
        {Array.from(transfer.files.values()).map((file) => (
          <li>
            <div>
              <h1>{file.name}</h1>
              <h2>
                Progress: {file.bytesSent} / {file.size}
              </h2>
            </div>
          </li>
        ))}
      </ul>
    </li>
  );
}
