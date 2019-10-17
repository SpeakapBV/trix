
/*
Trix 0.9.2
Copyright © 2019 Basecamp, LLC
http://trix-editor.org/
 */

(function() {


}).call(this);
(function() {
  var Set;

  if (window.Set == null) {
    window.Set = Set = (function() {
      function Set() {
        this.clear();
      }

      Set.prototype.clear = function() {
        return this.values = [];
      };

      Set.prototype.has = function(value) {
        return this.values.indexOf(value) !== -1;
      };

      Set.prototype.add = function(value) {
        if (!this.has(value)) {
          this.values.push(value);
        }
        return this;
      };

      Set.prototype["delete"] = function(value) {
        var index;
        if ((index = this.values.indexOf(value)) === -1) {
          return false;
        } else {
          this.values.splice(index, 1);
          return true;
        }
      };

      Set.prototype.forEach = function() {
        var ref;
        return (ref = this.values).forEach.apply(ref, arguments);
      };

      return Set;

    })();
  }

}).call(this);
/*
https://github.com/taylorhakes/promise-polyfill
Copyright (c) 2014 Taylor Hakes
Copyright (c) 2014 Forbes Lindesay
*/


(function(root) {

	// Use polyfill for setImmediate for performance gains
	var asap = (typeof setImmediate === 'function' && setImmediate) ||
		function(fn) { setTimeout(fn, 1); };

	// Polyfill for Function.prototype.bind
	function bind(fn, thisArg) {
		return function() {
			fn.apply(thisArg, arguments);
		}
	}

	var isArray = Array.isArray || function(value) { return Object.prototype.toString.call(value) === "[object Array]" };

	function Promise(fn) {
		if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
		if (typeof fn !== 'function') throw new TypeError('not a function');
		this._state = null;
		this._value = null;
		this._deferreds = []

		doResolve(fn, bind(resolve, this), bind(reject, this))
	}

	function handle(deferred) {
		var me = this;
		if (this._state === null) {
			this._deferreds.push(deferred);
			return
		}
		asap(function() {
			var cb = me._state ? deferred.onFulfilled : deferred.onRejected
			if (cb === null) {
				(me._state ? deferred.resolve : deferred.reject)(me._value);
				return;
			}
			var ret;
			try {
				ret = cb(me._value);
			}
			catch (e) {
				deferred.reject(e);
				return;
			}
			deferred.resolve(ret);
		})
	}

	function resolve(newValue) {
		try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
			if (newValue === this) throw new TypeError('A promise cannot be resolved with itself.');
			if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
				var then = newValue.then;
				if (typeof then === 'function') {
					doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
					return;
				}
			}
			this._state = true;
			this._value = newValue;
			finale.call(this);
		} catch (e) { reject.call(this, e); }
	}

	function reject(newValue) {
		this._state = false;
		this._value = newValue;
		finale.call(this);
	}

	function finale() {
		for (var i = 0, len = this._deferreds.length; i < len; i++) {
			handle.call(this, this._deferreds[i]);
		}
		this._deferreds = null;
	}

	function Handler(onFulfilled, onRejected, resolve, reject){
		this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
		this.onRejected = typeof onRejected === 'function' ? onRejected : null;
		this.resolve = resolve;
		this.reject = reject;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, onFulfilled, onRejected) {
		var done = false;
		try {
			fn(function (value) {
				if (done) return;
				done = true;
				onFulfilled(value);
			}, function (reason) {
				if (done) return;
				done = true;
				onRejected(reason);
			})
		} catch (ex) {
			if (done) return;
			done = true;
			onRejected(ex);
		}
	}

	Promise.prototype['catch'] = function (onRejected) {
		return this.then(null, onRejected);
	};

	Promise.prototype.then = function(onFulfilled, onRejected) {
		var me = this;
		return new Promise(function(resolve, reject) {
			handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
		})
	};

	Promise.all = function () {
		var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

		return new Promise(function (resolve, reject) {
			if (args.length === 0) return resolve([]);
			var remaining = args.length;
			function res(i, val) {
				try {
					if (val && (typeof val === 'object' || typeof val === 'function')) {
						var then = val.then;
						if (typeof then === 'function') {
							then.call(val, function (val) { res(i, val) }, reject);
							return;
						}
					}
					args[i] = val;
					if (--remaining === 0) {
						resolve(args);
					}
				} catch (ex) {
					reject(ex);
				}
			}
			for (var i = 0; i < args.length; i++) {
				res(i, args[i]);
			}
		});
	};

	Promise.resolve = function (value) {
		if (value && typeof value === 'object' && value.constructor === Promise) {
			return value;
		}

		return new Promise(function (resolve) {
			resolve(value);
		});
	};

	Promise.reject = function (value) {
		return new Promise(function (resolve, reject) {
			reject(value);
		});
	};

	Promise.race = function (values) {
		return new Promise(function (resolve, reject) {
			for(var i = 0, len = values.length; i < len; i++) {
				values[i].then(resolve, reject);
			}
		});
	};

	/**
	 * Set the immediate function to execute callbacks
	 * @param fn {function} Function to execute
	 * @private
	 */
	Promise._setImmediateFn = function _setImmediateFn(fn) {
		asap = fn;
	};

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = Promise;
	} else if (!root.Promise) {
		root.Promise = Promise;
	}

})(this);
/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.7.14
if (typeof WeakMap === "undefined") {
  (function() {
    var defineProperty = Object.defineProperty;
    var counter = Date.now() % 1e9;
    var WeakMap = function() {
      this.name = "__st" + (Math.random() * 1e9 >>> 0) + (counter++ + "__");
    };
    WeakMap.prototype = {
      set: function(key, value) {
        var entry = key[this.name];
        if (entry && entry[0] === key) entry[1] = value; else defineProperty(key, this.name, {
          value: [ key, value ],
          writable: true
        });
        return this;
      },
      get: function(key) {
        var entry;
        return (entry = key[this.name]) && entry[0] === key ? entry[1] : undefined;
      },
      "delete": function(key) {
        var entry = key[this.name];
        if (!entry || entry[0] !== key) return false;
        entry[0] = entry[1] = undefined;
        return true;
      },
      has: function(key) {
        var entry = key[this.name];
        if (!entry) return false;
        return entry[0] === key;
      }
    };
    window.WeakMap = WeakMap;
  })();
}

(function(global) {
  var registrationsTable = new WeakMap();
  var setImmediate;
  if (/Trident|Edge/.test(navigator.userAgent)) {
    setImmediate = setTimeout;
  } else if (window.setImmediate) {
    setImmediate = window.setImmediate;
  } else {
    var setImmediateQueue = [];
    var sentinel = String(Math.random());
    window.addEventListener("message", function(e) {
      if (e.data === sentinel) {
        var queue = setImmediateQueue;
        setImmediateQueue = [];
        queue.forEach(function(func) {
          func();
        });
      }
    });
    setImmediate = function(func) {
      setImmediateQueue.push(func);
      window.postMessage(sentinel, "*");
    };
  }
  var isScheduled = false;
  var scheduledObservers = [];
  function scheduleCallback(observer) {
    scheduledObservers.push(observer);
    if (!isScheduled) {
      isScheduled = true;
      setImmediate(dispatchCallbacks);
    }
  }
  function wrapIfNeeded(node) {
    return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;
  }
  function dispatchCallbacks() {
    isScheduled = false;
    var observers = scheduledObservers;
    scheduledObservers = [];
    observers.sort(function(o1, o2) {
      return o1.uid_ - o2.uid_;
    });
    var anyNonEmpty = false;
    observers.forEach(function(observer) {
      var queue = observer.takeRecords();
      removeTransientObserversFor(observer);
      if (queue.length) {
        observer.callback_(queue, observer);
        anyNonEmpty = true;
      }
    });
    if (anyNonEmpty) dispatchCallbacks();
  }
  function removeTransientObserversFor(observer) {
    observer.nodes_.forEach(function(node) {
      var registrations = registrationsTable.get(node);
      if (!registrations) return;
      registrations.forEach(function(registration) {
        if (registration.observer === observer) registration.removeTransientObservers();
      });
    });
  }
  function forEachAncestorAndObserverEnqueueRecord(target, callback) {
    for (var node = target; node; node = node.parentNode) {
      var registrations = registrationsTable.get(node);
      if (registrations) {
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          var options = registration.options;
          if (node !== target && !options.subtree) continue;
          var record = callback(options);
          if (record) registration.enqueue(record);
        }
      }
    }
  }
  var uidCounter = 0;
  function JsMutationObserver(callback) {
    this.callback_ = callback;
    this.nodes_ = [];
    this.records_ = [];
    this.uid_ = ++uidCounter;
  }
  JsMutationObserver.prototype = {
    observe: function(target, options) {
      target = wrapIfNeeded(target);
      if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
        throw new SyntaxError();
      }
      var registrations = registrationsTable.get(target);
      if (!registrations) registrationsTable.set(target, registrations = []);
      var registration;
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].observer === this) {
          registration = registrations[i];
          registration.removeListeners();
          registration.options = options;
          break;
        }
      }
      if (!registration) {
        registration = new Registration(this, target, options);
        registrations.push(registration);
        this.nodes_.push(target);
      }
      registration.addListeners();
    },
    disconnect: function() {
      this.nodes_.forEach(function(node) {
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          var registration = registrations[i];
          if (registration.observer === this) {
            registration.removeListeners();
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
      this.records_ = [];
    },
    takeRecords: function() {
      var copyOfRecords = this.records_;
      this.records_ = [];
      return copyOfRecords;
    }
  };
  function MutationRecord(type, target) {
    this.type = type;
    this.target = target;
    this.addedNodes = [];
    this.removedNodes = [];
    this.previousSibling = null;
    this.nextSibling = null;
    this.attributeName = null;
    this.attributeNamespace = null;
    this.oldValue = null;
  }
  function copyMutationRecord(original) {
    var record = new MutationRecord(original.type, original.target);
    record.addedNodes = original.addedNodes.slice();
    record.removedNodes = original.removedNodes.slice();
    record.previousSibling = original.previousSibling;
    record.nextSibling = original.nextSibling;
    record.attributeName = original.attributeName;
    record.attributeNamespace = original.attributeNamespace;
    record.oldValue = original.oldValue;
    return record;
  }
  var currentRecord, recordWithOldValue;
  function getRecord(type, target) {
    return currentRecord = new MutationRecord(type, target);
  }
  function getRecordWithOldValue(oldValue) {
    if (recordWithOldValue) return recordWithOldValue;
    recordWithOldValue = copyMutationRecord(currentRecord);
    recordWithOldValue.oldValue = oldValue;
    return recordWithOldValue;
  }
  function clearRecords() {
    currentRecord = recordWithOldValue = undefined;
  }
  function recordRepresentsCurrentMutation(record) {
    return record === recordWithOldValue || record === currentRecord;
  }
  function selectRecord(lastRecord, newRecord) {
    if (lastRecord === newRecord) return lastRecord;
    if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord)) return recordWithOldValue;
    return null;
  }
  function Registration(observer, target, options) {
    this.observer = observer;
    this.target = target;
    this.options = options;
    this.transientObservedNodes = [];
  }
  Registration.prototype = {
    enqueue: function(record) {
      var records = this.observer.records_;
      var length = records.length;
      if (records.length > 0) {
        var lastRecord = records[length - 1];
        var recordToReplaceLast = selectRecord(lastRecord, record);
        if (recordToReplaceLast) {
          records[length - 1] = recordToReplaceLast;
          return;
        }
      } else {
        scheduleCallback(this.observer);
      }
      records[length] = record;
    },
    addListeners: function() {
      this.addListeners_(this.target);
    },
    addListeners_: function(node) {
      var options = this.options;
      if (options.attributes) node.addEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.addEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.addEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.addEventListener("DOMNodeRemoved", this, true);
    },
    removeListeners: function() {
      this.removeListeners_(this.target);
    },
    removeListeners_: function(node) {
      var options = this.options;
      if (options.attributes) node.removeEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.removeEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.removeEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.removeEventListener("DOMNodeRemoved", this, true);
    },
    addTransientObserver: function(node) {
      if (node === this.target) return;
      this.addListeners_(node);
      this.transientObservedNodes.push(node);
      var registrations = registrationsTable.get(node);
      if (!registrations) registrationsTable.set(node, registrations = []);
      registrations.push(this);
    },
    removeTransientObservers: function() {
      var transientObservedNodes = this.transientObservedNodes;
      this.transientObservedNodes = [];
      transientObservedNodes.forEach(function(node) {
        this.removeListeners_(node);
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          if (registrations[i] === this) {
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
    },
    handleEvent: function(e) {
      e.stopImmediatePropagation();
      switch (e.type) {
       case "DOMAttrModified":
        var name = e.attrName;
        var namespace = e.relatedNode.namespaceURI;
        var target = e.target;
        var record = new getRecord("attributes", target);
        record.attributeName = name;
        record.attributeNamespace = namespace;
        var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          if (!options.attributes) return;
          if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
            return;
          }
          if (options.attributeOldValue) return getRecordWithOldValue(oldValue);
          return record;
        });
        break;

       case "DOMCharacterDataModified":
        var target = e.target;
        var record = getRecord("characterData", target);
        var oldValue = e.prevValue;
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          if (!options.characterData) return;
          if (options.characterDataOldValue) return getRecordWithOldValue(oldValue);
          return record;
        });
        break;

       case "DOMNodeRemoved":
        this.addTransientObserver(e.target);

       case "DOMNodeInserted":
        var changedNode = e.target;
        var addedNodes, removedNodes;
        if (e.type === "DOMNodeInserted") {
          addedNodes = [ changedNode ];
          removedNodes = [];
        } else {
          addedNodes = [];
          removedNodes = [ changedNode ];
        }
        var previousSibling = changedNode.previousSibling;
        var nextSibling = changedNode.nextSibling;
        var record = getRecord("childList", e.target.parentNode);
        record.addedNodes = addedNodes;
        record.removedNodes = removedNodes;
        record.previousSibling = previousSibling;
        record.nextSibling = nextSibling;
        forEachAncestorAndObserverEnqueueRecord(e.relatedNode, function(options) {
          if (!options.childList) return;
          return record;
        });
      }
      clearRecords();
    }
  };
  global.JsMutationObserver = JsMutationObserver;
  if (!global.MutationObserver) global.MutationObserver = JsMutationObserver;
})(self);

window.CustomElements = window.CustomElements || {
  flags: {}
};

(function(scope) {
  var flags = scope.flags;
  var modules = [];
  var addModule = function(module) {
    modules.push(module);
  };
  var initializeModules = function() {
    modules.forEach(function(module) {
      module(scope);
    });
  };
  scope.addModule = addModule;
  scope.initializeModules = initializeModules;
  scope.hasNative = Boolean(document.registerElement);
  scope.isIE = /Trident/.test(navigator.userAgent);
  scope.useNative = !flags.register && scope.hasNative && !window.ShadowDOMPolyfill && (!window.HTMLImports || window.HTMLImports.useNative);
})(window.CustomElements);

window.CustomElements.addModule(function(scope) {
  var IMPORT_LINK_TYPE = window.HTMLImports ? window.HTMLImports.IMPORT_LINK_TYPE : "none";
  function forSubtree(node, cb) {
    findAllElements(node, function(e) {
      if (cb(e)) {
        return true;
      }
      forRoots(e, cb);
    });
    forRoots(node, cb);
  }
  function findAllElements(node, find, data) {
    var e = node.firstElementChild;
    if (!e) {
      e = node.firstChild;
      while (e && e.nodeType !== Node.ELEMENT_NODE) {
        e = e.nextSibling;
      }
    }
    while (e) {
      if (find(e, data) !== true) {
        findAllElements(e, find, data);
      }
      e = e.nextElementSibling;
    }
    return null;
  }
  function forRoots(node, cb) {
    var root = node.shadowRoot;
    while (root) {
      forSubtree(root, cb);
      root = root.olderShadowRoot;
    }
  }
  function forDocumentTree(doc, cb) {
    _forDocumentTree(doc, cb, []);
  }
  function _forDocumentTree(doc, cb, processingDocuments) {
    doc = window.wrap(doc);
    if (processingDocuments.indexOf(doc) >= 0) {
      return;
    }
    processingDocuments.push(doc);
    var imports = doc.querySelectorAll("link[rel=" + IMPORT_LINK_TYPE + "]");
    for (var i = 0, l = imports.length, n; i < l && (n = imports[i]); i++) {
      if (n.import) {
        _forDocumentTree(n.import, cb, processingDocuments);
      }
    }
    cb(doc);
  }
  scope.forDocumentTree = forDocumentTree;
  scope.forSubtree = forSubtree;
});

window.CustomElements.addModule(function(scope) {
  var flags = scope.flags;
  var forSubtree = scope.forSubtree;
  var forDocumentTree = scope.forDocumentTree;
  function addedNode(node, isAttached) {
    return added(node, isAttached) || addedSubtree(node, isAttached);
  }
  function added(node, isAttached) {
    if (scope.upgrade(node, isAttached)) {
      return true;
    }
    if (isAttached) {
      attached(node);
    }
  }
  function addedSubtree(node, isAttached) {
    forSubtree(node, function(e) {
      if (added(e, isAttached)) {
        return true;
      }
    });
  }
  var hasPolyfillMutations = !window.MutationObserver || window.MutationObserver === window.JsMutationObserver;
  scope.hasPolyfillMutations = hasPolyfillMutations;
  var isPendingMutations = false;
  var pendingMutations = [];
  function deferMutation(fn) {
    pendingMutations.push(fn);
    if (!isPendingMutations) {
      isPendingMutations = true;
      setTimeout(takeMutations);
    }
  }
  function takeMutations() {
    isPendingMutations = false;
    var $p = pendingMutations;
    for (var i = 0, l = $p.length, p; i < l && (p = $p[i]); i++) {
      p();
    }
    pendingMutations = [];
  }
  function attached(element) {
    if (hasPolyfillMutations) {
      deferMutation(function() {
        _attached(element);
      });
    } else {
      _attached(element);
    }
  }
  function _attached(element) {
    if (element.__upgraded__ && !element.__attached) {
      element.__attached = true;
      if (element.attachedCallback) {
        element.attachedCallback();
      }
    }
  }
  function detachedNode(node) {
    detached(node);
    forSubtree(node, function(e) {
      detached(e);
    });
  }
  function detached(element) {
    if (hasPolyfillMutations) {
      deferMutation(function() {
        _detached(element);
      });
    } else {
      _detached(element);
    }
  }
  function _detached(element) {
    if (element.__upgraded__ && element.__attached) {
      element.__attached = false;
      if (element.detachedCallback) {
        element.detachedCallback();
      }
    }
  }
  function inDocument(element) {
    var p = element;
    var doc = window.wrap(document);
    while (p) {
      if (p == doc) {
        return true;
      }
      p = p.parentNode || p.nodeType === Node.DOCUMENT_FRAGMENT_NODE && p.host;
    }
  }
  function watchShadow(node) {
    if (node.shadowRoot && !node.shadowRoot.__watched) {
      flags.dom && console.log("watching shadow-root for: ", node.localName);
      var root = node.shadowRoot;
      while (root) {
        observe(root);
        root = root.olderShadowRoot;
      }
    }
  }
  function handler(root, mutations) {
    if (flags.dom) {
      var mx = mutations[0];
      if (mx && mx.type === "childList" && mx.addedNodes) {
        if (mx.addedNodes) {
          var d = mx.addedNodes[0];
          while (d && d !== document && !d.host) {
            d = d.parentNode;
          }
          var u = d && (d.URL || d._URL || d.host && d.host.localName) || "";
          u = u.split("/?").shift().split("/").pop();
        }
      }
      console.group("mutations (%d) [%s]", mutations.length, u || "");
    }
    var isAttached = inDocument(root);
    mutations.forEach(function(mx) {
      if (mx.type === "childList") {
        forEach(mx.addedNodes, function(n) {
          if (!n.localName) {
            return;
          }
          addedNode(n, isAttached);
        });
        forEach(mx.removedNodes, function(n) {
          if (!n.localName) {
            return;
          }
          detachedNode(n);
        });
      }
    });
    flags.dom && console.groupEnd();
  }
  function takeRecords(node) {
    node = window.wrap(node);
    if (!node) {
      node = window.wrap(document);
    }
    while (node.parentNode) {
      node = node.parentNode;
    }
    var observer = node.__observer;
    if (observer) {
      handler(node, observer.takeRecords());
      takeMutations();
    }
  }
  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  function observe(inRoot) {
    if (inRoot.__observer) {
      return;
    }
    var observer = new MutationObserver(handler.bind(this, inRoot));
    observer.observe(inRoot, {
      childList: true,
      subtree: true
    });
    inRoot.__observer = observer;
  }
  function upgradeDocument(doc) {
    doc = window.wrap(doc);
    flags.dom && console.group("upgradeDocument: ", doc.baseURI.split("/").pop());
    var isMainDocument = doc === window.wrap(document);
    addedNode(doc, isMainDocument);
    observe(doc);
    flags.dom && console.groupEnd();
  }
  function upgradeDocumentTree(doc) {
    forDocumentTree(doc, upgradeDocument);
  }
  var originalCreateShadowRoot = Element.prototype.createShadowRoot;
  if (originalCreateShadowRoot) {
    Element.prototype.createShadowRoot = function() {
      var root = originalCreateShadowRoot.call(this);
      window.CustomElements.watchShadow(this);
      return root;
    };
  }
  scope.watchShadow = watchShadow;
  scope.upgradeDocumentTree = upgradeDocumentTree;
  scope.upgradeDocument = upgradeDocument;
  scope.upgradeSubtree = addedSubtree;
  scope.upgradeAll = addedNode;
  scope.attached = attached;
  scope.takeRecords = takeRecords;
});

window.CustomElements.addModule(function(scope) {
  var flags = scope.flags;
  function upgrade(node, isAttached) {
    if (!node.__upgraded__ && node.nodeType === Node.ELEMENT_NODE) {
      var is = node.getAttribute("is");
      var definition = scope.getRegisteredDefinition(node.localName) || scope.getRegisteredDefinition(is);
      if (definition) {
        if (is && definition.tag == node.localName || !is && !definition.extends) {
          return upgradeWithDefinition(node, definition, isAttached);
        }
      }
    }
  }
  function upgradeWithDefinition(element, definition, isAttached) {
    flags.upgrade && console.group("upgrade:", element.localName);
    if (definition.is) {
      element.setAttribute("is", definition.is);
    }
    implementPrototype(element, definition);
    element.__upgraded__ = true;
    created(element);
    if (isAttached) {
      scope.attached(element);
    }
    scope.upgradeSubtree(element, isAttached);
    flags.upgrade && console.groupEnd();
    return element;
  }
  function implementPrototype(element, definition) {
    if (Object.__proto__) {
      element.__proto__ = definition.prototype;
    } else {
      customMixin(element, definition.prototype, definition.native);
      element.__proto__ = definition.prototype;
    }
  }
  function customMixin(inTarget, inSrc, inNative) {
    var used = {};
    var p = inSrc;
    while (p !== inNative && p !== HTMLElement.prototype) {
      var keys = Object.getOwnPropertyNames(p);
      for (var i = 0, k; k = keys[i]; i++) {
        if (!used[k]) {
          Object.defineProperty(inTarget, k, Object.getOwnPropertyDescriptor(p, k));
          used[k] = 1;
        }
      }
      p = Object.getPrototypeOf(p);
    }
  }
  function created(element) {
    if (element.createdCallback) {
      element.createdCallback();
    }
  }
  scope.upgrade = upgrade;
  scope.upgradeWithDefinition = upgradeWithDefinition;
  scope.implementPrototype = implementPrototype;
});

window.CustomElements.addModule(function(scope) {
  var isIE = scope.isIE;
  var upgradeDocumentTree = scope.upgradeDocumentTree;
  var upgradeAll = scope.upgradeAll;
  var upgradeWithDefinition = scope.upgradeWithDefinition;
  var implementPrototype = scope.implementPrototype;
  var useNative = scope.useNative;
  function register(name, options) {
    var definition = options || {};
    if (!name) {
      throw new Error("document.registerElement: first argument `name` must not be empty");
    }
    if (name.indexOf("-") < 0) {
      throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '" + String(name) + "'.");
    }
    if (isReservedTag(name)) {
      throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '" + String(name) + "'. The type name is invalid.");
    }
    if (getRegisteredDefinition(name)) {
      throw new Error("DuplicateDefinitionError: a type with name '" + String(name) + "' is already registered");
    }
    if (!definition.prototype) {
      definition.prototype = Object.create(HTMLElement.prototype);
    }
    definition.__name = name.toLowerCase();
    definition.lifecycle = definition.lifecycle || {};
    definition.ancestry = ancestry(definition.extends);
    resolveTagName(definition);
    resolvePrototypeChain(definition);
    overrideAttributeApi(definition.prototype);
    registerDefinition(definition.__name, definition);
    definition.ctor = generateConstructor(definition);
    definition.ctor.prototype = definition.prototype;
    definition.prototype.constructor = definition.ctor;
    if (scope.ready) {
      upgradeDocumentTree(document);
    }
    return definition.ctor;
  }
  function overrideAttributeApi(prototype) {
    if (prototype.setAttribute._polyfilled) {
      return;
    }
    var setAttribute = prototype.setAttribute;
    prototype.setAttribute = function(name, value) {
      changeAttribute.call(this, name, value, setAttribute);
    };
    var removeAttribute = prototype.removeAttribute;
    prototype.removeAttribute = function(name) {
      changeAttribute.call(this, name, null, removeAttribute);
    };
    prototype.setAttribute._polyfilled = true;
  }
  function changeAttribute(name, value, operation) {
    name = name.toLowerCase();
    var oldValue = this.getAttribute(name);
    operation.apply(this, arguments);
    var newValue = this.getAttribute(name);
    if (this.attributeChangedCallback && newValue !== oldValue) {
      this.attributeChangedCallback(name, oldValue, newValue);
    }
  }
  function isReservedTag(name) {
    for (var i = 0; i < reservedTagList.length; i++) {
      if (name === reservedTagList[i]) {
        return true;
      }
    }
  }
  var reservedTagList = [ "annotation-xml", "color-profile", "font-face", "font-face-src", "font-face-uri", "font-face-format", "font-face-name", "missing-glyph" ];
  function ancestry(extnds) {
    var extendee = getRegisteredDefinition(extnds);
    if (extendee) {
      return ancestry(extendee.extends).concat([ extendee ]);
    }
    return [];
  }
  function resolveTagName(definition) {
    var baseTag = definition.extends;
    for (var i = 0, a; a = definition.ancestry[i]; i++) {
      baseTag = a.is && a.tag;
    }
    definition.tag = baseTag || definition.__name;
    if (baseTag) {
      definition.is = definition.__name;
    }
  }
  function resolvePrototypeChain(definition) {
    if (!Object.__proto__) {
      var nativePrototype = HTMLElement.prototype;
      if (definition.is) {
        var inst = document.createElement(definition.tag);
        nativePrototype = Object.getPrototypeOf(inst);
      }
      var proto = definition.prototype, ancestor;
      var foundPrototype = false;
      while (proto) {
        if (proto == nativePrototype) {
          foundPrototype = true;
        }
        ancestor = Object.getPrototypeOf(proto);
        if (ancestor) {
          proto.__proto__ = ancestor;
        }
        proto = ancestor;
      }
      if (!foundPrototype) {
        console.warn(definition.tag + " prototype not found in prototype chain for " + definition.is);
      }
      definition.native = nativePrototype;
    }
  }
  function instantiate(definition) {
    return upgradeWithDefinition(domCreateElement(definition.tag), definition);
  }
  var registry = {};
  function getRegisteredDefinition(name) {
    if (name) {
      return registry[name.toLowerCase()];
    }
  }
  function registerDefinition(name, definition) {
    registry[name] = definition;
  }
  function generateConstructor(definition) {
    return function() {
      return instantiate(definition);
    };
  }
  var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
  function createElementNS(namespace, tag, typeExtension) {
    if (namespace === HTML_NAMESPACE) {
      return createElement(tag, typeExtension);
    } else {
      return domCreateElementNS(namespace, tag);
    }
  }
  function createElement(tag, typeExtension) {
    if (tag) {
      tag = tag.toLowerCase();
    }
    if (typeExtension) {
      typeExtension = typeExtension.toLowerCase();
    }
    var definition = getRegisteredDefinition(typeExtension || tag);
    if (definition) {
      if (tag == definition.tag && typeExtension == definition.is) {
        return new definition.ctor();
      }
      if (!typeExtension && !definition.is) {
        return new definition.ctor();
      }
    }
    var element;
    if (typeExtension) {
      element = createElement(tag);
      element.setAttribute("is", typeExtension);
      return element;
    }
    element = domCreateElement(tag);
    if (tag.indexOf("-") >= 0) {
      implementPrototype(element, HTMLElement);
    }
    return element;
  }
  var domCreateElement = document.createElement.bind(document);
  var domCreateElementNS = document.createElementNS.bind(document);
  var isInstance;
  if (!Object.__proto__ && !useNative) {
    isInstance = function(obj, ctor) {
      if (obj instanceof ctor) {
        return true;
      }
      var p = obj;
      while (p) {
        if (p === ctor.prototype) {
          return true;
        }
        p = p.__proto__;
      }
      return false;
    };
  } else {
    isInstance = function(obj, base) {
      return obj instanceof base;
    };
  }
  function wrapDomMethodToForceUpgrade(obj, methodName) {
    var orig = obj[methodName];
    obj[methodName] = function() {
      var n = orig.apply(this, arguments);
      upgradeAll(n);
      return n;
    };
  }
  wrapDomMethodToForceUpgrade(Node.prototype, "cloneNode");
  wrapDomMethodToForceUpgrade(document, "importNode");
  if (isIE) {
    (function() {
      var importNode = document.importNode;
      document.importNode = function() {
        var n = importNode.apply(document, arguments);
        if (n.nodeType == n.DOCUMENT_FRAGMENT_NODE) {
          var f = document.createDocumentFragment();
          f.appendChild(n);
          return f;
        } else {
          return n;
        }
      };
    })();
  }
  document.registerElement = register;
  document.createElement = createElement;
  document.createElementNS = createElementNS;
  scope.registry = registry;
  scope.instanceof = isInstance;
  scope.reservedTagList = reservedTagList;
  scope.getRegisteredDefinition = getRegisteredDefinition;
  document.register = document.registerElement;
});

