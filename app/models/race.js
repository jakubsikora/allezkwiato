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
      riders: [],
      ridersDetails: [],
      leaderGap: null,
      ridersCache: [],
      nonTrackedRiders: []
    };
  }

  initialize() {

  }

  urlRoot() {
      return "http://localhost:3000/race.json";
      //return 'http://letour-livetracking-api.dimensiondata.com/race/';
  }

  parseRiders(raceResponse) {
    const that = this;
    const ridersCache = that.get('ridersCache');

    if (ridersCache.length) {
      that.parseRace(ridersCache, raceResponse);
    } else {
      ridersObj
        .fetch()
        .then(function(ridersRes) {
          that.set({ridersCache: ridersRes});
          that.parseRace(ridersRes, raceResponse);
        });
    }
  }

  parseRace(ridersRes, raceResponse) {
    const groups = raceResponse.Groups;
    const that = this;
    let ridersArr = [];

    that.set({currentTime: raceResponse.TimeStampEpochInt});
    that.set({speed: raceResponse.RaceSpeed});
    that.set({maxSpeed: raceResponse.RaceMaxSpeed});
    that.set({distanceToFinish: raceResponse.RaceDistanceToFinish});
    that.set({distanceFromStart: raceResponse.RaceDistanceFromStart});

    // FIXME: nasty! load the leader first
    groups.forEach(function(group) {
      group.Riders.forEach(function(item) {
        if (item.HasYellowJersey) {
          let riderDetails = {};
          riderDetails = that.lookupRider(ridersRes, item.Id);
          riderDetails.gap = group.GapToLeadingGroupT === 0
            ? null
            : that.formatGap(group.GapToLeadingGroupT);

          const generalClass = riderDetails.GeneralClassification.split(', ');
          riderDetails.generalPos = generalClass[0];
          riderDetails.generalGap = generalClass[1];

          that.set({leaderGap: riderDetails.gap});
          riderDetails.liveGap = that.calculateLiveGap(riderDetails);

          const rider = jQuery.extend({}, item, riderDetails);
          ridersArr.push(rider);
        }
      })
    });

    groups.forEach(function(group) {
      group.Riders.forEach(function(item) {
        if (!item.HasYellowJersey) {
          let riderDetails = {};
          riderDetails = that.lookupRider(ridersRes, item.Id);
          riderDetails.gap = group.GapToLeadingGroupT === 0
            ? null
            : that.formatGap(group.GapToLeadingGroupT);

          const generalClass = riderDetails.GeneralClassification.split(', ');
          riderDetails.generalPos = generalClass[0];
          riderDetails.generalGap = generalClass[1];

          riderDetails.liveGap = that.calculateLiveGap(riderDetails);

          const rider = jQuery.extend({}, item, riderDetails);
          ridersArr.push(rider);
        }
      })
    });

    ridersArr = sortByKey(ridersArr, 'PositionInTheRace');
    that.set({riders: ridersArr});

    function sortByKey(array, key) {
      return array.sort(function(a, b) {
        const x = a[key];
        const y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

    if (that.get('nonTrackedRiders').length === 0) {
      that.getNonTrackedRiders();
    }
  }

  getNonTrackedRiders() {
    const allRiders = this.get('ridersCache');
    const trackedRiders = this.get('ridersDetails');

    let bIds = {};
    trackedRiders.forEach(function(obj){
      bIds[obj.Id] = obj;
    });

    let nonTrackedRiders = allRiders.filter(function(obj){
      return !(obj.Id in bIds) && !obj.IsWithdrawn;
    });

    this.set({nonTrackedRiders: nonTrackedRiders});
  }

  parse(response) {
    this.parseRiders(response);
  }

  calculateLiveGap(rider) {
    const leaderGap = this.get('leaderGap');
    const riderGap = rider.gap ? rider.gap : '00:00:00';

    if (leaderGap) {
      const leaderGapParts = leaderGap.split(':');
      const riderGapParts = riderGap.split(':');

      const leaderGapSec = (parseInt(leaderGapParts[0])) * 60 * 60 + (parseInt(leaderGapParts[1])) * 60 + (parseInt(leaderGapParts[2]));
      const riderGapSec = (parseInt(riderGapParts[0])) * 60 * 60 + (parseInt(riderGapParts[1])) * 60 + (parseInt(riderGapParts[2]));

      const diffSec = parseInt(riderGapSec) - parseInt(leaderGapSec);

      const riderGeneralGap = rider.generalGap;
      const riderGeneralGapParts = riderGeneralGap.split(':');
      let riderGeneralGapSec = (parseInt(riderGeneralGapParts[0])) * 60 * 60 + (parseInt(riderGeneralGapParts[1])) * 60 + (parseInt(riderGeneralGapParts[2]));

      riderGeneralGapSec = parseInt(riderGeneralGapSec) + parseInt(diffSec);

      return this.formatGap(riderGeneralGapSec);
    }
  }

  formatGap(time) {
    let hours = Math.floor(time / 3600);
    time = time - hours * 3600;
    let minutes = Math.floor(time / 60);
    let seconds = time - minutes * 60;

    minutes = minutes.toFixed(0);
    seconds = seconds.toFixed(0);

    hours = (hours < 10 ? '0' + hours : hours);
    minutes = (minutes < 10 ? '0' + minutes : minutes);
    seconds = (seconds < 10 ? '0' + seconds : seconds);

    return hours + ':' + minutes + ':' + seconds;
  }

  lookupRider(riders, id) {
    let returnRider = {};
    let tempRiders = [];

    returnRider = riders.filter(function(rider) {
      return rider.Id === id;
    })[0];

    tempRiders = this.get('ridersDetails');
    tempRiders.push(returnRider);
    this.set({ridersDetails: tempRiders});

    return returnRider;
  }
}

export default Race;