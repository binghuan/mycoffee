import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
 
// import App from '../imports/ui/App.jsx';
// import { renderRoutes } from '../imports/startup/client/routes';
import configureStore from '../imports/startup/client/store';
import Root from '../imports/startup/client/Root';
 
Meteor.startup(() => {
    const store = configureStore();
    const history = syncHistoryWithStore(browserHistory, store);
  // render(renderRoutes(), document.getElementById('app'));
    render(<Root store={store} history={history} />, document.getElementById('app'));
});
  // render(<App />, document.getElementById('app'));
