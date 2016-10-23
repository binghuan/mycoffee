import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import {List, ListItem} from 'material-ui/List';
import { convertDistanceString } from '../utils/helper';

export default class ListStore extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: props.data? props.data : [],
        };
    }

    handleStoreClicked(store) {
        console.log(store);
        browserHistory.push({
          pathname: '/store_details',
          state: {
              store
          },
        });
    }

    render() {

        return (
            <List>
            {
                this.state.data.map((store) => (
                    <ListItem 
                    primaryText={store.name} 
                    secondaryText={`${store.address} (${convertDistanceString(store.distance)})`}
                    onClick={() => ::this.handleStoreClicked(store)}
                    />
                ))
            }
            </List>
        );
    }
}
