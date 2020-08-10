import React, { Component } from 'react';
import './stars.css';

export class Stars extends Component {
  constructor(props) {
    super(props);

    this.dirty = false;
    this.state = {
      rating: 0
    }
  }

  starClicked(index) {
    this.dirty = true;
    this.setState({rating: index + 1});
    this.props.onChange(index + 1);
  }

  render() {
    let stars = [];
    for (let i=0; i<5; i++) {
      stars.push(i < this.state.rating ? 1 : 0)
    }

    return (
      <div id='stars'>
        {
          stars.map((isFilled, index) => {
            let text = isFilled ? "star" : "star_border";
            return <i className="material-icons" key={index} onClick={() => this.starClicked(index)}>
              {text}
            </i>
          })
        }
      </div>
    )
  }
}
