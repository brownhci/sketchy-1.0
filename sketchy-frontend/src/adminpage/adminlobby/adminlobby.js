import React, { Component } from 'react'
import './adminlobby.scss'
import {RoomList} from "../../homepage/roomlist/roomlist";


export class AdminLobby extends Component {
  render() {
    return (
      <div id="adminLobby">
        <div className='content-container'>
          <div className='admin-header'>
            Admin
          </div>

          <div className='table-header'>View rooms in database</div>
          <RoomList
            all={true}
            db={true}
            joinRoom={(roomName) => this.props.history.push('/admin/' + roomName + '/database')}/>

          <div className='table-header'>View current rooms</div>
          <RoomList
            all={true}
            db={false}
            joinRoom={(roomName) => this.props.history.push('/admin/' + roomName + '/memory')}/>
        </div>
      </div>
    )
  }
}
