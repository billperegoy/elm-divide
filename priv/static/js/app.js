(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = null;
    hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};

require.register("phoenix/priv/static/phoenix.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "phoenix");
  (function() {
    (function(exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Phoenix Channels JavaScript client
//
// ## Socket Connection
//
// A single connection is established to the server and
// channels are multiplexed over the connection.
// Connect to the server using the `Socket` class:
//
//     let socket = new Socket("/ws", {params: {userToken: "123"}})
//     socket.connect()
//
// The `Socket` constructor takes the mount point of the socket,
// the authentication params, as well as options that can be found in
// the Socket docs, such as configuring the `LongPoll` transport, and
// heartbeat.
//
// ## Channels
//
// Channels are isolated, concurrent processes on the server that
// subscribe to topics and broker events between the client and server.
// To join a channel, you must provide the topic, and channel params for
// authorization. Here's an example chat room example where `"new_msg"`
// events are listened for, messages are pushed to the server, and
// the channel is joined with ok/error/timeout matches:
//
//     let channel = socket.channel("room:123", {token: roomToken})
//     channel.on("new_msg", msg => console.log("Got message", msg) )
//     $input.onEnter( e => {
//       channel.push("new_msg", {body: e.target.val}, 10000)
//        .receive("ok", (msg) => console.log("created message", msg) )
//        .receive("error", (reasons) => console.log("create failed", reasons) )
//        .receive("timeout", () => console.log("Networking issue...") )
//     })
//     channel.join()
//       .receive("ok", ({messages}) => console.log("catching up", messages) )
//       .receive("error", ({reason}) => console.log("failed join", reason) )
//       .receive("timeout", () => console.log("Networking issue. Still waiting...") )
//
//
// ## Joining
//
// Creating a channel with `socket.channel(topic, params)`, binds the params to
// `channel.params`, which are sent up on `channel.join()`.
// Subsequent rejoins will send up the modified params for
// updating authorization params, or passing up last_message_id information.
// Successful joins receive an "ok" status, while unsuccessful joins
// receive "error".
//
// ## Duplicate Join Subscriptions
//
// While the client may join any number of topics on any number of channels,
// the client may only hold a single subscription for each unique topic at any
// given time. When attempting to create a duplicate subscription,
// the server will close the existing channel, log a warning, and
// spawn a new channel for the topic. The client will have their
// `channel.onClose` callbacks fired for the existing channel, and the new
// channel join will have its receive hooks processed as normal.
//
// ## Pushing Messages
//
// From the previous example, we can see that pushing messages to the server
// can be done with `channel.push(eventName, payload)` and we can optionally
// receive responses from the push. Additionally, we can use
// `receive("timeout", callback)` to abort waiting for our other `receive` hooks
//  and take action after some period of waiting. The default timeout is 5000ms.
//
//
// ## Socket Hooks
//
// Lifecycle events of the multiplexed connection can be hooked into via
// `socket.onError()` and `socket.onClose()` events, ie:
//
//     socket.onError( () => console.log("there was an error with the connection!") )
//     socket.onClose( () => console.log("the connection dropped") )
//
//
// ## Channel Hooks
//
// For each joined channel, you can bind to `onError` and `onClose` events
// to monitor the channel lifecycle, ie:
//
//     channel.onError( () => console.log("there was an error!") )
//     channel.onClose( () => console.log("the channel has gone away gracefully") )
//
// ### onError hooks
//
// `onError` hooks are invoked if the socket connection drops, or the channel
// crashes on the server. In either case, a channel rejoin is attempted
// automatically in an exponential backoff manner.
//
// ### onClose hooks
//
// `onClose` hooks are invoked only in two cases. 1) the channel explicitly
// closed on the server, or 2). The client explicitly closed, by calling
// `channel.leave()`
//
//
// ## Presence
//
// The `Presence` object provides features for syncing presence information
// from the server with the client and handling presences joining and leaving.
//
// ### Syncing initial state from the server
//
// `Presence.syncState` is used to sync the list of presences on the server
// with the client's state. An optional `onJoin` and `onLeave` callback can
// be provided to react to changes in the client's local presences across
// disconnects and reconnects with the server.
//
// `Presence.syncDiff` is used to sync a diff of presence join and leave
// events from the server, as they happen. Like `syncState`, `syncDiff`
// accepts optional `onJoin` and `onLeave` callbacks to react to a user
// joining or leaving from a device.
//
// ### Listing Presences
//
// `Presence.list` is used to return a list of presence information
// based on the local state of metadata. By default, all presence
// metadata is returned, but a `listBy` function can be supplied to
// allow the client to select which metadata to use for a given presence.
// For example, you may have a user online from different devices with a
// a metadata status of "online", but they have set themselves to "away"
// on another device. In this case, they app may choose to use the "away"
// status for what appears on the UI. The example below defines a `listBy`
// function which prioritizes the first metadata which was registered for
// each user. This could be the first tab they opened, or the first device
// they came online from:
//
//     let state = {}
//     state = Presence.syncState(state, stateFromServer)
//     let listBy = (id, {metas: [first, ...rest]}) => {
//       first.count = rest.length + 1 // count of this user's presences
//       first.id = id
//       return first
//     }
//     let onlineUsers = Presence.list(state, listBy)
//
//
// ### Example Usage
//
//     // detect if user has joined for the 1st time or from another tab/device
//     let onJoin = (id, current, newPres) => {
//       if(!current){
//         console.log("user has entered for the first time", newPres)
//       } else {
//         console.log("user additional presence", newPres)
//       }
//     }
//     // detect if user has left from all tabs/devices, or is still present
//     let onLeave = (id, current, leftPres) => {
//       if(current.metas.length === 0){
//         console.log("user has left from all devices", leftPres)
//       } else {
//         console.log("user left from a device", leftPres)
//       }
//     }
//     let presences = {} // client's initial empty presence state
//     // receive initial presence data from server, sent after join
//     myChannel.on("presences", state => {
//       presences = Presence.syncState(presences, state, onJoin, onLeave)
//       displayUsers(Presence.list(presences))
//     })
//     // receive "presence_diff" from server, containing join/leave events
//     myChannel.on("presence_diff", diff => {
//       presences = Presence.syncDiff(presences, diff, onJoin, onLeave)
//       this.setState({users: Presence.list(room.presences, listBy)})
//     })
//
var VSN = "1.0.0";
var SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 };
var DEFAULT_TIMEOUT = 10000;
var CHANNEL_STATES = {
  closed: "closed",
  errored: "errored",
  joined: "joined",
  joining: "joining",
  leaving: "leaving"
};
var CHANNEL_EVENTS = {
  close: "phx_close",
  error: "phx_error",
  join: "phx_join",
  reply: "phx_reply",
  leave: "phx_leave"
};
var TRANSPORTS = {
  longpoll: "longpoll",
  websocket: "websocket"
};

var Push = function () {

  // Initializes the Push
  //
  // channel - The Channel
  // event - The event, for example `"phx_join"`
  // payload - The payload, for example `{user_id: 123}`
  // timeout - The push timeout in milliseconds
  //

  function Push(channel, event, payload, timeout) {
    _classCallCheck(this, Push);

    this.channel = channel;
    this.event = event;
    this.payload = payload || {};
    this.receivedResp = null;
    this.timeout = timeout;
    this.timeoutTimer = null;
    this.recHooks = [];
    this.sent = false;
  }

  _createClass(Push, [{
    key: "resend",
    value: function resend(timeout) {
      this.timeout = timeout;
      this.cancelRefEvent();
      this.ref = null;
      this.refEvent = null;
      this.receivedResp = null;
      this.sent = false;
      this.send();
    }
  }, {
    key: "send",
    value: function send() {
      if (this.hasReceived("timeout")) {
        return;
      }
      this.startTimeout();
      this.sent = true;
      this.channel.socket.push({
        topic: this.channel.topic,
        event: this.event,
        payload: this.payload,
        ref: this.ref
      });
    }
  }, {
    key: "receive",
    value: function receive(status, callback) {
      if (this.hasReceived(status)) {
        callback(this.receivedResp.response);
      }

      this.recHooks.push({ status: status, callback: callback });
      return this;
    }

    // private

  }, {
    key: "matchReceive",
    value: function matchReceive(_ref) {
      var status = _ref.status;
      var response = _ref.response;
      var ref = _ref.ref;

      this.recHooks.filter(function (h) {
        return h.status === status;
      }).forEach(function (h) {
        return h.callback(response);
      });
    }
  }, {
    key: "cancelRefEvent",
    value: function cancelRefEvent() {
      if (!this.refEvent) {
        return;
      }
      this.channel.off(this.refEvent);
    }
  }, {
    key: "cancelTimeout",
    value: function cancelTimeout() {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }, {
    key: "startTimeout",
    value: function startTimeout() {
      var _this = this;

      if (this.timeoutTimer) {
        return;
      }
      this.ref = this.channel.socket.makeRef();
      this.refEvent = this.channel.replyEventName(this.ref);

      this.channel.on(this.refEvent, function (payload) {
        _this.cancelRefEvent();
        _this.cancelTimeout();
        _this.receivedResp = payload;
        _this.matchReceive(payload);
      });

      this.timeoutTimer = setTimeout(function () {
        _this.trigger("timeout", {});
      }, this.timeout);
    }
  }, {
    key: "hasReceived",
    value: function hasReceived(status) {
      return this.receivedResp && this.receivedResp.status === status;
    }
  }, {
    key: "trigger",
    value: function trigger(status, response) {
      this.channel.trigger(this.refEvent, { status: status, response: response });
    }
  }]);

  return Push;
}();

var Channel = exports.Channel = function () {
  function Channel(topic, params, socket) {
    var _this2 = this;

    _classCallCheck(this, Channel);

    this.state = CHANNEL_STATES.closed;
    this.topic = topic;
    this.params = params || {};
    this.socket = socket;
    this.bindings = [];
    this.timeout = this.socket.timeout;
    this.joinedOnce = false;
    this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
    this.pushBuffer = [];
    this.rejoinTimer = new Timer(function () {
      return _this2.rejoinUntilConnected();
    }, this.socket.reconnectAfterMs);
    this.joinPush.receive("ok", function () {
      _this2.state = CHANNEL_STATES.joined;
      _this2.rejoinTimer.reset();
      _this2.pushBuffer.forEach(function (pushEvent) {
        return pushEvent.send();
      });
      _this2.pushBuffer = [];
    });
    this.onClose(function () {
      _this2.rejoinTimer.reset();
      _this2.socket.log("channel", "close " + _this2.topic + " " + _this2.joinRef());
      _this2.state = CHANNEL_STATES.closed;
      _this2.socket.remove(_this2);
    });
    this.onError(function (reason) {
      if (_this2.isLeaving() || _this2.isClosed()) {
        return;
      }
      _this2.socket.log("channel", "error " + _this2.topic, reason);
      _this2.state = CHANNEL_STATES.errored;
      _this2.rejoinTimer.scheduleTimeout();
    });
    this.joinPush.receive("timeout", function () {
      if (!_this2.isJoining()) {
        return;
      }
      _this2.socket.log("channel", "timeout " + _this2.topic, _this2.joinPush.timeout);
      _this2.state = CHANNEL_STATES.errored;
      _this2.rejoinTimer.scheduleTimeout();
    });
    this.on(CHANNEL_EVENTS.reply, function (payload, ref) {
      _this2.trigger(_this2.replyEventName(ref), payload);
    });
  }

  _createClass(Channel, [{
    key: "rejoinUntilConnected",
    value: function rejoinUntilConnected() {
      this.rejoinTimer.scheduleTimeout();
      if (this.socket.isConnected()) {
        this.rejoin();
      }
    }
  }, {
    key: "join",
    value: function join() {
      var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];

      if (this.joinedOnce) {
        throw "tried to join multiple times. 'join' can only be called a single time per channel instance";
      } else {
        this.joinedOnce = true;
        this.rejoin(timeout);
        return this.joinPush;
      }
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.on(CHANNEL_EVENTS.close, callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.on(CHANNEL_EVENTS.error, function (reason) {
        return callback(reason);
      });
    }
  }, {
    key: "on",
    value: function on(event, callback) {
      this.bindings.push({ event: event, callback: callback });
    }
  }, {
    key: "off",
    value: function off(event) {
      this.bindings = this.bindings.filter(function (bind) {
        return bind.event !== event;
      });
    }
  }, {
    key: "canPush",
    value: function canPush() {
      return this.socket.isConnected() && this.isJoined();
    }
  }, {
    key: "push",
    value: function push(event, payload) {
      var timeout = arguments.length <= 2 || arguments[2] === undefined ? this.timeout : arguments[2];

      if (!this.joinedOnce) {
        throw "tried to push '" + event + "' to '" + this.topic + "' before joining. Use channel.join() before pushing events";
      }
      var pushEvent = new Push(this, event, payload, timeout);
      if (this.canPush()) {
        pushEvent.send();
      } else {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
      }

      return pushEvent;
    }

    // Leaves the channel
    //
    // Unsubscribes from server events, and
    // instructs channel to terminate on server
    //
    // Triggers onClose() hooks
    //
    // To receive leave acknowledgements, use the a `receive`
    // hook to bind to the server ack, ie:
    //
    //     channel.leave().receive("ok", () => alert("left!") )
    //

  }, {
    key: "leave",
    value: function leave() {
      var _this3 = this;

      var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];

      this.state = CHANNEL_STATES.leaving;
      var onClose = function onClose() {
        _this3.socket.log("channel", "leave " + _this3.topic);
        _this3.trigger(CHANNEL_EVENTS.close, "leave", _this3.joinRef());
      };
      var leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
      leavePush.receive("ok", function () {
        return onClose();
      }).receive("timeout", function () {
        return onClose();
      });
      leavePush.send();
      if (!this.canPush()) {
        leavePush.trigger("ok", {});
      }

      return leavePush;
    }

    // Overridable message hook
    //
    // Receives all events for specialized message handling
    // before dispatching to the channel callbacks.
    //
    // Must return the payload, modified or unmodified

  }, {
    key: "onMessage",
    value: function onMessage(event, payload, ref) {
      return payload;
    }

    // private

  }, {
    key: "isMember",
    value: function isMember(topic) {
      return this.topic === topic;
    }
  }, {
    key: "joinRef",
    value: function joinRef() {
      return this.joinPush.ref;
    }
  }, {
    key: "sendJoin",
    value: function sendJoin(timeout) {
      this.state = CHANNEL_STATES.joining;
      this.joinPush.resend(timeout);
    }
  }, {
    key: "rejoin",
    value: function rejoin() {
      var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];
      if (this.isLeaving()) {
        return;
      }
      this.sendJoin(timeout);
    }
  }, {
    key: "trigger",
    value: function trigger(event, payload, ref) {
      var close = CHANNEL_EVENTS.close;
      var error = CHANNEL_EVENTS.error;
      var leave = CHANNEL_EVENTS.leave;
      var join = CHANNEL_EVENTS.join;

      if (ref && [close, error, leave, join].indexOf(event) >= 0 && ref !== this.joinRef()) {
        return;
      }
      var handledPayload = this.onMessage(event, payload, ref);
      if (payload && !handledPayload) {
        throw "channel onMessage callbacks must return the payload, modified or unmodified";
      }

      this.bindings.filter(function (bind) {
        return bind.event === event;
      }).map(function (bind) {
        return bind.callback(handledPayload, ref);
      });
    }
  }, {
    key: "replyEventName",
    value: function replyEventName(ref) {
      return "chan_reply_" + ref;
    }
  }, {
    key: "isClosed",
    value: function isClosed() {
      return this.state === CHANNEL_STATES.closed;
    }
  }, {
    key: "isErrored",
    value: function isErrored() {
      return this.state === CHANNEL_STATES.errored;
    }
  }, {
    key: "isJoined",
    value: function isJoined() {
      return this.state === CHANNEL_STATES.joined;
    }
  }, {
    key: "isJoining",
    value: function isJoining() {
      return this.state === CHANNEL_STATES.joining;
    }
  }, {
    key: "isLeaving",
    value: function isLeaving() {
      return this.state === CHANNEL_STATES.leaving;
    }
  }]);

  return Channel;
}();

var Socket = exports.Socket = function () {

  // Initializes the Socket
  //
  // endPoint - The string WebSocket endpoint, ie, "ws://example.com/ws",
  //                                               "wss://example.com"
  //                                               "/ws" (inherited host & protocol)
  // opts - Optional configuration
  //   transport - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
  //               Defaults to WebSocket with automatic LongPoll fallback.
  //   timeout - The default timeout in milliseconds to trigger push timeouts.
  //             Defaults `DEFAULT_TIMEOUT`
  //   heartbeatIntervalMs - The millisec interval to send a heartbeat message
  //   reconnectAfterMs - The optional function that returns the millsec
  //                      reconnect interval. Defaults to stepped backoff of:
  //
  //     function(tries){
  //       return [1000, 5000, 10000][tries - 1] || 10000
  //     }
  //
  //   logger - The optional function for specialized logging, ie:
  //     `logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
  //
  //   longpollerTimeout - The maximum timeout of a long poll AJAX request.
  //                        Defaults to 20s (double the server long poll timer).
  //
  //   params - The optional params to pass when connecting
  //
  // For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
  //

  function Socket(endPoint) {
    var _this4 = this;

    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Socket);

    this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] };
    this.channels = [];
    this.sendBuffer = [];
    this.ref = 0;
    this.timeout = opts.timeout || DEFAULT_TIMEOUT;
    this.transport = opts.transport || window.WebSocket || LongPoll;
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 30000;
    this.reconnectAfterMs = opts.reconnectAfterMs || function (tries) {
      return [1000, 2000, 5000, 10000][tries - 1] || 10000;
    };
    this.logger = opts.logger || function () {}; // noop
    this.longpollerTimeout = opts.longpollerTimeout || 20000;
    this.params = opts.params || {};
    this.endPoint = endPoint + "/" + TRANSPORTS.websocket;
    this.reconnectTimer = new Timer(function () {
      _this4.disconnect(function () {
        return _this4.connect();
      });
    }, this.reconnectAfterMs);
  }

  _createClass(Socket, [{
    key: "protocol",
    value: function protocol() {
      return location.protocol.match(/^https/) ? "wss" : "ws";
    }
  }, {
    key: "endPointURL",
    value: function endPointURL() {
      var uri = Ajax.appendParams(Ajax.appendParams(this.endPoint, this.params), { vsn: VSN });
      if (uri.charAt(0) !== "/") {
        return uri;
      }
      if (uri.charAt(1) === "/") {
        return this.protocol() + ":" + uri;
      }

      return this.protocol() + "://" + location.host + uri;
    }
  }, {
    key: "disconnect",
    value: function disconnect(callback, code, reason) {
      if (this.conn) {
        this.conn.onclose = function () {}; // noop
        if (code) {
          this.conn.close(code, reason || "");
        } else {
          this.conn.close();
        }
        this.conn = null;
      }
      callback && callback();
    }

    // params - The params to send when connecting, for example `{user_id: userToken}`

  }, {
    key: "connect",
    value: function connect(params) {
      var _this5 = this;

      if (params) {
        console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor");
        this.params = params;
      }
      if (this.conn) {
        return;
      }

      this.conn = new this.transport(this.endPointURL());
      this.conn.timeout = this.longpollerTimeout;
      this.conn.onopen = function () {
        return _this5.onConnOpen();
      };
      this.conn.onerror = function (error) {
        return _this5.onConnError(error);
      };
      this.conn.onmessage = function (event) {
        return _this5.onConnMessage(event);
      };
      this.conn.onclose = function (event) {
        return _this5.onConnClose(event);
      };
    }

    // Logs the message. Override `this.logger` for specialized logging. noops by default

  }, {
    key: "log",
    value: function log(kind, msg, data) {
      this.logger(kind, msg, data);
    }

    // Registers callbacks for connection state change events
    //
    // Examples
    //
    //    socket.onError(function(error){ alert("An error occurred") })
    //

  }, {
    key: "onOpen",
    value: function onOpen(callback) {
      this.stateChangeCallbacks.open.push(callback);
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.stateChangeCallbacks.close.push(callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.stateChangeCallbacks.error.push(callback);
    }
  }, {
    key: "onMessage",
    value: function onMessage(callback) {
      this.stateChangeCallbacks.message.push(callback);
    }
  }, {
    key: "onConnOpen",
    value: function onConnOpen() {
      var _this6 = this;

      this.log("transport", "connected to " + this.endPointURL(), this.transport.prototype);
      this.flushSendBuffer();
      this.reconnectTimer.reset();
      if (!this.conn.skipHeartbeat) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(function () {
          return _this6.sendHeartbeat();
        }, this.heartbeatIntervalMs);
      }
      this.stateChangeCallbacks.open.forEach(function (callback) {
        return callback();
      });
    }
  }, {
    key: "onConnClose",
    value: function onConnClose(event) {
      this.log("transport", "close", event);
      this.triggerChanError();
      clearInterval(this.heartbeatTimer);
      this.reconnectTimer.scheduleTimeout();
      this.stateChangeCallbacks.close.forEach(function (callback) {
        return callback(event);
      });
    }
  }, {
    key: "onConnError",
    value: function onConnError(error) {
      this.log("transport", error);
      this.triggerChanError();
      this.stateChangeCallbacks.error.forEach(function (callback) {
        return callback(error);
      });
    }
  }, {
    key: "triggerChanError",
    value: function triggerChanError() {
      this.channels.forEach(function (channel) {
        return channel.trigger(CHANNEL_EVENTS.error);
      });
    }
  }, {
    key: "connectionState",
    value: function connectionState() {
      switch (this.conn && this.conn.readyState) {
        case SOCKET_STATES.connecting:
          return "connecting";
        case SOCKET_STATES.open:
          return "open";
        case SOCKET_STATES.closing:
          return "closing";
        default:
          return "closed";
      }
    }
  }, {
    key: "isConnected",
    value: function isConnected() {
      return this.connectionState() === "open";
    }
  }, {
    key: "remove",
    value: function remove(channel) {
      this.channels = this.channels.filter(function (c) {
        return c.joinRef() !== channel.joinRef();
      });
    }
  }, {
    key: "channel",
    value: function channel(topic) {
      var chanParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var chan = new Channel(topic, chanParams, this);
      this.channels.push(chan);
      return chan;
    }
  }, {
    key: "push",
    value: function push(data) {
      var _this7 = this;

      var topic = data.topic;
      var event = data.event;
      var payload = data.payload;
      var ref = data.ref;

      var callback = function callback() {
        return _this7.conn.send(JSON.stringify(data));
      };
      this.log("push", topic + " " + event + " (" + ref + ")", payload);
      if (this.isConnected()) {
        callback();
      } else {
        this.sendBuffer.push(callback);
      }
    }

    // Return the next message ref, accounting for overflows

  }, {
    key: "makeRef",
    value: function makeRef() {
      var newRef = this.ref + 1;
      if (newRef === this.ref) {
        this.ref = 0;
      } else {
        this.ref = newRef;
      }

      return this.ref.toString();
    }
  }, {
    key: "sendHeartbeat",
    value: function sendHeartbeat() {
      if (!this.isConnected()) {
        return;
      }
      this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.makeRef() });
    }
  }, {
    key: "flushSendBuffer",
    value: function flushSendBuffer() {
      if (this.isConnected() && this.sendBuffer.length > 0) {
        this.sendBuffer.forEach(function (callback) {
          return callback();
        });
        this.sendBuffer = [];
      }
    }
  }, {
    key: "onConnMessage",
    value: function onConnMessage(rawMessage) {
      var msg = JSON.parse(rawMessage.data);
      var topic = msg.topic;
      var event = msg.event;
      var payload = msg.payload;
      var ref = msg.ref;

      this.log("receive", (payload.status || "") + " " + topic + " " + event + " " + (ref && "(" + ref + ")" || ""), payload);
      this.channels.filter(function (channel) {
        return channel.isMember(topic);
      }).forEach(function (channel) {
        return channel.trigger(event, payload, ref);
      });
      this.stateChangeCallbacks.message.forEach(function (callback) {
        return callback(msg);
      });
    }
  }]);

  return Socket;
}();

