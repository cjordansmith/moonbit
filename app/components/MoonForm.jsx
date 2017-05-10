var React = require('react');

var MoonForm = React.createClass({
  onFormSubmit: function (e) {
    e.preventDefault();

    var location = this.refs.location.value;
  },
  render: function () {
    return (
      <div>
        <form onSubmit={this.onFormSubmit}>
          <input type="text" ref="location" />
          <button>Get Moon</button>
        </form>
      </div>
    );
  }
});

module.exports = MoonForm;
