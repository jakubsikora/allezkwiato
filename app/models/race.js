'use strict';

import Backbone from 'Backbone';

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
      return "http://localhost:3000/race.json";
  }

  parse(response) {
    const groups = response.Groups;
    let riders = [];

    this.set({currentTime: response.TimeStampEpochInt});
    this.set({speed: response.RaceSpeed});
    this.set({maxSpeed: response.RaceMaxSpeed});
    this.set({distanceToFinish: response.RaceDistanceToFinish});
    this.set({distanceFromStart: response.RaceDistanceFromStart});

    groups.forEach(function(group) {
      group.Riders.forEach(function(rider) {
        riders.push(rider);
      })
    });

    this.set({riders: riders});
  }
}

export default Race;