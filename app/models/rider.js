'use strict';

import Backbone from 'Backbone';

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
      console.log(item);
      return item.attributes.Id === id;
    })
  }

  // TODO: parser for custom properties

  url() {
    return "http://localhost:3000/rider.json";
  }
}

export default Riders;