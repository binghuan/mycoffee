import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import AppBar from 'material-ui/AppBar'
import {List, ListItem} from 'material-ui/List'
import data from '../data/json'
// import {GridList, GridTile} from 'material-ui/GridList'
// import IconButton from 'material-ui/IconButton'
// import StarBorder from 'material-ui/svg-icons/toggle/star-border'
console.log(data)

class MyCoffee extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <AppBar title="My Coffee" />
        <List>
          {
            data.map((item) => (
              <ListItem 
                primaryText={item.name} 
                secondaryText={item.address}
              />
            ))
          }
        </List>
      </div>
    )
  }
}

export default MyCoffee
