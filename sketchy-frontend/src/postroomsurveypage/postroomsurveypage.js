import React, { Component } from 'react'
import './postroomsurveypage.scss'
import socket from '../socket-context'
import {SurveyQuestions} from "../surveypage/surveyquestions/surveyquestions";
import Util from "../shared/util";
import {SketchySnackbar} from "../surveypage/snackbar/sketchysnackbar";


export class PostRoomSurveyPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      snackbarOpen: false,
      snackbarMessage: '',
    }
    this.questions = [
      {
        field: 'how-satisfied',
        type: 'likert',
        question: 'How satisfied are you with your final sketch',
        labels: ['Not satisfied', '', '', '', 'Satisfied']
      },
    ]
    this.roomName = this.props.match.params.roomName
    this.targetRoomName = this.props.match.params.targetRoomName
  }

  showSnackbar(message) {
    this.setState({
      snackbarMessage: message,
      snackbarOpen: true
    })
  }

  submit(results) {
    let data = {}
    data.results = results
    data.userId = Util.getUserId()
    data.roomName = this.roomName

    return new Promise((resolve) => {
      socket.emit('submitPostRoomSurvey', data, (response) => {
        if (response.error) {
          this.showSnackbar(response.message)
          resolve(false)
        } else {
          resolve(true)
          if (this.targetRoomName === '[home]') {
            this.props.history.push('/')
          } else if (this.targetRoomName === '[postsurvey]') {
            this.props.history.push('/postsurvey')
          } else {
            this.props.history.push('/sketch/' + this.targetRoomName)
          }
        }
      })
    })
  }

  render() {
    return (
      <div id="surveyPage">
        <div className={"content-container"}>
          <div className="welcome">
            <div className="header">
              Post Room Survey
            </div>
            <div className="desc">

            </div>
          </div>
          <SurveyQuestions
            questions={this.questions}
            onSubmit={(results) => this.submit(results)}
          />
        </div>
        <SketchySnackbar handleClose={() => this.setState({snackbarOpen: false})}
                         open={this.state.snackbarOpen}
                         message={this.state.snackbarMessage}/>
      </div>
    )
  }
}
