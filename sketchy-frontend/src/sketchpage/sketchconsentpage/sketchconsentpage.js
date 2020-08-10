import React, { Component } from 'react'
import Util from '../../shared/util'
import {ConsentPage} from "../../consentpage/consentpage";
import {SurveyPage} from "../../surveypage/surveypage";
import {SketchPage} from "../sketchpage";


export class SketchConsentPage extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    // if (Util.environmentIsProduction()) {
    //   this.state.hasAnswered = localStorage.getItem('hasAnswered') !== null
    //   this.state.hasConsented = localStorage.getItem('hasConsented') !== null
    // } else {
    this.state.hasAnswered = sessionStorage.getItem('hasAnswered') !== null
    this.state.hasConsented = sessionStorage.getItem('hasConsented') !== null
    // }
  }

  answerSurvey() {
    localStorage.setItem('hasAnswered', 'answered')
    sessionStorage.setItem('hasAnswered', 'answered')
    this.setState({hasAnswered: true})
    window.scrollTo(0, 0)
  }

  consent() {
    localStorage.setItem('hasConsented', 'consented')
    sessionStorage.setItem('hasConsented', 'consented')
    this.setState({hasConsented: true})
    window.scrollTo(0, 0)
  }

  render() {
    if (!this.state.hasConsented) {
      return <ConsentPage onAnswer={() => this.consent()}/>
    } else if (!this.state.hasAnswered) {
      return <SurveyPage onAnswer={() => this.answerSurvey()}/>
    } else {
      return <SketchPage roomName={this.props.match.params.roomName} history={this.props.history}/>
    }
  }
}
