import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from '../imports/startup/client/store';
import Root from '../imports/startup/client/Root';
 
Meteor.startup(() => {
    const store = configureStore();
    const history = syncHistoryWithStore(browserHistory, store);
    render(<Root store={store} history={history} />, document.getElementById('app'));
});
