export default function FileContainer({ file }) {
  const round = (bytes) => {
    const units = ["B", "KB", "MB", "GB", "TB"];

    let current = bytes;
    let conversionCount = 0;

    while (current >= 102.4 && conversionCount < units.length - 1) {
      current = current / 1024;
      conversionCount += 1;
    }

    return {
      rounded: current.toFixed(2),
      unit: units[conversionCount],
    };
  };

  String.prototype.truncate = function (maxLength) {
    return this.length > maxLength
      ? this.slice(0, maxLength) + "…"
      : this.toString();
  };

  const { rounded, unit } = round(file.bytesProcessed || 0);
  const { rounded: roundedFull, unit: unitFull } = round(file.size);
  // const blocks = Math.floor(file.progress / 2.5);

  return (
    <li className="flex-col justify-between  p-2 mb-2">
      <h1>{file.name.truncate(35)}</h1>
      <div>
        <div className="flex justify-between">
          <h2>
            {rounded}
            {unit} / {roundedFull}
            {unitFull}
          </h2>
          <div>{file.progress ? file.progress + "%" : null}</div>
        </div>
      </div>
    </li>
  );
}
