export default function FileContainer({ file }) {
  const round = (bytes) => {
    const units = ["B", "KB", "MB", "GB", "TB"];

    let current = bytes;
    let conversionCount = 0;

    while (current >= 102.4 && conversionCount < units.length - 1) {
      current = current / 1024;
      conversionCount += 1;
    }

    console.log("[DEBUG] Converted to: ", current.toFixed(2));

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

  return (
    <li className="flex justify-between border rounded p-2 mb-2">
      <h1>{file.name.truncate(15)}</h1>
      <h2>
        {rounded}
        {unit} / {roundedFull}
        {unitFull}
      </h2>
    </li>
  );
}
