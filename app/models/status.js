'use strict';

import Backbone from 'backbone';

class Status extends Backbone.Model {
  url() {
    return "http://letour-livetracking-api.dimensiondata.com/race/status";
  }
}

export default Status;