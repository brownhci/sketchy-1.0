import React, { Component } from 'react'
import './sketchymodal.scss'
import Modal from '@material-ui/core/Modal';

export class SketchyModal extends Component {
  /**
   * @param props
   *   open - state property that determines whether the sketchymodal is currently open
   *   onClose - function that sets the open variable to false
   */
  render() {
    return (
      <Modal
        aria-labelledby="stats-modal"
        open={this.props.open}
        onClose={() => this.props.onClose()}
        className='stats-modal'>
        {this.props.children}
      </Modal>
    );
  }
}
