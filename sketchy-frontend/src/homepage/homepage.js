import React, { Component } from 'react';
import './homepage.scss';
import logo from './logo.png';
import socket from '../socket-context';
import { RoomList } from './roomlist/roomlist.js';
import Util from '../shared/util.js'
import RemoveRedEye from '@material-ui/icons/RemoveRedEye'
import {SketchySnackbar} from "../surveypage/snackbar/sketchysnackbar";
import {RoomModal} from "./roommodal/roommodal";

export class HomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nickname: Util.getUsername(),
      creatingRoom: false,
      snackbarMessage: "",
      snackbarOpen: false,
      modalOpen: false
    };
  }

  componentDidMount() {
    socket.on('goToSurvey', () => {
      this.props.history.push('/postsurvey')
    })
  }

  goToRoom(roomName) {
    this.props.history.push('/sketch/' + roomName)
    window.scrollTo(0, 0)
  }

  showSnackbar(message) {
    this.setState({
      snackbarMessage: message,
      snackbarOpen: true
    })
  }

  createRoom(roomInfo) {
    let roomName = roomInfo.roomName
    let roomType = roomInfo.roomType

    socket.emit('createRoom', {
      userId: Util.getUserId(),
      roomName: roomName,
      roomType: roomType
    }, (response) => {
      if (response.success) {
        this.goToRoom(response.roomName)
      } else {
        this.showSnackbar('Room name in use. Try a different name.')
        this.setState({creatingRoom: false})
      }
    })
  }

  render() {
    return (
      <div id="homepage">
        <div className="header">
          <div className="header-inner">
            <img className='logo' src={logo} alt='Sketchy Logo'/>
            <div className="slogan">
              Create rough sketches with your mouse or finger.
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="top-section section">
            <div className="description">
              <p>Make diagrams, wireframes, icons, chart.</p>
              <p>You are connected to everyone else.</p>
              <p>Press the Peek <RemoveRedEye/> button to see what others are sketching.</p>
              <p>Sketchy will study their sketches to find something inspiring for you!</p>
              <p>Scroll down, find your fun auto-generated username, and join a room to begin:</p>
            </div>
          </div>

          <div className="main-section section">
            <div className="username-container">
              <div className='username-description'>
                Your username is:
              </div>
              <div className='username'>
                {this.state.nickname}
              </div>
            </div>

            <p className="description">
              Join a room with other users or create your own.
              Once in a room, you may click the Peek <RemoveRedEye/> button on the left-hand menu to see another person's sketch. ;)
            </p>

            { !this.state.creatingRoom &&
            <RoomList joinRoom={(roomName) => this.goToRoom(roomName)}/>
            }
            { !this.state.creatingRoom &&
            <div className="button-container">
              {/*<div className="button" onClick={() => this.setState({creatingRoom: true})}>Create New Room</div>*/}
              <div className="button" onClick={() => this.setState({modalOpen: true})}>Create New Room</div>
            </div>
            }
          </div>
        </div>
        <div className='footer'>
          <p>Sketchy is a research project. All interactions are captured and used anonymously for studies.</p>
          <p>This research is funded by the <a href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=1552935">
            National Science Foundation grant IIS-1552935.</a></p>
          <p>
            <a href='https://hci.cs.brown.edu/'>Brown University - Human Computer Interaction Research Group</a>
          </p>
          <p>Developed by Shaun Wallace, Luis Leiva, Brendan Le, Aman Haq, Audrey Kintisch, Gabrielle Bufrem, Linda Chang, past students from CSCI 1320, and Jeff Huang</p>
          <p>
            <a href='/postsurvey'> Answer the post-activity survey</a>
          </p>
          <p className='hidden'>
            Debug: {window.location.hostname}, {process.env.NODE_ENV}
          </p>
        </div>
        <SketchySnackbar handleClose={() => this.setState({snackbarOpen: false})}
                         open={this.state.snackbarOpen}
                         message={this.state.snackbarMessage}/>
        <RoomModal
          open={this.state.modalOpen}
          onClose={() => this.setState({modalOpen: false})}
          onCreate={(roomInfo) => this.createRoom(roomInfo)}
        />
      </div>
    )
  }
}

