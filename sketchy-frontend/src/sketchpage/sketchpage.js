import React, { Component } from 'react'
import {Sidebar} from "./sidebar/sidebar"
import './sketchpage.scss'
import SVG from 'svg.js'
import socket from '../socket-context'
import Sketch from './sketch'
import Util from '../shared/util'
import {SketchySnackbar} from "../surveypage/snackbar/sketchysnackbar";
import {SketchyModal} from "./sketchymodal/sketchymodal";
import {isMobile} from 'react-device-detect'
import {RemoveRedEye} from "@material-ui/icons";


export class SketchPage extends Component {
  constructor(props) {
    super(props)
    this.drawing = false;
    this.state = {
      peeking: false,
      loading: true,
      errorMessage: '',
      snackbarOpen: false,
      snackbarMessage: '',
      modalOpen: false,
      selectedColor: 'blue',
      statsNumInteresting: 0,
      statsNumPeeked: 0,
      introModalOpen: true,
      roomType: 'not-yet-loaded'
    }
    this.userId = Util.getUserId()
    this.prevMouseEvent = null
  }

  componentDidMount() {
    this.roomName = this.props.roomName
    let width = document.getElementById('sketchpad').clientWidth
    let height = document.getElementById('sketchpad').clientHeight

    if (isMobile) {
      this.draw = SVG('svg').size(width, height)
    } else {
      this.draw = SVG('svg').size('100%', '100%')
    }
    let svg = document.getElementById('svg').getElementsByTagName('svg')[0]

    this.primarySketch = new Sketch(this.draw, svg)
    this.peekSketch = new Sketch(this.draw, svg)

    window.addEventListener('resize', () => {
      this.primarySketch.updateDimensions()
      if (this.state.peeking) {
        this.peekSketch.displayLoadedSketch()
      }
    })

    socket.on('peekedSketchUpdate', (data) => {
      if (!this.state.peeking) {
        return
      }
      this.peekSketch.loadSketch(data)
      this.peekSketch.displayLoadedSketch()
    })

    socket.on('goToSurvey', () => {
      this.props.history.push('/postroomsurvey/' + this.roomName + '/[postsurvey]')
    })

    socket.on('leaveRoom', (response) => {
      let roomName = response.roomName
      let targetRoomName = response.targetRoom
      if (roomName === this.roomName) {
        this.props.history.push('/postroomsurvey/' + this.roomName + '/' + targetRoomName)
      }
    })

    window.addEventListener('keyup', (e) => this.handleKeyUp(e))
    window.addEventListener('keydown', (e) => this.handleKeyDown(e))
    svg.addEventListener('touchmove', (e) => {
      e.preventDefault()
    })
    this.joinRoom()
    document.body.classList.toggle('sketchpage-body', true)
  }

  componentWillUnmount() {
    document.body.classList.toggle('sketchpage-body', false)
  }

  joinRoom() {
    socket.emit('joinRoom', {
      userId: Util.getUserId(),
      roomName: this.roomName
    }, (response) => {
      console.log(response)
      if (response.success) {
        this.primarySketch.loadSketch(response.sketch)
        this.primarySketch.displayLoadedSketch(false)
        this.setState({roomType: response.roomType})
        this.setState({loading: false})
      } else {
        this.setState({errorMessage: response.message})
      }
    })
  }

  handleMouseDown(e) {
    if (!this.state.peeking && !this.drawing) {
      this.drawing = true
      this.primarySketch.startPath(this.state.selectedColor, 3)
      this.primarySketch.continueLineWithEvent(e)
    }
  }

  handleMove(e) {
    if (this.drawing && !this.state.peeking) {
      this.primarySketch.continueLineWithEvent(e)
    }
    e.persist()
    this.prevMouseEvent = e
  }

  handleMouseUp(e, method) {
    for (let i = 0; i < 3; i++) {
      this.handleMove(e) // Draw dot at the end for smoothing
    }
    if (this.drawing && !this.state.peeking) {
      this.drawing = false
      this.primarySketch.finishPath()
      socket.emit('updateSketch', {sketch: this.primarySketch.serialize(), method: method})
    }
  }

  handleKeyUp(e) {
    if (e.key === 'd' && this.prevMouseEvent != null) {
      this.handleMouseUp(this.prevMouseEvent, 'd-key')
    }
  }

  handleKeyDown(e) {
    if (e.key === 'd' && this.prevMouseEvent != null && !this.drawing) {
      console.log('pressed d')
      this.handleMouseDown(this.prevMouseEvent)
    }
    if (e.keyCode === 90 && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      this.redo()
    } else if (e.keyCode === 90 && (e.ctrlKey || e.metaKey)) {
      this.undo()
    }
  }

  undo() {
    if (this.primarySketch.undo()) {
      socket.emit('undo', {sketch: this.primarySketch.serialize()})
    }
  }

  redo() {
    if (this.primarySketch.redo()) {
      socket.emit('redo', {sketch: this.primarySketch.serialize()})
    }
  }

