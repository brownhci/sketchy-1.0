import React, { Component } from 'react'
import './surveypage.scss'
import socket from '../socket-context'
import Util from "../shared/util";
import {SurveyQuestions} from "./surveyquestions/surveyquestions";
import {deviceDetect, isMobile} from 'react-device-detect'


export class SurveyPage extends Component {
  constructor(props) {
    super(props)
    this.questions = [
      {
        field: 'sketchExperience',
        type: 'likert',
        question: 'What is your level of sketch experience?',
        labels: ['Poor', '', '', '', 'Exceptional'],
      },
      {
        field: 'designExperience',
        type: 'likert',
        question: 'What is your level of design experience?',
        labels: ['Poor', '', '', '', 'Exceptional'],
      },
      {
        field: 'sketchLikelihood',
        type: 'likert',
        question: 'How likely are you to sketch ideas before starting a project?',
        labels: ['Very unlikely', '', '', '', 'Very likely'],
      },
      // {
      //   field: 'less-experienced',
      //   type: 'likert',
      //   question: 'How effective would seeing a less experienced artist\'s sketch be to inspire your own sketch?',
      //   labels: ['Not effective', '', '', '', 'Effective'],
      // },
      // {
      //   field: 'more-experienced',
      //   type: 'likert',
      //   question: 'How effective would seeing a more experienced artist\'s sketch be to inspire your own sketch?',
      //   labels: ['Not effective', '', '', '', 'Effective'],
      // },
      {
        field: 'effective-viewing-for-improving',
        type: 'likert',
        question: 'How effective do you feel viewing other Sketches would be for improving your own sketch?',
        labels: ['Not effective', '', '', '', 'Effective'],
      },
      // {
      //   field: 'effective-similar-for-inspiration',
      //   type: 'likert',
      //   question: 'How effective would viewing a sketch conceptually similar to your own be for inspiration?',
      //   labels: ['Not effective', '', '', '', 'Effective'],
      // },
      // {
      //   field: 'effective-different-for-inspiration',
      //   type: 'likert',
      //   question: 'How effective would viewing a sketch conceptually different to your own be for inspiration?',
      //   labels: ['Not effective', '', '', '', 'Effective'],
      // },
      // {
      //   field: 'ideation-similar-to-different',
      //   type: 'likert',
      //   question: 'In the ideation stage (beginning) of the design process would you want to view sketches that are conceptually:',
      //   labels: ['Similar', '', '', '', 'Different']
      // },
      // {
      //   field: 'final-stage-similar-to-different',
      //   type: 'likert',
      //   question: 'In the final stage (end) of the design process would you want to view sketches that are conceptually:',
      //   labels: ['Similar', '', '', '', 'Different']
      // },
      {
        field: 'inspirationChoices',
        type: 'checkbox',
        question: 'Which of the following methods do you typically use to gain inspiration for graphic design?',
        options: [
          'Looking at photographs of real-world objects',
          'View images of designs on the Internet',
          'Find a collaborator',
          'Other',
          'None of the above.'
        ],
      }
    ]
  }

  submit(results) {
    let data = {}
    data.results = results
    data.userId = Util.getUserId()
    data.username = Util.getUsername()
    data.deviceData = deviceDetect()
    data.isMobile = isMobile

    return new Promise((resolve) => {
      socket.emit('submitSurvey', data, (response) => {
        console.log(response)
        if (!response.error) {
          this.props.onAnswer()
          resolve(true)
        } else {
          resolve(false)
        }
      })
    })
  }

  render() {
    return (
      <div id="surveyPage" className='pre-survey-page'>
        <div className={"content-container"}>
          <div className="welcome">
            <div className="header">
              Welcome to Sketchy.
            </div>
            <div className="desc">
              Before you begin, please answer this brief survey.
            </div>
          </div>
          <SurveyQuestions
            questions={this.questions}
            onSubmit={(results) => this.submit(results)}
          />
        </div>
      </div>
    )
  }
}
