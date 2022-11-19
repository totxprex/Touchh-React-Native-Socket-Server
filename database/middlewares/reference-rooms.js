
const { dbUsers } = require("../schemas.js")


const refRooms = function () {

  return async (obj, next) => {
    try {
      const roomSavedID = obj._id

      const userFirst = await dbUsers.findById(obj.firstUser)
      const userSecond = await dbUsers.findById(obj.secondUser)

      userFirst.rooms.push(roomSavedID)
      userSecond.rooms.push(roomSavedID)

      await dbUsers.findByIdAndUpdate(obj.firstUser, { rooms: userFirst.rooms }, { runValidators: true })
      await dbUsers.findByIdAndUpdate(obj.secondUser, { rooms: userSecond.rooms }, { runValidators: true })
    }

    catch (err) {
      console.log(err)
    }

  }
}


module.exports = { refRooms }