(function(scope) {
  var useNative = scope.useNative;
  var initializeModules = scope.initializeModules;
  var isIE = scope.isIE;
  if (useNative) {
    var nop = function() {};
    scope.watchShadow = nop;
    scope.upgrade = nop;
    scope.upgradeAll = nop;
    scope.upgradeDocumentTree = nop;
    scope.upgradeSubtree = nop;
    scope.takeRecords = nop;
    scope.instanceof = function(obj, base) {
      return obj instanceof base;
    };
  } else {
    initializeModules();
  }
  var upgradeDocumentTree = scope.upgradeDocumentTree;
  var upgradeDocument = scope.upgradeDocument;
  if (!window.wrap) {
    if (window.ShadowDOMPolyfill) {
      window.wrap = window.ShadowDOMPolyfill.wrapIfNeeded;
      window.unwrap = window.ShadowDOMPolyfill.unwrapIfNeeded;
    } else {
      window.wrap = window.unwrap = function(node) {
        return node;
      };
    }
  }
  if (window.HTMLImports) {
    window.HTMLImports.__importsParsingHook = function(elt) {
      if (elt.import) {
        upgradeDocument(wrap(elt.import));
      }
    };
  }
  function bootstrap() {
    upgradeDocumentTree(window.wrap(document));
    window.CustomElements.ready = true;
    var requestAnimationFrame = window.requestAnimationFrame || function(f) {
      setTimeout(f, 16);
    };
    requestAnimationFrame(function() {
      setTimeout(function() {
        window.CustomElements.readyTime = Date.now();
        if (window.HTMLImports) {
          window.CustomElements.elapsed = window.CustomElements.readyTime - window.HTMLImports.readyTime;
        }
        document.dispatchEvent(new CustomEvent("WebComponentsReady", {
          bubbles: true
        }));
      });
    });
  }
  if (!window.CustomEvent || isIE && typeof window.CustomEvent !== "function") {
    window.CustomEvent = function(inType, params) {
      params = params || {};
      var e = document.createEvent("CustomEvent");
      e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
      e.preventDefault = function() {
        Object.defineProperty(this, "defaultPrevented", {
          get: function() {
            return true;
          }
        });
      };
      return e;
    };
    window.CustomEvent.prototype = window.Event.prototype;
  }
  if (document.readyState === "complete" || scope.flags.eager) {
    bootstrap();
  } else if (document.readyState === "interactive" && !window.attachEvent && (!window.HTMLImports || window.HTMLImports.ready)) {
    bootstrap();
  } else {
    var loadEvent = window.HTMLImports && !window.HTMLImports.ready ? "HTMLImportsLoaded" : "DOMContentLoaded";
    window.addEventListener(loadEvent, bootstrap);
  }
})(window.CustomElements);
(function() {


}).call(this);
(function() {
  this.Trix = {
    VERSION: "0.9.2",
    ZERO_WIDTH_SPACE: "\uFEFF",
    NON_BREAKING_SPACE: "\u00A0",
    OBJECT_REPLACEMENT_CHARACTER: "\uFFFC",
    config: {}
  };

}).call(this);
(function() {
  Trix.BasicObject = (function() {
    var apply, parseProxyMethodExpression, proxyMethodExpressionPattern;

    function BasicObject() {}

    BasicObject.proxyMethod = function(expression) {
      var name, optional, ref, toMethod, toProperty;
      ref = parseProxyMethodExpression(expression), name = ref.name, toMethod = ref.toMethod, toProperty = ref.toProperty, optional = ref.optional;
      return this.prototype[name] = function() {
        var object, subject;
        object = toMethod != null ? optional ? typeof this[toMethod] === "function" ? this[toMethod]() : void 0 : this[toMethod]() : toProperty != null ? this[toProperty] : void 0;
        if (optional) {
          subject = object != null ? object[name] : void 0;
          if (subject != null) {
            return apply.call(subject, object, arguments);
          }
        } else {
          subject = object[name];
          return apply.call(subject, object, arguments);
        }
      };
    };

    parseProxyMethodExpression = function(expression) {
      var args, match;
      if (!(match = expression.match(proxyMethodExpressionPattern))) {
        throw new Error("can't parse @proxyMethod expression: " + expression);
      }
      args = {
        name: match[4]
      };
      if (match[2] != null) {
        args.toMethod = match[1];
      } else {
        args.toProperty = match[1];
      }
      if (match[3] != null) {
        args.optional = true;
      }
      return args;
    };

    apply = Function.prototype.apply;

    proxyMethodExpressionPattern = /^(.+?)(\(\))?(\?)?\.(.+?)$/;

    return BasicObject;

  })();

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.Object = (function(superClass) {
    var id;

    extend(Object, superClass);

    id = 0;

    Object.fromJSONString = function(jsonString) {
      return this.fromJSON(JSON.parse(jsonString));
    };

    function Object() {
      this.id = ++id;
    }

    Object.prototype.hasSameConstructorAs = function(object) {
      return this.constructor === (object != null ? object.constructor : void 0);
    };

    Object.prototype.isEqualTo = function(object) {
      return this === object;
    };

    Object.prototype.inspect = function() {
      var contents, key, value;
      contents = (function() {
        var ref, ref1, results;
        ref1 = (ref = this.contentsForInspection()) != null ? ref : {};
        results = [];
        for (key in ref1) {
          value = ref1[key];
          results.push(key + "=" + value);
        }
        return results;
      }).call(this);
      return "#<" + this.constructor.name + ":" + this.id + (contents.length ? " " + (contents.join(", ")) : "") + ">";
    };

    Object.prototype.contentsForInspection = function() {};

    Object.prototype.toJSONString = function() {
      return JSON.stringify(this);
    };

    Object.prototype.toUTF16String = function() {
      return Trix.UTF16String.box(this);
    };

    Object.prototype.getCacheKey = function() {
      return this.id.toString();
    };

    return Object;

  })(Trix.BasicObject);

}).call(this);
(function() {
  Trix.extend = function(properties) {
    var key, value;
    for (key in properties) {
      value = properties[key];
      this[key] = value;
    }
    return this;
  };

}).call(this);
(function() {
  var formatValue, memos;

  Trix.extend({
    defer: function(fn) {
      return setTimeout(fn, 1);
    },
    memoize: function(fn) {
      var memo;
      memo = memos++;
      return function() {
        var base;
        if (this.memos == null) {
          this.memos = {};
        }
        return (base = this.memos)[memo] != null ? base[memo] : base[memo] = fn.apply(this, arguments);
      };
    }
  });

  memos = 0;

  formatValue = function(value) {
    var ref, ref1;
    return (ref = (ref1 = value != null ? typeof value.inspect === "function" ? value.inspect() : void 0 : void 0) != null ? ref1 : ((function() {
      try {
        return JSON.stringify(value);
      } catch (_error) {}
    })())) != null ? ref : value;
  };

}).call(this);
(function() {
  var utf16StringDifference, utf16StringDifferences;

  Trix.extend({
    normalizeSpaces: function(string) {
      return string.replace(RegExp("" + Trix.ZERO_WIDTH_SPACE, "g"), "").replace(RegExp("" + Trix.NON_BREAKING_SPACE, "g"), " ");
    },
    summarizeStringChange: function(oldString, newString) {
      var added, ref, ref1, removed;
      oldString = Trix.UTF16String.box(oldString);
      newString = Trix.UTF16String.box(newString);
      if (newString.length < oldString.length) {
        ref = utf16StringDifferences(oldString, newString), removed = ref[0], added = ref[1];
      } else {
        ref1 = utf16StringDifferences(newString, oldString), added = ref1[0], removed = ref1[1];
      }
      return {
        added: added,
        removed: removed
      };
    }
  });

  utf16StringDifferences = function(a, b) {
    var codepoints, diffA, diffB, length, offset;
    if (a.isEqualTo(b)) {
      return ["", ""];
    }
    diffA = utf16StringDifference(a, b);
    length = diffA.utf16String.length;
    diffB = length ? ((offset = diffA.offset, diffA), codepoints = a.codepoints.slice(0, offset).concat(a.codepoints.slice(offset + length)), utf16StringDifference(b, Trix.UTF16String.fromCodepoints(codepoints))) : utf16StringDifference(b, a);
    return [diffA.utf16String.toString(), diffB.utf16String.toString()];
  };

  utf16StringDifference = function(a, b) {
    var leftIndex, rightIndexA, rightIndexB;
    leftIndex = 0;
    rightIndexA = a.length;
    rightIndexB = b.length;
    while (leftIndex < rightIndexA && a.charAt(leftIndex).isEqualTo(b.charAt(leftIndex))) {
      leftIndex++;
    }
    while (rightIndexA > leftIndex + 1 && a.charAt(rightIndexA - 1).isEqualTo(b.charAt(rightIndexB - 1))) {
      rightIndexA--;
      rightIndexB--;
    }
    return {
      utf16String: a.slice(leftIndex, rightIndexA),
      offset: leftIndex
    };
  };

}).call(this);
(function() {
  Trix.extend({
    arraysAreEqual: function(a, b) {
      var i, index, len, value;
      if (a == null) {
        a = [];
      }
      if (b == null) {
        b = [];
      }
      if (a.length !== b.length) {
        return false;
      }
      for (index = i = 0, len = a.length; i < len; index = ++i) {
        value = a[index];
        if (value !== b[index]) {
          return false;
        }
      }
      return true;
    },
    objectsAreEqual: function(a, b) {
      var key, value;
      if (a == null) {
        a = {};
      }
      if (b == null) {
        b = {};
      }
      if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
      }
      for (key in a) {
        value = a[key];
        if (value !== b[key]) {
          return false;
        }
      }
      return true;
    },
    summarizeArrayChange: function(oldArray, newArray) {
      var added, currentValues, existingValues, i, j, k, len, len1, len2, removed, value;
      if (oldArray == null) {
        oldArray = [];
      }
      if (newArray == null) {
        newArray = [];
      }
      added = [];
      removed = [];
      existingValues = new Set;
      for (i = 0, len = oldArray.length; i < len; i++) {
        value = oldArray[i];
        existingValues.add(value);
      }
      currentValues = new Set;
      for (j = 0, len1 = newArray.length; j < len1; j++) {
        value = newArray[j];
        currentValues.add(value);
        if (!existingValues.has(value)) {
          added.push(value);
        }
      }
      for (k = 0, len2 = oldArray.length; k < len2; k++) {
        value = oldArray[k];
        if (!currentValues.has(value)) {
          removed.push(value);
        }
      }
      return {
        added: added,
        removed: removed
      };
    }
  });

}).call(this);
(function() {
  var html, match, ref, ref1, ref2;

  html = document.documentElement;

  match = (ref = (ref1 = (ref2 = html.matchesSelector) != null ? ref2 : html.webkitMatchesSelector) != null ? ref1 : html.msMatchesSelector) != null ? ref : html.mozMatchesSelector;

  Trix.extend({
    handleEvent: function(eventName, arg) {
      var callback, element, handler, inPhase, matchingSelector, onElement, preventDefault, ref3, selector, times, useCapture, withCallback;
      ref3 = arg != null ? arg : {}, onElement = ref3.onElement, matchingSelector = ref3.matchingSelector, withCallback = ref3.withCallback, inPhase = ref3.inPhase, preventDefault = ref3.preventDefault, times = ref3.times;
      element = onElement != null ? onElement : html;
      selector = matchingSelector;
      callback = withCallback;
      useCapture = inPhase === "capturing";
      handler = function(event) {
        var target;
        if ((times != null) && --times === 0) {
          handler.destroy();
        }
        target = Trix.findClosestElementFromNode(event.target, {
          matchingSelector: selector
        });
        if (target != null) {
          if (withCallback != null) {
            withCallback.call(target, event, target);
          }
          if (preventDefault) {
            return event.preventDefault();
          }
        }
      };
      handler.destroy = function() {
        return element.removeEventListener(eventName, handler, useCapture);
      };
      element.addEventListener(eventName, handler, useCapture);
      return handler;
    },
    handleEventOnce: function(eventName, options) {
      if (options == null) {
        options = {};
      }
      options.times = 1;
      return Trix.handleEvent(eventName, options);
    },
    triggerEvent: function(eventName, arg) {
      var attributes, bubbles, cancelable, element, event, onElement, ref3;
      ref3 = arg != null ? arg : {}, onElement = ref3.onElement, bubbles = ref3.bubbles, cancelable = ref3.cancelable, attributes = ref3.attributes;
      element = onElement != null ? onElement : html;
      bubbles = bubbles !== false;
      cancelable = cancelable !== false;
      event = document.createEvent("Events");
      event.initEvent(eventName, bubbles, cancelable);
      if (attributes != null) {
        Trix.extend.call(event, attributes);
      }
      return element.dispatchEvent(event);
    },
    elementMatchesSelector: function(element, selector) {
      if ((element != null ? element.nodeType : void 0) === 1) {
        return match.call(element, selector);
      }
    },
    findClosestElementFromNode: function(node, arg) {
      var matchingSelector;
      matchingSelector = (arg != null ? arg : {}).matchingSelector;
      while (!((node == null) || node.nodeType === Node.ELEMENT_NODE)) {
        node = node.parentNode;
      }
      if (matchingSelector != null) {
        while (node) {
          if (Trix.elementMatchesSelector(node, matchingSelector)) {
            return node;
          }
          node = node.parentNode;
        }
      } else {
        return node;
      }
    },
    findInnerElement: function(element) {
      while (element != null ? element.firstElementChild : void 0) {
        element = element.firstElementChild;
      }
      return element;
    },
    innerElementIsActive: function(element) {
      return document.activeElement !== element && Trix.elementContainsNode(element, document.activeElement);
    },
    elementContainsNode: function(element, node) {
      if (!(element && node)) {
        return;
      }
      while (node) {
        if (node === element) {
          return true;
        }
        node = node.parentNode;
      }
    },
    findNodeFromContainerAndOffset: function(container, offset) {
      var ref3;
      if (!container) {
        return;
      }
      if (container.nodeType === Node.TEXT_NODE) {
        return container;
      } else if (offset === 0) {
        return (ref3 = container.firstChild) != null ? ref3 : container;
      } else {
        return container.childNodes.item(offset - 1);
      }
    },
    findElementFromContainerAndOffset: function(container, offset) {
      var node;
      node = Trix.findNodeFromContainerAndOffset(container, offset);
      return Trix.findClosestElementFromNode(node);
    },
    findChildIndexOfNode: function(node) {
      var childIndex;
      if (!(node != null ? node.parentNode : void 0)) {
        return;
      }
      childIndex = 0;
      while (node = node.previousSibling) {
        childIndex++;
      }
      return childIndex;
    },
    measureElement: function(element) {
      return {
        width: element.offsetWidth,
        height: element.offsetHeight
      };
    },
    walkTree: function(tree, arg) {
      var expandEntityReferences, onlyNodesOfType, ref3, usingFilter, whatToShow;
      ref3 = arg != null ? arg : {}, onlyNodesOfType = ref3.onlyNodesOfType, usingFilter = ref3.usingFilter, expandEntityReferences = ref3.expandEntityReferences;
      whatToShow = (function() {
        switch (onlyNodesOfType) {
          case "element":
            return NodeFilter.SHOW_ELEMENT;
          case "text":
            return NodeFilter.SHOW_TEXT;
          case "comment":
            return NodeFilter.SHOW_COMMENT;
          default:
            return NodeFilter.SHOW_ALL;
        }
      })();
      return document.createTreeWalker(tree, whatToShow, usingFilter != null ? usingFilter : null, expandEntityReferences === true);
    },
    tagName: function(element) {
      var ref3;
      return element != null ? (ref3 = element.tagName) != null ? ref3.toLowerCase() : void 0 : void 0;
    },
    makeElement: function(tagName, options) {
      var className, element, i, key, len, ref3, ref4, ref5, ref6, value;
      if (options == null) {
        options = {};
      }
      if (typeof tagName === "object") {
        options = tagName;
        tagName = options.tagName;
      } else {
        options = {
          attributes: options
        };
      }
      element = document.createElement(tagName);
      if (options.editable != null) {
        if (options.attributes == null) {
          options.attributes = {};
        }
        options.attributes.contenteditable = options.editable;
      }
      if (options.attributes) {
        ref3 = options.attributes;
        for (key in ref3) {
          value = ref3[key];
          element.setAttribute(key, value);
        }
      }
      if (options.style) {
        ref4 = options.style;
        for (key in ref4) {
          value = ref4[key];
          element.style[key] = value;
        }
      }
      if (options.data) {
        ref5 = options.data;
        for (key in ref5) {
          value = ref5[key];
          element.dataset[key] = value;
        }
      }
      if (options.className) {
        ref6 = options.className.split(" ");
        for (i = 0, len = ref6.length; i < len; i++) {
          className = ref6[i];
          element.classList.add(className);
        }
      }
      if (options.textContent) {
        element.textContent = options.textContent;
      }
      return element;
    },
    cloneFragment: function(sourceFragment) {
      var fragment, i, len, node, ref3;
      fragment = document.createDocumentFragment();
      ref3 = sourceFragment.childNodes;
      for (i = 0, len = ref3.length; i < len; i++) {
        node = ref3[i];
        fragment.appendChild(node.cloneNode(true));
      }
      return fragment;
    },
    makeFragment: function(html) {
      var container, fragment, node;
      if (html == null) {
        html = "";
      }
      container = document.createElement("div");
      container.innerHTML = html;
      fragment = document.createDocumentFragment();
      while (node = container.firstChild) {
        fragment.appendChild(node);
      }
      return fragment;
    },
    nodeIsBlockContainer: function(node) {
      return Trix.nodeIsBlockStartComment(node != null ? node.firstChild : void 0);
    },
    nodeIsBlockStartComment: function(node) {
      return Trix.nodeIsCommentNode(node) && (node != null ? node.data : void 0) === "block";
    },
    nodeIsCommentNode: function(node) {
      return (node != null ? node.nodeType : void 0) === Node.COMMENT_NODE;
    },
    nodeIsCursorTarget: function(node) {
      if (!node) {
        return;
      }
      if (Trix.nodeIsTextNode(node)) {
        return node.data === Trix.ZERO_WIDTH_SPACE;
      } else {
        return Trix.nodeIsCursorTarget(node.firstChild);
      }
    },
    nodeIsAttachmentWrapper: function(node) {
      return node.nodeType === Node.ELEMENT_NODE && node.classList.contains("attachment-wrapper") && node.childElementCount === 1 && Trix.elementMatchesSelector(node.firstElementChild, Trix.AttachmentView.attachmentSelector);
    },
    nodeIsEmptyTextNode: function(node) {
      return Trix.nodeIsTextNode(node) && (node != null ? node.data : void 0) === "";
    },
    nodeIsTextNode: function(node) {
      return (node != null ? node.nodeType : void 0) === Node.TEXT_NODE;
    }
  });

}).call(this);
(function() {
  var arraysAreEqual,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  arraysAreEqual = Trix.arraysAreEqual;

  Trix.Hash = (function(superClass) {
    var box, copy, merge, object, unbox;

    extend(Hash, superClass);

    Hash.fromCommonAttributesOfObjects = function(objects) {
      var hash, i, keys, len, object, ref;
      if (objects == null) {
        objects = [];
      }
      if (!objects.length) {
        return new this;
      }
      hash = box(objects[0]);
      keys = hash.getKeys();
      ref = objects.slice(1);
      for (i = 0, len = ref.length; i < len; i++) {
        object = ref[i];
        keys = hash.getKeysCommonToHash(box(object));
        hash = hash.slice(keys);
      }
      return hash;
    };

    Hash.box = function(values) {
      return box(values);
    };

    function Hash(values) {
      if (values == null) {
        values = {};
      }
      this.values = copy(values);
      Hash.__super__.constructor.apply(this, arguments);
    }

    Hash.prototype.add = function(key, value) {
      return this.merge(object(key, value));
    };

    Hash.prototype.remove = function(key) {
      return new Trix.Hash(copy(this.values, key));
    };

    Hash.prototype.get = function(key) {
      return this.values[key];
    };

    Hash.prototype.has = function(key) {
      return key in this.values;
    };

    Hash.prototype.merge = function(values) {
      return new Trix.Hash(merge(this.values, unbox(values)));
    };

    Hash.prototype.slice = function(keys) {
      var i, key, len, values;
      values = {};
      for (i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        if (this.has(key)) {
          values[key] = this.values[key];
        }
      }
      return new Trix.Hash(values);
    };

    Hash.prototype.getKeys = function() {
      return Object.keys(this.values);
    };

    Hash.prototype.getKeysCommonToHash = function(hash) {
      var i, key, len, ref, results;
      hash = box(hash);
      ref = this.getKeys();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        if (this.values[key] === hash.values[key]) {
          results.push(key);
        }
      }
      return results;
    };

    Hash.prototype.isEqualTo = function(values) {
      return arraysAreEqual(this.toArray(), box(values).toArray());
    };

    Hash.prototype.isEmpty = function() {
      return this.getKeys().length === 0;
    };

    Hash.prototype.toArray = function() {
      var key, result, value;
      return (this.array != null ? this.array : this.array = ((function() {
        var ref;
        result = [];
        ref = this.values;
        for (key in ref) {
          value = ref[key];
          result.push(key, value);
        }
        return result;
      }).call(this))).slice(0);
    };

    Hash.prototype.toObject = function() {
      return copy(this.values);
    };

    Hash.prototype.toJSON = function() {
      return this.toObject();
    };

    Hash.prototype.contentsForInspection = function() {
      return {
        values: JSON.stringify(this.values)
      };
    };

    object = function(key, value) {
      var result;
      result = {};
      result[key] = value;
      return result;
    };

    merge = function(object, values) {
      var key, result, value;
      result = copy(object);
      for (key in values) {
        value = values[key];
        result[key] = value;
      }
      return result;
    };

    copy = function(object, keyToRemove) {
      var i, key, len, result, sortedKeys;
      result = {};
      sortedKeys = Object.keys(object).sort();
      for (i = 0, len = sortedKeys.length; i < len; i++) {
        key = sortedKeys[i];
        if (key !== keyToRemove) {
          result[key] = object[key];
        }
      }
      return result;
    };

    box = function(object) {
      if (object instanceof Trix.Hash) {
        return object;
      } else {
        return new Trix.Hash(object);
      }
    };

    unbox = function(object) {
      if (object instanceof Trix.Hash) {
        return object.values;
      } else {
        return object;
      }
    };

    return Hash;

  })(Trix.Object);

}).call(this);
(function() {
  var copyValue, normalizeRange, rangeValuesAreEqual;

  Trix.extend({
    normalizeRange: normalizeRange = function(range) {
      var ref;
      if (range == null) {
        return;
      }
      if (!Array.isArray(range)) {
        range = [range, range];
      }
      return [copyValue(range[0]), copyValue((ref = range[1]) != null ? ref : range[0])];
    },
    rangeIsCollapsed: function(range) {
      var end, ref, start;
      if (range == null) {
        return;
      }
      ref = normalizeRange(range), start = ref[0], end = ref[1];
      return rangeValuesAreEqual(start, end);
    },
    rangesAreEqual: function(leftRange, rightRange) {
      var leftEnd, leftStart, ref, ref1, rightEnd, rightStart;
      if (!((leftRange != null) && (rightRange != null))) {
        return;
      }
      ref = normalizeRange(leftRange), leftStart = ref[0], leftEnd = ref[1];
      ref1 = normalizeRange(rightRange), rightStart = ref1[0], rightEnd = ref1[1];
      return rangeValuesAreEqual(leftStart, rightStart) && rangeValuesAreEqual(leftEnd, rightEnd);
    }
  });

  copyValue = function(value) {
    if (typeof value === "number") {
      return value;
    } else {
      return Trix.Hash.box(value).toObject();
    }
  };

  rangeValuesAreEqual = function(left, right) {
    if (typeof left === "number") {
      return left === right;
    } else {
      return Trix.Hash.box(left).isEqualTo(Trix.Hash.box(right));
    }
  };

}).call(this);
(function() {
  var defaults, insertStyleElementForTagName, installDefaultCSSForTagName, rewriteFunctionsAsValues;

  defaults = {
    extendsTagName: "div",
    css: "%t { display: block; }"
  };

  Trix.registerElement = function(tagName, definition) {
    var constructor, defaultCSS, extendedPrototype, extendsTagName, properties, prototype, ref;
    if (definition == null) {
      definition = {};
    }
    tagName = tagName.toLowerCase();
    properties = rewriteFunctionsAsValues(definition);
    extendsTagName = (ref = properties.extendsTagName) != null ? ref : defaults.extendsTagName;
    delete properties.extendsTagName;
    defaultCSS = properties.defaultCSS;
    delete properties.defaultCSS;
    if ((defaultCSS != null) && extendsTagName === defaults.extendsTagName) {
      defaultCSS += "\n" + defaults.css;
    } else {
      defaultCSS = defaults.css;
    }
    installDefaultCSSForTagName(defaultCSS, tagName);
    extendedPrototype = Object.getPrototypeOf(document.createElement(extendsTagName));
    extendedPrototype.__super__ = extendedPrototype;
    prototype = Object.create(extendedPrototype, properties);
    constructor = document.registerElement(tagName, {
      prototype: prototype
    });
    Object.defineProperty(prototype, "constructor", {
      value: constructor
    });
    return constructor;
  };

  installDefaultCSSForTagName = function(defaultCSS, tagName) {
    var styleElement;
    styleElement = insertStyleElementForTagName(tagName);
    return styleElement.textContent = defaultCSS.replace(/%t/g, tagName);
  };

  insertStyleElementForTagName = function(tagName) {
    var element;
    element = document.createElement("style");
    element.setAttribute("type", "text/css");
    element.setAttribute("data-tag-name", tagName.toLowerCase());
    document.head.insertBefore(element, document.head.firstChild);
    return element;
  };

  rewriteFunctionsAsValues = function(definition) {
    var key, object, value;
    object = {};
    for (key in definition) {
      value = definition[key];
      object[key] = typeof value === "function" ? {
        value: value
      } : value;
    }
    return object;
  };

}).call(this);
(function() {


}).call(this);
(function() {
  Trix.ObjectGroup = (function() {
    ObjectGroup.groupObjects = function(ungroupedObjects, arg) {
      var asTree, base, depth, group, i, len, object, objects, ref;
      if (ungroupedObjects == null) {
        ungroupedObjects = [];
      }
      ref = arg != null ? arg : {}, depth = ref.depth, asTree = ref.asTree;
      if (asTree) {
        if (depth == null) {
          depth = 0;
        }
      }
      objects = [];
      for (i = 0, len = ungroupedObjects.length; i < len; i++) {
        object = ungroupedObjects[i];
        if (group) {
          if ((typeof object.canBeGrouped === "function" ? object.canBeGrouped(depth) : void 0) && (typeof (base = group[group.length - 1]).canBeGroupedWith === "function" ? base.canBeGroupedWith(object, depth) : void 0)) {
            group.push(object);
            continue;
          } else {
            objects.push(new this(group, {
              depth: depth,
              asTree: asTree
            }));
            group = null;
          }
        }
        if (typeof object.canBeGrouped === "function" ? object.canBeGrouped(depth) : void 0) {
          group = [object];
        } else {
          objects.push(object);
        }
      }
      if (group) {
        objects.push(new this(group, {
          depth: depth,
          asTree: asTree
        }));
      }
      return objects;
    };

    function ObjectGroup(objects1, arg) {
      var asTree, depth;
      this.objects = objects1 != null ? objects1 : [];
      depth = arg.depth, asTree = arg.asTree;
      if (asTree) {
        this.depth = depth;
        this.objects = this.constructor.groupObjects(this.objects, {
          asTree: asTree,
          depth: this.depth + 1
        });
      }
    }

    ObjectGroup.prototype.getObjects = function() {
      return this.objects;
    };

    ObjectGroup.prototype.getDepth = function() {
      return this.depth;
    };

    ObjectGroup.prototype.getCacheKey = function() {
      var i, keys, len, object, ref;
      keys = ["objectGroup"];
      ref = this.getObjects();
      for (i = 0, len = ref.length; i < len; i++) {
        object = ref[i];
        keys.push(object.getCacheKey());
      }
      return keys.join("/");
    };

    return ObjectGroup;

  })();

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.ObjectMap = (function(superClass) {
    extend(ObjectMap, superClass);

    function ObjectMap(objects) {
      var base, hash, i, len, object;
      if (objects == null) {
        objects = [];
      }
      this.objects = {};
      for (i = 0, len = objects.length; i < len; i++) {
        object = objects[i];
        hash = JSON.stringify(object);
        if ((base = this.objects)[hash] == null) {
          base[hash] = object;
        }
      }
    }

    ObjectMap.prototype.find = function(object) {
      var hash;
      hash = JSON.stringify(object);
      return this.objects[hash];
    };

    return ObjectMap;

  })(Trix.BasicObject);

}).call(this);
(function() {
  Trix.ElementStore = (function() {
    var getKey;

    function ElementStore(elements) {
      this.reset(elements);
    }

    ElementStore.prototype.add = function(element) {
      var key;
      key = getKey(element);
      return this.elements[key] = element;
    };

    ElementStore.prototype.remove = function(element) {
      var key, value;
      key = getKey(element);
      if (value = this.elements[key]) {
        delete this.elements[key];
        return value;
      }
    };

    ElementStore.prototype.reset = function(elements) {
      var element, i, len;
      if (elements == null) {
        elements = [];
      }
      this.elements = {};
      for (i = 0, len = elements.length; i < len; i++) {
        element = elements[i];
        this.add(element);
      }
      return elements;
    };

    getKey = function(element) {
      return element.dataset.trixStoreKey;
    };

    return ElementStore;

  })();

}).call(this);
(function() {


}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.Operation = (function(superClass) {
    extend(Operation, superClass);

    function Operation() {
      return Operation.__super__.constructor.apply(this, arguments);
    }

    Operation.prototype.isPerforming = function() {
      return this.performing === true;
    };

    Operation.prototype.hasPerformed = function() {
      return this.performed === true;
    };

    Operation.prototype.hasSucceeded = function() {
      return this.performed && this.succeeded;
    };

    Operation.prototype.hasFailed = function() {
      return this.performed && !this.succeeded;
    };

    Operation.prototype.getPromise = function() {
      return this.promise != null ? this.promise : this.promise = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.performing = true;
          return _this.perform(function(succeeded, result) {
            _this.succeeded = succeeded;
            _this.performing = false;
            _this.performed = true;
            if (_this.succeeded) {
              return resolve(result);
            } else {
              return reject(result);
            }
          });
        };
      })(this));
    };

    Operation.prototype.perform = function(callback) {
      return callback(false);
    };

    Operation.prototype.release = function() {
      var ref;
      if ((ref = this.promise) != null) {
        if (typeof ref.cancel === "function") {
          ref.cancel();
        }
      }
      this.promise = null;
      this.performing = null;
      this.performed = null;
      return this.succeeded = null;
    };

    Operation.proxyMethod("getPromise().then");

    Operation.proxyMethod("getPromise().catch");

    return Operation;

  })(Trix.BasicObject);

}).call(this);
(function() {
  var hasArrayFrom, hasStringCodePointAt, hasStringFromCodePoint, ucs2decode, ucs2encode,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.UTF16String = (function(superClass) {
    extend(UTF16String, superClass);

    UTF16String.box = function(value) {
      if (value == null) {
        value = "";
      }
      if (value instanceof this) {
        return value;
      } else {
        return this.fromUCS2String(value != null ? value.toString() : void 0);
      }
    };

    UTF16String.fromUCS2String = function(ucs2String) {
      return new this(ucs2String, ucs2decode(ucs2String));
    };

    UTF16String.fromCodepoints = function(codepoints) {
      return new this(ucs2encode(codepoints), codepoints);
    };

    function UTF16String(ucs2String1, codepoints1) {
      this.ucs2String = ucs2String1;
      this.codepoints = codepoints1;
      this.length = this.codepoints.length;
      this.ucs2Length = this.ucs2String.length;
    }

    UTF16String.prototype.offsetToUCS2Offset = function(offset) {
      return ucs2encode(this.codepoints.slice(0, Math.max(0, offset))).length;
    };

    UTF16String.prototype.offsetFromUCS2Offset = function(ucs2Offset) {
      return ucs2decode(this.ucs2String.slice(0, Math.max(0, ucs2Offset))).length;
    };

    UTF16String.prototype.slice = function() {
      var ref;
      return this.constructor.fromCodepoints((ref = this.codepoints).slice.apply(ref, arguments));
    };

    UTF16String.prototype.charAt = function(offset) {
      return this.slice(offset, offset + 1);
    };

    UTF16String.prototype.isEqualTo = function(value) {
      return this.constructor.box(value).ucs2String === this.ucs2String;
    };

    UTF16String.prototype.toJSON = function() {
      return this.ucs2String;
    };

    UTF16String.prototype.getCacheKey = function() {
      return this.ucs2String;
    };

    UTF16String.prototype.toString = function() {
      return this.ucs2String;
    };

    return UTF16String;

  })(Trix.BasicObject);

  hasArrayFrom = (typeof Array.from === "function" ? Array.from("\ud83d\udc7c").length : void 0) === 1;

  hasStringCodePointAt = (typeof " ".codePointAt === "function" ? " ".codePointAt(0) : void 0) != null;

  hasStringFromCodePoint = (typeof String.fromCodePoint === "function" ? String.fromCodePoint(32, 128124) : void 0) === " \ud83d\udc7c";

  if (hasArrayFrom && hasStringCodePointAt) {
    ucs2decode = function(string) {
      return Array.from(string).map(function(char) {
        return char.codePointAt(0);
      });
    };
  } else {
    ucs2decode = function(string) {
      var counter, extra, length, output, value;
      output = [];
      counter = 0;
      length = string.length;
      while (counter < length) {
        value = string.charCodeAt(counter++);
        if ((0xD800 <= value && value <= 0xDBFF) && counter < length) {
          extra = string.charCodeAt(counter++);
          if ((extra & 0xFC00) === 0xDC00) {
            value = ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
          } else {
            counter--;
          }
        }
        output.push(value);
      }
      return output;
    };
  }

  if (hasStringFromCodePoint) {
    ucs2encode = function(array) {
      return String.fromCodePoint.apply(String, array);
    };
  } else {
    ucs2encode = function(array) {
      var characters, output, value;
      characters = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = array.length; i < len; i++) {
          value = array[i];
          output = "";
          if (value > 0xFFFF) {
            value -= 0x10000;
            output += String.fromCharCode(value >>> 10 & 0x3FF | 0xD800);
            value = 0xDC00 | value & 0x3FF;
          }
          results.push(output + String.fromCharCode(value));
        }
        return results;
      })();
      return characters.join("");
    };
  }

}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {
  Trix.config.lang = {
    bold: "Bold",
    bullets: "Bullets",
    byte: "Byte",
    bytes: "Bytes",
    captionPlaceholder: "Type a caption here…",
    code: "Code",
    editCaption: "Edit caption",
    indent: "Increase Level",
    italic: "Italic",
    link: "Link",
    numbers: "Numbers",
    outdent: "Decrease Level",
    quote: "Quote",
    redo: "Redo",
    remove: "Remove",
    strike: "Strikethrough",
    undo: "Undo",
    unlink: "Unlink",
    urlPlaceholder: "Enter a URL…",
    GB: "GB",
    KB: "KB",
    MB: "MB",
    PB: "PB",
    TB: "TB"
  };

}).call(this);
(function() {
  Trix.config.css = {
    classNames: {
      attachment: {
        container: "attachment",
        typePrefix: "attachment-",
        caption: "caption",
        captionEdited: "caption-edited",
        captionEditor: "caption-editor",
        editingCaption: "caption-editing",
        progressBar: "progress",
        removeButton: "remove",
        size: "size"
      }
    }
  };

}).call(this);
(function() {
  var attributes;

  Trix.config.blockAttributes = attributes = {
    "default": {
      tagName: "p",
      parse: false
    },
    bulletList: {
      tagName: "ul",
      parse: false
    },
    bullet: {
      tagName: "li",
      listAttribute: "bulletList",
      excludesAttributes: ["heading1", "heading2", "heading3"],
      test: function(element) {
        return Trix.tagName(element.parentNode) === attributes[this.listAttribute].tagName;
      }
    },
    numberList: {
      tagName: "ol",
      parse: false
    },
    number: {
      tagName: "li",
      listAttribute: "numberList",
      excludesAttributes: ["heading1", "heading2", "heading3"],
      test: function(element) {
        return Trix.tagName(element.parentNode) === attributes[this.listAttribute].tagName;
      }
    },
    heading1: {
      heading: true,
      tagName: "h1",
      excludesAttributes: ["bulletList", "bullet", "numberList", "number"],
      test: function(element) {
        return Trix.tagName(element) === "h1";
      }
    },
    heading2: {
      heading: true,
      tagName: "h2",
      excludesAttributes: ["bulletList", "bullet", "numberList", "number"],
      test: function(element) {
        return Trix.tagName(element) === "h2";
      }
    },
    heading3: {
      heading: true,
      tagName: "h3",
      excludesAttributes: ["bulletList", "bullet", "numberList", "number"],
      test: function(element) {
        return Trix.tagName(element) === "h3";
      }
    },
    attachment: {
      className: "shareitem"
    }
  };

}).call(this);
(function() {
  var lang, sizes;

  lang = Trix.config.lang;

  sizes = [lang.bytes, lang.KB, lang.MB, lang.GB, lang.TB, lang.PB];

  Trix.config.fileSize = {
    prefix: "IEC",
    precision: 2,
    formatter: function(number) {
      var base, exp, humanSize, string, withoutInsignificantZeros;
      switch (number) {
        case 0:
          return "0 " + lang.bytes;
        case 1:
          return "1 " + lang.byte;
        default:
          base = (function() {
            switch (this.prefix) {
              case "SI":
                return 1000;
              case "IEC":
                return 1024;
            }
          }).call(this);
          exp = Math.floor(Math.log(number) / Math.log(base));
          humanSize = number / Math.pow(base, exp);
          string = humanSize.toFixed(this.precision);
          withoutInsignificantZeros = string.replace(/0*$/, "").replace(/\.$/, "");
          return withoutInsignificantZeros + " " + sizes[exp];
      }
    }
  };

}).call(this);
(function() {
  Trix.config.textAttributes = {
    bold: {
      tagName: "b",
      inheritable: true,
      parser: function(element) {
        var style;
        style = window.getComputedStyle(element);
        return (style["fontWeight"] === "bold" || style["fontWeight"] >= 600) && style["fontSize"] === "12px";
      }
    },
    italic: {
      tagName: "i",
      inheritable: true,
      parser: function(element) {
        var style;
        style = window.getComputedStyle(element);
        return style["fontStyle"] === "italic";
      }
    },
    href: {
      groupTagName: "a",
      parser: function(element) {
        var attachmentSelector, link, matchingSelector;
        attachmentSelector = Trix.AttachmentView.attachmentSelector;
        matchingSelector = "a:not(" + attachmentSelector + ")";
        if (link = Trix.findClosestElementFromNode(element, {
          matchingSelector: matchingSelector
        })) {
          return link.getAttribute("href");
        }
      }
    },
    underline: {
      tagName: "u",
      inheritable: true,
      parser: function(element) {
        var style;
        style = window.getComputedStyle(element);
        return /underline/.test(style["textDecoration"]);
      }
    },
    frozen: {
      style: {
        "backgroundColor": "highlight"
      }
    }
  };

}).call(this);
(function() {
  var blockCommentPattern, serializedAttributesAttribute, serializedAttributesSelector, unserializableAttributeNames, unserializableElementSelector;

  unserializableElementSelector = "[data-trix-serialize=false]";

  unserializableAttributeNames = ["contenteditable", "data-trix-id", "data-trix-store-key", "data-trix-mutable"];

  serializedAttributesAttribute = "data-trix-serialized-attributes";

  serializedAttributesSelector = "[" + serializedAttributesAttribute + "]";

  blockCommentPattern = new RegExp("<!--block-->", "g");

  Trix.extend({
    serializers: {
      "application/json": function(serializable) {
        var document;
        if (serializable instanceof Trix.Document) {
          document = serializable;
        } else if (serializable instanceof HTMLElement) {
          document = Trix.Document.fromHTML(serializable.innerHTML);
        } else {
          throw new Error("unserializable object");
        }
        return document.toSerializableDocument().toJSONString();
      },
      "text/html": function(serializable) {
        var attribute, attributes, el, element, i, j, k, l, len, len1, len2, len3, name, ref, ref1, ref2, value;
        if (serializable instanceof Trix.Document) {
          element = Trix.DocumentView.render(serializable);
        } else if (serializable instanceof HTMLElement) {
          element = serializable.cloneNode(true);
        } else {
          throw new Error("unserializable object");
        }
        ref = element.querySelectorAll(unserializableElementSelector);
        for (i = 0, len = ref.length; i < len; i++) {
          el = ref[i];
          el.parentNode.removeChild(el);
        }
        for (j = 0, len1 = unserializableAttributeNames.length; j < len1; j++) {
          attribute = unserializableAttributeNames[j];
          ref1 = element.querySelectorAll("[" + attribute + "]");
          for (k = 0, len2 = ref1.length; k < len2; k++) {
            el = ref1[k];
            el.removeAttribute(attribute);
          }
        }
        ref2 = element.querySelectorAll(serializedAttributesSelector);
        for (l = 0, len3 = ref2.length; l < len3; l++) {
          el = ref2[l];
          try {
            attributes = JSON.parse(el.getAttribute(serializedAttributesAttribute));
            el.removeAttribute(serializedAttributesAttribute);
            for (name in attributes) {
              value = attributes[name];
              el.setAttribute(name, value);
            }
          } catch (_error) {}
        }
        return element.innerHTML.replace(blockCommentPattern, "");
      }
    },
    deserializers: {
      "application/json": function(string) {
        return Trix.Document.fromJSONString(string);
      },
      "text/html": function(string) {
        return Trix.Document.fromHTML(string);
      }
    },
    serializeToContentType: function(serializable, contentType) {
      var serializer;
      if (serializer = Trix.serializers[contentType]) {
        return serializer(serializable);
      } else {
        throw new Error("unknown content type: " + contentType);
      }
    },
    deserializeFromContentType: function(string, contentType) {
      var deserializer;
      if (deserializer = Trix.deserializers[contentType]) {
        return deserializer(string);
      } else {
        throw new Error("unknown content type: " + contentType);
      }
    }
  });

}).call(this);
(function() {
  var lang, makeFragment;

  makeFragment = Trix.makeFragment;

  lang = Trix.config.lang;

  Trix.config.toolbar = {
    content: makeFragment("")
  };

}).call(this);
(function() {
  Trix.config.undoInterval = 5000;

}).call(this);
(function() {


}).call(this);
(function() {
  var cloneFragment;

  cloneFragment = Trix.cloneFragment;

  Trix.registerElement("trix-toolbar", {
    defaultCSS: "%t {\n  white-space: collapse;\n}\n\n%t .dialog {\n  display: none;\n}\n\n%t .dialog.active {\n  display: block;\n}\n\n%t .dialog input.validate:invalid {\n  background-color: #ffdddd;\n}\n\n%t[native] {\n  display: none;\n}",
    createdCallback: function() {
      if (this.innerHTML === "") {
        return this.appendChild(cloneFragment(Trix.config.toolbar.content));
      }
    }
  });

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Trix.ObjectView = (function(superClass) {
    extend(ObjectView, superClass);

    function ObjectView(object1, options1) {
      this.object = object1;
      this.options = options1 != null ? options1 : {};
      this.childViews = [];
      this.rootView = this;
    }

    ObjectView.prototype.getNodes = function() {
      var i, len, node, ref, results;
      if (this.nodes == null) {
        this.nodes = this.createNodes();
      }
      ref = this.nodes;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        results.push(node.cloneNode(true));
      }
      return results;
    };

    ObjectView.prototype.invalidate = function() {
      var ref;
      this.nodes = null;
      return (ref = this.parentView) != null ? ref.invalidate() : void 0;
    };

    ObjectView.prototype.invalidateViewForObject = function(object) {
      var ref;
      return (ref = this.findViewForObject(object)) != null ? ref.invalidate() : void 0;
    };

    ObjectView.prototype.findOrCreateCachedChildView = function(viewClass, object, options) {
      var view;
      if (view = this.getCachedViewForObject(object)) {
        this.recordChildView(view);
      } else {
        view = this.createChildView.apply(this, arguments);
        this.cacheViewForObject(view, object);
      }
      return view;
    };

    ObjectView.prototype.createChildView = function(viewClass, object, options) {
      var view;
      if (options == null) {
        options = {};
      }
      if (object instanceof Trix.ObjectGroup) {
        options.viewClass = viewClass;
        viewClass = Trix.ObjectGroupView;
      }
      view = new viewClass(object, options);
      return this.recordChildView(view);
    };

    ObjectView.prototype.recordChildView = function(view) {
      view.parentView = this;
      view.rootView = this.rootView;
      this.childViews.push(view);
      return view;
    };

    ObjectView.prototype.getAllChildViews = function() {
      var childView, i, len, ref, views;
      views = [];
      ref = this.childViews;
      for (i = 0, len = ref.length; i < len; i++) {
        childView = ref[i];
        views.push(childView);
        views = views.concat(childView.getAllChildViews());
      }
      return views;
    };

    ObjectView.prototype.findElement = function() {
      return this.findElementForObject(this.object);
    };

    ObjectView.prototype.findElementForObject = function(object) {
      var id;
      if (id = object != null ? object.id : void 0) {
        return this.rootView.element.querySelector("[data-trix-id='" + id + "']");
      }
    };

    ObjectView.prototype.findViewForObject = function(object) {
      var i, len, ref, view;
      ref = this.getAllChildViews();
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        if (view.object === object) {
          return view;
        }
      }
    };

    ObjectView.prototype.getViewCache = function() {
      if (this.rootView === this) {
        if (this.isViewCachingEnabled()) {
          return this.viewCache != null ? this.viewCache : this.viewCache = {};
        }
      } else {
        return this.rootView.getViewCache();
      }
    };

    ObjectView.prototype.isViewCachingEnabled = function() {
      return this.shouldCacheViews !== false;
    };

    ObjectView.prototype.enableViewCaching = function() {
      return this.shouldCacheViews = true;
    };

    ObjectView.prototype.disableViewCaching = function() {
      return this.shouldCacheViews = false;
    };

    ObjectView.prototype.getCachedViewForObject = function(object) {
      var ref;
      return (ref = this.getViewCache()) != null ? ref[object.getCacheKey()] : void 0;
    };

    ObjectView.prototype.cacheViewForObject = function(view, object) {
      var ref;
      return (ref = this.getViewCache()) != null ? ref[object.getCacheKey()] = view : void 0;
    };

    ObjectView.prototype.garbageCollectCachedViews = function() {
      var cache, key, objectKeys, results, view, views;
      if (cache = this.getViewCache()) {
        views = this.getAllChildViews().concat(this);
        objectKeys = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = views.length; i < len; i++) {
            view = views[i];
            results.push(view.object.getCacheKey());
          }
          return results;
        })();
        results = [];
        for (key in cache) {
          if (indexOf.call(objectKeys, key) < 0) {
            results.push(delete cache[key]);
          }
        }
        return results;
      }
    };

    return ObjectView;

  })(Trix.BasicObject);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.ObjectGroupView = (function(superClass) {
    extend(ObjectGroupView, superClass);

    function ObjectGroupView() {
      ObjectGroupView.__super__.constructor.apply(this, arguments);
      this.objectGroup = this.object;
      this.viewClass = this.options.viewClass;
      delete this.options.viewClass;
    }

    ObjectGroupView.prototype.getChildViews = function() {
      var i, len, object, ref;
      if (!this.childViews.length) {
        ref = this.objectGroup.getObjects();
        for (i = 0, len = ref.length; i < len; i++) {
          object = ref[i];
          this.findOrCreateCachedChildView(this.viewClass, object, this.options);
        }
      }
      return this.childViews;
    };

    ObjectGroupView.prototype.createNodes = function() {
      var element, i, j, len, len1, node, ref, ref1, view;
      element = this.createContainerElement();
      ref = this.getChildViews();
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        ref1 = view.getNodes();
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          node = ref1[j];
          element.appendChild(node);
        }
      }
      return [element];
    };

    ObjectGroupView.prototype.createContainerElement = function(depth) {
      if (depth == null) {
        depth = this.objectGroup.getDepth();
      }
      return this.getChildViews()[0].createContainerElement(depth);
    };

    return ObjectGroupView;

  })(Trix.ObjectView);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    return Controller;

  })(Trix.BasicObject);

}).call(this);
(function() {
  var defer, findClosestElementFromNode, nodeIsEmptyTextNode, normalizeSpaces, summarizeStringChange,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  defer = Trix.defer, findClosestElementFromNode = Trix.findClosestElementFromNode, nodeIsEmptyTextNode = Trix.nodeIsEmptyTextNode, normalizeSpaces = Trix.normalizeSpaces, summarizeStringChange = Trix.summarizeStringChange;

  Trix.MutationObserver = (function(superClass) {
    var mutableSelector, options;

    extend(MutationObserver, superClass);

    mutableSelector = "[data-trix-mutable]";

    options = {
      attributes: true,
      childList: true,
      characterData: true,
      characterDataOldValue: true,
      subtree: true
    };

    function MutationObserver(element) {
      this.element = element;
      this.didMutate = bind(this.didMutate, this);
      this.observer = new window.MutationObserver(this.didMutate);
      this.start();
    }

    MutationObserver.prototype.start = function() {
      this.reset();
      return this.observer.observe(this.element, options);
    };

    MutationObserver.prototype.stop = function() {
      return this.observer.disconnect();
    };

    MutationObserver.prototype.didMutate = function(mutations) {
      var ref, ref1;
      (ref = this.mutations).push.apply(ref, this.findSignificantMutations(mutations));
      if (this.mutations.length) {
        if ((ref1 = this.delegate) != null) {
          if (typeof ref1.elementDidMutate === "function") {
            ref1.elementDidMutate(this.getMutationSummary());
          }
        }
        return this.reset();
      }
    };

    MutationObserver.prototype.reset = function() {
      return this.mutations = [];
    };

    MutationObserver.prototype.findSignificantMutations = function(mutations) {
      var i, len, mutation, results;
      results = [];
      for (i = 0, len = mutations.length; i < len; i++) {
        mutation = mutations[i];
        if (this.mutationIsSignificant(mutation)) {
          results.push(mutation);
        }
      }
      return results;
    };

    MutationObserver.prototype.mutationIsSignificant = function(mutation) {
      var i, len, node, ref;
      ref = this.nodesModifiedByMutation(mutation);
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        if (this.nodeIsSignificant(node)) {
          return true;
        }
      }
      return false;
    };

    MutationObserver.prototype.nodeIsSignificant = function(node) {
      return node !== this.element && !this.nodeIsMutable(node) && !nodeIsEmptyTextNode(node);
    };

    MutationObserver.prototype.nodeIsMutable = function(node) {
      return findClosestElementFromNode(node, {
        matchingSelector: mutableSelector
      });
    };

    MutationObserver.prototype.nodesModifiedByMutation = function(mutation) {
      var nodes;
      nodes = [];
      switch (mutation.type) {
        case "attributes":
          nodes.push(mutation.target);
          break;
        case "characterData":
          nodes.push(mutation.target.parentNode);
          nodes.push(mutation.target);
          break;
        case "childList":
          nodes.push.apply(nodes, mutation.addedNodes);
          nodes.push.apply(nodes, mutation.removedNodes);
      }
      return nodes;
    };

    MutationObserver.prototype.getMutationSummary = function() {
      return this.getTextMutationSummary();
    };

    MutationObserver.prototype.getTextMutationSummary = function() {
      var added, addition, additions, deleted, deletions, i, len, ref, ref1, summary, textChanges;
      ref = this.getTextChangesFromCharacterData(), additions = ref.additions, deletions = ref.deletions;
      textChanges = this.getTextChangesFromTextNodes();
      ref1 = textChanges.additions;
      for (i = 0, len = ref1.length; i < len; i++) {
        addition = ref1[i];
        if (indexOf.call(additions, addition) < 0) {
          additions.push(addition);
        }
      }
      deletions.push.apply(deletions, textChanges.deletions);
      summary = {};
      if (added = additions.join("")) {
        summary.textAdded = added;
      }
      if (deleted = deletions.join("")) {
        summary.textDeleted = deleted;
      }
      return summary;
    };

    MutationObserver.prototype.getMutationsByType = function(type) {
      var i, len, mutation, ref, results;
      ref = this.mutations;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        mutation = ref[i];
        if (mutation.type === type) {
          results.push(mutation);
        }
      }
      return results;
    };

    MutationObserver.prototype.getTextChangesFromTextNodes = function() {
      var i, index, j, k, len, len1, len2, mutation, node, nodesAdded, nodesRemoved, ref, ref1, ref2;
      nodesAdded = [];
      nodesRemoved = [];
      ref = this.getMutationsByType("childList");
      for (i = 0, len = ref.length; i < len; i++) {
        mutation = ref[i];
        ref1 = mutation.removedNodes;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          node = ref1[j];
          if (node.nodeType === Node.TEXT_NODE) {
            nodesRemoved.push(node);
          }
        }
        ref2 = mutation.addedNodes;
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          node = ref2[k];
          if (node.nodeType === Node.TEXT_NODE) {
            nodesAdded.push(node);
          }
        }
      }
      return {
        additions: (function() {
          var l, len3, ref3, results;
          results = [];
          for (index = l = 0, len3 = nodesAdded.length; l < len3; index = ++l) {
            node = nodesAdded[index];
            if (node.data !== ((ref3 = nodesRemoved[index]) != null ? ref3.data : void 0)) {
              results.push(normalizeSpaces(node.data));
            }
          }
          return results;
        })(),
        deletions: (function() {
          var l, len3, ref3, results;
          results = [];
          for (index = l = 0, len3 = nodesRemoved.length; l < len3; index = ++l) {
            node = nodesRemoved[index];
            if (node.data !== ((ref3 = nodesAdded[index]) != null ? ref3.data : void 0)) {
              results.push(normalizeSpaces(node.data));
            }
          }
          return results;
        })()
      };
    };

    MutationObserver.prototype.getTextChangesFromCharacterData = function() {
      var added, characterMutations, endMutation, newString, oldString, ref, removed, startMutation;
      characterMutations = this.getMutationsByType("characterData");
      if (characterMutations.length) {
        startMutation = characterMutations[0], endMutation = characterMutations[characterMutations.length - 1];
        oldString = normalizeSpaces(startMutation.oldValue);
        newString = normalizeSpaces(endMutation.target.data);
        ref = summarizeStringChange(oldString, newString), added = ref.added, removed = ref.removed;
      }
      return {
        additions: added ? [added] : [],
        deletions: removed ? [removed] : []
      };
    };

    return MutationObserver;

  })(Trix.BasicObject);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.FileVerificationOperation = (function(superClass) {
    extend(FileVerificationOperation, superClass);

    function FileVerificationOperation(file) {
      this.file = file;
    }

    FileVerificationOperation.prototype.perform = function(callback) {
      var reader;
      reader = new FileReader;
      reader.onerror = function() {
        return callback(false);
      };
      reader.onload = (function(_this) {
        return function() {
          reader.onerror = null;
          try {
            reader.abort();
          } catch (_error) {}
          return callback(true, _this.file);
        };
      })(this);
      return reader.readAsArrayBuffer(this.file);
    };

    return FileVerificationOperation;

  })(Trix.Operation);

}).call(this);
(function() {
  var dataTransferIsWritable, defer, extensionForFile, findClosestElementFromNode, findElementFromContainerAndOffset, handleEvent, innerElementIsActive, keyEventIsKeyboardCommand, keyEventIsPasteAndMatchStyleShortcut, keyEventIsWebInspectorShortcut, makeElement, pasteEventIsCrippledSafariHTMLPaste, summarizeStringChange, testTransferData,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  handleEvent = Trix.handleEvent, findClosestElementFromNode = Trix.findClosestElementFromNode, findElementFromContainerAndOffset = Trix.findElementFromContainerAndOffset, defer = Trix.defer, makeElement = Trix.makeElement, innerElementIsActive = Trix.innerElementIsActive, summarizeStringChange = Trix.summarizeStringChange;

  Trix.InputController = (function(superClass) {
    var pastedFileCount;

    extend(InputController, superClass);

    pastedFileCount = 0;

    InputController.keyNames = {
      "8": "backspace",
      "9": "tab",
      "13": "return",
      "37": "left",
      "39": "right",
      "46": "delete",
      "68": "d",
      "72": "h",
      "79": "o"
    };

    function InputController(element1) {
      var eventName;
      this.element = element1;
      this.resetInputSummary();
      this.mutationObserver = new Trix.MutationObserver(this.element);
      this.mutationObserver.delegate = this;
      for (eventName in this.events) {
        handleEvent(eventName, {
          onElement: this.element,
          withCallback: this.handlerFor(eventName),
          inPhase: "capturing"
        });
      }
    }

    InputController.prototype.handlerFor = function(eventName) {
      return (function(_this) {
        return function(event) {
          return _this.handleInput(function() {
            if (!innerElementIsActive(this.element)) {
              this.eventName = eventName;
              return this.events[eventName].call(this, event);
            }
          });
        };
      })(this);
    };

    InputController.prototype.setInputSummary = function(summary) {
      var key, value;
      if (summary == null) {
        summary = {};
      }
      this.inputSummary.eventName = this.eventName;
      for (key in summary) {
        value = summary[key];
        this.inputSummary[key] = value;
      }
      return this.inputSummary;
    };

    InputController.prototype.resetInputSummary = function() {
      return this.inputSummary = {};
    };

    InputController.prototype.editorWillSyncDocumentView = function() {
      return this.mutationObserver.stop();
    };

    InputController.prototype.editorDidSyncDocumentView = function() {
      return this.mutationObserver.start();
    };

    InputController.prototype.requestRender = function() {
      var ref;
      return (ref = this.delegate) != null ? typeof ref.inputControllerDidRequestRender === "function" ? ref.inputControllerDidRequestRender() : void 0 : void 0;
    };

    InputController.prototype.elementDidMutate = function(mutationSummary) {
      if (!this.inputSummary.composing) {
        return this.handleInput(function() {
          var ref;
          if (!this.mutationIsExpected(mutationSummary)) {
            if ((ref = this.responder) != null) {
              ref.replaceHTML(this.element.innerHTML);
            }
          }
          this.resetInputSummary();
          this.requestRender();
          return Trix.selectionChangeObserver.reset();
        });
      }
    };

    InputController.prototype.mutationIsExpected = function(mutationSummary) {
      var unhandledAddition, unhandledDeletion;
      if (this.inputSummary) {
        if (this.inputSummary.preferDocument != null) {
          return this.inputSummary.preferDocument;
        } else {
          unhandledAddition = mutationSummary.textAdded !== this.inputSummary.textAdded;
          unhandledDeletion = (mutationSummary.textDeleted != null) && !this.inputSummary.didDelete;
          return !(unhandledAddition || unhandledDeletion);
        }
      }
    };

    InputController.prototype.attachFiles = function(files) {
      var file, operations;
      operations = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = files.length; i < len; i++) {
          file = files[i];
          results.push(new Trix.FileVerificationOperation(file));
        }
        return results;
      })();
      return Promise.all(operations).then((function(_this) {
        return function(files) {
          return _this.handleInput(function() {
            var i, len, ref, ref1;
            if ((ref = this.delegate) != null) {
              ref.inputControllerWillAttachFiles();
            }
            for (i = 0, len = files.length; i < len; i++) {
              file = files[i];
              if ((ref1 = this.responder) != null) {
                ref1.insertFile(file);
              }
            }
            return this.requestRender();
          });
        };
      })(this));
    };

    InputController.prototype.events = {
      keydown: function(event) {
        var character, context, i, keyName, keys, len, modifier, ref, ref1;
        if (!this.inputSummary.composing) {
          this.resetInputSummary();
        }
        if (keyName = this.constructor.keyNames[event.keyCode]) {
          context = this.keys;
          ref = ["ctrl", "alt", "shift", "meta"];
          for (i = 0, len = ref.length; i < len; i++) {
            modifier = ref[i];
            if (!event[modifier + "Key"]) {
              continue;
            }
            if (modifier === "ctrl") {
              modifier = "control";
            }
            context = context != null ? context[modifier] : void 0;
          }
          if ((context != null ? context[keyName] : void 0) != null) {
            this.setInputSummary({
              keyName: keyName
            });
            Trix.selectionChangeObserver.reset();
            context[keyName].call(this, event);
          }
        }
        if (keyEventIsKeyboardCommand(event)) {
          if (character = String.fromCharCode(event.keyCode).toLowerCase()) {
            keys = (function() {
              var j, len1, ref1, results;
              ref1 = ["alt", "shift"];
              results = [];
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                modifier = ref1[j];
                if (event[modifier + "Key"]) {
                  results.push(modifier);
                }
              }
              return results;
            })();
            keys.push(character);
            if ((ref1 = this.delegate) != null ? ref1.inputControllerDidReceiveKeyboardCommand(keys) : void 0) {
              return event.preventDefault();
            }
          }
        }
      },
      keypress: function(event) {
        var character, ref, ref1;
        if (this.inputSummary.eventName != null) {
          return;
        }
        if ((event.metaKey || event.ctrlKey) && !event.altKey) {
          return;
        }
        if (keyEventIsWebInspectorShortcut(event)) {
          return;
        }
        if (keyEventIsPasteAndMatchStyleShortcut(event)) {
          return;
        }
        if (event.which === null) {
          character = String.fromCharCode(event.keyCode);
        } else if (event.which !== 0 && event.charCode !== 0) {
          character = String.fromCharCode(event.charCode);
        }
        if (character != null) {
          if ((ref = this.delegate) != null) {
            ref.inputControllerWillPerformTyping();
          }
          if ((ref1 = this.responder) != null) {
            ref1.insertString(character);
          }
          return this.setInputSummary({
            textAdded: character,
            didDelete: this.selectionIsExpanded()
          });
        }
      },
      dragenter: function(event) {
        return event.preventDefault();
      },
      dragstart: function(event) {
        var ref, ref1, target;
        target = event.target;
        this.serializeSelectionToDataTransfer(event.dataTransfer);
        this.draggedRange = (ref = this.responder) != null ? ref.getSelectedRange() : void 0;
        return (ref1 = this.delegate) != null ? typeof ref1.inputControllerDidStartDrag === "function" ? ref1.inputControllerDidStartDrag() : void 0 : void 0;
      },
      dragover: function(event) {
        var draggingPoint, ref, ref1;
        if (this.draggedRange || this.canAcceptDataTransfer(event.dataTransfer)) {
          event.preventDefault();
          draggingPoint = {
            x: event.clientX,
            y: event.clientY
          };
          if (draggingPoint.toString() !== ((ref = this.draggingPoint) != null ? ref.toString() : void 0)) {
            this.draggingPoint = draggingPoint;
            return (ref1 = this.delegate) != null ? typeof ref1.inputControllerDidReceiveDragOverPoint === "function" ? ref1.inputControllerDidReceiveDragOverPoint(this.draggingPoint) : void 0 : void 0;
          }
        }
      },
      dragend: function(event) {
        var ref;
        if ((ref = this.delegate) != null) {
          if (typeof ref.inputControllerDidCancelDrag === "function") {
            ref.inputControllerDidCancelDrag();
          }
        }
        this.draggedRange = null;
        return this.draggingPoint = null;
      },
      drop: function(event) {
        var document, documentJSON, files, point, ref, ref1, ref2, ref3, ref4;
        event.preventDefault();
        files = (ref = event.dataTransfer) != null ? ref.files : void 0;
        point = {
          x: event.clientX,
          y: event.clientY
        };
        if ((ref1 = this.responder) != null) {
          ref1.setLocationRangeFromPointRange(point);
        }
        if (files != null ? files.length : void 0) {
          this.attachFiles(files);
        } else if (this.draggedRange) {
          if ((ref2 = this.delegate) != null) {
            ref2.inputControllerWillMoveText();
          }
          if ((ref3 = this.responder) != null) {
            ref3.moveTextFromRange(this.draggedRange);
          }
          this.draggedRange = null;
          this.requestRender();
        } else if (documentJSON = event.dataTransfer.getData("application/x-trix-document")) {
          document = Trix.Document.fromJSONString(documentJSON);
          if ((ref4 = this.responder) != null) {
            ref4.insertDocument(document);
          }
          this.requestRender();
        }
        this.draggedRange = null;
        return this.draggingPoint = null;
      },
      cut: function(event) {
        var ref;
        if (this.serializeSelectionToDataTransfer(event.clipboardData)) {
          event.preventDefault();
        }
        if ((ref = this.delegate) != null) {
          ref.inputControllerWillCutText();
        }
        this.deleteInDirection("backward");
        if (event.defaultPrevented) {
          return this.requestRender();
        }
      },
      copy: function(event) {
        if (this.serializeSelectionToDataTransfer(event.clipboardData)) {
          return event.preventDefault();
        }
      },
      paste: function(event) {
        var extension, file, html, paste, pasteData, ref, ref1, ref10, ref11, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, string;
        paste = (ref = event.clipboardData) != null ? ref : event.testClipboardData;
        if (paste == null) {
          return;
        }
        pasteData = {
          paste: paste
        };
        if (pasteEventIsCrippledSafariHTMLPaste(event)) {
          this.getPastedHTMLUsingHiddenElement((function(_this) {
            return function(html) {
              var ref1, ref2, ref3;
              pasteData.html = html;
              if ((ref1 = _this.delegate) != null) {
                ref1.inputControllerWillPasteText(pasteData);
              }
              if ((ref2 = _this.responder) != null) {
                ref2.insertHTML(html);
              }
              _this.requestRender();
              return (ref3 = _this.delegate) != null ? ref3.inputControllerDidPaste(pasteData) : void 0;
            };
          })(this));
          return;
        }
        if (html = paste.getData("text/html")) {
          pasteData.html = html;
          if ((ref1 = this.delegate) != null) {
            ref1.inputControllerWillPasteText(pasteData);
          }
          if ((ref2 = this.responder) != null) {
            ref2.insertHTML(html);
          }
          this.requestRender();
          if ((ref3 = this.delegate) != null) {
            ref3.inputControllerDidPaste(pasteData);
          }
        } else if (string = paste.getData("text/plain")) {
          pasteData.string = string;
          this.setInputSummary({
            textAdded: string,
            didDelete: this.selectionIsExpanded()
          });
          if ((ref4 = this.delegate) != null) {
            ref4.inputControllerWillPasteText(pasteData);
          }
          if ((ref5 = this.responder) != null) {
            ref5.insertString(string);
          }
          this.requestRender();
          if ((ref6 = this.delegate) != null) {
            ref6.inputControllerDidPaste(pasteData);
          }
        } else if (indexOf.call(paste.types, "Files") >= 0) {
          if (file = (ref7 = paste.items) != null ? (ref8 = ref7[0]) != null ? typeof ref8.getAsFile === "function" ? ref8.getAsFile() : void 0 : void 0 : void 0) {
            if (!file.name && (extension = extensionForFile(file))) {
              file.name = "pasted-file-" + (++pastedFileCount) + "." + extension;
            }
            pasteData.file = file;
            if ((ref9 = this.delegate) != null) {
              ref9.inputControllerWillAttachFiles();
            }
            if ((ref10 = this.responder) != null) {
              ref10.insertFile(file);
            }
            this.requestRender();
            if ((ref11 = this.delegate) != null) {
              ref11.inputControllerDidPaste(pasteData);
            }
          }
        }
        return event.preventDefault();
      },
      compositionstart: function(event) {
        var ref, textAdded;
        if (!this.selectionIsExpanded()) {
          if (!(this.inputSummary.eventName === "keypress" && this.inputSummary.textAdded)) {
            textAdded = (ref = this.responder) != null ? ref.insertPlaceholder() : void 0;
            this.setInputSummary({
              textAdded: textAdded
            });
            this.requestRender();
          }
        }
        return this.setInputSummary({
          composing: true,
          compositionStart: event.data
        });
      },
      compositionupdate: function(event) {
        var ref, ref1;
        if ((ref = this.responder) != null ? ref.selectPlaceholder() : void 0) {
          if ((ref1 = this.responder) != null) {
            ref1.forgetPlaceholder();
          }
        }
        return this.setInputSummary({
          composing: true,
          compositionUpdate: event.data
        });
      },
      compositionend: function(event) {
        var added, compositionStart, data, ref, ref1, ref2, ref3, ref4, removed;
        if ((ref = this.responder) != null ? ref.selectPlaceholder() : void 0) {
          if ((ref1 = this.responder) != null) {
            ref1.forgetPlaceholder();
          }
        }
        compositionStart = this.inputSummary.compositionStart;
        data = event.data;
        if ((compositionStart != null) && (data != null) && compositionStart !== data) {
          if ((ref2 = this.delegate) != null) {
            ref2.inputControllerWillPerformTyping();
          }
          if ((ref3 = this.responder) != null) {
            ref3.insertString(data);
          }
          ref4 = summarizeStringChange(compositionStart, data), added = ref4.added, removed = ref4.removed;
          return this.setInputSummary({
            composing: false,
            textAdded: added,
            didDelete: Boolean(removed)
          });
        }
      },
      input: function(event) {
        return event.stopPropagation();
      }
    };

    InputController.prototype.keys = {
      backspace: function(event) {
        var ref;
        if ((ref = this.delegate) != null) {
          ref.inputControllerWillPerformTyping();
        }
        return this.deleteInDirection("backward", event);
      },
      "delete": function(event) {
        var ref;
        if ((ref = this.delegate) != null) {
          ref.inputControllerWillPerformTyping();
        }
        return this.deleteInDirection("forward", event);
      },
      "return": function(event) {
        var ref, ref1;
        this.setInputSummary({
          preferDocument: true
        });
        if ((ref = this.delegate) != null) {
          ref.inputControllerWillPerformTyping();
        }
        return (ref1 = this.responder) != null ? ref1.insertLineBreak() : void 0;
      },
      tab: function(event) {
        var ref, ref1;
        if ((ref = this.responder) != null ? ref.canIncreaseBlockAttributeLevel() : void 0) {
          if ((ref1 = this.responder) != null) {
            ref1.increaseBlockAttributeLevel();
          }
          this.requestRender();
          return event.preventDefault();
        }
      },
      left: function(event) {
        var ref;
        if (this.selectionIsInCursorTarget()) {
          event.preventDefault();
          return (ref = this.responder) != null ? ref.moveCursorInDirection("backward") : void 0;
        }
      },
      right: function(event) {
        var ref;
        if (this.selectionIsInCursorTarget()) {
          event.preventDefault();
          return (ref = this.responder) != null ? ref.moveCursorInDirection("forward") : void 0;
        }
      },
      control: {
        d: function(event) {
          var ref;
          if ((ref = this.delegate) != null) {
            ref.inputControllerWillPerformTyping();
          }
          return this.deleteInDirection("forward", event);
        },
        h: function(event) {
          var ref;
          if ((ref = this.delegate) != null) {
            ref.inputControllerWillPerformTyping();
          }
          return this.deleteInDirection("backward", event);
        },
        o: function(event) {
          var ref, ref1;
          event.preventDefault();
          if ((ref = this.delegate) != null) {
            ref.inputControllerWillPerformTyping();
          }
          if ((ref1 = this.responder) != null) {
            ref1.insertString("\n", {
              updatePosition: false
            });
          }
          return this.requestRender();
        }
      },
      shift: {
        "return": function(event) {
          var ref, ref1;
          if ((ref = this.delegate) != null) {
            ref.inputControllerWillPerformTyping();
          }
          return (ref1 = this.responder) != null ? ref1.insertString("\n") : void 0;
        },
        tab: function(event) {
          var ref, ref1;
          if ((ref = this.responder) != null ? ref.canDecreaseBlockAttributeLevel() : void 0) {
            if ((ref1 = this.responder) != null) {
              ref1.decreaseBlockAttributeLevel();
            }
            this.requestRender();
            return event.preventDefault();
          }
        },
        left: function(event) {
          if (this.selectionIsInCursorTarget()) {
            event.preventDefault();
            return this.expandSelectionInDirection("backward");
          }
        },
        right: function(event) {
          if (this.selectionIsInCursorTarget()) {
            event.preventDefault();
            return this.expandSelectionInDirection("forward");
          }
        }
      },
      alt: {
        backspace: function(event) {
          var ref;
          this.setInputSummary({
            preferDocument: false
          });
          return (ref = this.delegate) != null ? ref.inputControllerWillPerformTyping() : void 0;
        }
      },
      meta: {
        backspace: function(event) {
          var ref;
          this.setInputSummary({
            preferDocument: false
          });
          return (ref = this.delegate) != null ? ref.inputControllerWillPerformTyping() : void 0;
        }
      }
    };

    InputController.prototype.handleInput = function(callback) {
      var ref, ref1;
      try {
        if ((ref = this.delegate) != null) {
          ref.inputControllerWillHandleInput();
        }
        return callback.call(this);
      } finally {
        if ((ref1 = this.delegate) != null) {
          ref1.inputControllerDidHandleInput();
        }
      }
    };

    InputController.prototype.deleteInDirection = function(direction, event) {
      var ref;
      if (((ref = this.responder) != null ? ref.deleteInDirection(direction) : void 0) === false) {
        if (event) {
          event.preventDefault();
          return this.requestRender();
        }
      } else {
        return this.setInputSummary({
          didDelete: true
        });
      }
    };

    InputController.prototype.serializeSelectionToDataTransfer = function(dataTransfer) {
      var document, ref;
      if (!dataTransferIsWritable(dataTransfer)) {
        return;
      }
      document = (ref = this.responder) != null ? ref.getSelectedDocument().toSerializableDocument() : void 0;
      dataTransfer.setData("application/x-trix-document", JSON.stringify(document));
      dataTransfer.setData("text/html", Trix.DocumentView.render(document).innerHTML);
      dataTransfer.setData("text/plain", document.toString().replace(/\n$/, ""));
      return true;
    };

    InputController.prototype.canAcceptDataTransfer = function(dataTransfer) {
      var i, len, ref, ref1, type, types;
      types = {};
      ref1 = (ref = dataTransfer != null ? dataTransfer.types : void 0) != null ? ref : [];
      for (i = 0, len = ref1.length; i < len; i++) {
        type = ref1[i];
        types[type] = true;
      }
      return types["Files"] || types["application/x-trix-document"] || types["text/html"] || types["text/plain"];
    };

    InputController.prototype.getPastedHTMLUsingHiddenElement = function(callback) {
      var element, ref, selectedRange, style;
      selectedRange = (ref = this.responder) != null ? ref.getSelectedRange() : void 0;
      style = {
        position: "absolute",
        left: window.pageXOffset + "px",
        top: window.pageYOffset + "px",
        opacity: 0
      };
      element = makeElement({
        style: style,
        tagName: "div",
        editable: true
      });
      document.body.appendChild(element);
      element.focus();
      return requestAnimationFrame((function(_this) {
        return function() {
          var html, ref1;
          html = element.innerHTML;
          document.body.removeChild(element);
          if ((ref1 = _this.responder) != null) {
            ref1.setSelectedRange(selectedRange);
          }
          return callback(html);
        };
      })(this));
    };

    InputController.proxyMethod("responder?.expandSelectionInDirection");

    InputController.proxyMethod("responder?.selectionIsInCursorTarget");

    InputController.proxyMethod("responder?.selectionIsExpanded");

    return InputController;

  })(Trix.BasicObject);

  extensionForFile = function(file) {
    var ref, ref1;
    return (ref = file.type) != null ? (ref1 = ref.match(/\/(\w+)$/)) != null ? ref1[1] : void 0 : void 0;
  };

  keyEventIsWebInspectorShortcut = function(event) {
    return event.metaKey && event.altKey && !event.shiftKey && event.keyCode === 94;
  };

  keyEventIsPasteAndMatchStyleShortcut = function(event) {
    return event.metaKey && event.altKey && event.shiftKey && event.keyCode === 9674;
  };

  keyEventIsKeyboardCommand = function(event) {
    if (/Mac|^iP/.test(navigator.platform)) {
      return event.metaKey;
    } else {
      return event.ctrlKey;
    }
  };

  pasteEventIsCrippledSafariHTMLPaste = function(event) {
    var ref, types;
    if (types = (ref = event.clipboardData) != null ? ref.types : void 0) {
      return indexOf.call(types, "text/html") < 0 && (indexOf.call(types, "com.apple.webarchive") >= 0 || indexOf.call(types, "com.apple.flat-rtfd") >= 0);
    }
  };

  testTransferData = {
    "application/x-trix-feature-detection": "test"
  };

  dataTransferIsWritable = function(dataTransfer) {
    var key, value;
    if ((dataTransfer != null ? dataTransfer.setData : void 0) == null) {
      return;
    }
    for (key in testTransferData) {
      value = testTransferData[key];
      dataTransfer.setData(key, value);
      if (dataTransfer.getData(key) !== value) {
        return;
      }
    }
    return true;
  };

}).call(this);
(function() {
  var classNames, handleEvent, keyNames, lang, makeElement, tagName,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  handleEvent = Trix.handleEvent, makeElement = Trix.makeElement, tagName = Trix.tagName;

  keyNames = Trix.InputController.keyNames;

  lang = Trix.config.lang;

  classNames = Trix.config.css.classNames;

  Trix.AttachmentEditorController = (function(superClass) {
    var undoable;

    extend(AttachmentEditorController, superClass);

    function AttachmentEditorController(attachment, element, container) {
      this.attachment = attachment;
      this.element = element;
      this.container = container;
      this.uninstall = bind(this.uninstall, this);
      this.didClickRemoveButton = bind(this.didClickRemoveButton, this);
      if (tagName(this.element) === "a") {
        this.element = this.element.firstChild;
      }
      this.install();
    }

    undoable = function(fn) {
      return function() {
        var commands;
        commands = fn.apply(this, arguments);
        commands["do"]();
        if (this.undos == null) {
          this.undos = [];
        }
        return this.undos.push(commands.undo);
      };
    };

    AttachmentEditorController.prototype.install = function() {
      this.makeElementMutable();
      return this.addRemoveButton();
    };

    AttachmentEditorController.prototype.makeElementMutable = undoable(function() {
      return {
        "do": (function(_this) {
          return function() {
            return _this.element.dataset.trixMutable = true;
          };
        })(this),
        undo: (function(_this) {
          return function() {
            return delete _this.element.dataset.trixMutable;
          };
        })(this)
      };
    });

    AttachmentEditorController.prototype.addRemoveButton = undoable(function() {
      var removeButton;
      removeButton = makeElement({
        tagName: "a",
        textContent: lang.remove,
        className: classNames.attachment.removeButton,
        attributes: {
          href: "#",
          title: lang.remove
        }
      });
      handleEvent("click", {
        onElement: removeButton,
        withCallback: this.didClickRemoveButton
      });
      return {
        "do": (function(_this) {
          return function() {
            return _this.element.appendChild(removeButton);
          };
        })(this),
        undo: (function(_this) {
          return function() {
            return _this.element.removeChild(removeButton);
          };
        })(this)
      };
    });

    AttachmentEditorController.prototype.didClickRemoveButton = function(event) {
      var ref;
      event.preventDefault();
      event.stopPropagation();
      return (ref = this.delegate) != null ? ref.attachmentEditorDidRequestRemovalOfAttachment(this.attachment) : void 0;
    };

    AttachmentEditorController.prototype.uninstall = function() {
      var ref, undo;
      while (undo = this.undos.pop()) {
        undo();
      }
      return (ref = this.delegate) != null ? ref.didUninstallAttachmentEditor(this) : void 0;
    };

    return AttachmentEditorController;

  })(Trix.BasicObject);

}).call(this);
(function() {
  var MimeTypes, classNames, htmlContainsTagName, makeElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  makeElement = Trix.makeElement;

  classNames = Trix.config.css.classNames;

  MimeTypes = require("mimetypes");

  Trix.AttachmentView = (function(superClass) {
    extend(AttachmentView, superClass);

    AttachmentView.attachmentSelector = "[data-rel=attachment]";

    function AttachmentView() {
      AttachmentView.__super__.constructor.apply(this, arguments);
      this.attachment = this.object;
      this.attachment.uploadProgressDelegate = this;
    }

    AttachmentView.prototype.createContentNodes = function() {
      var icon, mimeType, title;
      mimeType = this.attachment.getContentType();
      icon = makeElement({
        tagName: "img",
        attributes: {
          "class": "fileicon mrm",
          src: MimeTypes.iconForMimeType(mimeType)
        }
      });
      title = makeElement({
        tagName: "a",
        textContent: this.attachment.getFilename(),
        attributes: {
          "class": "title",
          "data-href": this.attachment.getAttribute("url")
        }
      });
      if (MimeTypes.shouldOpenInBrowser(mimeType)) {
        title.setAttribute("target", "_blank");
      } else {
        title.setAttribute("data-mimetype", mimeType);
        title.setAttribute("download", this.attachment.getFilename());
      }
      return [icon, title];
    };

    AttachmentView.prototype.createNodes = function() {
      var comment, data, i, key, len, node, ref, shareItem, value, wrapper;
      wrapper = makeElement({
        tagName: "div",
        attributes: {
          "class": "attachment-wrapper",
          contenteditable: false
        }
      });
      comment = document.createComment("block");
      wrapper.appendChild(comment);
      shareItem = makeElement({
        tagName: "div",
        attributes: {
          "class": this.getClassName()
        },
        data: {
          eid: this.attachment.getAttribute("eid"),
          mimeType: this.attachment.getContentType(),
          rel: "attachment"
        }
      });
      ref = this.createContentNodes();
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        shareItem.appendChild(node);
      }
      data = {
        trixId: this.attachment.id
      };
      if (this.attachment.isPending()) {
        this.progressElement = makeElement({
          tagName: "progress",
          attributes: {
            "class": classNames.attachment.progressBar,
            value: this.attachment.getUploadProgress(),
            max: 100
          },
          data: {
            trixMutable: true,
            trixStoreKey: this.attachment.getCacheKey("progressElement")
          }
        });
        shareItem.appendChild(this.progressElement);
        data.trixSerialize = false;
      }
      for (key in data) {
        value = data[key];
        shareItem.dataset[key] = value;
      }
      wrapper.appendChild(shareItem);
      return [wrapper];
    };

    AttachmentView.prototype.getClassName = function() {
      var names;
      names = [Trix.config.blockAttributes.attachment.className, this.attachment.isPreviewable() ? "image" : "file"];
      return names.join(" ");
    };

    AttachmentView.prototype.getHref = function() {
      if (!htmlContainsTagName(this.attachment.getContent(), "a")) {
        return this.attachment.getHref();
      }
    };

    AttachmentView.prototype.createCursorTarget = function() {
      return makeElement({
        tagName: "span",
        textContent: Trix.ZERO_WIDTH_SPACE,
        data: {
          trixCursorTarget: true,
          trixSerialize: false
        }
      });
    };

    AttachmentView.prototype.findProgressElement = function() {
      var ref;
      return (ref = this.findElement()) != null ? ref.querySelector("progress") : void 0;
    };

    AttachmentView.prototype.attachmentDidChangeUploadProgress = function() {
      var ref, value;
      value = this.attachment.getUploadProgress();
      return (ref = this.findProgressElement()) != null ? ref.value = value : void 0;
    };

    return AttachmentView;

  })(Trix.ObjectView);

  htmlContainsTagName = function(html, tagName) {
    var div;
    div = makeElement("div");
    div.innerHTML = html != null ? html : "";
    return div.querySelector(tagName);
  };

}).call(this);
(function() {
  var defer, makeElement, measureElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  defer = Trix.defer, makeElement = Trix.makeElement, measureElement = Trix.measureElement;

  Trix.PreviewableAttachmentView = (function(superClass) {
    extend(PreviewableAttachmentView, superClass);

    function PreviewableAttachmentView() {
      PreviewableAttachmentView.__super__.constructor.apply(this, arguments);
      this.attachment.previewDelegate = this;
    }

    PreviewableAttachmentView.prototype.createContentNodes = function() {
      this.image = makeElement({
        tagName: "img",
        attributes: {
          src: ""
        },
        data: {
          trixMutable: true,
          trixStoreKey: this.attachment.getCacheKey("imageElement")
        }
      });
      this.refresh(this.image);
      return [this.image];
    };

    PreviewableAttachmentView.prototype.refresh = function(image) {
      var ref;
      if (image == null) {
        image = (ref = this.findElement()) != null ? ref.querySelector("img") : void 0;
      }
      if (image) {
        return this.updateAttributesForImage(image);
      }
    };

    PreviewableAttachmentView.prototype.updateAttributesForImage = function(image) {
      var height, preloadedURL, serializedAttributes, url, width;
      url = this.attachment.getURL();
      preloadedURL = this.attachment.getPreloadedURL();
      image.src = preloadedURL || url;
      if (preloadedURL === url) {
        image.removeAttribute("data-trix-serialized-attributes");
      } else {
        serializedAttributes = JSON.stringify({
          src: url
        });
        image.setAttribute("data-trix-serialized-attributes", serializedAttributes);
      }
      width = this.attachment.getWidth();
      height = this.attachment.getHeight();
      if (width != null) {
        image.width = width;
      }
      if (height != null) {
        return image.height = height;
      }
    };

    PreviewableAttachmentView.prototype.attachmentDidPreload = function() {
      this.refresh(this.image);
      return this.refresh();
    };

    return PreviewableAttachmentView;

  })(Trix.AttachmentView);

}).call(this);
(function() {
  var findInnerElement, makeElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  makeElement = Trix.makeElement, findInnerElement = Trix.findInnerElement;

  Trix.PieceView = (function(superClass) {
    var preserveSpaces;

    extend(PieceView, superClass);

    function PieceView() {
      PieceView.__super__.constructor.apply(this, arguments);
      this.piece = this.object;
      this.attributes = this.piece.getAttributes();
      this.textConfig = this.options.textConfig;
      this.string = this.piece.toString();
    }

    PieceView.prototype.createNodes = function() {
      var element, i, innerElement, len, node, nodes;
      nodes = this.createStringNodes();
      if (element = this.createElement()) {
        innerElement = findInnerElement(element);
        for (i = 0, len = nodes.length; i < len; i++) {
          node = nodes[i];
          innerElement.appendChild(node);
        }
        nodes = [element];
      }
      return nodes;
    };

    PieceView.prototype.createStringNodes = function() {
      var element, i, index, len, length, node, nodes, ref, ref1, substring;
      if ((ref = this.textConfig) != null ? ref.plaintext : void 0) {
        return [document.createTextNode(this.string)];
      } else {
        nodes = [];
        ref1 = this.string.split("\n");
        for (index = i = 0, len = ref1.length; i < len; index = ++i) {
          substring = ref1[index];
          if (index > 0) {
            element = makeElement("br");
            nodes.push(element);
          }
          if (length = substring.length) {
            node = document.createTextNode(preserveSpaces(substring));
            nodes.push(node);
          }
        }
        return nodes;
      }
    };

    PieceView.prototype.createElement = function() {
      var config, element, innerElement, key, pendingElement, ref, styles, value;
      for (key in this.attributes) {
        if (!(config = Trix.config.textAttributes[key])) {
          continue;
        }
        if (config.tagName) {
          pendingElement = makeElement(config.tagName);
          if (innerElement) {
            innerElement.appendChild(pendingElement);
            innerElement = pendingElement;
          } else {
            element = innerElement = pendingElement;
          }
        }
        if (config.style) {
          if (styles) {
            ref = config.style;
            for (key in ref) {
              value = ref[key];
              styles[key] = value;
            }
          } else {
            styles = config.style;
          }
        }
      }
      if (styles) {
        if (element == null) {
          element = makeElement("span");
        }
        for (key in styles) {
          value = styles[key];
          element.style[key] = value;
        }
      }
      return element;
    };

    PieceView.prototype.createContainerElement = function() {
      var attributes, config, key, ref, value;
      ref = this.attributes;
      for (key in ref) {
        value = ref[key];
        if (config = Trix.config.textAttributes[key]) {
          if (config.groupTagName) {
            attributes = {};
            attributes[key] = value;
            return makeElement(config.groupTagName, attributes);
          }
        }
      }
    };

    preserveSpaces = function(string) {
      var nbsp;
      nbsp = Trix.NON_BREAKING_SPACE;
      return string.replace(/\ $/, nbsp).replace(/(\S)\ {3}(\S)/g, "$1 " + nbsp + " $2").replace(/\ {2}/g, nbsp + " ").replace(/\ {2}/g, " " + nbsp).replace(/^\ /, nbsp);
    };

    return PieceView;

  })(Trix.ObjectView);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.TextView = (function(superClass) {
    extend(TextView, superClass);

    function TextView() {
      TextView.__super__.constructor.apply(this, arguments);
      this.text = this.object;
      this.textConfig = this.options.textConfig;
    }

    TextView.prototype.createNodes = function() {
      var i, len, nodes, object, objects, piece, pieces, view;
      nodes = [];
      pieces = (function() {
        var i, len, ref, results;
        ref = this.text.getPieces();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          piece = ref[i];
          if (!piece.hasAttribute("blockBreak")) {
            results.push(piece);
          }
        }
        return results;
      }).call(this);
      objects = Trix.ObjectGroup.groupObjects(pieces);
      for (i = 0, len = objects.length; i < len; i++) {
        object = objects[i];
        view = this.findOrCreateCachedChildView(Trix.PieceView, object, {
          textConfig: this.textConfig
        });
        nodes.push.apply(nodes, view.getNodes());
      }
      return nodes;
    };

    return TextView;

  })(Trix.ObjectView);

}).call(this);
(function() {
  var makeElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  makeElement = Trix.makeElement;

  Trix.BlockView = (function(superClass) {
    extend(BlockView, superClass);

    function BlockView() {
      BlockView.__super__.constructor.apply(this, arguments);
      this.block = this.object;
      this.attributes = this.block.getAttributes();
    }

    BlockView.prototype.createNodes = function() {
      var comment, element, i, len, node, nodes, ref, textConfig, textView;
      if (this.block.hasAttachment()) {
        return this.createAttachmentNodes();
      }
      comment = document.createComment("block");
      nodes = [comment];
      if (this.block.isEmpty()) {
        nodes.push(makeElement("br"));
      } else {
        textConfig = (ref = Trix.config.blockAttributes[this.block.getLastAttribute()]) != null ? ref.text : void 0;
        textView = this.findOrCreateCachedChildView(Trix.TextView, this.block.text, {
          textConfig: textConfig
        });
        nodes.push.apply(nodes, textView.getNodes());
        if (this.shouldAddExtraNewlineElement()) {
          nodes.push(makeElement("br"));
        }
      }
      if (this.attributes.length) {
        return nodes;
      } else {
        element = makeElement(Trix.config.blockAttributes["default"].tagName);
        for (i = 0, len = nodes.length; i < len; i++) {
          node = nodes[i];
          element.appendChild(node);
        }
        return [element];
      }
    };

    BlockView.prototype.createAttachmentNodes = function() {
      var attachment, constructor, view;
      attachment = this.block.getAttachment();
      constructor = attachment.isPreviewable() ? Trix.PreviewableAttachmentView : Trix.AttachmentView;
      view = this.findOrCreateCachedChildView(constructor, attachment);
      return view.getNodes();
    };

    BlockView.prototype.createContainerElement = function(depth) {
      var attribute, config;
      attribute = this.attributes[depth];
      config = Trix.config.blockAttributes[attribute];
      return makeElement(config.tagName);
    };

    BlockView.prototype.shouldAddExtraNewlineElement = function() {
      return /\n\n$/.test(this.block.toString());
    };

    return BlockView;

  })(Trix.ObjectView);

}).call(this);
(function() {
  var defer, makeElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  defer = Trix.defer, makeElement = Trix.makeElement;

  Trix.DocumentView = (function(superClass) {
    var elementsHaveEqualHTML, findStoredElements, ignoreSpaces;

    extend(DocumentView, superClass);

    DocumentView.render = function(document) {
      var element, view;
      element = makeElement("div");
      view = new this(document, {
        element: element
      });
      view.render();
      view.sync();
      return element;
    };

    function DocumentView() {
      DocumentView.__super__.constructor.apply(this, arguments);
      this.element = this.options.element;
      this.elementStore = new Trix.ElementStore;
      this.setDocument(this.object);
    }

    DocumentView.prototype.setDocument = function(document) {
      if (!document.isEqualTo(this.document)) {
        return this.document = this.object = document;
      }
    };

    DocumentView.prototype.render = function() {
      var i, len, node, object, objects, results, view;
      this.childViews = [];
      this.shadowElement = makeElement("div");
      if (!this.document.isEmpty()) {
        objects = Trix.ObjectGroup.groupObjects(this.document.getBlocks(), {
          asTree: true
        });
        results = [];
        for (i = 0, len = objects.length; i < len; i++) {
          object = objects[i];
          view = this.findOrCreateCachedChildView(Trix.BlockView, object);
          results.push((function() {
            var j, len1, ref, results1;
            ref = view.getNodes();
            results1 = [];
            for (j = 0, len1 = ref.length; j < len1; j++) {
              node = ref[j];
              results1.push(this.shadowElement.appendChild(node));
            }
            return results1;
          }).call(this));
        }
        return results;
      }
    };

    DocumentView.prototype.isSynced = function() {
      return elementsHaveEqualHTML(this.shadowElement, this.element);
    };

    DocumentView.prototype.sync = function() {
      var fragment;
      fragment = this.createDocumentFragmentForSync();
      while (this.element.lastChild) {
        this.element.removeChild(this.element.lastChild);
      }
      this.element.appendChild(fragment);
      return this.didSync();
    };

    DocumentView.prototype.didSync = function() {
      this.elementStore.reset(findStoredElements(this.element));
      return defer((function(_this) {
        return function() {
          return _this.garbageCollectCachedViews();
        };
      })(this));
    };

    DocumentView.prototype.createDocumentFragmentForSync = function() {
      var element, fragment, i, j, len, len1, node, ref, ref1, storedElement;
      fragment = document.createDocumentFragment();
      ref = this.shadowElement.childNodes;
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        fragment.appendChild(node.cloneNode(true));
      }
      ref1 = findStoredElements(fragment);
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        element = ref1[j];
        if (storedElement = this.elementStore.remove(element)) {
          element.parentNode.replaceChild(storedElement, element);
        }
      }
      return fragment;
    };

    findStoredElements = function(element) {
      return element.querySelectorAll("[data-trix-store-key]");
    };

    elementsHaveEqualHTML = function(element, otherElement) {
      return ignoreSpaces(element.innerHTML) === ignoreSpaces(otherElement.innerHTML);
    };

    ignoreSpaces = function(html) {
      return html.replace(/&nbsp;/g, " ");
    };

    return DocumentView;

  })(Trix.ObjectView);

}).call(this);
(function() {
  var attachmentSelector, defer, findClosestElementFromNode, handleEvent, innerElementIsActive, tagName,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  handleEvent = Trix.handleEvent, tagName = Trix.tagName, findClosestElementFromNode = Trix.findClosestElementFromNode, innerElementIsActive = Trix.innerElementIsActive, defer = Trix.defer;

  attachmentSelector = Trix.AttachmentView.attachmentSelector;

  Trix.CompositionController = (function(superClass) {
    extend(CompositionController, superClass);

    function CompositionController(element1, composition) {
      this.element = element1;
      this.composition = composition;
      this.didClickAttachment = bind(this.didClickAttachment, this);
      this.didBlur = bind(this.didBlur, this);
      this.didFocus = bind(this.didFocus, this);
      this.documentView = new Trix.DocumentView(this.composition.document, {
        element: this.element
      });
      handleEvent("focus", {
        onElement: this.element,
        withCallback: this.didFocus
      });
      handleEvent("blur", {
        onElement: this.element,
        withCallback: this.didBlur
      });
      handleEvent("click", {
        onElement: this.element,
        matchingSelector: "a[contenteditable=false]",
        preventDefault: true
      });
      handleEvent("mousedown", {
        onElement: this.element,
        matchingSelector: attachmentSelector,
        withCallback: this.didClickAttachment
      });
      handleEvent("click", {
        onElement: this.element,
        matchingSelector: "a" + attachmentSelector,
        preventDefault: true
      });
    }

    CompositionController.prototype.didFocus = function(event) {
      var ref;
      if (!this.focused) {
        this.focused = true;
        return (ref = this.delegate) != null ? typeof ref.compositionControllerDidFocus === "function" ? ref.compositionControllerDidFocus() : void 0 : void 0;
      }
    };

    CompositionController.prototype.didBlur = function(event) {
      return defer((function(_this) {
        return function() {
          var ref;
          if (!innerElementIsActive(_this.element)) {
            _this.focused = null;
            return (ref = _this.delegate) != null ? typeof ref.compositionControllerDidBlur === "function" ? ref.compositionControllerDidBlur() : void 0 : void 0;
          }
        };
      })(this));
    };

    CompositionController.prototype.didClickAttachment = function(event, target) {
      var attachment, ref;
      attachment = this.findAttachmentForElement(target);
      return (ref = this.delegate) != null ? typeof ref.compositionControllerDidSelectAttachment === "function" ? ref.compositionControllerDidSelectAttachment(attachment) : void 0 : void 0;
    };

    CompositionController.prototype.render = function() {
      var ref, ref1, ref2;
      if (this.revision !== this.composition.revision) {
        this.documentView.setDocument(this.composition.document);
        this.documentView.render();
        this.revision = this.composition.revision;
      }
      if (!this.documentView.isSynced()) {
        if ((ref = this.delegate) != null) {
          if (typeof ref.compositionControllerWillSyncDocumentView === "function") {
            ref.compositionControllerWillSyncDocumentView();
          }
        }
        this.documentView.sync();
        this.reinstallAttachmentEditor();
        if ((ref1 = this.delegate) != null) {
          if (typeof ref1.compositionControllerDidSyncDocumentView === "function") {
            ref1.compositionControllerDidSyncDocumentView();
          }
        }
      }
      return (ref2 = this.delegate) != null ? typeof ref2.compositionControllerDidRender === "function" ? ref2.compositionControllerDidRender() : void 0 : void 0;
    };

    CompositionController.prototype.rerenderViewForObject = function(object) {
      this.documentView.invalidateViewForObject(object);
      return this.render();
    };

    CompositionController.prototype.isViewCachingEnabled = function() {
      return this.documentView.isViewCachingEnabled();
    };

    CompositionController.prototype.enableViewCaching = function() {
      return this.documentView.enableViewCaching();
    };

    CompositionController.prototype.disableViewCaching = function() {
      return this.documentView.disableViewCaching();
    };

    CompositionController.prototype.refreshViewCache = function() {
      return this.documentView.garbageCollectCachedViews();
    };

    CompositionController.prototype.installAttachmentEditorForAttachment = function(attachment) {
      var element, ref;
      if (((ref = this.attachmentEditor) != null ? ref.attachment : void 0) === attachment) {
        return;
      }
      if (!(element = this.documentView.findElementForObject(attachment))) {
        return;
      }
      this.uninstallAttachmentEditor();
      this.attachmentEditor = new Trix.AttachmentEditorController(attachment, element, this.element);
      return this.attachmentEditor.delegate = this;
    };

    CompositionController.prototype.uninstallAttachmentEditor = function() {
      var ref;
      return (ref = this.attachmentEditor) != null ? ref.uninstall() : void 0;
    };

    CompositionController.prototype.reinstallAttachmentEditor = function() {
      var attachment;
      if (this.attachmentEditor) {
        attachment = this.attachmentEditor.attachment;
        this.uninstallAttachmentEditor();
        return this.installAttachmentEditorForAttachment(attachment);
      }
    };

    CompositionController.prototype.didUninstallAttachmentEditor = function() {
      this.attachmentEditor = null;
      return this.render();
    };

    CompositionController.prototype.attachmentEditorDidRequestRemovingAttributeForAttachment = function(attribute, attachment) {
      var ref;
      if ((ref = this.delegate) != null) {
        if (typeof ref.compositionControllerWillUpdateAttachment === "function") {
          ref.compositionControllerWillUpdateAttachment(attachment);
        }
      }
      return this.composition.removeAttributeForAttachment(attribute, attachment);
    };

    CompositionController.prototype.attachmentEditorDidRequestRemovalOfAttachment = function(attachment) {
      var ref;
      return (ref = this.delegate) != null ? typeof ref.compositionControllerDidRequestRemovalOfAttachment === "function" ? ref.compositionControllerDidRequestRemovalOfAttachment(attachment) : void 0 : void 0;
    };

    CompositionController.prototype.attachmentEditorDidRequestDeselectingAttachment = function(attachment) {
      var ref;
      return (ref = this.delegate) != null ? typeof ref.compositionControllerDidRequestDeselectingAttachment === "function" ? ref.compositionControllerDidRequestDeselectingAttachment(attachment) : void 0 : void 0;
    };

    CompositionController.prototype.findAttachmentForElement = function(element) {
      return this.composition.document.getAttachmentById(parseInt(element.dataset.trixId, 10));
    };

    return CompositionController;

  })(Trix.BasicObject);

}).call(this);
(function() {
  var findClosestElementFromNode, handleEvent, triggerEvent,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  handleEvent = Trix.handleEvent, triggerEvent = Trix.triggerEvent, findClosestElementFromNode = Trix.findClosestElementFromNode;

  Trix.ToolbarController = (function(superClass) {
    var actionButtonSelector, attributeButtonSelector, blockStyleSelector, getActionName, getAttributeName, toolbarButtonSelector;

    extend(ToolbarController, superClass);

    actionButtonSelector = "button[data-action]";

    attributeButtonSelector = "button[data-attribute]";

    blockStyleSelector = "select.block";

    toolbarButtonSelector = [actionButtonSelector, attributeButtonSelector].join(", ");

    function ToolbarController(element1) {
      this.element = element1;
      this.didClickAttributeButton = bind(this.didClickAttributeButton, this);
      this.didClickActionButton = bind(this.didClickActionButton, this);
      this.attributes = {};
      this.actions = {};
      handleEvent("mousedown", {
        onElement: this.element,
        matchingSelector: actionButtonSelector,
        withCallback: this.didClickActionButton
      });
      handleEvent("mousedown", {
        onElement: this.element,
        matchingSelector: attributeButtonSelector,
        withCallback: this.didClickAttributeButton
      });
      handleEvent("click", {
        onElement: this.element,
        matchingSelector: toolbarButtonSelector,
        preventDefault: true
      });
    }

    ToolbarController.prototype.didClickActionButton = function(event, element) {
      var actionName, ref, ref1;
      if ((ref = this.delegate) != null) {
        ref.toolbarDidClickButton();
      }
      event.preventDefault();
      actionName = getActionName(element);
      return (ref1 = this.delegate) != null ? ref1.toolbarDidInvokeAction(actionName) : void 0;
    };

    ToolbarController.prototype.didClickAttributeButton = function(event, element) {
      var attributeName, ref, ref1;
      if ((ref = this.delegate) != null) {
        ref.toolbarDidClickButton();
      }
      event.preventDefault();
      attributeName = getAttributeName(element);
      if (attributeName === "href") {
        return;
      }
      if ((ref1 = this.delegate) != null) {
        ref1.toolbarDidToggleAttribute(attributeName);
      }
      return this.refreshAttributeButtons();
    };

    ToolbarController.prototype.updateActions = function(actions) {
      this.actions = actions;
      return this.refreshActionButtons();
    };

    ToolbarController.prototype.refreshActionButtons = function() {
      return this.eachActionButton((function(_this) {
        return function(element, actionName) {
          return element.disabled = _this.actions[actionName] === false;
        };
      })(this));
    };

    ToolbarController.prototype.eachActionButton = function(callback) {
      var element, i, len, ref, results;
      ref = this.element.querySelectorAll(actionButtonSelector);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        element = ref[i];
        results.push(callback(element, getActionName(element)));
      }
      return results;
    };

    ToolbarController.prototype.updateAttributes = function(attributes) {
      this.attributes = attributes;
      this.refreshBlockStyleSelect();
      return this.refreshAttributeButtons();
    };

    ToolbarController.prototype.refreshBlockStyleSelect = function() {
      var i, len, option, ref, select, value;
      select = this.element.querySelector(blockStyleSelector);
      ref = select.querySelectorAll("option");
      for (i = 0, len = ref.length; i < len; i++) {
        option = ref[i];
        value = option.getAttribute("value");
        if (this.attributes[value]) {
          select.value = value;
          return;
        }
      }
      return select.value = "default";
    };

    ToolbarController.prototype.refreshAttributeButtons = function() {
      return this.eachAttributeButton((function(_this) {
        return function(element, attributeName) {
          if (_this.attributes[attributeName]) {
            return element.classList.add("active");
          } else {
            return element.classList.remove("active");
          }
        };
      })(this));
    };

    ToolbarController.prototype.eachAttributeButton = function(callback) {
      var element, i, len, ref, results;
      ref = this.element.querySelectorAll(attributeButtonSelector);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        element = ref[i];
        results.push(callback(element, getAttributeName(element)));
      }
      return results;
    };

    ToolbarController.prototype.applyKeyboardCommand = function(keys) {
      var button, buttonKeyString, buttonKeys, i, keyString, len, ref;
      keyString = JSON.stringify(keys.sort());
      ref = this.element.querySelectorAll("[data-key]");
      for (i = 0, len = ref.length; i < len; i++) {
        button = ref[i];
        buttonKeys = button.getAttribute("data-key").split("+");
        buttonKeyString = JSON.stringify(buttonKeys.sort());
        if (buttonKeyString === keyString) {
          triggerEvent("mousedown", {
            onElement: button
          });
          return true;
        }
      }
      return false;
    };

    getActionName = function(element) {
      return element.getAttribute("data-action");
    };

    getAttributeName = function(element) {
      return element.getAttribute("data-attribute");
    };

    return ToolbarController;

  })(Trix.BasicObject);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.Piece = (function(superClass) {
    extend(Piece, superClass);

    Piece.types = {};

    Piece.registerType = function(type, constructor) {
      constructor.type = type;
      return this.types[type] = constructor;
    };

    Piece.fromJSON = function(pieceJSON) {
      var constructor;
      if (constructor = this.types[pieceJSON.type]) {
        return constructor.fromJSON(pieceJSON);
      }
    };

    function Piece(value, attributes) {
      if (attributes == null) {
        attributes = {};
      }
      Piece.__super__.constructor.apply(this, arguments);
      this.attributes = Trix.Hash.box(attributes);
    }

    Piece.prototype.copyWithAttributes = function(attributes) {
      return new this.constructor(this.getValue(), attributes);
    };

    Piece.prototype.copyWithAdditionalAttributes = function(attributes) {
      return this.copyWithAttributes(this.attributes.merge(attributes));
    };

    Piece.prototype.copyWithoutAttribute = function(attribute) {
      return this.copyWithAttributes(this.attributes.remove(attribute));
    };

    Piece.prototype.copy = function() {
      return this.copyWithAttributes(this.attributes);
    };

    Piece.prototype.getAttribute = function(attribute) {
      return this.attributes.get(attribute);
    };

    Piece.prototype.getAttributesHash = function() {
      return this.attributes;
    };

    Piece.prototype.getAttributes = function() {
      return this.attributes.toObject();
    };

    Piece.prototype.getCommonAttributes = function() {
      var attributes, keys, piece;
      if (!(piece = pieceList.getPieceAtIndex(0))) {
        return {};
      }
      attributes = piece.attributes;
      keys = attributes.getKeys();
      pieceList.eachPiece(function(piece) {
        keys = attributes.getKeysCommonToHash(piece.attributes);
        return attributes = attributes.slice(keys);
      });
      return attributes.toObject();
    };

    Piece.prototype.hasAttribute = function(attribute) {
      return this.attributes.has(attribute);
    };

    Piece.prototype.hasSameStringValueAsPiece = function(piece) {
      return (piece != null) && this.toString() === piece.toString();
    };

    Piece.prototype.hasSameAttributesAsPiece = function(piece) {
      return (piece != null) && (this.attributes === piece.attributes || this.attributes.isEqualTo(piece.attributes));
    };

    Piece.prototype.isBlockBreak = function() {
      return false;
    };

    Piece.prototype.isEqualTo = function(piece) {
      return Piece.__super__.isEqualTo.apply(this, arguments) || (this.hasSameConstructorAs(piece) && this.hasSameStringValueAsPiece(piece) && this.hasSameAttributesAsPiece(piece));
    };

    Piece.prototype.isEmpty = function() {
      return this.length === 0;
    };

    Piece.prototype.isSerializable = function() {
      return true;
    };

    Piece.prototype.toJSON = function() {
      return {
        type: this.constructor.type,
        attributes: this.getAttributes()
      };
    };

    Piece.prototype.contentsForInspection = function() {
      return {
        type: this.constructor.type,
        attributes: this.attributes.inspect()
      };
    };

    Piece.prototype.canBeGrouped = function() {
      return this.hasAttribute("href");
    };

    Piece.prototype.canBeGroupedWith = function(piece) {
      return this.getAttribute("href") === piece.getAttribute("href");
    };

    Piece.prototype.getLength = function() {
      return this.length;
    };

    Piece.prototype.canBeConsolidatedWith = function(piece) {
      return false;
    };

    return Piece;

  })(Trix.Object);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.Piece.registerType("string", Trix.StringPiece = (function(superClass) {
    extend(StringPiece, superClass);

    StringPiece.fromJSON = function(pieceJSON) {
      return new this(pieceJSON.string, pieceJSON.attributes);
    };

    function StringPiece(string) {
      StringPiece.__super__.constructor.apply(this, arguments);
      this.string = string;
      this.length = this.string.length;
    }

    StringPiece.prototype.getValue = function() {
      return this.string;
    };

    StringPiece.prototype.toString = function() {
      return this.string.toString();
    };

    StringPiece.prototype.isBlockBreak = function() {
      return this.toString() === "\n" && this.getAttribute("blockBreak") === true;
    };

    StringPiece.prototype.toJSON = function() {
      var result;
      result = StringPiece.__super__.toJSON.apply(this, arguments);
      result.string = this.string;
      return result;
    };

    StringPiece.prototype.canBeConsolidatedWith = function(piece) {
      return (piece != null) && this.hasSameConstructorAs(piece) && this.hasSameAttributesAsPiece(piece);
    };

    StringPiece.prototype.consolidateWith = function(piece) {
      return new this.constructor(this.toString() + piece.toString(), this.attributes);
    };

    StringPiece.prototype.splitAtOffset = function(offset) {
      var left, right;
      if (offset === 0) {
        left = null;
        right = this;
      } else if (offset === this.length) {
        left = this;
        right = null;
      } else {
        left = new this.constructor(this.string.slice(0, offset), this.attributes);
        right = new this.constructor(this.string.slice(offset), this.attributes);
      }
      return [left, right];
    };

    StringPiece.prototype.toConsole = function() {
      var string;
      string = this.string;
      if (string.length > 15) {
        string = string.slice(0, 14) + "…";
      }
      return JSON.stringify(string.toString());
    };

    return StringPiece;

  })(Trix.Piece));

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  Trix.SplittableList = (function(superClass) {
    var endOfRange, objectArraysAreEqual, startOfRange;

    extend(SplittableList, superClass);

    SplittableList.box = function(objects) {
      if (objects instanceof this) {
        return objects;
      } else {
        return new this(objects);
      }
    };

    function SplittableList(objects) {
      if (objects == null) {
        objects = [];
      }
      SplittableList.__super__.constructor.apply(this, arguments);
      this.objects = objects.slice(0);
      this.length = this.objects.length;
    }

    SplittableList.prototype.eachObject = function(callback) {
      var i, index, len, object, ref, results;
      ref = this.objects;
      results = [];
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        object = ref[index];
        results.push(callback(object, index));
      }
      return results;
    };

    SplittableList.prototype.insertObjectAtIndex = function(object, index) {
      var objects;
      objects = this.objects.slice(0);
      objects.splice(index, 0, object);
      return new this.constructor(objects);
    };

    SplittableList.prototype.insertSplittableListAtIndex = function(splittableList, index) {
      var objects;
      objects = this.objects.slice(0);
      objects.splice.apply(objects, [index, 0].concat(slice.call(splittableList.objects)));
      return new this.constructor(objects);
    };

    SplittableList.prototype.insertSplittableListAtPosition = function(splittableList, position) {
      var index, objects, ref;
      ref = this.splitObjectAtPosition(position), objects = ref[0], index = ref[1];
      return new this.constructor(objects).insertSplittableListAtIndex(splittableList, index);
    };

    SplittableList.prototype.editObjectAtIndex = function(index, callback) {
      return this.replaceObjectAtIndex(callback(this.objects[index]), index);
    };

    SplittableList.prototype.replaceObjectAtIndex = function(object, index) {
      var objects;
      objects = this.objects.slice(0);
      objects.splice(index, 1, object);
      return new this.constructor(objects);
    };

    SplittableList.prototype.removeObjectAtIndex = function(index) {
      var objects;
      objects = this.objects.slice(0);
      objects.splice(index, 1);
      return new this.constructor(objects);
    };

    SplittableList.prototype.getObjectAtIndex = function(index) {
      return this.objects[index];
    };

    SplittableList.prototype.getSplittableListInRange = function(range) {
      var leftIndex, objects, ref, rightIndex;
      ref = this.splitObjectsAtRange(range), objects = ref[0], leftIndex = ref[1], rightIndex = ref[2];
      return new this.constructor(objects.slice(leftIndex, rightIndex + 1));
    };

    SplittableList.prototype.selectSplittableList = function(test) {
      var object, objects;
      objects = (function() {
        var i, len, ref, results;
        ref = this.objects;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          object = ref[i];
          if (test(object)) {
            results.push(object);
          }
        }
        return results;
      }).call(this);
      return new this.constructor(objects);
    };

    SplittableList.prototype.removeObjectsInRange = function(range) {
      var leftIndex, objects, ref, rightIndex;
      ref = this.splitObjectsAtRange(range), objects = ref[0], leftIndex = ref[1], rightIndex = ref[2];
      objects.splice(leftIndex, rightIndex - leftIndex + 1);
      return new this.constructor(objects);
    };

    SplittableList.prototype.transformObjectsInRange = function(range, transform) {
      var index, leftIndex, object, objects, ref, rightIndex, transformedObjects;
      ref = this.splitObjectsAtRange(range), objects = ref[0], leftIndex = ref[1], rightIndex = ref[2];
      transformedObjects = (function() {
        var i, len, results;
        results = [];
        for (index = i = 0, len = objects.length; i < len; index = ++i) {
          object = objects[index];
          if ((leftIndex <= index && index <= rightIndex)) {
            results.push(transform(object));
          } else {
            results.push(object);
          }
        }
        return results;
      })();
      return new this.constructor(transformedObjects);
    };

    SplittableList.prototype.splitObjectsAtRange = function(range) {
      var leftInnerIndex, objects, offset, ref, ref1, rightOuterIndex;
      ref = this.splitObjectAtPosition(startOfRange(range)), objects = ref[0], leftInnerIndex = ref[1], offset = ref[2];
      ref1 = new this.constructor(objects).splitObjectAtPosition(endOfRange(range) + offset), objects = ref1[0], rightOuterIndex = ref1[1];
      return [objects, leftInnerIndex, rightOuterIndex - 1];
    };

    SplittableList.prototype.getObjectAtPosition = function(position) {
      var index, offset, ref;
      ref = this.findIndexAndOffsetAtPosition(position), index = ref.index, offset = ref.offset;
      return this.objects[index];
    };

    SplittableList.prototype.splitObjectAtPosition = function(position) {
      var index, leftObject, object, objects, offset, ref, ref1, rightObject, splitIndex, splitOffset;
      ref = this.findIndexAndOffsetAtPosition(position), index = ref.index, offset = ref.offset;
      objects = this.objects.slice(0);
      if (index != null) {
        if (offset === 0) {
          splitIndex = index;
          splitOffset = 0;
        } else {
          object = this.getObjectAtIndex(index);
          ref1 = object.splitAtOffset(offset), leftObject = ref1[0], rightObject = ref1[1];
          objects.splice(index, 1, leftObject, rightObject);
          splitIndex = index + 1;
          splitOffset = leftObject.getLength() - offset;
        }
      } else {
        splitIndex = objects.length;
        splitOffset = 0;
      }
      return [objects, splitIndex, splitOffset];
    };

    SplittableList.prototype.consolidate = function() {
      var i, len, object, objects, pendingObject, ref;
      objects = [];
      pendingObject = this.objects[0];
      ref = this.objects.slice(1);
      for (i = 0, len = ref.length; i < len; i++) {
        object = ref[i];
        if (typeof pendingObject.canBeConsolidatedWith === "function" ? pendingObject.canBeConsolidatedWith(object) : void 0) {
          pendingObject = pendingObject.consolidateWith(object);
        } else {
          objects.push(pendingObject);
          pendingObject = object;
        }
      }
      if (pendingObject != null) {
        objects.push(pendingObject);
      }
      return new this.constructor(objects);
    };

    SplittableList.prototype.consolidateFromIndexToIndex = function(startIndex, endIndex) {
      var consolidatedInRange, objects, objectsInRange;
      objects = this.objects.slice(0);
      objectsInRange = objects.slice(startIndex, endIndex + 1);
      consolidatedInRange = new this.constructor(objectsInRange).consolidate().toArray();
      objects.splice.apply(objects, [startIndex, objectsInRange.length].concat(slice.call(consolidatedInRange)));
      return new this.constructor(objects);
    };

    SplittableList.prototype.findIndexAndOffsetAtPosition = function(position) {
      var currentPosition, i, index, len, nextPosition, object, ref;
      currentPosition = 0;
      ref = this.objects;
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        object = ref[index];
        nextPosition = currentPosition + object.getLength();
        if ((currentPosition <= position && position < nextPosition)) {
          return {
            index: index,
            offset: position - currentPosition
          };
        }
        currentPosition = nextPosition;
      }
      return {
        index: null,
        offset: null
      };
    };

    SplittableList.prototype.findPositionAtIndexAndOffset = function(index, offset) {
      var currentIndex, i, len, object, position, ref;
      position = 0;
      ref = this.objects;
      for (currentIndex = i = 0, len = ref.length; i < len; currentIndex = ++i) {
        object = ref[currentIndex];
        if (currentIndex < index) {
          position += object.getLength();
        } else if (currentIndex === index) {
          position += offset;
          break;
        }
      }
      return position;
    };

    SplittableList.prototype.getEndPosition = function() {
      var object, position;
      return this.endPosition != null ? this.endPosition : this.endPosition = ((function() {
        var i, len, ref;
        position = 0;
        ref = this.objects;
        for (i = 0, len = ref.length; i < len; i++) {
          object = ref[i];
          position += object.getLength();
        }
        return position;
      }).call(this));
    };

    SplittableList.prototype.toString = function() {
      return this.objects.join("");
    };

    SplittableList.prototype.toArray = function() {
      return this.objects.slice(0);
    };

    SplittableList.prototype.toJSON = function() {
      return this.toArray();
    };

    SplittableList.prototype.isEqualTo = function(splittableList) {
      return SplittableList.__super__.isEqualTo.apply(this, arguments) || objectArraysAreEqual(this.objects, splittableList != null ? splittableList.objects : void 0);
    };

    objectArraysAreEqual = function(left, right) {
      var i, index, len, object, result;
      if (right == null) {
        right = [];
      }
      if (left.length !== right.length) {
        return false;
      }
      result = true;
      for (index = i = 0, len = left.length; i < len; index = ++i) {
        object = left[index];
        if (result && !object.isEqualTo(right[index])) {
          result = false;
        }
      }
      return result;
    };

    SplittableList.prototype.contentsForInspection = function() {
      var object;
      return {
        objects: "[" + (((function() {
          var i, len, ref, results;
          ref = this.objects;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            object = ref[i];
            results.push(object.inspect());
          }
          return results;
        }).call(this)).join(", ")) + "]"
      };
    };

    startOfRange = function(range) {
      return range[0];
    };

    endOfRange = function(range) {
      return range[1];
    };

    return SplittableList;

  })(Trix.Object);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.Text = (function(superClass) {
    extend(Text, superClass);

    Text.textForStringWithAttributes = function(string, attributes) {
      var piece;
      piece = new Trix.StringPiece(string, attributes);
      return new this([piece]);
    };

    Text.fromJSON = function(textJSON) {
      var pieceJSON, pieces;
      pieces = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = textJSON.length; i < len; i++) {
          pieceJSON = textJSON[i];
          results.push(Trix.Piece.fromJSON(pieceJSON));
        }
        return results;
      })();
      return new this(pieces);
    };

    function Text(pieces) {
      var piece;
      if (pieces == null) {
        pieces = [];
      }
      Text.__super__.constructor.apply(this, arguments);
      this.pieceList = new Trix.SplittableList((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = pieces.length; i < len; i++) {
          piece = pieces[i];
          if (!piece.isEmpty()) {
            results.push(piece);
          }
        }
        return results;
      })());
    }

    Text.prototype.copy = function() {
      return this.copyWithPieceList(this.pieceList);
    };

    Text.prototype.copyWithPieceList = function(pieceList) {
      return new this.constructor(pieceList.consolidate().toArray());
    };

    Text.prototype.copyUsingObjectMap = function(objectMap) {
      var piece, pieces;
      pieces = (function() {
        var i, len, ref, ref1, results;
        ref = this.getPieces();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          piece = ref[i];
          results.push((ref1 = objectMap.find(piece)) != null ? ref1 : piece);
        }
        return results;
      }).call(this);
      return new this.constructor(pieces);
    };

    Text.prototype.appendText = function(text) {
      return this.insertTextAtPosition(text, this.getLength());
    };

    Text.prototype.insertTextAtPosition = function(text, position) {
      return this.copyWithPieceList(this.pieceList.insertSplittableListAtPosition(text.pieceList, position));
    };

    Text.prototype.removeTextAtRange = function(range) {
      return this.copyWithPieceList(this.pieceList.removeObjectsInRange(range));
    };

    Text.prototype.replaceTextAtRange = function(text, range) {
      return this.removeTextAtRange(range).insertTextAtPosition(text, range[0]);
    };

    Text.prototype.moveTextFromRangeToPosition = function(range, position) {
      var length, text;
      if ((range[0] <= position && position <= range[1])) {
        return;
      }
      text = this.getTextAtRange(range);
      length = text.getLength();
      if (range[0] < position) {
        position -= length;
      }
      return this.removeTextAtRange(range).insertTextAtPosition(text, position);
    };

    Text.prototype.addAttributeAtRange = function(attribute, value, range) {
      var attributes;
      attributes = {};
      attributes[attribute] = value;
      return this.addAttributesAtRange(attributes, range);
    };

    Text.prototype.addAttributesAtRange = function(attributes, range) {
      return this.copyWithPieceList(this.pieceList.transformObjectsInRange(range, function(piece) {
        return piece.copyWithAdditionalAttributes(attributes);
      }));
    };

    Text.prototype.removeAttributeAtRange = function(attribute, range) {
      return this.copyWithPieceList(this.pieceList.transformObjectsInRange(range, function(piece) {
        return piece.copyWithoutAttribute(attribute);
      }));
    };

    Text.prototype.setAttributesAtRange = function(attributes, range) {
      return this.copyWithPieceList(this.pieceList.transformObjectsInRange(range, function(piece) {
        return piece.copyWithAttributes(attributes);
      }));
    };

    Text.prototype.getAttributesAtPosition = function(position) {
      var ref, ref1;
      return (ref = (ref1 = this.pieceList.getObjectAtPosition(position)) != null ? ref1.getAttributes() : void 0) != null ? ref : {};
    };

    Text.prototype.getCommonAttributes = function() {
      var objects, piece;
      objects = (function() {
        var i, len, ref, results;
        ref = this.pieceList.toArray();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          piece = ref[i];
          results.push(piece.getAttributes());
        }
        return results;
      }).call(this);
      return Trix.Hash.fromCommonAttributesOfObjects(objects).toObject();
    };

    Text.prototype.getCommonAttributesAtRange = function(range) {
      var ref;
      return (ref = this.getTextAtRange(range).getCommonAttributes()) != null ? ref : {};
    };

    Text.prototype.getExpandedRangeForAttributeAtOffset = function(attributeName, offset) {
      var left, length, right;
      left = right = offset;
      length = this.getLength();
      while (left > 0 && this.getCommonAttributesAtRange([left - 1, right])[attributeName]) {
        left--;
      }
      while (right < length && this.getCommonAttributesAtRange([offset, right + 1])[attributeName]) {
        right++;
      }
      return [left, right];
    };

    Text.prototype.getTextAtRange = function(range) {
      return this.copyWithPieceList(this.pieceList.getSplittableListInRange(range));
    };

    Text.prototype.getStringAtRange = function(range) {
      return this.pieceList.getSplittableListInRange(range).toString();
    };

    Text.prototype.startsWithString = function(string) {
      return this.getStringAtRange([0, string.length]) === string;
    };

    Text.prototype.endsWithString = function(string) {
      var length;
      length = this.getLength();
      return this.getStringAtRange([length - string.length, length]) === string;
    };

    Text.prototype.getLength = function() {
      return this.pieceList.getEndPosition();
    };

    Text.prototype.isEmpty = function() {
      return this.getLength() === 0;
    };

    Text.prototype.isEqualTo = function(text) {
      var ref;
      return Text.__super__.isEqualTo.apply(this, arguments) || (text != null ? (ref = text.pieceList) != null ? ref.isEqualTo(this.pieceList) : void 0 : void 0);
    };

    Text.prototype.isBlockBreak = function() {
      return this.getLength() === 1 && this.pieceList.getObjectAtIndex(0).isBlockBreak();
    };

    Text.prototype.eachPiece = function(callback) {
      return this.pieceList.eachObject(callback);
    };

    Text.prototype.getPieces = function() {
      return this.pieceList.toArray();
    };

    Text.prototype.getPieceAtPosition = function(position) {
      return this.pieceList.getObjectAtPosition(position);
    };

    Text.prototype.contentsForInspection = function() {
      return {
        pieceList: this.pieceList.inspect()
      };
    };

    Text.prototype.toSerializableText = function() {
      var pieceList;
      pieceList = this.pieceList.selectSplittableList(function(piece) {
        return piece.isSerializable();
      });
      return this.copyWithPieceList(pieceList);
    };

    Text.prototype.toString = function() {
      return this.pieceList.toString();
    };

    Text.prototype.toJSON = function() {
      return this.pieceList.toJSON();
    };

    Text.prototype.toConsole = function() {
      var piece;
      return JSON.stringify((function() {
        var i, len, ref, results;
        ref = this.pieceList.toArray();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          piece = ref[i];
          results.push(JSON.parse(piece.toConsole()));
        }
        return results;
      }).call(this));
    };

    return Text;

  })(Trix.Object);

}).call(this);
(function() {
  var arraysAreEqual,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  arraysAreEqual = Trix.arraysAreEqual;

  Trix.Block = (function(superClass) {
    var addBlockBreakToText, applyBlockBreakToText, blockBreakText, getLastElement, removeLastElement, textEndsInBlockBreak, unmarkBlockBreakPiece, unmarkExistingInnerBlockBreaksInText;

    extend(Block, superClass);

    Block.blockForAttachment = function(attachment) {
      return new Trix.AttachmentBlock(attachment);
    };

    Block.fromJSON = function(blockJSON) {
      var attachment, text;
      if (blockJSON.attachment != null) {
        attachment = Trix.Attachment.fromJSON(blockJSON.attachment);
        return this.blockForAttachment(attachment);
      } else {
        text = Trix.Text.fromJSON(blockJSON.text);
        return new this(text, blockJSON.attributes);
      }
    };

    function Block(text, attributes) {
      if (text == null) {
        text = new Trix.Text;
      }
      if (attributes == null) {
        attributes = [];
      }
      Block.__super__.constructor.apply(this, arguments);
      this.text = applyBlockBreakToText(text);
      this.attributes = attributes;
    }

    Block.prototype.isEmpty = function() {
      return this.text.isBlockBreak();
    };

    Block.prototype.isEqualTo = function(block) {
      return Block.__super__.isEqualTo.apply(this, arguments) || (this.text.isEqualTo(block != null ? block.text : void 0) && arraysAreEqual(this.attributes, block != null ? block.attributes : void 0));
    };

    Block.prototype.hasAttachment = function() {
      return false;
    };

    Block.prototype.copyWithText = function(text) {
      return new this.constructor(text, this.attributes);
    };

    Block.prototype.copyWithoutText = function() {
      return this.copyWithText(null);
    };

    Block.prototype.copyWithAttributes = function(attributes) {
      return new this.constructor(this.text, attributes);
    };

    Block.prototype.copyUsingObjectMap = function(objectMap) {
      var mappedText;
      if (mappedText = objectMap.find(this.text)) {
        return this.copyWithText(mappedText);
      } else {
        return this.copyWithText(this.text.copyUsingObjectMap(objectMap));
      }
    };

    Block.prototype.addAttribute = function(attribute) {
      var attributes, listAttribute;
      listAttribute = Trix.config.blockAttributes[attribute].listAttribute;
      attributes = listAttribute ? this.attributes.concat([listAttribute, attribute]) : this.attributes.concat([attribute]);
      return this.copyWithAttributes(attributes);
    };

    Block.prototype.removeAttribute = function(attribute) {
      var attributes, listAttribute;
      listAttribute = Trix.config.blockAttributes[attribute].listAttribute;
      attributes = removeLastElement(this.attributes, attribute);
      if (listAttribute != null) {
        attributes = removeLastElement(attributes, listAttribute);
      }
      return this.copyWithAttributes(attributes);
    };

    Block.prototype.removeLastAttribute = function() {
      return this.removeAttribute(this.getLastAttribute());
    };

    Block.prototype.getLastAttribute = function() {
      return getLastElement(this.attributes);
    };

    Block.prototype.getAttributes = function() {
      return this.attributes.slice(0);
    };

    Block.prototype.getAttributeLevel = function() {
      return this.attributes.length;
    };

    Block.prototype.getAttributeAtLevel = function(level) {
      return this.attributes[level - 1];
    };

    Block.prototype.hasAttributes = function() {
      return this.getAttributeLevel() > 0;
    };

    Block.prototype.getConfig = function(key) {
      var attribute, config;
      if (!(attribute = this.getLastAttribute())) {
        return;
      }
      if (!(config = Trix.config.blockAttributes[attribute])) {
        return;
      }
      if (key) {
        return config[key];
      } else {
        return config;
      }
    };

    Block.prototype.isHeading = function() {
      return this.getConfig("heading") != null;
    };

    Block.prototype.isListItem = function() {
      return this.getConfig("listAttribute") != null;
    };

    Block.prototype.findLineBreakInDirectionFromPosition = function(direction, position) {
      var result, string;
      string = this.toString();
      result = (function() {
        switch (direction) {
          case "forward":
            return string.indexOf("\n", position);
          case "backward":
            return string.slice(0, position).lastIndexOf("\n");
        }
      })();
      if (result !== -1) {
        return result;
      }
    };

    Block.prototype.contentsForInspection = function() {
      return {
        text: this.text.inspect(),
        attributes: this.attributes
      };
    };

    Block.prototype.toString = function() {
      return this.text.toString();
    };

    Block.prototype.toJSON = function() {
      return {
        text: this.text,
        attributes: this.attributes
      };
    };

    Block.prototype.getLength = function() {
      return this.text.getLength();
    };

    Block.prototype.canBeConsolidatedWith = function(block) {
      return !this.hasAttributes() && !block.hasAttributes();
    };

    Block.prototype.consolidateWith = function(block) {
      var newlineText, text;
      newlineText = Trix.Text.textForStringWithAttributes("\n");
      text = this.getTextWithoutBlockBreak().appendText(newlineText);
      return this.copyWithText(text.appendText(block.text));
    };

    Block.prototype.splitAtOffset = function(offset) {
      var left, right;
      if (offset === 0) {
        left = null;
        right = this;
      } else if (offset === this.getLength()) {
        left = this;
        right = null;
      } else {
        left = this.copyWithText(this.text.getTextAtRange([0, offset]));
        right = this.copyWithText(this.text.getTextAtRange([offset, this.getLength()]));
      }
      return [left, right];
    };

    Block.prototype.toString = function() {
      return this.text.toString();
    };

    Block.prototype.getBlockBreakPosition = function() {
      return this.text.getLength() - 1;
    };

    Block.prototype.getTextWithoutBlockBreak = function() {
      if (textEndsInBlockBreak(this.text)) {
        return this.text.getTextAtRange([0, this.getBlockBreakPosition()]);
      } else {
        return this.text.copy();
      }
    };

    Block.prototype.canBeGrouped = function(depth) {
      return this.attributes[depth];
    };

    Block.prototype.canBeGroupedWith = function(otherBlock, depth) {
      var attributes, otherAttributes, ref, ref1;
      attributes = this.attributes;
      otherAttributes = otherBlock.getAttributes();
      if (attributes[depth] === otherAttributes[depth]) {
        if (((ref = attributes[depth]) === "bullet" || ref === "number") && ((ref1 = otherAttributes[depth + 1]) !== "bulletList" && ref1 !== "numberList")) {
          return false;
        } else {
          return true;
        }
      }
    };

    applyBlockBreakToText = function(text) {
      text = unmarkExistingInnerBlockBreaksInText(text);
      text = addBlockBreakToText(text);
      return text;
    };

    unmarkExistingInnerBlockBreaksInText = function(text) {
      var i, innerPieces, lastPiece, modified, piece, ref;
      modified = false;
      ref = text.getPieces(), innerPieces = 2 <= ref.length ? slice.call(ref, 0, i = ref.length - 1) : (i = 0, []), lastPiece = ref[i++];
      if (lastPiece == null) {
        return text;
      }
      innerPieces = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = innerPieces.length; j < len; j++) {
          piece = innerPieces[j];
          if (piece.isBlockBreak()) {
            modified = true;
            results.push(unmarkBlockBreakPiece(piece));
          } else {
            results.push(piece);
          }
        }
        return results;
      })();
      if (modified) {
        return new Trix.Text(slice.call(innerPieces).concat([lastPiece]));
      } else {
        return text;
      }
    };

    blockBreakText = Trix.Text.textForStringWithAttributes("\n", {
      blockBreak: true
    });

    addBlockBreakToText = function(text) {
      if (textEndsInBlockBreak(text)) {
        return text;
      } else {
        return text.appendText(blockBreakText);
      }
    };

    textEndsInBlockBreak = function(text) {
      var endText, length;
      length = text.getLength();
      if (length === 0) {
        return false;
      }
      endText = text.getTextAtRange([length - 1, length]);
      return endText.isBlockBreak();
    };

    unmarkBlockBreakPiece = function(piece) {
      return piece.copyWithoutAttribute("blockBreak");
    };

    removeLastElement = function(array, element) {
      if (getLastElement(array) === element) {
        return array.slice(0, -1);
      } else {
        return array;
      }
    };

    getLastElement = function(array) {
      return array.slice(-1)[0];
    };

    return Block;

  })(Trix.Object);

}).call(this);
(function() {
  var arraysAreEqual, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  arraysAreEqual = Trix.arraysAreEqual, extend = Trix.extend;

  Trix.AttachmentBlock = (function(superClass) {
    extend1(AttachmentBlock, superClass);

    function AttachmentBlock(attachment) {
      this.attachment = attachment;
      AttachmentBlock.__super__.constructor.call(this, null, ["attachment"]);
    }

    AttachmentBlock.prototype.hasAttachment = function() {
      return true;
    };

    AttachmentBlock.prototype.getAttachment = function() {
      return this.attachment;
    };

    AttachmentBlock.prototype.copyWithText = function() {
      return new this.constructor(this.attachment);
    };

    AttachmentBlock.prototype.copyWithAttributes = function() {
      return new this.constructor(this.attachment);
    };

    AttachmentBlock.prototype.isEmpty = function() {
      return false;
    };

    AttachmentBlock.prototype.isListItem = function() {
      return false;
    };

    AttachmentBlock.prototype.toJSON = function() {
      return {
        attachment: this.attachment.toJSON()
      };
    };

    AttachmentBlock.prototype.toString = function() {
      return Trix.OBJECT_REPLACEMENT_CHARACTER;
    };

    AttachmentBlock.prototype.getLength = function() {
      return 1;
    };

    AttachmentBlock.prototype.canBeConsolidatedWith = function() {
      return false;
    };

    AttachmentBlock.prototype.canBeGrouped = function() {
      return false;
    };

    AttachmentBlock.prototype.canBeGroupedWith = function() {
      return false;
    };

    return AttachmentBlock;

  })(Trix.Block);

}).call(this);
(function() {
  var arraysAreEqual, elementContainsNode, extend, findClosestElementFromNode, makeElement, nodeIsAttachmentWrapper, normalizeSpaces, tagName, walkTree,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  arraysAreEqual = Trix.arraysAreEqual, normalizeSpaces = Trix.normalizeSpaces, makeElement = Trix.makeElement, tagName = Trix.tagName, walkTree = Trix.walkTree, findClosestElementFromNode = Trix.findClosestElementFromNode, elementContainsNode = Trix.elementContainsNode, nodeIsAttachmentWrapper = Trix.nodeIsAttachmentWrapper, extend = Trix.extend;

  Trix.HTMLParser = (function(superClass) {
    var allowedAttributes, allowedProtocols, blockForAttachment, blockForAttributes, getAttachmentAttributes, getBlockElementMargin, getImageDimensions, isAllowedAttribute, nodeFilter, pieceForString, removeInsignificantWhitespace, sanitizeHTML;

    extend1(HTMLParser, superClass);

    allowedAttributes = "style width height class target data-eid data-href data-mime-type data-rel".split(" ");

    allowedProtocols = "http https".split(" ");

    HTMLParser.parse = function(html, options) {
      var parser;
      parser = new this(html, options);
      parser.parse();
      return parser;
    };

    function HTMLParser(html1, arg) {
      this.html = html1;
      this.referenceElement = (arg != null ? arg : {}).referenceElement;
      this.blocks = [];
      this.blockElements = [];
      this.processedElements = [];
    }

    HTMLParser.prototype.getDocument = function() {
      return Trix.Document.fromJSON(this.blocks);
    };

    HTMLParser.prototype.parse = function() {
      var html, walker;
      try {
        this.createHiddenContainer();
        html = sanitizeHTML(this.html);
        this.containerElement.innerHTML = html;
        walker = walkTree(this.containerElement, {
          usingFilter: nodeFilter
        });
        while (walker.nextNode()) {
          this.processNode(walker.currentNode);
        }
        return this.translateBlockElementMarginsToNewlines();
      } finally {
        this.removeHiddenContainer();
      }
    };

    nodeFilter = function(node) {
      if (tagName(node) === "style") {
        return NodeFilter.FILTER_REJECT;
      } else {
        return NodeFilter.FILTER_ACCEPT;
      }
    };

    HTMLParser.prototype.createHiddenContainer = function() {
      if (this.referenceElement) {
        this.containerElement = this.referenceElement.cloneNode(false);
        this.containerElement.removeAttribute("id");
        this.containerElement.setAttribute("data-trix-internal", "");
        this.containerElement.style.display = "none";
        return this.referenceElement.parentNode.insertBefore(this.containerElement, this.referenceElement.nextSibling);
      } else {
        this.containerElement = makeElement({
          tagName: "div",
          style: {
            display: "none"
          }
        });
        return document.body.appendChild(this.containerElement);
      }
    };

    HTMLParser.prototype.removeHiddenContainer = function() {
      return this.containerElement.parentNode.removeChild(this.containerElement);
    };

    HTMLParser.prototype.processNode = function(node) {
      switch (node.nodeType) {
        case Node.TEXT_NODE:
          return this.processTextNode(node);
        case Node.ELEMENT_NODE:
          if (!nodeIsAttachmentWrapper(node)) {
            this.appendBlockForElement(node);
          }
          return this.processElement(node);
      }
    };

    HTMLParser.prototype.appendBlockForElement = function(element) {
      var attributes, parentBlockElement;
      if (this.isBlockElement(element) && !this.isBlockElement(element.firstChild)) {
        attributes = this.getBlockAttributes(element);
        if (!(elementContainsNode(this.currentBlockElement, element) && arraysAreEqual(attributes, this.currentBlock.attributes))) {
          this.currentBlock = this.appendBlockForAttributesWithElement(attributes, element);
          return this.currentBlockElement = element;
        }
      } else if (this.currentBlockElement && !elementContainsNode(this.currentBlockElement, element) && !this.isBlockElement(element)) {
        if (parentBlockElement = this.findParentBlockElement(element)) {
          return this.appendBlockForElement(parentBlockElement);
        } else {
          this.currentBlock = this.appendEmptyBlock();
          return this.currentBlockElement = null;
        }
      }
    };

    HTMLParser.prototype.findParentBlockElement = function(element) {
      var parentElement;
      parentElement = element.parentElement;
      while (parentElement && parentElement !== this.containerElement) {
        if (this.isBlockElement(parentElement) && indexOf.call(this.blockElements, parentElement) >= 0) {
          return parentElement;
        } else {
          parentElement = parentElement.parentElement;
        }
      }
      return null;
    };

    HTMLParser.prototype.isExtraBR = function(element) {
      return tagName(element) === "br" && this.isBlockElement(element.parentNode) && element.parentNode.lastChild === element;
    };

    HTMLParser.prototype.isBlockElement = function(element) {
      var ref;
      if ((element != null ? element.nodeType : void 0) !== Node.ELEMENT_NODE) {
        return;
      }
      if (findClosestElementFromNode(element, {
        matchingSelector: "td"
      })) {
        return;
      }
      return (ref = tagName(element), indexOf.call(this.getBlockTagNames(), ref) >= 0) || window.getComputedStyle(element).display === "block";
    };

    HTMLParser.prototype.getBlockTagNames = function() {
      var key, value;
      return this.blockTagNames != null ? this.blockTagNames : this.blockTagNames = (function() {
        var ref, results;
        ref = Trix.config.blockAttributes;
        results = [];
        for (key in ref) {
          value = ref[key];
          results.push(value.tagName);
        }
        return results;
      })();
    };

    HTMLParser.prototype.processTextNode = function(node) {
      var string;
      if (string = normalizeSpaces(node.data)) {
        return this.appendStringWithAttributes(string, this.getTextAttributes(node.parentNode));
      }
    };

    HTMLParser.prototype.processElement = function(element) {
      var attributes;
      if (nodeIsAttachmentWrapper(element)) {
        attributes = getAttachmentAttributes(element);
        this.appendAttachmentForAttributesWithElement(attributes, element);
        element.innerHTML = "";
        return this.processedElements.push(element);
      } else {
        switch (tagName(element)) {
          case "br":
            if (!(this.isExtraBR(element) || this.isBlockElement(element.nextSibling))) {
              this.appendStringWithAttributes("\n", this.getTextAttributes(element));
            }
            return this.processedElements.push(element);
          case "tr":
            if (element.parentNode.firstChild !== element) {
              return this.appendStringWithAttributes("\n");
            }
            break;
          case "td":
            if (element.parentNode.firstChild !== element) {
              return this.appendStringWithAttributes(" | ");
            }
        }
      }
    };

    HTMLParser.prototype.appendBlockForAttributesWithElement = function(attributes, element) {
      var block;
      this.blockElements.push(element);
      block = blockForAttributes(attributes);
      this.blocks.push(block);
      return block;
    };

    HTMLParser.prototype.appendEmptyBlock = function() {
      return this.appendBlockForAttributesWithElement([], null);
    };

    HTMLParser.prototype.appendStringWithAttributes = function(string, attributes) {
      return this.appendPiece(pieceForString(string, attributes));
    };

    HTMLParser.prototype.appendAttachmentForAttributesWithElement = function(attachment, element) {
      var block;
      this.blockElements.push(element);
      block = blockForAttachment(attachment);
      this.blocks.push(block);
      return block;
    };

    HTMLParser.prototype.appendPiece = function(piece) {
      if (this.blocks.length === 0) {
        this.appendEmptyBlock();
      }
      return this.blocks[this.blocks.length - 1].text.push(piece);
    };

    HTMLParser.prototype.appendStringToTextAtIndex = function(string, index) {
      var piece, text;
      text = this.blocks[index].text;
      piece = text[text.length - 1];
      if ((piece != null ? piece.type : void 0) === "string") {
        return piece.string += string;
      } else {
        return text.push(pieceForString(string));
      }
    };

    HTMLParser.prototype.prependStringToTextAtIndex = function(string, index) {
      var piece, text;
      text = this.blocks[index].text;
      piece = text[0];
      if ((piece != null ? piece.type : void 0) === "string") {
        return piece.string = string + piece.string;
      } else {
        return text.unshift(pieceForString(string));
      }
    };

    HTMLParser.prototype.getTextAttributes = function(element) {
      var attribute, attributes, config, json, key, ref, ref1, value;
      attributes = {};
      ref = Trix.config.textAttributes;
      for (attribute in ref) {
        config = ref[attribute];
        if (config.parser) {
          if (value = config.parser(element)) {
            attributes[attribute] = value;
          }
        } else if (config.tagName) {
          if (tagName(element) === config.tagName) {
            attributes[attribute] = true;
          }
        }
      }
      if (nodeIsAttachmentWrapper(element)) {
        if (json = element.firstElementChild.dataset.trixAttributes) {
          ref1 = JSON.parse(json);
          for (key in ref1) {
            value = ref1[key];
            attributes[key] = value;
          }
        }
      }
      return attributes;
    };

    HTMLParser.prototype.getBlockAttributes = function(element) {
      var attribute, attributes, config, ref;
      attributes = [];
      while (element && element !== this.containerElement) {
        ref = Trix.config.blockAttributes;
        for (attribute in ref) {
          config = ref[attribute];
          if (config.parse !== false) {
            if (tagName(element) === config.tagName) {
              if ((typeof config.test === "function" ? config.test(element) : void 0) || !config.test) {
                attributes.push(attribute);
                if (config.listAttribute) {
                  attributes.push(config.listAttribute);
                }
              }
            }
          }
        }
        element = element.parentNode;
      }
      return attributes.reverse();
    };

    HTMLParser.prototype.getMarginOfBlockElementAtIndex = function(index) {
      var element, ref;
      if (element = this.blockElements[index]) {
        if (!((ref = tagName(element), indexOf.call(this.getBlockTagNames(), ref) >= 0) || indexOf.call(this.processedElements, element) >= 0)) {
          return getBlockElementMargin(element);
        }
      }
    };

    HTMLParser.prototype.getMarginOfDefaultBlockElement = function() {
      var element;
      element = makeElement(Trix.config.blockAttributes["default"].tagName);
      this.containerElement.appendChild(element);
      return getBlockElementMargin(element);
    };

    HTMLParser.prototype.translateBlockElementMarginsToNewlines = function() {
      var block, defaultMargin, i, index, len, margin, ref, results;
      defaultMargin = this.getMarginOfDefaultBlockElement();
      ref = this.blocks;
      results = [];
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        block = ref[index];
        if (!(margin = this.getMarginOfBlockElementAtIndex(index))) {
          continue;
        }
        if (margin.top > defaultMargin.top * 2) {
          this.prependStringToTextAtIndex("\n", index);
        }
        if (margin.bottom > defaultMargin.bottom * 2) {
          results.push(this.appendStringToTextAtIndex("\n", index));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    pieceForString = function(string, attributes) {
      var type;
      if (attributes == null) {
        attributes = {};
      }
      type = "string";
      return {
        string: string,
        attributes: attributes,
        type: type
      };
    };

    blockForAttributes = function(attributes) {
      var text;
      if (attributes == null) {
        attributes = {};
      }
      text = [];
      return {
        text: text,
        attributes: attributes
      };
    };

    blockForAttachment = function(attachment, attributes) {
      var text;
      if (attributes == null) {
        attributes = {};
      }
      text = [];
      return {
        text: text,
        attributes: attributes,
        attachment: attachment
      };
    };

    getAttachmentAttributes = function(element) {
      var a, isImage, shareItem;
      shareItem = element.firstElementChild;
      isImage = shareItem.classList.contains("image");
      return {
        contentType: shareItem.getAttribute("data-mime-type"),
        eid: shareItem.getAttribute("data-eid"),
        filename: isImage ? "" : shareItem.querySelector("a").textContent,
        previewable: isImage,
        url: isImage ? shareItem.querySelector("img").getAttribute("src") : (a = shareItem.querySelector("a"), a.getAttribute("data-href") || a.getAttribute("href"))
      };
    };

    sanitizeHTML = function(html) {
      var body, doc, element, head, i, j, k, len, len1, len2, name, node, nodesToRemove, ref, ref1, ref2, style, value, walker;
      html = removeInsignificantWhitespace(html);
      doc = document.implementation.createHTMLDocument("");
      doc.documentElement.innerHTML = html;
      body = doc.body, head = doc.head;
      ref = head.querySelectorAll("style");
      for (i = 0, len = ref.length; i < len; i++) {
        style = ref[i];
        body.appendChild(style);
      }
      nodesToRemove = [];
      walker = walkTree(body);
      while (walker.nextNode()) {
        node = walker.currentNode;
        switch (node.nodeType) {
          case Node.ELEMENT_NODE:
            element = node;
            ref1 = slice.call(element.attributes);
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              ref2 = ref1[j], name = ref2.name, value = ref2.value;
              if (!isAllowedAttribute(name, value)) {
                element.removeAttribute(name);
              }
            }
            break;
          case Node.COMMENT_NODE:
            nodesToRemove.push(node);
            break;
          case Node.TEXT_NODE:
            if (node.data.match(/^\s*$/) && node.parentNode === body) {
              nodesToRemove.push(node);
            }
        }
      }
      for (k = 0, len2 = nodesToRemove.length; k < len2; k++) {
        node = nodesToRemove[k];
        node.parentNode.removeChild(node);
      }
      return body.innerHTML;
    };

    removeInsignificantWhitespace = function(html) {
      return html.replace(/>\n+</g, "><").replace(/>\ +</g, "> <");
    };

    isAllowedAttribute = function(name, value) {
      var i, len, protocol;
      if (name === "href" || name === "src") {
        for (i = 0, len = allowedProtocols.length; i < len; i++) {
          protocol = allowedProtocols[i];
          if (value.indexOf(protocol + ":") === 0) {
            return true;
          }
        }
      }
      if (name.indexOf("data-trix") === 0) {
        return true;
      }
      return indexOf.call(allowedAttributes, name) >= 0;
    };

    getBlockElementMargin = function(element) {
      var style;
      style = window.getComputedStyle(element);
      if (style.display === "block") {
        return {
          top: parseInt(style.marginTop),
          bottom: parseInt(style.marginBottom)
        };
      }
    };

    getImageDimensions = function(element) {
      var dimensions, height, width;
      width = element.getAttribute("width");
      height = element.getAttribute("height");
      dimensions = {};
      if (width) {
        dimensions.width = parseInt(width, 10);
      }
      if (height) {
        dimensions.height = parseInt(height, 10);
      }
      return dimensions;
    };

    return HTMLParser;

  })(Trix.BasicObject);

}).call(this);
(function() {
  var arraysAreEqual, normalizeRange, rangeIsCollapsed,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  arraysAreEqual = Trix.arraysAreEqual, normalizeRange = Trix.normalizeRange, rangeIsCollapsed = Trix.rangeIsCollapsed;

  Trix.Document = (function(superClass) {
    var attributesForBlock;

    extend(Document, superClass);

    Document.fromJSON = function(documentJSON) {
      var blockJSON, blocks;
      blocks = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = documentJSON.length; i < len; i++) {
          blockJSON = documentJSON[i];
          results.push(Trix.Block.fromJSON(blockJSON));
        }
        return results;
      })();
      return new this(blocks);
    };

    Document.fromHTML = function(html, options) {
      return Trix.HTMLParser.parse(html, options).getDocument();
    };

    Document.fromString = function(string, textAttributes) {
      var text;
      text = Trix.Text.textForStringWithAttributes(string, textAttributes);
      return new this([new Trix.Block(text)]);
    };

    function Document(blocks) {
      if (blocks == null) {
        blocks = [];
      }
      Document.__super__.constructor.apply(this, arguments);
      if (blocks.length === 0) {
        blocks = [new Trix.Block];
      }
      this.blockList = Trix.SplittableList.box(blocks);
    }

    Document.prototype.isEmpty = function() {
      var block;
      return this.blockList.length === 1 && (block = this.getBlockAtIndex(0), block.isEmpty() && !block.hasAttributes());
    };

    Document.prototype.copy = function(options) {
      var blocks;
      if (options == null) {
        options = {};
      }
      blocks = options.consolidateBlocks ? this.blockList.consolidate().toArray() : this.blockList.toArray();
      return new this.constructor(blocks);
    };

    Document.prototype.copyUsingObjectsFromDocument = function(sourceDocument) {
      var objectMap;
      objectMap = new Trix.ObjectMap(sourceDocument.getObjects());
      return this.copyUsingObjectMap(objectMap);
    };

    Document.prototype.copyUsingObjectMap = function(objectMap) {
      var block, blocks, mappedBlock;
      blocks = (function() {
        var i, len, ref, results;
        ref = this.getBlocks();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          block = ref[i];
          if (mappedBlock = objectMap.find(block)) {
            results.push(mappedBlock);
          } else {
            results.push(block.copyUsingObjectMap(objectMap));
          }
        }
        return results;
      }).call(this);
      return new this.constructor(blocks);
    };

    Document.prototype.copyWithBaseBlockAttributes = function(blockAttributes) {
      var attributes, block, blocks;
      if (blockAttributes == null) {
        blockAttributes = [];
      }
      blocks = (function() {
        var i, len, ref, results;
        ref = this.getBlocks();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          block = ref[i];
          attributes = blockAttributes.concat(block.getAttributes());
          results.push(block.copyWithAttributes(attributes));
        }
        return results;
      }).call(this);
      return new this.constructor(blocks);
    };

    Document.prototype.insertDocumentAtRange = function(document, range) {
      var block, blockList, index, offset, position, ref, result;
      blockList = document.blockList;
      position = (range = normalizeRange(range))[0];
      ref = this.locationFromPosition(position), index = ref.index, offset = ref.offset;
      result = this;
      block = this.getBlockAtPosition(position);
      if (rangeIsCollapsed(range) && block.isEmpty() && !block.hasAttributes()) {
        result = new this.constructor(result.blockList.removeObjectAtIndex(index));
      } else if (block.getBlockBreakPosition() === offset) {
        position++;
      }
      result = result.removeTextAtRange(range);
      return new this.constructor(result.blockList.insertSplittableListAtPosition(blockList, position));
    };

    Document.prototype.mergeDocumentAtRange = function(document, range) {
      var baseBlockAttributes, blockAttributes, blockCount, firstBlock, firstText, formattedDocument, leadingBlockAttributes, position, result, startLocation, startPosition, trailingBlockAttributes;
      startPosition = (range = normalizeRange(range))[0];
      startLocation = this.locationFromPosition(startPosition);
      blockAttributes = this.getBlockAtIndex(startLocation.index).getAttributes();
      baseBlockAttributes = document.getBaseBlockAttributes();
      trailingBlockAttributes = blockAttributes.slice(-baseBlockAttributes.length);
      if (arraysAreEqual(baseBlockAttributes, trailingBlockAttributes)) {
        leadingBlockAttributes = blockAttributes.slice(0, -baseBlockAttributes.length);
        formattedDocument = document.copyWithBaseBlockAttributes(leadingBlockAttributes);
      } else {
        formattedDocument = document.copy({
          consolidateBlocks: true
        }).copyWithBaseBlockAttributes(blockAttributes);
      }
      blockCount = formattedDocument.getBlockCount();
      firstBlock = formattedDocument.getBlockAtIndex(0);
      if (arraysAreEqual(blockAttributes, firstBlock.getAttributes())) {
        firstText = firstBlock.getTextWithoutBlockBreak();
        result = this.insertTextAtRange(firstText, range);
        if (blockCount > 1) {
          formattedDocument = new this.constructor(formattedDocument.getBlocks().slice(1));
          position = startPosition + firstText.getLength();
          result = result.insertDocumentAtRange(formattedDocument, position);
        }
      } else {
        result = this.insertDocumentAtRange(formattedDocument, range);
      }
      return result;
    };

    Document.prototype.insertTextAtRange = function(text, range) {
      var document, index, offset, ref, startPosition;
      startPosition = (range = normalizeRange(range))[0];
      ref = this.locationFromPosition(startPosition), index = ref.index, offset = ref.offset;
      document = this.removeTextAtRange(range);
      return new this.constructor(document.blockList.editObjectAtIndex(index, function(block) {
        return block.copyWithText(block.text.insertTextAtPosition(text, offset));
      }));
    };

    Document.prototype.removeTextAtRange = function(range) {
      var affectedBlockCount, block, blocks, endPosition, leftBlock, leftIndex, leftLocation, leftText, ref, removingLeftBlock, rightBlock, rightIndex, rightLocation, rightText, startPosition, text, useRightBlock;
      ref = range = normalizeRange(range), startPosition = ref[0], endPosition = ref[1];
      if (rangeIsCollapsed(range)) {
        return this;
      }
      leftLocation = this.locationFromPosition(startPosition);
      leftIndex = leftLocation.index;
      leftBlock = this.getBlockAtIndex(leftIndex);
      leftText = leftBlock.text.getTextAtRange([0, leftLocation.offset]);
      rightLocation = this.locationFromPosition(endPosition);
      rightIndex = rightLocation.index;
      rightBlock = this.getBlockAtIndex(rightIndex);
      rightText = rightBlock.text.getTextAtRange([rightLocation.offset, rightBlock.getLength()]);
      text = leftText.appendText(rightText);
      removingLeftBlock = leftIndex !== rightIndex && leftLocation.offset === 0;
      useRightBlock = removingLeftBlock && leftBlock.getAttributeLevel() >= rightBlock.getAttributeLevel();
      if (useRightBlock) {
        block = rightBlock.copyWithText(text);
      } else {
        block = leftBlock.copyWithText(text);
      }
      blocks = this.blockList.toArray();
      affectedBlockCount = rightIndex + 1 - leftIndex;
      blocks.splice(leftIndex, affectedBlockCount, block);
      return new this.constructor(blocks);
    };

    Document.prototype.moveTextFromRangeToPosition = function(range, position) {
      var blocks, document, endPosition, firstBlock, movingRightward, ref, ref1, result, startPosition, text;
      ref = range = normalizeRange(range), startPosition = ref[0], endPosition = ref[1];
      if ((startPosition <= position && position <= endPosition)) {
        return this;
      }
      document = this.getDocumentAtRange(range);
      result = this.removeTextAtRange(range);
      movingRightward = startPosition < position;
      if (movingRightward) {
        position -= document.getLength();
      }
      if (!this.firstBlockInRangeIsEntirelySelected(range)) {
        ref1 = document.getBlocks(), firstBlock = ref1[0], blocks = 2 <= ref1.length ? slice.call(ref1, 1) : [];
        if (blocks.length === 0) {
          text = firstBlock.getTextWithoutBlockBreak();
          if (movingRightward) {
            position += 1;
          }
        } else {
          text = firstBlock.text;
        }
        result = result.insertTextAtRange(text, position);
        if (blocks.length === 0) {
          return result;
        }
        document = new this.constructor(blocks);
        position += text.getLength();
      }
      return result.insertDocumentAtRange(document, position);
    };

    Document.prototype.addAttributeAtRange = function(attribute, value, range) {
      var blockList;
      blockList = this.blockList;
      this.eachBlockAtRange(range, function(block, textRange, index) {
        return blockList = blockList.editObjectAtIndex(index, function() {
          if (Trix.config.blockAttributes[attribute]) {
            return block.addAttribute(attribute, value);
          } else {
            if (textRange[0] === textRange[1]) {
              return block;
            } else {
              return block.copyWithText(block.text.addAttributeAtRange(attribute, value, textRange));
            }
          }
        });
      });
      return new this.constructor(blockList);
    };

    Document.prototype.addAttribute = function(attribute, value) {
      var blockList;
      blockList = this.blockList;
      this.eachBlock(function(block, index) {
        return blockList = blockList.editObjectAtIndex(index, function() {
          return block.addAttribute(attribute, value);
        });
      });
      return new this.constructor(blockList);
    };

    Document.prototype.removeAttributeAtRange = function(attribute, range) {
      var blockList;
      blockList = this.blockList;
      this.eachBlockAtRange(range, function(block, textRange, index) {
        if (attribute === "attachment") {
          if (textRange[0] !== textRange[1]) {
            return blockList = blockList.removeObjectAtIndex(index);
          }
        } else if (Trix.config.blockAttributes[attribute]) {
          return blockList = blockList.editObjectAtIndex(index, function() {
            return block.removeAttribute(attribute);
          });
        } else if (textRange[0] !== textRange[1]) {
          return blockList = blockList.editObjectAtIndex(index, function() {
            return block.copyWithText(block.text.removeAttributeAtRange(attribute, textRange));
          });
        }
      });
      return new this.constructor(blockList);
    };

    Document.prototype.updateAttributesForAttachment = function(attributes, attachment) {
      var index, range, startPosition, text;
      startPosition = (range = this.getRangeOfAttachment(attachment))[0];
      index = this.locationFromPosition(startPosition).index;
      text = this.getTextAtIndex(index);
      return new this.constructor(this.blockList.editObjectAtIndex(index, function(block) {
        return block.copyWithText(text.updateAttributesForAttachment(attributes, attachment));
      }));
    };

    Document.prototype.removeAttributeForAttachment = function(attribute, attachment) {
      var range;
      range = this.getRangeOfAttachment(attachment);
      return this.removeAttributeAtRange(attribute, range);
    };

    Document.prototype.insertBlockBreakAtRange = function(range) {
      var blocks, document, offset, startPosition;
      startPosition = (range = normalizeRange(range))[0];
      offset = this.locationFromPosition(startPosition).offset;
      document = this.removeTextAtRange(range);
      if (offset === 0) {
        blocks = [new Trix.Block];
      }
      return new this.constructor(document.blockList.insertSplittableListAtPosition(new Trix.SplittableList(blocks), startPosition));
    };

    Document.prototype.applyBlockAttributeAtRange = function(attributeName, value, range) {
      var attribute, document, excludedAttributeName, i, len, ref, ref1, ref2;
      ref = this.expandRangeToLineBreaksAndSplitBlocks(range), document = ref.document, range = ref.range;
      attribute = Trix.config.blockAttributes[attributeName];
      if (attribute.listAttribute) {
        document = document.removeLastListAttributeAtRange(range, {
          exceptAttributeName: attributeName
        });
        ref1 = document.convertLineBreaksToBlockBreaksInRange(range), document = ref1.document, range = ref1.range;
      } else {
        document = document.consolidateBlocksAtRange(range);
      }
      if (attribute.excludesAttributes) {
        ref2 = attribute.excludesAttributes;
        for (i = 0, len = ref2.length; i < len; i++) {
          excludedAttributeName = ref2[i];
          document = document.removeAttributeAtRange(excludedAttributeName, range);
        }
      }
      return document.addAttributeAtRange(attributeName, value, range);
    };

    Document.prototype.removeLastListAttributeAtRange = function(range, options) {
      var blockList;
      if (options == null) {
        options = {};
      }
      blockList = this.blockList;
      this.eachBlockAtRange(range, function(block, textRange, index) {
        var lastAttributeName;
        if (!(lastAttributeName = block.getLastAttribute())) {
          return;
        }
        if (!Trix.config.blockAttributes[lastAttributeName].listAttribute) {
          return;
        }
        if (lastAttributeName === options.exceptAttributeName) {
          return;
        }
        return blockList = blockList.editObjectAtIndex(index, function() {
          return block.removeAttribute(lastAttributeName);
        });
      });
      return new this.constructor(blockList);
    };

    Document.prototype.firstBlockInRangeIsEntirelySelected = function(range) {
      var endPosition, leftLocation, length, ref, rightLocation, startPosition;
      ref = range = normalizeRange(range), startPosition = ref[0], endPosition = ref[1];
      leftLocation = this.locationFromPosition(startPosition);
      rightLocation = this.locationFromPosition(endPosition);
      if (leftLocation.offset === 0 && leftLocation.index < rightLocation.index) {
        return true;
      } else if (leftLocation.index === rightLocation.index) {
        length = this.getBlockAtIndex(leftLocation.index).getLength();
        return leftLocation.offset === 0 && rightLocation.offset === length;
      } else {
        return false;
      }
    };

    Document.prototype.expandRangeToLineBreaksAndSplitBlocks = function(range) {
      var document, endBlock, endLocation, endPosition, position, ref, startBlock, startLocation, startPosition;
      ref = range = normalizeRange(range), startPosition = ref[0], endPosition = ref[1];
      startLocation = this.locationFromPosition(startPosition);
      endLocation = this.locationFromPosition(endPosition);
      document = this;
      startBlock = document.getBlockAtIndex(startLocation.index);
      if ((startLocation.offset = startBlock.findLineBreakInDirectionFromPosition("backward", startLocation.offset)) != null) {
        position = document.positionFromLocation(startLocation);
        document = document.insertBlockBreakAtRange([position, position + 1]);
        endLocation.index += 1;
        endLocation.offset -= document.getBlockAtIndex(startLocation.index).getLength();
        startLocation.index += 1;
      }
      startLocation.offset = 0;
      if (endLocation.offset === 0 && endLocation.index > startLocation.index) {
        endLocation.index -= 1;
        endLocation.offset = document.getBlockAtIndex(endLocation.index).getBlockBreakPosition();
      } else {
        endBlock = document.getBlockAtIndex(endLocation.index);
        if (endBlock.text.getStringAtRange([endLocation.offset - 1, endLocation.offset]) === "\n") {
          endLocation.offset -= 1;
        } else {
          endLocation.offset = endBlock.findLineBreakInDirectionFromPosition("forward", endLocation.offset);
        }
        if (endLocation.offset !== endBlock.getBlockBreakPosition()) {
          position = document.positionFromLocation(endLocation);
          document = document.insertBlockBreakAtRange([position, position + 1]);
        }
      }
      startPosition = document.positionFromLocation(startLocation);
      endPosition = document.positionFromLocation(endLocation);
      range = normalizeRange([startPosition, endPosition]);
      return {
        document: document,
        range: range
      };
    };

    Document.prototype.convertLineBreaksToBlockBreaksInRange = function(range) {
      var document, position, string;
      position = (range = normalizeRange(range))[0];
      string = this.getStringAtRange(range).slice(0, -1);
      document = this;
      string.replace(/.*?\n/g, function(match) {
        position += match.length;
        return document = document.insertBlockBreakAtRange([position - 1, position]);
      });
      return {
        document: document,
        range: range
      };
    };

    Document.prototype.consolidateBlocksAtRange = function(range) {
      var endIndex, endPosition, ref, startIndex, startPosition;
      ref = range = normalizeRange(range), startPosition = ref[0], endPosition = ref[1];
      startIndex = this.locationFromPosition(startPosition).index;
      endIndex = this.locationFromPosition(endPosition).index;
      return new this.constructor(this.blockList.consolidateFromIndexToIndex(startIndex, endIndex));
    };

    Document.prototype.getDocumentAtRange = function(range) {
      var blocks;
      range = normalizeRange(range);
      blocks = this.blockList.getSplittableListInRange(range).toArray();
      return new this.constructor(blocks);
    };

    Document.prototype.getStringAtRange = function(range) {
      return this.getDocumentAtRange(range).toString();
    };

    Document.prototype.getBlockAtIndex = function(index) {
      return this.blockList.getObjectAtIndex(index);
    };

    Document.prototype.getBlockAtPosition = function(position) {
      var index;
      index = this.locationFromPosition(position).index;
      return this.getBlockAtIndex(index);
    };

    Document.prototype.getTextAtIndex = function(index) {
      var ref;
      return (ref = this.getBlockAtIndex(index)) != null ? ref.text : void 0;
    };

    Document.prototype.getTextAtPosition = function(position) {
      var index;
      index = this.locationFromPosition(position).index;
      return this.getTextAtIndex(index);
    };

    Document.prototype.getPieceAtPosition = function(position) {
      var index, offset, ref;
      ref = this.locationFromPosition(position), index = ref.index, offset = ref.offset;
      return this.getTextAtIndex(index).getPieceAtPosition(position);
    };

    Document.prototype.getCharacterAtPosition = function(position) {
      var index, offset, ref;
      ref = this.locationFromPosition(position), index = ref.index, offset = ref.offset;
      return this.getTextAtIndex(index).getStringAtRange([offset, offset + 1]);
    };

    Document.prototype.getLength = function() {
      return this.blockList.getEndPosition();
    };

    Document.prototype.getBlocks = function() {
      return this.blockList.toArray();
    };

    Document.prototype.getBlockCount = function() {
      return this.blockList.length;
    };

    Document.prototype.getEditCount = function() {
      return this.editCount;
    };

    Document.prototype.eachBlock = function(callback) {
      return this.blockList.eachObject(callback);
    };

    Document.prototype.eachBlockAtRange = function(range, callback) {
      var block, endLocation, endPosition, i, index, ref, ref1, ref2, results, startLocation, startPosition, textRange;
      ref = range = normalizeRange(range), startPosition = ref[0], endPosition = ref[1];
      startLocation = this.locationFromPosition(startPosition);
      endLocation = this.locationFromPosition(endPosition);
      if (startLocation.index === endLocation.index) {
        block = this.getBlockAtIndex(startLocation.index);
        textRange = [startLocation.offset, endLocation.offset];
        return callback(block, textRange, startLocation.index);
      } else {
        results = [];
        for (index = i = ref1 = startLocation.index, ref2 = endLocation.index; ref1 <= ref2 ? i <= ref2 : i >= ref2; index = ref1 <= ref2 ? ++i : --i) {
          if (block = this.getBlockAtIndex(index)) {
            textRange = (function() {
              switch (index) {
                case startLocation.index:
                  return [startLocation.offset, block.text.getLength()];
                case endLocation.index:
                  return [0, endLocation.offset];
                default:
                  return [0, block.text.getLength()];
              }
            })();
            results.push(callback(block, textRange, index));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    };

    Document.prototype.getCommonAttributesAtRange = function(range) {
      var blockAttributes, startPosition, textAttributes;
      startPosition = (range = normalizeRange(range))[0];
      if (rangeIsCollapsed(range)) {
        return this.getCommonAttributesAtPosition(startPosition);
      } else {
        textAttributes = [];
        blockAttributes = [];
        this.eachBlockAtRange(range, function(block, textRange) {
          if (textRange[0] !== textRange[1]) {
            textAttributes.push(block.text.getCommonAttributesAtRange(textRange));
            return blockAttributes.push(attributesForBlock(block));
          }
        });
        return Trix.Hash.fromCommonAttributesOfObjects(textAttributes).merge(Trix.Hash.fromCommonAttributesOfObjects(blockAttributes)).toObject();
      }
    };

    Document.prototype.getCommonAttributesAtPosition = function(position) {
      var attributes, attributesLeft, block, commonAttributes, index, inheritableAttributes, key, offset, ref, value;
      ref = this.locationFromPosition(position), index = ref.index, offset = ref.offset;
      block = this.getBlockAtIndex(index);
      if (!block) {
        return {};
      }
      commonAttributes = attributesForBlock(block);
      attributes = block.text.getAttributesAtPosition(offset);
      attributesLeft = block.text.getAttributesAtPosition(offset - 1);
      inheritableAttributes = (function() {
        var ref1, results;
        ref1 = Trix.config.textAttributes;
        results = [];
        for (key in ref1) {
          value = ref1[key];
          if (value.inheritable) {
            results.push(key);
          }
        }
        return results;
      })();
      for (key in attributesLeft) {
        value = attributesLeft[key];
        if (value === attributes[key] || indexOf.call(inheritableAttributes, key) >= 0) {
          commonAttributes[key] = value;
        }
      }
      return commonAttributes;
    };

    Document.prototype.getRangeOfCommonAttributeAtPosition = function(attributeName, position) {
      var end, endOffset, index, offset, ref, ref1, start, startOffset, text;
      ref = this.locationFromPosition(position), index = ref.index, offset = ref.offset;
      text = this.getTextAtIndex(index);
      ref1 = text.getExpandedRangeForAttributeAtOffset(attributeName, offset), startOffset = ref1[0], endOffset = ref1[1];
      start = this.positionFromLocation({
        index: index,
        offset: startOffset
      });
      end = this.positionFromLocation({
        index: index,
        offset: endOffset
      });
      return normalizeRange([start, end]);
    };

    Document.prototype.getBaseBlockAttributes = function() {
      var baseBlockAttributes, blockAttributes, blockIndex, i, index, lastAttributeIndex, ref;
      baseBlockAttributes = this.getBlockAtIndex(0).getAttributes();
      for (blockIndex = i = 1, ref = this.getBlockCount(); 1 <= ref ? i < ref : i > ref; blockIndex = 1 <= ref ? ++i : --i) {
        blockAttributes = this.getBlockAtIndex(blockIndex).getAttributes();
        lastAttributeIndex = Math.min(baseBlockAttributes.length, blockAttributes.length);
        baseBlockAttributes = (function() {
          var j, ref1, results;
          results = [];
          for (index = j = 0, ref1 = lastAttributeIndex; 0 <= ref1 ? j < ref1 : j > ref1; index = 0 <= ref1 ? ++j : --j) {
            if (blockAttributes[index] !== baseBlockAttributes[index]) {
              break;
            }
            results.push(blockAttributes[index]);
          }
          return results;
        })();
      }
      return baseBlockAttributes;
    };

    attributesForBlock = function(block) {
      var attributeName, attributes;
      attributes = {};
      if (attributeName = block.getLastAttribute()) {
        attributes[attributeName] = true;
      }
      return attributes;
    };

    Document.prototype.getAttachmentById = function(attachmentId) {
      var attachment, i, len, ref;
      ref = this.getAttachments();
      for (i = 0, len = ref.length; i < len; i++) {
        attachment = ref[i];
        if (attachment.id === attachmentId) {
          return attachment;
        }
      }
    };

    Document.prototype.getAttachments = function() {
      var block, i, len, ref, results;
      ref = this.getBlocks();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        block = ref[i];
        if (block.attachment != null) {
          results.push(block.attachment);
        }
      }
      return results;
    };

    Document.prototype.getRangeOfAttachment = function(attachment) {
      var block, i, index, len, position, ref;
      position = 0;
      ref = this.getBlocks();
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        block = ref[index];
        if (block.hasAttachment() && block.getAttachment().isEqualTo(attachment)) {
          return normalizeRange([position, position + block.text.getLength()]);
        }
        position += block.text.getLength();
      }
    };

    Document.prototype.rangeFromLocationRange = function(locationRange) {
      var leftPosition, rightPosition;
      locationRange = normalizeRange(locationRange);
      leftPosition = this.positionFromLocation(locationRange[0]);
      if (!rangeIsCollapsed(locationRange)) {
        rightPosition = this.positionFromLocation(locationRange[1]);
      }
      return [leftPosition, rightPosition != null ? rightPosition : leftPosition];
    };

    Document.prototype.locationFromPosition = function(position) {
      var blocks, location;
      location = this.blockList.findIndexAndOffsetAtPosition(Math.max(0, position));
      if (location.index != null) {
        return location;
      } else {
        blocks = this.getBlocks();
        return {
          index: blocks.length - 1,
          offset: blocks[blocks.length - 1].getLength()
        };
      }
    };

    Document.prototype.positionFromLocation = function(location) {
      return this.blockList.findPositionAtIndexAndOffset(location.index, location.offset);
    };

    Document.prototype.locationRangeFromPosition = function(position) {
      return normalizeRange(this.locationFromPosition(position));
    };

    Document.prototype.locationRangeFromRange = function(range) {
      var endLocation, endPosition, startLocation, startPosition;
      if (!(range = normalizeRange(range))) {
        return;
      }
      startPosition = range[0], endPosition = range[1];
      startLocation = this.locationFromPosition(startPosition);
      endLocation = this.locationFromPosition(endPosition);
      return normalizeRange([startLocation, endLocation]);
    };

    Document.prototype.rangeFromLocationRange = function(locationRange) {
      var leftPosition, rightPosition;
      locationRange = normalizeRange(locationRange);
      leftPosition = this.positionFromLocation(locationRange[0]);
      if (!rangeIsCollapsed(locationRange)) {
        rightPosition = this.positionFromLocation(locationRange[1]);
      }
      return normalizeRange([leftPosition, rightPosition]);
    };

    Document.prototype.isEqualTo = function(document) {
      return this.blockList.isEqualTo(document != null ? document.blockList : void 0);
    };

    Document.prototype.getTexts = function() {
      var block, i, len, ref, results;
      ref = this.getBlocks();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        block = ref[i];
        results.push(block.text);
      }
      return results;
    };

    Document.prototype.getPieces = function() {
      var i, len, pieces, ref, text;
      pieces = [];
      ref = this.getTexts();
      for (i = 0, len = ref.length; i < len; i++) {
        text = ref[i];
        pieces.push.apply(pieces, text.getPieces());
      }
      return pieces;
    };

    Document.prototype.getObjects = function() {
      return this.getBlocks().concat(this.getTexts()).concat(this.getPieces());
    };

    Document.prototype.toSerializableDocument = function() {
      var blocks;
      blocks = [];
      this.blockList.eachObject(function(block) {
        return blocks.push(block.copyWithText(block.text.toSerializableText()));
      });
      return new this.constructor(blocks);
    };

    Document.prototype.toString = function() {
      return this.blockList.toString();
    };

    Document.prototype.toJSON = function() {
      return this.blockList.toJSON();
    };

    Document.prototype.toConsole = function() {
      var block;
      return JSON.stringify((function() {
        var i, len, ref, results;
        ref = this.blockList.toArray();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          block = ref[i];
          results.push(JSON.parse(block.text.toConsole()));
        }
        return results;
      }).call(this));
    };

    return Document;

  })(Trix.Object);

}).call(this);
(function() {
  var extend, normalizeRange, objectsAreEqual, rangesAreEqual, summarizeArrayChange, urlRegex,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  normalizeRange = Trix.normalizeRange, rangesAreEqual = Trix.rangesAreEqual, objectsAreEqual = Trix.objectsAreEqual, summarizeArrayChange = Trix.summarizeArrayChange, extend = Trix.extend;

  urlRegex = require('regex-weburl');

  Trix.Composition = (function(superClass) {
    var placeholder;

    extend1(Composition, superClass);

    function Composition() {
      this.document = new Trix.Document;
      this.attachments = [];
      this.currentAttributes = {};
      this.revision = 0;
    }

    Composition.prototype.setDocument = function(document) {
      var ref;
      if (!document.isEqualTo(this.document)) {
        this.document = document;
        this.refreshAttachments();
        this.revision++;
        return (ref = this.delegate) != null ? typeof ref.compositionDidChangeDocument === "function" ? ref.compositionDidChangeDocument(document) : void 0 : void 0;
      }
    };

    Composition.prototype.getSnapshot = function() {
      return {
        document: this.document,
        selectedRange: this.getSelectedRange()
      };
    };

    Composition.prototype.loadSnapshot = function(arg) {
      var document, ref, ref1, selectedRange;
      document = arg.document, selectedRange = arg.selectedRange;
      if ((ref = this.delegate) != null) {
        if (typeof ref.compositionWillLoadSnapshot === "function") {
          ref.compositionWillLoadSnapshot();
        }
      }
      this.setDocument(document != null ? document : new Trix.Document);
      this.setSelection(selectedRange != null ? selectedRange : [0, 0]);
      return (ref1 = this.delegate) != null ? typeof ref1.compositionDidLoadSnapshot === "function" ? ref1.compositionDidLoadSnapshot() : void 0 : void 0;
    };

    Composition.prototype.insertText = function(text, arg) {
      var endPosition, selectedRange, startPosition, updatePosition;
      updatePosition = (arg != null ? arg : {
        updatePosition: true
      }).updatePosition;
      selectedRange = this.getSelectedRange();
      this.setDocument(this.document.insertTextAtRange(text, selectedRange));
      startPosition = selectedRange[0];
      endPosition = startPosition + text.getLength();
      if (updatePosition) {
        this.setSelection(endPosition);
      }
      return this.notifyDelegateOfInsertionAtRange([startPosition, endPosition]);
    };

    Composition.prototype.insertBlock = function(block) {
      var document;
      if (block == null) {
        block = new Trix.Block;
      }
      document = new Trix.Document([block]);
      return this.insertDocument(document);
    };

    Composition.prototype.insertDocument = function(document) {
      var endPosition, selectedRange, startPosition;
      if (document == null) {
        document = new Trix.Document;
      }
      selectedRange = this.getSelectedRange();
      this.setDocument(this.document.insertDocumentAtRange(document, selectedRange));
      startPosition = selectedRange[0];
      endPosition = startPosition + document.getLength();
      this.setSelection(endPosition);
      return this.notifyDelegateOfInsertionAtRange([startPosition, endPosition]);
    };

    Composition.prototype.insertString = function(string, options) {
      var attributes, text;
      if (urlRegex.test(string)) {
        return this.insertLink(string, string);
      }
      attributes = this.getCurrentTextAttributes();
      text = Trix.Text.textForStringWithAttributes(string, attributes);
      return this.insertText(text, options);
    };

    Composition.prototype.insertBlockBreak = function() {
      var endPosition, selectedRange, startPosition;
      selectedRange = this.getSelectedRange();
      this.setDocument(this.document.insertBlockBreakAtRange(selectedRange));
      startPosition = selectedRange[0];
      endPosition = startPosition + 1;
      this.setSelection(endPosition);
      return this.notifyDelegateOfInsertionAtRange([startPosition, endPosition]);
    };

    Composition.prototype.breakFormattedBlock = function() {
      var block, document, index, newDocument, offset, position, range, ref;
      position = this.getPosition();
      range = [position - 1, position];
      document = this.document;
      ref = document.locationFromPosition(position), index = ref.index, offset = ref.offset;
      block = document.getBlockAtIndex(index);
      if (block.getBlockBreakPosition() === offset) {
        document = document.removeTextAtRange(range);
        range = [position, position];
      } else {
        if (block.text.getStringAtRange([offset, offset + 1]) === "\n") {
          range = [position - 1, position + 1];
        } else {
          position += 1;
        }
      }
      newDocument = new Trix.Document([block.removeLastAttribute().copyWithoutText()]);
      this.setDocument(document.insertDocumentAtRange(newDocument, range));
      return this.setSelection(position);
    };

    Composition.prototype.insertLineBreak = function() {
      var block, document, endLocation, endPosition, ref, startLocation, startPosition;
      ref = this.getSelectedRange(), startPosition = ref[0], endPosition = ref[1];
      startLocation = this.document.locationFromPosition(startPosition);
      endLocation = this.document.locationFromPosition(endPosition);
      block = this.document.getBlockAtIndex(endLocation.index);
      if (block.hasAttributes()) {
        if (block.isHeading() && endLocation.offset === block.getBlockBreakPosition()) {
          if (block.isEmpty()) {
            return this.removeLastBlockAttribute();
          } else {
            return this.insertBlock();
          }
        } else if (block.isListItem()) {
          if (block.isEmpty()) {
            this.decreaseListLevel();
            return this.setSelection(startPosition);
          } else if (startLocation.offset === 0) {
            document = new Trix.Document([block.copyWithoutText()]);
            return this.insertDocument(document);
          } else {
            return this.insertBlockBreak();
          }
        } else {
          if (block.isEmpty()) {
            return this.removeLastBlockAttribute();
          } else if (block.text.getStringAtRange([endLocation.offset - 1, endLocation.offset]) === "\n") {
            return this.breakFormattedBlock();
          } else {
            return this.insertString("\n");
          }
        }
      } else {
        return this.insertString("\n");
      }
    };

    Composition.prototype.insertLink = function(href, title) {
      var text;
      text = Trix.Text.textForStringWithAttributes(title, {
        href: href
      });
      this.insertText(text);
      this.currentAttributes["href"] = href;
      return this.notifyDelegateOfCurrentAttributesChange();
    };

    Composition.prototype.insertHTML = function(html) {
      var document, endLength, endPosition, startLength, startPosition;
      startPosition = this.getPosition();
      startLength = this.document.getLength();
      document = Trix.Document.fromHTML(html);
      this.setDocument(this.document.mergeDocumentAtRange(document, this.getSelectedRange()));
      endLength = this.document.getLength();
      endPosition = startPosition + (endLength - startLength);
      this.setSelection(endPosition);
      return this.notifyDelegateOfInsertionAtRange([endPosition, endPosition]);
    };

    Composition.prototype.replaceHTML = function(html) {
      var document, pointRange;
      document = Trix.Document.fromHTML(html).copyUsingObjectsFromDocument(this.document);
      pointRange = this.getSelectedPointRange();
      this.setDocument(document);
      return this.setSelectionPointRange(pointRange);
    };

    Composition.prototype.insertFile = function(file) {
      var attachment, ref;
      if ((ref = this.delegate) != null ? ref.compositionShouldAcceptFile(file) : void 0) {
        attachment = Trix.Attachment.attachmentForFile(file);
        return this.insertAttachment(attachment);
      }
    };

    Composition.prototype.insertAttachment = function(attachment) {
      var block, blocks, document, endPosition, ref, startPosition;
      block = Trix.Block.blockForAttachment(attachment);
      blocks = [block];
      ref = this.getSelectedRange(), startPosition = ref[0], endPosition = ref[1];
      if (endPosition === this.document.getLength() - 1) {
        blocks.push(new Trix.Block);
      }
      document = new Trix.Document(blocks);
      return this.insertDocument(document);
    };

    Composition.prototype.deleteInDirection = function(direction) {
      var attachment, block, endPosition, range, ref, startLocation, startPosition;
      range = (ref = this.getSelectedRange(), startPosition = ref[0], endPosition = ref[1], ref);
      block = this.getBlock();
      if (startPosition === endPosition) {
        startLocation = this.document.locationFromPosition(startPosition);
        if (direction === "backward" && startLocation.offset === 0) {
          if (this.canDecreaseBlockAttributeLevel()) {
            if (block.isListItem()) {
              this.decreaseListLevel();
            } else {
              this.decreaseBlockAttributeLevel();
            }
            this.setSelection(startPosition);
            if (block.isEmpty()) {
              return;
            }
          }
        }
        range = this.getExpandedRangeInDirection(direction);
      }
      if (attachment = this.getAttachmentAtRange(range)) {
        this.removeAttachment(attachment);
        return false;
      } else {
        this.setDocument(this.document.removeTextAtRange(range));
        this.setSelection(range[0]);
        if (block.isListItem()) {
          return false;
        }
      }
    };

    Composition.prototype.moveTextFromRange = function(range) {
      var position;
      position = this.getSelectedRange()[0];
      this.setDocument(this.document.moveTextFromRangeToPosition(range, position));
      return this.setSelection(position);
    };

    Composition.prototype.removeAttachment = function(attachment) {
      var range;
      if (range = this.document.getRangeOfAttachment(attachment)) {
        this.stopEditingAttachment();
        this.setDocument(this.document.removeAttributeAtRange("attachment", range));
        return this.setSelection(range[0]);
      }
    };

    Composition.prototype.removeLastBlockAttribute = function() {
      var block, endPosition, ref, startPosition;
      ref = this.getSelectedRange(), startPosition = ref[0], endPosition = ref[1];
      block = this.document.getBlockAtPosition(endPosition);
      this.removeCurrentAttribute(block.getLastAttribute());
      return this.setSelection(startPosition);
    };

    placeholder = " ";

    Composition.prototype.insertPlaceholder = function() {
      this.placeholderPosition = this.getPosition();
      this.insertString(placeholder);
      return placeholder;
    };

    Composition.prototype.selectPlaceholder = function() {
      if (this.placeholderPosition != null) {
        this.setSelectedRange([this.placeholderPosition, this.placeholderPosition + placeholder.length]);
        return true;
      }
    };

    Composition.prototype.forgetPlaceholder = function() {
      return this.placeholderPosition = null;
    };

    Composition.prototype.hasCurrentAttribute = function(attributeName) {
      return this.currentAttributes[attributeName] != null;
    };

    Composition.prototype.toggleCurrentAttribute = function(attributeName) {
      var value;
      if (value = !this.currentAttributes[attributeName]) {
        return this.setCurrentAttribute(attributeName, value);
      } else {
        return this.removeCurrentAttribute(attributeName);
      }
    };

    Composition.prototype.canSetCurrentAttribute = function(attributeName) {
      switch (attributeName) {
        case "href":
          return !this.selectionContainsAttachmentWithAttribute(attributeName);
        default:
          return true;
      }
    };

    Composition.prototype.setCurrentAttribute = function(attributeName, value) {
      if (Trix.config.blockAttributes[attributeName]) {
        return this.setBlockAttribute(attributeName, value);
      } else {
        this.setTextAttribute(attributeName, value);
        this.currentAttributes[attributeName] = value;
        return this.notifyDelegateOfCurrentAttributesChange();
      }
    };

    Composition.prototype.setTextAttribute = function(attributeName, value) {
      var endPosition, selectedRange, startPosition, text;
      if (!(selectedRange = this.getSelectedRange())) {
        return;
      }
      startPosition = selectedRange[0], endPosition = selectedRange[1];
      if (startPosition === endPosition) {
        if (attributeName === "href") {
          text = Trix.Text.textForStringWithAttributes(value, {
            href: value
          });
          return this.insertText(text);
        }
      } else {
        return this.setDocument(this.document.addAttributeAtRange(attributeName, value, selectedRange));
      }
    };

    Composition.prototype.setBlockAttribute = function(attributeName, value) {
      var selectedRange;
      if (!(selectedRange = this.getSelectedRange())) {
        return;
      }
      this.setDocument(this.document.applyBlockAttributeAtRange(attributeName, value, selectedRange));
      return this.setSelection(selectedRange);
    };

    Composition.prototype.removeCurrentAttribute = function(attributeName) {
      if (Trix.config.blockAttributes[attributeName]) {
        this.removeBlockAttribute(attributeName);
        return this.updateCurrentAttributes();
      } else {
        this.removeTextAttribute(attributeName);
        delete this.currentAttributes[attributeName];
        return this.notifyDelegateOfCurrentAttributesChange();
      }
    };

    Composition.prototype.removeTextAttribute = function(attributeName) {
      var selectedRange;
      if (!(selectedRange = this.getSelectedRange())) {
        return;
      }
      return this.setDocument(this.document.removeAttributeAtRange(attributeName, selectedRange));
    };

    Composition.prototype.removeBlockAttribute = function(attributeName) {
      var selectedRange;
      if (!(selectedRange = this.getSelectedRange())) {
        return;
      }
      return this.setDocument(this.document.removeAttributeAtRange(attributeName, selectedRange));
    };

    Composition.prototype.increaseBlockAttributeLevel = function() {
      var attribute, ref;
      if (attribute = (ref = this.getBlock()) != null ? ref.getLastAttribute() : void 0) {
        return this.setCurrentAttribute(attribute);
      }
    };

    Composition.prototype.decreaseBlockAttributeLevel = function() {
      var attribute, ref;
      if (attribute = (ref = this.getBlock()) != null ? ref.getLastAttribute() : void 0) {
        return this.removeCurrentAttribute(attribute);
      }
    };

    Composition.prototype.decreaseListLevel = function() {
      var attributeLevel, block, endIndex, endPosition, index, startPosition;
      startPosition = this.getSelectedRange()[0];
      index = this.document.locationFromPosition(startPosition).index;
      endIndex = index;
      attributeLevel = this.getBlock().getAttributeLevel();
      while (block = this.document.getBlockAtIndex(endIndex + 1)) {
        if (!(block.isListItem() && block.getAttributeLevel() > attributeLevel)) {
          break;
        }
        endIndex++;
      }
      startPosition = this.document.positionFromLocation({
        index: index,
        offset: 0
      });
      endPosition = this.document.positionFromLocation({
        index: endIndex,
        offset: 0
      });
      return this.setDocument(this.document.removeLastListAttributeAtRange([startPosition, endPosition]));
    };

    Composition.prototype.canIncreaseBlockAttributeLevel = function() {
      var block, level, nestable, previousBlock;
      if (!(block = this.getBlock())) {
        return;
      }
      nestable = block.getConfig("nestable");
      if (nestable != null) {
        return nestable;
      } else if (block.isListItem()) {
        if (previousBlock = this.getPreviousBlock()) {
          level = block.getAttributeLevel();
          return previousBlock.getAttributeAtLevel(level) === block.getAttributeAtLevel(level);
        }
      }
    };

    Composition.prototype.canDecreaseBlockAttributeLevel = function() {
      var ref;
      return ((ref = this.getBlock()) != null ? ref.getAttributeLevel() : void 0) > 0;
    };

    Composition.prototype.updateCurrentAttributes = function() {
      var commonAttributes, selectedRange;
      if (selectedRange = this.getSelectedRange({
        ignoreLock: true
      })) {
        commonAttributes = this.document.getCommonAttributesAtRange(selectedRange);
        if (!objectsAreEqual(commonAttributes, this.currentAttributes)) {
          this.currentAttributes = commonAttributes;
          return this.notifyDelegateOfCurrentAttributesChange();
        }
      }
    };

    Composition.prototype.getCurrentAttributes = function() {
      return extend.call({}, this.currentAttributes);
    };

    Composition.prototype.getCurrentTextAttributes = function() {
      var attributes, key, ref, value;
      attributes = {};
      ref = this.currentAttributes;
      for (key in ref) {
        value = ref[key];
        if (Trix.config.textAttributes[key]) {
          attributes[key] = value;
        }
      }
      return attributes;
    };

    Composition.prototype.freezeSelection = function() {
      return this.setCurrentAttribute("frozen", true);
    };

    Composition.prototype.thawSelection = function() {
      return this.removeCurrentAttribute("frozen");
    };

    Composition.prototype.hasFrozenSelection = function() {
      return this.hasCurrentAttribute("frozen");
    };

    Composition.proxyMethod("getSelectionManager().getSelectedPointRange");

    Composition.proxyMethod("getSelectionManager().setLocationRangeFromPointRange");

    Composition.proxyMethod("getSelectionManager().locationIsCursorTarget");

    Composition.proxyMethod("getSelectionManager().selectionIsExpanded");

    Composition.proxyMethod("delegate?.getSelectionManager");

    Composition.prototype.setSelection = function(selectedRange) {
      var locationRange, ref;
      locationRange = this.document.locationRangeFromRange(selectedRange);
      return (ref = this.delegate) != null ? ref.compositionDidRequestChangingSelection({
        locationRange: locationRange
      }) : void 0;
    };

    Composition.prototype.setSelectionPointRange = function(pointRange) {
      var ref;
      return (ref = this.delegate) != null ? ref.compositionDidRequestChangingSelection({
        pointRange: pointRange
      }) : void 0;
    };

    Composition.prototype.getSelectedRange = function() {
      var locationRange;
      if (locationRange = this.getLocationRange()) {
        return this.document.rangeFromLocationRange(locationRange);
      }
    };

    Composition.prototype.setSelectedRange = function(selectedRange) {
      var locationRange;
      locationRange = this.document.locationRangeFromRange(selectedRange);
      return this.getSelectionManager().setLocationRange(locationRange);
    };

    Composition.prototype.getPosition = function() {
      var locationRange;
      if (locationRange = this.getLocationRange()) {
        return this.document.positionFromLocation(locationRange[0]);
      }
    };

    Composition.prototype.getLocationRange = function() {
      var ref;
      return (ref = this.getSelectionManager().getLocationRange()) != null ? ref : normalizeRange({
        index: 0,
        offset: 0
      });
    };

    Composition.prototype.getExpandedRangeInDirection = function(direction) {
      var endPosition, ref, startPosition;
      ref = this.getSelectedRange(), startPosition = ref[0], endPosition = ref[1];
      if (direction === "backward") {
        startPosition = this.translateUTF16PositionFromOffset(startPosition, -1);
      } else {
        endPosition = this.translateUTF16PositionFromOffset(endPosition, 1);
      }
      return normalizeRange([startPosition, endPosition]);
    };

    Composition.prototype.moveCursorInDirection = function(direction) {
      var attachment, canEditAttachment, range, selectedRange;
      if (this.editingAttachment) {
        range = this.document.getRangeOfAttachment(this.editingAttachment);
      } else {
        selectedRange = this.getSelectedRange();
        range = this.getExpandedRangeInDirection(direction);
        canEditAttachment = !rangesAreEqual(selectedRange, range);
      }
      if (direction === "backward") {
        this.setSelectedRange(range[0]);
      } else {
        this.setSelectedRange(range[1]);
      }
      if (canEditAttachment) {
        if (attachment = this.getAttachmentAtRange(range)) {
          return this.editAttachment(attachment);
        }
      }
    };

    Composition.prototype.expandSelectionInDirection = function(direction) {
      var range;
      range = this.getExpandedRangeInDirection(direction);
      return this.setSelectedRange(range);
    };

    Composition.prototype.expandSelectionForEditing = function() {
      if (this.hasCurrentAttribute("href")) {
        return this.expandSelectionAroundCommonAttribute("href");
      }
    };

    Composition.prototype.expandSelectionAroundCommonAttribute = function(attributeName) {
      var position, range;
      position = this.getPosition();
      range = this.document.getRangeOfCommonAttributeAtPosition(attributeName, position);
      return this.setSelectedRange(range);
    };

    Composition.prototype.selectionContainsAttachmentWithAttribute = function(attributeName) {
      var attachment, i, len, ref, selectedRange;
      if (selectedRange = this.getSelectedRange()) {
        ref = this.document.getDocumentAtRange(selectedRange).getAttachments();
        for (i = 0, len = ref.length; i < len; i++) {
          attachment = ref[i];
          if (attachment.hasAttribute(attributeName)) {
            return true;
          }
        }
        return false;
      }
    };

    Composition.prototype.selectionIsInCursorTarget = function() {
      return this.editingAttachment || this.positionIsCursorTarget(this.getPosition());
    };

    Composition.prototype.positionIsCursorTarget = function(position) {
      var location;
      if (location = this.document.locationFromPosition(position)) {
        return this.locationIsCursorTarget(location);
      }
    };

    Composition.prototype.getSelectedDocument = function() {
      var selectedRange;
      if (selectedRange = this.getSelectedRange()) {
        return this.document.getDocumentAtRange(selectedRange);
      }
    };

    Composition.prototype.getAttachments = function() {
      return this.attachments.slice(0);
    };

    Composition.prototype.refreshAttachments = function() {
      var added, attachment, attachments, i, j, len, len1, ref, ref1, ref2, removed;
      attachments = this.document.getAttachments();
      ref = summarizeArrayChange(this.attachments, attachments), added = ref.added, removed = ref.removed;
      for (i = 0, len = removed.length; i < len; i++) {
        attachment = removed[i];
        attachment.delegate = null;
        if ((ref1 = this.delegate) != null) {
          if (typeof ref1.compositionDidRemoveAttachment === "function") {
            ref1.compositionDidRemoveAttachment(attachment);
          }
        }
      }
      for (j = 0, len1 = added.length; j < len1; j++) {
        attachment = added[j];
        attachment.delegate = this;
        if ((ref2 = this.delegate) != null) {
          if (typeof ref2.compositionDidAddAttachment === "function") {
            ref2.compositionDidAddAttachment(attachment);
          }
        }
      }
      return this.attachments = attachments;
    };

    Composition.prototype.attachmentDidChangeAttributes = function(attachment) {
      var ref;
      this.revision++;
      return (ref = this.delegate) != null ? typeof ref.compositionDidEditAttachment === "function" ? ref.compositionDidEditAttachment(attachment) : void 0 : void 0;
    };

    Composition.prototype.editAttachment = function(attachment) {
      var ref;
      if (attachment === this.editingAttachment) {
        return;
      }
      this.stopEditingAttachment();
      this.editingAttachment = attachment;
      return (ref = this.delegate) != null ? typeof ref.compositionDidStartEditingAttachment === "function" ? ref.compositionDidStartEditingAttachment(this.editingAttachment) : void 0 : void 0;
    };

    Composition.prototype.stopEditingAttachment = function() {
      var ref;
      if (!this.editingAttachment) {
        return;
      }
      if ((ref = this.delegate) != null) {
        if (typeof ref.compositionDidStopEditingAttachment === "function") {
          ref.compositionDidStopEditingAttachment(this.editingAttachment);
        }
      }
      return this.editingAttachment = null;
    };

    Composition.prototype.updateAttributesForAttachment = function(attributes, attachment) {
      return this.setDocument(this.document.updateAttributesForAttachment(attributes, attachment));
    };

    Composition.prototype.removeAttributeForAttachment = function(attribute, attachment) {
      return this.setDocument(this.document.removeAttributeForAttachment(attribute, attachment));
    };

    Composition.prototype.getPreviousBlock = function() {
      var index, locationRange;
      if (locationRange = this.getLocationRange()) {
        index = locationRange[0].index;
        if (index > 0) {
          return this.document.getBlockAtIndex(index - 1);
        }
      }
    };

    Composition.prototype.getBlock = function() {
      var locationRange;
      if (locationRange = this.getLocationRange()) {
        return this.document.getBlockAtIndex(locationRange[0].index);
      }
    };

    Composition.prototype.getAttachmentAtRange = function(range) {
      var document;
      document = this.document.getDocumentAtRange(range);
      if (document.toString() === ("" + Trix.OBJECT_REPLACEMENT_CHARACTER)) {
        return document.getAttachments()[0];
      }
    };

    Composition.prototype.notifyDelegateOfCurrentAttributesChange = function() {
      var ref;
      return (ref = this.delegate) != null ? typeof ref.compositionDidChangeCurrentAttributes === "function" ? ref.compositionDidChangeCurrentAttributes(this.currentAttributes) : void 0 : void 0;
    };

    Composition.prototype.notifyDelegateOfInsertionAtRange = function(range) {
      var ref;
      return (ref = this.delegate) != null ? typeof ref.compositionDidPerformInsertionAtRange === "function" ? ref.compositionDidPerformInsertionAtRange(range) : void 0 : void 0;
    };

    Composition.prototype.translateUTF16PositionFromOffset = function(position, offset) {
      var utf16position, utf16string;
      utf16string = this.document.toUTF16String();
      utf16position = utf16string.offsetFromUCS2Offset(position);
      return utf16string.offsetToUCS2Offset(utf16position + offset);
    };

    return Composition;

  })(Trix.BasicObject);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.UndoManager = (function(superClass) {
    var entryHasDescriptionAndContext;

    extend(UndoManager, superClass);

    function UndoManager(composition) {
      this.composition = composition;
      this.undoEntries = [];
      this.redoEntries = [];
    }

    UndoManager.prototype.recordUndoEntry = function(description, arg) {
      var consolidatable, context, previousEntry, ref, undoEntry;
      ref = arg != null ? arg : {}, context = ref.context, consolidatable = ref.consolidatable;
      previousEntry = this.undoEntries.slice(-1)[0];
      if (!(consolidatable && entryHasDescriptionAndContext(previousEntry, description, context))) {
        undoEntry = this.createEntry({
          description: description,
          context: context
        });
        this.undoEntries.push(undoEntry);
        return this.redoEntries = [];
      }
    };

    UndoManager.prototype.undo = function() {
      var redoEntry, undoEntry;
      if (undoEntry = this.undoEntries.pop()) {
        redoEntry = this.createEntry(undoEntry);
        this.redoEntries.push(redoEntry);
        return this.composition.loadSnapshot(undoEntry.snapshot);
      }
    };

    UndoManager.prototype.redo = function() {
      var redoEntry, undoEntry;
      if (redoEntry = this.redoEntries.pop()) {
        undoEntry = this.createEntry(redoEntry);
        this.undoEntries.push(undoEntry);
        return this.composition.loadSnapshot(redoEntry.snapshot);
      }
    };

    UndoManager.prototype.canUndo = function() {
      return this.undoEntries.length > 0;
    };

    UndoManager.prototype.canRedo = function() {
      return this.redoEntries.length > 0;
    };

    UndoManager.prototype.createEntry = function(arg) {
      var context, description, ref;
      ref = arg != null ? arg : {}, description = ref.description, context = ref.context;
      return {
        description: description != null ? description.toString() : void 0,
        context: JSON.stringify(context),
        snapshot: this.composition.getSnapshot()
      };
    };

    entryHasDescriptionAndContext = function(entry, description, context) {
      return (entry != null ? entry.description : void 0) === (description != null ? description.toString() : void 0) && (entry != null ? entry.context : void 0) === JSON.stringify(context);
    };

    return UndoManager;

  })(Trix.BasicObject);

}).call(this);
(function() {
  Trix.Editor = (function() {
    function Editor(composition, selectionManager, element) {
      this.composition = composition;
      this.selectionManager = selectionManager;
      this.element = element;
      this.undoManager = new Trix.UndoManager(this.composition);
    }

    Editor.prototype.loadDocument = function(document) {
      return this.loadSnapshot({
        document: document,
        selectedRange: [0, 0]
      });
    };

    Editor.prototype.loadHTML = function(html) {
      if (html == null) {
        html = "";
      }
      return this.loadDocument(Trix.Document.fromHTML(html, {
        referenceElement: this.element
      }));
    };

    Editor.prototype.loadJSON = function(arg) {
      var document, selectedRange;
      document = arg.document, selectedRange = arg.selectedRange;
      document = Trix.Document.fromJSON(document);
      return this.loadSnapshot({
        document: document,
        selectedRange: selectedRange
      });
    };

    Editor.prototype.loadSnapshot = function(snapshot) {
      this.undoManager = new Trix.UndoManager(this.composition);
      return this.composition.loadSnapshot(snapshot);
    };

    Editor.prototype.getDocument = function() {
      return this.composition.document;
    };

    Editor.prototype.getSelectedDocument = function() {
      return this.composition.getSelectedDocument();
    };

    Editor.prototype.getSnapshot = function() {
      return this.composition.getSnapshot();
    };

    Editor.prototype.toJSON = function() {
      return this.getSnapshot();
    };

    Editor.prototype.deleteInDirection = function(direction) {
      return this.composition.deleteInDirection(direction);
    };

    Editor.prototype.insertAttachment = function(attachment) {
      return this.composition.insertAttachment(attachment);
    };

    Editor.prototype.insertDocument = function(document) {
      return this.composition.insertDocument(document);
    };

    Editor.prototype.insertFile = function(file) {
      return this.composition.insertFile(file);
    };

    Editor.prototype.insertHTML = function(html) {
      return this.composition.insertHTML(html);
    };

    Editor.prototype.insertString = function(string) {
      return this.composition.insertString(string);
    };

    Editor.prototype.insertText = function(text) {
      return this.composition.insertText(text);
    };

    Editor.prototype.insertLineBreak = function() {
      return this.composition.insertLineBreak();
    };

    Editor.prototype.getSelectedRange = function() {
      return this.composition.getSelectedRange();
    };

    Editor.prototype.getPosition = function() {
      return this.composition.getPosition();
    };

    Editor.prototype.getClientRectAtPosition = function(position) {
      var locationRange;
      locationRange = this.getDocument().locationRangeFromRange([position, position + 1]);
      return this.selectionManager.getClientRectAtLocationRange(locationRange);
    };

    Editor.prototype.expandSelectionInDirection = function(direction) {
      return this.composition.expandSelectionInDirection(direction);
    };

    Editor.prototype.moveCursorInDirection = function(direction) {
      return this.composition.moveCursorInDirection(direction);
    };

    Editor.prototype.setSelectedRange = function(selectedRange) {
      return this.composition.setSelectedRange(selectedRange);
    };

    Editor.prototype.activateAttribute = function(name, value) {
      if (value == null) {
        value = true;
      }
      return this.composition.setCurrentAttribute(name, value);
    };

    Editor.prototype.attributeIsActive = function(name) {
      return this.composition.hasCurrentAttribute(name);
    };

    Editor.prototype.canActivateAttribute = function(name) {
      return this.composition.canSetCurrentAttribute(name);
    };

    Editor.prototype.deactivateAttribute = function(name) {
      return this.composition.removeCurrentAttribute(name);
    };

    Editor.prototype.canDecreaseIndentationLevel = function() {
      return this.composition.canDecreaseBlockAttributeLevel();
    };

    Editor.prototype.canIncreaseIndentationLevel = function() {
      return this.composition.canIncreaseBlockAttributeLevel();
    };

    Editor.prototype.decreaseIndentationLevel = function() {
      if (this.canDecreaseIndentationLevel()) {
        return this.composition.decreaseBlockAttributeLevel();
      }
    };

    Editor.prototype.increaseIndentationLevel = function() {
      if (this.canIncreaseIndentationLevel()) {
        return this.composition.increaseBlockAttributeLevel();
      }
    };

    Editor.prototype.canRedo = function() {
      return this.undoManager.canRedo();
    };

    Editor.prototype.canUndo = function() {
      return this.undoManager.canUndo();
    };

    Editor.prototype.recordUndoEntry = function(description, arg) {
      var consolidatable, context, ref;
      ref = arg != null ? arg : {}, context = ref.context, consolidatable = ref.consolidatable;
      return this.undoManager.recordUndoEntry(description, {
        context: context,
        consolidatable: consolidatable
      });
    };

    Editor.prototype.redo = function() {
      if (this.canRedo()) {
        return this.undoManager.redo();
      }
    };

    Editor.prototype.undo = function() {
      if (this.canUndo()) {
        return this.undoManager.undo();
      }
    };

    return Editor;

  })();

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.ImagePreloadOperation = (function(superClass) {
    extend(ImagePreloadOperation, superClass);

    function ImagePreloadOperation(url) {
      this.url = url;
    }

    ImagePreloadOperation.prototype.perform = function(callback) {
      var image;
      image = new Image;
      image.onload = (function(_this) {
        return function() {
          image.width = _this.width = image.naturalWidth;
          image.height = _this.height = image.naturalHeight;
          return callback(true, image);
        };
      })(this);
      image.onerror = function() {
        return callback(false);
      };
      return image.src = this.url;
    };

    return ImagePreloadOperation;

  })(Trix.Operation);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.Attachment = (function(superClass) {
    extend(Attachment, superClass);

    Attachment.previewablePattern = /^image(\/(gif|png|jpe?g)|$)/;

    Attachment.attachmentForFile = function(file) {
      var attachment, attributes;
      attributes = this.attributesForFile(file);
      attachment = new this(attributes);
      attachment.setFile(file);
      return attachment;
    };

    Attachment.attributesForFile = function(file) {
      return new Trix.Hash({
        eid: file.EID,
        filename: file.name,
        filesize: file.size,
        contentType: file.type
      });
    };

    Attachment.fromJSON = function(attachmentJSON) {
      return new this(attachmentJSON);
    };

    function Attachment(attributes) {
      if (attributes == null) {
        attributes = {};
      }
      this.releaseFile = bind(this.releaseFile, this);
      Attachment.__super__.constructor.apply(this, arguments);
      this.attributes = Trix.Hash.box(attributes);
      this.didChangeAttributes();
    }

    Attachment.prototype.getAttribute = function(attribute) {
      return this.attributes.get(attribute);
    };

    Attachment.prototype.hasAttribute = function(attribute) {
      return this.attributes.has(attribute);
    };

    Attachment.prototype.getAttributes = function() {
      return this.attributes.toObject();
    };

    Attachment.prototype.setAttributes = function(attributes) {
      var newAttributes, ref;
      if (attributes == null) {
        attributes = {};
      }
      newAttributes = this.attributes.merge(attributes);
      if (!this.attributes.isEqualTo(newAttributes)) {
        this.attributes = newAttributes;
        this.didChangeAttributes();
        return (ref = this.delegate) != null ? typeof ref.attachmentDidChangeAttributes === "function" ? ref.attachmentDidChangeAttributes(this) : void 0 : void 0;
      }
    };

    Attachment.prototype.didChangeAttributes = function() {
      if (this.isPreviewable()) {
        return this.preloadURL();
      }
    };

    Attachment.prototype.isPending = function() {
      return (this.file != null) && !(this.getURL() || this.getHref());
    };

    Attachment.prototype.isPreviewable = function() {
      if (this.attributes.has("previewable")) {
        return this.attributes.get("previewable");
      } else {
        return this.constructor.previewablePattern.test(this.getContentType());
      }
    };

    Attachment.prototype.getType = function() {
      if (this.hasContent()) {
        return "content";
      } else if (this.isPreviewable()) {
        return "preview";
      } else {
        return "file";
      }
    };

    Attachment.prototype.getURL = function() {
      return this.attributes.get("url");
    };

    Attachment.prototype.getHref = function() {
      return this.attributes.get("href");
    };

    Attachment.prototype.getFilename = function() {
      var ref;
      return (ref = this.attributes.get("filename")) != null ? ref : "";
    };

    Attachment.prototype.getFilesize = function() {
      return this.attributes.get("filesize");
    };

    Attachment.prototype.getFormattedFilesize = function() {
      var filesize;
      filesize = this.attributes.get("filesize");
      if (typeof filesize === "number") {
        return Trix.config.fileSize.formatter(filesize);
      } else {
        return "";
      }
    };

    Attachment.prototype.getExtension = function() {
      var ref;
      return (ref = this.getFilename().match(/\.(\w+)$/)) != null ? ref[1].toLowerCase() : void 0;
    };

    Attachment.prototype.getContentType = function() {
      return this.attributes.get("contentType");
    };

    Attachment.prototype.hasContent = function() {
      return this.attributes.has("content");
    };

    Attachment.prototype.getContent = function() {
      return this.attributes.get("content");
    };

    Attachment.prototype.getWidth = function() {
      return this.attributes.get("width");
    };

    Attachment.prototype.getHeight = function() {
      return this.attributes.get("height");
    };

    Attachment.prototype.getFile = function() {
      return this.file;
    };

    Attachment.prototype.setFile = function(file1) {
      this.file = file1;
      if (this.isPreviewable()) {
        return this.preloadFile();
      }
    };

    Attachment.prototype.releaseFile = function() {
      this.releasePreloadedFile();
      return this.file = null;
    };

    Attachment.prototype.getUploadProgress = function() {
      var ref;
      return (ref = this.uploadProgress) != null ? ref : 0;
    };

    Attachment.prototype.setUploadProgress = function(value) {
      var ref;
      if (this.uploadProgress !== value) {
        this.uploadProgress = value;
        return (ref = this.uploadProgressDelegate) != null ? typeof ref.attachmentDidChangeUploadProgress === "function" ? ref.attachmentDidChangeUploadProgress(this) : void 0 : void 0;
      }
    };

    Attachment.prototype.toJSON = function() {
      return this.getAttributes();
    };

    Attachment.prototype.getCacheKey = function(prependWith) {
      var parts;
      parts = [Attachment.__super__.getCacheKey.apply(this, arguments), this.attributes.getCacheKey(), this.getPreloadedURL()];
      if (prependWith) {
        parts.unshift(prependWith);
      }
      return parts.join("/");
    };

    Attachment.prototype.getPreloadedURL = function() {
      return this.preloadedURL;
    };

    Attachment.prototype.preloadURL = function() {
      return this.preload(this.getURL(), this.releaseFile);
    };

    Attachment.prototype.preloadFile = function() {
      if (this.file) {
        this.fileObjectURL = URL.createObjectURL(this.file);
        return this.preload(this.fileObjectURL);
      }
    };

    Attachment.prototype.releasePreloadedFile = function() {
      if (this.fileObjectURL) {
        URL.revokeObjectURL(this.fileObjectURL);
        return this.fileObjectURL = null;
      }
    };

    Attachment.prototype.preload = function(url, callback) {
      var operation;
      if (url && url !== this.preloadedURL) {
        if (this.preloadedURL == null) {
          this.preloadedURL = url;
        }
        operation = new Trix.ImagePreloadOperation(url);
        return operation.then((function(_this) {
          return function(arg) {
            var height, ref, width;
            width = arg.width, height = arg.height;
            _this.preloadedURL = url;
            _this.setAttributes({
              width: width,
              height: height
            });
            if ((ref = _this.previewDelegate) != null) {
              if (typeof ref.attachmentDidPreload === "function") {
                ref.attachmentDidPreload();
              }
            }
            return typeof callback === "function" ? callback() : void 0;
          };
        })(this));
      }
    };

    return Attachment;

  })(Trix.Object);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.ManagedAttachment = (function(superClass) {
    extend(ManagedAttachment, superClass);

    function ManagedAttachment(attachmentManager, attachment) {
      var ref;
      this.attachmentManager = attachmentManager;
      this.attachment = attachment;
      ref = this.attachment, this.id = ref.id, this.file = ref.file;
    }

    ManagedAttachment.prototype.remove = function() {
      return this.attachmentManager.requestRemovalOfAttachment(this.attachment);
    };

    ManagedAttachment.proxyMethod("attachment.getAttribute");

    ManagedAttachment.proxyMethod("attachment.hasAttribute");

    ManagedAttachment.proxyMethod("attachment.setAttribute");

    ManagedAttachment.proxyMethod("attachment.getAttributes");

    ManagedAttachment.proxyMethod("attachment.setAttributes");

    ManagedAttachment.proxyMethod("attachment.isPending");

    ManagedAttachment.proxyMethod("attachment.isPreviewable");

    ManagedAttachment.proxyMethod("attachment.getURL");

    ManagedAttachment.proxyMethod("attachment.getHref");

    ManagedAttachment.proxyMethod("attachment.getFilename");

    ManagedAttachment.proxyMethod("attachment.getFilesize");

    ManagedAttachment.proxyMethod("attachment.getFormattedFilesize");

    ManagedAttachment.proxyMethod("attachment.getExtension");

    ManagedAttachment.proxyMethod("attachment.getContentType");

    ManagedAttachment.proxyMethod("attachment.getFile");

    ManagedAttachment.proxyMethod("attachment.setFile");

    ManagedAttachment.proxyMethod("attachment.releaseFile");

    ManagedAttachment.proxyMethod("attachment.getUploadProgress");

    ManagedAttachment.proxyMethod("attachment.setUploadProgress");

    return ManagedAttachment;

  })(Trix.BasicObject);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trix.AttachmentManager = (function(superClass) {
    extend(AttachmentManager, superClass);

    function AttachmentManager(attachments) {
      var attachment, i, len;
      if (attachments == null) {
        attachments = [];
      }
      this.managedAttachments = {};
      for (i = 0, len = attachments.length; i < len; i++) {
        attachment = attachments[i];
        this.manageAttachment(attachment);
      }
    }

    AttachmentManager.prototype.getAttachments = function() {
      var attachment, id, ref, results;
      ref = this.managedAttachments;
      results = [];
      for (id in ref) {
        attachment = ref[id];
        results.push(attachment);
      }
      return results;
    };

    AttachmentManager.prototype.manageAttachment = function(attachment) {
      var base, name;
      return (base = this.managedAttachments)[name = attachment.id] != null ? base[name] : base[name] = new Trix.ManagedAttachment(this, attachment);
    };

    AttachmentManager.prototype.attachmentIsManaged = function(attachment) {
      return attachment.id in this.managedAttachments;
    };

    AttachmentManager.prototype.requestRemovalOfAttachment = function(attachment) {
      var ref;
      if (this.attachmentIsManaged(attachment)) {
        return (ref = this.delegate) != null ? typeof ref.attachmentManagerDidRequestRemovalOfAttachment === "function" ? ref.attachmentManagerDidRequestRemovalOfAttachment(attachment) : void 0 : void 0;
      }
    };

    AttachmentManager.prototype.unmanageAttachment = function(attachment) {
      var managedAttachment;
      managedAttachment = this.managedAttachments[attachment.id];
      delete this.managedAttachments[attachment.id];
      return managedAttachment;
    };

    return AttachmentManager;

  })(Trix.BasicObject);

}).call(this);
(function() {
  var elementContainsNode, findChildIndexOfNode, findClosestElementFromNode, findNodeFromContainerAndOffset, nodeIsAttachmentWrapper, nodeIsBlockContainer, nodeIsBlockStartComment, nodeIsCursorTarget, nodeIsEmptyTextNode, nodeIsTextNode, tagName, walkTree;

  elementContainsNode = Trix.elementContainsNode, findChildIndexOfNode = Trix.findChildIndexOfNode, findClosestElementFromNode = Trix.findClosestElementFromNode, findNodeFromContainerAndOffset = Trix.findNodeFromContainerAndOffset, nodeIsBlockStartComment = Trix.nodeIsBlockStartComment, nodeIsBlockContainer = Trix.nodeIsBlockContainer, nodeIsCursorTarget = Trix.nodeIsCursorTarget, nodeIsEmptyTextNode = Trix.nodeIsEmptyTextNode, nodeIsTextNode = Trix.nodeIsTextNode, nodeIsAttachmentWrapper = Trix.nodeIsAttachmentWrapper, tagName = Trix.tagName, walkTree = Trix.walkTree;

  Trix.LocationMapper = (function() {
    var acceptSignificantNodes, nodeLength, rejectAttachmentContents, rejectEmptyTextNodes;

    function LocationMapper(element) {
      this.element = element;
    }

    LocationMapper.prototype.findLocationFromContainerAndOffset = function(container, offset) {
      var childIndex, foundBlock, location, node, walker;
      childIndex = 0;
      foundBlock = false;
      location = {
        index: 0,
        offset: 0
      };
      walker = walkTree(this.element, {
        usingFilter: rejectAttachmentContents
      });
      while (walker.nextNode()) {
        node = walker.currentNode;
        if (nodeIsAttachmentWrapper(node)) {
          if (foundBlock) {
            location.index++;
          }
          location.offset = offset;
          if (node === container || node.firstElementChild === container) {
            break;
          }
          foundBlock = true;
        } else if (node === container && nodeIsTextNode(container)) {
          if (!nodeIsCursorTarget(node)) {
            location.offset += offset;
          }
          break;
        } else {
          if (node.parentNode === container) {
            if (childIndex++ === offset) {
              break;
            }
          } else if (!elementContainsNode(container, node)) {
            if (childIndex > 0) {
              break;
            }
          }
          if (nodeIsBlockStartComment(node)) {
            if (foundBlock) {
              location.index++;
            }
            location.offset = 0;
            foundBlock = true;
          } else {
            location.offset += nodeLength(node);
          }
        }
      }
      return location;
    };

    LocationMapper.prototype.findContainerAndOffsetFromLocation = function(location) {
      var container, node, nodeOffset, offset, ref, string;
      if (location.index === 0 && location.offset === 0) {
        container = this.element;
        offset = 0;
        while (container.firstChild) {
          container = container.firstChild;
          if (nodeIsAttachmentWrapper(container)) {
            container = container.firstElementChild;
            break;
          }
          if (nodeIsBlockContainer(container)) {
            offset = 1;
            break;
          }
        }
        return [container, offset];
      }
      ref = this.findNodeAndOffsetFromLocation(location), node = ref[0], nodeOffset = ref[1];
      if (!node) {
        return;
      }
      if (nodeIsAttachmentWrapper(node)) {
        container = node.firstElementChild;
        offset = location.offset;
      } else if (nodeIsTextNode(node)) {
        container = node;
        string = node.textContent;
        offset = location.offset - nodeOffset;
      } else {
        container = node.parentNode;
        if (!nodeIsBlockContainer(container)) {
          while (node === container.lastChild) {
            node = container;
            container = container.parentNode;
            if (nodeIsBlockContainer(container)) {
              break;
            }
          }
        }
        offset = findChildIndexOfNode(node);
        if (location.offset !== 0) {
          offset++;
        }
      }
      return [container, offset];
    };

    LocationMapper.prototype.findNodeAndOffsetFromLocation = function(location) {
      var currentNode, i, len, length, node, nodeOffset, offset, ref;
      offset = 0;
      ref = this.getSignificantNodesForIndex(location.index);
      for (i = 0, len = ref.length; i < len; i++) {
        currentNode = ref[i];
        length = nodeLength(currentNode);
        if (location.offset <= offset + length) {
          if (nodeIsAttachmentWrapper(currentNode)) {
            node = currentNode;
            nodeOffset = offset;
            if (location.offset === nodeOffset) {
              break;
            }
          }
          if (nodeIsTextNode(currentNode)) {
            node = currentNode;
            nodeOffset = offset;
            if (location.offset === nodeOffset && nodeIsCursorTarget(node)) {
              break;
            }
          } else if (!node) {
            node = currentNode;
            nodeOffset = offset;
          }
        }
        offset += length;
        if (offset > location.offset) {
          break;
        }
      }
      return [node, nodeOffset];
    };

    LocationMapper.prototype.getSignificantNodesForIndex = function(index) {
      var blockIndex, node, nodes, recordingNodes, walker;
      nodes = [];
      walker = walkTree(this.element, {
        usingFilter: acceptSignificantNodes
      });
      recordingNodes = false;
      while (walker.nextNode()) {
        node = walker.currentNode;
        if (nodeIsBlockStartComment(node) || nodeIsAttachmentWrapper(node)) {
          if (typeof blockIndex !== "undefined" && blockIndex !== null) {
            blockIndex++;
          } else {
            blockIndex = 0;
          }
          if (blockIndex === index) {
            if (nodeIsAttachmentWrapper(node)) {
              nodes.push(node);
            } else {
              recordingNodes = true;
            }
          } else if (recordingNodes) {
            break;
          }
        } else if (recordingNodes) {
          nodes.push(node);
        }
      }
      return nodes;
    };

    nodeLength = function(node) {
      var string;
      if (node.nodeType === Node.TEXT_NODE) {
        if (nodeIsCursorTarget(node)) {
          return 0;
        } else {
          string = node.textContent;
          return string.length;
        }
      } else if (tagName(node) === "br" || nodeIsAttachmentWrapper(node)) {
        return 1;
      } else {
        return 0;
      }
    };

    acceptSignificantNodes = function(node) {
      if (rejectEmptyTextNodes(node) === NodeFilter.FILTER_ACCEPT) {
        return rejectAttachmentContents(node);
      } else {
        return NodeFilter.FILTER_REJECT;
      }
    };

    rejectEmptyTextNodes = function(node) {
      if (nodeIsEmptyTextNode(node)) {
        return NodeFilter.FILTER_REJECT;
      } else {
        return NodeFilter.FILTER_ACCEPT;
      }
    };

    rejectAttachmentContents = function(node) {
      if (nodeIsAttachmentWrapper(node.parentNode)) {
        return NodeFilter.FILTER_REJECT;
      } else {
        return NodeFilter.FILTER_ACCEPT;
      }
    };

    return LocationMapper;

  })();

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Trix.SelectionChangeObserver = (function(superClass) {
    var domRangesAreEqual, getDOMRange;

    extend(SelectionChangeObserver, superClass);

    function SelectionChangeObserver() {
      this.run = bind(this.run, this);
      this.update = bind(this.update, this);
      this.selectionManagers = [];
    }

    SelectionChangeObserver.prototype.start = function() {
      if (!this.started) {
        this.started = true;
        if ("onselectionchange" in document) {
          return document.addEventListener("selectionchange", this.update, true);
        } else {
          return this.run();
        }
      }
    };

    SelectionChangeObserver.prototype.stop = function() {
      if (this.started) {
        this.started = false;
        return document.removeEventListener("selectionchange", this.update, true);
      }
    };

    SelectionChangeObserver.prototype.registerSelectionManager = function(selectionManager) {
      if (indexOf.call(this.selectionManagers, selectionManager) < 0) {
        this.selectionManagers.push(selectionManager);
        return this.start();
      }
    };

    SelectionChangeObserver.prototype.unregisterSelectionManager = function(selectionManager) {
      var s;
      this.selectionManagers = (function() {
        var i, len, ref, results;
        ref = this.selectionManagers;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          s = ref[i];
          if (s !== selectionManager) {
            results.push(s);
          }
        }
        return results;
      }).call(this);
      if (this.selectionManagers.length === 0) {
        return this.stop();
      }
    };

    SelectionChangeObserver.prototype.notifySelectionManagersOfSelectionChange = function() {
      var i, len, ref, results, selectionManager;
      ref = this.selectionManagers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selectionManager = ref[i];
        results.push(selectionManager.selectionDidChange());
      }
      return results;
    };

    SelectionChangeObserver.prototype.update = function() {
      var domRange;
      domRange = getDOMRange();
      if (!domRangesAreEqual(domRange, this.domRange)) {
        this.domRange = domRange;
        return this.notifySelectionManagersOfSelectionChange();
      }
    };

    SelectionChangeObserver.prototype.reset = function() {
      this.domRange = null;
      return this.update();
    };

    SelectionChangeObserver.prototype.run = function() {
      if (this.started) {
        this.update();
        return requestAnimationFrame(this.run);
      }
    };

    getDOMRange = function() {
      var selection;
      selection = window.getSelection();
      if (selection.rangeCount > 0) {
        return selection.getRangeAt(0);
      }
    };

    domRangesAreEqual = function(left, right) {
      return (left != null ? left.startContainer : void 0) === (right != null ? right.startContainer : void 0) && (left != null ? left.startOffset : void 0) === (right != null ? right.startOffset : void 0) && (left != null ? left.endContainer : void 0) === (right != null ? right.endContainer : void 0) && (left != null ? left.endOffset : void 0) === (right != null ? right.endOffset : void 0);
    };

    return SelectionChangeObserver;

  })(Trix.BasicObject);

  if (Trix.selectionChangeObserver == null) {
    Trix.selectionChangeObserver = new Trix.SelectionChangeObserver;
  }

}).call(this);
(function() {
  var defer, elementContainsNode, handleEvent, handleEventOnce, innerElementIsActive, makeElement, nodeIsCursorTarget, normalizeRange, rangeIsCollapsed, rangesAreEqual,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  defer = Trix.defer, elementContainsNode = Trix.elementContainsNode, nodeIsCursorTarget = Trix.nodeIsCursorTarget, innerElementIsActive = Trix.innerElementIsActive, makeElement = Trix.makeElement, handleEvent = Trix.handleEvent, handleEventOnce = Trix.handleEventOnce, normalizeRange = Trix.normalizeRange, rangeIsCollapsed = Trix.rangeIsCollapsed, rangesAreEqual = Trix.rangesAreEqual;

  Trix.SelectionManager = (function(superClass) {
    var cursorPositionPlaceholder, getClientRects, getCollapsedPointRange, getDOMRange, getDOMSelection, getExpandedPointRange, setDOMRange;

    extend(SelectionManager, superClass);

    function SelectionManager(element) {
      this.element = element;
      this.selectionDidChange = bind(this.selectionDidChange, this);
      this.didMouseDown = bind(this.didMouseDown, this);
      this.locationMapper = new Trix.LocationMapper(this.element);
      this.lockCount = 0;
      handleEvent("mousedown", {
        onElement: this.element,
        withCallback: this.didMouseDown
      });
    }

    SelectionManager.prototype.getLocationRange = function(options) {
      var locationRange, ref;
      if (options == null) {
        options = {};
      }
      return locationRange = options.ignoreLock ? this.currentLocationRange : (ref = this.lockedLocationRange) != null ? ref : this.currentLocationRange;
    };

    SelectionManager.prototype.setLocationRange = function(locationRange) {
      var domRange;
      if (this.lockedLocationRange) {
        return;
      }
      locationRange = normalizeRange(locationRange);
      if (domRange = this.createDOMRangeFromLocationRange(locationRange)) {
        setDOMRange(domRange);
        return this.updateCurrentLocationRange(locationRange);
      }
    };

    SelectionManager.prototype.getSelectedPointRange = function() {
      var ref;
      return (ref = getExpandedPointRange()) != null ? ref : getCollapsedPointRange();
    };

    SelectionManager.prototype.setLocationRangeFromPointRange = function(pointRange) {
      var endLocation, ref, ref1, startLocation;
      pointRange = normalizeRange(pointRange);
      startLocation = (ref = this.getLocationRangeAtPoint(pointRange[0])) != null ? ref[0] : void 0;
      endLocation = (ref1 = this.getLocationRangeAtPoint(pointRange[1])) != null ? ref1[0] : void 0;
      return this.setLocationRange([startLocation, endLocation]);
    };

    SelectionManager.prototype.getClientRectAtLocationRange = function(locationRange) {
      var range, rects;
      if (range = this.createDOMRangeFromLocationRange(locationRange)) {
        rects = slice.call(range.getClientRects());
        return rects.slice(-1)[0];
      }
    };

    SelectionManager.prototype.locationIsCursorTarget = function(location) {
      var node, offset, ref;
      ref = this.findNodeAndOffsetFromLocation(location), node = ref[0], offset = ref[1];
      return nodeIsCursorTarget(node);
    };

    SelectionManager.prototype.lock = function() {
      if (this.lockCount++ === 0) {
        this.updateCurrentLocationRange();
        return this.lockedLocationRange = this.getLocationRange();
      }
    };

    SelectionManager.prototype.unlock = function() {
      var lockedLocationRange;
      if (--this.lockCount === 0) {
        lockedLocationRange = this.lockedLocationRange;
        this.lockedLocationRange = null;
        if (lockedLocationRange != null) {
          return this.setLocationRange(lockedLocationRange);
        }
      }
    };

    SelectionManager.prototype.clearSelection = function() {
      var ref;
      return (ref = getDOMSelection()) != null ? ref.removeAllRanges() : void 0;
    };

    SelectionManager.prototype.selectionIsCollapsed = function() {
      var ref;
      return ((ref = getDOMRange()) != null ? ref.collapsed : void 0) === true;
    };

    SelectionManager.prototype.selectionIsExpanded = function() {
      return !this.selectionIsCollapsed();
    };

    SelectionManager.proxyMethod("locationMapper.findLocationFromContainerAndOffset");

    SelectionManager.proxyMethod("locationMapper.findContainerAndOffsetFromLocation");

    SelectionManager.proxyMethod("locationMapper.findNodeAndOffsetFromLocation");

    SelectionManager.prototype.didMouseDown = function() {
      return this.pauseTemporarily();
    };

    SelectionManager.prototype.pauseTemporarily = function() {
      var eventName, resume, resumeHandlers, resumeTimeout;
      this.paused = true;
      resume = (function(_this) {
        return function() {
          var handler, i, len;
          _this.paused = false;
          clearTimeout(resumeTimeout);
          for (i = 0, len = resumeHandlers.length; i < len; i++) {
            handler = resumeHandlers[i];
            handler.destroy();
          }
          if (elementContainsNode(document, _this.element)) {
            return _this.selectionDidChange();
          }
        };
      })(this);
      resumeTimeout = setTimeout(resume, 200);
      return resumeHandlers = (function() {
        var i, len, ref, results;
        ref = ["mousemove", "keydown"];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          eventName = ref[i];
          results.push(handleEvent(eventName, {
            onElement: document,
            withCallback: resume
          }));
        }
        return results;
      })();
    };

    SelectionManager.prototype.selectionDidChange = function() {
      if (!(this.paused || innerElementIsActive(this.element))) {
        return this.updateCurrentLocationRange();
      }
    };

    SelectionManager.prototype.updateCurrentLocationRange = function(locationRange) {
      var ref, ref1;
      if (locationRange == null) {
        locationRange = this.createLocationRangeFromDOMRange(getDOMRange());
      }
      if (!rangesAreEqual(locationRange, this.currentLocationRange)) {
        this.currentLocationRange = locationRange;
        return (ref = this.delegate) != null ? typeof ref.locationRangeDidChange === "function" ? ref.locationRangeDidChange((ref1 = this.currentLocationRange) != null ? ref1.slice(0) : void 0) : void 0 : void 0;
      }
    };

    SelectionManager.prototype.createDOMRangeFromLocationRange = function(locationRange) {
      var domRange, rangeEnd, rangeStart, ref;
      rangeStart = this.findContainerAndOffsetFromLocation(locationRange[0]);
      rangeEnd = rangeIsCollapsed(locationRange) ? rangeStart : (ref = this.findContainerAndOffsetFromLocation(locationRange[1])) != null ? ref : rangeStart;
      if ((rangeStart != null) && (rangeEnd != null)) {
        domRange = document.createRange();
        domRange.setStart.apply(domRange, rangeStart);
        domRange.setEnd.apply(domRange, rangeEnd);
        return domRange;
      }
    };

    SelectionManager.prototype.createLocationRangeFromDOMRange = function(domRange) {
      var end, start;
      if (!((domRange != null) && this.domRangeWithinElement(domRange))) {
        return;
      }
      if (!(start = this.findLocationFromContainerAndOffset(domRange.startContainer, domRange.startOffset))) {
        return;
      }
      if (!domRange.collapsed) {
        end = this.findLocationFromContainerAndOffset(domRange.endContainer, domRange.endOffset);
      }
      return normalizeRange([start, end]);
    };

    SelectionManager.prototype.domRangeWithinElement = function(domRange) {
      if (domRange.collapsed) {
        return elementContainsNode(this.element, domRange.startContainer);
      } else {
        return elementContainsNode(this.element, domRange.startContainer) && elementContainsNode(this.element, domRange.endContainer);
      }
    };

    SelectionManager.prototype.getLocationRangeAtPoint = function(arg) {
      var domRange, offset, offsetNode, originalDOMRange, ref, textRange, x, y;
      x = arg.x, y = arg.y;
      if (document.caretPositionFromPoint) {
        ref = document.caretPositionFromPoint(x, y), offsetNode = ref.offsetNode, offset = ref.offset;
        domRange = document.createRange();
        domRange.setStart(offsetNode, offset);
      } else if (document.caretRangeFromPoint) {
        domRange = document.caretRangeFromPoint(x, y);
      } else if (document.body.createTextRange) {
        originalDOMRange = getDOMRange();
        try {
          textRange = document.body.createTextRange();
          textRange.moveToPoint(x, y);
          textRange.select();
        } catch (_error) {}
        domRange = getDOMRange();
        setDOMRange(originalDOMRange);
      }
      return this.createLocationRangeFromDOMRange(domRange);
    };

    cursorPositionPlaceholder = makeElement({
      tagName: "span",
      style: {
        marginLeft: "-0.01em"
      },
      data: {
        trixMutable: true,
        trixSerialize: false
      }
    });

    getCollapsedPointRange = function() {
      var domRange, node, rect, start;
      if (!(domRange = getDOMRange())) {
        return;
      }
      node = cursorPositionPlaceholder.cloneNode(true);
      try {
        domRange.insertNode(node);
        rect = node.getBoundingClientRect();
      } finally {
        node.parentNode.removeChild(node);
      }
      start = {
        x: rect.left,
        y: rect.top + 1
      };
      return normalizeRange(start);
    };

    getExpandedPointRange = function() {
      var domRange, end, endRect, rects, start, startRect;
      if (!(domRange = getDOMRange())) {
        return;
      }
      rects = domRange.getClientRects();
      if (rects.length > 0) {
        startRect = rects[0];
        endRect = rects[rects.length - 1];
        start = {
          x: startRect.left,
          y: startRect.top + 1
        };
        end = {
          x: endRect.right,
          y: endRect.top + 1
        };
        return normalizeRange(start, end);
      }
    };

    getDOMSelection = function() {
      var selection;
      selection = window.getSelection();
      if (selection.rangeCount > 0) {
        return selection;
      }
    };

    getDOMRange = function() {
      var ref;
      return (ref = getDOMSelection()) != null ? ref.getRangeAt(0) : void 0;
    };

    setDOMRange = function(domRange) {
      var selection;
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(domRange);
      return Trix.selectionChangeObserver.update();
    };

    getClientRects = function() {
      var rects, ref;
      rects = (ref = getDOMRange()) != null ? ref.getClientRects() : void 0;
      if (rects != null ? rects.length : void 0) {
        return rects;
      }
    };

    return SelectionManager;

  })(Trix.BasicObject);

}).call(this);
(function() {
  var objectsAreEqual, rangeIsCollapsed, rangesAreEqual,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  rangeIsCollapsed = Trix.rangeIsCollapsed, rangesAreEqual = Trix.rangesAreEqual, objectsAreEqual = Trix.objectsAreEqual;

  Trix.EditorController = (function(superClass) {
    extend(EditorController, superClass);

    function EditorController(arg) {
      var document, html;
      this.editorElement = arg.editorElement, document = arg.document, html = arg.html;
      this.selectionManager = new Trix.SelectionManager(this.editorElement);
      this.selectionManager.delegate = this;
      this.composition = new Trix.Composition;
      this.composition.delegate = this;
      this.attachmentManager = new Trix.AttachmentManager(this.composition.getAttachments());
      this.attachmentManager.delegate = this;
      this.inputController = new Trix.InputController(this.editorElement);
      this.inputController.delegate = this;
      this.inputController.responder = this.composition;
      this.compositionController = new Trix.CompositionController(this.editorElement, this.composition);
      this.compositionController.delegate = this;
      this.toolbarController = new Trix.ToolbarController(this.editorElement.toolbarElement);
      this.toolbarController.delegate = this;
      this.editor = new Trix.Editor(this.composition, this.selectionManager, this.editorElement);
      if (document != null) {
        this.editor.loadDocument(document);
      } else {
        this.editor.loadHTML(html);
      }
    }

    EditorController.prototype.registerSelectionManager = function() {
      return Trix.selectionChangeObserver.registerSelectionManager(this.selectionManager);
    };

    EditorController.prototype.unregisterSelectionManager = function() {
      return Trix.selectionChangeObserver.unregisterSelectionManager(this.selectionManager);
    };

    EditorController.prototype.compositionDidChangeDocument = function(document) {
      this.editorElement.notify("document-change");
      if (!this.handlingInput) {
        return this.render();
      }
    };

    EditorController.prototype.compositionDidChangeCurrentAttributes = function(currentAttributes) {
      this.currentAttributes = currentAttributes;
      this.toolbarController.updateAttributes(this.currentAttributes);
      this.updateCurrentActions();
      return this.editorElement.notify("attributes-change", {
        attributes: this.currentAttributes
      });
    };

    EditorController.prototype.compositionDidPerformInsertionAtRange = function(range) {
      if (this.pasting) {
        return this.pastedRange = range;
      }
    };

    EditorController.prototype.compositionShouldAcceptFile = function(file) {
      return this.editorElement.notify("file-accept", {
        file: file
      });
    };

    EditorController.prototype.compositionDidAddAttachment = function(attachment) {
      var managedAttachment;
      managedAttachment = this.attachmentManager.manageAttachment(attachment);
      return this.editorElement.notify("attachment-add", {
        attachment: managedAttachment
      });
    };

    EditorController.prototype.compositionDidEditAttachment = function(attachment) {
      var managedAttachment;
      this.compositionController.rerenderViewForObject(attachment);
      managedAttachment = this.attachmentManager.manageAttachment(attachment);
      this.editorElement.notify("attachment-edit", {
        attachment: managedAttachment
      });
      return this.editorElement.notify("change");
    };

    EditorController.prototype.compositionDidRemoveAttachment = function(attachment) {
      var managedAttachment;
      managedAttachment = this.attachmentManager.unmanageAttachment(attachment);
      return this.editorElement.notify("attachment-remove", {
        attachment: managedAttachment
      });
    };

    EditorController.prototype.compositionDidStartEditingAttachment = function(attachment) {
      var attachmentRange, document;
      document = this.composition.document;
      attachmentRange = document.getRangeOfAttachment(attachment);
      this.attachmentLocationRange = document.locationRangeFromRange(attachmentRange);
      this.compositionController.installAttachmentEditorForAttachment(attachment);
      return this.selectionManager.setLocationRange(this.attachmentLocationRange);
    };

    EditorController.prototype.compositionDidStopEditingAttachment = function(attachment) {
      this.compositionController.uninstallAttachmentEditor();
      return this.attachmentLocationRange = null;
    };

    EditorController.prototype.compositionDidRequestChangingSelection = function(requestedSelection) {
      if (this.loadingSnapshot && !this.isFocused()) {
        return;
      }
      this.requestedSelection = requestedSelection;
      this.documentWhenSelectionRequested = this.composition.document;
      if (!this.handlingInput) {
        return this.render();
      }
    };

    EditorController.prototype.compositionWillLoadSnapshot = function() {
      return this.loadingSnapshot = true;
    };

    EditorController.prototype.compositionDidLoadSnapshot = function() {
      this.compositionController.refreshViewCache();
      this.render();
      return this.loadingSnapshot = false;
    };

    EditorController.prototype.getSelectionManager = function() {
      return this.selectionManager;
    };

    EditorController.proxyMethod("getSelectionManager().setLocationRange");

    EditorController.proxyMethod("getSelectionManager().getLocationRange");

    EditorController.prototype.attachmentManagerDidRequestRemovalOfAttachment = function(attachment) {
      return this.removeAttachment(attachment);
    };

    EditorController.prototype.compositionControllerWillSyncDocumentView = function() {
      this.inputController.editorWillSyncDocumentView();
      this.selectionManager.lock();
      return this.selectionManager.clearSelection();
    };

    EditorController.prototype.compositionControllerDidSyncDocumentView = function() {
      this.inputController.editorDidSyncDocumentView();
      this.selectionManager.unlock();
      this.updateCurrentActions();
      return this.editorElement.notify("sync");
    };

    EditorController.prototype.compositionControllerDidRender = function() {
      var locationRange, pointRange, ref;
      if (this.requestedSelection != null) {
        if (this.documentWhenSelectionRequested.isEqualTo(this.composition.document)) {
          ref = this.requestedSelection, locationRange = ref.locationRange, pointRange = ref.pointRange;
          if (locationRange) {
            this.selectionManager.setLocationRange(locationRange);
          } else if (pointRange) {
            this.selectionManager.setLocationRangeFromPointRange(pointRange);
          }
        }
        this.composition.updateCurrentAttributes();
        this.requestedSelection = null;
        this.documentWhenSelectionRequested = null;
      }
      return this.editorElement.notify("render");
    };

    EditorController.prototype.compositionControllerDidFocus = function() {
      return this.editorElement.notify("focus");
    };

    EditorController.prototype.compositionControllerDidBlur = function() {
      return this.editorElement.notify("blur");
    };

    EditorController.prototype.compositionControllerDidSelectAttachment = function(attachment) {
      return this.composition.editAttachment(attachment);
    };

    EditorController.prototype.compositionControllerDidRequestDeselectingAttachment = function(attachment) {
      if (this.attachmentLocationRange) {
        return this.selectionManager.setLocationRange(this.attachmentLocationRange[1]);
      }
    };

    EditorController.prototype.compositionControllerWillUpdateAttachment = function(attachment) {
      return this.editor.recordUndoEntry("Edit Attachment", {
        context: attachment.id,
        consolidatable: true
      });
    };

    EditorController.prototype.compositionControllerDidRequestRemovalOfAttachment = function(attachment) {
      return this.removeAttachment(attachment);
    };

    EditorController.prototype.inputControllerWillHandleInput = function() {
      this.handlingInput = true;
      return this.requestedRender = false;
    };

    EditorController.prototype.inputControllerDidRequestRender = function() {
      return this.requestedRender = true;
    };

    EditorController.prototype.inputControllerDidHandleInput = function() {
      this.handlingInput = false;
      if (this.requestedRender) {
        this.requestedRender = false;
        return this.render();
      }
    };

    EditorController.prototype.inputControllerWillPerformTyping = function() {
      return this.recordTypingUndoEntry();
    };

    EditorController.prototype.inputControllerWillCutText = function() {
      return this.editor.recordUndoEntry("Cut");
    };

    EditorController.prototype.inputControllerWillPasteText = function(pasteData) {
      this.editor.recordUndoEntry("Paste");
      return this.pasting = true;
    };

    EditorController.prototype.inputControllerDidPaste = function(pasteData) {
      var range;
      range = this.pastedRange;
      this.pastedRange = null;
      this.pasting = null;
      this.editorElement.notify("paste", {
        pasteData: pasteData,
        range: range
      });
      return this.render();
    };

    EditorController.prototype.inputControllerWillMoveText = function() {
      return this.editor.recordUndoEntry("Move");
    };

    EditorController.prototype.inputControllerWillAttachFiles = function() {
      return this.editor.recordUndoEntry("Drop Files");
    };

    EditorController.prototype.inputControllerDidReceiveKeyboardCommand = function(keys) {
      return this.toolbarController.applyKeyboardCommand(keys);
    };

    EditorController.prototype.inputControllerDidStartDrag = function() {
      return this.locationRangeBeforeDrag = this.selectionManager.getLocationRange();
    };

    EditorController.prototype.inputControllerDidReceiveDragOverPoint = function(point) {
      return this.selectionManager.setLocationRangeFromPointRange(point);
    };

    EditorController.prototype.inputControllerDidCancelDrag = function() {
      this.selectionManager.setLocationRange(this.locationRangeBeforeDrag);
      return this.locationRangeBeforeDrag = null;
    };

    EditorController.prototype.locationRangeDidChange = function(locationRange) {
      this.composition.updateCurrentAttributes();
      this.updateCurrentActions();
      if (this.attachmentLocationRange && !rangesAreEqual(this.attachmentLocationRange, locationRange)) {
        this.composition.stopEditingAttachment();
      }
      return this.editorElement.notify("selection-change");
    };

    EditorController.prototype.toolbarDidClickButton = function() {
      if (!this.getLocationRange()) {
        return this.setLocationRange({
          index: 0,
          offset: 0
        });
      }
    };

    EditorController.prototype.toolbarDidInvokeAction = function(actionName) {
      return this.invokeAction(actionName);
    };

    EditorController.prototype.toolbarDidToggleAttribute = function(attributeName) {
      this.recordFormattingUndoEntry();
      this.composition.toggleCurrentAttribute(attributeName);
      this.render();
      return this.editorElement.focus();
    };

    EditorController.prototype.toolbarDidUpdateAttribute = function(attributeName, value) {
      this.recordFormattingUndoEntry();
      this.composition.setCurrentAttribute(attributeName, value);
      this.render();
      return this.editorElement.focus();
    };

    EditorController.prototype.toolbarDidRemoveAttribute = function(attributeName) {
      this.recordFormattingUndoEntry();
      this.composition.removeCurrentAttribute(attributeName);
      this.render();
      return this.editorElement.focus();
    };

    EditorController.prototype.freezeSelection = function() {
      if (!this.selectionFrozen) {
        this.selectionManager.lock();
        this.composition.freezeSelection();
        this.selectionFrozen = true;
        return this.render();
      }
    };

    EditorController.prototype.thawSelection = function() {
      if (this.selectionFrozen) {
        this.composition.thawSelection();
        this.selectionManager.unlock();
        this.selectionFrozen = false;
        return this.render();
      }
    };

    EditorController.prototype.actions = {
      undo: {
        test: function() {
          return this.editor.canUndo();
        },
        perform: function() {
          return this.editor.undo();
        }
      },
      redo: {
        test: function() {
          return this.editor.canRedo();
        },
        perform: function() {
          return this.editor.redo();
        }
      },
      link: {
        test: function() {
          return this.editor.canActivateAttribute("href");
        }
      },
      increaseBlockLevel: {
        test: function() {
          return this.editor.canIncreaseIndentationLevel();
        },
        perform: function() {
          return this.editor.increaseIndentationLevel() && this.render();
        }
      },
      decreaseBlockLevel: {
        test: function() {
          return this.editor.canDecreaseIndentationLevel();
        },
        perform: function() {
          return this.editor.decreaseIndentationLevel() && this.render();
        }
      }
    };

    EditorController.prototype.canInvokeAction = function(actionName) {
      var ref, ref1;
      if (this.actionIsExternal(actionName)) {
        return true;
      } else {
        return !!((ref = this.actions[actionName]) != null ? (ref1 = ref.test) != null ? ref1.call(this) : void 0 : void 0);
      }
    };

    EditorController.prototype.invokeAction = function(actionName) {
      var ref, ref1;
      if (this.actionIsExternal(actionName)) {
        return this.editorElement.notify("action-invoke", {
          actionName: actionName
        });
      } else {
        return (ref = this.actions[actionName]) != null ? (ref1 = ref.perform) != null ? ref1.call(this) : void 0 : void 0;
      }
    };

    EditorController.prototype.actionIsExternal = function(actionName) {
      return /^x-./.test(actionName);
    };

    EditorController.prototype.getCurrentActions = function() {
      var actionName, result;
      result = {};
      for (actionName in this.actions) {
        result[actionName] = this.canInvokeAction(actionName);
      }
      return result;
    };

    EditorController.prototype.updateCurrentActions = function() {
      var currentActions;
      currentActions = this.getCurrentActions();
      if (!objectsAreEqual(currentActions, this.currentActions)) {
        this.currentActions = currentActions;
        this.toolbarController.updateActions(this.currentActions);
        return this.editorElement.notify("actions-change", {
          actions: this.currentActions
        });
      }
    };

    EditorController.prototype.reparse = function() {
      return this.composition.replaceHTML(this.editorElement.innerHTML);
    };

    EditorController.prototype.render = function() {
      return this.compositionController.render();
    };

    EditorController.prototype.removeAttachment = function(attachment) {
      this.editor.recordUndoEntry("Delete Attachment");
      this.composition.removeAttachment(attachment);
      return this.render();
    };

    EditorController.prototype.recordFormattingUndoEntry = function() {
      var locationRange;
      locationRange = this.selectionManager.getLocationRange();
      if (!rangeIsCollapsed(locationRange)) {
        return this.editor.recordUndoEntry("Formatting", {
          context: this.getUndoContext(),
          consolidatable: true
        });
      }
    };

    EditorController.prototype.recordTypingUndoEntry = function() {
      return this.editor.recordUndoEntry("Typing", {
        context: this.getUndoContext(this.currentAttributes),
        consolidatable: true
      });
    };

    EditorController.prototype.getUndoContext = function() {
      var context;
      context = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return [this.getLocationContext(), this.getTimeContext()].concat(slice.call(context));
    };

    EditorController.prototype.getLocationContext = function() {
      var locationRange;
      locationRange = this.selectionManager.getLocationRange();
      if (rangeIsCollapsed(locationRange)) {
        return locationRange[0].index;
      } else {
        return locationRange;
      }
    };

    EditorController.prototype.getTimeContext = function() {
      if (Trix.config.undoInterval > 0) {
        return Math.floor(new Date().getTime() / Trix.config.undoInterval);
      } else {
        return 0;
      }
    };

    EditorController.prototype.isFocused = function() {
      var ref;
      return this.editorElement === ((ref = this.editorElement.ownerDocument) != null ? ref.activeElement : void 0);
    };

    return EditorController;

  })(Trix.Controller);

}).call(this);
(function() {
  var attachmentSelector, defer, handleEvent, handleEventOnce, makeElement, triggerEvent;

  makeElement = Trix.makeElement, triggerEvent = Trix.triggerEvent, handleEvent = Trix.handleEvent, handleEventOnce = Trix.handleEventOnce, defer = Trix.defer;

  attachmentSelector = Trix.AttachmentView.attachmentSelector;

  Trix.registerElement("trix-editor", (function() {
    var autofocus, configureContentEditable, disableObjectResizing, id, makeEditable, setDefaultParagraphSeparator;
    id = 0;
    autofocus = function(element) {
      if (!document.querySelector(":focus")) {
        if (element.hasAttribute("autofocus") && document.querySelector("[autofocus]") === element) {
          return element.focus();
        }
      }
    };
    makeEditable = function(element) {
      if (element.hasAttribute("contenteditable")) {
        return;
      }
      element.setAttribute("contenteditable", "");
      return handleEventOnce("focus", {
        onElement: element,
        withCallback: function() {
          return configureContentEditable(element);
        }
      });
    };
    configureContentEditable = function(element) {
      disableObjectResizing(element);
      return setDefaultParagraphSeparator(element);
    };
    disableObjectResizing = function(element) {
      if (typeof document.queryCommandSupported === "function" ? document.queryCommandSupported("enableObjectResizing") : void 0) {
        document.execCommand("enableObjectResizing", false, false);
        return handleEvent("mscontrolselect", {
          onElement: element,
          preventDefault: true
        });
      }
    };
    setDefaultParagraphSeparator = function(element) {
      var tagName;
      if (typeof document.queryCommandSupported === "function" ? document.queryCommandSupported("DefaultParagraphSeparator") : void 0) {
        tagName = Trix.config.blockAttributes["default"].tagName;
        if (tagName === "div" || tagName === "p") {
          return document.execCommand("DefaultParagraphSeparator", false, tagName);
        }
      }
    };
    return {
      defaultCSS: "%t:empty:not(:focus)::before {\n  content: attr(placeholder);\n  color: graytext;\n}\n\n%t a[contenteditable=false] {\n  cursor: text;\n}\n\n%t img {\n  max-width: 100%;\n  height: auto;\n}\n\n%t " + attachmentSelector + " figcaption textarea {\n  resize: none;\n}\n\n%t " + attachmentSelector + " figcaption textarea.trix-autoresize-clone {\n  position: absolute;\n  left: -9999px;\n  max-height: 0px;\n}",
      trixId: {
        get: function() {
          if (this.hasAttribute("trix-id")) {
            return this.getAttribute("trix-id");
          } else {
            this.setAttribute("trix-id", ++id);
            return this.trixId;
          }
        }
      },
      toolbarElement: {
        get: function() {
          var element, ref, toolbarId;
          if (this.hasAttribute("toolbar")) {
            return (ref = this.ownerDocument) != null ? ref.getElementById(this.getAttribute("toolbar")) : void 0;
          } else if (this.parentElement) {
            toolbarId = "trix-toolbar-" + this.trixId;
            this.setAttribute("toolbar", toolbarId);
            element = makeElement("trix-toolbar", {
              id: toolbarId
            });
            this.parentElement.insertBefore(element, this);
            return element;
          }
        }
      },
      inputElement: {
        get: function() {
          var element, inputId, ref;
          if (this.hasAttribute("input")) {
            return (ref = this.ownerDocument) != null ? ref.getElementById(this.getAttribute("input")) : void 0;
          } else if (this.parentElement) {
            inputId = "trix-input-" + this.trixId;
            this.setAttribute("input", inputId);
            element = makeElement("input", {
              type: "hidden",
              id: inputId
            });
            this.parentElement.insertBefore(element, this.nextElementSibling);
            return element;
          }
        }
      },
      editor: {
        get: function() {
          var ref;
          return (ref = this.editorController) != null ? ref.editor : void 0;
        }
      },
      name: {
        get: function() {
          var ref;
          return (ref = this.inputElement) != null ? ref.name : void 0;
        }
      },
      value: {
        get: function() {
          var ref;
          return (ref = this.inputElement) != null ? ref.value : void 0;
        },
        set: function(defaultValue) {
          var ref;
          this.defaultValue = defaultValue;
          return (ref = this.editor) != null ? ref.loadHTML(this.defaultValue) : void 0;
        }
      },
      notify: function(message, data) {
        var ref;
        switch (message) {
          case "document-change":
            this.documentChangedSinceLastRender = true;
            break;
          case "render":
            if (this.documentChangedSinceLastRender) {
              this.documentChangedSinceLastRender = false;
              this.notify("change");
            }
            break;
          case "change":
          case "attachment-add":
          case "attachment-edit":
          case "attachment-remove":
            if ((ref = this.inputElement) != null) {
              ref.value = Trix.serializeToContentType(this, "text/html");
            }
        }
        if (this.editorController) {
          return triggerEvent("trix-" + message, {
            onElement: this,
            attributes: data
          });
        }
      },
      createdCallback: function() {
        return makeEditable(this);
      },
      attachedCallback: function() {
        if (!this.hasAttribute("data-trix-internal")) {
          autofocus(this);
          if (this.editorController == null) {
            this.editorController = new Trix.EditorController({
              editorElement: this,
              html: this.defaultValue = this.value
            });
          }
          this.editorController.registerSelectionManager();
          this.registerResetListener();
          return requestAnimationFrame((function(_this) {
            return function() {
              return _this.notify("initialize");
            };
          })(this));
        }
      },
      detachedCallback: function() {
        var ref;
        if ((ref = this.editorController) != null) {
          ref.unregisterSelectionManager();
        }
        return this.unregisterResetListener();
      },
      registerResetListener: function() {
        this.resetListener = this.resetBubbled.bind(this);
        return window.addEventListener("reset", this.resetListener, false);
      },
      unregisterResetListener: function() {
        return window.removeEventListener("reset", this.resetListener, false);
      },
      resetBubbled: function(event) {
        var ref;
        if (event.target === ((ref = this.inputElement) != null ? ref.form : void 0)) {
          if (!event.defaultPrevented) {
            return this.reset();
          }
        }
      },
      reset: function() {
        return this.value = this.defaultValue;
      }
    };
  })());

}).call(this);
