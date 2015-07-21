import React from 'react';
import Race from '../models/race';
import Riders from '../models/rider';

const race = new Race();

const Index = React.createClass({
  getInitialState() {
    return {
        filterText: ''
    };
  },
  onUserInput() {
    const text = this.refs['filterTextInput'].getDOMNode().value;

    this.setState({
      filterText: text
    });
  },
  render() {
    const riders = this.props.data.riders;
    const filterText = this.state.filterText;
    const rows = riders.map(function(rider, index) {
        const lastName = rider.LastName.toLowerCase();
        if (filterText && lastName.indexOf(filterText) === -1) {
          return;
        } else {
          return (
            <tr key={index}>
              <td>{rider.PositionInTheRace}</td>
              <td><img src={rider.PhotoUri} height="40" /></td>
              <td>{rider.FirstName}</td>
              <td>{rider.LastName}</td>
              <td>{rider.TeamCode}</td>
              <td>{rider.gap}</td>
              <td>{rider.DistanceToFinish.toFixed(2)}</td>
              <td>{rider.CurrentSpeed}</td>
              <td>{rider.AverageSpeed}</td>
              <td>{rider.generalPos}</td>
              <td>{rider.generalGap}</td>
              <td>{rider.liveGap}</td>
            </tr>
          );
        }
      });

    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">
            <span>Race speed: {this.props.data.speed.toFixed(2)} km/h, </span>
            <span>Remaining: {this.props.data.distanceToFinish.toFixed(2)} km, </span>
            <span>Current distance: {this.props.data.distanceFromStart.toFixed(2)} km</span>
          </h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-lg-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search for..."
                  value={this.state.filterText}
                  ref="filterTextInput"
                  onChange={this.onUserInput} />
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-condensed">
            <thead>
              <th>#</th>
              <th>Photo</th>
              <th>First name</th>
              <th>Last name</th>
              <th>Team</th>
              <th>Stage Gap</th>
              <th>Remaining (km)</th>
              <th>Current Speed (km/h)</th>
              <th>Avg (km/h)</th>
              <th>General Pos</th>
              <th>General Gap</th>
              <th>Live General Gap</th>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
});

function connectToRace(Component, race) {
  const raceConnection = React.createClass({
    getInitialState() {
      // return riders
      //   .fetch()
      //   .then(function(response) {
      //     return race
      //       .fetch()
      //       .then(function(res) {
      //         return {
      //           data: res
      //         };
      //       })
      //   });

      this.liveReload();

      return {
        data: race.toJSON()
      };
    },
    componentDidMount() {
      race.on('add remove change', this.onModelChange);
    },
    componentWillUnmount() {
        race.on(null, null, this.onModelChange);
    },
    onModelChange() {
      if (this.isMounted) {
        //console.log('onModelChange');
        this.setState({
            data: race.toJSON()
        });
      }
    },
    liveReload() {
      const that = this;
      race.fetch({
        add: true
      });
      setTimeout(that.liveReload, 5000);
    },
    render() {
      return (
        <Component {...this.state} {...this.props} />
      );
    }
  });

  return raceConnection;
}

export default connectToRace(Index, race);