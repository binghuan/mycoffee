import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './App';
import StoreDetails from './layouts/StoreDetails';
import ListStore from './layouts/ListStore';

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
