import React, { Component } from 'react'
import './analysispage.scss'
import {SketchySnackbar} from "../surveypage/snackbar/sketchysnackbar";
import socket from '../socket-context';
import {Bar, Scatter} from 'react-chartjs-2'

export class AnalysisPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      snackbarOpen: false,
      snackbarMessage: '',
      rooms: [],
      // peekTimes: {},
      numStrokes: {},
      satisfactionData: {},
      numChangeHistogramData: {},
      numPeekHistogramData: {},
      sketchCompletionData: {},
      csiData: {},
      timesPeekedVsTimesChanged: {},
      proportionInspirationalData: {},
      csiComponentData: {},
      csiTableData: {},
      satisfactionP: 'Not enough responses for p value'
    }
  }

  round(number, numDigits) {
    numDigits = numDigits === undefined ? 2 : numDigits
    if (number === null) return null
    return parseFloat(Math.round(number * Math.pow(10, numDigits)) / Math.pow(10, numDigits)).toFixed(numDigits)
  }

  chartOptions(xLabel, yLabel, stacked) {
    xLabel = xLabel === undefined ? '' : xLabel
    yLabel = yLabel === undefined ? '' : yLabel
    return {
      borderWidth: 100,
      backgroundColor: 'rgba(255, 0, 0, 1)',
      categoryPercentage: 0.5,
      scales: {
        yAxes: [{
          stacked: stacked,
          ticks: {
            beginAtZero: true
          },
          gridLines: {color: "rgba(0, 0, 0, 0)"},
          scaleLabel: {
            display: true,
            labelString: yLabel
          }
        }],
        xAxes: [{
          stacked: stacked,
          barPercentage: 0.9,
          maxBarThickness: 50,
          gridLines: {color: "rgba(0, 0, 0, 0)"},
          scaleLabel: {
            display: true,
            labelString: xLabel
          }
        }]
      }
    }
  }

  componentDidMount() {
    socket.emit('reqRoomsDb', (response) => {
      if (response.err) {
        this.showSnackbar(response.message)
      } else {
        let rooms = response.rooms
        for (let room of rooms) {
          room.selected = false
        }
        this.setState({ rooms: rooms })
      }
    })
  }

  showSnackbar(message) {
    this.setState({
      snackbarMessage: message,
      snackbarOpen: true
    })
  }

  static dataPerUserToHistogram(dataPerUser, title) {
    let histogram = []
    for (let id of Object.keys(dataPerUser)) {
      if (dataPerUser.hasOwnProperty(id)) {
        let value = dataPerUser[id]
        if (histogram[value] === undefined) {
          histogram[value] = 0
        }
        histogram[value] += 1
      }
    }
    let labels = []
    for (let i = 0; i < histogram.length; i++) {
      labels.push(i)
      if (histogram[i] === undefined) {
        histogram[i] = 0
      }
    }
    return {
      labels: labels,
      datasets: [
        {
          label: title,
          borderColor: 'rgb(226, 82, 80)',
          backgroundColor: 'rgb(226, 82, 80)',
          data: histogram
        },
      ]
    }
  }

  sum(arr) {
    if (arr.length === 0) {
      return 0
    }
    return arr.reduce((a, b) => a + b)
  }

  average(arr) {
    if (arr.length === 0) {
      return 0
    }
    return arr.reduce((a, b) => a + b) / arr.length
  }

  satisfactionData(data) {
    let peekSatisfaction   = this.average(data.peek)
    let noPeekSatisfaction = this.average(data.noPeek)

    return {
      labels: ['Satisfaction'],
      datasets: [
        {
          label: 'peek',
          borderColor: 'rgb(226, 82, 80)',
          backgroundColor: 'rgb(226, 82, 80)',
          data: [peekSatisfaction]
        },
        {
          label: 'no peek',
          borderColor: 'rgb(81, 105, 224)',
          backgroundColor: 'rgb(81, 105, 224)',
          data: [noPeekSatisfaction]
        }
      ]
    }
  }

  csiData(data) {
    return {
      labels: ['Creativity Support Index'],
      datasets: [
        {
          label: 'peek',
          borderColor: 'rgb(226, 82, 80)',
          backgroundColor: 'rgb(226, 82, 80)',
          data: [data.peek]
        },
        {
          label: 'no peek',
          borderColor: 'rgb(81, 105, 224)',
          backgroundColor: 'rgb(81, 105, 224)',
          data: [data.noPeek]
        }
      ]
    }
  }

  scatterPlotProcessData(data, offset) {
    let newData = []
    for (let value of data) {
      let offsetX = Math.random() * 0.2 - 0.05
      let offsetY = Math.random() * 0.1 - 0.05
      newData.push({x: value + offsetX, y: offset + offsetY})
    }
    return newData
  }

  timesPeekedVsTimesChanged(timesPeekedByUser, timesChangedByUser) {
    let data = []
    for (let id of Object.keys(timesPeekedByUser)) {
      if (timesPeekedByUser.hasOwnProperty(id)) {
        let timesPeeked = timesPeekedByUser[id];
        let timesChanged = timesChangedByUser[id];
        data.push({x: timesPeeked, y: timesChanged})
      }
    }
    return {
      datasets: [
        {
          label: 'Times Peeked vs Times Changed',
          data: data,
          backgroundColor: 'rgb(226, 82, 80)',
        }
      ]
    }
  }

  sketchCompletionData(data) {
    let yesVotes = data.voteYes
    let noVotes = data.voteNo
    return {
      datasets: [
        {
          label: 'Not inspirational',
          data: this.scatterPlotProcessData(noVotes, -1),
          backgroundColor: 'rgb(226, 82, 80)',
        },
        {
          label: 'Inspirational',
          data: this.scatterPlotProcessData(yesVotes, 1),
          backgroundColor: 'rgb(81, 105, 224)',
        }
      ]
    }
  }

  histogramFromLists(features1, features2, title) {
    if (features1 === undefined || features2 === undefined) {
      return {}
    }
    if (features1.length === 0 && features2.length === 0) {
      return {
        keys: [1],
        values1: [],
        values2: []
      }
    }

    features1.sort((a, b) => a - b)
    features2.sort((a, b) => a - b)

    let longerFeatures = features1.length > features2.length ? features1 : features2
    let quartile1 = longerFeatures[Math.floor(longerFeatures.length / 4)]
    let quartile3 = longerFeatures[Math.floor(longerFeatures.length / 4 * 3)]
    let IQR = quartile3 - quartile1
    let binWidth = 2 * IQR * Math.pow(longerFeatures.length, 1/3)

    let min = longerFeatures[0]
    let max = longerFeatures[longerFeatures.length - 1]
    // let numBins = Math.min((max - min) / binWidth, 5) + 1
    let numBins = 20
    binWidth  = (max - min) / (numBins - 1)

    let keys = []
    for (let i = 0; i < numBins; i++) {
      keys.push(this.round(min + i * binWidth, 3))
    }

    let values1 = []
    let values2 = []
    for (let item of keys) {
      values1.push(0)
      values2.push(0)
    }

    for (let value of features1) { // Put in values based on the keys involved
      values1[Math.floor((value - min) / binWidth)] += 1 / features1.length
    }

    for (let value of features2) {
      values2[Math.floor((value - min) / binWidth)] += 1 / features2.length
    }

    return {
      labels: keys,
      title: title,
      datasets: [
        {
          label: 'Voted Yes',
          borderColor: 'rgb(226, 82, 80)',
          backgroundColor: 'rgb(226, 82, 80)',
          data: values1
        },
        {
          label: 'Voted No',
          borderColor: 'rgb(81, 105, 224)',
          backgroundColor: 'rgb(81, 105, 224)',
          data: values2
        }
      ]
    }
  }

  featuresDatasets() {
    if (this.state.features === undefined) {
      return []
    }
    let yesFeatures = this.state.features.peekYes
    let noFeatures = this.state.features.peekNo

    // Make sure each set of features has the same set of keys
    for (let key of Object.keys(yesFeatures)) {
      if (yesFeatures.hasOwnProperty(key) && !noFeatures.hasOwnProperty(key)) {
        noFeatures[key] = []
      }
    }
    for (let key of Object.keys(noFeatures)) {
      if (noFeatures.hasOwnProperty(key) && !yesFeatures.hasOwnProperty(key)) {
        yesFeatures[key] = []
      }
    }
    let graphs = []
    for (let feature of Object.keys(yesFeatures)) {
      if (yesFeatures.hasOwnProperty(feature)) {
        graphs.push(this.histogramFromLists(yesFeatures[feature], noFeatures[feature], feature))
      }
    }
    return graphs
  }

  peekTimeData() {
    if (this.state.peekTimes === undefined) {
      return {}
    }
    let inspirationalTimes = this.state.peekTimes.inspirational
    let notInspirationalTimes = this.state.peekTimes.notInspirational
    return {
      datasets: [
        {
          label: 'Not inspirational',
          data: this.scatterPlotProcessData(notInspirationalTimes, -1),
          backgroundColor: 'rgb(226, 82, 80)',
        },
        {
          label: 'Inspirational',
          data: this.scatterPlotProcessData(inspirationalTimes, 1),
          backgroundColor: 'rgb(81, 105, 224)',
        }
      ]
    }
  }


  proportion(peekCounts, peekYesCounts) {
    let proportions = []
    for (let key of Object.keys(peekCounts)) {
      if (peekCounts.hasOwnProperty(key) && peekCounts[key] !== 0 && peekCounts[key] !== null) {
        proportions.push(peekYesCounts[key] / peekCounts[key])
      }
    }

    let histogram = []
    let labels = ['>= 0', '>= 0.1', '>= 0.2', '>= 0.3', '>= 0.4', '>= 0.5', '>= 0.6', '>= 0.7', '>= 0.8', '>= 0.9', '1.0']
    // [0, 0.1, 0.2, 0.3, ... 1]
    for (let i = 0; i <= 1; i += .1) {
      histogram.push(0)
    }

    for (let proportion of proportions) {
      histogram[Math.floor(proportion * 10)] += 1
    }

    return {
      labels: labels,
      datasets: [
        {
          label: 'Proportion of peeks',
          borderColor: 'rgb(226, 82, 80)',
          backgroundColor: 'rgb(226, 82, 80)',
          data: histogram
        },
      ]
    }
  }


  csiComponentDataset(raw) {
    let counts = raw.counts
    let results = raw.results
    let dataset = []
    for (let key of Object.keys(results)) {
      if (results.hasOwnProperty(key)) {
        dataset.push(this.average(results[key]))
      }
    }
    return dataset
  }

  csiComponentData(response) {
    let peekRaw = response.csi.peekRaw
    let noPeekRaw = response.csi.noPeekRaw

    return {
      labels: Object.keys(response.csi.peekRaw.results),
      datasets: [
        {
          label: 'peek',
          borderColor: 'rgb(226, 82, 80)',
          backgroundColor: 'rgb(226, 82, 80)',
          data: this.csiComponentDataset(peekRaw)
        },
        {
          label: 'no peek',
          borderColor: 'rgb(81, 105, 224)',
          backgroundColor: 'rgb(81, 105, 224)',
          data: this.csiComponentDataset(noPeekRaw)
        }
      ]
    }
  }

  csiTableData(response) {
    let resultsPeek = response.csi.peekRaw.results
    let resultsNoPeek = response.csi.noPeekRaw.results
    let tableData = {}
    for (let key of Object.keys(resultsPeek)) {
      tableData[key] = {
        peek: this.round(this.average(resultsPeek[key])),
        noPeek: this.round(this.average(resultsNoPeek[key])),
      }
      for (let stat of Object.keys(response.csi.stats[key])) {
        tableData[key][stat] = this.round(response.csi.stats[key][stat])
      }
    }
    return tableData
  }

  analyze() {
    let selectedRooms = []
    for (let room of this.state.rooms) {
      if (room.selected) {
        selectedRooms.push(room.name)
      }
    }
    if (selectedRooms.length === 0) {
      return this.showSnackbar("You must select some rooms to analyze")
    }
    socket.emit('getAnalysis', selectedRooms, (response) => {
      console.log("Response is ")
      console.log(response)
      if (response.error) {
        return this.showSnackbar("An error occurred")
      }
      this.setState(response)
      this.setState({
        csiData: this.csiData(response.csi),
        csiTableData: this.csiTableData(response),
        csiComponentData: this.csiComponentData(response),
        satisfactionData: this.satisfactionData(response.satisfaction),
        numChangeHistogramData: AnalysisPage.dataPerUserToHistogram(
          response.peekYesCounts, 'Number of times changed sketch in peek rooms'),
        numPeekHistogramData: AnalysisPage.dataPerUserToHistogram(
          response.peekCounts, 'Number of times peeked'),
        sketchCompletionData: this.sketchCompletionData(response.numStrokes),
        timesPeekedVsTimesChanged: this.timesPeekedVsTimesChanged(response.peekCounts, response.peekYesCounts),
        proportionInspirationalData: this.proportion(response.peekCounts, response.peekYesCounts)
      })
    })
  }

  clickRoom(index) {
    let roomsCopy = JSON.parse(JSON.stringify(this.state.rooms))
    roomsCopy[index].selected = !roomsCopy[index].selected
    this.setState({rooms: roomsCopy})
  }

  renderRooms() {
    let rooms
    if (this.state.rooms.length === 0) {
      rooms = <li className='no-rooms'>There are no rooms available.</li>
    } else {
      rooms = this.state.rooms.map((room, index) => {
        return (
          <li className={"room " + (room.selected ? 'selected' : "")}
              key={room.name} onClick={() => this.clickRoom(index)}>
            <div className="room-name">
              {room.name.replace('_', ' ') + ' - ' + room.type}
              <span className='is-deleted'>
                  {this.props.all && (room.isDeleted || room.permanentDeleted) ? " [deleted]" : ""}
              </span>
            </div>

            <div className="room-stats">
              <span className="num-participants">{room.userSketches.length}</span>
            </div>
          </li>
        )
      })
    }
    return (
      <div id='roomList'>
        <ul>
          <li className="header">
            <div className="room-name">ROOM NAME</div>
            <div className="room-stats">
              <span className="num-participants">Number of sketches</span>
            </div>
          </li>
          {rooms}
        </ul>
      </div>
    )
  }

  preSurveyLikertData(data) {
    if (data === undefined) {
      return {}
    }
    data = data.filter((obj) => obj !== null)
    if (data.length === 0) {
      return {}
    }

    let csiFields = ['exploration', 'collaboration', 'expressiveness', 'engagement', 'transparency', 'effort']
    let allCsiFields = []
    for (let i = 0; i < csiFields.length; i++) {
      for (let j = i + 1; j < csiFields.length; j++) {
        let field1 = csiFields[i]
        let field2 = csiFields[j]
        allCsiFields.push(field1 + '-' + field2)
      }
    }

    let compiled = {}
    for (let result of data) {
      for (let key of Object.keys(result)) {
        if (result.hasOwnProperty(key)) {
          if (!Array.isArray(result[key])) { // Check if question is a likert scale question
            if (allCsiFields.indexOf(key) === -1) { // Check if question is not a CSI question
              if (compiled[key] === undefined) {
                compiled[key] = [0, 0, 0, 0, 0]
              }
              let entry = result[key]
              if ([1, 2, 3, 4, 5].indexOf(entry) !== -1) {
                compiled[key][entry - 1] += 1
              }
            }
          }
        }
      }
    }
    let datasets = []
    let colors = ['#CC3333', '#EA999A', '#D9D9D8', '#A8C1E5', '#4A75BA']
    let keys = []
    for (let key of Object.keys(compiled)) {
      if (compiled.hasOwnProperty(key)) {
        keys.push(key)
      }
    }

    for (let i = 1; i <= 5; i++) {
      let dataset = {
        label: i,
        borderColor: colors[i-1],
        backgroundColor: colors[i-1],
        data: []
      }
      for (let key of keys) {
        dataset.data.push(compiled[key][i-1] / this.sum(compiled[key])) // Normalize
      }
      datasets.push(dataset)
    }
    let counts = []
    let averages = []

    for (let key of keys) {
      let count = this.sum(compiled[key])
      counts.push(count)
      let total = 0
      for (let i=1; i<=5; i++) {
        total += compiled[key][i-1] * i
      }
      if (count !== 0) {
        averages.push(total / count)
      } else {
        averages.push(0)
      }
    }
    return {
      labels: keys,
      datasets: datasets,
      stats: (
        <div className='stats-container'>
          <div className='pvalue'>
            Count: {counts.map((count, index) => <span key={index} className='sum'>{count}</span>)}
          </div>
          <div className='pvalue'>
            Average: {averages.map((average, index) => <span key={index} className='sum'>{this.round(average)}</span>)}
          </div>
        </div>
      )
    }
  }

  inspirationByDeviceData() {
    let data = this.state.inspirationByDevice
    if (data === undefined) return {}
    return {
      labels: ['mobile', 'desktop'],
      datasets: [
        {
          label: 'inspirational',
          borderColor: 'rgb(226, 82, 80)',
          backgroundColor: 'rgb(226, 82, 80)',
          data: [data.mobile.yes, data.desktop.yes]
        },
        {
          label: 'not inspirational',
          borderColor: 'rgb(81, 105, 224)',
          backgroundColor: 'rgb(81, 105, 224)',
          data: [data.mobile.no, data.desktop.no]
        }
      ]
    }
  }

  deviceByInspirationData() {
    let data = this.state.inspirationByDevice
    if (data === undefined) return {}
    return {
      labels: ['inspirational', 'not inspirational'],
      datasets: [
        {
          label: 'mobile',
          borderColor: 'rgb(226, 82, 80)',
          backgroundColor: 'rgb(226, 82, 80)',
          data: [data.mobile.no, data.mobile.yes]
        },
        {
          label: 'desktop',
          borderColor: 'rgb(81, 105, 224)',
          backgroundColor: 'rgb(81, 105, 224)',
          data: [data.desktop.no, data.desktop.yes]
        }
      ]
    }
  }

  render() {
    let completionOptions = this.chartOptions('Number of strokes')
    completionOptions.scales.yAxes[0].ticks = {display: false}

    return (
      <div id="analysisPage">
        <div className='page-content'>
          <div className='page-header'>Analysis Page</div>
          Click on table rows to select rooms to analyze.

          {this.renderRooms()}
          <SketchySnackbar handleClose={() => this.setState({snackbarOpen: false})}
                           open={this.state.snackbarOpen}
                           message={this.state.snackbarMessage}/>
          <div className='button-row'>
            <div className='button' onClick={() => this.analyze()}>
              Run Analysis
            </div>
          </div>

          <div className='graph-container'>
            <Bar data={this.state.satisfactionData} options={this.chartOptions()} width={600} height={250}/>
            <div className={'stats-container'}>
              <div className={'pvalue '}>
                n in peek: {this.state.satisfaction !== undefined ? this.state.satisfaction.peek.length : 0}
              </div>
              <div className={'pvalue '}>
                n in no peek: {this.state.satisfaction !== undefined ? this.state.satisfaction.noPeek.length : 0}
              </div>
              <div className={'pvalue ' + (this.state.satisfactionP === undefined ? 'hidden' : '')}>
                p-value: {this.state.satisfactionP}
              </div>
            </div>
          </div>

          <div className='graph-container'>
            <Bar data={this.state.csiData} options={this.chartOptions()} width={600} height={250}/>
            <div className={'stats-container'}>
              <div className='pvalue'>
                n in peek: {this.state.csi !== undefined ? this.state.csi.numPeek : 0}
              </div>
              <div className='pvalue'>
                n in no peek: {this.state.csi !== undefined ? this.state.csi.numNoPeek : 0}
              </div>
              <div className={'pvalue ' + (this.state.satisfactionP === undefined ? 'hidden' : '')}>
                p-value: {this.state.satisfactionP}
              </div>
            </div>
          </div>

          <div className='graph-container'>
            <Bar data={this.state.csiComponentData} options={this.chartOptions('CSI component', 'average')} width={600} height={250}/>
            <div className={'stats-container'}>
            </div>
          </div>

          <div className={'graph-container'}>
            {Object.keys(this.state.csiTableData).map((key) => {
              return (
                <div className="csi-table-row" key={key}>
                  <div className='table-label item'>
                    {key}
                  </div>
                  {Object.keys(this.state.csiTableData[key]).map((key2) =>
                    <div className='table-value item'>
                    {key2}: {this.state.csiTableData[key][key2]}
                    </div>)
                  }
                </div>
              )
            })}
          </div>

          <div className='graph-container'>
            <Bar data={this.state.numChangeHistogramData} options={this.chartOptions('Number of changes', 'Number of occurrences')}
                 width={600} height={250}/>
            <div className={'stats-container'}>
              <div className='pvalue'>
                Average peeks: {this.state.averagePeeks !== undefined ? this.round(this.state.averagePeeks) : 0}
              </div>
              <div className='pvalue'>
                Standard errors: {this.state.stderrPeeks !== undefined ? this.round(this.state.stderrPeeks) : 0}
              </div>
            </div>
          </div>
          <div className='graph-container'>
            <Bar data={this.state.numPeekHistogramData} options={this.chartOptions('Number of peeks', 'Number of occurrences')}
              width={600} height={250}/>
            <div className={'stats-container'}>
              <div className='pvalue'>
                Average Yes peeks: {this.state.averagePeeksYes !== undefined ? this.round(this.state.averagePeeksYes) : 0}
              </div>
              <div className='pvalue'>
                Standard errors Yes peeks: {this.state.stderrPeeksYes !== undefined ? this.round(this.state.stderrPeeksYes) : 0}
              </div>
            </div>
          </div>

          <div className='graph-container'>
            <Bar data={this.state.proportionInspirationalData} options={this.chartOptions('Proportion', 'Number of occurrences')}
                 width={600} height={250}/>
            <div className={'stats-container'}>
             </div>
          </div>
          <div className='graph-container'>
            <Scatter data={this.state.sketchCompletionData} options={completionOptions}
                     width={600} height={250}/>
          </div>
          <div className='graph-container'>
            <Scatter data={this.peekTimeData()} options={this.chartOptions('Peek Time (ms)')}
                     width={600} height={250}/>
          </div>
          <div className='graph-container'>
            <Scatter data={this.state.timesPeekedVsTimesChanged} options={this.chartOptions('Times peeked', 'Times Changed Sketch')}
                     width={600} height={250}/>
          </div>

          <div className='graph-container'>
            <div className='graph-title'>
              Peek room pre survey results
            </div>
            <Bar data={this.preSurveyLikertData(this.state.preResultsPeek)}
                 options={this.chartOptions('pre survey question', 'cumulative percentage', true)} width={600} height={250}/>
            {this.preSurveyLikertData(this.state.preResultsPeek).stats}
          </div>

          <div className='graph-container'>
            <div className='graph-title'>
              No peek room pre survey results
            </div>
            <Bar data={this.preSurveyLikertData(this.state.preResultsNoPeek)}
                 options={this.chartOptions('pre survey question', 'cumulative percentage', true)} width={600} height={250}/>
            {this.preSurveyLikertData(this.state.preResultsNoPeek).stats}
          </div>

          <div className='graph-container'>
            <div className='graph-title'>
              Peek room post survey results
            </div>
            <Bar data={this.preSurveyLikertData(this.state.postResultsPeek)}
                 options={this.chartOptions('pre survey question', 'cumulative percentage', true)} width={600} height={250}/>
            {this.preSurveyLikertData(this.state.postResultsPeek).stats}
          </div>

          <div className='graph-container'>
            <div className='graph-title'>
              No peek room post survey results
            </div>
            <Bar data={this.preSurveyLikertData(this.state.postResultsNoPeek)}
                 options={this.chartOptions('pre survey question', 'cumulative percentage', true)} width={600} height={250}/>
            {this.preSurveyLikertData(this.state.postResultsNoPeek).stats}
          </div>

          <div className='graph-container'>
            <div className='graph-title'>
              Inspiration by device type
            </div>
            <Bar data={this.inspirationByDeviceData()}
                 options={this.chartOptions('Device type', 'Num votes', true)} width={600} height={250}/>
          </div>

          <div className='graph-container'>
            <div className='graph-title'>
              Device Type by inspiration
            </div>
            <Bar data={this.deviceByInspirationData()}
                 options={this.chartOptions('Inspiration', 'Num votes', true)} width={600} height={250}/>
          </div>
          {this.featuresDatasets().map((dataset) => {
            return (<div className='graph-container'>
              <div className='graph-title'>
                {dataset.title} histogram
              </div>
              <Bar data={dataset}
                   options={this.chartOptions(dataset.title, 'Num occurances', false)} width={600} height={250}/>
            </div>)
          })}

          {/*<div className='graph-container'>*/}
            {/*<Scatter data={this.state.sketchCompletionData} options={completionOptions}*/}
                     {/*width={600} height={250}/>*/}
          {/*</div>*/}
          {/*<div className='graph-container'>*/}
            {/*<Scatter data={this.peekTimeData()} options={this.chartOptions('Peek Time (ms)')}*/}
                     {/*width={600} height={250}/>*/}
          {/*</div>*/}

          {this.state.peekTimes &&
          <div className='graph-container'>
            <div className='graph-title'>
              Peek time
            </div>
            <Bar data={this.histogramFromLists(this.state.peekTimes.inspirational, this.state.peekTimes.notInspirational)}
                 options={this.chartOptions('Peek time (ms)', 'Num occurances', false)} width={600} height={250}/>
          </div>
          }
          <div className='graph-container'>
            <div className='graph-title'>
            </div>
            <Bar data={this.histogramFromLists(this.state.numStrokes.voteYes, this.state.numStrokes.voteNo)}
                 options={this.chartOptions('num strokes', 'Num occurances', false)} width={600} height={250}/>
          </div>
        </div>
      </div>
    )
  }
}
