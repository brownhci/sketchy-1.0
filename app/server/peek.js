const util = require('./util')
//const classifier = require('../../inspire/index') // sw old code - not using xgboost anymore
const featurize = require('../../inspire/featurizer')
const workerFarm = require('worker-farm')
const simasync = workerFarm(require.resolve('../../inspire/simasync'))

function filterSeenUsers (user, usersInRoom) {
  // Remove user's own self from user list, and filter empty sketches
  let previouslySeenUser = user.getPreviouslyPeeked()
  let unseenUsers = [...usersInRoom]
  for (let seenUser of user.seenUsers) {
    try {
      util.remove(unseenUsers, seenUser)
    } catch (error) {}
  }
  if (unseenUsers.length === 0) {
    unseenUsers = [...usersInRoom]
    user.seenUsers = []
  }
  // Prevent duplicates between the last of one cycle and the first of another cycle
  if (unseenUsers.length > 1 && previouslySeenUser !== null) {
    try {
      util.remove(unseenUsers, previouslySeenUser)
    } catch (error) {}
  }
  return unseenUsers
}

function peek (user, usersInRoom) {
  let unseenUsers = filterSeenUsers(user, usersInRoom)
  return randomPeek(user, unseenUsers)
  // return user.numPeeksPerformed % 2 === 0 ? randomPeek(user, unseenUsers) : simPeek(user, unseenUsers)
}

function reformat (sketch) {
  // Source format  [ {coords: [x1, y1, x2, y2]}, {coords: [x3, y3, x4, y4]} ]
  // Target format: [ [[x1, y1], [x2, y2]],  [[x3, y3], [x4, y4]] ]
  let formattedSketch = []
  for (let stroke of sketch.map(s => s.coords)) {
    let formattedStroke = []
    for (let i = 0; i < stroke.length / 2; i += 1) {
      formattedStroke.push([stroke[i * 2], stroke[i * 2 + 1]])
    }
    formattedSketch.push(formattedStroke)
  }
  return formattedSketch
}

function featurizeSketch (sketch) {
  return featurize.featurize(reformat(sketch))
}

function simPeek (user, usersInRoom) {
  let formattedSketches = usersInRoom.map((user) => {
    return reformat(user.sketch)
  })
  // Synchronous vs asynchronous
  // return usersInRoom[classifier.top(formattedSketches)]
  return new Promise((resolve, reject) => {
    simasync(formattedSketches, (err, output) => {
      if (err) {
        reject(err)
      } else {
        resolve(usersInRoom[output])
      }
    })
  })
}

function randomPeek (user, usersInRoom) {
  /**
   * Takes in a list of users and returns a user
   */
  let index = Math.floor(Math.random() * usersInRoom.length)
  return usersInRoom[index]
}

module.exports = { peek, featurizeSketch, simPeek }
