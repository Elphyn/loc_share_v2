import bonjour from "bonjour"

const bonjourInst = bonjour()

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
  let serverPublishTime = new Date()
  bonjourInst.publish(
    {
      name: `loc-share-signaling-server-${myServiceID}`,
      type: 'http',
      port: port,
      txt: {
        id: myServiceID,
        time: serverPublishTime.toISOString(),
      }
    })
  return [myServiceID, serverPublishTime]
}

export function unplublish() {
  bonjourInst.unpublishAll(() => {
    bonjourInst.destroy()
  })
}
