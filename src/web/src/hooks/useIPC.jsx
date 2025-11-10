import { useEffect, useState } from "react";

export function useIPC() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const unsubNearbyDeviceOn = window.electronAPI.nearbyDeviceOn((device) => {
      setDevices((prev) => [...prev, device]);
    });
    const unsubNearbyDeviceOff = window.electronAPI.nearbyDeviceOff((id) => {
      setDevices((prev) => prev.filter(device.id !== id));
    });

    window.electronAPI.sendRendererReady();
    return () => {
      unsubNearbyDeviceOff();
      unsubNearbyDeviceOn();
    };
  }, []);

  useEffect(() => {
    console.log(devices);
  }, [devices]);

  return { devices };
}
