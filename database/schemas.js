const mongoose = require("mongoose")
const validator = require("validator")



const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "A user must have a name"],
    maxlength: 300
  },
  gender: {
    type: String,
    trim: true,
    maxlength: 100,
    enum: ["male", "female", "undisclosed"],
    default: "undisclosed"
  },
  username: {
    type: String,
    trim: true,
    required: [true, "A user must have a username"],
    maxlength: 300
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Error validating email"],
    required: [true, "A user must have an email"],
  },
  password: {
    type: String,
    select: false,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  contactList: [{
    type: mongoose.Schema.ObjectId,
    ref: "users"
  }],
  rooms: [{
    type: mongoose.Schema.ObjectId,
    ref: "rooms"
  }],
  unReadRooms: [{
    type: mongoose.Schema.ObjectId,
    ref: "rooms"
  }],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  photo: {
    type: String,
    default: "No User Image"
  },
  addRequests: [{
    fromName: {
      type: String,
      required: [true, "A request must have a from-name"]
    },
    fromUsername: {
      type: String,
      required: [true, "A request must have a from-username"]
    },
    fromID: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
      required: [true, "A request must have a from-ID"]
    },
    status: {
      type: String,
      enum: {
        values: ["accepted", "rejected", "pending"],
        message: "Failed to send request"
      }
    }
  }],
  about: {
    type: String,
    maxlength: 200,
    default: ""
  },
  savedNews: [Object]
})


userSchema.index({ username: 1 }, { unique: true })





const roomsSchema = new mongoose.Schema({
  firstUser: {
    type: mongoose.Schema.ObjectId,
    ref: "users"
  },
  secondUser: {
    type: mongoose.Schema.ObjectId,
    ref: "users"
  },
  messages: [{
    senderName: {
      type: String,
      required: [true, "A message must have a name"]
    },
    senderUsername: {
      type: String,
      required: [true, "A message must have a username"]
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    messsage: {
      type: String,
      maxlength: 1000,
      default: ""
    },
    image: {
      type: String,
      default: ""
    }
  }]
})


roomsSchema.index({ firstUser: 1, secondUser: 1 }, { unique: true })

roomsSchema.post("save", async (obj, next) => {
  try {
    const roomSavedID = obj._id

    const userFirst = await dbUsers.findById(obj.firstUser)
    const userSecond = await dbUsers.findById(obj.secondUser)

    userFirst.rooms.push(roomSavedID)
    userSecond.rooms.push(roomSavedID)

    await dbUsers.findByIdAndUpdate(obj.firstUser, { rooms: userFirst.rooms }, { runValidators: true })
    await dbUsers.findByIdAndUpdate(obj.secondUser, { rooms: userSecond.rooms }, { runValidators: true })

    next()
  }

  catch (err) {
    console.log(err)
  }

})



const socketSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Socket username must be present"]
  },
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: [true, "User ID must be present in socket"]
  },
  online: {
    type: Boolean,
    default: false
  },
  socketID: {
    type: String,
    default: "",
  }
})

userSchema.post("save", async (obj, next) => {
  try {
    await dbSockets.create({
      username: obj.username,
      userID: obj._id
    })

    next()
  }
  catch (err) {
    console.log(err)
  }
})

socketSchema.index({ username: 1 }, { unique: true })







const dbUsers = mongoose.model("users", userSchema)
const dbRooms = mongoose.model("rooms", roomsSchema)
const dbSockets = mongoose.model("sockets", socketSchema)



module.exports = { dbUsers, dbRooms, dbSockets }