
var React = require('react');
var Nav = require('Nav');
var bootstrap = require('bootstrap');

var Main = React.createClass({
  render: function () {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
});

module.exports = Main;
