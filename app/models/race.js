'use strict';

import Backbone from 'backbone';
import Riders from './rider';


const ridersObj = new Riders();

class Race extends Backbone.Model {
  defaults() {
    return {
      currentTime: '',
      speed: 0,
      maxSpeed: 0,
      distanceToFinish: 0,
      distanceFromStart: 0,
      riders: []
    };
  }

  initialize() {

  }


  urlRoot() {
      // return "http://localhost:3000/race.json";
      return 'http://letour-livetracking-api.dimensiondata.com/race/';
  }

  parse(response) {
    const that = this;
    ridersObj
      .fetch()
      .then(function(ridersRes) {
        const groups = response.Groups;
        let ridersArr = [];

        that.set({currentTime: response.TimeStampEpochInt});
        that.set({speed: response.RaceSpeed});
        that.set({maxSpeed: response.RaceMaxSpeed});
        that.set({distanceToFinish: response.RaceDistanceToFinish});
        that.set({distanceFromStart: response.RaceDistanceFromStart});

        groups.forEach(function(group) {
          group.Riders.forEach(function(item) {
            let riderDetails = {};
            riderDetails = that.lookupRider(ridersRes, item.Id);
            riderDetails.gap = group.GapToLeadingGroupT === 0
              ? ''
              : that.formatGap(group.GapToLeadingGroupT);
            const rider = jQuery.extend({}, item, riderDetails);
            ridersArr.push(rider);
          })
        });

        that.set({riders: ridersArr});
      });
  }

  formatGap(time) {
    let minutes = Math.floor(time / 60);
    let seconds = time - minutes * 60;

    minutes = minutes.toFixed(0);
    seconds = seconds.toFixed(0);

    minutes = (minutes < 10 ? '0' + minutes : minutes);
    seconds = (seconds < 10 ? '0' + seconds : seconds);

    return minutes + ':' + seconds;
  }

  lookupRider(riders, id) {
    return riders.filter(function(rider) {
      return rider.Id === id;
    })[0];
  }
}

export default Race;