import React from 'react';
import { Router, DefaultRoute, Route, RouteHandler } from 'react-router';
import App from './App';
import Index from './components/index';

// TODO: server rendering wtih more routes
const routes = (
  <Route handler={App} path="/">
    <DefaultRoute handler={Index} />
  </Route>
);

export default routes;