var LongPoll = exports.LongPoll = function () {
  function LongPoll(endPoint) {
    _classCallCheck(this, LongPoll);

    this.endPoint = null;
    this.token = null;
    this.skipHeartbeat = true;
    this.onopen = function () {}; // noop
    this.onerror = function () {}; // noop
    this.onmessage = function () {}; // noop
    this.onclose = function () {}; // noop
    this.pollEndpoint = this.normalizeEndpoint(endPoint);
    this.readyState = SOCKET_STATES.connecting;

    this.poll();
  }

  _createClass(LongPoll, [{
    key: "normalizeEndpoint",
    value: function normalizeEndpoint(endPoint) {
      return endPoint.replace("ws://", "http://").replace("wss://", "https://").replace(new RegExp("(.*)\/" + TRANSPORTS.websocket), "$1/" + TRANSPORTS.longpoll);
    }
  }, {
    key: "endpointURL",
    value: function endpointURL() {
      return Ajax.appendParams(this.pollEndpoint, { token: this.token });
    }
  }, {
    key: "closeAndRetry",
    value: function closeAndRetry() {
      this.close();
      this.readyState = SOCKET_STATES.connecting;
    }
  }, {
    key: "ontimeout",
    value: function ontimeout() {
      this.onerror("timeout");
      this.closeAndRetry();
    }
  }, {
    key: "poll",
    value: function poll() {
      var _this8 = this;

      if (!(this.readyState === SOCKET_STATES.open || this.readyState === SOCKET_STATES.connecting)) {
        return;
      }

      Ajax.request("GET", this.endpointURL(), "application/json", null, this.timeout, this.ontimeout.bind(this), function (resp) {
        if (resp) {
          var status = resp.status;
          var token = resp.token;
          var messages = resp.messages;

          _this8.token = token;
        } else {
          var status = 0;
        }

        switch (status) {
          case 200:
            messages.forEach(function (msg) {
              return _this8.onmessage({ data: JSON.stringify(msg) });
            });
            _this8.poll();
            break;
          case 204:
            _this8.poll();
            break;
          case 410:
            _this8.readyState = SOCKET_STATES.open;
            _this8.onopen();
            _this8.poll();
            break;
          case 0:
          case 500:
            _this8.onerror();
            _this8.closeAndRetry();
            break;
          default:
            throw "unhandled poll status " + status;
        }
      });
    }
  }, {
    key: "send",
    value: function send(body) {
      var _this9 = this;

      Ajax.request("POST", this.endpointURL(), "application/json", body, this.timeout, this.onerror.bind(this, "timeout"), function (resp) {
        if (!resp || resp.status !== 200) {
          _this9.onerror(status);
          _this9.closeAndRetry();
        }
      });
    }
  }, {
    key: "close",
    value: function close(code, reason) {
      this.readyState = SOCKET_STATES.closed;
      this.onclose();
    }
  }]);

  return LongPoll;
}();

var Ajax = exports.Ajax = function () {
  function Ajax() {
    _classCallCheck(this, Ajax);
  }

  _createClass(Ajax, null, [{
    key: "request",
    value: function request(method, endPoint, accept, body, timeout, ontimeout, callback) {
      if (window.XDomainRequest) {
        var req = new XDomainRequest(); // IE8, IE9
        this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback);
      } else {
        var req = window.XMLHttpRequest ? new XMLHttpRequest() : // IE7+, Firefox, Chrome, Opera, Safari
        new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
        this.xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback);
      }
    }
  }, {
    key: "xdomainRequest",
    value: function xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback) {
      var _this10 = this;

      req.timeout = timeout;
      req.open(method, endPoint);
      req.onload = function () {
        var response = _this10.parseJSON(req.responseText);
        callback && callback(response);
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      // Work around bug in IE9 that requires an attached onprogress handler
      req.onprogress = function () {};

      req.send(body);
    }
  }, {
    key: "xhrRequest",
    value: function xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback) {
      var _this11 = this;

      req.timeout = timeout;
      req.open(method, endPoint, true);
      req.setRequestHeader("Content-Type", accept);
      req.onerror = function () {
        callback && callback(null);
      };
      req.onreadystatechange = function () {
        if (req.readyState === _this11.states.complete && callback) {
          var response = _this11.parseJSON(req.responseText);
          callback(response);
        }
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      req.send(body);
    }
  }, {
    key: "parseJSON",
    value: function parseJSON(resp) {
      return resp && resp !== "" ? JSON.parse(resp) : null;
    }
  }, {
    key: "serialize",
    value: function serialize(obj, parentKey) {
      var queryStr = [];
      for (var key in obj) {
        if (!obj.hasOwnProperty(key)) {
          continue;
        }
        var paramKey = parentKey ? parentKey + "[" + key + "]" : key;
        var paramVal = obj[key];
        if ((typeof paramVal === "undefined" ? "undefined" : _typeof(paramVal)) === "object") {
          queryStr.push(this.serialize(paramVal, paramKey));
        } else {
          queryStr.push(encodeURIComponent(paramKey) + "=" + encodeURIComponent(paramVal));
        }
      }
      return queryStr.join("&");
    }
  }, {
    key: "appendParams",
    value: function appendParams(url, params) {
      if (Object.keys(params).length === 0) {
        return url;
      }

      var prefix = url.match(/\?/) ? "&" : "?";
      return "" + url + prefix + this.serialize(params);
    }
  }]);

  return Ajax;
}();

Ajax.states = { complete: 4 };

var Presence = exports.Presence = {
  syncState: function syncState(currentState, newState, onJoin, onLeave) {
    var _this12 = this;

    var state = this.clone(currentState);
    var joins = {};
    var leaves = {};

    this.map(state, function (key, presence) {
      if (!newState[key]) {
        leaves[key] = presence;
      }
    });
    this.map(newState, function (key, newPresence) {
      var currentPresence = state[key];
      if (currentPresence) {
        (function () {
          var newRefs = newPresence.metas.map(function (m) {
            return m.phx_ref;
          });
          var curRefs = currentPresence.metas.map(function (m) {
            return m.phx_ref;
          });
          var joinedMetas = newPresence.metas.filter(function (m) {
            return curRefs.indexOf(m.phx_ref) < 0;
          });
          var leftMetas = currentPresence.metas.filter(function (m) {
            return newRefs.indexOf(m.phx_ref) < 0;
          });
          if (joinedMetas.length > 0) {
            joins[key] = newPresence;
            joins[key].metas = joinedMetas;
          }
          if (leftMetas.length > 0) {
            leaves[key] = _this12.clone(currentPresence);
            leaves[key].metas = leftMetas;
          }
        })();
      } else {
        joins[key] = newPresence;
      }
    });
    return this.syncDiff(state, { joins: joins, leaves: leaves }, onJoin, onLeave);
  },
  syncDiff: function syncDiff(currentState, _ref2, onJoin, onLeave) {
    var joins = _ref2.joins;
    var leaves = _ref2.leaves;

    var state = this.clone(currentState);
    if (!onJoin) {
      onJoin = function onJoin() {};
    }
    if (!onLeave) {
      onLeave = function onLeave() {};
    }

    this.map(joins, function (key, newPresence) {
      var currentPresence = state[key];
      state[key] = newPresence;
      if (currentPresence) {
        var _state$key$metas;

        (_state$key$metas = state[key].metas).unshift.apply(_state$key$metas, _toConsumableArray(currentPresence.metas));
      }
      onJoin(key, currentPresence, newPresence);
    });
    this.map(leaves, function (key, leftPresence) {
      var currentPresence = state[key];
      if (!currentPresence) {
        return;
      }
      var refsToRemove = leftPresence.metas.map(function (m) {
        return m.phx_ref;
      });
      currentPresence.metas = currentPresence.metas.filter(function (p) {
        return refsToRemove.indexOf(p.phx_ref) < 0;
      });
      onLeave(key, currentPresence, leftPresence);
      if (currentPresence.metas.length === 0) {
        delete state[key];
      }
    });
    return state;
  },
  list: function list(presences, chooser) {
    if (!chooser) {
      chooser = function chooser(key, pres) {
        return pres;
      };
    }

    return this.map(presences, function (key, presence) {
      return chooser(key, presence);
    });
  },

  // private

  map: function map(obj, func) {
    return Object.getOwnPropertyNames(obj).map(function (key) {
      return func(key, obj[key]);
    });
  },
  clone: function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};

// Creates a timer that accepts a `timerCalc` function to perform
// calculated timeout retries, such as exponential backoff.
//
// ## Examples
//
//    let reconnectTimer = new Timer(() => this.connect(), function(tries){
//      return [1000, 5000, 10000][tries - 1] || 10000
//    })
//    reconnectTimer.scheduleTimeout() // fires after 1000
//    reconnectTimer.scheduleTimeout() // fires after 5000
//    reconnectTimer.reset()
//    reconnectTimer.scheduleTimeout() // fires after 1000
//

var Timer = function () {
  function Timer(callback, timerCalc) {
    _classCallCheck(this, Timer);

    this.callback = callback;
    this.timerCalc = timerCalc;
    this.timer = null;
    this.tries = 0;
  }

  _createClass(Timer, [{
    key: "reset",
    value: function reset() {
      this.tries = 0;
      clearTimeout(this.timer);
    }

    // Cancels any previous scheduleTimeout and schedules callback

  }, {
    key: "scheduleTimeout",
    value: function scheduleTimeout() {
      var _this13 = this;

      clearTimeout(this.timer);

      this.timer = setTimeout(function () {
        _this13.tries = _this13.tries + 1;
        _this13.callback();
      }, this.timerCalc(this.tries + 1));
    }
  }]);

  return Timer;
}();

})(typeof(exports) === "undefined" ? window.Phoenix = window.Phoenix || {} : exports);
  })();
});

require.register("phoenix_html/priv/static/phoenix_html.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "phoenix_html");
  (function() {
    'use strict';

function isLinkToSubmitParent(element) {
  var isLinkTag = element.tagName === 'A';
  var shouldSubmitParent = element.getAttribute('data-submit') === 'parent';

  return isLinkTag && shouldSubmitParent;
}

function getClosestForm(element) {
  while (element && element !== document && element.nodeType === Node.ELEMENT_NODE) {
    if (element.tagName === 'FORM') {
      return element;
    }
    element = element.parentNode;
  }
  return null;
}

function didHandleSubmitLinkClick(element) {
  while (element && element.getAttribute) {
    if (isLinkToSubmitParent(element)) {
      var message = element.getAttribute('data-confirm');
      if (message === null || confirm(message)) {
        getClosestForm(element).submit();
      }
      return true;
    } else {
      element = element.parentNode;
    }
  }
  return false;
}

window.addEventListener('click', function (event) {
  if (event.target && didHandleSubmitLinkClick(event.target)) {
    event.preventDefault();
    return false;
  }
}, false);
  })();
});

