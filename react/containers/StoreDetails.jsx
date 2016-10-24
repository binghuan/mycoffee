import React, { Component, PropTypes } from 'react';
import FontIcon from 'material-ui/FontIcon';
import { getTodayOpeningHour, isOpeningNow } from '../utils/helper';
import GoogleMap from 'google-map-react';
import { config } from '../config';

const iconColor = {
    info: 'blue',
    phone: 'green',
    location: 'red',
};

require('../styles/index.scss');

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
                        <FontIcon className="material-icons vertical-align-center" color={iconColor.location}>location_on</FontIcon>
                        <span className="vertical-align-center">{store.address}</span>
                    </a>
                </div>

                {store.phone &&
                    <div>
                        <a href={`tel:${store.phone}`} target="_blank">
                            <FontIcon className="material-icons vertical-align-center" color={iconColor.phone}>phone</FontIcon>
                            <span className="vertical-align-center">{store.phone}</span>
                        </a>
                    </div>
                }
                {openingHourString &&
                    <div>
                        <FontIcon className="material-icons vertical-align-center" color={iconColor.info}>info</FontIcon>
                        <span className="vertical-align-center">{openingHourString}</span>
                    </div>
                }
                {store.openTime &&
                    <div>
                        <FontIcon className="material-icons vertical-align-center" color={iconColor.info}>info</FontIcon>
                        <span className="vertical-align-center">{store.openTime}</span>
                    </div>
                }
                <GoogleMap
                    defaultZoom={16}
                    bootstrapURLKeys={{
                        key: config.GOOGLE_API_KEY,
                        language: 'zh-tw',
                        q: store.address,
                    }}
                    >
                </GoogleMap>
            </div>
        );
    }
}
                // <iframe id="mapview" src={`//www.google.com.tw/maps/embed/v1/place?q=${store.address}&zoom=16`} frameborder="0" width="100%"></iframe>
