import React, { Component } from 'react'
import Snackbar from '@material-ui/core/Snackbar';
import './sketchysnackbar.scss'
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

export class SketchySnackbar extends Component {
  /**
   * @param props
   *   handleClose - function that sets the open variable to false
   */
  handleClose() {
    this.props.handleClose()
  }

  render() {
    return (
      <div className={'sketchy-snackbar'}>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.props.open}
          autoHideDuration={5000}
          onClose={() => this.handleClose()}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.props.message}</span>}
          action={
            [
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => this.handleClose()}
              >
                <CloseIcon />
              </IconButton>,
            ]
          }
        />
      </div>
    );
  }
}
