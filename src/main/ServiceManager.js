import bonjour from "bonjour";
import { eventBus } from "./events.js";

export default class ServiceManager {
  constructor() {
    this.bonjour = bonjour()
    this.browser = null
    this.setup()
  }

  setup() {
    eventBus.on('no-service-active', () => {
      if (this.browser) this.stopBrowsing()
      this.start()
    })
  }

  async start() {
    try {
      console.log("Trying to find a service within 100ms")
      await this.findWithinTimeout(100)
    } catch (err) {
      console.log("Failed to find a service, emitting no server")
      eventBus.emit('no-active-server')
    }
    this.browse()
  }

  findWithinTimeout(timeout) {
    return new Promise((resolve, reject) => {

      const browser = this.bonjour.find({ type: 'http' })

      const onUp = (service) => {
        if (!service.name.startsWith("loc-share-signaling-server")) return
        clearTimeout(timer)
        browser.stop()
        browser.off('up', onUp)
        console.log("Found a server")
        resolve(service)
      }


      const timer = setTimeout(() => {
        browser.stop()
        browser.off('up', onUp)
        reject(new Error("Timeout"))
      }, timeout);

      browser.on('up', onUp)
    })
  }

  onService(service) {
    if (!service.name.startsWith("loc-share-signaling-server")) return

    eventBus.emit("found-server", service)
  }

  browse() {
    console.log("Browsing")
    this.browser = this.bonjour.find({ type: 'http' })

    this.browser.on('up', this.onService)
  }

  stopBrowsing() {
    this.browser.stop()
    this.browser.off('up', this.onService)
  }
}

