import React, { Component } from 'react';
import './sidebar.scss';
import 'rc-slider/assets/index.css';
import Undo from '@material-ui/icons/Undo'
import Redo from '@material-ui/icons/Redo'
import DeleteSweep from '@material-ui/icons/DeleteSweep'
import RemoveRedEye from '@material-ui/icons/RemoveRedEye'
import BarChart from '@material-ui/icons/BarChart'
import Home from '@material-ui/icons/Home'

export class Sidebar extends Component {
  /**
   * props
   *   selectedColor - string that is one of the color choices
   */
  constructor(props) {
    super(props);
    // this.changeColor = this.props.changeColor.bind(this)
    this.colors = ['blue', 'green', 'gray', 'orange', 'red', 'purple']
  }

  render() {
    let colorButtons = this.renderColors()
    return (
      <div id="sidebar">
        <div className="colors">
          {colorButtons}
        </div>
        <div className="brush-size">
          {/*<Slider dotStyle={{"border-color": "green"}}/>*/}
        </div>
        <div className="vertical-buttons">
          <CircleButton label="undo" small={false} onClick={() => this.props.undoClicked()}>
            <Undo/>
          </CircleButton>
          <CircleButton label="redo" small={false} onClick={() => this.props.redoClicked()}>
            <Redo/>
          </CircleButton>
          <CircleButton label="clear" small={true} onClick={() => this.props.clearClicked()}>
            <DeleteSweep/>
          </CircleButton>
          {
            this.props.showPeekButton &&
            <CircleButton label="peek" small={true} onClick={() => this.props.peekClicked()}>
              <RemoveRedEye/>
            </CircleButton>
          }
          <CircleButton label="stats" small={true} onClick={() => this.props.statsClicked()}>
            <BarChart/>
          </CircleButton>
          <CircleButton label="exit" small={true} onClick={() => this.props.homeClicked()}>
            <Home/>
          </CircleButton>
        </div>
      </div>
    )
  }

  renderColors() {
    let colorRows = []
    let colorRow = []
    for (let i = 0; i < this.colors.length; i++) {
      let color = this.colors[i]
      let colorButton = (
        <div
          key={i}
          className={"color-btn " + color + ' ' + (this.props.selectedColor === color ? 'selected' : '')}
          onClick={() => this.props.changeColor(color)}
        />
      )
      colorRow.push(colorButton)

      if (i % 2 === 1) {
        colorRows.push(
          <div key={i} className={"colorRow"}>{colorRow}</div>
        )
        colorRow = []
      }
    }
    return colorRows
  }
}

class CircleButton extends Component {
  render() {
    return (
      <div className="circle-btn-container" onClick={() => this.props.onClick()}>
        <div className={"circle-btn " +  (this.props.small ? "small" : "")} >
          {this.props.children}
        </div>
        <div className="circle-btn-text">
          {this.props.label}
        </div>
      </div>
    )
  }
}
