import React, { Component } from 'react'
import './postsurveypage.scss'
import socket from '../socket-context'
import {SurveyQuestions} from "../surveypage/surveyquestions/surveyquestions";
import Util from "../shared/util";
import {SketchySnackbar} from "../surveypage/snackbar/sketchysnackbar";


export class PostSurveyPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      snackbarOpen: false,
      snackbarMessage: '',
    }
    this.questions = [
      {
        field: 'exploration',
        type: 'likert',
        question: 'Exploration',
        description: 'It was easy for me to explore many different options, ideas, designs, or outcomes ' +
          'without a lot of tedious, repetitive interaction.',
      },
      {
        field: 'collaboration',
        type: 'likert',
        question: 'Collaboration',
        description: 'I was able to work together with others easily while doing this activity.',
      },
      {
        field: 'engagement',
        type: 'likert',
        question: 'Engagement',
        description: 'I was very absorbed/engaged in this activity - I enjoyed it and would do it again.',
      },
      {
        field: 'effort',
        type: 'likert',
        question: 'Effort / Reward Tradeoff',
        description: 'What I was able to produce was worth the effort required to produce it.',
      },
      {
        field: 'transparency',
        type: 'likert',
        question: 'Tool Transparency',
        description: 'While I was doing the activity, the tool/interface/system "disappeared," and I was able to ' +
          'concentrate on the activity.',
      },
      {
        field: 'expressiveness',
        type: 'likert',
        question: 'Expressiveness',
        description: 'I was able to be very expressive and creative while doing the activity.',
      },
      // {
      //   type: 'prompt',
      //   question: 'Creativity Support Index - Factor Rankings',
      //   description: 'For each pair below, please select which factor is most important to you when doing this activity.',
      //   className: 'csi-prompt'
      // }
    ]
    let fields = ['exploration', 'collaboration', 'expressiveness', 'engagement', 'tool_transparency', 'effort_/_reward_tradeoff']
    let fieldKeys = ['exploration', 'collaboration', 'expressiveness', 'engagement', 'transparency', 'effort']
    this.questions.push({
      type: 'rank',
      question: 'Rank the following components in order of importance. 1 is most important and 6 is least important.',
      field: 'csi-rank',
      fields: fields,
      fieldKeys: fieldKeys
    })

    // for (let i = 0; i < fields.length; i++) {
    //   for (let j = i+1; j < fields.length; j++) {
    //     let field1 = fields[i]
    //     let field2 = fields[j]
    //     this.questions.push({
    //       field: fieldKey[i] + '-' + fieldKey[j],
    //       className: 'comparison',
    //       type: 'likert',
    //       labels: ['', ''],
    //       values: [field1.replace(/_/g, ' '), field2.replace(/_/g, ' ')]
    //     })
    //   }
    // }

    this.questions.push({type: 'prompt'})
    this.questions.push({type: 'prompt'})

    let additionalQuestions = [
        {
          field: 'how-effective',
          question: 'How effective was the Peek feature for finding inspirational sketches?',
          labels: ['Not Effective', '', '', '', 'Effective']
        },
    //   {
    //     field: 'peek-effective-finding-inspirational',
    //     question: 'How effective was the Peek feature for finding inspirational sketches?',
    //     labels: ['Not inspirational', '', '', '', 'Inspirational']
    //   },
    //   {
    //     field: 'peek-effective-improving',
    //     question: 'How effective was the Peek feature for improving your own sketch?',
    //     labels: ['Not effective', '', '', '', 'Effective']
    //   },

      // Use these in peek
      {
        field: 'effective-conceptually-different',
        question: 'How effective was viewing a sketch conceptually different from your own for inspiration?',
        labels: ['Not effective', '', '', '', 'Effective']
      },
      {
        field: 'effective-conceptually-similar',
        question: 'How effective was viewing a sketch conceptually similar to your own for inspiration?',
        labels: ['Not effective', '', '', '', 'Effective']
      },
    //   {
    //     field: 'effective-conceptually-similar-neighbor',
    //     question: 'How effective was viewing the sketches of people sitting next to you for inspiration?',
    //     labels: ['Not effective', '', '', '', 'Effective']
    //   },
    //   {
    //     field: 'peeked-sketch-quality',
    //     question: 'What was the quality of the sketches you peeked?',
    //     labels: ['Low Quality', '', '', '', 'High Quality']
    //   },
    //   {
    //     field: 'peeked-sketch-novelty',
    //     question: 'How novel were the sketches you peeked?',
    //     labels: ['Not novel', '', '', '', 'Novel']
    //   },
    //   {
    //     field: 'peeked-sketch-variety',
    //     question: 'How was the variety of concepts you observed from the peeked sketches?',
    //     labels: ['Low variety', '', '', '', 'High Variety']
    //   },
    //   {
    //     field: 'number-design-concepts',
    //     question: 'How many different design concepts did you observe from peeking other sketches?',
    //     values: ['0', '1-2', '3-4', '4-5', '6+'],
    //     labels: ['', '', '', '', '']
    //   }
    ]

    for (let question of additionalQuestions) {
      this.questions.push({
        type: 'likert',
        className: 'our-questions',
        ...question
      })
    }
  }

  submit(results) {
    let data = {}
    data.results = results
    data.userId = Util.getUserId()

    socket.emit('submitPostSurvey', data, (response) => {
      if (response.error) {
        this.showSnackbar(response.message)
      } else {
        this.props.history.push('/')
      }
    })
  }

  showSnackbar(message) {
    this.setState({
      snackbarMessage: message,
      snackbarOpen: true
    })
  }

  render() {
    return (
      <div id="surveyPage">
        <div className={"content-container"}>
          <div className="welcome">
            <div className="header">
              Post Survey
            </div>
            <div className="desc">
              How did you feel about this activity?
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
