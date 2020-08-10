import React, { Component } from 'react';
import socket from '../../socket-context';
import './roomlist.scss';

export class RoomList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: []
    }
  }

  componentDidMount() {
    if (this.props.db) {
      socket.emit('reqRoomsDb', (response) => {
        console.log("req rooms db")
        console.log(response)
        this.setState({ rooms: response.rooms })
      })
    } else {
      socket.emit('reqRooms')
      socket.on('refreshRooms', (rooms) => {
        console.log("refresh rooms")
        console.log(rooms)
        if (!this.props.all) {
          rooms = rooms.filter(room => !room.isDeleted)
        }
        this.setState({ rooms: rooms })
      })
    }
  }

  render() {
    let rooms
    if (this.state.rooms.length === 0) {
      rooms = <li className='no-rooms'>There are no rooms available.</li>
    } else {
      rooms = this.state.rooms.map((room) => {
        return (
          <li className="room" key={room.name} onClick={() => this.props.joinRoom(room.name)}>
            <div className="room-name">
              {room.name.replace(/_/g, ' ')}
              <span className='is-deleted'>
                  {this.props.all && room.isDeleted ? " [deleted]" : ""}
              </span>
            </div>
            <div className="room-stats">
              <span className="num-participants">
                { (this.props.db ? room.userSketches.length : room.numParticipants) }
                </span>
            </div>
          </li>
        )
      })
    }

    return (
      <div id='roomList'>
        <ul>
          <li className="header">
            <div className="room-name">ROOM NAME</div>
            <div className="room-stats">
              <span className="num-participants">Participants</span>
            </div>
          </li>
          {rooms}
        </ul>
      </div>
    )
  }
}
