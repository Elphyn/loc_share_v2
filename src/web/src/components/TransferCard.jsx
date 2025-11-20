export default function TransferCard({ transfer }) {
  return (
    <li className="bg-border-black">
      <div>{transfer.type}</div>
      <div>{transfer.state}</div>
      <ul>
        {Object.values(transfer.files).map((file) => (
          <li>
            <div>
              <h1>{file.name}</h1>
              <h2>
                Progress: {file.bytesSent || 0} / {file.size}
              </h2>
            </div>
          </li>
        ))}
      </ul>
    </li>
  );
}
