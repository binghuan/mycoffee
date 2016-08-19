import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
// import AppBar from '../components/AppBar'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import MyCoffee from './MyCoffee'


class App extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <MuiThemeProvider>
        <MyCoffee />
      </MuiThemeProvider>
    )
  }
}

App.propTypes = {
}

function mapStateToProps(state, ownProps) {
  return {
  }
}

export default connect(mapStateToProps)(App)
