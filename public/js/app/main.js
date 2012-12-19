/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, browser:true, es5:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true*/

/*global self:true, addon:true, define:true */

window.pageObjects = {};

define(function (require) {
  "use strict";

  var $ = require('jquery');
  require('persona');
  var models = require('./models');
  var routes = require('./routes');
  var views = require('./views');

  views.init(models, routes);
});
