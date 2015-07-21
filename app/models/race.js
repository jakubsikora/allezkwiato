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
      leaderGap: null
    };
  }

  initialize() {

  }


  urlRoot() {
      //return "http://localhost:3000/race.json";
      return 'https://letour-livetracking-api.dimensiondata.com/race/';
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

        function sortByKey(array, key) {
          return array.sort(function(a, b) {
            const x = a[key];
            const y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          });
        }

        that.set({riders: ridersArr});
      });
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
    return riders.filter(function(rider) {
      return rider.Id === id;
    })[0];
  }
}

export default Race;