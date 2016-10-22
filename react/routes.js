import React from 'react';
import { Route } from 'react-router';
import App from './containers/App';
import StoreDetails from './containers/StoreDetails';

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
      <Route path="store_details" component={StoreDetails}>
      </Route>
  </Route>
)
