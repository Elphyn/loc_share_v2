import bonjour from "bonjour"
import { serverEvents } from "./server.js"

const bonjourInst = bonjour()

export function browse() {
  const browser = bonjourInst.find({ type: 'http' })

  browser.on('up', (service) => {
    if (!service.name.startsWith("loc-share-signaling-server")) return

    console.log("Found a server")
    serverEvents.emit("found-server", service)
  })
}

export function findServerService() {
  const browser = bonjourInst.find({ type: 'http' })


  let onUp

  const find = () => {
    return new Promise((resolve) => {
      onUp = (service) => {
        if (!service.name.startsWith("loc-share-signaling-server")) return
        console.log("Caught a service")
        resolve(service)
      }
      browser.on('up', onUp)
    })
  }

  const cleanup = () => {
    browser.off('up', onUp)
  }

  return [find, cleanup]
}

export function publishServer(port) {
  let myServiceID = crypto.randomUUID()
  let serverPublishTime = new Date().toISOString()
  bonjourInst.publish(
    {
      name: `loc-share-signaling-server-${myServiceID}`,
      type: 'http',
      port: port,
      txt: {
        id: myServiceID,
        time: serverPublishTime,
      }
    })
  return [myServiceID, serverPublishTime, port]
}

export function unplublish() {
  bonjourInst.unpublishAll(() => {
    bonjourInst.destroy()
  })
}
