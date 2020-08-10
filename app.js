const express = require('express')
const path = require('path')
const http = require('http')
const engines = require('consolidate')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const compress = require('compression')

require('colors')

const app = express()
const server = http.createServer(app)
const io = require('socket.io').listen(server)

// Setup database
require('./app/server/dbmodel.js')

http.globalAgent.maxSockets = Infinity

app.engine('html', engines.hogan)
app.set('views', path.join(__dirname, '/app/client'))
app.set('view engine', 'html')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(cookieParser())
app.use(compress())
app.use(express.static(path.join(__dirname, 'sketchy-frontend', 'build')))

// Loops through the controllers and loads them with access to the express app and sockets io object
let controllers = ['sketching.js', 'rooms.js', 'view.js']
controllers.forEach((controller) => {
  require(path.join(__dirname, '/app/server/controllers/', controller))(app, io)
})

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'sketchy-frontend', 'build', 'index.html'))
})

// Catch all redirects to login page
// app.get('*', function (req, res) {
//   res.redirect('/')
// })

// // Express error route
// app.use(function (err, req, res, next) {
//   res.status(err.status || 500)
//   res.render('error/error', {
//     message: err.message,
//     error: err, // Replace with {} to hide error
//     title: 'error'
//   })
// })

// Start listening for requests
server.listen(8080, function () {
  console.log('- Server listening on port 8080'.grey)
})
