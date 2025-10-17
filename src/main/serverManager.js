import { findServerService } from "../lib/discovery.js";
import { startServer, serverEvents, killServer } from "../lib/server.js";
import { win } from "./main.js";

let myServiceID
let serverPublishTime
let serverService
let isOurServer
let port


function setupServerEvents() {

  serverEvents.on("server-started", (port) => {
    console.log(`Server started on port:${port}`)
  })

  serverEvents.on("found-server", (service) => {
    console.log("found server")
    if (myServiceID === service.txt?.id) {
      serverService = service
      return
    }

    let externalServerStartTime = new Date(service.txt.time)
    let internalServerStartTime = new Date(serverPublishTime)
    console.log(internalServerStartTime < externalServerStartTime ? "Our server was published first" : "Our server was published second")

    if (internalServerStartTime < externalServerStartTime) return
    serverEvents.emit("found-earlier-server")
  })

  serverEvents.on("peer-connected", (socket) => {
    console.log("User connected: ", socket.id)
  })

  serverEvents.on("found-earlier-server", () => {
    killServer()
  })
}

async function findServer() {
  const [find, cleanup] = findServerService()

  const timer = (ms) => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Timeout"))
      }, ms);
    })
  }

  let ok
  let service

  try {
    service = await Promise.race([find(), timer(100)])
    ok = true
  } catch (err) {
    ok = false
  }

  cleanup()
  return [ok, service]
}

export function getServiceProvider() {
  if (!serverService && !isOurServer) return null

  if (isOurServer) return `http://localhost:${port}`

  return `http://${serverService.addresses[0]}:${serverService.port}`
}

export async function start() {
  let [isFound, service] = await findServer()


  if (!isFound) {
    ;[myServiceID, serverPublishTime, port] = await startServer()
    isOurServer = true
    setupServerEvents()
    return
  }

  console.log("Found a working server: ")
  console.log(service)
  serverService = service
}

