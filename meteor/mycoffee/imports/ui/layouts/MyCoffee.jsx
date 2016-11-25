import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { browserHistory, router } from 'react-router'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
// import {GridList, GridTile} from 'material-ui/GridList'
// import IconButton from 'material-ui/IconButton'
// import StarBorder from 'material-ui/svg-icons/toggle/star-border'
import { getCurrentLocation, getLastGeolocation, setLastGeolocation, getDistance } from '../../utils/Geolocation'

let DBG = true;

class MyCoffee extends Component {

    static propTypes = {
      data: PropTypes.object,
      children: PropTypes.object,
    };

  constructor(props) {
    super(props)
    this.state = {data: props.data, open: false}
    this.handleToggle = this.handleToggle.bind(this)
    getCurrentLocation((pos) => {
        let { data } = this.state;
        // if(DBG)console.log("++ successGetGeoInfo");
        let latlon = pos.coords.latitude + "," + pos.coords.longitude;

        if(DBG)console.log("get current possision is " + latlon);

        var currentGeolocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };

        setLastGeolocation(currentGeolocation);
        // longitude - 經度 - 縱線
        // latitude - 緯度 - 水平線

        // try to get the store info. which is near by me
        // listStoreData(this.state.data);
        if(DBG){console.log("listStoreData from server:" + data.length);}

        var currentGeolocation = getLastGeolocation();

        data.forEach(function(item, index) {
            item.distance = getDistance(currentGeolocation.latitude, currentGeolocation.longitude,
                                        item.latitude, item.longitude);
        });

        // sort by distance
        data = data.sort((a, b) => a.distance - b.distance)

        if(DBG)console.log(data);

        if(DBG)console.log("Data is ready ^_^ b :" + data.length);

        this.setState({data: data});

        // TODO: update current address
        if(navigator.onLine === true && typeof GMap !== 'undefined') {
            // GMap.utils.getCurrentAddress(currentGeolocation).done(function(address) {
                // $('#addressInfo').html(address);
            // }).fail(function() {
                // $('#addressInfo').html('更新地理位置:' + lastUpdate);
            // });
        }
        else {
            // $('#addressInfo').html('更新地理位置:' + lastUpdate);
        }
    });

  }

  handleToggle() {
      this.setState({open: !this.state.open})
  }

  render() {
    const { children } = this.props;
    return (
      <div>
        <AppBar
            title="My Coffee" 
            onLeftIconButtonTouchTap={this.handleToggle}
            showMenuIconButton={true}
            isInitiallyOpen={true}
        />
        {React.cloneElement(children, {...this.state})}
        <Drawer open={this.state.open} onTap={this.handleToggle}>
            <MenuItem>Menu Item</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
        </Drawer>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
  }
}

// export default connect(mapStateToProps)(MyCoffee);
export default MyCoffee
