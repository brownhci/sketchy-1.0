import React, { Component } from 'react'
import './checkboxquestion.scss'
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

export class CheckboxQuestion extends Component {
  /**
   *
   * @param {object} props
   *   props.options - List of strings with options.
   */

  render() {
    return (
      <div className='checkbox-question'>
        <FormControl component="fieldset" className={'form-control'}>
          <FormGroup>
            {
              this.props.options.map((option, index) => {
                return (
                  <FormControlLabel
                    key={index}
                    control={<Checkbox onChange={() => this.props.onChange(option)} value="option" />}
                    label={option}
                  />
                )
              })
            }
          </FormGroup>
        </FormControl>
      </div>
    )
  }
}
