const model = require('./dbmodel')
const fs = require('fs')
let roomNames = ['uiCampSat1', 'uiCampSat2', 'uiCampSat3', 'uiCampSun1', 'uiCampSun2', 'uiCampSun3', 'debugRoom']

async function run () {
  let users = {}
  for (let roomname of roomNames) {
    let room = await model.Room.find({ name: roomname }).populate({
      path: 'userSketches',
      populate: {
        path: 'user'
      }
    })
    if (room.length === 0) {
      continue
    } else {
      room = room[0]
    }
    let userSketches = room.userSketches
    for (let userSketch of userSketches) {
      let dbUser = userSketch.user
      if (users[dbUser.username] === undefined) {
        users[dbUser.username] = { user: userSketch.user, rooms: [] }
      }
      users[dbUser.username].rooms.push(roomname)
    }
  }

  // for (let username of Object.keys(users)) {
  //   let user = users[username]
  //   console.log(user)
  // }
  // fs.writeFile('peeks.json', JSON.stringify(users), 'utf8', () => console.log('Done done'));
}

run().then(() => console.log('done'))
