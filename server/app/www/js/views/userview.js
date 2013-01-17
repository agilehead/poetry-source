// Generated by CoffeeScript 1.4.0
(function() {
  var UserView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  UserView = (function(_super) {

    __extends(UserView, _super);

    function UserView(domain, username, section) {
      this.domain = domain;
      this.username = username;
      this.section = section;
      this.getPostByUID = __bind(this.getPostByUID, this);

      this.isOwnProfile = __bind(this.isOwnProfile, this);

      this.attachEvents = __bind(this.attachEvents, this);

      this.showMessages = __bind(this.showMessages, this);

      this.showTags = __bind(this.showTags, this);

      this.showLikes = __bind(this.showLikes, this);

      this.showOpen = __bind(this.showOpen, this);

      this.showCompleted = __bind(this.showCompleted, this);

      this.renderMessages = __bind(this.renderMessages, this);

      this.renderPosts = __bind(this.renderPosts, this);

      this.render = __bind(this.render, this);

      this.renderContainer = __bind(this.renderContainer, this);

      this.resizeOnRefresh = __bind(this.resizeOnRefresh, this);

      this.loadSection = __bind(this.loadSection, this);

      this.initialize = __bind(this.initialize, this);

      UserView.__super__.constructor.call(this, {
        model: new Poe3.User({
          domain: this.domain,
          username: this.username
        })
      });
    }

    UserView.prototype.initialize = function() {
      $('#content').html(this.el);
      this.renderContainer();
      this.model.bind('change', this.render, this);
      this.model.fetch();
      return this.loadSection();
    };

    UserView.prototype.loadSection = function() {
      switch (this.section) {
        case 'completed':
          return this.showCompleted();
        case 'open':
          return this.showOpen();
        case 'likes':
          return this.showLikes();
        case 'tags':
          return this.showTags();
        case 'messages':
          return this.showMessages();
      }
    };

    UserView.prototype.resizeOnRefresh = function() {
      return true;
    };

    UserView.prototype.renderContainer = function() {
      return $(this.el).html(this.container({
        domain: this.domain,
        username: this.username
      }));
    };

    UserView.prototype.render = function() {
      var params;
      this.setTitle(this.model.get('name'));
      params = this.model.toTemplateParam();
      params.followerCount = params.followers.length;
      params.followers = params.followers.slice(0, 4);
      params.followingCount = params.following.length;
      params.following = params.following.slice(0, 4);
      params.about = window.Poe3.formatText(this.model.get('about'));
      params.showLinks = this.model.get('domain') !== 'poe3';
      if (!params.about) {
        params.about = "<p>" + (this.replaceWithHumor('empty-profile')) + "</p>";
      }
      params.pagename = this.pagename;
      params.self = this.model.get('domain') === app.getUser().domain && this.model.get('username') === app.getUser().username;
      $(this.el).find('.user-info').html(this.userInfo(params));
      if (app.isAuthenticated()) {
        if (this.model.isFollowedBy(app.getUser().id)) {
          $('.user-view .actions .not-following').hide();
          $('.user-view .actions .following').show();
          $('.user-view .following-mark').show();
        } else {
          $('.user-view .actions .following').hide();
          $('.user-view .actions .not-following').show();
          $('.user-view .following-mark').hide();
        }
        if (this.isOwnProfile()) {
          $('.user-view .std-menu li.messages').removeClass('hidden');
        }
      } else {
        $('.user-view .actions .following').hide();
        $('.user-view .actions .not-following').show();
        $('.user-view .following-mark').hide();
      }
      this.attachEvents();
      return this.onRenderComplete('.user-view');
    };

    UserView.prototype.renderPosts = function() {
      var empty;
      $('.user-view .page-content').html('');
      if (!this.postsModel.length) {
        empty = $("<div><p class=\"empty\">&quot;" + (this.replaceWithHumor('empty')) + "&quot;</p></div>");
        if (this.isOwnProfile()) {
          if (this.section === 'completed') {
            empty.append('<p class="subtext">Just one way to fix this. Complete an <a href="/posts/open">open poem</a> or write a <a href="/posts/new">new one</a>.</p>');
          } else if (this.section === 'open') {
            empty.append('<p class="subtext">Why not start a new <a href="/posts/new">collaborative poem</a>?</p>');
          } else if (this.section === 'likes') {
            empty.append('<p class="subtext">Tip: Click the heart-shaped icon after opening a poem to \'like\' it.</p>');
          }
        }
        return empty.appendTo('.user-view .page-content');
      } else {
        if (this.pageContentType === 'POSTS') {
          this.postListView = new Poe3.PostListView('.user-view .page-content', "/" + this.domain + "/" + this.username, this.postsModel.toArray());
          return this.postListView.render();
        } else if (this.pageContentType === 'TAG-LIST') {
          this.tagListView = new Poe3.TagListView('.user-view .page-content', this.postsModel.toArray());
          return this.tagListView.render();
        }
      }
    };

    UserView.prototype.renderMessages = function(messagesModel) {
      var eMsg, eMsgs, eThread, eThreads, index, mailbox, messages, msg, sender, senderid, thread, threadDict, _i, _len;
      $('.topbar .main-message-alert').hide();
      $('.user-view .page-content').html('');
      messages = messagesModel.toArray();
      if (!messages.length) {
        return $('.user-view .page-content').html("<p class=\"empty\">There are no messages to display.</p>");
      } else {
        $('.user-view .page-content').html('\
                <div class="mailbox">\
                    <ul class="threads"></ul>\
                </div>');
        threadDict = _.groupBy(messages, function(m) {
          return m.get('from').id;
        });
        mailbox = $('.user-view .page-content .mailbox');
        eThreads = mailbox.find('.threads');
        for (senderid in threadDict) {
          thread = threadDict[senderid];
          sender = thread[0].get('from');
          eThread = $("                    <li>                        <a href=\"/" + sender.domain + "/" + sender.username + "\"><img src=\"" + sender.thumbnail + "\" alt=\"" + sender.name + "\" /></a>                        <h3><a href=\"/" + sender.domain + "/" + sender.username + "\">" + sender.name + "</a></h3>                                       <ul class=\"messages\"></ul>                        <div style=\"clear:both\"></div>                    </li>");
          eThread.appendTo(eThreads);
          eMsgs = eThread.find('.messages');
          for (index = _i = 0, _len = thread.length; _i < _len; index = ++_i) {
            msg = thread[index];
            if (index < 3) {
              eMsg = $("<li></li>");
            } else {
              eMsg = $("<li class=\"hidden\"></li>");
            }
            eMsg.appendTo(eMsgs);
            eMsg.html(msg.toHtml());
          }
          if (thread.length > 3) {
            eThread.append('<p class="show-all"><i class="icon-plus"></i> <span class="link">Show ' + thread.length + ' more</span></p>');
            (function(eThread) {
              return eThread.find('.show-all').click(function() {
                $(this).hide();
                return eThread.find('.messages li.hidden').show();
              });
            })(eThread);
          }
        }
        return Poe3.fixAnchors(eThreads);
      }
    };

    UserView.prototype.showCompleted = function() {
      $('.user-view .std-menu li a').removeClass('selected');
      $('.user-view .std-menu li a.completed').addClass('selected');
      this.pageContentType = 'POSTS';
      this.postsModel = new Poe3.Posts;
      this.postsModel.bind('reset', this.renderPosts, this);
      return this.postsModel.fetch({
        data: {
          domain: this.domain,
          username: this.username,
          state: 'complete'
        }
      });
    };

    UserView.prototype.showOpen = function() {
      $('.user-view .std-menu li a').removeClass('selected');
      $('.user-view .std-menu li a.open').addClass('selected');
      this.pageContentType = 'POSTS';
      this.postsModel = new Poe3.Posts;
      this.postsModel.bind('reset', this.renderPosts, this);
      return this.postsModel.fetch({
        data: {
          domain: this.domain,
          username: this.username,
          state: 'incomplete'
        }
      });
    };

    UserView.prototype.showLikes = function() {
      $('.user-view .std-menu li a').removeClass('selected');
      $('.user-view .std-menu li a.likes').addClass('selected');
      this.pageContentType = 'POSTS';
      this.postsModel = new Poe3.Posts;
      this.postsModel.bind('reset', this.renderPosts, this);
      return this.postsModel.fetch({
        data: {
          domain: this.domain,
          username: this.username,
          category: 'likes'
        }
      });
    };

    UserView.prototype.showTags = function() {
      $('.user-view .std-menu li a').removeClass('selected');
      $('.user-view .std-menu li a.tags').addClass('selected');
      this.pageContentType = 'TAG-LIST';
      this.postsModel = new Poe3.Posts;
      this.postsModel.bind('reset', this.renderPosts, this);
      return this.postsModel.fetch({
        data: {
          domain: this.domain,
          username: this.username,
          state: 'complete'
        }
      });
    };

    UserView.prototype.showMessages = function() {
      var messages;
      $('.user-view .std-menu li a').removeClass('selected');
      $('.user-view .std-menu li a.messages').addClass('selected');
      this.pageContentType = 'MESSAGES';
      messages = new Poe3.Messages;
      messages.bind('reset', this.renderMessages, this);
      messages.userid = app.getUser().id;
      return messages.fetch();
    };

    UserView.prototype.attachEvents = function() {
      var _this = this;
      $(document).bindNew('click', '.user-view .follow .all.following', function() {
        var users;
        users = _this.model.toJSON().following;
        new Poe3.UserListView(users, {
          heading: "Following " + users.length
        });
        return false;
      });
      $(document).bindNew('click', '.user-view .follow .all.followers', function() {
        var users;
        users = _this.model.toJSON().followers;
        new Poe3.UserListView(users, {
          heading: "" + users.length + " Followers"
        });
        return false;
      });
      $(document).bindNew('click', '.user-view .actions .not-following button', function() {
        $.post(Poe3.apiUrl("users/" + _this.model.id + "/followers"), {
          id: app.getUser().id
        }, function(resp) {
          _this.model.get('followers').push(app.getUser().id);
          $('.user-view .actions .not-following').hide();
          $('.user-view .actions .following').show();
          return $('.user-view .following-mark').show();
        });
        return false;
      });
      $(document).bindNew('click', '.user-view .actions .following button', function() {
        $.ajax({
          url: Poe3.apiUrl("users/" + _this.model.id + "/followers/" + (app.getUser().id)),
          type: 'DELETE',
          success: function(resp) {
            var follower;
            _this.model.set('following', (function() {
              var _i, _len, _ref, _results;
              _ref = this.model.get('followers');
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                follower = _ref[_i];
                if (follower.id !== app.getUser().id) {
                  _results.push(follower);
                }
              }
              return _results;
            }).call(_this));
            $('.user-view .actions .following').hide();
            $('.user-view .actions .not-following').show();
            return $('.user-view .following-mark').hide();
          }
        });
        return false;
      });
      $(document).bindNew('click', '.user-view .std-menu .completed', function() {
        app.navigate("/" + _this.domain + "/" + _this.username + "/completed", false);
        _this.section = 'completed';
        _this.loadSection();
        return false;
      });
      $(document).bindNew('click', '.user-view .std-menu .open', function() {
        app.navigate("/" + _this.domain + "/" + _this.username + "/open", false);
        _this.section = 'open';
        _this.loadSection();
        return false;
      });
      $(document).bindNew('click', '.user-view .std-menu .likes', function() {
        app.navigate("/" + _this.domain + "/" + _this.username + "/likes", false);
        _this.section = 'likes';
        _this.loadSection();
        return false;
      });
      $(document).bindNew('click', '.user-view .std-menu .tags', function() {
        app.navigate("/" + _this.domain + "/" + _this.username + "/tags", false);
        _this.section = 'tags';
        _this.loadSection();
        return false;
      });
      return $(document).bindNew('click', '.user-view .std-menu .messages', function() {
        app.navigate("/" + _this.domain + "/" + _this.username + "/messages", false);
        _this.section = 'messages';
        _this.loadSection();
        return false;
      });
    };

    UserView.prototype.isOwnProfile = function() {
      return app.getUser().id === this.model.id;
    };

    UserView.prototype.getPostByUID = function(uid) {
      var matches, post, posts, _ref;
      posts = (_ref = this.postsModel) != null ? _ref.toArray() : void 0;
      if (posts) {
        matches = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = posts.length; _i < _len; _i++) {
            post = posts[_i];
            if (post.get('uid') === uid) {
              _results.push(post);
            }
          }
          return _results;
        })();
        if (matches.length) {
          return matches[0];
        }
      }
    };

    return UserView;

  })(Poe3.PageView);

  window.Poe3.UserView = UserView;

}).call(this);
