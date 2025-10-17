import { Server } from 'socket.io';
import { createServer } from 'node:http'
import { publishServer } from './discovery.js';
import getPort, { portNumbers } from 'get-port';
import EventEmitter from "node:events"

let io = null
let server = null
let connections = new Set()

export const serverEvents = new EventEmitter()

export function startServer() {
  return new Promise(async (resolve) => {
    let port = await getPort({ port: portNumbers(3000, 3100) })
    if (io) {
      throw new Error("Trying to start a server while one is already working")
    }

    server = createServer()
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      }
    })

    io.on('connection', (socket) => {
      connections.add(socket.id)

      socket.on("get-connections", (callback) => {
        connections.forEach((item) => {
          socket.emit("new-connection", item)
        })
      })

      socket.on('signal', (message) => {
        console.log("Server received signal, redirecting")
        io.to(message.to).emit('signal', {
          from: message.from,
          data: message.data,
        })
      })

      io.emit("new-connection", socket.id)

      serverEvents.emit("peer-connected", socket)
    })



    server.listen(port, () => {
      serverEvents.emit("server-started", port)
      resolve(publishServer(port))
    })
  })
}

export function killServer() {
  if (!io) {
    return new Error("Trying to kill server while there's none")
  }

  io.sockets.sockets.forEach(socket => {
    socket.disconnect(true)
  });

  io.close(() => {
    console.log("Closing seoket.io server")
    io = null

    server.close(() => {
      console.log("Http server closed")
      server = null
    })
  })
}
