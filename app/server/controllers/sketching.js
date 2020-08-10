'use strict'
const _ = require('underscore')._
const userList = require('../globals').userList
const peek = require('../peek')
const util = require('../util')

module.exports = (app, io) => {
  io.sockets.on('connection', (socket) => {
    socket.on('updateSketch', (data) => {
      try {
        let user = socket.user
        user.sketch = data.sketch
        util.saveInteraction(user, 'sketch', { method: data.method })
        for (let peeker of user.peekedBy) {
          peeker.socket.emit('peekedSketchUpdate', user.sketch)
        }
      } catch (error) {
        console.log(error)
      }
    })

    socket.on('disconnect', () => {
      try {
        let user = socket.user
        if (user !== undefined && user.peeking != null) {
          util.remove(user.peeking, user)
          user.peeking = null
        }
      } catch (error) {
        console.log(error)
      }
    })

    socket.on('peek', async (callback) => {
      try {
        let user = socket.user
        let response = { error: false }
        let room = user.room
        let usersInRoom = userList.usersInRoomList(room.name)
        usersInRoom = usersInRoom.filter((otherUser) => {
          return otherUser !== user && otherUser.sketch.length > 0
        })
        let previouslySeenUser = user.getPreviouslyPeeked()

        // check if the user is the only one in the room
        if (usersInRoom.length === 0) {
          response.error = true
          response.message = 'There are no other sketches in the room!'
        } else {
          let peekedUser = await peek.peek(user, usersInRoom)
          if (peekedUser === previouslySeenUser) {
            response.duplicate = true
          }
          user.numPeeksPerformed += 1
          user.peeking = peekedUser
          user.seenUsers.push(peekedUser)

          peekedUser.peekedBy.push(user)
          response.username = peekedUser.username
          response.sketch = peekedUser.sketch
          user.peekInteraction = await util.saveInteraction(user, 'peek', {
            peekedSketch: peekedUser.sketch,
            peekedUserId: peekedUser.userId
          })
        }
        callback(response)
      } catch (error) {
        console.log('an error occurred')
        console.error(error)
      }
    })

    // Sent on a vote for a snoop
    socket.on('peekReview', async (review) => {
      try {
        let user = socket.user
        let targetUser = user.peeking
        if (targetUser !== null) {
          // user.peekInteraction.time
          await util.saveInteraction(user, 'peekReview', {
            peekedSketch: targetUser.sketch,
            review: review,
            peekedUserId: targetUser.userId,
            peekTime: user.peekInteraction.time
          })
          user.peeking = null
          targetUser.numPeeksRecieved += 1
          targetUser.numInterestingRecieved += review ? 1 : 0
          targetUser.removePeeker(user)
        }
      } catch (error) {
        console.error(error)
      }
    })

    // Each of these endpoints maps to inserting a new row into sketches with a different interaction
    const endpointInteractionMap = {
      'undo': 'undo',
      'redo': 'redo',
      'clear': 'clear'
    }
    _.each(endpointInteractionMap, (interaction, endpoint) => {
      socket.on(endpoint, (data) => {
        try {
          socket.user.sketch = data.sketch
          util.saveInteraction(socket.user, interaction)
        } catch (error) {
          console.error(error)
        }
      })
    })

    socket.on('stats', (callback) => {
      let response = { error: false }
      try {
        let user = socket.user
        response.numInteresting = user.numInterestingRecieved
        response.numPeeked = user.numPeeksRecieved
        util.saveInteraction(user, 'stats')
      } catch (error) {
        console.log(error)
        response.error = true
        response.message = 'Internal server error occurred'
      }
      callback(response)
    })
  })
}
