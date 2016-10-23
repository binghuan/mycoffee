import React, { Component, PropTypes } from 'react';
import FontIcon from 'material-ui/FontIcon';
import { getTodayOpeningHour, isOpeningNow } from '../utils/helper';

export default class StoreDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            store: props.location.state.store || [],
        };
    }

    render() {
        const { store } = this.state;

        store.openingHour = getTodayOpeningHour(store.openingTime);
        let openingHourString = store.openingHour;
        if(store.openingHour == null) {
            openingHourString = '休息';
        }
        else {
            var isOpen = isOpeningNow(store.openingHour);
            if(!isOpen) {
                openingHourString += ('(關店)');
            }
        }
        return (
            <div>
                <h2>{store.name}</h2>
                <div>
                    <a href={`//maps.google.com.tw/?q=${store.address}`} target="_blank">
                        <FontIcon className="material-icons">location_on</FontIcon>
                        <span>{store.address}</span>
                    </a>
                </div>

                {store.phone &&
                    <div>
                        <a href={`tel:${store.phone}`} target="_blank">
                            <FontIcon className="material-icons">phone</FontIcon>
                            {store.phone}
                        </a>
                    </div>
                }
                {openingHourString &&
                    <div>
                        <FontIcon className="material-icons">info</FontIcon>
                        <span>{openingHourString}</span>
                    </div>
                }
                {store.openTime &&
                    <div>
                        <FontIcon className="material-icons">info</FontIcon>
                        <span>{store.openTime}</span>
                    </div>
                }
                <iframe src="//maps.google.com.tw/maps/?q={{address}}&z=16&output=embed" frameborder="0" width="100%"></iframe>
            </div>
        );
    }
}
