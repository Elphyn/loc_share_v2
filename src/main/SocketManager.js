import { io } from "socket.io-client";
import { eventBus } from "./events.js";

export default class SocketManager {
  constructor() {
    this.socket = null
    this.currentServiceId = null
    this.io = null
    this.connectionState = false
    this.cleanup = null
    this.serverConnections = []
    this.setup()
  }

  setup() {
    eventBus.on("switch-server", (service) => {
      console.log('switch-server event triggered')
      if (service.txt?.id === this.currentServiceId) return
      this.connect(`http://${service.addresses[0]}:${service.port}`)
    })
    this.startSearch()
  }

  startSearch() {
    eventBus.emit('no-service-active')
  }

  disconnect() {
    this.socket.disconnect()
    if (this.cleanup) {
      this.cleanup()
      this.cleanup = null
    }
  }

  setupEventListeners() {
    const onConnect = () => {
      console.log("Clientside is connected!")
      this.connectionState = true
    }

    const onDisconnect = () => {
      console.log("lost connection to a server")
      this.connectionState = false
      if (this.cleanup) {
        this.cleanup()
        this.cleanup = null
      }
      this.startSearch()
    }

    const onNewConnection = (id) => {
      console.log('New connection: ', id)
      this.addToList(id)
    }

    const onDisconnectedSocket = (id) => {
      this.removeFromList(id)
    }

    this.socket.on('connect', onConnect)
    this.socket.on('disconnect', onDisconnect)
    this.socket.on('socket-connected', onNewConnection)
    this.socket.on("socket-disconnected", onDisconnectedSocket)

    return () => {
      this.socket.off('connect', onConnect)
      this.socket.off('disconnect', onDisconnect)
      this.socket.off('new-connection', onNewConnection)
      this.socket.off("socket-disconnected", onDisconnectedSocket)
    }
  }

  connect(adress) {
    if (this.connectionState) this.disconnect()
    console.log("Clientside is trying to connect to an adress", adress)

    this.socket = io(adress)
    eventBus.emit("backend-connected")

    this.cleanup = this.setupEventListeners()

    this.socket.emit('get-connections', (connections) => {
      this.resetList(connections)
    })
  }

  resetList(connections) {
    this.serverConnections = connections
    eventBus.emit("connections-list-reset", this.serverConnections)
  }

  addToList(id) {
    if (this.serverConnections.includes(id)) return
    this.serverConnections.push(id)
    eventBus.emit("connections-list-connection", id)
  }

  removeFromList(id) {
    console.log("This socket disconnected: ", id)
    this.serverConnections = this.serverConnections.filter(x => x !== id)
    eventBus.emit("connections-list-removal", id)
  }
}
