// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business
import { getAsyncInjectors } from 'utils/asyncInjectors';
import React from 'react';
import { Route, IndexRoute } from 'react-router';
// import App from 'containers/App';
// import Home from 'containers/HomePage';
// import NotFound from 'containers/NotFoundPage';
import App from './containers/App';
import StoreDetails from './containers/StoreDetails';
import ListStore from './containers/ListStore';

const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default (
  <Route path="/" component={App}>
      <IndexRoute component={ListStore} />
      <Route path="/store_details" component={StoreDetails} />
  </Route>
)
// export default (
    // <Route path="/" component={App}>
        // <Route path="home" component={ListStore} />
        // <Route path="*" component={NotFound} />
    // </Route>
// )

/*
export default function createRoutes(store) {
  // Create reusable async injectors using getAsyncInjectors factory
  const { injectReducer, injectSagas } = getAsyncInjectors(store); // eslint-disable-line no-unused-vars

  return [
    {
      path: '/',
      name: 'home',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/HomePage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '*',
      name: 'notfound',
      getComponent(nextState, cb) {
        System.import('containers/NotFoundPage')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    },
  ];
}
*/
