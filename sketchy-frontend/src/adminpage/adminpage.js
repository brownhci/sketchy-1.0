import React, { Component } from 'react'
import './adminpage.scss'
import SVG from 'svg.js'
import Sketch from '../sketchpage/sketch'
import socket from '../socket-context'
import {SketchySnackbar} from "../surveypage/snackbar/sketchysnackbar";
import nameFromId from '../shared/namegenerator'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';


export class AdminPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      sketches: [],
      snackbarOpen: false,
      snackbarMessage: '',
      roomType: 'loading...',
      transitionRoom: '[home]',
      roomNames: ['']
    }
    this.shouldSetup = false
    this.sketches = []
    this.loadFromDb = this.props.match.params.type === 'database'
  }

  showSnackbar(message) {
    this.setState({
      snackbarMessage: message,
      snackbarOpen: true
    })
  }

  sendSurvey() {
    socket.emit('sendSurvey', (response) => {
      this.showSnackbar(response.message)
    })
  }

  deleteRoom() {
    let roomName = this.props.match.params.roomName
    socket.emit('deleteRoom', {roomName: roomName, targetRoom: this.state.transitionRoom}, (response) => {
      this.showSnackbar(response.message)
    })
  }

  permanentDeleteRoom() {
    let roomName = this.props.match.params.roomName
    socket.emit('deleteRoomPermanent', {roomName: roomName, targetRoom: this.state.transitionRoom}, (response) => {
      this.showSnackbar(response.message)
    })
  }

  componentDidMount() {
    let roomName = this.props.match.params.roomName
    let data = {roomName: roomName}
    let endpoint = this.loadFromDb ? 'reqSketchesDb' : 'reqSketches'

    socket.emit(endpoint, data, (response) => {
      console.log("response is: ")
      console.log(response)
      let sketches = response.userSketches
      this.shouldSetup = true
      this.setState({
        sketches: sketches,
        roomType: response.roomType
      })
    })

    socket.emit('reqRooms')
    socket.on('refreshRooms', (rooms) => {
      console.log(rooms)
      rooms = rooms.filter((r) => !r.deleted)
      let roomNames = rooms.map((r) => r.name)
      roomNames.push('[home]')
      this.setState({ roomNames: roomNames})
    })
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.shouldSetup) {
      for (let i = 0; i < this.state.sketches.length; i++) {
        let draw = SVG('svg' + i).size('100%', '100%')
        let svg = document.getElementById('svg' + i).getElementsByTagName('svg')[0]
        let sketch = new Sketch(draw, svg)

        // Deal with different naming conventions for loading from db vs loading from memory.
        let finalSketch =  this.state.sketches[i][this.loadFromDb ? 'finalSketch' : 'sketch']
        sketch.loadSketch(finalSketch)
        sketch.displayLoadedSketch()
      }
      this.shouldSetup = false
    }
  }

  sketchClicked(sketch) {
    let roomName = this.props.match.params.roomName
    let userId = sketch.userId
    this.props.history.push('/admin/history/' + roomName + '/' + userId)
  }

  render() {
    return (
      <div id="adminPage">
        <div className='roomType'>
          Room Type: {this.state.roomType}
        </div>
       <div className='button-row'>
          <div className='button' onClick={() => this.props.history.push('/admin')}>
            Back
          </div>
          <div className='button' onClick={() => this.sendSurvey()}>
            Send Survey
          </div>
          <div className='button' onClick={() => this.deleteRoom()}>
            Delete Room
          </div>
         <div className='button' onClick={() => this.permanentDeleteRoom()}>
           Permanent Delete Room
         </div>

         <div className='select-container'>
           <div className={'transition-text'}>
             On delete, will transition to
           </div>
           <Select
             value={this.state.transitionRoom}
             onChange={(event) => {
               this.setState({transitionRoom: event.target.value})
             }}
             displayEmpty
             name="transitionRoom"
             className={'select'}>
             {this.state.roomNames.map((name) => {
               return <MenuItem key={name} value={name}>{name}</MenuItem>
             })}
           </Select>

         </div>
        </div>

        <div className='content-container'>
          <div className='sketches'>
            {
              this.state.sketches.map((sketch, i) => {
                return (
                  <div className='sketch' key={i} onClick={() => this.sketchClicked(sketch)}>
                    <div className='info'>
                      { nameFromId(sketch.userId) }, Score: {sketch.numInterestingRecieved} of {sketch.numPeeksRecieved}
                    </div>
                    <div id={'svg' + i}>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
        <SketchySnackbar handleClose={() => this.setState({snackbarOpen: false})}
                         open={this.state.snackbarOpen}
                         message={this.state.snackbarMessage}/>
      </div>
    )
  }
}
