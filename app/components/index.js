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
    const nonTrackedRiders = this.props.data.nonTrackedRiders;
    const filterText = this.state.filterText;
    const rows = riders.map(function(rider, index) {
      const lastName = rider.LastName.toLowerCase();
      if (filterText && lastName.indexOf(filterText) === -1) {
        return;
      } else {
        let leader = false;

        if (rider.HasYellowJersey) {
          leader = true;
        } else {
          leader = false;
        }

        return (
          <tr key={index} className={leader ? 'yellow' : null}>
            <td>{rider.PositionInTheRace}</td>
            <td><img src={rider.PhotoUri} height="30" /></td>
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

    const nonTrackedRows = nonTrackedRiders.map(function(rider, index) {
      const lastName = rider.LastName.toLowerCase();
      if (filterText && lastName.indexOf(filterText) === -1) {
        return;
      } else {
        return (
          <tr key={index}>
            <td><img src={rider.PhotoUri} height="30" />
              {rider.FirstName} {rider.LastName} ({rider.TeamCode})</td>
          </tr>
        );
      }
    });

    const totalDistance = this.props.data.distanceToFinish + this.props.data.distanceFromStart;
    let percentToFinish = this.props.data.distanceToFinish / totalDistance * 100;
    percentToFinish = percentToFinish.toFixed(0);

    const distanceStyle = {
      right: percentToFinish + "%"
    };

    const status = this.props.data.status;
    console.log(status);
    let statusMsg = '';
    let displayStyle = {
      display: 'block'
    }

    if (status.Status !== 1) {
      if (status.EnglishMessage) {
        statusMsg = status.EnglishMessage.replace(/(<([^>]+)>)/ig, '');
      }

      displayStyle = {
        display: 'none'
      }
    }

    return (
      <div>
        <div className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href="/">
                (Beta)
                Tour de France 2015 - Live Stage
                <span> {this.props.data.stage.StageNumber} - </span>
                <span>{this.props.data.stage.DepartingTown} to </span>
                <span>{this.props.data.stage.ArrivingTown} - </span>
                <span> {this.props.data.stage.TotalDistance} km <img src="/img/flash.gif" /></span>
              </a>
            </div>
            <div className="powered">
              Powered by <a href='http://dimensiondata.com/'>dimensiondata</a>
            </div>
          </div>
        </div>

        <div className="intro-header">
          <div className="intro-overlay"></div>
          <div className="container">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <div className="row race-status">
                    <p>{statusMsg}</p>
                  </div>
                  <p style={displayStyle}>
                    <span> Tracking: {riders.length} riders, </span>
                    <span> Race speed: {this.props.data.speed.toFixed(2)} km/h, </span>
                    <span>Remaining: {this.props.data.distanceToFinish.toFixed(2)} km, </span>
                    <span>Current distance: {this.props.data.distanceFromStart.toFixed(2)} km </span>
                  </p>
                </h3>
              </div>
              <div className="panel-body" style={displayStyle}>
                <div className="row">
                  <div className="distance-indicator-line">
                    <div className="distance-indicator" style={distanceStyle}>
                      <span className="text-to-finish">{percentToFinish}% to finish</span>
                      <img src="/img/bike.gif" width="40" />
                    </div>
                  </div>
                </div>
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
              <div className="table-responsive" style={displayStyle}>
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
                    <th>Rank</th>
                    <th>Gap to Yellow Jer.</th>
                    <th>Live Gap to Yellow Jer.</th>
                  </thead>
                  <tbody>
                    {rows}
                  </tbody>
                </table>
              </div>
              <div className="table-responsive table-non-trackers" style={displayStyle}>
                <table className="table table-bordered table-striped table-condensed">
                  <thead>
                    <th>No tracking data at the moment ({nonTrackedRiders.length} / {riders.length + nonTrackedRiders.length})</th>
                  </thead>
                  <tbody className="non-tracker">
                    {nonTrackedRows}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

function connectToRace(Component, race) {
  const raceConnection = React.createClass({
    getInitialState() {
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