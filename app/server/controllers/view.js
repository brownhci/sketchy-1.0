'use strict'
const userList = require('../globals').userList
const util = require('../util')
const model = require('../dbmodel')
const fs = require('fs')
const ttest = require('ttest')
const peekModel = require('../peek')

function sum (list) {
  return list.reduce((acc, value) => acc + value, 0)
}

function average (list) {
  return list.length === 0 ? 0 : sum(list) / list.length
}

function stderr (list) {
  if (list.length === 0) {
    return undefined
  }
  let n = list.length
  let avg = average(list)
  let stddev = list.reduce((acc, value) => acc + Math.pow(avg - value, 2), 0) / n
  return stddev / Math.sqrt(n)
}

function extractCounts (peekCounts) {
  let counts = []
  for (let user of Object.keys(peekCounts)) {
    if (peekCounts.hasOwnProperty(user)) {
      if (peekCounts[user] != null && !isNaN(peekCounts[user])) {
        counts.push(peekCounts[user])
      }
    }
  }
  return counts
}

module.exports = (app, io) => {
  io.sockets.on('connection', (socket) => {
    socket.on('reqSketches', async (data, callback) => {
      let response = { error: false }
      try {
        let roomName = data.roomName
        let room = userList.getRoom(roomName)
        response.userSketches = []

        for (let userId of Object.keys(room.users)) {
          if (room.users.hasOwnProperty(userId)) {
            let username = await userList.getUsername(userId)
            response.userSketches.push({
              userId: userId,
              username: username,
              sketch: room.users[userId].sketch,
              numPeeksRecieved: room.users[userId].numPeeksRecieved,
              numInterestingRecieved: room.users[userId].numInterestingRecieved
            })
          }
        }
        console.log('room type is ' + room.type)
        response.roomType = room.type
      } catch (error) {
        response.error = true
        console.log(error)
      }
      callback(response)
    })

    socket.on('reqSketchesDb', async (data, callback) => {
      console.log('starting req sketches...')
      let response = { error: true }
      try {
        let roomName = data.roomName
        let room = await model.Room.findOne({ name: roomName }).populate({
          path: 'userSketches'
        })
        let userSketches = room.userSketches
        response.userSketches = userSketches.toObject()
        console.log('room type is ' + room.type)
        response.roomType = room.type
        response.error = false
        callback(response)
      } catch (error) {
        response.message = error
        console.log(error)
        callback(response)
      }
    })

    socket.on('reqSketchInteractions', async (data, callback) => {
      let response = { error: true }
      let query = {
        roomName: data.roomName,
        userId: data.userId
      }
      try {
        let userSketch = await model.UserSketch.findOne(query).populate('interactions')
        response.error = false
        response.userSketch = userSketch
        callback(response)
      } catch (error) {
        console.log(error)
        callback.message = error
        callback(response)
      }
    })

    socket.on('reqRoomsDb', async (callback) => {
      let response = { error: true }
      try {
        // model.Room.find({ permanentDeleted: false }, (err, rooms) => {
        model.Room.find({ }, (err, rooms) => {
          if (err) {
            response.message = err
          } else {
            response.error = false
            response.rooms = rooms
          }
          callback(response)
        })
      } catch (error) {
        response.message = error
        callback(response)
        console.log(error)
      }
    })

    socket.on('getAnalysis', async (rooms, callback) => {
      let response = { error: true }
	  console.log('Getting analysis')
      try {
        // Calculate number of strokes in sketch when peeked by voteYes and voteNo
        console.log('Calculating number of strokes in sketch when peeked by voteYes and Voteno')
        let peekInteractions = await model.Interaction.find({ room: { $in: rooms }, interactionType: 'peekReview' })
        response.numStrokes = {
          voteYes: [], voteNo: []
        }
        for (let interaction of peekInteractions) {
          let strokeLengths = response.numStrokes[interaction.interactionData.review ? 'voteYes' : 'voteNo']
          strokeLengths.push(interaction.interactionData.peekedSketch.length)
        }

        // Calculate number of peeks by person (in peeking rooms)
        console.log('Calculating number of peeks by person')
        let dbRooms = await model.Room.find({ name: { $in: rooms }, type: 'peek' }).populate('userSketches')
        let peekCounts = {}
        let peekYesCounts = {}
        console.log('Rooms')
        for (let room of dbRooms) {
          let userSketches = room.userSketches
          for (let userSketch of userSketches) {
            peekCounts[userSketch.userId + '+' + userSketch.roomName] = 0
            peekYesCounts[userSketch.userId + '+' + userSketch.roomName] = 0
          }
        }
        for (let interaction of peekInteractions) {
          peekCounts[interaction.userId + '+' + interaction.room] += 1
          if (interaction.interactionData.review) {
            peekYesCounts[interaction.userId + '+' + interaction.room] += 1
          }
        }
        response.peekCounts = peekCounts
        response.peekYesCounts = peekYesCounts

        // Calculate average number of peeks
        console.log('Caculating average number of peeks')
        response.averagePeeks = average(extractCounts(peekCounts))
        response.averagePeeksYes = average(extractCounts(peekYesCounts))
        response.stderrPeeks = stderr(extractCounts(peekCounts))
        response.stderrPeeksYes = stderr(extractCounts(peekYesCounts))

        // Calculate satisfaction by room type
        console.log('Starting satisfaction by room type')
        response.satisfaction = {
          peek: [],
          noPeek: []
        }
        let allDbRooms = await model.Room.find({ name: { $in: rooms } }).populate({
          path: 'userSketches',
          populate: {
            path: 'user'
          }
        })

        let satisfactionJson = []
        for (let room of allDbRooms) {
          let userSketches = room.userSketches
          for (let userSketch of userSketches) {
            if (userSketch.surveyResults !== undefined) {
              satisfactionJson.push({
                userId: userSketch.userId,
                roomName: userSketch.roomName,
                satisfaction: userSketch.surveyResults['how-satisfied'],
                roomtype: room.type
              })

              let satisfaction = userSketch.surveyResults['how-satisfied']
              if (satisfaction !== null && satisfaction !== undefined) {
                if (room.type === 'peek') {
                  response.satisfaction.peek.push(satisfaction)
                } else if (room.type === 'nopeek') {
                  response.satisfaction.noPeek.push(satisfaction)
                }
              }
            }
          }
        }
        fs.writeFile('satisfaction.json', JSON.stringify(satisfactionJson, null, 2), 'utf8', () => console.log('Done done2'))

        if (response.satisfaction.peek.length > 1 && response.satisfaction.noPeek.length > 1) {
          let results = ttest(response.satisfaction.peek, response.satisfaction.noPeek, {
            mu: 0, varEqual: false, alternative: 'greater'
          })
          response.satisfactionP = results.pValue()
        }

        // Get post survey results to calculate CSI.
        console.log('Starting CSI stuff')
        let fields = ['exploration', 'collaboration', 'expressiveness', 'engagement', 'transparency', 'effort']
        let peekResults = new SurveyResults(fields)
        let noPeekResults = new SurveyResults(fields)
        let seenUsers = []

        for (let room of allDbRooms) {
          let userSketches = room.userSketches
          for (let userSketch of userSketches) {
            let dbUser = userSketch.user
            if (dbUser !== undefined && dbUser !== null) {
              if (seenUsers.indexOf(dbUser.userId) !== -1) {
                continue
              }
              seenUsers.push(dbUser.userId)
              try {
                let results = dbUser.postSurveyResults
                if (room.type === 'peek') {
                  peekResults.addSurvey(results)
                } else if (room.type === 'nopeek') {
                  noPeekResults.addSurvey(results)
                }
              } catch (err) {} // User didn't fill out one of the fields.
            }
          }
        }
        response.csi = {
          peek: peekResults.csi(),
          noPeek: noPeekResults.csi(),
          numPeek: peekResults.numSurveys,
          numNoPeek: noPeekResults.numSurveys,
          peekRaw: peekResults.rawValues(),
          noPeekRaw: noPeekResults.rawValues(),
          stats: peekResults.ttest(noPeekResults)
        }

        response.preResultsNoPeek = []
        response.preResultsPeek = []
        response.postResultsPeek = []
        response.postResultsNoPeek = []

        // Get pre survey likert scale question results
        console.log('Starting pre survey likerty scale quesiton results')
        seenUsers = []
        for (let room of allDbRooms) {
          let userSketches = room.userSketches
          for (let userSketch of userSketches) {
            let dbUser = userSketch.user
            if (dbUser !== undefined && dbUser !== null) {
              if (seenUsers.indexOf(dbUser.userId) !== -1) {
                continue
              }
              seenUsers.push(dbUser.userId)
              if (room.type === 'peek') {
                response.preResultsPeek.push(dbUser.surveyResults)
                response.postResultsPeek.push(dbUser.postSurveyResults)
              } else if (room.type === 'nopeek') {
                response.preResultsNoPeek.push(dbUser.surveyResults)
                response.postResultsNoPeek.push(dbUser.postSurveyResults)
              }
            }
          }
        }

        // Result for peek time vs inspiration
        console.log('Starting Result for peek time ')
        let peekTimes = {
          inspirational: [],
          notInspirational: []
        }
        for (let peek of peekInteractions) {
          let targetArr = peek.interactionData.review ? peekTimes.inspirational : peekTimes.notInspirational
          if (peek.interactionData.peekTime !== undefined) {
            targetArr.push(peek.time - peek.interactionData.peekTime)
          }
        }
        response.peekTimes = peekTimes

        // Results for input type
        console.log('Starting result for input type')
        let inspirationByDevice = {
          mobile: { yes: 0, no: 0 },
          desktop: { yes: 0, no: 0 }
        }
        let userIdIsMobile = {}
        for (let room of allDbRooms) {
          let userSketches = room.userSketches
          for (let userSketch of userSketches) {
            let dbUser = userSketch.user
            if (dbUser !== undefined && dbUser !== null) {
              userIdIsMobile[dbUser.userId] = dbUser.isMobile
            }
          }
        }
        for (let peek of peekInteractions) {
          let isMobileKey = userIdIsMobile[peek.interactionData.peekedUserId] ? 'mobile' : 'desktop'
          let isYesVoteKey = peek.interactionData.review ? 'yes' : 'no'
          inspirationByDevice[isMobileKey][isYesVoteKey] += 1
        }
        response.inspirationByDevice = inspirationByDevice

        // Inspiration vs sketch feature
        // console.log('Starting inspiration vs sketch feature')
        // let features = { peekYes: {}, peekNo: {} }
        // let peekInteractionsJson = []
        //
        // for (let peek of peekInteractions) {
        //   let review = peek.interactionData.review
        //   let target = review ? features.peekYes : features.peekNo
        //   if (peek.interactionData.peekedSketch.length > 0) {
        //     let sketchFeatures = peekModel.featurizeSketch(peek.interactionData.peekedSketch)
        //     addFeaturesToResults(sketchFeatures, target)
        //
        //     let peekCopy = JSON.parse(JSON.stringify(peek))
        //     delete peekCopy.sketch
        //     delete peekCopy.interactionData.peekedSketch
        //     peekInteractionsJson.push({ interaction: peekCopy,
        //       features: sketchFeatures
        //     })
        //   }
        // }
        // fs.writeFile('peekInteractions.json', JSON.stringify(peekInteractionsJson, null, 2), 'utf8', () => console.log('Done done2'))
        // response.features = features
        // console.log('Done')

        response.error = false
      } catch (error) {
        console.log('Errored somewhere')
        response.message = error
        console.log(error)
      }
      callback(response)
    })
  })
}

