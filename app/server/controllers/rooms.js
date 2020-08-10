'use strict'

const express = require('express')
const router = express.Router({})
const globals = require('../globals')
const userList = globals.userList
const model = require('../dbmodel')

module.exports = function (app, io) {
  app.use('/', router)

  // userList.createRoom('debugRoom', 'peek')

  // Load all rooms from database into memory:
  model.Room.find({ permanentDeleted: false }, (err, rooms) => {
    if (!err) {
      for (let room of rooms) {
        userList.createRoom(room.name, room.type)
      }
    }
  })

  io.sockets.on('connection', (socket) => {
    socket.on('reqRooms', () => {
      try {
        socket.emit('refreshRooms', userList.roomObjectList())
      } catch (error) {
        console.log(error)
      }
    })

    socket.on('createRoom', async (data, callback) => {
      let response = { success: false }
      try {
        let roomName = data.roomName.substr(0, 50)
        let userId = data.userId
        let roomType = data.roomType

        console.log('User ' + userId + ' is creating room ' + roomName)

        if (!userList.roomExists(roomName)) {
          await userList.createRoom(roomName, roomType)
          response.success = true
          response.roomName = roomName

          socket.broadcast.emit('refreshRooms', userList.roomObjectList())
        } else {
          response.message = 'Room exists'
        }
        callback(response)
      } catch (error) {
        response.message = error
        callback(response)
        console.log(error)
      }
    })

    socket.on('joinRoom', async (data, callback) => {
      try {
        let roomName = data.roomName
        let userId = data.userId
        let response = { success: true }
        console.log('User ' + userId + ' is joining room ' + roomName)

        if (!userList.roomExists(roomName)) {
          console.log('-- Trying to join room that does not exist')
          response.success = false
          response.message = 'Room does not exist'
          callback(response)
          return
        }

        if (!userList.userExists(userId, roomName)) {
          console.log('-- Joining room for first time')
          await userList.addUser(userId, roomName, socket)
        } else {
          console.log('-- Rejoining room')
          userList.getUser(userId, roomName).socket = socket
        }
        socket.user = userList.getUser(userId, roomName)
        response.sketch = socket.user.sketch
        response.roomType = userList.getRoom(roomName).type
        console.log('Room type is ' + response.roomType)
        callback(response)
      } catch (error) {
        console.log(error)
      }
    })

    async function deleteRoom (roomName, targetRoom) {
      let leaveRoomMessage = {
        roomName: roomName,
        targetRoom: targetRoom
      }
      let room = userList.getRoom(roomName)
      room.document.deleted = true
      await room.document.save()
      socket.broadcast.emit('leaveRoom', leaveRoomMessage)

      let deletedRoom = !room.isDeleted
      room.isDeleted = true
      return deletedRoom
    }

    socket.on('deleteRoom', async (data, callback) => {
      let response = { message: 'success' }
      try {
        if (await deleteRoom(data.roomName, data.targetRoom)) {
          response.message = 'Success'
        } else {
          response.message = 'Room already deleted, booting remaining users.'
        }
        callback(response)
      } catch (error) {
        response.message = 'error ' + error
        callback(response)
        console.log(error)
      }
    })

    socket.on('deleteRoomPermanent', async (data, callback) => {
      let response = { error: true }
      try {
        await deleteRoom(data.roomName, data.targetRoom)
        let roomDoc = userList.getRoom(data.roomName).document
        roomDoc.permanentDeleted = true
        await roomDoc.save()
        response.error = false
        callback(response)
      } catch (error) {
        response.message = 'error ' + error
        callback(response)
        console.log(error)
      }
    })

    socket.on('submitSurvey', (data, callback) => {
      try {
        console.log('Received a survey response.')
        let userId = data.userId
        let results = data.results
        let username = data.username

        model.User.create({
          userId: userId,
          username: username,
          surveyResults: results,
          device: data.deviceData,
          isMobile: data.isMobile
        }, (err) => {
          let response = { error: false }
          if (err) {
            response.error = true
            response.message = 'Server error, failed to save survey. ' + err
          }
          userList.usernameCache[userId] = username
          callback(response)
        })
      } catch (error) {
        console.log(error)
      }
    })

    socket.on('submitPostSurvey', (data, callback) => {
      let response = { error: true }
      try {
        let userId = data.userId
        let results = data.results
        model.User.findOneAndUpdate({ userId: userId }, { $set: { postSurveyResults: results } }, { new: true },
          (err) => {
            if (err) {
              response.message = 'Could not save survey response'
            } else {
              response.error = false
            }
            callback(response)
          })
      } catch (error) {
        response.message = 'An unexpected error occurred ' + error
        callback(response)
        console.log(error)
      }
    })

    socket.on('submitPostRoomSurvey', (data, callback) => {
      let response = { error: true }
      console.log('received post room survey')
      console.log(data)
      try {
        let userId = data.userId
        let results = data.results
        let roomName = data.roomName
        model.UserSketch.findOneAndUpdate(
          { userId: userId, roomName: roomName },
          { $set: { surveyResults: results } }, { new: true }, (err) => {
            if (err) {
              response.error = true
              response.message = 'Could not save survey response'
            } else {
              response.error = false
            }
            callback(response)
          })
      } catch (error) {
        response.message = 'An unexpected error occurred: ' + error
        callback(response)
        console.log(error)
      }
    })

    socket.on('sendSurvey', (callback) => {
      let response = {}
      try {
        console.log('sending survey to everyone')
        socket.broadcast.emit('goToSurvey')
        response.message = 'success'
      } catch (error) {
        response.message = 'error ' + error
      }
      callback(response)
    })
  })
}
