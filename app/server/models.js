const util = require('./util')
const model = require('./dbmodel')
const AsyncLock = require('async-lock')

class UserList {
  constructor () {
    this.rooms = {}
    this.usernameCache = {}
  }

  getUsername (userId) {
    return new Promise((resolve, reject) => {
      if (this.usernameCache[userId] !== undefined) {
        resolve(this.usernameCache[userId])
      }
      model.User.findOne({ userId: userId }, (err, obj) => {
        try {
          if (err) {
            reject(err)
          } else if (obj == null) {
            let username = 'did-not-consent'
            this.usernameCache[userId] = username
            resolve(username)
          } else {
            this.usernameCache[userId] = obj.username
            resolve(obj.username)
          }
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  /**
   * @return {Promise}
   */
  addUser (userId, roomName, socket) {
    let queryObj = { userId: userId, roomName: roomName }

    // Create a UserSketch Object if one doesn't exist
    return new Promise(async (resolve, reject) => {
      try {
        // Create a new UserSketch corresponding to user-room pair
        let existing = await model.UserSketch.find(queryObj)
        let userSketchDocument = existing.length !== 0 ? existing[0] : new model.UserSketch(queryObj)
        await userSketchDocument.save()

        let user = new User(userId, roomName, socket, userSketchDocument)
        user.room = this.rooms[roomName]
        if (existing.length === 0) {
          user.room.document.userSketches.push(userSketchDocument)
        }
        try {
          await user.room.lock.acquire('key', () => user.document.save())
        } catch (err) {}
        this.rooms[roomName].users[userId] = user
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }

  createRoom (roomName, roomType) {
    console.log('Creating room ' + roomName)
    return new Promise((resolve, reject) => {
      model.Room.find({ name: roomName, permanentDeleted: false }, (err, rooms) => {
        if (err) reject(err)
        if (rooms.length === 0) { // Room does not exist in database
          model.Room.create({ name: roomName, type: roomType }, (err, roomDoc) => {
            if (err) reject(err)
            let newRoom = new Room(roomName, roomType, roomDoc)
            this.rooms[roomName] = newRoom
            resolve(newRoom)
          })
        } else {
          console.log('Loading room from database with type ' + rooms[0].type)
          let newRoom = new Room(roomName, rooms[0].type, rooms[0])
          if (newRoom.isDeleted) {
            reject(new Error('Cannot create deleted room'))
          } else {
            this.rooms[roomName] = newRoom
            resolve(newRoom)
          }
        }
      })
    })
  }

  roomExists (roomName) {
    return roomName in this.rooms
  }

  userExists (userId, roomName) {
    if (!this.roomExists(roomName)) return false
    return userId in this.rooms[roomName].users
  }

  getUser (userId, roomName) {
    return this.rooms[roomName].users[userId]
  }

  /**
   * @param {string} roomName
   * @returns {User[]} List of user objects
   */
  usersInRoomList (roomName) {
    return Object.values(this.rooms[roomName].users)
  }

  roomList () {
    return Object.values(this.rooms)
  }

  roomObjectList () {
    let roomObjects = []
    for (let room of this.roomList()) {
      roomObjects.push(room.serialize())
    }
    return roomObjects
  }

  getRoom (roomName) {
    return this.rooms[roomName]
  }
}

class User {
  constructor (userId, roomName, socket, document) {
    this.userId = userId
    this.roomName = roomName
    this.socket = socket
    this.document = document

    this.sketch = []
    this.room = null
    this.peeking = null
    this.peekedBy = []
    this.peekInteraction = null

    // Statistics for stats page
    this.numPeeksRecieved = 0
    this.numInterestingRecieved = 0
    this.numPeeksPerformed = 0

    // Keeps track of sketches seen by this user to prevent duplicates.
    this.seenUsers = []
    this.lock = new AsyncLock()
  }

  removePeeker (peeker) {
    util.remove(this.peekedBy, peeker)
  }

  getPreviouslyPeeked () {
    if (this.seenUsers.length !== 0) {
      return this.seenUsers[this.seenUsers.length - 1]
    }
    return null
  }
}

class Room {
  constructor (name, type, document) {
    this.idRoom = 0
    this.name = name
    this.users = {}
    this.isDeleted = false
    this.document = document
    this.lock = new AsyncLock()
    this.type = type
  }

  serialize () {
    return {
      name: this.name,
      numParticipants: Object.keys(this.users).length,
      isDeleted: this.isDeleted
    }
  }

  printState () {
    console.log('')
    console.log('State is ')
    for (let userId of Object.keys(this.users)) {
      if (this.users.hasOwnProperty(userId)) {
        console.log(userId + ':' + this.users[userId].username + ' has sketch with length ' + this.users[userId].sketch.length)
      }
    }
  }
}

module.exports = { User, Room, UserList }
