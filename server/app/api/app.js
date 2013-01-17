// Generated by CoffeeScript 1.4.0
(function() {
  var ApplicationCache, apicontrollers, app, conf, database, express, findHandler, host, models, port, utils, validator,
    _this = this;

  console.log("Poe3 api services started at " + (new Date));

  console.log("NODE_ENV is " + process.env.NODE_ENV);

  console.log('---------------------');

  express = require('express');

  conf = require('../conf');

  database = new (require('../common/database')).Database(conf.db);

  models = new (require('../models')).Models(conf.db);

  apicontrollers = require('./controllers');

  utils = require('../common/utils');

  ApplicationCache = require('../common/cache').ApplicationCache;

  validator = require('validator');

  app = express();

  app.use(express.bodyParser({
    uploadDir: '../../www-user/temp',
    limit: '6mb'
  }));

  app.use(express.limit('6mb'));

  app.use(function(req, res, next) {
    var file, inputs, key, val, _i, _j, _len, _len1, _ref, _ref1;
    _ref = [req.params, req.query, req.body];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      inputs = _ref[_i];
      if (inputs) {
        for (key in inputs) {
          val = inputs[key];
          val = inputs[key];
          val = val.replace('<', '(');
          val = val.replace('>', ')');
          inputs[key] = validator.sanitize(val).xss();
        }
      }
      if (req.files) {
        _ref1 = req.files;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          file = _ref1[_j];
          val = req.files[file];
          val.name = val.name.replace('<', '');
          val.name = val.name.replace('>', '');
          val.name = val.name.replace('"', '');
          val.name = validator.sanitize(val).xss();
        }
      }
    }
    return next();
  });

  findHandler = function(name, getHandler) {
    return function(req, res, next) {
      var controller;
      controller = (function() {
        switch (name.toLowerCase()) {
          case 'api/v1/sessions':
            return new apicontrollers.SessionsController();
          case 'api/v1/posts':
            return new apicontrollers.PostsController();
          case 'api/v1/users':
            return new apicontrollers.UsersController();
          case 'api/v1/tokens':
            return new apicontrollers.TokensController();
          case 'api/v1/admin':
            return new apicontrollers.AdminController();
          default:
            throw new Error("Cannot find controller.");
        }
      })();
      return getHandler(controller)(req, res, next);
    };
  };

  app.post('/api/v1/sessions', findHandler('api/v1/sessions', function(c) {
    return c.createSession;
  }));

  app.get('/api/v1/posts', findHandler('api/v1/posts', function(c) {
    return c.getPosts;
  }));

  app.post('/api/v1/posts', findHandler('api/v1/posts', function(c) {
    return c.createPost;
  }));

  app.put('/api/v1/posts/:id', findHandler('api/v1/posts', function(c) {
    return c.updatePost;
  }));

  app.del('/api/v1/posts/:id', findHandler('api/v1/posts', function(c) {
    return c.deletePost;
  }));

  app.get('/api/v1/posts/:id', findHandler('api/v1/posts', function(c) {
    return c.getById;
  }));

  app.post('/api/v1/files', findHandler('api/v1/posts', function(c) {
    return c.upload;
  }));

  app.get('/api/v1/files/processurl', findHandler('api/v1/posts', function(c) {
    return c.processAttachmentUrl;
  }));

  app.post('/api/v1/posts/:id/parts', findHandler('api/v1/posts', function(c) {
    return c.addPart;
  }));

  app.post('/api/v1/posts/:id/selectedparts', findHandler('api/v1/posts', function(c) {
    return c.selectPart;
  }));

  app.del('/api/v1/posts/:id/selectedparts/:partid', findHandler('api/v1/posts', function(c) {
    return c.unselectPart;
  }));

  app.put('/api/v1/posts/:id/state', findHandler('api/v1/posts', function(c) {
    return c.setState;
  }));

  app.put('/api/v1/posts/:id/like', findHandler('api/v1/posts', function(c) {
    return c.like;
  }));

  app.del('/api/v1/posts/:id/like', findHandler('api/v1/posts', function(c) {
    return c.unlike;
  }));

  app.get('/api/v1/posts/:id/comments', findHandler('api/v1/posts', function(c) {
    return c.getComments;
  }));

  app.post('/api/v1/posts/:id/comments', findHandler('api/v1/posts', function(c) {
    return c.addComment;
  }));

  app.del('/api/v1/posts/:id/comments/:commentid', findHandler('api/v1/posts', function(c) {
    return c.deleteComment;
  }));

  app.post('/api/v1/posts/:id/fb/shares', findHandler('api/v1/posts', function(c) {
    return c.addFacebookShare;
  }));

  app.get('/api/v1/users', findHandler('api/v1/users', function(c) {
    return c.getUsers;
  }));

  app.put('/api/v1/users/:id', findHandler('api/v1/users', function(c) {
    return c.updateUser;
  }));

  app.get('/api/v1/users/:id/tags', findHandler('api/v1/users', function(c) {
    return c.getTags;
  }));

  app.post('/api/v1/users/:id/followers', findHandler('api/v1/users', function(c) {
    return c.follow;
  }));

  app.del('/api/v1/users/:id/followers/:followerid', findHandler('api/v1/users', function(c) {
    return c.unfollow;
  }));

  app.get('/api/v1/users/:id/messages', findHandler('api/v1/users', function(c) {
    return c.getMessages;
  }));

  app.get('/api/v1/users/:id/status', findHandler('api/v1/users', function(c) {
    return c.syncStatus;
  }));

  app.get('/api/v1/users/0/broadcasts', findHandler('api/v1/users', function(c) {
    return c.getBroadcasts;
  }));

  app.get('/api/v1/tokens/:type/:key', findHandler('api/v1/tokens', function(c) {
    return c.getToken;
  }));

  app.post('/api/v1/tokens', findHandler('api/v1/tokens', function(c) {
    return c.createToken;
  }));

  app.get('/api/v1/kitchen/addmeta', findHandler('api/v1/admin', function(c) {
    return c.addMeta;
  }));

  app.get('/api/v1/kitchen/deletemeta', findHandler('api/v1/admin', function(c) {
    return c.deleteMeta;
  }));

  app.get('/api/v1/kitchen/impersonate', findHandler('api/v1/admin', function(c) {
    return c.impersonate;
  }));

  app.post('/api/v1/kitchen/addmessage', findHandler('api/v1/admin', function(c) {
    return c.addMessage;
  }));

  app.get('/api/v1/kitchen/deletemessage', findHandler('api/v1/admin', function(c) {
    return c.deleteMessage;
  }));

  app.use(app.router);

  app.use(function(err, req, res, next) {
    console.log(err);
    return res.send(500, 'Something broke.');
  });

  app.use(function(req, res, next) {
    return res.send(404, {
      error: 'Well.. there is no water here.'
    });
  });

  host = process.argv[2];

  port = process.argv[3];

  /*
      GLOBALS AND CACHING
  */


  global.appSettings = {};

  global.cachingWhale = new ApplicationCache();

  database.getDb(function(err, db) {
    db.collection('sessions', function(_, coll) {
      coll.ensureIndex({
        passkey: 1
      }, function() {});
      return coll.ensureIndex({
        accessToken: 1
      }, function() {});
    });
    db.collection('posts', function(_, coll) {
      coll.ensureIndex({
        uid: 1
      }, function() {});
      coll.ensureIndex({
        uid: 1,
        state: 1
      }, function() {});
      coll.ensureIndex({
        uid: -1,
        state: 1
      }, function() {});
      coll.ensureIndex({
        tags: 1
      }, function() {});
      coll.ensureIndex({
        publishedAt: 1
      }, function() {});
      coll.ensureIndex({
        'createdBy.id': 1
      }, function() {});
      coll.ensureIndex({
        'createdBy.username': 1,
        'createdBy.domain': 1
      }, function() {});
      return coll.ensureIndex({
        'createdBy.username': 1,
        'createdBy.domain': 1,
        'coauthors.username': 1,
        'coauthors.domain': 1
      }, function() {});
    });
    db.collection('messages', function(_, coll) {
      return coll.ensureIndex({
        userid: 1
      }, function() {});
    });
    db.collection('comments', function(_, coll) {
      return coll.ensureIndex({
        postid: 1
      }, function() {});
    });
    return db.collection('tokens', function(_, coll) {
      return coll.ensureIndex({
        type: 1,
        key: 1
      }, function() {});
    });
  });

  database.findOne('_counters', {
    key: 'postid'
  }, function(err, kvp) {
    if (!kvp) {
      return database.insert('_counters', {
        key: 'postid',
        value: 0
      }, function(err, kvp) {
        return console.log('Created postid counter.');
      });
    }
  });

  global.appSettings.getNewPostUID = function(cb) {
    return database.incrementCounter('postid', function(err, counter) {
      return cb(err, counter);
    });
  };

  app.listen(port);

}).call(this);
