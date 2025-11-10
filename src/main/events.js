import EventEmitter from "node:events";

export const ipcBus = new EventEmitter();

export const eventBus = new EventEmitter();
