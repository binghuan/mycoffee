import React, { Component, PropTypes } from 'react';

export default class StoreDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            store: props.location.state.store || [],
        };
    }

    render() {
        const { store } = this.state;
        return (
            <div>
                <div>{store.name}</div>
                <div>{store.address}</div>
                <div>{store.phone}</div>
                <div>{store.openTime}</div>
                <div>{store.distance}</div>
            </div>
        );
    }
}
