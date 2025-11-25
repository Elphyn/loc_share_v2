import { EventEmitter } from "node:events";

EventEmitter.prototype.onMany = function (map) {
  for (const [event, handler] of Object.entries(map)) {
    this.on(event, handler);
  }
};

EventEmitter.prototype.offMany = function (map) {
  for (const [event, handler] of Object.entries(map)) {
    this.off(event, handler);
  }
};

export {};
