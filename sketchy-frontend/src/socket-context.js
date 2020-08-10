import socketIOClient from 'socket.io-client'

let socket
if (process.env.NODE_ENV === 'production') {
  console.log('socket is connecting to sketchy.cs.brown.edu')
  socket = socketIOClient('sketchy.cs.brown.edu')
} else {
  console.log('socket is connecting to ' + window.location.hostname + ':8080')
  socket = socketIOClient(window.location.hostname + ':8080')
}
export default socket