require.register("process/browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "process");
  (function() {
    // shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };
  })();
});
require.register("frontend/elm-stuff/packages/NoRedInk/elm-decode-pipeline/3.0.0/examples/Example.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/NoRedInk/elm-decode-pipeline/3.0.0/src/Json/Decode/Pipeline.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/NoRedInk/elm-decode-pipeline/3.0.0/tests/Main.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/NoRedInk/elm-decode-pipeline/3.0.0/tests/Tests.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Array.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Basics.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Bitwise.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Char.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Color.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Date.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Debug.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Dict.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Json/Decode.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Json/Encode.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/List.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Maybe.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/Array.js", function(exports, require, module) {
'use strict';

//import Native.List //

var _elm_lang$core$Native_Array = function () {

	// A RRB-Tree has two distinct data types.
	// Leaf -> "height"  is always 0
	//         "table"   is an array of elements
	// Node -> "height"  is always greater than 0
	//         "table"   is an array of child nodes
	//         "lengths" is an array of accumulated lengths of the child nodes

	// M is the maximal table size. 32 seems fast. E is the allowed increase
	// of search steps when concatting to find an index. Lower values will
	// decrease balancing, but will increase search steps.
	var M = 32;
	var E = 2;

	// An empty array.
	var empty = {
		ctor: '_Array',
		height: 0,
		table: []
	};

	function get(i, array) {
		if (i < 0 || i >= length(array)) {
			throw new Error('Index ' + i + ' is out of range. Check the length of ' + 'your array first or use getMaybe or getWithDefault.');
		}
		return unsafeGet(i, array);
	}

	function unsafeGet(i, array) {
		for (var x = array.height; x > 0; x--) {
			var slot = i >> x * 5;
			while (array.lengths[slot] <= i) {
				slot++;
			}
			if (slot > 0) {
				i -= array.lengths[slot - 1];
			}
			array = array.table[slot];
		}
		return array.table[i];
	}

	// Sets the value at the index i. Only the nodes leading to i will get
	// copied and updated.
	function set(i, item, array) {
		if (i < 0 || length(array) <= i) {
			return array;
		}
		return unsafeSet(i, item, array);
	}

	function unsafeSet(i, item, array) {
		array = nodeCopy(array);

		if (array.height === 0) {
			array.table[i] = item;
		} else {
			var slot = getSlot(i, array);
			if (slot > 0) {
				i -= array.lengths[slot - 1];
			}
			array.table[slot] = unsafeSet(i, item, array.table[slot]);
		}
		return array;
	}

	function initialize(len, f) {
		if (len <= 0) {
			return empty;
		}
		var h = Math.floor(Math.log(len) / Math.log(M));
		return initialize_(f, h, 0, len);
	}

	function initialize_(f, h, from, to) {
		if (h === 0) {
			var table = new Array((to - from) % (M + 1));
			for (var i = 0; i < table.length; i++) {
				table[i] = f(from + i);
			}
			return {
				ctor: '_Array',
				height: 0,
				table: table
			};
		}

		var step = Math.pow(M, h);
		var table = new Array(Math.ceil((to - from) / step));
		var lengths = new Array(table.length);
		for (var i = 0; i < table.length; i++) {
			table[i] = initialize_(f, h - 1, from + i * step, Math.min(from + (i + 1) * step, to));
			lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
		}
		return {
			ctor: '_Array',
			height: h,
			table: table,
			lengths: lengths
		};
	}

	function fromList(list) {
		if (list.ctor === '[]') {
			return empty;
		}

		// Allocate M sized blocks (table) and write list elements to it.
		var table = new Array(M);
		var nodes = [];
		var i = 0;

		while (list.ctor !== '[]') {
			table[i] = list._0;
			list = list._1;
			i++;

			// table is full, so we can push a leaf containing it into the
			// next node.
			if (i === M) {
				var leaf = {
					ctor: '_Array',
					height: 0,
					table: table
				};
				fromListPush(leaf, nodes);
				table = new Array(M);
				i = 0;
			}
		}

		// Maybe there is something left on the table.
		if (i > 0) {
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table.splice(0, i)
			};
			fromListPush(leaf, nodes);
		}

		// Go through all of the nodes and eventually push them into higher nodes.
		for (var h = 0; h < nodes.length - 1; h++) {
			if (nodes[h].table.length > 0) {
				fromListPush(nodes[h], nodes);
			}
		}

		var head = nodes[nodes.length - 1];
		if (head.height > 0 && head.table.length === 1) {
			return head.table[0];
		} else {
			return head;
		}
	}

	// Push a node into a higher node as a child.
	function fromListPush(toPush, nodes) {
		var h = toPush.height;

		// Maybe the node on this height does not exist.
		if (nodes.length === h) {
			var node = {
				ctor: '_Array',
				height: h + 1,
				table: [],
				lengths: []
			};
			nodes.push(node);
		}

		nodes[h].table.push(toPush);
		var len = length(toPush);
		if (nodes[h].lengths.length > 0) {
			len += nodes[h].lengths[nodes[h].lengths.length - 1];
		}
		nodes[h].lengths.push(len);

		if (nodes[h].table.length === M) {
			fromListPush(nodes[h], nodes);
			nodes[h] = {
				ctor: '_Array',
				height: h + 1,
				table: [],
				lengths: []
			};
		}
	}

	// Pushes an item via push_ to the bottom right of a tree.
	function push(item, a) {
		var pushed = push_(item, a);
		if (pushed !== null) {
			return pushed;
		}

		var newTree = create(item, a.height);
		return siblise(a, newTree);
	}

	// Recursively tries to push an item to the bottom-right most
	// tree possible. If there is no space left for the item,
	// null will be returned.
	function push_(item, a) {
		// Handle resursion stop at leaf level.
		if (a.height === 0) {
			if (a.table.length < M) {
				var newA = {
					ctor: '_Array',
					height: 0,
					table: a.table.slice()
				};
				newA.table.push(item);
				return newA;
			} else {
				return null;
			}
		}

		// Recursively push
		var pushed = push_(item, botRight(a));

		// There was space in the bottom right tree, so the slot will
		// be updated.
		if (pushed !== null) {
			var newA = nodeCopy(a);
			newA.table[newA.table.length - 1] = pushed;
			newA.lengths[newA.lengths.length - 1]++;
			return newA;
		}

		// When there was no space left, check if there is space left
		// for a new slot with a tree which contains only the item
		// at the bottom.
		if (a.table.length < M) {
			var newSlot = create(item, a.height - 1);
			var newA = nodeCopy(a);
			newA.table.push(newSlot);
			newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
			return newA;
		} else {
			return null;
		}
	}

	// Converts an array into a list of elements.
	function toList(a) {
		return toList_(_elm_lang$core$Native_List.Nil, a);
	}

	function toList_(list, a) {
		for (var i = a.table.length - 1; i >= 0; i--) {
			list = a.height === 0 ? _elm_lang$core$Native_List.Cons(a.table[i], list) : toList_(list, a.table[i]);
		}
		return list;
	}

	// Maps a function over the elements of an array.
	function map(f, a) {
		var newA = {
			ctor: '_Array',
			height: a.height,
			table: new Array(a.table.length)
		};
		if (a.height > 0) {
			newA.lengths = a.lengths;
		}
		for (var i = 0; i < a.table.length; i++) {
			newA.table[i] = a.height === 0 ? f(a.table[i]) : map(f, a.table[i]);
		}
		return newA;
	}

	// Maps a function over the elements with their index as first argument.
	function indexedMap(f, a) {
		return indexedMap_(f, a, 0);
	}

	function indexedMap_(f, a, from) {
		var newA = {
			ctor: '_Array',
			height: a.height,
			table: new Array(a.table.length)
		};
		if (a.height > 0) {
			newA.lengths = a.lengths;
		}
		for (var i = 0; i < a.table.length; i++) {
			newA.table[i] = a.height === 0 ? A2(f, from + i, a.table[i]) : indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
		}
		return newA;
	}

	function foldl(f, b, a) {
		if (a.height === 0) {
			for (var i = 0; i < a.table.length; i++) {
				b = A2(f, a.table[i], b);
			}
		} else {
			for (var i = 0; i < a.table.length; i++) {
				b = foldl(f, b, a.table[i]);
			}
		}
		return b;
	}

	function foldr(f, b, a) {
		if (a.height === 0) {
			for (var i = a.table.length; i--;) {
				b = A2(f, a.table[i], b);
			}
		} else {
			for (var i = a.table.length; i--;) {
				b = foldr(f, b, a.table[i]);
			}
		}
		return b;
	}

	// TODO: currently, it slices the right, then the left. This can be
	// optimized.
	function slice(from, to, a) {
		if (from < 0) {
			from += length(a);
		}
		if (to < 0) {
			to += length(a);
		}
		return sliceLeft(from, sliceRight(to, a));
	}

	function sliceRight(to, a) {
		if (to === length(a)) {
			return a;
		}

		// Handle leaf level.
		if (a.height === 0) {
			var newA = { ctor: '_Array', height: 0 };
			newA.table = a.table.slice(0, to);
			return newA;
		}

		// Slice the right recursively.
		var right = getSlot(to, a);
		var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

		// Maybe the a node is not even needed, as sliced contains the whole slice.
		if (right === 0) {
			return sliced;
		}

		// Create new node.
		var newA = {
			ctor: '_Array',
			height: a.height,
			table: a.table.slice(0, right),
			lengths: a.lengths.slice(0, right)
		};
		if (sliced.table.length > 0) {
			newA.table[right] = sliced;
			newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
		}
		return newA;
	}

	function sliceLeft(from, a) {
		if (from === 0) {
			return a;
		}

		// Handle leaf level.
		if (a.height === 0) {
			var newA = { ctor: '_Array', height: 0 };
			newA.table = a.table.slice(from, a.table.length + 1);
			return newA;
		}

		// Slice the left recursively.
		var left = getSlot(from, a);
		var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

		// Maybe the a node is not even needed, as sliced contains the whole slice.
		if (left === a.table.length - 1) {
			return sliced;
		}

		// Create new node.
		var newA = {
			ctor: '_Array',
			height: a.height,
			table: a.table.slice(left, a.table.length + 1),
			lengths: new Array(a.table.length - left)
		};
		newA.table[0] = sliced;
		var len = 0;
		for (var i = 0; i < newA.table.length; i++) {
			len += length(newA.table[i]);
			newA.lengths[i] = len;
		}

		return newA;
	}

	// Appends two trees.
	function append(a, b) {
		if (a.table.length === 0) {
			return b;
		}
		if (b.table.length === 0) {
			return a;
		}

		var c = append_(a, b);

		// Check if both nodes can be crunshed together.
		if (c[0].table.length + c[1].table.length <= M) {
			if (c[0].table.length === 0) {
				return c[1];
			}
			if (c[1].table.length === 0) {
				return c[0];
			}

			// Adjust .table and .lengths
			c[0].table = c[0].table.concat(c[1].table);
			if (c[0].height > 0) {
				var len = length(c[0]);
				for (var i = 0; i < c[1].lengths.length; i++) {
					c[1].lengths[i] += len;
				}
				c[0].lengths = c[0].lengths.concat(c[1].lengths);
			}

			return c[0];
		}

		if (c[0].height > 0) {
			var toRemove = calcToRemove(a, b);
			if (toRemove > E) {
				c = shuffle(c[0], c[1], toRemove);
			}
		}

		return siblise(c[0], c[1]);
	}

	// Returns an array of two nodes; right and left. One node _may_ be empty.
	function append_(a, b) {
		if (a.height === 0 && b.height === 0) {
			return [a, b];
		}

		if (a.height !== 1 || b.height !== 1) {
			if (a.height === b.height) {
				a = nodeCopy(a);
				b = nodeCopy(b);
				var appended = append_(botRight(a), botLeft(b));

				insertRight(a, appended[1]);
				insertLeft(b, appended[0]);
			} else if (a.height > b.height) {
				a = nodeCopy(a);
				var appended = append_(botRight(a), b);

				insertRight(a, appended[0]);
				b = parentise(appended[1], appended[1].height + 1);
			} else {
				b = nodeCopy(b);
				var appended = append_(a, botLeft(b));

				var left = appended[0].table.length === 0 ? 0 : 1;
				var right = left === 0 ? 1 : 0;
				insertLeft(b, appended[left]);
				a = parentise(appended[right], appended[right].height + 1);
			}
		}

		// Check if balancing is needed and return based on that.
		if (a.table.length === 0 || b.table.length === 0) {
			return [a, b];
		}

		var toRemove = calcToRemove(a, b);
		if (toRemove <= E) {
			return [a, b];
		}
		return shuffle(a, b, toRemove);
	}

	// Helperfunctions for append_. Replaces a child node at the side of the parent.
	function insertRight(parent, node) {
		var index = parent.table.length - 1;
		parent.table[index] = node;
		parent.lengths[index] = length(node);
		parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
	}

	function insertLeft(parent, node) {
		if (node.table.length > 0) {
			parent.table[0] = node;
			parent.lengths[0] = length(node);

			var len = length(parent.table[0]);
			for (var i = 1; i < parent.lengths.length; i++) {
				len += length(parent.table[i]);
				parent.lengths[i] = len;
			}
		} else {
			parent.table.shift();
			for (var i = 1; i < parent.lengths.length; i++) {
				parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
			}
			parent.lengths.shift();
		}
	}

	// Returns the extra search steps for E. Refer to the paper.
	function calcToRemove(a, b) {
		var subLengths = 0;
		for (var i = 0; i < a.table.length; i++) {
			subLengths += a.table[i].table.length;
		}
		for (var i = 0; i < b.table.length; i++) {
			subLengths += b.table[i].table.length;
		}

		var toRemove = a.table.length + b.table.length;
		return toRemove - (Math.floor((subLengths - 1) / M) + 1);
	}

	// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
	function get2(a, b, index) {
		return index < a.length ? a[index] : b[index - a.length];
	}

	function set2(a, b, index, value) {
		if (index < a.length) {
			a[index] = value;
		} else {
			b[index - a.length] = value;
		}
	}

	function saveSlot(a, b, index, slot) {
		set2(a.table, b.table, index, slot);

		var l = index === 0 || index === a.lengths.length ? 0 : get2(a.lengths, a.lengths, index - 1);

		set2(a.lengths, b.lengths, index, l + length(slot));
	}

	// Creates a node or leaf with a given length at their arrays for perfomance.
	// Is only used by shuffle.
	function createNode(h, length) {
		if (length < 0) {
			length = 0;
		}
		var a = {
			ctor: '_Array',
			height: h,
			table: new Array(length)
		};
		if (h > 0) {
			a.lengths = new Array(length);
		}
		return a;
	}

	// Returns an array of two balanced nodes.
	function shuffle(a, b, toRemove) {
		var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
		var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

		// Skip the slots with size M. More precise: copy the slot references
		// to the new node
		var read = 0;
		while (get2(a.table, b.table, read).table.length % M === 0) {
			set2(newA.table, newB.table, read, get2(a.table, b.table, read));
			set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
			read++;
		}

		// Pulling items from left to right, caching in a slot before writing
		// it into the new nodes.
		var write = read;
		var slot = new createNode(a.height - 1, 0);
		var from = 0;

		// If the current slot is still containing data, then there will be at
		// least one more write, so we do not break this loop yet.
		while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove) {
			// Find out the max possible items for copying.
			var source = get2(a.table, b.table, read);
			var to = Math.min(M - slot.table.length, source.table.length);

			// Copy and adjust size table.
			slot.table = slot.table.concat(source.table.slice(from, to));
			if (slot.height > 0) {
				var len = slot.lengths.length;
				for (var i = len; i < len + to - from; i++) {
					slot.lengths[i] = length(slot.table[i]);
					slot.lengths[i] += i > 0 ? slot.lengths[i - 1] : 0;
				}
			}

			from += to;

			// Only proceed to next slots[i] if the current one was
			// fully copied.
			if (source.table.length <= to) {
				read++;from = 0;
			}

			// Only create a new slot if the current one is filled up.
			if (slot.table.length === M) {
				saveSlot(newA, newB, write, slot);
				slot = createNode(a.height - 1, 0);
				write++;
			}
		}

		// Cleanup after the loop. Copy the last slot into the new nodes.
		if (slot.table.length > 0) {
			saveSlot(newA, newB, write, slot);
			write++;
		}

		// Shift the untouched slots to the left
		while (read < a.table.length + b.table.length) {
			saveSlot(newA, newB, write, get2(a.table, b.table, read));
			read++;
			write++;
		}

		return [newA, newB];
	}

	// Navigation functions
	function botRight(a) {
		return a.table[a.table.length - 1];
	}
	function botLeft(a) {
		return a.table[0];
	}

	// Copies a node for updating. Note that you should not use this if
	// only updating only one of "table" or "lengths" for performance reasons.
	function nodeCopy(a) {
		var newA = {
			ctor: '_Array',
			height: a.height,
			table: a.table.slice()
		};
		if (a.height > 0) {
			newA.lengths = a.lengths.slice();
		}
		return newA;
	}

	// Returns how many items are in the tree.
	function length(array) {
		if (array.height === 0) {
			return array.table.length;
		} else {
			return array.lengths[array.lengths.length - 1];
		}
	}

	// Calculates in which slot of "table" the item probably is, then
	// find the exact slot via forward searching in  "lengths". Returns the index.
	function getSlot(i, a) {
		var slot = i >> 5 * a.height;
		while (a.lengths[slot] <= i) {
			slot++;
		}
		return slot;
	}

	// Recursively creates a tree with a given height containing
	// only the given item.
	function create(item, h) {
		if (h === 0) {
			return {
				ctor: '_Array',
				height: 0,
				table: [item]
			};
		}
		return {
			ctor: '_Array',
			height: h,
			table: [create(item, h - 1)],
			lengths: [1]
		};
	}

	// Recursively creates a tree that contains the given tree.
	function parentise(tree, h) {
		if (h === tree.height) {
			return tree;
		}

		return {
			ctor: '_Array',
			height: h,
			table: [parentise(tree, h - 1)],
			lengths: [length(tree)]
		};
	}

	// Emphasizes blood brotherhood beneath two trees.
	function siblise(a, b) {
		return {
			ctor: '_Array',
			height: a.height + 1,
			table: [a, b],
			lengths: [length(a), length(a) + length(b)]
		};
	}

	function toJSArray(a) {
		var jsArray = new Array(length(a));
		toJSArray_(jsArray, 0, a);
		return jsArray;
	}

	function toJSArray_(jsArray, i, a) {
		for (var t = 0; t < a.table.length; t++) {
			if (a.height === 0) {
				jsArray[i + t] = a.table[t];
			} else {
				var inc = t === 0 ? 0 : a.lengths[t - 1];
				toJSArray_(jsArray, i + inc, a.table[t]);
			}
		}
	}

	function fromJSArray(jsArray) {
		if (jsArray.length === 0) {
			return empty;
		}
		var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
		return fromJSArray_(jsArray, h, 0, jsArray.length);
	}

	function fromJSArray_(jsArray, h, from, to) {
		if (h === 0) {
			return {
				ctor: '_Array',
				height: 0,
				table: jsArray.slice(from, to)
			};
		}

		var step = Math.pow(M, h);
		var table = new Array(Math.ceil((to - from) / step));
		var lengths = new Array(table.length);
		for (var i = 0; i < table.length; i++) {
			table[i] = fromJSArray_(jsArray, h - 1, from + i * step, Math.min(from + (i + 1) * step, to));
			lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
		}
		return {
			ctor: '_Array',
			height: h,
			table: table,
			lengths: lengths
		};
	}

	return {
		empty: empty,
		fromList: fromList,
		toList: toList,
		initialize: F2(initialize),
		append: F2(append),
		push: F2(push),
		slice: F3(slice),
		get: F2(get),
		set: F3(set),
		map: F2(map),
		indexedMap: F2(indexedMap),
		foldl: F3(foldl),
		foldr: F3(foldr),
		length: length,

		toJSArray: toJSArray,
		fromJSArray: fromJSArray
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/Basics.js", function(exports, require, module) {
'use strict';

//import Native.Utils //

var _elm_lang$core$Native_Basics = function () {

	function div(a, b) {
		return a / b | 0;
	}
	function rem(a, b) {
		return a % b;
	}
	function mod(a, b) {
		if (b === 0) {
			throw new Error('Cannot perform mod 0. Division by zero error.');
		}
		var r = a % b;
		var m = a === 0 ? 0 : b > 0 ? a >= 0 ? r : r + b : -mod(-a, -b);

		return m === b ? 0 : m;
	}
	function logBase(base, n) {
		return Math.log(n) / Math.log(base);
	}
	function negate(n) {
		return -n;
	}
	function abs(n) {
		return n < 0 ? -n : n;
	}

	function min(a, b) {
		return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
	}
	function max(a, b) {
		return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
	}
	function clamp(lo, hi, n) {
		return _elm_lang$core$Native_Utils.cmp(n, lo) < 0 ? lo : _elm_lang$core$Native_Utils.cmp(n, hi) > 0 ? hi : n;
	}

	var ord = ['LT', 'EQ', 'GT'];

	function compare(x, y) {
		return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
	}

	function xor(a, b) {
		return a !== b;
	}
	function not(b) {
		return !b;
	}
	function isInfinite(n) {
		return n === Infinity || n === -Infinity;
	}

	function truncate(n) {
		return n | 0;
	}

	function degrees(d) {
		return d * Math.PI / 180;
	}
	function turns(t) {
		return 2 * Math.PI * t;
	}
	function fromPolar(point) {
		var r = point._0;
		var t = point._1;
		return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
	}
	function toPolar(point) {
		var x = point._0;
		var y = point._1;
		return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
	}

	return {
		div: F2(div),
		rem: F2(rem),
		mod: F2(mod),

		pi: Math.PI,
		e: Math.E,
		cos: Math.cos,
		sin: Math.sin,
		tan: Math.tan,
		acos: Math.acos,
		asin: Math.asin,
		atan: Math.atan,
		atan2: F2(Math.atan2),

		degrees: degrees,
		turns: turns,
		fromPolar: fromPolar,
		toPolar: toPolar,

		sqrt: Math.sqrt,
		logBase: F2(logBase),
		negate: negate,
		abs: abs,
		min: F2(min),
		max: F2(max),
		clamp: F3(clamp),
		compare: F2(compare),

		xor: F2(xor),
		not: not,

		truncate: truncate,
		ceiling: Math.ceil,
		floor: Math.floor,
		round: Math.round,
		toFloat: function toFloat(x) {
			return x;
		},
		isNaN: isNaN,
		isInfinite: isInfinite
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/Bitwise.js", function(exports, require, module) {
"use strict";

var _elm_lang$core$Native_Bitwise = function () {

	return {
		and: F2(function and(a, b) {
			return a & b;
		}),
		or: F2(function or(a, b) {
			return a | b;
		}),
		xor: F2(function xor(a, b) {
			return a ^ b;
		}),
		complement: function complement(a) {
			return ~a;
		},
		shiftLeftBy: F2(function (offset, a) {
			return a << offset;
		}),
		shiftRightBy: F2(function (offset, a) {
			return a >> offset;
		}),
		shiftRightZfBy: F2(function (offset, a) {
			return a >>> offset;
		})
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/Char.js", function(exports, require, module) {
"use strict";

//import Native.Utils //

var _elm_lang$core$Native_Char = function () {

	return {
		fromCode: function fromCode(c) {
			return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c));
		},
		toCode: function toCode(c) {
			return c.charCodeAt(0);
		},
		toUpper: function toUpper(c) {
			return _elm_lang$core$Native_Utils.chr(c.toUpperCase());
		},
		toLower: function toLower(c) {
			return _elm_lang$core$Native_Utils.chr(c.toLowerCase());
		},
		toLocaleUpper: function toLocaleUpper(c) {
			return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase());
		},
		toLocaleLower: function toLocaleLower(c) {
			return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase());
		}
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/Date.js", function(exports, require, module) {
'use strict';

//import Result //

var _elm_lang$core$Native_Date = function () {

	function fromString(str) {
		var date = new Date(str);
		return isNaN(date.getTime()) ? _elm_lang$core$Result$Err('Unable to parse \'' + str + '\' as a date. Dates must be in the ISO 8601 format.') : _elm_lang$core$Result$Ok(date);
	}

	var dayTable = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	var monthTable = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	return {
		fromString: fromString,
		year: function year(d) {
			return d.getFullYear();
		},
		month: function month(d) {
			return { ctor: monthTable[d.getMonth()] };
		},
		day: function day(d) {
			return d.getDate();
		},
		hour: function hour(d) {
			return d.getHours();
		},
		minute: function minute(d) {
			return d.getMinutes();
		},
		second: function second(d) {
			return d.getSeconds();
		},
		millisecond: function millisecond(d) {
			return d.getMilliseconds();
		},
		toTime: function toTime(d) {
			return d.getTime();
		},
		fromTime: function fromTime(t) {
			return new Date(t);
		},
		dayOfWeek: function dayOfWeek(d) {
			return { ctor: dayTable[d.getDay()] };
		}
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/Debug.js", function(exports, require, module) {
'use strict';

//import Native.Utils //

var _elm_lang$core$Native_Debug = function () {

	function log(tag, value) {
		var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
		var process = process || {};
		if (process.stdout) {
			process.stdout.write(msg);
		} else {
			console.log(msg);
		}
		return value;
	}

	function crash(message) {
		throw new Error(message);
	}

	return {
		crash: crash,
		log: F2(log)
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/Json.js", function(exports, require, module) {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function () {

	// CORE DECODERS

	function succeed(msg) {
		return {
			ctor: '<decoder>',
			tag: 'succeed',
			msg: msg
		};
	}

	function fail(msg) {
		return {
			ctor: '<decoder>',
			tag: 'fail',
			msg: msg
		};
	}

	function decodePrimitive(tag) {
		return {
			ctor: '<decoder>',
			tag: tag
		};
	}

	function decodeContainer(tag, decoder) {
		return {
			ctor: '<decoder>',
			tag: tag,
			decoder: decoder
		};
	}

	function decodeNull(value) {
		return {
			ctor: '<decoder>',
			tag: 'null',
			value: value
		};
	}

	function decodeField(field, decoder) {
		return {
			ctor: '<decoder>',
			tag: 'field',
			field: field,
			decoder: decoder
		};
	}

	function decodeIndex(index, decoder) {
		return {
			ctor: '<decoder>',
			tag: 'index',
			index: index,
			decoder: decoder
		};
	}

	function decodeKeyValuePairs(decoder) {
		return {
			ctor: '<decoder>',
			tag: 'key-value',
			decoder: decoder
		};
	}

	function mapMany(f, decoders) {
		return {
			ctor: '<decoder>',
			tag: 'map-many',
			func: f,
			decoders: decoders
		};
	}

	function andThen(callback, decoder) {
		return {
			ctor: '<decoder>',
			tag: 'andThen',
			decoder: decoder,
			callback: callback
		};
	}

	function oneOf(decoders) {
		return {
			ctor: '<decoder>',
			tag: 'oneOf',
			decoders: decoders
		};
	}

	// DECODING OBJECTS

	function map1(f, d1) {
		return mapMany(f, [d1]);
	}

	function map2(f, d1, d2) {
		return mapMany(f, [d1, d2]);
	}

	function map3(f, d1, d2, d3) {
		return mapMany(f, [d1, d2, d3]);
	}

	function map4(f, d1, d2, d3, d4) {
		return mapMany(f, [d1, d2, d3, d4]);
	}

	function map5(f, d1, d2, d3, d4, d5) {
		return mapMany(f, [d1, d2, d3, d4, d5]);
	}

	function map6(f, d1, d2, d3, d4, d5, d6) {
		return mapMany(f, [d1, d2, d3, d4, d5, d6]);
	}

	function map7(f, d1, d2, d3, d4, d5, d6, d7) {
		return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
	}

	function map8(f, d1, d2, d3, d4, d5, d6, d7, d8) {
		return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
	}

	// DECODE HELPERS

	function ok(value) {
		return { tag: 'ok', value: value };
	}

	function badPrimitive(type, value) {
		return { tag: 'primitive', type: type, value: value };
	}

	function badIndex(index, nestedProblems) {
		return { tag: 'index', index: index, rest: nestedProblems };
	}

	function badField(field, nestedProblems) {
		return { tag: 'field', field: field, rest: nestedProblems };
	}

	function badIndex(index, nestedProblems) {
		return { tag: 'index', index: index, rest: nestedProblems };
	}

	function badOneOf(problems) {
		return { tag: 'oneOf', problems: problems };
	}

	function bad(msg) {
		return { tag: 'fail', msg: msg };
	}

	function badToString(problem) {
		var context = '_';
		while (problem) {
			switch (problem.tag) {
				case 'primitive':
					return 'Expecting ' + problem.type + (context === '_' ? '' : ' at ' + context) + ' but instead got: ' + jsToString(problem.value);

				case 'index':
					context += '[' + problem.index + ']';
					problem = problem.rest;
					break;

				case 'field':
					context += '.' + problem.field;
					problem = problem.rest;
					break;

				case 'oneOf':
					var problems = problem.problems;
					for (var i = 0; i < problems.length; i++) {
						problems[i] = badToString(problems[i]);
					}
					return 'I ran into the following problems' + (context === '_' ? '' : ' at ' + context) + ':\n\n' + problems.join('\n');

				case 'fail':
					return 'I ran into a `fail` decoder' + (context === '_' ? '' : ' at ' + context) + ': ' + problem.msg;
			}
		}
	}

	function jsToString(value) {
		return value === undefined ? 'undefined' : JSON.stringify(value);
	}

	// DECODE

	function runOnString(decoder, string) {
		var json;
		try {
			json = JSON.parse(string);
		} catch (e) {
			return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
		}
		return run(decoder, json);
	}

	function run(decoder, value) {
		var result = runHelp(decoder, value);
		return result.tag === 'ok' ? _elm_lang$core$Result$Ok(result.value) : _elm_lang$core$Result$Err(badToString(result));
	}

	function runHelp(decoder, value) {
		switch (decoder.tag) {
			case 'bool':
				return typeof value === 'boolean' ? ok(value) : badPrimitive('a Bool', value);

			case 'int':
				if (typeof value !== 'number') {
					return badPrimitive('an Int', value);
				}

				if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
					return ok(value);
				}

				if (isFinite(value) && !(value % 1)) {
					return ok(value);
				}

				return badPrimitive('an Int', value);

			case 'float':
				return typeof value === 'number' ? ok(value) : badPrimitive('a Float', value);

			case 'string':
				return typeof value === 'string' ? ok(value) : value instanceof String ? ok(value + '') : badPrimitive('a String', value);

			case 'null':
				return value === null ? ok(decoder.value) : badPrimitive('null', value);

			case 'value':
				return ok(value);

			case 'list':
				if (!(value instanceof Array)) {
					return badPrimitive('a List', value);
				}

				var list = _elm_lang$core$Native_List.Nil;
				for (var i = value.length; i--;) {
					var result = runHelp(decoder.decoder, value[i]);
					if (result.tag !== 'ok') {
						return badIndex(i, result);
					}
					list = _elm_lang$core$Native_List.Cons(result.value, list);
				}
				return ok(list);

			case 'array':
				if (!(value instanceof Array)) {
					return badPrimitive('an Array', value);
				}

				var len = value.length;
				var array = new Array(len);
				for (var i = len; i--;) {
					var result = runHelp(decoder.decoder, value[i]);
					if (result.tag !== 'ok') {
						return badIndex(i, result);
					}
					array[i] = result.value;
				}
				return ok(_elm_lang$core$Native_Array.fromJSArray(array));

			case 'maybe':
				var result = runHelp(decoder.decoder, value);
				return result.tag === 'ok' ? ok(_elm_lang$core$Maybe$Just(result.value)) : ok(_elm_lang$core$Maybe$Nothing);

			case 'field':
				var field = decoder.field;
				if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' || value === null || !(field in value)) {
					return badPrimitive('an object with a field named `' + field + '`', value);
				}

				var result = runHelp(decoder.decoder, value[field]);
				return result.tag === 'ok' ? result : badField(field, result);

			case 'index':
				var index = decoder.index;
				if (!(value instanceof Array)) {
					return badPrimitive('an array', value);
				}
				if (index >= value.length) {
					return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
				}

				var result = runHelp(decoder.decoder, value[index]);
				return result.tag === 'ok' ? result : badIndex(index, result);

			case 'key-value':
				if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' || value === null || value instanceof Array) {
					return badPrimitive('an object', value);
				}

				var keyValuePairs = _elm_lang$core$Native_List.Nil;
				for (var key in value) {
					var result = runHelp(decoder.decoder, value[key]);
					if (result.tag !== 'ok') {
						return badField(key, result);
					}
					var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
					keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
				}
				return ok(keyValuePairs);

			case 'map-many':
				var answer = decoder.func;
				var decoders = decoder.decoders;
				for (var i = 0; i < decoders.length; i++) {
					var result = runHelp(decoders[i], value);
					if (result.tag !== 'ok') {
						return result;
					}
					answer = answer(result.value);
				}
				return ok(answer);

			case 'andThen':
				var result = runHelp(decoder.decoder, value);
				return result.tag !== 'ok' ? result : runHelp(decoder.callback(result.value), value);

			case 'oneOf':
				var errors = [];
				var temp = decoder.decoders;
				while (temp.ctor !== '[]') {
					var result = runHelp(temp._0, value);

					if (result.tag === 'ok') {
						return result;
					}

					errors.push(result);

					temp = temp._1;
				}
				return badOneOf(errors);

			case 'fail':
				return bad(decoder.msg);

			case 'succeed':
				return ok(decoder.msg);
		}
	}

	// EQUALITY

	function equality(a, b) {
		if (a === b) {
			return true;
		}

		if (a.tag !== b.tag) {
			return false;
		}

		switch (a.tag) {
			case 'succeed':
			case 'fail':
				return a.msg === b.msg;

			case 'bool':
			case 'int':
			case 'float':
			case 'string':
			case 'value':
				return true;

			case 'null':
				return a.value === b.value;

			case 'list':
			case 'array':
			case 'maybe':
			case 'key-value':
				return equality(a.decoder, b.decoder);

			case 'field':
				return a.field === b.field && equality(a.decoder, b.decoder);

			case 'index':
				return a.index === b.index && equality(a.decoder, b.decoder);

			case 'map-many':
				if (a.func !== b.func) {
					return false;
				}
				return listEquality(a.decoders, b.decoders);

			case 'andThen':
				return a.callback === b.callback && equality(a.decoder, b.decoder);

			case 'oneOf':
				return listEquality(a.decoders, b.decoders);
		}
	}

	function listEquality(aDecoders, bDecoders) {
		var len = aDecoders.length;
		if (len !== bDecoders.length) {
			return false;
		}
		for (var i = 0; i < len; i++) {
			if (!equality(aDecoders[i], bDecoders[i])) {
				return false;
			}
		}
		return true;
	}

	// ENCODE

	function encode(indentLevel, value) {
		return JSON.stringify(value, null, indentLevel);
	}

	function identity(value) {
		return value;
	}

	function encodeObject(keyValuePairs) {
		var obj = {};
		while (keyValuePairs.ctor !== '[]') {
			var pair = keyValuePairs._0;
			obj[pair._0] = pair._1;
			keyValuePairs = keyValuePairs._1;
		}
		return obj;
	}

	return {
		encode: F2(encode),
		runOnString: F2(runOnString),
		run: F2(run),

		decodeNull: decodeNull,
		decodePrimitive: decodePrimitive,
		decodeContainer: F2(decodeContainer),

		decodeField: F2(decodeField),
		decodeIndex: F2(decodeIndex),

		map1: F2(map1),
		map2: F3(map2),
		map3: F4(map3),
		map4: F5(map4),
		map5: F6(map5),
		map6: F7(map6),
		map7: F8(map7),
		map8: F9(map8),
		decodeKeyValuePairs: decodeKeyValuePairs,

		andThen: F2(andThen),
		fail: fail,
		succeed: succeed,
		oneOf: oneOf,

		identity: identity,
		encodeNull: null,
		encodeArray: _elm_lang$core$Native_Array.toJSArray,
		encodeList: _elm_lang$core$Native_List.toArray,
		encodeObject: encodeObject,

		equality: equality
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/List.js", function(exports, require, module) {
'use strict';

//import Native.Utils //

var _elm_lang$core$Native_List = function () {

	var Nil = { ctor: '[]' };

	function Cons(hd, tl) {
		return { ctor: '::', _0: hd, _1: tl };
	}

	function fromArray(arr) {
		var out = Nil;
		for (var i = arr.length; i--;) {
			out = Cons(arr[i], out);
		}
		return out;
	}

	function toArray(xs) {
		var out = [];
		while (xs.ctor !== '[]') {
			out.push(xs._0);
			xs = xs._1;
		}
		return out;
	}

	function foldr(f, b, xs) {
		var arr = toArray(xs);
		var acc = b;
		for (var i = arr.length; i--;) {
			acc = A2(f, arr[i], acc);
		}
		return acc;
	}

	function map2(f, xs, ys) {
		var arr = [];
		while (xs.ctor !== '[]' && ys.ctor !== '[]') {
			arr.push(A2(f, xs._0, ys._0));
			xs = xs._1;
			ys = ys._1;
		}
		return fromArray(arr);
	}

	function map3(f, xs, ys, zs) {
		var arr = [];
		while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]') {
			arr.push(A3(f, xs._0, ys._0, zs._0));
			xs = xs._1;
			ys = ys._1;
			zs = zs._1;
		}
		return fromArray(arr);
	}

	function map4(f, ws, xs, ys, zs) {
		var arr = [];
		while (ws.ctor !== '[]' && xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]') {
			arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
			ws = ws._1;
			xs = xs._1;
			ys = ys._1;
			zs = zs._1;
		}
		return fromArray(arr);
	}

	function map5(f, vs, ws, xs, ys, zs) {
		var arr = [];
		while (vs.ctor !== '[]' && ws.ctor !== '[]' && xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]') {
			arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
			vs = vs._1;
			ws = ws._1;
			xs = xs._1;
			ys = ys._1;
			zs = zs._1;
		}
		return fromArray(arr);
	}

	function sortBy(f, xs) {
		return fromArray(toArray(xs).sort(function (a, b) {
			return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
		}));
	}

	function sortWith(f, xs) {
		return fromArray(toArray(xs).sort(function (a, b) {
			var ord = f(a)(b).ctor;
			return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
		}));
	}

	return {
		Nil: Nil,
		Cons: Cons,
		cons: F2(Cons),
		toArray: toArray,
		fromArray: fromArray,

		foldr: F3(foldr),

		map2: F3(map2),
		map3: F4(map3),
		map4: F5(map4),
		map5: F6(map5),
		sortBy: F2(sortBy),
		sortWith: F2(sortWith)
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/Platform.js", function(exports, require, module) {
'use strict';

//import //

var _elm_lang$core$Native_Platform = function () {

	// PROGRAMS

	function program(impl) {
		return function (flagDecoder) {
			return function (object, moduleName) {
				object['worker'] = function worker(flags) {
					if (typeof flags !== 'undefined') {
						throw new Error('The `' + moduleName + '` module does not need flags.\n' + 'Call ' + moduleName + '.worker() with no arguments and you should be all set!');
					}

					return initialize(impl.init, impl.update, impl.subscriptions, renderer);
				};
			};
		};
	}

	function programWithFlags(impl) {
		return function (flagDecoder) {
			return function (object, moduleName) {
				object['worker'] = function worker(flags) {
					if (typeof flagDecoder === 'undefined') {
						throw new Error('Are you trying to sneak a Never value into Elm? Trickster!\n' + 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n' + 'Use `program` instead if you do not want flags.');
					}

					var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
					if (result.ctor === 'Err') {
						throw new Error(moduleName + '.worker(...) was called with an unexpected argument.\n' + 'I tried to convert it to an Elm value, but ran into this problem:\n\n' + result._0);
					}

					return initialize(impl.init(result._0), impl.update, impl.subscriptions, renderer);
				};
			};
		};
	}

	function renderer(enqueue, _) {
		return function (_) {};
	}

	// HTML TO PROGRAM

	function htmlToProgram(vnode) {
		var emptyBag = batch(_elm_lang$core$Native_List.Nil);
		var noChange = _elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.Tuple0, emptyBag);

		return _elm_lang$virtual_dom$VirtualDom$program({
			init: noChange,
			view: function view(model) {
				return main;
			},
			update: F2(function (msg, model) {
				return noChange;
			}),
			subscriptions: function subscriptions(model) {
				return emptyBag;
			}
		});
	}

	// INITIALIZE A PROGRAM

	function initialize(init, update, subscriptions, renderer) {
		// ambient state
		var managers = {};
		var updateView;

		// init and update state in main process
		var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
			var model = init._0;
			updateView = renderer(enqueue, model);
			var cmds = init._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});

		function onMessage(msg, model) {
			return _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
				var results = A2(update, msg, model);
				model = results._0;
				updateView(model);
				var cmds = results._1;
				var subs = subscriptions(model);
				dispatchEffects(managers, cmds, subs);
				callback(_elm_lang$core$Native_Scheduler.succeed(model));
			});
		}

		var mainProcess = spawnLoop(initApp, onMessage);

		function enqueue(msg) {
			_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
		}

		var ports = setupEffects(managers, enqueue);

		return ports ? { ports: ports } : {};
	}

	// EFFECT MANAGERS

	var effectManagers = {};

	function setupEffects(managers, callback) {
		var ports;

		// setup all necessary effect managers
		for (var key in effectManagers) {
			var manager = effectManagers[key];

			if (manager.isForeign) {
				ports = ports || {};
				ports[key] = manager.tag === 'cmd' ? setupOutgoingPort(key) : setupIncomingPort(key, callback);
			}

			managers[key] = makeManager(manager, callback);
		}

		return ports;
	}

	function makeManager(info, callback) {
		var router = {
			main: callback,
			self: undefined
		};

		var tag = info.tag;
		var onEffects = info.onEffects;
		var onSelfMsg = info.onSelfMsg;

		function onMessage(msg, state) {
			if (msg.ctor === 'self') {
				return A3(onSelfMsg, router, msg._0, state);
			}

			var fx = msg._0;
			switch (tag) {
				case 'cmd':
					return A3(onEffects, router, fx.cmds, state);

				case 'sub':
					return A3(onEffects, router, fx.subs, state);

				case 'fx':
					return A4(onEffects, router, fx.cmds, fx.subs, state);
			}
		}

		var process = spawnLoop(info.init, onMessage);
		router.self = process;
		return process;
	}

	function sendToApp(router, msg) {
		return _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
			router.main(msg);
			callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
		});
	}

	function sendToSelf(router, msg) {
		return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
			ctor: 'self',
			_0: msg
		});
	}

	// HELPER for STATEFUL LOOPS

	function spawnLoop(init, onMessage) {
		var andThen = _elm_lang$core$Native_Scheduler.andThen;

		function loop(state) {
			var handleMsg = _elm_lang$core$Native_Scheduler.receive(function (msg) {
				return onMessage(msg, state);
			});
			return A2(andThen, loop, handleMsg);
		}

		var task = A2(andThen, loop, init);

		return _elm_lang$core$Native_Scheduler.rawSpawn(task);
	}

	// BAGS

	function leaf(home) {
		return function (value) {
			return {
				type: 'leaf',
				home: home,
				value: value
			};
		};
	}

	function batch(list) {
		return {
			type: 'node',
			branches: list
		};
	}

	function map(tagger, bag) {
		return {
			type: 'map',
			tagger: tagger,
			tree: bag
		};
	}

	// PIPE BAGS INTO EFFECT MANAGERS

	function dispatchEffects(managers, cmdBag, subBag) {
		var effectsDict = {};
		gatherEffects(true, cmdBag, effectsDict, null);
		gatherEffects(false, subBag, effectsDict, null);

		for (var home in managers) {
			var fx = home in effectsDict ? effectsDict[home] : {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

			_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
		}
	}

	function gatherEffects(isCmd, bag, effectsDict, taggers) {
		switch (bag.type) {
			case 'leaf':
				var home = bag.home;
				var effect = toEffect(isCmd, home, taggers, bag.value);
				effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
				return;

			case 'node':
				var list = bag.branches;
				while (list.ctor !== '[]') {
					gatherEffects(isCmd, list._0, effectsDict, taggers);
					list = list._1;
				}
				return;

			case 'map':
				gatherEffects(isCmd, bag.tree, effectsDict, {
					tagger: bag.tagger,
					rest: taggers
				});
				return;
		}
	}

	function toEffect(isCmd, home, taggers, value) {
		function applyTaggers(x) {
			var temp = taggers;
			while (temp) {
				x = temp.tagger(x);
				temp = temp.rest;
			}
			return x;
		}

		var map = isCmd ? effectManagers[home].cmdMap : effectManagers[home].subMap;

		return A2(map, applyTaggers, value);
	}

	function insert(isCmd, newEffect, effects) {
		effects = effects || {
			cmds: _elm_lang$core$Native_List.Nil,
			subs: _elm_lang$core$Native_List.Nil
		};
		if (isCmd) {
			effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
			return effects;
		}
		effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
		return effects;
	}

	// PORTS

	function checkPortName(name) {
		if (name in effectManagers) {
			throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
		}
	}

	// OUTGOING PORTS

	function outgoingPort(name, converter) {
		checkPortName(name);
		effectManagers[name] = {
			tag: 'cmd',
			cmdMap: outgoingPortMap,
			converter: converter,
			isForeign: true
		};
		return leaf(name);
	}

	var outgoingPortMap = F2(function cmdMap(tagger, value) {
		return value;
	});

	function setupOutgoingPort(name) {
		var subs = [];
		var converter = effectManagers[name].converter;

		// CREATE MANAGER

		var init = _elm_lang$core$Native_Scheduler.succeed(null);

		function onEffects(router, cmdList, state) {
			while (cmdList.ctor !== '[]') {
				// grab a separate reference to subs in case unsubscribe is called
				var currentSubs = subs;
				var value = converter(cmdList._0);
				for (var i = 0; i < currentSubs.length; i++) {
					currentSubs[i](value);
				}
				cmdList = cmdList._1;
			}
			return init;
		}

		effectManagers[name].init = init;
		effectManagers[name].onEffects = F3(onEffects);

		// PUBLIC API

		function subscribe(callback) {
			subs.push(callback);
		}

		function unsubscribe(callback) {
			// copy subs into a new array in case unsubscribe is called within a
			// subscribed callback
			subs = subs.slice();
			var index = subs.indexOf(callback);
			if (index >= 0) {
				subs.splice(index, 1);
			}
		}

		return {
			subscribe: subscribe,
			unsubscribe: unsubscribe
		};
	}

	// INCOMING PORTS

	function incomingPort(name, converter) {
		checkPortName(name);
		effectManagers[name] = {
			tag: 'sub',
			subMap: incomingPortMap,
			converter: converter,
			isForeign: true
		};
		return leaf(name);
	}

	var incomingPortMap = F2(function subMap(tagger, finalTagger) {
		return function (value) {
			return tagger(finalTagger(value));
		};
	});

	function setupIncomingPort(name, callback) {
		var sentBeforeInit = [];
		var subs = _elm_lang$core$Native_List.Nil;
		var converter = effectManagers[name].converter;
		var currentOnEffects = preInitOnEffects;
		var currentSend = preInitSend;

		// CREATE MANAGER

		var init = _elm_lang$core$Native_Scheduler.succeed(null);

		function preInitOnEffects(router, subList, state) {
			var postInitResult = postInitOnEffects(router, subList, state);

			for (var i = 0; i < sentBeforeInit.length; i++) {
				postInitSend(sentBeforeInit[i]);
			}

			sentBeforeInit = null; // to release objects held in queue
			currentSend = postInitSend;
			currentOnEffects = postInitOnEffects;
			return postInitResult;
		}

		function postInitOnEffects(router, subList, state) {
			subs = subList;
			return init;
		}

		function onEffects(router, subList, state) {
			return currentOnEffects(router, subList, state);
		}

		effectManagers[name].init = init;
		effectManagers[name].onEffects = F3(onEffects);

		// PUBLIC API

		function preInitSend(value) {
			sentBeforeInit.push(value);
		}

		function postInitSend(value) {
			var temp = subs;
			while (temp.ctor !== '[]') {
				callback(temp._0(value));
				temp = temp._1;
			}
		}

		function send(incomingValue) {
			var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
			if (result.ctor === 'Err') {
				throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
			}

			currentSend(result._0);
		}

		return { send: send };
	}

	return {
		// routers
		sendToApp: F2(sendToApp),
		sendToSelf: F2(sendToSelf),

		// global setup
		effectManagers: effectManagers,
		outgoingPort: outgoingPort,
		incomingPort: incomingPort,

		htmlToProgram: htmlToProgram,
		program: program,
		programWithFlags: programWithFlags,
		initialize: initialize,

		// effect bags
		leaf: leaf,
		batch: batch,
		map: F2(map)
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/Regex.js", function(exports, require, module) {
'use strict';

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function () {

	function escape(str) {
		return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}
	function caseInsensitive(re) {
		return new RegExp(re.source, 'gi');
	}
	function regex(raw) {
		return new RegExp(raw, 'g');
	}

	function contains(re, string) {
		return string.match(re) !== null;
	}

	function find(n, re, str) {
		n = n.ctor === 'All' ? Infinity : n._0;
		var out = [];
		var number = 0;
		var string = str;
		var lastIndex = re.lastIndex;
		var prevLastIndex = -1;
		var result;
		while (number++ < n && (result = re.exec(string))) {
			if (prevLastIndex === re.lastIndex) break;
			var i = result.length - 1;
			var subs = new Array(i);
			while (i > 0) {
				var submatch = result[i];
				subs[--i] = submatch === undefined ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(submatch);
			}
			out.push({
				match: result[0],
				submatches: _elm_lang$core$Native_List.fromArray(subs),
				index: result.index,
				number: number
			});
			prevLastIndex = re.lastIndex;
		}
		re.lastIndex = lastIndex;
		return _elm_lang$core$Native_List.fromArray(out);
	}

	function replace(n, re, replacer, string) {
		n = n.ctor === 'All' ? Infinity : n._0;
		var count = 0;
		function jsReplacer(match) {
			if (count++ >= n) {
				return match;
			}
			var i = arguments.length - 3;
			var submatches = new Array(i);
			while (i > 0) {
				var submatch = arguments[i];
				submatches[--i] = submatch === undefined ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(submatch);
			}
			return replacer({
				match: match,
				submatches: _elm_lang$core$Native_List.fromArray(submatches),
				index: arguments[arguments.length - 2],
				number: count
			});
		}
		return string.replace(re, jsReplacer);
	}

	function split(n, re, str) {
		n = n.ctor === 'All' ? Infinity : n._0;
		if (n === Infinity) {
			return _elm_lang$core$Native_List.fromArray(str.split(re));
		}
		var string = str;
		var result;
		var out = [];
		var start = re.lastIndex;
		var restoreLastIndex = re.lastIndex;
		while (n--) {
			if (!(result = re.exec(string))) break;
			out.push(string.slice(start, result.index));
			start = re.lastIndex;
		}
		out.push(string.slice(start));
		re.lastIndex = restoreLastIndex;
		return _elm_lang$core$Native_List.fromArray(out);
	}

	return {
		regex: regex,
		caseInsensitive: caseInsensitive,
		escape: escape,

		contains: F2(contains),
		find: F3(find),
		replace: F4(replace),
		split: F3(split)
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/Scheduler.js", function(exports, require, module) {
'use strict';

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function () {

	var MAX_STEPS = 10000;

	// TASKS

	function succeed(value) {
		return {
			ctor: '_Task_succeed',
			value: value
		};
	}

	function fail(error) {
		return {
			ctor: '_Task_fail',
			value: error
		};
	}

	function nativeBinding(callback) {
		return {
			ctor: '_Task_nativeBinding',
			callback: callback,
			cancel: null
		};
	}

	function andThen(callback, task) {
		return {
			ctor: '_Task_andThen',
			callback: callback,
			task: task
		};
	}

	function onError(callback, task) {
		return {
			ctor: '_Task_onError',
			callback: callback,
			task: task
		};
	}

	function receive(callback) {
		return {
			ctor: '_Task_receive',
			callback: callback
		};
	}

	// PROCESSES

	function rawSpawn(task) {
		var process = {
			ctor: '_Process',
			id: _elm_lang$core$Native_Utils.guid(),
			root: task,
			stack: null,
			mailbox: []
		};

		enqueue(process);

		return process;
	}

	function spawn(task) {
		return nativeBinding(function (callback) {
			var process = rawSpawn(task);
			callback(succeed(process));
		});
	}

	function rawSend(process, msg) {
		process.mailbox.push(msg);
		enqueue(process);
	}

	function send(process, msg) {
		return nativeBinding(function (callback) {
			rawSend(process, msg);
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		});
	}

	function kill(process) {
		return nativeBinding(function (callback) {
			var root = process.root;
			if (root.ctor === '_Task_nativeBinding' && root.cancel) {
				root.cancel();
			}

			process.root = null;

			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		});
	}

	function sleep(time) {
		return nativeBinding(function (callback) {
			var id = setTimeout(function () {
				callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
			}, time);

			return function () {
				clearTimeout(id);
			};
		});
	}

	// STEP PROCESSES

	function step(numSteps, process) {
		while (numSteps < MAX_STEPS) {
			var ctor = process.root.ctor;

			if (ctor === '_Task_succeed') {
				while (process.stack && process.stack.ctor === '_Task_onError') {
					process.stack = process.stack.rest;
				}
				if (process.stack === null) {
					break;
				}
				process.root = process.stack.callback(process.root.value);
				process.stack = process.stack.rest;
				++numSteps;
				continue;
			}

			if (ctor === '_Task_fail') {
				while (process.stack && process.stack.ctor === '_Task_andThen') {
					process.stack = process.stack.rest;
				}
				if (process.stack === null) {
					break;
				}
				process.root = process.stack.callback(process.root.value);
				process.stack = process.stack.rest;
				++numSteps;
				continue;
			}

			if (ctor === '_Task_andThen') {
				process.stack = {
					ctor: '_Task_andThen',
					callback: process.root.callback,
					rest: process.stack
				};
				process.root = process.root.task;
				++numSteps;
				continue;
			}

			if (ctor === '_Task_onError') {
				process.stack = {
					ctor: '_Task_onError',
					callback: process.root.callback,
					rest: process.stack
				};
				process.root = process.root.task;
				++numSteps;
				continue;
			}

			if (ctor === '_Task_nativeBinding') {
				process.root.cancel = process.root.callback(function (newRoot) {
					process.root = newRoot;
					enqueue(process);
				});

				break;
			}

			if (ctor === '_Task_receive') {
				var mailbox = process.mailbox;
				if (mailbox.length === 0) {
					break;
				}

				process.root = process.root.callback(mailbox.shift());
				++numSteps;
				continue;
			}

			throw new Error(ctor);
		}

		if (numSteps < MAX_STEPS) {
			return numSteps + 1;
		}
		enqueue(process);

		return numSteps;
	}

	// WORK QUEUE

	var working = false;
	var workQueue = [];

	function enqueue(process) {
		workQueue.push(process);

		if (!working) {
			setTimeout(work, 0);
			working = true;
		}
	}

	function work() {
		var numSteps = 0;
		var process;
		while (numSteps < MAX_STEPS && (process = workQueue.shift())) {
			if (process.root) {
				numSteps = step(numSteps, process);
			}
		}
		if (!process) {
			working = false;
			return;
		}
		setTimeout(work, 0);
	}

	return {
		succeed: succeed,
		fail: fail,
		nativeBinding: nativeBinding,
		andThen: F2(andThen),
		onError: F2(onError),
		receive: receive,

		spawn: spawn,
		kill: kill,
		sleep: sleep,
		send: F2(send),

		rawSpawn: rawSpawn,
		rawSend: rawSend
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/String.js", function(exports, require, module) {
'use strict';

//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function () {

	function isEmpty(str) {
		return str.length === 0;
	}
	function cons(chr, str) {
		return chr + str;
	}
	function uncons(str) {
		var hd = str[0];
		if (hd) {
			return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
		}
		return _elm_lang$core$Maybe$Nothing;
	}
	function append(a, b) {
		return a + b;
	}
	function concat(strs) {
		return _elm_lang$core$Native_List.toArray(strs).join('');
	}
	function length(str) {
		return str.length;
	}
	function map(f, str) {
		var out = str.split('');
		for (var i = out.length; i--;) {
			out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
		}
		return out.join('');
	}
	function filter(pred, str) {
		return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
	}
	function reverse(str) {
		return str.split('').reverse().join('');
	}
	function foldl(f, b, str) {
		var len = str.length;
		for (var i = 0; i < len; ++i) {
			b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
		}
		return b;
	}
	function foldr(f, b, str) {
		for (var i = str.length; i--;) {
			b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
		}
		return b;
	}
	function split(sep, str) {
		return _elm_lang$core$Native_List.fromArray(str.split(sep));
	}
	function join(sep, strs) {
		return _elm_lang$core$Native_List.toArray(strs).join(sep);
	}
	function repeat(n, str) {
		var result = '';
		while (n > 0) {
			if (n & 1) {
				result += str;
			}
			n >>= 1, str += str;
		}
		return result;
	}
	function slice(start, end, str) {
		return str.slice(start, end);
	}
	function left(n, str) {
		return n < 1 ? '' : str.slice(0, n);
	}
	function right(n, str) {
		return n < 1 ? '' : str.slice(-n);
	}
	function dropLeft(n, str) {
		return n < 1 ? str : str.slice(n);
	}
	function dropRight(n, str) {
		return n < 1 ? str : str.slice(0, -n);
	}
	function pad(n, chr, str) {
		var half = (n - str.length) / 2;
		return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
	}
	function padRight(n, chr, str) {
		return str + repeat(n - str.length, chr);
	}
	function padLeft(n, chr, str) {
		return repeat(n - str.length, chr) + str;
	}

	function trim(str) {
		return str.trim();
	}
	function trimLeft(str) {
		return str.replace(/^\s+/, '');
	}
	function trimRight(str) {
		return str.replace(/\s+$/, '');
	}

	function words(str) {
		return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
	}
	function lines(str) {
		return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
	}

	function toUpper(str) {
		return str.toUpperCase();
	}
	function toLower(str) {
		return str.toLowerCase();
	}

	function any(pred, str) {
		for (var i = str.length; i--;) {
			if (pred(_elm_lang$core$Native_Utils.chr(str[i]))) {
				return true;
			}
		}
		return false;
	}
	function all(pred, str) {
		for (var i = str.length; i--;) {
			if (!pred(_elm_lang$core$Native_Utils.chr(str[i]))) {
				return false;
			}
		}
		return true;
	}

	function contains(sub, str) {
		return str.indexOf(sub) > -1;
	}
	function startsWith(sub, str) {
		return str.indexOf(sub) === 0;
	}
	function endsWith(sub, str) {
		return str.length >= sub.length && str.lastIndexOf(sub) === str.length - sub.length;
	}
	function indexes(sub, str) {
		var subLen = sub.length;

		if (subLen < 1) {
			return _elm_lang$core$Native_List.Nil;
		}

		var i = 0;
		var is = [];

		while ((i = str.indexOf(sub, i)) > -1) {
			is.push(i);
			i = i + subLen;
		}

		return _elm_lang$core$Native_List.fromArray(is);
	}

	function toInt(s) {
		var len = s.length;

		// if empty
		if (len === 0) {
			return intErr(s);
		}

		// if hex
		var c = s[0];
		if (c === '0' && s[1] === 'x') {
			for (var i = 2; i < len; ++i) {
				var c = s[i];
				if ('0' <= c && c <= '9' || 'A' <= c && c <= 'F' || 'a' <= c && c <= 'f') {
					continue;
				}
				return intErr(s);
			}
			return _elm_lang$core$Result$Ok(parseInt(s, 16));
		}

		// is decimal
		if (c > '9' || c < '0' && c !== '-' && c !== '+') {
			return intErr(s);
		}
		for (var i = 1; i < len; ++i) {
			var c = s[i];
			if (c < '0' || '9' < c) {
				return intErr(s);
			}
		}

		return _elm_lang$core$Result$Ok(parseInt(s, 10));
	}

	function intErr(s) {
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
	}

	function toFloat(s) {
		// check if it is a hex, octal, or binary number
		if (s.length === 0 || /[\sxbo]/.test(s)) {
			return floatErr(s);
		}
		var n = +s;
		// faster isNaN check
		return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
	}

	function floatErr(s) {
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
	}

	function toList(str) {
		return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
	}
	function fromList(chars) {
		return _elm_lang$core$Native_List.toArray(chars).join('');
	}

	return {
		isEmpty: isEmpty,
		cons: F2(cons),
		uncons: uncons,
		append: F2(append),
		concat: concat,
		length: length,
		map: F2(map),
		filter: F2(filter),
		reverse: reverse,
		foldl: F3(foldl),
		foldr: F3(foldr),

		split: F2(split),
		join: F2(join),
		repeat: F2(repeat),

		slice: F3(slice),
		left: F2(left),
		right: F2(right),
		dropLeft: F2(dropLeft),
		dropRight: F2(dropRight),

		pad: F3(pad),
		padLeft: F3(padLeft),
		padRight: F3(padRight),

		trim: trim,
		trimLeft: trimLeft,
		trimRight: trimRight,

		words: words,
		lines: lines,

		toUpper: toUpper,
		toLower: toLower,

		any: F2(any),
		all: F2(all),

		contains: F2(contains),
		startsWith: F2(startsWith),
		endsWith: F2(endsWith),
		indexes: F2(indexes),

		toInt: toInt,
		toFloat: toFloat,
		toList: toList,
		fromList: fromList
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/Time.js", function(exports, require, module) {
"use strict";

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function () {

	var now = _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
		callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
	});

	function setInterval_(interval, task) {
		return _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
			var id = setInterval(function () {
				_elm_lang$core$Native_Scheduler.rawSpawn(task);
			}, interval);

			return function () {
				clearInterval(id);
			};
		});
	}

	return {
		now: now,
		setInterval_: F2(setInterval_)
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Native/Utils.js", function(exports, require, module) {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//import //

var _elm_lang$core$Native_Utils = function () {

	// COMPARISONS

	function eq(x, y) {
		var stack = [];
		var isEqual = eqHelp(x, y, 0, stack);
		var pair;
		while (isEqual && (pair = stack.pop())) {
			isEqual = eqHelp(pair.x, pair.y, 0, stack);
		}
		return isEqual;
	}

	function eqHelp(x, y, depth, stack) {
		if (depth > 100) {
			stack.push({ x: x, y: y });
			return true;
		}

		if (x === y) {
			return true;
		}

		if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object') {
			if (typeof x === 'function') {
				throw new Error('Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.' + ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#==' + ' which describes why it is this way and what the better version will look like.');
			}
			return false;
		}

		if (x === null || y === null) {
			return false;
		}

		if (x instanceof Date) {
			return x.getTime() === y.getTime();
		}

		if (!('ctor' in x)) {
			for (var key in x) {
				if (!eqHelp(x[key], y[key], depth + 1, stack)) {
					return false;
				}
			}
			return true;
		}

		// convert Dicts and Sets to lists
		if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin') {
			x = _elm_lang$core$Dict$toList(x);
			y = _elm_lang$core$Dict$toList(y);
		}
		if (x.ctor === 'Set_elm_builtin') {
			x = _elm_lang$core$Set$toList(x);
			y = _elm_lang$core$Set$toList(y);
		}

		// check if lists are equal without recursion
		if (x.ctor === '::') {
			var a = x;
			var b = y;
			while (a.ctor === '::' && b.ctor === '::') {
				if (!eqHelp(a._0, b._0, depth + 1, stack)) {
					return false;
				}
				a = a._1;
				b = b._1;
			}
			return a.ctor === b.ctor;
		}

		// check if Arrays are equal
		if (x.ctor === '_Array') {
			var xs = _elm_lang$core$Native_Array.toJSArray(x);
			var ys = _elm_lang$core$Native_Array.toJSArray(y);
			if (xs.length !== ys.length) {
				return false;
			}
			for (var i = 0; i < xs.length; i++) {
				if (!eqHelp(xs[i], ys[i], depth + 1, stack)) {
					return false;
				}
			}
			return true;
		}

		if (!eqHelp(x.ctor, y.ctor, depth + 1, stack)) {
			return false;
		}

		for (var key in x) {
			if (!eqHelp(x[key], y[key], depth + 1, stack)) {
				return false;
			}
		}
		return true;
	}

	// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
	// the particular integer values assigned to LT, EQ, and GT.

	var LT = -1,
	    EQ = 0,
	    GT = 1;

	function cmp(x, y) {
		if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object') {
			return x === y ? EQ : x < y ? LT : GT;
		}

		if (x instanceof String) {
			var a = x.valueOf();
			var b = y.valueOf();
			return a === b ? EQ : a < b ? LT : GT;
		}

		if (x.ctor === '::' || x.ctor === '[]') {
			while (x.ctor === '::' && y.ctor === '::') {
				var ord = cmp(x._0, y._0);
				if (ord !== EQ) {
					return ord;
				}
				x = x._1;
				y = y._1;
			}
			return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
		}

		if (x.ctor.slice(0, 6) === '_Tuple') {
			var ord;
			var n = x.ctor.slice(6) - 0;
			var err = 'cannot compare tuples with more than 6 elements.';
			if (n === 0) return EQ;
			if (n >= 1) {
				ord = cmp(x._0, y._0);if (ord !== EQ) return ord;
				if (n >= 2) {
					ord = cmp(x._1, y._1);if (ord !== EQ) return ord;
					if (n >= 3) {
						ord = cmp(x._2, y._2);if (ord !== EQ) return ord;
						if (n >= 4) {
							ord = cmp(x._3, y._3);if (ord !== EQ) return ord;
							if (n >= 5) {
								ord = cmp(x._4, y._4);if (ord !== EQ) return ord;
								if (n >= 6) {
									ord = cmp(x._5, y._5);if (ord !== EQ) return ord;
									if (n >= 7) throw new Error('Comparison error: ' + err);
								}
							}
						}
					}
				}
			}
			return EQ;
		}

		throw new Error('Comparison error: comparison is only defined on ints, ' + 'floats, times, chars, strings, lists of comparable values, ' + 'and tuples of comparable values.');
	}

	// COMMON VALUES

	var Tuple0 = {
		ctor: '_Tuple0'
	};

	function Tuple2(x, y) {
		return {
			ctor: '_Tuple2',
			_0: x,
			_1: y
		};
	}

	function chr(c) {
		return new String(c);
	}

	// GUID

	var count = 0;
	function guid(_) {
		return count++;
	}

	// RECORDS

	function update(oldRecord, updatedFields) {
		var newRecord = {};

		for (var key in oldRecord) {
			newRecord[key] = oldRecord[key];
		}

		for (var key in updatedFields) {
			newRecord[key] = updatedFields[key];
		}

		return newRecord;
	}

	//// LIST STUFF ////

	var Nil = { ctor: '[]' };

	function Cons(hd, tl) {
		return {
			ctor: '::',
			_0: hd,
			_1: tl
		};
	}

	function append(xs, ys) {
		// append Strings
		if (typeof xs === 'string') {
			return xs + ys;
		}

		// append Lists
		if (xs.ctor === '[]') {
			return ys;
		}
		var root = Cons(xs._0, Nil);
		var curr = root;
		xs = xs._1;
		while (xs.ctor !== '[]') {
			curr._1 = Cons(xs._0, Nil);
			xs = xs._1;
			curr = curr._1;
		}
		curr._1 = ys;
		return root;
	}

	// CRASHES

	function crash(moduleName, region) {
		return function (message) {
			throw new Error('Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n' + 'The message provided by the code author is:\n\n    ' + message);
		};
	}

	function crashCase(moduleName, region, value) {
		return function (message) {
			throw new Error('Ran into a `Debug.crash` in module `' + moduleName + '`\n\n' + 'This was caused by the `case` expression ' + regionToString(region) + '.\n' + 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n' + 'The message provided by the code author is:\n\n    ' + message);
		};
	}

	function regionToString(region) {
		if (region.start.line == region.end.line) {
			return 'on line ' + region.start.line;
		}
		return 'between lines ' + region.start.line + ' and ' + region.end.line;
	}

	// TO STRING

	function toString(v) {
		var type = typeof v === 'undefined' ? 'undefined' : _typeof(v);
		if (type === 'function') {
			return '<function>';
		}

		if (type === 'boolean') {
			return v ? 'True' : 'False';
		}

		if (type === 'number') {
			return v + '';
		}

		if (v instanceof String) {
			return '\'' + addSlashes(v, true) + '\'';
		}

		if (type === 'string') {
			return '"' + addSlashes(v, false) + '"';
		}

		if (v === null) {
			return 'null';
		}

		if (type === 'object' && 'ctor' in v) {
			var ctorStarter = v.ctor.substring(0, 5);

			if (ctorStarter === '_Tupl') {
				var output = [];
				for (var k in v) {
					if (k === 'ctor') continue;
					output.push(toString(v[k]));
				}
				return '(' + output.join(',') + ')';
			}

			if (ctorStarter === '_Task') {
				return '<task>';
			}

			if (v.ctor === '_Array') {
				var list = _elm_lang$core$Array$toList(v);
				return 'Array.fromList ' + toString(list);
			}

			if (v.ctor === '<decoder>') {
				return '<decoder>';
			}

			if (v.ctor === '_Process') {
				return '<process:' + v.id + '>';
			}

			if (v.ctor === '::') {
				var output = '[' + toString(v._0);
				v = v._1;
				while (v.ctor === '::') {
					output += ',' + toString(v._0);
					v = v._1;
				}
				return output + ']';
			}

			if (v.ctor === '[]') {
				return '[]';
			}

			if (v.ctor === 'Set_elm_builtin') {
				return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
			}

			if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin') {
				return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
			}

			var output = '';
			for (var i in v) {
				if (i === 'ctor') continue;
				var str = toString(v[i]);
				var c0 = str[0];
				var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
				output += ' ' + (parenless ? str : '(' + str + ')');
			}
			return v.ctor + output;
		}

		if (type === 'object') {
			if (v instanceof Date) {
				return '<' + v.toString() + '>';
			}

			if (v.elm_web_socket) {
				return '<websocket>';
			}

			var output = [];
			for (var k in v) {
				output.push(k + ' = ' + toString(v[k]));
			}
			if (output.length === 0) {
				return '{}';
			}
			return '{ ' + output.join(', ') + ' }';
		}

		return '<internal structure>';
	}

	function addSlashes(str, isChar) {
		var s = str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r').replace(/\v/g, '\\v').replace(/\0/g, '\\0');
		if (isChar) {
			return s.replace(/\'/g, '\\\'');
		} else {
			return s.replace(/\"/g, '\\"');
		}
	}

	return {
		eq: eq,
		cmp: cmp,
		Tuple0: Tuple0,
		Tuple2: Tuple2,
		chr: chr,
		update: update,
		guid: guid,

		append: F2(append),

		crash: crash,
		crashCase: crashCase,

		toString: toString
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Platform.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Platform/Cmd.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Platform/Sub.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Process.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Random.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Regex.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Result.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Set.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/String.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Task.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Time.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/src/Tuple.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Main.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/Array.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/Basics.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/Bitwise.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/Char.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/CodeGen.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/Dict.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/Equality.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/Json.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/List.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/Maybe.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/Regex.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/Result.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/Set.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/core/5.1.1/tests/Test/String.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/html/2.0.0/src/Html.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/html/2.0.0/src/Html/Attributes.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/html/2.0.0/src/Html/Events.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/html/2.0.0/src/Html/Keyed.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/html/2.0.0/src/Html/Lazy.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/http/1.0.0/src/Http.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/http/1.0.0/src/Http/Internal.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/http/1.0.0/src/Http/Progress.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/http/1.0.0/src/Native/Http.js", function(exports, require, module) {
'use strict';

var _elm_lang$http$Native_Http = function () {

	// ENCODING AND DECODING

	function encodeUri(string) {
		return encodeURIComponent(string);
	}

	function decodeUri(string) {
		try {
			return _elm_lang$core$Maybe$Just(decodeURIComponent(string));
		} catch (e) {
			return _elm_lang$core$Maybe$Nothing;
		}
	}

	// SEND REQUEST

	function toTask(request, maybeProgress) {
		return _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
			var xhr = new XMLHttpRequest();

			configureProgress(xhr, maybeProgress);

			xhr.addEventListener('error', function () {
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NetworkError' }));
			});
			xhr.addEventListener('timeout', function () {
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'Timeout' }));
			});
			xhr.addEventListener('load', function () {
				callback(handleResponse(xhr, request.expect.responseToResult));
			});

			try {
				xhr.open(request.method, request.url, true);
			} catch (e) {
				return callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'BadUrl', _0: request.url }));
			}

			configureRequest(xhr, request);
			send(xhr, request.body);

			return function () {
				xhr.abort();
			};
		});
	}

	function configureProgress(xhr, maybeProgress) {
		if (maybeProgress.ctor === 'Nothing') {
			return;
		}

		xhr.addEventListener('progress', function (event) {
			if (!event.lengthComputable) {
				return;
			}
			_elm_lang$core$Native_Scheduler.rawSpawn(maybeProgress._0({
				bytes: event.loaded,
				bytesExpected: event.total
			}));
		});
	}

	function configureRequest(xhr, request) {
		function setHeader(pair) {
			xhr.setRequestHeader(pair._0, pair._1);
		}

		A2(_elm_lang$core$List$map, setHeader, request.headers);
		xhr.responseType = request.expect.responseType;
		xhr.withCredentials = request.withCredentials;

		if (request.timeout.ctor === 'Just') {
			xhr.timeout = request.timeout._0;
		}
	}

	function send(xhr, body) {
		switch (body.ctor) {
			case 'EmptyBody':
				xhr.send();
				return;

			case 'StringBody':
				xhr.setRequestHeader('Content-Type', body._0);
				xhr.send(body._1);
				return;

			case 'FormDataBody':
				xhr.send(body._0);
				return;
		}
	}

	// RESPONSES

	function handleResponse(xhr, responseToResult) {
		var response = toResponse(xhr);

		if (xhr.status < 200 || 300 <= xhr.status) {
			response.body = xhr.responseText;
			return _elm_lang$core$Native_Scheduler.fail({
				ctor: 'BadStatus',
				_0: response
			});
		}

		var result = responseToResult(response);

		if (result.ctor === 'Ok') {
			return _elm_lang$core$Native_Scheduler.succeed(result._0);
		} else {
			response.body = xhr.responseText;
			return _elm_lang$core$Native_Scheduler.fail({
				ctor: 'BadPayload',
				_0: result._0,
				_1: response
			});
		}
	}

	function toResponse(xhr) {
		return {
			status: { code: xhr.status, message: xhr.statusText },
			headers: parseHeaders(xhr.getAllResponseHeaders()),
			url: xhr.responseURL,
			body: xhr.response
		};
	}

	function parseHeaders(rawHeaders) {
		var headers = _elm_lang$core$Dict$empty;

		if (!rawHeaders) {
			return headers;
		}

		var headerPairs = rawHeaders.split('\r\n');
		for (var i = headerPairs.length; i--;) {
			var headerPair = headerPairs[i];
			var index = headerPair.indexOf(': ');
			if (index > 0) {
				var key = headerPair.substring(0, index);
				var value = headerPair.substring(index + 2);

				headers = A3(_elm_lang$core$Dict$update, key, function (oldValue) {
					if (oldValue.ctor === 'Just') {
						return _elm_lang$core$Maybe$Just(value + ', ' + oldValue._0);
					}
					return _elm_lang$core$Maybe$Just(value);
				}, headers);
			}
		}

		return headers;
	}

	// EXPECTORS

	function expectStringResponse(responseToResult) {
		return {
			responseType: 'text',
			responseToResult: responseToResult
		};
	}

	function mapExpect(func, expect) {
		return {
			responseType: expect.responseType,
			responseToResult: function responseToResult(response) {
				var convertedResponse = expect.responseToResult(response);
				return A2(_elm_lang$core$Result$map, func, convertedResponse);
			}
		};
	}

	// BODY

	function multipart(parts) {
		var formData = new FormData();

		while (parts.ctor !== '[]') {
			var part = parts._0;
			formData.append(part._0, part._1);
			parts = parts._1;
		}

		return { ctor: 'FormDataBody', _0: formData };
	}

	return {
		toTask: F2(toTask),
		expectStringResponse: expectStringResponse,
		mapExpect: F2(mapExpect),
		multipart: multipart,
		encodeUri: encodeUri,
		decodeUri: decodeUri
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/src/Native/Debug.js", function(exports, require, module) {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _elm_lang$virtual_dom$Native_Debug = function () {

	// IMPORT / EXPORT

	function unsafeCoerce(value) {
		return value;
	}

	var upload = _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
		var element = document.createElement('input');
		element.setAttribute('type', 'file');
		element.setAttribute('accept', 'text/json');
		element.style.display = 'none';
		element.addEventListener('change', function (event) {
			var fileReader = new FileReader();
			fileReader.onload = function (e) {
				callback(_elm_lang$core$Native_Scheduler.succeed(e.target.result));
			};
			fileReader.readAsText(event.target.files[0]);
			document.body.removeChild(element);
		});
		document.body.appendChild(element);
		element.click();
	});

	function download(historyLength, json) {
		return _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
			var fileName = 'history-' + historyLength + '.txt';
			var jsonString = JSON.stringify(json);
			var mime = 'text/plain;charset=utf-8';
			var done = _elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0);

			// for IE10+
			if (navigator.msSaveBlob) {
				navigator.msSaveBlob(new Blob([jsonString], { type: mime }), fileName);
				return callback(done);
			}

			// for HTML5
			var element = document.createElement('a');
			element.setAttribute('href', 'data:' + mime + ',' + encodeURIComponent(jsonString));
			element.setAttribute('download', fileName);
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
			callback(done);
		});
	}

	// POPOUT

	function messageToString(value) {
		switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
			case 'boolean':
				return value ? 'True' : 'False';
			case 'number':
				return value + '';
			case 'string':
				return '"' + addSlashes(value, false) + '"';
		}
		if (value instanceof String) {
			return '\'' + addSlashes(value, true) + '\'';
		}
		if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' || value === null || !('ctor' in value)) {
			return '…';
		}

		var ctorStarter = value.ctor.substring(0, 5);
		if (ctorStarter === '_Tupl' || ctorStarter === '_Task') {
			return '…';
		}
		if (['_Array', '<decoder>', '_Process', '::', '[]', 'Set_elm_builtin', 'RBNode_elm_builtin', 'RBEmpty_elm_builtin'].indexOf(value.ctor) >= 0) {
			return '…';
		}

		var keys = Object.keys(value);
		switch (keys.length) {
			case 1:
				return value.ctor;
			case 2:
				return value.ctor + ' ' + messageToString(value._0);
			default:
				return value.ctor + ' … ' + messageToString(value[keys[keys.length - 1]]);
		}
	}

	function primitive(str) {
		return { ctor: 'Primitive', _0: str };
	}

	function init(value) {
		var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

		if (type === 'boolean') {
			return {
				ctor: 'Constructor',
				_0: _elm_lang$core$Maybe$Just(value ? 'True' : 'False'),
				_1: true,
				_2: _elm_lang$core$Native_List.Nil
			};
		}

		if (type === 'number') {
			return primitive(value + '');
		}

		if (type === 'string') {
			return { ctor: 'S', _0: '"' + addSlashes(value, false) + '"' };
		}

		if (value instanceof String) {
			return { ctor: 'S', _0: "'" + addSlashes(value, true) + "'" };
		}

		if (value instanceof Date) {
			return primitive('<' + value.toString() + '>');
		}

		if (value === null) {
			return primitive('XXX');
		}

		if (type === 'object' && 'ctor' in value) {
			var ctor = value.ctor;

			if (ctor === '::' || ctor === '[]') {
				return {
					ctor: 'Sequence',
					_0: { ctor: 'ListSeq' },
					_1: true,
					_2: A2(_elm_lang$core$List$map, init, value)
				};
			}

			if (ctor === 'Set_elm_builtin') {
				return {
					ctor: 'Sequence',
					_0: { ctor: 'SetSeq' },
					_1: true,
					_2: A3(_elm_lang$core$Set$foldr, initCons, _elm_lang$core$Native_List.Nil, value)
				};
			}

			if (ctor === 'RBNode_elm_builtin' || ctor == 'RBEmpty_elm_builtin') {
				return {
					ctor: 'Dictionary',
					_0: true,
					_1: A3(_elm_lang$core$Dict$foldr, initKeyValueCons, _elm_lang$core$Native_List.Nil, value)
				};
			}

			if (ctor === '_Array') {
				return {
					ctor: 'Sequence',
					_0: { ctor: 'ArraySeq' },
					_1: true,
					_2: A3(_elm_lang$core$Array$foldr, initCons, _elm_lang$core$Native_List.Nil, value)
				};
			}

			var ctorStarter = value.ctor.substring(0, 5);
			if (ctorStarter === '_Task') {
				return primitive('<task>');
			}

			if (ctor === '<decoder>') {
				return primitive(ctor);
			}

			if (ctor === '_Process') {
				return primitive('<process>');
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i in value) {
				if (i === 'ctor') continue;
				list = _elm_lang$core$Native_List.Cons(init(value[i]), list);
			}
			return {
				ctor: 'Constructor',
				_0: ctorStarter === '_Tupl' ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(ctor),
				_1: true,
				_2: _elm_lang$core$List$reverse(list)
			};
		}

		if (type === 'object') {
			var dict = _elm_lang$core$Dict$empty;
			for (var i in value) {
				dict = A3(_elm_lang$core$Dict$insert, i, init(value[i]), dict);
			}
			return { ctor: 'Record', _0: true, _1: dict };
		}

		return primitive('XXX');
	}

	var initCons = F2(initConsHelp);

	function initConsHelp(value, list) {
		return _elm_lang$core$Native_List.Cons(init(value), list);
	}

	var initKeyValueCons = F3(initKeyValueConsHelp);

	function initKeyValueConsHelp(key, value, list) {
		return _elm_lang$core$Native_List.Cons(_elm_lang$core$Native_Utils.Tuple2(init(key), init(value)), list);
	}

	function addSlashes(str, isChar) {
		var s = str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r').replace(/\v/g, '\\v').replace(/\0/g, '\\0');
		if (isChar) {
			return s.replace(/\'/g, '\\\'');
		} else {
			return s.replace(/\"/g, '\\"');
		}
	}

	return {
		upload: upload,
		download: F2(download),
		unsafeCoerce: unsafeCoerce,
		messageToString: messageToString,
		init: init
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/src/Native/VirtualDom.js", function(exports, require, module) {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function () {

	var STYLE_KEY = 'STYLE';
	var EVENT_KEY = 'EVENT';
	var ATTR_KEY = 'ATTR';
	var ATTR_NS_KEY = 'ATTR_NS';

	var localDoc = typeof document !== 'undefined' ? document : {};

	////////////  VIRTUAL DOM NODES  ////////////


	function text(string) {
		return {
			type: 'text',
			text: string
		};
	}

	function node(tag) {
		return F2(function (factList, kidList) {
			return nodeHelp(tag, factList, kidList);
		});
	}

	function nodeHelp(tag, factList, kidList) {
		var organized = organizeFacts(factList);
		var namespace = organized.namespace;
		var facts = organized.facts;

		var children = [];
		var descendantsCount = 0;
		while (kidList.ctor !== '[]') {
			var kid = kidList._0;
			descendantsCount += kid.descendantsCount || 0;
			children.push(kid);
			kidList = kidList._1;
		}
		descendantsCount += children.length;

		return {
			type: 'node',
			tag: tag,
			facts: facts,
			children: children,
			namespace: namespace,
			descendantsCount: descendantsCount
		};
	}

	function keyedNode(tag, factList, kidList) {
		var organized = organizeFacts(factList);
		var namespace = organized.namespace;
		var facts = organized.facts;

		var children = [];
		var descendantsCount = 0;
		while (kidList.ctor !== '[]') {
			var kid = kidList._0;
			descendantsCount += kid._1.descendantsCount || 0;
			children.push(kid);
			kidList = kidList._1;
		}
		descendantsCount += children.length;

		return {
			type: 'keyed-node',
			tag: tag,
			facts: facts,
			children: children,
			namespace: namespace,
			descendantsCount: descendantsCount
		};
	}

	function custom(factList, model, impl) {
		var facts = organizeFacts(factList).facts;

		return {
			type: 'custom',
			facts: facts,
			model: model,
			impl: impl
		};
	}

	function map(tagger, node) {
		return {
			type: 'tagger',
			tagger: tagger,
			node: node,
			descendantsCount: 1 + (node.descendantsCount || 0)
		};
	}

	function thunk(func, args, thunk) {
		return {
			type: 'thunk',
			func: func,
			args: args,
			thunk: thunk,
			node: undefined
		};
	}

	function lazy(fn, a) {
		return thunk(fn, [a], function () {
			return fn(a);
		});
	}

	function lazy2(fn, a, b) {
		return thunk(fn, [a, b], function () {
			return A2(fn, a, b);
		});
	}

	function lazy3(fn, a, b, c) {
		return thunk(fn, [a, b, c], function () {
			return A3(fn, a, b, c);
		});
	}

	// FACTS


	function organizeFacts(factList) {
		var namespace,
		    facts = {};

		while (factList.ctor !== '[]') {
			var entry = factList._0;
			var key = entry.key;

			if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY) {
				var subFacts = facts[key] || {};
				subFacts[entry.realKey] = entry.value;
				facts[key] = subFacts;
			} else if (key === STYLE_KEY) {
				var styles = facts[key] || {};
				var styleList = entry.value;
				while (styleList.ctor !== '[]') {
					var style = styleList._0;
					styles[style._0] = style._1;
					styleList = styleList._1;
				}
				facts[key] = styles;
			} else if (key === 'namespace') {
				namespace = entry.value;
			} else if (key === 'className') {
				var classes = facts[key];
				facts[key] = typeof classes === 'undefined' ? entry.value : classes + ' ' + entry.value;
			} else {
				facts[key] = entry.value;
			}
			factList = factList._1;
		}

		return {
			facts: facts,
			namespace: namespace
		};
	}

	////////////  PROPERTIES AND ATTRIBUTES  ////////////


	function style(value) {
		return {
			key: STYLE_KEY,
			value: value
		};
	}

	function property(key, value) {
		return {
			key: key,
			value: value
		};
	}

	function attribute(key, value) {
		return {
			key: ATTR_KEY,
			realKey: key,
			value: value
		};
	}

	function attributeNS(namespace, key, value) {
		return {
			key: ATTR_NS_KEY,
			realKey: key,
			value: {
				value: value,
				namespace: namespace
			}
		};
	}

	function on(name, options, decoder) {
		return {
			key: EVENT_KEY,
			realKey: name,
			value: {
				options: options,
				decoder: decoder
			}
		};
	}

	function equalEvents(a, b) {
		if (a.options !== b.options) {
			if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault) {
				return false;
			}
		}
		return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
	}

	function mapProperty(func, property) {
		if (property.key !== EVENT_KEY) {
			return property;
		}
		return on(property.realKey, property.value.options, A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder));
	}

	////////////  RENDER  ////////////


	function render(vNode, eventNode) {
		switch (vNode.type) {
			case 'thunk':
				if (!vNode.node) {
					vNode.node = vNode.thunk();
				}
				return render(vNode.node, eventNode);

			case 'tagger':
				var subNode = vNode.node;
				var tagger = vNode.tagger;

				while (subNode.type === 'tagger') {
					(typeof tagger === 'undefined' ? 'undefined' : _typeof(tagger)) !== 'object' ? tagger = [tagger, subNode.tagger] : tagger.push(subNode.tagger);

					subNode = subNode.node;
				}

				var subEventRoot = { tagger: tagger, parent: eventNode };
				var domNode = render(subNode, subEventRoot);
				domNode.elm_event_node_ref = subEventRoot;
				return domNode;

			case 'text':
				return localDoc.createTextNode(vNode.text);

			case 'node':
				var domNode = vNode.namespace ? localDoc.createElementNS(vNode.namespace, vNode.tag) : localDoc.createElement(vNode.tag);

				applyFacts(domNode, eventNode, vNode.facts);

				var children = vNode.children;

				for (var i = 0; i < children.length; i++) {
					domNode.appendChild(render(children[i], eventNode));
				}

				return domNode;

			case 'keyed-node':
				var domNode = vNode.namespace ? localDoc.createElementNS(vNode.namespace, vNode.tag) : localDoc.createElement(vNode.tag);

				applyFacts(domNode, eventNode, vNode.facts);

				var children = vNode.children;

				for (var i = 0; i < children.length; i++) {
					domNode.appendChild(render(children[i]._1, eventNode));
				}

				return domNode;

			case 'custom':
				var domNode = vNode.impl.render(vNode.model);
				applyFacts(domNode, eventNode, vNode.facts);
				return domNode;
		}
	}

	////////////  APPLY FACTS  ////////////


	function applyFacts(domNode, eventNode, facts) {
		for (var key in facts) {
			var value = facts[key];

			switch (key) {
				case STYLE_KEY:
					applyStyles(domNode, value);
					break;

				case EVENT_KEY:
					applyEvents(domNode, eventNode, value);
					break;

				case ATTR_KEY:
					applyAttrs(domNode, value);
					break;

				case ATTR_NS_KEY:
					applyAttrsNS(domNode, value);
					break;

				case 'value':
					if (domNode[key] !== value) {
						domNode[key] = value;
					}
					break;

				default:
					domNode[key] = value;
					break;
			}
		}
	}

	function applyStyles(domNode, styles) {
		var domNodeStyle = domNode.style;

		for (var key in styles) {
			domNodeStyle[key] = styles[key];
		}
	}

	function applyEvents(domNode, eventNode, events) {
		var allHandlers = domNode.elm_handlers || {};

		for (var key in events) {
			var handler = allHandlers[key];
			var value = events[key];

			if (typeof value === 'undefined') {
				domNode.removeEventListener(key, handler);
				allHandlers[key] = undefined;
			} else if (typeof handler === 'undefined') {
				var handler = makeEventHandler(eventNode, value);
				domNode.addEventListener(key, handler);
				allHandlers[key] = handler;
			} else {
				handler.info = value;
			}
		}

		domNode.elm_handlers = allHandlers;
	}

	function makeEventHandler(eventNode, info) {
		function eventHandler(event) {
			var info = eventHandler.info;

			var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

			if (value.ctor === 'Ok') {
				var options = info.options;
				if (options.stopPropagation) {
					event.stopPropagation();
				}
				if (options.preventDefault) {
					event.preventDefault();
				}

				var message = value._0;

				var currentEventNode = eventNode;
				while (currentEventNode) {
					var tagger = currentEventNode.tagger;
					if (typeof tagger === 'function') {
						message = tagger(message);
					} else {
						for (var i = tagger.length; i--;) {
							message = tagger[i](message);
						}
					}
					currentEventNode = currentEventNode.parent;
				}
			}
		};

		eventHandler.info = info;

		return eventHandler;
	}

	function applyAttrs(domNode, attrs) {
		for (var key in attrs) {
			var value = attrs[key];
			if (typeof value === 'undefined') {
				domNode.removeAttribute(key);
			} else {
				domNode.setAttribute(key, value);
			}
		}
	}

	function applyAttrsNS(domNode, nsAttrs) {
		for (var key in nsAttrs) {
			var pair = nsAttrs[key];
			var namespace = pair.namespace;
			var value = pair.value;

			if (typeof value === 'undefined') {
				domNode.removeAttributeNS(namespace, key);
			} else {
				domNode.setAttributeNS(namespace, key, value);
			}
		}
	}

	////////////  DIFF  ////////////


	function diff(a, b) {
		var patches = [];
		diffHelp(a, b, patches, 0);
		return patches;
	}

	function makePatch(type, index, data) {
		return {
			index: index,
			type: type,
			data: data,
			domNode: undefined,
			eventNode: undefined
		};
	}

	function diffHelp(a, b, patches, index) {
		if (a === b) {
			return;
		}

		var aType = a.type;
		var bType = b.type;

		// Bail if you run into different types of nodes. Implies that the
		// structure has changed significantly and it's not worth a diff.
		if (aType !== bType) {
			patches.push(makePatch('p-redraw', index, b));
			return;
		}

		// Now we know that both nodes are the same type.
		switch (bType) {
			case 'thunk':
				var aArgs = a.args;
				var bArgs = b.args;
				var i = aArgs.length;
				var same = a.func === b.func && i === bArgs.length;
				while (same && i--) {
					same = aArgs[i] === bArgs[i];
				}
				if (same) {
					b.node = a.node;
					return;
				}
				b.node = b.thunk();
				var subPatches = [];
				diffHelp(a.node, b.node, subPatches, 0);
				if (subPatches.length > 0) {
					patches.push(makePatch('p-thunk', index, subPatches));
				}
				return;

			case 'tagger':
				// gather nested taggers
				var aTaggers = a.tagger;
				var bTaggers = b.tagger;
				var nesting = false;

				var aSubNode = a.node;
				while (aSubNode.type === 'tagger') {
					nesting = true;

					(typeof aTaggers === 'undefined' ? 'undefined' : _typeof(aTaggers)) !== 'object' ? aTaggers = [aTaggers, aSubNode.tagger] : aTaggers.push(aSubNode.tagger);

					aSubNode = aSubNode.node;
				}

				var bSubNode = b.node;
				while (bSubNode.type === 'tagger') {
					nesting = true;

					(typeof bTaggers === 'undefined' ? 'undefined' : _typeof(bTaggers)) !== 'object' ? bTaggers = [bTaggers, bSubNode.tagger] : bTaggers.push(bSubNode.tagger);

					bSubNode = bSubNode.node;
				}

				// Just bail if different numbers of taggers. This implies the
				// structure of the virtual DOM has changed.
				if (nesting && aTaggers.length !== bTaggers.length) {
					patches.push(makePatch('p-redraw', index, b));
					return;
				}

				// check if taggers are "the same"
				if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers) {
					patches.push(makePatch('p-tagger', index, bTaggers));
				}

				// diff everything below the taggers
				diffHelp(aSubNode, bSubNode, patches, index + 1);
				return;

			case 'text':
				if (a.text !== b.text) {
					patches.push(makePatch('p-text', index, b.text));
					return;
				}

				return;

			case 'node':
				// Bail if obvious indicators have changed. Implies more serious
				// structural changes such that it's not worth it to diff.
				if (a.tag !== b.tag || a.namespace !== b.namespace) {
					patches.push(makePatch('p-redraw', index, b));
					return;
				}

				var factsDiff = diffFacts(a.facts, b.facts);

				if (typeof factsDiff !== 'undefined') {
					patches.push(makePatch('p-facts', index, factsDiff));
				}

				diffChildren(a, b, patches, index);
				return;

			case 'keyed-node':
				// Bail if obvious indicators have changed. Implies more serious
				// structural changes such that it's not worth it to diff.
				if (a.tag !== b.tag || a.namespace !== b.namespace) {
					patches.push(makePatch('p-redraw', index, b));
					return;
				}

				var factsDiff = diffFacts(a.facts, b.facts);

				if (typeof factsDiff !== 'undefined') {
					patches.push(makePatch('p-facts', index, factsDiff));
				}

				diffKeyedChildren(a, b, patches, index);
				return;

			case 'custom':
				if (a.impl !== b.impl) {
					patches.push(makePatch('p-redraw', index, b));
					return;
				}

				var factsDiff = diffFacts(a.facts, b.facts);
				if (typeof factsDiff !== 'undefined') {
					patches.push(makePatch('p-facts', index, factsDiff));
				}

				var patch = b.impl.diff(a, b);
				if (patch) {
					patches.push(makePatch('p-custom', index, patch));
					return;
				}

				return;
		}
	}

	// assumes the incoming arrays are the same length
	function pairwiseRefEqual(as, bs) {
		for (var i = 0; i < as.length; i++) {
			if (as[i] !== bs[i]) {
				return false;
			}
		}

		return true;
	}

	// TODO Instead of creating a new diff object, it's possible to just test if
	// there *is* a diff. During the actual patch, do the diff again and make the
	// modifications directly. This way, there's no new allocations. Worth it?
	function diffFacts(a, b, category) {
		var diff;

		// look for changes and removals
		for (var aKey in a) {
			if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY) {
				var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
				if (subDiff) {
					diff = diff || {};
					diff[aKey] = subDiff;
				}
				continue;
			}

			// remove if not in the new facts
			if (!(aKey in b)) {
				diff = diff || {};
				diff[aKey] = typeof category === 'undefined' ? typeof a[aKey] === 'string' ? '' : null : category === STYLE_KEY ? '' : category === EVENT_KEY || category === ATTR_KEY ? undefined : { namespace: a[aKey].namespace, value: undefined };

				continue;
			}

			var aValue = a[aKey];
			var bValue = b[aKey];

			// reference equal, so don't worry about it
			if (aValue === bValue && aKey !== 'value' || category === EVENT_KEY && equalEvents(aValue, bValue)) {
				continue;
			}

			diff = diff || {};
			diff[aKey] = bValue;
		}

		// add new stuff
		for (var bKey in b) {
			if (!(bKey in a)) {
				diff = diff || {};
				diff[bKey] = b[bKey];
			}
		}

		return diff;
	}

	function diffChildren(aParent, bParent, patches, rootIndex) {
		var aChildren = aParent.children;
		var bChildren = bParent.children;

		var aLen = aChildren.length;
		var bLen = bChildren.length;

		// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

		if (aLen > bLen) {
			patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
		} else if (aLen < bLen) {
			patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
		}

		// PAIRWISE DIFF EVERYTHING ELSE

		var index = rootIndex;
		var minLen = aLen < bLen ? aLen : bLen;
		for (var i = 0; i < minLen; i++) {
			index++;
			var aChild = aChildren[i];
			diffHelp(aChild, bChildren[i], patches, index);
			index += aChild.descendantsCount || 0;
		}
	}

	////////////  KEYED DIFF  ////////////


	function diffKeyedChildren(aParent, bParent, patches, rootIndex) {
		var localPatches = [];

		var changes = {}; // Dict String Entry
		var inserts = []; // Array { index : Int, entry : Entry }
		// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

		var aChildren = aParent.children;
		var bChildren = bParent.children;
		var aLen = aChildren.length;
		var bLen = bChildren.length;
		var aIndex = 0;
		var bIndex = 0;

		var index = rootIndex;

		while (aIndex < aLen && bIndex < bLen) {
			var a = aChildren[aIndex];
			var b = bChildren[bIndex];

			var aKey = a._0;
			var bKey = b._0;
			var aNode = a._1;
			var bNode = b._1;

			// check if keys match

			if (aKey === bKey) {
				index++;
				diffHelp(aNode, bNode, localPatches, index);
				index += aNode.descendantsCount || 0;

				aIndex++;
				bIndex++;
				continue;
			}

			// look ahead 1 to detect insertions and removals.

			var aLookAhead = aIndex + 1 < aLen;
			var bLookAhead = bIndex + 1 < bLen;

			if (aLookAhead) {
				var aNext = aChildren[aIndex + 1];
				var aNextKey = aNext._0;
				var aNextNode = aNext._1;
				var oldMatch = bKey === aNextKey;
			}

			if (bLookAhead) {
				var bNext = bChildren[bIndex + 1];
				var bNextKey = bNext._0;
				var bNextNode = bNext._1;
				var newMatch = aKey === bNextKey;
			}

			// swap a and b
			if (aLookAhead && bLookAhead && newMatch && oldMatch) {
				index++;
				diffHelp(aNode, bNextNode, localPatches, index);
				insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
				index += aNode.descendantsCount || 0;

				index++;
				removeNode(changes, localPatches, aKey, aNextNode, index);
				index += aNextNode.descendantsCount || 0;

				aIndex += 2;
				bIndex += 2;
				continue;
			}

			// insert b
			if (bLookAhead && newMatch) {
				index++;
				insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
				diffHelp(aNode, bNextNode, localPatches, index);
				index += aNode.descendantsCount || 0;

				aIndex += 1;
				bIndex += 2;
				continue;
			}

			// remove a
			if (aLookAhead && oldMatch) {
				index++;
				removeNode(changes, localPatches, aKey, aNode, index);
				index += aNode.descendantsCount || 0;

				index++;
				diffHelp(aNextNode, bNode, localPatches, index);
				index += aNextNode.descendantsCount || 0;

				aIndex += 2;
				bIndex += 1;
				continue;
			}

			// remove a, insert b
			if (aLookAhead && bLookAhead && aNextKey === bNextKey) {
				index++;
				removeNode(changes, localPatches, aKey, aNode, index);
				insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
				index += aNode.descendantsCount || 0;

				index++;
				diffHelp(aNextNode, bNextNode, localPatches, index);
				index += aNextNode.descendantsCount || 0;

				aIndex += 2;
				bIndex += 2;
				continue;
			}

			break;
		}

		// eat up any remaining nodes with removeNode and insertNode

		while (aIndex < aLen) {
			index++;
			var a = aChildren[aIndex];
			var aNode = a._1;
			removeNode(changes, localPatches, a._0, aNode, index);
			index += aNode.descendantsCount || 0;
			aIndex++;
		}

		var endInserts;
		while (bIndex < bLen) {
			endInserts = endInserts || [];
			var b = bChildren[bIndex];
			insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
			bIndex++;
		}

		if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined') {
			patches.push(makePatch('p-reorder', rootIndex, {
				patches: localPatches,
				inserts: inserts,
				endInserts: endInserts
			}));
		}
	}

	////////////  CHANGES FROM KEYED DIFF  ////////////


	var POSTFIX = '_elmW6BL';

	function insertNode(changes, localPatches, key, vnode, bIndex, inserts) {
		var entry = changes[key];

		// never seen this key before
		if (typeof entry === 'undefined') {
			entry = {
				tag: 'insert',
				vnode: vnode,
				index: bIndex,
				data: undefined
			};

			inserts.push({ index: bIndex, entry: entry });
			changes[key] = entry;

			return;
		}

		// this key was removed earlier, a match!
		if (entry.tag === 'remove') {
			inserts.push({ index: bIndex, entry: entry });

			entry.tag = 'move';
			var subPatches = [];
			diffHelp(entry.vnode, vnode, subPatches, entry.index);
			entry.index = bIndex;
			entry.data.data = {
				patches: subPatches,
				entry: entry
			};

			return;
		}

		// this key has already been inserted or moved, a duplicate!
		insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
	}

	function removeNode(changes, localPatches, key, vnode, index) {
		var entry = changes[key];

		// never seen this key before
		if (typeof entry === 'undefined') {
			var patch = makePatch('p-remove', index, undefined);
			localPatches.push(patch);

			changes[key] = {
				tag: 'remove',
				vnode: vnode,
				index: index,
				data: patch
			};

			return;
		}

		// this key was inserted earlier, a match!
		if (entry.tag === 'insert') {
			entry.tag = 'move';
			var subPatches = [];
			diffHelp(vnode, entry.vnode, subPatches, index);

			var patch = makePatch('p-remove', index, {
				patches: subPatches,
				entry: entry
			});
			localPatches.push(patch);

			return;
		}

		// this key has already been removed or moved, a duplicate!
		removeNode(changes, localPatches, key + POSTFIX, vnode, index);
	}

	////////////  ADD DOM NODES  ////////////
	//
	// Each DOM node has an "index" assigned in order of traversal. It is important
	// to minimize our crawl over the actual DOM, so these indexes (along with the
	// descendantsCount of virtual nodes) let us skip touching entire subtrees of
	// the DOM if we know there are no patches there.


	function addDomNodes(domNode, vNode, patches, eventNode) {
		addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
	}

	// assumes `patches` is non-empty and indexes increase monotonically.
	function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode) {
		var patch = patches[i];
		var index = patch.index;

		while (index === low) {
			var patchType = patch.type;

			if (patchType === 'p-thunk') {
				addDomNodes(domNode, vNode.node, patch.data, eventNode);
			} else if (patchType === 'p-reorder') {
				patch.domNode = domNode;
				patch.eventNode = eventNode;

				var subPatches = patch.data.patches;
				if (subPatches.length > 0) {
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			} else if (patchType === 'p-remove') {
				patch.domNode = domNode;
				patch.eventNode = eventNode;

				var data = patch.data;
				if (typeof data !== 'undefined') {
					data.entry.data = domNode;
					var subPatches = data.patches;
					if (subPatches.length > 0) {
						addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
					}
				}
			} else {
				patch.domNode = domNode;
				patch.eventNode = eventNode;
			}

			i++;

			if (!(patch = patches[i]) || (index = patch.index) > high) {
				return i;
			}
		}

		switch (vNode.type) {
			case 'tagger':
				var subNode = vNode.node;

				while (subNode.type === "tagger") {
					subNode = subNode.node;
				}

				return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

			case 'node':
				var vChildren = vNode.children;
				var childNodes = domNode.childNodes;
				for (var j = 0; j < vChildren.length; j++) {
					low++;
					var vChild = vChildren[j];
					var nextLow = low + (vChild.descendantsCount || 0);
					if (low <= index && index <= nextLow) {
						i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
						if (!(patch = patches[i]) || (index = patch.index) > high) {
							return i;
						}
					}
					low = nextLow;
				}
				return i;

			case 'keyed-node':
				var vChildren = vNode.children;
				var childNodes = domNode.childNodes;
				for (var j = 0; j < vChildren.length; j++) {
					low++;
					var vChild = vChildren[j]._1;
					var nextLow = low + (vChild.descendantsCount || 0);
					if (low <= index && index <= nextLow) {
						i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
						if (!(patch = patches[i]) || (index = patch.index) > high) {
							return i;
						}
					}
					low = nextLow;
				}
				return i;

			case 'text':
			case 'thunk':
				throw new Error('should never traverse `text` or `thunk` nodes like this');
		}
	}

	////////////  APPLY PATCHES  ////////////


	function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode) {
		if (patches.length === 0) {
			return rootDomNode;
		}

		addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
		return applyPatchesHelp(rootDomNode, patches);
	}

	function applyPatchesHelp(rootDomNode, patches) {
		for (var i = 0; i < patches.length; i++) {
			var patch = patches[i];
			var localDomNode = patch.domNode;
			var newNode = applyPatch(localDomNode, patch);
			if (localDomNode === rootDomNode) {
				rootDomNode = newNode;
			}
		}
		return rootDomNode;
	}

	function applyPatch(domNode, patch) {
		switch (patch.type) {
			case 'p-redraw':
				return applyPatchRedraw(domNode, patch.data, patch.eventNode);

			case 'p-facts':
				applyFacts(domNode, patch.eventNode, patch.data);
				return domNode;

			case 'p-text':
				domNode.replaceData(0, domNode.length, patch.data);
				return domNode;

			case 'p-thunk':
				return applyPatchesHelp(domNode, patch.data);

			case 'p-tagger':
				if (typeof domNode.elm_event_node_ref !== 'undefined') {
					domNode.elm_event_node_ref.tagger = patch.data;
				} else {
					domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
				}
				return domNode;

			case 'p-remove-last':
				var i = patch.data;
				while (i--) {
					domNode.removeChild(domNode.lastChild);
				}
				return domNode;

			case 'p-append':
				var newNodes = patch.data;
				for (var i = 0; i < newNodes.length; i++) {
					domNode.appendChild(render(newNodes[i], patch.eventNode));
				}
				return domNode;

			case 'p-remove':
				var data = patch.data;
				if (typeof data === 'undefined') {
					domNode.parentNode.removeChild(domNode);
					return domNode;
				}
				var entry = data.entry;
				if (typeof entry.index !== 'undefined') {
					domNode.parentNode.removeChild(domNode);
				}
				entry.data = applyPatchesHelp(domNode, data.patches);
				return domNode;

			case 'p-reorder':
				return applyPatchReorder(domNode, patch);

			case 'p-custom':
				var impl = patch.data;
				return impl.applyPatch(domNode, impl.data);

			default:
				throw new Error('Ran into an unknown patch!');
		}
	}

	function applyPatchRedraw(domNode, vNode, eventNode) {
		var parentNode = domNode.parentNode;
		var newNode = render(vNode, eventNode);

		if (typeof newNode.elm_event_node_ref === 'undefined') {
			newNode.elm_event_node_ref = domNode.elm_event_node_ref;
		}

		if (parentNode && newNode !== domNode) {
			parentNode.replaceChild(newNode, domNode);
		}
		return newNode;
	}

	function applyPatchReorder(domNode, patch) {
		var data = patch.data;

		// remove end inserts
		var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

		// removals
		domNode = applyPatchesHelp(domNode, data.patches);

		// inserts
		var inserts = data.inserts;
		for (var i = 0; i < inserts.length; i++) {
			var insert = inserts[i];
			var entry = insert.entry;
			var node = entry.tag === 'move' ? entry.data : render(entry.vnode, patch.eventNode);
			domNode.insertBefore(node, domNode.childNodes[insert.index]);
		}

		// add end inserts
		if (typeof frag !== 'undefined') {
			domNode.appendChild(frag);
		}

		return domNode;
	}

	function applyPatchReorderEndInsertsHelp(endInserts, patch) {
		if (typeof endInserts === 'undefined') {
			return;
		}

		var frag = localDoc.createDocumentFragment();
		for (var i = 0; i < endInserts.length; i++) {
			var insert = endInserts[i];
			var entry = insert.entry;
			frag.appendChild(entry.tag === 'move' ? entry.data : render(entry.vnode, patch.eventNode));
		}
		return frag;
	}

	// PROGRAMS

	var program = makeProgram(checkNoFlags);
	var programWithFlags = makeProgram(checkYesFlags);

	function makeProgram(flagChecker) {
		return F2(function (debugWrap, impl) {
			return function (flagDecoder) {
				return function (object, moduleName, debugMetadata) {
					var checker = flagChecker(flagDecoder, moduleName);
					if (typeof debugMetadata === 'undefined') {
						normalSetup(impl, object, moduleName, checker);
					} else {
						debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
					}
				};
			};
		});
	}

	function staticProgram(vNode) {
		var nothing = _elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.Tuple0, _elm_lang$core$Platform_Cmd$none);
		return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
			init: nothing,
			view: function view() {
				return vNode;
			},
			update: F2(function () {
				return nothing;
			}),
			subscriptions: function subscriptions() {
				return _elm_lang$core$Platform_Sub$none;
			}
		})();
	}

	// FLAG CHECKERS

	function checkNoFlags(flagDecoder, moduleName) {
		return function (init, flags, domNode) {
			if (typeof flags === 'undefined') {
				return init;
			}

			var errorMessage = 'The `' + moduleName + '` module does not need flags.\n' + 'Initialize it with no arguments and you should be all set!';

			crash(errorMessage, domNode);
		};
	}

	function checkYesFlags(flagDecoder, moduleName) {
		return function (init, flags, domNode) {
			if (typeof flagDecoder === 'undefined') {
				var errorMessage = 'Are you trying to sneak a Never value into Elm? Trickster!\n' + 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n' + 'Use `program` instead if you do not want flags.';

				crash(errorMessage, domNode);
			}

			var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
			if (result.ctor === 'Ok') {
				return init(result._0);
			}

			var errorMessage = 'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n' + 'I tried to convert it to an Elm value, but ran into this problem:\n\n' + result._0;

			crash(errorMessage, domNode);
		};
	}

	function crash(errorMessage, domNode) {
		if (domNode) {
			domNode.innerHTML = '<div style="padding-left:1em;">' + '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>' + '<pre style="padding-left:1em;">' + errorMessage + '</pre>' + '</div>';
		}

		throw new Error(errorMessage);
	}

	//  NORMAL SETUP

	function normalSetup(impl, object, moduleName, flagChecker) {
		object['embed'] = function embed(node, flags) {
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}

			return _elm_lang$core$Native_Platform.initialize(flagChecker(impl.init, flags, node), impl.update, impl.subscriptions, normalRenderer(node, impl.view));
		};

		object['fullscreen'] = function fullscreen(flags) {
			return _elm_lang$core$Native_Platform.initialize(flagChecker(impl.init, flags, document.body), impl.update, impl.subscriptions, normalRenderer(document.body, impl.view));
		};
	}

	function normalRenderer(parentNode, view) {
		return function (tagger, initialModel) {
			var eventNode = { tagger: tagger, parent: undefined };
			var initialVirtualNode = view(initialModel);
			var domNode = render(initialVirtualNode, eventNode);
			parentNode.appendChild(domNode);
			return makeStepper(domNode, view, initialVirtualNode, eventNode);
		};
	}

	// STEPPER

	var rAF = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : function (callback) {
		setTimeout(callback, 1000 / 60);
	};

	function makeStepper(domNode, view, initialVirtualNode, eventNode) {
		var state = 'NO_REQUEST';
		var currNode = initialVirtualNode;
		var nextModel;

		function updateIfNeeded() {
			switch (state) {
				case 'NO_REQUEST':
					throw new Error('Unexpected draw callback.\n' + 'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.');

				case 'PENDING_REQUEST':
					rAF(updateIfNeeded);
					state = 'EXTRA_REQUEST';

					var nextNode = view(nextModel);
					var patches = diff(currNode, nextNode);
					domNode = applyPatches(domNode, currNode, patches, eventNode);
					currNode = nextNode;

					return;

				case 'EXTRA_REQUEST':
					state = 'NO_REQUEST';
					return;
			}
		}

		return function stepper(model) {
			if (state === 'NO_REQUEST') {
				rAF(updateIfNeeded);
			}
			state = 'PENDING_REQUEST';
			nextModel = model;
		};
	}

	// DEBUG SETUP

	function debugSetup(impl, object, moduleName, flagChecker) {
		object['fullscreen'] = function fullscreen(flags) {
			var popoutRef = { doc: undefined };
			return _elm_lang$core$Native_Platform.initialize(flagChecker(impl.init, flags, document.body), impl.update(scrollTask(popoutRef)), impl.subscriptions, debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut));
		};

		object['embed'] = function fullscreen(node, flags) {
			var popoutRef = { doc: undefined };
			return _elm_lang$core$Native_Platform.initialize(flagChecker(impl.init, flags, node), impl.update(scrollTask(popoutRef)), impl.subscriptions, debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut));
		};
	}

	function scrollTask(popoutRef) {
		return _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
			var doc = popoutRef.doc;
			if (doc) {
				var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
				if (msgs) {
					msgs.scrollTop = msgs.scrollHeight;
				}
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
		});
	}

	function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut) {
		return function (tagger, initialModel) {
			var appEventNode = { tagger: tagger, parent: undefined };
			var eventNode = { tagger: tagger, parent: undefined };

			// make normal stepper
			var appVirtualNode = view(initialModel);
			var appNode = render(appVirtualNode, appEventNode);
			parentNode.appendChild(appNode);
			var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

			// make overlay stepper
			var overVirtualNode = viewIn(initialModel)._1;
			var overNode = render(overVirtualNode, eventNode);
			parentNode.appendChild(overNode);
			var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
			var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

			// make debugger stepper
			var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

			return function stepper(model) {
				appStepper(model);
				overStepper(model);
				debugStepper(model);
			};
		};
	}

	function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef) {
		var curr;
		var domNode;

		return function stepper(model) {
			if (!model.isDebuggerOpen) {
				return;
			}

			if (!popoutRef.doc) {
				curr = view(model);
				domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
				return;
			}

			// switch to document of popout
			localDoc = popoutRef.doc;

			var next = view(model);
			var patches = diff(curr, next);
			domNode = applyPatches(domNode, curr, patches, eventNode);
			curr = next;

			// switch back to normal document
			localDoc = document;
		};
	}

	function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode) {
		var w = 900;
		var h = 360;
		var x = screen.width - w;
		var y = screen.height - h;
		var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

		// switch to window document
		localDoc = debugWindow.document;

		popoutRef.doc = localDoc;
		localDoc.title = 'Debugger - ' + moduleName;
		localDoc.body.style.margin = '0';
		localDoc.body.style.padding = '0';
		var domNode = render(virtualNode, eventNode);
		localDoc.body.appendChild(domNode);

		localDoc.addEventListener('keydown', function (event) {
			if (event.metaKey && event.which === 82) {
				window.location.reload();
			}
			if (event.which === 38) {
				eventNode.tagger({ ctor: 'Up' });
				event.preventDefault();
			}
			if (event.which === 40) {
				eventNode.tagger({ ctor: 'Down' });
				event.preventDefault();
			}
		});

		function close() {
			popoutRef.doc = undefined;
			debugWindow.close();
		}
		window.addEventListener('unload', close);
		debugWindow.addEventListener('unload', function () {
			popoutRef.doc = undefined;
			window.removeEventListener('unload', close);
			eventNode.tagger({ ctor: 'Close' });
		});

		// switch back to the normal document
		localDoc = document;

		return domNode;
	}

	// BLOCK EVENTS

	function wrapViewIn(appEventNode, overlayNode, viewIn) {
		var ignorer = makeIgnorer(overlayNode);
		var blocking = 'Normal';
		var overflow;

		var normalTagger = appEventNode.tagger;
		var blockTagger = function blockTagger() {};

		return function (model) {
			var tuple = viewIn(model);
			var newBlocking = tuple._0.ctor;
			appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
			if (blocking !== newBlocking) {
				traverse('removeEventListener', ignorer, blocking);
				traverse('addEventListener', ignorer, newBlocking);

				if (blocking === 'Normal') {
					overflow = document.body.style.overflow;
					document.body.style.overflow = 'hidden';
				}

				if (newBlocking === 'Normal') {
					document.body.style.overflow = overflow;
				}

				blocking = newBlocking;
			}
			return tuple._1;
		};
	}

	function traverse(verbEventListener, ignorer, blocking) {
		switch (blocking) {
			case 'Normal':
				return;

			case 'Pause':
				return traverseHelp(verbEventListener, ignorer, mostEvents);

			case 'Message':
				return traverseHelp(verbEventListener, ignorer, allEvents);
		}
	}

	function traverseHelp(verbEventListener, handler, eventNames) {
		for (var i = 0; i < eventNames.length; i++) {
			document.body[verbEventListener](eventNames[i], handler, true);
		}
	}

	function makeIgnorer(overlayNode) {
		return function (event) {
			if (event.type === 'keydown' && event.metaKey && event.which === 82) {
				return;
			}

			var isScroll = event.type === 'scroll' || event.type === 'wheel';

			var node = event.target;
			while (node !== null) {
				if (node.className === 'elm-overlay-message-details' && isScroll) {
					return;
				}

				if (node === overlayNode && !isScroll) {
					return;
				}
				node = node.parentNode;
			}

			event.stopPropagation();
			event.preventDefault();
		};
	}

	var mostEvents = ['click', 'dblclick', 'mousemove', 'mouseup', 'mousedown', 'mouseenter', 'mouseleave', 'touchstart', 'touchend', 'touchcancel', 'touchmove', 'pointerdown', 'pointerup', 'pointerover', 'pointerout', 'pointerenter', 'pointerleave', 'pointermove', 'pointercancel', 'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop', 'keyup', 'keydown', 'keypress', 'input', 'change', 'focus', 'blur'];

	var allEvents = mostEvents.concat('wheel', 'scroll');

	return {
		node: node,
		text: text,
		custom: custom,
		map: F2(map),

		on: F3(on),
		style: style,
		property: F2(property),
		attribute: F2(attribute),
		attributeNS: F3(attributeNS),
		mapProperty: F2(mapProperty),

		lazy: F2(lazy),
		lazy2: F3(lazy2),
		lazy3: F4(lazy3),
		keyedNode: F3(keyedNode),

		program: program,
		programWithFlags: programWithFlags,
		staticProgram: staticProgram
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/src/VirtualDom.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/src/VirtualDom/Debug.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/src/VirtualDom/Expando.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/src/VirtualDom/Helpers.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/src/VirtualDom/History.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/src/VirtualDom/Metadata.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/src/VirtualDom/Overlay.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/src/VirtualDom/Report.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/tests/Native/TestHelpers.js", function(exports, require, module) {
"use strict";

Elm.Native.TestHelpers = {};
Elm.Native.TestHelpers.make = function (localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.TestHelpers = localRuntime.Native.TestHelpers || {};
	if (localRuntime.Native.TestHelpers.values) {
		return localRuntime.Native.TestHelpers.values;
	}

	var VirtualDom = Elm.Native.VirtualDom.make(localRuntime);

	function unsafeRecordCallCount(f) {
		function wrapper(a) {
			wrapper.__elm_test_call_count += 1;
			return f(a);
		}
		wrapper.__elm_test_call_count = 0;
		return wrapper;
	}

	function unsafeQueryCallCount(f) {
		if (f.__elm_test_call_count === undefined) {
			return -1;
		}
		return f.__elm_test_call_count;
	}

	Elm.Native.TestHelpers.values = {
		unsafeRecordCallCount: unsafeRecordCallCount,
		unsafeQueryCallCount: unsafeQueryCallCount,
		updateAndReplace: F3(VirtualDom.updateAndReplace)
	};
	return localRuntime.Native.TestHelpers.values = Elm.Native.TestHelpers.values;
};
});

