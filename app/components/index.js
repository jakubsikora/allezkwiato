import React from 'react';
import Race from '../models/race';
import Riders from '../models/rider';

const riders = new Riders();
const race = new Race();

const Index = React.createClass({
  render () {
    //console.log('props', this.props.data);
    if (this.props.data.riders.length) {
      if (riders.models.length) {
        console.log(riders.detailsById(this.props.data.riders[0].Id));
      }
      //console.log();
    }
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">
            <span>Race speed: </span>
            <span> Distance left:</span>
          </h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-lg-6">
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Search for..." />
                <span className="input-group-btn">
                  <button className="btn btn-default" type="button">Go!</button>
                </span>
              </div>
            </div>
          </div>
          <div className="row"></div>
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-condensed">
              <thead>
                <th>#</th>
                <th>First name</th>
                <th>Last name</th>
                <th>Time</th>
                <th>Gap</th>
                <th>Distance to finish</th>
                <th>Current Speed</th>
                <th>Avg Speed</th>
              </thead>
              <tbody>
                <td>1</td>
                <td>Michal</td>
                <td>Kwiatkowski</td>
                <td>1h 00 00</td>
                <td></td>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
});

function connectToRace(Component, race, riders) {
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

      race.fetch();
      return {
        data: race.toJSON()
      };
    },
    componentDidMount() {
      riders.fetch();
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
    render() {
      return (
        <Component {...this.state} {...this.props} />
      );
    }
  });

  return raceConnection;
}

export default connectToRace(Index, race, riders);