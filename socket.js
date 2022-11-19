const io = require("socket.io")
const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" })

const { dbUsers, dbSockets } = require("./database/schemas.js")


const mongoose = require("mongoose")

mongoose.connect(process.env.mongodb).then(() => {
  console.log("Touchh database connected")



  const socket = io(process.env.PORT, {
    cors: {
      methods: ["POST", "GET", "PATCH", "PUT"],
      credentials: true,
      origin: "*"
    }
  })









  socket.on("connection", async (client) => {
    const socketID = client.id
    
    if (client?.username) {
      await dbSockets.findOneAndUpdate({ username: client.username }, { online: true }, { runValidators: true })
    }

    client.on("updateMySocketId", async (username) => {
      client.username = username
      try {
        await dbSockets.findOneAndUpdate({ username: username }, { socketID: socketID, online: true }, { runValidators: true })
      }

      catch (err) {
        socket.emit("error", `${err || "error updating socketID"}`)
      }
    })


    client.on("sendMessageToSomeone", async (messageObj, recieverUsername) => {

      const { socketID } = await dbSockets.findOne({ username: recieverUsername })


      client.to(socketID).emit("newMessage", messageObj)
    })


    client.on("sendSmartNotification", async (message, recieverUsername, type) => {

      const { socketID } = await dbSockets.findOne({ username: recieverUsername })


      client.to(socketID).emit("newSmartNotification", message, type)
    })





    client.on("checkOnlineStatus", async (username) => {
      const { online } = await dbSockets.findOne({ username: username })

      if (online) client.emit("yesOnline")
      else client.emit("noOnline")
    })


    client.on("disconnect", async () => {
      await dbSockets.findOneAndUpdate({ username: client.username }, { online: false }, { runValidators: true })
    })

    client.on("connect", async () => {
      await dbSockets.findOneAndUpdate({ username: client.username }, { online: true }, { runValidators: true })
    })




























  })
}).catch((err) => {
  console.log(err)
})

