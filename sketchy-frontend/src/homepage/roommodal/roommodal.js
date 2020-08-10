import React, { Component } from 'react'
import './roommodal.scss'
import Modal from '@material-ui/core/Modal';
import FormControl from "@material-ui/core/FormControl/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Radio from "@material-ui/core/Radio/Radio";
import RadioGroup from "@material-ui/core/RadioGroup/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel/FormLabel";

export class RoomModal extends Component {
  /**
   * @param props
   *   open - state property that determines whether the sketchymodal is currently open
   *   onClose - function that sets the open variable to false
   */
  constructor(props) {
    super(props)
    this.dirty = false
    this.maxLength = 50
    this.state = {
      newRoomName: "",
      roomType: 'peek'
    }
  }

  onChange(e) {
    this.dirty = true
    this.setState({
      newRoomName: e.target.value
    })
  }

  errorReason(roomName) {
    if (roomName.length === 0) {
      return "Room name cannot be empty."
    }
    if (roomName.length >= this.maxLength) {
      return "Room name must be less than " + this.maxLength + " characters long."
    }
    let validCharacters = /^[A-Za-z\s0-9]+$/;
    if (!roomName.match(validCharacters)) {
      return "Room name must contain only alphanumeric characters or space."
    }
    return ""
  }

  validateAndCreate(roomName) {
    let errorReason = this.errorReason(roomName)
    console.log(errorReason)
    if (errorReason === "") {
      this.props.onCreate({
        roomName: roomName.replace(/\s/g, "_"),
        roomType: this.state.roomType
      })
    }
  }

  render() {
    return (
      <Modal
        aria-labelledby="room-modal"
        open={this.props.open}
        onClose={() => this.props.onClose()}
        className='room-modal'
      >
        <div className='modal-content'>
          <div className='modal-header'>
            Create a Room
          </div>
          <div className='modal-body'>
              <div className='label'>
                Room Name
              </div>
              <input className='room-name' placeholder="Enter room name" type="text" value={this.state.newRoomName}
                     autoFocus={true}
                     onChange={(e) => this.onChange(e)}/>
              <div className='error-message'>
                {this.dirty ? this.errorReason(this.state.newRoomName) : ""}
              </div>

              <div className='label'>
                Room Type
              </div>
              <FormControl component="fieldset" className='form-control'>
                <RadioGroup
                  aria-label="Gender"
                  name="roomtype"
                  className='radio-group'
                  value={this.state.roomType}
                  onChange={(e) => {this.setState({roomType: e.target.value})}}
                >
                  <FormControlLabel value="peek" control={<Radio />} label="Peek" />
                  <FormControlLabel value="nopeek" control={<Radio />} label="No Peek" />
                </RadioGroup>
              </FormControl>
              <div className="button-container">
                <div className={"button " + (this.errorReason(this.state.newRoomName) === "" ? "" : "disabled")}
                     tabIndex={this.errorReason(this.state.newRoomName) === "" ? "0" : "-1"}
                     role="button"
                     onClick={() => this.validateAndCreate(this.state.newRoomName)}
                     onKeyDown={(event) => {
                       if (event.keyCode === 13) {
                         this.validateAndCreate(this.state.newRoomName)
                       }
                     }}
                >Create Room</div>
              </div>
          </div>
        </div>
      </Modal>
    );
  }
}
