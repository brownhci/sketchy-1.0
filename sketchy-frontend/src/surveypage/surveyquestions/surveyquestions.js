import React, { Component } from 'react'
import './surveyquestions.scss'
import {LikertScale} from "../likertscale/likertscale";
import {CheckboxQuestion} from "../checkboxquestion/checkboxquestion";
import {SketchySnackbar} from "../snackbar/sketchysnackbar";
import {RankQuestion} from "../rankquestion/rankquestion";

export class SurveyQuestions extends Component {
  /**
   * @param props
   *   submit - function that takes in data
   *   questions - list of question of the form:
   *
           {
                field: 'sketchLikelihood',
                type: 'likert',
                question: 'How likely are you to sketch ideas before starting a project?',
                labels: ['Very unlikely', '', '', '', 'Very likely'],
           },
           {
                field: 'inspirationChoices',
                type: 'checkbox',
                question: 'Which of the following methods do you typically use to gain inspiration for graphic design?',
                options: [
                  'Looking at photographs of real-world objects',
                  'View conceptually similar designs.',
                  'View conceptually different designs.',
                ],
           }
   */
  constructor(props) {
    super(props)
    this.state = {
      snackbarOpen: false,
      snackbarMessage: '',
      responses: {},
      submitting: false,
    }
    for (let question of this.props.questions) {
      if (question.type === 'likert') {
        this.state.responses[question.field] = null
      } else if (question.type === 'checkbox') {
        this.state.responses[question.field] = []
      } else if (question.type === 'rank') {
        this.state.responses[question.field] = {}
      }
    }
  }

  showSnackbar(message) {
    this.setState({
      snackbarMessage: message,
      snackbarOpen: true
    })
  }

  isFinished() {
    console.log(this.state.responses)
    for (let question of this.props.questions) {
      if (this.state.responses[question.field] === null) {
        return false
      }
    }
    return true
  }

  updateValue(questionIndex, value) {
    let stateCopy = JSON.parse(JSON.stringify(this.state))
    let field = this.props.questions[questionIndex].field

    stateCopy.responses[field] = value
    this.setState(stateCopy)
  }

  toggleOption(questionIndex, value) {
    let stateCopy = JSON.parse(JSON.stringify(this.state))
    let field = this.props.questions[questionIndex].field
    let index = stateCopy.responses[field].indexOf(value)

    if (index === -1) {
      stateCopy.responses[field].push(value)
    } else {
      stateCopy.responses[field].splice(index, 1)
    }
    this.setState(stateCopy)
  }

  async submit() {
    if (!this.isFinished()) {
      return
    }
    let success = await this.props.onSubmit(this.state.responses)
    if (!success) {
      this.setState({submitting: false})
    }
  }

  render() {
    return (
      <div id="surveyQuestions">
        {this.props.questions.map((question, index) => {
          if (question.type === 'likert') {
            return (
              <div className={'question-container ' + (question.className !== undefined ? question.className : '')}
                   key={question.field}>
                <div className='prompt'>{question.question}</div>
                <div className='description'>{question.description}</div>
                <LikertScale labels={question.labels}
                             values={question.values}
                             onChange={(value) => this.updateValue(index, value)}
                />
              </div>
            )
          } else if (question.type === 'prompt') {
            return (
              <div className={'question-container ' + (question.className !== undefined ? question.className : '')}>
                <div className='prompt'>{question.question}</div>
                <div className='description'>{question.description}</div>
              </div>
            )
          } else if (question.type === 'rank') {
            return (
              <div className={'question-container ' + (question.className !== undefined ? question.className : '')}>
                <div className='prompt'>{question.question}</div>
                <RankQuestion fields={question.fields} fieldKeys={question.fieldKeys}
                              onChange={(value) => this.updateValue(index, value)}
                />
              </div>
            )
          }
          return (
            <div className='question-container' key={question.field}>
              <div className='prompt'>{question.question}</div>
              <div className='description'>{question.description}</div>
              <CheckboxQuestion question={question.question}
                                options={question.options}
                                onChange={(option) => this.toggleOption(index, option)}
              />
            </div>
          )
        })}

        <div className={'submit-bar'}>
          <button className={'button ' + (!this.isFinished() || this.state.submitting ? 'disabled' : '')} onClick={() => {
            this.setState({submitting: true}, () => this.submit())
          }}>
            Finish
          </button>
        </div>
        <SketchySnackbar handleClose={() => this.setState({snackbarOpen: false})}
                         open={this.state.snackbarOpen}
                         message={this.state.snackbarMessage}/>
      </div>
    )
  }
}
