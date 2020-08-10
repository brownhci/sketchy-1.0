const io = require('socket.io-client')
const crypto = require('crypto')

let testSnoop = true
let testSketch = true

// let socketURL = 'http://0.0.0.0:8080'
let socketURL = 'http://sketchy.cs.brown.edu/'
// let socketURL = 'http://ec2-34-235-134-143.compute-1.amazonaws.com:8080'

let options = {
  transports: ['websocket'],
  'force new connection': true
}

let numClients = 70
let clients = initializeClients(numClients)

// Assign each client a random name
for (let client of clients) {
  client.userId = crypto.randomBytes(5).toString('hex')
  client.hasSketched = false
  client.canSketch = Math.random() < 0.8
  client.sketch = getRandSketch()
  client.canPeek = true
}

let host = clients[0]
let roomName = crypto.randomBytes(5).toString('hex')
console.log('Creating room with name ' + roomName)
host.emit('createRoom', {
  roomName: roomName,
  roomType: 'peek',
  userId: host.userId
}, () => {
  console.log('Finished creating room.')
  clientsJoinRoom(clients.slice(0, numClients - 10))
  setTimeout(() => {
    clientsJoinRoom(clients.slice(10, numClients))
  }, 10000)
})

function getRandSketch () {
  let randSketch = []
  let numStrokes = Math.floor(Math.random() * 10)
  let pointsPerStroke = 40

  for (let i = 0; i < numStrokes; i++) {
    let stroke = []
    for (let j = 0; j < pointsPerStroke; j++) {
      let x = Math.floor(Math.random() * 500)
      let y = Math.floor(Math.random() * 500)
      stroke.push([x, y])
    }
    randSketch.push(stroke)
  }
  return randSketch.map((pathData) => {
    return {
      coords: pathData,
      color: 'blue',
      width: 2
    }
  })
}

function initializeClients (numClients) {
  let clients = []
  for (let i = 0; i < numClients; i++) {
    let client = io.connect(socketURL, options)
    clients.push(client)
  }
  return clients
}

function performTypicalActions (client) {
  setTimeout(function () {
    if (!client.hasSketched || testSketch) {
      // console.log('sketching for user ' + client.userId)
      client.sketch = getRandSketch()
      client.emit('updateSketch', {
        sketch: client.sketch,
        method: 'bot'
      })
    } else {
      // console.log('undoing user ' + client.userId)
      client.emit('undo', { sketch: client.sketch })
    }
    setTimeout(function () {
      if (Math.random() < 0.3) {
        // console.log('redoing user ' + client.userId)
        client.emit('redo', { sketch: client.sketch })
      } else if (Math.random() < 0.5) {
        client.emit('undo', { sketch: client.sketch })
      } else {
        if (testSnoop && client.canPeek) {
          client.canPeek = false
          client.emit('peek', () => {
            client.emit('peekReview', Math.random() < 0.5)
            client.canPeek = true
          })
        } else {
          // console.log('undoing for user ' + client.userId)
          client.emit('undo', { sketch: client.sketch })
        }
      }
    }, 2000)
  }, Math.random() * 2000)
}

function clientsJoinRoom (clients) {
  for (let client of clients) {
    console.log('client ' + client.userId + 'is joining room')
    client.emit('joinRoom', {
      userId: client.userId,
      roomName: roomName
    }, () => {
      setInterval(() => {
        performTypicalActions(client)
      }, 3000 + Math.random() * 100)
    })
  }
}
