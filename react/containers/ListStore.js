import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import {List, ListItem} from 'material-ui/List';

export default class ListStore extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: props.data? props.data : [],
        };
    }

    convertDistanceString(distance) {
        if (distance == null) {
            return 'Unknown';
        }
        return (distance >= 1000)? ((distance / 1000.0).toFixed(1) + '公里') : (distance + '公尺');
    }

    handleStoreClicked(store) {
        console.log(store);
        browserHistory.push({
          pathname: '/store_details',
          state: {
              store
          },
        });
        // browserHistory.push('/store_details');
    }

    render() {

        return (
            <List>
            {
                this.state.data.map((store) => (
                    <ListItem 
                    primaryText={store.name} 
                    secondaryText={`${store.address} (${::this.convertDistanceString(store.distance)})`}
                    onClick={() => ::this.handleStoreClicked(store)}
                    />
                ))
            }
            </List>
        );
    }
}
