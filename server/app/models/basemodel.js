// Generated by CoffeeScript 1.4.0
(function() {
  var AppError, BaseModel, console, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  utils = require('../common/utils');

  console = require('console');

  AppError = require('../common/apperror').AppError;

  BaseModel = (function() {

    function BaseModel(params) {
      this.summarize = __bind(this.summarize, this);

      this.destroy = __bind(this.destroy, this);

      this.validate = __bind(this.validate, this);

      this.save = __bind(this.save, this);

      var meta;
      utils.extend(this, params);
      meta = this.constructor._getMeta();
      if (this._id) {
        this._id = meta.type._database.ObjectId(this._id);
      }
    }

    BaseModel.get = function(params, context, cb) {
      var meta,
        _this = this;
      meta = this._getMeta();
      return this._database.findOne(meta.collection, params, function(err, result) {
        return cb(err, result ? new meta.type(result) : void 0);
      });
    };

    BaseModel.getAll = function(params, context, cb) {
      var meta,
        _this = this;
      meta = this._getMeta();
      return this._database.find(meta.collection, params, function(err, cursor) {
        return cursor.toArray(function(err, items) {
          var item;
          return cb(err, (items != null ? items.length : void 0) ? (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = items.length; _i < _len; _i++) {
              item = items[_i];
              _results.push(new meta.type(item));
            }
            return _results;
          })() : []);
        });
      });
    };

    BaseModel.find = function(params, fnCursor, context, cb) {
      var meta,
        _this = this;
      meta = this._getMeta();
      return this._database.find(meta.collection, params, function(err, cursor) {
        fnCursor(cursor);
        return cursor.toArray(function(err, items) {
          var item;
          return cb(err, (items != null ? items.length : void 0) ? (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = items.length; _i < _len; _i++) {
              item = items[_i];
              _results.push(new meta.type(item));
            }
            return _results;
          })() : []);
        });
      });
    };

    BaseModel.getCursor = function(params, context, cb) {
      var meta;
      meta = this._getMeta();
      return this._database.find(meta.collection, params, cb);
    };

    BaseModel.getById = function(id, context, cb) {
      var meta,
        _this = this;
      meta = this._getMeta();
      return this._database.findOne(meta.collection, {
        _id: this._database.ObjectId(id)
      }, function(err, result) {
        return cb(err, result ? new meta.type(result) : void 0);
      });
    };

    BaseModel.destroyAll = function(params, cb) {
      var meta,
        _this = this;
      meta = this._getMeta();
      if (meta.validateMultiRecordOperationParams(params)) {
        return this._database.remove(meta.collection, params, function(err) {
          return typeof cb === "function" ? cb(err) : void 0;
        });
      } else {
        return typeof cb === "function" ? cb(new AppError("Call to destroyAll() must pass safety checks on params.", "SAFETY_CHECK_FAILED_IN_DESTROYALL")) : void 0;
      }
    };

    BaseModel._getMeta = function() {
      var meta, _ref;
      meta = this._meta;
      if ((_ref = meta.validateMultiRecordOperationParams) == null) {
        meta.validateMultiRecordOperationParams = function(params) {
          return false;
        };
      }
      return meta;
    };

    BaseModel.prototype.save = function(context, cb) {
      var error, fnSave, meta, validation, _i, _len, _ref,
        _this = this;
      meta = this.constructor._getMeta();
      validation = this.validate();
      if (validation.isValid) {
        fnSave = function() {
          var event, _ref;
          _this._updateTimestamp = Date.now();
          if (!(_this._id != null)) {
            if ((_ref = meta.logging) != null ? _ref.isLogged : void 0) {
              event = {};
              event.type = meta.logging.onInsert;
              event.data = _this;
              meta.type._database.insert('events', event, function() {});
            }
            return meta.type._database.insert(meta.collection, _this, function(err, r) {
              return typeof cb === "function" ? cb(err, r) : void 0;
            });
          } else {
            return meta.type._database.update(meta.collection, {
              _id: _this._id
            }, _this, function(err, r) {
              return typeof cb === "function" ? cb(err, _this) : void 0;
            });
          }
        };
        if (this._id && meta.concurrency === 'optimistic') {
          return this.constructor.getById(this._id, context, function(err, newPost) {
            if (newPost._updateTimestamp === _this._updateTimestamp) {
              return fnSave();
            } else {
              return typeof cb === "function" ? cb(new AppError("Update timestamp mismatch. Was " + newPost._updateTimestamp + " in saved, " + _this._updateTimestamp + " in new.", 'OPTIMISTIC_CONCURRENCY_FAIL')) : void 0;
            }
          });
        } else {
          return fnSave();
        }
      } else {
        console.log("Validation failed for object with id " + this._id + " in collection " + meta.collection + ".");
        console.log(JSON.stringify(this));
        _ref = validation.errors;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          error = _ref[_i];
          console.log(error);
        }
        return typeof cb === "function" ? cb(new AppError("Model failed validation.")) : void 0;
      }
    };

    BaseModel.prototype.validate = function() {
      return {
        isValid: true
      };
    };

    BaseModel.prototype.destroy = function(context, cb) {
      var meta,
        _this = this;
      meta = this.constructor._getMeta();
      return meta.type._database.remove(meta.collection, {
        _id: this._id
      }, function(err) {
        return typeof cb === "function" ? cb(err, _this) : void 0;
      });
    };

    BaseModel.prototype.summarize = function(fields) {
      var field, result, _i, _len;
      result = {};
      if (fields) {
        for (_i = 0, _len = fields.length; _i < _len; _i++) {
          field = fields[_i];
          result[field] = this[field];
        }
      }
      return result;
    };

    return BaseModel;

  })();

  exports.BaseModel = BaseModel;

}).call(this);
