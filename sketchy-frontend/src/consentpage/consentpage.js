import React, { Component } from 'react';
import './consentpage.scss';
import brownLogo from './logo.png'
import sketchyLogo from '../homepage/logo.png';
import {CheckboxQuestion} from "../surveypage/checkboxquestion/checkboxquestion";


export class ConsentPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      consented: false
    }
  }

  onCheckboxChange() {
    console.log()
    this.setState({consented: !this.state.consented})
  }

  onContinue() {
    if (this.state.consented) {
      this.props.onAnswer()
    }
  }

  render() {
    return (
      <div id="consentPage">
        <div className="content-container">
          <div className='header-bar'>
            <img src={sketchyLogo} alt="Logo" />
            <div className='main-heading'>
              Create rough sketches with your mouse or finger.
            </div>
          </div>
          <div className='card'>
            <div className="questions-partition partition">
              <div className='section brown-logo-section'>
                <img src={brownLogo} alt="Brown University" className='brown-logo'/>
              </div>
              <div className='section'>
                <div className='consent-header'>
                  Consent Form for participating in a Research Study at Brown University
                </div>
              </div>
              <div className='section'>
                <div className='heading'>
                  KEY INFORMATION
                </div>
                <div className='text'>
                  Please consider this information carefully before deciding whether to participate in this research.
                  Your participation is voluntary.
                </div>
              </div>
              <div className='section'>
                <div className='heading'>
                  Purpose of the research
                </div>
                <div className='text'>
                  You are invited to participate in a research study conducted by Prof. Jeff Huang and Shaun Wallace.
                  The purpose of the research is to examine how you draw on a mobile/tablet/computer using the Sketchy
                  web application.
                </div>
              </div>
              <div className='section'>
                <div className='heading'>
                  Procedures
                </div>
                <div className='text'>
                  You will perform activities where you will be asked to draw various images on a computer. <br/><br/>
                  We will track your interactions with the interface.
                  No video will be captured or streamed to us.
                  We only evaluate your interactions with the system.
                  We will ask pre and post survey questions about sketching.
                  These questions are voluntary.
                  The data gathered will be shared publicly and anonymously.
                </div>
              </div>
              <div className='section'>
                <div className='heading'>
                  Time Involved
                </div>
                <div className='text'>
                  We anticipate the overall duration of the study will last approximately 15-25 minutes.
                </div>
              </div>
              <div className='section'>
                <div className='heading'>
                  Compensation
                </div>
                <div className='text'>
                  There is no direct compensation for participation.
                </div>
              </div>
              <div className='section'>
                <div className='heading'>
                  Risks
                </div>
                <div className='text'>
                  There are no anticipated risks associated with participating in this study.
                  The effects of participating should be comparable to those you would experience from viewing a computer
                  monitor for approximately 15-25 minutes and using a mouse or keyboard other than those linked with using
                  computers.
                </div>
              </div>
              <div className='section'>
                <div className='heading'>
                  Benefits
                </div>
                <div className='text'>
                  There are no direct benefits from the participation in this study, other than furthering the understanding
                  of how users interact with computers.
                  If you wish, you can send an email message to shaun_wallace@brown.edu and we will send you a copy of any
                  manuscripts based on the research (or summaries of our results).
                </div>
              </div>
              <div className='section'>
                <div className='heading'>
                  Disclaimer
                </div>
                <div className='text'>
                  If the authors can potentially benefit from this tool or if it is commercialized the authors could
                  potentially benefit even though the participants may not.
                </div>
              </div>
              <div className='section'>
                <div className='heading'>
                  Confidentiality
                </div>
                <div className='text'>
                  Your participation in this study will remain confidential, and any personal information submitted will
                  not be stored with your data.
                  Your responses will be assigned a code number.
                </div>
              </div>
              <div className='section'>
                <div className='heading'>
                  Participation and withdrawal
                </div>
                <div className='text'>
                  Your participation in this study is completely voluntary, and you may withdraw at any time without
                  penalty.
                  You may withdraw by simply closing your internet browser.
                </div>
              </div>
              <div className='section'>
                <div className='heading'>
                  To Contact the Researcher
                </div>
                <div className='text'>

                  If you have questions about this research, please contact: <br/>
                  <br/>
                  Shaun Wallace <br/>
                  115 Waterman Street <br/>
                  Office 409 <br/>
                  Providence, RI 02912 <br/>
                  401-952-3248 <br/>
                  shaun_wallace@brown.edu <br/>
                  <br/>
                  You may also contact the faculty member supervising this work: <br/>
                  <br/>
                  Jeff Huang <br/>
                  115 Waterman Street <br/>
                  Office 407 <br/>
                  Providence, RI 02912 <br/>
                  401-450-8949 <br/>
                  jeff_huang@brown.edu <br/>
                  <br/>
                  Whom to contact about your rights in this research, for questions, concerns, suggestions, or complaints that are not being addressed by the researcher: Human Research Protection Program of Brown University, <br/>
                  <br/>
                  Phone: 401-863-3050. E-mail: IRB@brown.edu <br/>
                </div>
              </div>
              <div className='section agreement'>
                <div className='heading'>
                  Agreement <span className='asterisk'>*</span>
                </div>
                <div className='text'>
                  The nature and purpose of this research has been sufficiently explained and I agree to participate in this study. I understand that I am free to withdraw at any time without incurring any penalty. I consent that my data gathered in the past, present, or future with the Sketchy web application can be used anonymously for studies.
                </div>
                <CheckboxQuestion question={''}
                                  options={['I agree']}
                                  onChange={() => this.onCheckboxChange()}
                />
              </div>
              <div className="button-container">
                <div className={"button " + (this.state.consented ? '' : 'disabled')}
                     onClick={() => this.onContinue()}>Continue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