require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/tests/TestCases/Lazy.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/tests/TestHelpers.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/virtual-dom/2.0.4/tests/TestMain.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/websocket/1.0.2/src/Native/WebSocket.js", function(exports, require, module) {
'use strict';

var _elm_lang$websocket$Native_WebSocket = function () {

	function open(url, settings) {
		return _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
			try {
				var socket = new WebSocket(url);
				socket.elm_web_socket = true;
			} catch (err) {
				return callback(_elm_lang$core$Native_Scheduler.fail({
					ctor: err.name === 'SecurityError' ? 'BadSecurity' : 'BadArgs',
					_0: err.message
				}));
			}

			socket.addEventListener("open", function (event) {
				callback(_elm_lang$core$Native_Scheduler.succeed(socket));
			});

			socket.addEventListener("message", function (event) {
				_elm_lang$core$Native_Scheduler.rawSpawn(A2(settings.onMessage, socket, event.data));
			});

			socket.addEventListener("close", function (event) {
				_elm_lang$core$Native_Scheduler.rawSpawn(settings.onClose({
					code: event.code,
					reason: event.reason,
					wasClean: event.wasClean
				}));
			});

			return function () {
				if (socket && socket.close) {
					socket.close();
				}
			};
		});
	}

	function send(socket, string) {
		return _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
			var result = socket.readyState === WebSocket.OPEN ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just({ ctor: 'NotOpen' });

			try {
				socket.send(string);
			} catch (err) {
				result = _elm_lang$core$Maybe$Just({ ctor: 'BadString' });
			}

			callback(_elm_lang$core$Native_Scheduler.succeed(result));
		});
	}

	function close(code, reason, socket) {
		return _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
			try {
				socket.close(code, reason);
			} catch (err) {
				return callback(_elm_lang$core$Native_Scheduler.fail(_elm_lang$core$Maybe$Just({
					ctor: err.name === 'SyntaxError' ? 'BadReason' : 'BadCode'
				})));
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Maybe$Nothing));
		});
	}

	function bytesQueued(socket) {
		return _elm_lang$core$Native_Scheduler.nativeBinding(function (callback) {
			callback(_elm_lang$core$Native_Scheduler.succeed(socket.bufferedAmount));
		});
	}

	return {
		open: F2(open),
		send: F2(send),
		close: F3(close),
		bytesQueued: bytesQueued
	};
}();
});

