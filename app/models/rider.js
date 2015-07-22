'use strict';

import Backbone from 'backbone';

class Rider extends Backbone.Model {
  // TODO: properties
}

class Riders extends Backbone.Collection {
  constructor(options) {
    super(options);
    this.model = Rider;
  }

  initialize() {

  }

  detailsById(id) {
    return this.models.filter(function(item) {
      return item.attributes.Id === id;
    });
  }

  // TODO: parser for custom properties

  url() {
    //return "http://localhost:3000/rider.json";
    return "http://letour-livetracking-api.dimensiondata.com/rider";
  }
}

export default Riders;