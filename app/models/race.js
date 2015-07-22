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
    //return "http://localhost:3000/race.json";
    return 'http://letour-livetracking-api.dimensiondata.com/race/';
  }

  parseRiders(raceResponse) {
    const that = this;
    const ridersCache = that.get('ridersCache');

    if (!raceResponse) return;

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

    that.getNonTrackedRiders();
  }

  getNonTrackedRiders() {
    const allRiders = this.get('ridersCache');
    const trackedRiders = this.get('ridersDetails');
    let nonTrackedRiders = [];

    let bIds = {};
    trackedRiders.forEach(function(obj){
      bIds[obj.Id] = obj;
    });

    nonTrackedRiders = allRiders.filter(function(obj){
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
    let negative = false;
    let strTime = '';

    if (time < 0) {
      negative = true;
      time = -1 * time;
    }

    time = Number(time);
    let h = Math.floor(time / 3600);
    let m = Math.floor(time % 3600 / 60);
    let s = Math.floor(time % 3600 % 60);

    strTime = (h < 10 ? '0' : '') + h + ':' +
      (m < 10 ? '0' : '') + m + ':' +
      (s < 10 ? '0' : '') + s;

    return (negative ? '-' : '') + strTime;
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