
export function waitForEvent(el, eventName, timeout) {
  return new Promise((resolve, reject) => {
    const handler = (event) => {
      clearTimeout(timer);
      el.off(eventName, handler);
      resolve(event);
    };

    const timer = setTimeout(() => {
      el.off(eventName, handler);
      reject(new Error("Timeout"));
    }, timeout);

    el.on(eventName, handler);
  });
}
