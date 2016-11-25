import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
// import AppBar from '../components/AppBar'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import MyCoffee from './layouts/MyCoffee'
import data from '../data/json'

import injectTapEventPlugin from 'react-tap-event-plugin';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();


class App extends Component {
  constructor(props) {
    super(props)
    console.log(data)
  }

  render() {
    const { children } = this.props;
    return (
      <MuiThemeProvider>
        <MyCoffee data={data} children={children} />
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

// export default connect(mapStateToProps)(App)
export default App;
