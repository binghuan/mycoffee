import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import StoreDetails from './containers/StoreDetails';
import ListStore from './containers/ListStore';

/*
export default (
  <Route path="/" component={App}>
    <Route path="/:login/:name"
           component={RepoPage} />
    <Route path="/:login"
           component={UserPage} />
  </Route>
)
*/
export default (
  <Route path="/" component={App}>
      <IndexRoute component={ListStore} />
      <Route path="/store_details" component={StoreDetails} />
  </Route>
)
