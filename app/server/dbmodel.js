const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Setup database
let dbUrl = 'mongodb://localhost/sketchy_live'
mongoose.connect(dbUrl)
let db = mongoose.connection
db.on('error', function (a) {
  throw new Error('unable to connect to database at ' + dbUrl)
})

// mongoexport --collection users --db sketchy --type=csv --out users.csv --fields userId,username,isMobile,device,surveyResults,postSurveyResults
const userSchema = new Schema({
  userId: { type: String, unique: true },
  username: String,
  isMobile: Boolean,
  device: mongoose.Mixed,
  surveyResults: mongoose.Mixed,
  postSurveyResults: mongoose.Mixed
})

// mongoexport --collection interactions --db sketchy --type=csv --out interactions.csv --fields userId,room,sketch,interactionType,interactionData,time
const interactionSchema = new Schema({
  userId: String,
  room: String,
  sketch: [],
  interactionType: String,
  interactionData: mongoose.Mixed,
  time: {
    type: Date,
    default: Date.now
  }
})

const featuresSchema = new Schema({
  userId: String,
  room: String,
  interactionData: mongoose.Mixed,
  time: {
    type: Date,
  }
})

// mongoexport --collection userSketchs --db sketchy --type=csv --out userSketchs.csv --fields userId,roomName,sketch,interactions,finalSketch,surveyResults
const userSketchSchema = new Schema({
  userId: String,
  roomName: String,
  interactions: [{ type: Schema.Types.ObjectId, ref: 'Interaction' }],
  finalSketch: [],
  surveyResults: mongoose.Mixed
})
userSketchSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: 'userId',
  justOne: true
})

// mongoexport --collection rooms --db sketchy --type=csv --out rooms.csv --fields name,type,userSketches,deleted,permanentDeleted,time
const roomSchema = new Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  userSketches: [{ type: Schema.Types.ObjectId, ref: 'UserSketch' }],
  deleted: { type: Boolean, default: false },
  permanentDeleted: { type: Boolean, default: false },
  time: {
    type: Date,
    default: Date.now
  }
})

module.exports = {
  Interaction: mongoose.model('Interaction', interactionSchema),
  User: mongoose.model('User', userSchema),
  Room: mongoose.model('Room', roomSchema),
  UserSketch: mongoose.model('UserSketch', userSketchSchema)
}
