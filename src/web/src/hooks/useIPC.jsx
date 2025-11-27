import { useCallback, useEffect, useState } from "react";

export function useIPC() {
  const [instanceName, setInstanceName] = useState(null);
  const [devices, setDevices] = useState([]);
  const [idToName, setIdToName] = useState({});

  useEffect(() => {
    const unsubNearbyDeviceOn = window.electronAPI.nearbyDeviceOn((device) => {
      setIdToName((prev) => ({ ...prev, [device.id]: device.name }));
      setDevices((prev) => [...prev, device]);
    });
    const unsubNearbyDeviceOff = window.electronAPI.nearbyDeviceOff(
      (remoteID) => {
        setDevices((prev) => prev.filter((id) => id !== remoteID));
        setDevices((prev) => prev.filter((device) => device.id !== remoteID));
      },
    );

    const unsubOnNameGenerated = window.electronAPI.onNameGenerated((name) => {
      setInstanceName(name);
    });

    window.electronAPI.sendRendererReady();
    return () => {
      unsubNearbyDeviceOff();
      unsubNearbyDeviceOn();
      unsubOnNameGenerated();
    };
  }, []);

  const getNameByID = useCallback(
    (id) => {
      return idToName[id];
    },
    [idToName],
  );

  return { instanceName, devices, getNameByID };
}