function addFeaturesToResults (features, sofar) {
  for (let feature of Object.keys(features)) {
    if (features.hasOwnProperty(feature)) {
      if (sofar.hasOwnProperty(feature)) {
        if (!isNaN(features[feature]) && isFinite(features[feature])) {
          sofar[feature].push(features[feature])
        }
      } else {
        sofar[feature] = []
      }
    }
  }
}

class SurveyResults {
  constructor (fields) {
    this.fields = fields
    this.results = {}
    this.counts = {}
    this.numSurveys = 0
    for (let field of this.fields) {
      this.results[field] = []
      this.counts[field] = []
    }
  }

  addSurvey (survey) {
    // console.log('Adding survey to ' + this.numSurveys)
    // console.log(survey)
    for (let field of this.fields) {
      if (survey[field] !== undefined) {
        this.results[field].push(survey[field])
      }
    }
    for (let field of this.fields) {
      if (survey['csi-rank'][field] !== undefined) {
        console.log(survey['csi-rank'][field])
        this.counts[field].push(survey['csi-rank'][field])
      }
    }
    this.numSurveys += 1

    // let counts = {}
    // for (let field of this.fields) {
    //   counts[field] = 0
    // }
    // for (let i = 0; i < this.fields.length; i++) {
    //   for (let j = i + 1; j < this.fields.length; j++) {
    //     let field1 = this.fields[i]
    //     let field2 = this.fields[j]
    //     let value = survey[field1 + '-' + field2]
    //     if (value !== 1 && value !== 2) {
    //       throw 'Assertion Error'
    //     }
    //     let votedField = value === 1 ? field1 : field2
    //     counts[votedField] += 1
    //   }
    // }
  }

  csi () {
    let total = 0
    for (let field of this.fields) {
      total += average(this.counts[field]) * average(this.results[field]) * 4
    }
    return total / 3
  }

  rawValues () {
    return {
      counts: this.counts,
      results: this.results
    }
  }

  ttest (other) { // T test that this results is better than other results
    let stats = {}
    for (let field of this.fields) {
      stats[field] = {
        pValue: null,
        testValue: null,
        dof: null
      }
      stats[field].countPeek = this.results[field].length
      stats[field].countNoPeek = other.results[field].length
      try {
        let testResults = ttest(this.results[field], other.results[field], { mu: 0, varEqual: false, alternative: 'greater' })
        stats[field].pValue = testResults.pValue()
        stats[field].testValue = testResults.testValue()
        stats[field].testValue = testResults.testValue()
        stats[field].dof = testResults.freedom()
      } catch (error) {
        // console.log(error)
      }
    }
    return stats
  }
}
