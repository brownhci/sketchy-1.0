import React, { Component } from 'react'
import './historypage.scss'
import SVG from 'svg.js'
import socket from '../../socket-context'
import {SketchySnackbar} from "../../surveypage/snackbar/sketchysnackbar";
import Sketch from "../../sketchpage/sketch";
import nameFromId from '../../shared/namegenerator'


export class HistoryPage extends Component {
  constructor(props) {
    super(props)
    this.roomName = this.props.match.params.roomName
    this.userId = this.props.match.params.userId
    this.state = {
      snackbarOpen: false,
      snackbarMessage: "",
      finishedLoading: false,
      interactionType: 'Loading...',
      voted: ''
    }
    console.log("Viewing history of sketch with roomname: " + this.roomName + " userId: " + this.userId)
    this.result = null
    this.index = 0
    this.interactions = []
  }

  move(index) {
    if (index < 0 || index > this.interactions.length - 1) {
      return this.showSnackbar('Index out of bounds')
    }
    this.index = index
    let interaction  = this.interactions[index]
    let type = interaction.interactionType
    if (type === 'peek' || type === 'peekReview') {
      this.sketch.loadSketch(interaction.interactionData.peekedSketch)
    } else {
      this.sketch.loadSketch(interaction.sketch)
    }
    if (type === 'peekReview') {
      let voteText = interaction.interactionData.review ? "inspirational" : "not inspirational"
      this.setState({voted: voteText})
    }
    this.sketch.displayLoadedSketch()
    this.setState({interactionType: interaction.interactionType})
  }

  componentDidMount() {
    this.draw = SVG('svg').size('100%', '100%')
    let svg = document.getElementById('svg').getElementsByTagName('svg')[0]
    this.sketch = new Sketch(this.draw, svg)

    socket.emit('reqSketchInteractions', {
      userId: this.userId,
      roomName: this.roomName
    }, (response) => {
      console.log(response)
      this.interactions = response.userSketch.interactions
      console.log('Response: ')
      console.log(response)
      console.log(this.interactions)
      this.move(this.interactions.length - 1)
      this.setState({finishedLoading: true})
    })
  }

  showSnackbar(message) {
    this.setState({
      snackbarMessage: message,
      snackbarOpen: true
    })
  }

  render() {
    let disabled = this.state.finishedLoading ? '' : ' disabled'
    return (
      <div id="historyPage">
        <div className='content-container'>
          <div className='back-bar'>
            <div className='button' onClick={() => this.props.history.push('/admin/' + this.roomName + '/database')}>
              Back
            </div>
            <div className='username'>
              {nameFromId(this.userId)}
            </div>
          </div>
          <div id='svg'>
            <div className='interaction-info'>
              <div className='info-item'>
                <span className='label'>Interaction Type:</span>
                <span className='value'>{this.state.interactionType}</span>
              </div>
              <div className={'info-item ' + (this.state.interactionType === "peekReview" ? '' : ' hidden') }>
                <span className='label'>Voted:</span>
                <span className='value'>{this.state.voted}</span>
              </div>
            </div>
          </div>
          <div className={'index-bar' + (this.state.finishedLoading ? ' ' : ' invisible')}>
            <div className='index'>
              Position {this.index + 1} of {this.interactions.length }
            </div>
          </div>
          <div className='button-bar'>
            <div className={'button' + disabled} onClick={() => this.move(0)}>Goto Start</div>
            <div className={'button' + disabled} onClick={() => this.move(this.index-1)}>Back</div>
            <div className={'button' + disabled} onClick={() => this.move(this.index+1)}>Forwards</div>
            <div className={'button' + disabled} onClick={() => this.move(this.interactions.length - 1)}>Goto End</div>
          </div>
        </div>
        <SketchySnackbar handleClose={() => this.setState({snackbarOpen: false})}
                         open={this.state.snackbarOpen}
                         message={this.state.snackbarMessage}/>
      </div>
    )
  }
}
