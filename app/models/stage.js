'use strict';

import Backbone from 'backbone';

class Stage extends Backbone.Model {
  url() {
    return "http://letour-livetracking-api.dimensiondata.com/race/stages/current";
  }
}

export default Stage;