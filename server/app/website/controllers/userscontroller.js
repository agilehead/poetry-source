// Generated by CoffeeScript 1.4.0
(function() {
  var AppError, UsersController, conf, controller, https, models,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  https = require('https');

  conf = require('../../conf');

  models = new (require('../../models')).Models(conf.db);

  controller = require('./controller');

  AppError = require('../../common/apperror').AppError;

  UsersController = (function(_super) {

    __extends(UsersController, _super);

    function UsersController() {
      this.showUser = __bind(this.showUser, this);
      return UsersController.__super__.constructor.apply(this, arguments);
    }

    UsersController.prototype.showUser = function(req, res, next) {
      var _this = this;
      return models.User.get({
        domain: req.params.domain,
        username: req.params.username
      }, {}, function(err, user) {
        var title;
        if (user) {
          title = user.name;
          return res.render('users/showuser.hbs', {
            title: title,
            user: user
          });
        } else {
          return res.render('index.hbs', {
            title: 'Write Poetry. Together.'
          });
        }
      });
    };

    return UsersController;

  })(controller.Controller);

  exports.UsersController = UsersController;

}).call(this);