require.register("frontend/elm-stuff/packages/elm-lang/websocket/1.0.2/src/WebSocket.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/elm-lang/websocket/1.0.2/src/WebSocket/LowLevel.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/fbonetti/elm-phoenix-socket/2.2.0/examples/Chat.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/fbonetti/elm-phoenix-socket/2.2.0/examples/Presence.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/fbonetti/elm-phoenix-socket/2.2.0/src/Phoenix/Channel.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/fbonetti/elm-phoenix-socket/2.2.0/src/Phoenix/Helpers.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/fbonetti/elm-phoenix-socket/2.2.0/src/Phoenix/Presence.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/fbonetti/elm-phoenix-socket/2.2.0/src/Phoenix/Push.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/fbonetti/elm-phoenix-socket/2.2.0/src/Phoenix/Socket.elm", function(exports, require, module) {

});

;require.register("frontend/elm-stuff/packages/fbonetti/elm-phoenix-socket/2.2.0/tests/Tests.elm", function(exports, require, module) {

});

;require.register("frontend/src/Main.elm", function(exports, require, module) {

});

;require.register("frontend/tests/Main.elm", function(exports, require, module) {

});

;require.register("frontend/tests/Tests.elm", function(exports, require, module) {

});

;require.register("web/static/js/app.js", function(exports, require, module) {
"use strict";

require("phoenix_html");
});

;require.register("web/static/js/socket.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _phoenix = require("phoenix");

var socket = new _phoenix.Socket("/socket", { params: { token: window.userToken } });

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/2" function
// in "web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, pass the token on connect as below. Or remove it
// from connect if you don't care about authentication.

// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "web/static/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":
socket.connect();

// Now that you are connected, you can join channels with a topic:
var channel = socket.channel("topic:subtopic", {});
channel.join().receive("ok", function (resp) {
  console.log("Joined successfully", resp);
}).receive("error", function (resp) {
  console.log("Unable to join", resp);
});

exports.default = socket;
});

;require.alias("process/browser.js", "process");
require.alias("phoenix_html/priv/static/phoenix_html.js", "phoenix_html");
require.alias("phoenix/priv/static/phoenix.js", "phoenix");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

require('web/static/js/app');
//# sourceMappingURL=app.js.map