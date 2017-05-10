var React = require('react');
var {Link} = require('react-router');

var Nav = React.createClass({
  render: function () {
    return (
      <div>
        
        <h2>Nav Component</h2>
        <Link to="/" class="navbar-brand">Get Miles</Link>
        <Link to="/about">About</Link>
        <Link to="/examples">Examples</Link>
      </div>

    );
  }
});

module.exports = Nav;
