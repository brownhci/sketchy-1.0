import React, { Component } from 'react';
import './App.css';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import { HomePage } from "./homepage/homepage";
import { Helmet } from 'react-helmet';
import { PostSurveyPage } from "./postsurveypage/postsurveypage";
import { AdminPage } from "./adminpage/adminpage";
import { AdminLobby } from "./adminpage/adminlobby/adminlobby"
import {SketchConsentPage} from "./sketchpage/sketchconsentpage/sketchconsentpage";
import {HistoryPage} from "./adminpage/historypage/historypage";
import {AnalysisPage} from "./analysispage/analysispage";
import {PostRoomSurveyPage} from "./postroomsurveypage/postroomsurveypage";


class App extends Component {
  render() {
    return (
      <div className="App">
        <Helmet>
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
          />
        </Helmet>
        <BrowserRouter onUpdate={() => window.scrollTo(0, 0)}>
          <Switch>
            <Route path='/admin/analysis' component={AnalysisPage}/>
            <Route path='/admin/history/:roomName/:userId' component={HistoryPage}/>
            <Route path='/admin/:roomName/:type' component={AdminPage}/>
            <Route path='/admin/' component={AdminLobby}/>
            {/*<Route path='/consentpage' component={ConsentPage}/>*/}
            <Route path='/postsurvey' component={PostSurveyPage}/>
            <Route path='/postroomsurvey/:roomName/:targetRoomName' component={PostRoomSurveyPage}/>
            <Route path='/sketch/:roomName' component={SketchConsentPage}/>
            <Route path='/' component={HomePage}/>
          </Switch>
        </BrowserRouter>
      </div>
    )
  }
}

export default App;
