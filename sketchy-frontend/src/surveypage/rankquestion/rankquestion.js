import React, { Component } from 'react';
import './rankquestion.scss';
import Select from '@material-ui/core/Select';
import MenuItem from "../../../node_modules/@material-ui/core/MenuItem/MenuItem";

export class RankQuestion extends Component {
  /**
   * @param {object} props
   *   props.labels
   *     - (Optional) Array of strings with length equal to the number of options. Empty string for an option without
   *       label.
   */
  constructor(props) {
    super(props);
    this.fields = this.props.fields
    this.fieldKeys = this.props.fieldKeys

    console.log('fields are ' + this.fields)
    console.log('field keys are ' + this.fieldKeys)
    // List of what string is selected for each rank
    let selections = []
    for (let i = 0; i < this.fieldKeys.length; i++) {
      selections.push("")
    }
    this.state = {
      rating: 0,
      selections: selections
    }
    console.log(this.state.selections)
  }

  onChange(value, index) {
    console.log("selecting " + value)
    let selections = JSON.parse(JSON.stringify(this.state.selections))

    let prevValue = selections[index]
    let swapIndex = selections.indexOf(value)
    selections[index] = value
    selections[swapIndex] = prevValue

    this.setState({selections: selections})

    let returnVal = {}
    for (let i = 0; i < selections.length; i++) {
      returnVal[selections[i]] = selections.length - i - 1
    }
    this.props.onChange(returnVal)
  }

  selectedCheckmark(key) {
    if (this.state.selections.indexOf(key) === -1) {
      return <span/>
    } else {
      return <span className='rank-checkmark'>&#x2713;</span>
    }
  }

  static renderValue(value) {
    return <div>{value}</div>
  }

  render() {
    return (
      <div className={'rank-question'}>
        {this.fieldKeys.map((field, i) => {
          return (
            <div key={this.fieldKeys[i]} className='rank-question-single'>
              <div className='field-name'>
                {i + 1}
              </div>
              <Select
                value={this.state.selections[i]}
                renderValue={(value) => RankQuestion.renderValue(value)}
                onChange={(event) => this.onChange(event.target.value, i)}
              >
                {this.fieldKeys.map((_, j) => {
                  return (
                    <MenuItem key={j+1} value={this.fieldKeys[j]}>
                      {this.fieldKeys[j]} {this.selectedCheckmark(this.fieldKeys[j])}
                    </MenuItem>
                  )
                })}
              </Select>
            </div>
          )
        })}
      </div>
    )
  }
}
