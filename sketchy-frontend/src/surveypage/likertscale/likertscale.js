import React, { Component } from 'react';
import './likertscale.scss';

export class LikertScale extends Component {
  /**
   * @param {object} props
   *   props.labels
   *     - (Optional) Array of strings with length equal to the number of options. Empty string for an option without
   *       label.
   */
  constructor(props) {
    super(props);
    this.dirty = false;
    this.labels = ['Disagree', '', '', '', 'Agree']
    if (this.props.labels !== undefined) {
      this.labels = this.props.labels
    }
    this.values = this.labels.map((_, index) => index + 1)
    if (this.props.values !== undefined) {
      this.values = this.props.values
    }
    this.state = {
      rating: 0
    }
  }

  buttonClicked(index) {
    this.dirty = true;
    this.setState({rating: index + 1});
    this.props.onChange(index + 1);
  }

  render() {
    return (
      <div className={'likert'}>
        <div className={'buttons-container'}>
          <div className={'buttons'}>
            {
              this.labels.map((text, index) => {
                return(
                  <div className={'button-container'} key={index.toString()}>
                    <div className={'button ' + (this.state.rating === index + 1 ? 'selected' : '')}
                      onClick={() => this.buttonClicked(index)}>
                      {this.values[index]}
                    </div>
                    <div className={'label'}>{text}</div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }
}
