var React = require('react');
var ReactDOM = require('react-dom');
var {Route, Router, IndexRoute, hashHistory} = require('react-router');
var Main = require('Main');
var Moon = require('Moon');

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={Main}>
      <IndexRoute component={Moon}/>
    </Route>
  </Router>,
  document.getElementById('app')
);
