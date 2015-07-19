import React from 'react';
import { Router, DefaultRoute, Route, RouteHandler } from 'react-router';

const App = React.createClass({
  render () {
    return (
      <div>
        <RouteHandler/>
      </div>
    )
  }
});

export default App;