  clear() {
    if (this.primarySketch.clear()) {
      this.primarySketch.updateDimensions()
      socket.emit('clear', {sketch: this.primarySketch.serialize()})
    }
  }

  peek() {
    socket.emit('peek', (response) => {
      if (!response.error) {
        this.setState({peeking: true})
        let sketch = response.sketch
        if (response.duplicate) {
          this.showSnackbar('Sorry! You are seeing a duplicate because there is only one sketch in the room.')
        }
        this.primarySketch.hide()
        this.peekSketch.loadSketch(sketch)
        this.peekSketch.displayLoadedSketch()
      } else {
        this.showSnackbar(response.message)
      }
    })
  }

  stats() {
    socket.emit('stats', (response) => {
      if (response.error) {
        this.showSnackbar(response.message)
      } else {
        this.setState({
          modalOpen: true,
          statsNumInteresting: response.numInteresting,
          statsNumPeeked: response.numPeeked,
        })
        this.setState({modalOpen: true})
      }
    })
  }

  exit() {
    this.props.history.push('/postroomsurvey/' + this.roomName + '/[home]')
  }

  vote(isInspirational) {
    this.setState({peeking: false})
    this.primarySketch.show()
    this.peekSketch.remove()
    socket.emit('peekReview', isInspirational)
  }

  showSnackbar(message) {
    this.setState({
      snackbarMessage: message,
      snackbarOpen: true
    })
  }

  modalMessage() {
    let peekText = this.state.roomType === 'nopeek' ? '' :
      <span>Press the Peek <RemoveRedEye/> button to see what others are sketching.</span>

    if (isMobile) {
      return (
        <div className='modal-message'>
          Use your finger to draw on the page. {peekText}
        </div>
      )
    } else {
      return (
        <div className='modal-message'>
        Use your mouse to draw on the page, or hold down the <code>d</code> key and drag the mouse to draw. {peekText}
        </div>
      )
    }
  }

  render() {
    return (
      <div id="sketchPage">
        <div className={"loadingScreen " + (this.state.loading ? '' : 'hidden')}>
          {this.state.errorMessage ? "Error: " + this.state.errorMessage : "Joining room, please wait..."}
        </div>
        <div id="sidebarContainer" className={this.state.peeking ? 'hidden' : ''}>
          <Sidebar
            showPeekButton={this.state.roomType !== 'nopeek'}
            selectedColor={this.state.selectedColor}
            changeColor={(color) => this.setState({selectedColor: color})}
            undoClicked={() => this.undo()}
            redoClicked={() => this.redo()}
            clearClicked={() => this.clear()}
            peekClicked={() => this.peek()}
            statsClicked={() => this.stats()}
            homeClicked={() => this.exit()}
          />
        </div>
        <div id="sketchpad">
          <div id="svg"
               onMouseDown={(e) => this.handleMouseDown(e)}
               onMouseMove={(e) => this.handleMove(e)}
               onMouseLeave={(e) => this.handleMouseUp(e, 'mouse')}
               onMouseUp={(e) => this.handleMouseUp(e, 'mouse')}
               onTouchCancel={(e) => this.handleMouseUp(e, 'mobile')}
               onTouchEnd={(e) => this.handleMouseUp(e, 'mobile')}
               onTouchMove={(e) => this.handleMove(e)}
               onTouchStart={(e) => this.handleMouseDown(e)}
          />
          <div id="votebar" className={(this.state.peeking ? '' : 'invisible')}>
            <span className={"label"}>
              {/*<strong>*/}
                Will you change your sketch based on what you see in this sketch?
              {/*</strong>*/}
              {/*<span className="inspirational">inspirational</span>*/}
              {/*<strong>?</strong>*/}
            </span>
            <div className={"vote-button"} onClick={() => this.vote(true)}>Yes</div>
            <div className={"vote-button"} onClick={() => this.vote(false)}>No</div>
          </div>
        </div>
        <SketchySnackbar handleClose={() => this.setState({snackbarOpen: false})}
                         open={this.state.snackbarOpen}
                         message={this.state.snackbarMessage}/>
        <SketchyModal
          open={this.state.modalOpen}
          className={'stats-modal'}
          onClose={() => this.setState({modalOpen: false})}>
          <div className='modal-content'>
            <div className='modal-header'>
              Your peeking statistics
            </div>
            <div className='modal-body'>
              <div className='section'>
                Your sketch was voted inspirational <code>{this.state.statsNumInteresting}</code> times.
              </div>
              <div className='section'>
                Other users peeked your sketch <code>{this.state.statsNumPeeked}</code> times.
              </div>
            </div>
          </div>
        </SketchyModal>
        <SketchyModal open={this.state.introModalOpen && !this.state.loading} onClose={() => this.setState({introModalOpen: false})}>
          <div className='modal-content'>
            <div className='modal-header'>
              Welcome to Sketchy.
            </div>
            <div className='modal-body'>
              {this.modalMessage()}
            </div>
          </div>
        </SketchyModal>
      </div>
    )
  }
}
