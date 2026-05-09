"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
// This is CodeMirror (http://codemirror.net), a code editor
// implemented in JavaScript on top of the browser's DOM.
//
// You can find some technical background for some of the code below
// at http://marijnhaverbeke.nl/blog/#cm-internals .
(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.CodeMirror = factory();
})(void 0, function () {
  'use strict'; // Kludges for bugs and behavior differences that can't be feature
  // detected are enabled based on userAgent etc sniffing.

  var userAgent = navigator.userAgent;
  var platform = navigator.platform;
  var gecko = /gecko\/\d/i.test(userAgent);
  var ie_upto10 = /MSIE \d/.test(userAgent);
  var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent);
  var ie = ie_upto10 || ie_11up;
  var ie_version = ie && (ie_upto10 ? document.documentMode || 6 : ie_11up[1]);
  var webkit = /WebKit\//.test(userAgent);
  var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(userAgent);
  var chrome = /Chrome\//.test(userAgent);
  var presto = /Opera\//.test(userAgent);
  var safari = /Apple Computer/.test(navigator.vendor);
  var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(userAgent);
  var phantom = /PhantomJS/.test(userAgent);
  var ios = /AppleWebKit/.test(userAgent) && /Mobile\/\w+/.test(userAgent); // This is woefully incomplete. Suggestions for alternative methods welcome.

  var mobile = ios || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(userAgent);
  var mac = ios || /Mac/.test(platform);
  var chromeOS = /\bCrOS\b/.test(userAgent);
  var windows = /win/i.test(platform);
  var presto_version = presto && userAgent.match(/Version\/(\d*\.\d*)/);

  if (presto_version) {
    presto_version = Number(presto_version[1]);
  }

  if (presto_version && presto_version >= 15) {
    presto = false;
    webkit = true;
  } // Some browsers use the wrong event properties to signal cmd/ctrl on OS X


  var flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11));
  var captureRightClick = gecko || ie && ie_version >= 9;

  function classTest(cls) {
    return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*");
  }

  var rmClass = function rmClass(node, cls) {
    var current = node.className;
    var match = classTest(cls).exec(current);

    if (match) {
      var after = current.slice(match.index + match[0].length);
      node.className = current.slice(0, match.index) + (after ? match[1] + after : "");
    }
  };

  function removeChildren(e) {
    for (var count = e.childNodes.length; count > 0; --count) {
      e.removeChild(e.firstChild);
    }

    return e;
  }

  function removeChildrenAndAdd(parent, e) {
    return removeChildren(parent).appendChild(e);
  }

  function elt(tag, content, className, style) {
    var e = document.createElement(tag);

    if (className) {
      e.className = className;
    }

    if (style) {
      e.style.cssText = style;
    }

    if (typeof content == "string") {
      e.appendChild(document.createTextNode(content));
    } else if (content) {
      for (var i = 0; i < content.length; ++i) {
        e.appendChild(content[i]);
      }
    }

    return e;
  }

  var range;

  if (document.createRange) {
    range = function range(node, start, end, endNode) {
      var r = document.createRange();
      r.setEnd(endNode || node, end);
      r.setStart(node, start);
      return r;
    };
  } else {
    range = function range(node, start, end) {
      var r = document.body.createTextRange();

      try {
        r.moveToElementText(node.parentNode);
      } catch (e) {
        return r;
      }

      r.collapse(true);
      r.moveEnd("character", end);
      r.moveStart("character", start);
      return r;
    };
  }

  function contains(parent, child) {
    if (child.nodeType == 3) // Android browser always returns false when child is a textnode
      {
        child = child.parentNode;
      }

    if (parent.contains) {
      return parent.contains(child);
    }

    do {
      if (child.nodeType == 11) {
        child = child.host;
      }

      if (child == parent) {
        return true;
      }
    } while (child = child.parentNode);
  }

  function activeElt() {
    // IE and Edge may throw an "Unspecified Error" when accessing document.activeElement.
    // IE < 10 will throw when accessed while the page is loading or in an iframe.
    // IE > 9 and Edge will throw when accessed in an iframe if document.body is unavailable.
    var activeElement;

    try {
      activeElement = document.activeElement;
    } catch (e) {
      activeElement = document.body || null;
    }

    while (activeElement && activeElement.root && activeElement.root.activeElement) {
      activeElement = activeElement.root.activeElement;
    }

    return activeElement;
  }

  function addClass(node, cls) {
    var current = node.className;

    if (!classTest(cls).test(current)) {
      node.className += (current ? " " : "") + cls;
    }
  }

  function joinClasses(a, b) {
    var as = a.split(" ");

    for (var i = 0; i < as.length; i++) {
      if (as[i] && !classTest(as[i]).test(b)) {
        b += " " + as[i];
      }
    }

    return b;
  }

  var selectInput = function selectInput(node) {
    node.select();
  };

  if (ios) // Mobile Safari apparently has a bug where select() is broken.
    {
      selectInput = function selectInput(node) {
        node.selectionStart = 0;
        node.selectionEnd = node.value.length;
      };
    } else if (ie) // Suppress mysterious IE10 errors
    {
      selectInput = function selectInput(node) {
        try {
          node.select();
        } catch (_e) {}
      };
    }

  function bind(f) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function () {
      return f.apply(null, args);
    };
  }

  function copyObj(obj, target, overwrite) {
    if (!target) {
      target = {};
    }

    for (var prop in obj) {
      if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop))) {
        target[prop] = obj[prop];
      }
    }

    return target;
  } // Counts the column offset in a string, taking tabs into account.
  // Used mostly to find indentation.


  function countColumn(string, end, tabSize, startIndex, startValue) {
    if (end == null) {
      end = string.search(/[^\s\u00a0]/);

      if (end == -1) {
        end = string.length;
      }
    }

    for (var i = startIndex || 0, n = startValue || 0;;) {
      var nextTab = string.indexOf("\t", i);

      if (nextTab < 0 || nextTab >= end) {
        return n + (end - i);
      }

      n += nextTab - i;
      n += tabSize - n % tabSize;
      i = nextTab + 1;
    }
  }

  function Delayed() {
    this.id = null;
  }

  Delayed.prototype.set = function (ms, f) {
    clearTimeout(this.id);
    this.id = setTimeout(f, ms);
  };

  function indexOf(array, elt) {
    for (var i = 0; i < array.length; ++i) {
      if (array[i] == elt) {
        return i;
      }
    }

    return -1;
  } // Number of pixels added to scroller and sizer to hide scrollbar


  var scrollerGap = 30; // Returned or thrown by various protocols to signal 'I'm not
  // handling this'.

  var Pass = {
    toString: function toString() {
      return "CodeMirror.Pass";
    }
  }; // Reused option objects for setSelection & friends

  var sel_dontScroll = {
    scroll: false
  };
  var sel_mouse = {
    origin: "*mouse"
  };
  var sel_move = {
    origin: "+move"
  }; // The inverse of countColumn -- find the offset that corresponds to
  // a particular column.

  function findColumn(string, goal, tabSize) {
    for (var pos = 0, col = 0;;) {
      var nextTab = string.indexOf("\t", pos);

      if (nextTab == -1) {
        nextTab = string.length;
      }

      var skipped = nextTab - pos;

      if (nextTab == string.length || col + skipped >= goal) {
        return pos + Math.min(skipped, goal - col);
      }

      col += nextTab - pos;
      col += tabSize - col % tabSize;
      pos = nextTab + 1;

      if (col >= goal) {
        return pos;
      }
    }
  }

  var spaceStrs = [""];

  function spaceStr(n) {
    while (spaceStrs.length <= n) {
      spaceStrs.push(lst(spaceStrs) + " ");
    }

    return spaceStrs[n];
  }

  function lst(arr) {
    return arr[arr.length - 1];
  }

  function map(array, f) {
    var out = [];

    for (var i = 0; i < array.length; i++) {
      out[i] = f(array[i], i);
    }

    return out;
  }

  function insertSorted(array, value, score) {
    var pos = 0,
        priority = score(value);

    while (pos < array.length && score(array[pos]) <= priority) {
      pos++;
    }

    array.splice(pos, 0, value);
  }

  function nothing() {}

  function createObj(base, props) {
    var inst;

    if (Object.create) {
      inst = Object.create(base);
    } else {
      nothing.prototype = base;
      inst = new nothing();
    }

    if (props) {
      copyObj(props, inst);
    }

    return inst;
  }

  var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;

  function isWordCharBasic(ch) {
    return /\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch));
  }

  function isWordChar(ch, helper) {
    if (!helper) {
      return isWordCharBasic(ch);
    }

    if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) {
      return true;
    }

    return helper.test(ch);
  }

  function isEmpty(obj) {
    for (var n in obj) {
      if (obj.hasOwnProperty(n) && obj[n]) {
        return false;
      }
    }

    return true;
  } // Extending unicode characters. A series of a non-extending char +
  // any number of extending chars is treated as a single unit as far
  // as editing and measuring is concerned. This is not fully correct,
  // since some scripts/fonts/browsers also treat other configurations
  // of code points as a group.


  var extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;

  function isExtendingChar(ch) {
    return ch.charCodeAt(0) >= 768 && extendingChars.test(ch);
  } // The display handles the DOM integration, both for input reading
  // and content drawing. It holds references to DOM nodes and
  // display-related state.


  function Display(place, doc, input) {
    var d = this;
    this.input = input; // Covers bottom-right square when both scrollbars are present.

    d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler");
    d.scrollbarFiller.setAttribute("cm-not-content", "true"); // Covers bottom of gutter when coverGutterNextToScrollbar is on
    // and h scrollbar is present.

    d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler");
    d.gutterFiller.setAttribute("cm-not-content", "true"); // Will contain the actual code, positioned to cover the viewport.

    d.lineDiv = elt("div", null, "CodeMirror-code"); // Elements are added to these to represent selection and cursors.

    d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1");
    d.cursorDiv = elt("div", null, "CodeMirror-cursors"); // A visibility: hidden element used to find the size of things.

    d.measure = elt("div", null, "CodeMirror-measure"); // When lines outside of the viewport are measured, they are drawn in this.

    d.lineMeasure = elt("div", null, "CodeMirror-measure"); // Wraps everything that needs to exist inside the vertically-padded coordinate system

    d.lineSpace = elt("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv], null, "position: relative; outline: none"); // Moved around its parent to cover visible view.

    d.mover = elt("div", [elt("div", [d.lineSpace], "CodeMirror-lines")], null, "position: relative"); // Set to the height of the document, allowing scrolling.

    d.sizer = elt("div", [d.mover], "CodeMirror-sizer");
    d.sizerWidth = null; // Behavior of elts with overflow: auto and padding is
    // inconsistent across browsers. This is used to ensure the
    // scrollable area is big enough.

    d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;"); // Will contain the gutters, if any.

    d.gutters = elt("div", null, "CodeMirror-gutters");
    d.lineGutter = null; // Actual scrollable element.

    d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll");
    d.scroller.setAttribute("tabIndex", "-1"); // The element in which the editor lives.

    d.wrapper = elt("div", [d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror"); // Work around IE7 z-index bug (not perfect, hence IE7 not really being supported)

    if (ie && ie_version < 8) {
      d.gutters.style.zIndex = -1;
      d.scroller.style.paddingRight = 0;
    }

    if (!webkit && !(gecko && mobile)) {
      d.scroller.draggable = true;
    }

    if (place) {
      if (place.appendChild) {
        place.appendChild(d.wrapper);
      } else {
        place(d.wrapper);
      }
    } // Current rendered range (may be bigger than the view window).


    d.viewFrom = d.viewTo = doc.first;
    d.reportedViewFrom = d.reportedViewTo = doc.first; // Information about the rendered lines.

    d.view = [];
    d.renderedView = null; // Holds info about a single rendered line when it was rendered
    // for measurement, while not in view.

    d.externalMeasured = null; // Empty space (in pixels) above the view

    d.viewOffset = 0;
    d.lastWrapHeight = d.lastWrapWidth = 0;
    d.updateLineNumbers = null;
    d.nativeBarWidth = d.barHeight = d.barWidth = 0;
    d.scrollbarsClipped = false; // Used to only resize the line number gutter when necessary (when
    // the amount of lines crosses a boundary that makes its width change)

    d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null; // Set to true when a non-horizontal-scrolling line widget is
    // added. As an optimization, line widget aligning is skipped when
    // this is false.

    d.alignWidgets = false;
    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null; // Tracks the maximum line length so that the horizontal scrollbar
    // can be kept static when scrolling.

    d.maxLine = null;
    d.maxLineLength = 0;
    d.maxLineChanged = false; // Used for measuring wheel scrolling granularity

    d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null; // True when shift is held down.

    d.shift = false; // Used to track whether anything happened since the context menu
    // was opened.

    d.selForContextMenu = null;
    d.activeTouch = null;
    input.init(d);
  } // Find the line object corresponding to the given line number.


  function getLine(doc, n) {
    n -= doc.first;

    if (n < 0 || n >= doc.size) {
      throw new Error("There is no line " + (n + doc.first) + " in the document.");
    }

    var chunk = doc;

    while (!chunk.lines) {
      for (var i = 0;; ++i) {
        var child = chunk.children[i],
            sz = child.chunkSize();

        if (n < sz) {
          chunk = child;
          break;
        }

        n -= sz;
      }
    }

    return chunk.lines[n];
  } // Get the part of a document between two positions, as an array of
  // strings.


  function getBetween(doc, start, end) {
    var out = [],
        n = start.line;
    doc.iter(start.line, end.line + 1, function (line) {
      var text = line.text;

      if (n == end.line) {
        text = text.slice(0, end.ch);
      }

      if (n == start.line) {
        text = text.slice(start.ch);
      }

      out.push(text);
      ++n;
    });
    return out;
  } // Get the lines between from and to, as array of strings.


  function getLines(doc, from, to) {
    var out = [];
    doc.iter(from, to, function (line) {
      out.push(line.text);
    }); // iter aborts when callback returns truthy value

    return out;
  } // Update the height of a line, propagating the height change
  // upwards to parent nodes.


  function updateLineHeight(line, height) {
    var diff = height - line.height;

    if (diff) {
      for (var n = line; n; n = n.parent) {
        n.height += diff;
      }
    }
  } // Given a line object, find its line number by walking up through
  // its parent links.


  function lineNo(line) {
    if (line.parent == null) {
      return null;
    }

    var cur = line.parent,
        no = indexOf(cur.lines, line);

    for (var chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent) {
      for (var i = 0;; ++i) {
        if (chunk.children[i] == cur) {
          break;
        }

        no += chunk.children[i].chunkSize();
      }
    }

    return no + cur.first;
  } // Find the line at the given vertical position, using the height
  // information in the document tree.


  function _lineAtHeight(chunk, h) {
    var n = chunk.first;

    outer: do {
      for (var i$1 = 0; i$1 < chunk.children.length; ++i$1) {
        var child = chunk.children[i$1],
            ch = child.height;

        if (h < ch) {
          chunk = child;
          continue outer;
        }

        h -= ch;
        n += child.chunkSize();
      }

      return n;
    } while (!chunk.lines);

    var i = 0;

    for (; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i],
          lh = line.height;

      if (h < lh) {
        break;
      }

      h -= lh;
    }

    return n + i;
  }

  function isLine(doc, l) {
    return l >= doc.first && l < doc.first + doc.size;
  }

  function lineNumberFor(options, i) {
    return String(options.lineNumberFormatter(i + options.firstLineNumber));
  } // A Pos instance represents a position within the text.


  function Pos(line, ch) {
    if (!(this instanceof Pos)) {
      return new Pos(line, ch);
    }

    this.line = line;
    this.ch = ch;
  } // Compare two positions, return 0 if they are the same, a negative
  // number when a is less, and a positive number otherwise.


  function cmp(a, b) {
    return a.line - b.line || a.ch - b.ch;
  }

  function copyPos(x) {
    return Pos(x.line, x.ch);
  }

  function maxPos(a, b) {
    return cmp(a, b) < 0 ? b : a;
  }

  function minPos(a, b) {
    return cmp(a, b) < 0 ? a : b;
  } // Most of the external API clips given positions to make sure they
  // actually exist within the document.


  function clipLine(doc, n) {
    return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1));
  }

  function _clipPos(doc, pos) {
    if (pos.line < doc.first) {
      return Pos(doc.first, 0);
    }

    var last = doc.first + doc.size - 1;

    if (pos.line > last) {
      return Pos(last, getLine(doc, last).text.length);
    }

    return clipToLen(pos, getLine(doc, pos.line).text.length);
  }

  function clipToLen(pos, linelen) {
    var ch = pos.ch;

    if (ch == null || ch > linelen) {
      return Pos(pos.line, linelen);
    } else if (ch < 0) {
      return Pos(pos.line, 0);
    } else {
      return pos;
    }
  }

  function clipPosArray(doc, array) {
    var out = [];

    for (var i = 0; i < array.length; i++) {
      out[i] = _clipPos(doc, array[i]);
    }

    return out;
  } // Optimize some code when these features are not used.


  var sawReadOnlySpans = false;
  var sawCollapsedSpans = false;

  function seeReadOnlySpans() {
    sawReadOnlySpans = true;
  }

  function seeCollapsedSpans() {
    sawCollapsedSpans = true;
  } // TEXTMARKER SPANS


  function MarkedSpan(marker, from, to) {
    this.marker = marker;
    this.from = from;
    this.to = to;
  } // Search an array of spans for a span matching the given marker.


  function getMarkedSpanFor(spans, marker) {
    if (spans) {
      for (var i = 0; i < spans.length; ++i) {
        var span = spans[i];

        if (span.marker == marker) {
          return span;
        }
      }
    }
  } // Remove a span from an array, returning undefined if no spans are
  // left (we don't store arrays for lines without spans).


  function removeMarkedSpan(spans, span) {
    var r;

    for (var i = 0; i < spans.length; ++i) {
      if (spans[i] != span) {
        (r || (r = [])).push(spans[i]);
      }
    }

    return r;
  } // Add a span to a line.


  function addMarkedSpan(line, span) {
    line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span];
    span.marker.attachLine(line);
  } // Used for the algorithm that adjusts markers for a change in the
  // document. These functions cut an array of spans at a given
  // character position, returning an array of remaining chunks (or
  // undefined if nothing remains).


  function markedSpansBefore(old, startCh, isInsert) {
    var nw;

    if (old) {
      for (var i = 0; i < old.length; ++i) {
        var span = old[i],
            marker = span.marker;
        var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);

        if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
          var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh);
          (nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to));
        }
      }
    }

    return nw;
  }

  function markedSpansAfter(old, endCh, isInsert) {
    var nw;

    if (old) {
      for (var i = 0; i < old.length; ++i) {
        var span = old[i],
            marker = span.marker;
        var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);

        if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
          var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh);
          (nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh, span.to == null ? null : span.to - endCh));
        }
      }
    }

    return nw;
  } // Given a change object, compute the new set of marker spans that
  // cover the line in which the change took place. Removes spans
  // entirely within the change, reconnects spans belonging to the
  // same marker that appear on both sides of the change, and cuts off
  // spans partially within the change. Returns an array of span
  // arrays with one element for each line in (after) the change.


  function stretchSpansOverChange(doc, change) {
    if (change.full) {
      return null;
    }

    var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans;
    var oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;

    if (!oldFirst && !oldLast) {
      return null;
    }

    var startCh = change.from.ch,
        endCh = change.to.ch,
        isInsert = cmp(change.from, change.to) == 0; // Get the spans that 'stick out' on both sides

    var first = markedSpansBefore(oldFirst, startCh, isInsert);
    var last = markedSpansAfter(oldLast, endCh, isInsert); // Next, merge those two ends

    var sameLine = change.text.length == 1,
        offset = lst(change.text).length + (sameLine ? startCh : 0);

    if (first) {
      // Fix up .to properties of first
      for (var i = 0; i < first.length; ++i) {
        var span = first[i];

        if (span.to == null) {
          var found = getMarkedSpanFor(last, span.marker);

          if (!found) {
            span.to = startCh;
          } else if (sameLine) {
            span.to = found.to == null ? null : found.to + offset;
          }
        }
      }
    }

    if (last) {
      // Fix up .from in last (or move them into first in case of sameLine)
      for (var i$1 = 0; i$1 < last.length; ++i$1) {
        var span$1 = last[i$1];

        if (span$1.to != null) {
          span$1.to += offset;
        }

        if (span$1.from == null) {
          var found$1 = getMarkedSpanFor(first, span$1.marker);

          if (!found$1) {
            span$1.from = offset;

            if (sameLine) {
              (first || (first = [])).push(span$1);
            }
          }
        } else {
          span$1.from += offset;

          if (sameLine) {
            (first || (first = [])).push(span$1);
          }
        }
      }
    } // Make sure we didn't create any zero-length spans


    if (first) {
      first = clearEmptySpans(first);
    }

    if (last && last != first) {
      last = clearEmptySpans(last);
    }

    var newMarkers = [first];

    if (!sameLine) {
      // Fill gap with whole-line-spans
      var gap = change.text.length - 2,
          gapMarkers;

      if (gap > 0 && first) {
        for (var i$2 = 0; i$2 < first.length; ++i$2) {
          if (first[i$2].to == null) {
            (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i$2].marker, null, null));
          }
        }
      }

      for (var i$3 = 0; i$3 < gap; ++i$3) {
        newMarkers.push(gapMarkers);
      }

      newMarkers.push(last);
    }

    return newMarkers;
  } // Remove spans that are empty and don't have a clearWhenEmpty
  // option of false.


  function clearEmptySpans(spans) {
    for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];

      if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false) {
        spans.splice(i--, 1);
      }
    }

    if (!spans.length) {
      return null;
    }

    return spans;
  } // Used to 'clip' out readOnly ranges when making a change.


  function removeReadOnlyRanges(doc, from, to) {
    var markers = null;
    doc.iter(from.line, to.line + 1, function (line) {
      if (line.markedSpans) {
        for (var i = 0; i < line.markedSpans.length; ++i) {
          var mark = line.markedSpans[i].marker;

          if (mark.readOnly && (!markers || indexOf(markers, mark) == -1)) {
            (markers || (markers = [])).push(mark);
          }
        }
      }
    });

    if (!markers) {
      return null;
    }

    var parts = [{
      from: from,
      to: to
    }];

    for (var i = 0; i < markers.length; ++i) {
      var mk = markers[i],
          m = mk.find(0);

      for (var j = 0; j < parts.length; ++j) {
        var p = parts[j];

        if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0) {
          continue;
        }

        var newParts = [j, 1],
            dfrom = cmp(p.from, m.from),
            dto = cmp(p.to, m.to);

        if (dfrom < 0 || !mk.inclusiveLeft && !dfrom) {
          newParts.push({
            from: p.from,
            to: m.from
          });
        }

        if (dto > 0 || !mk.inclusiveRight && !dto) {
          newParts.push({
            from: m.to,
            to: p.to
          });
        }

        parts.splice.apply(parts, newParts);
        j += newParts.length - 1;
      }
    }

    return parts;
  } // Connect or disconnect spans from a line.


  function detachMarkedSpans(line) {
    var spans = line.markedSpans;

    if (!spans) {
      return;
    }

    for (var i = 0; i < spans.length; ++i) {
      spans[i].marker.detachLine(line);
    }

    line.markedSpans = null;
  }

  function attachMarkedSpans(line, spans) {
    if (!spans) {
      return;
    }

    for (var i = 0; i < spans.length; ++i) {
      spans[i].marker.attachLine(line);
    }

    line.markedSpans = spans;
  } // Helpers used when computing which overlapping collapsed span
  // counts as the larger one.


  function extraLeft(marker) {
    return marker.inclusiveLeft ? -1 : 0;
  }

  function extraRight(marker) {
    return marker.inclusiveRight ? 1 : 0;
  } // Returns a number indicating which of two overlapping collapsed
  // spans is larger (and thus includes the other). Falls back to
  // comparing ids when the spans cover exactly the same range.


  function compareCollapsedMarkers(a, b) {
    var lenDiff = a.lines.length - b.lines.length;

    if (lenDiff != 0) {
      return lenDiff;
    }

    var aPos = a.find(),
        bPos = b.find();
    var fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);

    if (fromCmp) {
      return -fromCmp;
    }

    var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);

    if (toCmp) {
      return toCmp;
    }

    return b.id - a.id;
  } // Find out whether a line ends or starts in a collapsed span. If
  // so, return the marker for that span.


  function collapsedSpanAtSide(line, start) {
    var sps = sawCollapsedSpans && line.markedSpans,
        found;

    if (sps) {
      for (var sp = void 0, i = 0; i < sps.length; ++i) {
        sp = sps[i];

        if (sp.marker.collapsed && (start ? sp.from : sp.to) == null && (!found || compareCollapsedMarkers(found, sp.marker) < 0)) {
          found = sp.marker;
        }
      }
    }

    return found;
  }

  function collapsedSpanAtStart(line) {
    return collapsedSpanAtSide(line, true);
  }

  function collapsedSpanAtEnd(line) {
    return collapsedSpanAtSide(line, false);
  } // Test whether there exists a collapsed span that partially
  // overlaps (covers the start or end, but not both) of a new span.
  // Such overlap is not allowed.


  function conflictingCollapsedRange(doc, lineNo, from, to, marker) {
    var line = getLine(doc, lineNo);
    var sps = sawCollapsedSpans && line.markedSpans;

    if (sps) {
      for (var i = 0; i < sps.length; ++i) {
        var sp = sps[i];

        if (!sp.marker.collapsed) {
          continue;
        }

        var found = sp.marker.find(0);
        var fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker);
        var toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);

        if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0) {
          continue;
        }

        if (fromCmp <= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.to, from) >= 0 : cmp(found.to, from) > 0) || fromCmp >= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.from, to) <= 0 : cmp(found.from, to) < 0)) {
          return true;
        }
      }
    }
  } // A visual line is a line as drawn on the screen. Folding, for
  // example, can cause multiple logical lines to appear on the same
  // visual line. This finds the start of the visual line that the
  // given line is part of (usually that is the line itself).


  function visualLine(line) {
    var merged;

    while (merged = collapsedSpanAtStart(line)) {
      line = merged.find(-1, true).line;
    }

    return line;
  } // Returns an array of logical lines that continue the visual line
  // started by the argument, or undefined if there are no such lines.


  function visualLineContinued(line) {
    var merged, lines;

    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
      (lines || (lines = [])).push(line);
    }

    return lines;
  } // Get the line number of the start of the visual line that the
  // given line number is part of.


  function visualLineNo(doc, lineN) {
    var line = getLine(doc, lineN),
        vis = visualLine(line);

    if (line == vis) {
      return lineN;
    }

    return lineNo(vis);
  } // Get the line number of the start of the next visual line after
  // the given line.


  function visualLineEndNo(doc, lineN) {
    if (lineN > doc.lastLine()) {
      return lineN;
    }

    var line = getLine(doc, lineN),
        merged;

    if (!lineIsHidden(doc, line)) {
      return lineN;
    }

    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
    }

    return lineNo(line) + 1;
  } // Compute whether a line is hidden. Lines count as hidden when they
  // are part of a visual line that starts with another line, or when
  // they are entirely covered by collapsed, non-widget span.


  function lineIsHidden(doc, line) {
    var sps = sawCollapsedSpans && line.markedSpans;

    if (sps) {
      for (var sp = void 0, i = 0; i < sps.length; ++i) {
        sp = sps[i];

        if (!sp.marker.collapsed) {
          continue;
        }

        if (sp.from == null) {
          return true;
        }

        if (sp.marker.widgetNode) {
          continue;
        }

        if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp)) {
          return true;
        }
      }
    }
  }

  function lineIsHiddenInner(doc, line, span) {
    if (span.to == null) {
      var end = span.marker.find(1, true);
      return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker));
    }

    if (span.marker.inclusiveRight && span.to == line.text.length) {
      return true;
    }

    for (var sp = void 0, i = 0; i < line.markedSpans.length; ++i) {
      sp = line.markedSpans[i];

      if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to && (sp.to == null || sp.to != span.from) && (sp.marker.inclusiveLeft || span.marker.inclusiveRight) && lineIsHiddenInner(doc, line, sp)) {
        return true;
      }
    }
  } // Find the height above the given line.


  function _heightAtLine(lineObj) {
    lineObj = visualLine(lineObj);
    var h = 0,
        chunk = lineObj.parent;

    for (var i = 0; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i];

      if (line == lineObj) {
        break;
      } else {
        h += line.height;
      }
    }

    for (var p = chunk.parent; p; chunk = p, p = chunk.parent) {
      for (var i$1 = 0; i$1 < p.children.length; ++i$1) {
        var cur = p.children[i$1];

        if (cur == chunk) {
          break;
        } else {
          h += cur.height;
        }
      }
    }

    return h;
  } // Compute the character length of a line, taking into account
  // collapsed ranges (see markText) that might hide parts, and join
  // other lines onto it.


  function lineLength(line) {
    if (line.height == 0) {
      return 0;
    }

    var len = line.text.length,
        merged,
        cur = line;

    while (merged = collapsedSpanAtStart(cur)) {
      var found = merged.find(0, true);
      cur = found.from.line;
      len += found.from.ch - found.to.ch;
    }

    cur = line;

    while (merged = collapsedSpanAtEnd(cur)) {
      var found$1 = merged.find(0, true);
      len -= cur.text.length - found$1.from.ch;
      cur = found$1.to.line;
      len += cur.text.length - found$1.to.ch;
    }

    return len;
  } // Find the longest line in the document.


  function findMaxLine(cm) {
    var d = cm.display,
        doc = cm.doc;
    d.maxLine = getLine(doc, doc.first);
    d.maxLineLength = lineLength(d.maxLine);
    d.maxLineChanged = true;
    doc.iter(function (line) {
      var len = lineLength(line);

      if (len > d.maxLineLength) {
        d.maxLineLength = len;
        d.maxLine = line;
      }
    });
  } // BIDI HELPERS


  function iterateBidiSections(order, from, to, f) {
    if (!order) {
      return f(from, to, "ltr");
    }

    var found = false;

    for (var i = 0; i < order.length; ++i) {
      var part = order[i];

      if (part.from < to && part.to > from || from == to && part.to == from) {
        f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr");
        found = true;
      }
    }

    if (!found) {
      f(from, to, "ltr");
    }
  }

  function bidiLeft(part) {
    return part.level % 2 ? part.to : part.from;
  }

  function bidiRight(part) {
    return part.level % 2 ? part.from : part.to;
  }

  function lineLeft(line) {
    var order = getOrder(line);
    return order ? bidiLeft(order[0]) : 0;
  }

  function lineRight(line) {
    var order = getOrder(line);

    if (!order) {
      return line.text.length;
    }

    return bidiRight(lst(order));
  }

  function compareBidiLevel(order, a, b) {
    var linedir = order[0].level;

    if (a == linedir) {
      return true;
    }

    if (b == linedir) {
      return false;
    }

    return a < b;
  }

  var bidiOther = null;

  function getBidiPartAt(order, pos) {
    var found;
    bidiOther = null;

    for (var i = 0; i < order.length; ++i) {
      var cur = order[i];

      if (cur.from < pos && cur.to > pos) {
        return i;
      }

      if (cur.from == pos || cur.to == pos) {
        if (found == null) {
          found = i;
        } else if (compareBidiLevel(order, cur.level, order[found].level)) {
          if (cur.from != cur.to) {
            bidiOther = found;
          }

          return i;
        } else {
          if (cur.from != cur.to) {
            bidiOther = i;
          }

          return found;
        }
      }
    }

    return found;
  }

  function moveInLine(line, pos, dir, byUnit) {
    if (!byUnit) {
      return pos + dir;
    }

    do {
      pos += dir;
    } while (pos > 0 && isExtendingChar(line.text.charAt(pos)));

    return pos;
  } // This is needed in order to move 'visually' through bi-directional
  // text -- i.e., pressing left should make the cursor go left, even
  // when in RTL text. The tricky part is the 'jumps', where RTL and
  // LTR text touch each other. This often requires the cursor offset
  // to move more than one unit, in order to visually move one unit.


  function moveVisually(line, start, dir, byUnit) {
    var bidi = getOrder(line);

    if (!bidi) {
      return moveLogically(line, start, dir, byUnit);
    }

    var pos = getBidiPartAt(bidi, start),
        part = bidi[pos];
    var target = moveInLine(line, start, part.level % 2 ? -dir : dir, byUnit);

    for (;;) {
      if (target > part.from && target < part.to) {
        return target;
      }

      if (target == part.from || target == part.to) {
        if (getBidiPartAt(bidi, target) == pos) {
          return target;
        }

        part = bidi[pos += dir];
        return dir > 0 == part.level % 2 ? part.to : part.from;
      } else {
        part = bidi[pos += dir];

        if (!part) {
          return null;
        }

        if (dir > 0 == part.level % 2) {
          target = moveInLine(line, part.to, -1, byUnit);
        } else {
          target = moveInLine(line, part.from, 1, byUnit);
        }
      }
    }
  }

  function moveLogically(line, start, dir, byUnit) {
    var target = start + dir;

    if (byUnit) {
      while (target > 0 && isExtendingChar(line.text.charAt(target))) {
        target += dir;
      }
    }

    return target < 0 || target > line.text.length ? null : target;
  } // Bidirectional ordering algorithm
  // See http://unicode.org/reports/tr9/tr9-13.html for the algorithm
  // that this (partially) implements.
  // One-char codes used for character types:
  // L (L):   Left-to-Right
  // R (R):   Right-to-Left
  // r (AL):  Right-to-Left Arabic
  // 1 (EN):  European Number
  // + (ES):  European Number Separator
  // % (ET):  European Number Terminator
  // n (AN):  Arabic Number
  // , (CS):  Common Number Separator
  // m (NSM): Non-Spacing Mark
  // b (BN):  Boundary Neutral
  // s (B):   Paragraph Separator
  // t (S):   Segment Separator
  // w (WS):  Whitespace
  // N (ON):  Other Neutrals
  // Returns null if characters are ordered as they appear
  // (left-to-right), or an array of sections ({from, to, level}
  // objects) in the order in which they occur visually.


  var bidiOrdering = function () {
    // Character types for codepoints 0 to 0xff
    var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN"; // Character types for codepoints 0x600 to 0x6f9

    var arabicTypes = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111";

    function charType(code) {
      if (code <= 0xf7) {
        return lowTypes.charAt(code);
      } else if (0x590 <= code && code <= 0x5f4) {
        return "R";
      } else if (0x600 <= code && code <= 0x6f9) {
        return arabicTypes.charAt(code - 0x600);
      } else if (0x6ee <= code && code <= 0x8ac) {
        return "r";
      } else if (0x2000 <= code && code <= 0x200b) {
        return "w";
      } else if (code == 0x200c) {
        return "b";
      } else {
        return "L";
      }
    }

    var bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
    var isNeutral = /[stwN]/,
        isStrong = /[LRr]/,
        countsAsLeft = /[Lb1n]/,
        countsAsNum = /[1n]/; // Browsers seem to always treat the boundaries of block elements as being L.

    var outerType = "L";

    function BidiSpan(level, from, to) {
      this.level = level;
      this.from = from;
      this.to = to;
    }

    return function (str) {
      if (!bidiRE.test(str)) {
        return false;
      }

      var len = str.length,
          types = [];

      for (var i = 0; i < len; ++i) {
        types.push(charType(str.charCodeAt(i)));
      } // W1. Examine each non-spacing mark (NSM) in the level run, and
      // change the type of the NSM to the type of the previous
      // character. If the NSM is at the start of the level run, it will
      // get the type of sor.


      for (var i$1 = 0, prev = outerType; i$1 < len; ++i$1) {
        var type = types[i$1];

        if (type == "m") {
          types[i$1] = prev;
        } else {
          prev = type;
        }
      } // W2. Search backwards from each instance of a European number
      // until the first strong type (R, L, AL, or sor) is found. If an
      // AL is found, change the type of the European number to Arabic
      // number.
      // W3. Change all ALs to R.


      for (var i$2 = 0, cur = outerType; i$2 < len; ++i$2) {
        var type$1 = types[i$2];

        if (type$1 == "1" && cur == "r") {
          types[i$2] = "n";
        } else if (isStrong.test(type$1)) {
          cur = type$1;

          if (type$1 == "r") {
            types[i$2] = "R";
          }
        }
      } // W4. A single European separator between two European numbers
      // changes to a European number. A single common separator between
      // two numbers of the same type changes to that type.


      for (var i$3 = 1, prev$1 = types[0]; i$3 < len - 1; ++i$3) {
        var type$2 = types[i$3];

        if (type$2 == "+" && prev$1 == "1" && types[i$3 + 1] == "1") {
          types[i$3] = "1";
        } else if (type$2 == "," && prev$1 == types[i$3 + 1] && (prev$1 == "1" || prev$1 == "n")) {
          types[i$3] = prev$1;
        }

        prev$1 = type$2;
      } // W5. A sequence of European terminators adjacent to European
      // numbers changes to all European numbers.
      // W6. Otherwise, separators and terminators change to Other
      // Neutral.


      for (var i$4 = 0; i$4 < len; ++i$4) {
        var type$3 = types[i$4];

        if (type$3 == ",") {
          types[i$4] = "N";
        } else if (type$3 == "%") {
          var end = void 0;

          for (end = i$4 + 1; end < len && types[end] == "%"; ++end) {}

          var replace = i$4 && types[i$4 - 1] == "!" || end < len && types[end] == "1" ? "1" : "N";

          for (var j = i$4; j < end; ++j) {
            types[j] = replace;
          }

          i$4 = end - 1;
        }
      } // W7. Search backwards from each instance of a European number
      // until the first strong type (R, L, or sor) is found. If an L is
      // found, then change the type of the European number to L.


      for (var i$5 = 0, cur$1 = outerType; i$5 < len; ++i$5) {
        var type$4 = types[i$5];

        if (cur$1 == "L" && type$4 == "1") {
          types[i$5] = "L";
        } else if (isStrong.test(type$4)) {
          cur$1 = type$4;
        }
      } // N1. A sequence of neutrals takes the direction of the
      // surrounding strong text if the text on both sides has the same
      // direction. European and Arabic numbers act as if they were R in
      // terms of their influence on neutrals. Start-of-level-run (sor)
      // and end-of-level-run (eor) are used at level run boundaries.
      // N2. Any remaining neutrals take the embedding direction.


      for (var i$6 = 0; i$6 < len; ++i$6) {
        if (isNeutral.test(types[i$6])) {
          var end$1 = void 0;

          for (end$1 = i$6 + 1; end$1 < len && isNeutral.test(types[end$1]); ++end$1) {}

          var before = (i$6 ? types[i$6 - 1] : outerType) == "L";
          var after = (end$1 < len ? types[end$1] : outerType) == "L";
          var replace$1 = before || after ? "L" : "R";

          for (var j$1 = i$6; j$1 < end$1; ++j$1) {
            types[j$1] = replace$1;
          }

          i$6 = end$1 - 1;
        }
      } // Here we depart from the documented algorithm, in order to avoid
      // building up an actual levels array. Since there are only three
      // levels (0, 1, 2) in an implementation that doesn't take
      // explicit embedding into account, we can build up the order on
      // the fly, without following the level-based algorithm.


      var order = [],
          m;

      for (var i$7 = 0; i$7 < len;) {
        if (countsAsLeft.test(types[i$7])) {
          var start = i$7;

          for (++i$7; i$7 < len && countsAsLeft.test(types[i$7]); ++i$7) {}

          order.push(new BidiSpan(0, start, i$7));
        } else {
          var pos = i$7,
              at = order.length;

          for (++i$7; i$7 < len && types[i$7] != "L"; ++i$7) {}

          for (var j$2 = pos; j$2 < i$7;) {
            if (countsAsNum.test(types[j$2])) {
              if (pos < j$2) {
                order.splice(at, 0, new BidiSpan(1, pos, j$2));
              }

              var nstart = j$2;

              for (++j$2; j$2 < i$7 && countsAsNum.test(types[j$2]); ++j$2) {}

              order.splice(at, 0, new BidiSpan(2, nstart, j$2));
              pos = j$2;
            } else {
              ++j$2;
            }
          }

          if (pos < i$7) {
            order.splice(at, 0, new BidiSpan(1, pos, i$7));
          }
        }
      }

      if (order[0].level == 1 && (m = str.match(/^\s+/))) {
        order[0].from = m[0].length;
        order.unshift(new BidiSpan(0, 0, m[0].length));
      }

      if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
        lst(order).to -= m[0].length;
        order.push(new BidiSpan(0, len - m[0].length, len));
      }

      if (order[0].level == 2) {
        order.unshift(new BidiSpan(1, order[0].to, order[0].to));
      }

      if (order[0].level != lst(order).level) {
        order.push(new BidiSpan(order[0].level, len, len));
      }

      return order;
    };
  }(); // Get the bidi ordering for the given line (and cache it). Returns
  // false for lines that are fully left-to-right, and an array of
  // BidiSpan objects otherwise.


  function getOrder(line) {
    var order = line.order;

    if (order == null) {
      order = line.order = bidiOrdering(line.text);
    }

    return order;
  } // EVENT HANDLING
  // Lightweight event framework. on/off also work on DOM nodes,
  // registering native DOM handlers.


  var noHandlers = [];

  var on = function on(emitter, type, f) {
    if (emitter.addEventListener) {
      emitter.addEventListener(type, f, false);
    } else if (emitter.attachEvent) {
      emitter.attachEvent("on" + type, f);
    } else {
      var map = emitter._handlers || (emitter._handlers = {});
      map[type] = (map[type] || noHandlers).concat(f);
    }
  };

  function getHandlers(emitter, type) {
    return emitter._handlers && emitter._handlers[type] || noHandlers;
  }

  function off(emitter, type, f) {
    if (emitter.removeEventListener) {
      emitter.removeEventListener(type, f, false);
    } else if (emitter.detachEvent) {
      emitter.detachEvent("on" + type, f);
    } else {
      var map = emitter._handlers,
          arr = map && map[type];

      if (arr) {
        var index = indexOf(arr, f);

        if (index > -1) {
          map[type] = arr.slice(0, index).concat(arr.slice(index + 1));
        }
      }
    }
  }

  function signal(emitter, type
  /*, values...*/
  ) {
    var handlers = getHandlers(emitter, type);

    if (!handlers.length) {
      return;
    }

    var args = Array.prototype.slice.call(arguments, 2);

    for (var i = 0; i < handlers.length; ++i) {
      handlers[i].apply(null, args);
    }
  } // The DOM events that CodeMirror handles can be overridden by
  // registering a (non-DOM) handler on the editor for the event name,
  // and preventDefault-ing the event in that handler.


  function signalDOMEvent(cm, e, override) {
    if (typeof e == "string") {
      e = {
        type: e,
        preventDefault: function preventDefault() {
          this.defaultPrevented = true;
        }
      };
    }

    signal(cm, override || e.type, cm, e);
    return e_defaultPrevented(e) || e.codemirrorIgnore;
  }

  function signalCursorActivity(cm) {
    var arr = cm._handlers && cm._handlers.cursorActivity;

    if (!arr) {
      return;
    }

    var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []);

    for (var i = 0; i < arr.length; ++i) {
      if (indexOf(set, arr[i]) == -1) {
        set.push(arr[i]);
      }
    }
  }

  function hasHandler(emitter, type) {
    return getHandlers(emitter, type).length > 0;
  } // Add on and off methods to a constructor's prototype, to make
  // registering events on such objects more convenient.


  function eventMixin(ctor) {
    ctor.prototype.on = function (type, f) {
      on(this, type, f);
    };

    ctor.prototype.off = function (type, f) {
      off(this, type, f);
    };
  } // Due to the fact that we still support jurassic IE versions, some
  // compatibility wrappers are needed.


  function e_preventDefault(e) {
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  }

  function e_stopPropagation(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  }

  function e_defaultPrevented(e) {
    return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false;
  }

  function e_stop(e) {
    e_preventDefault(e);
    e_stopPropagation(e);
  }

  function e_target(e) {
    return e.target || e.srcElement;
  }

  function e_button(e) {
    var b = e.which;

    if (b == null) {
      if (e.button & 1) {
        b = 1;
      } else if (e.button & 2) {
        b = 3;
      } else if (e.button & 4) {
        b = 2;
      }
    }

    if (mac && e.ctrlKey && b == 1) {
      b = 3;
    }

    return b;
  } // Detect drag-and-drop


  var dragAndDrop = function () {
    // There is *some* kind of drag-and-drop support in IE6-8, but I
    // couldn't get it to work yet.
    if (ie && ie_version < 9) {
      return false;
    }

    var div = elt('div');
    return "draggable" in div || "dragDrop" in div;
  }();

  var zwspSupported;

  function zeroWidthElement(measure) {
    if (zwspSupported == null) {
      var test = elt("span", "\u200B");
      removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]));

      if (measure.firstChild.offsetHeight != 0) {
        zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && ie_version < 8);
      }
    }

    var node = zwspSupported ? elt("span", "\u200B") : elt("span", "\xA0", null, "display: inline-block; width: 1px; margin-right: -1px");
    node.setAttribute("cm-text", "");
    return node;
  } // Feature-detect IE's crummy client rect reporting for bidi text


  var badBidiRects;

  function hasBadBidiRects(measure) {
    if (badBidiRects != null) {
      return badBidiRects;
    }

    var txt = removeChildrenAndAdd(measure, document.createTextNode("A\u062EA"));
    var r0 = range(txt, 0, 1).getBoundingClientRect();
    var r1 = range(txt, 1, 2).getBoundingClientRect();
    removeChildren(measure);

    if (!r0 || r0.left == r0.right) {
      return false;
    } // Safari returns null in some cases (#2780)


    return badBidiRects = r1.right - r0.right < 3;
  } // See if "".split is the broken IE version, if so, provide an
  // alternative way to split lines.


  var splitLinesAuto = "\n\nb".split(/\n/).length != 3 ? function (string) {
    var pos = 0,
        result = [],
        l = string.length;

    while (pos <= l) {
      var nl = string.indexOf("\n", pos);

      if (nl == -1) {
        nl = string.length;
      }

      var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
      var rt = line.indexOf("\r");

      if (rt != -1) {
        result.push(line.slice(0, rt));
        pos += rt + 1;
      } else {
        result.push(line);
        pos = nl + 1;
      }
    }

    return result;
  } : function (string) {
    return string.split(/\r\n?|\n/);
  };
  var hasSelection = window.getSelection ? function (te) {
    try {
      return te.selectionStart != te.selectionEnd;
    } catch (e) {
      return false;
    }
  } : function (te) {
    var range;

    try {
      range = te.ownerDocument.selection.createRange();
    } catch (e) {}

    if (!range || range.parentElement() != te) {
      return false;
    }

    return range.compareEndPoints("StartToEnd", range) != 0;
  };

  var hasCopyEvent = function () {
    var e = elt("div");

    if ("oncopy" in e) {
      return true;
    }

    e.setAttribute("oncopy", "return;");
    return typeof e.oncopy == "function";
  }();

  var badZoomedRects = null;

  function hasBadZoomedRects(measure) {
    if (badZoomedRects != null) {
      return badZoomedRects;
    }

    var node = removeChildrenAndAdd(measure, elt("span", "x"));
    var normal = node.getBoundingClientRect();
    var fromRange = range(node, 0, 1).getBoundingClientRect();
    return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1;
  }

  var modes = {};
  var mimeModes = {}; // Extra arguments are stored as the mode's dependencies, which is
  // used by (legacy) mechanisms like loadmode.js to automatically
  // load a mode. (Preferred mechanism is the require/define calls.)

  function defineMode(name, mode) {
    if (arguments.length > 2) {
      mode.dependencies = Array.prototype.slice.call(arguments, 2);
    }

    modes[name] = mode;
  }

  function defineMIME(mime, spec) {
    mimeModes[mime] = spec;
  } // Given a MIME type, a {name, ...options} config object, or a name
  // string, return a mode config object.


  function resolveMode(spec) {
    if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
      spec = mimeModes[spec];
    } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
      var found = mimeModes[spec.name];

      if (typeof found == "string") {
        found = {
          name: found
        };
      }

      spec = createObj(found, spec);
      spec.name = found.name;
    } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) {
      return resolveMode("application/xml");
    } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+json$/.test(spec)) {
      return resolveMode("application/json");
    }

    if (typeof spec == "string") {
      return {
        name: spec
      };
    } else {
      return spec || {
        name: "null"
      };
    }
  } // Given a mode spec (anything that resolveMode accepts), find and
  // initialize an actual mode object.


  function getMode(options, spec) {
    spec = resolveMode(spec);
    var mfactory = modes[spec.name];

    if (!mfactory) {
      return getMode(options, "text/plain");
    }

    var modeObj = mfactory(options, spec);

    if (modeExtensions.hasOwnProperty(spec.name)) {
      var exts = modeExtensions[spec.name];

      for (var prop in exts) {
        if (!exts.hasOwnProperty(prop)) {
          continue;
        }

        if (modeObj.hasOwnProperty(prop)) {
          modeObj["_" + prop] = modeObj[prop];
        }

        modeObj[prop] = exts[prop];
      }
    }

    modeObj.name = spec.name;

    if (spec.helperType) {
      modeObj.helperType = spec.helperType;
    }

    if (spec.modeProps) {
      for (var prop$1 in spec.modeProps) {
        modeObj[prop$1] = spec.modeProps[prop$1];
      }
    }

    return modeObj;
  } // This can be used to attach properties to mode objects from
  // outside the actual mode definition.


  var modeExtensions = {};

  function extendMode(mode, properties) {
    var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : modeExtensions[mode] = {};
    copyObj(properties, exts);
  }

  function copyState(mode, state) {
    if (state === true) {
      return state;
    }

    if (mode.copyState) {
      return mode.copyState(state);
    }

    var nstate = {};

    for (var n in state) {
      var val = state[n];

      if (val instanceof Array) {
        val = val.concat([]);
      }

      nstate[n] = val;
    }

    return nstate;
  } // Given a mode and a state (for that mode), find the inner mode and
  // state at the position that the state refers to.


  function innerMode(mode, state) {
    var info;

    while (mode.innerMode) {
      info = mode.innerMode(state);

      if (!info || info.mode == mode) {
        break;
      }

      state = info.state;
      mode = info.mode;
    }

    return info || {
      mode: mode,
      state: state
    };
  }

  function startState(mode, a1, a2) {
    return mode.startState ? mode.startState(a1, a2) : true;
  } // STRING STREAM
  // Fed to the mode parsers, provides helper functions to make
  // parsers more succinct.


  var StringStream = function StringStream(string, tabSize) {
    this.pos = this.start = 0;
    this.string = string;
    this.tabSize = tabSize || 8;
    this.lastColumnPos = this.lastColumnValue = 0;
    this.lineStart = 0;
  };

  StringStream.prototype = {
    eol: function eol() {
      return this.pos >= this.string.length;
    },
    sol: function sol() {
      return this.pos == this.lineStart;
    },
    peek: function peek() {
      return this.string.charAt(this.pos) || undefined;
    },
    next: function next() {
      if (this.pos < this.string.length) {
        return this.string.charAt(this.pos++);
      }
    },
    eat: function eat(match) {
      var ch = this.string.charAt(this.pos);
      var ok;

      if (typeof match == "string") {
        ok = ch == match;
      } else {
        ok = ch && (match.test ? match.test(ch) : match(ch));
      }

      if (ok) {
        ++this.pos;
        return ch;
      }
    },
    eatWhile: function eatWhile(match) {
      var start = this.pos;

      while (this.eat(match)) {}

      return this.pos > start;
    },
    eatSpace: function eatSpace() {
      var this$1 = this;
      var start = this.pos;

      while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) {
        ++this$1.pos;
      }

      return this.pos > start;
    },
    skipToEnd: function skipToEnd() {
      this.pos = this.string.length;
    },
    skipTo: function skipTo(ch) {
      var found = this.string.indexOf(ch, this.pos);

      if (found > -1) {
        this.pos = found;
        return true;
      }
    },
    backUp: function backUp(n) {
      this.pos -= n;
    },
    column: function column() {
      if (this.lastColumnPos < this.start) {
        this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
        this.lastColumnPos = this.start;
      }

      return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
    },
    indentation: function indentation() {
      return countColumn(this.string, null, this.tabSize) - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
    },
    match: function match(pattern, consume, caseInsensitive) {
      if (typeof pattern == "string") {
        var cased = function cased(str) {
          return caseInsensitive ? str.toLowerCase() : str;
        };

        var substr = this.string.substr(this.pos, pattern.length);

        if (cased(substr) == cased(pattern)) {
          if (consume !== false) {
            this.pos += pattern.length;
          }

          return true;
        }
      } else {
        var match = this.string.slice(this.pos).match(pattern);

        if (match && match.index > 0) {
          return null;
        }

        if (match && consume !== false) {
          this.pos += match[0].length;
        }

        return match;
      }
    },
    current: function current() {
      return this.string.slice(this.start, this.pos);
    },
    hideFirstChars: function hideFirstChars(n, inner) {
      this.lineStart += n;

      try {
        return inner();
      } finally {
        this.lineStart -= n;
      }
    }
  }; // Compute a style array (an array starting with a mode generation
  // -- for invalidation -- followed by pairs of end positions and
  // style strings), which is used to highlight the tokens on the
  // line.

  function highlightLine(cm, line, state, forceToEnd) {
    // A styles array always starts with a number identifying the
    // mode/overlays that it is based on (for easy invalidation).
    var st = [cm.state.modeGen],
        lineClasses = {}; // Compute the base array of styles

    runMode(cm, line.text, cm.doc.mode, state, function (end, style) {
      return st.push(end, style);
    }, lineClasses, forceToEnd); // Run overlays, adjust style array.

    var loop = function loop(o) {
      var overlay = cm.state.overlays[o],
          i = 1,
          at = 0;
      runMode(cm, line.text, overlay.mode, true, function (end, style) {
        var start = i; // Ensure there's a token end at the current position, and that i points at it

        while (at < end) {
          var i_end = st[i];

          if (i_end > end) {
            st.splice(i, 1, end, st[i + 1], i_end);
          }

          i += 2;
          at = Math.min(end, i_end);
        }

        if (!style) {
          return;
        }

        if (overlay.opaque) {
          st.splice(start, i - start, end, "overlay " + style);
          i = start + 2;
        } else {
          for (; start < i; start += 2) {
            var cur = st[start + 1];
            st[start + 1] = (cur ? cur + " " : "") + "overlay " + style;
          }
        }
      }, lineClasses);
    };

    for (var o = 0; o < cm.state.overlays.length; ++o) {
      loop(o);
    }

    return {
      styles: st,
      classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null
    };
  }

  function getLineStyles(cm, line, updateFrontier) {
    if (!line.styles || line.styles[0] != cm.state.modeGen) {
      var state = getStateBefore(cm, lineNo(line));
      var result = highlightLine(cm, line, line.text.length > cm.options.maxHighlightLength ? copyState(cm.doc.mode, state) : state);
      line.stateAfter = state;
      line.styles = result.styles;

      if (result.classes) {
        line.styleClasses = result.classes;
      } else if (line.styleClasses) {
        line.styleClasses = null;
      }

      if (updateFrontier === cm.doc.frontier) {
        cm.doc.frontier++;
      }
    }

    return line.styles;
  }

  function getStateBefore(cm, n, precise) {
    var doc = cm.doc,
        display = cm.display;

    if (!doc.mode.startState) {
      return true;
    }

    var pos = findStartLine(cm, n, precise),
        state = pos > doc.first && getLine(doc, pos - 1).stateAfter;

    if (!state) {
      state = startState(doc.mode);
    } else {
      state = copyState(doc.mode, state);
    }

    doc.iter(pos, n, function (line) {
      processLine(cm, line.text, state);
      var save = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo;
      line.stateAfter = save ? copyState(doc.mode, state) : null;
      ++pos;
    });

    if (precise) {
      doc.frontier = pos;
    }

    return state;
  } // Lightweight form of highlight -- proceed over this line and
  // update state, but don't save a style array. Used for lines that
  // aren't currently visible.


  function processLine(cm, text, state, startAt) {
    var mode = cm.doc.mode;
    var stream = new StringStream(text, cm.options.tabSize);
    stream.start = stream.pos = startAt || 0;

    if (text == "") {
      callBlankLine(mode, state);
    }

    while (!stream.eol()) {
      readToken(mode, stream, state);
      stream.start = stream.pos;
    }
  }

  function callBlankLine(mode, state) {
    if (mode.blankLine) {
      return mode.blankLine(state);
    }

    if (!mode.innerMode) {
      return;
    }

    var inner = innerMode(mode, state);

    if (inner.mode.blankLine) {
      return inner.mode.blankLine(inner.state);
    }
  }

  function readToken(mode, stream, state, inner) {
    for (var i = 0; i < 10; i++) {
      if (inner) {
        inner[0] = innerMode(mode, state).mode;
      }

      var style = mode.token(stream, state);

      if (stream.pos > stream.start) {
        return style;
      }
    }

    throw new Error("Mode " + mode.name + " failed to advance stream.");
  } // Utility for getTokenAt and getLineTokens


  function takeToken(cm, pos, precise, asArray) {
    var getObj = function getObj(copy) {
      return {
        start: stream.start,
        end: stream.pos,
        string: stream.current(),
        type: style || null,
        state: copy ? copyState(doc.mode, state) : state
      };
    };

    var doc = cm.doc,
        mode = doc.mode,
        style;
    pos = _clipPos(doc, pos);
    var line = getLine(doc, pos.line),
        state = getStateBefore(cm, pos.line, precise);
    var stream = new StringStream(line.text, cm.options.tabSize),
        tokens;

    if (asArray) {
      tokens = [];
    }

    while ((asArray || stream.pos < pos.ch) && !stream.eol()) {
      stream.start = stream.pos;
      style = readToken(mode, stream, state);

      if (asArray) {
        tokens.push(getObj(true));
      }
    }

    return asArray ? tokens : getObj();
  }

  function extractLineClasses(type, output) {
    if (type) {
      for (;;) {
        var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);

        if (!lineClass) {
          break;
        }

        type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
        var prop = lineClass[1] ? "bgClass" : "textClass";

        if (output[prop] == null) {
          output[prop] = lineClass[2];
        } else if (!new RegExp("(?:^|\s)" + lineClass[2] + "(?:$|\s)").test(output[prop])) {
          output[prop] += " " + lineClass[2];
        }
      }
    }

    return type;
  } // Run the given mode's parser over a line, calling f for each token.


  function runMode(cm, text, mode, state, f, lineClasses, forceToEnd) {
    var flattenSpans = mode.flattenSpans;

    if (flattenSpans == null) {
      flattenSpans = cm.options.flattenSpans;
    }

    var curStart = 0,
        curStyle = null;
    var stream = new StringStream(text, cm.options.tabSize),
        style;
    var inner = cm.options.addModeClass && [null];

    if (text == "") {
      extractLineClasses(callBlankLine(mode, state), lineClasses);
    }

    while (!stream.eol()) {
      if (stream.pos > cm.options.maxHighlightLength) {
        flattenSpans = false;

        if (forceToEnd) {
          processLine(cm, text, state, stream.pos);
        }

        stream.pos = text.length;
        style = null;
      } else {
        style = extractLineClasses(readToken(mode, stream, state, inner), lineClasses);
      }

      if (inner) {
        var mName = inner[0].name;

        if (mName) {
          style = "m-" + (style ? mName + " " + style : mName);
        }
      }

      if (!flattenSpans || curStyle != style) {
        while (curStart < stream.start) {
          curStart = Math.min(stream.start, curStart + 5000);
          f(curStart, curStyle);
        }

        curStyle = style;
      }

      stream.start = stream.pos;
    }

    while (curStart < stream.pos) {
      // Webkit seems to refuse to render text nodes longer than 57444
      // characters, and returns inaccurate measurements in nodes
      // starting around 5000 chars.
      var pos = Math.min(stream.pos, curStart + 5000);
      f(pos, curStyle);
      curStart = pos;
    }
  } // Finds the line to start with when starting a parse. Tries to
  // find a line with a stateAfter, so that it can start with a
  // valid state. If that fails, it returns the line with the
  // smallest indentation, which tends to need the least context to
  // parse correctly.


  function findStartLine(cm, n, precise) {
    var minindent,
        minline,
        doc = cm.doc;
    var lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1000 : 100);

    for (var search = n; search > lim; --search) {
      if (search <= doc.first) {
        return doc.first;
      }

      var line = getLine(doc, search - 1);

      if (line.stateAfter && (!precise || search <= doc.frontier)) {
        return search;
      }

      var indented = countColumn(line.text, null, cm.options.tabSize);

      if (minline == null || minindent > indented) {
        minline = search - 1;
        minindent = indented;
      }
    }

    return minline;
  } // LINE DATA STRUCTURE
  // Line objects. These hold state related to a line, including
  // highlighting info (the styles array).


  function Line(text, markedSpans, estimateHeight) {
    this.text = text;
    attachMarkedSpans(this, markedSpans);
    this.height = estimateHeight ? estimateHeight(this) : 1;
  }

  eventMixin(Line);

  Line.prototype.lineNo = function () {
    return lineNo(this);
  }; // Change the content (text, markers) of a line. Automatically
  // invalidates cached information and tries to re-estimate the
  // line's height.


  function updateLine(line, text, markedSpans, estimateHeight) {
    line.text = text;

    if (line.stateAfter) {
      line.stateAfter = null;
    }

    if (line.styles) {
      line.styles = null;
    }

    if (line.order != null) {
      line.order = null;
    }

    detachMarkedSpans(line);
    attachMarkedSpans(line, markedSpans);
    var estHeight = estimateHeight ? estimateHeight(line) : 1;

    if (estHeight != line.height) {
      updateLineHeight(line, estHeight);
    }
  } // Detach a line from the document tree and its markers.


  function cleanUpLine(line) {
    line.parent = null;
    detachMarkedSpans(line);
  } // Convert a style as returned by a mode (either null, or a string
  // containing one or more styles) to a CSS style. This is cached,
  // and also looks for line-wide styles.


  var styleToClassCache = {};
  var styleToClassCacheWithMode = {};

  function interpretTokenStyle(style, options) {
    if (!style || /^\s*$/.test(style)) {
      return null;
    }

    var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
    return cache[style] || (cache[style] = style.replace(/\S+/g, "cm-$&"));
  } // Render the DOM representation of the text of a line. Also builds
  // up a 'line map', which points at the DOM nodes that represent
  // specific stretches of text, and is used by the measuring code.
  // The returned object contains the DOM node, this map, and
  // information about line-wide styles that were set by the mode.


  function buildLineContent(cm, lineView) {
    // The padding-right forces the element to have a 'border', which
    // is needed on Webkit to be able to get line-level bounding
    // rectangles for it (in measureChar).
    var content = elt("span", null, null, webkit ? "padding-right: .1px" : null);
    var builder = {
      pre: elt("pre", [content], "CodeMirror-line"),
      content: content,
      col: 0,
      pos: 0,
      cm: cm,
      trailingSpace: false,
      splitSpaces: (ie || webkit) && cm.getOption("lineWrapping")
    }; // hide from accessibility tree

    content.setAttribute("role", "presentation");
    builder.pre.setAttribute("role", "presentation");
    lineView.measure = {}; // Iterate over the logical lines that make up this visual line.

    for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
      var line = i ? lineView.rest[i - 1] : lineView.line,
          order = void 0;
      builder.pos = 0;
      builder.addToken = buildToken; // Optionally wire in some hacks into the token-rendering
      // algorithm, to deal with browser quirks.

      if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line))) {
        builder.addToken = buildTokenBadBidi(builder.addToken, order);
      }

      builder.map = [];
      var allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line);
      insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate));

      if (line.styleClasses) {
        if (line.styleClasses.bgClass) {
          builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || "");
        }

        if (line.styleClasses.textClass) {
          builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || "");
        }
      } // Ensure at least a single node is present, for measuring.


      if (builder.map.length == 0) {
        builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure)));
      } // Store the map and a cache object for the current logical line


      if (i == 0) {
        lineView.measure.map = builder.map;
        lineView.measure.cache = {};
      } else {
        ;
        (lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map);
        (lineView.measure.caches || (lineView.measure.caches = [])).push({});
      }
    } // See issue #2901


    if (webkit) {
      var last = builder.content.lastChild;

      if (/\bcm-tab\b/.test(last.className) || last.querySelector && last.querySelector(".cm-tab")) {
        builder.content.className = "cm-tab-wrap-hack";
      }
    }

    signal(cm, "renderLine", cm, lineView.line, builder.pre);

    if (builder.pre.className) {
      builder.textClass = joinClasses(builder.pre.className, builder.textClass || "");
    }

    return builder;
  }

  function defaultSpecialCharPlaceholder(ch) {
    var token = elt("span", "\u2022", "cm-invalidchar");
    token.title = "\\u" + ch.charCodeAt(0).toString(16);
    token.setAttribute("aria-label", token.title);
    return token;
  } // Build up the DOM representation for a single token, and add it to
  // the line map. Takes care to render special characters separately.


  function buildToken(builder, text, style, startStyle, endStyle, title, css) {
    if (!text) {
      return;
    }

    var displayText = builder.splitSpaces ? splitSpaces(text, builder.trailingSpace) : text;
    var special = builder.cm.state.specialChars,
        mustWrap = false;
    var content;

    if (!special.test(text)) {
      builder.col += text.length;
      content = document.createTextNode(displayText);
      builder.map.push(builder.pos, builder.pos + text.length, content);

      if (ie && ie_version < 9) {
        mustWrap = true;
      }

      builder.pos += text.length;
    } else {
      content = document.createDocumentFragment();
      var pos = 0;

      while (true) {
        special.lastIndex = pos;
        var m = special.exec(text);
        var skipped = m ? m.index - pos : text.length - pos;

        if (skipped) {
          var txt = document.createTextNode(displayText.slice(pos, pos + skipped));

          if (ie && ie_version < 9) {
            content.appendChild(elt("span", [txt]));
          } else {
            content.appendChild(txt);
          }

          builder.map.push(builder.pos, builder.pos + skipped, txt);
          builder.col += skipped;
          builder.pos += skipped;
        }

        if (!m) {
          break;
        }

        pos += skipped + 1;
        var txt$1 = void 0;

        if (m[0] == "\t") {
          var tabSize = builder.cm.options.tabSize,
              tabWidth = tabSize - builder.col % tabSize;
          txt$1 = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
          txt$1.setAttribute("role", "presentation");
          txt$1.setAttribute("cm-text", "\t");
          builder.col += tabWidth;
        } else if (m[0] == "\r" || m[0] == "\n") {
          txt$1 = content.appendChild(elt("span", m[0] == "\r" ? "\u240D" : "\u2424", "cm-invalidchar"));
          txt$1.setAttribute("cm-text", m[0]);
          builder.col += 1;
        } else {
          txt$1 = builder.cm.options.specialCharPlaceholder(m[0]);
          txt$1.setAttribute("cm-text", m[0]);

          if (ie && ie_version < 9) {
            content.appendChild(elt("span", [txt$1]));
          } else {
            content.appendChild(txt$1);
          }

          builder.col += 1;
        }

        builder.map.push(builder.pos, builder.pos + 1, txt$1);
        builder.pos++;
      }
    }

    builder.trailingSpace = displayText.charCodeAt(text.length - 1) == 32;

    if (style || startStyle || endStyle || mustWrap || css) {
      var fullStyle = style || "";

      if (startStyle) {
        fullStyle += startStyle;
      }

      if (endStyle) {
        fullStyle += endStyle;
      }

      var token = elt("span", [content], fullStyle, css);

      if (title) {
        token.title = title;
      }

      return builder.content.appendChild(token);
    }

    builder.content.appendChild(content);
  }

  function splitSpaces(text, trailingBefore) {
    if (text.length > 1 && !/  /.test(text)) {
      return text;
    }

    var spaceBefore = trailingBefore,
        result = "";

    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);

      if (ch == " " && spaceBefore && (i == text.length - 1 || text.charCodeAt(i + 1) == 32)) {
        ch = "\xA0";
      }

      result += ch;
      spaceBefore = ch == " ";
    }

    return result;
  } // Work around nonsense dimensions being reported for stretches of
  // right-to-left text.


  function buildTokenBadBidi(inner, order) {
    return function (builder, text, style, startStyle, endStyle, title, css) {
      style = style ? style + " cm-force-border" : "cm-force-border";
      var start = builder.pos,
          end = start + text.length;

      for (;;) {
        // Find the part that overlaps with the start of this text
        var part = void 0;

        for (var i = 0; i < order.length; i++) {
          part = order[i];

          if (part.to > start && part.from <= start) {
            break;
          }
        }

        if (part.to >= end) {
          return inner(builder, text, style, startStyle, endStyle, title, css);
        }

        inner(builder, text.slice(0, part.to - start), style, startStyle, null, title, css);
        startStyle = null;
        text = text.slice(part.to - start);
        start = part.to;
      }
    };
  }

  function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
    var widget = !ignoreWidget && marker.widgetNode;

    if (widget) {
      builder.map.push(builder.pos, builder.pos + size, widget);
    }

    if (!ignoreWidget && builder.cm.display.input.needsContentAttribute) {
      if (!widget) {
        widget = builder.content.appendChild(document.createElement("span"));
      }

      widget.setAttribute("cm-marker", marker.id);
    }

    if (widget) {
      builder.cm.display.input.setUneditable(widget);
      builder.content.appendChild(widget);
    }

    builder.pos += size;
    builder.trailingSpace = false;
  } // Outputs a number of spans to make up a line, taking highlighting
  // and marked text into account.


  function insertLineContent(line, builder, styles) {
    var spans = line.markedSpans,
        allText = line.text,
        at = 0;

    if (!spans) {
      for (var i$1 = 1; i$1 < styles.length; i$1 += 2) {
        builder.addToken(builder, allText.slice(at, at = styles[i$1]), interpretTokenStyle(styles[i$1 + 1], builder.cm.options));
      }

      return;
    }

    var len = allText.length,
        pos = 0,
        i = 1,
        text = "",
        style,
        css;
    var nextChange = 0,
        spanStyle,
        spanEndStyle,
        spanStartStyle,
        title,
        collapsed;

    for (;;) {
      if (nextChange == pos) {
        // Update current marker set
        spanStyle = spanEndStyle = spanStartStyle = title = css = "";
        collapsed = null;
        nextChange = Infinity;
        var foundBookmarks = [],
            endStyles = void 0;

        for (var j = 0; j < spans.length; ++j) {
          var sp = spans[j],
              m = sp.marker;

          if (m.type == "bookmark" && sp.from == pos && m.widgetNode) {
            foundBookmarks.push(m);
          } else if (sp.from <= pos && (sp.to == null || sp.to > pos || m.collapsed && sp.to == pos && sp.from == pos)) {
            if (sp.to != null && sp.to != pos && nextChange > sp.to) {
              nextChange = sp.to;
              spanEndStyle = "";
            }

            if (m.className) {
              spanStyle += " " + m.className;
            }

            if (m.css) {
              css = (css ? css + ";" : "") + m.css;
            }

            if (m.startStyle && sp.from == pos) {
              spanStartStyle += " " + m.startStyle;
            }

            if (m.endStyle && sp.to == nextChange) {
              (endStyles || (endStyles = [])).push(m.endStyle, sp.to);
            }

            if (m.title && !title) {
              title = m.title;
            }

            if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0)) {
              collapsed = sp;
            }
          } else if (sp.from > pos && nextChange > sp.from) {
            nextChange = sp.from;
          }
        }

        if (endStyles) {
          for (var j$1 = 0; j$1 < endStyles.length; j$1 += 2) {
            if (endStyles[j$1 + 1] == nextChange) {
              spanEndStyle += " " + endStyles[j$1];
            }
          }
        }

        if (!collapsed || collapsed.from == pos) {
          for (var j$2 = 0; j$2 < foundBookmarks.length; ++j$2) {
            buildCollapsedSpan(builder, 0, foundBookmarks[j$2]);
          }
        }

        if (collapsed && (collapsed.from || 0) == pos) {
          buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos, collapsed.marker, collapsed.from == null);

          if (collapsed.to == null) {
            return;
          }

          if (collapsed.to == pos) {
            collapsed = false;
          }
        }
      }

      if (pos >= len) {
        break;
      }

      var upto = Math.min(len, nextChange);

      while (true) {
        if (text) {
          var end = pos + text.length;

          if (!collapsed) {
            var tokenText = end > upto ? text.slice(0, upto - pos) : text;
            builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle, spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", title, css);
          }

          if (end >= upto) {
            text = text.slice(upto - pos);
            pos = upto;
            break;
          }

          pos = end;
          spanStartStyle = "";
        }

        text = allText.slice(at, at = styles[i++]);
        style = interpretTokenStyle(styles[i++], builder.cm.options);
      }
    }
  } // These objects are used to represent the visible (currently drawn)
  // part of the document. A LineView may correspond to multiple
  // logical lines, if those are connected by collapsed ranges.


  function LineView(doc, line, lineN) {
    // The starting line
    this.line = line; // Continuing lines, if any

    this.rest = visualLineContinued(line); // Number of logical lines in this visual line

    this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1;
    this.node = this.text = null;
    this.hidden = lineIsHidden(doc, line);
  } // Create a range of LineView objects for the given lines.


  function buildViewArray(cm, from, to) {
    var array = [],
        nextPos;

    for (var pos = from; pos < to; pos = nextPos) {
      var view = new LineView(cm.doc, getLine(cm.doc, pos), pos);
      nextPos = pos + view.size;
      array.push(view);
    }

    return array;
  }

  var operationGroup = null;

  function pushOperation(op) {
    if (operationGroup) {
      operationGroup.ops.push(op);
    } else {
      op.ownsGroup = operationGroup = {
        ops: [op],
        delayedCallbacks: []
      };
    }
  }

  function fireCallbacksForOps(group) {
    // Calls delayed callbacks and cursorActivity handlers until no
    // new ones appear
    var callbacks = group.delayedCallbacks,
        i = 0;

    do {
      for (; i < callbacks.length; i++) {
        callbacks[i].call(null);
      }

      for (var j = 0; j < group.ops.length; j++) {
        var op = group.ops[j];

        if (op.cursorActivityHandlers) {
          while (op.cursorActivityCalled < op.cursorActivityHandlers.length) {
            op.cursorActivityHandlers[op.cursorActivityCalled++].call(null, op.cm);
          }
        }
      }
    } while (i < callbacks.length);
  }

  function finishOperation(op, endCb) {
    var group = op.ownsGroup;

    if (!group) {
      return;
    }

    try {
      fireCallbacksForOps(group);
    } finally {
      operationGroup = null;
      endCb(group);
    }
  }

  var orphanDelayedCallbacks = null; // Often, we want to signal events at a point where we are in the
  // middle of some work, but don't want the handler to start calling
  // other methods on the editor, which might be in an inconsistent
  // state or simply not expect any other events to happen.
  // signalLater looks whether there are any handlers, and schedules
  // them to be executed when the last operation ends, or, if no
  // operation is active, when a timeout fires.

  function signalLater(emitter, type
  /*, values...*/
  ) {
    var arr = getHandlers(emitter, type);

    if (!arr.length) {
      return;
    }

    var args = Array.prototype.slice.call(arguments, 2),
        list;

    if (operationGroup) {
      list = operationGroup.delayedCallbacks;
    } else if (orphanDelayedCallbacks) {
      list = orphanDelayedCallbacks;
    } else {
      list = orphanDelayedCallbacks = [];
      setTimeout(fireOrphanDelayed, 0);
    }

    var loop = function loop(i) {
      list.push(function () {
        return arr[i].apply(null, args);
      });
    };

    for (var i = 0; i < arr.length; ++i) {
      loop(i);
    }
  }

  function fireOrphanDelayed() {
    var delayed = orphanDelayedCallbacks;
    orphanDelayedCallbacks = null;

    for (var i = 0; i < delayed.length; ++i) {
      delayed[i]();
    }
  } // When an aspect of a line changes, a string is added to
  // lineView.changes. This updates the relevant part of the line's
  // DOM structure.


  function updateLineForChanges(cm, lineView, lineN, dims) {
    for (var j = 0; j < lineView.changes.length; j++) {
      var type = lineView.changes[j];

      if (type == "text") {
        updateLineText(cm, lineView);
      } else if (type == "gutter") {
        updateLineGutter(cm, lineView, lineN, dims);
      } else if (type == "class") {
        updateLineClasses(lineView);
      } else if (type == "widget") {
        updateLineWidgets(cm, lineView, dims);
      }
    }

    lineView.changes = null;
  } // Lines with gutter elements, widgets or a background class need to
  // be wrapped, and have the extra elements added to the wrapper div


  function ensureLineWrapped(lineView) {
    if (lineView.node == lineView.text) {
      lineView.node = elt("div", null, null, "position: relative");

      if (lineView.text.parentNode) {
        lineView.text.parentNode.replaceChild(lineView.node, lineView.text);
      }

      lineView.node.appendChild(lineView.text);

      if (ie && ie_version < 8) {
        lineView.node.style.zIndex = 2;
      }
    }

    return lineView.node;
  }

  function updateLineBackground(lineView) {
    var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;

    if (cls) {
      cls += " CodeMirror-linebackground";
    }

    if (lineView.background) {
      if (cls) {
        lineView.background.className = cls;
      } else {
        lineView.background.parentNode.removeChild(lineView.background);
        lineView.background = null;
      }
    } else if (cls) {
      var wrap = ensureLineWrapped(lineView);
      lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild);
    }
  } // Wrapper around buildLineContent which will reuse the structure
  // in display.externalMeasured when possible.


  function getLineContent(cm, lineView) {
    var ext = cm.display.externalMeasured;

    if (ext && ext.line == lineView.line) {
      cm.display.externalMeasured = null;
      lineView.measure = ext.measure;
      return ext.built;
    }

    return buildLineContent(cm, lineView);
  } // Redraw the line's text. Interacts with the background and text
  // classes because the mode may output tokens that influence these
  // classes.


  function updateLineText(cm, lineView) {
    var cls = lineView.text.className;
    var built = getLineContent(cm, lineView);

    if (lineView.text == lineView.node) {
      lineView.node = built.pre;
    }

    lineView.text.parentNode.replaceChild(built.pre, lineView.text);
    lineView.text = built.pre;

    if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
      lineView.bgClass = built.bgClass;
      lineView.textClass = built.textClass;
      updateLineClasses(lineView);
    } else if (cls) {
      lineView.text.className = cls;
    }
  }

  function updateLineClasses(lineView) {
    updateLineBackground(lineView);

    if (lineView.line.wrapClass) {
      ensureLineWrapped(lineView).className = lineView.line.wrapClass;
    } else if (lineView.node != lineView.text) {
      lineView.node.className = "";
    }

    var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
    lineView.text.className = textClass || "";
  }

  function updateLineGutter(cm, lineView, lineN, dims) {
    if (lineView.gutter) {
      lineView.node.removeChild(lineView.gutter);
      lineView.gutter = null;
    }

    if (lineView.gutterBackground) {
      lineView.node.removeChild(lineView.gutterBackground);
      lineView.gutterBackground = null;
    }

    if (lineView.line.gutterClass) {
      var wrap = ensureLineWrapped(lineView);
      lineView.gutterBackground = elt("div", null, "CodeMirror-gutter-background " + lineView.line.gutterClass, "left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px; width: " + dims.gutterTotalWidth + "px");
      wrap.insertBefore(lineView.gutterBackground, lineView.text);
    }

    var markers = lineView.line.gutterMarkers;

    if (cm.options.lineNumbers || markers) {
      var wrap$1 = ensureLineWrapped(lineView);
      var gutterWrap = lineView.gutter = elt("div", null, "CodeMirror-gutter-wrapper", "left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px");
      cm.display.input.setUneditable(gutterWrap);
      wrap$1.insertBefore(gutterWrap, lineView.text);

      if (lineView.line.gutterClass) {
        gutterWrap.className += " " + lineView.line.gutterClass;
      }

      if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"])) {
        lineView.lineNumber = gutterWrap.appendChild(elt("div", lineNumberFor(cm.options, lineN), "CodeMirror-linenumber CodeMirror-gutter-elt", "left: " + dims.gutterLeft["CodeMirror-linenumbers"] + "px; width: " + cm.display.lineNumInnerWidth + "px"));
      }

      if (markers) {
        for (var k = 0; k < cm.options.gutters.length; ++k) {
          var id = cm.options.gutters[k],
              found = markers.hasOwnProperty(id) && markers[id];

          if (found) {
            gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt", "left: " + dims.gutterLeft[id] + "px; width: " + dims.gutterWidth[id] + "px"));
          }
        }
      }
    }
  }

  function updateLineWidgets(cm, lineView, dims) {
    if (lineView.alignable) {
      lineView.alignable = null;
    }

    for (var node = lineView.node.firstChild, next = void 0; node; node = next) {
      next = node.nextSibling;

      if (node.className == "CodeMirror-linewidget") {
        lineView.node.removeChild(node);
      }
    }

    insertLineWidgets(cm, lineView, dims);
  } // Build a line's DOM representation from scratch


  function buildLineElement(cm, lineView, lineN, dims) {
    var built = getLineContent(cm, lineView);
    lineView.text = lineView.node = built.pre;

    if (built.bgClass) {
      lineView.bgClass = built.bgClass;
    }

    if (built.textClass) {
      lineView.textClass = built.textClass;
    }

    updateLineClasses(lineView);
    updateLineGutter(cm, lineView, lineN, dims);
    insertLineWidgets(cm, lineView, dims);
    return lineView.node;
  } // A lineView may contain multiple logical lines (when merged by
  // collapsed spans). The widgets for all of them need to be drawn.


  function insertLineWidgets(cm, lineView, dims) {
    insertLineWidgetsFor(cm, lineView.line, lineView, dims, true);

    if (lineView.rest) {
      for (var i = 0; i < lineView.rest.length; i++) {
        insertLineWidgetsFor(cm, lineView.rest[i], lineView, dims, false);
      }
    }
  }

  function insertLineWidgetsFor(cm, line, lineView, dims, allowAbove) {
    if (!line.widgets) {
      return;
    }

    var wrap = ensureLineWrapped(lineView);

    for (var i = 0, ws = line.widgets; i < ws.length; ++i) {
      var widget = ws[i],
          node = elt("div", [widget.node], "CodeMirror-linewidget");

      if (!widget.handleMouseEvents) {
        node.setAttribute("cm-ignore-events", "true");
      }

      positionLineWidget(widget, node, lineView, dims);
      cm.display.input.setUneditable(node);

      if (allowAbove && widget.above) {
        wrap.insertBefore(node, lineView.gutter || lineView.text);
      } else {
        wrap.appendChild(node);
      }

      signalLater(widget, "redraw");
    }
  }

  function positionLineWidget(widget, node, lineView, dims) {
    if (widget.noHScroll) {
      ;
      (lineView.alignable || (lineView.alignable = [])).push(node);
      var width = dims.wrapperWidth;
      node.style.left = dims.fixedPos + "px";

      if (!widget.coverGutter) {
        width -= dims.gutterTotalWidth;
        node.style.paddingLeft = dims.gutterTotalWidth + "px";
      }

      node.style.width = width + "px";
    }

    if (widget.coverGutter) {
      node.style.zIndex = 5;
      node.style.position = "relative";

      if (!widget.noHScroll) {
        node.style.marginLeft = -dims.gutterTotalWidth + "px";
      }
    }
  }

  function widgetHeight(widget) {
    if (widget.height != null) {
      return widget.height;
    }

    var cm = widget.doc.cm;

    if (!cm) {
      return 0;
    }

    if (!contains(document.body, widget.node)) {
      var parentStyle = "position: relative;";

      if (widget.coverGutter) {
        parentStyle += "margin-left: -" + cm.display.gutters.offsetWidth + "px;";
      }

      if (widget.noHScroll) {
        parentStyle += "width: " + cm.display.wrapper.clientWidth + "px;";
      }

      removeChildrenAndAdd(cm.display.measure, elt("div", [widget.node], null, parentStyle));
    }

    return widget.height = widget.node.parentNode.offsetHeight;
  } // Return true when the given mouse event happened in a widget


  function eventInWidget(display, e) {
    for (var n = e_target(e); n != display.wrapper; n = n.parentNode) {
      if (!n || n.nodeType == 1 && n.getAttribute("cm-ignore-events") == "true" || n.parentNode == display.sizer && n != display.mover) {
        return true;
      }
    }
  } // POSITION MEASUREMENT


  function paddingTop(display) {
    return display.lineSpace.offsetTop;
  }

  function paddingVert(display) {
    return display.mover.offsetHeight - display.lineSpace.offsetHeight;
  }

  function paddingH(display) {
    if (display.cachedPaddingH) {
      return display.cachedPaddingH;
    }

    var e = removeChildrenAndAdd(display.measure, elt("pre", "x"));
    var style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle;
    var data = {
      left: parseInt(style.paddingLeft),
      right: parseInt(style.paddingRight)
    };

    if (!isNaN(data.left) && !isNaN(data.right)) {
      display.cachedPaddingH = data;
    }

    return data;
  }

  function scrollGap(cm) {
    return scrollerGap - cm.display.nativeBarWidth;
  }

  function displayWidth(cm) {
    return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth;
  }

  function displayHeight(cm) {
    return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight;
  } // Ensure the lineView.wrapping.heights array is populated. This is
  // an array of bottom offsets for the lines that make up a drawn
  // line. When lineWrapping is on, there might be more than one
  // height.


  function ensureLineHeights(cm, lineView, rect) {
    var wrapping = cm.options.lineWrapping;
    var curWidth = wrapping && displayWidth(cm);

    if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
      var heights = lineView.measure.heights = [];

      if (wrapping) {
        lineView.measure.width = curWidth;
        var rects = lineView.text.firstChild.getClientRects();

        for (var i = 0; i < rects.length - 1; i++) {
          var cur = rects[i],
              next = rects[i + 1];

          if (Math.abs(cur.bottom - next.bottom) > 2) {
            heights.push((cur.bottom + next.top) / 2 - rect.top);
          }
        }
      }

      heights.push(rect.bottom - rect.top);
    }
  } // Find a line map (mapping character offsets to text nodes) and a
  // measurement cache for the given line number. (A line view might
  // contain multiple lines when collapsed ranges are present.)


  function mapFromLineView(lineView, line, lineN) {
    if (lineView.line == line) {
      return {
        map: lineView.measure.map,
        cache: lineView.measure.cache
      };
    }

    for (var i = 0; i < lineView.rest.length; i++) {
      if (lineView.rest[i] == line) {
        return {
          map: lineView.measure.maps[i],
          cache: lineView.measure.caches[i]
        };
      }
    }

    for (var i$1 = 0; i$1 < lineView.rest.length; i$1++) {
      if (lineNo(lineView.rest[i$1]) > lineN) {
        return {
          map: lineView.measure.maps[i$1],
          cache: lineView.measure.caches[i$1],
          before: true
        };
      }
    }
  } // Render a line into the hidden node display.externalMeasured. Used
  // when measurement is needed for a line that's not in the viewport.


  function updateExternalMeasurement(cm, line) {
    line = visualLine(line);
    var lineN = lineNo(line);
    var view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN);
    view.lineN = lineN;
    var built = view.built = buildLineContent(cm, view);
    view.text = built.pre;
    removeChildrenAndAdd(cm.display.lineMeasure, built.pre);
    return view;
  } // Get a {top, bottom, left, right} box (in line-local coordinates)
  // for a given character.


  function measureChar(cm, line, ch, bias) {
    return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias);
  } // Find a line view that corresponds to the given line number.


  function findViewForLine(cm, lineN) {
    if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo) {
      return cm.display.view[findViewIndex(cm, lineN)];
    }

    var ext = cm.display.externalMeasured;

    if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size) {
      return ext;
    }
  } // Measurement can be split in two steps, the set-up work that
  // applies to the whole line, and the measurement of the actual
  // character. Functions like coordsChar, that need to do a lot of
  // measurements in a row, can thus ensure that the set-up work is
  // only done once.


  function prepareMeasureForLine(cm, line) {
    var lineN = lineNo(line);
    var view = findViewForLine(cm, lineN);

    if (view && !view.text) {
      view = null;
    } else if (view && view.changes) {
      updateLineForChanges(cm, view, lineN, getDimensions(cm));
      cm.curOp.forceUpdate = true;
    }

    if (!view) {
      view = updateExternalMeasurement(cm, line);
    }

    var info = mapFromLineView(view, line, lineN);
    return {
      line: line,
      view: view,
      rect: null,
      map: info.map,
      cache: info.cache,
      before: info.before,
      hasHeights: false
    };
  } // Given a prepared measurement object, measures the position of an
  // actual character (or fetches it from the cache).


  function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
    if (prepared.before) {
      ch = -1;
    }

    var key = ch + (bias || ""),
        found;

    if (prepared.cache.hasOwnProperty(key)) {
      found = prepared.cache[key];
    } else {
      if (!prepared.rect) {
        prepared.rect = prepared.view.text.getBoundingClientRect();
      }

      if (!prepared.hasHeights) {
        ensureLineHeights(cm, prepared.view, prepared.rect);
        prepared.hasHeights = true;
      }

      found = measureCharInner(cm, prepared, ch, bias);

      if (!found.bogus) {
        prepared.cache[key] = found;
      }
    }

    return {
      left: found.left,
      right: found.right,
      top: varHeight ? found.rtop : found.top,
      bottom: varHeight ? found.rbottom : found.bottom
    };
  }

  var nullRect = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };

  function nodeAndOffsetInLineMap(map, ch, bias) {
    var node, start, end, collapse, mStart, mEnd; // First, search the line map for the text node corresponding to,
    // or closest to, the target character.

    for (var i = 0; i < map.length; i += 3) {
      mStart = map[i];
      mEnd = map[i + 1];

      if (ch < mStart) {
        start = 0;
        end = 1;
        collapse = "left";
      } else if (ch < mEnd) {
        start = ch - mStart;
        end = start + 1;
      } else if (i == map.length - 3 || ch == mEnd && map[i + 3] > ch) {
        end = mEnd - mStart;
        start = end - 1;

        if (ch >= mEnd) {
          collapse = "right";
        }
      }

      if (start != null) {
        node = map[i + 2];

        if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right")) {
          collapse = bias;
        }

        if (bias == "left" && start == 0) {
          while (i && map[i - 2] == map[i - 3] && map[i - 1].insertLeft) {
            node = map[(i -= 3) + 2];
            collapse = "left";
          }
        }

        if (bias == "right" && start == mEnd - mStart) {
          while (i < map.length - 3 && map[i + 3] == map[i + 4] && !map[i + 5].insertLeft) {
            node = map[(i += 3) + 2];
            collapse = "right";
          }
        }

        break;
      }
    }

    return {
      node: node,
      start: start,
      end: end,
      collapse: collapse,
      coverStart: mStart,
      coverEnd: mEnd
    };
  }

  function getUsefulRect(rects, bias) {
    var rect = nullRect;

    if (bias == "left") {
      for (var i = 0; i < rects.length; i++) {
        if ((rect = rects[i]).left != rect.right) {
          break;
        }
      }
    } else {
      for (var i$1 = rects.length - 1; i$1 >= 0; i$1--) {
        if ((rect = rects[i$1]).left != rect.right) {
          break;
        }
      }
    }

    return rect;
  }

  function measureCharInner(cm, prepared, ch, bias) {
    var place = nodeAndOffsetInLineMap(prepared.map, ch, bias);
    var node = place.node,
        start = place.start,
        end = place.end,
        collapse = place.collapse;
    var rect;

    if (node.nodeType == 3) {
      // If it is a text node, use a range to retrieve the coordinates.
      for (var i$1 = 0; i$1 < 4; i$1++) {
        // Retry a maximum of 4 times when nonsense rectangles are returned
        while (start && isExtendingChar(prepared.line.text.charAt(place.coverStart + start))) {
          --start;
        }

        while (place.coverStart + end < place.coverEnd && isExtendingChar(prepared.line.text.charAt(place.coverStart + end))) {
          ++end;
        }

        if (ie && ie_version < 9 && start == 0 && end == place.coverEnd - place.coverStart) {
          rect = node.parentNode.getBoundingClientRect();
        } else {
          rect = getUsefulRect(range(node, start, end).getClientRects(), bias);
        }

        if (rect.left || rect.right || start == 0) {
          break;
        }

        end = start;
        start = start - 1;
        collapse = "right";
      }

      if (ie && ie_version < 11) {
        rect = maybeUpdateRectForZooming(cm.display.measure, rect);
      }
    } else {
      // If it is a widget, simply get the box for the whole widget.
      if (start > 0) {
        collapse = bias = "right";
      }

      var rects;

      if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1) {
        rect = rects[bias == "right" ? rects.length - 1 : 0];
      } else {
        rect = node.getBoundingClientRect();
      }
    }

    if (ie && ie_version < 9 && !start && (!rect || !rect.left && !rect.right)) {
      var rSpan = node.parentNode.getClientRects()[0];

      if (rSpan) {
        rect = {
          left: rSpan.left,
          right: rSpan.left + charWidth(cm.display),
          top: rSpan.top,
          bottom: rSpan.bottom
        };
      } else {
        rect = nullRect;
      }
    }

    var rtop = rect.top - prepared.rect.top,
        rbot = rect.bottom - prepared.rect.top;
    var mid = (rtop + rbot) / 2;
    var heights = prepared.view.measure.heights;
    var i = 0;

    for (; i < heights.length - 1; i++) {
      if (mid < heights[i]) {
        break;
      }
    }

    var top = i ? heights[i - 1] : 0,
        bot = heights[i];
    var result = {
      left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
      right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
      top: top,
      bottom: bot
    };

    if (!rect.left && !rect.right) {
      result.bogus = true;
    }

    if (!cm.options.singleCursorHeightPerLine) {
      result.rtop = rtop;
      result.rbottom = rbot;
    }

    return result;
  } // Work around problem with bounding client rects on ranges being
  // returned incorrectly when zoomed on IE10 and below.


  function maybeUpdateRectForZooming(measure, rect) {
    if (!window.screen || screen.logicalXDPI == null || screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure)) {
      return rect;
    }

    var scaleX = screen.logicalXDPI / screen.deviceXDPI;
    var scaleY = screen.logicalYDPI / screen.deviceYDPI;
    return {
      left: rect.left * scaleX,
      right: rect.right * scaleX,
      top: rect.top * scaleY,
      bottom: rect.bottom * scaleY
    };
  }

  function clearLineMeasurementCacheFor(lineView) {
    if (lineView.measure) {
      lineView.measure.cache = {};
      lineView.measure.heights = null;

      if (lineView.rest) {
        for (var i = 0; i < lineView.rest.length; i++) {
          lineView.measure.caches[i] = {};
        }
      }
    }
  }

  function clearLineMeasurementCache(cm) {
    cm.display.externalMeasure = null;
    removeChildren(cm.display.lineMeasure);

    for (var i = 0; i < cm.display.view.length; i++) {
      clearLineMeasurementCacheFor(cm.display.view[i]);
    }
  }

  function clearCaches(cm) {
    clearLineMeasurementCache(cm);
    cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null;

    if (!cm.options.lineWrapping) {
      cm.display.maxLineChanged = true;
    }

    cm.display.lineNumChars = null;
  }

  function pageScrollX() {
    return window.pageXOffset || (document.documentElement || document.body).scrollLeft;
  }

  function pageScrollY() {
    return window.pageYOffset || (document.documentElement || document.body).scrollTop;
  } // Converts a {top, bottom, left, right} box from line-local
  // coordinates into another coordinate system. Context may be one of
  // "line", "div" (display.lineDiv), "local"./null (editor), "window",
  // or "page".


  function intoCoordSystem(cm, lineObj, rect, context, includeWidgets) {
    if (!includeWidgets && lineObj.widgets) {
      for (var i = 0; i < lineObj.widgets.length; ++i) {
        if (lineObj.widgets[i].above) {
          var size = widgetHeight(lineObj.widgets[i]);
          rect.top += size;
          rect.bottom += size;
        }
      }
    }

    if (context == "line") {
      return rect;
    }

    if (!context) {
      context = "local";
    }

    var yOff = _heightAtLine(lineObj);

    if (context == "local") {
      yOff += paddingTop(cm.display);
    } else {
      yOff -= cm.display.viewOffset;
    }

    if (context == "page" || context == "window") {
      var lOff = cm.display.lineSpace.getBoundingClientRect();
      yOff += lOff.top + (context == "window" ? 0 : pageScrollY());
      var xOff = lOff.left + (context == "window" ? 0 : pageScrollX());
      rect.left += xOff;
      rect.right += xOff;
    }

    rect.top += yOff;
    rect.bottom += yOff;
    return rect;
  } // Coverts a box from "div" coords to another coordinate system.
  // Context may be "window", "page", "div", or "local"./null.


  function fromCoordSystem(cm, coords, context) {
    if (context == "div") {
      return coords;
    }

    var left = coords.left,
        top = coords.top; // First move into "page" coordinate system

    if (context == "page") {
      left -= pageScrollX();
      top -= pageScrollY();
    } else if (context == "local" || !context) {
      var localBox = cm.display.sizer.getBoundingClientRect();
      left += localBox.left;
      top += localBox.top;
    }

    var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
    return {
      left: left - lineSpaceBox.left,
      top: top - lineSpaceBox.top
    };
  }

  function _charCoords(cm, pos, context, lineObj, bias) {
    if (!lineObj) {
      lineObj = getLine(cm.doc, pos.line);
    }

    return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context);
  } // Returns a box for a given cursor position, which may have an
  // 'other' property containing the position of the secondary cursor
  // on a bidi boundary.


  function _cursorCoords(cm, pos, context, lineObj, preparedMeasure, varHeight) {
    lineObj = lineObj || getLine(cm.doc, pos.line);

    if (!preparedMeasure) {
      preparedMeasure = prepareMeasureForLine(cm, lineObj);
    }

    function get(ch, right) {
      var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left", varHeight);

      if (right) {
        m.left = m.right;
      } else {
        m.right = m.left;
      }

      return intoCoordSystem(cm, lineObj, m, context);
    }

    function getBidi(ch, partPos) {
      var part = order[partPos],
          right = part.level % 2;

      if (ch == bidiLeft(part) && partPos && part.level < order[partPos - 1].level) {
        part = order[--partPos];
        ch = bidiRight(part) - (part.level % 2 ? 0 : 1);
        right = true;
      } else if (ch == bidiRight(part) && partPos < order.length - 1 && part.level < order[partPos + 1].level) {
        part = order[++partPos];
        ch = bidiLeft(part) - part.level % 2;
        right = false;
      }

      if (right && ch == part.to && ch > part.from) {
        return get(ch - 1);
      }

      return get(ch, right);
    }

    var order = getOrder(lineObj),
        ch = pos.ch;

    if (!order) {
      return get(ch);
    }

    var partPos = getBidiPartAt(order, ch);
    var val = getBidi(ch, partPos);

    if (bidiOther != null) {
      val.other = getBidi(ch, bidiOther);
    }

    return val;
  } // Used to cheaply estimate the coordinates for a position. Used for
  // intermediate scroll updates.


  function estimateCoords(cm, pos) {
    var left = 0;
    pos = _clipPos(cm.doc, pos);

    if (!cm.options.lineWrapping) {
      left = charWidth(cm.display) * pos.ch;
    }

    var lineObj = getLine(cm.doc, pos.line);
    var top = _heightAtLine(lineObj) + paddingTop(cm.display);
    return {
      left: left,
      right: left,
      top: top,
      bottom: top + lineObj.height
    };
  } // Positions returned by coordsChar contain some extra information.
  // xRel is the relative x position of the input coordinates compared
  // to the found position (so xRel > 0 means the coordinates are to
  // the right of the character position, for example). When outside
  // is true, that means the coordinates lie outside the line's
  // vertical range.


  function PosWithInfo(line, ch, outside, xRel) {
    var pos = Pos(line, ch);
    pos.xRel = xRel;

    if (outside) {
      pos.outside = true;
    }

    return pos;
  } // Compute the character position closest to the given coordinates.
  // Input must be lineSpace-local ("div" coordinate system).


  function _coordsChar(cm, x, y) {
    var doc = cm.doc;
    y += cm.display.viewOffset;

    if (y < 0) {
      return PosWithInfo(doc.first, 0, true, -1);
    }

    var lineN = _lineAtHeight(doc, y),
        last = doc.first + doc.size - 1;

    if (lineN > last) {
      return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, true, 1);
    }

    if (x < 0) {
      x = 0;
    }

    var lineObj = getLine(doc, lineN);

    for (;;) {
      var found = coordsCharInner(cm, lineObj, lineN, x, y);
      var merged = collapsedSpanAtEnd(lineObj);
      var mergedPos = merged && merged.find(0, true);

      if (merged && (found.ch > mergedPos.from.ch || found.ch == mergedPos.from.ch && found.xRel > 0)) {
        lineN = lineNo(lineObj = mergedPos.to.line);
      } else {
        return found;
      }
    }
  }

  function coordsCharInner(cm, lineObj, lineNo, x, y) {
    var innerOff = y - _heightAtLine(lineObj);

    var wrongLine = false,
        adjust = 2 * cm.display.wrapper.clientWidth;
    var preparedMeasure = prepareMeasureForLine(cm, lineObj);

    function getX(ch) {
      var sp = _cursorCoords(cm, Pos(lineNo, ch), "line", lineObj, preparedMeasure);

      wrongLine = true;

      if (innerOff > sp.bottom) {
        return sp.left - adjust;
      } else if (innerOff < sp.top) {
        return sp.left + adjust;
      } else {
        wrongLine = false;
      }

      return sp.left;
    }

    var bidi = getOrder(lineObj),
        dist = lineObj.text.length;
    var from = lineLeft(lineObj),
        to = lineRight(lineObj);
    var fromX = getX(from),
        fromOutside = wrongLine,
        toX = getX(to),
        toOutside = wrongLine;

    if (x > toX) {
      return PosWithInfo(lineNo, to, toOutside, 1);
    } // Do a binary search between these bounds.


    for (;;) {
      if (bidi ? to == from || to == moveVisually(lineObj, from, 1) : to - from <= 1) {
        var ch = x < fromX || x - fromX <= toX - x ? from : to;
        var outside = ch == from ? fromOutside : toOutside;
        var xDiff = x - (ch == from ? fromX : toX); // This is a kludge to handle the case where the coordinates
        // are after a line-wrapped line. We should replace it with a
        // more general handling of cursor positions around line
        // breaks. (Issue #4078)

        if (toOutside && !bidi && !/\s/.test(lineObj.text.charAt(ch)) && xDiff > 0 && ch < lineObj.text.length && preparedMeasure.view.measure.heights.length > 1) {
          var charSize = measureCharPrepared(cm, preparedMeasure, ch, "right");

          if (innerOff <= charSize.bottom && innerOff >= charSize.top && Math.abs(x - charSize.right) < xDiff) {
            outside = false;
            ch++;
            xDiff = x - charSize.right;
          }
        }

        while (isExtendingChar(lineObj.text.charAt(ch))) {
          ++ch;
        }

        var pos = PosWithInfo(lineNo, ch, outside, xDiff < -1 ? -1 : xDiff > 1 ? 1 : 0);
        return pos;
      }

      var step = Math.ceil(dist / 2),
          middle = from + step;

      if (bidi) {
        middle = from;

        for (var i = 0; i < step; ++i) {
          middle = moveVisually(lineObj, middle, 1);
        }
      }

      var middleX = getX(middle);

      if (middleX > x) {
        to = middle;
        toX = middleX;

        if (toOutside = wrongLine) {
          toX += 1000;
        }

        dist = step;
      } else {
        from = middle;
        fromX = middleX;
        fromOutside = wrongLine;
        dist -= step;
      }
    }
  }

  var measureText; // Compute the default text height.

  function textHeight(display) {
    if (display.cachedTextHeight != null) {
      return display.cachedTextHeight;
    }

    if (measureText == null) {
      measureText = elt("pre"); // Measure a bunch of lines, for browsers that compute
      // fractional heights.

      for (var i = 0; i < 49; ++i) {
        measureText.appendChild(document.createTextNode("x"));
        measureText.appendChild(elt("br"));
      }

      measureText.appendChild(document.createTextNode("x"));
    }

    removeChildrenAndAdd(display.measure, measureText);
    var height = measureText.offsetHeight / 50;

    if (height > 3) {
      display.cachedTextHeight = height;
    }

    removeChildren(display.measure);
    return height || 1;
  } // Compute the default character width.


  function charWidth(display) {
    if (display.cachedCharWidth != null) {
      return display.cachedCharWidth;
    }

    var anchor = elt("span", "xxxxxxxxxx");
    var pre = elt("pre", [anchor]);
    removeChildrenAndAdd(display.measure, pre);
    var rect = anchor.getBoundingClientRect(),
        width = (rect.right - rect.left) / 10;

    if (width > 2) {
      display.cachedCharWidth = width;
    }

    return width || 10;
  } // Do a bulk-read of the DOM positions and sizes needed to draw the
  // view, so that we don't interleave reading and writing to the DOM.


  function getDimensions(cm) {
    var d = cm.display,
        left = {},
        width = {};
    var gutterLeft = d.gutters.clientLeft;

    for (var n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) {
      left[cm.options.gutters[i]] = n.offsetLeft + n.clientLeft + gutterLeft;
      width[cm.options.gutters[i]] = n.clientWidth;
    }

    return {
      fixedPos: compensateForHScroll(d),
      gutterTotalWidth: d.gutters.offsetWidth,
      gutterLeft: left,
      gutterWidth: width,
      wrapperWidth: d.wrapper.clientWidth
    };
  } // Computes display.scroller.scrollLeft + display.gutters.offsetWidth,
  // but using getBoundingClientRect to get a sub-pixel-accurate
  // result.


  function compensateForHScroll(display) {
    return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left;
  } // Returns a function that estimates the height of a line, to use as
  // first approximation until the line becomes visible (and is thus
  // properly measurable).


  function estimateHeight(cm) {
    var th = textHeight(cm.display),
        wrapping = cm.options.lineWrapping;
    var perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
    return function (line) {
      if (lineIsHidden(cm.doc, line)) {
        return 0;
      }

      var widgetsHeight = 0;

      if (line.widgets) {
        for (var i = 0; i < line.widgets.length; i++) {
          if (line.widgets[i].height) {
            widgetsHeight += line.widgets[i].height;
          }
        }
      }

      if (wrapping) {
        return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th;
      } else {
        return widgetsHeight + th;
      }
    };
  }

  function estimateLineHeights(cm) {
    var doc = cm.doc,
        est = estimateHeight(cm);
    doc.iter(function (line) {
      var estHeight = est(line);

      if (estHeight != line.height) {
        updateLineHeight(line, estHeight);
      }
    });
  } // Given a mouse event, find the corresponding position. If liberal
  // is false, it checks whether a gutter or scrollbar was clicked,
  // and returns null if it was. forRect is used by rectangular
  // selections, and tries to estimate a character position even for
  // coordinates beyond the right of the text.


  function posFromMouse(cm, e, liberal, forRect) {
    var display = cm.display;

    if (!liberal && e_target(e).getAttribute("cm-not-content") == "true") {
      return null;
    }

    var x,
        y,
        space = display.lineSpace.getBoundingClientRect(); // Fails unpredictably on IE[67] when mouse is dragged around quickly.

    try {
      x = e.clientX - space.left;
      y = e.clientY - space.top;
    } catch (e) {
      return null;
    }

    var coords = _coordsChar(cm, x, y),
        line;

    if (forRect && coords.xRel == 1 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
      var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
      coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff));
    }

    return coords;
  } // Find the view element corresponding to a given line. Return null
  // when the line isn't visible.


  function findViewIndex(cm, n) {
    if (n >= cm.display.viewTo) {
      return null;
    }

    n -= cm.display.viewFrom;

    if (n < 0) {
      return null;
    }

    var view = cm.display.view;

    for (var i = 0; i < view.length; i++) {
      n -= view[i].size;

      if (n < 0) {
        return i;
      }
    }
  }

  function updateSelection(cm) {
    cm.display.input.showSelection(cm.display.input.prepareSelection());
  }

  function prepareSelection(cm, primary) {
    var doc = cm.doc,
        result = {};
    var curFragment = result.cursors = document.createDocumentFragment();
    var selFragment = result.selection = document.createDocumentFragment();

    for (var i = 0; i < doc.sel.ranges.length; i++) {
      if (primary === false && i == doc.sel.primIndex) {
        continue;
      }

      var range = doc.sel.ranges[i];

      if (range.from().line >= cm.display.viewTo || range.to().line < cm.display.viewFrom) {
        continue;
      }

      var collapsed = range.empty();

      if (collapsed || cm.options.showCursorWhenSelecting) {
        drawSelectionCursor(cm, range.head, curFragment);
      }

      if (!collapsed) {
        drawSelectionRange(cm, range, selFragment);
      }
    }

    return result;
  } // Draws a cursor for the given range


  function drawSelectionCursor(cm, head, output) {
    var pos = _cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine);

    var cursor = output.appendChild(elt("div", "\xA0", "CodeMirror-cursor"));
    cursor.style.left = pos.left + "px";
    cursor.style.top = pos.top + "px";
    cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px";

    if (pos.other) {
      // Secondary cursor, shown when on a 'jump' in bi-directional text
      var otherCursor = output.appendChild(elt("div", "\xA0", "CodeMirror-cursor CodeMirror-secondarycursor"));
      otherCursor.style.display = "";
      otherCursor.style.left = pos.other.left + "px";
      otherCursor.style.top = pos.other.top + "px";
      otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px";
    }
  } // Draws the given range as a highlighted selection


  function drawSelectionRange(cm, range, output) {
    var display = cm.display,
        doc = cm.doc;
    var fragment = document.createDocumentFragment();
    var padding = paddingH(cm.display),
        leftSide = padding.left;
    var rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right;

    function add(left, top, width, bottom) {
      if (top < 0) {
        top = 0;
      }

      top = Math.round(top);
      bottom = Math.round(bottom);
      fragment.appendChild(elt("div", null, "CodeMirror-selected", "position: absolute; left: " + left + "px;\n                             top: " + top + "px; width: " + (width == null ? rightSide - left : width) + "px;\n                             height: " + (bottom - top) + "px"));
    }

    function drawForLine(line, fromArg, toArg) {
      var lineObj = getLine(doc, line);
      var lineLen = lineObj.text.length;
      var start, end;

      function coords(ch, bias) {
        return _charCoords(cm, Pos(line, ch), "div", lineObj, bias);
      }

      iterateBidiSections(getOrder(lineObj), fromArg || 0, toArg == null ? lineLen : toArg, function (from, to, dir) {
        var leftPos = coords(from, "left"),
            rightPos,
            left,
            right;

        if (from == to) {
          rightPos = leftPos;
          left = right = leftPos.left;
        } else {
          rightPos = coords(to - 1, "right");

          if (dir == "rtl") {
            var tmp = leftPos;
            leftPos = rightPos;
            rightPos = tmp;
          }

          left = leftPos.left;
          right = rightPos.right;
        }

        if (fromArg == null && from == 0) {
          left = leftSide;
        }

        if (rightPos.top - leftPos.top > 3) {
          // Different lines, draw top part
          add(left, leftPos.top, null, leftPos.bottom);
          left = leftSide;

          if (leftPos.bottom < rightPos.top) {
            add(left, leftPos.bottom, null, rightPos.top);
          }
        }

        if (toArg == null && to == lineLen) {
          right = rightSide;
        }

        if (!start || leftPos.top < start.top || leftPos.top == start.top && leftPos.left < start.left) {
          start = leftPos;
        }

        if (!end || rightPos.bottom > end.bottom || rightPos.bottom == end.bottom && rightPos.right > end.right) {
          end = rightPos;
        }

        if (left < leftSide + 1) {
          left = leftSide;
        }

        add(left, rightPos.top, right - left, rightPos.bottom);
      });
      return {
        start: start,
        end: end
      };
    }

    var sFrom = range.from(),
        sTo = range.to();

    if (sFrom.line == sTo.line) {
      drawForLine(sFrom.line, sFrom.ch, sTo.ch);
    } else {
      var fromLine = getLine(doc, sFrom.line),
          toLine = getLine(doc, sTo.line);
      var singleVLine = visualLine(fromLine) == visualLine(toLine);
      var leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end;
      var rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;

      if (singleVLine) {
        if (leftEnd.top < rightStart.top - 2) {
          add(leftEnd.right, leftEnd.top, null, leftEnd.bottom);
          add(leftSide, rightStart.top, rightStart.left, rightStart.bottom);
        } else {
          add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom);
        }
      }

      if (leftEnd.bottom < rightStart.top) {
        add(leftSide, leftEnd.bottom, null, rightStart.top);
      }
    }

    output.appendChild(fragment);
  } // Cursor-blinking


  function restartBlink(cm) {
    if (!cm.state.focused) {
      return;
    }

    var display = cm.display;
    clearInterval(display.blinker);
    var on = true;
    display.cursorDiv.style.visibility = "";

    if (cm.options.cursorBlinkRate > 0) {
      display.blinker = setInterval(function () {
        return display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden";
      }, cm.options.cursorBlinkRate);
    } else if (cm.options.cursorBlinkRate < 0) {
      display.cursorDiv.style.visibility = "hidden";
    }
  }

  function ensureFocus(cm) {
    if (!cm.state.focused) {
      cm.display.input.focus();
      onFocus(cm);
    }
  }

  function delayBlurEvent(cm) {
    cm.state.delayingBlurEvent = true;
    setTimeout(function () {
      if (cm.state.delayingBlurEvent) {
        cm.state.delayingBlurEvent = false;
        onBlur(cm);
      }
    }, 100);
  }

  function onFocus(cm, e) {
    if (cm.state.delayingBlurEvent) {
      cm.state.delayingBlurEvent = false;
    }

    if (cm.options.readOnly == "nocursor") {
      return;
    }

    if (!cm.state.focused) {
      signal(cm, "focus", cm, e);
      cm.state.focused = true;
      addClass(cm.display.wrapper, "CodeMirror-focused"); // This test prevents this from firing when a context
      // menu is closed (since the input reset would kill the
      // select-all detection hack)

      if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
        cm.display.input.reset();

        if (webkit) {
          setTimeout(function () {
            return cm.display.input.reset(true);
          }, 20);
        } // Issue #1730

      }

      cm.display.input.receivedFocus();
    }

    restartBlink(cm);
  }

  function onBlur(cm, e) {
    if (cm.state.delayingBlurEvent) {
      return;
    }

    if (cm.state.focused) {
      signal(cm, "blur", cm, e);
      cm.state.focused = false;
      rmClass(cm.display.wrapper, "CodeMirror-focused");
    }

    clearInterval(cm.display.blinker);
    setTimeout(function () {
      if (!cm.state.focused) {
        cm.display.shift = false;
      }
    }, 150);
  } // Re-align line numbers and gutter marks to compensate for
  // horizontal scrolling.


  function alignHorizontally(cm) {
    var display = cm.display,
        view = display.view;

    if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter)) {
      return;
    }

    var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft;
    var gutterW = display.gutters.offsetWidth,
        left = comp + "px";

    for (var i = 0; i < view.length; i++) {
      if (!view[i].hidden) {
        if (cm.options.fixedGutter) {
          if (view[i].gutter) {
            view[i].gutter.style.left = left;
          }

          if (view[i].gutterBackground) {
            view[i].gutterBackground.style.left = left;
          }
        }

        var align = view[i].alignable;

        if (align) {
          for (var j = 0; j < align.length; j++) {
            align[j].style.left = left;
          }
        }
      }
    }

    if (cm.options.fixedGutter) {
      display.gutters.style.left = comp + gutterW + "px";
    }
  } // Used to ensure that the line number gutter is still the right
  // size for the current document size. Returns true when an update
  // is needed.


  function maybeUpdateLineNumberWidth(cm) {
    if (!cm.options.lineNumbers) {
      return false;
    }

    var doc = cm.doc,
        last = lineNumberFor(cm.options, doc.first + doc.size - 1),
        display = cm.display;

    if (last.length != display.lineNumChars) {
      var test = display.measure.appendChild(elt("div", [elt("div", last)], "CodeMirror-linenumber CodeMirror-gutter-elt"));
      var innerW = test.firstChild.offsetWidth,
          padding = test.offsetWidth - innerW;
      display.lineGutter.style.width = "";
      display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding) + 1;
      display.lineNumWidth = display.lineNumInnerWidth + padding;
      display.lineNumChars = display.lineNumInnerWidth ? last.length : -1;
      display.lineGutter.style.width = display.lineNumWidth + "px";
      updateGutterSpace(cm);
      return true;
    }

    return false;
  } // Read the actual heights of the rendered lines, and update their
  // stored heights to match.


  function updateHeightsInViewport(cm) {
    var display = cm.display;
    var prevBottom = display.lineDiv.offsetTop;

    for (var i = 0; i < display.view.length; i++) {
      var cur = display.view[i],
          height = void 0;

      if (cur.hidden) {
        continue;
      }

      if (ie && ie_version < 8) {
        var bot = cur.node.offsetTop + cur.node.offsetHeight;
        height = bot - prevBottom;
        prevBottom = bot;
      } else {
        var box = cur.node.getBoundingClientRect();
        height = box.bottom - box.top;
      }

      var diff = cur.line.height - height;

      if (height < 2) {
        height = textHeight(display);
      }

      if (diff > .001 || diff < -.001) {
        updateLineHeight(cur.line, height);
        updateWidgetHeight(cur.line);

        if (cur.rest) {
          for (var j = 0; j < cur.rest.length; j++) {
            updateWidgetHeight(cur.rest[j]);
          }
        }
      }
    }
  } // Read and store the height of line widgets associated with the
  // given line.


  function updateWidgetHeight(line) {
    if (line.widgets) {
      for (var i = 0; i < line.widgets.length; ++i) {
        line.widgets[i].height = line.widgets[i].node.parentNode.offsetHeight;
      }
    }
  } // Compute the lines that are visible in a given viewport (defaults
  // the the current scroll position). viewport may contain top,
  // height, and ensure (see op.scrollToPos) properties.


  function visibleLines(display, doc, viewport) {
    var top = viewport && viewport.top != null ? Math.max(0, viewport.top) : display.scroller.scrollTop;
    top = Math.floor(top - paddingTop(display));
    var bottom = viewport && viewport.bottom != null ? viewport.bottom : top + display.wrapper.clientHeight;

    var from = _lineAtHeight(doc, top),
        to = _lineAtHeight(doc, bottom); // Ensure is a {from: {line, ch}, to: {line, ch}} object, and
    // forces those lines into the viewport (if possible).


    if (viewport && viewport.ensure) {
      var ensureFrom = viewport.ensure.from.line,
          ensureTo = viewport.ensure.to.line;

      if (ensureFrom < from) {
        from = ensureFrom;
        to = _lineAtHeight(doc, _heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight);
      } else if (Math.min(ensureTo, doc.lastLine()) >= to) {
        from = _lineAtHeight(doc, _heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight);
        to = ensureTo;
      }
    }

    return {
      from: from,
      to: Math.max(to, from + 1)
    };
  } // Sync the scrollable area and scrollbars, ensure the viewport
  // covers the visible area.


  function setScrollTop(cm, val) {
    if (Math.abs(cm.doc.scrollTop - val) < 2) {
      return;
    }

    cm.doc.scrollTop = val;

    if (!gecko) {
      updateDisplaySimple(cm, {
        top: val
      });
    }

    if (cm.display.scroller.scrollTop != val) {
      cm.display.scroller.scrollTop = val;
    }

    cm.display.scrollbars.setScrollTop(val);

    if (gecko) {
      updateDisplaySimple(cm);
    }

    startWorker(cm, 100);
  } // Sync scroller and scrollbar, ensure the gutter elements are
  // aligned.


  function setScrollLeft(cm, val, isScroller) {
    if (isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) {
      return;
    }

    val = Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth);
    cm.doc.scrollLeft = val;
    alignHorizontally(cm);

    if (cm.display.scroller.scrollLeft != val) {
      cm.display.scroller.scrollLeft = val;
    }

    cm.display.scrollbars.setScrollLeft(val);
  } // Since the delta values reported on mouse wheel events are
  // unstandardized between browsers and even browser versions, and
  // generally horribly unpredictable, this code starts by measuring
  // the scroll effect that the first few mouse wheel events have,
  // and, from that, detects the way it can convert deltas to pixel
  // offsets afterwards.
  //
  // The reason we want to know the amount a wheel event will scroll
  // is that it gives us a chance to update the display before the
  // actual scrolling happens, reducing flickering.


  var wheelSamples = 0;
  var wheelPixelsPerUnit = null; // Fill in a browser-detected starting value on browsers where we
  // know one. These don't have to be accurate -- the result of them
  // being wrong would just be a slight flicker on the first wheel
  // scroll (if it is large enough).

  if (ie) {
    wheelPixelsPerUnit = -.53;
  } else if (gecko) {
    wheelPixelsPerUnit = 15;
  } else if (chrome) {
    wheelPixelsPerUnit = -.7;
  } else if (safari) {
    wheelPixelsPerUnit = -1 / 3;
  }

  function wheelEventDelta(e) {
    var dx = e.wheelDeltaX,
        dy = e.wheelDeltaY;

    if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS) {
      dx = e.detail;
    }

    if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS) {
      dy = e.detail;
    } else if (dy == null) {
      dy = e.wheelDelta;
    }

    return {
      x: dx,
      y: dy
    };
  }

  function wheelEventPixels(e) {
    var delta = wheelEventDelta(e);
    delta.x *= wheelPixelsPerUnit;
    delta.y *= wheelPixelsPerUnit;
    return delta;
  }

  function onScrollWheel(cm, e) {
    var delta = wheelEventDelta(e),
        dx = delta.x,
        dy = delta.y;
    var display = cm.display,
        scroll = display.scroller; // Quit if there's nothing to scroll here

    var canScrollX = scroll.scrollWidth > scroll.clientWidth;
    var canScrollY = scroll.scrollHeight > scroll.clientHeight;

    if (!(dx && canScrollX || dy && canScrollY)) {
      return;
    } // Webkit browsers on OS X abort momentum scrolls when the target
    // of the scroll event is removed from the scrollable element.
    // This hack (see related code in patchDisplay) makes sure the
    // element is kept around.


    if (dy && mac && webkit) {
      outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode) {
        for (var i = 0; i < view.length; i++) {
          if (view[i].node == cur) {
            cm.display.currentWheelTarget = cur;
            break outer;
          }
        }
      }
    } // On some browsers, horizontal scrolling will cause redraws to
    // happen before the gutter has been realigned, causing it to
    // wriggle around in a most unseemly way. When we have an
    // estimated pixels/delta value, we just handle horizontal
    // scrolling entirely here. It'll be slightly off from native, but
    // better than glitching out.


    if (dx && !gecko && !presto && wheelPixelsPerUnit != null) {
      if (dy && canScrollY) {
        setScrollTop(cm, Math.max(0, Math.min(scroll.scrollTop + dy * wheelPixelsPerUnit, scroll.scrollHeight - scroll.clientHeight)));
      }

      setScrollLeft(cm, Math.max(0, Math.min(scroll.scrollLeft + dx * wheelPixelsPerUnit, scroll.scrollWidth - scroll.clientWidth))); // Only prevent default scrolling if vertical scrolling is
      // actually possible. Otherwise, it causes vertical scroll
      // jitter on OSX trackpads when deltaX is small and deltaY
      // is large (issue #3579)

      if (!dy || dy && canScrollY) {
        e_preventDefault(e);
      }

      display.wheelStartX = null; // Abort measurement, if in progress

      return;
    } // 'Project' the visible viewport to cover the area that is being
    // scrolled into view (if we know enough to estimate it).


    if (dy && wheelPixelsPerUnit != null) {
      var pixels = dy * wheelPixelsPerUnit;
      var top = cm.doc.scrollTop,
          bot = top + display.wrapper.clientHeight;

      if (pixels < 0) {
        top = Math.max(0, top + pixels - 50);
      } else {
        bot = Math.min(cm.doc.height, bot + pixels + 50);
      }

      updateDisplaySimple(cm, {
        top: top,
        bottom: bot
      });
    }

    if (wheelSamples < 20) {
      if (display.wheelStartX == null) {
        display.wheelStartX = scroll.scrollLeft;
        display.wheelStartY = scroll.scrollTop;
        display.wheelDX = dx;
        display.wheelDY = dy;
        setTimeout(function () {
          if (display.wheelStartX == null) {
            return;
          }

          var movedX = scroll.scrollLeft - display.wheelStartX;
          var movedY = scroll.scrollTop - display.wheelStartY;
          var sample = movedY && display.wheelDY && movedY / display.wheelDY || movedX && display.wheelDX && movedX / display.wheelDX;
          display.wheelStartX = display.wheelStartY = null;

          if (!sample) {
            return;
          }

          wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1);
          ++wheelSamples;
        }, 200);
      } else {
        display.wheelDX += dx;
        display.wheelDY += dy;
      }
    }
  } // SCROLLBARS
  // Prepare DOM reads needed to update the scrollbars. Done in one
  // shot to minimize update/measure roundtrips.


  function measureForScrollbars(cm) {
    var d = cm.display,
        gutterW = d.gutters.offsetWidth;
    var docH = Math.round(cm.doc.height + paddingVert(cm.display));
    return {
      clientHeight: d.scroller.clientHeight,
      viewHeight: d.wrapper.clientHeight,
      scrollWidth: d.scroller.scrollWidth,
      clientWidth: d.scroller.clientWidth,
      viewWidth: d.wrapper.clientWidth,
      barLeft: cm.options.fixedGutter ? gutterW : 0,
      docHeight: docH,
      scrollHeight: docH + scrollGap(cm) + d.barHeight,
      nativeBarWidth: d.nativeBarWidth,
      gutterWidth: gutterW
    };
  }

  var NativeScrollbars = function NativeScrollbars(place, scroll, cm) {
    this.cm = cm;
    var vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar");
    var horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
    place(vert);
    place(horiz);
    on(vert, "scroll", function () {
      if (vert.clientHeight) {
        scroll(vert.scrollTop, "vertical");
      }
    });
    on(horiz, "scroll", function () {
      if (horiz.clientWidth) {
        scroll(horiz.scrollLeft, "horizontal");
      }
    });
    this.checkedZeroWidth = false; // Need to set a minimum width to see the scrollbar on IE7 (but must not set it on IE8).

    if (ie && ie_version < 8) {
      this.horiz.style.minHeight = this.vert.style.minWidth = "18px";
    }
  };

  NativeScrollbars.prototype.update = function (measure) {
    var needsH = measure.scrollWidth > measure.clientWidth + 1;
    var needsV = measure.scrollHeight > measure.clientHeight + 1;
    var sWidth = measure.nativeBarWidth;

    if (needsV) {
      this.vert.style.display = "block";
      this.vert.style.bottom = needsH ? sWidth + "px" : "0";
      var totalHeight = measure.viewHeight - (needsH ? sWidth : 0); // A bug in IE8 can cause this value to be negative, so guard it.

      this.vert.firstChild.style.height = Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px";
    } else {
      this.vert.style.display = "";
      this.vert.firstChild.style.height = "0";
    }

    if (needsH) {
      this.horiz.style.display = "block";
      this.horiz.style.right = needsV ? sWidth + "px" : "0";
      this.horiz.style.left = measure.barLeft + "px";
      var totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0);
      this.horiz.firstChild.style.width = measure.scrollWidth - measure.clientWidth + totalWidth + "px";
    } else {
      this.horiz.style.display = "";
      this.horiz.firstChild.style.width = "0";
    }

    if (!this.checkedZeroWidth && measure.clientHeight > 0) {
      if (sWidth == 0) {
        this.zeroWidthHack();
      }

      this.checkedZeroWidth = true;
    }

    return {
      right: needsV ? sWidth : 0,
      bottom: needsH ? sWidth : 0
    };
  };

  NativeScrollbars.prototype.setScrollLeft = function (pos) {
    if (this.horiz.scrollLeft != pos) {
      this.horiz.scrollLeft = pos;
    }

    if (this.disableHoriz) {
      this.enableZeroWidthBar(this.horiz, this.disableHoriz);
    }
  };

  NativeScrollbars.prototype.setScrollTop = function (pos) {
    if (this.vert.scrollTop != pos) {
      this.vert.scrollTop = pos;
    }

    if (this.disableVert) {
      this.enableZeroWidthBar(this.vert, this.disableVert);
    }
  };

  NativeScrollbars.prototype.zeroWidthHack = function () {
    var w = mac && !mac_geMountainLion ? "12px" : "18px";
    this.horiz.style.height = this.vert.style.width = w;
    this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none";
    this.disableHoriz = new Delayed();
    this.disableVert = new Delayed();
  };

  NativeScrollbars.prototype.enableZeroWidthBar = function (bar, delay) {
    bar.style.pointerEvents = "auto";

    function maybeDisable() {
      // To find out whether the scrollbar is still visible, we
      // check whether the element under the pixel in the bottom
      // left corner of the scrollbar box is the scrollbar box
      // itself (when the bar is still visible) or its filler child
      // (when the bar is hidden). If it is still visible, we keep
      // it enabled, if it's hidden, we disable pointer events.
      var box = bar.getBoundingClientRect();
      var elt = document.elementFromPoint(box.left + 1, box.bottom - 1);

      if (elt != bar) {
        bar.style.pointerEvents = "none";
      } else {
        delay.set(1000, maybeDisable);
      }
    }

    delay.set(1000, maybeDisable);
  };

  NativeScrollbars.prototype.clear = function () {
    var parent = this.horiz.parentNode;
    parent.removeChild(this.horiz);
    parent.removeChild(this.vert);
  };

  var NullScrollbars = function NullScrollbars() {};

  NullScrollbars.prototype.update = function () {
    return {
      bottom: 0,
      right: 0
    };
  };

  NullScrollbars.prototype.setScrollLeft = function () {};

  NullScrollbars.prototype.setScrollTop = function () {};

  NullScrollbars.prototype.clear = function () {};

  function updateScrollbars(cm, measure) {
    if (!measure) {
      measure = measureForScrollbars(cm);
    }

    var startWidth = cm.display.barWidth,
        startHeight = cm.display.barHeight;
    updateScrollbarsInner(cm, measure);

    for (var i = 0; i < 4 && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) {
      if (startWidth != cm.display.barWidth && cm.options.lineWrapping) {
        updateHeightsInViewport(cm);
      }

      updateScrollbarsInner(cm, measureForScrollbars(cm));
      startWidth = cm.display.barWidth;
      startHeight = cm.display.barHeight;
    }
  } // Re-synchronize the fake scrollbars with the actual size of the
  // content.


  function updateScrollbarsInner(cm, measure) {
    var d = cm.display;
    var sizes = d.scrollbars.update(measure);
    d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px";
    d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px";
    d.heightForcer.style.borderBottom = sizes.bottom + "px solid transparent";

    if (sizes.right && sizes.bottom) {
      d.scrollbarFiller.style.display = "block";
      d.scrollbarFiller.style.height = sizes.bottom + "px";
      d.scrollbarFiller.style.width = sizes.right + "px";
    } else {
      d.scrollbarFiller.style.display = "";
    }

    if (sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
      d.gutterFiller.style.display = "block";
      d.gutterFiller.style.height = sizes.bottom + "px";
      d.gutterFiller.style.width = measure.gutterWidth + "px";
    } else {
      d.gutterFiller.style.display = "";
    }
  }

  var scrollbarModel = {
    "native": NativeScrollbars,
    "null": NullScrollbars
  };

  function initScrollbars(cm) {
    if (cm.display.scrollbars) {
      cm.display.scrollbars.clear();

      if (cm.display.scrollbars.addClass) {
        rmClass(cm.display.wrapper, cm.display.scrollbars.addClass);
      }
    }

    cm.display.scrollbars = new scrollbarModel[cm.options.scrollbarStyle](function (node) {
      cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller); // Prevent clicks in the scrollbars from killing focus

      on(node, "mousedown", function () {
        if (cm.state.focused) {
          setTimeout(function () {
            return cm.display.input.focus();
          }, 0);
        }
      });
      node.setAttribute("cm-not-content", "true");
    }, function (pos, axis) {
      if (axis == "horizontal") {
        setScrollLeft(cm, pos);
      } else {
        setScrollTop(cm, pos);
      }
    }, cm);

    if (cm.display.scrollbars.addClass) {
      addClass(cm.display.wrapper, cm.display.scrollbars.addClass);
    }
  } // SCROLLING THINGS INTO VIEW
  // If an editor sits on the top or bottom of the window, partially
  // scrolled out of view, this ensures that the cursor is visible.


  function maybeScrollWindow(cm, coords) {
    if (signalDOMEvent(cm, "scrollCursorIntoView")) {
      return;
    }

    var display = cm.display,
        box = display.sizer.getBoundingClientRect(),
        doScroll = null;

    if (coords.top + box.top < 0) {
      doScroll = true;
    } else if (coords.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight)) {
      doScroll = false;
    }

    if (doScroll != null && !phantom) {
      var scrollNode = elt("div", "\u200B", null, "position: absolute;\n                         top: " + (coords.top - display.viewOffset - paddingTop(cm.display)) + "px;\n                         height: " + (coords.bottom - coords.top + scrollGap(cm) + display.barHeight) + "px;\n                         left: " + coords.left + "px; width: 2px;");
      cm.display.lineSpace.appendChild(scrollNode);
      scrollNode.scrollIntoView(doScroll);
      cm.display.lineSpace.removeChild(scrollNode);
    }
  } // Scroll a given position into view (immediately), verifying that
  // it actually became visible (as line heights are accurately
  // measured, the position of something may 'drift' during drawing).


  function scrollPosIntoView(cm, pos, end, margin) {
    if (margin == null) {
      margin = 0;
    }

    var coords;

    for (var limit = 0; limit < 5; limit++) {
      var changed = false;
      coords = _cursorCoords(cm, pos);
      var endCoords = !end || end == pos ? coords : _cursorCoords(cm, end);
      var scrollPos = calculateScrollPos(cm, Math.min(coords.left, endCoords.left), Math.min(coords.top, endCoords.top) - margin, Math.max(coords.left, endCoords.left), Math.max(coords.bottom, endCoords.bottom) + margin);
      var startTop = cm.doc.scrollTop,
          startLeft = cm.doc.scrollLeft;

      if (scrollPos.scrollTop != null) {
        setScrollTop(cm, scrollPos.scrollTop);

        if (Math.abs(cm.doc.scrollTop - startTop) > 1) {
          changed = true;
        }
      }

      if (scrollPos.scrollLeft != null) {
        setScrollLeft(cm, scrollPos.scrollLeft);

        if (Math.abs(cm.doc.scrollLeft - startLeft) > 1) {
          changed = true;
        }
      }

      if (!changed) {
        break;
      }
    }

    return coords;
  } // Scroll a given set of coordinates into view (immediately).


  function scrollIntoView(cm, x1, y1, x2, y2) {
    var scrollPos = calculateScrollPos(cm, x1, y1, x2, y2);

    if (scrollPos.scrollTop != null) {
      setScrollTop(cm, scrollPos.scrollTop);
    }

    if (scrollPos.scrollLeft != null) {
      setScrollLeft(cm, scrollPos.scrollLeft);
    }
  } // Calculate a new scroll position needed to scroll the given
  // rectangle into view. Returns an object with scrollTop and
  // scrollLeft properties. When these are undefined, the
  // vertical/horizontal position does not need to be adjusted.


  function calculateScrollPos(cm, x1, y1, x2, y2) {
    var display = cm.display,
        snapMargin = textHeight(cm.display);

    if (y1 < 0) {
      y1 = 0;
    }

    var screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop;
    var screen = displayHeight(cm),
        result = {};

    if (y2 - y1 > screen) {
      y2 = y1 + screen;
    }

    var docBottom = cm.doc.height + paddingVert(display);
    var atTop = y1 < snapMargin,
        atBottom = y2 > docBottom - snapMargin;

    if (y1 < screentop) {
      result.scrollTop = atTop ? 0 : y1;
    } else if (y2 > screentop + screen) {
      var newTop = Math.min(y1, (atBottom ? docBottom : y2) - screen);

      if (newTop != screentop) {
        result.scrollTop = newTop;
      }
    }

    var screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft;
    var screenw = displayWidth(cm) - (cm.options.fixedGutter ? display.gutters.offsetWidth : 0);
    var tooWide = x2 - x1 > screenw;

    if (tooWide) {
      x2 = x1 + screenw;
    }

    if (x1 < 10) {
      result.scrollLeft = 0;
    } else if (x1 < screenleft) {
      result.scrollLeft = Math.max(0, x1 - (tooWide ? 0 : 10));
    } else if (x2 > screenw + screenleft - 3) {
      result.scrollLeft = x2 + (tooWide ? 0 : 10) - screenw;
    }

    return result;
  } // Store a relative adjustment to the scroll position in the current
  // operation (to be applied when the operation finishes).


  function addToScrollPos(cm, left, top) {
    if (left != null || top != null) {
      resolveScrollToPos(cm);
    }

    if (left != null) {
      cm.curOp.scrollLeft = (cm.curOp.scrollLeft == null ? cm.doc.scrollLeft : cm.curOp.scrollLeft) + left;
    }

    if (top != null) {
      cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top;
    }
  } // Make sure that at the end of the operation the current cursor is
  // shown.


  function ensureCursorVisible(cm) {
    resolveScrollToPos(cm);
    var cur = cm.getCursor(),
        from = cur,
        to = cur;

    if (!cm.options.lineWrapping) {
      from = cur.ch ? Pos(cur.line, cur.ch - 1) : cur;
      to = Pos(cur.line, cur.ch + 1);
    }

    cm.curOp.scrollToPos = {
      from: from,
      to: to,
      margin: cm.options.cursorScrollMargin,
      isCursor: true
    };
  } // When an operation has its scrollToPos property set, and another
  // scroll action is applied before the end of the operation, this
  // 'simulates' scrolling that position into view in a cheap way, so
  // that the effect of intermediate scroll commands is not ignored.


  function resolveScrollToPos(cm) {
    var range = cm.curOp.scrollToPos;

    if (range) {
      cm.curOp.scrollToPos = null;
      var from = estimateCoords(cm, range.from),
          to = estimateCoords(cm, range.to);
      var sPos = calculateScrollPos(cm, Math.min(from.left, to.left), Math.min(from.top, to.top) - range.margin, Math.max(from.right, to.right), Math.max(from.bottom, to.bottom) + range.margin);
      cm.scrollTo(sPos.scrollLeft, sPos.scrollTop);
    }
  } // Operations are used to wrap a series of changes to the editor
  // state in such a way that each change won't have to update the
  // cursor and display (which would be awkward, slow, and
  // error-prone). Instead, display updates are batched and then all
  // combined and executed at once.


  var nextOpId = 0; // Start a new operation.

  function startOperation(cm) {
    cm.curOp = {
      cm: cm,
      viewChanged: false,
      // Flag that indicates that lines might need to be redrawn
      startHeight: cm.doc.height,
      // Used to detect need to update scrollbar
      forceUpdate: false,
      // Used to force a redraw
      updateInput: null,
      // Whether to reset the input textarea
      typing: false,
      // Whether this reset should be careful to leave existing text (for compositing)
      changeObjs: null,
      // Accumulated changes, for firing change events
      cursorActivityHandlers: null,
      // Set of handlers to fire cursorActivity on
      cursorActivityCalled: 0,
      // Tracks which cursorActivity handlers have been called already
      selectionChanged: false,
      // Whether the selection needs to be redrawn
      updateMaxLine: false,
      // Set when the widest line needs to be determined anew
      scrollLeft: null,
      scrollTop: null,
      // Intermediate scroll position, not pushed to DOM yet
      scrollToPos: null,
      // Used to scroll to a specific position
      focus: false,
      id: ++nextOpId // Unique ID

    };
    pushOperation(cm.curOp);
  } // Finish an operation, updating the display and signalling delayed events


  function endOperation(cm) {
    var op = cm.curOp;
    finishOperation(op, function (group) {
      for (var i = 0; i < group.ops.length; i++) {
        group.ops[i].cm.curOp = null;
      }

      endOperations(group);
    });
  } // The DOM updates done when an operation finishes are batched so
  // that the minimum number of relayouts are required.


  function endOperations(group) {
    var ops = group.ops;

    for (var i = 0; i < ops.length; i++) // Read DOM
    {
      endOperation_R1(ops[i]);
    }

    for (var i$1 = 0; i$1 < ops.length; i$1++) // Write DOM (maybe)
    {
      endOperation_W1(ops[i$1]);
    }

    for (var i$2 = 0; i$2 < ops.length; i$2++) // Read DOM
    {
      endOperation_R2(ops[i$2]);
    }

    for (var i$3 = 0; i$3 < ops.length; i$3++) // Write DOM (maybe)
    {
      endOperation_W2(ops[i$3]);
    }

    for (var i$4 = 0; i$4 < ops.length; i$4++) // Read DOM
    {
      endOperation_finish(ops[i$4]);
    }
  }

  function endOperation_R1(op) {
    var cm = op.cm,
        display = cm.display;
    maybeClipScrollbars(cm);

    if (op.updateMaxLine) {
      findMaxLine(cm);
    }

    op.mustUpdate = op.viewChanged || op.forceUpdate || op.scrollTop != null || op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom || op.scrollToPos.to.line >= display.viewTo) || display.maxLineChanged && cm.options.lineWrapping;
    op.update = op.mustUpdate && new DisplayUpdate(cm, op.mustUpdate && {
      top: op.scrollTop,
      ensure: op.scrollToPos
    }, op.forceUpdate);
  }

  function endOperation_W1(op) {
    op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update);
  }

  function endOperation_R2(op) {
    var cm = op.cm,
        display = cm.display;

    if (op.updatedDisplay) {
      updateHeightsInViewport(cm);
    }

    op.barMeasure = measureForScrollbars(cm); // If the max line changed since it was last measured, measure it,
    // and ensure the document's width matches it.
    // updateDisplay_W2 will use these properties to do the actual resizing

    if (display.maxLineChanged && !cm.options.lineWrapping) {
      op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3;
      cm.display.sizerWidth = op.adjustWidthTo;
      op.barMeasure.scrollWidth = Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth);
      op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm));
    }

    if (op.updatedDisplay || op.selectionChanged) {
      op.preparedSelection = display.input.prepareSelection(op.focus);
    }
  }

  function endOperation_W2(op) {
    var cm = op.cm;

    if (op.adjustWidthTo != null) {
      cm.display.sizer.style.minWidth = op.adjustWidthTo + "px";

      if (op.maxScrollLeft < cm.doc.scrollLeft) {
        setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), true);
      }

      cm.display.maxLineChanged = false;
    }

    var takeFocus = op.focus && op.focus == activeElt() && (!document.hasFocus || document.hasFocus());

    if (op.preparedSelection) {
      cm.display.input.showSelection(op.preparedSelection, takeFocus);
    }

    if (op.updatedDisplay || op.startHeight != cm.doc.height) {
      updateScrollbars(cm, op.barMeasure);
    }

    if (op.updatedDisplay) {
      setDocumentHeight(cm, op.barMeasure);
    }

    if (op.selectionChanged) {
      restartBlink(cm);
    }

    if (cm.state.focused && op.updateInput) {
      cm.display.input.reset(op.typing);
    }

    if (takeFocus) {
      ensureFocus(op.cm);
    }
  }

  function endOperation_finish(op) {
    var cm = op.cm,
        display = cm.display,
        doc = cm.doc;

    if (op.updatedDisplay) {
      postUpdateDisplay(cm, op.update);
    } // Abort mouse wheel delta measurement, when scrolling explicitly


    if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos)) {
      display.wheelStartX = display.wheelStartY = null;
    } // Propagate the scroll position to the actual DOM scroller


    if (op.scrollTop != null && (display.scroller.scrollTop != op.scrollTop || op.forceScroll)) {
      doc.scrollTop = Math.max(0, Math.min(display.scroller.scrollHeight - display.scroller.clientHeight, op.scrollTop));
      display.scrollbars.setScrollTop(doc.scrollTop);
      display.scroller.scrollTop = doc.scrollTop;
    }

    if (op.scrollLeft != null && (display.scroller.scrollLeft != op.scrollLeft || op.forceScroll)) {
      doc.scrollLeft = Math.max(0, Math.min(display.scroller.scrollWidth - display.scroller.clientWidth, op.scrollLeft));
      display.scrollbars.setScrollLeft(doc.scrollLeft);
      display.scroller.scrollLeft = doc.scrollLeft;
      alignHorizontally(cm);
    } // If we need to scroll a specific position into view, do so.


    if (op.scrollToPos) {
      var coords = scrollPosIntoView(cm, _clipPos(doc, op.scrollToPos.from), _clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin);

      if (op.scrollToPos.isCursor && cm.state.focused) {
        maybeScrollWindow(cm, coords);
      }
    } // Fire events for markers that are hidden/unidden by editing or
    // undoing


    var hidden = op.maybeHiddenMarkers,
        unhidden = op.maybeUnhiddenMarkers;

    if (hidden) {
      for (var i = 0; i < hidden.length; ++i) {
        if (!hidden[i].lines.length) {
          signal(hidden[i], "hide");
        }
      }
    }

    if (unhidden) {
      for (var i$1 = 0; i$1 < unhidden.length; ++i$1) {
        if (unhidden[i$1].lines.length) {
          signal(unhidden[i$1], "unhide");
        }
      }
    }

    if (display.wrapper.offsetHeight) {
      doc.scrollTop = cm.display.scroller.scrollTop;
    } // Fire change events, and delayed event handlers


    if (op.changeObjs) {
      signal(cm, "changes", cm, op.changeObjs);
    }

    if (op.update) {
      op.update.finish();
    }
  } // Run the given function in an operation


  function runInOp(cm, f) {
    if (cm.curOp) {
      return f();
    }

    startOperation(cm);

    try {
      return f();
    } finally {
      endOperation(cm);
    }
  } // Wraps a function in an operation. Returns the wrapped function.


  function operation(cm, f) {
    return function () {
      if (cm.curOp) {
        return f.apply(cm, arguments);
      }

      startOperation(cm);

      try {
        return f.apply(cm, arguments);
      } finally {
        endOperation(cm);
      }
    };
  } // Used to add methods to editor and doc instances, wrapping them in
  // operations.


  function methodOp(f) {
    return function () {
      if (this.curOp) {
        return f.apply(this, arguments);
      }

      startOperation(this);

      try {
        return f.apply(this, arguments);
      } finally {
        endOperation(this);
      }
    };
  }

  function docMethodOp(f) {
    return function () {
      var cm = this.cm;

      if (!cm || cm.curOp) {
        return f.apply(this, arguments);
      }

      startOperation(cm);

      try {
        return f.apply(this, arguments);
      } finally {
        endOperation(cm);
      }
    };
  } // Updates the display.view data structure for a given change to the
  // document. From and to are in pre-change coordinates. Lendiff is
  // the amount of lines added or subtracted by the change. This is
  // used for changes that span multiple lines, or change the way
  // lines are divided into visual lines. regLineChange (below)
  // registers single-line changes.


  function regChange(cm, from, to, lendiff) {
    if (from == null) {
      from = cm.doc.first;
    }

    if (to == null) {
      to = cm.doc.first + cm.doc.size;
    }

    if (!lendiff) {
      lendiff = 0;
    }

    var display = cm.display;

    if (lendiff && to < display.viewTo && (display.updateLineNumbers == null || display.updateLineNumbers > from)) {
      display.updateLineNumbers = from;
    }

    cm.curOp.viewChanged = true;

    if (from >= display.viewTo) {
      // Change after
      if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo) {
        resetView(cm);
      }
    } else if (to <= display.viewFrom) {
      // Change before
      if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom) {
        resetView(cm);
      } else {
        display.viewFrom += lendiff;
        display.viewTo += lendiff;
      }
    } else if (from <= display.viewFrom && to >= display.viewTo) {
      // Full overlap
      resetView(cm);
    } else if (from <= display.viewFrom) {
      // Top overlap
      var cut = viewCuttingPoint(cm, to, to + lendiff, 1);

      if (cut) {
        display.view = display.view.slice(cut.index);
        display.viewFrom = cut.lineN;
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    } else if (to >= display.viewTo) {
      // Bottom overlap
      var cut$1 = viewCuttingPoint(cm, from, from, -1);

      if (cut$1) {
        display.view = display.view.slice(0, cut$1.index);
        display.viewTo = cut$1.lineN;
      } else {
        resetView(cm);
      }
    } else {
      // Gap in the middle
      var cutTop = viewCuttingPoint(cm, from, from, -1);
      var cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);

      if (cutTop && cutBot) {
        display.view = display.view.slice(0, cutTop.index).concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN)).concat(display.view.slice(cutBot.index));
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    }

    var ext = display.externalMeasured;

    if (ext) {
      if (to < ext.lineN) {
        ext.lineN += lendiff;
      } else if (from < ext.lineN + ext.size) {
        display.externalMeasured = null;
      }
    }
  } // Register a change to a single line. Type must be one of "text",
  // "gutter", "class", "widget"


  function regLineChange(cm, line, type) {
    cm.curOp.viewChanged = true;
    var display = cm.display,
        ext = cm.display.externalMeasured;

    if (ext && line >= ext.lineN && line < ext.lineN + ext.size) {
      display.externalMeasured = null;
    }

    if (line < display.viewFrom || line >= display.viewTo) {
      return;
    }

    var lineView = display.view[findViewIndex(cm, line)];

    if (lineView.node == null) {
      return;
    }

    var arr = lineView.changes || (lineView.changes = []);

    if (indexOf(arr, type) == -1) {
      arr.push(type);
    }
  } // Clear the view.


  function resetView(cm) {
    cm.display.viewFrom = cm.display.viewTo = cm.doc.first;
    cm.display.view = [];
    cm.display.viewOffset = 0;
  }

  function viewCuttingPoint(cm, oldN, newN, dir) {
    var index = findViewIndex(cm, oldN),
        diff,
        view = cm.display.view;

    if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size) {
      return {
        index: index,
        lineN: newN
      };
    }

    var n = cm.display.viewFrom;

    for (var i = 0; i < index; i++) {
      n += view[i].size;
    }

    if (n != oldN) {
      if (dir > 0) {
        if (index == view.length - 1) {
          return null;
        }

        diff = n + view[index].size - oldN;
        index++;
      } else {
        diff = n - oldN;
      }

      oldN += diff;
      newN += diff;
    }

    while (visualLineNo(cm.doc, newN) != newN) {
      if (index == (dir < 0 ? 0 : view.length - 1)) {
        return null;
      }

      newN += dir * view[index - (dir < 0 ? 1 : 0)].size;
      index += dir;
    }

    return {
      index: index,
      lineN: newN
    };
  } // Force the view to cover a given range, adding empty view element
  // or clipping off existing ones as needed.


  function adjustView(cm, from, to) {
    var display = cm.display,
        view = display.view;

    if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
      display.view = buildViewArray(cm, from, to);
      display.viewFrom = from;
    } else {
      if (display.viewFrom > from) {
        display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view);
      } else if (display.viewFrom < from) {
        display.view = display.view.slice(findViewIndex(cm, from));
      }

      display.viewFrom = from;

      if (display.viewTo < to) {
        display.view = display.view.concat(buildViewArray(cm, display.viewTo, to));
      } else if (display.viewTo > to) {
        display.view = display.view.slice(0, findViewIndex(cm, to));
      }
    }

    display.viewTo = to;
  } // Count the number of lines in the view whose DOM representation is
  // out of date (or nonexistent).


  function countDirtyView(cm) {
    var view = cm.display.view,
        dirty = 0;

    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];

      if (!lineView.hidden && (!lineView.node || lineView.changes)) {
        ++dirty;
      }
    }

    return dirty;
  } // HIGHLIGHT WORKER


  function startWorker(cm, time) {
    if (cm.doc.mode.startState && cm.doc.frontier < cm.display.viewTo) {
      cm.state.highlight.set(time, bind(highlightWorker, cm));
    }
  }

  function highlightWorker(cm) {
    var doc = cm.doc;

    if (doc.frontier < doc.first) {
      doc.frontier = doc.first;
    }

    if (doc.frontier >= cm.display.viewTo) {
      return;
    }

    var end = +new Date() + cm.options.workTime;
    var state = copyState(doc.mode, getStateBefore(cm, doc.frontier));
    var changedLines = [];
    doc.iter(doc.frontier, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function (line) {
      if (doc.frontier >= cm.display.viewFrom) {
        // Visible
        var oldStyles = line.styles,
            tooLong = line.text.length > cm.options.maxHighlightLength;
        var highlighted = highlightLine(cm, line, tooLong ? copyState(doc.mode, state) : state, true);
        line.styles = highlighted.styles;
        var oldCls = line.styleClasses,
            newCls = highlighted.classes;

        if (newCls) {
          line.styleClasses = newCls;
        } else if (oldCls) {
          line.styleClasses = null;
        }

        var ischange = !oldStyles || oldStyles.length != line.styles.length || oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass);

        for (var i = 0; !ischange && i < oldStyles.length; ++i) {
          ischange = oldStyles[i] != line.styles[i];
        }

        if (ischange) {
          changedLines.push(doc.frontier);
        }

        line.stateAfter = tooLong ? state : copyState(doc.mode, state);
      } else {
        if (line.text.length <= cm.options.maxHighlightLength) {
          processLine(cm, line.text, state);
        }

        line.stateAfter = doc.frontier % 5 == 0 ? copyState(doc.mode, state) : null;
      }

      ++doc.frontier;

      if (+new Date() > end) {
        startWorker(cm, cm.options.workDelay);
        return true;
      }
    });

    if (changedLines.length) {
      runInOp(cm, function () {
        for (var i = 0; i < changedLines.length; i++) {
          regLineChange(cm, changedLines[i], "text");
        }
      });
    }
  } // DISPLAY DRAWING


  var DisplayUpdate = function DisplayUpdate(cm, viewport, force) {
    var display = cm.display;
    this.viewport = viewport; // Store some values that we'll need later (but don't want to force a relayout for)

    this.visible = visibleLines(display, cm.doc, viewport);
    this.editorIsHidden = !display.wrapper.offsetWidth;
    this.wrapperHeight = display.wrapper.clientHeight;
    this.wrapperWidth = display.wrapper.clientWidth;
    this.oldDisplayWidth = displayWidth(cm);
    this.force = force;
    this.dims = getDimensions(cm);
    this.events = [];
  };

  DisplayUpdate.prototype.signal = function (emitter, type) {
    if (hasHandler(emitter, type)) {
      this.events.push(arguments);
    }
  };

  DisplayUpdate.prototype.finish = function () {
    var this$1 = this;

    for (var i = 0; i < this.events.length; i++) {
      signal.apply(null, this$1.events[i]);
    }
  };

  function maybeClipScrollbars(cm) {
    var display = cm.display;

    if (!display.scrollbarsClipped && display.scroller.offsetWidth) {
      display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth;
      display.heightForcer.style.height = scrollGap(cm) + "px";
      display.sizer.style.marginBottom = -display.nativeBarWidth + "px";
      display.sizer.style.borderRightWidth = scrollGap(cm) + "px";
      display.scrollbarsClipped = true;
    }
  } // Does the actual updating of the line display. Bails out
  // (returning false) when there is nothing to be done and forced is
  // false.


  function updateDisplayIfNeeded(cm, update) {
    var display = cm.display,
        doc = cm.doc;

    if (update.editorIsHidden) {
      resetView(cm);
      return false;
    } // Bail out if the visible area is already rendered and nothing changed.


    if (!update.force && update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo && (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo) && display.renderedView == display.view && countDirtyView(cm) == 0) {
      return false;
    }

    if (maybeUpdateLineNumberWidth(cm)) {
      resetView(cm);
      update.dims = getDimensions(cm);
    } // Compute a suitable new viewport (from & to)


    var end = doc.first + doc.size;
    var from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first);
    var to = Math.min(end, update.visible.to + cm.options.viewportMargin);

    if (display.viewFrom < from && from - display.viewFrom < 20) {
      from = Math.max(doc.first, display.viewFrom);
    }

    if (display.viewTo > to && display.viewTo - to < 20) {
      to = Math.min(end, display.viewTo);
    }

    if (sawCollapsedSpans) {
      from = visualLineNo(cm.doc, from);
      to = visualLineEndNo(cm.doc, to);
    }

    var different = from != display.viewFrom || to != display.viewTo || display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth;
    adjustView(cm, from, to);
    display.viewOffset = _heightAtLine(getLine(cm.doc, display.viewFrom)); // Position the mover div to align with the current scroll position

    cm.display.mover.style.top = display.viewOffset + "px";
    var toUpdate = countDirtyView(cm);

    if (!different && toUpdate == 0 && !update.force && display.renderedView == display.view && (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo)) {
      return false;
    } // For big changes, we hide the enclosing element during the
    // update, since that speeds up the operations on most browsers.


    var focused = activeElt();

    if (toUpdate > 4) {
      display.lineDiv.style.display = "none";
    }

    patchDisplay(cm, display.updateLineNumbers, update.dims);

    if (toUpdate > 4) {
      display.lineDiv.style.display = "";
    }

    display.renderedView = display.view; // There might have been a widget with a focused element that got
    // hidden or updated, if so re-focus it.

    if (focused && activeElt() != focused && focused.offsetHeight) {
      focused.focus();
    } // Prevent selection and cursors from interfering with the scroll
    // width and height.


    removeChildren(display.cursorDiv);
    removeChildren(display.selectionDiv);
    display.gutters.style.height = display.sizer.style.minHeight = 0;

    if (different) {
      display.lastWrapHeight = update.wrapperHeight;
      display.lastWrapWidth = update.wrapperWidth;
      startWorker(cm, 400);
    }

    display.updateLineNumbers = null;
    return true;
  }

  function postUpdateDisplay(cm, update) {
    var viewport = update.viewport;

    for (var first = true;; first = false) {
      if (!first || !cm.options.lineWrapping || update.oldDisplayWidth == displayWidth(cm)) {
        // Clip forced viewport to actual scrollable area.
        if (viewport && viewport.top != null) {
          viewport = {
            top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top)
          };
        } // Updated line heights might result in the drawn area not
        // actually covering the viewport. Keep looping until it does.


        update.visible = visibleLines(cm.display, cm.doc, viewport);

        if (update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo) {
          break;
        }
      }

      if (!updateDisplayIfNeeded(cm, update)) {
        break;
      }

      updateHeightsInViewport(cm);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      updateScrollbars(cm, barMeasure);
      setDocumentHeight(cm, barMeasure);
    }

    update.signal(cm, "update", cm);

    if (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) {
      update.signal(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo);
      cm.display.reportedViewFrom = cm.display.viewFrom;
      cm.display.reportedViewTo = cm.display.viewTo;
    }
  }

  function updateDisplaySimple(cm, viewport) {
    var update = new DisplayUpdate(cm, viewport);

    if (updateDisplayIfNeeded(cm, update)) {
      updateHeightsInViewport(cm);
      postUpdateDisplay(cm, update);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      updateScrollbars(cm, barMeasure);
      setDocumentHeight(cm, barMeasure);
      update.finish();
    }
  } // Sync the actual display DOM structure with display.view, removing
  // nodes for lines that are no longer in view, and creating the ones
  // that are not there yet, and updating the ones that are out of
  // date.


  function patchDisplay(cm, updateNumbersFrom, dims) {
    var display = cm.display,
        lineNumbers = cm.options.lineNumbers;
    var container = display.lineDiv,
        cur = container.firstChild;

    function rm(node) {
      var next = node.nextSibling; // Works around a throw-scroll bug in OS X Webkit

      if (webkit && mac && cm.display.currentWheelTarget == node) {
        node.style.display = "none";
      } else {
        node.parentNode.removeChild(node);
      }

      return next;
    }

    var view = display.view,
        lineN = display.viewFrom; // Loop over the elements in the view, syncing cur (the DOM nodes
    // in display.lineDiv) with the view as we go.

    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];

      if (lineView.hidden) {} else if (!lineView.node || lineView.node.parentNode != container) {
        // Not drawn yet
        var node = buildLineElement(cm, lineView, lineN, dims);
        container.insertBefore(node, cur);
      } else {
        // Already drawn
        while (cur != lineView.node) {
          cur = rm(cur);
        }

        var updateNumber = lineNumbers && updateNumbersFrom != null && updateNumbersFrom <= lineN && lineView.lineNumber;

        if (lineView.changes) {
          if (indexOf(lineView.changes, "gutter") > -1) {
            updateNumber = false;
          }

          updateLineForChanges(cm, lineView, lineN, dims);
        }

        if (updateNumber) {
          removeChildren(lineView.lineNumber);
          lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)));
        }

        cur = lineView.node.nextSibling;
      }

      lineN += lineView.size;
    }

    while (cur) {
      cur = rm(cur);
    }
  }

  function updateGutterSpace(cm) {
    var width = cm.display.gutters.offsetWidth;
    cm.display.sizer.style.marginLeft = width + "px";
  }

  function setDocumentHeight(cm, measure) {
    cm.display.sizer.style.minHeight = measure.docHeight + "px";
    cm.display.heightForcer.style.top = measure.docHeight + "px";
    cm.display.gutters.style.height = measure.docHeight + cm.display.barHeight + scrollGap(cm) + "px";
  } // Rebuild the gutter elements, ensure the margin to the left of the
  // code matches their width.


  function updateGutters(cm) {
    var gutters = cm.display.gutters,
        specs = cm.options.gutters;
    removeChildren(gutters);
    var i = 0;

    for (; i < specs.length; ++i) {
      var gutterClass = specs[i];
      var gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + gutterClass));

      if (gutterClass == "CodeMirror-linenumbers") {
        cm.display.lineGutter = gElt;
        gElt.style.width = (cm.display.lineNumWidth || 1) + "px";
      }
    }

    gutters.style.display = i ? "" : "none";
    updateGutterSpace(cm);
  } // Make sure the gutters options contains the element
  // "CodeMirror-linenumbers" when the lineNumbers option is true.


  function setGuttersForLineNumbers(options) {
    var found = indexOf(options.gutters, "CodeMirror-linenumbers");

    if (found == -1 && options.lineNumbers) {
      options.gutters = options.gutters.concat(["CodeMirror-linenumbers"]);
    } else if (found > -1 && !options.lineNumbers) {
      options.gutters = options.gutters.slice(0);
      options.gutters.splice(found, 1);
    }
  } // Selection objects are immutable. A new one is created every time
  // the selection changes. A selection is one or more non-overlapping
  // (and non-touching) ranges, sorted, and an integer that indicates
  // which one is the primary selection (the one that's scrolled into
  // view, that getCursor returns, etc).


  function Selection(ranges, primIndex) {
    this.ranges = ranges;
    this.primIndex = primIndex;
  }

  Selection.prototype = {
    primary: function primary() {
      return this.ranges[this.primIndex];
    },
    equals: function equals(other) {
      var this$1 = this;

      if (other == this) {
        return true;
      }

      if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) {
        return false;
      }

      for (var i = 0; i < this.ranges.length; i++) {
        var here = this$1.ranges[i],
            there = other.ranges[i];

        if (cmp(here.anchor, there.anchor) != 0 || cmp(here.head, there.head) != 0) {
          return false;
        }
      }

      return true;
    },
    deepCopy: function deepCopy() {
      var this$1 = this;
      var out = [];

      for (var i = 0; i < this.ranges.length; i++) {
        out[i] = new Range(copyPos(this$1.ranges[i].anchor), copyPos(this$1.ranges[i].head));
      }

      return new Selection(out, this.primIndex);
    },
    somethingSelected: function somethingSelected() {
      var this$1 = this;

      for (var i = 0; i < this.ranges.length; i++) {
        if (!this$1.ranges[i].empty()) {
          return true;
        }
      }

      return false;
    },
    contains: function contains(pos, end) {
      var this$1 = this;

      if (!end) {
        end = pos;
      }

      for (var i = 0; i < this.ranges.length; i++) {
        var range = this$1.ranges[i];

        if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0) {
          return i;
        }
      }

      return -1;
    }
  };

  function Range(anchor, head) {
    this.anchor = anchor;
    this.head = head;
  }

  Range.prototype = {
    from: function from() {
      return minPos(this.anchor, this.head);
    },
    to: function to() {
      return maxPos(this.anchor, this.head);
    },
    empty: function empty() {
      return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch;
    }
  }; // Take an unsorted, potentially overlapping set of ranges, and
  // build a selection out of it. 'Consumes' ranges array (modifying
  // it).

  function normalizeSelection(ranges, primIndex) {
    var prim = ranges[primIndex];
    ranges.sort(function (a, b) {
      return cmp(a.from(), b.from());
    });
    primIndex = indexOf(ranges, prim);

    for (var i = 1; i < ranges.length; i++) {
      var cur = ranges[i],
          prev = ranges[i - 1];

      if (cmp(prev.to(), cur.from()) >= 0) {
        var from = minPos(prev.from(), cur.from()),
            to = maxPos(prev.to(), cur.to());
        var inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;

        if (i <= primIndex) {
          --primIndex;
        }

        ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to));
      }
    }

    return new Selection(ranges, primIndex);
  }

  function simpleSelection(anchor, head) {
    return new Selection([new Range(anchor, head || anchor)], 0);
  } // Compute the position of the end of a change (its 'to' property
  // refers to the pre-change end).


  function changeEnd(change) {
    if (!change.text) {
      return change.to;
    }

    return Pos(change.from.line + change.text.length - 1, lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0));
  } // Adjust a position to refer to the post-change position of the
  // same text, or the end of the change if the change covers it.


  function adjustForChange(pos, change) {
    if (cmp(pos, change.from) < 0) {
      return pos;
    }

    if (cmp(pos, change.to) <= 0) {
      return changeEnd(change);
    }

    var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1,
        ch = pos.ch;

    if (pos.line == change.to.line) {
      ch += changeEnd(change).ch - change.to.ch;
    }

    return Pos(line, ch);
  }

  function computeSelAfterChange(doc, change) {
    var out = [];

    for (var i = 0; i < doc.sel.ranges.length; i++) {
      var range = doc.sel.ranges[i];
      out.push(new Range(adjustForChange(range.anchor, change), adjustForChange(range.head, change)));
    }

    return normalizeSelection(out, doc.sel.primIndex);
  }

  function offsetPos(pos, old, nw) {
    if (pos.line == old.line) {
      return Pos(nw.line, pos.ch - old.ch + nw.ch);
    } else {
      return Pos(nw.line + (pos.line - old.line), pos.ch);
    }
  } // Used by replaceSelections to allow moving the selection to the
  // start or around the replaced test. Hint may be "start" or "around".


  function computeReplacedSel(doc, changes, hint) {
    var out = [];
    var oldPrev = Pos(doc.first, 0),
        newPrev = oldPrev;

    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];
      var from = offsetPos(change.from, oldPrev, newPrev);
      var to = offsetPos(changeEnd(change), oldPrev, newPrev);
      oldPrev = change.to;
      newPrev = to;

      if (hint == "around") {
        var range = doc.sel.ranges[i],
            inv = cmp(range.head, range.anchor) < 0;
        out[i] = new Range(inv ? to : from, inv ? from : to);
      } else {
        out[i] = new Range(from, from);
      }
    }

    return new Selection(out, doc.sel.primIndex);
  } // Used to get the editor into a consistent state again when options change.


  function loadMode(cm) {
    cm.doc.mode = getMode(cm.options, cm.doc.modeOption);
    resetModeState(cm);
  }

  function resetModeState(cm) {
    cm.doc.iter(function (line) {
      if (line.stateAfter) {
        line.stateAfter = null;
      }

      if (line.styles) {
        line.styles = null;
      }
    });
    cm.doc.frontier = cm.doc.first;
    startWorker(cm, 100);
    cm.state.modeGen++;

    if (cm.curOp) {
      regChange(cm);
    }
  } // DOCUMENT DATA STRUCTURE
  // By default, updates that start and end at the beginning of a line
  // are treated specially, in order to make the association of line
  // widgets and marker elements with the text behave more intuitive.


  function isWholeLineUpdate(doc, change) {
    return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" && (!doc.cm || doc.cm.options.wholeLineUpdateBefore);
  } // Perform a change on the document data structure.


  function updateDoc(doc, change, markedSpans, estimateHeight) {
    function spansFor(n) {
      return markedSpans ? markedSpans[n] : null;
    }

    function update(line, text, spans) {
      updateLine(line, text, spans, estimateHeight);
      signalLater(line, "change", line, change);
    }

    function linesFor(start, end) {
      var result = [];

      for (var i = start; i < end; ++i) {
        result.push(new Line(text[i], spansFor(i), estimateHeight));
      }

      return result;
    }

    var from = change.from,
        to = change.to,
        text = change.text;
    var firstLine = getLine(doc, from.line),
        lastLine = getLine(doc, to.line);
    var lastText = lst(text),
        lastSpans = spansFor(text.length - 1),
        nlines = to.line - from.line; // Adjust the line structure

    if (change.full) {
      doc.insert(0, linesFor(0, text.length));
      doc.remove(text.length, doc.size - text.length);
    } else if (isWholeLineUpdate(doc, change)) {
      // This is a whole-line replace. Treated specially to make
      // sure line objects move the way they are supposed to.
      var added = linesFor(0, text.length - 1);
      update(lastLine, lastLine.text, lastSpans);

      if (nlines) {
        doc.remove(from.line, nlines);
      }

      if (added.length) {
        doc.insert(from.line, added);
      }
    } else if (firstLine == lastLine) {
      if (text.length == 1) {
        update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
      } else {
        var added$1 = linesFor(1, text.length - 1);
        added$1.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight));
        update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
        doc.insert(from.line + 1, added$1);
      }
    } else if (text.length == 1) {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0));
      doc.remove(from.line + 1, nlines);
    } else {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
      update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
      var added$2 = linesFor(1, text.length - 1);

      if (nlines > 1) {
        doc.remove(from.line + 1, nlines - 1);
      }

      doc.insert(from.line + 1, added$2);
    }

    signalLater(doc, "change", doc, change);
  } // Call f for all linked documents.


  function linkedDocs(doc, f, sharedHistOnly) {
    function propagate(doc, skip, sharedHist) {
      if (doc.linked) {
        for (var i = 0; i < doc.linked.length; ++i) {
          var rel = doc.linked[i];

          if (rel.doc == skip) {
            continue;
          }

          var shared = sharedHist && rel.sharedHist;

          if (sharedHistOnly && !shared) {
            continue;
          }

          f(rel.doc, shared);
          propagate(rel.doc, doc, shared);
        }
      }
    }

    propagate(doc, null, true);
  } // Attach a document to an editor.


  function attachDoc(cm, doc) {
    if (doc.cm) {
      throw new Error("This document is already in use.");
    }

    cm.doc = doc;
    doc.cm = cm;
    estimateLineHeights(cm);
    loadMode(cm);

    if (!cm.options.lineWrapping) {
      findMaxLine(cm);
    }

    cm.options.mode = doc.modeOption;
    regChange(cm);
  }

  function History(startGen) {
    // Arrays of change events and selections. Doing something adds an
    // event to done and clears undo. Undoing moves events from done
    // to undone, redoing moves them in the other direction.
    this.done = [];
    this.undone = [];
    this.undoDepth = Infinity; // Used to track when changes can be merged into a single undo
    // event

    this.lastModTime = this.lastSelTime = 0;
    this.lastOp = this.lastSelOp = null;
    this.lastOrigin = this.lastSelOrigin = null; // Used by the isClean() method

    this.generation = this.maxGeneration = startGen || 1;
  } // Create a history change event from an updateDoc-style change
  // object.


  function historyChangeFromChange(doc, change) {
    var histChange = {
      from: copyPos(change.from),
      to: changeEnd(change),
      text: getBetween(doc, change.from, change.to)
    };
    attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
    linkedDocs(doc, function (doc) {
      return attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
    }, true);
    return histChange;
  } // Pop all selection events off the end of a history array. Stop at
  // a change event.


  function clearSelectionEvents(array) {
    while (array.length) {
      var last = lst(array);

      if (last.ranges) {
        array.pop();
      } else {
        break;
      }
    }
  } // Find the top change event in the history. Pop off selection
  // events that are in the way.


  function lastChangeEvent(hist, force) {
    if (force) {
      clearSelectionEvents(hist.done);
      return lst(hist.done);
    } else if (hist.done.length && !lst(hist.done).ranges) {
      return lst(hist.done);
    } else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
      hist.done.pop();
      return lst(hist.done);
    }
  } // Register a change in the history. Merges changes that are within
  // a single operation, or are close together with an origin that
  // allows merging (starting with "+") into a single event.


  function addChangeToHistory(doc, change, selAfter, opId) {
    var hist = doc.history;
    hist.undone.length = 0;
    var time = +new Date(),
        cur;
    var last;

    if ((hist.lastOp == opId || hist.lastOrigin == change.origin && change.origin && (change.origin.charAt(0) == "+" && doc.cm && hist.lastModTime > time - doc.cm.options.historyEventDelay || change.origin.charAt(0) == "*")) && (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
      // Merge this change into the last event
      last = lst(cur.changes);

      if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0) {
        // Optimized case for simple insertion -- don't want to add
        // new changesets for every character typed
        last.to = changeEnd(change);
      } else {
        // Add new sub-event
        cur.changes.push(historyChangeFromChange(doc, change));
      }
    } else {
      // Can not be merged, start a new event.
      var before = lst(hist.done);

      if (!before || !before.ranges) {
        pushSelectionToHistory(doc.sel, hist.done);
      }

      cur = {
        changes: [historyChangeFromChange(doc, change)],
        generation: hist.generation
      };
      hist.done.push(cur);

      while (hist.done.length > hist.undoDepth) {
        hist.done.shift();

        if (!hist.done[0].ranges) {
          hist.done.shift();
        }
      }
    }

    hist.done.push(selAfter);
    hist.generation = ++hist.maxGeneration;
    hist.lastModTime = hist.lastSelTime = time;
    hist.lastOp = hist.lastSelOp = opId;
    hist.lastOrigin = hist.lastSelOrigin = change.origin;

    if (!last) {
      signal(doc, "historyAdded");
    }
  }

  function selectionEventCanBeMerged(doc, origin, prev, sel) {
    var ch = origin.charAt(0);
    return ch == "*" || ch == "+" && prev.ranges.length == sel.ranges.length && prev.somethingSelected() == sel.somethingSelected() && new Date() - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500);
  } // Called whenever the selection changes, sets the new selection as
  // the pending selection in the history, and pushes the old pending
  // selection into the 'done' array when it was significantly
  // different (in number of selected ranges, emptiness, or time).


  function addSelectionToHistory(doc, sel, opId, options) {
    var hist = doc.history,
        origin = options && options.origin; // A new event is started when the previous origin does not match
    // the current, or the origins don't allow matching. Origins
    // starting with * are always merged, those starting with + are
    // merged when similar and close together in time.

    if (opId == hist.lastSelOp || origin && hist.lastSelOrigin == origin && (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin || selectionEventCanBeMerged(doc, origin, lst(hist.done), sel))) {
      hist.done[hist.done.length - 1] = sel;
    } else {
      pushSelectionToHistory(sel, hist.done);
    }

    hist.lastSelTime = +new Date();
    hist.lastSelOrigin = origin;
    hist.lastSelOp = opId;

    if (options && options.clearRedo !== false) {
      clearSelectionEvents(hist.undone);
    }
  }

  function pushSelectionToHistory(sel, dest) {
    var top = lst(dest);

    if (!(top && top.ranges && top.equals(sel))) {
      dest.push(sel);
    }
  } // Used to store marked span information in the history.


  function attachLocalSpans(doc, change, from, to) {
    var existing = change["spans_" + doc.id],
        n = 0;
    doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function (line) {
      if (line.markedSpans) {
        (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans;
      }

      ++n;
    });
  } // When un/re-doing restores text containing marked spans, those
  // that have been explicitly cleared should not be restored.


  function removeClearedSpans(spans) {
    if (!spans) {
      return null;
    }

    var out;

    for (var i = 0; i < spans.length; ++i) {
      if (spans[i].marker.explicitlyCleared) {
        if (!out) {
          out = spans.slice(0, i);
        }
      } else if (out) {
        out.push(spans[i]);
      }
    }

    return !out ? spans : out.length ? out : null;
  } // Retrieve and filter the old marked spans stored in a change event.


  function getOldSpans(doc, change) {
    var found = change["spans_" + doc.id];

    if (!found) {
      return null;
    }

    var nw = [];

    for (var i = 0; i < change.text.length; ++i) {
      nw.push(removeClearedSpans(found[i]));
    }

    return nw;
  } // Used for un/re-doing changes from the history. Combines the
  // result of computing the existing spans with the set of spans that
  // existed in the history (so that deleting around a span and then
  // undoing brings back the span).


  function mergeOldSpans(doc, change) {
    var old = getOldSpans(doc, change);
    var stretched = stretchSpansOverChange(doc, change);

    if (!old) {
      return stretched;
    }

    if (!stretched) {
      return old;
    }

    for (var i = 0; i < old.length; ++i) {
      var oldCur = old[i],
          stretchCur = stretched[i];

      if (oldCur && stretchCur) {
        spans: for (var j = 0; j < stretchCur.length; ++j) {
          var span = stretchCur[j];

          for (var k = 0; k < oldCur.length; ++k) {
            if (oldCur[k].marker == span.marker) {
              continue spans;
            }
          }

          oldCur.push(span);
        }
      } else if (stretchCur) {
        old[i] = stretchCur;
      }
    }

    return old;
  } // Used both to provide a JSON-safe object in .getHistory, and, when
  // detaching a document, to split the history in two


  function copyHistoryArray(events, newGroup, instantiateSel) {
    var copy = [];

    for (var i = 0; i < events.length; ++i) {
      var event = events[i];

      if (event.ranges) {
        copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event);
        continue;
      }

      var changes = event.changes,
          newChanges = [];
      copy.push({
        changes: newChanges
      });

      for (var j = 0; j < changes.length; ++j) {
        var change = changes[j],
            m = void 0;
        newChanges.push({
          from: change.from,
          to: change.to,
          text: change.text
        });

        if (newGroup) {
          for (var prop in change) {
            if (m = prop.match(/^spans_(\d+)$/)) {
              if (indexOf(newGroup, Number(m[1])) > -1) {
                lst(newChanges)[prop] = change[prop];
                delete change[prop];
              }
            }
          }
        }
      }
    }

    return copy;
  } // The 'scroll' parameter given to many of these indicated whether
  // the new cursor position should be scrolled into view after
  // modifying the selection.
  // If shift is held or the extend flag is set, extends a range to
  // include a given position (and optionally a second position).
  // Otherwise, simply returns the range between the given positions.
  // Used for cursor motion and such.


  function extendRange(doc, range, head, other) {
    if (doc.cm && doc.cm.display.shift || doc.extend) {
      var anchor = range.anchor;

      if (other) {
        var posBefore = cmp(head, anchor) < 0;

        if (posBefore != cmp(other, anchor) < 0) {
          anchor = head;
          head = other;
        } else if (posBefore != cmp(head, other) < 0) {
          head = other;
        }
      }

      return new Range(anchor, head);
    } else {
      return new Range(other || head, head);
    }
  } // Extend the primary selection range, discard the rest.


  function extendSelection(doc, head, other, options) {
    setSelection(doc, new Selection([extendRange(doc, doc.sel.primary(), head, other)], 0), options);
  } // Extend all selections (pos is an array of selections with length
  // equal the number of selections)


  function extendSelections(doc, heads, options) {
    var out = [];

    for (var i = 0; i < doc.sel.ranges.length; i++) {
      out[i] = extendRange(doc, doc.sel.ranges[i], heads[i], null);
    }

    var newSel = normalizeSelection(out, doc.sel.primIndex);
    setSelection(doc, newSel, options);
  } // Updates a single range in the selection.


  function replaceOneSelection(doc, i, range, options) {
    var ranges = doc.sel.ranges.slice(0);
    ranges[i] = range;
    setSelection(doc, normalizeSelection(ranges, doc.sel.primIndex), options);
  } // Reset the selection to a single range.


  function setSimpleSelection(doc, anchor, head, options) {
    setSelection(doc, simpleSelection(anchor, head), options);
  } // Give beforeSelectionChange handlers a change to influence a
  // selection update.


  function filterSelectionChange(doc, sel, options) {
    var obj = {
      ranges: sel.ranges,
      update: function update(ranges) {
        var this$1 = this;
        this.ranges = [];

        for (var i = 0; i < ranges.length; i++) {
          this$1.ranges[i] = new Range(_clipPos(doc, ranges[i].anchor), _clipPos(doc, ranges[i].head));
        }
      },
      origin: options && options.origin
    };
    signal(doc, "beforeSelectionChange", doc, obj);

    if (doc.cm) {
      signal(doc.cm, "beforeSelectionChange", doc.cm, obj);
    }

    if (obj.ranges != sel.ranges) {
      return normalizeSelection(obj.ranges, obj.ranges.length - 1);
    } else {
      return sel;
    }
  }

  function setSelectionReplaceHistory(doc, sel, options) {
    var done = doc.history.done,
        last = lst(done);

    if (last && last.ranges) {
      done[done.length - 1] = sel;
      setSelectionNoUndo(doc, sel, options);
    } else {
      setSelection(doc, sel, options);
    }
  } // Set a new selection.


  function setSelection(doc, sel, options) {
    setSelectionNoUndo(doc, sel, options);
    addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options);
  }

  function setSelectionNoUndo(doc, sel, options) {
    if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange")) {
      sel = filterSelectionChange(doc, sel, options);
    }

    var bias = options && options.bias || (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
    setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true));

    if (!(options && options.scroll === false) && doc.cm) {
      ensureCursorVisible(doc.cm);
    }
  }

  function setSelectionInner(doc, sel) {
    if (sel.equals(doc.sel)) {
      return;
    }

    doc.sel = sel;

    if (doc.cm) {
      doc.cm.curOp.updateInput = doc.cm.curOp.selectionChanged = true;
      signalCursorActivity(doc.cm);
    }

    signalLater(doc, "cursorActivity", doc);
  } // Verify that the selection does not partially select any atomic
  // marked ranges.


  function reCheckSelection(doc) {
    setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false), sel_dontScroll);
  } // Return a selection that does not partially select any atomic
  // ranges.


  function skipAtomicInSelection(doc, sel, bias, mayClear) {
    var out;

    for (var i = 0; i < sel.ranges.length; i++) {
      var range = sel.ranges[i];
      var old = sel.ranges.length == doc.sel.ranges.length && doc.sel.ranges[i];
      var newAnchor = skipAtomic(doc, range.anchor, old && old.anchor, bias, mayClear);
      var newHead = skipAtomic(doc, range.head, old && old.head, bias, mayClear);

      if (out || newAnchor != range.anchor || newHead != range.head) {
        if (!out) {
          out = sel.ranges.slice(0, i);
        }

        out[i] = new Range(newAnchor, newHead);
      }
    }

    return out ? normalizeSelection(out, sel.primIndex) : sel;
  }

  function skipAtomicInner(doc, pos, oldPos, dir, mayClear) {
    var line = getLine(doc, pos.line);

    if (line.markedSpans) {
      for (var i = 0; i < line.markedSpans.length; ++i) {
        var sp = line.markedSpans[i],
            m = sp.marker;

        if ((sp.from == null || (m.inclusiveLeft ? sp.from <= pos.ch : sp.from < pos.ch)) && (sp.to == null || (m.inclusiveRight ? sp.to >= pos.ch : sp.to > pos.ch))) {
          if (mayClear) {
            signal(m, "beforeCursorEnter");

            if (m.explicitlyCleared) {
              if (!line.markedSpans) {
                break;
              } else {
                --i;
                continue;
              }
            }
          }

          if (!m.atomic) {
            continue;
          }

          if (oldPos) {
            var near = m.find(dir < 0 ? 1 : -1),
                diff = void 0;

            if (dir < 0 ? m.inclusiveRight : m.inclusiveLeft) {
              near = movePos(doc, near, -dir, near && near.line == pos.line ? line : null);
            }

            if (near && near.line == pos.line && (diff = cmp(near, oldPos)) && (dir < 0 ? diff < 0 : diff > 0)) {
              return skipAtomicInner(doc, near, pos, dir, mayClear);
            }
          }

          var far = m.find(dir < 0 ? -1 : 1);

          if (dir < 0 ? m.inclusiveLeft : m.inclusiveRight) {
            far = movePos(doc, far, dir, far.line == pos.line ? line : null);
          }

          return far ? skipAtomicInner(doc, far, pos, dir, mayClear) : null;
        }
      }
    }

    return pos;
  } // Ensure a given position is not inside an atomic range.


  function skipAtomic(doc, pos, oldPos, bias, mayClear) {
    var dir = bias || 1;
    var found = skipAtomicInner(doc, pos, oldPos, dir, mayClear) || !mayClear && skipAtomicInner(doc, pos, oldPos, dir, true) || skipAtomicInner(doc, pos, oldPos, -dir, mayClear) || !mayClear && skipAtomicInner(doc, pos, oldPos, -dir, true);

    if (!found) {
      doc.cantEdit = true;
      return Pos(doc.first, 0);
    }

    return found;
  }

  function movePos(doc, pos, dir, line) {
    if (dir < 0 && pos.ch == 0) {
      if (pos.line > doc.first) {
        return _clipPos(doc, Pos(pos.line - 1));
      } else {
        return null;
      }
    } else if (dir > 0 && pos.ch == (line || getLine(doc, pos.line)).text.length) {
      if (pos.line < doc.first + doc.size - 1) {
        return Pos(pos.line + 1, 0);
      } else {
        return null;
      }
    } else {
      return new Pos(pos.line, pos.ch + dir);
    }
  }

  function selectAll(cm) {
    cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll);
  } // UPDATING
  // Allow "beforeChange" event handlers to influence a change


  function filterChange(doc, change, update) {
    var obj = {
      canceled: false,
      from: change.from,
      to: change.to,
      text: change.text,
      origin: change.origin,
      cancel: function cancel() {
        return obj.canceled = true;
      }
    };

    if (update) {
      obj.update = function (from, to, text, origin) {
        if (from) {
          obj.from = _clipPos(doc, from);
        }

        if (to) {
          obj.to = _clipPos(doc, to);
        }

        if (text) {
          obj.text = text;
        }

        if (origin !== undefined) {
          obj.origin = origin;
        }
      };
    }

    signal(doc, "beforeChange", doc, obj);

    if (doc.cm) {
      signal(doc.cm, "beforeChange", doc.cm, obj);
    }

    if (obj.canceled) {
      return null;
    }

    return {
      from: obj.from,
      to: obj.to,
      text: obj.text,
      origin: obj.origin
    };
  } // Apply a change to a document, and add it to the document's
  // history, and propagating it to all linked documents.


  function makeChange(doc, change, ignoreReadOnly) {
    if (doc.cm) {
      if (!doc.cm.curOp) {
        return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly);
      }

      if (doc.cm.state.suppressEdits) {
        return;
      }
    }

    if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
      change = filterChange(doc, change, true);

      if (!change) {
        return;
      }
    } // Possibly split or suppress the update based on the presence
    // of read-only spans in its range.


    var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);

    if (split) {
      for (var i = split.length - 1; i >= 0; --i) {
        makeChangeInner(doc, {
          from: split[i].from,
          to: split[i].to,
          text: i ? [""] : change.text
        });
      }
    } else {
      makeChangeInner(doc, change);
    }
  }

  function makeChangeInner(doc, change) {
    if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0) {
      return;
    }

    var selAfter = computeSelAfterChange(doc, change);
    addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN);
    makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
    var rebased = [];
    linkedDocs(doc, function (doc, sharedHist) {
      if (!sharedHist && indexOf(rebased, doc.history) == -1) {
        rebaseHist(doc.history, change);
        rebased.push(doc.history);
      }

      makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change));
    });
  } // Revert a change stored in a document's history.


  function makeChangeFromHistory(doc, type, allowSelectionOnly) {
    if (doc.cm && doc.cm.state.suppressEdits && !allowSelectionOnly) {
      return;
    }

    var hist = doc.history,
        event,
        selAfter = doc.sel;
    var source = type == "undo" ? hist.done : hist.undone,
        dest = type == "undo" ? hist.undone : hist.done; // Verify that there is a useable event (so that ctrl-z won't
    // needlessly clear selection events)

    var i = 0;

    for (; i < source.length; i++) {
      event = source[i];

      if (allowSelectionOnly ? event.ranges && !event.equals(doc.sel) : !event.ranges) {
        break;
      }
    }

    if (i == source.length) {
      return;
    }

    hist.lastOrigin = hist.lastSelOrigin = null;

    for (;;) {
      event = source.pop();

      if (event.ranges) {
        pushSelectionToHistory(event, dest);

        if (allowSelectionOnly && !event.equals(doc.sel)) {
          setSelection(doc, event, {
            clearRedo: false
          });
          return;
        }

        selAfter = event;
      } else {
        break;
      }
    } // Build up a reverse change object to add to the opposite history
    // stack (redo when undoing, and vice versa).


    var antiChanges = [];
    pushSelectionToHistory(selAfter, dest);
    dest.push({
      changes: antiChanges,
      generation: hist.generation
    });
    hist.generation = event.generation || ++hist.maxGeneration;
    var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange");

    var loop = function loop(i) {
      var change = event.changes[i];
      change.origin = type;

      if (filter && !filterChange(doc, change, false)) {
        source.length = 0;
        return {};
      }

      antiChanges.push(historyChangeFromChange(doc, change));
      var after = i ? computeSelAfterChange(doc, change) : lst(source);
      makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change));

      if (!i && doc.cm) {
        doc.cm.scrollIntoView({
          from: change.from,
          to: changeEnd(change)
        });
      }

      var rebased = []; // Propagate to the linked documents

      linkedDocs(doc, function (doc, sharedHist) {
        if (!sharedHist && indexOf(rebased, doc.history) == -1) {
          rebaseHist(doc.history, change);
          rebased.push(doc.history);
        }

        makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change));
      });
    };

    for (var i$1 = event.changes.length - 1; i$1 >= 0; --i$1) {
      var returned = loop(i$1);
      if (returned) return returned.v;
    }
  } // Sub-views need their line numbers shifted when text is added
  // above or below them in the parent document.


  function shiftDoc(doc, distance) {
    if (distance == 0) {
      return;
    }

    doc.first += distance;
    doc.sel = new Selection(map(doc.sel.ranges, function (range) {
      return new Range(Pos(range.anchor.line + distance, range.anchor.ch), Pos(range.head.line + distance, range.head.ch));
    }), doc.sel.primIndex);

    if (doc.cm) {
      regChange(doc.cm, doc.first, doc.first - distance, distance);

      for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++) {
        regLineChange(doc.cm, l, "gutter");
      }
    }
  } // More lower-level change function, handling only a single document
  // (not linked ones).


  function makeChangeSingleDoc(doc, change, selAfter, spans) {
    if (doc.cm && !doc.cm.curOp) {
      return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans);
    }

    if (change.to.line < doc.first) {
      shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
      return;
    }

    if (change.from.line > doc.lastLine()) {
      return;
    } // Clip the change to the size of this doc


    if (change.from.line < doc.first) {
      var shift = change.text.length - 1 - (doc.first - change.from.line);
      shiftDoc(doc, shift);
      change = {
        from: Pos(doc.first, 0),
        to: Pos(change.to.line + shift, change.to.ch),
        text: [lst(change.text)],
        origin: change.origin
      };
    }

    var last = doc.lastLine();

    if (change.to.line > last) {
      change = {
        from: change.from,
        to: Pos(last, getLine(doc, last).text.length),
        text: [change.text[0]],
        origin: change.origin
      };
    }

    change.removed = getBetween(doc, change.from, change.to);

    if (!selAfter) {
      selAfter = computeSelAfterChange(doc, change);
    }

    if (doc.cm) {
      makeChangeSingleDocInEditor(doc.cm, change, spans);
    } else {
      updateDoc(doc, change, spans);
    }

    setSelectionNoUndo(doc, selAfter, sel_dontScroll);
  } // Handle the interaction of a change to a document with the editor
  // that this document is part of.


  function makeChangeSingleDocInEditor(cm, change, spans) {
    var doc = cm.doc,
        display = cm.display,
        from = change.from,
        to = change.to;
    var recomputeMaxLength = false,
        checkWidthStart = from.line;

    if (!cm.options.lineWrapping) {
      checkWidthStart = lineNo(visualLine(getLine(doc, from.line)));
      doc.iter(checkWidthStart, to.line + 1, function (line) {
        if (line == display.maxLine) {
          recomputeMaxLength = true;
          return true;
        }
      });
    }

    if (doc.sel.contains(change.from, change.to) > -1) {
      signalCursorActivity(cm);
    }

    updateDoc(doc, change, spans, estimateHeight(cm));

    if (!cm.options.lineWrapping) {
      doc.iter(checkWidthStart, from.line + change.text.length, function (line) {
        var len = lineLength(line);

        if (len > display.maxLineLength) {
          display.maxLine = line;
          display.maxLineLength = len;
          display.maxLineChanged = true;
          recomputeMaxLength = false;
        }
      });

      if (recomputeMaxLength) {
        cm.curOp.updateMaxLine = true;
      }
    } // Adjust frontier, schedule worker


    doc.frontier = Math.min(doc.frontier, from.line);
    startWorker(cm, 400);
    var lendiff = change.text.length - (to.line - from.line) - 1; // Remember that these lines changed, for updating the display

    if (change.full) {
      regChange(cm);
    } else if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change)) {
      regLineChange(cm, from.line, "text");
    } else {
      regChange(cm, from.line, to.line + 1, lendiff);
    }

    var changesHandler = hasHandler(cm, "changes"),
        changeHandler = hasHandler(cm, "change");

    if (changeHandler || changesHandler) {
      var obj = {
        from: from,
        to: to,
        text: change.text,
        removed: change.removed,
        origin: change.origin
      };

      if (changeHandler) {
        signalLater(cm, "change", cm, obj);
      }

      if (changesHandler) {
        (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj);
      }
    }

    cm.display.selForContextMenu = null;
  }

  function _replaceRange(doc, code, from, to, origin) {
    if (!to) {
      to = from;
    }

    if (cmp(to, from) < 0) {
      var tmp = to;
      to = from;
      from = tmp;
    }

    if (typeof code == "string") {
      code = doc.splitLines(code);
    }

    makeChange(doc, {
      from: from,
      to: to,
      text: code,
      origin: origin
    });
  } // Rebasing/resetting history to deal with externally-sourced changes


  function rebaseHistSelSingle(pos, from, to, diff) {
    if (to < pos.line) {
      pos.line += diff;
    } else if (from < pos.line) {
      pos.line = from;
      pos.ch = 0;
    }
  } // Tries to rebase an array of history events given a change in the
  // document. If the change touches the same lines as the event, the
  // event, and everything 'behind' it, is discarded. If the change is
  // before the event, the event's positions are updated. Uses a
  // copy-on-write scheme for the positions, to avoid having to
  // reallocate them all on every rebase, but also avoid problems with
  // shared position objects being unsafely updated.


  function rebaseHistArray(array, from, to, diff) {
    for (var i = 0; i < array.length; ++i) {
      var sub = array[i],
          ok = true;

      if (sub.ranges) {
        if (!sub.copied) {
          sub = array[i] = sub.deepCopy();
          sub.copied = true;
        }

        for (var j = 0; j < sub.ranges.length; j++) {
          rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff);
          rebaseHistSelSingle(sub.ranges[j].head, from, to, diff);
        }

        continue;
      }

      for (var j$1 = 0; j$1 < sub.changes.length; ++j$1) {
        var cur = sub.changes[j$1];

        if (to < cur.from.line) {
          cur.from = Pos(cur.from.line + diff, cur.from.ch);
          cur.to = Pos(cur.to.line + diff, cur.to.ch);
        } else if (from <= cur.to.line) {
          ok = false;
          break;
        }
      }

      if (!ok) {
        array.splice(0, i + 1);
        i = 0;
      }
    }
  }

  function rebaseHist(hist, change) {
    var from = change.from.line,
        to = change.to.line,
        diff = change.text.length - (to - from) - 1;
    rebaseHistArray(hist.done, from, to, diff);
    rebaseHistArray(hist.undone, from, to, diff);
  } // Utility for applying a change to a line by handle or number,
  // returning the number and optionally registering the line as
  // changed.


  function changeLine(doc, handle, changeType, op) {
    var no = handle,
        line = handle;

    if (typeof handle == "number") {
      line = getLine(doc, clipLine(doc, handle));
    } else {
      no = lineNo(handle);
    }

    if (no == null) {
      return null;
    }

    if (op(line, no) && doc.cm) {
      regLineChange(doc.cm, no, changeType);
    }

    return line;
  } // The document is represented as a BTree consisting of leaves, with
  // chunk of lines in them, and branches, with up to ten leaves or
  // other branch nodes below them. The top node is always a branch
  // node, and is the document object itself (meaning it has
  // additional methods and properties).
  //
  // All nodes have parent links. The tree is used both to go from
  // line numbers to line objects, and to go from objects to numbers.
  // It also indexes by height, and is used to convert between height
  // and line object, and to find the total height of the document.
  //
  // See also http://marijnhaverbeke.nl/blog/codemirror-line-tree.html


  function LeafChunk(lines) {
    var this$1 = this;
    this.lines = lines;
    this.parent = null;
    var height = 0;

    for (var i = 0; i < lines.length; ++i) {
      lines[i].parent = this$1;
      height += lines[i].height;
    }

    this.height = height;
  }

  LeafChunk.prototype = {
    chunkSize: function chunkSize() {
      return this.lines.length;
    },
    // Remove the n lines at offset 'at'.
    removeInner: function removeInner(at, n) {
      var this$1 = this;

      for (var i = at, e = at + n; i < e; ++i) {
        var line = this$1.lines[i];
        this$1.height -= line.height;
        cleanUpLine(line);
        signalLater(line, "delete");
      }

      this.lines.splice(at, n);
    },
    // Helper used to collapse a small branch into a single leaf.
    collapse: function collapse(lines) {
      lines.push.apply(lines, this.lines);
    },
    // Insert the given array of lines at offset 'at', count them as
    // having the given height.
    insertInner: function insertInner(at, lines, height) {
      var this$1 = this;
      this.height += height;
      this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));

      for (var i = 0; i < lines.length; ++i) {
        lines[i].parent = this$1;
      }
    },
    // Used to iterate over a part of the tree.
    iterN: function iterN(at, n, op) {
      var this$1 = this;

      for (var e = at + n; at < e; ++at) {
        if (op(this$1.lines[at])) {
          return true;
        }
      }
    }
  };

  function BranchChunk(children) {
    var this$1 = this;
    this.children = children;
    var size = 0,
        height = 0;

    for (var i = 0; i < children.length; ++i) {
      var ch = children[i];
      size += ch.chunkSize();
      height += ch.height;
      ch.parent = this$1;
    }

    this.size = size;
    this.height = height;
    this.parent = null;
  }

  BranchChunk.prototype = {
    chunkSize: function chunkSize() {
      return this.size;
    },
    removeInner: function removeInner(at, n) {
      var this$1 = this;
      this.size -= n;

      for (var i = 0; i < this.children.length; ++i) {
        var child = this$1.children[i],
            sz = child.chunkSize();

        if (at < sz) {
          var rm = Math.min(n, sz - at),
              oldHeight = child.height;
          child.removeInner(at, rm);
          this$1.height -= oldHeight - child.height;

          if (sz == rm) {
            this$1.children.splice(i--, 1);
            child.parent = null;
          }

          if ((n -= rm) == 0) {
            break;
          }

          at = 0;
        } else {
          at -= sz;
        }
      } // If the result is smaller than 25 lines, ensure that it is a
      // single leaf node.


      if (this.size - n < 25 && (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
        var lines = [];
        this.collapse(lines);
        this.children = [new LeafChunk(lines)];
        this.children[0].parent = this;
      }
    },
    collapse: function collapse(lines) {
      var this$1 = this;

      for (var i = 0; i < this.children.length; ++i) {
        this$1.children[i].collapse(lines);
      }
    },
    insertInner: function insertInner(at, lines, height) {
      var this$1 = this;
      this.size += lines.length;
      this.height += height;

      for (var i = 0; i < this.children.length; ++i) {
        var child = this$1.children[i],
            sz = child.chunkSize();

        if (at <= sz) {
          child.insertInner(at, lines, height);

          if (child.lines && child.lines.length > 50) {
            // To avoid memory thrashing when child.lines is huge (e.g. first view of a large file), it's never spliced.
            // Instead, small slices are taken. They're taken in order because sequential memory accesses are fastest.
            var remaining = child.lines.length % 25 + 25;

            for (var pos = remaining; pos < child.lines.length;) {
              var leaf = new LeafChunk(child.lines.slice(pos, pos += 25));
              child.height -= leaf.height;
              this$1.children.splice(++i, 0, leaf);
              leaf.parent = this$1;
            }

            child.lines = child.lines.slice(0, remaining);
            this$1.maybeSpill();
          }

          break;
        }

        at -= sz;
      }
    },
    // When a node has grown, check whether it should be split.
    maybeSpill: function maybeSpill() {
      if (this.children.length <= 10) {
        return;
      }

      var me = this;

      do {
        var spilled = me.children.splice(me.children.length - 5, 5);
        var sibling = new BranchChunk(spilled);

        if (!me.parent) {
          // Become the parent node
          var copy = new BranchChunk(me.children);
          copy.parent = me;
          me.children = [copy, sibling];
          me = copy;
        } else {
          me.size -= sibling.size;
          me.height -= sibling.height;
          var myIndex = indexOf(me.parent.children, me);
          me.parent.children.splice(myIndex + 1, 0, sibling);
        }

        sibling.parent = me.parent;
      } while (me.children.length > 10);

      me.parent.maybeSpill();
    },
    iterN: function iterN(at, n, op) {
      var this$1 = this;

      for (var i = 0; i < this.children.length; ++i) {
        var child = this$1.children[i],
            sz = child.chunkSize();

        if (at < sz) {
          var used = Math.min(n, sz - at);

          if (child.iterN(at, used, op)) {
            return true;
          }

          if ((n -= used) == 0) {
            break;
          }

          at = 0;
        } else {
          at -= sz;
        }
      }
    }
  }; // Line widgets are block elements displayed above or below a line.

  function LineWidget(doc, node, options) {
    var this$1 = this;

    if (options) {
      for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
          this$1[opt] = options[opt];
        }
      }
    }

    this.doc = doc;
    this.node = node;
  }

  eventMixin(LineWidget);

  function adjustScrollWhenAboveVisible(cm, line, diff) {
    if (_heightAtLine(line) < (cm.curOp && cm.curOp.scrollTop || cm.doc.scrollTop)) {
      addToScrollPos(cm, null, diff);
    }
  }

  LineWidget.prototype.clear = function () {
    var this$1 = this;
    var cm = this.doc.cm,
        ws = this.line.widgets,
        line = this.line,
        no = lineNo(line);

    if (no == null || !ws) {
      return;
    }

    for (var i = 0; i < ws.length; ++i) {
      if (ws[i] == this$1) {
        ws.splice(i--, 1);
      }
    }

    if (!ws.length) {
      line.widgets = null;
    }

    var height = widgetHeight(this);
    updateLineHeight(line, Math.max(0, line.height - height));

    if (cm) {
      runInOp(cm, function () {
        adjustScrollWhenAboveVisible(cm, line, -height);
        regLineChange(cm, no, "widget");
      });
    }
  };

  LineWidget.prototype.changed = function () {
    var oldH = this.height,
        cm = this.doc.cm,
        line = this.line;
    this.height = null;
    var diff = widgetHeight(this) - oldH;

    if (!diff) {
      return;
    }

    updateLineHeight(line, line.height + diff);

    if (cm) {
      runInOp(cm, function () {
        cm.curOp.forceUpdate = true;
        adjustScrollWhenAboveVisible(cm, line, diff);
      });
    }
  };

  function addLineWidget(doc, handle, node, options) {
    var widget = new LineWidget(doc, node, options);
    var cm = doc.cm;

    if (cm && widget.noHScroll) {
      cm.display.alignWidgets = true;
    }

    changeLine(doc, handle, "widget", function (line) {
      var widgets = line.widgets || (line.widgets = []);

      if (widget.insertAt == null) {
        widgets.push(widget);
      } else {
        widgets.splice(Math.min(widgets.length - 1, Math.max(0, widget.insertAt)), 0, widget);
      }

      widget.line = line;

      if (cm && !lineIsHidden(doc, line)) {
        var aboveVisible = _heightAtLine(line) < doc.scrollTop;
        updateLineHeight(line, line.height + widgetHeight(widget));

        if (aboveVisible) {
          addToScrollPos(cm, null, widget.height);
        }

        cm.curOp.forceUpdate = true;
      }

      return true;
    });
    return widget;
  } // TEXTMARKERS
  // Created with markText and setBookmark methods. A TextMarker is a
  // handle that can be used to clear or find a marked position in the
  // document. Line objects hold arrays (markedSpans) containing
  // {from, to, marker} object pointing to such marker objects, and
  // indicating that such a marker is present on that line. Multiple
  // lines may point to the same marker when it spans across lines.
  // The spans will have null for their from/to properties when the
  // marker continues beyond the start/end of the line. Markers have
  // links back to the lines they currently touch.
  // Collapsed markers have unique ids, in order to be able to order
  // them, which is needed for uniquely determining an outer marker
  // when they overlap (they may nest, but not partially overlap).


  var nextMarkerId = 0;

  function TextMarker(doc, type) {
    this.lines = [];
    this.type = type;
    this.doc = doc;
    this.id = ++nextMarkerId;
  }

  eventMixin(TextMarker); // Clear the marker.

  TextMarker.prototype.clear = function () {
    var this$1 = this;

    if (this.explicitlyCleared) {
      return;
    }

    var cm = this.doc.cm,
        withOp = cm && !cm.curOp;

    if (withOp) {
      startOperation(cm);
    }

    if (hasHandler(this, "clear")) {
      var found = this.find();

      if (found) {
        signalLater(this, "clear", found.from, found.to);
      }
    }

    var min = null,
        max = null;

    for (var i = 0; i < this.lines.length; ++i) {
      var line = this$1.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this$1);

      if (cm && !this$1.collapsed) {
        regLineChange(cm, lineNo(line), "text");
      } else if (cm) {
        if (span.to != null) {
          max = lineNo(line);
        }

        if (span.from != null) {
          min = lineNo(line);
        }
      }

      line.markedSpans = removeMarkedSpan(line.markedSpans, span);

      if (span.from == null && this$1.collapsed && !lineIsHidden(this$1.doc, line) && cm) {
        updateLineHeight(line, textHeight(cm.display));
      }
    }

    if (cm && this.collapsed && !cm.options.lineWrapping) {
      for (var i$1 = 0; i$1 < this.lines.length; ++i$1) {
        var visual = visualLine(this$1.lines[i$1]),
            len = lineLength(visual);

        if (len > cm.display.maxLineLength) {
          cm.display.maxLine = visual;
          cm.display.maxLineLength = len;
          cm.display.maxLineChanged = true;
        }
      }
    }

    if (min != null && cm && this.collapsed) {
      regChange(cm, min, max + 1);
    }

    this.lines.length = 0;
    this.explicitlyCleared = true;

    if (this.atomic && this.doc.cantEdit) {
      this.doc.cantEdit = false;

      if (cm) {
        reCheckSelection(cm.doc);
      }
    }

    if (cm) {
      signalLater(cm, "markerCleared", cm, this);
    }

    if (withOp) {
      endOperation(cm);
    }

    if (this.parent) {
      this.parent.clear();
    }
  }; // Find the position of the marker in the document. Returns a {from,
  // to} object by default. Side can be passed to get a specific side
  // -- 0 (both), -1 (left), or 1 (right). When lineObj is true, the
  // Pos objects returned contain a line object, rather than a line
  // number (used to prevent looking up the same line twice).


  TextMarker.prototype.find = function (side, lineObj) {
    var this$1 = this;

    if (side == null && this.type == "bookmark") {
      side = 1;
    }

    var from, to;

    for (var i = 0; i < this.lines.length; ++i) {
      var line = this$1.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this$1);

      if (span.from != null) {
        from = Pos(lineObj ? line : lineNo(line), span.from);

        if (side == -1) {
          return from;
        }
      }

      if (span.to != null) {
        to = Pos(lineObj ? line : lineNo(line), span.to);

        if (side == 1) {
          return to;
        }
      }
    }

    return from && {
      from: from,
      to: to
    };
  }; // Signals that the marker's widget changed, and surrounding layout
  // should be recomputed.


  TextMarker.prototype.changed = function () {
    var pos = this.find(-1, true),
        widget = this,
        cm = this.doc.cm;

    if (!pos || !cm) {
      return;
    }

    runInOp(cm, function () {
      var line = pos.line,
          lineN = lineNo(pos.line);
      var view = findViewForLine(cm, lineN);

      if (view) {
        clearLineMeasurementCacheFor(view);
        cm.curOp.selectionChanged = cm.curOp.forceUpdate = true;
      }

      cm.curOp.updateMaxLine = true;

      if (!lineIsHidden(widget.doc, line) && widget.height != null) {
        var oldHeight = widget.height;
        widget.height = null;
        var dHeight = widgetHeight(widget) - oldHeight;

        if (dHeight) {
          updateLineHeight(line, line.height + dHeight);
        }
      }
    });
  };

  TextMarker.prototype.attachLine = function (line) {
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;

      if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1) {
        (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this);
      }
    }

    this.lines.push(line);
  };

  TextMarker.prototype.detachLine = function (line) {
    this.lines.splice(indexOf(this.lines, line), 1);

    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;
      (op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this);
    }
  }; // Create a marker, wire it up to the right lines, and


  function _markText(doc, from, to, options, type) {
    // Shared markers (across linked documents) are handled separately
    // (markTextShared will call out to this again, once per
    // document).
    if (options && options.shared) {
      return markTextShared(doc, from, to, options, type);
    } // Ensure we are in an operation.


    if (doc.cm && !doc.cm.curOp) {
      return operation(doc.cm, _markText)(doc, from, to, options, type);
    }

    var marker = new TextMarker(doc, type),
        diff = cmp(from, to);

    if (options) {
      copyObj(options, marker, false);
    } // Don't connect empty markers unless clearWhenEmpty is false


    if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false) {
      return marker;
    }

    if (marker.replacedWith) {
      // Showing up as a widget implies collapsed (widget replaces text)
      marker.collapsed = true;
      marker.widgetNode = elt("span", [marker.replacedWith], "CodeMirror-widget");
      marker.widgetNode.setAttribute("role", "presentation"); // hide from accessibility tree

      if (!options.handleMouseEvents) {
        marker.widgetNode.setAttribute("cm-ignore-events", "true");
      }

      if (options.insertLeft) {
        marker.widgetNode.insertLeft = true;
      }
    }

    if (marker.collapsed) {
      if (conflictingCollapsedRange(doc, from.line, from, to, marker) || from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker)) {
        throw new Error("Inserting collapsed marker partially overlapping an existing one");
      }

      seeCollapsedSpans();
    }

    if (marker.addToHistory) {
      addChangeToHistory(doc, {
        from: from,
        to: to,
        origin: "markText"
      }, doc.sel, NaN);
    }

    var curLine = from.line,
        cm = doc.cm,
        updateMaxLine;
    doc.iter(curLine, to.line + 1, function (line) {
      if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine) {
        updateMaxLine = true;
      }

      if (marker.collapsed && curLine != from.line) {
        updateLineHeight(line, 0);
      }

      addMarkedSpan(line, new MarkedSpan(marker, curLine == from.line ? from.ch : null, curLine == to.line ? to.ch : null));
      ++curLine;
    }); // lineIsHidden depends on the presence of the spans, so needs a second pass

    if (marker.collapsed) {
      doc.iter(from.line, to.line + 1, function (line) {
        if (lineIsHidden(doc, line)) {
          updateLineHeight(line, 0);
        }
      });
    }

    if (marker.clearOnEnter) {
      on(marker, "beforeCursorEnter", function () {
        return marker.clear();
      });
    }

    if (marker.readOnly) {
      seeReadOnlySpans();

      if (doc.history.done.length || doc.history.undone.length) {
        doc.clearHistory();
      }
    }

    if (marker.collapsed) {
      marker.id = ++nextMarkerId;
      marker.atomic = true;
    }

    if (cm) {
      // Sync editor state
      if (updateMaxLine) {
        cm.curOp.updateMaxLine = true;
      }

      if (marker.collapsed) {
        regChange(cm, from.line, to.line + 1);
      } else if (marker.className || marker.title || marker.startStyle || marker.endStyle || marker.css) {
        for (var i = from.line; i <= to.line; i++) {
          regLineChange(cm, i, "text");
        }
      }

      if (marker.atomic) {
        reCheckSelection(cm.doc);
      }

      signalLater(cm, "markerAdded", cm, marker);
    }

    return marker;
  } // SHARED TEXTMARKERS
  // A shared marker spans multiple linked documents. It is
  // implemented as a meta-marker-object controlling multiple normal
  // markers.


  function SharedTextMarker(markers, primary) {
    var this$1 = this;
    this.markers = markers;
    this.primary = primary;

    for (var i = 0; i < markers.length; ++i) {
      markers[i].parent = this$1;
    }
  }

  eventMixin(SharedTextMarker);

  SharedTextMarker.prototype.clear = function () {
    var this$1 = this;

    if (this.explicitlyCleared) {
      return;
    }

    this.explicitlyCleared = true;

    for (var i = 0; i < this.markers.length; ++i) {
      this$1.markers[i].clear();
    }

    signalLater(this, "clear");
  };

  SharedTextMarker.prototype.find = function (side, lineObj) {
    return this.primary.find(side, lineObj);
  };

  function markTextShared(doc, from, to, options, type) {
    options = copyObj(options);
    options.shared = false;
    var markers = [_markText(doc, from, to, options, type)],
        primary = markers[0];
    var widget = options.widgetNode;
    linkedDocs(doc, function (doc) {
      if (widget) {
        options.widgetNode = widget.cloneNode(true);
      }

      markers.push(_markText(doc, _clipPos(doc, from), _clipPos(doc, to), options, type));

      for (var i = 0; i < doc.linked.length; ++i) {
        if (doc.linked[i].isParent) {
          return;
        }
      }

      primary = lst(markers);
    });
    return new SharedTextMarker(markers, primary);
  }

  function findSharedMarkers(doc) {
    return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())), function (m) {
      return m.parent;
    });
  }

  function copySharedMarkers(doc, markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i],
          pos = marker.find();
      var mFrom = doc.clipPos(pos.from),
          mTo = doc.clipPos(pos.to);

      if (cmp(mFrom, mTo)) {
        var subMark = _markText(doc, mFrom, mTo, marker.primary, marker.primary.type);

        marker.markers.push(subMark);
        subMark.parent = marker;
      }
    }
  }

  function detachSharedMarkers(markers) {
    var loop = function loop(i) {
      var marker = markers[i],
          linked = [marker.primary.doc];
      linkedDocs(marker.primary.doc, function (d) {
        return linked.push(d);
      });

      for (var j = 0; j < marker.markers.length; j++) {
        var subMarker = marker.markers[j];

        if (indexOf(linked, subMarker.doc) == -1) {
          subMarker.parent = null;
          marker.markers.splice(j--, 1);
        }
      }
    };

    for (var i = 0; i < markers.length; i++) {
      loop(i);
    }
  }

  var nextDocId = 0;

  var Doc = function Doc(text, mode, firstLine, lineSep) {
    if (!(this instanceof Doc)) {
      return new Doc(text, mode, firstLine, lineSep);
    }

    if (firstLine == null) {
      firstLine = 0;
    }

    BranchChunk.call(this, [new LeafChunk([new Line("", null)])]);
    this.first = firstLine;
    this.scrollTop = this.scrollLeft = 0;
    this.cantEdit = false;
    this.cleanGeneration = 1;
    this.frontier = firstLine;
    var start = Pos(firstLine, 0);
    this.sel = simpleSelection(start);
    this.history = new History(null);
    this.id = ++nextDocId;
    this.modeOption = mode;
    this.lineSep = lineSep;
    this.extend = false;

    if (typeof text == "string") {
      text = this.splitLines(text);
    }

    updateDoc(this, {
      from: start,
      to: start,
      text: text
    });
    setSelection(this, simpleSelection(start), sel_dontScroll);
  };

  Doc.prototype = createObj(BranchChunk.prototype, {
    constructor: Doc,
    // Iterate over the document. Supports two forms -- with only one
    // argument, it calls that for each line in the document. With
    // three, it iterates over the range given by the first two (with
    // the second being non-inclusive).
    iter: function iter(from, to, op) {
      if (op) {
        this.iterN(from - this.first, to - from, op);
      } else {
        this.iterN(this.first, this.first + this.size, from);
      }
    },
    // Non-public interface for adding and removing lines.
    insert: function insert(at, lines) {
      var height = 0;

      for (var i = 0; i < lines.length; ++i) {
        height += lines[i].height;
      }

      this.insertInner(at - this.first, lines, height);
    },
    remove: function remove(at, n) {
      this.removeInner(at - this.first, n);
    },
    // From here, the methods are part of the public interface. Most
    // are also available from CodeMirror (editor) instances.
    getValue: function getValue(lineSep) {
      var lines = getLines(this, this.first, this.first + this.size);

      if (lineSep === false) {
        return lines;
      }

      return lines.join(lineSep || this.lineSeparator());
    },
    setValue: docMethodOp(function (code) {
      var top = Pos(this.first, 0),
          last = this.first + this.size - 1;
      makeChange(this, {
        from: top,
        to: Pos(last, getLine(this, last).text.length),
        text: this.splitLines(code),
        origin: "setValue",
        full: true
      }, true);
      setSelection(this, simpleSelection(top));
    }),
    replaceRange: function replaceRange(code, from, to, origin) {
      from = _clipPos(this, from);
      to = to ? _clipPos(this, to) : from;

      _replaceRange(this, code, from, to, origin);
    },
    getRange: function getRange(from, to, lineSep) {
      var lines = getBetween(this, _clipPos(this, from), _clipPos(this, to));

      if (lineSep === false) {
        return lines;
      }

      return lines.join(lineSep || this.lineSeparator());
    },
    getLine: function getLine(line) {
      var l = this.getLineHandle(line);
      return l && l.text;
    },
    getLineHandle: function getLineHandle(line) {
      if (isLine(this, line)) {
        return getLine(this, line);
      }
    },
    getLineNumber: function getLineNumber(line) {
      return lineNo(line);
    },
    getLineHandleVisualStart: function getLineHandleVisualStart(line) {
      if (typeof line == "number") {
        line = getLine(this, line);
      }

      return visualLine(line);
    },
    lineCount: function lineCount() {
      return this.size;
    },
    firstLine: function firstLine() {
      return this.first;
    },
    lastLine: function lastLine() {
      return this.first + this.size - 1;
    },
    clipPos: function clipPos(pos) {
      return _clipPos(this, pos);
    },
    getCursor: function getCursor(start) {
      var range = this.sel.primary(),
          pos;

      if (start == null || start == "head") {
        pos = range.head;
      } else if (start == "anchor") {
        pos = range.anchor;
      } else if (start == "end" || start == "to" || start === false) {
        pos = range.to();
      } else {
        pos = range.from();
      }

      return pos;
    },
    listSelections: function listSelections() {
      return this.sel.ranges;
    },
    somethingSelected: function somethingSelected() {
      return this.sel.somethingSelected();
    },
    setCursor: docMethodOp(function (line, ch, options) {
      setSimpleSelection(this, _clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options);
    }),
    setSelection: docMethodOp(function (anchor, head, options) {
      setSimpleSelection(this, _clipPos(this, anchor), _clipPos(this, head || anchor), options);
    }),
    extendSelection: docMethodOp(function (head, other, options) {
      extendSelection(this, _clipPos(this, head), other && _clipPos(this, other), options);
    }),
    extendSelections: docMethodOp(function (heads, options) {
      extendSelections(this, clipPosArray(this, heads), options);
    }),
    extendSelectionsBy: docMethodOp(function (f, options) {
      var heads = map(this.sel.ranges, f);
      extendSelections(this, clipPosArray(this, heads), options);
    }),
    setSelections: docMethodOp(function (ranges, primary, options) {
      var this$1 = this;

      if (!ranges.length) {
        return;
      }

      var out = [];

      for (var i = 0; i < ranges.length; i++) {
        out[i] = new Range(_clipPos(this$1, ranges[i].anchor), _clipPos(this$1, ranges[i].head));
      }

      if (primary == null) {
        primary = Math.min(ranges.length - 1, this.sel.primIndex);
      }

      setSelection(this, normalizeSelection(out, primary), options);
    }),
    addSelection: docMethodOp(function (anchor, head, options) {
      var ranges = this.sel.ranges.slice(0);
      ranges.push(new Range(_clipPos(this, anchor), _clipPos(this, head || anchor)));
      setSelection(this, normalizeSelection(ranges, ranges.length - 1), options);
    }),
    getSelection: function getSelection(lineSep) {
      var this$1 = this;
      var ranges = this.sel.ranges,
          lines;

      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this$1, ranges[i].from(), ranges[i].to());
        lines = lines ? lines.concat(sel) : sel;
      }

      if (lineSep === false) {
        return lines;
      } else {
        return lines.join(lineSep || this.lineSeparator());
      }
    },
    getSelections: function getSelections(lineSep) {
      var this$1 = this;
      var parts = [],
          ranges = this.sel.ranges;

      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this$1, ranges[i].from(), ranges[i].to());

        if (lineSep !== false) {
          sel = sel.join(lineSep || this$1.lineSeparator());
        }

        parts[i] = sel;
      }

      return parts;
    },
    replaceSelection: function replaceSelection(code, collapse, origin) {
      var dup = [];

      for (var i = 0; i < this.sel.ranges.length; i++) {
        dup[i] = code;
      }

      this.replaceSelections(dup, collapse, origin || "+input");
    },
    replaceSelections: docMethodOp(function (code, collapse, origin) {
      var this$1 = this;
      var changes = [],
          sel = this.sel;

      for (var i = 0; i < sel.ranges.length; i++) {
        var range = sel.ranges[i];
        changes[i] = {
          from: range.from(),
          to: range.to(),
          text: this$1.splitLines(code[i]),
          origin: origin
        };
      }

      var newSel = collapse && collapse != "end" && computeReplacedSel(this, changes, collapse);

      for (var i$1 = changes.length - 1; i$1 >= 0; i$1--) {
        makeChange(this$1, changes[i$1]);
      }

      if (newSel) {
        setSelectionReplaceHistory(this, newSel);
      } else if (this.cm) {
        ensureCursorVisible(this.cm);
      }
    }),
    undo: docMethodOp(function () {
      makeChangeFromHistory(this, "undo");
    }),
    redo: docMethodOp(function () {
      makeChangeFromHistory(this, "redo");
    }),
    undoSelection: docMethodOp(function () {
      makeChangeFromHistory(this, "undo", true);
    }),
    redoSelection: docMethodOp(function () {
      makeChangeFromHistory(this, "redo", true);
    }),
    setExtending: function setExtending(val) {
      this.extend = val;
    },
    getExtending: function getExtending() {
      return this.extend;
    },
    historySize: function historySize() {
      var hist = this.history,
          done = 0,
          undone = 0;

      for (var i = 0; i < hist.done.length; i++) {
        if (!hist.done[i].ranges) {
          ++done;
        }
      }

      for (var i$1 = 0; i$1 < hist.undone.length; i$1++) {
        if (!hist.undone[i$1].ranges) {
          ++undone;
        }
      }

      return {
        undo: done,
        redo: undone
      };
    },
    clearHistory: function clearHistory() {
      this.history = new History(this.history.maxGeneration);
    },
    markClean: function markClean() {
      this.cleanGeneration = this.changeGeneration(true);
    },
    changeGeneration: function changeGeneration(forceSplit) {
      if (forceSplit) {
        this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null;
      }

      return this.history.generation;
    },
    isClean: function isClean(gen) {
      return this.history.generation == (gen || this.cleanGeneration);
    },
    getHistory: function getHistory() {
      return {
        done: copyHistoryArray(this.history.done),
        undone: copyHistoryArray(this.history.undone)
      };
    },
    setHistory: function setHistory(histData) {
      var hist = this.history = new History(this.history.maxGeneration);
      hist.done = copyHistoryArray(histData.done.slice(0), null, true);
      hist.undone = copyHistoryArray(histData.undone.slice(0), null, true);
    },
    setGutterMarker: docMethodOp(function (line, gutterID, value) {
      return changeLine(this, line, "gutter", function (line) {
        var markers = line.gutterMarkers || (line.gutterMarkers = {});
        markers[gutterID] = value;

        if (!value && isEmpty(markers)) {
          line.gutterMarkers = null;
        }

        return true;
      });
    }),
    clearGutter: docMethodOp(function (gutterID) {
      var this$1 = this;
      this.iter(function (line) {
        if (line.gutterMarkers && line.gutterMarkers[gutterID]) {
          changeLine(this$1, line, "gutter", function () {
            line.gutterMarkers[gutterID] = null;

            if (isEmpty(line.gutterMarkers)) {
              line.gutterMarkers = null;
            }

            return true;
          });
        }
      });
    }),
    lineInfo: function lineInfo(line) {
      var n;

      if (typeof line == "number") {
        if (!isLine(this, line)) {
          return null;
        }

        n = line;
        line = getLine(this, line);

        if (!line) {
          return null;
        }
      } else {
        n = lineNo(line);

        if (n == null) {
          return null;
        }
      }

      return {
        line: n,
        handle: line,
        text: line.text,
        gutterMarkers: line.gutterMarkers,
        textClass: line.textClass,
        bgClass: line.bgClass,
        wrapClass: line.wrapClass,
        widgets: line.widgets
      };
    },
    addLineClass: docMethodOp(function (handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
        var prop = where == "text" ? "textClass" : where == "background" ? "bgClass" : where == "gutter" ? "gutterClass" : "wrapClass";

        if (!line[prop]) {
          line[prop] = cls;
        } else if (classTest(cls).test(line[prop])) {
          return false;
        } else {
          line[prop] += " " + cls;
        }

        return true;
      });
    }),
    removeLineClass: docMethodOp(function (handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
        var prop = where == "text" ? "textClass" : where == "background" ? "bgClass" : where == "gutter" ? "gutterClass" : "wrapClass";
        var cur = line[prop];

        if (!cur) {
          return false;
        } else if (cls == null) {
          line[prop] = null;
        } else {
          var found = cur.match(classTest(cls));

          if (!found) {
            return false;
          }

          var end = found.index + found[0].length;
          line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null;
        }

        return true;
      });
    }),
    addLineWidget: docMethodOp(function (handle, node, options) {
      return addLineWidget(this, handle, node, options);
    }),
    removeLineWidget: function removeLineWidget(widget) {
      widget.clear();
    },
    markText: function markText(from, to, options) {
      return _markText(this, _clipPos(this, from), _clipPos(this, to), options, options && options.type || "range");
    },
    setBookmark: function setBookmark(pos, options) {
      var realOpts = {
        replacedWith: options && (options.nodeType == null ? options.widget : options),
        insertLeft: options && options.insertLeft,
        clearWhenEmpty: false,
        shared: options && options.shared,
        handleMouseEvents: options && options.handleMouseEvents
      };
      pos = _clipPos(this, pos);
      return _markText(this, pos, pos, realOpts, "bookmark");
    },
    findMarksAt: function findMarksAt(pos) {
      pos = _clipPos(this, pos);
      var markers = [],
          spans = getLine(this, pos.line).markedSpans;

      if (spans) {
        for (var i = 0; i < spans.length; ++i) {
          var span = spans[i];

          if ((span.from == null || span.from <= pos.ch) && (span.to == null || span.to >= pos.ch)) {
            markers.push(span.marker.parent || span.marker);
          }
        }
      }

      return markers;
    },
    findMarks: function findMarks(from, to, filter) {
      from = _clipPos(this, from);
      to = _clipPos(this, to);
      var found = [],
          lineNo = from.line;
      this.iter(from.line, to.line + 1, function (line) {
        var spans = line.markedSpans;

        if (spans) {
          for (var i = 0; i < spans.length; i++) {
            var span = spans[i];

            if (!(span.to != null && lineNo == from.line && from.ch >= span.to || span.from == null && lineNo != from.line || span.from != null && lineNo == to.line && span.from >= to.ch) && (!filter || filter(span.marker))) {
              found.push(span.marker.parent || span.marker);
            }
          }
        }

        ++lineNo;
      });
      return found;
    },
    getAllMarks: function getAllMarks() {
      var markers = [];
      this.iter(function (line) {
        var sps = line.markedSpans;

        if (sps) {
          for (var i = 0; i < sps.length; ++i) {
            if (sps[i].from != null) {
              markers.push(sps[i].marker);
            }
          }
        }
      });
      return markers;
    },
    posFromIndex: function posFromIndex(off) {
      var ch,
          lineNo = this.first,
          sepSize = this.lineSeparator().length;
      this.iter(function (line) {
        var sz = line.text.length + sepSize;

        if (sz > off) {
          ch = off;
          return true;
        }

        off -= sz;
        ++lineNo;
      });
      return _clipPos(this, Pos(lineNo, ch));
    },
    indexFromPos: function indexFromPos(coords) {
      coords = _clipPos(this, coords);
      var index = coords.ch;

      if (coords.line < this.first || coords.ch < 0) {
        return 0;
      }

      var sepSize = this.lineSeparator().length;
      this.iter(this.first, coords.line, function (line) {
        // iter aborts when callback returns a truthy value
        index += line.text.length + sepSize;
      });
      return index;
    },
    copy: function copy(copyHistory) {
      var doc = new Doc(getLines(this, this.first, this.first + this.size), this.modeOption, this.first, this.lineSep);
      doc.scrollTop = this.scrollTop;
      doc.scrollLeft = this.scrollLeft;
      doc.sel = this.sel;
      doc.extend = false;

      if (copyHistory) {
        doc.history.undoDepth = this.history.undoDepth;
        doc.setHistory(this.getHistory());
      }

      return doc;
    },
    linkedDoc: function linkedDoc(options) {
      if (!options) {
        options = {};
      }

      var from = this.first,
          to = this.first + this.size;

      if (options.from != null && options.from > from) {
        from = options.from;
      }

      if (options.to != null && options.to < to) {
        to = options.to;
      }

      var copy = new Doc(getLines(this, from, to), options.mode || this.modeOption, from, this.lineSep);

      if (options.sharedHist) {
        copy.history = this.history;
      }

      (this.linked || (this.linked = [])).push({
        doc: copy,
        sharedHist: options.sharedHist
      });
      copy.linked = [{
        doc: this,
        isParent: true,
        sharedHist: options.sharedHist
      }];
      copySharedMarkers(copy, findSharedMarkers(this));
      return copy;
    },
    unlinkDoc: function unlinkDoc(other) {
      var this$1 = this;

      if (other instanceof CodeMirror) {
        other = other.doc;
      }

      if (this.linked) {
        for (var i = 0; i < this.linked.length; ++i) {
          var link = this$1.linked[i];

          if (link.doc != other) {
            continue;
          }

          this$1.linked.splice(i, 1);
          other.unlinkDoc(this$1);
          detachSharedMarkers(findSharedMarkers(this$1));
          break;
        }
      } // If the histories were shared, split them again


      if (other.history == this.history) {
        var splitIds = [other.id];
        linkedDocs(other, function (doc) {
          return splitIds.push(doc.id);
        }, true);
        other.history = new History(null);
        other.history.done = copyHistoryArray(this.history.done, splitIds);
        other.history.undone = copyHistoryArray(this.history.undone, splitIds);
      }
    },
    iterLinkedDocs: function iterLinkedDocs(f) {
      linkedDocs(this, f);
    },
    getMode: function getMode() {
      return this.mode;
    },
    getEditor: function getEditor() {
      return this.cm;
    },
    splitLines: function splitLines(str) {
      if (this.lineSep) {
        return str.split(this.lineSep);
      }

      return splitLinesAuto(str);
    },
    lineSeparator: function lineSeparator() {
      return this.lineSep || "\n";
    }
  }); // Public alias.

  Doc.prototype.eachLine = Doc.prototype.iter; // Kludge to work around strange IE behavior where it'll sometimes
  // re-fire a series of drag-related events right after the drop (#1551)

  var lastDrop = 0;

  function onDrop(e) {
    var cm = this;
    clearDragCursor(cm);

    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) {
      return;
    }

    e_preventDefault(e);

    if (ie) {
      lastDrop = +new Date();
    }

    var pos = posFromMouse(cm, e, true),
        files = e.dataTransfer.files;

    if (!pos || cm.isReadOnly()) {
      return;
    } // Might be a file drop, in which case we simply extract the text
    // and insert it.


    if (files && files.length && window.FileReader && window.File) {
      var n = files.length,
          text = Array(n),
          read = 0;

      var loadFile = function loadFile(file, i) {
        if (cm.options.allowDropFileTypes && indexOf(cm.options.allowDropFileTypes, file.type) == -1) {
          return;
        }

        var reader = new FileReader();
        reader.onload = operation(cm, function () {
          var content = reader.result;

          if (/[\x00-\x08\x0e-\x1f]{2}/.test(content)) {
            content = "";
          }

          text[i] = content;

          if (++read == n) {
            pos = _clipPos(cm.doc, pos);
            var change = {
              from: pos,
              to: pos,
              text: cm.doc.splitLines(text.join(cm.doc.lineSeparator())),
              origin: "paste"
            };
            makeChange(cm.doc, change);
            setSelectionReplaceHistory(cm.doc, simpleSelection(pos, changeEnd(change)));
          }
        });
        reader.readAsText(file);
      };

      for (var i = 0; i < n; ++i) {
        loadFile(files[i], i);
      }
    } else {
      // Normal drop
      // Don't do a replace if the drop happened inside of the selected text.
      if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) {
        cm.state.draggingText(e); // Ensure the editor is re-focused

        setTimeout(function () {
          return cm.display.input.focus();
        }, 20);
        return;
      }

      try {
        var text$1 = e.dataTransfer.getData("Text");

        if (text$1) {
          var selected;

          if (cm.state.draggingText && !cm.state.draggingText.copy) {
            selected = cm.listSelections();
          }

          setSelectionNoUndo(cm.doc, simpleSelection(pos, pos));

          if (selected) {
            for (var i$1 = 0; i$1 < selected.length; ++i$1) {
              _replaceRange(cm.doc, "", selected[i$1].anchor, selected[i$1].head, "drag");
            }
          }

          cm.replaceSelection(text$1, "around", "paste");
          cm.display.input.focus();
        }
      } catch (e) {}
    }
  }

  function onDragStart(cm, e) {
    if (ie && (!cm.state.draggingText || +new Date() - lastDrop < 100)) {
      e_stop(e);
      return;
    }

    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) {
      return;
    }

    e.dataTransfer.setData("Text", cm.getSelection());
    e.dataTransfer.effectAllowed = "copyMove"; // Use dummy image instead of default browsers image.
    // Recent Safari (~6.0.2) have a tendency to segfault when this happens, so we don't do it there.

    if (e.dataTransfer.setDragImage && !safari) {
      var img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
      img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

      if (presto) {
        img.width = img.height = 1;
        cm.display.wrapper.appendChild(img); // Force a relayout, or Opera won't use our image for some obscure reason

        img._top = img.offsetTop;
      }

      e.dataTransfer.setDragImage(img, 0, 0);

      if (presto) {
        img.parentNode.removeChild(img);
      }
    }
  }

  function onDragOver(cm, e) {
    var pos = posFromMouse(cm, e);

    if (!pos) {
      return;
    }

    var frag = document.createDocumentFragment();
    drawSelectionCursor(cm, pos, frag);

    if (!cm.display.dragCursor) {
      cm.display.dragCursor = elt("div", null, "CodeMirror-cursors CodeMirror-dragcursors");
      cm.display.lineSpace.insertBefore(cm.display.dragCursor, cm.display.cursorDiv);
    }

    removeChildrenAndAdd(cm.display.dragCursor, frag);
  }

  function clearDragCursor(cm) {
    if (cm.display.dragCursor) {
      cm.display.lineSpace.removeChild(cm.display.dragCursor);
      cm.display.dragCursor = null;
    }
  } // These must be handled carefully, because naively registering a
  // handler for each editor will cause the editors to never be
  // garbage collected.


  function forEachCodeMirror(f) {
    if (!document.body.getElementsByClassName) {
      return;
    }

    var byClass = document.body.getElementsByClassName("CodeMirror");

    for (var i = 0; i < byClass.length; i++) {
      var cm = byClass[i].CodeMirror;

      if (cm) {
        f(cm);
      }
    }
  }

  var globalsRegistered = false;

  function ensureGlobalHandlers() {
    if (globalsRegistered) {
      return;
    }

    registerGlobalHandlers();
    globalsRegistered = true;
  }

  function registerGlobalHandlers() {
    // When the window resizes, we need to refresh active editors.
    var resizeTimer;
    on(window, "resize", function () {
      if (resizeTimer == null) {
        resizeTimer = setTimeout(function () {
          resizeTimer = null;
          forEachCodeMirror(onResize);
        }, 100);
      }
    }); // When the window loses focus, we want to show the editor as blurred

    on(window, "blur", function () {
      return forEachCodeMirror(onBlur);
    });
  } // Called when the window resizes


  function onResize(cm) {
    var d = cm.display;

    if (d.lastWrapHeight == d.wrapper.clientHeight && d.lastWrapWidth == d.wrapper.clientWidth) {
      return;
    } // Might be a text scaling operation, clear size caches.


    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
    d.scrollbarsClipped = false;
    cm.setSize();
  }

  var keyNames = {
    3: "Enter",
    8: "Backspace",
    9: "Tab",
    13: "Enter",
    16: "Shift",
    17: "Ctrl",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Esc",
    32: "Space",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "Left",
    38: "Up",
    39: "Right",
    40: "Down",
    44: "PrintScrn",
    45: "Insert",
    46: "Delete",
    59: ";",
    61: "=",
    91: "Mod",
    92: "Mod",
    93: "Mod",
    106: "*",
    107: "=",
    109: "-",
    110: ".",
    111: "/",
    127: "Delete",
    173: "-",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
    63232: "Up",
    63233: "Down",
    63234: "Left",
    63235: "Right",
    63272: "Delete",
    63273: "Home",
    63275: "End",
    63276: "PageUp",
    63277: "PageDown",
    63302: "Insert"
  }; // Number keys

  for (var i = 0; i < 10; i++) {
    keyNames[i + 48] = keyNames[i + 96] = String(i);
  } // Alphabetic keys


  for (var i$1 = 65; i$1 <= 90; i$1++) {
    keyNames[i$1] = String.fromCharCode(i$1);
  } // Function keys


  for (var i$2 = 1; i$2 <= 12; i$2++) {
    keyNames[i$2 + 111] = keyNames[i$2 + 63235] = "F" + i$2;
  }

  var keyMap = {};
  keyMap.basic = {
    "Left": "goCharLeft",
    "Right": "goCharRight",
    "Up": "goLineUp",
    "Down": "goLineDown",
    "End": "goLineEnd",
    "Home": "goLineStartSmart",
    "PageUp": "goPageUp",
    "PageDown": "goPageDown",
    "Delete": "delCharAfter",
    "Backspace": "delCharBefore",
    "Shift-Backspace": "delCharBefore",
    "Tab": "defaultTab",
    "Shift-Tab": "indentAuto",
    "Enter": "newlineAndIndent",
    "Insert": "toggleOverwrite",
    "Esc": "singleSelection"
  }; // Note that the save and find-related commands aren't defined by
  // default. User code or addons can define them. Unknown commands
  // are simply ignored.

  keyMap.pcDefault = {
    "Ctrl-A": "selectAll",
    "Ctrl-D": "deleteLine",
    "Ctrl-Z": "undo",
    "Shift-Ctrl-Z": "redo",
    "Ctrl-Y": "redo",
    "Ctrl-Home": "goDocStart",
    "Ctrl-End": "goDocEnd",
    "Ctrl-Up": "goLineUp",
    "Ctrl-Down": "goLineDown",
    "Ctrl-Left": "goGroupLeft",
    "Ctrl-Right": "goGroupRight",
    "Alt-Left": "goLineStart",
    "Alt-Right": "goLineEnd",
    "Ctrl-Backspace": "delGroupBefore",
    "Ctrl-Delete": "delGroupAfter",
    "Ctrl-S": "save",
    "Ctrl-F": "find",
    "Ctrl-G": "findNext",
    "Shift-Ctrl-G": "findPrev",
    "Shift-Ctrl-F": "replace",
    "Shift-Ctrl-R": "replaceAll",
    "Ctrl-[": "indentLess",
    "Ctrl-]": "indentMore",
    "Ctrl-U": "undoSelection",
    "Shift-Ctrl-U": "redoSelection",
    "Alt-U": "redoSelection",
    fallthrough: "basic"
  }; // Very basic readline/emacs-style bindings, which are standard on Mac.

  keyMap.emacsy = {
    "Ctrl-F": "goCharRight",
    "Ctrl-B": "goCharLeft",
    "Ctrl-P": "goLineUp",
    "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight",
    "Alt-B": "goWordLeft",
    "Ctrl-A": "goLineStart",
    "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown",
    "Shift-Ctrl-V": "goPageUp",
    "Ctrl-D": "delCharAfter",
    "Ctrl-H": "delCharBefore",
    "Alt-D": "delWordAfter",
    "Alt-Backspace": "delWordBefore",
    "Ctrl-K": "killLine",
    "Ctrl-T": "transposeChars",
    "Ctrl-O": "openLine"
  };
  keyMap.macDefault = {
    "Cmd-A": "selectAll",
    "Cmd-D": "deleteLine",
    "Cmd-Z": "undo",
    "Shift-Cmd-Z": "redo",
    "Cmd-Y": "redo",
    "Cmd-Home": "goDocStart",
    "Cmd-Up": "goDocStart",
    "Cmd-End": "goDocEnd",
    "Cmd-Down": "goDocEnd",
    "Alt-Left": "goGroupLeft",
    "Alt-Right": "goGroupRight",
    "Cmd-Left": "goLineLeft",
    "Cmd-Right": "goLineRight",
    "Alt-Backspace": "delGroupBefore",
    "Ctrl-Alt-Backspace": "delGroupAfter",
    "Alt-Delete": "delGroupAfter",
    "Cmd-S": "save",
    "Cmd-F": "find",
    "Cmd-G": "findNext",
    "Shift-Cmd-G": "findPrev",
    "Cmd-Alt-F": "replace",
    "Shift-Cmd-Alt-F": "replaceAll",
    "Cmd-[": "indentLess",
    "Cmd-]": "indentMore",
    "Cmd-Backspace": "delWrappedLineLeft",
    "Cmd-Delete": "delWrappedLineRight",
    "Cmd-U": "undoSelection",
    "Shift-Cmd-U": "redoSelection",
    "Ctrl-Up": "goDocStart",
    "Ctrl-Down": "goDocEnd",
    fallthrough: ["basic", "emacsy"]
  };
  keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault; // KEYMAP DISPATCH

  function normalizeKeyName(name) {
    var parts = name.split(/-(?!$)/);
    name = parts[parts.length - 1];
    var alt, ctrl, shift, cmd;

    for (var i = 0; i < parts.length - 1; i++) {
      var mod = parts[i];

      if (/^(cmd|meta|m)$/i.test(mod)) {
        cmd = true;
      } else if (/^a(lt)?$/i.test(mod)) {
        alt = true;
      } else if (/^(c|ctrl|control)$/i.test(mod)) {
        ctrl = true;
      } else if (/^s(hift)?$/i.test(mod)) {
        shift = true;
      } else {
        throw new Error("Unrecognized modifier name: " + mod);
      }
    }

    if (alt) {
      name = "Alt-" + name;
    }

    if (ctrl) {
      name = "Ctrl-" + name;
    }

    if (cmd) {
      name = "Cmd-" + name;
    }

    if (shift) {
      name = "Shift-" + name;
    }

    return name;
  } // This is a kludge to keep keymaps mostly working as raw objects
  // (backwards compatibility) while at the same time support features
  // like normalization and multi-stroke key bindings. It compiles a
  // new normalized keymap, and then updates the old object to reflect
  // this.


  function normalizeKeyMap(keymap) {
    var copy = {};

    for (var keyname in keymap) {
      if (keymap.hasOwnProperty(keyname)) {
        var value = keymap[keyname];

        if (/^(name|fallthrough|(de|at)tach)$/.test(keyname)) {
          continue;
        }

        if (value == "...") {
          delete keymap[keyname];
          continue;
        }

        var keys = map(keyname.split(" "), normalizeKeyName);

        for (var i = 0; i < keys.length; i++) {
          var val = void 0,
              name = void 0;

          if (i == keys.length - 1) {
            name = keys.join(" ");
            val = value;
          } else {
            name = keys.slice(0, i + 1).join(" ");
            val = "...";
          }

          var prev = copy[name];

          if (!prev) {
            copy[name] = val;
          } else if (prev != val) {
            throw new Error("Inconsistent bindings for " + name);
          }
        }

        delete keymap[keyname];
      }
    }

    for (var prop in copy) {
      keymap[prop] = copy[prop];
    }

    return keymap;
  }

  function lookupKey(key, map, handle, context) {
    map = getKeyMap(map);
    var found = map.call ? map.call(key, context) : map[key];

    if (found === false) {
      return "nothing";
    }

    if (found === "...") {
      return "multi";
    }

    if (found != null && handle(found)) {
      return "handled";
    }

    if (map.fallthrough) {
      if (Object.prototype.toString.call(map.fallthrough) != "[object Array]") {
        return lookupKey(key, map.fallthrough, handle, context);
      }

      for (var i = 0; i < map.fallthrough.length; i++) {
        var result = lookupKey(key, map.fallthrough[i], handle, context);

        if (result) {
          return result;
        }
      }
    }
  } // Modifier key presses don't count as 'real' key presses for the
  // purpose of keymap fallthrough.


  function isModifierKey(value) {
    var name = typeof value == "string" ? value : keyNames[value.keyCode];
    return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod";
  } // Look up the name of a key as indicated by an event object.


  function keyName(event, noShift) {
    if (presto && event.keyCode == 34 && event["char"]) {
      return false;
    }

    var base = keyNames[event.keyCode],
        name = base;

    if (name == null || event.altGraphKey) {
      return false;
    }

    if (event.altKey && base != "Alt") {
      name = "Alt-" + name;
    }

    if ((flipCtrlCmd ? event.metaKey : event.ctrlKey) && base != "Ctrl") {
      name = "Ctrl-" + name;
    }

    if ((flipCtrlCmd ? event.ctrlKey : event.metaKey) && base != "Cmd") {
      name = "Cmd-" + name;
    }

    if (!noShift && event.shiftKey && base != "Shift") {
      name = "Shift-" + name;
    }

    return name;
  }

  function getKeyMap(val) {
    return typeof val == "string" ? keyMap[val] : val;
  } // Helper for deleting text near the selection(s), used to implement
  // backspace, delete, and similar functionality.


  function deleteNearSelection(cm, compute) {
    var ranges = cm.doc.sel.ranges,
        kill = []; // Build up a set of ranges to kill first, merging overlapping
    // ranges.

    for (var i = 0; i < ranges.length; i++) {
      var toKill = compute(ranges[i]);

      while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
        var replaced = kill.pop();

        if (cmp(replaced.from, toKill.from) < 0) {
          toKill.from = replaced.from;
          break;
        }
      }

      kill.push(toKill);
    } // Next, remove those actual ranges.


    runInOp(cm, function () {
      for (var i = kill.length - 1; i >= 0; i--) {
        _replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete");
      }

      ensureCursorVisible(cm);
    });
  } // Commands are parameter-less actions that can be performed on an
  // editor, mostly used for keybindings.


  var commands = {
    selectAll: selectAll,
    singleSelection: function singleSelection(cm) {
      return cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll);
    },
    killLine: function killLine(cm) {
      return deleteNearSelection(cm, function (range) {
        if (range.empty()) {
          var len = getLine(cm.doc, range.head.line).text.length;

          if (range.head.ch == len && range.head.line < cm.lastLine()) {
            return {
              from: range.head,
              to: Pos(range.head.line + 1, 0)
            };
          } else {
            return {
              from: range.head,
              to: Pos(range.head.line, len)
            };
          }
        } else {
          return {
            from: range.from(),
            to: range.to()
          };
        }
      });
    },
    deleteLine: function deleteLine(cm) {
      return deleteNearSelection(cm, function (range) {
        return {
          from: Pos(range.from().line, 0),
          to: _clipPos(cm.doc, Pos(range.to().line + 1, 0))
        };
      });
    },
    delLineLeft: function delLineLeft(cm) {
      return deleteNearSelection(cm, function (range) {
        return {
          from: Pos(range.from().line, 0),
          to: range.from()
        };
      });
    },
    delWrappedLineLeft: function delWrappedLineLeft(cm) {
      return deleteNearSelection(cm, function (range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var leftPos = cm.coordsChar({
          left: 0,
          top: top
        }, "div");
        return {
          from: leftPos,
          to: range.from()
        };
      });
    },
    delWrappedLineRight: function delWrappedLineRight(cm) {
      return deleteNearSelection(cm, function (range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var rightPos = cm.coordsChar({
          left: cm.display.lineDiv.offsetWidth + 100,
          top: top
        }, "div");
        return {
          from: range.from(),
          to: rightPos
        };
      });
    },
    undo: function undo(cm) {
      return cm.undo();
    },
    redo: function redo(cm) {
      return cm.redo();
    },
    undoSelection: function undoSelection(cm) {
      return cm.undoSelection();
    },
    redoSelection: function redoSelection(cm) {
      return cm.redoSelection();
    },
    goDocStart: function goDocStart(cm) {
      return cm.extendSelection(Pos(cm.firstLine(), 0));
    },
    goDocEnd: function goDocEnd(cm) {
      return cm.extendSelection(Pos(cm.lastLine()));
    },
    goLineStart: function goLineStart(cm) {
      return cm.extendSelectionsBy(function (range) {
        return lineStart(cm, range.head.line);
      }, {
        origin: "+move",
        bias: 1
      });
    },
    goLineStartSmart: function goLineStartSmart(cm) {
      return cm.extendSelectionsBy(function (range) {
        return lineStartSmart(cm, range.head);
      }, {
        origin: "+move",
        bias: 1
      });
    },
    goLineEnd: function goLineEnd(cm) {
      return cm.extendSelectionsBy(function (range) {
        return lineEnd(cm, range.head.line);
      }, {
        origin: "+move",
        bias: -1
      });
    },
    goLineRight: function goLineRight(cm) {
      return cm.extendSelectionsBy(function (range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        return cm.coordsChar({
          left: cm.display.lineDiv.offsetWidth + 100,
          top: top
        }, "div");
      }, sel_move);
    },
    goLineLeft: function goLineLeft(cm) {
      return cm.extendSelectionsBy(function (range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        return cm.coordsChar({
          left: 0,
          top: top
        }, "div");
      }, sel_move);
    },
    goLineLeftSmart: function goLineLeftSmart(cm) {
      return cm.extendSelectionsBy(function (range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var pos = cm.coordsChar({
          left: 0,
          top: top
        }, "div");

        if (pos.ch < cm.getLine(pos.line).search(/\S/)) {
          return lineStartSmart(cm, range.head);
        }

        return pos;
      }, sel_move);
    },
    goLineUp: function goLineUp(cm) {
      return cm.moveV(-1, "line");
    },
    goLineDown: function goLineDown(cm) {
      return cm.moveV(1, "line");
    },
    goPageUp: function goPageUp(cm) {
      return cm.moveV(-1, "page");
    },
    goPageDown: function goPageDown(cm) {
      return cm.moveV(1, "page");
    },
    goCharLeft: function goCharLeft(cm) {
      return cm.moveH(-1, "char");
    },
    goCharRight: function goCharRight(cm) {
      return cm.moveH(1, "char");
    },
    goColumnLeft: function goColumnLeft(cm) {
      return cm.moveH(-1, "column");
    },
    goColumnRight: function goColumnRight(cm) {
      return cm.moveH(1, "column");
    },
    goWordLeft: function goWordLeft(cm) {
      return cm.moveH(-1, "word");
    },
    goGroupRight: function goGroupRight(cm) {
      return cm.moveH(1, "group");
    },
    goGroupLeft: function goGroupLeft(cm) {
      return cm.moveH(-1, "group");
    },
    goWordRight: function goWordRight(cm) {
      return cm.moveH(1, "word");
    },
    delCharBefore: function delCharBefore(cm) {
      return cm.deleteH(-1, "char");
    },
    delCharAfter: function delCharAfter(cm) {
      return cm.deleteH(1, "char");
    },
    delWordBefore: function delWordBefore(cm) {
      return cm.deleteH(-1, "word");
    },
    delWordAfter: function delWordAfter(cm) {
      return cm.deleteH(1, "word");
    },
    delGroupBefore: function delGroupBefore(cm) {
      return cm.deleteH(-1, "group");
    },
    delGroupAfter: function delGroupAfter(cm) {
      return cm.deleteH(1, "group");
    },
    indentAuto: function indentAuto(cm) {
      return cm.indentSelection("smart");
    },
    indentMore: function indentMore(cm) {
      return cm.indentSelection("add");
    },
    indentLess: function indentLess(cm) {
      return cm.indentSelection("subtract");
    },
    insertTab: function insertTab(cm) {
      return cm.replaceSelection("\t");
    },
    insertSoftTab: function insertSoftTab(cm) {
      var spaces = [],
          ranges = cm.listSelections(),
          tabSize = cm.options.tabSize;

      for (var i = 0; i < ranges.length; i++) {
        var pos = ranges[i].from();
        var col = countColumn(cm.getLine(pos.line), pos.ch, tabSize);
        spaces.push(spaceStr(tabSize - col % tabSize));
      }

      cm.replaceSelections(spaces);
    },
    defaultTab: function defaultTab(cm) {
      if (cm.somethingSelected()) {
        cm.indentSelection("add");
      } else {
        cm.execCommand("insertTab");
      }
    },
    // Swap the two chars left and right of each selection's head.
    // Move cursor behind the two swapped characters afterwards.
    //
    // Doesn't consider line feeds a character.
    // Doesn't scan more than one line above to find a character.
    // Doesn't do anything on an empty line.
    // Doesn't do anything with non-empty selections.
    transposeChars: function transposeChars(cm) {
      return runInOp(cm, function () {
        var ranges = cm.listSelections(),
            newSel = [];

        for (var i = 0; i < ranges.length; i++) {
          if (!ranges[i].empty()) {
            continue;
          }

          var cur = ranges[i].head,
              line = getLine(cm.doc, cur.line).text;

          if (line) {
            if (cur.ch == line.length) {
              cur = new Pos(cur.line, cur.ch - 1);
            }

            if (cur.ch > 0) {
              cur = new Pos(cur.line, cur.ch + 1);
              cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2), Pos(cur.line, cur.ch - 2), cur, "+transpose");
            } else if (cur.line > cm.doc.first) {
              var prev = getLine(cm.doc, cur.line - 1).text;

              if (prev) {
                cur = new Pos(cur.line, 1);
                cm.replaceRange(line.charAt(0) + cm.doc.lineSeparator() + prev.charAt(prev.length - 1), Pos(cur.line - 1, prev.length - 1), cur, "+transpose");
              }
            }
          }

          newSel.push(new Range(cur, cur));
        }

        cm.setSelections(newSel);
      });
    },
    newlineAndIndent: function newlineAndIndent(cm) {
      return runInOp(cm, function () {
        var sels = cm.listSelections();

        for (var i = sels.length - 1; i >= 0; i--) {
          cm.replaceRange(cm.doc.lineSeparator(), sels[i].anchor, sels[i].head, "+input");
        }

        sels = cm.listSelections();

        for (var i$1 = 0; i$1 < sels.length; i$1++) {
          cm.indentLine(sels[i$1].from().line, null, true);
        }

        ensureCursorVisible(cm);
      });
    },
    openLine: function openLine(cm) {
      return cm.replaceSelection("\n", "start");
    },
    toggleOverwrite: function toggleOverwrite(cm) {
      return cm.toggleOverwrite();
    }
  };

  function lineStart(cm, lineN) {
    var line = getLine(cm.doc, lineN);
    var visual = visualLine(line);

    if (visual != line) {
      lineN = lineNo(visual);
    }

    var order = getOrder(visual);
    var ch = !order ? 0 : order[0].level % 2 ? lineRight(visual) : lineLeft(visual);
    return Pos(lineN, ch);
  }

  function lineEnd(cm, lineN) {
    var merged,
        line = getLine(cm.doc, lineN);

    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
      lineN = null;
    }

    var order = getOrder(line);
    var ch = !order ? line.text.length : order[0].level % 2 ? lineLeft(line) : lineRight(line);
    return Pos(lineN == null ? lineNo(line) : lineN, ch);
  }

  function lineStartSmart(cm, pos) {
    var start = lineStart(cm, pos.line);
    var line = getLine(cm.doc, start.line);
    var order = getOrder(line);

    if (!order || order[0].level == 0) {
      var firstNonWS = Math.max(0, line.text.search(/\S/));
      var inWS = pos.line == start.line && pos.ch <= firstNonWS && pos.ch;
      return Pos(start.line, inWS ? 0 : firstNonWS);
    }

    return start;
  } // Run a handler that was bound to a key.


  function doHandleBinding(cm, bound, dropShift) {
    if (typeof bound == "string") {
      bound = commands[bound];

      if (!bound) {
        return false;
      }
    } // Ensure previous input has been read, so that the handler sees a
    // consistent view of the document


    cm.display.input.ensurePolled();
    var prevShift = cm.display.shift,
        done = false;

    try {
      if (cm.isReadOnly()) {
        cm.state.suppressEdits = true;
      }

      if (dropShift) {
        cm.display.shift = false;
      }

      done = bound(cm) != Pass;
    } finally {
      cm.display.shift = prevShift;
      cm.state.suppressEdits = false;
    }

    return done;
  }

  function lookupKeyForEditor(cm, name, handle) {
    for (var i = 0; i < cm.state.keyMaps.length; i++) {
      var result = lookupKey(name, cm.state.keyMaps[i], handle, cm);

      if (result) {
        return result;
      }
    }

    return cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm) || lookupKey(name, cm.options.keyMap, handle, cm);
  }

  var stopSeq = new Delayed();

  function dispatchKey(cm, name, e, handle) {
    var seq = cm.state.keySeq;

    if (seq) {
      if (isModifierKey(name)) {
        return "handled";
      }

      stopSeq.set(50, function () {
        if (cm.state.keySeq == seq) {
          cm.state.keySeq = null;
          cm.display.input.reset();
        }
      });
      name = seq + " " + name;
    }

    var result = lookupKeyForEditor(cm, name, handle);

    if (result == "multi") {
      cm.state.keySeq = name;
    }

    if (result == "handled") {
      signalLater(cm, "keyHandled", cm, name, e);
    }

    if (result == "handled" || result == "multi") {
      e_preventDefault(e);
      restartBlink(cm);
    }

    if (seq && !result && /\'$/.test(name)) {
      e_preventDefault(e);
      return true;
    }

    return !!result;
  } // Handle a key from the keydown event.


  function handleKeyBinding(cm, e) {
    var name = keyName(e, true);

    if (!name) {
      return false;
    }

    if (e.shiftKey && !cm.state.keySeq) {
      // First try to resolve full name (including 'Shift-'). Failing
      // that, see if there is a cursor-motion command (starting with
      // 'go') bound to the keyname without 'Shift-'.
      return dispatchKey(cm, "Shift-" + name, e, function (b) {
        return doHandleBinding(cm, b, true);
      }) || dispatchKey(cm, name, e, function (b) {
        if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion) {
          return doHandleBinding(cm, b);
        }
      });
    } else {
      return dispatchKey(cm, name, e, function (b) {
        return doHandleBinding(cm, b);
      });
    }
  } // Handle a key from the keypress event


  function handleCharBinding(cm, e, ch) {
    return dispatchKey(cm, "'" + ch + "'", e, function (b) {
      return doHandleBinding(cm, b, true);
    });
  }

  var lastStoppedKey = null;

  function onKeyDown(e) {
    var cm = this;
    cm.curOp.focus = activeElt();

    if (signalDOMEvent(cm, e)) {
      return;
    } // IE does strange things with escape.


    if (ie && ie_version < 11 && e.keyCode == 27) {
      e.returnValue = false;
    }

    var code = e.keyCode;
    cm.display.shift = code == 16 || e.shiftKey;
    var handled = handleKeyBinding(cm, e);

    if (presto) {
      lastStoppedKey = handled ? code : null; // Opera has no cut event... we try to at least catch the key combo

      if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey)) {
        cm.replaceSelection("", null, "cut");
      }
    } // Turn mouse into crosshair when Alt is held on Mac.


    if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className)) {
      showCrossHair(cm);
    }
  }

  function showCrossHair(cm) {
    var lineDiv = cm.display.lineDiv;
    addClass(lineDiv, "CodeMirror-crosshair");

    function up(e) {
      if (e.keyCode == 18 || !e.altKey) {
        rmClass(lineDiv, "CodeMirror-crosshair");
        off(document, "keyup", up);
        off(document, "mouseover", up);
      }
    }

    on(document, "keyup", up);
    on(document, "mouseover", up);
  }

  function onKeyUp(e) {
    if (e.keyCode == 16) {
      this.doc.sel.shift = false;
    }

    signalDOMEvent(this, e);
  }

  function onKeyPress(e) {
    var cm = this;

    if (eventInWidget(cm.display, e) || signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey) {
      return;
    }

    var keyCode = e.keyCode,
        charCode = e.charCode;

    if (presto && keyCode == lastStoppedKey) {
      lastStoppedKey = null;
      e_preventDefault(e);
      return;
    }

    if (presto && (!e.which || e.which < 10) && handleKeyBinding(cm, e)) {
      return;
    }

    var ch = String.fromCharCode(charCode == null ? keyCode : charCode); // Some browsers fire keypress events for backspace

    if (ch == "\x08") {
      return;
    }

    if (handleCharBinding(cm, e, ch)) {
      return;
    }

    cm.display.input.onKeyPress(e);
  } // A mouse down can be a single click, double click, triple click,
  // start of selection drag, start of text drag, new cursor
  // (ctrl-click), rectangle drag (alt-drag), or xwin
  // middle-click-paste. Or it might be a click on something we should
  // not interfere with, such as a scrollbar or widget.


  function onMouseDown(e) {
    var cm = this,
        display = cm.display;

    if (signalDOMEvent(cm, e) || display.activeTouch && display.input.supportsTouch()) {
      return;
    }

    display.input.ensurePolled();
    display.shift = e.shiftKey;

    if (eventInWidget(display, e)) {
      if (!webkit) {
        // Briefly turn off draggability, to allow widgets to do
        // normal dragging things.
        display.scroller.draggable = false;
        setTimeout(function () {
          return display.scroller.draggable = true;
        }, 100);
      }

      return;
    }

    if (clickInGutter(cm, e)) {
      return;
    }

    var start = posFromMouse(cm, e);
    window.focus();

    switch (e_button(e)) {
      case 1:
        // #3261: make sure, that we're not starting a second selection
        if (cm.state.selectingText) {
          cm.state.selectingText(e);
        } else if (start) {
          leftButtonDown(cm, e, start);
        } else if (e_target(e) == display.scroller) {
          e_preventDefault(e);
        }

        break;

      case 2:
        if (webkit) {
          cm.state.lastMiddleDown = +new Date();
        }

        if (start) {
          extendSelection(cm.doc, start);
        }

        setTimeout(function () {
          return display.input.focus();
        }, 20);
        e_preventDefault(e);
        break;

      case 3:
        if (captureRightClick) {
          onContextMenu(cm, e);
        } else {
          delayBlurEvent(cm);
        }

        break;
    }
  }

  var lastClick;
  var lastDoubleClick;

  function leftButtonDown(cm, e, start) {
    if (ie) {
      setTimeout(bind(ensureFocus, cm), 0);
    } else {
      cm.curOp.focus = activeElt();
    }

    var now = +new Date(),
        type;

    if (lastDoubleClick && lastDoubleClick.time > now - 400 && cmp(lastDoubleClick.pos, start) == 0) {
      type = "triple";
    } else if (lastClick && lastClick.time > now - 400 && cmp(lastClick.pos, start) == 0) {
      type = "double";
      lastDoubleClick = {
        time: now,
        pos: start
      };
    } else {
      type = "single";
      lastClick = {
        time: now,
        pos: start
      };
    }

    var sel = cm.doc.sel,
        modifier = mac ? e.metaKey : e.ctrlKey,
        contained;

    if (cm.options.dragDrop && dragAndDrop && !cm.isReadOnly() && type == "single" && (contained = sel.contains(start)) > -1 && (cmp((contained = sel.ranges[contained]).from(), start) < 0 || start.xRel > 0) && (cmp(contained.to(), start) > 0 || start.xRel < 0)) {
      leftButtonStartDrag(cm, e, start, modifier);
    } else {
      leftButtonSelect(cm, e, start, type, modifier);
    }
  } // Start a text drag. When it ends, see if any dragging actually
  // happen, and treat as a click if it didn't.


  function leftButtonStartDrag(cm, e, start, modifier) {
    var display = cm.display,
        startTime = +new Date();
    var dragEnd = operation(cm, function (e2) {
      if (webkit) {
        display.scroller.draggable = false;
      }

      cm.state.draggingText = false;
      off(document, "mouseup", dragEnd);
      off(display.scroller, "drop", dragEnd);

      if (Math.abs(e.clientX - e2.clientX) + Math.abs(e.clientY - e2.clientY) < 10) {
        e_preventDefault(e2);

        if (!modifier && +new Date() - 200 < startTime) {
          extendSelection(cm.doc, start);
        } // Work around unexplainable focus problem in IE9 (#2127) and Chrome (#3081)


        if (webkit || ie && ie_version == 9) {
          setTimeout(function () {
            document.body.focus();
            display.input.focus();
          }, 20);
        } else {
          display.input.focus();
        }
      }
    }); // Let the drag handler handle this.

    if (webkit) {
      display.scroller.draggable = true;
    }

    cm.state.draggingText = dragEnd;
    dragEnd.copy = mac ? e.altKey : e.ctrlKey; // IE's approach to draggable

    if (display.scroller.dragDrop) {
      display.scroller.dragDrop();
    }

    on(document, "mouseup", dragEnd);
    on(display.scroller, "drop", dragEnd);
  } // Normal selection, as opposed to text dragging.


  function leftButtonSelect(cm, e, start, type, addNew) {
    var display = cm.display,
        doc = cm.doc;
    e_preventDefault(e);
    var ourRange,
        ourIndex,
        startSel = doc.sel,
        ranges = startSel.ranges;

    if (addNew && !e.shiftKey) {
      ourIndex = doc.sel.contains(start);

      if (ourIndex > -1) {
        ourRange = ranges[ourIndex];
      } else {
        ourRange = new Range(start, start);
      }
    } else {
      ourRange = doc.sel.primary();
      ourIndex = doc.sel.primIndex;
    }

    if (chromeOS ? e.shiftKey && e.metaKey : e.altKey) {
      type = "rect";

      if (!addNew) {
        ourRange = new Range(start, start);
      }

      start = posFromMouse(cm, e, true, true);
      ourIndex = -1;
    } else if (type == "double") {
      var word = cm.findWordAt(start);

      if (cm.display.shift || doc.extend) {
        ourRange = extendRange(doc, ourRange, word.anchor, word.head);
      } else {
        ourRange = word;
      }
    } else if (type == "triple") {
      var line = new Range(Pos(start.line, 0), _clipPos(doc, Pos(start.line + 1, 0)));

      if (cm.display.shift || doc.extend) {
        ourRange = extendRange(doc, ourRange, line.anchor, line.head);
      } else {
        ourRange = line;
      }
    } else {
      ourRange = extendRange(doc, ourRange, start);
    }

    if (!addNew) {
      ourIndex = 0;
      setSelection(doc, new Selection([ourRange], 0), sel_mouse);
      startSel = doc.sel;
    } else if (ourIndex == -1) {
      ourIndex = ranges.length;
      setSelection(doc, normalizeSelection(ranges.concat([ourRange]), ourIndex), {
        scroll: false,
        origin: "*mouse"
      });
    } else if (ranges.length > 1 && ranges[ourIndex].empty() && type == "single" && !e.shiftKey) {
      setSelection(doc, normalizeSelection(ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0), {
        scroll: false,
        origin: "*mouse"
      });
      startSel = doc.sel;
    } else {
      replaceOneSelection(doc, ourIndex, ourRange, sel_mouse);
    }

    var lastPos = start;

    function extendTo(pos) {
      if (cmp(lastPos, pos) == 0) {
        return;
      }

      lastPos = pos;

      if (type == "rect") {
        var ranges = [],
            tabSize = cm.options.tabSize;
        var startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize);
        var posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize);
        var left = Math.min(startCol, posCol),
            right = Math.max(startCol, posCol);

        for (var line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line)); line <= end; line++) {
          var text = getLine(doc, line).text,
              leftPos = findColumn(text, left, tabSize);

          if (left == right) {
            ranges.push(new Range(Pos(line, leftPos), Pos(line, leftPos)));
          } else if (text.length > leftPos) {
            ranges.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize))));
          }
        }

        if (!ranges.length) {
          ranges.push(new Range(start, start));
        }

        setSelection(doc, normalizeSelection(startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex), {
          origin: "*mouse",
          scroll: false
        });
        cm.scrollIntoView(pos);
      } else {
        var oldRange = ourRange;
        var anchor = oldRange.anchor,
            head = pos;

        if (type != "single") {
          var range;

          if (type == "double") {
            range = cm.findWordAt(pos);
          } else {
            range = new Range(Pos(pos.line, 0), _clipPos(doc, Pos(pos.line + 1, 0)));
          }

          if (cmp(range.anchor, anchor) > 0) {
            head = range.head;
            anchor = minPos(oldRange.from(), range.anchor);
          } else {
            head = range.anchor;
            anchor = maxPos(oldRange.to(), range.head);
          }
        }

        var ranges$1 = startSel.ranges.slice(0);
        ranges$1[ourIndex] = new Range(_clipPos(doc, anchor), head);
        setSelection(doc, normalizeSelection(ranges$1, ourIndex), sel_mouse);
      }
    }

    var editorSize = display.wrapper.getBoundingClientRect(); // Used to ensure timeout re-tries don't fire when another extend
    // happened in the meantime (clearTimeout isn't reliable -- at
    // least on Chrome, the timeouts still happen even when cleared,
    // if the clear happens after their scheduled firing time).

    var counter = 0;

    function extend(e) {
      var curCount = ++counter;
      var cur = posFromMouse(cm, e, true, type == "rect");

      if (!cur) {
        return;
      }

      if (cmp(cur, lastPos) != 0) {
        cm.curOp.focus = activeElt();
        extendTo(cur);
        var visible = visibleLines(display, doc);

        if (cur.line >= visible.to || cur.line < visible.from) {
          setTimeout(operation(cm, function () {
            if (counter == curCount) {
              extend(e);
            }
          }), 150);
        }
      } else {
        var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;

        if (outside) {
          setTimeout(operation(cm, function () {
            if (counter != curCount) {
              return;
            }

            display.scroller.scrollTop += outside;
            extend(e);
          }), 50);
        }
      }
    }

    function done(e) {
      cm.state.selectingText = false;
      counter = Infinity;
      e_preventDefault(e);
      display.input.focus();
      off(document, "mousemove", move);
      off(document, "mouseup", up);
      doc.history.lastSelOrigin = null;
    }

    var move = operation(cm, function (e) {
      if (!e_button(e)) {
        done(e);
      } else {
        extend(e);
      }
    });
    var up = operation(cm, done);
    cm.state.selectingText = up;
    on(document, "mousemove", move);
    on(document, "mouseup", up);
  } // Determines whether an event happened in the gutter, and fires the
  // handlers for the corresponding event.


  function gutterEvent(cm, e, type, prevent) {
    var mX, mY;

    try {
      mX = e.clientX;
      mY = e.clientY;
    } catch (e) {
      return false;
    }

    if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) {
      return false;
    }

    if (prevent) {
      e_preventDefault(e);
    }

    var display = cm.display;
    var lineBox = display.lineDiv.getBoundingClientRect();

    if (mY > lineBox.bottom || !hasHandler(cm, type)) {
      return e_defaultPrevented(e);
    }

    mY -= lineBox.top - display.viewOffset;

    for (var i = 0; i < cm.options.gutters.length; ++i) {
      var g = display.gutters.childNodes[i];

      if (g && g.getBoundingClientRect().right >= mX) {
        var line = _lineAtHeight(cm.doc, mY);

        var gutter = cm.options.gutters[i];
        signal(cm, type, cm, line, gutter, e);
        return e_defaultPrevented(e);
      }
    }
  }

  function clickInGutter(cm, e) {
    return gutterEvent(cm, e, "gutterClick", true);
  } // CONTEXT MENU HANDLING
  // To make the context menu work, we need to briefly unhide the
  // textarea (making it as unobtrusive as possible) to let the
  // right-click take effect on it.


  function onContextMenu(cm, e) {
    if (eventInWidget(cm.display, e) || contextMenuInGutter(cm, e)) {
      return;
    }

    if (signalDOMEvent(cm, e, "contextmenu")) {
      return;
    }

    cm.display.input.onContextMenu(e);
  }

  function contextMenuInGutter(cm, e) {
    if (!hasHandler(cm, "gutterContextMenu")) {
      return false;
    }

    return gutterEvent(cm, e, "gutterContextMenu", false);
  }

  function themeChanged(cm) {
    cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") + cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
    clearCaches(cm);
  }

  var Init = {
    toString: function toString() {
      return "CodeMirror.Init";
    }
  };
  var defaults = {};
  var optionHandlers = {};

  function defineOptions(CodeMirror) {
    var optionHandlers = CodeMirror.optionHandlers;

    function option(name, deflt, handle, notOnInit) {
      CodeMirror.defaults[name] = deflt;

      if (handle) {
        optionHandlers[name] = notOnInit ? function (cm, val, old) {
          if (old != Init) {
            handle(cm, val, old);
          }
        } : handle;
      }
    }

    CodeMirror.defineOption = option; // Passed to option handlers when there is no old value.

    CodeMirror.Init = Init; // These two are, on init, called from the constructor because they
    // have to be initialized before the editor can start at all.

    option("value", "", function (cm, val) {
      return cm.setValue(val);
    }, true);
    option("mode", null, function (cm, val) {
      cm.doc.modeOption = val;
      loadMode(cm);
    }, true);
    option("indentUnit", 2, loadMode, true);
    option("indentWithTabs", false);
    option("smartIndent", true);
    option("tabSize", 4, function (cm) {
      resetModeState(cm);
      clearCaches(cm);
      regChange(cm);
    }, true);
    option("lineSeparator", null, function (cm, val) {
      cm.doc.lineSep = val;

      if (!val) {
        return;
      }

      var newBreaks = [],
          lineNo = cm.doc.first;
      cm.doc.iter(function (line) {
        for (var pos = 0;;) {
          var found = line.text.indexOf(val, pos);

          if (found == -1) {
            break;
          }

          pos = found + val.length;
          newBreaks.push(Pos(lineNo, found));
        }

        lineNo++;
      });

      for (var i = newBreaks.length - 1; i >= 0; i--) {
        _replaceRange(cm.doc, val, newBreaks[i], Pos(newBreaks[i].line, newBreaks[i].ch + val.length));
      }
    });
    option("specialChars", /[\u0000-\u001f\u007f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff]/g, function (cm, val, old) {
      cm.state.specialChars = new RegExp(val.source + (val.test("\t") ? "" : "|\t"), "g");

      if (old != Init) {
        cm.refresh();
      }
    });
    option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function (cm) {
      return cm.refresh();
    }, true);
    option("electricChars", true);
    option("inputStyle", mobile ? "contenteditable" : "textarea", function () {
      throw new Error("inputStyle can not (yet) be changed in a running editor"); // FIXME
    }, true);
    option("spellcheck", false, function (cm, val) {
      return cm.getInputField().spellcheck = val;
    }, true);
    option("rtlMoveVisually", !windows);
    option("wholeLineUpdateBefore", true);
    option("theme", "default", function (cm) {
      themeChanged(cm);
      guttersChanged(cm);
    }, true);
    option("keyMap", "default", function (cm, val, old) {
      var next = getKeyMap(val);
      var prev = old != Init && getKeyMap(old);

      if (prev && prev.detach) {
        prev.detach(cm, next);
      }

      if (next.attach) {
        next.attach(cm, prev || null);
      }
    });
    option("extraKeys", null);
    option("lineWrapping", false, wrappingChanged, true);
    option("gutters", [], function (cm) {
      setGuttersForLineNumbers(cm.options);
      guttersChanged(cm);
    }, true);
    option("fixedGutter", true, function (cm, val) {
      cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0";
      cm.refresh();
    }, true);
    option("coverGutterNextToScrollbar", false, function (cm) {
      return updateScrollbars(cm);
    }, true);
    option("scrollbarStyle", "native", function (cm) {
      initScrollbars(cm);
      updateScrollbars(cm);
      cm.display.scrollbars.setScrollTop(cm.doc.scrollTop);
      cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft);
    }, true);
    option("lineNumbers", false, function (cm) {
      setGuttersForLineNumbers(cm.options);
      guttersChanged(cm);
    }, true);
    option("firstLineNumber", 1, guttersChanged, true);
    option("lineNumberFormatter", function (integer) {
      return integer;
    }, guttersChanged, true);
    option("showCursorWhenSelecting", false, updateSelection, true);
    option("resetSelectionOnContextMenu", true);
    option("lineWiseCopyCut", true);
    option("readOnly", false, function (cm, val) {
      if (val == "nocursor") {
        onBlur(cm);
        cm.display.input.blur();
        cm.display.disabled = true;
      } else {
        cm.display.disabled = false;
      }

      cm.display.input.readOnlyChanged(val);
    });
    option("disableInput", false, function (cm, val) {
      if (!val) {
        cm.display.input.reset();
      }
    }, true);
    option("dragDrop", true, dragDropChanged);
    option("allowDropFileTypes", null);
    option("cursorBlinkRate", 530);
    option("cursorScrollMargin", 0);
    option("cursorHeight", 1, updateSelection, true);
    option("singleCursorHeightPerLine", true, updateSelection, true);
    option("workTime", 100);
    option("workDelay", 100);
    option("flattenSpans", true, resetModeState, true);
    option("addModeClass", false, resetModeState, true);
    option("pollInterval", 100);
    option("undoDepth", 200, function (cm, val) {
      return cm.doc.history.undoDepth = val;
    });
    option("historyEventDelay", 1250);
    option("viewportMargin", 10, function (cm) {
      return cm.refresh();
    }, true);
    option("maxHighlightLength", 10000, resetModeState, true);
    option("moveInputWithCursor", true, function (cm, val) {
      if (!val) {
        cm.display.input.resetPosition();
      }
    });
    option("tabindex", null, function (cm, val) {
      return cm.display.input.getField().tabIndex = val || "";
    });
    option("autofocus", null);
  }

  function guttersChanged(cm) {
    updateGutters(cm);
    regChange(cm);
    alignHorizontally(cm);
  }

  function dragDropChanged(cm, value, old) {
    var wasOn = old && old != Init;

    if (!value != !wasOn) {
      var funcs = cm.display.dragFunctions;
      var toggle = value ? on : off;
      toggle(cm.display.scroller, "dragstart", funcs.start);
      toggle(cm.display.scroller, "dragenter", funcs.enter);
      toggle(cm.display.scroller, "dragover", funcs.over);
      toggle(cm.display.scroller, "dragleave", funcs.leave);
      toggle(cm.display.scroller, "drop", funcs.drop);
    }
  }

  function wrappingChanged(cm) {
    if (cm.options.lineWrapping) {
      addClass(cm.display.wrapper, "CodeMirror-wrap");
      cm.display.sizer.style.minWidth = "";
      cm.display.sizerWidth = null;
    } else {
      rmClass(cm.display.wrapper, "CodeMirror-wrap");
      findMaxLine(cm);
    }

    estimateLineHeights(cm);
    regChange(cm);
    clearCaches(cm);
    setTimeout(function () {
      return updateScrollbars(cm);
    }, 100);
  } // A CodeMirror instance represents an editor. This is the object
  // that user code is usually dealing with.


  function CodeMirror(place, options) {
    var this$1 = this;

    if (!(this instanceof CodeMirror)) {
      return new CodeMirror(place, options);
    }

    this.options = options = options ? copyObj(options) : {}; // Determine effective options based on given values and defaults.

    copyObj(defaults, options, false);
    setGuttersForLineNumbers(options);
    var doc = options.value;

    if (typeof doc == "string") {
      doc = new Doc(doc, options.mode, null, options.lineSeparator);
    }

    this.doc = doc;
    var input = new CodeMirror.inputStyles[options.inputStyle](this);
    var display = this.display = new Display(place, doc, input);
    display.wrapper.CodeMirror = this;
    updateGutters(this);
    themeChanged(this);

    if (options.lineWrapping) {
      this.display.wrapper.className += " CodeMirror-wrap";
    }

    initScrollbars(this);
    this.state = {
      keyMaps: [],
      // stores maps added by addKeyMap
      overlays: [],
      // highlighting overlays, as added by addOverlay
      modeGen: 0,
      // bumped when mode/overlay changes, used to invalidate highlighting info
      overwrite: false,
      delayingBlurEvent: false,
      focused: false,
      suppressEdits: false,
      // used to disable editing during key handlers when in readOnly mode
      pasteIncoming: false,
      cutIncoming: false,
      // help recognize paste/cut edits in input.poll
      selectingText: false,
      draggingText: false,
      highlight: new Delayed(),
      // stores highlight worker timeout
      keySeq: null,
      // Unfinished key sequence
      specialChars: null
    };

    if (options.autofocus && !mobile) {
      display.input.focus();
    } // Override magic textarea content restore that IE sometimes does
    // on our hidden textarea on reload


    if (ie && ie_version < 11) {
      setTimeout(function () {
        return this$1.display.input.reset(true);
      }, 20);
    }

    registerEventHandlers(this);
    ensureGlobalHandlers();
    startOperation(this);
    this.curOp.forceUpdate = true;
    attachDoc(this, doc);

    if (options.autofocus && !mobile || this.hasFocus()) {
      setTimeout(bind(onFocus, this), 20);
    } else {
      onBlur(this);
    }

    for (var opt in optionHandlers) {
      if (optionHandlers.hasOwnProperty(opt)) {
        optionHandlers[opt](this$1, options[opt], Init);
      }
    }

    maybeUpdateLineNumberWidth(this);

    if (options.finishInit) {
      options.finishInit(this);
    }

    for (var i = 0; i < initHooks.length; ++i) {
      initHooks[i](this$1);
    }

    endOperation(this); // Suppress optimizelegibility in Webkit, since it breaks text
    // measuring on line wrapping boundaries.

    if (webkit && options.lineWrapping && getComputedStyle(display.lineDiv).textRendering == "optimizelegibility") {
      display.lineDiv.style.textRendering = "auto";
    }
  } // The default configuration options.


  CodeMirror.defaults = defaults; // Functions to run when options are changed.

  CodeMirror.optionHandlers = optionHandlers; // Attach the necessary event handlers when initializing the editor

  function registerEventHandlers(cm) {
    var d = cm.display;
    on(d.scroller, "mousedown", operation(cm, onMouseDown)); // Older IE's will not fire a second mousedown for a double click

    if (ie && ie_version < 11) {
      on(d.scroller, "dblclick", operation(cm, function (e) {
        if (signalDOMEvent(cm, e)) {
          return;
        }

        var pos = posFromMouse(cm, e);

        if (!pos || clickInGutter(cm, e) || eventInWidget(cm.display, e)) {
          return;
        }

        e_preventDefault(e);
        var word = cm.findWordAt(pos);
        extendSelection(cm.doc, word.anchor, word.head);
      }));
    } else {
      on(d.scroller, "dblclick", function (e) {
        return signalDOMEvent(cm, e) || e_preventDefault(e);
      });
    } // Some browsers fire contextmenu *after* opening the menu, at
    // which point we can't mess with it anymore. Context menu is
    // handled in onMouseDown for these browsers.


    if (!captureRightClick) {
      on(d.scroller, "contextmenu", function (e) {
        return onContextMenu(cm, e);
      });
    } // Used to suppress mouse event handling when a touch happens


    var touchFinished,
        prevTouch = {
      end: 0
    };

    function finishTouch() {
      if (d.activeTouch) {
        touchFinished = setTimeout(function () {
          return d.activeTouch = null;
        }, 1000);
        prevTouch = d.activeTouch;
        prevTouch.end = +new Date();
      }
    }

    function isMouseLikeTouchEvent(e) {
      if (e.touches.length != 1) {
        return false;
      }

      var touch = e.touches[0];
      return touch.radiusX <= 1 && touch.radiusY <= 1;
    }

    function farAway(touch, other) {
      if (other.left == null) {
        return true;
      }

      var dx = other.left - touch.left,
          dy = other.top - touch.top;
      return dx * dx + dy * dy > 20 * 20;
    }

    on(d.scroller, "touchstart", function (e) {
      if (!signalDOMEvent(cm, e) && !isMouseLikeTouchEvent(e)) {
        d.input.ensurePolled();
        clearTimeout(touchFinished);
        var now = +new Date();
        d.activeTouch = {
          start: now,
          moved: false,
          prev: now - prevTouch.end <= 300 ? prevTouch : null
        };

        if (e.touches.length == 1) {
          d.activeTouch.left = e.touches[0].pageX;
          d.activeTouch.top = e.touches[0].pageY;
        }
      }
    });
    on(d.scroller, "touchmove", function () {
      if (d.activeTouch) {
        d.activeTouch.moved = true;
      }
    });
    on(d.scroller, "touchend", function (e) {
      var touch = d.activeTouch;

      if (touch && !eventInWidget(d, e) && touch.left != null && !touch.moved && new Date() - touch.start < 300) {
        var pos = cm.coordsChar(d.activeTouch, "page"),
            range;

        if (!touch.prev || farAway(touch, touch.prev)) // Single tap
          {
            range = new Range(pos, pos);
          } else if (!touch.prev.prev || farAway(touch, touch.prev.prev)) // Double tap
          {
            range = cm.findWordAt(pos);
          } else // Triple tap
          {
            range = new Range(Pos(pos.line, 0), _clipPos(cm.doc, Pos(pos.line + 1, 0)));
          }

        cm.setSelection(range.anchor, range.head);
        cm.focus();
        e_preventDefault(e);
      }

      finishTouch();
    });
    on(d.scroller, "touchcancel", finishTouch); // Sync scrolling between fake scrollbars and real scrollable
    // area, ensure viewport is updated when scrolling.

    on(d.scroller, "scroll", function () {
      if (d.scroller.clientHeight) {
        setScrollTop(cm, d.scroller.scrollTop);
        setScrollLeft(cm, d.scroller.scrollLeft, true);
        signal(cm, "scroll", cm);
      }
    }); // Listen to wheel events in order to try and update the viewport on time.

    on(d.scroller, "mousewheel", function (e) {
      return onScrollWheel(cm, e);
    });
    on(d.scroller, "DOMMouseScroll", function (e) {
      return onScrollWheel(cm, e);
    }); // Prevent wrapper from ever scrolling

    on(d.wrapper, "scroll", function () {
      return d.wrapper.scrollTop = d.wrapper.scrollLeft = 0;
    });
    d.dragFunctions = {
      enter: function enter(e) {
        if (!signalDOMEvent(cm, e)) {
          e_stop(e);
        }
      },
      over: function over(e) {
        if (!signalDOMEvent(cm, e)) {
          onDragOver(cm, e);
          e_stop(e);
        }
      },
      start: function start(e) {
        return onDragStart(cm, e);
      },
      drop: operation(cm, onDrop),
      leave: function leave(e) {
        if (!signalDOMEvent(cm, e)) {
          clearDragCursor(cm);
        }
      }
    };
    var inp = d.input.getField();
    on(inp, "keyup", function (e) {
      return onKeyUp.call(cm, e);
    });
    on(inp, "keydown", operation(cm, onKeyDown));
    on(inp, "keypress", operation(cm, onKeyPress));
    on(inp, "focus", function (e) {
      return onFocus(cm, e);
    });
    on(inp, "blur", function (e) {
      return onBlur(cm, e);
    });
  }

  var initHooks = [];

  CodeMirror.defineInitHook = function (f) {
    return initHooks.push(f);
  }; // Indent the given line. The how parameter can be "smart",
  // "add"/null, "subtract", or "prev". When aggressive is false
  // (typically set to true for forced single-line indents), empty
  // lines are not indented, and places where the mode returns Pass
  // are left alone.


  function indentLine(cm, n, how, aggressive) {
    var doc = cm.doc,
        state;

    if (how == null) {
      how = "add";
    }

    if (how == "smart") {
      // Fall back to "prev" when the mode doesn't have an indentation
      // method.
      if (!doc.mode.indent) {
        how = "prev";
      } else {
        state = getStateBefore(cm, n);
      }
    }

    var tabSize = cm.options.tabSize;
    var line = getLine(doc, n),
        curSpace = countColumn(line.text, null, tabSize);

    if (line.stateAfter) {
      line.stateAfter = null;
    }

    var curSpaceString = line.text.match(/^\s*/)[0],
        indentation;

    if (!aggressive && !/\S/.test(line.text)) {
      indentation = 0;
      how = "not";
    } else if (how == "smart") {
      indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text);

      if (indentation == Pass || indentation > 150) {
        if (!aggressive) {
          return;
        }

        how = "prev";
      }
    }

    if (how == "prev") {
      if (n > doc.first) {
        indentation = countColumn(getLine(doc, n - 1).text, null, tabSize);
      } else {
        indentation = 0;
      }
    } else if (how == "add") {
      indentation = curSpace + cm.options.indentUnit;
    } else if (how == "subtract") {
      indentation = curSpace - cm.options.indentUnit;
    } else if (typeof how == "number") {
      indentation = curSpace + how;
    }

    indentation = Math.max(0, indentation);
    var indentString = "",
        pos = 0;

    if (cm.options.indentWithTabs) {
      for (var i = Math.floor(indentation / tabSize); i; --i) {
        pos += tabSize;
        indentString += "\t";
      }
    }

    if (pos < indentation) {
      indentString += spaceStr(indentation - pos);
    }

    if (indentString != curSpaceString) {
      _replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input");

      line.stateAfter = null;
      return true;
    } else {
      // Ensure that, if the cursor was in the whitespace at the start
      // of the line, it is moved to the end of that space.
      for (var i$1 = 0; i$1 < doc.sel.ranges.length; i$1++) {
        var range = doc.sel.ranges[i$1];

        if (range.head.line == n && range.head.ch < curSpaceString.length) {
          var pos$1 = Pos(n, curSpaceString.length);
          replaceOneSelection(doc, i$1, new Range(pos$1, pos$1));
          break;
        }
      }
    }
  } // This will be set to a {lineWise: bool, text: [string]} object, so
  // that, when pasting, we know what kind of selections the copied
  // text was made out of.


  var lastCopied = null;

  function setLastCopied(newLastCopied) {
    lastCopied = newLastCopied;
  }

  function applyTextInput(cm, inserted, deleted, sel, origin) {
    var doc = cm.doc;
    cm.display.shift = false;

    if (!sel) {
      sel = doc.sel;
    }

    var paste = cm.state.pasteIncoming || origin == "paste";
    var textLines = splitLinesAuto(inserted),
        multiPaste = null; // When pasing N lines into N selections, insert one line per selection

    if (paste && sel.ranges.length > 1) {
      if (lastCopied && lastCopied.text.join("\n") == inserted) {
        if (sel.ranges.length % lastCopied.text.length == 0) {
          multiPaste = [];

          for (var i = 0; i < lastCopied.text.length; i++) {
            multiPaste.push(doc.splitLines(lastCopied.text[i]));
          }
        }
      } else if (textLines.length == sel.ranges.length) {
        multiPaste = map(textLines, function (l) {
          return [l];
        });
      }
    }

    var updateInput; // Normal behavior is to insert the new text into every selection

    for (var i$1 = sel.ranges.length - 1; i$1 >= 0; i$1--) {
      var range = sel.ranges[i$1];
      var from = range.from(),
          to = range.to();

      if (range.empty()) {
        if (deleted && deleted > 0) // Handle deletion
          {
            from = Pos(from.line, from.ch - deleted);
          } else if (cm.state.overwrite && !paste) // Handle overwrite
          {
            to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length));
          } else if (lastCopied && lastCopied.lineWise && lastCopied.text.join("\n") == inserted) {
          from = to = Pos(from.line, 0);
        }
      }

      updateInput = cm.curOp.updateInput;
      var changeEvent = {
        from: from,
        to: to,
        text: multiPaste ? multiPaste[i$1 % multiPaste.length] : textLines,
        origin: origin || (paste ? "paste" : cm.state.cutIncoming ? "cut" : "+input")
      };
      makeChange(cm.doc, changeEvent);
      signalLater(cm, "inputRead", cm, changeEvent);
    }

    if (inserted && !paste) {
      triggerElectric(cm, inserted);
    }

    ensureCursorVisible(cm);
    cm.curOp.updateInput = updateInput;
    cm.curOp.typing = true;
    cm.state.pasteIncoming = cm.state.cutIncoming = false;
  }

  function handlePaste(e, cm) {
    var pasted = e.clipboardData && e.clipboardData.getData("Text");

    if (pasted) {
      e.preventDefault();

      if (!cm.isReadOnly() && !cm.options.disableInput) {
        runInOp(cm, function () {
          return applyTextInput(cm, pasted, 0, null, "paste");
        });
      }

      return true;
    }
  }

  function triggerElectric(cm, inserted) {
    // When an 'electric' character is inserted, immediately trigger a reindent
    if (!cm.options.electricChars || !cm.options.smartIndent) {
      return;
    }

    var sel = cm.doc.sel;

    for (var i = sel.ranges.length - 1; i >= 0; i--) {
      var range = sel.ranges[i];

      if (range.head.ch > 100 || i && sel.ranges[i - 1].head.line == range.head.line) {
        continue;
      }

      var mode = cm.getModeAt(range.head);
      var indented = false;

      if (mode.electricChars) {
        for (var j = 0; j < mode.electricChars.length; j++) {
          if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
            indented = indentLine(cm, range.head.line, "smart");
            break;
          }
        }
      } else if (mode.electricInput) {
        if (mode.electricInput.test(getLine(cm.doc, range.head.line).text.slice(0, range.head.ch))) {
          indented = indentLine(cm, range.head.line, "smart");
        }
      }

      if (indented) {
        signalLater(cm, "electricInput", cm, range.head.line);
      }
    }
  }

  function copyableRanges(cm) {
    var text = [],
        ranges = [];

    for (var i = 0; i < cm.doc.sel.ranges.length; i++) {
      var line = cm.doc.sel.ranges[i].head.line;
      var lineRange = {
        anchor: Pos(line, 0),
        head: Pos(line + 1, 0)
      };
      ranges.push(lineRange);
      text.push(cm.getRange(lineRange.anchor, lineRange.head));
    }

    return {
      text: text,
      ranges: ranges
    };
  }

  function disableBrowserMagic(field, spellcheck) {
    field.setAttribute("autocorrect", "off");
    field.setAttribute("autocapitalize", "off");
    field.setAttribute("spellcheck", !!spellcheck);
  }

  function hiddenTextarea() {
    var te = elt("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none");
    var div = elt("div", [te], null, "overflow: hidden; position: relative; width: 3px; height: 0px;"); // The textarea is kept positioned near the cursor to prevent the
    // fact that it'll be scrolled into view on input from scrolling
    // our fake cursor out of view. On webkit, when wrap=off, paste is
    // very slow. So make the area wide instead.

    if (webkit) {
      te.style.width = "1000px";
    } else {
      te.setAttribute("wrap", "off");
    } // If border: 0; -- iOS fails to open keyboard (issue #1287)


    if (ios) {
      te.style.border = "1px solid black";
    }

    disableBrowserMagic(te);
    return div;
  } // The publicly visible API. Note that methodOp(f) means
  // 'wrap f in an operation, performed on its `this` parameter'.
  // This is not the complete set of editor methods. Most of the
  // methods defined on the Doc type are also injected into
  // CodeMirror.prototype, for backwards compatibility and
  // convenience.


  function addEditorMethods(CodeMirror) {
    var optionHandlers = CodeMirror.optionHandlers;
    var helpers = CodeMirror.helpers = {};
    CodeMirror.prototype = {
      constructor: CodeMirror,
      focus: function focus() {
        window.focus();
        this.display.input.focus();
      },
      setOption: function setOption(option, value) {
        var options = this.options,
            old = options[option];

        if (options[option] == value && option != "mode") {
          return;
        }

        options[option] = value;

        if (optionHandlers.hasOwnProperty(option)) {
          operation(this, optionHandlers[option])(this, value, old);
        }

        signal(this, "optionChange", this, option);
      },
      getOption: function getOption(option) {
        return this.options[option];
      },
      getDoc: function getDoc() {
        return this.doc;
      },
      addKeyMap: function addKeyMap(map, bottom) {
        this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map));
      },
      removeKeyMap: function removeKeyMap(map) {
        var maps = this.state.keyMaps;

        for (var i = 0; i < maps.length; ++i) {
          if (maps[i] == map || maps[i].name == map) {
            maps.splice(i, 1);
            return true;
          }
        }
      },
      addOverlay: methodOp(function (spec, options) {
        var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec);

        if (mode.startState) {
          throw new Error("Overlays may not be stateful.");
        }

        insertSorted(this.state.overlays, {
          mode: mode,
          modeSpec: spec,
          opaque: options && options.opaque,
          priority: options && options.priority || 0
        }, function (overlay) {
          return overlay.priority;
        });
        this.state.modeGen++;
        regChange(this);
      }),
      removeOverlay: methodOp(function (spec) {
        var this$1 = this;
        var overlays = this.state.overlays;

        for (var i = 0; i < overlays.length; ++i) {
          var cur = overlays[i].modeSpec;

          if (cur == spec || typeof spec == "string" && cur.name == spec) {
            overlays.splice(i, 1);
            this$1.state.modeGen++;
            regChange(this$1);
            return;
          }
        }
      }),
      indentLine: methodOp(function (n, dir, aggressive) {
        if (typeof dir != "string" && typeof dir != "number") {
          if (dir == null) {
            dir = this.options.smartIndent ? "smart" : "prev";
          } else {
            dir = dir ? "add" : "subtract";
          }
        }

        if (isLine(this.doc, n)) {
          indentLine(this, n, dir, aggressive);
        }
      }),
      indentSelection: methodOp(function (how) {
        var this$1 = this;
        var ranges = this.doc.sel.ranges,
            end = -1;

        for (var i = 0; i < ranges.length; i++) {
          var range = ranges[i];

          if (!range.empty()) {
            var from = range.from(),
                to = range.to();
            var start = Math.max(end, from.line);
            end = Math.min(this$1.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;

            for (var j = start; j < end; ++j) {
              indentLine(this$1, j, how);
            }

            var newRanges = this$1.doc.sel.ranges;

            if (from.ch == 0 && ranges.length == newRanges.length && newRanges[i].from().ch > 0) {
              replaceOneSelection(this$1.doc, i, new Range(from, newRanges[i].to()), sel_dontScroll);
            }
          } else if (range.head.line > end) {
            indentLine(this$1, range.head.line, how, true);
            end = range.head.line;

            if (i == this$1.doc.sel.primIndex) {
              ensureCursorVisible(this$1);
            }
          }
        }
      }),
      // Fetch the parser token for a given character. Useful for hacks
      // that want to inspect the mode state (say, for completion).
      getTokenAt: function getTokenAt(pos, precise) {
        return takeToken(this, pos, precise);
      },
      getLineTokens: function getLineTokens(line, precise) {
        return takeToken(this, Pos(line), precise, true);
      },
      getTokenTypeAt: function getTokenTypeAt(pos) {
        pos = _clipPos(this.doc, pos);
        var styles = getLineStyles(this, getLine(this.doc, pos.line));
        var before = 0,
            after = (styles.length - 1) / 2,
            ch = pos.ch;
        var type;

        if (ch == 0) {
          type = styles[2];
        } else {
          for (;;) {
            var mid = before + after >> 1;

            if ((mid ? styles[mid * 2 - 1] : 0) >= ch) {
              after = mid;
            } else if (styles[mid * 2 + 1] < ch) {
              before = mid + 1;
            } else {
              type = styles[mid * 2 + 2];
              break;
            }
          }
        }

        var cut = type ? type.indexOf("overlay ") : -1;
        return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1);
      },
      getModeAt: function getModeAt(pos) {
        var mode = this.doc.mode;

        if (!mode.innerMode) {
          return mode;
        }

        return CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode;
      },
      getHelper: function getHelper(pos, type) {
        return this.getHelpers(pos, type)[0];
      },
      getHelpers: function getHelpers(pos, type) {
        var this$1 = this;
        var found = [];

        if (!helpers.hasOwnProperty(type)) {
          return found;
        }

        var help = helpers[type],
            mode = this.getModeAt(pos);

        if (typeof mode[type] == "string") {
          if (help[mode[type]]) {
            found.push(help[mode[type]]);
          }
        } else if (mode[type]) {
          for (var i = 0; i < mode[type].length; i++) {
            var val = help[mode[type][i]];

            if (val) {
              found.push(val);
            }
          }
        } else if (mode.helperType && help[mode.helperType]) {
          found.push(help[mode.helperType]);
        } else if (help[mode.name]) {
          found.push(help[mode.name]);
        }

        for (var i$1 = 0; i$1 < help._global.length; i$1++) {
          var cur = help._global[i$1];

          if (cur.pred(mode, this$1) && indexOf(found, cur.val) == -1) {
            found.push(cur.val);
          }
        }

        return found;
      },
      getStateAfter: function getStateAfter(line, precise) {
        var doc = this.doc;
        line = clipLine(doc, line == null ? doc.first + doc.size - 1 : line);
        return getStateBefore(this, line + 1, precise);
      },
      cursorCoords: function cursorCoords(start, mode) {
        var pos,
            range = this.doc.sel.primary();

        if (start == null) {
          pos = range.head;
        } else if (_typeof(start) == "object") {
          pos = _clipPos(this.doc, start);
        } else {
          pos = start ? range.from() : range.to();
        }

        return _cursorCoords(this, pos, mode || "page");
      },
      charCoords: function charCoords(pos, mode) {
        return _charCoords(this, _clipPos(this.doc, pos), mode || "page");
      },
      coordsChar: function coordsChar(coords, mode) {
        coords = fromCoordSystem(this, coords, mode || "page");
        return _coordsChar(this, coords.left, coords.top);
      },
      lineAtHeight: function lineAtHeight(height, mode) {
        height = fromCoordSystem(this, {
          top: height,
          left: 0
        }, mode || "page").top;
        return _lineAtHeight(this.doc, height + this.display.viewOffset);
      },
      heightAtLine: function heightAtLine(line, mode, includeWidgets) {
        var end = false,
            lineObj;

        if (typeof line == "number") {
          var last = this.doc.first + this.doc.size - 1;

          if (line < this.doc.first) {
            line = this.doc.first;
          } else if (line > last) {
            line = last;
            end = true;
          }

          lineObj = getLine(this.doc, line);
        } else {
          lineObj = line;
        }

        return intoCoordSystem(this, lineObj, {
          top: 0,
          left: 0
        }, mode || "page", includeWidgets).top + (end ? this.doc.height - _heightAtLine(lineObj) : 0);
      },
      defaultTextHeight: function defaultTextHeight() {
        return textHeight(this.display);
      },
      defaultCharWidth: function defaultCharWidth() {
        return charWidth(this.display);
      },
      getViewport: function getViewport() {
        return {
          from: this.display.viewFrom,
          to: this.display.viewTo
        };
      },
      addWidget: function addWidget(pos, node, scroll, vert, horiz) {
        var display = this.display;
        pos = _cursorCoords(this, _clipPos(this.doc, pos));
        var top = pos.bottom,
            left = pos.left;
        node.style.position = "absolute";
        node.setAttribute("cm-ignore-events", "true");
        this.display.input.setUneditable(node);
        display.sizer.appendChild(node);

        if (vert == "over") {
          top = pos.top;
        } else if (vert == "above" || vert == "near") {
          var vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
              hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth); // Default to positioning above (if specified and possible); otherwise default to positioning below

          if ((vert == 'above' || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight) {
            top = pos.top - node.offsetHeight;
          } else if (pos.bottom + node.offsetHeight <= vspace) {
            top = pos.bottom;
          }

          if (left + node.offsetWidth > hspace) {
            left = hspace - node.offsetWidth;
          }
        }

        node.style.top = top + "px";
        node.style.left = node.style.right = "";

        if (horiz == "right") {
          left = display.sizer.clientWidth - node.offsetWidth;
          node.style.right = "0px";
        } else {
          if (horiz == "left") {
            left = 0;
          } else if (horiz == "middle") {
            left = (display.sizer.clientWidth - node.offsetWidth) / 2;
          }

          node.style.left = left + "px";
        }

        if (scroll) {
          scrollIntoView(this, left, top, left + node.offsetWidth, top + node.offsetHeight);
        }
      },
      triggerOnKeyDown: methodOp(onKeyDown),
      triggerOnKeyPress: methodOp(onKeyPress),
      triggerOnKeyUp: onKeyUp,
      execCommand: function execCommand(cmd) {
        if (commands.hasOwnProperty(cmd)) {
          return commands[cmd].call(null, this);
        }
      },
      triggerElectric: methodOp(function (text) {
        triggerElectric(this, text);
      }),
      findPosH: function findPosH(from, amount, unit, visually) {
        var this$1 = this;
        var dir = 1;

        if (amount < 0) {
          dir = -1;
          amount = -amount;
        }

        var cur = _clipPos(this.doc, from);

        for (var i = 0; i < amount; ++i) {
          cur = _findPosH(this$1.doc, cur, dir, unit, visually);

          if (cur.hitSide) {
            break;
          }
        }

        return cur;
      },
      moveH: methodOp(function (dir, unit) {
        var this$1 = this;
        this.extendSelectionsBy(function (range) {
          if (this$1.display.shift || this$1.doc.extend || range.empty()) {
            return _findPosH(this$1.doc, range.head, dir, unit, this$1.options.rtlMoveVisually);
          } else {
            return dir < 0 ? range.from() : range.to();
          }
        }, sel_move);
      }),
      deleteH: methodOp(function (dir, unit) {
        var sel = this.doc.sel,
            doc = this.doc;

        if (sel.somethingSelected()) {
          doc.replaceSelection("", null, "+delete");
        } else {
          deleteNearSelection(this, function (range) {
            var other = _findPosH(doc, range.head, dir, unit, false);

            return dir < 0 ? {
              from: other,
              to: range.head
            } : {
              from: range.head,
              to: other
            };
          });
        }
      }),
      findPosV: function findPosV(from, amount, unit, goalColumn) {
        var this$1 = this;
        var dir = 1,
            x = goalColumn;

        if (amount < 0) {
          dir = -1;
          amount = -amount;
        }

        var cur = _clipPos(this.doc, from);

        for (var i = 0; i < amount; ++i) {
          var coords = _cursorCoords(this$1, cur, "div");

          if (x == null) {
            x = coords.left;
          } else {
            coords.left = x;
          }

          cur = _findPosV(this$1, coords, dir, unit);

          if (cur.hitSide) {
            break;
          }
        }

        return cur;
      },
      moveV: methodOp(function (dir, unit) {
        var this$1 = this;
        var doc = this.doc,
            goals = [];
        var collapse = !this.display.shift && !doc.extend && doc.sel.somethingSelected();
        doc.extendSelectionsBy(function (range) {
          if (collapse) {
            return dir < 0 ? range.from() : range.to();
          }

          var headPos = _cursorCoords(this$1, range.head, "div");

          if (range.goalColumn != null) {
            headPos.left = range.goalColumn;
          }

          goals.push(headPos.left);

          var pos = _findPosV(this$1, headPos, dir, unit);

          if (unit == "page" && range == doc.sel.primary()) {
            addToScrollPos(this$1, null, _charCoords(this$1, pos, "div").top - headPos.top);
          }

          return pos;
        }, sel_move);

        if (goals.length) {
          for (var i = 0; i < doc.sel.ranges.length; i++) {
            doc.sel.ranges[i].goalColumn = goals[i];
          }
        }
      }),
      // Find the word at the given position (as returned by coordsChar).
      findWordAt: function findWordAt(pos) {
        var doc = this.doc,
            line = getLine(doc, pos.line).text;
        var start = pos.ch,
            end = pos.ch;

        if (line) {
          var helper = this.getHelper(pos, "wordChars");

          if ((pos.xRel < 0 || end == line.length) && start) {
            --start;
          } else {
            ++end;
          }

          var startChar = line.charAt(start);
          var check = isWordChar(startChar, helper) ? function (ch) {
            return isWordChar(ch, helper);
          } : /\s/.test(startChar) ? function (ch) {
            return /\s/.test(ch);
          } : function (ch) {
            return !/\s/.test(ch) && !isWordChar(ch);
          };

          while (start > 0 && check(line.charAt(start - 1))) {
            --start;
          }

          while (end < line.length && check(line.charAt(end))) {
            ++end;
          }
        }

        return new Range(Pos(pos.line, start), Pos(pos.line, end));
      },
      toggleOverwrite: function toggleOverwrite(value) {
        if (value != null && value == this.state.overwrite) {
          return;
        }

        if (this.state.overwrite = !this.state.overwrite) {
          addClass(this.display.cursorDiv, "CodeMirror-overwrite");
        } else {
          rmClass(this.display.cursorDiv, "CodeMirror-overwrite");
        }

        signal(this, "overwriteToggle", this, this.state.overwrite);
      },
      hasFocus: function hasFocus() {
        return this.display.input.getField() == activeElt();
      },
      isReadOnly: function isReadOnly() {
        return !!(this.options.readOnly || this.doc.cantEdit);
      },
      scrollTo: methodOp(function (x, y) {
        if (x != null || y != null) {
          resolveScrollToPos(this);
        }

        if (x != null) {
          this.curOp.scrollLeft = x;
        }

        if (y != null) {
          this.curOp.scrollTop = y;
        }
      }),
      getScrollInfo: function getScrollInfo() {
        var scroller = this.display.scroller;
        return {
          left: scroller.scrollLeft,
          top: scroller.scrollTop,
          height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
          width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
          clientHeight: displayHeight(this),
          clientWidth: displayWidth(this)
        };
      },
      scrollIntoView: methodOp(function (range, margin) {
        if (range == null) {
          range = {
            from: this.doc.sel.primary().head,
            to: null
          };

          if (margin == null) {
            margin = this.options.cursorScrollMargin;
          }
        } else if (typeof range == "number") {
          range = {
            from: Pos(range, 0),
            to: null
          };
        } else if (range.from == null) {
          range = {
            from: range,
            to: null
          };
        }

        if (!range.to) {
          range.to = range.from;
        }

        range.margin = margin || 0;

        if (range.from.line != null) {
          resolveScrollToPos(this);
          this.curOp.scrollToPos = range;
        } else {
          var sPos = calculateScrollPos(this, Math.min(range.from.left, range.to.left), Math.min(range.from.top, range.to.top) - range.margin, Math.max(range.from.right, range.to.right), Math.max(range.from.bottom, range.to.bottom) + range.margin);
          this.scrollTo(sPos.scrollLeft, sPos.scrollTop);
        }
      }),
      setSize: methodOp(function (width, height) {
        var this$1 = this;

        var interpret = function interpret(val) {
          return typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val;
        };

        if (width != null) {
          this.display.wrapper.style.width = interpret(width);
        }

        if (height != null) {
          this.display.wrapper.style.height = interpret(height);
        }

        if (this.options.lineWrapping) {
          clearLineMeasurementCache(this);
        }

        var lineNo = this.display.viewFrom;
        this.doc.iter(lineNo, this.display.viewTo, function (line) {
          if (line.widgets) {
            for (var i = 0; i < line.widgets.length; i++) {
              if (line.widgets[i].noHScroll) {
                regLineChange(this$1, lineNo, "widget");
                break;
              }
            }
          }

          ++lineNo;
        });
        this.curOp.forceUpdate = true;
        signal(this, "refresh", this);
      }),
      operation: function operation(f) {
        return runInOp(this, f);
      },
      refresh: methodOp(function () {
        var oldHeight = this.display.cachedTextHeight;
        regChange(this);
        this.curOp.forceUpdate = true;
        clearCaches(this);
        this.scrollTo(this.doc.scrollLeft, this.doc.scrollTop);
        updateGutterSpace(this);

        if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > .5) {
          estimateLineHeights(this);
        }

        signal(this, "refresh", this);
      }),
      swapDoc: methodOp(function (doc) {
        var old = this.doc;
        old.cm = null;
        attachDoc(this, doc);
        clearCaches(this);
        this.display.input.reset();
        this.scrollTo(doc.scrollLeft, doc.scrollTop);
        this.curOp.forceScroll = true;
        signalLater(this, "swapDoc", this, old);
        return old;
      }),
      getInputField: function getInputField() {
        return this.display.input.getField();
      },
      getWrapperElement: function getWrapperElement() {
        return this.display.wrapper;
      },
      getScrollerElement: function getScrollerElement() {
        return this.display.scroller;
      },
      getGutterElement: function getGutterElement() {
        return this.display.gutters;
      }
    };
    eventMixin(CodeMirror);

    CodeMirror.registerHelper = function (type, name, value) {
      if (!helpers.hasOwnProperty(type)) {
        helpers[type] = CodeMirror[type] = {
          _global: []
        };
      }

      helpers[type][name] = value;
    };

    CodeMirror.registerGlobalHelper = function (type, name, predicate, value) {
      CodeMirror.registerHelper(type, name, value);

      helpers[type]._global.push({
        pred: predicate,
        val: value
      });
    };
  } // Used for horizontal relative motion. Dir is -1 or 1 (left or
  // right), unit can be "char", "column" (like char, but doesn't
  // cross line boundaries), "word" (across next word), or "group" (to
  // the start of next group of word or non-word-non-whitespace
  // chars). The visually param controls whether, in right-to-left
  // text, direction 1 means to move towards the next index in the
  // string, or towards the character to the right of the current
  // position. The resulting position will have a hitSide=true
  // property if it reached the end of the document.


  function _findPosH(doc, pos, dir, unit, visually) {
    var line = pos.line,
        ch = pos.ch,
        origDir = dir;
    var lineObj = getLine(doc, line);

    function findNextLine() {
      var l = line + dir;

      if (l < doc.first || l >= doc.first + doc.size) {
        return false;
      }

      line = l;
      return lineObj = getLine(doc, l);
    }

    function moveOnce(boundToLine) {
      var next = (visually ? moveVisually : moveLogically)(lineObj, ch, dir, true);

      if (next == null) {
        if (!boundToLine && findNextLine()) {
          if (visually) {
            ch = (dir < 0 ? lineRight : lineLeft)(lineObj);
          } else {
            ch = dir < 0 ? lineObj.text.length : 0;
          }
        } else {
          return false;
        }
      } else {
        ch = next;
      }

      return true;
    }

    if (unit == "char") {
      moveOnce();
    } else if (unit == "column") {
      moveOnce(true);
    } else if (unit == "word" || unit == "group") {
      var sawType = null,
          group = unit == "group";
      var helper = doc.cm && doc.cm.getHelper(pos, "wordChars");

      for (var first = true;; first = false) {
        if (dir < 0 && !moveOnce(!first)) {
          break;
        }

        var cur = lineObj.text.charAt(ch) || "\n";
        var type = isWordChar(cur, helper) ? "w" : group && cur == "\n" ? "n" : !group || /\s/.test(cur) ? null : "p";

        if (group && !first && !type) {
          type = "s";
        }

        if (sawType && sawType != type) {
          if (dir < 0) {
            dir = 1;
            moveOnce();
          }

          break;
        }

        if (type) {
          sawType = type;
        }

        if (dir > 0 && !moveOnce(!first)) {
          break;
        }
      }
    }

    var result = skipAtomic(doc, Pos(line, ch), pos, origDir, true);

    if (!cmp(pos, result)) {
      result.hitSide = true;
    }

    return result;
  } // For relative vertical movement. Dir may be -1 or 1. Unit can be
  // "page" or "line". The resulting position will have a hitSide=true
  // property if it reached the end of the document.


  function _findPosV(cm, pos, dir, unit) {
    var doc = cm.doc,
        x = pos.left,
        y;

    if (unit == "page") {
      var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
      var moveAmount = Math.max(pageSize - .5 * textHeight(cm.display), 3);
      y = (dir > 0 ? pos.bottom : pos.top) + dir * moveAmount;
    } else if (unit == "line") {
      y = dir > 0 ? pos.bottom + 3 : pos.top - 3;
    }

    var target;

    for (;;) {
      target = _coordsChar(cm, x, y);

      if (!target.outside) {
        break;
      }

      if (dir < 0 ? y <= 0 : y >= doc.height) {
        target.hitSide = true;
        break;
      }

      y += dir * 5;
    }

    return target;
  } // CONTENTEDITABLE INPUT STYLE


  var ContentEditableInput = function ContentEditableInput(cm) {
    this.cm = cm;
    this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null;
    this.polling = new Delayed();
    this.composing = null;
    this.gracePeriod = false;
    this.readDOMTimeout = null;
  };

  ContentEditableInput.prototype.init = function (display) {
    var this$1 = this;
    var input = this,
        cm = input.cm;
    var div = input.div = display.lineDiv;
    disableBrowserMagic(div, cm.options.spellcheck);
    on(div, "paste", function (e) {
      if (signalDOMEvent(cm, e) || handlePaste(e, cm)) {
        return;
      } // IE doesn't fire input events, so we schedule a read for the pasted content in this way


      if (ie_version <= 11) {
        setTimeout(operation(cm, function () {
          if (!input.pollContent()) {
            regChange(cm);
          }
        }), 20);
      }
    });
    on(div, "compositionstart", function (e) {
      this$1.composing = {
        data: e.data,
        done: false
      };
    });
    on(div, "compositionupdate", function (e) {
      if (!this$1.composing) {
        this$1.composing = {
          data: e.data,
          done: false
        };
      }
    });
    on(div, "compositionend", function (e) {
      if (this$1.composing) {
        if (e.data != this$1.composing.data) {
          this$1.readFromDOMSoon();
        }

        this$1.composing.done = true;
      }
    });
    on(div, "touchstart", function () {
      return input.forceCompositionEnd();
    });
    on(div, "input", function () {
      if (!this$1.composing) {
        this$1.readFromDOMSoon();
      }
    });

    function onCopyCut(e) {
      if (signalDOMEvent(cm, e)) {
        return;
      }

      if (cm.somethingSelected()) {
        setLastCopied({
          lineWise: false,
          text: cm.getSelections()
        });

        if (e.type == "cut") {
          cm.replaceSelection("", null, "cut");
        }
      } else if (!cm.options.lineWiseCopyCut) {
        return;
      } else {
        var ranges = copyableRanges(cm);
        setLastCopied({
          lineWise: true,
          text: ranges.text
        });

        if (e.type == "cut") {
          cm.operation(function () {
            cm.setSelections(ranges.ranges, 0, sel_dontScroll);
            cm.replaceSelection("", null, "cut");
          });
        }
      }

      if (e.clipboardData) {
        e.clipboardData.clearData();
        var content = lastCopied.text.join("\n"); // iOS exposes the clipboard API, but seems to discard content inserted into it

        e.clipboardData.setData("Text", content);

        if (e.clipboardData.getData("Text") == content) {
          e.preventDefault();
          return;
        }
      } // Old-fashioned briefly-focus-a-textarea hack


      var kludge = hiddenTextarea(),
          te = kludge.firstChild;
      cm.display.lineSpace.insertBefore(kludge, cm.display.lineSpace.firstChild);
      te.value = lastCopied.text.join("\n");
      var hadFocus = document.activeElement;
      selectInput(te);
      setTimeout(function () {
        cm.display.lineSpace.removeChild(kludge);
        hadFocus.focus();

        if (hadFocus == div) {
          input.showPrimarySelection();
        }
      }, 50);
    }

    on(div, "copy", onCopyCut);
    on(div, "cut", onCopyCut);
  };

  ContentEditableInput.prototype.prepareSelection = function () {
    var result = prepareSelection(this.cm, false);
    result.focus = this.cm.state.focused;
    return result;
  };

  ContentEditableInput.prototype.showSelection = function (info, takeFocus) {
    if (!info || !this.cm.display.view.length) {
      return;
    }

    if (info.focus || takeFocus) {
      this.showPrimarySelection();
    }

    this.showMultipleSelections(info);
  };

  ContentEditableInput.prototype.showPrimarySelection = function () {
    var sel = window.getSelection(),
        prim = this.cm.doc.sel.primary();
    var curAnchor = domToPos(this.cm, sel.anchorNode, sel.anchorOffset);
    var curFocus = domToPos(this.cm, sel.focusNode, sel.focusOffset);

    if (curAnchor && !curAnchor.bad && curFocus && !curFocus.bad && cmp(minPos(curAnchor, curFocus), prim.from()) == 0 && cmp(maxPos(curAnchor, curFocus), prim.to()) == 0) {
      return;
    }

    var start = posToDOM(this.cm, prim.from());
    var end = posToDOM(this.cm, prim.to());

    if (!start && !end) {
      return;
    }

    var view = this.cm.display.view;
    var old = sel.rangeCount && sel.getRangeAt(0);

    if (!start) {
      start = {
        node: view[0].measure.map[2],
        offset: 0
      };
    } else if (!end) {
      // FIXME dangerously hacky
      var measure = view[view.length - 1].measure;
      var map = measure.maps ? measure.maps[measure.maps.length - 1] : measure.map;
      end = {
        node: map[map.length - 1],
        offset: map[map.length - 2] - map[map.length - 3]
      };
    }

    var rng;

    try {
      rng = range(start.node, start.offset, end.offset, end.node);
    } catch (e) {} // Our model of the DOM might be outdated, in which case the range we try to set can be impossible


    if (rng) {
      if (!gecko && this.cm.state.focused) {
        sel.collapse(start.node, start.offset);

        if (!rng.collapsed) {
          sel.removeAllRanges();
          sel.addRange(rng);
        }
      } else {
        sel.removeAllRanges();
        sel.addRange(rng);
      }

      if (old && sel.anchorNode == null) {
        sel.addRange(old);
      } else if (gecko) {
        this.startGracePeriod();
      }
    }

    this.rememberSelection();
  };

  ContentEditableInput.prototype.startGracePeriod = function () {
    var this$1 = this;
    clearTimeout(this.gracePeriod);
    this.gracePeriod = setTimeout(function () {
      this$1.gracePeriod = false;

      if (this$1.selectionChanged()) {
        this$1.cm.operation(function () {
          return this$1.cm.curOp.selectionChanged = true;
        });
      }
    }, 20);
  };

  ContentEditableInput.prototype.showMultipleSelections = function (info) {
    removeChildrenAndAdd(this.cm.display.cursorDiv, info.cursors);
    removeChildrenAndAdd(this.cm.display.selectionDiv, info.selection);
  };

  ContentEditableInput.prototype.rememberSelection = function () {
    var sel = window.getSelection();
    this.lastAnchorNode = sel.anchorNode;
    this.lastAnchorOffset = sel.anchorOffset;
    this.lastFocusNode = sel.focusNode;
    this.lastFocusOffset = sel.focusOffset;
  };

  ContentEditableInput.prototype.selectionInEditor = function () {
    var sel = window.getSelection();

    if (!sel.rangeCount) {
      return false;
    }

    var node = sel.getRangeAt(0).commonAncestorContainer;
    return contains(this.div, node);
  };

  ContentEditableInput.prototype.focus = function () {
    if (this.cm.options.readOnly != "nocursor") {
      if (!this.selectionInEditor()) {
        this.showSelection(this.prepareSelection(), true);
      }

      this.div.focus();
    }
  };

  ContentEditableInput.prototype.blur = function () {
    this.div.blur();
  };

  ContentEditableInput.prototype.getField = function () {
    return this.div;
  };

  ContentEditableInput.prototype.supportsTouch = function () {
    return true;
  };

  ContentEditableInput.prototype.receivedFocus = function () {
    var input = this;

    if (this.selectionInEditor()) {
      this.pollSelection();
    } else {
      runInOp(this.cm, function () {
        return input.cm.curOp.selectionChanged = true;
      });
    }

    function poll() {
      if (input.cm.state.focused) {
        input.pollSelection();
        input.polling.set(input.cm.options.pollInterval, poll);
      }
    }

    this.polling.set(this.cm.options.pollInterval, poll);
  };

  ContentEditableInput.prototype.selectionChanged = function () {
    var sel = window.getSelection();
    return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset || sel.focusNode != this.lastFocusNode || sel.focusOffset != this.lastFocusOffset;
  };

  ContentEditableInput.prototype.pollSelection = function () {
    if (!this.composing && this.readDOMTimeout == null && !this.gracePeriod && this.selectionChanged()) {
      var sel = window.getSelection(),
          cm = this.cm;
      this.rememberSelection();
      var anchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
      var head = domToPos(cm, sel.focusNode, sel.focusOffset);

      if (anchor && head) {
        runInOp(cm, function () {
          setSelection(cm.doc, simpleSelection(anchor, head), sel_dontScroll);

          if (anchor.bad || head.bad) {
            cm.curOp.selectionChanged = true;
          }
        });
      }
    }
  };

  ContentEditableInput.prototype.pollContent = function () {
    if (this.readDOMTimeout != null) {
      clearTimeout(this.readDOMTimeout);
      this.readDOMTimeout = null;
    }

    var cm = this.cm,
        display = cm.display,
        sel = cm.doc.sel.primary();
    var from = sel.from(),
        to = sel.to();

    if (from.ch == 0 && from.line > cm.firstLine()) {
      from = Pos(from.line - 1, getLine(cm.doc, from.line - 1).length);
    }

    if (to.ch == getLine(cm.doc, to.line).text.length && to.line < cm.lastLine()) {
      to = Pos(to.line + 1, 0);
    }

    if (from.line < display.viewFrom || to.line > display.viewTo - 1) {
      return false;
    }

    var fromIndex, fromLine, fromNode;

    if (from.line == display.viewFrom || (fromIndex = findViewIndex(cm, from.line)) == 0) {
      fromLine = lineNo(display.view[0].line);
      fromNode = display.view[0].node;
    } else {
      fromLine = lineNo(display.view[fromIndex].line);
      fromNode = display.view[fromIndex - 1].node.nextSibling;
    }

    var toIndex = findViewIndex(cm, to.line);
    var toLine, toNode;

    if (toIndex == display.view.length - 1) {
      toLine = display.viewTo - 1;
      toNode = display.lineDiv.lastChild;
    } else {
      toLine = lineNo(display.view[toIndex + 1].line) - 1;
      toNode = display.view[toIndex + 1].node.previousSibling;
    }

    if (!fromNode) {
      return false;
    }

    var newText = cm.doc.splitLines(domTextBetween(cm, fromNode, toNode, fromLine, toLine));
    var oldText = getBetween(cm.doc, Pos(fromLine, 0), Pos(toLine, getLine(cm.doc, toLine).text.length));

    while (newText.length > 1 && oldText.length > 1) {
      if (lst(newText) == lst(oldText)) {
        newText.pop();
        oldText.pop();
        toLine--;
      } else if (newText[0] == oldText[0]) {
        newText.shift();
        oldText.shift();
        fromLine++;
      } else {
        break;
      }
    }

    var cutFront = 0,
        cutEnd = 0;
    var newTop = newText[0],
        oldTop = oldText[0],
        maxCutFront = Math.min(newTop.length, oldTop.length);

    while (cutFront < maxCutFront && newTop.charCodeAt(cutFront) == oldTop.charCodeAt(cutFront)) {
      ++cutFront;
    }

    var newBot = lst(newText),
        oldBot = lst(oldText);
    var maxCutEnd = Math.min(newBot.length - (newText.length == 1 ? cutFront : 0), oldBot.length - (oldText.length == 1 ? cutFront : 0));

    while (cutEnd < maxCutEnd && newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1)) {
      ++cutEnd;
    }

    newText[newText.length - 1] = newBot.slice(0, newBot.length - cutEnd).replace(/^\u200b+/, "");
    newText[0] = newText[0].slice(cutFront).replace(/\u200b+$/, "");
    var chFrom = Pos(fromLine, cutFront);
    var chTo = Pos(toLine, oldText.length ? lst(oldText).length - cutEnd : 0);

    if (newText.length > 1 || newText[0] || cmp(chFrom, chTo)) {
      _replaceRange(cm.doc, newText, chFrom, chTo, "+input");

      return true;
    }
  };

  ContentEditableInput.prototype.ensurePolled = function () {
    this.forceCompositionEnd();
  };

  ContentEditableInput.prototype.reset = function () {
    this.forceCompositionEnd();
  };

  ContentEditableInput.prototype.forceCompositionEnd = function () {
    if (!this.composing) {
      return;
    }

    clearTimeout(this.readDOMTimeout);
    this.composing = null;

    if (!this.pollContent()) {
      regChange(this.cm);
    }

    this.div.blur();
    this.div.focus();
  };

  ContentEditableInput.prototype.readFromDOMSoon = function () {
    var this$1 = this;

    if (this.readDOMTimeout != null) {
      return;
    }

    this.readDOMTimeout = setTimeout(function () {
      this$1.readDOMTimeout = null;

      if (this$1.composing) {
        if (this$1.composing.done) {
          this$1.composing = null;
        } else {
          return;
        }
      }

      if (this$1.cm.isReadOnly() || !this$1.pollContent()) {
        runInOp(this$1.cm, function () {
          return regChange(this$1.cm);
        });
      }
    }, 80);
  };

  ContentEditableInput.prototype.setUneditable = function (node) {
    node.contentEditable = "false";
  };

  ContentEditableInput.prototype.onKeyPress = function (e) {
    e.preventDefault();

    if (!this.cm.isReadOnly()) {
      operation(this.cm, applyTextInput)(this.cm, String.fromCharCode(e.charCode == null ? e.keyCode : e.charCode), 0);
    }
  };

  ContentEditableInput.prototype.readOnlyChanged = function (val) {
    this.div.contentEditable = String(val != "nocursor");
  };

  ContentEditableInput.prototype.onContextMenu = function () {};

  ContentEditableInput.prototype.resetPosition = function () {};

  ContentEditableInput.prototype.needsContentAttribute = true;

  function posToDOM(cm, pos) {
    var view = findViewForLine(cm, pos.line);

    if (!view || view.hidden) {
      return null;
    }

    var line = getLine(cm.doc, pos.line);
    var info = mapFromLineView(view, line, pos.line);
    var order = getOrder(line),
        side = "left";

    if (order) {
      var partPos = getBidiPartAt(order, pos.ch);
      side = partPos % 2 ? "right" : "left";
    }

    var result = nodeAndOffsetInLineMap(info.map, pos.ch, side);
    result.offset = result.collapse == "right" ? result.end : result.start;
    return result;
  }

  function badPos(pos, bad) {
    if (bad) {
      pos.bad = true;
    }

    return pos;
  }

  function domTextBetween(cm, from, to, fromLine, toLine) {
    var text = "",
        closing = false,
        lineSep = cm.doc.lineSeparator();

    function recognizeMarker(id) {
      return function (marker) {
        return marker.id == id;
      };
    }

    function walk(node) {
      if (node.nodeType == 1) {
        var cmText = node.getAttribute("cm-text");

        if (cmText != null) {
          if (cmText == "") {
            text += node.textContent.replace(/\u200b/g, "");
          } else {
            text += cmText;
          }

          return;
        }

        var markerID = node.getAttribute("cm-marker"),
            range;

        if (markerID) {
          var found = cm.findMarks(Pos(fromLine, 0), Pos(toLine + 1, 0), recognizeMarker(+markerID));

          if (found.length && (range = found[0].find())) {
            text += getBetween(cm.doc, range.from, range.to).join(lineSep);
          }

          return;
        }

        if (node.getAttribute("contenteditable") == "false") {
          return;
        }

        for (var i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
        }

        if (/^(pre|div|p)$/i.test(node.nodeName)) {
          closing = true;
        }
      } else if (node.nodeType == 3) {
        var val = node.nodeValue;

        if (!val) {
          return;
        }

        if (closing) {
          text += lineSep;
          closing = false;
        }

        text += val;
      }
    }

    for (;;) {
      walk(from);

      if (from == to) {
        break;
      }

      from = from.nextSibling;
    }

    return text;
  }

  function domToPos(cm, node, offset) {
    var lineNode;

    if (node == cm.display.lineDiv) {
      lineNode = cm.display.lineDiv.childNodes[offset];

      if (!lineNode) {
        return badPos(cm.clipPos(Pos(cm.display.viewTo - 1)), true);
      }

      node = null;
      offset = 0;
    } else {
      for (lineNode = node;; lineNode = lineNode.parentNode) {
        if (!lineNode || lineNode == cm.display.lineDiv) {
          return null;
        }

        if (lineNode.parentNode && lineNode.parentNode == cm.display.lineDiv) {
          break;
        }
      }
    }

    for (var i = 0; i < cm.display.view.length; i++) {
      var lineView = cm.display.view[i];

      if (lineView.node == lineNode) {
        return locateNodeInLineView(lineView, node, offset);
      }
    }
  }

  function locateNodeInLineView(lineView, node, offset) {
    var wrapper = lineView.text.firstChild,
        bad = false;

    if (!node || !contains(wrapper, node)) {
      return badPos(Pos(lineNo(lineView.line), 0), true);
    }

    if (node == wrapper) {
      bad = true;
      node = wrapper.childNodes[offset];
      offset = 0;

      if (!node) {
        var line = lineView.rest ? lst(lineView.rest) : lineView.line;
        return badPos(Pos(lineNo(line), line.text.length), bad);
      }
    }

    var textNode = node.nodeType == 3 ? node : null,
        topNode = node;

    if (!textNode && node.childNodes.length == 1 && node.firstChild.nodeType == 3) {
      textNode = node.firstChild;

      if (offset) {
        offset = textNode.nodeValue.length;
      }
    }

    while (topNode.parentNode != wrapper) {
      topNode = topNode.parentNode;
    }

    var measure = lineView.measure,
        maps = measure.maps;

    function find(textNode, topNode, offset) {
      for (var i = -1; i < (maps ? maps.length : 0); i++) {
        var map = i < 0 ? measure.map : maps[i];

        for (var j = 0; j < map.length; j += 3) {
          var curNode = map[j + 2];

          if (curNode == textNode || curNode == topNode) {
            var line = lineNo(i < 0 ? lineView.line : lineView.rest[i]);
            var ch = map[j] + offset;

            if (offset < 0 || curNode != textNode) {
              ch = map[j + (offset ? 1 : 0)];
            }

            return Pos(line, ch);
          }
        }
      }
    }

    var found = find(textNode, topNode, offset);

    if (found) {
      return badPos(found, bad);
    } // FIXME this is all really shaky. might handle the few cases it needs to handle, but likely to cause problems


    for (var after = topNode.nextSibling, dist = textNode ? textNode.nodeValue.length - offset : 0; after; after = after.nextSibling) {
      found = find(after, after.firstChild, 0);

      if (found) {
        return badPos(Pos(found.line, found.ch - dist), bad);
      } else {
        dist += after.textContent.length;
      }
    }

    for (var before = topNode.previousSibling, dist$1 = offset; before; before = before.previousSibling) {
      found = find(before, before.firstChild, -1);

      if (found) {
        return badPos(Pos(found.line, found.ch + dist$1), bad);
      } else {
        dist$1 += before.textContent.length;
      }
    }
  } // TEXTAREA INPUT STYLE


  var TextareaInput = function TextareaInput(cm) {
    this.cm = cm; // See input.poll and input.reset

    this.prevInput = ""; // Flag that indicates whether we expect input to appear real soon
    // now (after some event like 'keypress' or 'input') and are
    // polling intensively.

    this.pollingFast = false; // Self-resetting timeout for the poller

    this.polling = new Delayed(); // Tracks when input.reset has punted to just putting a short
    // string into the textarea instead of the full selection.

    this.inaccurateSelection = false; // Used to work around IE issue with selection being forgotten when focus moves away from textarea

    this.hasSelection = false;
    this.composing = null;
  };

  TextareaInput.prototype.init = function (display) {
    var this$1 = this;
    var input = this,
        cm = this.cm; // Wraps and hides input textarea

    var div = this.wrapper = hiddenTextarea(); // The semihidden textarea that is focused when the editor is
    // focused, and receives input.

    var te = this.textarea = div.firstChild;
    display.wrapper.insertBefore(div, display.wrapper.firstChild); // Needed to hide big blue blinking cursor on Mobile Safari (doesn't seem to work in iOS 8 anymore)

    if (ios) {
      te.style.width = "0px";
    }

    on(te, "input", function () {
      if (ie && ie_version >= 9 && this$1.hasSelection) {
        this$1.hasSelection = null;
      }

      input.poll();
    });
    on(te, "paste", function (e) {
      if (signalDOMEvent(cm, e) || handlePaste(e, cm)) {
        return;
      }

      cm.state.pasteIncoming = true;
      input.fastPoll();
    });

    function prepareCopyCut(e) {
      if (signalDOMEvent(cm, e)) {
        return;
      }

      if (cm.somethingSelected()) {
        setLastCopied({
          lineWise: false,
          text: cm.getSelections()
        });

        if (input.inaccurateSelection) {
          input.prevInput = "";
          input.inaccurateSelection = false;
          te.value = lastCopied.text.join("\n");
          selectInput(te);
        }
      } else if (!cm.options.lineWiseCopyCut) {
        return;
      } else {
        var ranges = copyableRanges(cm);
        setLastCopied({
          lineWise: true,
          text: ranges.text
        });

        if (e.type == "cut") {
          cm.setSelections(ranges.ranges, null, sel_dontScroll);
        } else {
          input.prevInput = "";
          te.value = ranges.text.join("\n");
          selectInput(te);
        }
      }

      if (e.type == "cut") {
        cm.state.cutIncoming = true;
      }
    }

    on(te, "cut", prepareCopyCut);
    on(te, "copy", prepareCopyCut);
    on(display.scroller, "paste", function (e) {
      if (eventInWidget(display, e) || signalDOMEvent(cm, e)) {
        return;
      }

      cm.state.pasteIncoming = true;
      input.focus();
    }); // Prevent normal selection in the editor (we handle our own)

    on(display.lineSpace, "selectstart", function (e) {
      if (!eventInWidget(display, e)) {
        e_preventDefault(e);
      }
    });
    on(te, "compositionstart", function () {
      var start = cm.getCursor("from");

      if (input.composing) {
        input.composing.range.clear();
      }

      input.composing = {
        start: start,
        range: cm.markText(start, cm.getCursor("to"), {
          className: "CodeMirror-composing"
        })
      };
    });
    on(te, "compositionend", function () {
      if (input.composing) {
        input.poll();
        input.composing.range.clear();
        input.composing = null;
      }
    });
  };

  TextareaInput.prototype.prepareSelection = function () {
    // Redraw the selection and/or cursor
    var cm = this.cm,
        display = cm.display,
        doc = cm.doc;
    var result = prepareSelection(cm); // Move the hidden textarea near the cursor to prevent scrolling artifacts

    if (cm.options.moveInputWithCursor) {
      var headPos = _cursorCoords(cm, doc.sel.primary().head, "div");

      var wrapOff = display.wrapper.getBoundingClientRect(),
          lineOff = display.lineDiv.getBoundingClientRect();
      result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10, headPos.top + lineOff.top - wrapOff.top));
      result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10, headPos.left + lineOff.left - wrapOff.left));
    }

    return result;
  };

  TextareaInput.prototype.showSelection = function (drawn) {
    var cm = this.cm,
        display = cm.display;
    removeChildrenAndAdd(display.cursorDiv, drawn.cursors);
    removeChildrenAndAdd(display.selectionDiv, drawn.selection);

    if (drawn.teTop != null) {
      this.wrapper.style.top = drawn.teTop + "px";
      this.wrapper.style.left = drawn.teLeft + "px";
    }
  }; // Reset the input to correspond to the selection (or to be empty,
  // when not typing and nothing is selected)


  TextareaInput.prototype.reset = function (typing) {
    if (this.contextMenuPending) {
      return;
    }

    var minimal,
        selected,
        cm = this.cm,
        doc = cm.doc;

    if (cm.somethingSelected()) {
      this.prevInput = "";
      var range = doc.sel.primary();
      minimal = hasCopyEvent && (range.to().line - range.from().line > 100 || (selected = cm.getSelection()).length > 1000);
      var content = minimal ? "-" : selected || cm.getSelection();
      this.textarea.value = content;

      if (cm.state.focused) {
        selectInput(this.textarea);
      }

      if (ie && ie_version >= 9) {
        this.hasSelection = content;
      }
    } else if (!typing) {
      this.prevInput = this.textarea.value = "";

      if (ie && ie_version >= 9) {
        this.hasSelection = null;
      }
    }

    this.inaccurateSelection = minimal;
  };

  TextareaInput.prototype.getField = function () {
    return this.textarea;
  };

  TextareaInput.prototype.supportsTouch = function () {
    return false;
  };

  TextareaInput.prototype.focus = function () {
    if (this.cm.options.readOnly != "nocursor" && (!mobile || activeElt() != this.textarea)) {
      try {
        this.textarea.focus();
      } catch (e) {} // IE8 will throw if the textarea is display: none or not in DOM

    }
  };

  TextareaInput.prototype.blur = function () {
    this.textarea.blur();
  };

  TextareaInput.prototype.resetPosition = function () {
    this.wrapper.style.top = this.wrapper.style.left = 0;
  };

  TextareaInput.prototype.receivedFocus = function () {
    this.slowPoll();
  }; // Poll for input changes, using the normal rate of polling. This
  // runs as long as the editor is focused.


  TextareaInput.prototype.slowPoll = function () {
    var this$1 = this;

    if (this.pollingFast) {
      return;
    }

    this.polling.set(this.cm.options.pollInterval, function () {
      this$1.poll();

      if (this$1.cm.state.focused) {
        this$1.slowPoll();
      }
    });
  }; // When an event has just come in that is likely to add or change
  // something in the input textarea, we poll faster, to ensure that
  // the change appears on the screen quickly.


  TextareaInput.prototype.fastPoll = function () {
    var missed = false,
        input = this;
    input.pollingFast = true;

    function p() {
      var changed = input.poll();

      if (!changed && !missed) {
        missed = true;
        input.polling.set(60, p);
      } else {
        input.pollingFast = false;
        input.slowPoll();
      }
    }

    input.polling.set(20, p);
  }; // Read input from the textarea, and update the document to match.
  // When something is selected, it is present in the textarea, and
  // selected (unless it is huge, in which case a placeholder is
  // used). When nothing is selected, the cursor sits after previously
  // seen text (can be empty), which is stored in prevInput (we must
  // not reset the textarea when typing, because that breaks IME).


  TextareaInput.prototype.poll = function () {
    var this$1 = this;
    var cm = this.cm,
        input = this.textarea,
        prevInput = this.prevInput; // Since this is called a *lot*, try to bail out as cheaply as
    // possible when it is clear that nothing happened. hasSelection
    // will be the case when there is a lot of text in the textarea,
    // in which case reading its value would be expensive.

    if (this.contextMenuPending || !cm.state.focused || hasSelection(input) && !prevInput && !this.composing || cm.isReadOnly() || cm.options.disableInput || cm.state.keySeq) {
      return false;
    }

    var text = input.value; // If nothing changed, bail.

    if (text == prevInput && !cm.somethingSelected()) {
      return false;
    } // Work around nonsensical selection resetting in IE9/10, and
    // inexplicable appearance of private area unicode characters on
    // some key combos in Mac (#2689).


    if (ie && ie_version >= 9 && this.hasSelection === text || mac && /[\uf700-\uf7ff]/.test(text)) {
      cm.display.input.reset();
      return false;
    }

    if (cm.doc.sel == cm.display.selForContextMenu) {
      var first = text.charCodeAt(0);

      if (first == 0x200b && !prevInput) {
        prevInput = "\u200B";
      }

      if (first == 0x21da) {
        this.reset();
        return this.cm.execCommand("undo");
      }
    } // Find the part of the input that is actually new


    var same = 0,
        l = Math.min(prevInput.length, text.length);

    while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same)) {
      ++same;
    }

    runInOp(cm, function () {
      applyTextInput(cm, text.slice(same), prevInput.length - same, null, this$1.composing ? "*compose" : null); // Don't leave long text in the textarea, since it makes further polling slow

      if (text.length > 1000 || text.indexOf("\n") > -1) {
        input.value = this$1.prevInput = "";
      } else {
        this$1.prevInput = text;
      }

      if (this$1.composing) {
        this$1.composing.range.clear();
        this$1.composing.range = cm.markText(this$1.composing.start, cm.getCursor("to"), {
          className: "CodeMirror-composing"
        });
      }
    });
    return true;
  };

  TextareaInput.prototype.ensurePolled = function () {
    if (this.pollingFast && this.poll()) {
      this.pollingFast = false;
    }
  };

  TextareaInput.prototype.onKeyPress = function () {
    if (ie && ie_version >= 9) {
      this.hasSelection = null;
    }

    this.fastPoll();
  };

  TextareaInput.prototype.onContextMenu = function (e) {
    var input = this,
        cm = input.cm,
        display = cm.display,
        te = input.textarea;
    var pos = posFromMouse(cm, e),
        scrollPos = display.scroller.scrollTop;

    if (!pos || presto) {
      return;
    } // Opera is difficult.
    // Reset the current text selection only if the click is done outside of the selection
    // and 'resetSelectionOnContextMenu' option is true.


    var reset = cm.options.resetSelectionOnContextMenu;

    if (reset && cm.doc.sel.contains(pos) == -1) {
      operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll);
    }

    var oldCSS = te.style.cssText,
        oldWrapperCSS = input.wrapper.style.cssText;
    input.wrapper.style.cssText = "position: absolute";
    var wrapperBox = input.wrapper.getBoundingClientRect();
    te.style.cssText = "position: absolute; width: 30px; height: 30px;\n      top: " + (e.clientY - wrapperBox.top - 5) + "px; left: " + (e.clientX - wrapperBox.left - 5) + "px;\n      z-index: 1000; background: " + (ie ? "rgba(255, 255, 255, .05)" : "transparent") + ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
    var oldScrollY;

    if (webkit) {
      oldScrollY = window.scrollY;
    } // Work around Chrome issue (#2712)


    display.input.focus();

    if (webkit) {
      window.scrollTo(null, oldScrollY);
    }

    display.input.reset(); // Adds "Select all" to context menu in FF

    if (!cm.somethingSelected()) {
      te.value = input.prevInput = " ";
    }

    input.contextMenuPending = true;
    display.selForContextMenu = cm.doc.sel;
    clearTimeout(display.detectingSelectAll); // Select-all will be greyed out if there's nothing to select, so
    // this adds a zero-width space so that we can later check whether
    // it got selected.

    function prepareSelectAllHack() {
      if (te.selectionStart != null) {
        var selected = cm.somethingSelected();
        var extval = "\u200B" + (selected ? te.value : "");
        te.value = "\u21DA"; // Used to catch context-menu undo

        te.value = extval;
        input.prevInput = selected ? "" : "\u200B";
        te.selectionStart = 1;
        te.selectionEnd = extval.length; // Re-set this, in case some other handler touched the
        // selection in the meantime.

        display.selForContextMenu = cm.doc.sel;
      }
    }

    function rehide() {
      input.contextMenuPending = false;
      input.wrapper.style.cssText = oldWrapperCSS;
      te.style.cssText = oldCSS;

      if (ie && ie_version < 9) {
        display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos);
      } // Try to detect the user choosing select-all


      if (te.selectionStart != null) {
        if (!ie || ie && ie_version < 9) {
          prepareSelectAllHack();
        }

        var i = 0,
            poll = function poll() {
          if (display.selForContextMenu == cm.doc.sel && te.selectionStart == 0 && te.selectionEnd > 0 && input.prevInput == "\u200B") {
            operation(cm, selectAll)(cm);
          } else if (i++ < 10) {
            display.detectingSelectAll = setTimeout(poll, 500);
          } else {
            display.input.reset();
          }
        };

        display.detectingSelectAll = setTimeout(poll, 200);
      }
    }

    if (ie && ie_version >= 9) {
      prepareSelectAllHack();
    }

    if (captureRightClick) {
      e_stop(e);

      var mouseup = function mouseup() {
        off(window, "mouseup", mouseup);
        setTimeout(rehide, 20);
      };

      on(window, "mouseup", mouseup);
    } else {
      setTimeout(rehide, 50);
    }
  };

  TextareaInput.prototype.readOnlyChanged = function (val) {
    if (!val) {
      this.reset();
    }
  };

  TextareaInput.prototype.setUneditable = function () {};

  TextareaInput.prototype.needsContentAttribute = false;

  function fromTextArea(textarea, options) {
    options = options ? copyObj(options) : {};
    options.value = textarea.value;

    if (!options.tabindex && textarea.tabIndex) {
      options.tabindex = textarea.tabIndex;
    }

    if (!options.placeholder && textarea.placeholder) {
      options.placeholder = textarea.placeholder;
    } // Set autofocus to true if this textarea is focused, or if it has
    // autofocus and no other element is focused.


    if (options.autofocus == null) {
      var hasFocus = activeElt();
      options.autofocus = hasFocus == textarea || textarea.getAttribute("autofocus") != null && hasFocus == document.body;
    }

    function save() {
      textarea.value = cm.getValue();
    }

    var realSubmit;

    if (textarea.form) {
      on(textarea.form, "submit", save); // Deplorable hack to make the submit method do the right thing.

      if (!options.leaveSubmitMethodAlone) {
        var form = textarea.form;
        realSubmit = form.submit;

        try {
          var wrappedSubmit = form.submit = function () {
            save();
            form.submit = realSubmit;
            form.submit();
            form.submit = wrappedSubmit;
          };
        } catch (e) {}
      }
    }

    options.finishInit = function (cm) {
      cm.save = save;

      cm.getTextArea = function () {
        return textarea;
      };

      cm.toTextArea = function () {
        cm.toTextArea = isNaN; // Prevent this from being ran twice

        save();
        textarea.parentNode.removeChild(cm.getWrapperElement());
        textarea.style.display = "";

        if (textarea.form) {
          off(textarea.form, "submit", save);

          if (typeof textarea.form.submit == "function") {
            textarea.form.submit = realSubmit;
          }
        }
      };
    };

    textarea.style.display = "none";
    var cm = CodeMirror(function (node) {
      return textarea.parentNode.insertBefore(node, textarea.nextSibling);
    }, options);
    return cm;
  }

  function addLegacyProps(CodeMirror) {
    CodeMirror.off = off;
    CodeMirror.on = on;
    CodeMirror.wheelEventPixels = wheelEventPixels;
    CodeMirror.Doc = Doc;
    CodeMirror.splitLines = splitLinesAuto;
    CodeMirror.countColumn = countColumn;
    CodeMirror.findColumn = findColumn;
    CodeMirror.isWordChar = isWordCharBasic;
    CodeMirror.Pass = Pass;
    CodeMirror.signal = signal;
    CodeMirror.Line = Line;
    CodeMirror.changeEnd = changeEnd;
    CodeMirror.scrollbarModel = scrollbarModel;
    CodeMirror.Pos = Pos;
    CodeMirror.cmpPos = cmp;
    CodeMirror.modes = modes;
    CodeMirror.mimeModes = mimeModes;
    CodeMirror.resolveMode = resolveMode;
    CodeMirror.getMode = getMode;
    CodeMirror.modeExtensions = modeExtensions;
    CodeMirror.extendMode = extendMode;
    CodeMirror.copyState = copyState;
    CodeMirror.startState = startState;
    CodeMirror.innerMode = innerMode;
    CodeMirror.commands = commands;
    CodeMirror.keyMap = keyMap;
    CodeMirror.keyName = keyName;
    CodeMirror.isModifierKey = isModifierKey;
    CodeMirror.lookupKey = lookupKey;
    CodeMirror.normalizeKeyMap = normalizeKeyMap;
    CodeMirror.StringStream = StringStream;
    CodeMirror.SharedTextMarker = SharedTextMarker;
    CodeMirror.TextMarker = TextMarker;
    CodeMirror.LineWidget = LineWidget;
    CodeMirror.e_preventDefault = e_preventDefault;
    CodeMirror.e_stopPropagation = e_stopPropagation;
    CodeMirror.e_stop = e_stop;
    CodeMirror.addClass = addClass;
    CodeMirror.contains = contains;
    CodeMirror.rmClass = rmClass;
    CodeMirror.keyNames = keyNames;
  } // EDITOR CONSTRUCTOR


  defineOptions(CodeMirror);
  addEditorMethods(CodeMirror); // Set up methods on CodeMirror's prototype to redirect to the editor's document.

  var dontDelegate = "iter insert remove copy getEditor constructor".split(" ");

  for (var prop in Doc.prototype) {
    if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0) {
      CodeMirror.prototype[prop] = function (method) {
        return function () {
          return method.apply(this.doc, arguments);
        };
      }(Doc.prototype[prop]);
    }
  }

  eventMixin(Doc); // INPUT HANDLING

  CodeMirror.inputStyles = {
    "textarea": TextareaInput,
    "contenteditable": ContentEditableInput
  }; // MODE DEFINITION AND QUERYING
  // Extra arguments are stored as the mode's dependencies, which is
  // used by (legacy) mechanisms like loadmode.js to automatically
  // load a mode. (Preferred mechanism is the require/define calls.)

  CodeMirror.defineMode = function (name
  /*, mode, …*/
  ) {
    if (!CodeMirror.defaults.mode && name != "null") {
      CodeMirror.defaults.mode = name;
    }

    defineMode.apply(this, arguments);
  };

  CodeMirror.defineMIME = defineMIME; // Minimal default mode.

  CodeMirror.defineMode("null", function () {
    return {
      token: function token(stream) {
        return stream.skipToEnd();
      }
    };
  });
  CodeMirror.defineMIME("text/plain", "null"); // EXTENSIONS

  CodeMirror.defineExtension = function (name, func) {
    CodeMirror.prototype[name] = func;
  };

  CodeMirror.defineDocExtension = function (name, func) {
    Doc.prototype[name] = func;
  };

  CodeMirror.fromTextArea = fromTextArea;
  addLegacyProps(CodeMirror);
  CodeMirror.version = "5.23.0";
  return CodeMirror;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhY2YtZmllbGRzL2NvZGVtaXJyb3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBfdHlwZW9mKG9iaik7IH1cblxuLy8gQ29kZU1pcnJvciwgY29weXJpZ2h0IChjKSBieSBNYXJpam4gSGF2ZXJiZWtlIGFuZCBvdGhlcnNcbi8vIERpc3RyaWJ1dGVkIHVuZGVyIGFuIE1JVCBsaWNlbnNlOiBodHRwOi8vY29kZW1pcnJvci5uZXQvTElDRU5TRVxuLy8gVGhpcyBpcyBDb2RlTWlycm9yIChodHRwOi8vY29kZW1pcnJvci5uZXQpLCBhIGNvZGUgZWRpdG9yXG4vLyBpbXBsZW1lbnRlZCBpbiBKYXZhU2NyaXB0IG9uIHRvcCBvZiB0aGUgYnJvd3NlcidzIERPTS5cbi8vXG4vLyBZb3UgY2FuIGZpbmQgc29tZSB0ZWNobmljYWwgYmFja2dyb3VuZCBmb3Igc29tZSBvZiB0aGUgY29kZSBiZWxvd1xuLy8gYXQgaHR0cDovL21hcmlqbmhhdmVyYmVrZS5ubC9ibG9nLyNjbS1pbnRlcm5hbHMgLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgKHR5cGVvZiBleHBvcnRzID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2YoZXhwb3J0cykpID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDogdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDogZ2xvYmFsLkNvZGVNaXJyb3IgPSBmYWN0b3J5KCk7XG59KSh2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnOyAvLyBLbHVkZ2VzIGZvciBidWdzIGFuZCBiZWhhdmlvciBkaWZmZXJlbmNlcyB0aGF0IGNhbid0IGJlIGZlYXR1cmVcbiAgLy8gZGV0ZWN0ZWQgYXJlIGVuYWJsZWQgYmFzZWQgb24gdXNlckFnZW50IGV0YyBzbmlmZmluZy5cblxuICB2YXIgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgdmFyIHBsYXRmb3JtID0gbmF2aWdhdG9yLnBsYXRmb3JtO1xuICB2YXIgZ2Vja28gPSAvZ2Vja29cXC9cXGQvaS50ZXN0KHVzZXJBZ2VudCk7XG4gIHZhciBpZV91cHRvMTAgPSAvTVNJRSBcXGQvLnRlc3QodXNlckFnZW50KTtcbiAgdmFyIGllXzExdXAgPSAvVHJpZGVudFxcLyg/Ols3LTldfFxcZHsyLH0pXFwuLipydjooXFxkKykvLmV4ZWModXNlckFnZW50KTtcbiAgdmFyIGllID0gaWVfdXB0bzEwIHx8IGllXzExdXA7XG4gIHZhciBpZV92ZXJzaW9uID0gaWUgJiYgKGllX3VwdG8xMCA/IGRvY3VtZW50LmRvY3VtZW50TW9kZSB8fCA2IDogaWVfMTF1cFsxXSk7XG4gIHZhciB3ZWJraXQgPSAvV2ViS2l0XFwvLy50ZXN0KHVzZXJBZ2VudCk7XG4gIHZhciBxdHdlYmtpdCA9IHdlYmtpdCAmJiAvUXRcXC9cXGQrXFwuXFxkKy8udGVzdCh1c2VyQWdlbnQpO1xuICB2YXIgY2hyb21lID0gL0Nocm9tZVxcLy8udGVzdCh1c2VyQWdlbnQpO1xuICB2YXIgcHJlc3RvID0gL09wZXJhXFwvLy50ZXN0KHVzZXJBZ2VudCk7XG4gIHZhciBzYWZhcmkgPSAvQXBwbGUgQ29tcHV0ZXIvLnRlc3QobmF2aWdhdG9yLnZlbmRvcik7XG4gIHZhciBtYWNfZ2VNb3VudGFpbkxpb24gPSAvTWFjIE9TIFggMVxcZFxcRChbOC05XXxcXGRcXGQpXFxELy50ZXN0KHVzZXJBZ2VudCk7XG4gIHZhciBwaGFudG9tID0gL1BoYW50b21KUy8udGVzdCh1c2VyQWdlbnQpO1xuICB2YXIgaW9zID0gL0FwcGxlV2ViS2l0Ly50ZXN0KHVzZXJBZ2VudCkgJiYgL01vYmlsZVxcL1xcdysvLnRlc3QodXNlckFnZW50KTsgLy8gVGhpcyBpcyB3b2VmdWxseSBpbmNvbXBsZXRlLiBTdWdnZXN0aW9ucyBmb3IgYWx0ZXJuYXRpdmUgbWV0aG9kcyB3ZWxjb21lLlxuXG4gIHZhciBtb2JpbGUgPSBpb3MgfHwgL0FuZHJvaWR8d2ViT1N8QmxhY2tCZXJyeXxPcGVyYSBNaW5pfE9wZXJhIE1vYml8SUVNb2JpbGUvaS50ZXN0KHVzZXJBZ2VudCk7XG4gIHZhciBtYWMgPSBpb3MgfHwgL01hYy8udGVzdChwbGF0Zm9ybSk7XG4gIHZhciBjaHJvbWVPUyA9IC9cXGJDck9TXFxiLy50ZXN0KHVzZXJBZ2VudCk7XG4gIHZhciB3aW5kb3dzID0gL3dpbi9pLnRlc3QocGxhdGZvcm0pO1xuICB2YXIgcHJlc3RvX3ZlcnNpb24gPSBwcmVzdG8gJiYgdXNlckFnZW50Lm1hdGNoKC9WZXJzaW9uXFwvKFxcZCpcXC5cXGQqKS8pO1xuXG4gIGlmIChwcmVzdG9fdmVyc2lvbikge1xuICAgIHByZXN0b192ZXJzaW9uID0gTnVtYmVyKHByZXN0b192ZXJzaW9uWzFdKTtcbiAgfVxuXG4gIGlmIChwcmVzdG9fdmVyc2lvbiAmJiBwcmVzdG9fdmVyc2lvbiA+PSAxNSkge1xuICAgIHByZXN0byA9IGZhbHNlO1xuICAgIHdlYmtpdCA9IHRydWU7XG4gIH0gLy8gU29tZSBicm93c2VycyB1c2UgdGhlIHdyb25nIGV2ZW50IHByb3BlcnRpZXMgdG8gc2lnbmFsIGNtZC9jdHJsIG9uIE9TIFhcblxuXG4gIHZhciBmbGlwQ3RybENtZCA9IG1hYyAmJiAocXR3ZWJraXQgfHwgcHJlc3RvICYmIChwcmVzdG9fdmVyc2lvbiA9PSBudWxsIHx8IHByZXN0b192ZXJzaW9uIDwgMTIuMTEpKTtcbiAgdmFyIGNhcHR1cmVSaWdodENsaWNrID0gZ2Vja28gfHwgaWUgJiYgaWVfdmVyc2lvbiA+PSA5O1xuXG4gIGZ1bmN0aW9uIGNsYXNzVGVzdChjbHMpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChcIihefFxcXFxzKVwiICsgY2xzICsgXCIoPzokfFxcXFxzKVxcXFxzKlwiKTtcbiAgfVxuXG4gIHZhciBybUNsYXNzID0gZnVuY3Rpb24gcm1DbGFzcyhub2RlLCBjbHMpIHtcbiAgICB2YXIgY3VycmVudCA9IG5vZGUuY2xhc3NOYW1lO1xuICAgIHZhciBtYXRjaCA9IGNsYXNzVGVzdChjbHMpLmV4ZWMoY3VycmVudCk7XG5cbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIHZhciBhZnRlciA9IGN1cnJlbnQuc2xpY2UobWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgbm9kZS5jbGFzc05hbWUgPSBjdXJyZW50LnNsaWNlKDAsIG1hdGNoLmluZGV4KSArIChhZnRlciA/IG1hdGNoWzFdICsgYWZ0ZXIgOiBcIlwiKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVtb3ZlQ2hpbGRyZW4oZSkge1xuICAgIGZvciAodmFyIGNvdW50ID0gZS5jaGlsZE5vZGVzLmxlbmd0aDsgY291bnQgPiAwOyAtLWNvdW50KSB7XG4gICAgICBlLnJlbW92ZUNoaWxkKGUuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGU7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVDaGlsZHJlbkFuZEFkZChwYXJlbnQsIGUpIHtcbiAgICByZXR1cm4gcmVtb3ZlQ2hpbGRyZW4ocGFyZW50KS5hcHBlbmRDaGlsZChlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVsdCh0YWcsIGNvbnRlbnQsIGNsYXNzTmFtZSwgc3R5bGUpIHtcbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcblxuICAgIGlmIChjbGFzc05hbWUpIHtcbiAgICAgIGUuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICAgIH1cblxuICAgIGlmIChzdHlsZSkge1xuICAgICAgZS5zdHlsZS5jc3NUZXh0ID0gc3R5bGU7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBjb250ZW50ID09IFwic3RyaW5nXCIpIHtcbiAgICAgIGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY29udGVudCkpO1xuICAgIH0gZWxzZSBpZiAoY29udGVudCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb250ZW50Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGUuYXBwZW5kQ2hpbGQoY29udGVudFtpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGU7XG4gIH1cblxuICB2YXIgcmFuZ2U7XG5cbiAgaWYgKGRvY3VtZW50LmNyZWF0ZVJhbmdlKSB7XG4gICAgcmFuZ2UgPSBmdW5jdGlvbiByYW5nZShub2RlLCBzdGFydCwgZW5kLCBlbmROb2RlKSB7XG4gICAgICB2YXIgciA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICByLnNldEVuZChlbmROb2RlIHx8IG5vZGUsIGVuZCk7XG4gICAgICByLnNldFN0YXJ0KG5vZGUsIHN0YXJ0KTtcbiAgICAgIHJldHVybiByO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmFuZ2UgPSBmdW5jdGlvbiByYW5nZShub2RlLCBzdGFydCwgZW5kKSB7XG4gICAgICB2YXIgciA9IGRvY3VtZW50LmJvZHkuY3JlYXRlVGV4dFJhbmdlKCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHIubW92ZVRvRWxlbWVudFRleHQobm9kZS5wYXJlbnROb2RlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgICB9XG5cbiAgICAgIHIuY29sbGFwc2UodHJ1ZSk7XG4gICAgICByLm1vdmVFbmQoXCJjaGFyYWN0ZXJcIiwgZW5kKTtcbiAgICAgIHIubW92ZVN0YXJ0KFwiY2hhcmFjdGVyXCIsIHN0YXJ0KTtcbiAgICAgIHJldHVybiByO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjb250YWlucyhwYXJlbnQsIGNoaWxkKSB7XG4gICAgaWYgKGNoaWxkLm5vZGVUeXBlID09IDMpIC8vIEFuZHJvaWQgYnJvd3NlciBhbHdheXMgcmV0dXJucyBmYWxzZSB3aGVuIGNoaWxkIGlzIGEgdGV4dG5vZGVcbiAgICAgIHtcbiAgICAgICAgY2hpbGQgPSBjaGlsZC5wYXJlbnROb2RlO1xuICAgICAgfVxuXG4gICAgaWYgKHBhcmVudC5jb250YWlucykge1xuICAgICAgcmV0dXJuIHBhcmVudC5jb250YWlucyhjaGlsZCk7XG4gICAgfVxuXG4gICAgZG8ge1xuICAgICAgaWYgKGNoaWxkLm5vZGVUeXBlID09IDExKSB7XG4gICAgICAgIGNoaWxkID0gY2hpbGQuaG9zdDtcbiAgICAgIH1cblxuICAgICAgaWYgKGNoaWxkID09IHBhcmVudCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IHdoaWxlIChjaGlsZCA9IGNoaWxkLnBhcmVudE5vZGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWN0aXZlRWx0KCkge1xuICAgIC8vIElFIGFuZCBFZGdlIG1heSB0aHJvdyBhbiBcIlVuc3BlY2lmaWVkIEVycm9yXCIgd2hlbiBhY2Nlc3NpbmcgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5cbiAgICAvLyBJRSA8IDEwIHdpbGwgdGhyb3cgd2hlbiBhY2Nlc3NlZCB3aGlsZSB0aGUgcGFnZSBpcyBsb2FkaW5nIG9yIGluIGFuIGlmcmFtZS5cbiAgICAvLyBJRSA+IDkgYW5kIEVkZ2Ugd2lsbCB0aHJvdyB3aGVuIGFjY2Vzc2VkIGluIGFuIGlmcmFtZSBpZiBkb2N1bWVudC5ib2R5IGlzIHVuYXZhaWxhYmxlLlxuICAgIHZhciBhY3RpdmVFbGVtZW50O1xuXG4gICAgdHJ5IHtcbiAgICAgIGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5ib2R5IHx8IG51bGw7XG4gICAgfVxuXG4gICAgd2hpbGUgKGFjdGl2ZUVsZW1lbnQgJiYgYWN0aXZlRWxlbWVudC5yb290ICYmIGFjdGl2ZUVsZW1lbnQucm9vdC5hY3RpdmVFbGVtZW50KSB7XG4gICAgICBhY3RpdmVFbGVtZW50ID0gYWN0aXZlRWxlbWVudC5yb290LmFjdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdGl2ZUVsZW1lbnQ7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRDbGFzcyhub2RlLCBjbHMpIHtcbiAgICB2YXIgY3VycmVudCA9IG5vZGUuY2xhc3NOYW1lO1xuXG4gICAgaWYgKCFjbGFzc1Rlc3QoY2xzKS50ZXN0KGN1cnJlbnQpKSB7XG4gICAgICBub2RlLmNsYXNzTmFtZSArPSAoY3VycmVudCA/IFwiIFwiIDogXCJcIikgKyBjbHM7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gam9pbkNsYXNzZXMoYSwgYikge1xuICAgIHZhciBhcyA9IGEuc3BsaXQoXCIgXCIpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFzW2ldICYmICFjbGFzc1Rlc3QoYXNbaV0pLnRlc3QoYikpIHtcbiAgICAgICAgYiArPSBcIiBcIiArIGFzW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBiO1xuICB9XG5cbiAgdmFyIHNlbGVjdElucHV0ID0gZnVuY3Rpb24gc2VsZWN0SW5wdXQobm9kZSkge1xuICAgIG5vZGUuc2VsZWN0KCk7XG4gIH07XG5cbiAgaWYgKGlvcykgLy8gTW9iaWxlIFNhZmFyaSBhcHBhcmVudGx5IGhhcyBhIGJ1ZyB3aGVyZSBzZWxlY3QoKSBpcyBicm9rZW4uXG4gICAge1xuICAgICAgc2VsZWN0SW5wdXQgPSBmdW5jdGlvbiBzZWxlY3RJbnB1dChub2RlKSB7XG4gICAgICAgIG5vZGUuc2VsZWN0aW9uU3RhcnQgPSAwO1xuICAgICAgICBub2RlLnNlbGVjdGlvbkVuZCA9IG5vZGUudmFsdWUubGVuZ3RoO1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGllKSAvLyBTdXBwcmVzcyBteXN0ZXJpb3VzIElFMTAgZXJyb3JzXG4gICAge1xuICAgICAgc2VsZWN0SW5wdXQgPSBmdW5jdGlvbiBzZWxlY3RJbnB1dChub2RlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbm9kZS5zZWxlY3QoKTtcbiAgICAgICAgfSBjYXRjaCAoX2UpIHt9XG4gICAgICB9O1xuICAgIH1cblxuICBmdW5jdGlvbiBiaW5kKGYpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjb3B5T2JqKG9iaiwgdGFyZ2V0LCBvdmVyd3JpdGUpIHtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgdGFyZ2V0ID0ge307XG4gICAgfVxuXG4gICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcCkgJiYgKG92ZXJ3cml0ZSAhPT0gZmFsc2UgfHwgIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShwcm9wKSkpIHtcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gb2JqW3Byb3BdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH0gLy8gQ291bnRzIHRoZSBjb2x1bW4gb2Zmc2V0IGluIGEgc3RyaW5nLCB0YWtpbmcgdGFicyBpbnRvIGFjY291bnQuXG4gIC8vIFVzZWQgbW9zdGx5IHRvIGZpbmQgaW5kZW50YXRpb24uXG5cblxuICBmdW5jdGlvbiBjb3VudENvbHVtbihzdHJpbmcsIGVuZCwgdGFiU2l6ZSwgc3RhcnRJbmRleCwgc3RhcnRWYWx1ZSkge1xuICAgIGlmIChlbmQgPT0gbnVsbCkge1xuICAgICAgZW5kID0gc3RyaW5nLnNlYXJjaCgvW15cXHNcXHUwMGEwXS8pO1xuXG4gICAgICBpZiAoZW5kID09IC0xKSB7XG4gICAgICAgIGVuZCA9IHN0cmluZy5sZW5ndGg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXggfHwgMCwgbiA9IHN0YXJ0VmFsdWUgfHwgMDs7KSB7XG4gICAgICB2YXIgbmV4dFRhYiA9IHN0cmluZy5pbmRleE9mKFwiXFx0XCIsIGkpO1xuXG4gICAgICBpZiAobmV4dFRhYiA8IDAgfHwgbmV4dFRhYiA+PSBlbmQpIHtcbiAgICAgICAgcmV0dXJuIG4gKyAoZW5kIC0gaSk7XG4gICAgICB9XG5cbiAgICAgIG4gKz0gbmV4dFRhYiAtIGk7XG4gICAgICBuICs9IHRhYlNpemUgLSBuICUgdGFiU2l6ZTtcbiAgICAgIGkgPSBuZXh0VGFiICsgMTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBEZWxheWVkKCkge1xuICAgIHRoaXMuaWQgPSBudWxsO1xuICB9XG5cbiAgRGVsYXllZC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKG1zLCBmKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgIHRoaXMuaWQgPSBzZXRUaW1lb3V0KGYsIG1zKTtcbiAgfTtcblxuICBmdW5jdGlvbiBpbmRleE9mKGFycmF5LCBlbHQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoYXJyYXlbaV0gPT0gZWx0KSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMTtcbiAgfSAvLyBOdW1iZXIgb2YgcGl4ZWxzIGFkZGVkIHRvIHNjcm9sbGVyIGFuZCBzaXplciB0byBoaWRlIHNjcm9sbGJhclxuXG5cbiAgdmFyIHNjcm9sbGVyR2FwID0gMzA7IC8vIFJldHVybmVkIG9yIHRocm93biBieSB2YXJpb3VzIHByb3RvY29scyB0byBzaWduYWwgJ0knbSBub3RcbiAgLy8gaGFuZGxpbmcgdGhpcycuXG5cbiAgdmFyIFBhc3MgPSB7XG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgICAgcmV0dXJuIFwiQ29kZU1pcnJvci5QYXNzXCI7XG4gICAgfVxuICB9OyAvLyBSZXVzZWQgb3B0aW9uIG9iamVjdHMgZm9yIHNldFNlbGVjdGlvbiAmIGZyaWVuZHNcblxuICB2YXIgc2VsX2RvbnRTY3JvbGwgPSB7XG4gICAgc2Nyb2xsOiBmYWxzZVxuICB9O1xuICB2YXIgc2VsX21vdXNlID0ge1xuICAgIG9yaWdpbjogXCIqbW91c2VcIlxuICB9O1xuICB2YXIgc2VsX21vdmUgPSB7XG4gICAgb3JpZ2luOiBcIittb3ZlXCJcbiAgfTsgLy8gVGhlIGludmVyc2Ugb2YgY291bnRDb2x1bW4gLS0gZmluZCB0aGUgb2Zmc2V0IHRoYXQgY29ycmVzcG9uZHMgdG9cbiAgLy8gYSBwYXJ0aWN1bGFyIGNvbHVtbi5cblxuICBmdW5jdGlvbiBmaW5kQ29sdW1uKHN0cmluZywgZ29hbCwgdGFiU2l6ZSkge1xuICAgIGZvciAodmFyIHBvcyA9IDAsIGNvbCA9IDA7Oykge1xuICAgICAgdmFyIG5leHRUYWIgPSBzdHJpbmcuaW5kZXhPZihcIlxcdFwiLCBwb3MpO1xuXG4gICAgICBpZiAobmV4dFRhYiA9PSAtMSkge1xuICAgICAgICBuZXh0VGFiID0gc3RyaW5nLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgdmFyIHNraXBwZWQgPSBuZXh0VGFiIC0gcG9zO1xuXG4gICAgICBpZiAobmV4dFRhYiA9PSBzdHJpbmcubGVuZ3RoIHx8IGNvbCArIHNraXBwZWQgPj0gZ29hbCkge1xuICAgICAgICByZXR1cm4gcG9zICsgTWF0aC5taW4oc2tpcHBlZCwgZ29hbCAtIGNvbCk7XG4gICAgICB9XG5cbiAgICAgIGNvbCArPSBuZXh0VGFiIC0gcG9zO1xuICAgICAgY29sICs9IHRhYlNpemUgLSBjb2wgJSB0YWJTaXplO1xuICAgICAgcG9zID0gbmV4dFRhYiArIDE7XG5cbiAgICAgIGlmIChjb2wgPj0gZ29hbCkge1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBzcGFjZVN0cnMgPSBbXCJcIl07XG5cbiAgZnVuY3Rpb24gc3BhY2VTdHIobikge1xuICAgIHdoaWxlIChzcGFjZVN0cnMubGVuZ3RoIDw9IG4pIHtcbiAgICAgIHNwYWNlU3Rycy5wdXNoKGxzdChzcGFjZVN0cnMpICsgXCIgXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBzcGFjZVN0cnNbbl07XG4gIH1cblxuICBmdW5jdGlvbiBsc3QoYXJyKSB7XG4gICAgcmV0dXJuIGFyclthcnIubGVuZ3RoIC0gMV07XG4gIH1cblxuICBmdW5jdGlvbiBtYXAoYXJyYXksIGYpIHtcbiAgICB2YXIgb3V0ID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBvdXRbaV0gPSBmKGFycmF5W2ldLCBpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5zZXJ0U29ydGVkKGFycmF5LCB2YWx1ZSwgc2NvcmUpIHtcbiAgICB2YXIgcG9zID0gMCxcbiAgICAgICAgcHJpb3JpdHkgPSBzY29yZSh2YWx1ZSk7XG5cbiAgICB3aGlsZSAocG9zIDwgYXJyYXkubGVuZ3RoICYmIHNjb3JlKGFycmF5W3Bvc10pIDw9IHByaW9yaXR5KSB7XG4gICAgICBwb3MrKztcbiAgICB9XG5cbiAgICBhcnJheS5zcGxpY2UocG9zLCAwLCB2YWx1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBub3RoaW5nKCkge31cblxuICBmdW5jdGlvbiBjcmVhdGVPYmooYmFzZSwgcHJvcHMpIHtcbiAgICB2YXIgaW5zdDtcblxuICAgIGlmIChPYmplY3QuY3JlYXRlKSB7XG4gICAgICBpbnN0ID0gT2JqZWN0LmNyZWF0ZShiYXNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm90aGluZy5wcm90b3R5cGUgPSBiYXNlO1xuICAgICAgaW5zdCA9IG5ldyBub3RoaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKHByb3BzKSB7XG4gICAgICBjb3B5T2JqKHByb3BzLCBpbnN0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zdDtcbiAgfVxuXG4gIHZhciBub25BU0NJSVNpbmdsZUNhc2VXb3JkQ2hhciA9IC9bXFx1MDBkZlxcdTA1ODdcXHUwNTkwLVxcdTA1ZjRcXHUwNjAwLVxcdTA2ZmZcXHUzMDQwLVxcdTMwOWZcXHUzMGEwLVxcdTMwZmZcXHUzNDAwLVxcdTRkYjVcXHU0ZTAwLVxcdTlmY2NcXHVhYzAwLVxcdWQ3YWZdLztcblxuICBmdW5jdGlvbiBpc1dvcmRDaGFyQmFzaWMoY2gpIHtcbiAgICByZXR1cm4gL1xcdy8udGVzdChjaCkgfHwgY2ggPiBcIlxceDgwXCIgJiYgKGNoLnRvVXBwZXJDYXNlKCkgIT0gY2gudG9Mb3dlckNhc2UoKSB8fCBub25BU0NJSVNpbmdsZUNhc2VXb3JkQ2hhci50ZXN0KGNoKSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc1dvcmRDaGFyKGNoLCBoZWxwZXIpIHtcbiAgICBpZiAoIWhlbHBlcikge1xuICAgICAgcmV0dXJuIGlzV29yZENoYXJCYXNpYyhjaCk7XG4gICAgfVxuXG4gICAgaWYgKGhlbHBlci5zb3VyY2UuaW5kZXhPZihcIlxcXFx3XCIpID4gLTEgJiYgaXNXb3JkQ2hhckJhc2ljKGNoKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhlbHBlci50ZXN0KGNoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRW1wdHkob2JqKSB7XG4gICAgZm9yICh2YXIgbiBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkobikgJiYgb2JqW25dKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSAvLyBFeHRlbmRpbmcgdW5pY29kZSBjaGFyYWN0ZXJzLiBBIHNlcmllcyBvZiBhIG5vbi1leHRlbmRpbmcgY2hhciArXG4gIC8vIGFueSBudW1iZXIgb2YgZXh0ZW5kaW5nIGNoYXJzIGlzIHRyZWF0ZWQgYXMgYSBzaW5nbGUgdW5pdCBhcyBmYXJcbiAgLy8gYXMgZWRpdGluZyBhbmQgbWVhc3VyaW5nIGlzIGNvbmNlcm5lZC4gVGhpcyBpcyBub3QgZnVsbHkgY29ycmVjdCxcbiAgLy8gc2luY2Ugc29tZSBzY3JpcHRzL2ZvbnRzL2Jyb3dzZXJzIGFsc28gdHJlYXQgb3RoZXIgY29uZmlndXJhdGlvbnNcbiAgLy8gb2YgY29kZSBwb2ludHMgYXMgYSBncm91cC5cblxuXG4gIHZhciBleHRlbmRpbmdDaGFycyA9IC9bXFx1MDMwMC1cXHUwMzZmXFx1MDQ4My1cXHUwNDg5XFx1MDU5MS1cXHUwNWJkXFx1MDViZlxcdTA1YzFcXHUwNWMyXFx1MDVjNFxcdTA1YzVcXHUwNWM3XFx1MDYxMC1cXHUwNjFhXFx1MDY0Yi1cXHUwNjVlXFx1MDY3MFxcdTA2ZDYtXFx1MDZkY1xcdTA2ZGUtXFx1MDZlNFxcdTA2ZTdcXHUwNmU4XFx1MDZlYS1cXHUwNmVkXFx1MDcxMVxcdTA3MzAtXFx1MDc0YVxcdTA3YTYtXFx1MDdiMFxcdTA3ZWItXFx1MDdmM1xcdTA4MTYtXFx1MDgxOVxcdTA4MWItXFx1MDgyM1xcdTA4MjUtXFx1MDgyN1xcdTA4MjktXFx1MDgyZFxcdTA5MDAtXFx1MDkwMlxcdTA5M2NcXHUwOTQxLVxcdTA5NDhcXHUwOTRkXFx1MDk1MS1cXHUwOTU1XFx1MDk2MlxcdTA5NjNcXHUwOTgxXFx1MDliY1xcdTA5YmVcXHUwOWMxLVxcdTA5YzRcXHUwOWNkXFx1MDlkN1xcdTA5ZTJcXHUwOWUzXFx1MGEwMVxcdTBhMDJcXHUwYTNjXFx1MGE0MVxcdTBhNDJcXHUwYTQ3XFx1MGE0OFxcdTBhNGItXFx1MGE0ZFxcdTBhNTFcXHUwYTcwXFx1MGE3MVxcdTBhNzVcXHUwYTgxXFx1MGE4MlxcdTBhYmNcXHUwYWMxLVxcdTBhYzVcXHUwYWM3XFx1MGFjOFxcdTBhY2RcXHUwYWUyXFx1MGFlM1xcdTBiMDFcXHUwYjNjXFx1MGIzZVxcdTBiM2ZcXHUwYjQxLVxcdTBiNDRcXHUwYjRkXFx1MGI1NlxcdTBiNTdcXHUwYjYyXFx1MGI2M1xcdTBiODJcXHUwYmJlXFx1MGJjMFxcdTBiY2RcXHUwYmQ3XFx1MGMzZS1cXHUwYzQwXFx1MGM0Ni1cXHUwYzQ4XFx1MGM0YS1cXHUwYzRkXFx1MGM1NVxcdTBjNTZcXHUwYzYyXFx1MGM2M1xcdTBjYmNcXHUwY2JmXFx1MGNjMlxcdTBjYzZcXHUwY2NjXFx1MGNjZFxcdTBjZDVcXHUwY2Q2XFx1MGNlMlxcdTBjZTNcXHUwZDNlXFx1MGQ0MS1cXHUwZDQ0XFx1MGQ0ZFxcdTBkNTdcXHUwZDYyXFx1MGQ2M1xcdTBkY2FcXHUwZGNmXFx1MGRkMi1cXHUwZGQ0XFx1MGRkNlxcdTBkZGZcXHUwZTMxXFx1MGUzNC1cXHUwZTNhXFx1MGU0Ny1cXHUwZTRlXFx1MGViMVxcdTBlYjQtXFx1MGViOVxcdTBlYmJcXHUwZWJjXFx1MGVjOC1cXHUwZWNkXFx1MGYxOFxcdTBmMTlcXHUwZjM1XFx1MGYzN1xcdTBmMzlcXHUwZjcxLVxcdTBmN2VcXHUwZjgwLVxcdTBmODRcXHUwZjg2XFx1MGY4N1xcdTBmOTAtXFx1MGY5N1xcdTBmOTktXFx1MGZiY1xcdTBmYzZcXHUxMDJkLVxcdTEwMzBcXHUxMDMyLVxcdTEwMzdcXHUxMDM5XFx1MTAzYVxcdTEwM2RcXHUxMDNlXFx1MTA1OFxcdTEwNTlcXHUxMDVlLVxcdTEwNjBcXHUxMDcxLVxcdTEwNzRcXHUxMDgyXFx1MTA4NVxcdTEwODZcXHUxMDhkXFx1MTA5ZFxcdTEzNWZcXHUxNzEyLVxcdTE3MTRcXHUxNzMyLVxcdTE3MzRcXHUxNzUyXFx1MTc1M1xcdTE3NzJcXHUxNzczXFx1MTdiNy1cXHUxN2JkXFx1MTdjNlxcdTE3YzktXFx1MTdkM1xcdTE3ZGRcXHUxODBiLVxcdTE4MGRcXHUxOGE5XFx1MTkyMC1cXHUxOTIyXFx1MTkyN1xcdTE5MjhcXHUxOTMyXFx1MTkzOS1cXHUxOTNiXFx1MWExN1xcdTFhMThcXHUxYTU2XFx1MWE1OC1cXHUxYTVlXFx1MWE2MFxcdTFhNjJcXHUxYTY1LVxcdTFhNmNcXHUxYTczLVxcdTFhN2NcXHUxYTdmXFx1MWIwMC1cXHUxYjAzXFx1MWIzNFxcdTFiMzYtXFx1MWIzYVxcdTFiM2NcXHUxYjQyXFx1MWI2Yi1cXHUxYjczXFx1MWI4MFxcdTFiODFcXHUxYmEyLVxcdTFiYTVcXHUxYmE4XFx1MWJhOVxcdTFjMmMtXFx1MWMzM1xcdTFjMzZcXHUxYzM3XFx1MWNkMC1cXHUxY2QyXFx1MWNkNC1cXHUxY2UwXFx1MWNlMi1cXHUxY2U4XFx1MWNlZFxcdTFkYzAtXFx1MWRlNlxcdTFkZmQtXFx1MWRmZlxcdTIwMGNcXHUyMDBkXFx1MjBkMC1cXHUyMGYwXFx1MmNlZi1cXHUyY2YxXFx1MmRlMC1cXHUyZGZmXFx1MzAyYS1cXHUzMDJmXFx1MzA5OVxcdTMwOWFcXHVhNjZmLVxcdWE2NzJcXHVhNjdjXFx1YTY3ZFxcdWE2ZjBcXHVhNmYxXFx1YTgwMlxcdWE4MDZcXHVhODBiXFx1YTgyNVxcdWE4MjZcXHVhOGM0XFx1YThlMC1cXHVhOGYxXFx1YTkyNi1cXHVhOTJkXFx1YTk0Ny1cXHVhOTUxXFx1YTk4MC1cXHVhOTgyXFx1YTliM1xcdWE5YjYtXFx1YTliOVxcdWE5YmNcXHVhYTI5LVxcdWFhMmVcXHVhYTMxXFx1YWEzMlxcdWFhMzVcXHVhYTM2XFx1YWE0M1xcdWFhNGNcXHVhYWIwXFx1YWFiMi1cXHVhYWI0XFx1YWFiN1xcdWFhYjhcXHVhYWJlXFx1YWFiZlxcdWFhYzFcXHVhYmU1XFx1YWJlOFxcdWFiZWRcXHVkYzAwLVxcdWRmZmZcXHVmYjFlXFx1ZmUwMC1cXHVmZTBmXFx1ZmUyMC1cXHVmZTI2XFx1ZmY5ZVxcdWZmOWZdLztcblxuICBmdW5jdGlvbiBpc0V4dGVuZGluZ0NoYXIoY2gpIHtcbiAgICByZXR1cm4gY2guY2hhckNvZGVBdCgwKSA+PSA3NjggJiYgZXh0ZW5kaW5nQ2hhcnMudGVzdChjaCk7XG4gIH0gLy8gVGhlIGRpc3BsYXkgaGFuZGxlcyB0aGUgRE9NIGludGVncmF0aW9uLCBib3RoIGZvciBpbnB1dCByZWFkaW5nXG4gIC8vIGFuZCBjb250ZW50IGRyYXdpbmcuIEl0IGhvbGRzIHJlZmVyZW5jZXMgdG8gRE9NIG5vZGVzIGFuZFxuICAvLyBkaXNwbGF5LXJlbGF0ZWQgc3RhdGUuXG5cblxuICBmdW5jdGlvbiBEaXNwbGF5KHBsYWNlLCBkb2MsIGlucHV0KSB7XG4gICAgdmFyIGQgPSB0aGlzO1xuICAgIHRoaXMuaW5wdXQgPSBpbnB1dDsgLy8gQ292ZXJzIGJvdHRvbS1yaWdodCBzcXVhcmUgd2hlbiBib3RoIHNjcm9sbGJhcnMgYXJlIHByZXNlbnQuXG5cbiAgICBkLnNjcm9sbGJhckZpbGxlciA9IGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3Itc2Nyb2xsYmFyLWZpbGxlclwiKTtcbiAgICBkLnNjcm9sbGJhckZpbGxlci5zZXRBdHRyaWJ1dGUoXCJjbS1ub3QtY29udGVudFwiLCBcInRydWVcIik7IC8vIENvdmVycyBib3R0b20gb2YgZ3V0dGVyIHdoZW4gY292ZXJHdXR0ZXJOZXh0VG9TY3JvbGxiYXIgaXMgb25cbiAgICAvLyBhbmQgaCBzY3JvbGxiYXIgaXMgcHJlc2VudC5cblxuICAgIGQuZ3V0dGVyRmlsbGVyID0gZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1ndXR0ZXItZmlsbGVyXCIpO1xuICAgIGQuZ3V0dGVyRmlsbGVyLnNldEF0dHJpYnV0ZShcImNtLW5vdC1jb250ZW50XCIsIFwidHJ1ZVwiKTsgLy8gV2lsbCBjb250YWluIHRoZSBhY3R1YWwgY29kZSwgcG9zaXRpb25lZCB0byBjb3ZlciB0aGUgdmlld3BvcnQuXG5cbiAgICBkLmxpbmVEaXYgPSBlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLWNvZGVcIik7IC8vIEVsZW1lbnRzIGFyZSBhZGRlZCB0byB0aGVzZSB0byByZXByZXNlbnQgc2VsZWN0aW9uIGFuZCBjdXJzb3JzLlxuXG4gICAgZC5zZWxlY3Rpb25EaXYgPSBlbHQoXCJkaXZcIiwgbnVsbCwgbnVsbCwgXCJwb3NpdGlvbjogcmVsYXRpdmU7IHotaW5kZXg6IDFcIik7XG4gICAgZC5jdXJzb3JEaXYgPSBlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLWN1cnNvcnNcIik7IC8vIEEgdmlzaWJpbGl0eTogaGlkZGVuIGVsZW1lbnQgdXNlZCB0byBmaW5kIHRoZSBzaXplIG9mIHRoaW5ncy5cblxuICAgIGQubWVhc3VyZSA9IGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3ItbWVhc3VyZVwiKTsgLy8gV2hlbiBsaW5lcyBvdXRzaWRlIG9mIHRoZSB2aWV3cG9ydCBhcmUgbWVhc3VyZWQsIHRoZXkgYXJlIGRyYXduIGluIHRoaXMuXG5cbiAgICBkLmxpbmVNZWFzdXJlID0gZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1tZWFzdXJlXCIpOyAvLyBXcmFwcyBldmVyeXRoaW5nIHRoYXQgbmVlZHMgdG8gZXhpc3QgaW5zaWRlIHRoZSB2ZXJ0aWNhbGx5LXBhZGRlZCBjb29yZGluYXRlIHN5c3RlbVxuXG4gICAgZC5saW5lU3BhY2UgPSBlbHQoXCJkaXZcIiwgW2QubWVhc3VyZSwgZC5saW5lTWVhc3VyZSwgZC5zZWxlY3Rpb25EaXYsIGQuY3Vyc29yRGl2LCBkLmxpbmVEaXZdLCBudWxsLCBcInBvc2l0aW9uOiByZWxhdGl2ZTsgb3V0bGluZTogbm9uZVwiKTsgLy8gTW92ZWQgYXJvdW5kIGl0cyBwYXJlbnQgdG8gY292ZXIgdmlzaWJsZSB2aWV3LlxuXG4gICAgZC5tb3ZlciA9IGVsdChcImRpdlwiLCBbZWx0KFwiZGl2XCIsIFtkLmxpbmVTcGFjZV0sIFwiQ29kZU1pcnJvci1saW5lc1wiKV0sIG51bGwsIFwicG9zaXRpb246IHJlbGF0aXZlXCIpOyAvLyBTZXQgdG8gdGhlIGhlaWdodCBvZiB0aGUgZG9jdW1lbnQsIGFsbG93aW5nIHNjcm9sbGluZy5cblxuICAgIGQuc2l6ZXIgPSBlbHQoXCJkaXZcIiwgW2QubW92ZXJdLCBcIkNvZGVNaXJyb3Itc2l6ZXJcIik7XG4gICAgZC5zaXplcldpZHRoID0gbnVsbDsgLy8gQmVoYXZpb3Igb2YgZWx0cyB3aXRoIG92ZXJmbG93OiBhdXRvIGFuZCBwYWRkaW5nIGlzXG4gICAgLy8gaW5jb25zaXN0ZW50IGFjcm9zcyBicm93c2Vycy4gVGhpcyBpcyB1c2VkIHRvIGVuc3VyZSB0aGVcbiAgICAvLyBzY3JvbGxhYmxlIGFyZWEgaXMgYmlnIGVub3VnaC5cblxuICAgIGQuaGVpZ2h0Rm9yY2VyID0gZWx0KFwiZGl2XCIsIG51bGwsIG51bGwsIFwicG9zaXRpb246IGFic29sdXRlOyBoZWlnaHQ6IFwiICsgc2Nyb2xsZXJHYXAgKyBcInB4OyB3aWR0aDogMXB4O1wiKTsgLy8gV2lsbCBjb250YWluIHRoZSBndXR0ZXJzLCBpZiBhbnkuXG5cbiAgICBkLmd1dHRlcnMgPSBlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLWd1dHRlcnNcIik7XG4gICAgZC5saW5lR3V0dGVyID0gbnVsbDsgLy8gQWN0dWFsIHNjcm9sbGFibGUgZWxlbWVudC5cblxuICAgIGQuc2Nyb2xsZXIgPSBlbHQoXCJkaXZcIiwgW2Quc2l6ZXIsIGQuaGVpZ2h0Rm9yY2VyLCBkLmd1dHRlcnNdLCBcIkNvZGVNaXJyb3Itc2Nyb2xsXCIpO1xuICAgIGQuc2Nyb2xsZXIuc2V0QXR0cmlidXRlKFwidGFiSW5kZXhcIiwgXCItMVwiKTsgLy8gVGhlIGVsZW1lbnQgaW4gd2hpY2ggdGhlIGVkaXRvciBsaXZlcy5cblxuICAgIGQud3JhcHBlciA9IGVsdChcImRpdlwiLCBbZC5zY3JvbGxiYXJGaWxsZXIsIGQuZ3V0dGVyRmlsbGVyLCBkLnNjcm9sbGVyXSwgXCJDb2RlTWlycm9yXCIpOyAvLyBXb3JrIGFyb3VuZCBJRTcgei1pbmRleCBidWcgKG5vdCBwZXJmZWN0LCBoZW5jZSBJRTcgbm90IHJlYWxseSBiZWluZyBzdXBwb3J0ZWQpXG5cbiAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA8IDgpIHtcbiAgICAgIGQuZ3V0dGVycy5zdHlsZS56SW5kZXggPSAtMTtcbiAgICAgIGQuc2Nyb2xsZXIuc3R5bGUucGFkZGluZ1JpZ2h0ID0gMDtcbiAgICB9XG5cbiAgICBpZiAoIXdlYmtpdCAmJiAhKGdlY2tvICYmIG1vYmlsZSkpIHtcbiAgICAgIGQuc2Nyb2xsZXIuZHJhZ2dhYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAocGxhY2UpIHtcbiAgICAgIGlmIChwbGFjZS5hcHBlbmRDaGlsZCkge1xuICAgICAgICBwbGFjZS5hcHBlbmRDaGlsZChkLndyYXBwZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGxhY2UoZC53cmFwcGVyKTtcbiAgICAgIH1cbiAgICB9IC8vIEN1cnJlbnQgcmVuZGVyZWQgcmFuZ2UgKG1heSBiZSBiaWdnZXIgdGhhbiB0aGUgdmlldyB3aW5kb3cpLlxuXG5cbiAgICBkLnZpZXdGcm9tID0gZC52aWV3VG8gPSBkb2MuZmlyc3Q7XG4gICAgZC5yZXBvcnRlZFZpZXdGcm9tID0gZC5yZXBvcnRlZFZpZXdUbyA9IGRvYy5maXJzdDsgLy8gSW5mb3JtYXRpb24gYWJvdXQgdGhlIHJlbmRlcmVkIGxpbmVzLlxuXG4gICAgZC52aWV3ID0gW107XG4gICAgZC5yZW5kZXJlZFZpZXcgPSBudWxsOyAvLyBIb2xkcyBpbmZvIGFib3V0IGEgc2luZ2xlIHJlbmRlcmVkIGxpbmUgd2hlbiBpdCB3YXMgcmVuZGVyZWRcbiAgICAvLyBmb3IgbWVhc3VyZW1lbnQsIHdoaWxlIG5vdCBpbiB2aWV3LlxuXG4gICAgZC5leHRlcm5hbE1lYXN1cmVkID0gbnVsbDsgLy8gRW1wdHkgc3BhY2UgKGluIHBpeGVscykgYWJvdmUgdGhlIHZpZXdcblxuICAgIGQudmlld09mZnNldCA9IDA7XG4gICAgZC5sYXN0V3JhcEhlaWdodCA9IGQubGFzdFdyYXBXaWR0aCA9IDA7XG4gICAgZC51cGRhdGVMaW5lTnVtYmVycyA9IG51bGw7XG4gICAgZC5uYXRpdmVCYXJXaWR0aCA9IGQuYmFySGVpZ2h0ID0gZC5iYXJXaWR0aCA9IDA7XG4gICAgZC5zY3JvbGxiYXJzQ2xpcHBlZCA9IGZhbHNlOyAvLyBVc2VkIHRvIG9ubHkgcmVzaXplIHRoZSBsaW5lIG51bWJlciBndXR0ZXIgd2hlbiBuZWNlc3NhcnkgKHdoZW5cbiAgICAvLyB0aGUgYW1vdW50IG9mIGxpbmVzIGNyb3NzZXMgYSBib3VuZGFyeSB0aGF0IG1ha2VzIGl0cyB3aWR0aCBjaGFuZ2UpXG5cbiAgICBkLmxpbmVOdW1XaWR0aCA9IGQubGluZU51bUlubmVyV2lkdGggPSBkLmxpbmVOdW1DaGFycyA9IG51bGw7IC8vIFNldCB0byB0cnVlIHdoZW4gYSBub24taG9yaXpvbnRhbC1zY3JvbGxpbmcgbGluZSB3aWRnZXQgaXNcbiAgICAvLyBhZGRlZC4gQXMgYW4gb3B0aW1pemF0aW9uLCBsaW5lIHdpZGdldCBhbGlnbmluZyBpcyBza2lwcGVkIHdoZW5cbiAgICAvLyB0aGlzIGlzIGZhbHNlLlxuXG4gICAgZC5hbGlnbldpZGdldHMgPSBmYWxzZTtcbiAgICBkLmNhY2hlZENoYXJXaWR0aCA9IGQuY2FjaGVkVGV4dEhlaWdodCA9IGQuY2FjaGVkUGFkZGluZ0ggPSBudWxsOyAvLyBUcmFja3MgdGhlIG1heGltdW0gbGluZSBsZW5ndGggc28gdGhhdCB0aGUgaG9yaXpvbnRhbCBzY3JvbGxiYXJcbiAgICAvLyBjYW4gYmUga2VwdCBzdGF0aWMgd2hlbiBzY3JvbGxpbmcuXG5cbiAgICBkLm1heExpbmUgPSBudWxsO1xuICAgIGQubWF4TGluZUxlbmd0aCA9IDA7XG4gICAgZC5tYXhMaW5lQ2hhbmdlZCA9IGZhbHNlOyAvLyBVc2VkIGZvciBtZWFzdXJpbmcgd2hlZWwgc2Nyb2xsaW5nIGdyYW51bGFyaXR5XG5cbiAgICBkLndoZWVsRFggPSBkLndoZWVsRFkgPSBkLndoZWVsU3RhcnRYID0gZC53aGVlbFN0YXJ0WSA9IG51bGw7IC8vIFRydWUgd2hlbiBzaGlmdCBpcyBoZWxkIGRvd24uXG5cbiAgICBkLnNoaWZ0ID0gZmFsc2U7IC8vIFVzZWQgdG8gdHJhY2sgd2hldGhlciBhbnl0aGluZyBoYXBwZW5lZCBzaW5jZSB0aGUgY29udGV4dCBtZW51XG4gICAgLy8gd2FzIG9wZW5lZC5cblxuICAgIGQuc2VsRm9yQ29udGV4dE1lbnUgPSBudWxsO1xuICAgIGQuYWN0aXZlVG91Y2ggPSBudWxsO1xuICAgIGlucHV0LmluaXQoZCk7XG4gIH0gLy8gRmluZCB0aGUgbGluZSBvYmplY3QgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gbGluZSBudW1iZXIuXG5cblxuICBmdW5jdGlvbiBnZXRMaW5lKGRvYywgbikge1xuICAgIG4gLT0gZG9jLmZpcnN0O1xuXG4gICAgaWYgKG4gPCAwIHx8IG4gPj0gZG9jLnNpemUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZXJlIGlzIG5vIGxpbmUgXCIgKyAobiArIGRvYy5maXJzdCkgKyBcIiBpbiB0aGUgZG9jdW1lbnQuXCIpO1xuICAgIH1cblxuICAgIHZhciBjaHVuayA9IGRvYztcblxuICAgIHdoaWxlICghY2h1bmsubGluZXMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOzsgKytpKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGNodW5rLmNoaWxkcmVuW2ldLFxuICAgICAgICAgICAgc3ogPSBjaGlsZC5jaHVua1NpemUoKTtcblxuICAgICAgICBpZiAobiA8IHN6KSB7XG4gICAgICAgICAgY2h1bmsgPSBjaGlsZDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIG4gLT0gc3o7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNodW5rLmxpbmVzW25dO1xuICB9IC8vIEdldCB0aGUgcGFydCBvZiBhIGRvY3VtZW50IGJldHdlZW4gdHdvIHBvc2l0aW9ucywgYXMgYW4gYXJyYXkgb2ZcbiAgLy8gc3RyaW5ncy5cblxuXG4gIGZ1bmN0aW9uIGdldEJldHdlZW4oZG9jLCBzdGFydCwgZW5kKSB7XG4gICAgdmFyIG91dCA9IFtdLFxuICAgICAgICBuID0gc3RhcnQubGluZTtcbiAgICBkb2MuaXRlcihzdGFydC5saW5lLCBlbmQubGluZSArIDEsIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICB2YXIgdGV4dCA9IGxpbmUudGV4dDtcblxuICAgICAgaWYgKG4gPT0gZW5kLmxpbmUpIHtcbiAgICAgICAgdGV4dCA9IHRleHQuc2xpY2UoMCwgZW5kLmNoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG4gPT0gc3RhcnQubGluZSkge1xuICAgICAgICB0ZXh0ID0gdGV4dC5zbGljZShzdGFydC5jaCk7XG4gICAgICB9XG5cbiAgICAgIG91dC5wdXNoKHRleHQpO1xuICAgICAgKytuO1xuICAgIH0pO1xuICAgIHJldHVybiBvdXQ7XG4gIH0gLy8gR2V0IHRoZSBsaW5lcyBiZXR3ZWVuIGZyb20gYW5kIHRvLCBhcyBhcnJheSBvZiBzdHJpbmdzLlxuXG5cbiAgZnVuY3Rpb24gZ2V0TGluZXMoZG9jLCBmcm9tLCB0bykge1xuICAgIHZhciBvdXQgPSBbXTtcbiAgICBkb2MuaXRlcihmcm9tLCB0bywgZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgIG91dC5wdXNoKGxpbmUudGV4dCk7XG4gICAgfSk7IC8vIGl0ZXIgYWJvcnRzIHdoZW4gY2FsbGJhY2sgcmV0dXJucyB0cnV0aHkgdmFsdWVcblxuICAgIHJldHVybiBvdXQ7XG4gIH0gLy8gVXBkYXRlIHRoZSBoZWlnaHQgb2YgYSBsaW5lLCBwcm9wYWdhdGluZyB0aGUgaGVpZ2h0IGNoYW5nZVxuICAvLyB1cHdhcmRzIHRvIHBhcmVudCBub2Rlcy5cblxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgaGVpZ2h0KSB7XG4gICAgdmFyIGRpZmYgPSBoZWlnaHQgLSBsaW5lLmhlaWdodDtcblxuICAgIGlmIChkaWZmKSB7XG4gICAgICBmb3IgKHZhciBuID0gbGluZTsgbjsgbiA9IG4ucGFyZW50KSB7XG4gICAgICAgIG4uaGVpZ2h0ICs9IGRpZmY7XG4gICAgICB9XG4gICAgfVxuICB9IC8vIEdpdmVuIGEgbGluZSBvYmplY3QsIGZpbmQgaXRzIGxpbmUgbnVtYmVyIGJ5IHdhbGtpbmcgdXAgdGhyb3VnaFxuICAvLyBpdHMgcGFyZW50IGxpbmtzLlxuXG5cbiAgZnVuY3Rpb24gbGluZU5vKGxpbmUpIHtcbiAgICBpZiAobGluZS5wYXJlbnQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGN1ciA9IGxpbmUucGFyZW50LFxuICAgICAgICBubyA9IGluZGV4T2YoY3VyLmxpbmVzLCBsaW5lKTtcblxuICAgIGZvciAodmFyIGNodW5rID0gY3VyLnBhcmVudDsgY2h1bms7IGN1ciA9IGNodW5rLCBjaHVuayA9IGNodW5rLnBhcmVudCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7OyArK2kpIHtcbiAgICAgICAgaWYgKGNodW5rLmNoaWxkcmVuW2ldID09IGN1cikge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgbm8gKz0gY2h1bmsuY2hpbGRyZW5baV0uY2h1bmtTaXplKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vICsgY3VyLmZpcnN0O1xuICB9IC8vIEZpbmQgdGhlIGxpbmUgYXQgdGhlIGdpdmVuIHZlcnRpY2FsIHBvc2l0aW9uLCB1c2luZyB0aGUgaGVpZ2h0XG4gIC8vIGluZm9ybWF0aW9uIGluIHRoZSBkb2N1bWVudCB0cmVlLlxuXG5cbiAgZnVuY3Rpb24gX2xpbmVBdEhlaWdodChjaHVuaywgaCkge1xuICAgIHZhciBuID0gY2h1bmsuZmlyc3Q7XG5cbiAgICBvdXRlcjogZG8ge1xuICAgICAgZm9yICh2YXIgaSQxID0gMDsgaSQxIDwgY2h1bmsuY2hpbGRyZW4ubGVuZ3RoOyArK2kkMSkge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaHVuay5jaGlsZHJlbltpJDFdLFxuICAgICAgICAgICAgY2ggPSBjaGlsZC5oZWlnaHQ7XG5cbiAgICAgICAgaWYgKGggPCBjaCkge1xuICAgICAgICAgIGNodW5rID0gY2hpbGQ7XG4gICAgICAgICAgY29udGludWUgb3V0ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBoIC09IGNoO1xuICAgICAgICBuICs9IGNoaWxkLmNodW5rU2l6ZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbjtcbiAgICB9IHdoaWxlICghY2h1bmsubGluZXMpO1xuXG4gICAgdmFyIGkgPSAwO1xuXG4gICAgZm9yICg7IGkgPCBjaHVuay5saW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGxpbmUgPSBjaHVuay5saW5lc1tpXSxcbiAgICAgICAgICBsaCA9IGxpbmUuaGVpZ2h0O1xuXG4gICAgICBpZiAoaCA8IGxoKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBoIC09IGxoO1xuICAgIH1cblxuICAgIHJldHVybiBuICsgaTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTGluZShkb2MsIGwpIHtcbiAgICByZXR1cm4gbCA+PSBkb2MuZmlyc3QgJiYgbCA8IGRvYy5maXJzdCArIGRvYy5zaXplO1xuICB9XG5cbiAgZnVuY3Rpb24gbGluZU51bWJlckZvcihvcHRpb25zLCBpKSB7XG4gICAgcmV0dXJuIFN0cmluZyhvcHRpb25zLmxpbmVOdW1iZXJGb3JtYXR0ZXIoaSArIG9wdGlvbnMuZmlyc3RMaW5lTnVtYmVyKSk7XG4gIH0gLy8gQSBQb3MgaW5zdGFuY2UgcmVwcmVzZW50cyBhIHBvc2l0aW9uIHdpdGhpbiB0aGUgdGV4dC5cblxuXG4gIGZ1bmN0aW9uIFBvcyhsaW5lLCBjaCkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQb3MpKSB7XG4gICAgICByZXR1cm4gbmV3IFBvcyhsaW5lLCBjaCk7XG4gICAgfVxuXG4gICAgdGhpcy5saW5lID0gbGluZTtcbiAgICB0aGlzLmNoID0gY2g7XG4gIH0gLy8gQ29tcGFyZSB0d28gcG9zaXRpb25zLCByZXR1cm4gMCBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgYSBuZWdhdGl2ZVxuICAvLyBudW1iZXIgd2hlbiBhIGlzIGxlc3MsIGFuZCBhIHBvc2l0aXZlIG51bWJlciBvdGhlcndpc2UuXG5cblxuICBmdW5jdGlvbiBjbXAoYSwgYikge1xuICAgIHJldHVybiBhLmxpbmUgLSBiLmxpbmUgfHwgYS5jaCAtIGIuY2g7XG4gIH1cblxuICBmdW5jdGlvbiBjb3B5UG9zKHgpIHtcbiAgICByZXR1cm4gUG9zKHgubGluZSwgeC5jaCk7XG4gIH1cblxuICBmdW5jdGlvbiBtYXhQb3MoYSwgYikge1xuICAgIHJldHVybiBjbXAoYSwgYikgPCAwID8gYiA6IGE7XG4gIH1cblxuICBmdW5jdGlvbiBtaW5Qb3MoYSwgYikge1xuICAgIHJldHVybiBjbXAoYSwgYikgPCAwID8gYSA6IGI7XG4gIH0gLy8gTW9zdCBvZiB0aGUgZXh0ZXJuYWwgQVBJIGNsaXBzIGdpdmVuIHBvc2l0aW9ucyB0byBtYWtlIHN1cmUgdGhleVxuICAvLyBhY3R1YWxseSBleGlzdCB3aXRoaW4gdGhlIGRvY3VtZW50LlxuXG5cbiAgZnVuY3Rpb24gY2xpcExpbmUoZG9jLCBuKSB7XG4gICAgcmV0dXJuIE1hdGgubWF4KGRvYy5maXJzdCwgTWF0aC5taW4obiwgZG9jLmZpcnN0ICsgZG9jLnNpemUgLSAxKSk7XG4gIH1cblxuICBmdW5jdGlvbiBfY2xpcFBvcyhkb2MsIHBvcykge1xuICAgIGlmIChwb3MubGluZSA8IGRvYy5maXJzdCkge1xuICAgICAgcmV0dXJuIFBvcyhkb2MuZmlyc3QsIDApO1xuICAgIH1cblxuICAgIHZhciBsYXN0ID0gZG9jLmZpcnN0ICsgZG9jLnNpemUgLSAxO1xuXG4gICAgaWYgKHBvcy5saW5lID4gbGFzdCkge1xuICAgICAgcmV0dXJuIFBvcyhsYXN0LCBnZXRMaW5lKGRvYywgbGFzdCkudGV4dC5sZW5ndGgpO1xuICAgIH1cblxuICAgIHJldHVybiBjbGlwVG9MZW4ocG9zLCBnZXRMaW5lKGRvYywgcG9zLmxpbmUpLnRleHQubGVuZ3RoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsaXBUb0xlbihwb3MsIGxpbmVsZW4pIHtcbiAgICB2YXIgY2ggPSBwb3MuY2g7XG5cbiAgICBpZiAoY2ggPT0gbnVsbCB8fCBjaCA+IGxpbmVsZW4pIHtcbiAgICAgIHJldHVybiBQb3MocG9zLmxpbmUsIGxpbmVsZW4pO1xuICAgIH0gZWxzZSBpZiAoY2ggPCAwKSB7XG4gICAgICByZXR1cm4gUG9zKHBvcy5saW5lLCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBvcztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbGlwUG9zQXJyYXkoZG9jLCBhcnJheSkge1xuICAgIHZhciBvdXQgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIG91dFtpXSA9IF9jbGlwUG9zKGRvYywgYXJyYXlbaV0pO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH0gLy8gT3B0aW1pemUgc29tZSBjb2RlIHdoZW4gdGhlc2UgZmVhdHVyZXMgYXJlIG5vdCB1c2VkLlxuXG5cbiAgdmFyIHNhd1JlYWRPbmx5U3BhbnMgPSBmYWxzZTtcbiAgdmFyIHNhd0NvbGxhcHNlZFNwYW5zID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gc2VlUmVhZE9ubHlTcGFucygpIHtcbiAgICBzYXdSZWFkT25seVNwYW5zID0gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlZUNvbGxhcHNlZFNwYW5zKCkge1xuICAgIHNhd0NvbGxhcHNlZFNwYW5zID0gdHJ1ZTtcbiAgfSAvLyBURVhUTUFSS0VSIFNQQU5TXG5cblxuICBmdW5jdGlvbiBNYXJrZWRTcGFuKG1hcmtlciwgZnJvbSwgdG8pIHtcbiAgICB0aGlzLm1hcmtlciA9IG1hcmtlcjtcbiAgICB0aGlzLmZyb20gPSBmcm9tO1xuICAgIHRoaXMudG8gPSB0bztcbiAgfSAvLyBTZWFyY2ggYW4gYXJyYXkgb2Ygc3BhbnMgZm9yIGEgc3BhbiBtYXRjaGluZyB0aGUgZ2l2ZW4gbWFya2VyLlxuXG5cbiAgZnVuY3Rpb24gZ2V0TWFya2VkU3BhbkZvcihzcGFucywgbWFya2VyKSB7XG4gICAgaWYgKHNwYW5zKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBzcGFuID0gc3BhbnNbaV07XG5cbiAgICAgICAgaWYgKHNwYW4ubWFya2VyID09IG1hcmtlcikge1xuICAgICAgICAgIHJldHVybiBzcGFuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IC8vIFJlbW92ZSBhIHNwYW4gZnJvbSBhbiBhcnJheSwgcmV0dXJuaW5nIHVuZGVmaW5lZCBpZiBubyBzcGFucyBhcmVcbiAgLy8gbGVmdCAod2UgZG9uJ3Qgc3RvcmUgYXJyYXlzIGZvciBsaW5lcyB3aXRob3V0IHNwYW5zKS5cblxuXG4gIGZ1bmN0aW9uIHJlbW92ZU1hcmtlZFNwYW4oc3BhbnMsIHNwYW4pIHtcbiAgICB2YXIgcjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BhbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChzcGFuc1tpXSAhPSBzcGFuKSB7XG4gICAgICAgIChyIHx8IChyID0gW10pKS5wdXNoKHNwYW5zW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcjtcbiAgfSAvLyBBZGQgYSBzcGFuIHRvIGEgbGluZS5cblxuXG4gIGZ1bmN0aW9uIGFkZE1hcmtlZFNwYW4obGluZSwgc3Bhbikge1xuICAgIGxpbmUubWFya2VkU3BhbnMgPSBsaW5lLm1hcmtlZFNwYW5zID8gbGluZS5tYXJrZWRTcGFucy5jb25jYXQoW3NwYW5dKSA6IFtzcGFuXTtcbiAgICBzcGFuLm1hcmtlci5hdHRhY2hMaW5lKGxpbmUpO1xuICB9IC8vIFVzZWQgZm9yIHRoZSBhbGdvcml0aG0gdGhhdCBhZGp1c3RzIG1hcmtlcnMgZm9yIGEgY2hhbmdlIGluIHRoZVxuICAvLyBkb2N1bWVudC4gVGhlc2UgZnVuY3Rpb25zIGN1dCBhbiBhcnJheSBvZiBzcGFucyBhdCBhIGdpdmVuXG4gIC8vIGNoYXJhY3RlciBwb3NpdGlvbiwgcmV0dXJuaW5nIGFuIGFycmF5IG9mIHJlbWFpbmluZyBjaHVua3MgKG9yXG4gIC8vIHVuZGVmaW5lZCBpZiBub3RoaW5nIHJlbWFpbnMpLlxuXG5cbiAgZnVuY3Rpb24gbWFya2VkU3BhbnNCZWZvcmUob2xkLCBzdGFydENoLCBpc0luc2VydCkge1xuICAgIHZhciBudztcblxuICAgIGlmIChvbGQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2xkLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBzcGFuID0gb2xkW2ldLFxuICAgICAgICAgICAgbWFya2VyID0gc3Bhbi5tYXJrZXI7XG4gICAgICAgIHZhciBzdGFydHNCZWZvcmUgPSBzcGFuLmZyb20gPT0gbnVsbCB8fCAobWFya2VyLmluY2x1c2l2ZUxlZnQgPyBzcGFuLmZyb20gPD0gc3RhcnRDaCA6IHNwYW4uZnJvbSA8IHN0YXJ0Q2gpO1xuXG4gICAgICAgIGlmIChzdGFydHNCZWZvcmUgfHwgc3Bhbi5mcm9tID09IHN0YXJ0Q2ggJiYgbWFya2VyLnR5cGUgPT0gXCJib29rbWFya1wiICYmICghaXNJbnNlcnQgfHwgIXNwYW4ubWFya2VyLmluc2VydExlZnQpKSB7XG4gICAgICAgICAgdmFyIGVuZHNBZnRlciA9IHNwYW4udG8gPT0gbnVsbCB8fCAobWFya2VyLmluY2x1c2l2ZVJpZ2h0ID8gc3Bhbi50byA+PSBzdGFydENoIDogc3Bhbi50byA+IHN0YXJ0Q2gpO1xuICAgICAgICAgIChudyB8fCAobncgPSBbXSkpLnB1c2gobmV3IE1hcmtlZFNwYW4obWFya2VyLCBzcGFuLmZyb20sIGVuZHNBZnRlciA/IG51bGwgOiBzcGFuLnRvKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnc7XG4gIH1cblxuICBmdW5jdGlvbiBtYXJrZWRTcGFuc0FmdGVyKG9sZCwgZW5kQ2gsIGlzSW5zZXJ0KSB7XG4gICAgdmFyIG53O1xuXG4gICAgaWYgKG9sZCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGQubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHNwYW4gPSBvbGRbaV0sXG4gICAgICAgICAgICBtYXJrZXIgPSBzcGFuLm1hcmtlcjtcbiAgICAgICAgdmFyIGVuZHNBZnRlciA9IHNwYW4udG8gPT0gbnVsbCB8fCAobWFya2VyLmluY2x1c2l2ZVJpZ2h0ID8gc3Bhbi50byA+PSBlbmRDaCA6IHNwYW4udG8gPiBlbmRDaCk7XG5cbiAgICAgICAgaWYgKGVuZHNBZnRlciB8fCBzcGFuLmZyb20gPT0gZW5kQ2ggJiYgbWFya2VyLnR5cGUgPT0gXCJib29rbWFya1wiICYmICghaXNJbnNlcnQgfHwgc3Bhbi5tYXJrZXIuaW5zZXJ0TGVmdCkpIHtcbiAgICAgICAgICB2YXIgc3RhcnRzQmVmb3JlID0gc3Bhbi5mcm9tID09IG51bGwgfHwgKG1hcmtlci5pbmNsdXNpdmVMZWZ0ID8gc3Bhbi5mcm9tIDw9IGVuZENoIDogc3Bhbi5mcm9tIDwgZW5kQ2gpO1xuICAgICAgICAgIChudyB8fCAobncgPSBbXSkpLnB1c2gobmV3IE1hcmtlZFNwYW4obWFya2VyLCBzdGFydHNCZWZvcmUgPyBudWxsIDogc3Bhbi5mcm9tIC0gZW5kQ2gsIHNwYW4udG8gPT0gbnVsbCA/IG51bGwgOiBzcGFuLnRvIC0gZW5kQ2gpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudztcbiAgfSAvLyBHaXZlbiBhIGNoYW5nZSBvYmplY3QsIGNvbXB1dGUgdGhlIG5ldyBzZXQgb2YgbWFya2VyIHNwYW5zIHRoYXRcbiAgLy8gY292ZXIgdGhlIGxpbmUgaW4gd2hpY2ggdGhlIGNoYW5nZSB0b29rIHBsYWNlLiBSZW1vdmVzIHNwYW5zXG4gIC8vIGVudGlyZWx5IHdpdGhpbiB0aGUgY2hhbmdlLCByZWNvbm5lY3RzIHNwYW5zIGJlbG9uZ2luZyB0byB0aGVcbiAgLy8gc2FtZSBtYXJrZXIgdGhhdCBhcHBlYXIgb24gYm90aCBzaWRlcyBvZiB0aGUgY2hhbmdlLCBhbmQgY3V0cyBvZmZcbiAgLy8gc3BhbnMgcGFydGlhbGx5IHdpdGhpbiB0aGUgY2hhbmdlLiBSZXR1cm5zIGFuIGFycmF5IG9mIHNwYW5cbiAgLy8gYXJyYXlzIHdpdGggb25lIGVsZW1lbnQgZm9yIGVhY2ggbGluZSBpbiAoYWZ0ZXIpIHRoZSBjaGFuZ2UuXG5cblxuICBmdW5jdGlvbiBzdHJldGNoU3BhbnNPdmVyQ2hhbmdlKGRvYywgY2hhbmdlKSB7XG4gICAgaWYgKGNoYW5nZS5mdWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgb2xkRmlyc3QgPSBpc0xpbmUoZG9jLCBjaGFuZ2UuZnJvbS5saW5lKSAmJiBnZXRMaW5lKGRvYywgY2hhbmdlLmZyb20ubGluZSkubWFya2VkU3BhbnM7XG4gICAgdmFyIG9sZExhc3QgPSBpc0xpbmUoZG9jLCBjaGFuZ2UudG8ubGluZSkgJiYgZ2V0TGluZShkb2MsIGNoYW5nZS50by5saW5lKS5tYXJrZWRTcGFucztcblxuICAgIGlmICghb2xkRmlyc3QgJiYgIW9sZExhc3QpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBzdGFydENoID0gY2hhbmdlLmZyb20uY2gsXG4gICAgICAgIGVuZENoID0gY2hhbmdlLnRvLmNoLFxuICAgICAgICBpc0luc2VydCA9IGNtcChjaGFuZ2UuZnJvbSwgY2hhbmdlLnRvKSA9PSAwOyAvLyBHZXQgdGhlIHNwYW5zIHRoYXQgJ3N0aWNrIG91dCcgb24gYm90aCBzaWRlc1xuXG4gICAgdmFyIGZpcnN0ID0gbWFya2VkU3BhbnNCZWZvcmUob2xkRmlyc3QsIHN0YXJ0Q2gsIGlzSW5zZXJ0KTtcbiAgICB2YXIgbGFzdCA9IG1hcmtlZFNwYW5zQWZ0ZXIob2xkTGFzdCwgZW5kQ2gsIGlzSW5zZXJ0KTsgLy8gTmV4dCwgbWVyZ2UgdGhvc2UgdHdvIGVuZHNcblxuICAgIHZhciBzYW1lTGluZSA9IGNoYW5nZS50ZXh0Lmxlbmd0aCA9PSAxLFxuICAgICAgICBvZmZzZXQgPSBsc3QoY2hhbmdlLnRleHQpLmxlbmd0aCArIChzYW1lTGluZSA/IHN0YXJ0Q2ggOiAwKTtcblxuICAgIGlmIChmaXJzdCkge1xuICAgICAgLy8gRml4IHVwIC50byBwcm9wZXJ0aWVzIG9mIGZpcnN0XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpcnN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBzcGFuID0gZmlyc3RbaV07XG5cbiAgICAgICAgaWYgKHNwYW4udG8gPT0gbnVsbCkge1xuICAgICAgICAgIHZhciBmb3VuZCA9IGdldE1hcmtlZFNwYW5Gb3IobGFzdCwgc3Bhbi5tYXJrZXIpO1xuXG4gICAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgc3Bhbi50byA9IHN0YXJ0Q2g7XG4gICAgICAgICAgfSBlbHNlIGlmIChzYW1lTGluZSkge1xuICAgICAgICAgICAgc3Bhbi50byA9IGZvdW5kLnRvID09IG51bGwgPyBudWxsIDogZm91bmQudG8gKyBvZmZzZXQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGxhc3QpIHtcbiAgICAgIC8vIEZpeCB1cCAuZnJvbSBpbiBsYXN0IChvciBtb3ZlIHRoZW0gaW50byBmaXJzdCBpbiBjYXNlIG9mIHNhbWVMaW5lKVxuICAgICAgZm9yICh2YXIgaSQxID0gMDsgaSQxIDwgbGFzdC5sZW5ndGg7ICsraSQxKSB7XG4gICAgICAgIHZhciBzcGFuJDEgPSBsYXN0W2kkMV07XG5cbiAgICAgICAgaWYgKHNwYW4kMS50byAhPSBudWxsKSB7XG4gICAgICAgICAgc3BhbiQxLnRvICs9IG9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzcGFuJDEuZnJvbSA9PSBudWxsKSB7XG4gICAgICAgICAgdmFyIGZvdW5kJDEgPSBnZXRNYXJrZWRTcGFuRm9yKGZpcnN0LCBzcGFuJDEubWFya2VyKTtcblxuICAgICAgICAgIGlmICghZm91bmQkMSkge1xuICAgICAgICAgICAgc3BhbiQxLmZyb20gPSBvZmZzZXQ7XG5cbiAgICAgICAgICAgIGlmIChzYW1lTGluZSkge1xuICAgICAgICAgICAgICAoZmlyc3QgfHwgKGZpcnN0ID0gW10pKS5wdXNoKHNwYW4kMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNwYW4kMS5mcm9tICs9IG9mZnNldDtcblxuICAgICAgICAgIGlmIChzYW1lTGluZSkge1xuICAgICAgICAgICAgKGZpcnN0IHx8IChmaXJzdCA9IFtdKSkucHVzaChzcGFuJDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gLy8gTWFrZSBzdXJlIHdlIGRpZG4ndCBjcmVhdGUgYW55IHplcm8tbGVuZ3RoIHNwYW5zXG5cblxuICAgIGlmIChmaXJzdCkge1xuICAgICAgZmlyc3QgPSBjbGVhckVtcHR5U3BhbnMoZmlyc3QpO1xuICAgIH1cblxuICAgIGlmIChsYXN0ICYmIGxhc3QgIT0gZmlyc3QpIHtcbiAgICAgIGxhc3QgPSBjbGVhckVtcHR5U3BhbnMobGFzdCk7XG4gICAgfVxuXG4gICAgdmFyIG5ld01hcmtlcnMgPSBbZmlyc3RdO1xuXG4gICAgaWYgKCFzYW1lTGluZSkge1xuICAgICAgLy8gRmlsbCBnYXAgd2l0aCB3aG9sZS1saW5lLXNwYW5zXG4gICAgICB2YXIgZ2FwID0gY2hhbmdlLnRleHQubGVuZ3RoIC0gMixcbiAgICAgICAgICBnYXBNYXJrZXJzO1xuXG4gICAgICBpZiAoZ2FwID4gMCAmJiBmaXJzdCkge1xuICAgICAgICBmb3IgKHZhciBpJDIgPSAwOyBpJDIgPCBmaXJzdC5sZW5ndGg7ICsraSQyKSB7XG4gICAgICAgICAgaWYgKGZpcnN0W2kkMl0udG8gPT0gbnVsbCkge1xuICAgICAgICAgICAgKGdhcE1hcmtlcnMgfHwgKGdhcE1hcmtlcnMgPSBbXSkpLnB1c2gobmV3IE1hcmtlZFNwYW4oZmlyc3RbaSQyXS5tYXJrZXIsIG51bGwsIG51bGwpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSQzID0gMDsgaSQzIDwgZ2FwOyArK2kkMykge1xuICAgICAgICBuZXdNYXJrZXJzLnB1c2goZ2FwTWFya2Vycyk7XG4gICAgICB9XG5cbiAgICAgIG5ld01hcmtlcnMucHVzaChsYXN0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3TWFya2VycztcbiAgfSAvLyBSZW1vdmUgc3BhbnMgdGhhdCBhcmUgZW1wdHkgYW5kIGRvbid0IGhhdmUgYSBjbGVhcldoZW5FbXB0eVxuICAvLyBvcHRpb24gb2YgZmFsc2UuXG5cblxuICBmdW5jdGlvbiBjbGVhckVtcHR5U3BhbnMoc3BhbnMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgc3BhbiA9IHNwYW5zW2ldO1xuXG4gICAgICBpZiAoc3Bhbi5mcm9tICE9IG51bGwgJiYgc3Bhbi5mcm9tID09IHNwYW4udG8gJiYgc3Bhbi5tYXJrZXIuY2xlYXJXaGVuRW1wdHkgIT09IGZhbHNlKSB7XG4gICAgICAgIHNwYW5zLnNwbGljZShpLS0sIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghc3BhbnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc3BhbnM7XG4gIH0gLy8gVXNlZCB0byAnY2xpcCcgb3V0IHJlYWRPbmx5IHJhbmdlcyB3aGVuIG1ha2luZyBhIGNoYW5nZS5cblxuXG4gIGZ1bmN0aW9uIHJlbW92ZVJlYWRPbmx5UmFuZ2VzKGRvYywgZnJvbSwgdG8pIHtcbiAgICB2YXIgbWFya2VycyA9IG51bGw7XG4gICAgZG9jLml0ZXIoZnJvbS5saW5lLCB0by5saW5lICsgMSwgZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgIGlmIChsaW5lLm1hcmtlZFNwYW5zKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZS5tYXJrZWRTcGFucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIHZhciBtYXJrID0gbGluZS5tYXJrZWRTcGFuc1tpXS5tYXJrZXI7XG5cbiAgICAgICAgICBpZiAobWFyay5yZWFkT25seSAmJiAoIW1hcmtlcnMgfHwgaW5kZXhPZihtYXJrZXJzLCBtYXJrKSA9PSAtMSkpIHtcbiAgICAgICAgICAgIChtYXJrZXJzIHx8IChtYXJrZXJzID0gW10pKS5wdXNoKG1hcmspO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKCFtYXJrZXJzKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgcGFydHMgPSBbe1xuICAgICAgZnJvbTogZnJvbSxcbiAgICAgIHRvOiB0b1xuICAgIH1dO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgbWsgPSBtYXJrZXJzW2ldLFxuICAgICAgICAgIG0gPSBtay5maW5kKDApO1xuXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcnRzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgIHZhciBwID0gcGFydHNbal07XG5cbiAgICAgICAgaWYgKGNtcChwLnRvLCBtLmZyb20pIDwgMCB8fCBjbXAocC5mcm9tLCBtLnRvKSA+IDApIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBuZXdQYXJ0cyA9IFtqLCAxXSxcbiAgICAgICAgICAgIGRmcm9tID0gY21wKHAuZnJvbSwgbS5mcm9tKSxcbiAgICAgICAgICAgIGR0byA9IGNtcChwLnRvLCBtLnRvKTtcblxuICAgICAgICBpZiAoZGZyb20gPCAwIHx8ICFtay5pbmNsdXNpdmVMZWZ0ICYmICFkZnJvbSkge1xuICAgICAgICAgIG5ld1BhcnRzLnB1c2goe1xuICAgICAgICAgICAgZnJvbTogcC5mcm9tLFxuICAgICAgICAgICAgdG86IG0uZnJvbVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGR0byA+IDAgfHwgIW1rLmluY2x1c2l2ZVJpZ2h0ICYmICFkdG8pIHtcbiAgICAgICAgICBuZXdQYXJ0cy5wdXNoKHtcbiAgICAgICAgICAgIGZyb206IG0udG8sXG4gICAgICAgICAgICB0bzogcC50b1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFydHMuc3BsaWNlLmFwcGx5KHBhcnRzLCBuZXdQYXJ0cyk7XG4gICAgICAgIGogKz0gbmV3UGFydHMubGVuZ3RoIC0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcGFydHM7XG4gIH0gLy8gQ29ubmVjdCBvciBkaXNjb25uZWN0IHNwYW5zIGZyb20gYSBsaW5lLlxuXG5cbiAgZnVuY3Rpb24gZGV0YWNoTWFya2VkU3BhbnMobGluZSkge1xuICAgIHZhciBzcGFucyA9IGxpbmUubWFya2VkU3BhbnM7XG5cbiAgICBpZiAoIXNwYW5zKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7ICsraSkge1xuICAgICAgc3BhbnNbaV0ubWFya2VyLmRldGFjaExpbmUobGluZSk7XG4gICAgfVxuXG4gICAgbGluZS5tYXJrZWRTcGFucyA9IG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBhdHRhY2hNYXJrZWRTcGFucyhsaW5lLCBzcGFucykge1xuICAgIGlmICghc3BhbnMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgKytpKSB7XG4gICAgICBzcGFuc1tpXS5tYXJrZXIuYXR0YWNoTGluZShsaW5lKTtcbiAgICB9XG5cbiAgICBsaW5lLm1hcmtlZFNwYW5zID0gc3BhbnM7XG4gIH0gLy8gSGVscGVycyB1c2VkIHdoZW4gY29tcHV0aW5nIHdoaWNoIG92ZXJsYXBwaW5nIGNvbGxhcHNlZCBzcGFuXG4gIC8vIGNvdW50cyBhcyB0aGUgbGFyZ2VyIG9uZS5cblxuXG4gIGZ1bmN0aW9uIGV4dHJhTGVmdChtYXJrZXIpIHtcbiAgICByZXR1cm4gbWFya2VyLmluY2x1c2l2ZUxlZnQgPyAtMSA6IDA7XG4gIH1cblxuICBmdW5jdGlvbiBleHRyYVJpZ2h0KG1hcmtlcikge1xuICAgIHJldHVybiBtYXJrZXIuaW5jbHVzaXZlUmlnaHQgPyAxIDogMDtcbiAgfSAvLyBSZXR1cm5zIGEgbnVtYmVyIGluZGljYXRpbmcgd2hpY2ggb2YgdHdvIG92ZXJsYXBwaW5nIGNvbGxhcHNlZFxuICAvLyBzcGFucyBpcyBsYXJnZXIgKGFuZCB0aHVzIGluY2x1ZGVzIHRoZSBvdGhlcikuIEZhbGxzIGJhY2sgdG9cbiAgLy8gY29tcGFyaW5nIGlkcyB3aGVuIHRoZSBzcGFucyBjb3ZlciBleGFjdGx5IHRoZSBzYW1lIHJhbmdlLlxuXG5cbiAgZnVuY3Rpb24gY29tcGFyZUNvbGxhcHNlZE1hcmtlcnMoYSwgYikge1xuICAgIHZhciBsZW5EaWZmID0gYS5saW5lcy5sZW5ndGggLSBiLmxpbmVzLmxlbmd0aDtcblxuICAgIGlmIChsZW5EaWZmICE9IDApIHtcbiAgICAgIHJldHVybiBsZW5EaWZmO1xuICAgIH1cblxuICAgIHZhciBhUG9zID0gYS5maW5kKCksXG4gICAgICAgIGJQb3MgPSBiLmZpbmQoKTtcbiAgICB2YXIgZnJvbUNtcCA9IGNtcChhUG9zLmZyb20sIGJQb3MuZnJvbSkgfHwgZXh0cmFMZWZ0KGEpIC0gZXh0cmFMZWZ0KGIpO1xuXG4gICAgaWYgKGZyb21DbXApIHtcbiAgICAgIHJldHVybiAtZnJvbUNtcDtcbiAgICB9XG5cbiAgICB2YXIgdG9DbXAgPSBjbXAoYVBvcy50bywgYlBvcy50bykgfHwgZXh0cmFSaWdodChhKSAtIGV4dHJhUmlnaHQoYik7XG5cbiAgICBpZiAodG9DbXApIHtcbiAgICAgIHJldHVybiB0b0NtcDtcbiAgICB9XG5cbiAgICByZXR1cm4gYi5pZCAtIGEuaWQ7XG4gIH0gLy8gRmluZCBvdXQgd2hldGhlciBhIGxpbmUgZW5kcyBvciBzdGFydHMgaW4gYSBjb2xsYXBzZWQgc3Bhbi4gSWZcbiAgLy8gc28sIHJldHVybiB0aGUgbWFya2VyIGZvciB0aGF0IHNwYW4uXG5cblxuICBmdW5jdGlvbiBjb2xsYXBzZWRTcGFuQXRTaWRlKGxpbmUsIHN0YXJ0KSB7XG4gICAgdmFyIHNwcyA9IHNhd0NvbGxhcHNlZFNwYW5zICYmIGxpbmUubWFya2VkU3BhbnMsXG4gICAgICAgIGZvdW5kO1xuXG4gICAgaWYgKHNwcykge1xuICAgICAgZm9yICh2YXIgc3AgPSB2b2lkIDAsIGkgPSAwOyBpIDwgc3BzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHNwID0gc3BzW2ldO1xuXG4gICAgICAgIGlmIChzcC5tYXJrZXIuY29sbGFwc2VkICYmIChzdGFydCA/IHNwLmZyb20gOiBzcC50bykgPT0gbnVsbCAmJiAoIWZvdW5kIHx8IGNvbXBhcmVDb2xsYXBzZWRNYXJrZXJzKGZvdW5kLCBzcC5tYXJrZXIpIDwgMCkpIHtcbiAgICAgICAgICBmb3VuZCA9IHNwLm1hcmtlcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmb3VuZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbGxhcHNlZFNwYW5BdFN0YXJ0KGxpbmUpIHtcbiAgICByZXR1cm4gY29sbGFwc2VkU3BhbkF0U2lkZShsaW5lLCB0cnVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbGxhcHNlZFNwYW5BdEVuZChsaW5lKSB7XG4gICAgcmV0dXJuIGNvbGxhcHNlZFNwYW5BdFNpZGUobGluZSwgZmFsc2UpO1xuICB9IC8vIFRlc3Qgd2hldGhlciB0aGVyZSBleGlzdHMgYSBjb2xsYXBzZWQgc3BhbiB0aGF0IHBhcnRpYWxseVxuICAvLyBvdmVybGFwcyAoY292ZXJzIHRoZSBzdGFydCBvciBlbmQsIGJ1dCBub3QgYm90aCkgb2YgYSBuZXcgc3Bhbi5cbiAgLy8gU3VjaCBvdmVybGFwIGlzIG5vdCBhbGxvd2VkLlxuXG5cbiAgZnVuY3Rpb24gY29uZmxpY3RpbmdDb2xsYXBzZWRSYW5nZShkb2MsIGxpbmVObywgZnJvbSwgdG8sIG1hcmtlcikge1xuICAgIHZhciBsaW5lID0gZ2V0TGluZShkb2MsIGxpbmVObyk7XG4gICAgdmFyIHNwcyA9IHNhd0NvbGxhcHNlZFNwYW5zICYmIGxpbmUubWFya2VkU3BhbnM7XG5cbiAgICBpZiAoc3BzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgc3AgPSBzcHNbaV07XG5cbiAgICAgICAgaWYgKCFzcC5tYXJrZXIuY29sbGFwc2VkKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZm91bmQgPSBzcC5tYXJrZXIuZmluZCgwKTtcbiAgICAgICAgdmFyIGZyb21DbXAgPSBjbXAoZm91bmQuZnJvbSwgZnJvbSkgfHwgZXh0cmFMZWZ0KHNwLm1hcmtlcikgLSBleHRyYUxlZnQobWFya2VyKTtcbiAgICAgICAgdmFyIHRvQ21wID0gY21wKGZvdW5kLnRvLCB0bykgfHwgZXh0cmFSaWdodChzcC5tYXJrZXIpIC0gZXh0cmFSaWdodChtYXJrZXIpO1xuXG4gICAgICAgIGlmIChmcm9tQ21wID49IDAgJiYgdG9DbXAgPD0gMCB8fCBmcm9tQ21wIDw9IDAgJiYgdG9DbXAgPj0gMCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZyb21DbXAgPD0gMCAmJiAoc3AubWFya2VyLmluY2x1c2l2ZVJpZ2h0ICYmIG1hcmtlci5pbmNsdXNpdmVMZWZ0ID8gY21wKGZvdW5kLnRvLCBmcm9tKSA+PSAwIDogY21wKGZvdW5kLnRvLCBmcm9tKSA+IDApIHx8IGZyb21DbXAgPj0gMCAmJiAoc3AubWFya2VyLmluY2x1c2l2ZVJpZ2h0ICYmIG1hcmtlci5pbmNsdXNpdmVMZWZ0ID8gY21wKGZvdW5kLmZyb20sIHRvKSA8PSAwIDogY21wKGZvdW5kLmZyb20sIHRvKSA8IDApKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gLy8gQSB2aXN1YWwgbGluZSBpcyBhIGxpbmUgYXMgZHJhd24gb24gdGhlIHNjcmVlbi4gRm9sZGluZywgZm9yXG4gIC8vIGV4YW1wbGUsIGNhbiBjYXVzZSBtdWx0aXBsZSBsb2dpY2FsIGxpbmVzIHRvIGFwcGVhciBvbiB0aGUgc2FtZVxuICAvLyB2aXN1YWwgbGluZS4gVGhpcyBmaW5kcyB0aGUgc3RhcnQgb2YgdGhlIHZpc3VhbCBsaW5lIHRoYXQgdGhlXG4gIC8vIGdpdmVuIGxpbmUgaXMgcGFydCBvZiAodXN1YWxseSB0aGF0IGlzIHRoZSBsaW5lIGl0c2VsZikuXG5cblxuICBmdW5jdGlvbiB2aXN1YWxMaW5lKGxpbmUpIHtcbiAgICB2YXIgbWVyZ2VkO1xuXG4gICAgd2hpbGUgKG1lcmdlZCA9IGNvbGxhcHNlZFNwYW5BdFN0YXJ0KGxpbmUpKSB7XG4gICAgICBsaW5lID0gbWVyZ2VkLmZpbmQoLTEsIHRydWUpLmxpbmU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmU7XG4gIH0gLy8gUmV0dXJucyBhbiBhcnJheSBvZiBsb2dpY2FsIGxpbmVzIHRoYXQgY29udGludWUgdGhlIHZpc3VhbCBsaW5lXG4gIC8vIHN0YXJ0ZWQgYnkgdGhlIGFyZ3VtZW50LCBvciB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG5vIHN1Y2ggbGluZXMuXG5cblxuICBmdW5jdGlvbiB2aXN1YWxMaW5lQ29udGludWVkKGxpbmUpIHtcbiAgICB2YXIgbWVyZ2VkLCBsaW5lcztcblxuICAgIHdoaWxlIChtZXJnZWQgPSBjb2xsYXBzZWRTcGFuQXRFbmQobGluZSkpIHtcbiAgICAgIGxpbmUgPSBtZXJnZWQuZmluZCgxLCB0cnVlKS5saW5lO1xuICAgICAgKGxpbmVzIHx8IChsaW5lcyA9IFtdKSkucHVzaChsaW5lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGluZXM7XG4gIH0gLy8gR2V0IHRoZSBsaW5lIG51bWJlciBvZiB0aGUgc3RhcnQgb2YgdGhlIHZpc3VhbCBsaW5lIHRoYXQgdGhlXG4gIC8vIGdpdmVuIGxpbmUgbnVtYmVyIGlzIHBhcnQgb2YuXG5cblxuICBmdW5jdGlvbiB2aXN1YWxMaW5lTm8oZG9jLCBsaW5lTikge1xuICAgIHZhciBsaW5lID0gZ2V0TGluZShkb2MsIGxpbmVOKSxcbiAgICAgICAgdmlzID0gdmlzdWFsTGluZShsaW5lKTtcblxuICAgIGlmIChsaW5lID09IHZpcykge1xuICAgICAgcmV0dXJuIGxpbmVOO1xuICAgIH1cblxuICAgIHJldHVybiBsaW5lTm8odmlzKTtcbiAgfSAvLyBHZXQgdGhlIGxpbmUgbnVtYmVyIG9mIHRoZSBzdGFydCBvZiB0aGUgbmV4dCB2aXN1YWwgbGluZSBhZnRlclxuICAvLyB0aGUgZ2l2ZW4gbGluZS5cblxuXG4gIGZ1bmN0aW9uIHZpc3VhbExpbmVFbmRObyhkb2MsIGxpbmVOKSB7XG4gICAgaWYgKGxpbmVOID4gZG9jLmxhc3RMaW5lKCkpIHtcbiAgICAgIHJldHVybiBsaW5lTjtcbiAgICB9XG5cbiAgICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBsaW5lTiksXG4gICAgICAgIG1lcmdlZDtcblxuICAgIGlmICghbGluZUlzSGlkZGVuKGRvYywgbGluZSkpIHtcbiAgICAgIHJldHVybiBsaW5lTjtcbiAgICB9XG5cbiAgICB3aGlsZSAobWVyZ2VkID0gY29sbGFwc2VkU3BhbkF0RW5kKGxpbmUpKSB7XG4gICAgICBsaW5lID0gbWVyZ2VkLmZpbmQoMSwgdHJ1ZSkubGluZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGluZU5vKGxpbmUpICsgMTtcbiAgfSAvLyBDb21wdXRlIHdoZXRoZXIgYSBsaW5lIGlzIGhpZGRlbi4gTGluZXMgY291bnQgYXMgaGlkZGVuIHdoZW4gdGhleVxuICAvLyBhcmUgcGFydCBvZiBhIHZpc3VhbCBsaW5lIHRoYXQgc3RhcnRzIHdpdGggYW5vdGhlciBsaW5lLCBvciB3aGVuXG4gIC8vIHRoZXkgYXJlIGVudGlyZWx5IGNvdmVyZWQgYnkgY29sbGFwc2VkLCBub24td2lkZ2V0IHNwYW4uXG5cblxuICBmdW5jdGlvbiBsaW5lSXNIaWRkZW4oZG9jLCBsaW5lKSB7XG4gICAgdmFyIHNwcyA9IHNhd0NvbGxhcHNlZFNwYW5zICYmIGxpbmUubWFya2VkU3BhbnM7XG5cbiAgICBpZiAoc3BzKSB7XG4gICAgICBmb3IgKHZhciBzcCA9IHZvaWQgMCwgaSA9IDA7IGkgPCBzcHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgc3AgPSBzcHNbaV07XG5cbiAgICAgICAgaWYgKCFzcC5tYXJrZXIuY29sbGFwc2VkKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3AuZnJvbSA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3AubWFya2VyLndpZGdldE5vZGUpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzcC5mcm9tID09IDAgJiYgc3AubWFya2VyLmluY2x1c2l2ZUxlZnQgJiYgbGluZUlzSGlkZGVuSW5uZXIoZG9jLCBsaW5lLCBzcCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGxpbmVJc0hpZGRlbklubmVyKGRvYywgbGluZSwgc3Bhbikge1xuICAgIGlmIChzcGFuLnRvID09IG51bGwpIHtcbiAgICAgIHZhciBlbmQgPSBzcGFuLm1hcmtlci5maW5kKDEsIHRydWUpO1xuICAgICAgcmV0dXJuIGxpbmVJc0hpZGRlbklubmVyKGRvYywgZW5kLmxpbmUsIGdldE1hcmtlZFNwYW5Gb3IoZW5kLmxpbmUubWFya2VkU3BhbnMsIHNwYW4ubWFya2VyKSk7XG4gICAgfVxuXG4gICAgaWYgKHNwYW4ubWFya2VyLmluY2x1c2l2ZVJpZ2h0ICYmIHNwYW4udG8gPT0gbGluZS50ZXh0Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgc3AgPSB2b2lkIDAsIGkgPSAwOyBpIDwgbGluZS5tYXJrZWRTcGFucy5sZW5ndGg7ICsraSkge1xuICAgICAgc3AgPSBsaW5lLm1hcmtlZFNwYW5zW2ldO1xuXG4gICAgICBpZiAoc3AubWFya2VyLmNvbGxhcHNlZCAmJiAhc3AubWFya2VyLndpZGdldE5vZGUgJiYgc3AuZnJvbSA9PSBzcGFuLnRvICYmIChzcC50byA9PSBudWxsIHx8IHNwLnRvICE9IHNwYW4uZnJvbSkgJiYgKHNwLm1hcmtlci5pbmNsdXNpdmVMZWZ0IHx8IHNwYW4ubWFya2VyLmluY2x1c2l2ZVJpZ2h0KSAmJiBsaW5lSXNIaWRkZW5Jbm5lcihkb2MsIGxpbmUsIHNwKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gLy8gRmluZCB0aGUgaGVpZ2h0IGFib3ZlIHRoZSBnaXZlbiBsaW5lLlxuXG5cbiAgZnVuY3Rpb24gX2hlaWdodEF0TGluZShsaW5lT2JqKSB7XG4gICAgbGluZU9iaiA9IHZpc3VhbExpbmUobGluZU9iaik7XG4gICAgdmFyIGggPSAwLFxuICAgICAgICBjaHVuayA9IGxpbmVPYmoucGFyZW50O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaHVuay5saW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGxpbmUgPSBjaHVuay5saW5lc1tpXTtcblxuICAgICAgaWYgKGxpbmUgPT0gbGluZU9iaikge1xuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGggKz0gbGluZS5oZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgcCA9IGNodW5rLnBhcmVudDsgcDsgY2h1bmsgPSBwLCBwID0gY2h1bmsucGFyZW50KSB7XG4gICAgICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCBwLmNoaWxkcmVuLmxlbmd0aDsgKytpJDEpIHtcbiAgICAgICAgdmFyIGN1ciA9IHAuY2hpbGRyZW5baSQxXTtcblxuICAgICAgICBpZiAoY3VyID09IGNodW5rKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaCArPSBjdXIuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGg7XG4gIH0gLy8gQ29tcHV0ZSB0aGUgY2hhcmFjdGVyIGxlbmd0aCBvZiBhIGxpbmUsIHRha2luZyBpbnRvIGFjY291bnRcbiAgLy8gY29sbGFwc2VkIHJhbmdlcyAoc2VlIG1hcmtUZXh0KSB0aGF0IG1pZ2h0IGhpZGUgcGFydHMsIGFuZCBqb2luXG4gIC8vIG90aGVyIGxpbmVzIG9udG8gaXQuXG5cblxuICBmdW5jdGlvbiBsaW5lTGVuZ3RoKGxpbmUpIHtcbiAgICBpZiAobGluZS5oZWlnaHQgPT0gMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgdmFyIGxlbiA9IGxpbmUudGV4dC5sZW5ndGgsXG4gICAgICAgIG1lcmdlZCxcbiAgICAgICAgY3VyID0gbGluZTtcblxuICAgIHdoaWxlIChtZXJnZWQgPSBjb2xsYXBzZWRTcGFuQXRTdGFydChjdXIpKSB7XG4gICAgICB2YXIgZm91bmQgPSBtZXJnZWQuZmluZCgwLCB0cnVlKTtcbiAgICAgIGN1ciA9IGZvdW5kLmZyb20ubGluZTtcbiAgICAgIGxlbiArPSBmb3VuZC5mcm9tLmNoIC0gZm91bmQudG8uY2g7XG4gICAgfVxuXG4gICAgY3VyID0gbGluZTtcblxuICAgIHdoaWxlIChtZXJnZWQgPSBjb2xsYXBzZWRTcGFuQXRFbmQoY3VyKSkge1xuICAgICAgdmFyIGZvdW5kJDEgPSBtZXJnZWQuZmluZCgwLCB0cnVlKTtcbiAgICAgIGxlbiAtPSBjdXIudGV4dC5sZW5ndGggLSBmb3VuZCQxLmZyb20uY2g7XG4gICAgICBjdXIgPSBmb3VuZCQxLnRvLmxpbmU7XG4gICAgICBsZW4gKz0gY3VyLnRleHQubGVuZ3RoIC0gZm91bmQkMS50by5jaDtcbiAgICB9XG5cbiAgICByZXR1cm4gbGVuO1xuICB9IC8vIEZpbmQgdGhlIGxvbmdlc3QgbGluZSBpbiB0aGUgZG9jdW1lbnQuXG5cblxuICBmdW5jdGlvbiBmaW5kTWF4TGluZShjbSkge1xuICAgIHZhciBkID0gY20uZGlzcGxheSxcbiAgICAgICAgZG9jID0gY20uZG9jO1xuICAgIGQubWF4TGluZSA9IGdldExpbmUoZG9jLCBkb2MuZmlyc3QpO1xuICAgIGQubWF4TGluZUxlbmd0aCA9IGxpbmVMZW5ndGgoZC5tYXhMaW5lKTtcbiAgICBkLm1heExpbmVDaGFuZ2VkID0gdHJ1ZTtcbiAgICBkb2MuaXRlcihmdW5jdGlvbiAobGluZSkge1xuICAgICAgdmFyIGxlbiA9IGxpbmVMZW5ndGgobGluZSk7XG5cbiAgICAgIGlmIChsZW4gPiBkLm1heExpbmVMZW5ndGgpIHtcbiAgICAgICAgZC5tYXhMaW5lTGVuZ3RoID0gbGVuO1xuICAgICAgICBkLm1heExpbmUgPSBsaW5lO1xuICAgICAgfVxuICAgIH0pO1xuICB9IC8vIEJJREkgSEVMUEVSU1xuXG5cbiAgZnVuY3Rpb24gaXRlcmF0ZUJpZGlTZWN0aW9ucyhvcmRlciwgZnJvbSwgdG8sIGYpIHtcbiAgICBpZiAoIW9yZGVyKSB7XG4gICAgICByZXR1cm4gZihmcm9tLCB0bywgXCJsdHJcIik7XG4gICAgfVxuXG4gICAgdmFyIGZvdW5kID0gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9yZGVyLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcGFydCA9IG9yZGVyW2ldO1xuXG4gICAgICBpZiAocGFydC5mcm9tIDwgdG8gJiYgcGFydC50byA+IGZyb20gfHwgZnJvbSA9PSB0byAmJiBwYXJ0LnRvID09IGZyb20pIHtcbiAgICAgICAgZihNYXRoLm1heChwYXJ0LmZyb20sIGZyb20pLCBNYXRoLm1pbihwYXJ0LnRvLCB0byksIHBhcnQubGV2ZWwgPT0gMSA/IFwicnRsXCIgOiBcImx0clwiKTtcbiAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghZm91bmQpIHtcbiAgICAgIGYoZnJvbSwgdG8sIFwibHRyXCIpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGJpZGlMZWZ0KHBhcnQpIHtcbiAgICByZXR1cm4gcGFydC5sZXZlbCAlIDIgPyBwYXJ0LnRvIDogcGFydC5mcm9tO1xuICB9XG5cbiAgZnVuY3Rpb24gYmlkaVJpZ2h0KHBhcnQpIHtcbiAgICByZXR1cm4gcGFydC5sZXZlbCAlIDIgPyBwYXJ0LmZyb20gOiBwYXJ0LnRvO1xuICB9XG5cbiAgZnVuY3Rpb24gbGluZUxlZnQobGluZSkge1xuICAgIHZhciBvcmRlciA9IGdldE9yZGVyKGxpbmUpO1xuICAgIHJldHVybiBvcmRlciA/IGJpZGlMZWZ0KG9yZGVyWzBdKSA6IDA7XG4gIH1cblxuICBmdW5jdGlvbiBsaW5lUmlnaHQobGluZSkge1xuICAgIHZhciBvcmRlciA9IGdldE9yZGVyKGxpbmUpO1xuXG4gICAgaWYgKCFvcmRlcikge1xuICAgICAgcmV0dXJuIGxpbmUudGV4dC5sZW5ndGg7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJpZGlSaWdodChsc3Qob3JkZXIpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXBhcmVCaWRpTGV2ZWwob3JkZXIsIGEsIGIpIHtcbiAgICB2YXIgbGluZWRpciA9IG9yZGVyWzBdLmxldmVsO1xuXG4gICAgaWYgKGEgPT0gbGluZWRpcikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGIgPT0gbGluZWRpcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBhIDwgYjtcbiAgfVxuXG4gIHZhciBiaWRpT3RoZXIgPSBudWxsO1xuXG4gIGZ1bmN0aW9uIGdldEJpZGlQYXJ0QXQob3JkZXIsIHBvcykge1xuICAgIHZhciBmb3VuZDtcbiAgICBiaWRpT3RoZXIgPSBudWxsO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcmRlci5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGN1ciA9IG9yZGVyW2ldO1xuXG4gICAgICBpZiAoY3VyLmZyb20gPCBwb3MgJiYgY3VyLnRvID4gcG9zKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY3VyLmZyb20gPT0gcG9zIHx8IGN1ci50byA9PSBwb3MpIHtcbiAgICAgICAgaWYgKGZvdW5kID09IG51bGwpIHtcbiAgICAgICAgICBmb3VuZCA9IGk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29tcGFyZUJpZGlMZXZlbChvcmRlciwgY3VyLmxldmVsLCBvcmRlcltmb3VuZF0ubGV2ZWwpKSB7XG4gICAgICAgICAgaWYgKGN1ci5mcm9tICE9IGN1ci50bykge1xuICAgICAgICAgICAgYmlkaU90aGVyID0gZm91bmQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGN1ci5mcm9tICE9IGN1ci50bykge1xuICAgICAgICAgICAgYmlkaU90aGVyID0gaTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZm91bmQ7XG4gIH1cblxuICBmdW5jdGlvbiBtb3ZlSW5MaW5lKGxpbmUsIHBvcywgZGlyLCBieVVuaXQpIHtcbiAgICBpZiAoIWJ5VW5pdCkge1xuICAgICAgcmV0dXJuIHBvcyArIGRpcjtcbiAgICB9XG5cbiAgICBkbyB7XG4gICAgICBwb3MgKz0gZGlyO1xuICAgIH0gd2hpbGUgKHBvcyA+IDAgJiYgaXNFeHRlbmRpbmdDaGFyKGxpbmUudGV4dC5jaGFyQXQocG9zKSkpO1xuXG4gICAgcmV0dXJuIHBvcztcbiAgfSAvLyBUaGlzIGlzIG5lZWRlZCBpbiBvcmRlciB0byBtb3ZlICd2aXN1YWxseScgdGhyb3VnaCBiaS1kaXJlY3Rpb25hbFxuICAvLyB0ZXh0IC0tIGkuZS4sIHByZXNzaW5nIGxlZnQgc2hvdWxkIG1ha2UgdGhlIGN1cnNvciBnbyBsZWZ0LCBldmVuXG4gIC8vIHdoZW4gaW4gUlRMIHRleHQuIFRoZSB0cmlja3kgcGFydCBpcyB0aGUgJ2p1bXBzJywgd2hlcmUgUlRMIGFuZFxuICAvLyBMVFIgdGV4dCB0b3VjaCBlYWNoIG90aGVyLiBUaGlzIG9mdGVuIHJlcXVpcmVzIHRoZSBjdXJzb3Igb2Zmc2V0XG4gIC8vIHRvIG1vdmUgbW9yZSB0aGFuIG9uZSB1bml0LCBpbiBvcmRlciB0byB2aXN1YWxseSBtb3ZlIG9uZSB1bml0LlxuXG5cbiAgZnVuY3Rpb24gbW92ZVZpc3VhbGx5KGxpbmUsIHN0YXJ0LCBkaXIsIGJ5VW5pdCkge1xuICAgIHZhciBiaWRpID0gZ2V0T3JkZXIobGluZSk7XG5cbiAgICBpZiAoIWJpZGkpIHtcbiAgICAgIHJldHVybiBtb3ZlTG9naWNhbGx5KGxpbmUsIHN0YXJ0LCBkaXIsIGJ5VW5pdCk7XG4gICAgfVxuXG4gICAgdmFyIHBvcyA9IGdldEJpZGlQYXJ0QXQoYmlkaSwgc3RhcnQpLFxuICAgICAgICBwYXJ0ID0gYmlkaVtwb3NdO1xuICAgIHZhciB0YXJnZXQgPSBtb3ZlSW5MaW5lKGxpbmUsIHN0YXJ0LCBwYXJ0LmxldmVsICUgMiA/IC1kaXIgOiBkaXIsIGJ5VW5pdCk7XG5cbiAgICBmb3IgKDs7KSB7XG4gICAgICBpZiAodGFyZ2V0ID4gcGFydC5mcm9tICYmIHRhcmdldCA8IHBhcnQudG8pIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRhcmdldCA9PSBwYXJ0LmZyb20gfHwgdGFyZ2V0ID09IHBhcnQudG8pIHtcbiAgICAgICAgaWYgKGdldEJpZGlQYXJ0QXQoYmlkaSwgdGFyZ2V0KSA9PSBwb3MpIHtcbiAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgcGFydCA9IGJpZGlbcG9zICs9IGRpcl07XG4gICAgICAgIHJldHVybiBkaXIgPiAwID09IHBhcnQubGV2ZWwgJSAyID8gcGFydC50byA6IHBhcnQuZnJvbTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnQgPSBiaWRpW3BvcyArPSBkaXJdO1xuXG4gICAgICAgIGlmICghcGFydCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpciA+IDAgPT0gcGFydC5sZXZlbCAlIDIpIHtcbiAgICAgICAgICB0YXJnZXQgPSBtb3ZlSW5MaW5lKGxpbmUsIHBhcnQudG8sIC0xLCBieVVuaXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhcmdldCA9IG1vdmVJbkxpbmUobGluZSwgcGFydC5mcm9tLCAxLCBieVVuaXQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbW92ZUxvZ2ljYWxseShsaW5lLCBzdGFydCwgZGlyLCBieVVuaXQpIHtcbiAgICB2YXIgdGFyZ2V0ID0gc3RhcnQgKyBkaXI7XG5cbiAgICBpZiAoYnlVbml0KSB7XG4gICAgICB3aGlsZSAodGFyZ2V0ID4gMCAmJiBpc0V4dGVuZGluZ0NoYXIobGluZS50ZXh0LmNoYXJBdCh0YXJnZXQpKSkge1xuICAgICAgICB0YXJnZXQgKz0gZGlyO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXQgPCAwIHx8IHRhcmdldCA+IGxpbmUudGV4dC5sZW5ndGggPyBudWxsIDogdGFyZ2V0O1xuICB9IC8vIEJpZGlyZWN0aW9uYWwgb3JkZXJpbmcgYWxnb3JpdGhtXG4gIC8vIFNlZSBodHRwOi8vdW5pY29kZS5vcmcvcmVwb3J0cy90cjkvdHI5LTEzLmh0bWwgZm9yIHRoZSBhbGdvcml0aG1cbiAgLy8gdGhhdCB0aGlzIChwYXJ0aWFsbHkpIGltcGxlbWVudHMuXG4gIC8vIE9uZS1jaGFyIGNvZGVzIHVzZWQgZm9yIGNoYXJhY3RlciB0eXBlczpcbiAgLy8gTCAoTCk6ICAgTGVmdC10by1SaWdodFxuICAvLyBSIChSKTogICBSaWdodC10by1MZWZ0XG4gIC8vIHIgKEFMKTogIFJpZ2h0LXRvLUxlZnQgQXJhYmljXG4gIC8vIDEgKEVOKTogIEV1cm9wZWFuIE51bWJlclxuICAvLyArIChFUyk6ICBFdXJvcGVhbiBOdW1iZXIgU2VwYXJhdG9yXG4gIC8vICUgKEVUKTogIEV1cm9wZWFuIE51bWJlciBUZXJtaW5hdG9yXG4gIC8vIG4gKEFOKTogIEFyYWJpYyBOdW1iZXJcbiAgLy8gLCAoQ1MpOiAgQ29tbW9uIE51bWJlciBTZXBhcmF0b3JcbiAgLy8gbSAoTlNNKTogTm9uLVNwYWNpbmcgTWFya1xuICAvLyBiIChCTik6ICBCb3VuZGFyeSBOZXV0cmFsXG4gIC8vIHMgKEIpOiAgIFBhcmFncmFwaCBTZXBhcmF0b3JcbiAgLy8gdCAoUyk6ICAgU2VnbWVudCBTZXBhcmF0b3JcbiAgLy8gdyAoV1MpOiAgV2hpdGVzcGFjZVxuICAvLyBOIChPTik6ICBPdGhlciBOZXV0cmFsc1xuICAvLyBSZXR1cm5zIG51bGwgaWYgY2hhcmFjdGVycyBhcmUgb3JkZXJlZCBhcyB0aGV5IGFwcGVhclxuICAvLyAobGVmdC10by1yaWdodCksIG9yIGFuIGFycmF5IG9mIHNlY3Rpb25zICh7ZnJvbSwgdG8sIGxldmVsfVxuICAvLyBvYmplY3RzKSBpbiB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSBvY2N1ciB2aXN1YWxseS5cblxuXG4gIHZhciBiaWRpT3JkZXJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gQ2hhcmFjdGVyIHR5cGVzIGZvciBjb2RlcG9pbnRzIDAgdG8gMHhmZlxuICAgIHZhciBsb3dUeXBlcyA9IFwiYmJiYmJiYmJidHN0d3NiYmJiYmJiYmJiYmJiYnNzc3R3Tk4lJSVOTk5OTk4sTixOMTExMTExMTExMU5OTk5OTk5MTExMTExMTExMTExMTExMTExMTExMTExMTE5OTk5OTkxMTExMTExMTExMTExMTExMTExMTExMTExMTk5OTmJiYmJiYnNiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYixOJSUlJU5OTk5MTk5OTk4lJTExTkxOTk4xTE5OTk5OTExMTExMTExMTExMTExMTExMTExMTExOTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTE5cIjsgLy8gQ2hhcmFjdGVyIHR5cGVzIGZvciBjb2RlcG9pbnRzIDB4NjAwIHRvIDB4NmY5XG5cbiAgICB2YXIgYXJhYmljVHlwZXMgPSBcIm5ubm5ubk5OciUlcixyTk5tbW1tbW1tbW1tbXJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycm1tbW1tbW1tbW1tbW1tbW1tbW1tbW5ubm5ubm5ubm4lbm5ycnJtcnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJtbW1tbW1tbk5tbW1tbW1ycm1tTm1tbW1ycjExMTExMTExMTFcIjtcblxuICAgIGZ1bmN0aW9uIGNoYXJUeXBlKGNvZGUpIHtcbiAgICAgIGlmIChjb2RlIDw9IDB4ZjcpIHtcbiAgICAgICAgcmV0dXJuIGxvd1R5cGVzLmNoYXJBdChjb2RlKTtcbiAgICAgIH0gZWxzZSBpZiAoMHg1OTAgPD0gY29kZSAmJiBjb2RlIDw9IDB4NWY0KSB7XG4gICAgICAgIHJldHVybiBcIlJcIjtcbiAgICAgIH0gZWxzZSBpZiAoMHg2MDAgPD0gY29kZSAmJiBjb2RlIDw9IDB4NmY5KSB7XG4gICAgICAgIHJldHVybiBhcmFiaWNUeXBlcy5jaGFyQXQoY29kZSAtIDB4NjAwKTtcbiAgICAgIH0gZWxzZSBpZiAoMHg2ZWUgPD0gY29kZSAmJiBjb2RlIDw9IDB4OGFjKSB7XG4gICAgICAgIHJldHVybiBcInJcIjtcbiAgICAgIH0gZWxzZSBpZiAoMHgyMDAwIDw9IGNvZGUgJiYgY29kZSA8PSAweDIwMGIpIHtcbiAgICAgICAgcmV0dXJuIFwid1wiO1xuICAgICAgfSBlbHNlIGlmIChjb2RlID09IDB4MjAwYykge1xuICAgICAgICByZXR1cm4gXCJiXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJMXCI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGJpZGlSRSA9IC9bXFx1MDU5MC1cXHUwNWY0XFx1MDYwMC1cXHUwNmZmXFx1MDcwMC1cXHUwOGFjXS87XG4gICAgdmFyIGlzTmV1dHJhbCA9IC9bc3R3Tl0vLFxuICAgICAgICBpc1N0cm9uZyA9IC9bTFJyXS8sXG4gICAgICAgIGNvdW50c0FzTGVmdCA9IC9bTGIxbl0vLFxuICAgICAgICBjb3VudHNBc051bSA9IC9bMW5dLzsgLy8gQnJvd3NlcnMgc2VlbSB0byBhbHdheXMgdHJlYXQgdGhlIGJvdW5kYXJpZXMgb2YgYmxvY2sgZWxlbWVudHMgYXMgYmVpbmcgTC5cblxuICAgIHZhciBvdXRlclR5cGUgPSBcIkxcIjtcblxuICAgIGZ1bmN0aW9uIEJpZGlTcGFuKGxldmVsLCBmcm9tLCB0bykge1xuICAgICAgdGhpcy5sZXZlbCA9IGxldmVsO1xuICAgICAgdGhpcy5mcm9tID0gZnJvbTtcbiAgICAgIHRoaXMudG8gPSB0bztcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKHN0cikge1xuICAgICAgaWYgKCFiaWRpUkUudGVzdChzdHIpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGxlbiA9IHN0ci5sZW5ndGgsXG4gICAgICAgICAgdHlwZXMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgICB0eXBlcy5wdXNoKGNoYXJUeXBlKHN0ci5jaGFyQ29kZUF0KGkpKSk7XG4gICAgICB9IC8vIFcxLiBFeGFtaW5lIGVhY2ggbm9uLXNwYWNpbmcgbWFyayAoTlNNKSBpbiB0aGUgbGV2ZWwgcnVuLCBhbmRcbiAgICAgIC8vIGNoYW5nZSB0aGUgdHlwZSBvZiB0aGUgTlNNIHRvIHRoZSB0eXBlIG9mIHRoZSBwcmV2aW91c1xuICAgICAgLy8gY2hhcmFjdGVyLiBJZiB0aGUgTlNNIGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgbGV2ZWwgcnVuLCBpdCB3aWxsXG4gICAgICAvLyBnZXQgdGhlIHR5cGUgb2Ygc29yLlxuXG5cbiAgICAgIGZvciAodmFyIGkkMSA9IDAsIHByZXYgPSBvdXRlclR5cGU7IGkkMSA8IGxlbjsgKytpJDEpIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlc1tpJDFdO1xuXG4gICAgICAgIGlmICh0eXBlID09IFwibVwiKSB7XG4gICAgICAgICAgdHlwZXNbaSQxXSA9IHByZXY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJldiA9IHR5cGU7XG4gICAgICAgIH1cbiAgICAgIH0gLy8gVzIuIFNlYXJjaCBiYWNrd2FyZHMgZnJvbSBlYWNoIGluc3RhbmNlIG9mIGEgRXVyb3BlYW4gbnVtYmVyXG4gICAgICAvLyB1bnRpbCB0aGUgZmlyc3Qgc3Ryb25nIHR5cGUgKFIsIEwsIEFMLCBvciBzb3IpIGlzIGZvdW5kLiBJZiBhblxuICAgICAgLy8gQUwgaXMgZm91bmQsIGNoYW5nZSB0aGUgdHlwZSBvZiB0aGUgRXVyb3BlYW4gbnVtYmVyIHRvIEFyYWJpY1xuICAgICAgLy8gbnVtYmVyLlxuICAgICAgLy8gVzMuIENoYW5nZSBhbGwgQUxzIHRvIFIuXG5cblxuICAgICAgZm9yICh2YXIgaSQyID0gMCwgY3VyID0gb3V0ZXJUeXBlOyBpJDIgPCBsZW47ICsraSQyKSB7XG4gICAgICAgIHZhciB0eXBlJDEgPSB0eXBlc1tpJDJdO1xuXG4gICAgICAgIGlmICh0eXBlJDEgPT0gXCIxXCIgJiYgY3VyID09IFwiclwiKSB7XG4gICAgICAgICAgdHlwZXNbaSQyXSA9IFwiblwiO1xuICAgICAgICB9IGVsc2UgaWYgKGlzU3Ryb25nLnRlc3QodHlwZSQxKSkge1xuICAgICAgICAgIGN1ciA9IHR5cGUkMTtcblxuICAgICAgICAgIGlmICh0eXBlJDEgPT0gXCJyXCIpIHtcbiAgICAgICAgICAgIHR5cGVzW2kkMl0gPSBcIlJcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gLy8gVzQuIEEgc2luZ2xlIEV1cm9wZWFuIHNlcGFyYXRvciBiZXR3ZWVuIHR3byBFdXJvcGVhbiBudW1iZXJzXG4gICAgICAvLyBjaGFuZ2VzIHRvIGEgRXVyb3BlYW4gbnVtYmVyLiBBIHNpbmdsZSBjb21tb24gc2VwYXJhdG9yIGJldHdlZW5cbiAgICAgIC8vIHR3byBudW1iZXJzIG9mIHRoZSBzYW1lIHR5cGUgY2hhbmdlcyB0byB0aGF0IHR5cGUuXG5cblxuICAgICAgZm9yICh2YXIgaSQzID0gMSwgcHJldiQxID0gdHlwZXNbMF07IGkkMyA8IGxlbiAtIDE7ICsraSQzKSB7XG4gICAgICAgIHZhciB0eXBlJDIgPSB0eXBlc1tpJDNdO1xuXG4gICAgICAgIGlmICh0eXBlJDIgPT0gXCIrXCIgJiYgcHJldiQxID09IFwiMVwiICYmIHR5cGVzW2kkMyArIDFdID09IFwiMVwiKSB7XG4gICAgICAgICAgdHlwZXNbaSQzXSA9IFwiMVwiO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUkMiA9PSBcIixcIiAmJiBwcmV2JDEgPT0gdHlwZXNbaSQzICsgMV0gJiYgKHByZXYkMSA9PSBcIjFcIiB8fCBwcmV2JDEgPT0gXCJuXCIpKSB7XG4gICAgICAgICAgdHlwZXNbaSQzXSA9IHByZXYkMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZXYkMSA9IHR5cGUkMjtcbiAgICAgIH0gLy8gVzUuIEEgc2VxdWVuY2Ugb2YgRXVyb3BlYW4gdGVybWluYXRvcnMgYWRqYWNlbnQgdG8gRXVyb3BlYW5cbiAgICAgIC8vIG51bWJlcnMgY2hhbmdlcyB0byBhbGwgRXVyb3BlYW4gbnVtYmVycy5cbiAgICAgIC8vIFc2LiBPdGhlcndpc2UsIHNlcGFyYXRvcnMgYW5kIHRlcm1pbmF0b3JzIGNoYW5nZSB0byBPdGhlclxuICAgICAgLy8gTmV1dHJhbC5cblxuXG4gICAgICBmb3IgKHZhciBpJDQgPSAwOyBpJDQgPCBsZW47ICsraSQ0KSB7XG4gICAgICAgIHZhciB0eXBlJDMgPSB0eXBlc1tpJDRdO1xuXG4gICAgICAgIGlmICh0eXBlJDMgPT0gXCIsXCIpIHtcbiAgICAgICAgICB0eXBlc1tpJDRdID0gXCJOXCI7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSQzID09IFwiJVwiKSB7XG4gICAgICAgICAgdmFyIGVuZCA9IHZvaWQgMDtcblxuICAgICAgICAgIGZvciAoZW5kID0gaSQ0ICsgMTsgZW5kIDwgbGVuICYmIHR5cGVzW2VuZF0gPT0gXCIlXCI7ICsrZW5kKSB7fVxuXG4gICAgICAgICAgdmFyIHJlcGxhY2UgPSBpJDQgJiYgdHlwZXNbaSQ0IC0gMV0gPT0gXCIhXCIgfHwgZW5kIDwgbGVuICYmIHR5cGVzW2VuZF0gPT0gXCIxXCIgPyBcIjFcIiA6IFwiTlwiO1xuXG4gICAgICAgICAgZm9yICh2YXIgaiA9IGkkNDsgaiA8IGVuZDsgKytqKSB7XG4gICAgICAgICAgICB0eXBlc1tqXSA9IHJlcGxhY2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaSQ0ID0gZW5kIC0gMTtcbiAgICAgICAgfVxuICAgICAgfSAvLyBXNy4gU2VhcmNoIGJhY2t3YXJkcyBmcm9tIGVhY2ggaW5zdGFuY2Ugb2YgYSBFdXJvcGVhbiBudW1iZXJcbiAgICAgIC8vIHVudGlsIHRoZSBmaXJzdCBzdHJvbmcgdHlwZSAoUiwgTCwgb3Igc29yKSBpcyBmb3VuZC4gSWYgYW4gTCBpc1xuICAgICAgLy8gZm91bmQsIHRoZW4gY2hhbmdlIHRoZSB0eXBlIG9mIHRoZSBFdXJvcGVhbiBudW1iZXIgdG8gTC5cblxuXG4gICAgICBmb3IgKHZhciBpJDUgPSAwLCBjdXIkMSA9IG91dGVyVHlwZTsgaSQ1IDwgbGVuOyArK2kkNSkge1xuICAgICAgICB2YXIgdHlwZSQ0ID0gdHlwZXNbaSQ1XTtcblxuICAgICAgICBpZiAoY3VyJDEgPT0gXCJMXCIgJiYgdHlwZSQ0ID09IFwiMVwiKSB7XG4gICAgICAgICAgdHlwZXNbaSQ1XSA9IFwiTFwiO1xuICAgICAgICB9IGVsc2UgaWYgKGlzU3Ryb25nLnRlc3QodHlwZSQ0KSkge1xuICAgICAgICAgIGN1ciQxID0gdHlwZSQ0O1xuICAgICAgICB9XG4gICAgICB9IC8vIE4xLiBBIHNlcXVlbmNlIG9mIG5ldXRyYWxzIHRha2VzIHRoZSBkaXJlY3Rpb24gb2YgdGhlXG4gICAgICAvLyBzdXJyb3VuZGluZyBzdHJvbmcgdGV4dCBpZiB0aGUgdGV4dCBvbiBib3RoIHNpZGVzIGhhcyB0aGUgc2FtZVxuICAgICAgLy8gZGlyZWN0aW9uLiBFdXJvcGVhbiBhbmQgQXJhYmljIG51bWJlcnMgYWN0IGFzIGlmIHRoZXkgd2VyZSBSIGluXG4gICAgICAvLyB0ZXJtcyBvZiB0aGVpciBpbmZsdWVuY2Ugb24gbmV1dHJhbHMuIFN0YXJ0LW9mLWxldmVsLXJ1biAoc29yKVxuICAgICAgLy8gYW5kIGVuZC1vZi1sZXZlbC1ydW4gKGVvcikgYXJlIHVzZWQgYXQgbGV2ZWwgcnVuIGJvdW5kYXJpZXMuXG4gICAgICAvLyBOMi4gQW55IHJlbWFpbmluZyBuZXV0cmFscyB0YWtlIHRoZSBlbWJlZGRpbmcgZGlyZWN0aW9uLlxuXG5cbiAgICAgIGZvciAodmFyIGkkNiA9IDA7IGkkNiA8IGxlbjsgKytpJDYpIHtcbiAgICAgICAgaWYgKGlzTmV1dHJhbC50ZXN0KHR5cGVzW2kkNl0pKSB7XG4gICAgICAgICAgdmFyIGVuZCQxID0gdm9pZCAwO1xuXG4gICAgICAgICAgZm9yIChlbmQkMSA9IGkkNiArIDE7IGVuZCQxIDwgbGVuICYmIGlzTmV1dHJhbC50ZXN0KHR5cGVzW2VuZCQxXSk7ICsrZW5kJDEpIHt9XG5cbiAgICAgICAgICB2YXIgYmVmb3JlID0gKGkkNiA/IHR5cGVzW2kkNiAtIDFdIDogb3V0ZXJUeXBlKSA9PSBcIkxcIjtcbiAgICAgICAgICB2YXIgYWZ0ZXIgPSAoZW5kJDEgPCBsZW4gPyB0eXBlc1tlbmQkMV0gOiBvdXRlclR5cGUpID09IFwiTFwiO1xuICAgICAgICAgIHZhciByZXBsYWNlJDEgPSBiZWZvcmUgfHwgYWZ0ZXIgPyBcIkxcIiA6IFwiUlwiO1xuXG4gICAgICAgICAgZm9yICh2YXIgaiQxID0gaSQ2OyBqJDEgPCBlbmQkMTsgKytqJDEpIHtcbiAgICAgICAgICAgIHR5cGVzW2okMV0gPSByZXBsYWNlJDE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaSQ2ID0gZW5kJDEgLSAxO1xuICAgICAgICB9XG4gICAgICB9IC8vIEhlcmUgd2UgZGVwYXJ0IGZyb20gdGhlIGRvY3VtZW50ZWQgYWxnb3JpdGhtLCBpbiBvcmRlciB0byBhdm9pZFxuICAgICAgLy8gYnVpbGRpbmcgdXAgYW4gYWN0dWFsIGxldmVscyBhcnJheS4gU2luY2UgdGhlcmUgYXJlIG9ubHkgdGhyZWVcbiAgICAgIC8vIGxldmVscyAoMCwgMSwgMikgaW4gYW4gaW1wbGVtZW50YXRpb24gdGhhdCBkb2Vzbid0IHRha2VcbiAgICAgIC8vIGV4cGxpY2l0IGVtYmVkZGluZyBpbnRvIGFjY291bnQsIHdlIGNhbiBidWlsZCB1cCB0aGUgb3JkZXIgb25cbiAgICAgIC8vIHRoZSBmbHksIHdpdGhvdXQgZm9sbG93aW5nIHRoZSBsZXZlbC1iYXNlZCBhbGdvcml0aG0uXG5cblxuICAgICAgdmFyIG9yZGVyID0gW10sXG4gICAgICAgICAgbTtcblxuICAgICAgZm9yICh2YXIgaSQ3ID0gMDsgaSQ3IDwgbGVuOykge1xuICAgICAgICBpZiAoY291bnRzQXNMZWZ0LnRlc3QodHlwZXNbaSQ3XSkpIHtcbiAgICAgICAgICB2YXIgc3RhcnQgPSBpJDc7XG5cbiAgICAgICAgICBmb3IgKCsraSQ3OyBpJDcgPCBsZW4gJiYgY291bnRzQXNMZWZ0LnRlc3QodHlwZXNbaSQ3XSk7ICsraSQ3KSB7fVxuXG4gICAgICAgICAgb3JkZXIucHVzaChuZXcgQmlkaVNwYW4oMCwgc3RhcnQsIGkkNykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBwb3MgPSBpJDcsXG4gICAgICAgICAgICAgIGF0ID0gb3JkZXIubGVuZ3RoO1xuXG4gICAgICAgICAgZm9yICgrK2kkNzsgaSQ3IDwgbGVuICYmIHR5cGVzW2kkN10gIT0gXCJMXCI7ICsraSQ3KSB7fVxuXG4gICAgICAgICAgZm9yICh2YXIgaiQyID0gcG9zOyBqJDIgPCBpJDc7KSB7XG4gICAgICAgICAgICBpZiAoY291bnRzQXNOdW0udGVzdCh0eXBlc1tqJDJdKSkge1xuICAgICAgICAgICAgICBpZiAocG9zIDwgaiQyKSB7XG4gICAgICAgICAgICAgICAgb3JkZXIuc3BsaWNlKGF0LCAwLCBuZXcgQmlkaVNwYW4oMSwgcG9zLCBqJDIpKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHZhciBuc3RhcnQgPSBqJDI7XG5cbiAgICAgICAgICAgICAgZm9yICgrK2okMjsgaiQyIDwgaSQ3ICYmIGNvdW50c0FzTnVtLnRlc3QodHlwZXNbaiQyXSk7ICsraiQyKSB7fVxuXG4gICAgICAgICAgICAgIG9yZGVyLnNwbGljZShhdCwgMCwgbmV3IEJpZGlTcGFuKDIsIG5zdGFydCwgaiQyKSk7XG4gICAgICAgICAgICAgIHBvcyA9IGokMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICsraiQyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChwb3MgPCBpJDcpIHtcbiAgICAgICAgICAgIG9yZGVyLnNwbGljZShhdCwgMCwgbmV3IEJpZGlTcGFuKDEsIHBvcywgaSQ3KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChvcmRlclswXS5sZXZlbCA9PSAxICYmIChtID0gc3RyLm1hdGNoKC9eXFxzKy8pKSkge1xuICAgICAgICBvcmRlclswXS5mcm9tID0gbVswXS5sZW5ndGg7XG4gICAgICAgIG9yZGVyLnVuc2hpZnQobmV3IEJpZGlTcGFuKDAsIDAsIG1bMF0ubGVuZ3RoKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChsc3Qob3JkZXIpLmxldmVsID09IDEgJiYgKG0gPSBzdHIubWF0Y2goL1xccyskLykpKSB7XG4gICAgICAgIGxzdChvcmRlcikudG8gLT0gbVswXS5sZW5ndGg7XG4gICAgICAgIG9yZGVyLnB1c2gobmV3IEJpZGlTcGFuKDAsIGxlbiAtIG1bMF0ubGVuZ3RoLCBsZW4pKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9yZGVyWzBdLmxldmVsID09IDIpIHtcbiAgICAgICAgb3JkZXIudW5zaGlmdChuZXcgQmlkaVNwYW4oMSwgb3JkZXJbMF0udG8sIG9yZGVyWzBdLnRvKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcmRlclswXS5sZXZlbCAhPSBsc3Qob3JkZXIpLmxldmVsKSB7XG4gICAgICAgIG9yZGVyLnB1c2gobmV3IEJpZGlTcGFuKG9yZGVyWzBdLmxldmVsLCBsZW4sIGxlbikpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3JkZXI7XG4gICAgfTtcbiAgfSgpOyAvLyBHZXQgdGhlIGJpZGkgb3JkZXJpbmcgZm9yIHRoZSBnaXZlbiBsaW5lIChhbmQgY2FjaGUgaXQpLiBSZXR1cm5zXG4gIC8vIGZhbHNlIGZvciBsaW5lcyB0aGF0IGFyZSBmdWxseSBsZWZ0LXRvLXJpZ2h0LCBhbmQgYW4gYXJyYXkgb2ZcbiAgLy8gQmlkaVNwYW4gb2JqZWN0cyBvdGhlcndpc2UuXG5cblxuICBmdW5jdGlvbiBnZXRPcmRlcihsaW5lKSB7XG4gICAgdmFyIG9yZGVyID0gbGluZS5vcmRlcjtcblxuICAgIGlmIChvcmRlciA9PSBudWxsKSB7XG4gICAgICBvcmRlciA9IGxpbmUub3JkZXIgPSBiaWRpT3JkZXJpbmcobGluZS50ZXh0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3JkZXI7XG4gIH0gLy8gRVZFTlQgSEFORExJTkdcbiAgLy8gTGlnaHR3ZWlnaHQgZXZlbnQgZnJhbWV3b3JrLiBvbi9vZmYgYWxzbyB3b3JrIG9uIERPTSBub2RlcyxcbiAgLy8gcmVnaXN0ZXJpbmcgbmF0aXZlIERPTSBoYW5kbGVycy5cblxuXG4gIHZhciBub0hhbmRsZXJzID0gW107XG5cbiAgdmFyIG9uID0gZnVuY3Rpb24gb24oZW1pdHRlciwgdHlwZSwgZikge1xuICAgIGlmIChlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmLCBmYWxzZSk7XG4gICAgfSBlbHNlIGlmIChlbWl0dGVyLmF0dGFjaEV2ZW50KSB7XG4gICAgICBlbWl0dGVyLmF0dGFjaEV2ZW50KFwib25cIiArIHR5cGUsIGYpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbWFwID0gZW1pdHRlci5faGFuZGxlcnMgfHwgKGVtaXR0ZXIuX2hhbmRsZXJzID0ge30pO1xuICAgICAgbWFwW3R5cGVdID0gKG1hcFt0eXBlXSB8fCBub0hhbmRsZXJzKS5jb25jYXQoZik7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGdldEhhbmRsZXJzKGVtaXR0ZXIsIHR5cGUpIHtcbiAgICByZXR1cm4gZW1pdHRlci5faGFuZGxlcnMgJiYgZW1pdHRlci5faGFuZGxlcnNbdHlwZV0gfHwgbm9IYW5kbGVycztcbiAgfVxuXG4gIGZ1bmN0aW9uIG9mZihlbWl0dGVyLCB0eXBlLCBmKSB7XG4gICAgaWYgKGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgICAgZW1pdHRlci5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGYsIGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKGVtaXR0ZXIuZGV0YWNoRXZlbnQpIHtcbiAgICAgIGVtaXR0ZXIuZGV0YWNoRXZlbnQoXCJvblwiICsgdHlwZSwgZik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBtYXAgPSBlbWl0dGVyLl9oYW5kbGVycyxcbiAgICAgICAgICBhcnIgPSBtYXAgJiYgbWFwW3R5cGVdO1xuXG4gICAgICBpZiAoYXJyKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGluZGV4T2YoYXJyLCBmKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIG1hcFt0eXBlXSA9IGFyci5zbGljZSgwLCBpbmRleCkuY29uY2F0KGFyci5zbGljZShpbmRleCArIDEpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNpZ25hbChlbWl0dGVyLCB0eXBlXG4gIC8qLCB2YWx1ZXMuLi4qL1xuICApIHtcbiAgICB2YXIgaGFuZGxlcnMgPSBnZXRIYW5kbGVycyhlbWl0dGVyLCB0eXBlKTtcblxuICAgIGlmICghaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7ICsraSkge1xuICAgICAgaGFuZGxlcnNbaV0uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfVxuICB9IC8vIFRoZSBET00gZXZlbnRzIHRoYXQgQ29kZU1pcnJvciBoYW5kbGVzIGNhbiBiZSBvdmVycmlkZGVuIGJ5XG4gIC8vIHJlZ2lzdGVyaW5nIGEgKG5vbi1ET00pIGhhbmRsZXIgb24gdGhlIGVkaXRvciBmb3IgdGhlIGV2ZW50IG5hbWUsXG4gIC8vIGFuZCBwcmV2ZW50RGVmYXVsdC1pbmcgdGhlIGV2ZW50IGluIHRoYXQgaGFuZGxlci5cblxuXG4gIGZ1bmN0aW9uIHNpZ25hbERPTUV2ZW50KGNtLCBlLCBvdmVycmlkZSkge1xuICAgIGlmICh0eXBlb2YgZSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICBlID0ge1xuICAgICAgICB0eXBlOiBlLFxuICAgICAgICBwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24gcHJldmVudERlZmF1bHQoKSB7XG4gICAgICAgICAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBzaWduYWwoY20sIG92ZXJyaWRlIHx8IGUudHlwZSwgY20sIGUpO1xuICAgIHJldHVybiBlX2RlZmF1bHRQcmV2ZW50ZWQoZSkgfHwgZS5jb2RlbWlycm9ySWdub3JlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2lnbmFsQ3Vyc29yQWN0aXZpdHkoY20pIHtcbiAgICB2YXIgYXJyID0gY20uX2hhbmRsZXJzICYmIGNtLl9oYW5kbGVycy5jdXJzb3JBY3Rpdml0eTtcblxuICAgIGlmICghYXJyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHNldCA9IGNtLmN1ck9wLmN1cnNvckFjdGl2aXR5SGFuZGxlcnMgfHwgKGNtLmN1ck9wLmN1cnNvckFjdGl2aXR5SGFuZGxlcnMgPSBbXSk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGluZGV4T2Yoc2V0LCBhcnJbaV0pID09IC0xKSB7XG4gICAgICAgIHNldC5wdXNoKGFycltpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaGFzSGFuZGxlcihlbWl0dGVyLCB0eXBlKSB7XG4gICAgcmV0dXJuIGdldEhhbmRsZXJzKGVtaXR0ZXIsIHR5cGUpLmxlbmd0aCA+IDA7XG4gIH0gLy8gQWRkIG9uIGFuZCBvZmYgbWV0aG9kcyB0byBhIGNvbnN0cnVjdG9yJ3MgcHJvdG90eXBlLCB0byBtYWtlXG4gIC8vIHJlZ2lzdGVyaW5nIGV2ZW50cyBvbiBzdWNoIG9iamVjdHMgbW9yZSBjb252ZW5pZW50LlxuXG5cbiAgZnVuY3Rpb24gZXZlbnRNaXhpbihjdG9yKSB7XG4gICAgY3Rvci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAodHlwZSwgZikge1xuICAgICAgb24odGhpcywgdHlwZSwgZik7XG4gICAgfTtcblxuICAgIGN0b3IucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uICh0eXBlLCBmKSB7XG4gICAgICBvZmYodGhpcywgdHlwZSwgZik7XG4gICAgfTtcbiAgfSAvLyBEdWUgdG8gdGhlIGZhY3QgdGhhdCB3ZSBzdGlsbCBzdXBwb3J0IGp1cmFzc2ljIElFIHZlcnNpb25zLCBzb21lXG4gIC8vIGNvbXBhdGliaWxpdHkgd3JhcHBlcnMgYXJlIG5lZWRlZC5cblxuXG4gIGZ1bmN0aW9uIGVfcHJldmVudERlZmF1bHQoZSkge1xuICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlX3N0b3BQcm9wYWdhdGlvbihlKSB7XG4gICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZV9kZWZhdWx0UHJldmVudGVkKGUpIHtcbiAgICByZXR1cm4gZS5kZWZhdWx0UHJldmVudGVkICE9IG51bGwgPyBlLmRlZmF1bHRQcmV2ZW50ZWQgOiBlLnJldHVyblZhbHVlID09IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gZV9zdG9wKGUpIHtcbiAgICBlX3ByZXZlbnREZWZhdWx0KGUpO1xuICAgIGVfc3RvcFByb3BhZ2F0aW9uKGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gZV90YXJnZXQoZSkge1xuICAgIHJldHVybiBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gIH1cblxuICBmdW5jdGlvbiBlX2J1dHRvbihlKSB7XG4gICAgdmFyIGIgPSBlLndoaWNoO1xuXG4gICAgaWYgKGIgPT0gbnVsbCkge1xuICAgICAgaWYgKGUuYnV0dG9uICYgMSkge1xuICAgICAgICBiID0gMTtcbiAgICAgIH0gZWxzZSBpZiAoZS5idXR0b24gJiAyKSB7XG4gICAgICAgIGIgPSAzO1xuICAgICAgfSBlbHNlIGlmIChlLmJ1dHRvbiAmIDQpIHtcbiAgICAgICAgYiA9IDI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1hYyAmJiBlLmN0cmxLZXkgJiYgYiA9PSAxKSB7XG4gICAgICBiID0gMztcbiAgICB9XG5cbiAgICByZXR1cm4gYjtcbiAgfSAvLyBEZXRlY3QgZHJhZy1hbmQtZHJvcFxuXG5cbiAgdmFyIGRyYWdBbmREcm9wID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFRoZXJlIGlzICpzb21lKiBraW5kIG9mIGRyYWctYW5kLWRyb3Agc3VwcG9ydCBpbiBJRTYtOCwgYnV0IElcbiAgICAvLyBjb3VsZG4ndCBnZXQgaXQgdG8gd29yayB5ZXQuXG4gICAgaWYgKGllICYmIGllX3ZlcnNpb24gPCA5KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGRpdiA9IGVsdCgnZGl2Jyk7XG4gICAgcmV0dXJuIFwiZHJhZ2dhYmxlXCIgaW4gZGl2IHx8IFwiZHJhZ0Ryb3BcIiBpbiBkaXY7XG4gIH0oKTtcblxuICB2YXIgendzcFN1cHBvcnRlZDtcblxuICBmdW5jdGlvbiB6ZXJvV2lkdGhFbGVtZW50KG1lYXN1cmUpIHtcbiAgICBpZiAoendzcFN1cHBvcnRlZCA9PSBudWxsKSB7XG4gICAgICB2YXIgdGVzdCA9IGVsdChcInNwYW5cIiwgXCJcXHUyMDBCXCIpO1xuICAgICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQobWVhc3VyZSwgZWx0KFwic3BhblwiLCBbdGVzdCwgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJ4XCIpXSkpO1xuXG4gICAgICBpZiAobWVhc3VyZS5maXJzdENoaWxkLm9mZnNldEhlaWdodCAhPSAwKSB7XG4gICAgICAgIHp3c3BTdXBwb3J0ZWQgPSB0ZXN0Lm9mZnNldFdpZHRoIDw9IDEgJiYgdGVzdC5vZmZzZXRIZWlnaHQgPiAyICYmICEoaWUgJiYgaWVfdmVyc2lvbiA8IDgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBub2RlID0gendzcFN1cHBvcnRlZCA/IGVsdChcInNwYW5cIiwgXCJcXHUyMDBCXCIpIDogZWx0KFwic3BhblwiLCBcIlxceEEwXCIsIG51bGwsIFwiZGlzcGxheTogaW5saW5lLWJsb2NrOyB3aWR0aDogMXB4OyBtYXJnaW4tcmlnaHQ6IC0xcHhcIik7XG4gICAgbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbS10ZXh0XCIsIFwiXCIpO1xuICAgIHJldHVybiBub2RlO1xuICB9IC8vIEZlYXR1cmUtZGV0ZWN0IElFJ3MgY3J1bW15IGNsaWVudCByZWN0IHJlcG9ydGluZyBmb3IgYmlkaSB0ZXh0XG5cblxuICB2YXIgYmFkQmlkaVJlY3RzO1xuXG4gIGZ1bmN0aW9uIGhhc0JhZEJpZGlSZWN0cyhtZWFzdXJlKSB7XG4gICAgaWYgKGJhZEJpZGlSZWN0cyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gYmFkQmlkaVJlY3RzO1xuICAgIH1cblxuICAgIHZhciB0eHQgPSByZW1vdmVDaGlsZHJlbkFuZEFkZChtZWFzdXJlLCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIkFcXHUwNjJFQVwiKSk7XG4gICAgdmFyIHIwID0gcmFuZ2UodHh0LCAwLCAxKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB2YXIgcjEgPSByYW5nZSh0eHQsIDEsIDIpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJlbW92ZUNoaWxkcmVuKG1lYXN1cmUpO1xuXG4gICAgaWYgKCFyMCB8fCByMC5sZWZ0ID09IHIwLnJpZ2h0KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSAvLyBTYWZhcmkgcmV0dXJucyBudWxsIGluIHNvbWUgY2FzZXMgKCMyNzgwKVxuXG5cbiAgICByZXR1cm4gYmFkQmlkaVJlY3RzID0gcjEucmlnaHQgLSByMC5yaWdodCA8IDM7XG4gIH0gLy8gU2VlIGlmIFwiXCIuc3BsaXQgaXMgdGhlIGJyb2tlbiBJRSB2ZXJzaW9uLCBpZiBzbywgcHJvdmlkZSBhblxuICAvLyBhbHRlcm5hdGl2ZSB3YXkgdG8gc3BsaXQgbGluZXMuXG5cblxuICB2YXIgc3BsaXRMaW5lc0F1dG8gPSBcIlxcblxcbmJcIi5zcGxpdCgvXFxuLykubGVuZ3RoICE9IDMgPyBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgdmFyIHBvcyA9IDAsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBsID0gc3RyaW5nLmxlbmd0aDtcblxuICAgIHdoaWxlIChwb3MgPD0gbCkge1xuICAgICAgdmFyIG5sID0gc3RyaW5nLmluZGV4T2YoXCJcXG5cIiwgcG9zKTtcblxuICAgICAgaWYgKG5sID09IC0xKSB7XG4gICAgICAgIG5sID0gc3RyaW5nLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgdmFyIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zLCBzdHJpbmcuY2hhckF0KG5sIC0gMSkgPT0gXCJcXHJcIiA/IG5sIC0gMSA6IG5sKTtcbiAgICAgIHZhciBydCA9IGxpbmUuaW5kZXhPZihcIlxcclwiKTtcblxuICAgICAgaWYgKHJ0ICE9IC0xKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGxpbmUuc2xpY2UoMCwgcnQpKTtcbiAgICAgICAgcG9zICs9IHJ0ICsgMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGxpbmUpO1xuICAgICAgICBwb3MgPSBubCArIDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSA6IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnNwbGl0KC9cXHJcXG4/fFxcbi8pO1xuICB9O1xuICB2YXIgaGFzU2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbiA/IGZ1bmN0aW9uICh0ZSkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdGUuc2VsZWN0aW9uU3RhcnQgIT0gdGUuc2VsZWN0aW9uRW5kO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gOiBmdW5jdGlvbiAodGUpIHtcbiAgICB2YXIgcmFuZ2U7XG5cbiAgICB0cnkge1xuICAgICAgcmFuZ2UgPSB0ZS5vd25lckRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICBpZiAoIXJhbmdlIHx8IHJhbmdlLnBhcmVudEVsZW1lbnQoKSAhPSB0ZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZS5jb21wYXJlRW5kUG9pbnRzKFwiU3RhcnRUb0VuZFwiLCByYW5nZSkgIT0gMDtcbiAgfTtcblxuICB2YXIgaGFzQ29weUV2ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBlID0gZWx0KFwiZGl2XCIpO1xuXG4gICAgaWYgKFwib25jb3B5XCIgaW4gZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZS5zZXRBdHRyaWJ1dGUoXCJvbmNvcHlcIiwgXCJyZXR1cm47XCIpO1xuICAgIHJldHVybiB0eXBlb2YgZS5vbmNvcHkgPT0gXCJmdW5jdGlvblwiO1xuICB9KCk7XG5cbiAgdmFyIGJhZFpvb21lZFJlY3RzID0gbnVsbDtcblxuICBmdW5jdGlvbiBoYXNCYWRab29tZWRSZWN0cyhtZWFzdXJlKSB7XG4gICAgaWYgKGJhZFpvb21lZFJlY3RzICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBiYWRab29tZWRSZWN0cztcbiAgICB9XG5cbiAgICB2YXIgbm9kZSA9IHJlbW92ZUNoaWxkcmVuQW5kQWRkKG1lYXN1cmUsIGVsdChcInNwYW5cIiwgXCJ4XCIpKTtcbiAgICB2YXIgbm9ybWFsID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB2YXIgZnJvbVJhbmdlID0gcmFuZ2Uobm9kZSwgMCwgMSkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIGJhZFpvb21lZFJlY3RzID0gTWF0aC5hYnMobm9ybWFsLmxlZnQgLSBmcm9tUmFuZ2UubGVmdCkgPiAxO1xuICB9XG5cbiAgdmFyIG1vZGVzID0ge307XG4gIHZhciBtaW1lTW9kZXMgPSB7fTsgLy8gRXh0cmEgYXJndW1lbnRzIGFyZSBzdG9yZWQgYXMgdGhlIG1vZGUncyBkZXBlbmRlbmNpZXMsIHdoaWNoIGlzXG4gIC8vIHVzZWQgYnkgKGxlZ2FjeSkgbWVjaGFuaXNtcyBsaWtlIGxvYWRtb2RlLmpzIHRvIGF1dG9tYXRpY2FsbHlcbiAgLy8gbG9hZCBhIG1vZGUuIChQcmVmZXJyZWQgbWVjaGFuaXNtIGlzIHRoZSByZXF1aXJlL2RlZmluZSBjYWxscy4pXG5cbiAgZnVuY3Rpb24gZGVmaW5lTW9kZShuYW1lLCBtb2RlKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICBtb2RlLmRlcGVuZGVuY2llcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgfVxuXG4gICAgbW9kZXNbbmFtZV0gPSBtb2RlO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVmaW5lTUlNRShtaW1lLCBzcGVjKSB7XG4gICAgbWltZU1vZGVzW21pbWVdID0gc3BlYztcbiAgfSAvLyBHaXZlbiBhIE1JTUUgdHlwZSwgYSB7bmFtZSwgLi4ub3B0aW9uc30gY29uZmlnIG9iamVjdCwgb3IgYSBuYW1lXG4gIC8vIHN0cmluZywgcmV0dXJuIGEgbW9kZSBjb25maWcgb2JqZWN0LlxuXG5cbiAgZnVuY3Rpb24gcmVzb2x2ZU1vZGUoc3BlYykge1xuICAgIGlmICh0eXBlb2Ygc3BlYyA9PSBcInN0cmluZ1wiICYmIG1pbWVNb2Rlcy5oYXNPd25Qcm9wZXJ0eShzcGVjKSkge1xuICAgICAgc3BlYyA9IG1pbWVNb2Rlc1tzcGVjXTtcbiAgICB9IGVsc2UgaWYgKHNwZWMgJiYgdHlwZW9mIHNwZWMubmFtZSA9PSBcInN0cmluZ1wiICYmIG1pbWVNb2Rlcy5oYXNPd25Qcm9wZXJ0eShzcGVjLm5hbWUpKSB7XG4gICAgICB2YXIgZm91bmQgPSBtaW1lTW9kZXNbc3BlYy5uYW1lXTtcblxuICAgICAgaWYgKHR5cGVvZiBmb3VuZCA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGZvdW5kID0ge1xuICAgICAgICAgIG5hbWU6IGZvdW5kXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHNwZWMgPSBjcmVhdGVPYmooZm91bmQsIHNwZWMpO1xuICAgICAgc3BlYy5uYW1lID0gZm91bmQubmFtZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzcGVjID09IFwic3RyaW5nXCIgJiYgL15bXFx3XFwtXStcXC9bXFx3XFwtXStcXCt4bWwkLy50ZXN0KHNwZWMpKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZU1vZGUoXCJhcHBsaWNhdGlvbi94bWxcIik7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc3BlYyA9PSBcInN0cmluZ1wiICYmIC9eW1xcd1xcLV0rXFwvW1xcd1xcLV0rXFwranNvbiQvLnRlc3Qoc3BlYykpIHtcbiAgICAgIHJldHVybiByZXNvbHZlTW9kZShcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzcGVjID09IFwic3RyaW5nXCIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IHNwZWNcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzcGVjIHx8IHtcbiAgICAgICAgbmFtZTogXCJudWxsXCJcbiAgICAgIH07XG4gICAgfVxuICB9IC8vIEdpdmVuIGEgbW9kZSBzcGVjIChhbnl0aGluZyB0aGF0IHJlc29sdmVNb2RlIGFjY2VwdHMpLCBmaW5kIGFuZFxuICAvLyBpbml0aWFsaXplIGFuIGFjdHVhbCBtb2RlIG9iamVjdC5cblxuXG4gIGZ1bmN0aW9uIGdldE1vZGUob3B0aW9ucywgc3BlYykge1xuICAgIHNwZWMgPSByZXNvbHZlTW9kZShzcGVjKTtcbiAgICB2YXIgbWZhY3RvcnkgPSBtb2Rlc1tzcGVjLm5hbWVdO1xuXG4gICAgaWYgKCFtZmFjdG9yeSkge1xuICAgICAgcmV0dXJuIGdldE1vZGUob3B0aW9ucywgXCJ0ZXh0L3BsYWluXCIpO1xuICAgIH1cblxuICAgIHZhciBtb2RlT2JqID0gbWZhY3Rvcnkob3B0aW9ucywgc3BlYyk7XG5cbiAgICBpZiAobW9kZUV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkoc3BlYy5uYW1lKSkge1xuICAgICAgdmFyIGV4dHMgPSBtb2RlRXh0ZW5zaW9uc1tzcGVjLm5hbWVdO1xuXG4gICAgICBmb3IgKHZhciBwcm9wIGluIGV4dHMpIHtcbiAgICAgICAgaWYgKCFleHRzLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobW9kZU9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgIG1vZGVPYmpbXCJfXCIgKyBwcm9wXSA9IG1vZGVPYmpbcHJvcF07XG4gICAgICAgIH1cblxuICAgICAgICBtb2RlT2JqW3Byb3BdID0gZXh0c1twcm9wXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBtb2RlT2JqLm5hbWUgPSBzcGVjLm5hbWU7XG5cbiAgICBpZiAoc3BlYy5oZWxwZXJUeXBlKSB7XG4gICAgICBtb2RlT2JqLmhlbHBlclR5cGUgPSBzcGVjLmhlbHBlclR5cGU7XG4gICAgfVxuXG4gICAgaWYgKHNwZWMubW9kZVByb3BzKSB7XG4gICAgICBmb3IgKHZhciBwcm9wJDEgaW4gc3BlYy5tb2RlUHJvcHMpIHtcbiAgICAgICAgbW9kZU9ialtwcm9wJDFdID0gc3BlYy5tb2RlUHJvcHNbcHJvcCQxXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbW9kZU9iajtcbiAgfSAvLyBUaGlzIGNhbiBiZSB1c2VkIHRvIGF0dGFjaCBwcm9wZXJ0aWVzIHRvIG1vZGUgb2JqZWN0cyBmcm9tXG4gIC8vIG91dHNpZGUgdGhlIGFjdHVhbCBtb2RlIGRlZmluaXRpb24uXG5cblxuICB2YXIgbW9kZUV4dGVuc2lvbnMgPSB7fTtcblxuICBmdW5jdGlvbiBleHRlbmRNb2RlKG1vZGUsIHByb3BlcnRpZXMpIHtcbiAgICB2YXIgZXh0cyA9IG1vZGVFeHRlbnNpb25zLmhhc093blByb3BlcnR5KG1vZGUpID8gbW9kZUV4dGVuc2lvbnNbbW9kZV0gOiBtb2RlRXh0ZW5zaW9uc1ttb2RlXSA9IHt9O1xuICAgIGNvcHlPYmoocHJvcGVydGllcywgZXh0cyk7XG4gIH1cblxuICBmdW5jdGlvbiBjb3B5U3RhdGUobW9kZSwgc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG5cbiAgICBpZiAobW9kZS5jb3B5U3RhdGUpIHtcbiAgICAgIHJldHVybiBtb2RlLmNvcHlTdGF0ZShzdGF0ZSk7XG4gICAgfVxuXG4gICAgdmFyIG5zdGF0ZSA9IHt9O1xuXG4gICAgZm9yICh2YXIgbiBpbiBzdGF0ZSkge1xuICAgICAgdmFyIHZhbCA9IHN0YXRlW25dO1xuXG4gICAgICBpZiAodmFsIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdmFsID0gdmFsLmNvbmNhdChbXSk7XG4gICAgICB9XG5cbiAgICAgIG5zdGF0ZVtuXSA9IHZhbDtcbiAgICB9XG5cbiAgICByZXR1cm4gbnN0YXRlO1xuICB9IC8vIEdpdmVuIGEgbW9kZSBhbmQgYSBzdGF0ZSAoZm9yIHRoYXQgbW9kZSksIGZpbmQgdGhlIGlubmVyIG1vZGUgYW5kXG4gIC8vIHN0YXRlIGF0IHRoZSBwb3NpdGlvbiB0aGF0IHRoZSBzdGF0ZSByZWZlcnMgdG8uXG5cblxuICBmdW5jdGlvbiBpbm5lck1vZGUobW9kZSwgc3RhdGUpIHtcbiAgICB2YXIgaW5mbztcblxuICAgIHdoaWxlIChtb2RlLmlubmVyTW9kZSkge1xuICAgICAgaW5mbyA9IG1vZGUuaW5uZXJNb2RlKHN0YXRlKTtcblxuICAgICAgaWYgKCFpbmZvIHx8IGluZm8ubW9kZSA9PSBtb2RlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBzdGF0ZSA9IGluZm8uc3RhdGU7XG4gICAgICBtb2RlID0gaW5mby5tb2RlO1xuICAgIH1cblxuICAgIHJldHVybiBpbmZvIHx8IHtcbiAgICAgIG1vZGU6IG1vZGUsXG4gICAgICBzdGF0ZTogc3RhdGVcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRTdGF0ZShtb2RlLCBhMSwgYTIpIHtcbiAgICByZXR1cm4gbW9kZS5zdGFydFN0YXRlID8gbW9kZS5zdGFydFN0YXRlKGExLCBhMikgOiB0cnVlO1xuICB9IC8vIFNUUklORyBTVFJFQU1cbiAgLy8gRmVkIHRvIHRoZSBtb2RlIHBhcnNlcnMsIHByb3ZpZGVzIGhlbHBlciBmdW5jdGlvbnMgdG8gbWFrZVxuICAvLyBwYXJzZXJzIG1vcmUgc3VjY2luY3QuXG5cblxuICB2YXIgU3RyaW5nU3RyZWFtID0gZnVuY3Rpb24gU3RyaW5nU3RyZWFtKHN0cmluZywgdGFiU2l6ZSkge1xuICAgIHRoaXMucG9zID0gdGhpcy5zdGFydCA9IDA7XG4gICAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG4gICAgdGhpcy50YWJTaXplID0gdGFiU2l6ZSB8fCA4O1xuICAgIHRoaXMubGFzdENvbHVtblBvcyA9IHRoaXMubGFzdENvbHVtblZhbHVlID0gMDtcbiAgICB0aGlzLmxpbmVTdGFydCA9IDA7XG4gIH07XG5cbiAgU3RyaW5nU3RyZWFtLnByb3RvdHlwZSA9IHtcbiAgICBlb2w6IGZ1bmN0aW9uIGVvbCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvcyA+PSB0aGlzLnN0cmluZy5sZW5ndGg7XG4gICAgfSxcbiAgICBzb2w6IGZ1bmN0aW9uIHNvbCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvcyA9PSB0aGlzLmxpbmVTdGFydDtcbiAgICB9LFxuICAgIHBlZWs6IGZ1bmN0aW9uIHBlZWsoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdHJpbmcuY2hhckF0KHRoaXMucG9zKSB8fCB1bmRlZmluZWQ7XG4gICAgfSxcbiAgICBuZXh0OiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgaWYgKHRoaXMucG9zIDwgdGhpcy5zdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0cmluZy5jaGFyQXQodGhpcy5wb3MrKyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlYXQ6IGZ1bmN0aW9uIGVhdChtYXRjaCkge1xuICAgICAgdmFyIGNoID0gdGhpcy5zdHJpbmcuY2hhckF0KHRoaXMucG9zKTtcbiAgICAgIHZhciBvaztcblxuICAgICAgaWYgKHR5cGVvZiBtYXRjaCA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIG9rID0gY2ggPT0gbWF0Y2g7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvayA9IGNoICYmIChtYXRjaC50ZXN0ID8gbWF0Y2gudGVzdChjaCkgOiBtYXRjaChjaCkpO1xuICAgICAgfVxuXG4gICAgICBpZiAob2spIHtcbiAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgcmV0dXJuIGNoO1xuICAgICAgfVxuICAgIH0sXG4gICAgZWF0V2hpbGU6IGZ1bmN0aW9uIGVhdFdoaWxlKG1hdGNoKSB7XG4gICAgICB2YXIgc3RhcnQgPSB0aGlzLnBvcztcblxuICAgICAgd2hpbGUgKHRoaXMuZWF0KG1hdGNoKSkge31cblxuICAgICAgcmV0dXJuIHRoaXMucG9zID4gc3RhcnQ7XG4gICAgfSxcbiAgICBlYXRTcGFjZTogZnVuY3Rpb24gZWF0U3BhY2UoKSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcbiAgICAgIHZhciBzdGFydCA9IHRoaXMucG9zO1xuXG4gICAgICB3aGlsZSAoL1tcXHNcXHUwMGEwXS8udGVzdCh0aGlzLnN0cmluZy5jaGFyQXQodGhpcy5wb3MpKSkge1xuICAgICAgICArK3RoaXMkMS5wb3M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnBvcyA+IHN0YXJ0O1xuICAgIH0sXG4gICAgc2tpcFRvRW5kOiBmdW5jdGlvbiBza2lwVG9FbmQoKSB7XG4gICAgICB0aGlzLnBvcyA9IHRoaXMuc3RyaW5nLmxlbmd0aDtcbiAgICB9LFxuICAgIHNraXBUbzogZnVuY3Rpb24gc2tpcFRvKGNoKSB7XG4gICAgICB2YXIgZm91bmQgPSB0aGlzLnN0cmluZy5pbmRleE9mKGNoLCB0aGlzLnBvcyk7XG5cbiAgICAgIGlmIChmb3VuZCA+IC0xKSB7XG4gICAgICAgIHRoaXMucG9zID0gZm91bmQ7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0sXG4gICAgYmFja1VwOiBmdW5jdGlvbiBiYWNrVXAobikge1xuICAgICAgdGhpcy5wb3MgLT0gbjtcbiAgICB9LFxuICAgIGNvbHVtbjogZnVuY3Rpb24gY29sdW1uKCkge1xuICAgICAgaWYgKHRoaXMubGFzdENvbHVtblBvcyA8IHRoaXMuc3RhcnQpIHtcbiAgICAgICAgdGhpcy5sYXN0Q29sdW1uVmFsdWUgPSBjb3VudENvbHVtbih0aGlzLnN0cmluZywgdGhpcy5zdGFydCwgdGhpcy50YWJTaXplLCB0aGlzLmxhc3RDb2x1bW5Qb3MsIHRoaXMubGFzdENvbHVtblZhbHVlKTtcbiAgICAgICAgdGhpcy5sYXN0Q29sdW1uUG9zID0gdGhpcy5zdGFydDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMubGFzdENvbHVtblZhbHVlIC0gKHRoaXMubGluZVN0YXJ0ID8gY291bnRDb2x1bW4odGhpcy5zdHJpbmcsIHRoaXMubGluZVN0YXJ0LCB0aGlzLnRhYlNpemUpIDogMCk7XG4gICAgfSxcbiAgICBpbmRlbnRhdGlvbjogZnVuY3Rpb24gaW5kZW50YXRpb24oKSB7XG4gICAgICByZXR1cm4gY291bnRDb2x1bW4odGhpcy5zdHJpbmcsIG51bGwsIHRoaXMudGFiU2l6ZSkgLSAodGhpcy5saW5lU3RhcnQgPyBjb3VudENvbHVtbih0aGlzLnN0cmluZywgdGhpcy5saW5lU3RhcnQsIHRoaXMudGFiU2l6ZSkgOiAwKTtcbiAgICB9LFxuICAgIG1hdGNoOiBmdW5jdGlvbiBtYXRjaChwYXR0ZXJuLCBjb25zdW1lLCBjYXNlSW5zZW5zaXRpdmUpIHtcbiAgICAgIGlmICh0eXBlb2YgcGF0dGVybiA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHZhciBjYXNlZCA9IGZ1bmN0aW9uIGNhc2VkKHN0cikge1xuICAgICAgICAgIHJldHVybiBjYXNlSW5zZW5zaXRpdmUgPyBzdHIudG9Mb3dlckNhc2UoKSA6IHN0cjtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgc3Vic3RyID0gdGhpcy5zdHJpbmcuc3Vic3RyKHRoaXMucG9zLCBwYXR0ZXJuLmxlbmd0aCk7XG5cbiAgICAgICAgaWYgKGNhc2VkKHN1YnN0cikgPT0gY2FzZWQocGF0dGVybikpIHtcbiAgICAgICAgICBpZiAoY29uc3VtZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IHBhdHRlcm4ubGVuZ3RoO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbWF0Y2ggPSB0aGlzLnN0cmluZy5zbGljZSh0aGlzLnBvcykubWF0Y2gocGF0dGVybik7XG5cbiAgICAgICAgaWYgKG1hdGNoICYmIG1hdGNoLmluZGV4ID4gMCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1hdGNoICYmIGNvbnN1bWUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgdGhpcy5wb3MgKz0gbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgfVxuICAgIH0sXG4gICAgY3VycmVudDogZnVuY3Rpb24gY3VycmVudCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0cmluZy5zbGljZSh0aGlzLnN0YXJ0LCB0aGlzLnBvcyk7XG4gICAgfSxcbiAgICBoaWRlRmlyc3RDaGFyczogZnVuY3Rpb24gaGlkZUZpcnN0Q2hhcnMobiwgaW5uZXIpIHtcbiAgICAgIHRoaXMubGluZVN0YXJ0ICs9IG47XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBpbm5lcigpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5saW5lU3RhcnQgLT0gbjtcbiAgICAgIH1cbiAgICB9XG4gIH07IC8vIENvbXB1dGUgYSBzdHlsZSBhcnJheSAoYW4gYXJyYXkgc3RhcnRpbmcgd2l0aCBhIG1vZGUgZ2VuZXJhdGlvblxuICAvLyAtLSBmb3IgaW52YWxpZGF0aW9uIC0tIGZvbGxvd2VkIGJ5IHBhaXJzIG9mIGVuZCBwb3NpdGlvbnMgYW5kXG4gIC8vIHN0eWxlIHN0cmluZ3MpLCB3aGljaCBpcyB1c2VkIHRvIGhpZ2hsaWdodCB0aGUgdG9rZW5zIG9uIHRoZVxuICAvLyBsaW5lLlxuXG4gIGZ1bmN0aW9uIGhpZ2hsaWdodExpbmUoY20sIGxpbmUsIHN0YXRlLCBmb3JjZVRvRW5kKSB7XG4gICAgLy8gQSBzdHlsZXMgYXJyYXkgYWx3YXlzIHN0YXJ0cyB3aXRoIGEgbnVtYmVyIGlkZW50aWZ5aW5nIHRoZVxuICAgIC8vIG1vZGUvb3ZlcmxheXMgdGhhdCBpdCBpcyBiYXNlZCBvbiAoZm9yIGVhc3kgaW52YWxpZGF0aW9uKS5cbiAgICB2YXIgc3QgPSBbY20uc3RhdGUubW9kZUdlbl0sXG4gICAgICAgIGxpbmVDbGFzc2VzID0ge307IC8vIENvbXB1dGUgdGhlIGJhc2UgYXJyYXkgb2Ygc3R5bGVzXG5cbiAgICBydW5Nb2RlKGNtLCBsaW5lLnRleHQsIGNtLmRvYy5tb2RlLCBzdGF0ZSwgZnVuY3Rpb24gKGVuZCwgc3R5bGUpIHtcbiAgICAgIHJldHVybiBzdC5wdXNoKGVuZCwgc3R5bGUpO1xuICAgIH0sIGxpbmVDbGFzc2VzLCBmb3JjZVRvRW5kKTsgLy8gUnVuIG92ZXJsYXlzLCBhZGp1c3Qgc3R5bGUgYXJyYXkuXG5cbiAgICB2YXIgbG9vcCA9IGZ1bmN0aW9uIGxvb3Aobykge1xuICAgICAgdmFyIG92ZXJsYXkgPSBjbS5zdGF0ZS5vdmVybGF5c1tvXSxcbiAgICAgICAgICBpID0gMSxcbiAgICAgICAgICBhdCA9IDA7XG4gICAgICBydW5Nb2RlKGNtLCBsaW5lLnRleHQsIG92ZXJsYXkubW9kZSwgdHJ1ZSwgZnVuY3Rpb24gKGVuZCwgc3R5bGUpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gaTsgLy8gRW5zdXJlIHRoZXJlJ3MgYSB0b2tlbiBlbmQgYXQgdGhlIGN1cnJlbnQgcG9zaXRpb24sIGFuZCB0aGF0IGkgcG9pbnRzIGF0IGl0XG5cbiAgICAgICAgd2hpbGUgKGF0IDwgZW5kKSB7XG4gICAgICAgICAgdmFyIGlfZW5kID0gc3RbaV07XG5cbiAgICAgICAgICBpZiAoaV9lbmQgPiBlbmQpIHtcbiAgICAgICAgICAgIHN0LnNwbGljZShpLCAxLCBlbmQsIHN0W2kgKyAxXSwgaV9lbmQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICBhdCA9IE1hdGgubWluKGVuZCwgaV9lbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzdHlsZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvdmVybGF5Lm9wYXF1ZSkge1xuICAgICAgICAgIHN0LnNwbGljZShzdGFydCwgaSAtIHN0YXJ0LCBlbmQsIFwib3ZlcmxheSBcIiArIHN0eWxlKTtcbiAgICAgICAgICBpID0gc3RhcnQgKyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAoOyBzdGFydCA8IGk7IHN0YXJ0ICs9IDIpIHtcbiAgICAgICAgICAgIHZhciBjdXIgPSBzdFtzdGFydCArIDFdO1xuICAgICAgICAgICAgc3Rbc3RhcnQgKyAxXSA9IChjdXIgPyBjdXIgKyBcIiBcIiA6IFwiXCIpICsgXCJvdmVybGF5IFwiICsgc3R5bGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBsaW5lQ2xhc3Nlcyk7XG4gICAgfTtcblxuICAgIGZvciAodmFyIG8gPSAwOyBvIDwgY20uc3RhdGUub3ZlcmxheXMubGVuZ3RoOyArK28pIHtcbiAgICAgIGxvb3Aobyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0eWxlczogc3QsXG4gICAgICBjbGFzc2VzOiBsaW5lQ2xhc3Nlcy5iZ0NsYXNzIHx8IGxpbmVDbGFzc2VzLnRleHRDbGFzcyA/IGxpbmVDbGFzc2VzIDogbnVsbFxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBnZXRMaW5lU3R5bGVzKGNtLCBsaW5lLCB1cGRhdGVGcm9udGllcikge1xuICAgIGlmICghbGluZS5zdHlsZXMgfHwgbGluZS5zdHlsZXNbMF0gIT0gY20uc3RhdGUubW9kZUdlbikge1xuICAgICAgdmFyIHN0YXRlID0gZ2V0U3RhdGVCZWZvcmUoY20sIGxpbmVObyhsaW5lKSk7XG4gICAgICB2YXIgcmVzdWx0ID0gaGlnaGxpZ2h0TGluZShjbSwgbGluZSwgbGluZS50ZXh0Lmxlbmd0aCA+IGNtLm9wdGlvbnMubWF4SGlnaGxpZ2h0TGVuZ3RoID8gY29weVN0YXRlKGNtLmRvYy5tb2RlLCBzdGF0ZSkgOiBzdGF0ZSk7XG4gICAgICBsaW5lLnN0YXRlQWZ0ZXIgPSBzdGF0ZTtcbiAgICAgIGxpbmUuc3R5bGVzID0gcmVzdWx0LnN0eWxlcztcblxuICAgICAgaWYgKHJlc3VsdC5jbGFzc2VzKSB7XG4gICAgICAgIGxpbmUuc3R5bGVDbGFzc2VzID0gcmVzdWx0LmNsYXNzZXM7XG4gICAgICB9IGVsc2UgaWYgKGxpbmUuc3R5bGVDbGFzc2VzKSB7XG4gICAgICAgIGxpbmUuc3R5bGVDbGFzc2VzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHVwZGF0ZUZyb250aWVyID09PSBjbS5kb2MuZnJvbnRpZXIpIHtcbiAgICAgICAgY20uZG9jLmZyb250aWVyKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmUuc3R5bGVzO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U3RhdGVCZWZvcmUoY20sIG4sIHByZWNpc2UpIHtcbiAgICB2YXIgZG9jID0gY20uZG9jLFxuICAgICAgICBkaXNwbGF5ID0gY20uZGlzcGxheTtcblxuICAgIGlmICghZG9jLm1vZGUuc3RhcnRTdGF0ZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdmFyIHBvcyA9IGZpbmRTdGFydExpbmUoY20sIG4sIHByZWNpc2UpLFxuICAgICAgICBzdGF0ZSA9IHBvcyA+IGRvYy5maXJzdCAmJiBnZXRMaW5lKGRvYywgcG9zIC0gMSkuc3RhdGVBZnRlcjtcblxuICAgIGlmICghc3RhdGUpIHtcbiAgICAgIHN0YXRlID0gc3RhcnRTdGF0ZShkb2MubW9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlID0gY29weVN0YXRlKGRvYy5tb2RlLCBzdGF0ZSk7XG4gICAgfVxuXG4gICAgZG9jLml0ZXIocG9zLCBuLCBmdW5jdGlvbiAobGluZSkge1xuICAgICAgcHJvY2Vzc0xpbmUoY20sIGxpbmUudGV4dCwgc3RhdGUpO1xuICAgICAgdmFyIHNhdmUgPSBwb3MgPT0gbiAtIDEgfHwgcG9zICUgNSA9PSAwIHx8IHBvcyA+PSBkaXNwbGF5LnZpZXdGcm9tICYmIHBvcyA8IGRpc3BsYXkudmlld1RvO1xuICAgICAgbGluZS5zdGF0ZUFmdGVyID0gc2F2ZSA/IGNvcHlTdGF0ZShkb2MubW9kZSwgc3RhdGUpIDogbnVsbDtcbiAgICAgICsrcG9zO1xuICAgIH0pO1xuXG4gICAgaWYgKHByZWNpc2UpIHtcbiAgICAgIGRvYy5mcm9udGllciA9IHBvcztcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdGU7XG4gIH0gLy8gTGlnaHR3ZWlnaHQgZm9ybSBvZiBoaWdobGlnaHQgLS0gcHJvY2VlZCBvdmVyIHRoaXMgbGluZSBhbmRcbiAgLy8gdXBkYXRlIHN0YXRlLCBidXQgZG9uJ3Qgc2F2ZSBhIHN0eWxlIGFycmF5LiBVc2VkIGZvciBsaW5lcyB0aGF0XG4gIC8vIGFyZW4ndCBjdXJyZW50bHkgdmlzaWJsZS5cblxuXG4gIGZ1bmN0aW9uIHByb2Nlc3NMaW5lKGNtLCB0ZXh0LCBzdGF0ZSwgc3RhcnRBdCkge1xuICAgIHZhciBtb2RlID0gY20uZG9jLm1vZGU7XG4gICAgdmFyIHN0cmVhbSA9IG5ldyBTdHJpbmdTdHJlYW0odGV4dCwgY20ub3B0aW9ucy50YWJTaXplKTtcbiAgICBzdHJlYW0uc3RhcnQgPSBzdHJlYW0ucG9zID0gc3RhcnRBdCB8fCAwO1xuXG4gICAgaWYgKHRleHQgPT0gXCJcIikge1xuICAgICAgY2FsbEJsYW5rTGluZShtb2RlLCBzdGF0ZSk7XG4gICAgfVxuXG4gICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgIHJlYWRUb2tlbihtb2RlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICAgIHN0cmVhbS5zdGFydCA9IHN0cmVhbS5wb3M7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2FsbEJsYW5rTGluZShtb2RlLCBzdGF0ZSkge1xuICAgIGlmIChtb2RlLmJsYW5rTGluZSkge1xuICAgICAgcmV0dXJuIG1vZGUuYmxhbmtMaW5lKHN0YXRlKTtcbiAgICB9XG5cbiAgICBpZiAoIW1vZGUuaW5uZXJNb2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGlubmVyID0gaW5uZXJNb2RlKG1vZGUsIHN0YXRlKTtcblxuICAgIGlmIChpbm5lci5tb2RlLmJsYW5rTGluZSkge1xuICAgICAgcmV0dXJuIGlubmVyLm1vZGUuYmxhbmtMaW5lKGlubmVyLnN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWFkVG9rZW4obW9kZSwgc3RyZWFtLCBzdGF0ZSwgaW5uZXIpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgIGlmIChpbm5lcikge1xuICAgICAgICBpbm5lclswXSA9IGlubmVyTW9kZShtb2RlLCBzdGF0ZSkubW9kZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0eWxlID0gbW9kZS50b2tlbihzdHJlYW0sIHN0YXRlKTtcblxuICAgICAgaWYgKHN0cmVhbS5wb3MgPiBzdHJlYW0uc3RhcnQpIHtcbiAgICAgICAgcmV0dXJuIHN0eWxlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihcIk1vZGUgXCIgKyBtb2RlLm5hbWUgKyBcIiBmYWlsZWQgdG8gYWR2YW5jZSBzdHJlYW0uXCIpO1xuICB9IC8vIFV0aWxpdHkgZm9yIGdldFRva2VuQXQgYW5kIGdldExpbmVUb2tlbnNcblxuXG4gIGZ1bmN0aW9uIHRha2VUb2tlbihjbSwgcG9zLCBwcmVjaXNlLCBhc0FycmF5KSB7XG4gICAgdmFyIGdldE9iaiA9IGZ1bmN0aW9uIGdldE9iaihjb3B5KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGFydDogc3RyZWFtLnN0YXJ0LFxuICAgICAgICBlbmQ6IHN0cmVhbS5wb3MsXG4gICAgICAgIHN0cmluZzogc3RyZWFtLmN1cnJlbnQoKSxcbiAgICAgICAgdHlwZTogc3R5bGUgfHwgbnVsbCxcbiAgICAgICAgc3RhdGU6IGNvcHkgPyBjb3B5U3RhdGUoZG9jLm1vZGUsIHN0YXRlKSA6IHN0YXRlXG4gICAgICB9O1xuICAgIH07XG5cbiAgICB2YXIgZG9jID0gY20uZG9jLFxuICAgICAgICBtb2RlID0gZG9jLm1vZGUsXG4gICAgICAgIHN0eWxlO1xuICAgIHBvcyA9IF9jbGlwUG9zKGRvYywgcG9zKTtcbiAgICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBwb3MubGluZSksXG4gICAgICAgIHN0YXRlID0gZ2V0U3RhdGVCZWZvcmUoY20sIHBvcy5saW5lLCBwcmVjaXNlKTtcbiAgICB2YXIgc3RyZWFtID0gbmV3IFN0cmluZ1N0cmVhbShsaW5lLnRleHQsIGNtLm9wdGlvbnMudGFiU2l6ZSksXG4gICAgICAgIHRva2VucztcblxuICAgIGlmIChhc0FycmF5KSB7XG4gICAgICB0b2tlbnMgPSBbXTtcbiAgICB9XG5cbiAgICB3aGlsZSAoKGFzQXJyYXkgfHwgc3RyZWFtLnBvcyA8IHBvcy5jaCkgJiYgIXN0cmVhbS5lb2woKSkge1xuICAgICAgc3RyZWFtLnN0YXJ0ID0gc3RyZWFtLnBvcztcbiAgICAgIHN0eWxlID0gcmVhZFRva2VuKG1vZGUsIHN0cmVhbSwgc3RhdGUpO1xuXG4gICAgICBpZiAoYXNBcnJheSkge1xuICAgICAgICB0b2tlbnMucHVzaChnZXRPYmoodHJ1ZSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBhc0FycmF5ID8gdG9rZW5zIDogZ2V0T2JqKCk7XG4gIH1cblxuICBmdW5jdGlvbiBleHRyYWN0TGluZUNsYXNzZXModHlwZSwgb3V0cHV0KSB7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIGZvciAoOzspIHtcbiAgICAgICAgdmFyIGxpbmVDbGFzcyA9IHR5cGUubWF0Y2goLyg/Ol58XFxzKylsaW5lLShiYWNrZ3JvdW5kLSk/KFxcUyspLyk7XG5cbiAgICAgICAgaWYgKCFsaW5lQ2xhc3MpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHR5cGUgPSB0eXBlLnNsaWNlKDAsIGxpbmVDbGFzcy5pbmRleCkgKyB0eXBlLnNsaWNlKGxpbmVDbGFzcy5pbmRleCArIGxpbmVDbGFzc1swXS5sZW5ndGgpO1xuICAgICAgICB2YXIgcHJvcCA9IGxpbmVDbGFzc1sxXSA/IFwiYmdDbGFzc1wiIDogXCJ0ZXh0Q2xhc3NcIjtcblxuICAgICAgICBpZiAob3V0cHV0W3Byb3BdID09IG51bGwpIHtcbiAgICAgICAgICBvdXRwdXRbcHJvcF0gPSBsaW5lQ2xhc3NbMl07XG4gICAgICAgIH0gZWxzZSBpZiAoIW5ldyBSZWdFeHAoXCIoPzpefFxccylcIiArIGxpbmVDbGFzc1syXSArIFwiKD86JHxcXHMpXCIpLnRlc3Qob3V0cHV0W3Byb3BdKSkge1xuICAgICAgICAgIG91dHB1dFtwcm9wXSArPSBcIiBcIiArIGxpbmVDbGFzc1syXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0eXBlO1xuICB9IC8vIFJ1biB0aGUgZ2l2ZW4gbW9kZSdzIHBhcnNlciBvdmVyIGEgbGluZSwgY2FsbGluZyBmIGZvciBlYWNoIHRva2VuLlxuXG5cbiAgZnVuY3Rpb24gcnVuTW9kZShjbSwgdGV4dCwgbW9kZSwgc3RhdGUsIGYsIGxpbmVDbGFzc2VzLCBmb3JjZVRvRW5kKSB7XG4gICAgdmFyIGZsYXR0ZW5TcGFucyA9IG1vZGUuZmxhdHRlblNwYW5zO1xuXG4gICAgaWYgKGZsYXR0ZW5TcGFucyA9PSBudWxsKSB7XG4gICAgICBmbGF0dGVuU3BhbnMgPSBjbS5vcHRpb25zLmZsYXR0ZW5TcGFucztcbiAgICB9XG5cbiAgICB2YXIgY3VyU3RhcnQgPSAwLFxuICAgICAgICBjdXJTdHlsZSA9IG51bGw7XG4gICAgdmFyIHN0cmVhbSA9IG5ldyBTdHJpbmdTdHJlYW0odGV4dCwgY20ub3B0aW9ucy50YWJTaXplKSxcbiAgICAgICAgc3R5bGU7XG4gICAgdmFyIGlubmVyID0gY20ub3B0aW9ucy5hZGRNb2RlQ2xhc3MgJiYgW251bGxdO1xuXG4gICAgaWYgKHRleHQgPT0gXCJcIikge1xuICAgICAgZXh0cmFjdExpbmVDbGFzc2VzKGNhbGxCbGFua0xpbmUobW9kZSwgc3RhdGUpLCBsaW5lQ2xhc3Nlcyk7XG4gICAgfVxuXG4gICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgIGlmIChzdHJlYW0ucG9zID4gY20ub3B0aW9ucy5tYXhIaWdobGlnaHRMZW5ndGgpIHtcbiAgICAgICAgZmxhdHRlblNwYW5zID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKGZvcmNlVG9FbmQpIHtcbiAgICAgICAgICBwcm9jZXNzTGluZShjbSwgdGV4dCwgc3RhdGUsIHN0cmVhbS5wb3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RyZWFtLnBvcyA9IHRleHQubGVuZ3RoO1xuICAgICAgICBzdHlsZSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHlsZSA9IGV4dHJhY3RMaW5lQ2xhc3NlcyhyZWFkVG9rZW4obW9kZSwgc3RyZWFtLCBzdGF0ZSwgaW5uZXIpLCBsaW5lQ2xhc3Nlcyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbm5lcikge1xuICAgICAgICB2YXIgbU5hbWUgPSBpbm5lclswXS5uYW1lO1xuXG4gICAgICAgIGlmIChtTmFtZSkge1xuICAgICAgICAgIHN0eWxlID0gXCJtLVwiICsgKHN0eWxlID8gbU5hbWUgKyBcIiBcIiArIHN0eWxlIDogbU5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghZmxhdHRlblNwYW5zIHx8IGN1clN0eWxlICE9IHN0eWxlKSB7XG4gICAgICAgIHdoaWxlIChjdXJTdGFydCA8IHN0cmVhbS5zdGFydCkge1xuICAgICAgICAgIGN1clN0YXJ0ID0gTWF0aC5taW4oc3RyZWFtLnN0YXJ0LCBjdXJTdGFydCArIDUwMDApO1xuICAgICAgICAgIGYoY3VyU3RhcnQsIGN1clN0eWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1clN0eWxlID0gc3R5bGU7XG4gICAgICB9XG5cbiAgICAgIHN0cmVhbS5zdGFydCA9IHN0cmVhbS5wb3M7XG4gICAgfVxuXG4gICAgd2hpbGUgKGN1clN0YXJ0IDwgc3RyZWFtLnBvcykge1xuICAgICAgLy8gV2Via2l0IHNlZW1zIHRvIHJlZnVzZSB0byByZW5kZXIgdGV4dCBub2RlcyBsb25nZXIgdGhhbiA1NzQ0NFxuICAgICAgLy8gY2hhcmFjdGVycywgYW5kIHJldHVybnMgaW5hY2N1cmF0ZSBtZWFzdXJlbWVudHMgaW4gbm9kZXNcbiAgICAgIC8vIHN0YXJ0aW5nIGFyb3VuZCA1MDAwIGNoYXJzLlxuICAgICAgdmFyIHBvcyA9IE1hdGgubWluKHN0cmVhbS5wb3MsIGN1clN0YXJ0ICsgNTAwMCk7XG4gICAgICBmKHBvcywgY3VyU3R5bGUpO1xuICAgICAgY3VyU3RhcnQgPSBwb3M7XG4gICAgfVxuICB9IC8vIEZpbmRzIHRoZSBsaW5lIHRvIHN0YXJ0IHdpdGggd2hlbiBzdGFydGluZyBhIHBhcnNlLiBUcmllcyB0b1xuICAvLyBmaW5kIGEgbGluZSB3aXRoIGEgc3RhdGVBZnRlciwgc28gdGhhdCBpdCBjYW4gc3RhcnQgd2l0aCBhXG4gIC8vIHZhbGlkIHN0YXRlLiBJZiB0aGF0IGZhaWxzLCBpdCByZXR1cm5zIHRoZSBsaW5lIHdpdGggdGhlXG4gIC8vIHNtYWxsZXN0IGluZGVudGF0aW9uLCB3aGljaCB0ZW5kcyB0byBuZWVkIHRoZSBsZWFzdCBjb250ZXh0IHRvXG4gIC8vIHBhcnNlIGNvcnJlY3RseS5cblxuXG4gIGZ1bmN0aW9uIGZpbmRTdGFydExpbmUoY20sIG4sIHByZWNpc2UpIHtcbiAgICB2YXIgbWluaW5kZW50LFxuICAgICAgICBtaW5saW5lLFxuICAgICAgICBkb2MgPSBjbS5kb2M7XG4gICAgdmFyIGxpbSA9IHByZWNpc2UgPyAtMSA6IG4gLSAoY20uZG9jLm1vZGUuaW5uZXJNb2RlID8gMTAwMCA6IDEwMCk7XG5cbiAgICBmb3IgKHZhciBzZWFyY2ggPSBuOyBzZWFyY2ggPiBsaW07IC0tc2VhcmNoKSB7XG4gICAgICBpZiAoc2VhcmNoIDw9IGRvYy5maXJzdCkge1xuICAgICAgICByZXR1cm4gZG9jLmZpcnN0O1xuICAgICAgfVxuXG4gICAgICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBzZWFyY2ggLSAxKTtcblxuICAgICAgaWYgKGxpbmUuc3RhdGVBZnRlciAmJiAoIXByZWNpc2UgfHwgc2VhcmNoIDw9IGRvYy5mcm9udGllcikpIHtcbiAgICAgICAgcmV0dXJuIHNlYXJjaDtcbiAgICAgIH1cblxuICAgICAgdmFyIGluZGVudGVkID0gY291bnRDb2x1bW4obGluZS50ZXh0LCBudWxsLCBjbS5vcHRpb25zLnRhYlNpemUpO1xuXG4gICAgICBpZiAobWlubGluZSA9PSBudWxsIHx8IG1pbmluZGVudCA+IGluZGVudGVkKSB7XG4gICAgICAgIG1pbmxpbmUgPSBzZWFyY2ggLSAxO1xuICAgICAgICBtaW5pbmRlbnQgPSBpbmRlbnRlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWlubGluZTtcbiAgfSAvLyBMSU5FIERBVEEgU1RSVUNUVVJFXG4gIC8vIExpbmUgb2JqZWN0cy4gVGhlc2UgaG9sZCBzdGF0ZSByZWxhdGVkIHRvIGEgbGluZSwgaW5jbHVkaW5nXG4gIC8vIGhpZ2hsaWdodGluZyBpbmZvICh0aGUgc3R5bGVzIGFycmF5KS5cblxuXG4gIGZ1bmN0aW9uIExpbmUodGV4dCwgbWFya2VkU3BhbnMsIGVzdGltYXRlSGVpZ2h0KSB7XG4gICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICBhdHRhY2hNYXJrZWRTcGFucyh0aGlzLCBtYXJrZWRTcGFucyk7XG4gICAgdGhpcy5oZWlnaHQgPSBlc3RpbWF0ZUhlaWdodCA/IGVzdGltYXRlSGVpZ2h0KHRoaXMpIDogMTtcbiAgfVxuXG4gIGV2ZW50TWl4aW4oTGluZSk7XG5cbiAgTGluZS5wcm90b3R5cGUubGluZU5vID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBsaW5lTm8odGhpcyk7XG4gIH07IC8vIENoYW5nZSB0aGUgY29udGVudCAodGV4dCwgbWFya2Vycykgb2YgYSBsaW5lLiBBdXRvbWF0aWNhbGx5XG4gIC8vIGludmFsaWRhdGVzIGNhY2hlZCBpbmZvcm1hdGlvbiBhbmQgdHJpZXMgdG8gcmUtZXN0aW1hdGUgdGhlXG4gIC8vIGxpbmUncyBoZWlnaHQuXG5cblxuICBmdW5jdGlvbiB1cGRhdGVMaW5lKGxpbmUsIHRleHQsIG1hcmtlZFNwYW5zLCBlc3RpbWF0ZUhlaWdodCkge1xuICAgIGxpbmUudGV4dCA9IHRleHQ7XG5cbiAgICBpZiAobGluZS5zdGF0ZUFmdGVyKSB7XG4gICAgICBsaW5lLnN0YXRlQWZ0ZXIgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChsaW5lLnN0eWxlcykge1xuICAgICAgbGluZS5zdHlsZXMgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChsaW5lLm9yZGVyICE9IG51bGwpIHtcbiAgICAgIGxpbmUub3JkZXIgPSBudWxsO1xuICAgIH1cblxuICAgIGRldGFjaE1hcmtlZFNwYW5zKGxpbmUpO1xuICAgIGF0dGFjaE1hcmtlZFNwYW5zKGxpbmUsIG1hcmtlZFNwYW5zKTtcbiAgICB2YXIgZXN0SGVpZ2h0ID0gZXN0aW1hdGVIZWlnaHQgPyBlc3RpbWF0ZUhlaWdodChsaW5lKSA6IDE7XG5cbiAgICBpZiAoZXN0SGVpZ2h0ICE9IGxpbmUuaGVpZ2h0KSB7XG4gICAgICB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIGVzdEhlaWdodCk7XG4gICAgfVxuICB9IC8vIERldGFjaCBhIGxpbmUgZnJvbSB0aGUgZG9jdW1lbnQgdHJlZSBhbmQgaXRzIG1hcmtlcnMuXG5cblxuICBmdW5jdGlvbiBjbGVhblVwTGluZShsaW5lKSB7XG4gICAgbGluZS5wYXJlbnQgPSBudWxsO1xuICAgIGRldGFjaE1hcmtlZFNwYW5zKGxpbmUpO1xuICB9IC8vIENvbnZlcnQgYSBzdHlsZSBhcyByZXR1cm5lZCBieSBhIG1vZGUgKGVpdGhlciBudWxsLCBvciBhIHN0cmluZ1xuICAvLyBjb250YWluaW5nIG9uZSBvciBtb3JlIHN0eWxlcykgdG8gYSBDU1Mgc3R5bGUuIFRoaXMgaXMgY2FjaGVkLFxuICAvLyBhbmQgYWxzbyBsb29rcyBmb3IgbGluZS13aWRlIHN0eWxlcy5cblxuXG4gIHZhciBzdHlsZVRvQ2xhc3NDYWNoZSA9IHt9O1xuICB2YXIgc3R5bGVUb0NsYXNzQ2FjaGVXaXRoTW9kZSA9IHt9O1xuXG4gIGZ1bmN0aW9uIGludGVycHJldFRva2VuU3R5bGUoc3R5bGUsIG9wdGlvbnMpIHtcbiAgICBpZiAoIXN0eWxlIHx8IC9eXFxzKiQvLnRlc3Qoc3R5bGUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgY2FjaGUgPSBvcHRpb25zLmFkZE1vZGVDbGFzcyA/IHN0eWxlVG9DbGFzc0NhY2hlV2l0aE1vZGUgOiBzdHlsZVRvQ2xhc3NDYWNoZTtcbiAgICByZXR1cm4gY2FjaGVbc3R5bGVdIHx8IChjYWNoZVtzdHlsZV0gPSBzdHlsZS5yZXBsYWNlKC9cXFMrL2csIFwiY20tJCZcIikpO1xuICB9IC8vIFJlbmRlciB0aGUgRE9NIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0ZXh0IG9mIGEgbGluZS4gQWxzbyBidWlsZHNcbiAgLy8gdXAgYSAnbGluZSBtYXAnLCB3aGljaCBwb2ludHMgYXQgdGhlIERPTSBub2RlcyB0aGF0IHJlcHJlc2VudFxuICAvLyBzcGVjaWZpYyBzdHJldGNoZXMgb2YgdGV4dCwgYW5kIGlzIHVzZWQgYnkgdGhlIG1lYXN1cmluZyBjb2RlLlxuICAvLyBUaGUgcmV0dXJuZWQgb2JqZWN0IGNvbnRhaW5zIHRoZSBET00gbm9kZSwgdGhpcyBtYXAsIGFuZFxuICAvLyBpbmZvcm1hdGlvbiBhYm91dCBsaW5lLXdpZGUgc3R5bGVzIHRoYXQgd2VyZSBzZXQgYnkgdGhlIG1vZGUuXG5cblxuICBmdW5jdGlvbiBidWlsZExpbmVDb250ZW50KGNtLCBsaW5lVmlldykge1xuICAgIC8vIFRoZSBwYWRkaW5nLXJpZ2h0IGZvcmNlcyB0aGUgZWxlbWVudCB0byBoYXZlIGEgJ2JvcmRlcicsIHdoaWNoXG4gICAgLy8gaXMgbmVlZGVkIG9uIFdlYmtpdCB0byBiZSBhYmxlIHRvIGdldCBsaW5lLWxldmVsIGJvdW5kaW5nXG4gICAgLy8gcmVjdGFuZ2xlcyBmb3IgaXQgKGluIG1lYXN1cmVDaGFyKS5cbiAgICB2YXIgY29udGVudCA9IGVsdChcInNwYW5cIiwgbnVsbCwgbnVsbCwgd2Via2l0ID8gXCJwYWRkaW5nLXJpZ2h0OiAuMXB4XCIgOiBudWxsKTtcbiAgICB2YXIgYnVpbGRlciA9IHtcbiAgICAgIHByZTogZWx0KFwicHJlXCIsIFtjb250ZW50XSwgXCJDb2RlTWlycm9yLWxpbmVcIiksXG4gICAgICBjb250ZW50OiBjb250ZW50LFxuICAgICAgY29sOiAwLFxuICAgICAgcG9zOiAwLFxuICAgICAgY206IGNtLFxuICAgICAgdHJhaWxpbmdTcGFjZTogZmFsc2UsXG4gICAgICBzcGxpdFNwYWNlczogKGllIHx8IHdlYmtpdCkgJiYgY20uZ2V0T3B0aW9uKFwibGluZVdyYXBwaW5nXCIpXG4gICAgfTsgLy8gaGlkZSBmcm9tIGFjY2Vzc2liaWxpdHkgdHJlZVxuXG4gICAgY29udGVudC5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwicHJlc2VudGF0aW9uXCIpO1xuICAgIGJ1aWxkZXIucHJlLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJwcmVzZW50YXRpb25cIik7XG4gICAgbGluZVZpZXcubWVhc3VyZSA9IHt9OyAvLyBJdGVyYXRlIG92ZXIgdGhlIGxvZ2ljYWwgbGluZXMgdGhhdCBtYWtlIHVwIHRoaXMgdmlzdWFsIGxpbmUuXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSAobGluZVZpZXcucmVzdCA/IGxpbmVWaWV3LnJlc3QubGVuZ3RoIDogMCk7IGkrKykge1xuICAgICAgdmFyIGxpbmUgPSBpID8gbGluZVZpZXcucmVzdFtpIC0gMV0gOiBsaW5lVmlldy5saW5lLFxuICAgICAgICAgIG9yZGVyID0gdm9pZCAwO1xuICAgICAgYnVpbGRlci5wb3MgPSAwO1xuICAgICAgYnVpbGRlci5hZGRUb2tlbiA9IGJ1aWxkVG9rZW47IC8vIE9wdGlvbmFsbHkgd2lyZSBpbiBzb21lIGhhY2tzIGludG8gdGhlIHRva2VuLXJlbmRlcmluZ1xuICAgICAgLy8gYWxnb3JpdGhtLCB0byBkZWFsIHdpdGggYnJvd3NlciBxdWlya3MuXG5cbiAgICAgIGlmIChoYXNCYWRCaWRpUmVjdHMoY20uZGlzcGxheS5tZWFzdXJlKSAmJiAob3JkZXIgPSBnZXRPcmRlcihsaW5lKSkpIHtcbiAgICAgICAgYnVpbGRlci5hZGRUb2tlbiA9IGJ1aWxkVG9rZW5CYWRCaWRpKGJ1aWxkZXIuYWRkVG9rZW4sIG9yZGVyKTtcbiAgICAgIH1cblxuICAgICAgYnVpbGRlci5tYXAgPSBbXTtcbiAgICAgIHZhciBhbGxvd0Zyb250aWVyVXBkYXRlID0gbGluZVZpZXcgIT0gY20uZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkICYmIGxpbmVObyhsaW5lKTtcbiAgICAgIGluc2VydExpbmVDb250ZW50KGxpbmUsIGJ1aWxkZXIsIGdldExpbmVTdHlsZXMoY20sIGxpbmUsIGFsbG93RnJvbnRpZXJVcGRhdGUpKTtcblxuICAgICAgaWYgKGxpbmUuc3R5bGVDbGFzc2VzKSB7XG4gICAgICAgIGlmIChsaW5lLnN0eWxlQ2xhc3Nlcy5iZ0NsYXNzKSB7XG4gICAgICAgICAgYnVpbGRlci5iZ0NsYXNzID0gam9pbkNsYXNzZXMobGluZS5zdHlsZUNsYXNzZXMuYmdDbGFzcywgYnVpbGRlci5iZ0NsYXNzIHx8IFwiXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpbmUuc3R5bGVDbGFzc2VzLnRleHRDbGFzcykge1xuICAgICAgICAgIGJ1aWxkZXIudGV4dENsYXNzID0gam9pbkNsYXNzZXMobGluZS5zdHlsZUNsYXNzZXMudGV4dENsYXNzLCBidWlsZGVyLnRleHRDbGFzcyB8fCBcIlwiKTtcbiAgICAgICAgfVxuICAgICAgfSAvLyBFbnN1cmUgYXQgbGVhc3QgYSBzaW5nbGUgbm9kZSBpcyBwcmVzZW50LCBmb3IgbWVhc3VyaW5nLlxuXG5cbiAgICAgIGlmIChidWlsZGVyLm1hcC5sZW5ndGggPT0gMCkge1xuICAgICAgICBidWlsZGVyLm1hcC5wdXNoKDAsIDAsIGJ1aWxkZXIuY29udGVudC5hcHBlbmRDaGlsZCh6ZXJvV2lkdGhFbGVtZW50KGNtLmRpc3BsYXkubWVhc3VyZSkpKTtcbiAgICAgIH0gLy8gU3RvcmUgdGhlIG1hcCBhbmQgYSBjYWNoZSBvYmplY3QgZm9yIHRoZSBjdXJyZW50IGxvZ2ljYWwgbGluZVxuXG5cbiAgICAgIGlmIChpID09IDApIHtcbiAgICAgICAgbGluZVZpZXcubWVhc3VyZS5tYXAgPSBidWlsZGVyLm1hcDtcbiAgICAgICAgbGluZVZpZXcubWVhc3VyZS5jYWNoZSA9IHt9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgO1xuICAgICAgICAobGluZVZpZXcubWVhc3VyZS5tYXBzIHx8IChsaW5lVmlldy5tZWFzdXJlLm1hcHMgPSBbXSkpLnB1c2goYnVpbGRlci5tYXApO1xuICAgICAgICAobGluZVZpZXcubWVhc3VyZS5jYWNoZXMgfHwgKGxpbmVWaWV3Lm1lYXN1cmUuY2FjaGVzID0gW10pKS5wdXNoKHt9KTtcbiAgICAgIH1cbiAgICB9IC8vIFNlZSBpc3N1ZSAjMjkwMVxuXG5cbiAgICBpZiAod2Via2l0KSB7XG4gICAgICB2YXIgbGFzdCA9IGJ1aWxkZXIuY29udGVudC5sYXN0Q2hpbGQ7XG5cbiAgICAgIGlmICgvXFxiY20tdGFiXFxiLy50ZXN0KGxhc3QuY2xhc3NOYW1lKSB8fCBsYXN0LnF1ZXJ5U2VsZWN0b3IgJiYgbGFzdC5xdWVyeVNlbGVjdG9yKFwiLmNtLXRhYlwiKSkge1xuICAgICAgICBidWlsZGVyLmNvbnRlbnQuY2xhc3NOYW1lID0gXCJjbS10YWItd3JhcC1oYWNrXCI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2lnbmFsKGNtLCBcInJlbmRlckxpbmVcIiwgY20sIGxpbmVWaWV3LmxpbmUsIGJ1aWxkZXIucHJlKTtcblxuICAgIGlmIChidWlsZGVyLnByZS5jbGFzc05hbWUpIHtcbiAgICAgIGJ1aWxkZXIudGV4dENsYXNzID0gam9pbkNsYXNzZXMoYnVpbGRlci5wcmUuY2xhc3NOYW1lLCBidWlsZGVyLnRleHRDbGFzcyB8fCBcIlwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbGRlcjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlZmF1bHRTcGVjaWFsQ2hhclBsYWNlaG9sZGVyKGNoKSB7XG4gICAgdmFyIHRva2VuID0gZWx0KFwic3BhblwiLCBcIlxcdTIwMjJcIiwgXCJjbS1pbnZhbGlkY2hhclwiKTtcbiAgICB0b2tlbi50aXRsZSA9IFwiXFxcXHVcIiArIGNoLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpO1xuICAgIHRva2VuLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgdG9rZW4udGl0bGUpO1xuICAgIHJldHVybiB0b2tlbjtcbiAgfSAvLyBCdWlsZCB1cCB0aGUgRE9NIHJlcHJlc2VudGF0aW9uIGZvciBhIHNpbmdsZSB0b2tlbiwgYW5kIGFkZCBpdCB0b1xuICAvLyB0aGUgbGluZSBtYXAuIFRha2VzIGNhcmUgdG8gcmVuZGVyIHNwZWNpYWwgY2hhcmFjdGVycyBzZXBhcmF0ZWx5LlxuXG5cbiAgZnVuY3Rpb24gYnVpbGRUb2tlbihidWlsZGVyLCB0ZXh0LCBzdHlsZSwgc3RhcnRTdHlsZSwgZW5kU3R5bGUsIHRpdGxlLCBjc3MpIHtcbiAgICBpZiAoIXRleHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZGlzcGxheVRleHQgPSBidWlsZGVyLnNwbGl0U3BhY2VzID8gc3BsaXRTcGFjZXModGV4dCwgYnVpbGRlci50cmFpbGluZ1NwYWNlKSA6IHRleHQ7XG4gICAgdmFyIHNwZWNpYWwgPSBidWlsZGVyLmNtLnN0YXRlLnNwZWNpYWxDaGFycyxcbiAgICAgICAgbXVzdFdyYXAgPSBmYWxzZTtcbiAgICB2YXIgY29udGVudDtcblxuICAgIGlmICghc3BlY2lhbC50ZXN0KHRleHQpKSB7XG4gICAgICBidWlsZGVyLmNvbCArPSB0ZXh0Lmxlbmd0aDtcbiAgICAgIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkaXNwbGF5VGV4dCk7XG4gICAgICBidWlsZGVyLm1hcC5wdXNoKGJ1aWxkZXIucG9zLCBidWlsZGVyLnBvcyArIHRleHQubGVuZ3RoLCBjb250ZW50KTtcblxuICAgICAgaWYgKGllICYmIGllX3ZlcnNpb24gPCA5KSB7XG4gICAgICAgIG11c3RXcmFwID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgYnVpbGRlci5wb3MgKz0gdGV4dC5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICB2YXIgcG9zID0gMDtcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgc3BlY2lhbC5sYXN0SW5kZXggPSBwb3M7XG4gICAgICAgIHZhciBtID0gc3BlY2lhbC5leGVjKHRleHQpO1xuICAgICAgICB2YXIgc2tpcHBlZCA9IG0gPyBtLmluZGV4IC0gcG9zIDogdGV4dC5sZW5ndGggLSBwb3M7XG5cbiAgICAgICAgaWYgKHNraXBwZWQpIHtcbiAgICAgICAgICB2YXIgdHh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGlzcGxheVRleHQuc2xpY2UocG9zLCBwb3MgKyBza2lwcGVkKSk7XG5cbiAgICAgICAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA8IDkpIHtcbiAgICAgICAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoZWx0KFwic3BhblwiLCBbdHh0XSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50LmFwcGVuZENoaWxkKHR4dCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnVpbGRlci5tYXAucHVzaChidWlsZGVyLnBvcywgYnVpbGRlci5wb3MgKyBza2lwcGVkLCB0eHQpO1xuICAgICAgICAgIGJ1aWxkZXIuY29sICs9IHNraXBwZWQ7XG4gICAgICAgICAgYnVpbGRlci5wb3MgKz0gc2tpcHBlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcG9zICs9IHNraXBwZWQgKyAxO1xuICAgICAgICB2YXIgdHh0JDEgPSB2b2lkIDA7XG5cbiAgICAgICAgaWYgKG1bMF0gPT0gXCJcXHRcIikge1xuICAgICAgICAgIHZhciB0YWJTaXplID0gYnVpbGRlci5jbS5vcHRpb25zLnRhYlNpemUsXG4gICAgICAgICAgICAgIHRhYldpZHRoID0gdGFiU2l6ZSAtIGJ1aWxkZXIuY29sICUgdGFiU2l6ZTtcbiAgICAgICAgICB0eHQkMSA9IGNvbnRlbnQuYXBwZW5kQ2hpbGQoZWx0KFwic3BhblwiLCBzcGFjZVN0cih0YWJXaWR0aCksIFwiY20tdGFiXCIpKTtcbiAgICAgICAgICB0eHQkMS5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwicHJlc2VudGF0aW9uXCIpO1xuICAgICAgICAgIHR4dCQxLnNldEF0dHJpYnV0ZShcImNtLXRleHRcIiwgXCJcXHRcIik7XG4gICAgICAgICAgYnVpbGRlci5jb2wgKz0gdGFiV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAobVswXSA9PSBcIlxcclwiIHx8IG1bMF0gPT0gXCJcXG5cIikge1xuICAgICAgICAgIHR4dCQxID0gY29udGVudC5hcHBlbmRDaGlsZChlbHQoXCJzcGFuXCIsIG1bMF0gPT0gXCJcXHJcIiA/IFwiXFx1MjQwRFwiIDogXCJcXHUyNDI0XCIsIFwiY20taW52YWxpZGNoYXJcIikpO1xuICAgICAgICAgIHR4dCQxLnNldEF0dHJpYnV0ZShcImNtLXRleHRcIiwgbVswXSk7XG4gICAgICAgICAgYnVpbGRlci5jb2wgKz0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0eHQkMSA9IGJ1aWxkZXIuY20ub3B0aW9ucy5zcGVjaWFsQ2hhclBsYWNlaG9sZGVyKG1bMF0pO1xuICAgICAgICAgIHR4dCQxLnNldEF0dHJpYnV0ZShcImNtLXRleHRcIiwgbVswXSk7XG5cbiAgICAgICAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA8IDkpIHtcbiAgICAgICAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoZWx0KFwic3BhblwiLCBbdHh0JDFdKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQodHh0JDEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJ1aWxkZXIuY29sICs9IDE7XG4gICAgICAgIH1cblxuICAgICAgICBidWlsZGVyLm1hcC5wdXNoKGJ1aWxkZXIucG9zLCBidWlsZGVyLnBvcyArIDEsIHR4dCQxKTtcbiAgICAgICAgYnVpbGRlci5wb3MrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBidWlsZGVyLnRyYWlsaW5nU3BhY2UgPSBkaXNwbGF5VGV4dC5jaGFyQ29kZUF0KHRleHQubGVuZ3RoIC0gMSkgPT0gMzI7XG5cbiAgICBpZiAoc3R5bGUgfHwgc3RhcnRTdHlsZSB8fCBlbmRTdHlsZSB8fCBtdXN0V3JhcCB8fCBjc3MpIHtcbiAgICAgIHZhciBmdWxsU3R5bGUgPSBzdHlsZSB8fCBcIlwiO1xuXG4gICAgICBpZiAoc3RhcnRTdHlsZSkge1xuICAgICAgICBmdWxsU3R5bGUgKz0gc3RhcnRTdHlsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVuZFN0eWxlKSB7XG4gICAgICAgIGZ1bGxTdHlsZSArPSBlbmRTdHlsZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRva2VuID0gZWx0KFwic3BhblwiLCBbY29udGVudF0sIGZ1bGxTdHlsZSwgY3NzKTtcblxuICAgICAgaWYgKHRpdGxlKSB7XG4gICAgICAgIHRva2VuLnRpdGxlID0gdGl0bGU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBidWlsZGVyLmNvbnRlbnQuYXBwZW5kQ2hpbGQodG9rZW4pO1xuICAgIH1cblxuICAgIGJ1aWxkZXIuY29udGVudC5hcHBlbmRDaGlsZChjb250ZW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNwbGl0U3BhY2VzKHRleHQsIHRyYWlsaW5nQmVmb3JlKSB7XG4gICAgaWYgKHRleHQubGVuZ3RoID4gMSAmJiAhLyAgLy50ZXN0KHRleHQpKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICB2YXIgc3BhY2VCZWZvcmUgPSB0cmFpbGluZ0JlZm9yZSxcbiAgICAgICAgcmVzdWx0ID0gXCJcIjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGNoID0gdGV4dC5jaGFyQXQoaSk7XG5cbiAgICAgIGlmIChjaCA9PSBcIiBcIiAmJiBzcGFjZUJlZm9yZSAmJiAoaSA9PSB0ZXh0Lmxlbmd0aCAtIDEgfHwgdGV4dC5jaGFyQ29kZUF0KGkgKyAxKSA9PSAzMikpIHtcbiAgICAgICAgY2ggPSBcIlxceEEwXCI7XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdCArPSBjaDtcbiAgICAgIHNwYWNlQmVmb3JlID0gY2ggPT0gXCIgXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSAvLyBXb3JrIGFyb3VuZCBub25zZW5zZSBkaW1lbnNpb25zIGJlaW5nIHJlcG9ydGVkIGZvciBzdHJldGNoZXMgb2ZcbiAgLy8gcmlnaHQtdG8tbGVmdCB0ZXh0LlxuXG5cbiAgZnVuY3Rpb24gYnVpbGRUb2tlbkJhZEJpZGkoaW5uZXIsIG9yZGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChidWlsZGVyLCB0ZXh0LCBzdHlsZSwgc3RhcnRTdHlsZSwgZW5kU3R5bGUsIHRpdGxlLCBjc3MpIHtcbiAgICAgIHN0eWxlID0gc3R5bGUgPyBzdHlsZSArIFwiIGNtLWZvcmNlLWJvcmRlclwiIDogXCJjbS1mb3JjZS1ib3JkZXJcIjtcbiAgICAgIHZhciBzdGFydCA9IGJ1aWxkZXIucG9zLFxuICAgICAgICAgIGVuZCA9IHN0YXJ0ICsgdGV4dC5sZW5ndGg7XG5cbiAgICAgIGZvciAoOzspIHtcbiAgICAgICAgLy8gRmluZCB0aGUgcGFydCB0aGF0IG92ZXJsYXBzIHdpdGggdGhlIHN0YXJ0IG9mIHRoaXMgdGV4dFxuICAgICAgICB2YXIgcGFydCA9IHZvaWQgMDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9yZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgcGFydCA9IG9yZGVyW2ldO1xuXG4gICAgICAgICAgaWYgKHBhcnQudG8gPiBzdGFydCAmJiBwYXJ0LmZyb20gPD0gc3RhcnQpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJ0LnRvID49IGVuZCkge1xuICAgICAgICAgIHJldHVybiBpbm5lcihidWlsZGVyLCB0ZXh0LCBzdHlsZSwgc3RhcnRTdHlsZSwgZW5kU3R5bGUsIHRpdGxlLCBjc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5uZXIoYnVpbGRlciwgdGV4dC5zbGljZSgwLCBwYXJ0LnRvIC0gc3RhcnQpLCBzdHlsZSwgc3RhcnRTdHlsZSwgbnVsbCwgdGl0bGUsIGNzcyk7XG4gICAgICAgIHN0YXJ0U3R5bGUgPSBudWxsO1xuICAgICAgICB0ZXh0ID0gdGV4dC5zbGljZShwYXJ0LnRvIC0gc3RhcnQpO1xuICAgICAgICBzdGFydCA9IHBhcnQudG87XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ1aWxkQ29sbGFwc2VkU3BhbihidWlsZGVyLCBzaXplLCBtYXJrZXIsIGlnbm9yZVdpZGdldCkge1xuICAgIHZhciB3aWRnZXQgPSAhaWdub3JlV2lkZ2V0ICYmIG1hcmtlci53aWRnZXROb2RlO1xuXG4gICAgaWYgKHdpZGdldCkge1xuICAgICAgYnVpbGRlci5tYXAucHVzaChidWlsZGVyLnBvcywgYnVpbGRlci5wb3MgKyBzaXplLCB3aWRnZXQpO1xuICAgIH1cblxuICAgIGlmICghaWdub3JlV2lkZ2V0ICYmIGJ1aWxkZXIuY20uZGlzcGxheS5pbnB1dC5uZWVkc0NvbnRlbnRBdHRyaWJ1dGUpIHtcbiAgICAgIGlmICghd2lkZ2V0KSB7XG4gICAgICAgIHdpZGdldCA9IGJ1aWxkZXIuY29udGVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKSk7XG4gICAgICB9XG5cbiAgICAgIHdpZGdldC5zZXRBdHRyaWJ1dGUoXCJjbS1tYXJrZXJcIiwgbWFya2VyLmlkKTtcbiAgICB9XG5cbiAgICBpZiAod2lkZ2V0KSB7XG4gICAgICBidWlsZGVyLmNtLmRpc3BsYXkuaW5wdXQuc2V0VW5lZGl0YWJsZSh3aWRnZXQpO1xuICAgICAgYnVpbGRlci5jb250ZW50LmFwcGVuZENoaWxkKHdpZGdldCk7XG4gICAgfVxuXG4gICAgYnVpbGRlci5wb3MgKz0gc2l6ZTtcbiAgICBidWlsZGVyLnRyYWlsaW5nU3BhY2UgPSBmYWxzZTtcbiAgfSAvLyBPdXRwdXRzIGEgbnVtYmVyIG9mIHNwYW5zIHRvIG1ha2UgdXAgYSBsaW5lLCB0YWtpbmcgaGlnaGxpZ2h0aW5nXG4gIC8vIGFuZCBtYXJrZWQgdGV4dCBpbnRvIGFjY291bnQuXG5cblxuICBmdW5jdGlvbiBpbnNlcnRMaW5lQ29udGVudChsaW5lLCBidWlsZGVyLCBzdHlsZXMpIHtcbiAgICB2YXIgc3BhbnMgPSBsaW5lLm1hcmtlZFNwYW5zLFxuICAgICAgICBhbGxUZXh0ID0gbGluZS50ZXh0LFxuICAgICAgICBhdCA9IDA7XG5cbiAgICBpZiAoIXNwYW5zKSB7XG4gICAgICBmb3IgKHZhciBpJDEgPSAxOyBpJDEgPCBzdHlsZXMubGVuZ3RoOyBpJDEgKz0gMikge1xuICAgICAgICBidWlsZGVyLmFkZFRva2VuKGJ1aWxkZXIsIGFsbFRleHQuc2xpY2UoYXQsIGF0ID0gc3R5bGVzW2kkMV0pLCBpbnRlcnByZXRUb2tlblN0eWxlKHN0eWxlc1tpJDEgKyAxXSwgYnVpbGRlci5jbS5vcHRpb25zKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbGVuID0gYWxsVGV4dC5sZW5ndGgsXG4gICAgICAgIHBvcyA9IDAsXG4gICAgICAgIGkgPSAxLFxuICAgICAgICB0ZXh0ID0gXCJcIixcbiAgICAgICAgc3R5bGUsXG4gICAgICAgIGNzcztcbiAgICB2YXIgbmV4dENoYW5nZSA9IDAsXG4gICAgICAgIHNwYW5TdHlsZSxcbiAgICAgICAgc3BhbkVuZFN0eWxlLFxuICAgICAgICBzcGFuU3RhcnRTdHlsZSxcbiAgICAgICAgdGl0bGUsXG4gICAgICAgIGNvbGxhcHNlZDtcblxuICAgIGZvciAoOzspIHtcbiAgICAgIGlmIChuZXh0Q2hhbmdlID09IHBvcykge1xuICAgICAgICAvLyBVcGRhdGUgY3VycmVudCBtYXJrZXIgc2V0XG4gICAgICAgIHNwYW5TdHlsZSA9IHNwYW5FbmRTdHlsZSA9IHNwYW5TdGFydFN0eWxlID0gdGl0bGUgPSBjc3MgPSBcIlwiO1xuICAgICAgICBjb2xsYXBzZWQgPSBudWxsO1xuICAgICAgICBuZXh0Q2hhbmdlID0gSW5maW5pdHk7XG4gICAgICAgIHZhciBmb3VuZEJvb2ttYXJrcyA9IFtdLFxuICAgICAgICAgICAgZW5kU3R5bGVzID0gdm9pZCAwO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3BhbnMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICB2YXIgc3AgPSBzcGFuc1tqXSxcbiAgICAgICAgICAgICAgbSA9IHNwLm1hcmtlcjtcblxuICAgICAgICAgIGlmIChtLnR5cGUgPT0gXCJib29rbWFya1wiICYmIHNwLmZyb20gPT0gcG9zICYmIG0ud2lkZ2V0Tm9kZSkge1xuICAgICAgICAgICAgZm91bmRCb29rbWFya3MucHVzaChtKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNwLmZyb20gPD0gcG9zICYmIChzcC50byA9PSBudWxsIHx8IHNwLnRvID4gcG9zIHx8IG0uY29sbGFwc2VkICYmIHNwLnRvID09IHBvcyAmJiBzcC5mcm9tID09IHBvcykpIHtcbiAgICAgICAgICAgIGlmIChzcC50byAhPSBudWxsICYmIHNwLnRvICE9IHBvcyAmJiBuZXh0Q2hhbmdlID4gc3AudG8pIHtcbiAgICAgICAgICAgICAgbmV4dENoYW5nZSA9IHNwLnRvO1xuICAgICAgICAgICAgICBzcGFuRW5kU3R5bGUgPSBcIlwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobS5jbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgc3BhblN0eWxlICs9IFwiIFwiICsgbS5jbGFzc05hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtLmNzcykge1xuICAgICAgICAgICAgICBjc3MgPSAoY3NzID8gY3NzICsgXCI7XCIgOiBcIlwiKSArIG0uY3NzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobS5zdGFydFN0eWxlICYmIHNwLmZyb20gPT0gcG9zKSB7XG4gICAgICAgICAgICAgIHNwYW5TdGFydFN0eWxlICs9IFwiIFwiICsgbS5zdGFydFN0eWxlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobS5lbmRTdHlsZSAmJiBzcC50byA9PSBuZXh0Q2hhbmdlKSB7XG4gICAgICAgICAgICAgIChlbmRTdHlsZXMgfHwgKGVuZFN0eWxlcyA9IFtdKSkucHVzaChtLmVuZFN0eWxlLCBzcC50byk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtLnRpdGxlICYmICF0aXRsZSkge1xuICAgICAgICAgICAgICB0aXRsZSA9IG0udGl0bGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtLmNvbGxhcHNlZCAmJiAoIWNvbGxhcHNlZCB8fCBjb21wYXJlQ29sbGFwc2VkTWFya2Vycyhjb2xsYXBzZWQubWFya2VyLCBtKSA8IDApKSB7XG4gICAgICAgICAgICAgIGNvbGxhcHNlZCA9IHNwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoc3AuZnJvbSA+IHBvcyAmJiBuZXh0Q2hhbmdlID4gc3AuZnJvbSkge1xuICAgICAgICAgICAgbmV4dENoYW5nZSA9IHNwLmZyb207XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuZFN0eWxlcykge1xuICAgICAgICAgIGZvciAodmFyIGokMSA9IDA7IGokMSA8IGVuZFN0eWxlcy5sZW5ndGg7IGokMSArPSAyKSB7XG4gICAgICAgICAgICBpZiAoZW5kU3R5bGVzW2okMSArIDFdID09IG5leHRDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgc3BhbkVuZFN0eWxlICs9IFwiIFwiICsgZW5kU3R5bGVzW2okMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjb2xsYXBzZWQgfHwgY29sbGFwc2VkLmZyb20gPT0gcG9zKSB7XG4gICAgICAgICAgZm9yICh2YXIgaiQyID0gMDsgaiQyIDwgZm91bmRCb29rbWFya3MubGVuZ3RoOyArK2okMikge1xuICAgICAgICAgICAgYnVpbGRDb2xsYXBzZWRTcGFuKGJ1aWxkZXIsIDAsIGZvdW5kQm9va21hcmtzW2okMl0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb2xsYXBzZWQgJiYgKGNvbGxhcHNlZC5mcm9tIHx8IDApID09IHBvcykge1xuICAgICAgICAgIGJ1aWxkQ29sbGFwc2VkU3BhbihidWlsZGVyLCAoY29sbGFwc2VkLnRvID09IG51bGwgPyBsZW4gKyAxIDogY29sbGFwc2VkLnRvKSAtIHBvcywgY29sbGFwc2VkLm1hcmtlciwgY29sbGFwc2VkLmZyb20gPT0gbnVsbCk7XG5cbiAgICAgICAgICBpZiAoY29sbGFwc2VkLnRvID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY29sbGFwc2VkLnRvID09IHBvcykge1xuICAgICAgICAgICAgY29sbGFwc2VkID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3MgPj0gbGVuKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB2YXIgdXB0byA9IE1hdGgubWluKGxlbiwgbmV4dENoYW5nZSk7XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgdmFyIGVuZCA9IHBvcyArIHRleHQubGVuZ3RoO1xuXG4gICAgICAgICAgaWYgKCFjb2xsYXBzZWQpIHtcbiAgICAgICAgICAgIHZhciB0b2tlblRleHQgPSBlbmQgPiB1cHRvID8gdGV4dC5zbGljZSgwLCB1cHRvIC0gcG9zKSA6IHRleHQ7XG4gICAgICAgICAgICBidWlsZGVyLmFkZFRva2VuKGJ1aWxkZXIsIHRva2VuVGV4dCwgc3R5bGUgPyBzdHlsZSArIHNwYW5TdHlsZSA6IHNwYW5TdHlsZSwgc3BhblN0YXJ0U3R5bGUsIHBvcyArIHRva2VuVGV4dC5sZW5ndGggPT0gbmV4dENoYW5nZSA/IHNwYW5FbmRTdHlsZSA6IFwiXCIsIHRpdGxlLCBjc3MpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChlbmQgPj0gdXB0bykge1xuICAgICAgICAgICAgdGV4dCA9IHRleHQuc2xpY2UodXB0byAtIHBvcyk7XG4gICAgICAgICAgICBwb3MgPSB1cHRvO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcG9zID0gZW5kO1xuICAgICAgICAgIHNwYW5TdGFydFN0eWxlID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRleHQgPSBhbGxUZXh0LnNsaWNlKGF0LCBhdCA9IHN0eWxlc1tpKytdKTtcbiAgICAgICAgc3R5bGUgPSBpbnRlcnByZXRUb2tlblN0eWxlKHN0eWxlc1tpKytdLCBidWlsZGVyLmNtLm9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfSAvLyBUaGVzZSBvYmplY3RzIGFyZSB1c2VkIHRvIHJlcHJlc2VudCB0aGUgdmlzaWJsZSAoY3VycmVudGx5IGRyYXduKVxuICAvLyBwYXJ0IG9mIHRoZSBkb2N1bWVudC4gQSBMaW5lVmlldyBtYXkgY29ycmVzcG9uZCB0byBtdWx0aXBsZVxuICAvLyBsb2dpY2FsIGxpbmVzLCBpZiB0aG9zZSBhcmUgY29ubmVjdGVkIGJ5IGNvbGxhcHNlZCByYW5nZXMuXG5cblxuICBmdW5jdGlvbiBMaW5lVmlldyhkb2MsIGxpbmUsIGxpbmVOKSB7XG4gICAgLy8gVGhlIHN0YXJ0aW5nIGxpbmVcbiAgICB0aGlzLmxpbmUgPSBsaW5lOyAvLyBDb250aW51aW5nIGxpbmVzLCBpZiBhbnlcblxuICAgIHRoaXMucmVzdCA9IHZpc3VhbExpbmVDb250aW51ZWQobGluZSk7IC8vIE51bWJlciBvZiBsb2dpY2FsIGxpbmVzIGluIHRoaXMgdmlzdWFsIGxpbmVcblxuICAgIHRoaXMuc2l6ZSA9IHRoaXMucmVzdCA/IGxpbmVObyhsc3QodGhpcy5yZXN0KSkgLSBsaW5lTiArIDEgOiAxO1xuICAgIHRoaXMubm9kZSA9IHRoaXMudGV4dCA9IG51bGw7XG4gICAgdGhpcy5oaWRkZW4gPSBsaW5lSXNIaWRkZW4oZG9jLCBsaW5lKTtcbiAgfSAvLyBDcmVhdGUgYSByYW5nZSBvZiBMaW5lVmlldyBvYmplY3RzIGZvciB0aGUgZ2l2ZW4gbGluZXMuXG5cblxuICBmdW5jdGlvbiBidWlsZFZpZXdBcnJheShjbSwgZnJvbSwgdG8pIHtcbiAgICB2YXIgYXJyYXkgPSBbXSxcbiAgICAgICAgbmV4dFBvcztcblxuICAgIGZvciAodmFyIHBvcyA9IGZyb207IHBvcyA8IHRvOyBwb3MgPSBuZXh0UG9zKSB7XG4gICAgICB2YXIgdmlldyA9IG5ldyBMaW5lVmlldyhjbS5kb2MsIGdldExpbmUoY20uZG9jLCBwb3MpLCBwb3MpO1xuICAgICAgbmV4dFBvcyA9IHBvcyArIHZpZXcuc2l6ZTtcbiAgICAgIGFycmF5LnB1c2godmlldyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG5cbiAgdmFyIG9wZXJhdGlvbkdyb3VwID0gbnVsbDtcblxuICBmdW5jdGlvbiBwdXNoT3BlcmF0aW9uKG9wKSB7XG4gICAgaWYgKG9wZXJhdGlvbkdyb3VwKSB7XG4gICAgICBvcGVyYXRpb25Hcm91cC5vcHMucHVzaChvcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wLm93bnNHcm91cCA9IG9wZXJhdGlvbkdyb3VwID0ge1xuICAgICAgICBvcHM6IFtvcF0sXG4gICAgICAgIGRlbGF5ZWRDYWxsYmFja3M6IFtdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZpcmVDYWxsYmFja3NGb3JPcHMoZ3JvdXApIHtcbiAgICAvLyBDYWxscyBkZWxheWVkIGNhbGxiYWNrcyBhbmQgY3Vyc29yQWN0aXZpdHkgaGFuZGxlcnMgdW50aWwgbm9cbiAgICAvLyBuZXcgb25lcyBhcHBlYXJcbiAgICB2YXIgY2FsbGJhY2tzID0gZ3JvdXAuZGVsYXllZENhbGxiYWNrcyxcbiAgICAgICAgaSA9IDA7XG5cbiAgICBkbyB7XG4gICAgICBmb3IgKDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjYWxsYmFja3NbaV0uY2FsbChudWxsKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBncm91cC5vcHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIG9wID0gZ3JvdXAub3BzW2pdO1xuXG4gICAgICAgIGlmIChvcC5jdXJzb3JBY3Rpdml0eUhhbmRsZXJzKSB7XG4gICAgICAgICAgd2hpbGUgKG9wLmN1cnNvckFjdGl2aXR5Q2FsbGVkIDwgb3AuY3Vyc29yQWN0aXZpdHlIYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG9wLmN1cnNvckFjdGl2aXR5SGFuZGxlcnNbb3AuY3Vyc29yQWN0aXZpdHlDYWxsZWQrK10uY2FsbChudWxsLCBvcC5jbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSB3aGlsZSAoaSA8IGNhbGxiYWNrcy5sZW5ndGgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmluaXNoT3BlcmF0aW9uKG9wLCBlbmRDYikge1xuICAgIHZhciBncm91cCA9IG9wLm93bnNHcm91cDtcblxuICAgIGlmICghZ3JvdXApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgZmlyZUNhbGxiYWNrc0Zvck9wcyhncm91cCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIG9wZXJhdGlvbkdyb3VwID0gbnVsbDtcbiAgICAgIGVuZENiKGdyb3VwKTtcbiAgICB9XG4gIH1cblxuICB2YXIgb3JwaGFuRGVsYXllZENhbGxiYWNrcyA9IG51bGw7IC8vIE9mdGVuLCB3ZSB3YW50IHRvIHNpZ25hbCBldmVudHMgYXQgYSBwb2ludCB3aGVyZSB3ZSBhcmUgaW4gdGhlXG4gIC8vIG1pZGRsZSBvZiBzb21lIHdvcmssIGJ1dCBkb24ndCB3YW50IHRoZSBoYW5kbGVyIHRvIHN0YXJ0IGNhbGxpbmdcbiAgLy8gb3RoZXIgbWV0aG9kcyBvbiB0aGUgZWRpdG9yLCB3aGljaCBtaWdodCBiZSBpbiBhbiBpbmNvbnNpc3RlbnRcbiAgLy8gc3RhdGUgb3Igc2ltcGx5IG5vdCBleHBlY3QgYW55IG90aGVyIGV2ZW50cyB0byBoYXBwZW4uXG4gIC8vIHNpZ25hbExhdGVyIGxvb2tzIHdoZXRoZXIgdGhlcmUgYXJlIGFueSBoYW5kbGVycywgYW5kIHNjaGVkdWxlc1xuICAvLyB0aGVtIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGxhc3Qgb3BlcmF0aW9uIGVuZHMsIG9yLCBpZiBub1xuICAvLyBvcGVyYXRpb24gaXMgYWN0aXZlLCB3aGVuIGEgdGltZW91dCBmaXJlcy5cblxuICBmdW5jdGlvbiBzaWduYWxMYXRlcihlbWl0dGVyLCB0eXBlXG4gIC8qLCB2YWx1ZXMuLi4qL1xuICApIHtcbiAgICB2YXIgYXJyID0gZ2V0SGFuZGxlcnMoZW1pdHRlciwgdHlwZSk7XG5cbiAgICBpZiAoIWFyci5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMiksXG4gICAgICAgIGxpc3Q7XG5cbiAgICBpZiAob3BlcmF0aW9uR3JvdXApIHtcbiAgICAgIGxpc3QgPSBvcGVyYXRpb25Hcm91cC5kZWxheWVkQ2FsbGJhY2tzO1xuICAgIH0gZWxzZSBpZiAob3JwaGFuRGVsYXllZENhbGxiYWNrcykge1xuICAgICAgbGlzdCA9IG9ycGhhbkRlbGF5ZWRDYWxsYmFja3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3QgPSBvcnBoYW5EZWxheWVkQ2FsbGJhY2tzID0gW107XG4gICAgICBzZXRUaW1lb3V0KGZpcmVPcnBoYW5EZWxheWVkLCAwKTtcbiAgICB9XG5cbiAgICB2YXIgbG9vcCA9IGZ1bmN0aW9uIGxvb3AoaSkge1xuICAgICAgbGlzdC5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGFycltpXS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgICAgbG9vcChpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBmaXJlT3JwaGFuRGVsYXllZCgpIHtcbiAgICB2YXIgZGVsYXllZCA9IG9ycGhhbkRlbGF5ZWRDYWxsYmFja3M7XG4gICAgb3JwaGFuRGVsYXllZENhbGxiYWNrcyA9IG51bGw7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRlbGF5ZWQubGVuZ3RoOyArK2kpIHtcbiAgICAgIGRlbGF5ZWRbaV0oKTtcbiAgICB9XG4gIH0gLy8gV2hlbiBhbiBhc3BlY3Qgb2YgYSBsaW5lIGNoYW5nZXMsIGEgc3RyaW5nIGlzIGFkZGVkIHRvXG4gIC8vIGxpbmVWaWV3LmNoYW5nZXMuIFRoaXMgdXBkYXRlcyB0aGUgcmVsZXZhbnQgcGFydCBvZiB0aGUgbGluZSdzXG4gIC8vIERPTSBzdHJ1Y3R1cmUuXG5cblxuICBmdW5jdGlvbiB1cGRhdGVMaW5lRm9yQ2hhbmdlcyhjbSwgbGluZVZpZXcsIGxpbmVOLCBkaW1zKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBsaW5lVmlldy5jaGFuZ2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICB2YXIgdHlwZSA9IGxpbmVWaWV3LmNoYW5nZXNbal07XG5cbiAgICAgIGlmICh0eXBlID09IFwidGV4dFwiKSB7XG4gICAgICAgIHVwZGF0ZUxpbmVUZXh0KGNtLCBsaW5lVmlldyk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJndXR0ZXJcIikge1xuICAgICAgICB1cGRhdGVMaW5lR3V0dGVyKGNtLCBsaW5lVmlldywgbGluZU4sIGRpbXMpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiY2xhc3NcIikge1xuICAgICAgICB1cGRhdGVMaW5lQ2xhc3NlcyhsaW5lVmlldyk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJ3aWRnZXRcIikge1xuICAgICAgICB1cGRhdGVMaW5lV2lkZ2V0cyhjbSwgbGluZVZpZXcsIGRpbXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxpbmVWaWV3LmNoYW5nZXMgPSBudWxsO1xuICB9IC8vIExpbmVzIHdpdGggZ3V0dGVyIGVsZW1lbnRzLCB3aWRnZXRzIG9yIGEgYmFja2dyb3VuZCBjbGFzcyBuZWVkIHRvXG4gIC8vIGJlIHdyYXBwZWQsIGFuZCBoYXZlIHRoZSBleHRyYSBlbGVtZW50cyBhZGRlZCB0byB0aGUgd3JhcHBlciBkaXZcblxuXG4gIGZ1bmN0aW9uIGVuc3VyZUxpbmVXcmFwcGVkKGxpbmVWaWV3KSB7XG4gICAgaWYgKGxpbmVWaWV3Lm5vZGUgPT0gbGluZVZpZXcudGV4dCkge1xuICAgICAgbGluZVZpZXcubm9kZSA9IGVsdChcImRpdlwiLCBudWxsLCBudWxsLCBcInBvc2l0aW9uOiByZWxhdGl2ZVwiKTtcblxuICAgICAgaWYgKGxpbmVWaWV3LnRleHQucGFyZW50Tm9kZSkge1xuICAgICAgICBsaW5lVmlldy50ZXh0LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGxpbmVWaWV3Lm5vZGUsIGxpbmVWaWV3LnRleHQpO1xuICAgICAgfVxuXG4gICAgICBsaW5lVmlldy5ub2RlLmFwcGVuZENoaWxkKGxpbmVWaWV3LnRleHQpO1xuXG4gICAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA8IDgpIHtcbiAgICAgICAgbGluZVZpZXcubm9kZS5zdHlsZS56SW5kZXggPSAyO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaW5lVmlldy5ub2RlO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlTGluZUJhY2tncm91bmQobGluZVZpZXcpIHtcbiAgICB2YXIgY2xzID0gbGluZVZpZXcuYmdDbGFzcyA/IGxpbmVWaWV3LmJnQ2xhc3MgKyBcIiBcIiArIChsaW5lVmlldy5saW5lLmJnQ2xhc3MgfHwgXCJcIikgOiBsaW5lVmlldy5saW5lLmJnQ2xhc3M7XG5cbiAgICBpZiAoY2xzKSB7XG4gICAgICBjbHMgKz0gXCIgQ29kZU1pcnJvci1saW5lYmFja2dyb3VuZFwiO1xuICAgIH1cblxuICAgIGlmIChsaW5lVmlldy5iYWNrZ3JvdW5kKSB7XG4gICAgICBpZiAoY2xzKSB7XG4gICAgICAgIGxpbmVWaWV3LmJhY2tncm91bmQuY2xhc3NOYW1lID0gY2xzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGluZVZpZXcuYmFja2dyb3VuZC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGxpbmVWaWV3LmJhY2tncm91bmQpO1xuICAgICAgICBsaW5lVmlldy5iYWNrZ3JvdW5kID0gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNscykge1xuICAgICAgdmFyIHdyYXAgPSBlbnN1cmVMaW5lV3JhcHBlZChsaW5lVmlldyk7XG4gICAgICBsaW5lVmlldy5iYWNrZ3JvdW5kID0gd3JhcC5pbnNlcnRCZWZvcmUoZWx0KFwiZGl2XCIsIG51bGwsIGNscyksIHdyYXAuZmlyc3RDaGlsZCk7XG4gICAgfVxuICB9IC8vIFdyYXBwZXIgYXJvdW5kIGJ1aWxkTGluZUNvbnRlbnQgd2hpY2ggd2lsbCByZXVzZSB0aGUgc3RydWN0dXJlXG4gIC8vIGluIGRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZCB3aGVuIHBvc3NpYmxlLlxuXG5cbiAgZnVuY3Rpb24gZ2V0TGluZUNvbnRlbnQoY20sIGxpbmVWaWV3KSB7XG4gICAgdmFyIGV4dCA9IGNtLmRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZDtcblxuICAgIGlmIChleHQgJiYgZXh0LmxpbmUgPT0gbGluZVZpZXcubGluZSkge1xuICAgICAgY20uZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkID0gbnVsbDtcbiAgICAgIGxpbmVWaWV3Lm1lYXN1cmUgPSBleHQubWVhc3VyZTtcbiAgICAgIHJldHVybiBleHQuYnVpbHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWxkTGluZUNvbnRlbnQoY20sIGxpbmVWaWV3KTtcbiAgfSAvLyBSZWRyYXcgdGhlIGxpbmUncyB0ZXh0LiBJbnRlcmFjdHMgd2l0aCB0aGUgYmFja2dyb3VuZCBhbmQgdGV4dFxuICAvLyBjbGFzc2VzIGJlY2F1c2UgdGhlIG1vZGUgbWF5IG91dHB1dCB0b2tlbnMgdGhhdCBpbmZsdWVuY2UgdGhlc2VcbiAgLy8gY2xhc3Nlcy5cblxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxpbmVUZXh0KGNtLCBsaW5lVmlldykge1xuICAgIHZhciBjbHMgPSBsaW5lVmlldy50ZXh0LmNsYXNzTmFtZTtcbiAgICB2YXIgYnVpbHQgPSBnZXRMaW5lQ29udGVudChjbSwgbGluZVZpZXcpO1xuXG4gICAgaWYgKGxpbmVWaWV3LnRleHQgPT0gbGluZVZpZXcubm9kZSkge1xuICAgICAgbGluZVZpZXcubm9kZSA9IGJ1aWx0LnByZTtcbiAgICB9XG5cbiAgICBsaW5lVmlldy50ZXh0LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGJ1aWx0LnByZSwgbGluZVZpZXcudGV4dCk7XG4gICAgbGluZVZpZXcudGV4dCA9IGJ1aWx0LnByZTtcblxuICAgIGlmIChidWlsdC5iZ0NsYXNzICE9IGxpbmVWaWV3LmJnQ2xhc3MgfHwgYnVpbHQudGV4dENsYXNzICE9IGxpbmVWaWV3LnRleHRDbGFzcykge1xuICAgICAgbGluZVZpZXcuYmdDbGFzcyA9IGJ1aWx0LmJnQ2xhc3M7XG4gICAgICBsaW5lVmlldy50ZXh0Q2xhc3MgPSBidWlsdC50ZXh0Q2xhc3M7XG4gICAgICB1cGRhdGVMaW5lQ2xhc3NlcyhsaW5lVmlldyk7XG4gICAgfSBlbHNlIGlmIChjbHMpIHtcbiAgICAgIGxpbmVWaWV3LnRleHQuY2xhc3NOYW1lID0gY2xzO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxpbmVDbGFzc2VzKGxpbmVWaWV3KSB7XG4gICAgdXBkYXRlTGluZUJhY2tncm91bmQobGluZVZpZXcpO1xuXG4gICAgaWYgKGxpbmVWaWV3LmxpbmUud3JhcENsYXNzKSB7XG4gICAgICBlbnN1cmVMaW5lV3JhcHBlZChsaW5lVmlldykuY2xhc3NOYW1lID0gbGluZVZpZXcubGluZS53cmFwQ2xhc3M7XG4gICAgfSBlbHNlIGlmIChsaW5lVmlldy5ub2RlICE9IGxpbmVWaWV3LnRleHQpIHtcbiAgICAgIGxpbmVWaWV3Lm5vZGUuY2xhc3NOYW1lID0gXCJcIjtcbiAgICB9XG5cbiAgICB2YXIgdGV4dENsYXNzID0gbGluZVZpZXcudGV4dENsYXNzID8gbGluZVZpZXcudGV4dENsYXNzICsgXCIgXCIgKyAobGluZVZpZXcubGluZS50ZXh0Q2xhc3MgfHwgXCJcIikgOiBsaW5lVmlldy5saW5lLnRleHRDbGFzcztcbiAgICBsaW5lVmlldy50ZXh0LmNsYXNzTmFtZSA9IHRleHRDbGFzcyB8fCBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlTGluZUd1dHRlcihjbSwgbGluZVZpZXcsIGxpbmVOLCBkaW1zKSB7XG4gICAgaWYgKGxpbmVWaWV3Lmd1dHRlcikge1xuICAgICAgbGluZVZpZXcubm9kZS5yZW1vdmVDaGlsZChsaW5lVmlldy5ndXR0ZXIpO1xuICAgICAgbGluZVZpZXcuZ3V0dGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAobGluZVZpZXcuZ3V0dGVyQmFja2dyb3VuZCkge1xuICAgICAgbGluZVZpZXcubm9kZS5yZW1vdmVDaGlsZChsaW5lVmlldy5ndXR0ZXJCYWNrZ3JvdW5kKTtcbiAgICAgIGxpbmVWaWV3Lmd1dHRlckJhY2tncm91bmQgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChsaW5lVmlldy5saW5lLmd1dHRlckNsYXNzKSB7XG4gICAgICB2YXIgd3JhcCA9IGVuc3VyZUxpbmVXcmFwcGVkKGxpbmVWaWV3KTtcbiAgICAgIGxpbmVWaWV3Lmd1dHRlckJhY2tncm91bmQgPSBlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLWd1dHRlci1iYWNrZ3JvdW5kIFwiICsgbGluZVZpZXcubGluZS5ndXR0ZXJDbGFzcywgXCJsZWZ0OiBcIiArIChjbS5vcHRpb25zLmZpeGVkR3V0dGVyID8gZGltcy5maXhlZFBvcyA6IC1kaW1zLmd1dHRlclRvdGFsV2lkdGgpICsgXCJweDsgd2lkdGg6IFwiICsgZGltcy5ndXR0ZXJUb3RhbFdpZHRoICsgXCJweFwiKTtcbiAgICAgIHdyYXAuaW5zZXJ0QmVmb3JlKGxpbmVWaWV3Lmd1dHRlckJhY2tncm91bmQsIGxpbmVWaWV3LnRleHQpO1xuICAgIH1cblxuICAgIHZhciBtYXJrZXJzID0gbGluZVZpZXcubGluZS5ndXR0ZXJNYXJrZXJzO1xuXG4gICAgaWYgKGNtLm9wdGlvbnMubGluZU51bWJlcnMgfHwgbWFya2Vycykge1xuICAgICAgdmFyIHdyYXAkMSA9IGVuc3VyZUxpbmVXcmFwcGVkKGxpbmVWaWV3KTtcbiAgICAgIHZhciBndXR0ZXJXcmFwID0gbGluZVZpZXcuZ3V0dGVyID0gZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1ndXR0ZXItd3JhcHBlclwiLCBcImxlZnQ6IFwiICsgKGNtLm9wdGlvbnMuZml4ZWRHdXR0ZXIgPyBkaW1zLmZpeGVkUG9zIDogLWRpbXMuZ3V0dGVyVG90YWxXaWR0aCkgKyBcInB4XCIpO1xuICAgICAgY20uZGlzcGxheS5pbnB1dC5zZXRVbmVkaXRhYmxlKGd1dHRlcldyYXApO1xuICAgICAgd3JhcCQxLmluc2VydEJlZm9yZShndXR0ZXJXcmFwLCBsaW5lVmlldy50ZXh0KTtcblxuICAgICAgaWYgKGxpbmVWaWV3LmxpbmUuZ3V0dGVyQ2xhc3MpIHtcbiAgICAgICAgZ3V0dGVyV3JhcC5jbGFzc05hbWUgKz0gXCIgXCIgKyBsaW5lVmlldy5saW5lLmd1dHRlckNsYXNzO1xuICAgICAgfVxuXG4gICAgICBpZiAoY20ub3B0aW9ucy5saW5lTnVtYmVycyAmJiAoIW1hcmtlcnMgfHwgIW1hcmtlcnNbXCJDb2RlTWlycm9yLWxpbmVudW1iZXJzXCJdKSkge1xuICAgICAgICBsaW5lVmlldy5saW5lTnVtYmVyID0gZ3V0dGVyV3JhcC5hcHBlbmRDaGlsZChlbHQoXCJkaXZcIiwgbGluZU51bWJlckZvcihjbS5vcHRpb25zLCBsaW5lTiksIFwiQ29kZU1pcnJvci1saW5lbnVtYmVyIENvZGVNaXJyb3ItZ3V0dGVyLWVsdFwiLCBcImxlZnQ6IFwiICsgZGltcy5ndXR0ZXJMZWZ0W1wiQ29kZU1pcnJvci1saW5lbnVtYmVyc1wiXSArIFwicHg7IHdpZHRoOiBcIiArIGNtLmRpc3BsYXkubGluZU51bUlubmVyV2lkdGggKyBcInB4XCIpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1hcmtlcnMpIHtcbiAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBjbS5vcHRpb25zLmd1dHRlcnMubGVuZ3RoOyArK2spIHtcbiAgICAgICAgICB2YXIgaWQgPSBjbS5vcHRpb25zLmd1dHRlcnNba10sXG4gICAgICAgICAgICAgIGZvdW5kID0gbWFya2Vycy5oYXNPd25Qcm9wZXJ0eShpZCkgJiYgbWFya2Vyc1tpZF07XG5cbiAgICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICAgIGd1dHRlcldyYXAuYXBwZW5kQ2hpbGQoZWx0KFwiZGl2XCIsIFtmb3VuZF0sIFwiQ29kZU1pcnJvci1ndXR0ZXItZWx0XCIsIFwibGVmdDogXCIgKyBkaW1zLmd1dHRlckxlZnRbaWRdICsgXCJweDsgd2lkdGg6IFwiICsgZGltcy5ndXR0ZXJXaWR0aFtpZF0gKyBcInB4XCIpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVMaW5lV2lkZ2V0cyhjbSwgbGluZVZpZXcsIGRpbXMpIHtcbiAgICBpZiAobGluZVZpZXcuYWxpZ25hYmxlKSB7XG4gICAgICBsaW5lVmlldy5hbGlnbmFibGUgPSBudWxsO1xuICAgIH1cblxuICAgIGZvciAodmFyIG5vZGUgPSBsaW5lVmlldy5ub2RlLmZpcnN0Q2hpbGQsIG5leHQgPSB2b2lkIDA7IG5vZGU7IG5vZGUgPSBuZXh0KSB7XG4gICAgICBuZXh0ID0gbm9kZS5uZXh0U2libGluZztcblxuICAgICAgaWYgKG5vZGUuY2xhc3NOYW1lID09IFwiQ29kZU1pcnJvci1saW5ld2lkZ2V0XCIpIHtcbiAgICAgICAgbGluZVZpZXcubm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbnNlcnRMaW5lV2lkZ2V0cyhjbSwgbGluZVZpZXcsIGRpbXMpO1xuICB9IC8vIEJ1aWxkIGEgbGluZSdzIERPTSByZXByZXNlbnRhdGlvbiBmcm9tIHNjcmF0Y2hcblxuXG4gIGZ1bmN0aW9uIGJ1aWxkTGluZUVsZW1lbnQoY20sIGxpbmVWaWV3LCBsaW5lTiwgZGltcykge1xuICAgIHZhciBidWlsdCA9IGdldExpbmVDb250ZW50KGNtLCBsaW5lVmlldyk7XG4gICAgbGluZVZpZXcudGV4dCA9IGxpbmVWaWV3Lm5vZGUgPSBidWlsdC5wcmU7XG5cbiAgICBpZiAoYnVpbHQuYmdDbGFzcykge1xuICAgICAgbGluZVZpZXcuYmdDbGFzcyA9IGJ1aWx0LmJnQ2xhc3M7XG4gICAgfVxuXG4gICAgaWYgKGJ1aWx0LnRleHRDbGFzcykge1xuICAgICAgbGluZVZpZXcudGV4dENsYXNzID0gYnVpbHQudGV4dENsYXNzO1xuICAgIH1cblxuICAgIHVwZGF0ZUxpbmVDbGFzc2VzKGxpbmVWaWV3KTtcbiAgICB1cGRhdGVMaW5lR3V0dGVyKGNtLCBsaW5lVmlldywgbGluZU4sIGRpbXMpO1xuICAgIGluc2VydExpbmVXaWRnZXRzKGNtLCBsaW5lVmlldywgZGltcyk7XG4gICAgcmV0dXJuIGxpbmVWaWV3Lm5vZGU7XG4gIH0gLy8gQSBsaW5lVmlldyBtYXkgY29udGFpbiBtdWx0aXBsZSBsb2dpY2FsIGxpbmVzICh3aGVuIG1lcmdlZCBieVxuICAvLyBjb2xsYXBzZWQgc3BhbnMpLiBUaGUgd2lkZ2V0cyBmb3IgYWxsIG9mIHRoZW0gbmVlZCB0byBiZSBkcmF3bi5cblxuXG4gIGZ1bmN0aW9uIGluc2VydExpbmVXaWRnZXRzKGNtLCBsaW5lVmlldywgZGltcykge1xuICAgIGluc2VydExpbmVXaWRnZXRzRm9yKGNtLCBsaW5lVmlldy5saW5lLCBsaW5lVmlldywgZGltcywgdHJ1ZSk7XG5cbiAgICBpZiAobGluZVZpZXcucmVzdCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lVmlldy5yZXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGluc2VydExpbmVXaWRnZXRzRm9yKGNtLCBsaW5lVmlldy5yZXN0W2ldLCBsaW5lVmlldywgZGltcywgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2VydExpbmVXaWRnZXRzRm9yKGNtLCBsaW5lLCBsaW5lVmlldywgZGltcywgYWxsb3dBYm92ZSkge1xuICAgIGlmICghbGluZS53aWRnZXRzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHdyYXAgPSBlbnN1cmVMaW5lV3JhcHBlZChsaW5lVmlldyk7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgd3MgPSBsaW5lLndpZGdldHM7IGkgPCB3cy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHdpZGdldCA9IHdzW2ldLFxuICAgICAgICAgIG5vZGUgPSBlbHQoXCJkaXZcIiwgW3dpZGdldC5ub2RlXSwgXCJDb2RlTWlycm9yLWxpbmV3aWRnZXRcIik7XG5cbiAgICAgIGlmICghd2lkZ2V0LmhhbmRsZU1vdXNlRXZlbnRzKSB7XG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKFwiY20taWdub3JlLWV2ZW50c1wiLCBcInRydWVcIik7XG4gICAgICB9XG5cbiAgICAgIHBvc2l0aW9uTGluZVdpZGdldCh3aWRnZXQsIG5vZGUsIGxpbmVWaWV3LCBkaW1zKTtcbiAgICAgIGNtLmRpc3BsYXkuaW5wdXQuc2V0VW5lZGl0YWJsZShub2RlKTtcblxuICAgICAgaWYgKGFsbG93QWJvdmUgJiYgd2lkZ2V0LmFib3ZlKSB7XG4gICAgICAgIHdyYXAuaW5zZXJ0QmVmb3JlKG5vZGUsIGxpbmVWaWV3Lmd1dHRlciB8fCBsaW5lVmlldy50ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdyYXAuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICB9XG5cbiAgICAgIHNpZ25hbExhdGVyKHdpZGdldCwgXCJyZWRyYXdcIik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcG9zaXRpb25MaW5lV2lkZ2V0KHdpZGdldCwgbm9kZSwgbGluZVZpZXcsIGRpbXMpIHtcbiAgICBpZiAod2lkZ2V0Lm5vSFNjcm9sbCkge1xuICAgICAgO1xuICAgICAgKGxpbmVWaWV3LmFsaWduYWJsZSB8fCAobGluZVZpZXcuYWxpZ25hYmxlID0gW10pKS5wdXNoKG5vZGUpO1xuICAgICAgdmFyIHdpZHRoID0gZGltcy53cmFwcGVyV2lkdGg7XG4gICAgICBub2RlLnN0eWxlLmxlZnQgPSBkaW1zLmZpeGVkUG9zICsgXCJweFwiO1xuXG4gICAgICBpZiAoIXdpZGdldC5jb3Zlckd1dHRlcikge1xuICAgICAgICB3aWR0aCAtPSBkaW1zLmd1dHRlclRvdGFsV2lkdGg7XG4gICAgICAgIG5vZGUuc3R5bGUucGFkZGluZ0xlZnQgPSBkaW1zLmd1dHRlclRvdGFsV2lkdGggKyBcInB4XCI7XG4gICAgICB9XG5cbiAgICAgIG5vZGUuc3R5bGUud2lkdGggPSB3aWR0aCArIFwicHhcIjtcbiAgICB9XG5cbiAgICBpZiAod2lkZ2V0LmNvdmVyR3V0dGVyKSB7XG4gICAgICBub2RlLnN0eWxlLnpJbmRleCA9IDU7XG4gICAgICBub2RlLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xuXG4gICAgICBpZiAoIXdpZGdldC5ub0hTY3JvbGwpIHtcbiAgICAgICAgbm9kZS5zdHlsZS5tYXJnaW5MZWZ0ID0gLWRpbXMuZ3V0dGVyVG90YWxXaWR0aCArIFwicHhcIjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB3aWRnZXRIZWlnaHQod2lkZ2V0KSB7XG4gICAgaWYgKHdpZGdldC5oZWlnaHQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHdpZGdldC5oZWlnaHQ7XG4gICAgfVxuXG4gICAgdmFyIGNtID0gd2lkZ2V0LmRvYy5jbTtcblxuICAgIGlmICghY20pIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGlmICghY29udGFpbnMoZG9jdW1lbnQuYm9keSwgd2lkZ2V0Lm5vZGUpKSB7XG4gICAgICB2YXIgcGFyZW50U3R5bGUgPSBcInBvc2l0aW9uOiByZWxhdGl2ZTtcIjtcblxuICAgICAgaWYgKHdpZGdldC5jb3Zlckd1dHRlcikge1xuICAgICAgICBwYXJlbnRTdHlsZSArPSBcIm1hcmdpbi1sZWZ0OiAtXCIgKyBjbS5kaXNwbGF5Lmd1dHRlcnMub2Zmc2V0V2lkdGggKyBcInB4O1wiO1xuICAgICAgfVxuXG4gICAgICBpZiAod2lkZ2V0Lm5vSFNjcm9sbCkge1xuICAgICAgICBwYXJlbnRTdHlsZSArPSBcIndpZHRoOiBcIiArIGNtLmRpc3BsYXkud3JhcHBlci5jbGllbnRXaWR0aCArIFwicHg7XCI7XG4gICAgICB9XG5cbiAgICAgIHJlbW92ZUNoaWxkcmVuQW5kQWRkKGNtLmRpc3BsYXkubWVhc3VyZSwgZWx0KFwiZGl2XCIsIFt3aWRnZXQubm9kZV0sIG51bGwsIHBhcmVudFN0eWxlKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHdpZGdldC5oZWlnaHQgPSB3aWRnZXQubm9kZS5wYXJlbnROb2RlLm9mZnNldEhlaWdodDtcbiAgfSAvLyBSZXR1cm4gdHJ1ZSB3aGVuIHRoZSBnaXZlbiBtb3VzZSBldmVudCBoYXBwZW5lZCBpbiBhIHdpZGdldFxuXG5cbiAgZnVuY3Rpb24gZXZlbnRJbldpZGdldChkaXNwbGF5LCBlKSB7XG4gICAgZm9yICh2YXIgbiA9IGVfdGFyZ2V0KGUpOyBuICE9IGRpc3BsYXkud3JhcHBlcjsgbiA9IG4ucGFyZW50Tm9kZSkge1xuICAgICAgaWYgKCFuIHx8IG4ubm9kZVR5cGUgPT0gMSAmJiBuLmdldEF0dHJpYnV0ZShcImNtLWlnbm9yZS1ldmVudHNcIikgPT0gXCJ0cnVlXCIgfHwgbi5wYXJlbnROb2RlID09IGRpc3BsYXkuc2l6ZXIgJiYgbiAhPSBkaXNwbGF5Lm1vdmVyKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfSAvLyBQT1NJVElPTiBNRUFTVVJFTUVOVFxuXG5cbiAgZnVuY3Rpb24gcGFkZGluZ1RvcChkaXNwbGF5KSB7XG4gICAgcmV0dXJuIGRpc3BsYXkubGluZVNwYWNlLm9mZnNldFRvcDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhZGRpbmdWZXJ0KGRpc3BsYXkpIHtcbiAgICByZXR1cm4gZGlzcGxheS5tb3Zlci5vZmZzZXRIZWlnaHQgLSBkaXNwbGF5LmxpbmVTcGFjZS5vZmZzZXRIZWlnaHQ7XG4gIH1cblxuICBmdW5jdGlvbiBwYWRkaW5nSChkaXNwbGF5KSB7XG4gICAgaWYgKGRpc3BsYXkuY2FjaGVkUGFkZGluZ0gpIHtcbiAgICAgIHJldHVybiBkaXNwbGF5LmNhY2hlZFBhZGRpbmdIO1xuICAgIH1cblxuICAgIHZhciBlID0gcmVtb3ZlQ2hpbGRyZW5BbmRBZGQoZGlzcGxheS5tZWFzdXJlLCBlbHQoXCJwcmVcIiwgXCJ4XCIpKTtcbiAgICB2YXIgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSA/IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGUpIDogZS5jdXJyZW50U3R5bGU7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBsZWZ0OiBwYXJzZUludChzdHlsZS5wYWRkaW5nTGVmdCksXG4gICAgICByaWdodDogcGFyc2VJbnQoc3R5bGUucGFkZGluZ1JpZ2h0KVxuICAgIH07XG5cbiAgICBpZiAoIWlzTmFOKGRhdGEubGVmdCkgJiYgIWlzTmFOKGRhdGEucmlnaHQpKSB7XG4gICAgICBkaXNwbGF5LmNhY2hlZFBhZGRpbmdIID0gZGF0YTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNjcm9sbEdhcChjbSkge1xuICAgIHJldHVybiBzY3JvbGxlckdhcCAtIGNtLmRpc3BsYXkubmF0aXZlQmFyV2lkdGg7XG4gIH1cblxuICBmdW5jdGlvbiBkaXNwbGF5V2lkdGgoY20pIHtcbiAgICByZXR1cm4gY20uZGlzcGxheS5zY3JvbGxlci5jbGllbnRXaWR0aCAtIHNjcm9sbEdhcChjbSkgLSBjbS5kaXNwbGF5LmJhcldpZHRoO1xuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGxheUhlaWdodChjbSkge1xuICAgIHJldHVybiBjbS5kaXNwbGF5LnNjcm9sbGVyLmNsaWVudEhlaWdodCAtIHNjcm9sbEdhcChjbSkgLSBjbS5kaXNwbGF5LmJhckhlaWdodDtcbiAgfSAvLyBFbnN1cmUgdGhlIGxpbmVWaWV3LndyYXBwaW5nLmhlaWdodHMgYXJyYXkgaXMgcG9wdWxhdGVkLiBUaGlzIGlzXG4gIC8vIGFuIGFycmF5IG9mIGJvdHRvbSBvZmZzZXRzIGZvciB0aGUgbGluZXMgdGhhdCBtYWtlIHVwIGEgZHJhd25cbiAgLy8gbGluZS4gV2hlbiBsaW5lV3JhcHBpbmcgaXMgb24sIHRoZXJlIG1pZ2h0IGJlIG1vcmUgdGhhbiBvbmVcbiAgLy8gaGVpZ2h0LlxuXG5cbiAgZnVuY3Rpb24gZW5zdXJlTGluZUhlaWdodHMoY20sIGxpbmVWaWV3LCByZWN0KSB7XG4gICAgdmFyIHdyYXBwaW5nID0gY20ub3B0aW9ucy5saW5lV3JhcHBpbmc7XG4gICAgdmFyIGN1cldpZHRoID0gd3JhcHBpbmcgJiYgZGlzcGxheVdpZHRoKGNtKTtcblxuICAgIGlmICghbGluZVZpZXcubWVhc3VyZS5oZWlnaHRzIHx8IHdyYXBwaW5nICYmIGxpbmVWaWV3Lm1lYXN1cmUud2lkdGggIT0gY3VyV2lkdGgpIHtcbiAgICAgIHZhciBoZWlnaHRzID0gbGluZVZpZXcubWVhc3VyZS5oZWlnaHRzID0gW107XG5cbiAgICAgIGlmICh3cmFwcGluZykge1xuICAgICAgICBsaW5lVmlldy5tZWFzdXJlLndpZHRoID0gY3VyV2lkdGg7XG4gICAgICAgIHZhciByZWN0cyA9IGxpbmVWaWV3LnRleHQuZmlyc3RDaGlsZC5nZXRDbGllbnRSZWN0cygpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVjdHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgdmFyIGN1ciA9IHJlY3RzW2ldLFxuICAgICAgICAgICAgICBuZXh0ID0gcmVjdHNbaSArIDFdO1xuXG4gICAgICAgICAgaWYgKE1hdGguYWJzKGN1ci5ib3R0b20gLSBuZXh0LmJvdHRvbSkgPiAyKSB7XG4gICAgICAgICAgICBoZWlnaHRzLnB1c2goKGN1ci5ib3R0b20gKyBuZXh0LnRvcCkgLyAyIC0gcmVjdC50b3ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBoZWlnaHRzLnB1c2gocmVjdC5ib3R0b20gLSByZWN0LnRvcCk7XG4gICAgfVxuICB9IC8vIEZpbmQgYSBsaW5lIG1hcCAobWFwcGluZyBjaGFyYWN0ZXIgb2Zmc2V0cyB0byB0ZXh0IG5vZGVzKSBhbmQgYVxuICAvLyBtZWFzdXJlbWVudCBjYWNoZSBmb3IgdGhlIGdpdmVuIGxpbmUgbnVtYmVyLiAoQSBsaW5lIHZpZXcgbWlnaHRcbiAgLy8gY29udGFpbiBtdWx0aXBsZSBsaW5lcyB3aGVuIGNvbGxhcHNlZCByYW5nZXMgYXJlIHByZXNlbnQuKVxuXG5cbiAgZnVuY3Rpb24gbWFwRnJvbUxpbmVWaWV3KGxpbmVWaWV3LCBsaW5lLCBsaW5lTikge1xuICAgIGlmIChsaW5lVmlldy5saW5lID09IGxpbmUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1hcDogbGluZVZpZXcubWVhc3VyZS5tYXAsXG4gICAgICAgIGNhY2hlOiBsaW5lVmlldy5tZWFzdXJlLmNhY2hlXG4gICAgICB9O1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZVZpZXcucmVzdC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpbmVWaWV3LnJlc3RbaV0gPT0gbGluZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1hcDogbGluZVZpZXcubWVhc3VyZS5tYXBzW2ldLFxuICAgICAgICAgIGNhY2hlOiBsaW5lVmlldy5tZWFzdXJlLmNhY2hlc1tpXVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IGxpbmVWaWV3LnJlc3QubGVuZ3RoOyBpJDErKykge1xuICAgICAgaWYgKGxpbmVObyhsaW5lVmlldy5yZXN0W2kkMV0pID4gbGluZU4pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBtYXA6IGxpbmVWaWV3Lm1lYXN1cmUubWFwc1tpJDFdLFxuICAgICAgICAgIGNhY2hlOiBsaW5lVmlldy5tZWFzdXJlLmNhY2hlc1tpJDFdLFxuICAgICAgICAgIGJlZm9yZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgfSAvLyBSZW5kZXIgYSBsaW5lIGludG8gdGhlIGhpZGRlbiBub2RlIGRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZC4gVXNlZFxuICAvLyB3aGVuIG1lYXN1cmVtZW50IGlzIG5lZWRlZCBmb3IgYSBsaW5lIHRoYXQncyBub3QgaW4gdGhlIHZpZXdwb3J0LlxuXG5cbiAgZnVuY3Rpb24gdXBkYXRlRXh0ZXJuYWxNZWFzdXJlbWVudChjbSwgbGluZSkge1xuICAgIGxpbmUgPSB2aXN1YWxMaW5lKGxpbmUpO1xuICAgIHZhciBsaW5lTiA9IGxpbmVObyhsaW5lKTtcbiAgICB2YXIgdmlldyA9IGNtLmRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZCA9IG5ldyBMaW5lVmlldyhjbS5kb2MsIGxpbmUsIGxpbmVOKTtcbiAgICB2aWV3LmxpbmVOID0gbGluZU47XG4gICAgdmFyIGJ1aWx0ID0gdmlldy5idWlsdCA9IGJ1aWxkTGluZUNvbnRlbnQoY20sIHZpZXcpO1xuICAgIHZpZXcudGV4dCA9IGJ1aWx0LnByZTtcbiAgICByZW1vdmVDaGlsZHJlbkFuZEFkZChjbS5kaXNwbGF5LmxpbmVNZWFzdXJlLCBidWlsdC5wcmUpO1xuICAgIHJldHVybiB2aWV3O1xuICB9IC8vIEdldCBhIHt0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHR9IGJveCAoaW4gbGluZS1sb2NhbCBjb29yZGluYXRlcylcbiAgLy8gZm9yIGEgZ2l2ZW4gY2hhcmFjdGVyLlxuXG5cbiAgZnVuY3Rpb24gbWVhc3VyZUNoYXIoY20sIGxpbmUsIGNoLCBiaWFzKSB7XG4gICAgcmV0dXJuIG1lYXN1cmVDaGFyUHJlcGFyZWQoY20sIHByZXBhcmVNZWFzdXJlRm9yTGluZShjbSwgbGluZSksIGNoLCBiaWFzKTtcbiAgfSAvLyBGaW5kIGEgbGluZSB2aWV3IHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIGdpdmVuIGxpbmUgbnVtYmVyLlxuXG5cbiAgZnVuY3Rpb24gZmluZFZpZXdGb3JMaW5lKGNtLCBsaW5lTikge1xuICAgIGlmIChsaW5lTiA+PSBjbS5kaXNwbGF5LnZpZXdGcm9tICYmIGxpbmVOIDwgY20uZGlzcGxheS52aWV3VG8pIHtcbiAgICAgIHJldHVybiBjbS5kaXNwbGF5LnZpZXdbZmluZFZpZXdJbmRleChjbSwgbGluZU4pXTtcbiAgICB9XG5cbiAgICB2YXIgZXh0ID0gY20uZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkO1xuXG4gICAgaWYgKGV4dCAmJiBsaW5lTiA+PSBleHQubGluZU4gJiYgbGluZU4gPCBleHQubGluZU4gKyBleHQuc2l6ZSkge1xuICAgICAgcmV0dXJuIGV4dDtcbiAgICB9XG4gIH0gLy8gTWVhc3VyZW1lbnQgY2FuIGJlIHNwbGl0IGluIHR3byBzdGVwcywgdGhlIHNldC11cCB3b3JrIHRoYXRcbiAgLy8gYXBwbGllcyB0byB0aGUgd2hvbGUgbGluZSwgYW5kIHRoZSBtZWFzdXJlbWVudCBvZiB0aGUgYWN0dWFsXG4gIC8vIGNoYXJhY3Rlci4gRnVuY3Rpb25zIGxpa2UgY29vcmRzQ2hhciwgdGhhdCBuZWVkIHRvIGRvIGEgbG90IG9mXG4gIC8vIG1lYXN1cmVtZW50cyBpbiBhIHJvdywgY2FuIHRodXMgZW5zdXJlIHRoYXQgdGhlIHNldC11cCB3b3JrIGlzXG4gIC8vIG9ubHkgZG9uZSBvbmNlLlxuXG5cbiAgZnVuY3Rpb24gcHJlcGFyZU1lYXN1cmVGb3JMaW5lKGNtLCBsaW5lKSB7XG4gICAgdmFyIGxpbmVOID0gbGluZU5vKGxpbmUpO1xuICAgIHZhciB2aWV3ID0gZmluZFZpZXdGb3JMaW5lKGNtLCBsaW5lTik7XG5cbiAgICBpZiAodmlldyAmJiAhdmlldy50ZXh0KSB7XG4gICAgICB2aWV3ID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHZpZXcgJiYgdmlldy5jaGFuZ2VzKSB7XG4gICAgICB1cGRhdGVMaW5lRm9yQ2hhbmdlcyhjbSwgdmlldywgbGluZU4sIGdldERpbWVuc2lvbnMoY20pKTtcbiAgICAgIGNtLmN1ck9wLmZvcmNlVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIXZpZXcpIHtcbiAgICAgIHZpZXcgPSB1cGRhdGVFeHRlcm5hbE1lYXN1cmVtZW50KGNtLCBsaW5lKTtcbiAgICB9XG5cbiAgICB2YXIgaW5mbyA9IG1hcEZyb21MaW5lVmlldyh2aWV3LCBsaW5lLCBsaW5lTik7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxpbmU6IGxpbmUsXG4gICAgICB2aWV3OiB2aWV3LFxuICAgICAgcmVjdDogbnVsbCxcbiAgICAgIG1hcDogaW5mby5tYXAsXG4gICAgICBjYWNoZTogaW5mby5jYWNoZSxcbiAgICAgIGJlZm9yZTogaW5mby5iZWZvcmUsXG4gICAgICBoYXNIZWlnaHRzOiBmYWxzZVxuICAgIH07XG4gIH0gLy8gR2l2ZW4gYSBwcmVwYXJlZCBtZWFzdXJlbWVudCBvYmplY3QsIG1lYXN1cmVzIHRoZSBwb3NpdGlvbiBvZiBhblxuICAvLyBhY3R1YWwgY2hhcmFjdGVyIChvciBmZXRjaGVzIGl0IGZyb20gdGhlIGNhY2hlKS5cblxuXG4gIGZ1bmN0aW9uIG1lYXN1cmVDaGFyUHJlcGFyZWQoY20sIHByZXBhcmVkLCBjaCwgYmlhcywgdmFySGVpZ2h0KSB7XG4gICAgaWYgKHByZXBhcmVkLmJlZm9yZSkge1xuICAgICAgY2ggPSAtMTtcbiAgICB9XG5cbiAgICB2YXIga2V5ID0gY2ggKyAoYmlhcyB8fCBcIlwiKSxcbiAgICAgICAgZm91bmQ7XG5cbiAgICBpZiAocHJlcGFyZWQuY2FjaGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgZm91bmQgPSBwcmVwYXJlZC5jYWNoZVtrZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXByZXBhcmVkLnJlY3QpIHtcbiAgICAgICAgcHJlcGFyZWQucmVjdCA9IHByZXBhcmVkLnZpZXcudGV4dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFwcmVwYXJlZC5oYXNIZWlnaHRzKSB7XG4gICAgICAgIGVuc3VyZUxpbmVIZWlnaHRzKGNtLCBwcmVwYXJlZC52aWV3LCBwcmVwYXJlZC5yZWN0KTtcbiAgICAgICAgcHJlcGFyZWQuaGFzSGVpZ2h0cyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGZvdW5kID0gbWVhc3VyZUNoYXJJbm5lcihjbSwgcHJlcGFyZWQsIGNoLCBiaWFzKTtcblxuICAgICAgaWYgKCFmb3VuZC5ib2d1cykge1xuICAgICAgICBwcmVwYXJlZC5jYWNoZVtrZXldID0gZm91bmQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxlZnQ6IGZvdW5kLmxlZnQsXG4gICAgICByaWdodDogZm91bmQucmlnaHQsXG4gICAgICB0b3A6IHZhckhlaWdodCA/IGZvdW5kLnJ0b3AgOiBmb3VuZC50b3AsXG4gICAgICBib3R0b206IHZhckhlaWdodCA/IGZvdW5kLnJib3R0b20gOiBmb3VuZC5ib3R0b21cbiAgICB9O1xuICB9XG5cbiAgdmFyIG51bGxSZWN0ID0ge1xuICAgIGxlZnQ6IDAsXG4gICAgcmlnaHQ6IDAsXG4gICAgdG9wOiAwLFxuICAgIGJvdHRvbTogMFxuICB9O1xuXG4gIGZ1bmN0aW9uIG5vZGVBbmRPZmZzZXRJbkxpbmVNYXAobWFwLCBjaCwgYmlhcykge1xuICAgIHZhciBub2RlLCBzdGFydCwgZW5kLCBjb2xsYXBzZSwgbVN0YXJ0LCBtRW5kOyAvLyBGaXJzdCwgc2VhcmNoIHRoZSBsaW5lIG1hcCBmb3IgdGhlIHRleHQgbm9kZSBjb3JyZXNwb25kaW5nIHRvLFxuICAgIC8vIG9yIGNsb3Nlc3QgdG8sIHRoZSB0YXJnZXQgY2hhcmFjdGVyLlxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXAubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgIG1TdGFydCA9IG1hcFtpXTtcbiAgICAgIG1FbmQgPSBtYXBbaSArIDFdO1xuXG4gICAgICBpZiAoY2ggPCBtU3RhcnQpIHtcbiAgICAgICAgc3RhcnQgPSAwO1xuICAgICAgICBlbmQgPSAxO1xuICAgICAgICBjb2xsYXBzZSA9IFwibGVmdFwiO1xuICAgICAgfSBlbHNlIGlmIChjaCA8IG1FbmQpIHtcbiAgICAgICAgc3RhcnQgPSBjaCAtIG1TdGFydDtcbiAgICAgICAgZW5kID0gc3RhcnQgKyAxO1xuICAgICAgfSBlbHNlIGlmIChpID09IG1hcC5sZW5ndGggLSAzIHx8IGNoID09IG1FbmQgJiYgbWFwW2kgKyAzXSA+IGNoKSB7XG4gICAgICAgIGVuZCA9IG1FbmQgLSBtU3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gZW5kIC0gMTtcblxuICAgICAgICBpZiAoY2ggPj0gbUVuZCkge1xuICAgICAgICAgIGNvbGxhcHNlID0gXCJyaWdodFwiO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGFydCAhPSBudWxsKSB7XG4gICAgICAgIG5vZGUgPSBtYXBbaSArIDJdO1xuXG4gICAgICAgIGlmIChtU3RhcnQgPT0gbUVuZCAmJiBiaWFzID09IChub2RlLmluc2VydExlZnQgPyBcImxlZnRcIiA6IFwicmlnaHRcIikpIHtcbiAgICAgICAgICBjb2xsYXBzZSA9IGJpYXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYmlhcyA9PSBcImxlZnRcIiAmJiBzdGFydCA9PSAwKSB7XG4gICAgICAgICAgd2hpbGUgKGkgJiYgbWFwW2kgLSAyXSA9PSBtYXBbaSAtIDNdICYmIG1hcFtpIC0gMV0uaW5zZXJ0TGVmdCkge1xuICAgICAgICAgICAgbm9kZSA9IG1hcFsoaSAtPSAzKSArIDJdO1xuICAgICAgICAgICAgY29sbGFwc2UgPSBcImxlZnRcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYmlhcyA9PSBcInJpZ2h0XCIgJiYgc3RhcnQgPT0gbUVuZCAtIG1TdGFydCkge1xuICAgICAgICAgIHdoaWxlIChpIDwgbWFwLmxlbmd0aCAtIDMgJiYgbWFwW2kgKyAzXSA9PSBtYXBbaSArIDRdICYmICFtYXBbaSArIDVdLmluc2VydExlZnQpIHtcbiAgICAgICAgICAgIG5vZGUgPSBtYXBbKGkgKz0gMykgKyAyXTtcbiAgICAgICAgICAgIGNvbGxhcHNlID0gXCJyaWdodFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBub2RlOiBub2RlLFxuICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgZW5kOiBlbmQsXG4gICAgICBjb2xsYXBzZTogY29sbGFwc2UsXG4gICAgICBjb3ZlclN0YXJ0OiBtU3RhcnQsXG4gICAgICBjb3ZlckVuZDogbUVuZFxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBnZXRVc2VmdWxSZWN0KHJlY3RzLCBiaWFzKSB7XG4gICAgdmFyIHJlY3QgPSBudWxsUmVjdDtcblxuICAgIGlmIChiaWFzID09IFwibGVmdFwiKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICgocmVjdCA9IHJlY3RzW2ldKS5sZWZ0ICE9IHJlY3QucmlnaHQpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpJDEgPSByZWN0cy5sZW5ndGggLSAxOyBpJDEgPj0gMDsgaSQxLS0pIHtcbiAgICAgICAgaWYgKChyZWN0ID0gcmVjdHNbaSQxXSkubGVmdCAhPSByZWN0LnJpZ2h0KSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVjdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lYXN1cmVDaGFySW5uZXIoY20sIHByZXBhcmVkLCBjaCwgYmlhcykge1xuICAgIHZhciBwbGFjZSA9IG5vZGVBbmRPZmZzZXRJbkxpbmVNYXAocHJlcGFyZWQubWFwLCBjaCwgYmlhcyk7XG4gICAgdmFyIG5vZGUgPSBwbGFjZS5ub2RlLFxuICAgICAgICBzdGFydCA9IHBsYWNlLnN0YXJ0LFxuICAgICAgICBlbmQgPSBwbGFjZS5lbmQsXG4gICAgICAgIGNvbGxhcHNlID0gcGxhY2UuY29sbGFwc2U7XG4gICAgdmFyIHJlY3Q7XG5cbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PSAzKSB7XG4gICAgICAvLyBJZiBpdCBpcyBhIHRleHQgbm9kZSwgdXNlIGEgcmFuZ2UgdG8gcmV0cmlldmUgdGhlIGNvb3JkaW5hdGVzLlxuICAgICAgZm9yICh2YXIgaSQxID0gMDsgaSQxIDwgNDsgaSQxKyspIHtcbiAgICAgICAgLy8gUmV0cnkgYSBtYXhpbXVtIG9mIDQgdGltZXMgd2hlbiBub25zZW5zZSByZWN0YW5nbGVzIGFyZSByZXR1cm5lZFxuICAgICAgICB3aGlsZSAoc3RhcnQgJiYgaXNFeHRlbmRpbmdDaGFyKHByZXBhcmVkLmxpbmUudGV4dC5jaGFyQXQocGxhY2UuY292ZXJTdGFydCArIHN0YXJ0KSkpIHtcbiAgICAgICAgICAtLXN0YXJ0O1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKHBsYWNlLmNvdmVyU3RhcnQgKyBlbmQgPCBwbGFjZS5jb3ZlckVuZCAmJiBpc0V4dGVuZGluZ0NoYXIocHJlcGFyZWQubGluZS50ZXh0LmNoYXJBdChwbGFjZS5jb3ZlclN0YXJ0ICsgZW5kKSkpIHtcbiAgICAgICAgICArK2VuZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpZSAmJiBpZV92ZXJzaW9uIDwgOSAmJiBzdGFydCA9PSAwICYmIGVuZCA9PSBwbGFjZS5jb3ZlckVuZCAtIHBsYWNlLmNvdmVyU3RhcnQpIHtcbiAgICAgICAgICByZWN0ID0gbm9kZS5wYXJlbnROb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlY3QgPSBnZXRVc2VmdWxSZWN0KHJhbmdlKG5vZGUsIHN0YXJ0LCBlbmQpLmdldENsaWVudFJlY3RzKCksIGJpYXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlY3QubGVmdCB8fCByZWN0LnJpZ2h0IHx8IHN0YXJ0ID09IDApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGVuZCA9IHN0YXJ0O1xuICAgICAgICBzdGFydCA9IHN0YXJ0IC0gMTtcbiAgICAgICAgY29sbGFwc2UgPSBcInJpZ2h0XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpZSAmJiBpZV92ZXJzaW9uIDwgMTEpIHtcbiAgICAgICAgcmVjdCA9IG1heWJlVXBkYXRlUmVjdEZvclpvb21pbmcoY20uZGlzcGxheS5tZWFzdXJlLCByZWN0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgaXQgaXMgYSB3aWRnZXQsIHNpbXBseSBnZXQgdGhlIGJveCBmb3IgdGhlIHdob2xlIHdpZGdldC5cbiAgICAgIGlmIChzdGFydCA+IDApIHtcbiAgICAgICAgY29sbGFwc2UgPSBiaWFzID0gXCJyaWdodFwiO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjdHM7XG5cbiAgICAgIGlmIChjbS5vcHRpb25zLmxpbmVXcmFwcGluZyAmJiAocmVjdHMgPSBub2RlLmdldENsaWVudFJlY3RzKCkpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgcmVjdCA9IHJlY3RzW2JpYXMgPT0gXCJyaWdodFwiID8gcmVjdHMubGVuZ3RoIC0gMSA6IDBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGllICYmIGllX3ZlcnNpb24gPCA5ICYmICFzdGFydCAmJiAoIXJlY3QgfHwgIXJlY3QubGVmdCAmJiAhcmVjdC5yaWdodCkpIHtcbiAgICAgIHZhciByU3BhbiA9IG5vZGUucGFyZW50Tm9kZS5nZXRDbGllbnRSZWN0cygpWzBdO1xuXG4gICAgICBpZiAoclNwYW4pIHtcbiAgICAgICAgcmVjdCA9IHtcbiAgICAgICAgICBsZWZ0OiByU3Bhbi5sZWZ0LFxuICAgICAgICAgIHJpZ2h0OiByU3Bhbi5sZWZ0ICsgY2hhcldpZHRoKGNtLmRpc3BsYXkpLFxuICAgICAgICAgIHRvcDogclNwYW4udG9wLFxuICAgICAgICAgIGJvdHRvbTogclNwYW4uYm90dG9tXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWN0ID0gbnVsbFJlY3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJ0b3AgPSByZWN0LnRvcCAtIHByZXBhcmVkLnJlY3QudG9wLFxuICAgICAgICByYm90ID0gcmVjdC5ib3R0b20gLSBwcmVwYXJlZC5yZWN0LnRvcDtcbiAgICB2YXIgbWlkID0gKHJ0b3AgKyByYm90KSAvIDI7XG4gICAgdmFyIGhlaWdodHMgPSBwcmVwYXJlZC52aWV3Lm1lYXN1cmUuaGVpZ2h0cztcbiAgICB2YXIgaSA9IDA7XG5cbiAgICBmb3IgKDsgaSA8IGhlaWdodHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBpZiAobWlkIDwgaGVpZ2h0c1tpXSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdG9wID0gaSA/IGhlaWdodHNbaSAtIDFdIDogMCxcbiAgICAgICAgYm90ID0gaGVpZ2h0c1tpXTtcbiAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgbGVmdDogKGNvbGxhcHNlID09IFwicmlnaHRcIiA/IHJlY3QucmlnaHQgOiByZWN0LmxlZnQpIC0gcHJlcGFyZWQucmVjdC5sZWZ0LFxuICAgICAgcmlnaHQ6IChjb2xsYXBzZSA9PSBcImxlZnRcIiA/IHJlY3QubGVmdCA6IHJlY3QucmlnaHQpIC0gcHJlcGFyZWQucmVjdC5sZWZ0LFxuICAgICAgdG9wOiB0b3AsXG4gICAgICBib3R0b206IGJvdFxuICAgIH07XG5cbiAgICBpZiAoIXJlY3QubGVmdCAmJiAhcmVjdC5yaWdodCkge1xuICAgICAgcmVzdWx0LmJvZ3VzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIWNtLm9wdGlvbnMuc2luZ2xlQ3Vyc29ySGVpZ2h0UGVyTGluZSkge1xuICAgICAgcmVzdWx0LnJ0b3AgPSBydG9wO1xuICAgICAgcmVzdWx0LnJib3R0b20gPSByYm90O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gLy8gV29yayBhcm91bmQgcHJvYmxlbSB3aXRoIGJvdW5kaW5nIGNsaWVudCByZWN0cyBvbiByYW5nZXMgYmVpbmdcbiAgLy8gcmV0dXJuZWQgaW5jb3JyZWN0bHkgd2hlbiB6b29tZWQgb24gSUUxMCBhbmQgYmVsb3cuXG5cblxuICBmdW5jdGlvbiBtYXliZVVwZGF0ZVJlY3RGb3Jab29taW5nKG1lYXN1cmUsIHJlY3QpIHtcbiAgICBpZiAoIXdpbmRvdy5zY3JlZW4gfHwgc2NyZWVuLmxvZ2ljYWxYRFBJID09IG51bGwgfHwgc2NyZWVuLmxvZ2ljYWxYRFBJID09IHNjcmVlbi5kZXZpY2VYRFBJIHx8ICFoYXNCYWRab29tZWRSZWN0cyhtZWFzdXJlKSkge1xuICAgICAgcmV0dXJuIHJlY3Q7XG4gICAgfVxuXG4gICAgdmFyIHNjYWxlWCA9IHNjcmVlbi5sb2dpY2FsWERQSSAvIHNjcmVlbi5kZXZpY2VYRFBJO1xuICAgIHZhciBzY2FsZVkgPSBzY3JlZW4ubG9naWNhbFlEUEkgLyBzY3JlZW4uZGV2aWNlWURQSTtcbiAgICByZXR1cm4ge1xuICAgICAgbGVmdDogcmVjdC5sZWZ0ICogc2NhbGVYLFxuICAgICAgcmlnaHQ6IHJlY3QucmlnaHQgKiBzY2FsZVgsXG4gICAgICB0b3A6IHJlY3QudG9wICogc2NhbGVZLFxuICAgICAgYm90dG9tOiByZWN0LmJvdHRvbSAqIHNjYWxlWVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhckxpbmVNZWFzdXJlbWVudENhY2hlRm9yKGxpbmVWaWV3KSB7XG4gICAgaWYgKGxpbmVWaWV3Lm1lYXN1cmUpIHtcbiAgICAgIGxpbmVWaWV3Lm1lYXN1cmUuY2FjaGUgPSB7fTtcbiAgICAgIGxpbmVWaWV3Lm1lYXN1cmUuaGVpZ2h0cyA9IG51bGw7XG5cbiAgICAgIGlmIChsaW5lVmlldy5yZXN0KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZVZpZXcucmVzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxpbmVWaWV3Lm1lYXN1cmUuY2FjaGVzW2ldID0ge307XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhckxpbmVNZWFzdXJlbWVudENhY2hlKGNtKSB7XG4gICAgY20uZGlzcGxheS5leHRlcm5hbE1lYXN1cmUgPSBudWxsO1xuICAgIHJlbW92ZUNoaWxkcmVuKGNtLmRpc3BsYXkubGluZU1lYXN1cmUpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbS5kaXNwbGF5LnZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNsZWFyTGluZU1lYXN1cmVtZW50Q2FjaGVGb3IoY20uZGlzcGxheS52aWV3W2ldKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhckNhY2hlcyhjbSkge1xuICAgIGNsZWFyTGluZU1lYXN1cmVtZW50Q2FjaGUoY20pO1xuICAgIGNtLmRpc3BsYXkuY2FjaGVkQ2hhcldpZHRoID0gY20uZGlzcGxheS5jYWNoZWRUZXh0SGVpZ2h0ID0gY20uZGlzcGxheS5jYWNoZWRQYWRkaW5nSCA9IG51bGw7XG5cbiAgICBpZiAoIWNtLm9wdGlvbnMubGluZVdyYXBwaW5nKSB7XG4gICAgICBjbS5kaXNwbGF5Lm1heExpbmVDaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjbS5kaXNwbGF5LmxpbmVOdW1DaGFycyA9IG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBwYWdlU2Nyb2xsWCgpIHtcbiAgICByZXR1cm4gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keSkuc2Nyb2xsTGVmdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhZ2VTY3JvbGxZKCkge1xuICAgIHJldHVybiB3aW5kb3cucGFnZVlPZmZzZXQgfHwgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5KS5zY3JvbGxUb3A7XG4gIH0gLy8gQ29udmVydHMgYSB7dG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0fSBib3ggZnJvbSBsaW5lLWxvY2FsXG4gIC8vIGNvb3JkaW5hdGVzIGludG8gYW5vdGhlciBjb29yZGluYXRlIHN5c3RlbS4gQ29udGV4dCBtYXkgYmUgb25lIG9mXG4gIC8vIFwibGluZVwiLCBcImRpdlwiIChkaXNwbGF5LmxpbmVEaXYpLCBcImxvY2FsXCIuL251bGwgKGVkaXRvciksIFwid2luZG93XCIsXG4gIC8vIG9yIFwicGFnZVwiLlxuXG5cbiAgZnVuY3Rpb24gaW50b0Nvb3JkU3lzdGVtKGNtLCBsaW5lT2JqLCByZWN0LCBjb250ZXh0LCBpbmNsdWRlV2lkZ2V0cykge1xuICAgIGlmICghaW5jbHVkZVdpZGdldHMgJiYgbGluZU9iai53aWRnZXRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVPYmoud2lkZ2V0cy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAobGluZU9iai53aWRnZXRzW2ldLmFib3ZlKSB7XG4gICAgICAgICAgdmFyIHNpemUgPSB3aWRnZXRIZWlnaHQobGluZU9iai53aWRnZXRzW2ldKTtcbiAgICAgICAgICByZWN0LnRvcCArPSBzaXplO1xuICAgICAgICAgIHJlY3QuYm90dG9tICs9IHNpemU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29udGV4dCA9PSBcImxpbmVcIikge1xuICAgICAgcmV0dXJuIHJlY3Q7XG4gICAgfVxuXG4gICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICBjb250ZXh0ID0gXCJsb2NhbFwiO1xuICAgIH1cblxuICAgIHZhciB5T2ZmID0gX2hlaWdodEF0TGluZShsaW5lT2JqKTtcblxuICAgIGlmIChjb250ZXh0ID09IFwibG9jYWxcIikge1xuICAgICAgeU9mZiArPSBwYWRkaW5nVG9wKGNtLmRpc3BsYXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB5T2ZmIC09IGNtLmRpc3BsYXkudmlld09mZnNldDtcbiAgICB9XG5cbiAgICBpZiAoY29udGV4dCA9PSBcInBhZ2VcIiB8fCBjb250ZXh0ID09IFwid2luZG93XCIpIHtcbiAgICAgIHZhciBsT2ZmID0gY20uZGlzcGxheS5saW5lU3BhY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB5T2ZmICs9IGxPZmYudG9wICsgKGNvbnRleHQgPT0gXCJ3aW5kb3dcIiA/IDAgOiBwYWdlU2Nyb2xsWSgpKTtcbiAgICAgIHZhciB4T2ZmID0gbE9mZi5sZWZ0ICsgKGNvbnRleHQgPT0gXCJ3aW5kb3dcIiA/IDAgOiBwYWdlU2Nyb2xsWCgpKTtcbiAgICAgIHJlY3QubGVmdCArPSB4T2ZmO1xuICAgICAgcmVjdC5yaWdodCArPSB4T2ZmO1xuICAgIH1cblxuICAgIHJlY3QudG9wICs9IHlPZmY7XG4gICAgcmVjdC5ib3R0b20gKz0geU9mZjtcbiAgICByZXR1cm4gcmVjdDtcbiAgfSAvLyBDb3ZlcnRzIGEgYm94IGZyb20gXCJkaXZcIiBjb29yZHMgdG8gYW5vdGhlciBjb29yZGluYXRlIHN5c3RlbS5cbiAgLy8gQ29udGV4dCBtYXkgYmUgXCJ3aW5kb3dcIiwgXCJwYWdlXCIsIFwiZGl2XCIsIG9yIFwibG9jYWxcIi4vbnVsbC5cblxuXG4gIGZ1bmN0aW9uIGZyb21Db29yZFN5c3RlbShjbSwgY29vcmRzLCBjb250ZXh0KSB7XG4gICAgaWYgKGNvbnRleHQgPT0gXCJkaXZcIikge1xuICAgICAgcmV0dXJuIGNvb3JkcztcbiAgICB9XG5cbiAgICB2YXIgbGVmdCA9IGNvb3Jkcy5sZWZ0LFxuICAgICAgICB0b3AgPSBjb29yZHMudG9wOyAvLyBGaXJzdCBtb3ZlIGludG8gXCJwYWdlXCIgY29vcmRpbmF0ZSBzeXN0ZW1cblxuICAgIGlmIChjb250ZXh0ID09IFwicGFnZVwiKSB7XG4gICAgICBsZWZ0IC09IHBhZ2VTY3JvbGxYKCk7XG4gICAgICB0b3AgLT0gcGFnZVNjcm9sbFkoKTtcbiAgICB9IGVsc2UgaWYgKGNvbnRleHQgPT0gXCJsb2NhbFwiIHx8ICFjb250ZXh0KSB7XG4gICAgICB2YXIgbG9jYWxCb3ggPSBjbS5kaXNwbGF5LnNpemVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgbGVmdCArPSBsb2NhbEJveC5sZWZ0O1xuICAgICAgdG9wICs9IGxvY2FsQm94LnRvcDtcbiAgICB9XG5cbiAgICB2YXIgbGluZVNwYWNlQm94ID0gY20uZGlzcGxheS5saW5lU3BhY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxlZnQ6IGxlZnQgLSBsaW5lU3BhY2VCb3gubGVmdCxcbiAgICAgIHRvcDogdG9wIC0gbGluZVNwYWNlQm94LnRvcFxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBfY2hhckNvb3JkcyhjbSwgcG9zLCBjb250ZXh0LCBsaW5lT2JqLCBiaWFzKSB7XG4gICAgaWYgKCFsaW5lT2JqKSB7XG4gICAgICBsaW5lT2JqID0gZ2V0TGluZShjbS5kb2MsIHBvcy5saW5lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW50b0Nvb3JkU3lzdGVtKGNtLCBsaW5lT2JqLCBtZWFzdXJlQ2hhcihjbSwgbGluZU9iaiwgcG9zLmNoLCBiaWFzKSwgY29udGV4dCk7XG4gIH0gLy8gUmV0dXJucyBhIGJveCBmb3IgYSBnaXZlbiBjdXJzb3IgcG9zaXRpb24sIHdoaWNoIG1heSBoYXZlIGFuXG4gIC8vICdvdGhlcicgcHJvcGVydHkgY29udGFpbmluZyB0aGUgcG9zaXRpb24gb2YgdGhlIHNlY29uZGFyeSBjdXJzb3JcbiAgLy8gb24gYSBiaWRpIGJvdW5kYXJ5LlxuXG5cbiAgZnVuY3Rpb24gX2N1cnNvckNvb3JkcyhjbSwgcG9zLCBjb250ZXh0LCBsaW5lT2JqLCBwcmVwYXJlZE1lYXN1cmUsIHZhckhlaWdodCkge1xuICAgIGxpbmVPYmogPSBsaW5lT2JqIHx8IGdldExpbmUoY20uZG9jLCBwb3MubGluZSk7XG5cbiAgICBpZiAoIXByZXBhcmVkTWVhc3VyZSkge1xuICAgICAgcHJlcGFyZWRNZWFzdXJlID0gcHJlcGFyZU1lYXN1cmVGb3JMaW5lKGNtLCBsaW5lT2JqKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXQoY2gsIHJpZ2h0KSB7XG4gICAgICB2YXIgbSA9IG1lYXN1cmVDaGFyUHJlcGFyZWQoY20sIHByZXBhcmVkTWVhc3VyZSwgY2gsIHJpZ2h0ID8gXCJyaWdodFwiIDogXCJsZWZ0XCIsIHZhckhlaWdodCk7XG5cbiAgICAgIGlmIChyaWdodCkge1xuICAgICAgICBtLmxlZnQgPSBtLnJpZ2h0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbS5yaWdodCA9IG0ubGVmdDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGludG9Db29yZFN5c3RlbShjbSwgbGluZU9iaiwgbSwgY29udGV4dCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QmlkaShjaCwgcGFydFBvcykge1xuICAgICAgdmFyIHBhcnQgPSBvcmRlcltwYXJ0UG9zXSxcbiAgICAgICAgICByaWdodCA9IHBhcnQubGV2ZWwgJSAyO1xuXG4gICAgICBpZiAoY2ggPT0gYmlkaUxlZnQocGFydCkgJiYgcGFydFBvcyAmJiBwYXJ0LmxldmVsIDwgb3JkZXJbcGFydFBvcyAtIDFdLmxldmVsKSB7XG4gICAgICAgIHBhcnQgPSBvcmRlclstLXBhcnRQb3NdO1xuICAgICAgICBjaCA9IGJpZGlSaWdodChwYXJ0KSAtIChwYXJ0LmxldmVsICUgMiA/IDAgOiAxKTtcbiAgICAgICAgcmlnaHQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChjaCA9PSBiaWRpUmlnaHQocGFydCkgJiYgcGFydFBvcyA8IG9yZGVyLmxlbmd0aCAtIDEgJiYgcGFydC5sZXZlbCA8IG9yZGVyW3BhcnRQb3MgKyAxXS5sZXZlbCkge1xuICAgICAgICBwYXJ0ID0gb3JkZXJbKytwYXJ0UG9zXTtcbiAgICAgICAgY2ggPSBiaWRpTGVmdChwYXJ0KSAtIHBhcnQubGV2ZWwgJSAyO1xuICAgICAgICByaWdodCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAocmlnaHQgJiYgY2ggPT0gcGFydC50byAmJiBjaCA+IHBhcnQuZnJvbSkge1xuICAgICAgICByZXR1cm4gZ2V0KGNoIC0gMSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBnZXQoY2gsIHJpZ2h0KTtcbiAgICB9XG5cbiAgICB2YXIgb3JkZXIgPSBnZXRPcmRlcihsaW5lT2JqKSxcbiAgICAgICAgY2ggPSBwb3MuY2g7XG5cbiAgICBpZiAoIW9yZGVyKSB7XG4gICAgICByZXR1cm4gZ2V0KGNoKTtcbiAgICB9XG5cbiAgICB2YXIgcGFydFBvcyA9IGdldEJpZGlQYXJ0QXQob3JkZXIsIGNoKTtcbiAgICB2YXIgdmFsID0gZ2V0QmlkaShjaCwgcGFydFBvcyk7XG5cbiAgICBpZiAoYmlkaU90aGVyICE9IG51bGwpIHtcbiAgICAgIHZhbC5vdGhlciA9IGdldEJpZGkoY2gsIGJpZGlPdGhlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbDtcbiAgfSAvLyBVc2VkIHRvIGNoZWFwbHkgZXN0aW1hdGUgdGhlIGNvb3JkaW5hdGVzIGZvciBhIHBvc2l0aW9uLiBVc2VkIGZvclxuICAvLyBpbnRlcm1lZGlhdGUgc2Nyb2xsIHVwZGF0ZXMuXG5cblxuICBmdW5jdGlvbiBlc3RpbWF0ZUNvb3JkcyhjbSwgcG9zKSB7XG4gICAgdmFyIGxlZnQgPSAwO1xuICAgIHBvcyA9IF9jbGlwUG9zKGNtLmRvYywgcG9zKTtcblxuICAgIGlmICghY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIHtcbiAgICAgIGxlZnQgPSBjaGFyV2lkdGgoY20uZGlzcGxheSkgKiBwb3MuY2g7XG4gICAgfVxuXG4gICAgdmFyIGxpbmVPYmogPSBnZXRMaW5lKGNtLmRvYywgcG9zLmxpbmUpO1xuICAgIHZhciB0b3AgPSBfaGVpZ2h0QXRMaW5lKGxpbmVPYmopICsgcGFkZGluZ1RvcChjbS5kaXNwbGF5KTtcbiAgICByZXR1cm4ge1xuICAgICAgbGVmdDogbGVmdCxcbiAgICAgIHJpZ2h0OiBsZWZ0LFxuICAgICAgdG9wOiB0b3AsXG4gICAgICBib3R0b206IHRvcCArIGxpbmVPYmouaGVpZ2h0XG4gICAgfTtcbiAgfSAvLyBQb3NpdGlvbnMgcmV0dXJuZWQgYnkgY29vcmRzQ2hhciBjb250YWluIHNvbWUgZXh0cmEgaW5mb3JtYXRpb24uXG4gIC8vIHhSZWwgaXMgdGhlIHJlbGF0aXZlIHggcG9zaXRpb24gb2YgdGhlIGlucHV0IGNvb3JkaW5hdGVzIGNvbXBhcmVkXG4gIC8vIHRvIHRoZSBmb3VuZCBwb3NpdGlvbiAoc28geFJlbCA+IDAgbWVhbnMgdGhlIGNvb3JkaW5hdGVzIGFyZSB0b1xuICAvLyB0aGUgcmlnaHQgb2YgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiwgZm9yIGV4YW1wbGUpLiBXaGVuIG91dHNpZGVcbiAgLy8gaXMgdHJ1ZSwgdGhhdCBtZWFucyB0aGUgY29vcmRpbmF0ZXMgbGllIG91dHNpZGUgdGhlIGxpbmUnc1xuICAvLyB2ZXJ0aWNhbCByYW5nZS5cblxuXG4gIGZ1bmN0aW9uIFBvc1dpdGhJbmZvKGxpbmUsIGNoLCBvdXRzaWRlLCB4UmVsKSB7XG4gICAgdmFyIHBvcyA9IFBvcyhsaW5lLCBjaCk7XG4gICAgcG9zLnhSZWwgPSB4UmVsO1xuXG4gICAgaWYgKG91dHNpZGUpIHtcbiAgICAgIHBvcy5vdXRzaWRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcG9zO1xuICB9IC8vIENvbXB1dGUgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiBjbG9zZXN0IHRvIHRoZSBnaXZlbiBjb29yZGluYXRlcy5cbiAgLy8gSW5wdXQgbXVzdCBiZSBsaW5lU3BhY2UtbG9jYWwgKFwiZGl2XCIgY29vcmRpbmF0ZSBzeXN0ZW0pLlxuXG5cbiAgZnVuY3Rpb24gX2Nvb3Jkc0NoYXIoY20sIHgsIHkpIHtcbiAgICB2YXIgZG9jID0gY20uZG9jO1xuICAgIHkgKz0gY20uZGlzcGxheS52aWV3T2Zmc2V0O1xuXG4gICAgaWYgKHkgPCAwKSB7XG4gICAgICByZXR1cm4gUG9zV2l0aEluZm8oZG9jLmZpcnN0LCAwLCB0cnVlLCAtMSk7XG4gICAgfVxuXG4gICAgdmFyIGxpbmVOID0gX2xpbmVBdEhlaWdodChkb2MsIHkpLFxuICAgICAgICBsYXN0ID0gZG9jLmZpcnN0ICsgZG9jLnNpemUgLSAxO1xuXG4gICAgaWYgKGxpbmVOID4gbGFzdCkge1xuICAgICAgcmV0dXJuIFBvc1dpdGhJbmZvKGRvYy5maXJzdCArIGRvYy5zaXplIC0gMSwgZ2V0TGluZShkb2MsIGxhc3QpLnRleHQubGVuZ3RoLCB0cnVlLCAxKTtcbiAgICB9XG5cbiAgICBpZiAoeCA8IDApIHtcbiAgICAgIHggPSAwO1xuICAgIH1cblxuICAgIHZhciBsaW5lT2JqID0gZ2V0TGluZShkb2MsIGxpbmVOKTtcblxuICAgIGZvciAoOzspIHtcbiAgICAgIHZhciBmb3VuZCA9IGNvb3Jkc0NoYXJJbm5lcihjbSwgbGluZU9iaiwgbGluZU4sIHgsIHkpO1xuICAgICAgdmFyIG1lcmdlZCA9IGNvbGxhcHNlZFNwYW5BdEVuZChsaW5lT2JqKTtcbiAgICAgIHZhciBtZXJnZWRQb3MgPSBtZXJnZWQgJiYgbWVyZ2VkLmZpbmQoMCwgdHJ1ZSk7XG5cbiAgICAgIGlmIChtZXJnZWQgJiYgKGZvdW5kLmNoID4gbWVyZ2VkUG9zLmZyb20uY2ggfHwgZm91bmQuY2ggPT0gbWVyZ2VkUG9zLmZyb20uY2ggJiYgZm91bmQueFJlbCA+IDApKSB7XG4gICAgICAgIGxpbmVOID0gbGluZU5vKGxpbmVPYmogPSBtZXJnZWRQb3MudG8ubGluZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY29vcmRzQ2hhcklubmVyKGNtLCBsaW5lT2JqLCBsaW5lTm8sIHgsIHkpIHtcbiAgICB2YXIgaW5uZXJPZmYgPSB5IC0gX2hlaWdodEF0TGluZShsaW5lT2JqKTtcblxuICAgIHZhciB3cm9uZ0xpbmUgPSBmYWxzZSxcbiAgICAgICAgYWRqdXN0ID0gMiAqIGNtLmRpc3BsYXkud3JhcHBlci5jbGllbnRXaWR0aDtcbiAgICB2YXIgcHJlcGFyZWRNZWFzdXJlID0gcHJlcGFyZU1lYXN1cmVGb3JMaW5lKGNtLCBsaW5lT2JqKTtcblxuICAgIGZ1bmN0aW9uIGdldFgoY2gpIHtcbiAgICAgIHZhciBzcCA9IF9jdXJzb3JDb29yZHMoY20sIFBvcyhsaW5lTm8sIGNoKSwgXCJsaW5lXCIsIGxpbmVPYmosIHByZXBhcmVkTWVhc3VyZSk7XG5cbiAgICAgIHdyb25nTGluZSA9IHRydWU7XG5cbiAgICAgIGlmIChpbm5lck9mZiA+IHNwLmJvdHRvbSkge1xuICAgICAgICByZXR1cm4gc3AubGVmdCAtIGFkanVzdDtcbiAgICAgIH0gZWxzZSBpZiAoaW5uZXJPZmYgPCBzcC50b3ApIHtcbiAgICAgICAgcmV0dXJuIHNwLmxlZnQgKyBhZGp1c3Q7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3cm9uZ0xpbmUgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNwLmxlZnQ7XG4gICAgfVxuXG4gICAgdmFyIGJpZGkgPSBnZXRPcmRlcihsaW5lT2JqKSxcbiAgICAgICAgZGlzdCA9IGxpbmVPYmoudGV4dC5sZW5ndGg7XG4gICAgdmFyIGZyb20gPSBsaW5lTGVmdChsaW5lT2JqKSxcbiAgICAgICAgdG8gPSBsaW5lUmlnaHQobGluZU9iaik7XG4gICAgdmFyIGZyb21YID0gZ2V0WChmcm9tKSxcbiAgICAgICAgZnJvbU91dHNpZGUgPSB3cm9uZ0xpbmUsXG4gICAgICAgIHRvWCA9IGdldFgodG8pLFxuICAgICAgICB0b091dHNpZGUgPSB3cm9uZ0xpbmU7XG5cbiAgICBpZiAoeCA+IHRvWCkge1xuICAgICAgcmV0dXJuIFBvc1dpdGhJbmZvKGxpbmVObywgdG8sIHRvT3V0c2lkZSwgMSk7XG4gICAgfSAvLyBEbyBhIGJpbmFyeSBzZWFyY2ggYmV0d2VlbiB0aGVzZSBib3VuZHMuXG5cblxuICAgIGZvciAoOzspIHtcbiAgICAgIGlmIChiaWRpID8gdG8gPT0gZnJvbSB8fCB0byA9PSBtb3ZlVmlzdWFsbHkobGluZU9iaiwgZnJvbSwgMSkgOiB0byAtIGZyb20gPD0gMSkge1xuICAgICAgICB2YXIgY2ggPSB4IDwgZnJvbVggfHwgeCAtIGZyb21YIDw9IHRvWCAtIHggPyBmcm9tIDogdG87XG4gICAgICAgIHZhciBvdXRzaWRlID0gY2ggPT0gZnJvbSA/IGZyb21PdXRzaWRlIDogdG9PdXRzaWRlO1xuICAgICAgICB2YXIgeERpZmYgPSB4IC0gKGNoID09IGZyb20gPyBmcm9tWCA6IHRvWCk7IC8vIFRoaXMgaXMgYSBrbHVkZ2UgdG8gaGFuZGxlIHRoZSBjYXNlIHdoZXJlIHRoZSBjb29yZGluYXRlc1xuICAgICAgICAvLyBhcmUgYWZ0ZXIgYSBsaW5lLXdyYXBwZWQgbGluZS4gV2Ugc2hvdWxkIHJlcGxhY2UgaXQgd2l0aCBhXG4gICAgICAgIC8vIG1vcmUgZ2VuZXJhbCBoYW5kbGluZyBvZiBjdXJzb3IgcG9zaXRpb25zIGFyb3VuZCBsaW5lXG4gICAgICAgIC8vIGJyZWFrcy4gKElzc3VlICM0MDc4KVxuXG4gICAgICAgIGlmICh0b091dHNpZGUgJiYgIWJpZGkgJiYgIS9cXHMvLnRlc3QobGluZU9iai50ZXh0LmNoYXJBdChjaCkpICYmIHhEaWZmID4gMCAmJiBjaCA8IGxpbmVPYmoudGV4dC5sZW5ndGggJiYgcHJlcGFyZWRNZWFzdXJlLnZpZXcubWVhc3VyZS5oZWlnaHRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICB2YXIgY2hhclNpemUgPSBtZWFzdXJlQ2hhclByZXBhcmVkKGNtLCBwcmVwYXJlZE1lYXN1cmUsIGNoLCBcInJpZ2h0XCIpO1xuXG4gICAgICAgICAgaWYgKGlubmVyT2ZmIDw9IGNoYXJTaXplLmJvdHRvbSAmJiBpbm5lck9mZiA+PSBjaGFyU2l6ZS50b3AgJiYgTWF0aC5hYnMoeCAtIGNoYXJTaXplLnJpZ2h0KSA8IHhEaWZmKSB7XG4gICAgICAgICAgICBvdXRzaWRlID0gZmFsc2U7XG4gICAgICAgICAgICBjaCsrO1xuICAgICAgICAgICAgeERpZmYgPSB4IC0gY2hhclNpemUucmlnaHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKGlzRXh0ZW5kaW5nQ2hhcihsaW5lT2JqLnRleHQuY2hhckF0KGNoKSkpIHtcbiAgICAgICAgICArK2NoO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBvcyA9IFBvc1dpdGhJbmZvKGxpbmVObywgY2gsIG91dHNpZGUsIHhEaWZmIDwgLTEgPyAtMSA6IHhEaWZmID4gMSA/IDEgOiAwKTtcbiAgICAgICAgcmV0dXJuIHBvcztcbiAgICAgIH1cblxuICAgICAgdmFyIHN0ZXAgPSBNYXRoLmNlaWwoZGlzdCAvIDIpLFxuICAgICAgICAgIG1pZGRsZSA9IGZyb20gKyBzdGVwO1xuXG4gICAgICBpZiAoYmlkaSkge1xuICAgICAgICBtaWRkbGUgPSBmcm9tO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RlcDsgKytpKSB7XG4gICAgICAgICAgbWlkZGxlID0gbW92ZVZpc3VhbGx5KGxpbmVPYmosIG1pZGRsZSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIG1pZGRsZVggPSBnZXRYKG1pZGRsZSk7XG5cbiAgICAgIGlmIChtaWRkbGVYID4geCkge1xuICAgICAgICB0byA9IG1pZGRsZTtcbiAgICAgICAgdG9YID0gbWlkZGxlWDtcblxuICAgICAgICBpZiAodG9PdXRzaWRlID0gd3JvbmdMaW5lKSB7XG4gICAgICAgICAgdG9YICs9IDEwMDA7XG4gICAgICAgIH1cblxuICAgICAgICBkaXN0ID0gc3RlcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZyb20gPSBtaWRkbGU7XG4gICAgICAgIGZyb21YID0gbWlkZGxlWDtcbiAgICAgICAgZnJvbU91dHNpZGUgPSB3cm9uZ0xpbmU7XG4gICAgICAgIGRpc3QgLT0gc3RlcDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgbWVhc3VyZVRleHQ7IC8vIENvbXB1dGUgdGhlIGRlZmF1bHQgdGV4dCBoZWlnaHQuXG5cbiAgZnVuY3Rpb24gdGV4dEhlaWdodChkaXNwbGF5KSB7XG4gICAgaWYgKGRpc3BsYXkuY2FjaGVkVGV4dEhlaWdodCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gZGlzcGxheS5jYWNoZWRUZXh0SGVpZ2h0O1xuICAgIH1cblxuICAgIGlmIChtZWFzdXJlVGV4dCA9PSBudWxsKSB7XG4gICAgICBtZWFzdXJlVGV4dCA9IGVsdChcInByZVwiKTsgLy8gTWVhc3VyZSBhIGJ1bmNoIG9mIGxpbmVzLCBmb3IgYnJvd3NlcnMgdGhhdCBjb21wdXRlXG4gICAgICAvLyBmcmFjdGlvbmFsIGhlaWdodHMuXG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDk7ICsraSkge1xuICAgICAgICBtZWFzdXJlVGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcInhcIikpO1xuICAgICAgICBtZWFzdXJlVGV4dC5hcHBlbmRDaGlsZChlbHQoXCJiclwiKSk7XG4gICAgICB9XG5cbiAgICAgIG1lYXN1cmVUZXh0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwieFwiKSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQoZGlzcGxheS5tZWFzdXJlLCBtZWFzdXJlVGV4dCk7XG4gICAgdmFyIGhlaWdodCA9IG1lYXN1cmVUZXh0Lm9mZnNldEhlaWdodCAvIDUwO1xuXG4gICAgaWYgKGhlaWdodCA+IDMpIHtcbiAgICAgIGRpc3BsYXkuY2FjaGVkVGV4dEhlaWdodCA9IGhlaWdodDtcbiAgICB9XG5cbiAgICByZW1vdmVDaGlsZHJlbihkaXNwbGF5Lm1lYXN1cmUpO1xuICAgIHJldHVybiBoZWlnaHQgfHwgMTtcbiAgfSAvLyBDb21wdXRlIHRoZSBkZWZhdWx0IGNoYXJhY3RlciB3aWR0aC5cblxuXG4gIGZ1bmN0aW9uIGNoYXJXaWR0aChkaXNwbGF5KSB7XG4gICAgaWYgKGRpc3BsYXkuY2FjaGVkQ2hhcldpZHRoICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBkaXNwbGF5LmNhY2hlZENoYXJXaWR0aDtcbiAgICB9XG5cbiAgICB2YXIgYW5jaG9yID0gZWx0KFwic3BhblwiLCBcInh4eHh4eHh4eHhcIik7XG4gICAgdmFyIHByZSA9IGVsdChcInByZVwiLCBbYW5jaG9yXSk7XG4gICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQoZGlzcGxheS5tZWFzdXJlLCBwcmUpO1xuICAgIHZhciByZWN0ID0gYW5jaG9yLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICB3aWR0aCA9IChyZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0KSAvIDEwO1xuXG4gICAgaWYgKHdpZHRoID4gMikge1xuICAgICAgZGlzcGxheS5jYWNoZWRDaGFyV2lkdGggPSB3aWR0aDtcbiAgICB9XG5cbiAgICByZXR1cm4gd2lkdGggfHwgMTA7XG4gIH0gLy8gRG8gYSBidWxrLXJlYWQgb2YgdGhlIERPTSBwb3NpdGlvbnMgYW5kIHNpemVzIG5lZWRlZCB0byBkcmF3IHRoZVxuICAvLyB2aWV3LCBzbyB0aGF0IHdlIGRvbid0IGludGVybGVhdmUgcmVhZGluZyBhbmQgd3JpdGluZyB0byB0aGUgRE9NLlxuXG5cbiAgZnVuY3Rpb24gZ2V0RGltZW5zaW9ucyhjbSkge1xuICAgIHZhciBkID0gY20uZGlzcGxheSxcbiAgICAgICAgbGVmdCA9IHt9LFxuICAgICAgICB3aWR0aCA9IHt9O1xuICAgIHZhciBndXR0ZXJMZWZ0ID0gZC5ndXR0ZXJzLmNsaWVudExlZnQ7XG5cbiAgICBmb3IgKHZhciBuID0gZC5ndXR0ZXJzLmZpcnN0Q2hpbGQsIGkgPSAwOyBuOyBuID0gbi5uZXh0U2libGluZywgKytpKSB7XG4gICAgICBsZWZ0W2NtLm9wdGlvbnMuZ3V0dGVyc1tpXV0gPSBuLm9mZnNldExlZnQgKyBuLmNsaWVudExlZnQgKyBndXR0ZXJMZWZ0O1xuICAgICAgd2lkdGhbY20ub3B0aW9ucy5ndXR0ZXJzW2ldXSA9IG4uY2xpZW50V2lkdGg7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGZpeGVkUG9zOiBjb21wZW5zYXRlRm9ySFNjcm9sbChkKSxcbiAgICAgIGd1dHRlclRvdGFsV2lkdGg6IGQuZ3V0dGVycy5vZmZzZXRXaWR0aCxcbiAgICAgIGd1dHRlckxlZnQ6IGxlZnQsXG4gICAgICBndXR0ZXJXaWR0aDogd2lkdGgsXG4gICAgICB3cmFwcGVyV2lkdGg6IGQud3JhcHBlci5jbGllbnRXaWR0aFxuICAgIH07XG4gIH0gLy8gQ29tcHV0ZXMgZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0ICsgZGlzcGxheS5ndXR0ZXJzLm9mZnNldFdpZHRoLFxuICAvLyBidXQgdXNpbmcgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IHRvIGdldCBhIHN1Yi1waXhlbC1hY2N1cmF0ZVxuICAvLyByZXN1bHQuXG5cblxuICBmdW5jdGlvbiBjb21wZW5zYXRlRm9ySFNjcm9sbChkaXNwbGF5KSB7XG4gICAgcmV0dXJuIGRpc3BsYXkuc2Nyb2xsZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCAtIGRpc3BsYXkuc2l6ZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcbiAgfSAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBlc3RpbWF0ZXMgdGhlIGhlaWdodCBvZiBhIGxpbmUsIHRvIHVzZSBhc1xuICAvLyBmaXJzdCBhcHByb3hpbWF0aW9uIHVudGlsIHRoZSBsaW5lIGJlY29tZXMgdmlzaWJsZSAoYW5kIGlzIHRodXNcbiAgLy8gcHJvcGVybHkgbWVhc3VyYWJsZSkuXG5cblxuICBmdW5jdGlvbiBlc3RpbWF0ZUhlaWdodChjbSkge1xuICAgIHZhciB0aCA9IHRleHRIZWlnaHQoY20uZGlzcGxheSksXG4gICAgICAgIHdyYXBwaW5nID0gY20ub3B0aW9ucy5saW5lV3JhcHBpbmc7XG4gICAgdmFyIHBlckxpbmUgPSB3cmFwcGluZyAmJiBNYXRoLm1heCg1LCBjbS5kaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoIC8gY2hhcldpZHRoKGNtLmRpc3BsYXkpIC0gMyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICBpZiAobGluZUlzSGlkZGVuKGNtLmRvYywgbGluZSkpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIHZhciB3aWRnZXRzSGVpZ2h0ID0gMDtcblxuICAgICAgaWYgKGxpbmUud2lkZ2V0cykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmUud2lkZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChsaW5lLndpZGdldHNbaV0uaGVpZ2h0KSB7XG4gICAgICAgICAgICB3aWRnZXRzSGVpZ2h0ICs9IGxpbmUud2lkZ2V0c1tpXS5oZWlnaHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh3cmFwcGluZykge1xuICAgICAgICByZXR1cm4gd2lkZ2V0c0hlaWdodCArIChNYXRoLmNlaWwobGluZS50ZXh0Lmxlbmd0aCAvIHBlckxpbmUpIHx8IDEpICogdGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gd2lkZ2V0c0hlaWdodCArIHRoO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBlc3RpbWF0ZUxpbmVIZWlnaHRzKGNtKSB7XG4gICAgdmFyIGRvYyA9IGNtLmRvYyxcbiAgICAgICAgZXN0ID0gZXN0aW1hdGVIZWlnaHQoY20pO1xuICAgIGRvYy5pdGVyKGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICB2YXIgZXN0SGVpZ2h0ID0gZXN0KGxpbmUpO1xuXG4gICAgICBpZiAoZXN0SGVpZ2h0ICE9IGxpbmUuaGVpZ2h0KSB7XG4gICAgICAgIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgZXN0SGVpZ2h0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSAvLyBHaXZlbiBhIG1vdXNlIGV2ZW50LCBmaW5kIHRoZSBjb3JyZXNwb25kaW5nIHBvc2l0aW9uLiBJZiBsaWJlcmFsXG4gIC8vIGlzIGZhbHNlLCBpdCBjaGVja3Mgd2hldGhlciBhIGd1dHRlciBvciBzY3JvbGxiYXIgd2FzIGNsaWNrZWQsXG4gIC8vIGFuZCByZXR1cm5zIG51bGwgaWYgaXQgd2FzLiBmb3JSZWN0IGlzIHVzZWQgYnkgcmVjdGFuZ3VsYXJcbiAgLy8gc2VsZWN0aW9ucywgYW5kIHRyaWVzIHRvIGVzdGltYXRlIGEgY2hhcmFjdGVyIHBvc2l0aW9uIGV2ZW4gZm9yXG4gIC8vIGNvb3JkaW5hdGVzIGJleW9uZCB0aGUgcmlnaHQgb2YgdGhlIHRleHQuXG5cblxuICBmdW5jdGlvbiBwb3NGcm9tTW91c2UoY20sIGUsIGxpYmVyYWwsIGZvclJlY3QpIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG5cbiAgICBpZiAoIWxpYmVyYWwgJiYgZV90YXJnZXQoZSkuZ2V0QXR0cmlidXRlKFwiY20tbm90LWNvbnRlbnRcIikgPT0gXCJ0cnVlXCIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciB4LFxuICAgICAgICB5LFxuICAgICAgICBzcGFjZSA9IGRpc3BsYXkubGluZVNwYWNlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpOyAvLyBGYWlscyB1bnByZWRpY3RhYmx5IG9uIElFWzY3XSB3aGVuIG1vdXNlIGlzIGRyYWdnZWQgYXJvdW5kIHF1aWNrbHkuXG5cbiAgICB0cnkge1xuICAgICAgeCA9IGUuY2xpZW50WCAtIHNwYWNlLmxlZnQ7XG4gICAgICB5ID0gZS5jbGllbnRZIC0gc3BhY2UudG9wO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBjb29yZHMgPSBfY29vcmRzQ2hhcihjbSwgeCwgeSksXG4gICAgICAgIGxpbmU7XG5cbiAgICBpZiAoZm9yUmVjdCAmJiBjb29yZHMueFJlbCA9PSAxICYmIChsaW5lID0gZ2V0TGluZShjbS5kb2MsIGNvb3Jkcy5saW5lKS50ZXh0KS5sZW5ndGggPT0gY29vcmRzLmNoKSB7XG4gICAgICB2YXIgY29sRGlmZiA9IGNvdW50Q29sdW1uKGxpbmUsIGxpbmUubGVuZ3RoLCBjbS5vcHRpb25zLnRhYlNpemUpIC0gbGluZS5sZW5ndGg7XG4gICAgICBjb29yZHMgPSBQb3MoY29vcmRzLmxpbmUsIE1hdGgubWF4KDAsIE1hdGgucm91bmQoKHggLSBwYWRkaW5nSChjbS5kaXNwbGF5KS5sZWZ0KSAvIGNoYXJXaWR0aChjbS5kaXNwbGF5KSkgLSBjb2xEaWZmKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvb3JkcztcbiAgfSAvLyBGaW5kIHRoZSB2aWV3IGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byBhIGdpdmVuIGxpbmUuIFJldHVybiBudWxsXG4gIC8vIHdoZW4gdGhlIGxpbmUgaXNuJ3QgdmlzaWJsZS5cblxuXG4gIGZ1bmN0aW9uIGZpbmRWaWV3SW5kZXgoY20sIG4pIHtcbiAgICBpZiAobiA+PSBjbS5kaXNwbGF5LnZpZXdUbykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbiAtPSBjbS5kaXNwbGF5LnZpZXdGcm9tO1xuXG4gICAgaWYgKG4gPCAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgdmlldyA9IGNtLmRpc3BsYXkudmlldztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgbiAtPSB2aWV3W2ldLnNpemU7XG5cbiAgICAgIGlmIChuIDwgMCkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVTZWxlY3Rpb24oY20pIHtcbiAgICBjbS5kaXNwbGF5LmlucHV0LnNob3dTZWxlY3Rpb24oY20uZGlzcGxheS5pbnB1dC5wcmVwYXJlU2VsZWN0aW9uKCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJlcGFyZVNlbGVjdGlvbihjbSwgcHJpbWFyeSkge1xuICAgIHZhciBkb2MgPSBjbS5kb2MsXG4gICAgICAgIHJlc3VsdCA9IHt9O1xuICAgIHZhciBjdXJGcmFnbWVudCA9IHJlc3VsdC5jdXJzb3JzID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIHZhciBzZWxGcmFnbWVudCA9IHJlc3VsdC5zZWxlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRvYy5zZWwucmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocHJpbWFyeSA9PT0gZmFsc2UgJiYgaSA9PSBkb2Muc2VsLnByaW1JbmRleCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJhbmdlID0gZG9jLnNlbC5yYW5nZXNbaV07XG5cbiAgICAgIGlmIChyYW5nZS5mcm9tKCkubGluZSA+PSBjbS5kaXNwbGF5LnZpZXdUbyB8fCByYW5nZS50bygpLmxpbmUgPCBjbS5kaXNwbGF5LnZpZXdGcm9tKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29sbGFwc2VkID0gcmFuZ2UuZW1wdHkoKTtcblxuICAgICAgaWYgKGNvbGxhcHNlZCB8fCBjbS5vcHRpb25zLnNob3dDdXJzb3JXaGVuU2VsZWN0aW5nKSB7XG4gICAgICAgIGRyYXdTZWxlY3Rpb25DdXJzb3IoY20sIHJhbmdlLmhlYWQsIGN1ckZyYWdtZW50KTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFjb2xsYXBzZWQpIHtcbiAgICAgICAgZHJhd1NlbGVjdGlvblJhbmdlKGNtLCByYW5nZSwgc2VsRnJhZ21lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gLy8gRHJhd3MgYSBjdXJzb3IgZm9yIHRoZSBnaXZlbiByYW5nZVxuXG5cbiAgZnVuY3Rpb24gZHJhd1NlbGVjdGlvbkN1cnNvcihjbSwgaGVhZCwgb3V0cHV0KSB7XG4gICAgdmFyIHBvcyA9IF9jdXJzb3JDb29yZHMoY20sIGhlYWQsIFwiZGl2XCIsIG51bGwsIG51bGwsICFjbS5vcHRpb25zLnNpbmdsZUN1cnNvckhlaWdodFBlckxpbmUpO1xuXG4gICAgdmFyIGN1cnNvciA9IG91dHB1dC5hcHBlbmRDaGlsZChlbHQoXCJkaXZcIiwgXCJcXHhBMFwiLCBcIkNvZGVNaXJyb3ItY3Vyc29yXCIpKTtcbiAgICBjdXJzb3Iuc3R5bGUubGVmdCA9IHBvcy5sZWZ0ICsgXCJweFwiO1xuICAgIGN1cnNvci5zdHlsZS50b3AgPSBwb3MudG9wICsgXCJweFwiO1xuICAgIGN1cnNvci5zdHlsZS5oZWlnaHQgPSBNYXRoLm1heCgwLCBwb3MuYm90dG9tIC0gcG9zLnRvcCkgKiBjbS5vcHRpb25zLmN1cnNvckhlaWdodCArIFwicHhcIjtcblxuICAgIGlmIChwb3Mub3RoZXIpIHtcbiAgICAgIC8vIFNlY29uZGFyeSBjdXJzb3IsIHNob3duIHdoZW4gb24gYSAnanVtcCcgaW4gYmktZGlyZWN0aW9uYWwgdGV4dFxuICAgICAgdmFyIG90aGVyQ3Vyc29yID0gb3V0cHV0LmFwcGVuZENoaWxkKGVsdChcImRpdlwiLCBcIlxceEEwXCIsIFwiQ29kZU1pcnJvci1jdXJzb3IgQ29kZU1pcnJvci1zZWNvbmRhcnljdXJzb3JcIikpO1xuICAgICAgb3RoZXJDdXJzb3Iuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICBvdGhlckN1cnNvci5zdHlsZS5sZWZ0ID0gcG9zLm90aGVyLmxlZnQgKyBcInB4XCI7XG4gICAgICBvdGhlckN1cnNvci5zdHlsZS50b3AgPSBwb3Mub3RoZXIudG9wICsgXCJweFwiO1xuICAgICAgb3RoZXJDdXJzb3Iuc3R5bGUuaGVpZ2h0ID0gKHBvcy5vdGhlci5ib3R0b20gLSBwb3Mub3RoZXIudG9wKSAqIC44NSArIFwicHhcIjtcbiAgICB9XG4gIH0gLy8gRHJhd3MgdGhlIGdpdmVuIHJhbmdlIGFzIGEgaGlnaGxpZ2h0ZWQgc2VsZWN0aW9uXG5cblxuICBmdW5jdGlvbiBkcmF3U2VsZWN0aW9uUmFuZ2UoY20sIHJhbmdlLCBvdXRwdXQpIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksXG4gICAgICAgIGRvYyA9IGNtLmRvYztcbiAgICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgdmFyIHBhZGRpbmcgPSBwYWRkaW5nSChjbS5kaXNwbGF5KSxcbiAgICAgICAgbGVmdFNpZGUgPSBwYWRkaW5nLmxlZnQ7XG4gICAgdmFyIHJpZ2h0U2lkZSA9IE1hdGgubWF4KGRpc3BsYXkuc2l6ZXJXaWR0aCwgZGlzcGxheVdpZHRoKGNtKSAtIGRpc3BsYXkuc2l6ZXIub2Zmc2V0TGVmdCkgLSBwYWRkaW5nLnJpZ2h0O1xuXG4gICAgZnVuY3Rpb24gYWRkKGxlZnQsIHRvcCwgd2lkdGgsIGJvdHRvbSkge1xuICAgICAgaWYgKHRvcCA8IDApIHtcbiAgICAgICAgdG9wID0gMDtcbiAgICAgIH1cblxuICAgICAgdG9wID0gTWF0aC5yb3VuZCh0b3ApO1xuICAgICAgYm90dG9tID0gTWF0aC5yb3VuZChib3R0b20pO1xuICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1zZWxlY3RlZFwiLCBcInBvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogXCIgKyBsZWZ0ICsgXCJweDtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogXCIgKyB0b3AgKyBcInB4OyB3aWR0aDogXCIgKyAod2lkdGggPT0gbnVsbCA/IHJpZ2h0U2lkZSAtIGxlZnQgOiB3aWR0aCkgKyBcInB4O1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBcIiArIChib3R0b20gLSB0b3ApICsgXCJweFwiKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhd0ZvckxpbmUobGluZSwgZnJvbUFyZywgdG9BcmcpIHtcbiAgICAgIHZhciBsaW5lT2JqID0gZ2V0TGluZShkb2MsIGxpbmUpO1xuICAgICAgdmFyIGxpbmVMZW4gPSBsaW5lT2JqLnRleHQubGVuZ3RoO1xuICAgICAgdmFyIHN0YXJ0LCBlbmQ7XG5cbiAgICAgIGZ1bmN0aW9uIGNvb3JkcyhjaCwgYmlhcykge1xuICAgICAgICByZXR1cm4gX2NoYXJDb29yZHMoY20sIFBvcyhsaW5lLCBjaCksIFwiZGl2XCIsIGxpbmVPYmosIGJpYXMpO1xuICAgICAgfVxuXG4gICAgICBpdGVyYXRlQmlkaVNlY3Rpb25zKGdldE9yZGVyKGxpbmVPYmopLCBmcm9tQXJnIHx8IDAsIHRvQXJnID09IG51bGwgPyBsaW5lTGVuIDogdG9BcmcsIGZ1bmN0aW9uIChmcm9tLCB0bywgZGlyKSB7XG4gICAgICAgIHZhciBsZWZ0UG9zID0gY29vcmRzKGZyb20sIFwibGVmdFwiKSxcbiAgICAgICAgICAgIHJpZ2h0UG9zLFxuICAgICAgICAgICAgbGVmdCxcbiAgICAgICAgICAgIHJpZ2h0O1xuXG4gICAgICAgIGlmIChmcm9tID09IHRvKSB7XG4gICAgICAgICAgcmlnaHRQb3MgPSBsZWZ0UG9zO1xuICAgICAgICAgIGxlZnQgPSByaWdodCA9IGxlZnRQb3MubGVmdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByaWdodFBvcyA9IGNvb3Jkcyh0byAtIDEsIFwicmlnaHRcIik7XG5cbiAgICAgICAgICBpZiAoZGlyID09IFwicnRsXCIpIHtcbiAgICAgICAgICAgIHZhciB0bXAgPSBsZWZ0UG9zO1xuICAgICAgICAgICAgbGVmdFBvcyA9IHJpZ2h0UG9zO1xuICAgICAgICAgICAgcmlnaHRQb3MgPSB0bXA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGVmdCA9IGxlZnRQb3MubGVmdDtcbiAgICAgICAgICByaWdodCA9IHJpZ2h0UG9zLnJpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZyb21BcmcgPT0gbnVsbCAmJiBmcm9tID09IDApIHtcbiAgICAgICAgICBsZWZ0ID0gbGVmdFNpZGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmlnaHRQb3MudG9wIC0gbGVmdFBvcy50b3AgPiAzKSB7XG4gICAgICAgICAgLy8gRGlmZmVyZW50IGxpbmVzLCBkcmF3IHRvcCBwYXJ0XG4gICAgICAgICAgYWRkKGxlZnQsIGxlZnRQb3MudG9wLCBudWxsLCBsZWZ0UG9zLmJvdHRvbSk7XG4gICAgICAgICAgbGVmdCA9IGxlZnRTaWRlO1xuXG4gICAgICAgICAgaWYgKGxlZnRQb3MuYm90dG9tIDwgcmlnaHRQb3MudG9wKSB7XG4gICAgICAgICAgICBhZGQobGVmdCwgbGVmdFBvcy5ib3R0b20sIG51bGwsIHJpZ2h0UG9zLnRvcCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRvQXJnID09IG51bGwgJiYgdG8gPT0gbGluZUxlbikge1xuICAgICAgICAgIHJpZ2h0ID0gcmlnaHRTaWRlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzdGFydCB8fCBsZWZ0UG9zLnRvcCA8IHN0YXJ0LnRvcCB8fCBsZWZ0UG9zLnRvcCA9PSBzdGFydC50b3AgJiYgbGVmdFBvcy5sZWZ0IDwgc3RhcnQubGVmdCkge1xuICAgICAgICAgIHN0YXJ0ID0gbGVmdFBvcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZW5kIHx8IHJpZ2h0UG9zLmJvdHRvbSA+IGVuZC5ib3R0b20gfHwgcmlnaHRQb3MuYm90dG9tID09IGVuZC5ib3R0b20gJiYgcmlnaHRQb3MucmlnaHQgPiBlbmQucmlnaHQpIHtcbiAgICAgICAgICBlbmQgPSByaWdodFBvcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsZWZ0IDwgbGVmdFNpZGUgKyAxKSB7XG4gICAgICAgICAgbGVmdCA9IGxlZnRTaWRlO1xuICAgICAgICB9XG5cbiAgICAgICAgYWRkKGxlZnQsIHJpZ2h0UG9zLnRvcCwgcmlnaHQgLSBsZWZ0LCByaWdodFBvcy5ib3R0b20pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgIGVuZDogZW5kXG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBzRnJvbSA9IHJhbmdlLmZyb20oKSxcbiAgICAgICAgc1RvID0gcmFuZ2UudG8oKTtcblxuICAgIGlmIChzRnJvbS5saW5lID09IHNUby5saW5lKSB7XG4gICAgICBkcmF3Rm9yTGluZShzRnJvbS5saW5lLCBzRnJvbS5jaCwgc1RvLmNoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGZyb21MaW5lID0gZ2V0TGluZShkb2MsIHNGcm9tLmxpbmUpLFxuICAgICAgICAgIHRvTGluZSA9IGdldExpbmUoZG9jLCBzVG8ubGluZSk7XG4gICAgICB2YXIgc2luZ2xlVkxpbmUgPSB2aXN1YWxMaW5lKGZyb21MaW5lKSA9PSB2aXN1YWxMaW5lKHRvTGluZSk7XG4gICAgICB2YXIgbGVmdEVuZCA9IGRyYXdGb3JMaW5lKHNGcm9tLmxpbmUsIHNGcm9tLmNoLCBzaW5nbGVWTGluZSA/IGZyb21MaW5lLnRleHQubGVuZ3RoICsgMSA6IG51bGwpLmVuZDtcbiAgICAgIHZhciByaWdodFN0YXJ0ID0gZHJhd0ZvckxpbmUoc1RvLmxpbmUsIHNpbmdsZVZMaW5lID8gMCA6IG51bGwsIHNUby5jaCkuc3RhcnQ7XG5cbiAgICAgIGlmIChzaW5nbGVWTGluZSkge1xuICAgICAgICBpZiAobGVmdEVuZC50b3AgPCByaWdodFN0YXJ0LnRvcCAtIDIpIHtcbiAgICAgICAgICBhZGQobGVmdEVuZC5yaWdodCwgbGVmdEVuZC50b3AsIG51bGwsIGxlZnRFbmQuYm90dG9tKTtcbiAgICAgICAgICBhZGQobGVmdFNpZGUsIHJpZ2h0U3RhcnQudG9wLCByaWdodFN0YXJ0LmxlZnQsIHJpZ2h0U3RhcnQuYm90dG9tKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhZGQobGVmdEVuZC5yaWdodCwgbGVmdEVuZC50b3AsIHJpZ2h0U3RhcnQubGVmdCAtIGxlZnRFbmQucmlnaHQsIGxlZnRFbmQuYm90dG9tKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobGVmdEVuZC5ib3R0b20gPCByaWdodFN0YXJ0LnRvcCkge1xuICAgICAgICBhZGQobGVmdFNpZGUsIGxlZnRFbmQuYm90dG9tLCBudWxsLCByaWdodFN0YXJ0LnRvcCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb3V0cHV0LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgfSAvLyBDdXJzb3ItYmxpbmtpbmdcblxuXG4gIGZ1bmN0aW9uIHJlc3RhcnRCbGluayhjbSkge1xuICAgIGlmICghY20uc3RhdGUuZm9jdXNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgICBjbGVhckludGVydmFsKGRpc3BsYXkuYmxpbmtlcik7XG4gICAgdmFyIG9uID0gdHJ1ZTtcbiAgICBkaXNwbGF5LmN1cnNvckRpdi5zdHlsZS52aXNpYmlsaXR5ID0gXCJcIjtcblxuICAgIGlmIChjbS5vcHRpb25zLmN1cnNvckJsaW5rUmF0ZSA+IDApIHtcbiAgICAgIGRpc3BsYXkuYmxpbmtlciA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGRpc3BsYXkuY3Vyc29yRGl2LnN0eWxlLnZpc2liaWxpdHkgPSAob24gPSAhb24pID8gXCJcIiA6IFwiaGlkZGVuXCI7XG4gICAgICB9LCBjbS5vcHRpb25zLmN1cnNvckJsaW5rUmF0ZSk7XG4gICAgfSBlbHNlIGlmIChjbS5vcHRpb25zLmN1cnNvckJsaW5rUmF0ZSA8IDApIHtcbiAgICAgIGRpc3BsYXkuY3Vyc29yRGl2LnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVuc3VyZUZvY3VzKGNtKSB7XG4gICAgaWYgKCFjbS5zdGF0ZS5mb2N1c2VkKSB7XG4gICAgICBjbS5kaXNwbGF5LmlucHV0LmZvY3VzKCk7XG4gICAgICBvbkZvY3VzKGNtKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkZWxheUJsdXJFdmVudChjbSkge1xuICAgIGNtLnN0YXRlLmRlbGF5aW5nQmx1ckV2ZW50ID0gdHJ1ZTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChjbS5zdGF0ZS5kZWxheWluZ0JsdXJFdmVudCkge1xuICAgICAgICBjbS5zdGF0ZS5kZWxheWluZ0JsdXJFdmVudCA9IGZhbHNlO1xuICAgICAgICBvbkJsdXIoY20pO1xuICAgICAgfVxuICAgIH0sIDEwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBvbkZvY3VzKGNtLCBlKSB7XG4gICAgaWYgKGNtLnN0YXRlLmRlbGF5aW5nQmx1ckV2ZW50KSB7XG4gICAgICBjbS5zdGF0ZS5kZWxheWluZ0JsdXJFdmVudCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChjbS5vcHRpb25zLnJlYWRPbmx5ID09IFwibm9jdXJzb3JcIikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghY20uc3RhdGUuZm9jdXNlZCkge1xuICAgICAgc2lnbmFsKGNtLCBcImZvY3VzXCIsIGNtLCBlKTtcbiAgICAgIGNtLnN0YXRlLmZvY3VzZWQgPSB0cnVlO1xuICAgICAgYWRkQ2xhc3MoY20uZGlzcGxheS53cmFwcGVyLCBcIkNvZGVNaXJyb3ItZm9jdXNlZFwiKTsgLy8gVGhpcyB0ZXN0IHByZXZlbnRzIHRoaXMgZnJvbSBmaXJpbmcgd2hlbiBhIGNvbnRleHRcbiAgICAgIC8vIG1lbnUgaXMgY2xvc2VkIChzaW5jZSB0aGUgaW5wdXQgcmVzZXQgd291bGQga2lsbCB0aGVcbiAgICAgIC8vIHNlbGVjdC1hbGwgZGV0ZWN0aW9uIGhhY2spXG5cbiAgICAgIGlmICghY20uY3VyT3AgJiYgY20uZGlzcGxheS5zZWxGb3JDb250ZXh0TWVudSAhPSBjbS5kb2Muc2VsKSB7XG4gICAgICAgIGNtLmRpc3BsYXkuaW5wdXQucmVzZXQoKTtcblxuICAgICAgICBpZiAod2Via2l0KSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gY20uZGlzcGxheS5pbnB1dC5yZXNldCh0cnVlKTtcbiAgICAgICAgICB9LCAyMCk7XG4gICAgICAgIH0gLy8gSXNzdWUgIzE3MzBcblxuICAgICAgfVxuXG4gICAgICBjbS5kaXNwbGF5LmlucHV0LnJlY2VpdmVkRm9jdXMoKTtcbiAgICB9XG5cbiAgICByZXN0YXJ0QmxpbmsoY20pO1xuICB9XG5cbiAgZnVuY3Rpb24gb25CbHVyKGNtLCBlKSB7XG4gICAgaWYgKGNtLnN0YXRlLmRlbGF5aW5nQmx1ckV2ZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNtLnN0YXRlLmZvY3VzZWQpIHtcbiAgICAgIHNpZ25hbChjbSwgXCJibHVyXCIsIGNtLCBlKTtcbiAgICAgIGNtLnN0YXRlLmZvY3VzZWQgPSBmYWxzZTtcbiAgICAgIHJtQ2xhc3MoY20uZGlzcGxheS53cmFwcGVyLCBcIkNvZGVNaXJyb3ItZm9jdXNlZFwiKTtcbiAgICB9XG5cbiAgICBjbGVhckludGVydmFsKGNtLmRpc3BsYXkuYmxpbmtlcik7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIWNtLnN0YXRlLmZvY3VzZWQpIHtcbiAgICAgICAgY20uZGlzcGxheS5zaGlmdCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0sIDE1MCk7XG4gIH0gLy8gUmUtYWxpZ24gbGluZSBudW1iZXJzIGFuZCBndXR0ZXIgbWFya3MgdG8gY29tcGVuc2F0ZSBmb3JcbiAgLy8gaG9yaXpvbnRhbCBzY3JvbGxpbmcuXG5cblxuICBmdW5jdGlvbiBhbGlnbkhvcml6b250YWxseShjbSkge1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheSxcbiAgICAgICAgdmlldyA9IGRpc3BsYXkudmlldztcblxuICAgIGlmICghZGlzcGxheS5hbGlnbldpZGdldHMgJiYgKCFkaXNwbGF5Lmd1dHRlcnMuZmlyc3RDaGlsZCB8fCAhY20ub3B0aW9ucy5maXhlZEd1dHRlcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgY29tcCA9IGNvbXBlbnNhdGVGb3JIU2Nyb2xsKGRpc3BsYXkpIC0gZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0ICsgY20uZG9jLnNjcm9sbExlZnQ7XG4gICAgdmFyIGd1dHRlclcgPSBkaXNwbGF5Lmd1dHRlcnMub2Zmc2V0V2lkdGgsXG4gICAgICAgIGxlZnQgPSBjb21wICsgXCJweFwiO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIXZpZXdbaV0uaGlkZGVuKSB7XG4gICAgICAgIGlmIChjbS5vcHRpb25zLmZpeGVkR3V0dGVyKSB7XG4gICAgICAgICAgaWYgKHZpZXdbaV0uZ3V0dGVyKSB7XG4gICAgICAgICAgICB2aWV3W2ldLmd1dHRlci5zdHlsZS5sZWZ0ID0gbGVmdDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodmlld1tpXS5ndXR0ZXJCYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICB2aWV3W2ldLmd1dHRlckJhY2tncm91bmQuc3R5bGUubGVmdCA9IGxlZnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFsaWduID0gdmlld1tpXS5hbGlnbmFibGU7XG5cbiAgICAgICAgaWYgKGFsaWduKSB7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhbGlnbi5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgYWxpZ25bal0uc3R5bGUubGVmdCA9IGxlZnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNtLm9wdGlvbnMuZml4ZWRHdXR0ZXIpIHtcbiAgICAgIGRpc3BsYXkuZ3V0dGVycy5zdHlsZS5sZWZ0ID0gY29tcCArIGd1dHRlclcgKyBcInB4XCI7XG4gICAgfVxuICB9IC8vIFVzZWQgdG8gZW5zdXJlIHRoYXQgdGhlIGxpbmUgbnVtYmVyIGd1dHRlciBpcyBzdGlsbCB0aGUgcmlnaHRcbiAgLy8gc2l6ZSBmb3IgdGhlIGN1cnJlbnQgZG9jdW1lbnQgc2l6ZS4gUmV0dXJucyB0cnVlIHdoZW4gYW4gdXBkYXRlXG4gIC8vIGlzIG5lZWRlZC5cblxuXG4gIGZ1bmN0aW9uIG1heWJlVXBkYXRlTGluZU51bWJlcldpZHRoKGNtKSB7XG4gICAgaWYgKCFjbS5vcHRpb25zLmxpbmVOdW1iZXJzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGRvYyA9IGNtLmRvYyxcbiAgICAgICAgbGFzdCA9IGxpbmVOdW1iZXJGb3IoY20ub3B0aW9ucywgZG9jLmZpcnN0ICsgZG9jLnNpemUgLSAxKSxcbiAgICAgICAgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG5cbiAgICBpZiAobGFzdC5sZW5ndGggIT0gZGlzcGxheS5saW5lTnVtQ2hhcnMpIHtcbiAgICAgIHZhciB0ZXN0ID0gZGlzcGxheS5tZWFzdXJlLmFwcGVuZENoaWxkKGVsdChcImRpdlwiLCBbZWx0KFwiZGl2XCIsIGxhc3QpXSwgXCJDb2RlTWlycm9yLWxpbmVudW1iZXIgQ29kZU1pcnJvci1ndXR0ZXItZWx0XCIpKTtcbiAgICAgIHZhciBpbm5lclcgPSB0ZXN0LmZpcnN0Q2hpbGQub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgcGFkZGluZyA9IHRlc3Qub2Zmc2V0V2lkdGggLSBpbm5lclc7XG4gICAgICBkaXNwbGF5LmxpbmVHdXR0ZXIuc3R5bGUud2lkdGggPSBcIlwiO1xuICAgICAgZGlzcGxheS5saW5lTnVtSW5uZXJXaWR0aCA9IE1hdGgubWF4KGlubmVyVywgZGlzcGxheS5saW5lR3V0dGVyLm9mZnNldFdpZHRoIC0gcGFkZGluZykgKyAxO1xuICAgICAgZGlzcGxheS5saW5lTnVtV2lkdGggPSBkaXNwbGF5LmxpbmVOdW1Jbm5lcldpZHRoICsgcGFkZGluZztcbiAgICAgIGRpc3BsYXkubGluZU51bUNoYXJzID0gZGlzcGxheS5saW5lTnVtSW5uZXJXaWR0aCA/IGxhc3QubGVuZ3RoIDogLTE7XG4gICAgICBkaXNwbGF5LmxpbmVHdXR0ZXIuc3R5bGUud2lkdGggPSBkaXNwbGF5LmxpbmVOdW1XaWR0aCArIFwicHhcIjtcbiAgICAgIHVwZGF0ZUd1dHRlclNwYWNlKGNtKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSAvLyBSZWFkIHRoZSBhY3R1YWwgaGVpZ2h0cyBvZiB0aGUgcmVuZGVyZWQgbGluZXMsIGFuZCB1cGRhdGUgdGhlaXJcbiAgLy8gc3RvcmVkIGhlaWdodHMgdG8gbWF0Y2guXG5cblxuICBmdW5jdGlvbiB1cGRhdGVIZWlnaHRzSW5WaWV3cG9ydChjbSkge1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgICB2YXIgcHJldkJvdHRvbSA9IGRpc3BsYXkubGluZURpdi5vZmZzZXRUb3A7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRpc3BsYXkudmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGN1ciA9IGRpc3BsYXkudmlld1tpXSxcbiAgICAgICAgICBoZWlnaHQgPSB2b2lkIDA7XG5cbiAgICAgIGlmIChjdXIuaGlkZGVuKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA8IDgpIHtcbiAgICAgICAgdmFyIGJvdCA9IGN1ci5ub2RlLm9mZnNldFRvcCArIGN1ci5ub2RlLm9mZnNldEhlaWdodDtcbiAgICAgICAgaGVpZ2h0ID0gYm90IC0gcHJldkJvdHRvbTtcbiAgICAgICAgcHJldkJvdHRvbSA9IGJvdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBib3ggPSBjdXIubm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaGVpZ2h0ID0gYm94LmJvdHRvbSAtIGJveC50b3A7XG4gICAgICB9XG5cbiAgICAgIHZhciBkaWZmID0gY3VyLmxpbmUuaGVpZ2h0IC0gaGVpZ2h0O1xuXG4gICAgICBpZiAoaGVpZ2h0IDwgMikge1xuICAgICAgICBoZWlnaHQgPSB0ZXh0SGVpZ2h0KGRpc3BsYXkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlmZiA+IC4wMDEgfHwgZGlmZiA8IC0uMDAxKSB7XG4gICAgICAgIHVwZGF0ZUxpbmVIZWlnaHQoY3VyLmxpbmUsIGhlaWdodCk7XG4gICAgICAgIHVwZGF0ZVdpZGdldEhlaWdodChjdXIubGluZSk7XG5cbiAgICAgICAgaWYgKGN1ci5yZXN0KSB7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjdXIucmVzdC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdXBkYXRlV2lkZ2V0SGVpZ2h0KGN1ci5yZXN0W2pdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gLy8gUmVhZCBhbmQgc3RvcmUgdGhlIGhlaWdodCBvZiBsaW5lIHdpZGdldHMgYXNzb2NpYXRlZCB3aXRoIHRoZVxuICAvLyBnaXZlbiBsaW5lLlxuXG5cbiAgZnVuY3Rpb24gdXBkYXRlV2lkZ2V0SGVpZ2h0KGxpbmUpIHtcbiAgICBpZiAobGluZS53aWRnZXRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmUud2lkZ2V0cy5sZW5ndGg7ICsraSkge1xuICAgICAgICBsaW5lLndpZGdldHNbaV0uaGVpZ2h0ID0gbGluZS53aWRnZXRzW2ldLm5vZGUucGFyZW50Tm9kZS5vZmZzZXRIZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuICB9IC8vIENvbXB1dGUgdGhlIGxpbmVzIHRoYXQgYXJlIHZpc2libGUgaW4gYSBnaXZlbiB2aWV3cG9ydCAoZGVmYXVsdHNcbiAgLy8gdGhlIHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbikuIHZpZXdwb3J0IG1heSBjb250YWluIHRvcCxcbiAgLy8gaGVpZ2h0LCBhbmQgZW5zdXJlIChzZWUgb3Auc2Nyb2xsVG9Qb3MpIHByb3BlcnRpZXMuXG5cblxuICBmdW5jdGlvbiB2aXNpYmxlTGluZXMoZGlzcGxheSwgZG9jLCB2aWV3cG9ydCkge1xuICAgIHZhciB0b3AgPSB2aWV3cG9ydCAmJiB2aWV3cG9ydC50b3AgIT0gbnVsbCA/IE1hdGgubWF4KDAsIHZpZXdwb3J0LnRvcCkgOiBkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcDtcbiAgICB0b3AgPSBNYXRoLmZsb29yKHRvcCAtIHBhZGRpbmdUb3AoZGlzcGxheSkpO1xuICAgIHZhciBib3R0b20gPSB2aWV3cG9ydCAmJiB2aWV3cG9ydC5ib3R0b20gIT0gbnVsbCA/IHZpZXdwb3J0LmJvdHRvbSA6IHRvcCArIGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQ7XG5cbiAgICB2YXIgZnJvbSA9IF9saW5lQXRIZWlnaHQoZG9jLCB0b3ApLFxuICAgICAgICB0byA9IF9saW5lQXRIZWlnaHQoZG9jLCBib3R0b20pOyAvLyBFbnN1cmUgaXMgYSB7ZnJvbToge2xpbmUsIGNofSwgdG86IHtsaW5lLCBjaH19IG9iamVjdCwgYW5kXG4gICAgLy8gZm9yY2VzIHRob3NlIGxpbmVzIGludG8gdGhlIHZpZXdwb3J0IChpZiBwb3NzaWJsZSkuXG5cblxuICAgIGlmICh2aWV3cG9ydCAmJiB2aWV3cG9ydC5lbnN1cmUpIHtcbiAgICAgIHZhciBlbnN1cmVGcm9tID0gdmlld3BvcnQuZW5zdXJlLmZyb20ubGluZSxcbiAgICAgICAgICBlbnN1cmVUbyA9IHZpZXdwb3J0LmVuc3VyZS50by5saW5lO1xuXG4gICAgICBpZiAoZW5zdXJlRnJvbSA8IGZyb20pIHtcbiAgICAgICAgZnJvbSA9IGVuc3VyZUZyb207XG4gICAgICAgIHRvID0gX2xpbmVBdEhlaWdodChkb2MsIF9oZWlnaHRBdExpbmUoZ2V0TGluZShkb2MsIGVuc3VyZUZyb20pKSArIGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQpO1xuICAgICAgfSBlbHNlIGlmIChNYXRoLm1pbihlbnN1cmVUbywgZG9jLmxhc3RMaW5lKCkpID49IHRvKSB7XG4gICAgICAgIGZyb20gPSBfbGluZUF0SGVpZ2h0KGRvYywgX2hlaWdodEF0TGluZShnZXRMaW5lKGRvYywgZW5zdXJlVG8pKSAtIGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQpO1xuICAgICAgICB0byA9IGVuc3VyZVRvO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBmcm9tOiBmcm9tLFxuICAgICAgdG86IE1hdGgubWF4KHRvLCBmcm9tICsgMSlcbiAgICB9O1xuICB9IC8vIFN5bmMgdGhlIHNjcm9sbGFibGUgYXJlYSBhbmQgc2Nyb2xsYmFycywgZW5zdXJlIHRoZSB2aWV3cG9ydFxuICAvLyBjb3ZlcnMgdGhlIHZpc2libGUgYXJlYS5cblxuXG4gIGZ1bmN0aW9uIHNldFNjcm9sbFRvcChjbSwgdmFsKSB7XG4gICAgaWYgKE1hdGguYWJzKGNtLmRvYy5zY3JvbGxUb3AgLSB2YWwpIDwgMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNtLmRvYy5zY3JvbGxUb3AgPSB2YWw7XG5cbiAgICBpZiAoIWdlY2tvKSB7XG4gICAgICB1cGRhdGVEaXNwbGF5U2ltcGxlKGNtLCB7XG4gICAgICAgIHRvcDogdmFsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY20uZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3AgIT0gdmFsKSB7XG4gICAgICBjbS5kaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcCA9IHZhbDtcbiAgICB9XG5cbiAgICBjbS5kaXNwbGF5LnNjcm9sbGJhcnMuc2V0U2Nyb2xsVG9wKHZhbCk7XG5cbiAgICBpZiAoZ2Vja28pIHtcbiAgICAgIHVwZGF0ZURpc3BsYXlTaW1wbGUoY20pO1xuICAgIH1cblxuICAgIHN0YXJ0V29ya2VyKGNtLCAxMDApO1xuICB9IC8vIFN5bmMgc2Nyb2xsZXIgYW5kIHNjcm9sbGJhciwgZW5zdXJlIHRoZSBndXR0ZXIgZWxlbWVudHMgYXJlXG4gIC8vIGFsaWduZWQuXG5cblxuICBmdW5jdGlvbiBzZXRTY3JvbGxMZWZ0KGNtLCB2YWwsIGlzU2Nyb2xsZXIpIHtcbiAgICBpZiAoaXNTY3JvbGxlciA/IHZhbCA9PSBjbS5kb2Muc2Nyb2xsTGVmdCA6IE1hdGguYWJzKGNtLmRvYy5zY3JvbGxMZWZ0IC0gdmFsKSA8IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YWwgPSBNYXRoLm1pbih2YWwsIGNtLmRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsV2lkdGggLSBjbS5kaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoKTtcbiAgICBjbS5kb2Muc2Nyb2xsTGVmdCA9IHZhbDtcbiAgICBhbGlnbkhvcml6b250YWxseShjbSk7XG5cbiAgICBpZiAoY20uZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0ICE9IHZhbCkge1xuICAgICAgY20uZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0ID0gdmFsO1xuICAgIH1cblxuICAgIGNtLmRpc3BsYXkuc2Nyb2xsYmFycy5zZXRTY3JvbGxMZWZ0KHZhbCk7XG4gIH0gLy8gU2luY2UgdGhlIGRlbHRhIHZhbHVlcyByZXBvcnRlZCBvbiBtb3VzZSB3aGVlbCBldmVudHMgYXJlXG4gIC8vIHVuc3RhbmRhcmRpemVkIGJldHdlZW4gYnJvd3NlcnMgYW5kIGV2ZW4gYnJvd3NlciB2ZXJzaW9ucywgYW5kXG4gIC8vIGdlbmVyYWxseSBob3JyaWJseSB1bnByZWRpY3RhYmxlLCB0aGlzIGNvZGUgc3RhcnRzIGJ5IG1lYXN1cmluZ1xuICAvLyB0aGUgc2Nyb2xsIGVmZmVjdCB0aGF0IHRoZSBmaXJzdCBmZXcgbW91c2Ugd2hlZWwgZXZlbnRzIGhhdmUsXG4gIC8vIGFuZCwgZnJvbSB0aGF0LCBkZXRlY3RzIHRoZSB3YXkgaXQgY2FuIGNvbnZlcnQgZGVsdGFzIHRvIHBpeGVsXG4gIC8vIG9mZnNldHMgYWZ0ZXJ3YXJkcy5cbiAgLy9cbiAgLy8gVGhlIHJlYXNvbiB3ZSB3YW50IHRvIGtub3cgdGhlIGFtb3VudCBhIHdoZWVsIGV2ZW50IHdpbGwgc2Nyb2xsXG4gIC8vIGlzIHRoYXQgaXQgZ2l2ZXMgdXMgYSBjaGFuY2UgdG8gdXBkYXRlIHRoZSBkaXNwbGF5IGJlZm9yZSB0aGVcbiAgLy8gYWN0dWFsIHNjcm9sbGluZyBoYXBwZW5zLCByZWR1Y2luZyBmbGlja2VyaW5nLlxuXG5cbiAgdmFyIHdoZWVsU2FtcGxlcyA9IDA7XG4gIHZhciB3aGVlbFBpeGVsc1BlclVuaXQgPSBudWxsOyAvLyBGaWxsIGluIGEgYnJvd3Nlci1kZXRlY3RlZCBzdGFydGluZyB2YWx1ZSBvbiBicm93c2VycyB3aGVyZSB3ZVxuICAvLyBrbm93IG9uZS4gVGhlc2UgZG9uJ3QgaGF2ZSB0byBiZSBhY2N1cmF0ZSAtLSB0aGUgcmVzdWx0IG9mIHRoZW1cbiAgLy8gYmVpbmcgd3Jvbmcgd291bGQganVzdCBiZSBhIHNsaWdodCBmbGlja2VyIG9uIHRoZSBmaXJzdCB3aGVlbFxuICAvLyBzY3JvbGwgKGlmIGl0IGlzIGxhcmdlIGVub3VnaCkuXG5cbiAgaWYgKGllKSB7XG4gICAgd2hlZWxQaXhlbHNQZXJVbml0ID0gLS41MztcbiAgfSBlbHNlIGlmIChnZWNrbykge1xuICAgIHdoZWVsUGl4ZWxzUGVyVW5pdCA9IDE1O1xuICB9IGVsc2UgaWYgKGNocm9tZSkge1xuICAgIHdoZWVsUGl4ZWxzUGVyVW5pdCA9IC0uNztcbiAgfSBlbHNlIGlmIChzYWZhcmkpIHtcbiAgICB3aGVlbFBpeGVsc1BlclVuaXQgPSAtMSAvIDM7XG4gIH1cblxuICBmdW5jdGlvbiB3aGVlbEV2ZW50RGVsdGEoZSkge1xuICAgIHZhciBkeCA9IGUud2hlZWxEZWx0YVgsXG4gICAgICAgIGR5ID0gZS53aGVlbERlbHRhWTtcblxuICAgIGlmIChkeCA9PSBudWxsICYmIGUuZGV0YWlsICYmIGUuYXhpcyA9PSBlLkhPUklaT05UQUxfQVhJUykge1xuICAgICAgZHggPSBlLmRldGFpbDtcbiAgICB9XG5cbiAgICBpZiAoZHkgPT0gbnVsbCAmJiBlLmRldGFpbCAmJiBlLmF4aXMgPT0gZS5WRVJUSUNBTF9BWElTKSB7XG4gICAgICBkeSA9IGUuZGV0YWlsO1xuICAgIH0gZWxzZSBpZiAoZHkgPT0gbnVsbCkge1xuICAgICAgZHkgPSBlLndoZWVsRGVsdGE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IGR4LFxuICAgICAgeTogZHlcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gd2hlZWxFdmVudFBpeGVscyhlKSB7XG4gICAgdmFyIGRlbHRhID0gd2hlZWxFdmVudERlbHRhKGUpO1xuICAgIGRlbHRhLnggKj0gd2hlZWxQaXhlbHNQZXJVbml0O1xuICAgIGRlbHRhLnkgKj0gd2hlZWxQaXhlbHNQZXJVbml0O1xuICAgIHJldHVybiBkZWx0YTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU2Nyb2xsV2hlZWwoY20sIGUpIHtcbiAgICB2YXIgZGVsdGEgPSB3aGVlbEV2ZW50RGVsdGEoZSksXG4gICAgICAgIGR4ID0gZGVsdGEueCxcbiAgICAgICAgZHkgPSBkZWx0YS55O1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheSxcbiAgICAgICAgc2Nyb2xsID0gZGlzcGxheS5zY3JvbGxlcjsgLy8gUXVpdCBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gc2Nyb2xsIGhlcmVcblxuICAgIHZhciBjYW5TY3JvbGxYID0gc2Nyb2xsLnNjcm9sbFdpZHRoID4gc2Nyb2xsLmNsaWVudFdpZHRoO1xuICAgIHZhciBjYW5TY3JvbGxZID0gc2Nyb2xsLnNjcm9sbEhlaWdodCA+IHNjcm9sbC5jbGllbnRIZWlnaHQ7XG5cbiAgICBpZiAoIShkeCAmJiBjYW5TY3JvbGxYIHx8IGR5ICYmIGNhblNjcm9sbFkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfSAvLyBXZWJraXQgYnJvd3NlcnMgb24gT1MgWCBhYm9ydCBtb21lbnR1bSBzY3JvbGxzIHdoZW4gdGhlIHRhcmdldFxuICAgIC8vIG9mIHRoZSBzY3JvbGwgZXZlbnQgaXMgcmVtb3ZlZCBmcm9tIHRoZSBzY3JvbGxhYmxlIGVsZW1lbnQuXG4gICAgLy8gVGhpcyBoYWNrIChzZWUgcmVsYXRlZCBjb2RlIGluIHBhdGNoRGlzcGxheSkgbWFrZXMgc3VyZSB0aGVcbiAgICAvLyBlbGVtZW50IGlzIGtlcHQgYXJvdW5kLlxuXG5cbiAgICBpZiAoZHkgJiYgbWFjICYmIHdlYmtpdCkge1xuICAgICAgb3V0ZXI6IGZvciAodmFyIGN1ciA9IGUudGFyZ2V0LCB2aWV3ID0gZGlzcGxheS52aWV3OyBjdXIgIT0gc2Nyb2xsOyBjdXIgPSBjdXIucGFyZW50Tm9kZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAodmlld1tpXS5ub2RlID09IGN1cikge1xuICAgICAgICAgICAgY20uZGlzcGxheS5jdXJyZW50V2hlZWxUYXJnZXQgPSBjdXI7XG4gICAgICAgICAgICBicmVhayBvdXRlcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IC8vIE9uIHNvbWUgYnJvd3NlcnMsIGhvcml6b250YWwgc2Nyb2xsaW5nIHdpbGwgY2F1c2UgcmVkcmF3cyB0b1xuICAgIC8vIGhhcHBlbiBiZWZvcmUgdGhlIGd1dHRlciBoYXMgYmVlbiByZWFsaWduZWQsIGNhdXNpbmcgaXQgdG9cbiAgICAvLyB3cmlnZ2xlIGFyb3VuZCBpbiBhIG1vc3QgdW5zZWVtbHkgd2F5LiBXaGVuIHdlIGhhdmUgYW5cbiAgICAvLyBlc3RpbWF0ZWQgcGl4ZWxzL2RlbHRhIHZhbHVlLCB3ZSBqdXN0IGhhbmRsZSBob3Jpem9udGFsXG4gICAgLy8gc2Nyb2xsaW5nIGVudGlyZWx5IGhlcmUuIEl0J2xsIGJlIHNsaWdodGx5IG9mZiBmcm9tIG5hdGl2ZSwgYnV0XG4gICAgLy8gYmV0dGVyIHRoYW4gZ2xpdGNoaW5nIG91dC5cblxuXG4gICAgaWYgKGR4ICYmICFnZWNrbyAmJiAhcHJlc3RvICYmIHdoZWVsUGl4ZWxzUGVyVW5pdCAhPSBudWxsKSB7XG4gICAgICBpZiAoZHkgJiYgY2FuU2Nyb2xsWSkge1xuICAgICAgICBzZXRTY3JvbGxUb3AoY20sIE1hdGgubWF4KDAsIE1hdGgubWluKHNjcm9sbC5zY3JvbGxUb3AgKyBkeSAqIHdoZWVsUGl4ZWxzUGVyVW5pdCwgc2Nyb2xsLnNjcm9sbEhlaWdodCAtIHNjcm9sbC5jbGllbnRIZWlnaHQpKSk7XG4gICAgICB9XG5cbiAgICAgIHNldFNjcm9sbExlZnQoY20sIE1hdGgubWF4KDAsIE1hdGgubWluKHNjcm9sbC5zY3JvbGxMZWZ0ICsgZHggKiB3aGVlbFBpeGVsc1BlclVuaXQsIHNjcm9sbC5zY3JvbGxXaWR0aCAtIHNjcm9sbC5jbGllbnRXaWR0aCkpKTsgLy8gT25seSBwcmV2ZW50IGRlZmF1bHQgc2Nyb2xsaW5nIGlmIHZlcnRpY2FsIHNjcm9sbGluZyBpc1xuICAgICAgLy8gYWN0dWFsbHkgcG9zc2libGUuIE90aGVyd2lzZSwgaXQgY2F1c2VzIHZlcnRpY2FsIHNjcm9sbFxuICAgICAgLy8gaml0dGVyIG9uIE9TWCB0cmFja3BhZHMgd2hlbiBkZWx0YVggaXMgc21hbGwgYW5kIGRlbHRhWVxuICAgICAgLy8gaXMgbGFyZ2UgKGlzc3VlICMzNTc5KVxuXG4gICAgICBpZiAoIWR5IHx8IGR5ICYmIGNhblNjcm9sbFkpIHtcbiAgICAgICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICAgIH1cblxuICAgICAgZGlzcGxheS53aGVlbFN0YXJ0WCA9IG51bGw7IC8vIEFib3J0IG1lYXN1cmVtZW50LCBpZiBpbiBwcm9ncmVzc1xuXG4gICAgICByZXR1cm47XG4gICAgfSAvLyAnUHJvamVjdCcgdGhlIHZpc2libGUgdmlld3BvcnQgdG8gY292ZXIgdGhlIGFyZWEgdGhhdCBpcyBiZWluZ1xuICAgIC8vIHNjcm9sbGVkIGludG8gdmlldyAoaWYgd2Uga25vdyBlbm91Z2ggdG8gZXN0aW1hdGUgaXQpLlxuXG5cbiAgICBpZiAoZHkgJiYgd2hlZWxQaXhlbHNQZXJVbml0ICE9IG51bGwpIHtcbiAgICAgIHZhciBwaXhlbHMgPSBkeSAqIHdoZWVsUGl4ZWxzUGVyVW5pdDtcbiAgICAgIHZhciB0b3AgPSBjbS5kb2Muc2Nyb2xsVG9wLFxuICAgICAgICAgIGJvdCA9IHRvcCArIGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQ7XG5cbiAgICAgIGlmIChwaXhlbHMgPCAwKSB7XG4gICAgICAgIHRvcCA9IE1hdGgubWF4KDAsIHRvcCArIHBpeGVscyAtIDUwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJvdCA9IE1hdGgubWluKGNtLmRvYy5oZWlnaHQsIGJvdCArIHBpeGVscyArIDUwKTtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlRGlzcGxheVNpbXBsZShjbSwge1xuICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgYm90dG9tOiBib3RcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh3aGVlbFNhbXBsZXMgPCAyMCkge1xuICAgICAgaWYgKGRpc3BsYXkud2hlZWxTdGFydFggPT0gbnVsbCkge1xuICAgICAgICBkaXNwbGF5LndoZWVsU3RhcnRYID0gc2Nyb2xsLnNjcm9sbExlZnQ7XG4gICAgICAgIGRpc3BsYXkud2hlZWxTdGFydFkgPSBzY3JvbGwuc2Nyb2xsVG9wO1xuICAgICAgICBkaXNwbGF5LndoZWVsRFggPSBkeDtcbiAgICAgICAgZGlzcGxheS53aGVlbERZID0gZHk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChkaXNwbGF5LndoZWVsU3RhcnRYID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgbW92ZWRYID0gc2Nyb2xsLnNjcm9sbExlZnQgLSBkaXNwbGF5LndoZWVsU3RhcnRYO1xuICAgICAgICAgIHZhciBtb3ZlZFkgPSBzY3JvbGwuc2Nyb2xsVG9wIC0gZGlzcGxheS53aGVlbFN0YXJ0WTtcbiAgICAgICAgICB2YXIgc2FtcGxlID0gbW92ZWRZICYmIGRpc3BsYXkud2hlZWxEWSAmJiBtb3ZlZFkgLyBkaXNwbGF5LndoZWVsRFkgfHwgbW92ZWRYICYmIGRpc3BsYXkud2hlZWxEWCAmJiBtb3ZlZFggLyBkaXNwbGF5LndoZWVsRFg7XG4gICAgICAgICAgZGlzcGxheS53aGVlbFN0YXJ0WCA9IGRpc3BsYXkud2hlZWxTdGFydFkgPSBudWxsO1xuXG4gICAgICAgICAgaWYgKCFzYW1wbGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3aGVlbFBpeGVsc1BlclVuaXQgPSAod2hlZWxQaXhlbHNQZXJVbml0ICogd2hlZWxTYW1wbGVzICsgc2FtcGxlKSAvICh3aGVlbFNhbXBsZXMgKyAxKTtcbiAgICAgICAgICArK3doZWVsU2FtcGxlcztcbiAgICAgICAgfSwgMjAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpc3BsYXkud2hlZWxEWCArPSBkeDtcbiAgICAgICAgZGlzcGxheS53aGVlbERZICs9IGR5O1xuICAgICAgfVxuICAgIH1cbiAgfSAvLyBTQ1JPTExCQVJTXG4gIC8vIFByZXBhcmUgRE9NIHJlYWRzIG5lZWRlZCB0byB1cGRhdGUgdGhlIHNjcm9sbGJhcnMuIERvbmUgaW4gb25lXG4gIC8vIHNob3QgdG8gbWluaW1pemUgdXBkYXRlL21lYXN1cmUgcm91bmR0cmlwcy5cblxuXG4gIGZ1bmN0aW9uIG1lYXN1cmVGb3JTY3JvbGxiYXJzKGNtKSB7XG4gICAgdmFyIGQgPSBjbS5kaXNwbGF5LFxuICAgICAgICBndXR0ZXJXID0gZC5ndXR0ZXJzLm9mZnNldFdpZHRoO1xuICAgIHZhciBkb2NIID0gTWF0aC5yb3VuZChjbS5kb2MuaGVpZ2h0ICsgcGFkZGluZ1ZlcnQoY20uZGlzcGxheSkpO1xuICAgIHJldHVybiB7XG4gICAgICBjbGllbnRIZWlnaHQ6IGQuc2Nyb2xsZXIuY2xpZW50SGVpZ2h0LFxuICAgICAgdmlld0hlaWdodDogZC53cmFwcGVyLmNsaWVudEhlaWdodCxcbiAgICAgIHNjcm9sbFdpZHRoOiBkLnNjcm9sbGVyLnNjcm9sbFdpZHRoLFxuICAgICAgY2xpZW50V2lkdGg6IGQuc2Nyb2xsZXIuY2xpZW50V2lkdGgsXG4gICAgICB2aWV3V2lkdGg6IGQud3JhcHBlci5jbGllbnRXaWR0aCxcbiAgICAgIGJhckxlZnQ6IGNtLm9wdGlvbnMuZml4ZWRHdXR0ZXIgPyBndXR0ZXJXIDogMCxcbiAgICAgIGRvY0hlaWdodDogZG9jSCxcbiAgICAgIHNjcm9sbEhlaWdodDogZG9jSCArIHNjcm9sbEdhcChjbSkgKyBkLmJhckhlaWdodCxcbiAgICAgIG5hdGl2ZUJhcldpZHRoOiBkLm5hdGl2ZUJhcldpZHRoLFxuICAgICAgZ3V0dGVyV2lkdGg6IGd1dHRlcldcbiAgICB9O1xuICB9XG5cbiAgdmFyIE5hdGl2ZVNjcm9sbGJhcnMgPSBmdW5jdGlvbiBOYXRpdmVTY3JvbGxiYXJzKHBsYWNlLCBzY3JvbGwsIGNtKSB7XG4gICAgdGhpcy5jbSA9IGNtO1xuICAgIHZhciB2ZXJ0ID0gdGhpcy52ZXJ0ID0gZWx0KFwiZGl2XCIsIFtlbHQoXCJkaXZcIiwgbnVsbCwgbnVsbCwgXCJtaW4td2lkdGg6IDFweFwiKV0sIFwiQ29kZU1pcnJvci12c2Nyb2xsYmFyXCIpO1xuICAgIHZhciBob3JpeiA9IHRoaXMuaG9yaXogPSBlbHQoXCJkaXZcIiwgW2VsdChcImRpdlwiLCBudWxsLCBudWxsLCBcImhlaWdodDogMTAwJTsgbWluLWhlaWdodDogMXB4XCIpXSwgXCJDb2RlTWlycm9yLWhzY3JvbGxiYXJcIik7XG4gICAgcGxhY2UodmVydCk7XG4gICAgcGxhY2UoaG9yaXopO1xuICAgIG9uKHZlcnQsIFwic2Nyb2xsXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh2ZXJ0LmNsaWVudEhlaWdodCkge1xuICAgICAgICBzY3JvbGwodmVydC5zY3JvbGxUb3AsIFwidmVydGljYWxcIik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgb24oaG9yaXosIFwic2Nyb2xsXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChob3Jpei5jbGllbnRXaWR0aCkge1xuICAgICAgICBzY3JvbGwoaG9yaXouc2Nyb2xsTGVmdCwgXCJob3Jpem9udGFsXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuY2hlY2tlZFplcm9XaWR0aCA9IGZhbHNlOyAvLyBOZWVkIHRvIHNldCBhIG1pbmltdW0gd2lkdGggdG8gc2VlIHRoZSBzY3JvbGxiYXIgb24gSUU3IChidXQgbXVzdCBub3Qgc2V0IGl0IG9uIElFOCkuXG5cbiAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA8IDgpIHtcbiAgICAgIHRoaXMuaG9yaXouc3R5bGUubWluSGVpZ2h0ID0gdGhpcy52ZXJ0LnN0eWxlLm1pbldpZHRoID0gXCIxOHB4XCI7XG4gICAgfVxuICB9O1xuXG4gIE5hdGl2ZVNjcm9sbGJhcnMucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChtZWFzdXJlKSB7XG4gICAgdmFyIG5lZWRzSCA9IG1lYXN1cmUuc2Nyb2xsV2lkdGggPiBtZWFzdXJlLmNsaWVudFdpZHRoICsgMTtcbiAgICB2YXIgbmVlZHNWID0gbWVhc3VyZS5zY3JvbGxIZWlnaHQgPiBtZWFzdXJlLmNsaWVudEhlaWdodCArIDE7XG4gICAgdmFyIHNXaWR0aCA9IG1lYXN1cmUubmF0aXZlQmFyV2lkdGg7XG5cbiAgICBpZiAobmVlZHNWKSB7XG4gICAgICB0aGlzLnZlcnQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgIHRoaXMudmVydC5zdHlsZS5ib3R0b20gPSBuZWVkc0ggPyBzV2lkdGggKyBcInB4XCIgOiBcIjBcIjtcbiAgICAgIHZhciB0b3RhbEhlaWdodCA9IG1lYXN1cmUudmlld0hlaWdodCAtIChuZWVkc0ggPyBzV2lkdGggOiAwKTsgLy8gQSBidWcgaW4gSUU4IGNhbiBjYXVzZSB0aGlzIHZhbHVlIHRvIGJlIG5lZ2F0aXZlLCBzbyBndWFyZCBpdC5cblxuICAgICAgdGhpcy52ZXJ0LmZpcnN0Q2hpbGQuc3R5bGUuaGVpZ2h0ID0gTWF0aC5tYXgoMCwgbWVhc3VyZS5zY3JvbGxIZWlnaHQgLSBtZWFzdXJlLmNsaWVudEhlaWdodCArIHRvdGFsSGVpZ2h0KSArIFwicHhcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52ZXJ0LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgdGhpcy52ZXJ0LmZpcnN0Q2hpbGQuc3R5bGUuaGVpZ2h0ID0gXCIwXCI7XG4gICAgfVxuXG4gICAgaWYgKG5lZWRzSCkge1xuICAgICAgdGhpcy5ob3Jpei5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgdGhpcy5ob3Jpei5zdHlsZS5yaWdodCA9IG5lZWRzViA/IHNXaWR0aCArIFwicHhcIiA6IFwiMFwiO1xuICAgICAgdGhpcy5ob3Jpei5zdHlsZS5sZWZ0ID0gbWVhc3VyZS5iYXJMZWZ0ICsgXCJweFwiO1xuICAgICAgdmFyIHRvdGFsV2lkdGggPSBtZWFzdXJlLnZpZXdXaWR0aCAtIG1lYXN1cmUuYmFyTGVmdCAtIChuZWVkc1YgPyBzV2lkdGggOiAwKTtcbiAgICAgIHRoaXMuaG9yaXouZmlyc3RDaGlsZC5zdHlsZS53aWR0aCA9IG1lYXN1cmUuc2Nyb2xsV2lkdGggLSBtZWFzdXJlLmNsaWVudFdpZHRoICsgdG90YWxXaWR0aCArIFwicHhcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ob3Jpei5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgIHRoaXMuaG9yaXouZmlyc3RDaGlsZC5zdHlsZS53aWR0aCA9IFwiMFwiO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5jaGVja2VkWmVyb1dpZHRoICYmIG1lYXN1cmUuY2xpZW50SGVpZ2h0ID4gMCkge1xuICAgICAgaWYgKHNXaWR0aCA9PSAwKSB7XG4gICAgICAgIHRoaXMuemVyb1dpZHRoSGFjaygpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNoZWNrZWRaZXJvV2lkdGggPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICByaWdodDogbmVlZHNWID8gc1dpZHRoIDogMCxcbiAgICAgIGJvdHRvbTogbmVlZHNIID8gc1dpZHRoIDogMFxuICAgIH07XG4gIH07XG5cbiAgTmF0aXZlU2Nyb2xsYmFycy5wcm90b3R5cGUuc2V0U2Nyb2xsTGVmdCA9IGZ1bmN0aW9uIChwb3MpIHtcbiAgICBpZiAodGhpcy5ob3Jpei5zY3JvbGxMZWZ0ICE9IHBvcykge1xuICAgICAgdGhpcy5ob3Jpei5zY3JvbGxMZWZ0ID0gcG9zO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmRpc2FibGVIb3Jpeikge1xuICAgICAgdGhpcy5lbmFibGVaZXJvV2lkdGhCYXIodGhpcy5ob3JpeiwgdGhpcy5kaXNhYmxlSG9yaXopO1xuICAgIH1cbiAgfTtcblxuICBOYXRpdmVTY3JvbGxiYXJzLnByb3RvdHlwZS5zZXRTY3JvbGxUb3AgPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgaWYgKHRoaXMudmVydC5zY3JvbGxUb3AgIT0gcG9zKSB7XG4gICAgICB0aGlzLnZlcnQuc2Nyb2xsVG9wID0gcG9zO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmRpc2FibGVWZXJ0KSB7XG4gICAgICB0aGlzLmVuYWJsZVplcm9XaWR0aEJhcih0aGlzLnZlcnQsIHRoaXMuZGlzYWJsZVZlcnQpO1xuICAgIH1cbiAgfTtcblxuICBOYXRpdmVTY3JvbGxiYXJzLnByb3RvdHlwZS56ZXJvV2lkdGhIYWNrID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB3ID0gbWFjICYmICFtYWNfZ2VNb3VudGFpbkxpb24gPyBcIjEycHhcIiA6IFwiMThweFwiO1xuICAgIHRoaXMuaG9yaXouc3R5bGUuaGVpZ2h0ID0gdGhpcy52ZXJ0LnN0eWxlLndpZHRoID0gdztcbiAgICB0aGlzLmhvcml6LnN0eWxlLnBvaW50ZXJFdmVudHMgPSB0aGlzLnZlcnQuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwibm9uZVwiO1xuICAgIHRoaXMuZGlzYWJsZUhvcml6ID0gbmV3IERlbGF5ZWQoKTtcbiAgICB0aGlzLmRpc2FibGVWZXJ0ID0gbmV3IERlbGF5ZWQoKTtcbiAgfTtcblxuICBOYXRpdmVTY3JvbGxiYXJzLnByb3RvdHlwZS5lbmFibGVaZXJvV2lkdGhCYXIgPSBmdW5jdGlvbiAoYmFyLCBkZWxheSkge1xuICAgIGJhci5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJhdXRvXCI7XG5cbiAgICBmdW5jdGlvbiBtYXliZURpc2FibGUoKSB7XG4gICAgICAvLyBUbyBmaW5kIG91dCB3aGV0aGVyIHRoZSBzY3JvbGxiYXIgaXMgc3RpbGwgdmlzaWJsZSwgd2VcbiAgICAgIC8vIGNoZWNrIHdoZXRoZXIgdGhlIGVsZW1lbnQgdW5kZXIgdGhlIHBpeGVsIGluIHRoZSBib3R0b21cbiAgICAgIC8vIGxlZnQgY29ybmVyIG9mIHRoZSBzY3JvbGxiYXIgYm94IGlzIHRoZSBzY3JvbGxiYXIgYm94XG4gICAgICAvLyBpdHNlbGYgKHdoZW4gdGhlIGJhciBpcyBzdGlsbCB2aXNpYmxlKSBvciBpdHMgZmlsbGVyIGNoaWxkXG4gICAgICAvLyAod2hlbiB0aGUgYmFyIGlzIGhpZGRlbikuIElmIGl0IGlzIHN0aWxsIHZpc2libGUsIHdlIGtlZXBcbiAgICAgIC8vIGl0IGVuYWJsZWQsIGlmIGl0J3MgaGlkZGVuLCB3ZSBkaXNhYmxlIHBvaW50ZXIgZXZlbnRzLlxuICAgICAgdmFyIGJveCA9IGJhci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHZhciBlbHQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGJveC5sZWZ0ICsgMSwgYm94LmJvdHRvbSAtIDEpO1xuXG4gICAgICBpZiAoZWx0ICE9IGJhcikge1xuICAgICAgICBiYXIuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwibm9uZVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsYXkuc2V0KDEwMDAsIG1heWJlRGlzYWJsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGVsYXkuc2V0KDEwMDAsIG1heWJlRGlzYWJsZSk7XG4gIH07XG5cbiAgTmF0aXZlU2Nyb2xsYmFycy5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBhcmVudCA9IHRoaXMuaG9yaXoucGFyZW50Tm9kZTtcbiAgICBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcy5ob3Jpeik7XG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHRoaXMudmVydCk7XG4gIH07XG5cbiAgdmFyIE51bGxTY3JvbGxiYXJzID0gZnVuY3Rpb24gTnVsbFNjcm9sbGJhcnMoKSB7fTtcblxuICBOdWxsU2Nyb2xsYmFycy5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBib3R0b206IDAsXG4gICAgICByaWdodDogMFxuICAgIH07XG4gIH07XG5cbiAgTnVsbFNjcm9sbGJhcnMucHJvdG90eXBlLnNldFNjcm9sbExlZnQgPSBmdW5jdGlvbiAoKSB7fTtcblxuICBOdWxsU2Nyb2xsYmFycy5wcm90b3R5cGUuc2V0U2Nyb2xsVG9wID0gZnVuY3Rpb24gKCkge307XG5cbiAgTnVsbFNjcm9sbGJhcnMucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge307XG5cbiAgZnVuY3Rpb24gdXBkYXRlU2Nyb2xsYmFycyhjbSwgbWVhc3VyZSkge1xuICAgIGlmICghbWVhc3VyZSkge1xuICAgICAgbWVhc3VyZSA9IG1lYXN1cmVGb3JTY3JvbGxiYXJzKGNtKTtcbiAgICB9XG5cbiAgICB2YXIgc3RhcnRXaWR0aCA9IGNtLmRpc3BsYXkuYmFyV2lkdGgsXG4gICAgICAgIHN0YXJ0SGVpZ2h0ID0gY20uZGlzcGxheS5iYXJIZWlnaHQ7XG4gICAgdXBkYXRlU2Nyb2xsYmFyc0lubmVyKGNtLCBtZWFzdXJlKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNCAmJiBzdGFydFdpZHRoICE9IGNtLmRpc3BsYXkuYmFyV2lkdGggfHwgc3RhcnRIZWlnaHQgIT0gY20uZGlzcGxheS5iYXJIZWlnaHQ7IGkrKykge1xuICAgICAgaWYgKHN0YXJ0V2lkdGggIT0gY20uZGlzcGxheS5iYXJXaWR0aCAmJiBjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgICAgICB1cGRhdGVIZWlnaHRzSW5WaWV3cG9ydChjbSk7XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZVNjcm9sbGJhcnNJbm5lcihjbSwgbWVhc3VyZUZvclNjcm9sbGJhcnMoY20pKTtcbiAgICAgIHN0YXJ0V2lkdGggPSBjbS5kaXNwbGF5LmJhcldpZHRoO1xuICAgICAgc3RhcnRIZWlnaHQgPSBjbS5kaXNwbGF5LmJhckhlaWdodDtcbiAgICB9XG4gIH0gLy8gUmUtc3luY2hyb25pemUgdGhlIGZha2Ugc2Nyb2xsYmFycyB3aXRoIHRoZSBhY3R1YWwgc2l6ZSBvZiB0aGVcbiAgLy8gY29udGVudC5cblxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVNjcm9sbGJhcnNJbm5lcihjbSwgbWVhc3VyZSkge1xuICAgIHZhciBkID0gY20uZGlzcGxheTtcbiAgICB2YXIgc2l6ZXMgPSBkLnNjcm9sbGJhcnMudXBkYXRlKG1lYXN1cmUpO1xuICAgIGQuc2l6ZXIuc3R5bGUucGFkZGluZ1JpZ2h0ID0gKGQuYmFyV2lkdGggPSBzaXplcy5yaWdodCkgKyBcInB4XCI7XG4gICAgZC5zaXplci5zdHlsZS5wYWRkaW5nQm90dG9tID0gKGQuYmFySGVpZ2h0ID0gc2l6ZXMuYm90dG9tKSArIFwicHhcIjtcbiAgICBkLmhlaWdodEZvcmNlci5zdHlsZS5ib3JkZXJCb3R0b20gPSBzaXplcy5ib3R0b20gKyBcInB4IHNvbGlkIHRyYW5zcGFyZW50XCI7XG5cbiAgICBpZiAoc2l6ZXMucmlnaHQgJiYgc2l6ZXMuYm90dG9tKSB7XG4gICAgICBkLnNjcm9sbGJhckZpbGxlci5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgZC5zY3JvbGxiYXJGaWxsZXIuc3R5bGUuaGVpZ2h0ID0gc2l6ZXMuYm90dG9tICsgXCJweFwiO1xuICAgICAgZC5zY3JvbGxiYXJGaWxsZXIuc3R5bGUud2lkdGggPSBzaXplcy5yaWdodCArIFwicHhcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgZC5zY3JvbGxiYXJGaWxsZXIuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgfVxuXG4gICAgaWYgKHNpemVzLmJvdHRvbSAmJiBjbS5vcHRpb25zLmNvdmVyR3V0dGVyTmV4dFRvU2Nyb2xsYmFyICYmIGNtLm9wdGlvbnMuZml4ZWRHdXR0ZXIpIHtcbiAgICAgIGQuZ3V0dGVyRmlsbGVyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICBkLmd1dHRlckZpbGxlci5zdHlsZS5oZWlnaHQgPSBzaXplcy5ib3R0b20gKyBcInB4XCI7XG4gICAgICBkLmd1dHRlckZpbGxlci5zdHlsZS53aWR0aCA9IG1lYXN1cmUuZ3V0dGVyV2lkdGggKyBcInB4XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGQuZ3V0dGVyRmlsbGVyLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgIH1cbiAgfVxuXG4gIHZhciBzY3JvbGxiYXJNb2RlbCA9IHtcbiAgICBcIm5hdGl2ZVwiOiBOYXRpdmVTY3JvbGxiYXJzLFxuICAgIFwibnVsbFwiOiBOdWxsU2Nyb2xsYmFyc1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluaXRTY3JvbGxiYXJzKGNtKSB7XG4gICAgaWYgKGNtLmRpc3BsYXkuc2Nyb2xsYmFycykge1xuICAgICAgY20uZGlzcGxheS5zY3JvbGxiYXJzLmNsZWFyKCk7XG5cbiAgICAgIGlmIChjbS5kaXNwbGF5LnNjcm9sbGJhcnMuYWRkQ2xhc3MpIHtcbiAgICAgICAgcm1DbGFzcyhjbS5kaXNwbGF5LndyYXBwZXIsIGNtLmRpc3BsYXkuc2Nyb2xsYmFycy5hZGRDbGFzcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY20uZGlzcGxheS5zY3JvbGxiYXJzID0gbmV3IHNjcm9sbGJhck1vZGVsW2NtLm9wdGlvbnMuc2Nyb2xsYmFyU3R5bGVdKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICBjbS5kaXNwbGF5LndyYXBwZXIuaW5zZXJ0QmVmb3JlKG5vZGUsIGNtLmRpc3BsYXkuc2Nyb2xsYmFyRmlsbGVyKTsgLy8gUHJldmVudCBjbGlja3MgaW4gdGhlIHNjcm9sbGJhcnMgZnJvbSBraWxsaW5nIGZvY3VzXG5cbiAgICAgIG9uKG5vZGUsIFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGNtLnN0YXRlLmZvY3VzZWQpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBjbS5kaXNwbGF5LmlucHV0LmZvY3VzKCk7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbS1ub3QtY29udGVudFwiLCBcInRydWVcIik7XG4gICAgfSwgZnVuY3Rpb24gKHBvcywgYXhpcykge1xuICAgICAgaWYgKGF4aXMgPT0gXCJob3Jpem9udGFsXCIpIHtcbiAgICAgICAgc2V0U2Nyb2xsTGVmdChjbSwgcG9zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFNjcm9sbFRvcChjbSwgcG9zKTtcbiAgICAgIH1cbiAgICB9LCBjbSk7XG5cbiAgICBpZiAoY20uZGlzcGxheS5zY3JvbGxiYXJzLmFkZENsYXNzKSB7XG4gICAgICBhZGRDbGFzcyhjbS5kaXNwbGF5LndyYXBwZXIsIGNtLmRpc3BsYXkuc2Nyb2xsYmFycy5hZGRDbGFzcyk7XG4gICAgfVxuICB9IC8vIFNDUk9MTElORyBUSElOR1MgSU5UTyBWSUVXXG4gIC8vIElmIGFuIGVkaXRvciBzaXRzIG9uIHRoZSB0b3Agb3IgYm90dG9tIG9mIHRoZSB3aW5kb3csIHBhcnRpYWxseVxuICAvLyBzY3JvbGxlZCBvdXQgb2YgdmlldywgdGhpcyBlbnN1cmVzIHRoYXQgdGhlIGN1cnNvciBpcyB2aXNpYmxlLlxuXG5cbiAgZnVuY3Rpb24gbWF5YmVTY3JvbGxXaW5kb3coY20sIGNvb3Jkcykge1xuICAgIGlmIChzaWduYWxET01FdmVudChjbSwgXCJzY3JvbGxDdXJzb3JJbnRvVmlld1wiKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheSxcbiAgICAgICAgYm94ID0gZGlzcGxheS5zaXplci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgZG9TY3JvbGwgPSBudWxsO1xuXG4gICAgaWYgKGNvb3Jkcy50b3AgKyBib3gudG9wIDwgMCkge1xuICAgICAgZG9TY3JvbGwgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoY29vcmRzLmJvdHRvbSArIGJveC50b3AgPiAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpKSB7XG4gICAgICBkb1Njcm9sbCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChkb1Njcm9sbCAhPSBudWxsICYmICFwaGFudG9tKSB7XG4gICAgICB2YXIgc2Nyb2xsTm9kZSA9IGVsdChcImRpdlwiLCBcIlxcdTIwMEJcIiwgbnVsbCwgXCJwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogXCIgKyAoY29vcmRzLnRvcCAtIGRpc3BsYXkudmlld09mZnNldCAtIHBhZGRpbmdUb3AoY20uZGlzcGxheSkpICsgXCJweDtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBcIiArIChjb29yZHMuYm90dG9tIC0gY29vcmRzLnRvcCArIHNjcm9sbEdhcChjbSkgKyBkaXNwbGF5LmJhckhlaWdodCkgKyBcInB4O1xcbiAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBcIiArIGNvb3Jkcy5sZWZ0ICsgXCJweDsgd2lkdGg6IDJweDtcIik7XG4gICAgICBjbS5kaXNwbGF5LmxpbmVTcGFjZS5hcHBlbmRDaGlsZChzY3JvbGxOb2RlKTtcbiAgICAgIHNjcm9sbE5vZGUuc2Nyb2xsSW50b1ZpZXcoZG9TY3JvbGwpO1xuICAgICAgY20uZGlzcGxheS5saW5lU3BhY2UucmVtb3ZlQ2hpbGQoc2Nyb2xsTm9kZSk7XG4gICAgfVxuICB9IC8vIFNjcm9sbCBhIGdpdmVuIHBvc2l0aW9uIGludG8gdmlldyAoaW1tZWRpYXRlbHkpLCB2ZXJpZnlpbmcgdGhhdFxuICAvLyBpdCBhY3R1YWxseSBiZWNhbWUgdmlzaWJsZSAoYXMgbGluZSBoZWlnaHRzIGFyZSBhY2N1cmF0ZWx5XG4gIC8vIG1lYXN1cmVkLCB0aGUgcG9zaXRpb24gb2Ygc29tZXRoaW5nIG1heSAnZHJpZnQnIGR1cmluZyBkcmF3aW5nKS5cblxuXG4gIGZ1bmN0aW9uIHNjcm9sbFBvc0ludG9WaWV3KGNtLCBwb3MsIGVuZCwgbWFyZ2luKSB7XG4gICAgaWYgKG1hcmdpbiA9PSBudWxsKSB7XG4gICAgICBtYXJnaW4gPSAwO1xuICAgIH1cblxuICAgIHZhciBjb29yZHM7XG5cbiAgICBmb3IgKHZhciBsaW1pdCA9IDA7IGxpbWl0IDwgNTsgbGltaXQrKykge1xuICAgICAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgICAgIGNvb3JkcyA9IF9jdXJzb3JDb29yZHMoY20sIHBvcyk7XG4gICAgICB2YXIgZW5kQ29vcmRzID0gIWVuZCB8fCBlbmQgPT0gcG9zID8gY29vcmRzIDogX2N1cnNvckNvb3JkcyhjbSwgZW5kKTtcbiAgICAgIHZhciBzY3JvbGxQb3MgPSBjYWxjdWxhdGVTY3JvbGxQb3MoY20sIE1hdGgubWluKGNvb3Jkcy5sZWZ0LCBlbmRDb29yZHMubGVmdCksIE1hdGgubWluKGNvb3Jkcy50b3AsIGVuZENvb3Jkcy50b3ApIC0gbWFyZ2luLCBNYXRoLm1heChjb29yZHMubGVmdCwgZW5kQ29vcmRzLmxlZnQpLCBNYXRoLm1heChjb29yZHMuYm90dG9tLCBlbmRDb29yZHMuYm90dG9tKSArIG1hcmdpbik7XG4gICAgICB2YXIgc3RhcnRUb3AgPSBjbS5kb2Muc2Nyb2xsVG9wLFxuICAgICAgICAgIHN0YXJ0TGVmdCA9IGNtLmRvYy5zY3JvbGxMZWZ0O1xuXG4gICAgICBpZiAoc2Nyb2xsUG9zLnNjcm9sbFRvcCAhPSBudWxsKSB7XG4gICAgICAgIHNldFNjcm9sbFRvcChjbSwgc2Nyb2xsUG9zLnNjcm9sbFRvcCk7XG5cbiAgICAgICAgaWYgKE1hdGguYWJzKGNtLmRvYy5zY3JvbGxUb3AgLSBzdGFydFRvcCkgPiAxKSB7XG4gICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNjcm9sbFBvcy5zY3JvbGxMZWZ0ICE9IG51bGwpIHtcbiAgICAgICAgc2V0U2Nyb2xsTGVmdChjbSwgc2Nyb2xsUG9zLnNjcm9sbExlZnQpO1xuXG4gICAgICAgIGlmIChNYXRoLmFicyhjbS5kb2Muc2Nyb2xsTGVmdCAtIHN0YXJ0TGVmdCkgPiAxKSB7XG4gICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFjaGFuZ2VkKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb29yZHM7XG4gIH0gLy8gU2Nyb2xsIGEgZ2l2ZW4gc2V0IG9mIGNvb3JkaW5hdGVzIGludG8gdmlldyAoaW1tZWRpYXRlbHkpLlxuXG5cbiAgZnVuY3Rpb24gc2Nyb2xsSW50b1ZpZXcoY20sIHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgdmFyIHNjcm9sbFBvcyA9IGNhbGN1bGF0ZVNjcm9sbFBvcyhjbSwgeDEsIHkxLCB4MiwgeTIpO1xuXG4gICAgaWYgKHNjcm9sbFBvcy5zY3JvbGxUb3AgIT0gbnVsbCkge1xuICAgICAgc2V0U2Nyb2xsVG9wKGNtLCBzY3JvbGxQb3Muc2Nyb2xsVG9wKTtcbiAgICB9XG5cbiAgICBpZiAoc2Nyb2xsUG9zLnNjcm9sbExlZnQgIT0gbnVsbCkge1xuICAgICAgc2V0U2Nyb2xsTGVmdChjbSwgc2Nyb2xsUG9zLnNjcm9sbExlZnQpO1xuICAgIH1cbiAgfSAvLyBDYWxjdWxhdGUgYSBuZXcgc2Nyb2xsIHBvc2l0aW9uIG5lZWRlZCB0byBzY3JvbGwgdGhlIGdpdmVuXG4gIC8vIHJlY3RhbmdsZSBpbnRvIHZpZXcuIFJldHVybnMgYW4gb2JqZWN0IHdpdGggc2Nyb2xsVG9wIGFuZFxuICAvLyBzY3JvbGxMZWZ0IHByb3BlcnRpZXMuIFdoZW4gdGhlc2UgYXJlIHVuZGVmaW5lZCwgdGhlXG4gIC8vIHZlcnRpY2FsL2hvcml6b250YWwgcG9zaXRpb24gZG9lcyBub3QgbmVlZCB0byBiZSBhZGp1c3RlZC5cblxuXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZVNjcm9sbFBvcyhjbSwgeDEsIHkxLCB4MiwgeTIpIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksXG4gICAgICAgIHNuYXBNYXJnaW4gPSB0ZXh0SGVpZ2h0KGNtLmRpc3BsYXkpO1xuXG4gICAgaWYgKHkxIDwgMCkge1xuICAgICAgeTEgPSAwO1xuICAgIH1cblxuICAgIHZhciBzY3JlZW50b3AgPSBjbS5jdXJPcCAmJiBjbS5jdXJPcC5zY3JvbGxUb3AgIT0gbnVsbCA/IGNtLmN1ck9wLnNjcm9sbFRvcCA6IGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsVG9wO1xuICAgIHZhciBzY3JlZW4gPSBkaXNwbGF5SGVpZ2h0KGNtKSxcbiAgICAgICAgcmVzdWx0ID0ge307XG5cbiAgICBpZiAoeTIgLSB5MSA+IHNjcmVlbikge1xuICAgICAgeTIgPSB5MSArIHNjcmVlbjtcbiAgICB9XG5cbiAgICB2YXIgZG9jQm90dG9tID0gY20uZG9jLmhlaWdodCArIHBhZGRpbmdWZXJ0KGRpc3BsYXkpO1xuICAgIHZhciBhdFRvcCA9IHkxIDwgc25hcE1hcmdpbixcbiAgICAgICAgYXRCb3R0b20gPSB5MiA+IGRvY0JvdHRvbSAtIHNuYXBNYXJnaW47XG5cbiAgICBpZiAoeTEgPCBzY3JlZW50b3ApIHtcbiAgICAgIHJlc3VsdC5zY3JvbGxUb3AgPSBhdFRvcCA/IDAgOiB5MTtcbiAgICB9IGVsc2UgaWYgKHkyID4gc2NyZWVudG9wICsgc2NyZWVuKSB7XG4gICAgICB2YXIgbmV3VG9wID0gTWF0aC5taW4oeTEsIChhdEJvdHRvbSA/IGRvY0JvdHRvbSA6IHkyKSAtIHNjcmVlbik7XG5cbiAgICAgIGlmIChuZXdUb3AgIT0gc2NyZWVudG9wKSB7XG4gICAgICAgIHJlc3VsdC5zY3JvbGxUb3AgPSBuZXdUb3A7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHNjcmVlbmxlZnQgPSBjbS5jdXJPcCAmJiBjbS5jdXJPcC5zY3JvbGxMZWZ0ICE9IG51bGwgPyBjbS5jdXJPcC5zY3JvbGxMZWZ0IDogZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0O1xuICAgIHZhciBzY3JlZW53ID0gZGlzcGxheVdpZHRoKGNtKSAtIChjbS5vcHRpb25zLmZpeGVkR3V0dGVyID8gZGlzcGxheS5ndXR0ZXJzLm9mZnNldFdpZHRoIDogMCk7XG4gICAgdmFyIHRvb1dpZGUgPSB4MiAtIHgxID4gc2NyZWVudztcblxuICAgIGlmICh0b29XaWRlKSB7XG4gICAgICB4MiA9IHgxICsgc2NyZWVudztcbiAgICB9XG5cbiAgICBpZiAoeDEgPCAxMCkge1xuICAgICAgcmVzdWx0LnNjcm9sbExlZnQgPSAwO1xuICAgIH0gZWxzZSBpZiAoeDEgPCBzY3JlZW5sZWZ0KSB7XG4gICAgICByZXN1bHQuc2Nyb2xsTGVmdCA9IE1hdGgubWF4KDAsIHgxIC0gKHRvb1dpZGUgPyAwIDogMTApKTtcbiAgICB9IGVsc2UgaWYgKHgyID4gc2NyZWVudyArIHNjcmVlbmxlZnQgLSAzKSB7XG4gICAgICByZXN1bHQuc2Nyb2xsTGVmdCA9IHgyICsgKHRvb1dpZGUgPyAwIDogMTApIC0gc2NyZWVudztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IC8vIFN0b3JlIGEgcmVsYXRpdmUgYWRqdXN0bWVudCB0byB0aGUgc2Nyb2xsIHBvc2l0aW9uIGluIHRoZSBjdXJyZW50XG4gIC8vIG9wZXJhdGlvbiAodG8gYmUgYXBwbGllZCB3aGVuIHRoZSBvcGVyYXRpb24gZmluaXNoZXMpLlxuXG5cbiAgZnVuY3Rpb24gYWRkVG9TY3JvbGxQb3MoY20sIGxlZnQsIHRvcCkge1xuICAgIGlmIChsZWZ0ICE9IG51bGwgfHwgdG9wICE9IG51bGwpIHtcbiAgICAgIHJlc29sdmVTY3JvbGxUb1BvcyhjbSk7XG4gICAgfVxuXG4gICAgaWYgKGxlZnQgIT0gbnVsbCkge1xuICAgICAgY20uY3VyT3Auc2Nyb2xsTGVmdCA9IChjbS5jdXJPcC5zY3JvbGxMZWZ0ID09IG51bGwgPyBjbS5kb2Muc2Nyb2xsTGVmdCA6IGNtLmN1ck9wLnNjcm9sbExlZnQpICsgbGVmdDtcbiAgICB9XG5cbiAgICBpZiAodG9wICE9IG51bGwpIHtcbiAgICAgIGNtLmN1ck9wLnNjcm9sbFRvcCA9IChjbS5jdXJPcC5zY3JvbGxUb3AgPT0gbnVsbCA/IGNtLmRvYy5zY3JvbGxUb3AgOiBjbS5jdXJPcC5zY3JvbGxUb3ApICsgdG9wO1xuICAgIH1cbiAgfSAvLyBNYWtlIHN1cmUgdGhhdCBhdCB0aGUgZW5kIG9mIHRoZSBvcGVyYXRpb24gdGhlIGN1cnJlbnQgY3Vyc29yIGlzXG4gIC8vIHNob3duLlxuXG5cbiAgZnVuY3Rpb24gZW5zdXJlQ3Vyc29yVmlzaWJsZShjbSkge1xuICAgIHJlc29sdmVTY3JvbGxUb1BvcyhjbSk7XG4gICAgdmFyIGN1ciA9IGNtLmdldEN1cnNvcigpLFxuICAgICAgICBmcm9tID0gY3VyLFxuICAgICAgICB0byA9IGN1cjtcblxuICAgIGlmICghY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIHtcbiAgICAgIGZyb20gPSBjdXIuY2ggPyBQb3MoY3VyLmxpbmUsIGN1ci5jaCAtIDEpIDogY3VyO1xuICAgICAgdG8gPSBQb3MoY3VyLmxpbmUsIGN1ci5jaCArIDEpO1xuICAgIH1cblxuICAgIGNtLmN1ck9wLnNjcm9sbFRvUG9zID0ge1xuICAgICAgZnJvbTogZnJvbSxcbiAgICAgIHRvOiB0byxcbiAgICAgIG1hcmdpbjogY20ub3B0aW9ucy5jdXJzb3JTY3JvbGxNYXJnaW4sXG4gICAgICBpc0N1cnNvcjogdHJ1ZVxuICAgIH07XG4gIH0gLy8gV2hlbiBhbiBvcGVyYXRpb24gaGFzIGl0cyBzY3JvbGxUb1BvcyBwcm9wZXJ0eSBzZXQsIGFuZCBhbm90aGVyXG4gIC8vIHNjcm9sbCBhY3Rpb24gaXMgYXBwbGllZCBiZWZvcmUgdGhlIGVuZCBvZiB0aGUgb3BlcmF0aW9uLCB0aGlzXG4gIC8vICdzaW11bGF0ZXMnIHNjcm9sbGluZyB0aGF0IHBvc2l0aW9uIGludG8gdmlldyBpbiBhIGNoZWFwIHdheSwgc29cbiAgLy8gdGhhdCB0aGUgZWZmZWN0IG9mIGludGVybWVkaWF0ZSBzY3JvbGwgY29tbWFuZHMgaXMgbm90IGlnbm9yZWQuXG5cblxuICBmdW5jdGlvbiByZXNvbHZlU2Nyb2xsVG9Qb3MoY20pIHtcbiAgICB2YXIgcmFuZ2UgPSBjbS5jdXJPcC5zY3JvbGxUb1BvcztcblxuICAgIGlmIChyYW5nZSkge1xuICAgICAgY20uY3VyT3Auc2Nyb2xsVG9Qb3MgPSBudWxsO1xuICAgICAgdmFyIGZyb20gPSBlc3RpbWF0ZUNvb3JkcyhjbSwgcmFuZ2UuZnJvbSksXG4gICAgICAgICAgdG8gPSBlc3RpbWF0ZUNvb3JkcyhjbSwgcmFuZ2UudG8pO1xuICAgICAgdmFyIHNQb3MgPSBjYWxjdWxhdGVTY3JvbGxQb3MoY20sIE1hdGgubWluKGZyb20ubGVmdCwgdG8ubGVmdCksIE1hdGgubWluKGZyb20udG9wLCB0by50b3ApIC0gcmFuZ2UubWFyZ2luLCBNYXRoLm1heChmcm9tLnJpZ2h0LCB0by5yaWdodCksIE1hdGgubWF4KGZyb20uYm90dG9tLCB0by5ib3R0b20pICsgcmFuZ2UubWFyZ2luKTtcbiAgICAgIGNtLnNjcm9sbFRvKHNQb3Muc2Nyb2xsTGVmdCwgc1Bvcy5zY3JvbGxUb3ApO1xuICAgIH1cbiAgfSAvLyBPcGVyYXRpb25zIGFyZSB1c2VkIHRvIHdyYXAgYSBzZXJpZXMgb2YgY2hhbmdlcyB0byB0aGUgZWRpdG9yXG4gIC8vIHN0YXRlIGluIHN1Y2ggYSB3YXkgdGhhdCBlYWNoIGNoYW5nZSB3b24ndCBoYXZlIHRvIHVwZGF0ZSB0aGVcbiAgLy8gY3Vyc29yIGFuZCBkaXNwbGF5ICh3aGljaCB3b3VsZCBiZSBhd2t3YXJkLCBzbG93LCBhbmRcbiAgLy8gZXJyb3ItcHJvbmUpLiBJbnN0ZWFkLCBkaXNwbGF5IHVwZGF0ZXMgYXJlIGJhdGNoZWQgYW5kIHRoZW4gYWxsXG4gIC8vIGNvbWJpbmVkIGFuZCBleGVjdXRlZCBhdCBvbmNlLlxuXG5cbiAgdmFyIG5leHRPcElkID0gMDsgLy8gU3RhcnQgYSBuZXcgb3BlcmF0aW9uLlxuXG4gIGZ1bmN0aW9uIHN0YXJ0T3BlcmF0aW9uKGNtKSB7XG4gICAgY20uY3VyT3AgPSB7XG4gICAgICBjbTogY20sXG4gICAgICB2aWV3Q2hhbmdlZDogZmFsc2UsXG4gICAgICAvLyBGbGFnIHRoYXQgaW5kaWNhdGVzIHRoYXQgbGluZXMgbWlnaHQgbmVlZCB0byBiZSByZWRyYXduXG4gICAgICBzdGFydEhlaWdodDogY20uZG9jLmhlaWdodCxcbiAgICAgIC8vIFVzZWQgdG8gZGV0ZWN0IG5lZWQgdG8gdXBkYXRlIHNjcm9sbGJhclxuICAgICAgZm9yY2VVcGRhdGU6IGZhbHNlLFxuICAgICAgLy8gVXNlZCB0byBmb3JjZSBhIHJlZHJhd1xuICAgICAgdXBkYXRlSW5wdXQ6IG51bGwsXG4gICAgICAvLyBXaGV0aGVyIHRvIHJlc2V0IHRoZSBpbnB1dCB0ZXh0YXJlYVxuICAgICAgdHlwaW5nOiBmYWxzZSxcbiAgICAgIC8vIFdoZXRoZXIgdGhpcyByZXNldCBzaG91bGQgYmUgY2FyZWZ1bCB0byBsZWF2ZSBleGlzdGluZyB0ZXh0IChmb3IgY29tcG9zaXRpbmcpXG4gICAgICBjaGFuZ2VPYmpzOiBudWxsLFxuICAgICAgLy8gQWNjdW11bGF0ZWQgY2hhbmdlcywgZm9yIGZpcmluZyBjaGFuZ2UgZXZlbnRzXG4gICAgICBjdXJzb3JBY3Rpdml0eUhhbmRsZXJzOiBudWxsLFxuICAgICAgLy8gU2V0IG9mIGhhbmRsZXJzIHRvIGZpcmUgY3Vyc29yQWN0aXZpdHkgb25cbiAgICAgIGN1cnNvckFjdGl2aXR5Q2FsbGVkOiAwLFxuICAgICAgLy8gVHJhY2tzIHdoaWNoIGN1cnNvckFjdGl2aXR5IGhhbmRsZXJzIGhhdmUgYmVlbiBjYWxsZWQgYWxyZWFkeVxuICAgICAgc2VsZWN0aW9uQ2hhbmdlZDogZmFsc2UsXG4gICAgICAvLyBXaGV0aGVyIHRoZSBzZWxlY3Rpb24gbmVlZHMgdG8gYmUgcmVkcmF3blxuICAgICAgdXBkYXRlTWF4TGluZTogZmFsc2UsXG4gICAgICAvLyBTZXQgd2hlbiB0aGUgd2lkZXN0IGxpbmUgbmVlZHMgdG8gYmUgZGV0ZXJtaW5lZCBhbmV3XG4gICAgICBzY3JvbGxMZWZ0OiBudWxsLFxuICAgICAgc2Nyb2xsVG9wOiBudWxsLFxuICAgICAgLy8gSW50ZXJtZWRpYXRlIHNjcm9sbCBwb3NpdGlvbiwgbm90IHB1c2hlZCB0byBET00geWV0XG4gICAgICBzY3JvbGxUb1BvczogbnVsbCxcbiAgICAgIC8vIFVzZWQgdG8gc2Nyb2xsIHRvIGEgc3BlY2lmaWMgcG9zaXRpb25cbiAgICAgIGZvY3VzOiBmYWxzZSxcbiAgICAgIGlkOiArK25leHRPcElkIC8vIFVuaXF1ZSBJRFxuXG4gICAgfTtcbiAgICBwdXNoT3BlcmF0aW9uKGNtLmN1ck9wKTtcbiAgfSAvLyBGaW5pc2ggYW4gb3BlcmF0aW9uLCB1cGRhdGluZyB0aGUgZGlzcGxheSBhbmQgc2lnbmFsbGluZyBkZWxheWVkIGV2ZW50c1xuXG5cbiAgZnVuY3Rpb24gZW5kT3BlcmF0aW9uKGNtKSB7XG4gICAgdmFyIG9wID0gY20uY3VyT3A7XG4gICAgZmluaXNoT3BlcmF0aW9uKG9wLCBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdXAub3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGdyb3VwLm9wc1tpXS5jbS5jdXJPcCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGVuZE9wZXJhdGlvbnMoZ3JvdXApO1xuICAgIH0pO1xuICB9IC8vIFRoZSBET00gdXBkYXRlcyBkb25lIHdoZW4gYW4gb3BlcmF0aW9uIGZpbmlzaGVzIGFyZSBiYXRjaGVkIHNvXG4gIC8vIHRoYXQgdGhlIG1pbmltdW0gbnVtYmVyIG9mIHJlbGF5b3V0cyBhcmUgcmVxdWlyZWQuXG5cblxuICBmdW5jdGlvbiBlbmRPcGVyYXRpb25zKGdyb3VwKSB7XG4gICAgdmFyIG9wcyA9IGdyb3VwLm9wcztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3BzLmxlbmd0aDsgaSsrKSAvLyBSZWFkIERPTVxuICAgIHtcbiAgICAgIGVuZE9wZXJhdGlvbl9SMShvcHNbaV0pO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IG9wcy5sZW5ndGg7IGkkMSsrKSAvLyBXcml0ZSBET00gKG1heWJlKVxuICAgIHtcbiAgICAgIGVuZE9wZXJhdGlvbl9XMShvcHNbaSQxXSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSQyID0gMDsgaSQyIDwgb3BzLmxlbmd0aDsgaSQyKyspIC8vIFJlYWQgRE9NXG4gICAge1xuICAgICAgZW5kT3BlcmF0aW9uX1IyKG9wc1tpJDJdKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpJDMgPSAwOyBpJDMgPCBvcHMubGVuZ3RoOyBpJDMrKykgLy8gV3JpdGUgRE9NIChtYXliZSlcbiAgICB7XG4gICAgICBlbmRPcGVyYXRpb25fVzIob3BzW2kkM10pO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkkNCA9IDA7IGkkNCA8IG9wcy5sZW5ndGg7IGkkNCsrKSAvLyBSZWFkIERPTVxuICAgIHtcbiAgICAgIGVuZE9wZXJhdGlvbl9maW5pc2gob3BzW2kkNF0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVuZE9wZXJhdGlvbl9SMShvcCkge1xuICAgIHZhciBjbSA9IG9wLmNtLFxuICAgICAgICBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgICBtYXliZUNsaXBTY3JvbGxiYXJzKGNtKTtcblxuICAgIGlmIChvcC51cGRhdGVNYXhMaW5lKSB7XG4gICAgICBmaW5kTWF4TGluZShjbSk7XG4gICAgfVxuXG4gICAgb3AubXVzdFVwZGF0ZSA9IG9wLnZpZXdDaGFuZ2VkIHx8IG9wLmZvcmNlVXBkYXRlIHx8IG9wLnNjcm9sbFRvcCAhPSBudWxsIHx8IG9wLnNjcm9sbFRvUG9zICYmIChvcC5zY3JvbGxUb1Bvcy5mcm9tLmxpbmUgPCBkaXNwbGF5LnZpZXdGcm9tIHx8IG9wLnNjcm9sbFRvUG9zLnRvLmxpbmUgPj0gZGlzcGxheS52aWV3VG8pIHx8IGRpc3BsYXkubWF4TGluZUNoYW5nZWQgJiYgY20ub3B0aW9ucy5saW5lV3JhcHBpbmc7XG4gICAgb3AudXBkYXRlID0gb3AubXVzdFVwZGF0ZSAmJiBuZXcgRGlzcGxheVVwZGF0ZShjbSwgb3AubXVzdFVwZGF0ZSAmJiB7XG4gICAgICB0b3A6IG9wLnNjcm9sbFRvcCxcbiAgICAgIGVuc3VyZTogb3Auc2Nyb2xsVG9Qb3NcbiAgICB9LCBvcC5mb3JjZVVwZGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBlbmRPcGVyYXRpb25fVzEob3ApIHtcbiAgICBvcC51cGRhdGVkRGlzcGxheSA9IG9wLm11c3RVcGRhdGUgJiYgdXBkYXRlRGlzcGxheUlmTmVlZGVkKG9wLmNtLCBvcC51cGRhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gZW5kT3BlcmF0aW9uX1IyKG9wKSB7XG4gICAgdmFyIGNtID0gb3AuY20sXG4gICAgICAgIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuXG4gICAgaWYgKG9wLnVwZGF0ZWREaXNwbGF5KSB7XG4gICAgICB1cGRhdGVIZWlnaHRzSW5WaWV3cG9ydChjbSk7XG4gICAgfVxuXG4gICAgb3AuYmFyTWVhc3VyZSA9IG1lYXN1cmVGb3JTY3JvbGxiYXJzKGNtKTsgLy8gSWYgdGhlIG1heCBsaW5lIGNoYW5nZWQgc2luY2UgaXQgd2FzIGxhc3QgbWVhc3VyZWQsIG1lYXN1cmUgaXQsXG4gICAgLy8gYW5kIGVuc3VyZSB0aGUgZG9jdW1lbnQncyB3aWR0aCBtYXRjaGVzIGl0LlxuICAgIC8vIHVwZGF0ZURpc3BsYXlfVzIgd2lsbCB1c2UgdGhlc2UgcHJvcGVydGllcyB0byBkbyB0aGUgYWN0dWFsIHJlc2l6aW5nXG5cbiAgICBpZiAoZGlzcGxheS5tYXhMaW5lQ2hhbmdlZCAmJiAhY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIHtcbiAgICAgIG9wLmFkanVzdFdpZHRoVG8gPSBtZWFzdXJlQ2hhcihjbSwgZGlzcGxheS5tYXhMaW5lLCBkaXNwbGF5Lm1heExpbmUudGV4dC5sZW5ndGgpLmxlZnQgKyAzO1xuICAgICAgY20uZGlzcGxheS5zaXplcldpZHRoID0gb3AuYWRqdXN0V2lkdGhUbztcbiAgICAgIG9wLmJhck1lYXN1cmUuc2Nyb2xsV2lkdGggPSBNYXRoLm1heChkaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoLCBkaXNwbGF5LnNpemVyLm9mZnNldExlZnQgKyBvcC5hZGp1c3RXaWR0aFRvICsgc2Nyb2xsR2FwKGNtKSArIGNtLmRpc3BsYXkuYmFyV2lkdGgpO1xuICAgICAgb3AubWF4U2Nyb2xsTGVmdCA9IE1hdGgubWF4KDAsIGRpc3BsYXkuc2l6ZXIub2Zmc2V0TGVmdCArIG9wLmFkanVzdFdpZHRoVG8gLSBkaXNwbGF5V2lkdGgoY20pKTtcbiAgICB9XG5cbiAgICBpZiAob3AudXBkYXRlZERpc3BsYXkgfHwgb3Auc2VsZWN0aW9uQ2hhbmdlZCkge1xuICAgICAgb3AucHJlcGFyZWRTZWxlY3Rpb24gPSBkaXNwbGF5LmlucHV0LnByZXBhcmVTZWxlY3Rpb24ob3AuZm9jdXMpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVuZE9wZXJhdGlvbl9XMihvcCkge1xuICAgIHZhciBjbSA9IG9wLmNtO1xuXG4gICAgaWYgKG9wLmFkanVzdFdpZHRoVG8gIT0gbnVsbCkge1xuICAgICAgY20uZGlzcGxheS5zaXplci5zdHlsZS5taW5XaWR0aCA9IG9wLmFkanVzdFdpZHRoVG8gKyBcInB4XCI7XG5cbiAgICAgIGlmIChvcC5tYXhTY3JvbGxMZWZ0IDwgY20uZG9jLnNjcm9sbExlZnQpIHtcbiAgICAgICAgc2V0U2Nyb2xsTGVmdChjbSwgTWF0aC5taW4oY20uZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0LCBvcC5tYXhTY3JvbGxMZWZ0KSwgdHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIGNtLmRpc3BsYXkubWF4TGluZUNoYW5nZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgdGFrZUZvY3VzID0gb3AuZm9jdXMgJiYgb3AuZm9jdXMgPT0gYWN0aXZlRWx0KCkgJiYgKCFkb2N1bWVudC5oYXNGb2N1cyB8fCBkb2N1bWVudC5oYXNGb2N1cygpKTtcblxuICAgIGlmIChvcC5wcmVwYXJlZFNlbGVjdGlvbikge1xuICAgICAgY20uZGlzcGxheS5pbnB1dC5zaG93U2VsZWN0aW9uKG9wLnByZXBhcmVkU2VsZWN0aW9uLCB0YWtlRm9jdXMpO1xuICAgIH1cblxuICAgIGlmIChvcC51cGRhdGVkRGlzcGxheSB8fCBvcC5zdGFydEhlaWdodCAhPSBjbS5kb2MuaGVpZ2h0KSB7XG4gICAgICB1cGRhdGVTY3JvbGxiYXJzKGNtLCBvcC5iYXJNZWFzdXJlKTtcbiAgICB9XG5cbiAgICBpZiAob3AudXBkYXRlZERpc3BsYXkpIHtcbiAgICAgIHNldERvY3VtZW50SGVpZ2h0KGNtLCBvcC5iYXJNZWFzdXJlKTtcbiAgICB9XG5cbiAgICBpZiAob3Auc2VsZWN0aW9uQ2hhbmdlZCkge1xuICAgICAgcmVzdGFydEJsaW5rKGNtKTtcbiAgICB9XG5cbiAgICBpZiAoY20uc3RhdGUuZm9jdXNlZCAmJiBvcC51cGRhdGVJbnB1dCkge1xuICAgICAgY20uZGlzcGxheS5pbnB1dC5yZXNldChvcC50eXBpbmcpO1xuICAgIH1cblxuICAgIGlmICh0YWtlRm9jdXMpIHtcbiAgICAgIGVuc3VyZUZvY3VzKG9wLmNtKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbmRPcGVyYXRpb25fZmluaXNoKG9wKSB7XG4gICAgdmFyIGNtID0gb3AuY20sXG4gICAgICAgIGRpc3BsYXkgPSBjbS5kaXNwbGF5LFxuICAgICAgICBkb2MgPSBjbS5kb2M7XG5cbiAgICBpZiAob3AudXBkYXRlZERpc3BsYXkpIHtcbiAgICAgIHBvc3RVcGRhdGVEaXNwbGF5KGNtLCBvcC51cGRhdGUpO1xuICAgIH0gLy8gQWJvcnQgbW91c2Ugd2hlZWwgZGVsdGEgbWVhc3VyZW1lbnQsIHdoZW4gc2Nyb2xsaW5nIGV4cGxpY2l0bHlcblxuXG4gICAgaWYgKGRpc3BsYXkud2hlZWxTdGFydFggIT0gbnVsbCAmJiAob3Auc2Nyb2xsVG9wICE9IG51bGwgfHwgb3Auc2Nyb2xsTGVmdCAhPSBudWxsIHx8IG9wLnNjcm9sbFRvUG9zKSkge1xuICAgICAgZGlzcGxheS53aGVlbFN0YXJ0WCA9IGRpc3BsYXkud2hlZWxTdGFydFkgPSBudWxsO1xuICAgIH0gLy8gUHJvcGFnYXRlIHRoZSBzY3JvbGwgcG9zaXRpb24gdG8gdGhlIGFjdHVhbCBET00gc2Nyb2xsZXJcblxuXG4gICAgaWYgKG9wLnNjcm9sbFRvcCAhPSBudWxsICYmIChkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcCAhPSBvcC5zY3JvbGxUb3AgfHwgb3AuZm9yY2VTY3JvbGwpKSB7XG4gICAgICBkb2Muc2Nyb2xsVG9wID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oZGlzcGxheS5zY3JvbGxlci5zY3JvbGxIZWlnaHQgLSBkaXNwbGF5LnNjcm9sbGVyLmNsaWVudEhlaWdodCwgb3Auc2Nyb2xsVG9wKSk7XG4gICAgICBkaXNwbGF5LnNjcm9sbGJhcnMuc2V0U2Nyb2xsVG9wKGRvYy5zY3JvbGxUb3ApO1xuICAgICAgZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3AgPSBkb2Muc2Nyb2xsVG9wO1xuICAgIH1cblxuICAgIGlmIChvcC5zY3JvbGxMZWZ0ICE9IG51bGwgJiYgKGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsTGVmdCAhPSBvcC5zY3JvbGxMZWZ0IHx8IG9wLmZvcmNlU2Nyb2xsKSkge1xuICAgICAgZG9jLnNjcm9sbExlZnQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFdpZHRoIC0gZGlzcGxheS5zY3JvbGxlci5jbGllbnRXaWR0aCwgb3Auc2Nyb2xsTGVmdCkpO1xuICAgICAgZGlzcGxheS5zY3JvbGxiYXJzLnNldFNjcm9sbExlZnQoZG9jLnNjcm9sbExlZnQpO1xuICAgICAgZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0ID0gZG9jLnNjcm9sbExlZnQ7XG4gICAgICBhbGlnbkhvcml6b250YWxseShjbSk7XG4gICAgfSAvLyBJZiB3ZSBuZWVkIHRvIHNjcm9sbCBhIHNwZWNpZmljIHBvc2l0aW9uIGludG8gdmlldywgZG8gc28uXG5cblxuICAgIGlmIChvcC5zY3JvbGxUb1Bvcykge1xuICAgICAgdmFyIGNvb3JkcyA9IHNjcm9sbFBvc0ludG9WaWV3KGNtLCBfY2xpcFBvcyhkb2MsIG9wLnNjcm9sbFRvUG9zLmZyb20pLCBfY2xpcFBvcyhkb2MsIG9wLnNjcm9sbFRvUG9zLnRvKSwgb3Auc2Nyb2xsVG9Qb3MubWFyZ2luKTtcblxuICAgICAgaWYgKG9wLnNjcm9sbFRvUG9zLmlzQ3Vyc29yICYmIGNtLnN0YXRlLmZvY3VzZWQpIHtcbiAgICAgICAgbWF5YmVTY3JvbGxXaW5kb3coY20sIGNvb3Jkcyk7XG4gICAgICB9XG4gICAgfSAvLyBGaXJlIGV2ZW50cyBmb3IgbWFya2VycyB0aGF0IGFyZSBoaWRkZW4vdW5pZGRlbiBieSBlZGl0aW5nIG9yXG4gICAgLy8gdW5kb2luZ1xuXG5cbiAgICB2YXIgaGlkZGVuID0gb3AubWF5YmVIaWRkZW5NYXJrZXJzLFxuICAgICAgICB1bmhpZGRlbiA9IG9wLm1heWJlVW5oaWRkZW5NYXJrZXJzO1xuXG4gICAgaWYgKGhpZGRlbikge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoaWRkZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKCFoaWRkZW5baV0ubGluZXMubGVuZ3RoKSB7XG4gICAgICAgICAgc2lnbmFsKGhpZGRlbltpXSwgXCJoaWRlXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHVuaGlkZGVuKSB7XG4gICAgICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCB1bmhpZGRlbi5sZW5ndGg7ICsraSQxKSB7XG4gICAgICAgIGlmICh1bmhpZGRlbltpJDFdLmxpbmVzLmxlbmd0aCkge1xuICAgICAgICAgIHNpZ25hbCh1bmhpZGRlbltpJDFdLCBcInVuaGlkZVwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkaXNwbGF5LndyYXBwZXIub2Zmc2V0SGVpZ2h0KSB7XG4gICAgICBkb2Muc2Nyb2xsVG9wID0gY20uZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3A7XG4gICAgfSAvLyBGaXJlIGNoYW5nZSBldmVudHMsIGFuZCBkZWxheWVkIGV2ZW50IGhhbmRsZXJzXG5cblxuICAgIGlmIChvcC5jaGFuZ2VPYmpzKSB7XG4gICAgICBzaWduYWwoY20sIFwiY2hhbmdlc1wiLCBjbSwgb3AuY2hhbmdlT2Jqcyk7XG4gICAgfVxuXG4gICAgaWYgKG9wLnVwZGF0ZSkge1xuICAgICAgb3AudXBkYXRlLmZpbmlzaCgpO1xuICAgIH1cbiAgfSAvLyBSdW4gdGhlIGdpdmVuIGZ1bmN0aW9uIGluIGFuIG9wZXJhdGlvblxuXG5cbiAgZnVuY3Rpb24gcnVuSW5PcChjbSwgZikge1xuICAgIGlmIChjbS5jdXJPcCkge1xuICAgICAgcmV0dXJuIGYoKTtcbiAgICB9XG5cbiAgICBzdGFydE9wZXJhdGlvbihjbSk7XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGYoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgZW5kT3BlcmF0aW9uKGNtKTtcbiAgICB9XG4gIH0gLy8gV3JhcHMgYSBmdW5jdGlvbiBpbiBhbiBvcGVyYXRpb24uIFJldHVybnMgdGhlIHdyYXBwZWQgZnVuY3Rpb24uXG5cblxuICBmdW5jdGlvbiBvcGVyYXRpb24oY20sIGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGNtLmN1ck9wKSB7XG4gICAgICAgIHJldHVybiBmLmFwcGx5KGNtLCBhcmd1bWVudHMpO1xuICAgICAgfVxuXG4gICAgICBzdGFydE9wZXJhdGlvbihjbSk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBmLmFwcGx5KGNtLCBhcmd1bWVudHMpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZW5kT3BlcmF0aW9uKGNtKTtcbiAgICAgIH1cbiAgICB9O1xuICB9IC8vIFVzZWQgdG8gYWRkIG1ldGhvZHMgdG8gZWRpdG9yIGFuZCBkb2MgaW5zdGFuY2VzLCB3cmFwcGluZyB0aGVtIGluXG4gIC8vIG9wZXJhdGlvbnMuXG5cblxuICBmdW5jdGlvbiBtZXRob2RPcChmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLmN1ck9wKSB7XG4gICAgICAgIHJldHVybiBmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG5cbiAgICAgIHN0YXJ0T3BlcmF0aW9uKHRoaXMpO1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZW5kT3BlcmF0aW9uKHRoaXMpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBkb2NNZXRob2RPcChmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjbSA9IHRoaXMuY207XG5cbiAgICAgIGlmICghY20gfHwgY20uY3VyT3ApIHtcbiAgICAgICAgcmV0dXJuIGYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cblxuICAgICAgc3RhcnRPcGVyYXRpb24oY20pO1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZW5kT3BlcmF0aW9uKGNtKTtcbiAgICAgIH1cbiAgICB9O1xuICB9IC8vIFVwZGF0ZXMgdGhlIGRpc3BsYXkudmlldyBkYXRhIHN0cnVjdHVyZSBmb3IgYSBnaXZlbiBjaGFuZ2UgdG8gdGhlXG4gIC8vIGRvY3VtZW50LiBGcm9tIGFuZCB0byBhcmUgaW4gcHJlLWNoYW5nZSBjb29yZGluYXRlcy4gTGVuZGlmZiBpc1xuICAvLyB0aGUgYW1vdW50IG9mIGxpbmVzIGFkZGVkIG9yIHN1YnRyYWN0ZWQgYnkgdGhlIGNoYW5nZS4gVGhpcyBpc1xuICAvLyB1c2VkIGZvciBjaGFuZ2VzIHRoYXQgc3BhbiBtdWx0aXBsZSBsaW5lcywgb3IgY2hhbmdlIHRoZSB3YXlcbiAgLy8gbGluZXMgYXJlIGRpdmlkZWQgaW50byB2aXN1YWwgbGluZXMuIHJlZ0xpbmVDaGFuZ2UgKGJlbG93KVxuICAvLyByZWdpc3RlcnMgc2luZ2xlLWxpbmUgY2hhbmdlcy5cblxuXG4gIGZ1bmN0aW9uIHJlZ0NoYW5nZShjbSwgZnJvbSwgdG8sIGxlbmRpZmYpIHtcbiAgICBpZiAoZnJvbSA9PSBudWxsKSB7XG4gICAgICBmcm9tID0gY20uZG9jLmZpcnN0O1xuICAgIH1cblxuICAgIGlmICh0byA9PSBudWxsKSB7XG4gICAgICB0byA9IGNtLmRvYy5maXJzdCArIGNtLmRvYy5zaXplO1xuICAgIH1cblxuICAgIGlmICghbGVuZGlmZikge1xuICAgICAgbGVuZGlmZiA9IDA7XG4gICAgfVxuXG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuXG4gICAgaWYgKGxlbmRpZmYgJiYgdG8gPCBkaXNwbGF5LnZpZXdUbyAmJiAoZGlzcGxheS51cGRhdGVMaW5lTnVtYmVycyA9PSBudWxsIHx8IGRpc3BsYXkudXBkYXRlTGluZU51bWJlcnMgPiBmcm9tKSkge1xuICAgICAgZGlzcGxheS51cGRhdGVMaW5lTnVtYmVycyA9IGZyb207XG4gICAgfVxuXG4gICAgY20uY3VyT3Audmlld0NoYW5nZWQgPSB0cnVlO1xuXG4gICAgaWYgKGZyb20gPj0gZGlzcGxheS52aWV3VG8pIHtcbiAgICAgIC8vIENoYW5nZSBhZnRlclxuICAgICAgaWYgKHNhd0NvbGxhcHNlZFNwYW5zICYmIHZpc3VhbExpbmVObyhjbS5kb2MsIGZyb20pIDwgZGlzcGxheS52aWV3VG8pIHtcbiAgICAgICAgcmVzZXRWaWV3KGNtKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRvIDw9IGRpc3BsYXkudmlld0Zyb20pIHtcbiAgICAgIC8vIENoYW5nZSBiZWZvcmVcbiAgICAgIGlmIChzYXdDb2xsYXBzZWRTcGFucyAmJiB2aXN1YWxMaW5lRW5kTm8oY20uZG9jLCB0byArIGxlbmRpZmYpID4gZGlzcGxheS52aWV3RnJvbSkge1xuICAgICAgICByZXNldFZpZXcoY20pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlzcGxheS52aWV3RnJvbSArPSBsZW5kaWZmO1xuICAgICAgICBkaXNwbGF5LnZpZXdUbyArPSBsZW5kaWZmO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZnJvbSA8PSBkaXNwbGF5LnZpZXdGcm9tICYmIHRvID49IGRpc3BsYXkudmlld1RvKSB7XG4gICAgICAvLyBGdWxsIG92ZXJsYXBcbiAgICAgIHJlc2V0VmlldyhjbSk7XG4gICAgfSBlbHNlIGlmIChmcm9tIDw9IGRpc3BsYXkudmlld0Zyb20pIHtcbiAgICAgIC8vIFRvcCBvdmVybGFwXG4gICAgICB2YXIgY3V0ID0gdmlld0N1dHRpbmdQb2ludChjbSwgdG8sIHRvICsgbGVuZGlmZiwgMSk7XG5cbiAgICAgIGlmIChjdXQpIHtcbiAgICAgICAgZGlzcGxheS52aWV3ID0gZGlzcGxheS52aWV3LnNsaWNlKGN1dC5pbmRleCk7XG4gICAgICAgIGRpc3BsYXkudmlld0Zyb20gPSBjdXQubGluZU47XG4gICAgICAgIGRpc3BsYXkudmlld1RvICs9IGxlbmRpZmY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNldFZpZXcoY20pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodG8gPj0gZGlzcGxheS52aWV3VG8pIHtcbiAgICAgIC8vIEJvdHRvbSBvdmVybGFwXG4gICAgICB2YXIgY3V0JDEgPSB2aWV3Q3V0dGluZ1BvaW50KGNtLCBmcm9tLCBmcm9tLCAtMSk7XG5cbiAgICAgIGlmIChjdXQkMSkge1xuICAgICAgICBkaXNwbGF5LnZpZXcgPSBkaXNwbGF5LnZpZXcuc2xpY2UoMCwgY3V0JDEuaW5kZXgpO1xuICAgICAgICBkaXNwbGF5LnZpZXdUbyA9IGN1dCQxLmxpbmVOO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzZXRWaWV3KGNtKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gR2FwIGluIHRoZSBtaWRkbGVcbiAgICAgIHZhciBjdXRUb3AgPSB2aWV3Q3V0dGluZ1BvaW50KGNtLCBmcm9tLCBmcm9tLCAtMSk7XG4gICAgICB2YXIgY3V0Qm90ID0gdmlld0N1dHRpbmdQb2ludChjbSwgdG8sIHRvICsgbGVuZGlmZiwgMSk7XG5cbiAgICAgIGlmIChjdXRUb3AgJiYgY3V0Qm90KSB7XG4gICAgICAgIGRpc3BsYXkudmlldyA9IGRpc3BsYXkudmlldy5zbGljZSgwLCBjdXRUb3AuaW5kZXgpLmNvbmNhdChidWlsZFZpZXdBcnJheShjbSwgY3V0VG9wLmxpbmVOLCBjdXRCb3QubGluZU4pKS5jb25jYXQoZGlzcGxheS52aWV3LnNsaWNlKGN1dEJvdC5pbmRleCkpO1xuICAgICAgICBkaXNwbGF5LnZpZXdUbyArPSBsZW5kaWZmO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzZXRWaWV3KGNtKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZXh0ID0gZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkO1xuXG4gICAgaWYgKGV4dCkge1xuICAgICAgaWYgKHRvIDwgZXh0LmxpbmVOKSB7XG4gICAgICAgIGV4dC5saW5lTiArPSBsZW5kaWZmO1xuICAgICAgfSBlbHNlIGlmIChmcm9tIDwgZXh0LmxpbmVOICsgZXh0LnNpemUpIHtcbiAgICAgICAgZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH0gLy8gUmVnaXN0ZXIgYSBjaGFuZ2UgdG8gYSBzaW5nbGUgbGluZS4gVHlwZSBtdXN0IGJlIG9uZSBvZiBcInRleHRcIixcbiAgLy8gXCJndXR0ZXJcIiwgXCJjbGFzc1wiLCBcIndpZGdldFwiXG5cblxuICBmdW5jdGlvbiByZWdMaW5lQ2hhbmdlKGNtLCBsaW5lLCB0eXBlKSB7XG4gICAgY20uY3VyT3Audmlld0NoYW5nZWQgPSB0cnVlO1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheSxcbiAgICAgICAgZXh0ID0gY20uZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkO1xuXG4gICAgaWYgKGV4dCAmJiBsaW5lID49IGV4dC5saW5lTiAmJiBsaW5lIDwgZXh0LmxpbmVOICsgZXh0LnNpemUpIHtcbiAgICAgIGRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGxpbmUgPCBkaXNwbGF5LnZpZXdGcm9tIHx8IGxpbmUgPj0gZGlzcGxheS52aWV3VG8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbGluZVZpZXcgPSBkaXNwbGF5LnZpZXdbZmluZFZpZXdJbmRleChjbSwgbGluZSldO1xuXG4gICAgaWYgKGxpbmVWaWV3Lm5vZGUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBhcnIgPSBsaW5lVmlldy5jaGFuZ2VzIHx8IChsaW5lVmlldy5jaGFuZ2VzID0gW10pO1xuXG4gICAgaWYgKGluZGV4T2YoYXJyLCB0eXBlKSA9PSAtMSkge1xuICAgICAgYXJyLnB1c2godHlwZSk7XG4gICAgfVxuICB9IC8vIENsZWFyIHRoZSB2aWV3LlxuXG5cbiAgZnVuY3Rpb24gcmVzZXRWaWV3KGNtKSB7XG4gICAgY20uZGlzcGxheS52aWV3RnJvbSA9IGNtLmRpc3BsYXkudmlld1RvID0gY20uZG9jLmZpcnN0O1xuICAgIGNtLmRpc3BsYXkudmlldyA9IFtdO1xuICAgIGNtLmRpc3BsYXkudmlld09mZnNldCA9IDA7XG4gIH1cblxuICBmdW5jdGlvbiB2aWV3Q3V0dGluZ1BvaW50KGNtLCBvbGROLCBuZXdOLCBkaXIpIHtcbiAgICB2YXIgaW5kZXggPSBmaW5kVmlld0luZGV4KGNtLCBvbGROKSxcbiAgICAgICAgZGlmZixcbiAgICAgICAgdmlldyA9IGNtLmRpc3BsYXkudmlldztcblxuICAgIGlmICghc2F3Q29sbGFwc2VkU3BhbnMgfHwgbmV3TiA9PSBjbS5kb2MuZmlyc3QgKyBjbS5kb2Muc2l6ZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBsaW5lTjogbmV3TlxuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgbiA9IGNtLmRpc3BsYXkudmlld0Zyb207XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcbiAgICAgIG4gKz0gdmlld1tpXS5zaXplO1xuICAgIH1cblxuICAgIGlmIChuICE9IG9sZE4pIHtcbiAgICAgIGlmIChkaXIgPiAwKSB7XG4gICAgICAgIGlmIChpbmRleCA9PSB2aWV3Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpZmYgPSBuICsgdmlld1tpbmRleF0uc2l6ZSAtIG9sZE47XG4gICAgICAgIGluZGV4Kys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaWZmID0gbiAtIG9sZE47XG4gICAgICB9XG5cbiAgICAgIG9sZE4gKz0gZGlmZjtcbiAgICAgIG5ld04gKz0gZGlmZjtcbiAgICB9XG5cbiAgICB3aGlsZSAodmlzdWFsTGluZU5vKGNtLmRvYywgbmV3TikgIT0gbmV3Tikge1xuICAgICAgaWYgKGluZGV4ID09IChkaXIgPCAwID8gMCA6IHZpZXcubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIG5ld04gKz0gZGlyICogdmlld1tpbmRleCAtIChkaXIgPCAwID8gMSA6IDApXS5zaXplO1xuICAgICAgaW5kZXggKz0gZGlyO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBpbmRleDogaW5kZXgsXG4gICAgICBsaW5lTjogbmV3TlxuICAgIH07XG4gIH0gLy8gRm9yY2UgdGhlIHZpZXcgdG8gY292ZXIgYSBnaXZlbiByYW5nZSwgYWRkaW5nIGVtcHR5IHZpZXcgZWxlbWVudFxuICAvLyBvciBjbGlwcGluZyBvZmYgZXhpc3Rpbmcgb25lcyBhcyBuZWVkZWQuXG5cblxuICBmdW5jdGlvbiBhZGp1c3RWaWV3KGNtLCBmcm9tLCB0bykge1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheSxcbiAgICAgICAgdmlldyA9IGRpc3BsYXkudmlldztcblxuICAgIGlmICh2aWV3Lmxlbmd0aCA9PSAwIHx8IGZyb20gPj0gZGlzcGxheS52aWV3VG8gfHwgdG8gPD0gZGlzcGxheS52aWV3RnJvbSkge1xuICAgICAgZGlzcGxheS52aWV3ID0gYnVpbGRWaWV3QXJyYXkoY20sIGZyb20sIHRvKTtcbiAgICAgIGRpc3BsYXkudmlld0Zyb20gPSBmcm9tO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZGlzcGxheS52aWV3RnJvbSA+IGZyb20pIHtcbiAgICAgICAgZGlzcGxheS52aWV3ID0gYnVpbGRWaWV3QXJyYXkoY20sIGZyb20sIGRpc3BsYXkudmlld0Zyb20pLmNvbmNhdChkaXNwbGF5LnZpZXcpO1xuICAgICAgfSBlbHNlIGlmIChkaXNwbGF5LnZpZXdGcm9tIDwgZnJvbSkge1xuICAgICAgICBkaXNwbGF5LnZpZXcgPSBkaXNwbGF5LnZpZXcuc2xpY2UoZmluZFZpZXdJbmRleChjbSwgZnJvbSkpO1xuICAgICAgfVxuXG4gICAgICBkaXNwbGF5LnZpZXdGcm9tID0gZnJvbTtcblxuICAgICAgaWYgKGRpc3BsYXkudmlld1RvIDwgdG8pIHtcbiAgICAgICAgZGlzcGxheS52aWV3ID0gZGlzcGxheS52aWV3LmNvbmNhdChidWlsZFZpZXdBcnJheShjbSwgZGlzcGxheS52aWV3VG8sIHRvKSk7XG4gICAgICB9IGVsc2UgaWYgKGRpc3BsYXkudmlld1RvID4gdG8pIHtcbiAgICAgICAgZGlzcGxheS52aWV3ID0gZGlzcGxheS52aWV3LnNsaWNlKDAsIGZpbmRWaWV3SW5kZXgoY20sIHRvKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGlzcGxheS52aWV3VG8gPSB0bztcbiAgfSAvLyBDb3VudCB0aGUgbnVtYmVyIG9mIGxpbmVzIGluIHRoZSB2aWV3IHdob3NlIERPTSByZXByZXNlbnRhdGlvbiBpc1xuICAvLyBvdXQgb2YgZGF0ZSAob3Igbm9uZXhpc3RlbnQpLlxuXG5cbiAgZnVuY3Rpb24gY291bnREaXJ0eVZpZXcoY20pIHtcbiAgICB2YXIgdmlldyA9IGNtLmRpc3BsYXkudmlldyxcbiAgICAgICAgZGlydHkgPSAwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbGluZVZpZXcgPSB2aWV3W2ldO1xuXG4gICAgICBpZiAoIWxpbmVWaWV3LmhpZGRlbiAmJiAoIWxpbmVWaWV3Lm5vZGUgfHwgbGluZVZpZXcuY2hhbmdlcykpIHtcbiAgICAgICAgKytkaXJ0eTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGlydHk7XG4gIH0gLy8gSElHSExJR0hUIFdPUktFUlxuXG5cbiAgZnVuY3Rpb24gc3RhcnRXb3JrZXIoY20sIHRpbWUpIHtcbiAgICBpZiAoY20uZG9jLm1vZGUuc3RhcnRTdGF0ZSAmJiBjbS5kb2MuZnJvbnRpZXIgPCBjbS5kaXNwbGF5LnZpZXdUbykge1xuICAgICAgY20uc3RhdGUuaGlnaGxpZ2h0LnNldCh0aW1lLCBiaW5kKGhpZ2hsaWdodFdvcmtlciwgY20pKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBoaWdobGlnaHRXb3JrZXIoY20pIHtcbiAgICB2YXIgZG9jID0gY20uZG9jO1xuXG4gICAgaWYgKGRvYy5mcm9udGllciA8IGRvYy5maXJzdCkge1xuICAgICAgZG9jLmZyb250aWVyID0gZG9jLmZpcnN0O1xuICAgIH1cblxuICAgIGlmIChkb2MuZnJvbnRpZXIgPj0gY20uZGlzcGxheS52aWV3VG8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZW5kID0gK25ldyBEYXRlKCkgKyBjbS5vcHRpb25zLndvcmtUaW1lO1xuICAgIHZhciBzdGF0ZSA9IGNvcHlTdGF0ZShkb2MubW9kZSwgZ2V0U3RhdGVCZWZvcmUoY20sIGRvYy5mcm9udGllcikpO1xuICAgIHZhciBjaGFuZ2VkTGluZXMgPSBbXTtcbiAgICBkb2MuaXRlcihkb2MuZnJvbnRpZXIsIE1hdGgubWluKGRvYy5maXJzdCArIGRvYy5zaXplLCBjbS5kaXNwbGF5LnZpZXdUbyArIDUwMCksIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICBpZiAoZG9jLmZyb250aWVyID49IGNtLmRpc3BsYXkudmlld0Zyb20pIHtcbiAgICAgICAgLy8gVmlzaWJsZVxuICAgICAgICB2YXIgb2xkU3R5bGVzID0gbGluZS5zdHlsZXMsXG4gICAgICAgICAgICB0b29Mb25nID0gbGluZS50ZXh0Lmxlbmd0aCA+IGNtLm9wdGlvbnMubWF4SGlnaGxpZ2h0TGVuZ3RoO1xuICAgICAgICB2YXIgaGlnaGxpZ2h0ZWQgPSBoaWdobGlnaHRMaW5lKGNtLCBsaW5lLCB0b29Mb25nID8gY29weVN0YXRlKGRvYy5tb2RlLCBzdGF0ZSkgOiBzdGF0ZSwgdHJ1ZSk7XG4gICAgICAgIGxpbmUuc3R5bGVzID0gaGlnaGxpZ2h0ZWQuc3R5bGVzO1xuICAgICAgICB2YXIgb2xkQ2xzID0gbGluZS5zdHlsZUNsYXNzZXMsXG4gICAgICAgICAgICBuZXdDbHMgPSBoaWdobGlnaHRlZC5jbGFzc2VzO1xuXG4gICAgICAgIGlmIChuZXdDbHMpIHtcbiAgICAgICAgICBsaW5lLnN0eWxlQ2xhc3NlcyA9IG5ld0NscztcbiAgICAgICAgfSBlbHNlIGlmIChvbGRDbHMpIHtcbiAgICAgICAgICBsaW5lLnN0eWxlQ2xhc3NlcyA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaXNjaGFuZ2UgPSAhb2xkU3R5bGVzIHx8IG9sZFN0eWxlcy5sZW5ndGggIT0gbGluZS5zdHlsZXMubGVuZ3RoIHx8IG9sZENscyAhPSBuZXdDbHMgJiYgKCFvbGRDbHMgfHwgIW5ld0NscyB8fCBvbGRDbHMuYmdDbGFzcyAhPSBuZXdDbHMuYmdDbGFzcyB8fCBvbGRDbHMudGV4dENsYXNzICE9IG5ld0Nscy50ZXh0Q2xhc3MpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyAhaXNjaGFuZ2UgJiYgaSA8IG9sZFN0eWxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGlzY2hhbmdlID0gb2xkU3R5bGVzW2ldICE9IGxpbmUuc3R5bGVzW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzY2hhbmdlKSB7XG4gICAgICAgICAgY2hhbmdlZExpbmVzLnB1c2goZG9jLmZyb250aWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpbmUuc3RhdGVBZnRlciA9IHRvb0xvbmcgPyBzdGF0ZSA6IGNvcHlTdGF0ZShkb2MubW9kZSwgc3RhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGxpbmUudGV4dC5sZW5ndGggPD0gY20ub3B0aW9ucy5tYXhIaWdobGlnaHRMZW5ndGgpIHtcbiAgICAgICAgICBwcm9jZXNzTGluZShjbSwgbGluZS50ZXh0LCBzdGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsaW5lLnN0YXRlQWZ0ZXIgPSBkb2MuZnJvbnRpZXIgJSA1ID09IDAgPyBjb3B5U3RhdGUoZG9jLm1vZGUsIHN0YXRlKSA6IG51bGw7XG4gICAgICB9XG5cbiAgICAgICsrZG9jLmZyb250aWVyO1xuXG4gICAgICBpZiAoK25ldyBEYXRlKCkgPiBlbmQpIHtcbiAgICAgICAgc3RhcnRXb3JrZXIoY20sIGNtLm9wdGlvbnMud29ya0RlbGF5KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoY2hhbmdlZExpbmVzLmxlbmd0aCkge1xuICAgICAgcnVuSW5PcChjbSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYW5nZWRMaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHJlZ0xpbmVDaGFuZ2UoY20sIGNoYW5nZWRMaW5lc1tpXSwgXCJ0ZXh0XCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0gLy8gRElTUExBWSBEUkFXSU5HXG5cblxuICB2YXIgRGlzcGxheVVwZGF0ZSA9IGZ1bmN0aW9uIERpc3BsYXlVcGRhdGUoY20sIHZpZXdwb3J0LCBmb3JjZSkge1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgICB0aGlzLnZpZXdwb3J0ID0gdmlld3BvcnQ7IC8vIFN0b3JlIHNvbWUgdmFsdWVzIHRoYXQgd2UnbGwgbmVlZCBsYXRlciAoYnV0IGRvbid0IHdhbnQgdG8gZm9yY2UgYSByZWxheW91dCBmb3IpXG5cbiAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlTGluZXMoZGlzcGxheSwgY20uZG9jLCB2aWV3cG9ydCk7XG4gICAgdGhpcy5lZGl0b3JJc0hpZGRlbiA9ICFkaXNwbGF5LndyYXBwZXIub2Zmc2V0V2lkdGg7XG4gICAgdGhpcy53cmFwcGVySGVpZ2h0ID0gZGlzcGxheS53cmFwcGVyLmNsaWVudEhlaWdodDtcbiAgICB0aGlzLndyYXBwZXJXaWR0aCA9IGRpc3BsYXkud3JhcHBlci5jbGllbnRXaWR0aDtcbiAgICB0aGlzLm9sZERpc3BsYXlXaWR0aCA9IGRpc3BsYXlXaWR0aChjbSk7XG4gICAgdGhpcy5mb3JjZSA9IGZvcmNlO1xuICAgIHRoaXMuZGltcyA9IGdldERpbWVuc2lvbnMoY20pO1xuICAgIHRoaXMuZXZlbnRzID0gW107XG4gIH07XG5cbiAgRGlzcGxheVVwZGF0ZS5wcm90b3R5cGUuc2lnbmFsID0gZnVuY3Rpb24gKGVtaXR0ZXIsIHR5cGUpIHtcbiAgICBpZiAoaGFzSGFuZGxlcihlbWl0dGVyLCB0eXBlKSkge1xuICAgICAgdGhpcy5ldmVudHMucHVzaChhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcblxuICBEaXNwbGF5VXBkYXRlLnByb3RvdHlwZS5maW5pc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBzaWduYWwuYXBwbHkobnVsbCwgdGhpcyQxLmV2ZW50c1tpXSk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIG1heWJlQ2xpcFNjcm9sbGJhcnMoY20pIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG5cbiAgICBpZiAoIWRpc3BsYXkuc2Nyb2xsYmFyc0NsaXBwZWQgJiYgZGlzcGxheS5zY3JvbGxlci5vZmZzZXRXaWR0aCkge1xuICAgICAgZGlzcGxheS5uYXRpdmVCYXJXaWR0aCA9IGRpc3BsYXkuc2Nyb2xsZXIub2Zmc2V0V2lkdGggLSBkaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoO1xuICAgICAgZGlzcGxheS5oZWlnaHRGb3JjZXIuc3R5bGUuaGVpZ2h0ID0gc2Nyb2xsR2FwKGNtKSArIFwicHhcIjtcbiAgICAgIGRpc3BsYXkuc2l6ZXIuc3R5bGUubWFyZ2luQm90dG9tID0gLWRpc3BsYXkubmF0aXZlQmFyV2lkdGggKyBcInB4XCI7XG4gICAgICBkaXNwbGF5LnNpemVyLnN0eWxlLmJvcmRlclJpZ2h0V2lkdGggPSBzY3JvbGxHYXAoY20pICsgXCJweFwiO1xuICAgICAgZGlzcGxheS5zY3JvbGxiYXJzQ2xpcHBlZCA9IHRydWU7XG4gICAgfVxuICB9IC8vIERvZXMgdGhlIGFjdHVhbCB1cGRhdGluZyBvZiB0aGUgbGluZSBkaXNwbGF5LiBCYWlscyBvdXRcbiAgLy8gKHJldHVybmluZyBmYWxzZSkgd2hlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGJlIGRvbmUgYW5kIGZvcmNlZCBpc1xuICAvLyBmYWxzZS5cblxuXG4gIGZ1bmN0aW9uIHVwZGF0ZURpc3BsYXlJZk5lZWRlZChjbSwgdXBkYXRlKSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LFxuICAgICAgICBkb2MgPSBjbS5kb2M7XG5cbiAgICBpZiAodXBkYXRlLmVkaXRvcklzSGlkZGVuKSB7XG4gICAgICByZXNldFZpZXcoY20pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gLy8gQmFpbCBvdXQgaWYgdGhlIHZpc2libGUgYXJlYSBpcyBhbHJlYWR5IHJlbmRlcmVkIGFuZCBub3RoaW5nIGNoYW5nZWQuXG5cblxuICAgIGlmICghdXBkYXRlLmZvcmNlICYmIHVwZGF0ZS52aXNpYmxlLmZyb20gPj0gZGlzcGxheS52aWV3RnJvbSAmJiB1cGRhdGUudmlzaWJsZS50byA8PSBkaXNwbGF5LnZpZXdUbyAmJiAoZGlzcGxheS51cGRhdGVMaW5lTnVtYmVycyA9PSBudWxsIHx8IGRpc3BsYXkudXBkYXRlTGluZU51bWJlcnMgPj0gZGlzcGxheS52aWV3VG8pICYmIGRpc3BsYXkucmVuZGVyZWRWaWV3ID09IGRpc3BsYXkudmlldyAmJiBjb3VudERpcnR5VmlldyhjbSkgPT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChtYXliZVVwZGF0ZUxpbmVOdW1iZXJXaWR0aChjbSkpIHtcbiAgICAgIHJlc2V0VmlldyhjbSk7XG4gICAgICB1cGRhdGUuZGltcyA9IGdldERpbWVuc2lvbnMoY20pO1xuICAgIH0gLy8gQ29tcHV0ZSBhIHN1aXRhYmxlIG5ldyB2aWV3cG9ydCAoZnJvbSAmIHRvKVxuXG5cbiAgICB2YXIgZW5kID0gZG9jLmZpcnN0ICsgZG9jLnNpemU7XG4gICAgdmFyIGZyb20gPSBNYXRoLm1heCh1cGRhdGUudmlzaWJsZS5mcm9tIC0gY20ub3B0aW9ucy52aWV3cG9ydE1hcmdpbiwgZG9jLmZpcnN0KTtcbiAgICB2YXIgdG8gPSBNYXRoLm1pbihlbmQsIHVwZGF0ZS52aXNpYmxlLnRvICsgY20ub3B0aW9ucy52aWV3cG9ydE1hcmdpbik7XG5cbiAgICBpZiAoZGlzcGxheS52aWV3RnJvbSA8IGZyb20gJiYgZnJvbSAtIGRpc3BsYXkudmlld0Zyb20gPCAyMCkge1xuICAgICAgZnJvbSA9IE1hdGgubWF4KGRvYy5maXJzdCwgZGlzcGxheS52aWV3RnJvbSk7XG4gICAgfVxuXG4gICAgaWYgKGRpc3BsYXkudmlld1RvID4gdG8gJiYgZGlzcGxheS52aWV3VG8gLSB0byA8IDIwKSB7XG4gICAgICB0byA9IE1hdGgubWluKGVuZCwgZGlzcGxheS52aWV3VG8pO1xuICAgIH1cblxuICAgIGlmIChzYXdDb2xsYXBzZWRTcGFucykge1xuICAgICAgZnJvbSA9IHZpc3VhbExpbmVObyhjbS5kb2MsIGZyb20pO1xuICAgICAgdG8gPSB2aXN1YWxMaW5lRW5kTm8oY20uZG9jLCB0byk7XG4gICAgfVxuXG4gICAgdmFyIGRpZmZlcmVudCA9IGZyb20gIT0gZGlzcGxheS52aWV3RnJvbSB8fCB0byAhPSBkaXNwbGF5LnZpZXdUbyB8fCBkaXNwbGF5Lmxhc3RXcmFwSGVpZ2h0ICE9IHVwZGF0ZS53cmFwcGVySGVpZ2h0IHx8IGRpc3BsYXkubGFzdFdyYXBXaWR0aCAhPSB1cGRhdGUud3JhcHBlcldpZHRoO1xuICAgIGFkanVzdFZpZXcoY20sIGZyb20sIHRvKTtcbiAgICBkaXNwbGF5LnZpZXdPZmZzZXQgPSBfaGVpZ2h0QXRMaW5lKGdldExpbmUoY20uZG9jLCBkaXNwbGF5LnZpZXdGcm9tKSk7IC8vIFBvc2l0aW9uIHRoZSBtb3ZlciBkaXYgdG8gYWxpZ24gd2l0aCB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb25cblxuICAgIGNtLmRpc3BsYXkubW92ZXIuc3R5bGUudG9wID0gZGlzcGxheS52aWV3T2Zmc2V0ICsgXCJweFwiO1xuICAgIHZhciB0b1VwZGF0ZSA9IGNvdW50RGlydHlWaWV3KGNtKTtcblxuICAgIGlmICghZGlmZmVyZW50ICYmIHRvVXBkYXRlID09IDAgJiYgIXVwZGF0ZS5mb3JjZSAmJiBkaXNwbGF5LnJlbmRlcmVkVmlldyA9PSBkaXNwbGF5LnZpZXcgJiYgKGRpc3BsYXkudXBkYXRlTGluZU51bWJlcnMgPT0gbnVsbCB8fCBkaXNwbGF5LnVwZGF0ZUxpbmVOdW1iZXJzID49IGRpc3BsYXkudmlld1RvKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gLy8gRm9yIGJpZyBjaGFuZ2VzLCB3ZSBoaWRlIHRoZSBlbmNsb3NpbmcgZWxlbWVudCBkdXJpbmcgdGhlXG4gICAgLy8gdXBkYXRlLCBzaW5jZSB0aGF0IHNwZWVkcyB1cCB0aGUgb3BlcmF0aW9ucyBvbiBtb3N0IGJyb3dzZXJzLlxuXG5cbiAgICB2YXIgZm9jdXNlZCA9IGFjdGl2ZUVsdCgpO1xuXG4gICAgaWYgKHRvVXBkYXRlID4gNCkge1xuICAgICAgZGlzcGxheS5saW5lRGl2LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG5cbiAgICBwYXRjaERpc3BsYXkoY20sIGRpc3BsYXkudXBkYXRlTGluZU51bWJlcnMsIHVwZGF0ZS5kaW1zKTtcblxuICAgIGlmICh0b1VwZGF0ZSA+IDQpIHtcbiAgICAgIGRpc3BsYXkubGluZURpdi5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICB9XG5cbiAgICBkaXNwbGF5LnJlbmRlcmVkVmlldyA9IGRpc3BsYXkudmlldzsgLy8gVGhlcmUgbWlnaHQgaGF2ZSBiZWVuIGEgd2lkZ2V0IHdpdGggYSBmb2N1c2VkIGVsZW1lbnQgdGhhdCBnb3RcbiAgICAvLyBoaWRkZW4gb3IgdXBkYXRlZCwgaWYgc28gcmUtZm9jdXMgaXQuXG5cbiAgICBpZiAoZm9jdXNlZCAmJiBhY3RpdmVFbHQoKSAhPSBmb2N1c2VkICYmIGZvY3VzZWQub2Zmc2V0SGVpZ2h0KSB7XG4gICAgICBmb2N1c2VkLmZvY3VzKCk7XG4gICAgfSAvLyBQcmV2ZW50IHNlbGVjdGlvbiBhbmQgY3Vyc29ycyBmcm9tIGludGVyZmVyaW5nIHdpdGggdGhlIHNjcm9sbFxuICAgIC8vIHdpZHRoIGFuZCBoZWlnaHQuXG5cblxuICAgIHJlbW92ZUNoaWxkcmVuKGRpc3BsYXkuY3Vyc29yRGl2KTtcbiAgICByZW1vdmVDaGlsZHJlbihkaXNwbGF5LnNlbGVjdGlvbkRpdik7XG4gICAgZGlzcGxheS5ndXR0ZXJzLnN0eWxlLmhlaWdodCA9IGRpc3BsYXkuc2l6ZXIuc3R5bGUubWluSGVpZ2h0ID0gMDtcblxuICAgIGlmIChkaWZmZXJlbnQpIHtcbiAgICAgIGRpc3BsYXkubGFzdFdyYXBIZWlnaHQgPSB1cGRhdGUud3JhcHBlckhlaWdodDtcbiAgICAgIGRpc3BsYXkubGFzdFdyYXBXaWR0aCA9IHVwZGF0ZS53cmFwcGVyV2lkdGg7XG4gICAgICBzdGFydFdvcmtlcihjbSwgNDAwKTtcbiAgICB9XG5cbiAgICBkaXNwbGF5LnVwZGF0ZUxpbmVOdW1iZXJzID0gbnVsbDtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvc3RVcGRhdGVEaXNwbGF5KGNtLCB1cGRhdGUpIHtcbiAgICB2YXIgdmlld3BvcnQgPSB1cGRhdGUudmlld3BvcnQ7XG5cbiAgICBmb3IgKHZhciBmaXJzdCA9IHRydWU7OyBmaXJzdCA9IGZhbHNlKSB7XG4gICAgICBpZiAoIWZpcnN0IHx8ICFjbS5vcHRpb25zLmxpbmVXcmFwcGluZyB8fCB1cGRhdGUub2xkRGlzcGxheVdpZHRoID09IGRpc3BsYXlXaWR0aChjbSkpIHtcbiAgICAgICAgLy8gQ2xpcCBmb3JjZWQgdmlld3BvcnQgdG8gYWN0dWFsIHNjcm9sbGFibGUgYXJlYS5cbiAgICAgICAgaWYgKHZpZXdwb3J0ICYmIHZpZXdwb3J0LnRvcCAhPSBudWxsKSB7XG4gICAgICAgICAgdmlld3BvcnQgPSB7XG4gICAgICAgICAgICB0b3A6IE1hdGgubWluKGNtLmRvYy5oZWlnaHQgKyBwYWRkaW5nVmVydChjbS5kaXNwbGF5KSAtIGRpc3BsYXlIZWlnaHQoY20pLCB2aWV3cG9ydC50b3ApXG4gICAgICAgICAgfTtcbiAgICAgICAgfSAvLyBVcGRhdGVkIGxpbmUgaGVpZ2h0cyBtaWdodCByZXN1bHQgaW4gdGhlIGRyYXduIGFyZWEgbm90XG4gICAgICAgIC8vIGFjdHVhbGx5IGNvdmVyaW5nIHRoZSB2aWV3cG9ydC4gS2VlcCBsb29waW5nIHVudGlsIGl0IGRvZXMuXG5cblxuICAgICAgICB1cGRhdGUudmlzaWJsZSA9IHZpc2libGVMaW5lcyhjbS5kaXNwbGF5LCBjbS5kb2MsIHZpZXdwb3J0KTtcblxuICAgICAgICBpZiAodXBkYXRlLnZpc2libGUuZnJvbSA+PSBjbS5kaXNwbGF5LnZpZXdGcm9tICYmIHVwZGF0ZS52aXNpYmxlLnRvIDw9IGNtLmRpc3BsYXkudmlld1RvKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCF1cGRhdGVEaXNwbGF5SWZOZWVkZWQoY20sIHVwZGF0ZSkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZUhlaWdodHNJblZpZXdwb3J0KGNtKTtcbiAgICAgIHZhciBiYXJNZWFzdXJlID0gbWVhc3VyZUZvclNjcm9sbGJhcnMoY20pO1xuICAgICAgdXBkYXRlU2VsZWN0aW9uKGNtKTtcbiAgICAgIHVwZGF0ZVNjcm9sbGJhcnMoY20sIGJhck1lYXN1cmUpO1xuICAgICAgc2V0RG9jdW1lbnRIZWlnaHQoY20sIGJhck1lYXN1cmUpO1xuICAgIH1cblxuICAgIHVwZGF0ZS5zaWduYWwoY20sIFwidXBkYXRlXCIsIGNtKTtcblxuICAgIGlmIChjbS5kaXNwbGF5LnZpZXdGcm9tICE9IGNtLmRpc3BsYXkucmVwb3J0ZWRWaWV3RnJvbSB8fCBjbS5kaXNwbGF5LnZpZXdUbyAhPSBjbS5kaXNwbGF5LnJlcG9ydGVkVmlld1RvKSB7XG4gICAgICB1cGRhdGUuc2lnbmFsKGNtLCBcInZpZXdwb3J0Q2hhbmdlXCIsIGNtLCBjbS5kaXNwbGF5LnZpZXdGcm9tLCBjbS5kaXNwbGF5LnZpZXdUbyk7XG4gICAgICBjbS5kaXNwbGF5LnJlcG9ydGVkVmlld0Zyb20gPSBjbS5kaXNwbGF5LnZpZXdGcm9tO1xuICAgICAgY20uZGlzcGxheS5yZXBvcnRlZFZpZXdUbyA9IGNtLmRpc3BsYXkudmlld1RvO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZURpc3BsYXlTaW1wbGUoY20sIHZpZXdwb3J0KSB7XG4gICAgdmFyIHVwZGF0ZSA9IG5ldyBEaXNwbGF5VXBkYXRlKGNtLCB2aWV3cG9ydCk7XG5cbiAgICBpZiAodXBkYXRlRGlzcGxheUlmTmVlZGVkKGNtLCB1cGRhdGUpKSB7XG4gICAgICB1cGRhdGVIZWlnaHRzSW5WaWV3cG9ydChjbSk7XG4gICAgICBwb3N0VXBkYXRlRGlzcGxheShjbSwgdXBkYXRlKTtcbiAgICAgIHZhciBiYXJNZWFzdXJlID0gbWVhc3VyZUZvclNjcm9sbGJhcnMoY20pO1xuICAgICAgdXBkYXRlU2VsZWN0aW9uKGNtKTtcbiAgICAgIHVwZGF0ZVNjcm9sbGJhcnMoY20sIGJhck1lYXN1cmUpO1xuICAgICAgc2V0RG9jdW1lbnRIZWlnaHQoY20sIGJhck1lYXN1cmUpO1xuICAgICAgdXBkYXRlLmZpbmlzaCgpO1xuICAgIH1cbiAgfSAvLyBTeW5jIHRoZSBhY3R1YWwgZGlzcGxheSBET00gc3RydWN0dXJlIHdpdGggZGlzcGxheS52aWV3LCByZW1vdmluZ1xuICAvLyBub2RlcyBmb3IgbGluZXMgdGhhdCBhcmUgbm8gbG9uZ2VyIGluIHZpZXcsIGFuZCBjcmVhdGluZyB0aGUgb25lc1xuICAvLyB0aGF0IGFyZSBub3QgdGhlcmUgeWV0LCBhbmQgdXBkYXRpbmcgdGhlIG9uZXMgdGhhdCBhcmUgb3V0IG9mXG4gIC8vIGRhdGUuXG5cblxuICBmdW5jdGlvbiBwYXRjaERpc3BsYXkoY20sIHVwZGF0ZU51bWJlcnNGcm9tLCBkaW1zKSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LFxuICAgICAgICBsaW5lTnVtYmVycyA9IGNtLm9wdGlvbnMubGluZU51bWJlcnM7XG4gICAgdmFyIGNvbnRhaW5lciA9IGRpc3BsYXkubGluZURpdixcbiAgICAgICAgY3VyID0gY29udGFpbmVyLmZpcnN0Q2hpbGQ7XG5cbiAgICBmdW5jdGlvbiBybShub2RlKSB7XG4gICAgICB2YXIgbmV4dCA9IG5vZGUubmV4dFNpYmxpbmc7IC8vIFdvcmtzIGFyb3VuZCBhIHRocm93LXNjcm9sbCBidWcgaW4gT1MgWCBXZWJraXRcblxuICAgICAgaWYgKHdlYmtpdCAmJiBtYWMgJiYgY20uZGlzcGxheS5jdXJyZW50V2hlZWxUYXJnZXQgPT0gbm9kZSkge1xuICAgICAgICBub2RlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfVxuXG4gICAgdmFyIHZpZXcgPSBkaXNwbGF5LnZpZXcsXG4gICAgICAgIGxpbmVOID0gZGlzcGxheS52aWV3RnJvbTsgLy8gTG9vcCBvdmVyIHRoZSBlbGVtZW50cyBpbiB0aGUgdmlldywgc3luY2luZyBjdXIgKHRoZSBET00gbm9kZXNcbiAgICAvLyBpbiBkaXNwbGF5LmxpbmVEaXYpIHdpdGggdGhlIHZpZXcgYXMgd2UgZ28uXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBsaW5lVmlldyA9IHZpZXdbaV07XG5cbiAgICAgIGlmIChsaW5lVmlldy5oaWRkZW4pIHt9IGVsc2UgaWYgKCFsaW5lVmlldy5ub2RlIHx8IGxpbmVWaWV3Lm5vZGUucGFyZW50Tm9kZSAhPSBjb250YWluZXIpIHtcbiAgICAgICAgLy8gTm90IGRyYXduIHlldFxuICAgICAgICB2YXIgbm9kZSA9IGJ1aWxkTGluZUVsZW1lbnQoY20sIGxpbmVWaWV3LCBsaW5lTiwgZGltcyk7XG4gICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobm9kZSwgY3VyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFscmVhZHkgZHJhd25cbiAgICAgICAgd2hpbGUgKGN1ciAhPSBsaW5lVmlldy5ub2RlKSB7XG4gICAgICAgICAgY3VyID0gcm0oY3VyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1cGRhdGVOdW1iZXIgPSBsaW5lTnVtYmVycyAmJiB1cGRhdGVOdW1iZXJzRnJvbSAhPSBudWxsICYmIHVwZGF0ZU51bWJlcnNGcm9tIDw9IGxpbmVOICYmIGxpbmVWaWV3LmxpbmVOdW1iZXI7XG5cbiAgICAgICAgaWYgKGxpbmVWaWV3LmNoYW5nZXMpIHtcbiAgICAgICAgICBpZiAoaW5kZXhPZihsaW5lVmlldy5jaGFuZ2VzLCBcImd1dHRlclwiKSA+IC0xKSB7XG4gICAgICAgICAgICB1cGRhdGVOdW1iZXIgPSBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB1cGRhdGVMaW5lRm9yQ2hhbmdlcyhjbSwgbGluZVZpZXcsIGxpbmVOLCBkaW1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1cGRhdGVOdW1iZXIpIHtcbiAgICAgICAgICByZW1vdmVDaGlsZHJlbihsaW5lVmlldy5saW5lTnVtYmVyKTtcbiAgICAgICAgICBsaW5lVmlldy5saW5lTnVtYmVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxpbmVOdW1iZXJGb3IoY20ub3B0aW9ucywgbGluZU4pKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjdXIgPSBsaW5lVmlldy5ub2RlLm5leHRTaWJsaW5nO1xuICAgICAgfVxuXG4gICAgICBsaW5lTiArPSBsaW5lVmlldy5zaXplO1xuICAgIH1cblxuICAgIHdoaWxlIChjdXIpIHtcbiAgICAgIGN1ciA9IHJtKGN1cik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlR3V0dGVyU3BhY2UoY20pIHtcbiAgICB2YXIgd2lkdGggPSBjbS5kaXNwbGF5Lmd1dHRlcnMub2Zmc2V0V2lkdGg7XG4gICAgY20uZGlzcGxheS5zaXplci5zdHlsZS5tYXJnaW5MZWZ0ID0gd2lkdGggKyBcInB4XCI7XG4gIH1cblxuICBmdW5jdGlvbiBzZXREb2N1bWVudEhlaWdodChjbSwgbWVhc3VyZSkge1xuICAgIGNtLmRpc3BsYXkuc2l6ZXIuc3R5bGUubWluSGVpZ2h0ID0gbWVhc3VyZS5kb2NIZWlnaHQgKyBcInB4XCI7XG4gICAgY20uZGlzcGxheS5oZWlnaHRGb3JjZXIuc3R5bGUudG9wID0gbWVhc3VyZS5kb2NIZWlnaHQgKyBcInB4XCI7XG4gICAgY20uZGlzcGxheS5ndXR0ZXJzLnN0eWxlLmhlaWdodCA9IG1lYXN1cmUuZG9jSGVpZ2h0ICsgY20uZGlzcGxheS5iYXJIZWlnaHQgKyBzY3JvbGxHYXAoY20pICsgXCJweFwiO1xuICB9IC8vIFJlYnVpbGQgdGhlIGd1dHRlciBlbGVtZW50cywgZW5zdXJlIHRoZSBtYXJnaW4gdG8gdGhlIGxlZnQgb2YgdGhlXG4gIC8vIGNvZGUgbWF0Y2hlcyB0aGVpciB3aWR0aC5cblxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUd1dHRlcnMoY20pIHtcbiAgICB2YXIgZ3V0dGVycyA9IGNtLmRpc3BsYXkuZ3V0dGVycyxcbiAgICAgICAgc3BlY3MgPSBjbS5vcHRpb25zLmd1dHRlcnM7XG4gICAgcmVtb3ZlQ2hpbGRyZW4oZ3V0dGVycyk7XG4gICAgdmFyIGkgPSAwO1xuXG4gICAgZm9yICg7IGkgPCBzcGVjcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGd1dHRlckNsYXNzID0gc3BlY3NbaV07XG4gICAgICB2YXIgZ0VsdCA9IGd1dHRlcnMuYXBwZW5kQ2hpbGQoZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1ndXR0ZXIgXCIgKyBndXR0ZXJDbGFzcykpO1xuXG4gICAgICBpZiAoZ3V0dGVyQ2xhc3MgPT0gXCJDb2RlTWlycm9yLWxpbmVudW1iZXJzXCIpIHtcbiAgICAgICAgY20uZGlzcGxheS5saW5lR3V0dGVyID0gZ0VsdDtcbiAgICAgICAgZ0VsdC5zdHlsZS53aWR0aCA9IChjbS5kaXNwbGF5LmxpbmVOdW1XaWR0aCB8fCAxKSArIFwicHhcIjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBndXR0ZXJzLnN0eWxlLmRpc3BsYXkgPSBpID8gXCJcIiA6IFwibm9uZVwiO1xuICAgIHVwZGF0ZUd1dHRlclNwYWNlKGNtKTtcbiAgfSAvLyBNYWtlIHN1cmUgdGhlIGd1dHRlcnMgb3B0aW9ucyBjb250YWlucyB0aGUgZWxlbWVudFxuICAvLyBcIkNvZGVNaXJyb3ItbGluZW51bWJlcnNcIiB3aGVuIHRoZSBsaW5lTnVtYmVycyBvcHRpb24gaXMgdHJ1ZS5cblxuXG4gIGZ1bmN0aW9uIHNldEd1dHRlcnNGb3JMaW5lTnVtYmVycyhvcHRpb25zKSB7XG4gICAgdmFyIGZvdW5kID0gaW5kZXhPZihvcHRpb25zLmd1dHRlcnMsIFwiQ29kZU1pcnJvci1saW5lbnVtYmVyc1wiKTtcblxuICAgIGlmIChmb3VuZCA9PSAtMSAmJiBvcHRpb25zLmxpbmVOdW1iZXJzKSB7XG4gICAgICBvcHRpb25zLmd1dHRlcnMgPSBvcHRpb25zLmd1dHRlcnMuY29uY2F0KFtcIkNvZGVNaXJyb3ItbGluZW51bWJlcnNcIl0pO1xuICAgIH0gZWxzZSBpZiAoZm91bmQgPiAtMSAmJiAhb3B0aW9ucy5saW5lTnVtYmVycykge1xuICAgICAgb3B0aW9ucy5ndXR0ZXJzID0gb3B0aW9ucy5ndXR0ZXJzLnNsaWNlKDApO1xuICAgICAgb3B0aW9ucy5ndXR0ZXJzLnNwbGljZShmb3VuZCwgMSk7XG4gICAgfVxuICB9IC8vIFNlbGVjdGlvbiBvYmplY3RzIGFyZSBpbW11dGFibGUuIEEgbmV3IG9uZSBpcyBjcmVhdGVkIGV2ZXJ5IHRpbWVcbiAgLy8gdGhlIHNlbGVjdGlvbiBjaGFuZ2VzLiBBIHNlbGVjdGlvbiBpcyBvbmUgb3IgbW9yZSBub24tb3ZlcmxhcHBpbmdcbiAgLy8gKGFuZCBub24tdG91Y2hpbmcpIHJhbmdlcywgc29ydGVkLCBhbmQgYW4gaW50ZWdlciB0aGF0IGluZGljYXRlc1xuICAvLyB3aGljaCBvbmUgaXMgdGhlIHByaW1hcnkgc2VsZWN0aW9uICh0aGUgb25lIHRoYXQncyBzY3JvbGxlZCBpbnRvXG4gIC8vIHZpZXcsIHRoYXQgZ2V0Q3Vyc29yIHJldHVybnMsIGV0YykuXG5cblxuICBmdW5jdGlvbiBTZWxlY3Rpb24ocmFuZ2VzLCBwcmltSW5kZXgpIHtcbiAgICB0aGlzLnJhbmdlcyA9IHJhbmdlcztcbiAgICB0aGlzLnByaW1JbmRleCA9IHByaW1JbmRleDtcbiAgfVxuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUgPSB7XG4gICAgcHJpbWFyeTogZnVuY3Rpb24gcHJpbWFyeSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnJhbmdlc1t0aGlzLnByaW1JbmRleF07XG4gICAgfSxcbiAgICBlcXVhbHM6IGZ1bmN0aW9uIGVxdWFscyhvdGhlcikge1xuICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICAgIGlmIChvdGhlciA9PSB0aGlzKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAob3RoZXIucHJpbUluZGV4ICE9IHRoaXMucHJpbUluZGV4IHx8IG90aGVyLnJhbmdlcy5sZW5ndGggIT0gdGhpcy5yYW5nZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaGVyZSA9IHRoaXMkMS5yYW5nZXNbaV0sXG4gICAgICAgICAgICB0aGVyZSA9IG90aGVyLnJhbmdlc1tpXTtcblxuICAgICAgICBpZiAoY21wKGhlcmUuYW5jaG9yLCB0aGVyZS5hbmNob3IpICE9IDAgfHwgY21wKGhlcmUuaGVhZCwgdGhlcmUuaGVhZCkgIT0gMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGRlZXBDb3B5OiBmdW5jdGlvbiBkZWVwQ29weSgpIHtcbiAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuICAgICAgdmFyIG91dCA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG91dFtpXSA9IG5ldyBSYW5nZShjb3B5UG9zKHRoaXMkMS5yYW5nZXNbaV0uYW5jaG9yKSwgY29weVBvcyh0aGlzJDEucmFuZ2VzW2ldLmhlYWQpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBTZWxlY3Rpb24ob3V0LCB0aGlzLnByaW1JbmRleCk7XG4gICAgfSxcbiAgICBzb21ldGhpbmdTZWxlY3RlZDogZnVuY3Rpb24gc29tZXRoaW5nU2VsZWN0ZWQoKSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXRoaXMkMS5yYW5nZXNbaV0uZW1wdHkoKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIGNvbnRhaW5zOiBmdW5jdGlvbiBjb250YWlucyhwb3MsIGVuZCkge1xuICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICAgIGlmICghZW5kKSB7XG4gICAgICAgIGVuZCA9IHBvcztcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcmFuZ2UgPSB0aGlzJDEucmFuZ2VzW2ldO1xuXG4gICAgICAgIGlmIChjbXAoZW5kLCByYW5nZS5mcm9tKCkpID49IDAgJiYgY21wKHBvcywgcmFuZ2UudG8oKSkgPD0gMCkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gUmFuZ2UoYW5jaG9yLCBoZWFkKSB7XG4gICAgdGhpcy5hbmNob3IgPSBhbmNob3I7XG4gICAgdGhpcy5oZWFkID0gaGVhZDtcbiAgfVxuXG4gIFJhbmdlLnByb3RvdHlwZSA9IHtcbiAgICBmcm9tOiBmdW5jdGlvbiBmcm9tKCkge1xuICAgICAgcmV0dXJuIG1pblBvcyh0aGlzLmFuY2hvciwgdGhpcy5oZWFkKTtcbiAgICB9LFxuICAgIHRvOiBmdW5jdGlvbiB0bygpIHtcbiAgICAgIHJldHVybiBtYXhQb3ModGhpcy5hbmNob3IsIHRoaXMuaGVhZCk7XG4gICAgfSxcbiAgICBlbXB0eTogZnVuY3Rpb24gZW1wdHkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5oZWFkLmxpbmUgPT0gdGhpcy5hbmNob3IubGluZSAmJiB0aGlzLmhlYWQuY2ggPT0gdGhpcy5hbmNob3IuY2g7XG4gICAgfVxuICB9OyAvLyBUYWtlIGFuIHVuc29ydGVkLCBwb3RlbnRpYWxseSBvdmVybGFwcGluZyBzZXQgb2YgcmFuZ2VzLCBhbmRcbiAgLy8gYnVpbGQgYSBzZWxlY3Rpb24gb3V0IG9mIGl0LiAnQ29uc3VtZXMnIHJhbmdlcyBhcnJheSAobW9kaWZ5aW5nXG4gIC8vIGl0KS5cblxuICBmdW5jdGlvbiBub3JtYWxpemVTZWxlY3Rpb24ocmFuZ2VzLCBwcmltSW5kZXgpIHtcbiAgICB2YXIgcHJpbSA9IHJhbmdlc1twcmltSW5kZXhdO1xuICAgIHJhbmdlcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gY21wKGEuZnJvbSgpLCBiLmZyb20oKSk7XG4gICAgfSk7XG4gICAgcHJpbUluZGV4ID0gaW5kZXhPZihyYW5nZXMsIHByaW0pO1xuXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjdXIgPSByYW5nZXNbaV0sXG4gICAgICAgICAgcHJldiA9IHJhbmdlc1tpIC0gMV07XG5cbiAgICAgIGlmIChjbXAocHJldi50bygpLCBjdXIuZnJvbSgpKSA+PSAwKSB7XG4gICAgICAgIHZhciBmcm9tID0gbWluUG9zKHByZXYuZnJvbSgpLCBjdXIuZnJvbSgpKSxcbiAgICAgICAgICAgIHRvID0gbWF4UG9zKHByZXYudG8oKSwgY3VyLnRvKCkpO1xuICAgICAgICB2YXIgaW52ID0gcHJldi5lbXB0eSgpID8gY3VyLmZyb20oKSA9PSBjdXIuaGVhZCA6IHByZXYuZnJvbSgpID09IHByZXYuaGVhZDtcblxuICAgICAgICBpZiAoaSA8PSBwcmltSW5kZXgpIHtcbiAgICAgICAgICAtLXByaW1JbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJhbmdlcy5zcGxpY2UoLS1pLCAyLCBuZXcgUmFuZ2UoaW52ID8gdG8gOiBmcm9tLCBpbnYgPyBmcm9tIDogdG8pKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFNlbGVjdGlvbihyYW5nZXMsIHByaW1JbmRleCk7XG4gIH1cblxuICBmdW5jdGlvbiBzaW1wbGVTZWxlY3Rpb24oYW5jaG9yLCBoZWFkKSB7XG4gICAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oW25ldyBSYW5nZShhbmNob3IsIGhlYWQgfHwgYW5jaG9yKV0sIDApO1xuICB9IC8vIENvbXB1dGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBlbmQgb2YgYSBjaGFuZ2UgKGl0cyAndG8nIHByb3BlcnR5XG4gIC8vIHJlZmVycyB0byB0aGUgcHJlLWNoYW5nZSBlbmQpLlxuXG5cbiAgZnVuY3Rpb24gY2hhbmdlRW5kKGNoYW5nZSkge1xuICAgIGlmICghY2hhbmdlLnRleHQpIHtcbiAgICAgIHJldHVybiBjaGFuZ2UudG87XG4gICAgfVxuXG4gICAgcmV0dXJuIFBvcyhjaGFuZ2UuZnJvbS5saW5lICsgY2hhbmdlLnRleHQubGVuZ3RoIC0gMSwgbHN0KGNoYW5nZS50ZXh0KS5sZW5ndGggKyAoY2hhbmdlLnRleHQubGVuZ3RoID09IDEgPyBjaGFuZ2UuZnJvbS5jaCA6IDApKTtcbiAgfSAvLyBBZGp1c3QgYSBwb3NpdGlvbiB0byByZWZlciB0byB0aGUgcG9zdC1jaGFuZ2UgcG9zaXRpb24gb2YgdGhlXG4gIC8vIHNhbWUgdGV4dCwgb3IgdGhlIGVuZCBvZiB0aGUgY2hhbmdlIGlmIHRoZSBjaGFuZ2UgY292ZXJzIGl0LlxuXG5cbiAgZnVuY3Rpb24gYWRqdXN0Rm9yQ2hhbmdlKHBvcywgY2hhbmdlKSB7XG4gICAgaWYgKGNtcChwb3MsIGNoYW5nZS5mcm9tKSA8IDApIHtcbiAgICAgIHJldHVybiBwb3M7XG4gICAgfVxuXG4gICAgaWYgKGNtcChwb3MsIGNoYW5nZS50bykgPD0gMCkge1xuICAgICAgcmV0dXJuIGNoYW5nZUVuZChjaGFuZ2UpO1xuICAgIH1cblxuICAgIHZhciBsaW5lID0gcG9zLmxpbmUgKyBjaGFuZ2UudGV4dC5sZW5ndGggLSAoY2hhbmdlLnRvLmxpbmUgLSBjaGFuZ2UuZnJvbS5saW5lKSAtIDEsXG4gICAgICAgIGNoID0gcG9zLmNoO1xuXG4gICAgaWYgKHBvcy5saW5lID09IGNoYW5nZS50by5saW5lKSB7XG4gICAgICBjaCArPSBjaGFuZ2VFbmQoY2hhbmdlKS5jaCAtIGNoYW5nZS50by5jaDtcbiAgICB9XG5cbiAgICByZXR1cm4gUG9zKGxpbmUsIGNoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXB1dGVTZWxBZnRlckNoYW5nZShkb2MsIGNoYW5nZSkge1xuICAgIHZhciBvdXQgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZG9jLnNlbC5yYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByYW5nZSA9IGRvYy5zZWwucmFuZ2VzW2ldO1xuICAgICAgb3V0LnB1c2gobmV3IFJhbmdlKGFkanVzdEZvckNoYW5nZShyYW5nZS5hbmNob3IsIGNoYW5nZSksIGFkanVzdEZvckNoYW5nZShyYW5nZS5oZWFkLCBjaGFuZ2UpKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vcm1hbGl6ZVNlbGVjdGlvbihvdXQsIGRvYy5zZWwucHJpbUluZGV4KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9mZnNldFBvcyhwb3MsIG9sZCwgbncpIHtcbiAgICBpZiAocG9zLmxpbmUgPT0gb2xkLmxpbmUpIHtcbiAgICAgIHJldHVybiBQb3MobncubGluZSwgcG9zLmNoIC0gb2xkLmNoICsgbncuY2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUG9zKG53LmxpbmUgKyAocG9zLmxpbmUgLSBvbGQubGluZSksIHBvcy5jaCk7XG4gICAgfVxuICB9IC8vIFVzZWQgYnkgcmVwbGFjZVNlbGVjdGlvbnMgdG8gYWxsb3cgbW92aW5nIHRoZSBzZWxlY3Rpb24gdG8gdGhlXG4gIC8vIHN0YXJ0IG9yIGFyb3VuZCB0aGUgcmVwbGFjZWQgdGVzdC4gSGludCBtYXkgYmUgXCJzdGFydFwiIG9yIFwiYXJvdW5kXCIuXG5cblxuICBmdW5jdGlvbiBjb21wdXRlUmVwbGFjZWRTZWwoZG9jLCBjaGFuZ2VzLCBoaW50KSB7XG4gICAgdmFyIG91dCA9IFtdO1xuICAgIHZhciBvbGRQcmV2ID0gUG9zKGRvYy5maXJzdCwgMCksXG4gICAgICAgIG5ld1ByZXYgPSBvbGRQcmV2O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY2hhbmdlID0gY2hhbmdlc1tpXTtcbiAgICAgIHZhciBmcm9tID0gb2Zmc2V0UG9zKGNoYW5nZS5mcm9tLCBvbGRQcmV2LCBuZXdQcmV2KTtcbiAgICAgIHZhciB0byA9IG9mZnNldFBvcyhjaGFuZ2VFbmQoY2hhbmdlKSwgb2xkUHJldiwgbmV3UHJldik7XG4gICAgICBvbGRQcmV2ID0gY2hhbmdlLnRvO1xuICAgICAgbmV3UHJldiA9IHRvO1xuXG4gICAgICBpZiAoaGludCA9PSBcImFyb3VuZFwiKSB7XG4gICAgICAgIHZhciByYW5nZSA9IGRvYy5zZWwucmFuZ2VzW2ldLFxuICAgICAgICAgICAgaW52ID0gY21wKHJhbmdlLmhlYWQsIHJhbmdlLmFuY2hvcikgPCAwO1xuICAgICAgICBvdXRbaV0gPSBuZXcgUmFuZ2UoaW52ID8gdG8gOiBmcm9tLCBpbnYgPyBmcm9tIDogdG8pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0W2ldID0gbmV3IFJhbmdlKGZyb20sIGZyb20pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKG91dCwgZG9jLnNlbC5wcmltSW5kZXgpO1xuICB9IC8vIFVzZWQgdG8gZ2V0IHRoZSBlZGl0b3IgaW50byBhIGNvbnNpc3RlbnQgc3RhdGUgYWdhaW4gd2hlbiBvcHRpb25zIGNoYW5nZS5cblxuXG4gIGZ1bmN0aW9uIGxvYWRNb2RlKGNtKSB7XG4gICAgY20uZG9jLm1vZGUgPSBnZXRNb2RlKGNtLm9wdGlvbnMsIGNtLmRvYy5tb2RlT3B0aW9uKTtcbiAgICByZXNldE1vZGVTdGF0ZShjbSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldE1vZGVTdGF0ZShjbSkge1xuICAgIGNtLmRvYy5pdGVyKGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICBpZiAobGluZS5zdGF0ZUFmdGVyKSB7XG4gICAgICAgIGxpbmUuc3RhdGVBZnRlciA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmIChsaW5lLnN0eWxlcykge1xuICAgICAgICBsaW5lLnN0eWxlcyA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY20uZG9jLmZyb250aWVyID0gY20uZG9jLmZpcnN0O1xuICAgIHN0YXJ0V29ya2VyKGNtLCAxMDApO1xuICAgIGNtLnN0YXRlLm1vZGVHZW4rKztcblxuICAgIGlmIChjbS5jdXJPcCkge1xuICAgICAgcmVnQ2hhbmdlKGNtKTtcbiAgICB9XG4gIH0gLy8gRE9DVU1FTlQgREFUQSBTVFJVQ1RVUkVcbiAgLy8gQnkgZGVmYXVsdCwgdXBkYXRlcyB0aGF0IHN0YXJ0IGFuZCBlbmQgYXQgdGhlIGJlZ2lubmluZyBvZiBhIGxpbmVcbiAgLy8gYXJlIHRyZWF0ZWQgc3BlY2lhbGx5LCBpbiBvcmRlciB0byBtYWtlIHRoZSBhc3NvY2lhdGlvbiBvZiBsaW5lXG4gIC8vIHdpZGdldHMgYW5kIG1hcmtlciBlbGVtZW50cyB3aXRoIHRoZSB0ZXh0IGJlaGF2ZSBtb3JlIGludHVpdGl2ZS5cblxuXG4gIGZ1bmN0aW9uIGlzV2hvbGVMaW5lVXBkYXRlKGRvYywgY2hhbmdlKSB7XG4gICAgcmV0dXJuIGNoYW5nZS5mcm9tLmNoID09IDAgJiYgY2hhbmdlLnRvLmNoID09IDAgJiYgbHN0KGNoYW5nZS50ZXh0KSA9PSBcIlwiICYmICghZG9jLmNtIHx8IGRvYy5jbS5vcHRpb25zLndob2xlTGluZVVwZGF0ZUJlZm9yZSk7XG4gIH0gLy8gUGVyZm9ybSBhIGNoYW5nZSBvbiB0aGUgZG9jdW1lbnQgZGF0YSBzdHJ1Y3R1cmUuXG5cblxuICBmdW5jdGlvbiB1cGRhdGVEb2MoZG9jLCBjaGFuZ2UsIG1hcmtlZFNwYW5zLCBlc3RpbWF0ZUhlaWdodCkge1xuICAgIGZ1bmN0aW9uIHNwYW5zRm9yKG4pIHtcbiAgICAgIHJldHVybiBtYXJrZWRTcGFucyA/IG1hcmtlZFNwYW5zW25dIDogbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGUobGluZSwgdGV4dCwgc3BhbnMpIHtcbiAgICAgIHVwZGF0ZUxpbmUobGluZSwgdGV4dCwgc3BhbnMsIGVzdGltYXRlSGVpZ2h0KTtcbiAgICAgIHNpZ25hbExhdGVyKGxpbmUsIFwiY2hhbmdlXCIsIGxpbmUsIGNoYW5nZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZXNGb3Ioc3RhcnQsIGVuZCkge1xuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgICAgICByZXN1bHQucHVzaChuZXcgTGluZSh0ZXh0W2ldLCBzcGFuc0ZvcihpKSwgZXN0aW1hdGVIZWlnaHQpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICB2YXIgZnJvbSA9IGNoYW5nZS5mcm9tLFxuICAgICAgICB0byA9IGNoYW5nZS50byxcbiAgICAgICAgdGV4dCA9IGNoYW5nZS50ZXh0O1xuICAgIHZhciBmaXJzdExpbmUgPSBnZXRMaW5lKGRvYywgZnJvbS5saW5lKSxcbiAgICAgICAgbGFzdExpbmUgPSBnZXRMaW5lKGRvYywgdG8ubGluZSk7XG4gICAgdmFyIGxhc3RUZXh0ID0gbHN0KHRleHQpLFxuICAgICAgICBsYXN0U3BhbnMgPSBzcGFuc0Zvcih0ZXh0Lmxlbmd0aCAtIDEpLFxuICAgICAgICBubGluZXMgPSB0by5saW5lIC0gZnJvbS5saW5lOyAvLyBBZGp1c3QgdGhlIGxpbmUgc3RydWN0dXJlXG5cbiAgICBpZiAoY2hhbmdlLmZ1bGwpIHtcbiAgICAgIGRvYy5pbnNlcnQoMCwgbGluZXNGb3IoMCwgdGV4dC5sZW5ndGgpKTtcbiAgICAgIGRvYy5yZW1vdmUodGV4dC5sZW5ndGgsIGRvYy5zaXplIC0gdGV4dC5sZW5ndGgpO1xuICAgIH0gZWxzZSBpZiAoaXNXaG9sZUxpbmVVcGRhdGUoZG9jLCBjaGFuZ2UpKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgd2hvbGUtbGluZSByZXBsYWNlLiBUcmVhdGVkIHNwZWNpYWxseSB0byBtYWtlXG4gICAgICAvLyBzdXJlIGxpbmUgb2JqZWN0cyBtb3ZlIHRoZSB3YXkgdGhleSBhcmUgc3VwcG9zZWQgdG8uXG4gICAgICB2YXIgYWRkZWQgPSBsaW5lc0ZvcigwLCB0ZXh0Lmxlbmd0aCAtIDEpO1xuICAgICAgdXBkYXRlKGxhc3RMaW5lLCBsYXN0TGluZS50ZXh0LCBsYXN0U3BhbnMpO1xuXG4gICAgICBpZiAobmxpbmVzKSB7XG4gICAgICAgIGRvYy5yZW1vdmUoZnJvbS5saW5lLCBubGluZXMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYWRkZWQubGVuZ3RoKSB7XG4gICAgICAgIGRvYy5pbnNlcnQoZnJvbS5saW5lLCBhZGRlZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChmaXJzdExpbmUgPT0gbGFzdExpbmUpIHtcbiAgICAgIGlmICh0ZXh0Lmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIHVwZGF0ZShmaXJzdExpbmUsIGZpcnN0TGluZS50ZXh0LnNsaWNlKDAsIGZyb20uY2gpICsgbGFzdFRleHQgKyBmaXJzdExpbmUudGV4dC5zbGljZSh0by5jaCksIGxhc3RTcGFucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYWRkZWQkMSA9IGxpbmVzRm9yKDEsIHRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgIGFkZGVkJDEucHVzaChuZXcgTGluZShsYXN0VGV4dCArIGZpcnN0TGluZS50ZXh0LnNsaWNlKHRvLmNoKSwgbGFzdFNwYW5zLCBlc3RpbWF0ZUhlaWdodCkpO1xuICAgICAgICB1cGRhdGUoZmlyc3RMaW5lLCBmaXJzdExpbmUudGV4dC5zbGljZSgwLCBmcm9tLmNoKSArIHRleHRbMF0sIHNwYW5zRm9yKDApKTtcbiAgICAgICAgZG9jLmluc2VydChmcm9tLmxpbmUgKyAxLCBhZGRlZCQxKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRleHQubGVuZ3RoID09IDEpIHtcbiAgICAgIHVwZGF0ZShmaXJzdExpbmUsIGZpcnN0TGluZS50ZXh0LnNsaWNlKDAsIGZyb20uY2gpICsgdGV4dFswXSArIGxhc3RMaW5lLnRleHQuc2xpY2UodG8uY2gpLCBzcGFuc0ZvcigwKSk7XG4gICAgICBkb2MucmVtb3ZlKGZyb20ubGluZSArIDEsIG5saW5lcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVwZGF0ZShmaXJzdExpbmUsIGZpcnN0TGluZS50ZXh0LnNsaWNlKDAsIGZyb20uY2gpICsgdGV4dFswXSwgc3BhbnNGb3IoMCkpO1xuICAgICAgdXBkYXRlKGxhc3RMaW5lLCBsYXN0VGV4dCArIGxhc3RMaW5lLnRleHQuc2xpY2UodG8uY2gpLCBsYXN0U3BhbnMpO1xuICAgICAgdmFyIGFkZGVkJDIgPSBsaW5lc0ZvcigxLCB0ZXh0Lmxlbmd0aCAtIDEpO1xuXG4gICAgICBpZiAobmxpbmVzID4gMSkge1xuICAgICAgICBkb2MucmVtb3ZlKGZyb20ubGluZSArIDEsIG5saW5lcyAtIDEpO1xuICAgICAgfVxuXG4gICAgICBkb2MuaW5zZXJ0KGZyb20ubGluZSArIDEsIGFkZGVkJDIpO1xuICAgIH1cblxuICAgIHNpZ25hbExhdGVyKGRvYywgXCJjaGFuZ2VcIiwgZG9jLCBjaGFuZ2UpO1xuICB9IC8vIENhbGwgZiBmb3IgYWxsIGxpbmtlZCBkb2N1bWVudHMuXG5cblxuICBmdW5jdGlvbiBsaW5rZWREb2NzKGRvYywgZiwgc2hhcmVkSGlzdE9ubHkpIHtcbiAgICBmdW5jdGlvbiBwcm9wYWdhdGUoZG9jLCBza2lwLCBzaGFyZWRIaXN0KSB7XG4gICAgICBpZiAoZG9jLmxpbmtlZCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRvYy5saW5rZWQubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICB2YXIgcmVsID0gZG9jLmxpbmtlZFtpXTtcblxuICAgICAgICAgIGlmIChyZWwuZG9jID09IHNraXApIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBzaGFyZWQgPSBzaGFyZWRIaXN0ICYmIHJlbC5zaGFyZWRIaXN0O1xuXG4gICAgICAgICAgaWYgKHNoYXJlZEhpc3RPbmx5ICYmICFzaGFyZWQpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGYocmVsLmRvYywgc2hhcmVkKTtcbiAgICAgICAgICBwcm9wYWdhdGUocmVsLmRvYywgZG9jLCBzaGFyZWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHJvcGFnYXRlKGRvYywgbnVsbCwgdHJ1ZSk7XG4gIH0gLy8gQXR0YWNoIGEgZG9jdW1lbnQgdG8gYW4gZWRpdG9yLlxuXG5cbiAgZnVuY3Rpb24gYXR0YWNoRG9jKGNtLCBkb2MpIHtcbiAgICBpZiAoZG9jLmNtKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIGRvY3VtZW50IGlzIGFscmVhZHkgaW4gdXNlLlwiKTtcbiAgICB9XG5cbiAgICBjbS5kb2MgPSBkb2M7XG4gICAgZG9jLmNtID0gY207XG4gICAgZXN0aW1hdGVMaW5lSGVpZ2h0cyhjbSk7XG4gICAgbG9hZE1vZGUoY20pO1xuXG4gICAgaWYgKCFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgICAgZmluZE1heExpbmUoY20pO1xuICAgIH1cblxuICAgIGNtLm9wdGlvbnMubW9kZSA9IGRvYy5tb2RlT3B0aW9uO1xuICAgIHJlZ0NoYW5nZShjbSk7XG4gIH1cblxuICBmdW5jdGlvbiBIaXN0b3J5KHN0YXJ0R2VuKSB7XG4gICAgLy8gQXJyYXlzIG9mIGNoYW5nZSBldmVudHMgYW5kIHNlbGVjdGlvbnMuIERvaW5nIHNvbWV0aGluZyBhZGRzIGFuXG4gICAgLy8gZXZlbnQgdG8gZG9uZSBhbmQgY2xlYXJzIHVuZG8uIFVuZG9pbmcgbW92ZXMgZXZlbnRzIGZyb20gZG9uZVxuICAgIC8vIHRvIHVuZG9uZSwgcmVkb2luZyBtb3ZlcyB0aGVtIGluIHRoZSBvdGhlciBkaXJlY3Rpb24uXG4gICAgdGhpcy5kb25lID0gW107XG4gICAgdGhpcy51bmRvbmUgPSBbXTtcbiAgICB0aGlzLnVuZG9EZXB0aCA9IEluZmluaXR5OyAvLyBVc2VkIHRvIHRyYWNrIHdoZW4gY2hhbmdlcyBjYW4gYmUgbWVyZ2VkIGludG8gYSBzaW5nbGUgdW5kb1xuICAgIC8vIGV2ZW50XG5cbiAgICB0aGlzLmxhc3RNb2RUaW1lID0gdGhpcy5sYXN0U2VsVGltZSA9IDA7XG4gICAgdGhpcy5sYXN0T3AgPSB0aGlzLmxhc3RTZWxPcCA9IG51bGw7XG4gICAgdGhpcy5sYXN0T3JpZ2luID0gdGhpcy5sYXN0U2VsT3JpZ2luID0gbnVsbDsgLy8gVXNlZCBieSB0aGUgaXNDbGVhbigpIG1ldGhvZFxuXG4gICAgdGhpcy5nZW5lcmF0aW9uID0gdGhpcy5tYXhHZW5lcmF0aW9uID0gc3RhcnRHZW4gfHwgMTtcbiAgfSAvLyBDcmVhdGUgYSBoaXN0b3J5IGNoYW5nZSBldmVudCBmcm9tIGFuIHVwZGF0ZURvYy1zdHlsZSBjaGFuZ2VcbiAgLy8gb2JqZWN0LlxuXG5cbiAgZnVuY3Rpb24gaGlzdG9yeUNoYW5nZUZyb21DaGFuZ2UoZG9jLCBjaGFuZ2UpIHtcbiAgICB2YXIgaGlzdENoYW5nZSA9IHtcbiAgICAgIGZyb206IGNvcHlQb3MoY2hhbmdlLmZyb20pLFxuICAgICAgdG86IGNoYW5nZUVuZChjaGFuZ2UpLFxuICAgICAgdGV4dDogZ2V0QmV0d2Vlbihkb2MsIGNoYW5nZS5mcm9tLCBjaGFuZ2UudG8pXG4gICAgfTtcbiAgICBhdHRhY2hMb2NhbFNwYW5zKGRvYywgaGlzdENoYW5nZSwgY2hhbmdlLmZyb20ubGluZSwgY2hhbmdlLnRvLmxpbmUgKyAxKTtcbiAgICBsaW5rZWREb2NzKGRvYywgZnVuY3Rpb24gKGRvYykge1xuICAgICAgcmV0dXJuIGF0dGFjaExvY2FsU3BhbnMoZG9jLCBoaXN0Q2hhbmdlLCBjaGFuZ2UuZnJvbS5saW5lLCBjaGFuZ2UudG8ubGluZSArIDEpO1xuICAgIH0sIHRydWUpO1xuICAgIHJldHVybiBoaXN0Q2hhbmdlO1xuICB9IC8vIFBvcCBhbGwgc2VsZWN0aW9uIGV2ZW50cyBvZmYgdGhlIGVuZCBvZiBhIGhpc3RvcnkgYXJyYXkuIFN0b3AgYXRcbiAgLy8gYSBjaGFuZ2UgZXZlbnQuXG5cblxuICBmdW5jdGlvbiBjbGVhclNlbGVjdGlvbkV2ZW50cyhhcnJheSkge1xuICAgIHdoaWxlIChhcnJheS5sZW5ndGgpIHtcbiAgICAgIHZhciBsYXN0ID0gbHN0KGFycmF5KTtcblxuICAgICAgaWYgKGxhc3QucmFuZ2VzKSB7XG4gICAgICAgIGFycmF5LnBvcCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9IC8vIEZpbmQgdGhlIHRvcCBjaGFuZ2UgZXZlbnQgaW4gdGhlIGhpc3RvcnkuIFBvcCBvZmYgc2VsZWN0aW9uXG4gIC8vIGV2ZW50cyB0aGF0IGFyZSBpbiB0aGUgd2F5LlxuXG5cbiAgZnVuY3Rpb24gbGFzdENoYW5nZUV2ZW50KGhpc3QsIGZvcmNlKSB7XG4gICAgaWYgKGZvcmNlKSB7XG4gICAgICBjbGVhclNlbGVjdGlvbkV2ZW50cyhoaXN0LmRvbmUpO1xuICAgICAgcmV0dXJuIGxzdChoaXN0LmRvbmUpO1xuICAgIH0gZWxzZSBpZiAoaGlzdC5kb25lLmxlbmd0aCAmJiAhbHN0KGhpc3QuZG9uZSkucmFuZ2VzKSB7XG4gICAgICByZXR1cm4gbHN0KGhpc3QuZG9uZSk7XG4gICAgfSBlbHNlIGlmIChoaXN0LmRvbmUubGVuZ3RoID4gMSAmJiAhaGlzdC5kb25lW2hpc3QuZG9uZS5sZW5ndGggLSAyXS5yYW5nZXMpIHtcbiAgICAgIGhpc3QuZG9uZS5wb3AoKTtcbiAgICAgIHJldHVybiBsc3QoaGlzdC5kb25lKTtcbiAgICB9XG4gIH0gLy8gUmVnaXN0ZXIgYSBjaGFuZ2UgaW4gdGhlIGhpc3RvcnkuIE1lcmdlcyBjaGFuZ2VzIHRoYXQgYXJlIHdpdGhpblxuICAvLyBhIHNpbmdsZSBvcGVyYXRpb24sIG9yIGFyZSBjbG9zZSB0b2dldGhlciB3aXRoIGFuIG9yaWdpbiB0aGF0XG4gIC8vIGFsbG93cyBtZXJnaW5nIChzdGFydGluZyB3aXRoIFwiK1wiKSBpbnRvIGEgc2luZ2xlIGV2ZW50LlxuXG5cbiAgZnVuY3Rpb24gYWRkQ2hhbmdlVG9IaXN0b3J5KGRvYywgY2hhbmdlLCBzZWxBZnRlciwgb3BJZCkge1xuICAgIHZhciBoaXN0ID0gZG9jLmhpc3Rvcnk7XG4gICAgaGlzdC51bmRvbmUubGVuZ3RoID0gMDtcbiAgICB2YXIgdGltZSA9ICtuZXcgRGF0ZSgpLFxuICAgICAgICBjdXI7XG4gICAgdmFyIGxhc3Q7XG5cbiAgICBpZiAoKGhpc3QubGFzdE9wID09IG9wSWQgfHwgaGlzdC5sYXN0T3JpZ2luID09IGNoYW5nZS5vcmlnaW4gJiYgY2hhbmdlLm9yaWdpbiAmJiAoY2hhbmdlLm9yaWdpbi5jaGFyQXQoMCkgPT0gXCIrXCIgJiYgZG9jLmNtICYmIGhpc3QubGFzdE1vZFRpbWUgPiB0aW1lIC0gZG9jLmNtLm9wdGlvbnMuaGlzdG9yeUV2ZW50RGVsYXkgfHwgY2hhbmdlLm9yaWdpbi5jaGFyQXQoMCkgPT0gXCIqXCIpKSAmJiAoY3VyID0gbGFzdENoYW5nZUV2ZW50KGhpc3QsIGhpc3QubGFzdE9wID09IG9wSWQpKSkge1xuICAgICAgLy8gTWVyZ2UgdGhpcyBjaGFuZ2UgaW50byB0aGUgbGFzdCBldmVudFxuICAgICAgbGFzdCA9IGxzdChjdXIuY2hhbmdlcyk7XG5cbiAgICAgIGlmIChjbXAoY2hhbmdlLmZyb20sIGNoYW5nZS50bykgPT0gMCAmJiBjbXAoY2hhbmdlLmZyb20sIGxhc3QudG8pID09IDApIHtcbiAgICAgICAgLy8gT3B0aW1pemVkIGNhc2UgZm9yIHNpbXBsZSBpbnNlcnRpb24gLS0gZG9uJ3Qgd2FudCB0byBhZGRcbiAgICAgICAgLy8gbmV3IGNoYW5nZXNldHMgZm9yIGV2ZXJ5IGNoYXJhY3RlciB0eXBlZFxuICAgICAgICBsYXN0LnRvID0gY2hhbmdlRW5kKGNoYW5nZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBZGQgbmV3IHN1Yi1ldmVudFxuICAgICAgICBjdXIuY2hhbmdlcy5wdXNoKGhpc3RvcnlDaGFuZ2VGcm9tQ2hhbmdlKGRvYywgY2hhbmdlKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENhbiBub3QgYmUgbWVyZ2VkLCBzdGFydCBhIG5ldyBldmVudC5cbiAgICAgIHZhciBiZWZvcmUgPSBsc3QoaGlzdC5kb25lKTtcblxuICAgICAgaWYgKCFiZWZvcmUgfHwgIWJlZm9yZS5yYW5nZXMpIHtcbiAgICAgICAgcHVzaFNlbGVjdGlvblRvSGlzdG9yeShkb2Muc2VsLCBoaXN0LmRvbmUpO1xuICAgICAgfVxuXG4gICAgICBjdXIgPSB7XG4gICAgICAgIGNoYW5nZXM6IFtoaXN0b3J5Q2hhbmdlRnJvbUNoYW5nZShkb2MsIGNoYW5nZSldLFxuICAgICAgICBnZW5lcmF0aW9uOiBoaXN0LmdlbmVyYXRpb25cbiAgICAgIH07XG4gICAgICBoaXN0LmRvbmUucHVzaChjdXIpO1xuXG4gICAgICB3aGlsZSAoaGlzdC5kb25lLmxlbmd0aCA+IGhpc3QudW5kb0RlcHRoKSB7XG4gICAgICAgIGhpc3QuZG9uZS5zaGlmdCgpO1xuXG4gICAgICAgIGlmICghaGlzdC5kb25lWzBdLnJhbmdlcykge1xuICAgICAgICAgIGhpc3QuZG9uZS5zaGlmdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaGlzdC5kb25lLnB1c2goc2VsQWZ0ZXIpO1xuICAgIGhpc3QuZ2VuZXJhdGlvbiA9ICsraGlzdC5tYXhHZW5lcmF0aW9uO1xuICAgIGhpc3QubGFzdE1vZFRpbWUgPSBoaXN0Lmxhc3RTZWxUaW1lID0gdGltZTtcbiAgICBoaXN0Lmxhc3RPcCA9IGhpc3QubGFzdFNlbE9wID0gb3BJZDtcbiAgICBoaXN0Lmxhc3RPcmlnaW4gPSBoaXN0Lmxhc3RTZWxPcmlnaW4gPSBjaGFuZ2Uub3JpZ2luO1xuXG4gICAgaWYgKCFsYXN0KSB7XG4gICAgICBzaWduYWwoZG9jLCBcImhpc3RvcnlBZGRlZFwiKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZWxlY3Rpb25FdmVudENhbkJlTWVyZ2VkKGRvYywgb3JpZ2luLCBwcmV2LCBzZWwpIHtcbiAgICB2YXIgY2ggPSBvcmlnaW4uY2hhckF0KDApO1xuICAgIHJldHVybiBjaCA9PSBcIipcIiB8fCBjaCA9PSBcIitcIiAmJiBwcmV2LnJhbmdlcy5sZW5ndGggPT0gc2VsLnJhbmdlcy5sZW5ndGggJiYgcHJldi5zb21ldGhpbmdTZWxlY3RlZCgpID09IHNlbC5zb21ldGhpbmdTZWxlY3RlZCgpICYmIG5ldyBEYXRlKCkgLSBkb2MuaGlzdG9yeS5sYXN0U2VsVGltZSA8PSAoZG9jLmNtID8gZG9jLmNtLm9wdGlvbnMuaGlzdG9yeUV2ZW50RGVsYXkgOiA1MDApO1xuICB9IC8vIENhbGxlZCB3aGVuZXZlciB0aGUgc2VsZWN0aW9uIGNoYW5nZXMsIHNldHMgdGhlIG5ldyBzZWxlY3Rpb24gYXNcbiAgLy8gdGhlIHBlbmRpbmcgc2VsZWN0aW9uIGluIHRoZSBoaXN0b3J5LCBhbmQgcHVzaGVzIHRoZSBvbGQgcGVuZGluZ1xuICAvLyBzZWxlY3Rpb24gaW50byB0aGUgJ2RvbmUnIGFycmF5IHdoZW4gaXQgd2FzIHNpZ25pZmljYW50bHlcbiAgLy8gZGlmZmVyZW50IChpbiBudW1iZXIgb2Ygc2VsZWN0ZWQgcmFuZ2VzLCBlbXB0aW5lc3MsIG9yIHRpbWUpLlxuXG5cbiAgZnVuY3Rpb24gYWRkU2VsZWN0aW9uVG9IaXN0b3J5KGRvYywgc2VsLCBvcElkLCBvcHRpb25zKSB7XG4gICAgdmFyIGhpc3QgPSBkb2MuaGlzdG9yeSxcbiAgICAgICAgb3JpZ2luID0gb3B0aW9ucyAmJiBvcHRpb25zLm9yaWdpbjsgLy8gQSBuZXcgZXZlbnQgaXMgc3RhcnRlZCB3aGVuIHRoZSBwcmV2aW91cyBvcmlnaW4gZG9lcyBub3QgbWF0Y2hcbiAgICAvLyB0aGUgY3VycmVudCwgb3IgdGhlIG9yaWdpbnMgZG9uJ3QgYWxsb3cgbWF0Y2hpbmcuIE9yaWdpbnNcbiAgICAvLyBzdGFydGluZyB3aXRoICogYXJlIGFsd2F5cyBtZXJnZWQsIHRob3NlIHN0YXJ0aW5nIHdpdGggKyBhcmVcbiAgICAvLyBtZXJnZWQgd2hlbiBzaW1pbGFyIGFuZCBjbG9zZSB0b2dldGhlciBpbiB0aW1lLlxuXG4gICAgaWYgKG9wSWQgPT0gaGlzdC5sYXN0U2VsT3AgfHwgb3JpZ2luICYmIGhpc3QubGFzdFNlbE9yaWdpbiA9PSBvcmlnaW4gJiYgKGhpc3QubGFzdE1vZFRpbWUgPT0gaGlzdC5sYXN0U2VsVGltZSAmJiBoaXN0Lmxhc3RPcmlnaW4gPT0gb3JpZ2luIHx8IHNlbGVjdGlvbkV2ZW50Q2FuQmVNZXJnZWQoZG9jLCBvcmlnaW4sIGxzdChoaXN0LmRvbmUpLCBzZWwpKSkge1xuICAgICAgaGlzdC5kb25lW2hpc3QuZG9uZS5sZW5ndGggLSAxXSA9IHNlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHVzaFNlbGVjdGlvblRvSGlzdG9yeShzZWwsIGhpc3QuZG9uZSk7XG4gICAgfVxuXG4gICAgaGlzdC5sYXN0U2VsVGltZSA9ICtuZXcgRGF0ZSgpO1xuICAgIGhpc3QubGFzdFNlbE9yaWdpbiA9IG9yaWdpbjtcbiAgICBoaXN0Lmxhc3RTZWxPcCA9IG9wSWQ7XG5cbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmNsZWFyUmVkbyAhPT0gZmFsc2UpIHtcbiAgICAgIGNsZWFyU2VsZWN0aW9uRXZlbnRzKGhpc3QudW5kb25lKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwdXNoU2VsZWN0aW9uVG9IaXN0b3J5KHNlbCwgZGVzdCkge1xuICAgIHZhciB0b3AgPSBsc3QoZGVzdCk7XG5cbiAgICBpZiAoISh0b3AgJiYgdG9wLnJhbmdlcyAmJiB0b3AuZXF1YWxzKHNlbCkpKSB7XG4gICAgICBkZXN0LnB1c2goc2VsKTtcbiAgICB9XG4gIH0gLy8gVXNlZCB0byBzdG9yZSBtYXJrZWQgc3BhbiBpbmZvcm1hdGlvbiBpbiB0aGUgaGlzdG9yeS5cblxuXG4gIGZ1bmN0aW9uIGF0dGFjaExvY2FsU3BhbnMoZG9jLCBjaGFuZ2UsIGZyb20sIHRvKSB7XG4gICAgdmFyIGV4aXN0aW5nID0gY2hhbmdlW1wic3BhbnNfXCIgKyBkb2MuaWRdLFxuICAgICAgICBuID0gMDtcbiAgICBkb2MuaXRlcihNYXRoLm1heChkb2MuZmlyc3QsIGZyb20pLCBNYXRoLm1pbihkb2MuZmlyc3QgKyBkb2Muc2l6ZSwgdG8pLCBmdW5jdGlvbiAobGluZSkge1xuICAgICAgaWYgKGxpbmUubWFya2VkU3BhbnMpIHtcbiAgICAgICAgKGV4aXN0aW5nIHx8IChleGlzdGluZyA9IGNoYW5nZVtcInNwYW5zX1wiICsgZG9jLmlkXSA9IHt9KSlbbl0gPSBsaW5lLm1hcmtlZFNwYW5zO1xuICAgICAgfVxuXG4gICAgICArK247XG4gICAgfSk7XG4gIH0gLy8gV2hlbiB1bi9yZS1kb2luZyByZXN0b3JlcyB0ZXh0IGNvbnRhaW5pbmcgbWFya2VkIHNwYW5zLCB0aG9zZVxuICAvLyB0aGF0IGhhdmUgYmVlbiBleHBsaWNpdGx5IGNsZWFyZWQgc2hvdWxkIG5vdCBiZSByZXN0b3JlZC5cblxuXG4gIGZ1bmN0aW9uIHJlbW92ZUNsZWFyZWRTcGFucyhzcGFucykge1xuICAgIGlmICghc3BhbnMpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBvdXQ7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoc3BhbnNbaV0ubWFya2VyLmV4cGxpY2l0bHlDbGVhcmVkKSB7XG4gICAgICAgIGlmICghb3V0KSB7XG4gICAgICAgICAgb3V0ID0gc3BhbnMuc2xpY2UoMCwgaSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3V0KSB7XG4gICAgICAgIG91dC5wdXNoKHNwYW5zW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gIW91dCA/IHNwYW5zIDogb3V0Lmxlbmd0aCA/IG91dCA6IG51bGw7XG4gIH0gLy8gUmV0cmlldmUgYW5kIGZpbHRlciB0aGUgb2xkIG1hcmtlZCBzcGFucyBzdG9yZWQgaW4gYSBjaGFuZ2UgZXZlbnQuXG5cblxuICBmdW5jdGlvbiBnZXRPbGRTcGFucyhkb2MsIGNoYW5nZSkge1xuICAgIHZhciBmb3VuZCA9IGNoYW5nZVtcInNwYW5zX1wiICsgZG9jLmlkXTtcblxuICAgIGlmICghZm91bmQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBudyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFuZ2UudGV4dC5sZW5ndGg7ICsraSkge1xuICAgICAgbncucHVzaChyZW1vdmVDbGVhcmVkU3BhbnMoZm91bmRbaV0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnc7XG4gIH0gLy8gVXNlZCBmb3IgdW4vcmUtZG9pbmcgY2hhbmdlcyBmcm9tIHRoZSBoaXN0b3J5LiBDb21iaW5lcyB0aGVcbiAgLy8gcmVzdWx0IG9mIGNvbXB1dGluZyB0aGUgZXhpc3Rpbmcgc3BhbnMgd2l0aCB0aGUgc2V0IG9mIHNwYW5zIHRoYXRcbiAgLy8gZXhpc3RlZCBpbiB0aGUgaGlzdG9yeSAoc28gdGhhdCBkZWxldGluZyBhcm91bmQgYSBzcGFuIGFuZCB0aGVuXG4gIC8vIHVuZG9pbmcgYnJpbmdzIGJhY2sgdGhlIHNwYW4pLlxuXG5cbiAgZnVuY3Rpb24gbWVyZ2VPbGRTcGFucyhkb2MsIGNoYW5nZSkge1xuICAgIHZhciBvbGQgPSBnZXRPbGRTcGFucyhkb2MsIGNoYW5nZSk7XG4gICAgdmFyIHN0cmV0Y2hlZCA9IHN0cmV0Y2hTcGFuc092ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UpO1xuXG4gICAgaWYgKCFvbGQpIHtcbiAgICAgIHJldHVybiBzdHJldGNoZWQ7XG4gICAgfVxuXG4gICAgaWYgKCFzdHJldGNoZWQpIHtcbiAgICAgIHJldHVybiBvbGQ7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGQubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBvbGRDdXIgPSBvbGRbaV0sXG4gICAgICAgICAgc3RyZXRjaEN1ciA9IHN0cmV0Y2hlZFtpXTtcblxuICAgICAgaWYgKG9sZEN1ciAmJiBzdHJldGNoQ3VyKSB7XG4gICAgICAgIHNwYW5zOiBmb3IgKHZhciBqID0gMDsgaiA8IHN0cmV0Y2hDdXIubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICB2YXIgc3BhbiA9IHN0cmV0Y2hDdXJbal07XG5cbiAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IG9sZEN1ci5sZW5ndGg7ICsraykge1xuICAgICAgICAgICAgaWYgKG9sZEN1cltrXS5tYXJrZXIgPT0gc3Bhbi5tYXJrZXIpIHtcbiAgICAgICAgICAgICAgY29udGludWUgc3BhbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb2xkQ3VyLnB1c2goc3Bhbik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RyZXRjaEN1cikge1xuICAgICAgICBvbGRbaV0gPSBzdHJldGNoQ3VyO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvbGQ7XG4gIH0gLy8gVXNlZCBib3RoIHRvIHByb3ZpZGUgYSBKU09OLXNhZmUgb2JqZWN0IGluIC5nZXRIaXN0b3J5LCBhbmQsIHdoZW5cbiAgLy8gZGV0YWNoaW5nIGEgZG9jdW1lbnQsIHRvIHNwbGl0IHRoZSBoaXN0b3J5IGluIHR3b1xuXG5cbiAgZnVuY3Rpb24gY29weUhpc3RvcnlBcnJheShldmVudHMsIG5ld0dyb3VwLCBpbnN0YW50aWF0ZVNlbCkge1xuICAgIHZhciBjb3B5ID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGV2ZW50ID0gZXZlbnRzW2ldO1xuXG4gICAgICBpZiAoZXZlbnQucmFuZ2VzKSB7XG4gICAgICAgIGNvcHkucHVzaChpbnN0YW50aWF0ZVNlbCA/IFNlbGVjdGlvbi5wcm90b3R5cGUuZGVlcENvcHkuY2FsbChldmVudCkgOiBldmVudCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgY2hhbmdlcyA9IGV2ZW50LmNoYW5nZXMsXG4gICAgICAgICAgbmV3Q2hhbmdlcyA9IFtdO1xuICAgICAgY29weS5wdXNoKHtcbiAgICAgICAgY2hhbmdlczogbmV3Q2hhbmdlc1xuICAgICAgfSk7XG5cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY2hhbmdlcy5sZW5ndGg7ICsraikge1xuICAgICAgICB2YXIgY2hhbmdlID0gY2hhbmdlc1tqXSxcbiAgICAgICAgICAgIG0gPSB2b2lkIDA7XG4gICAgICAgIG5ld0NoYW5nZXMucHVzaCh7XG4gICAgICAgICAgZnJvbTogY2hhbmdlLmZyb20sXG4gICAgICAgICAgdG86IGNoYW5nZS50byxcbiAgICAgICAgICB0ZXh0OiBjaGFuZ2UudGV4dFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAobmV3R3JvdXApIHtcbiAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIGNoYW5nZSkge1xuICAgICAgICAgICAgaWYgKG0gPSBwcm9wLm1hdGNoKC9ec3BhbnNfKFxcZCspJC8pKSB7XG4gICAgICAgICAgICAgIGlmIChpbmRleE9mKG5ld0dyb3VwLCBOdW1iZXIobVsxXSkpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBsc3QobmV3Q2hhbmdlcylbcHJvcF0gPSBjaGFuZ2VbcHJvcF07XG4gICAgICAgICAgICAgICAgZGVsZXRlIGNoYW5nZVtwcm9wXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb3B5O1xuICB9IC8vIFRoZSAnc2Nyb2xsJyBwYXJhbWV0ZXIgZ2l2ZW4gdG8gbWFueSBvZiB0aGVzZSBpbmRpY2F0ZWQgd2hldGhlclxuICAvLyB0aGUgbmV3IGN1cnNvciBwb3NpdGlvbiBzaG91bGQgYmUgc2Nyb2xsZWQgaW50byB2aWV3IGFmdGVyXG4gIC8vIG1vZGlmeWluZyB0aGUgc2VsZWN0aW9uLlxuICAvLyBJZiBzaGlmdCBpcyBoZWxkIG9yIHRoZSBleHRlbmQgZmxhZyBpcyBzZXQsIGV4dGVuZHMgYSByYW5nZSB0b1xuICAvLyBpbmNsdWRlIGEgZ2l2ZW4gcG9zaXRpb24gKGFuZCBvcHRpb25hbGx5IGEgc2Vjb25kIHBvc2l0aW9uKS5cbiAgLy8gT3RoZXJ3aXNlLCBzaW1wbHkgcmV0dXJucyB0aGUgcmFuZ2UgYmV0d2VlbiB0aGUgZ2l2ZW4gcG9zaXRpb25zLlxuICAvLyBVc2VkIGZvciBjdXJzb3IgbW90aW9uIGFuZCBzdWNoLlxuXG5cbiAgZnVuY3Rpb24gZXh0ZW5kUmFuZ2UoZG9jLCByYW5nZSwgaGVhZCwgb3RoZXIpIHtcbiAgICBpZiAoZG9jLmNtICYmIGRvYy5jbS5kaXNwbGF5LnNoaWZ0IHx8IGRvYy5leHRlbmQpIHtcbiAgICAgIHZhciBhbmNob3IgPSByYW5nZS5hbmNob3I7XG5cbiAgICAgIGlmIChvdGhlcikge1xuICAgICAgICB2YXIgcG9zQmVmb3JlID0gY21wKGhlYWQsIGFuY2hvcikgPCAwO1xuXG4gICAgICAgIGlmIChwb3NCZWZvcmUgIT0gY21wKG90aGVyLCBhbmNob3IpIDwgMCkge1xuICAgICAgICAgIGFuY2hvciA9IGhlYWQ7XG4gICAgICAgICAgaGVhZCA9IG90aGVyO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc0JlZm9yZSAhPSBjbXAoaGVhZCwgb3RoZXIpIDwgMCkge1xuICAgICAgICAgIGhlYWQgPSBvdGhlcjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFJhbmdlKGFuY2hvciwgaGVhZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUmFuZ2Uob3RoZXIgfHwgaGVhZCwgaGVhZCk7XG4gICAgfVxuICB9IC8vIEV4dGVuZCB0aGUgcHJpbWFyeSBzZWxlY3Rpb24gcmFuZ2UsIGRpc2NhcmQgdGhlIHJlc3QuXG5cblxuICBmdW5jdGlvbiBleHRlbmRTZWxlY3Rpb24oZG9jLCBoZWFkLCBvdGhlciwgb3B0aW9ucykge1xuICAgIHNldFNlbGVjdGlvbihkb2MsIG5ldyBTZWxlY3Rpb24oW2V4dGVuZFJhbmdlKGRvYywgZG9jLnNlbC5wcmltYXJ5KCksIGhlYWQsIG90aGVyKV0sIDApLCBvcHRpb25zKTtcbiAgfSAvLyBFeHRlbmQgYWxsIHNlbGVjdGlvbnMgKHBvcyBpcyBhbiBhcnJheSBvZiBzZWxlY3Rpb25zIHdpdGggbGVuZ3RoXG4gIC8vIGVxdWFsIHRoZSBudW1iZXIgb2Ygc2VsZWN0aW9ucylcblxuXG4gIGZ1bmN0aW9uIGV4dGVuZFNlbGVjdGlvbnMoZG9jLCBoZWFkcywgb3B0aW9ucykge1xuICAgIHZhciBvdXQgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZG9jLnNlbC5yYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG91dFtpXSA9IGV4dGVuZFJhbmdlKGRvYywgZG9jLnNlbC5yYW5nZXNbaV0sIGhlYWRzW2ldLCBudWxsKTtcbiAgICB9XG5cbiAgICB2YXIgbmV3U2VsID0gbm9ybWFsaXplU2VsZWN0aW9uKG91dCwgZG9jLnNlbC5wcmltSW5kZXgpO1xuICAgIHNldFNlbGVjdGlvbihkb2MsIG5ld1NlbCwgb3B0aW9ucyk7XG4gIH0gLy8gVXBkYXRlcyBhIHNpbmdsZSByYW5nZSBpbiB0aGUgc2VsZWN0aW9uLlxuXG5cbiAgZnVuY3Rpb24gcmVwbGFjZU9uZVNlbGVjdGlvbihkb2MsIGksIHJhbmdlLCBvcHRpb25zKSB7XG4gICAgdmFyIHJhbmdlcyA9IGRvYy5zZWwucmFuZ2VzLnNsaWNlKDApO1xuICAgIHJhbmdlc1tpXSA9IHJhbmdlO1xuICAgIHNldFNlbGVjdGlvbihkb2MsIG5vcm1hbGl6ZVNlbGVjdGlvbihyYW5nZXMsIGRvYy5zZWwucHJpbUluZGV4KSwgb3B0aW9ucyk7XG4gIH0gLy8gUmVzZXQgdGhlIHNlbGVjdGlvbiB0byBhIHNpbmdsZSByYW5nZS5cblxuXG4gIGZ1bmN0aW9uIHNldFNpbXBsZVNlbGVjdGlvbihkb2MsIGFuY2hvciwgaGVhZCwgb3B0aW9ucykge1xuICAgIHNldFNlbGVjdGlvbihkb2MsIHNpbXBsZVNlbGVjdGlvbihhbmNob3IsIGhlYWQpLCBvcHRpb25zKTtcbiAgfSAvLyBHaXZlIGJlZm9yZVNlbGVjdGlvbkNoYW5nZSBoYW5kbGVycyBhIGNoYW5nZSB0byBpbmZsdWVuY2UgYVxuICAvLyBzZWxlY3Rpb24gdXBkYXRlLlxuXG5cbiAgZnVuY3Rpb24gZmlsdGVyU2VsZWN0aW9uQ2hhbmdlKGRvYywgc2VsLCBvcHRpb25zKSB7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIHJhbmdlczogc2VsLnJhbmdlcyxcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHJhbmdlcykge1xuICAgICAgICB2YXIgdGhpcyQxID0gdGhpcztcbiAgICAgICAgdGhpcy5yYW5nZXMgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRoaXMkMS5yYW5nZXNbaV0gPSBuZXcgUmFuZ2UoX2NsaXBQb3MoZG9jLCByYW5nZXNbaV0uYW5jaG9yKSwgX2NsaXBQb3MoZG9jLCByYW5nZXNbaV0uaGVhZCkpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb3JpZ2luOiBvcHRpb25zICYmIG9wdGlvbnMub3JpZ2luXG4gICAgfTtcbiAgICBzaWduYWwoZG9jLCBcImJlZm9yZVNlbGVjdGlvbkNoYW5nZVwiLCBkb2MsIG9iaik7XG5cbiAgICBpZiAoZG9jLmNtKSB7XG4gICAgICBzaWduYWwoZG9jLmNtLCBcImJlZm9yZVNlbGVjdGlvbkNoYW5nZVwiLCBkb2MuY20sIG9iaik7XG4gICAgfVxuXG4gICAgaWYgKG9iai5yYW5nZXMgIT0gc2VsLnJhbmdlcykge1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZVNlbGVjdGlvbihvYmoucmFuZ2VzLCBvYmoucmFuZ2VzLmxlbmd0aCAtIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc2VsO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFNlbGVjdGlvblJlcGxhY2VIaXN0b3J5KGRvYywgc2VsLCBvcHRpb25zKSB7XG4gICAgdmFyIGRvbmUgPSBkb2MuaGlzdG9yeS5kb25lLFxuICAgICAgICBsYXN0ID0gbHN0KGRvbmUpO1xuXG4gICAgaWYgKGxhc3QgJiYgbGFzdC5yYW5nZXMpIHtcbiAgICAgIGRvbmVbZG9uZS5sZW5ndGggLSAxXSA9IHNlbDtcbiAgICAgIHNldFNlbGVjdGlvbk5vVW5kbyhkb2MsIHNlbCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFNlbGVjdGlvbihkb2MsIHNlbCwgb3B0aW9ucyk7XG4gICAgfVxuICB9IC8vIFNldCBhIG5ldyBzZWxlY3Rpb24uXG5cblxuICBmdW5jdGlvbiBzZXRTZWxlY3Rpb24oZG9jLCBzZWwsIG9wdGlvbnMpIHtcbiAgICBzZXRTZWxlY3Rpb25Ob1VuZG8oZG9jLCBzZWwsIG9wdGlvbnMpO1xuICAgIGFkZFNlbGVjdGlvblRvSGlzdG9yeShkb2MsIGRvYy5zZWwsIGRvYy5jbSA/IGRvYy5jbS5jdXJPcC5pZCA6IE5hTiwgb3B0aW9ucyk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRTZWxlY3Rpb25Ob1VuZG8oZG9jLCBzZWwsIG9wdGlvbnMpIHtcbiAgICBpZiAoaGFzSGFuZGxlcihkb2MsIFwiYmVmb3JlU2VsZWN0aW9uQ2hhbmdlXCIpIHx8IGRvYy5jbSAmJiBoYXNIYW5kbGVyKGRvYy5jbSwgXCJiZWZvcmVTZWxlY3Rpb25DaGFuZ2VcIikpIHtcbiAgICAgIHNlbCA9IGZpbHRlclNlbGVjdGlvbkNoYW5nZShkb2MsIHNlbCwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdmFyIGJpYXMgPSBvcHRpb25zICYmIG9wdGlvbnMuYmlhcyB8fCAoY21wKHNlbC5wcmltYXJ5KCkuaGVhZCwgZG9jLnNlbC5wcmltYXJ5KCkuaGVhZCkgPCAwID8gLTEgOiAxKTtcbiAgICBzZXRTZWxlY3Rpb25Jbm5lcihkb2MsIHNraXBBdG9taWNJblNlbGVjdGlvbihkb2MsIHNlbCwgYmlhcywgdHJ1ZSkpO1xuXG4gICAgaWYgKCEob3B0aW9ucyAmJiBvcHRpb25zLnNjcm9sbCA9PT0gZmFsc2UpICYmIGRvYy5jbSkge1xuICAgICAgZW5zdXJlQ3Vyc29yVmlzaWJsZShkb2MuY20pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFNlbGVjdGlvbklubmVyKGRvYywgc2VsKSB7XG4gICAgaWYgKHNlbC5lcXVhbHMoZG9jLnNlbCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkb2Muc2VsID0gc2VsO1xuXG4gICAgaWYgKGRvYy5jbSkge1xuICAgICAgZG9jLmNtLmN1ck9wLnVwZGF0ZUlucHV0ID0gZG9jLmNtLmN1ck9wLnNlbGVjdGlvbkNoYW5nZWQgPSB0cnVlO1xuICAgICAgc2lnbmFsQ3Vyc29yQWN0aXZpdHkoZG9jLmNtKTtcbiAgICB9XG5cbiAgICBzaWduYWxMYXRlcihkb2MsIFwiY3Vyc29yQWN0aXZpdHlcIiwgZG9jKTtcbiAgfSAvLyBWZXJpZnkgdGhhdCB0aGUgc2VsZWN0aW9uIGRvZXMgbm90IHBhcnRpYWxseSBzZWxlY3QgYW55IGF0b21pY1xuICAvLyBtYXJrZWQgcmFuZ2VzLlxuXG5cbiAgZnVuY3Rpb24gcmVDaGVja1NlbGVjdGlvbihkb2MpIHtcbiAgICBzZXRTZWxlY3Rpb25Jbm5lcihkb2MsIHNraXBBdG9taWNJblNlbGVjdGlvbihkb2MsIGRvYy5zZWwsIG51bGwsIGZhbHNlKSwgc2VsX2RvbnRTY3JvbGwpO1xuICB9IC8vIFJldHVybiBhIHNlbGVjdGlvbiB0aGF0IGRvZXMgbm90IHBhcnRpYWxseSBzZWxlY3QgYW55IGF0b21pY1xuICAvLyByYW5nZXMuXG5cblxuICBmdW5jdGlvbiBza2lwQXRvbWljSW5TZWxlY3Rpb24oZG9jLCBzZWwsIGJpYXMsIG1heUNsZWFyKSB7XG4gICAgdmFyIG91dDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHJhbmdlID0gc2VsLnJhbmdlc1tpXTtcbiAgICAgIHZhciBvbGQgPSBzZWwucmFuZ2VzLmxlbmd0aCA9PSBkb2Muc2VsLnJhbmdlcy5sZW5ndGggJiYgZG9jLnNlbC5yYW5nZXNbaV07XG4gICAgICB2YXIgbmV3QW5jaG9yID0gc2tpcEF0b21pYyhkb2MsIHJhbmdlLmFuY2hvciwgb2xkICYmIG9sZC5hbmNob3IsIGJpYXMsIG1heUNsZWFyKTtcbiAgICAgIHZhciBuZXdIZWFkID0gc2tpcEF0b21pYyhkb2MsIHJhbmdlLmhlYWQsIG9sZCAmJiBvbGQuaGVhZCwgYmlhcywgbWF5Q2xlYXIpO1xuXG4gICAgICBpZiAob3V0IHx8IG5ld0FuY2hvciAhPSByYW5nZS5hbmNob3IgfHwgbmV3SGVhZCAhPSByYW5nZS5oZWFkKSB7XG4gICAgICAgIGlmICghb3V0KSB7XG4gICAgICAgICAgb3V0ID0gc2VsLnJhbmdlcy5zbGljZSgwLCBpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG91dFtpXSA9IG5ldyBSYW5nZShuZXdBbmNob3IsIG5ld0hlYWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvdXQgPyBub3JtYWxpemVTZWxlY3Rpb24ob3V0LCBzZWwucHJpbUluZGV4KSA6IHNlbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNraXBBdG9taWNJbm5lcihkb2MsIHBvcywgb2xkUG9zLCBkaXIsIG1heUNsZWFyKSB7XG4gICAgdmFyIGxpbmUgPSBnZXRMaW5lKGRvYywgcG9zLmxpbmUpO1xuXG4gICAgaWYgKGxpbmUubWFya2VkU3BhbnMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZS5tYXJrZWRTcGFucy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgc3AgPSBsaW5lLm1hcmtlZFNwYW5zW2ldLFxuICAgICAgICAgICAgbSA9IHNwLm1hcmtlcjtcblxuICAgICAgICBpZiAoKHNwLmZyb20gPT0gbnVsbCB8fCAobS5pbmNsdXNpdmVMZWZ0ID8gc3AuZnJvbSA8PSBwb3MuY2ggOiBzcC5mcm9tIDwgcG9zLmNoKSkgJiYgKHNwLnRvID09IG51bGwgfHwgKG0uaW5jbHVzaXZlUmlnaHQgPyBzcC50byA+PSBwb3MuY2ggOiBzcC50byA+IHBvcy5jaCkpKSB7XG4gICAgICAgICAgaWYgKG1heUNsZWFyKSB7XG4gICAgICAgICAgICBzaWduYWwobSwgXCJiZWZvcmVDdXJzb3JFbnRlclwiKTtcblxuICAgICAgICAgICAgaWYgKG0uZXhwbGljaXRseUNsZWFyZWQpIHtcbiAgICAgICAgICAgICAgaWYgKCFsaW5lLm1hcmtlZFNwYW5zKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLS1pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFtLmF0b21pYykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG9sZFBvcykge1xuICAgICAgICAgICAgdmFyIG5lYXIgPSBtLmZpbmQoZGlyIDwgMCA/IDEgOiAtMSksXG4gICAgICAgICAgICAgICAgZGlmZiA9IHZvaWQgMDtcblxuICAgICAgICAgICAgaWYgKGRpciA8IDAgPyBtLmluY2x1c2l2ZVJpZ2h0IDogbS5pbmNsdXNpdmVMZWZ0KSB7XG4gICAgICAgICAgICAgIG5lYXIgPSBtb3ZlUG9zKGRvYywgbmVhciwgLWRpciwgbmVhciAmJiBuZWFyLmxpbmUgPT0gcG9zLmxpbmUgPyBsaW5lIDogbnVsbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuZWFyICYmIG5lYXIubGluZSA9PSBwb3MubGluZSAmJiAoZGlmZiA9IGNtcChuZWFyLCBvbGRQb3MpKSAmJiAoZGlyIDwgMCA/IGRpZmYgPCAwIDogZGlmZiA+IDApKSB7XG4gICAgICAgICAgICAgIHJldHVybiBza2lwQXRvbWljSW5uZXIoZG9jLCBuZWFyLCBwb3MsIGRpciwgbWF5Q2xlYXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBmYXIgPSBtLmZpbmQoZGlyIDwgMCA/IC0xIDogMSk7XG5cbiAgICAgICAgICBpZiAoZGlyIDwgMCA/IG0uaW5jbHVzaXZlTGVmdCA6IG0uaW5jbHVzaXZlUmlnaHQpIHtcbiAgICAgICAgICAgIGZhciA9IG1vdmVQb3MoZG9jLCBmYXIsIGRpciwgZmFyLmxpbmUgPT0gcG9zLmxpbmUgPyBsaW5lIDogbnVsbCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGZhciA/IHNraXBBdG9taWNJbm5lcihkb2MsIGZhciwgcG9zLCBkaXIsIG1heUNsZWFyKSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcG9zO1xuICB9IC8vIEVuc3VyZSBhIGdpdmVuIHBvc2l0aW9uIGlzIG5vdCBpbnNpZGUgYW4gYXRvbWljIHJhbmdlLlxuXG5cbiAgZnVuY3Rpb24gc2tpcEF0b21pYyhkb2MsIHBvcywgb2xkUG9zLCBiaWFzLCBtYXlDbGVhcikge1xuICAgIHZhciBkaXIgPSBiaWFzIHx8IDE7XG4gICAgdmFyIGZvdW5kID0gc2tpcEF0b21pY0lubmVyKGRvYywgcG9zLCBvbGRQb3MsIGRpciwgbWF5Q2xlYXIpIHx8ICFtYXlDbGVhciAmJiBza2lwQXRvbWljSW5uZXIoZG9jLCBwb3MsIG9sZFBvcywgZGlyLCB0cnVlKSB8fCBza2lwQXRvbWljSW5uZXIoZG9jLCBwb3MsIG9sZFBvcywgLWRpciwgbWF5Q2xlYXIpIHx8ICFtYXlDbGVhciAmJiBza2lwQXRvbWljSW5uZXIoZG9jLCBwb3MsIG9sZFBvcywgLWRpciwgdHJ1ZSk7XG5cbiAgICBpZiAoIWZvdW5kKSB7XG4gICAgICBkb2MuY2FudEVkaXQgPSB0cnVlO1xuICAgICAgcmV0dXJuIFBvcyhkb2MuZmlyc3QsIDApO1xuICAgIH1cblxuICAgIHJldHVybiBmb3VuZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vdmVQb3MoZG9jLCBwb3MsIGRpciwgbGluZSkge1xuICAgIGlmIChkaXIgPCAwICYmIHBvcy5jaCA9PSAwKSB7XG4gICAgICBpZiAocG9zLmxpbmUgPiBkb2MuZmlyc3QpIHtcbiAgICAgICAgcmV0dXJuIF9jbGlwUG9zKGRvYywgUG9zKHBvcy5saW5lIC0gMSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChkaXIgPiAwICYmIHBvcy5jaCA9PSAobGluZSB8fCBnZXRMaW5lKGRvYywgcG9zLmxpbmUpKS50ZXh0Lmxlbmd0aCkge1xuICAgICAgaWYgKHBvcy5saW5lIDwgZG9jLmZpcnN0ICsgZG9jLnNpemUgLSAxKSB7XG4gICAgICAgIHJldHVybiBQb3MocG9zLmxpbmUgKyAxLCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFBvcyhwb3MubGluZSwgcG9zLmNoICsgZGlyKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZWxlY3RBbGwoY20pIHtcbiAgICBjbS5zZXRTZWxlY3Rpb24oUG9zKGNtLmZpcnN0TGluZSgpLCAwKSwgUG9zKGNtLmxhc3RMaW5lKCkpLCBzZWxfZG9udFNjcm9sbCk7XG4gIH0gLy8gVVBEQVRJTkdcbiAgLy8gQWxsb3cgXCJiZWZvcmVDaGFuZ2VcIiBldmVudCBoYW5kbGVycyB0byBpbmZsdWVuY2UgYSBjaGFuZ2VcblxuXG4gIGZ1bmN0aW9uIGZpbHRlckNoYW5nZShkb2MsIGNoYW5nZSwgdXBkYXRlKSB7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNhbmNlbGVkOiBmYWxzZSxcbiAgICAgIGZyb206IGNoYW5nZS5mcm9tLFxuICAgICAgdG86IGNoYW5nZS50byxcbiAgICAgIHRleHQ6IGNoYW5nZS50ZXh0LFxuICAgICAgb3JpZ2luOiBjaGFuZ2Uub3JpZ2luLFxuICAgICAgY2FuY2VsOiBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgICAgIHJldHVybiBvYmouY2FuY2VsZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAodXBkYXRlKSB7XG4gICAgICBvYmoudXBkYXRlID0gZnVuY3Rpb24gKGZyb20sIHRvLCB0ZXh0LCBvcmlnaW4pIHtcbiAgICAgICAgaWYgKGZyb20pIHtcbiAgICAgICAgICBvYmouZnJvbSA9IF9jbGlwUG9zKGRvYywgZnJvbSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodG8pIHtcbiAgICAgICAgICBvYmoudG8gPSBfY2xpcFBvcyhkb2MsIHRvKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgb2JqLnRleHQgPSB0ZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9yaWdpbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgb2JqLm9yaWdpbiA9IG9yaWdpbjtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBzaWduYWwoZG9jLCBcImJlZm9yZUNoYW5nZVwiLCBkb2MsIG9iaik7XG5cbiAgICBpZiAoZG9jLmNtKSB7XG4gICAgICBzaWduYWwoZG9jLmNtLCBcImJlZm9yZUNoYW5nZVwiLCBkb2MuY20sIG9iaik7XG4gICAgfVxuXG4gICAgaWYgKG9iai5jYW5jZWxlZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGZyb206IG9iai5mcm9tLFxuICAgICAgdG86IG9iai50byxcbiAgICAgIHRleHQ6IG9iai50ZXh0LFxuICAgICAgb3JpZ2luOiBvYmoub3JpZ2luXG4gICAgfTtcbiAgfSAvLyBBcHBseSBhIGNoYW5nZSB0byBhIGRvY3VtZW50LCBhbmQgYWRkIGl0IHRvIHRoZSBkb2N1bWVudCdzXG4gIC8vIGhpc3RvcnksIGFuZCBwcm9wYWdhdGluZyBpdCB0byBhbGwgbGlua2VkIGRvY3VtZW50cy5cblxuXG4gIGZ1bmN0aW9uIG1ha2VDaGFuZ2UoZG9jLCBjaGFuZ2UsIGlnbm9yZVJlYWRPbmx5KSB7XG4gICAgaWYgKGRvYy5jbSkge1xuICAgICAgaWYgKCFkb2MuY20uY3VyT3ApIHtcbiAgICAgICAgcmV0dXJuIG9wZXJhdGlvbihkb2MuY20sIG1ha2VDaGFuZ2UpKGRvYywgY2hhbmdlLCBpZ25vcmVSZWFkT25seSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkb2MuY20uc3RhdGUuc3VwcHJlc3NFZGl0cykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhhc0hhbmRsZXIoZG9jLCBcImJlZm9yZUNoYW5nZVwiKSB8fCBkb2MuY20gJiYgaGFzSGFuZGxlcihkb2MuY20sIFwiYmVmb3JlQ2hhbmdlXCIpKSB7XG4gICAgICBjaGFuZ2UgPSBmaWx0ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UsIHRydWUpO1xuXG4gICAgICBpZiAoIWNoYW5nZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSAvLyBQb3NzaWJseSBzcGxpdCBvciBzdXBwcmVzcyB0aGUgdXBkYXRlIGJhc2VkIG9uIHRoZSBwcmVzZW5jZVxuICAgIC8vIG9mIHJlYWQtb25seSBzcGFucyBpbiBpdHMgcmFuZ2UuXG5cblxuICAgIHZhciBzcGxpdCA9IHNhd1JlYWRPbmx5U3BhbnMgJiYgIWlnbm9yZVJlYWRPbmx5ICYmIHJlbW92ZVJlYWRPbmx5UmFuZ2VzKGRvYywgY2hhbmdlLmZyb20sIGNoYW5nZS50byk7XG5cbiAgICBpZiAoc3BsaXQpIHtcbiAgICAgIGZvciAodmFyIGkgPSBzcGxpdC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBtYWtlQ2hhbmdlSW5uZXIoZG9jLCB7XG4gICAgICAgICAgZnJvbTogc3BsaXRbaV0uZnJvbSxcbiAgICAgICAgICB0bzogc3BsaXRbaV0udG8sXG4gICAgICAgICAgdGV4dDogaSA/IFtcIlwiXSA6IGNoYW5nZS50ZXh0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtYWtlQ2hhbmdlSW5uZXIoZG9jLCBjaGFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1ha2VDaGFuZ2VJbm5lcihkb2MsIGNoYW5nZSkge1xuICAgIGlmIChjaGFuZ2UudGV4dC5sZW5ndGggPT0gMSAmJiBjaGFuZ2UudGV4dFswXSA9PSBcIlwiICYmIGNtcChjaGFuZ2UuZnJvbSwgY2hhbmdlLnRvKSA9PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHNlbEFmdGVyID0gY29tcHV0ZVNlbEFmdGVyQ2hhbmdlKGRvYywgY2hhbmdlKTtcbiAgICBhZGRDaGFuZ2VUb0hpc3RvcnkoZG9jLCBjaGFuZ2UsIHNlbEFmdGVyLCBkb2MuY20gPyBkb2MuY20uY3VyT3AuaWQgOiBOYU4pO1xuICAgIG1ha2VDaGFuZ2VTaW5nbGVEb2MoZG9jLCBjaGFuZ2UsIHNlbEFmdGVyLCBzdHJldGNoU3BhbnNPdmVyQ2hhbmdlKGRvYywgY2hhbmdlKSk7XG4gICAgdmFyIHJlYmFzZWQgPSBbXTtcbiAgICBsaW5rZWREb2NzKGRvYywgZnVuY3Rpb24gKGRvYywgc2hhcmVkSGlzdCkge1xuICAgICAgaWYgKCFzaGFyZWRIaXN0ICYmIGluZGV4T2YocmViYXNlZCwgZG9jLmhpc3RvcnkpID09IC0xKSB7XG4gICAgICAgIHJlYmFzZUhpc3QoZG9jLmhpc3RvcnksIGNoYW5nZSk7XG4gICAgICAgIHJlYmFzZWQucHVzaChkb2MuaGlzdG9yeSk7XG4gICAgICB9XG5cbiAgICAgIG1ha2VDaGFuZ2VTaW5nbGVEb2MoZG9jLCBjaGFuZ2UsIG51bGwsIHN0cmV0Y2hTcGFuc092ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UpKTtcbiAgICB9KTtcbiAgfSAvLyBSZXZlcnQgYSBjaGFuZ2Ugc3RvcmVkIGluIGEgZG9jdW1lbnQncyBoaXN0b3J5LlxuXG5cbiAgZnVuY3Rpb24gbWFrZUNoYW5nZUZyb21IaXN0b3J5KGRvYywgdHlwZSwgYWxsb3dTZWxlY3Rpb25Pbmx5KSB7XG4gICAgaWYgKGRvYy5jbSAmJiBkb2MuY20uc3RhdGUuc3VwcHJlc3NFZGl0cyAmJiAhYWxsb3dTZWxlY3Rpb25Pbmx5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGhpc3QgPSBkb2MuaGlzdG9yeSxcbiAgICAgICAgZXZlbnQsXG4gICAgICAgIHNlbEFmdGVyID0gZG9jLnNlbDtcbiAgICB2YXIgc291cmNlID0gdHlwZSA9PSBcInVuZG9cIiA/IGhpc3QuZG9uZSA6IGhpc3QudW5kb25lLFxuICAgICAgICBkZXN0ID0gdHlwZSA9PSBcInVuZG9cIiA/IGhpc3QudW5kb25lIDogaGlzdC5kb25lOyAvLyBWZXJpZnkgdGhhdCB0aGVyZSBpcyBhIHVzZWFibGUgZXZlbnQgKHNvIHRoYXQgY3RybC16IHdvbid0XG4gICAgLy8gbmVlZGxlc3NseSBjbGVhciBzZWxlY3Rpb24gZXZlbnRzKVxuXG4gICAgdmFyIGkgPSAwO1xuXG4gICAgZm9yICg7IGkgPCBzb3VyY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgIGV2ZW50ID0gc291cmNlW2ldO1xuXG4gICAgICBpZiAoYWxsb3dTZWxlY3Rpb25Pbmx5ID8gZXZlbnQucmFuZ2VzICYmICFldmVudC5lcXVhbHMoZG9jLnNlbCkgOiAhZXZlbnQucmFuZ2VzKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpID09IHNvdXJjZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBoaXN0Lmxhc3RPcmlnaW4gPSBoaXN0Lmxhc3RTZWxPcmlnaW4gPSBudWxsO1xuXG4gICAgZm9yICg7Oykge1xuICAgICAgZXZlbnQgPSBzb3VyY2UucG9wKCk7XG5cbiAgICAgIGlmIChldmVudC5yYW5nZXMpIHtcbiAgICAgICAgcHVzaFNlbGVjdGlvblRvSGlzdG9yeShldmVudCwgZGVzdCk7XG5cbiAgICAgICAgaWYgKGFsbG93U2VsZWN0aW9uT25seSAmJiAhZXZlbnQuZXF1YWxzKGRvYy5zZWwpKSB7XG4gICAgICAgICAgc2V0U2VsZWN0aW9uKGRvYywgZXZlbnQsIHtcbiAgICAgICAgICAgIGNsZWFyUmVkbzogZmFsc2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzZWxBZnRlciA9IGV2ZW50O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSAvLyBCdWlsZCB1cCBhIHJldmVyc2UgY2hhbmdlIG9iamVjdCB0byBhZGQgdG8gdGhlIG9wcG9zaXRlIGhpc3RvcnlcbiAgICAvLyBzdGFjayAocmVkbyB3aGVuIHVuZG9pbmcsIGFuZCB2aWNlIHZlcnNhKS5cblxuXG4gICAgdmFyIGFudGlDaGFuZ2VzID0gW107XG4gICAgcHVzaFNlbGVjdGlvblRvSGlzdG9yeShzZWxBZnRlciwgZGVzdCk7XG4gICAgZGVzdC5wdXNoKHtcbiAgICAgIGNoYW5nZXM6IGFudGlDaGFuZ2VzLFxuICAgICAgZ2VuZXJhdGlvbjogaGlzdC5nZW5lcmF0aW9uXG4gICAgfSk7XG4gICAgaGlzdC5nZW5lcmF0aW9uID0gZXZlbnQuZ2VuZXJhdGlvbiB8fCArK2hpc3QubWF4R2VuZXJhdGlvbjtcbiAgICB2YXIgZmlsdGVyID0gaGFzSGFuZGxlcihkb2MsIFwiYmVmb3JlQ2hhbmdlXCIpIHx8IGRvYy5jbSAmJiBoYXNIYW5kbGVyKGRvYy5jbSwgXCJiZWZvcmVDaGFuZ2VcIik7XG5cbiAgICB2YXIgbG9vcCA9IGZ1bmN0aW9uIGxvb3AoaSkge1xuICAgICAgdmFyIGNoYW5nZSA9IGV2ZW50LmNoYW5nZXNbaV07XG4gICAgICBjaGFuZ2Uub3JpZ2luID0gdHlwZTtcblxuICAgICAgaWYgKGZpbHRlciAmJiAhZmlsdGVyQ2hhbmdlKGRvYywgY2hhbmdlLCBmYWxzZSkpIHtcbiAgICAgICAgc291cmNlLmxlbmd0aCA9IDA7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cblxuICAgICAgYW50aUNoYW5nZXMucHVzaChoaXN0b3J5Q2hhbmdlRnJvbUNoYW5nZShkb2MsIGNoYW5nZSkpO1xuICAgICAgdmFyIGFmdGVyID0gaSA/IGNvbXB1dGVTZWxBZnRlckNoYW5nZShkb2MsIGNoYW5nZSkgOiBsc3Qoc291cmNlKTtcbiAgICAgIG1ha2VDaGFuZ2VTaW5nbGVEb2MoZG9jLCBjaGFuZ2UsIGFmdGVyLCBtZXJnZU9sZFNwYW5zKGRvYywgY2hhbmdlKSk7XG5cbiAgICAgIGlmICghaSAmJiBkb2MuY20pIHtcbiAgICAgICAgZG9jLmNtLnNjcm9sbEludG9WaWV3KHtcbiAgICAgICAgICBmcm9tOiBjaGFuZ2UuZnJvbSxcbiAgICAgICAgICB0bzogY2hhbmdlRW5kKGNoYW5nZSlcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWJhc2VkID0gW107IC8vIFByb3BhZ2F0ZSB0byB0aGUgbGlua2VkIGRvY3VtZW50c1xuXG4gICAgICBsaW5rZWREb2NzKGRvYywgZnVuY3Rpb24gKGRvYywgc2hhcmVkSGlzdCkge1xuICAgICAgICBpZiAoIXNoYXJlZEhpc3QgJiYgaW5kZXhPZihyZWJhc2VkLCBkb2MuaGlzdG9yeSkgPT0gLTEpIHtcbiAgICAgICAgICByZWJhc2VIaXN0KGRvYy5oaXN0b3J5LCBjaGFuZ2UpO1xuICAgICAgICAgIHJlYmFzZWQucHVzaChkb2MuaGlzdG9yeSk7XG4gICAgICAgIH1cblxuICAgICAgICBtYWtlQ2hhbmdlU2luZ2xlRG9jKGRvYywgY2hhbmdlLCBudWxsLCBtZXJnZU9sZFNwYW5zKGRvYywgY2hhbmdlKSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgZm9yICh2YXIgaSQxID0gZXZlbnQuY2hhbmdlcy5sZW5ndGggLSAxOyBpJDEgPj0gMDsgLS1pJDEpIHtcbiAgICAgIHZhciByZXR1cm5lZCA9IGxvb3AoaSQxKTtcbiAgICAgIGlmIChyZXR1cm5lZCkgcmV0dXJuIHJldHVybmVkLnY7XG4gICAgfVxuICB9IC8vIFN1Yi12aWV3cyBuZWVkIHRoZWlyIGxpbmUgbnVtYmVycyBzaGlmdGVkIHdoZW4gdGV4dCBpcyBhZGRlZFxuICAvLyBhYm92ZSBvciBiZWxvdyB0aGVtIGluIHRoZSBwYXJlbnQgZG9jdW1lbnQuXG5cblxuICBmdW5jdGlvbiBzaGlmdERvYyhkb2MsIGRpc3RhbmNlKSB7XG4gICAgaWYgKGRpc3RhbmNlID09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkb2MuZmlyc3QgKz0gZGlzdGFuY2U7XG4gICAgZG9jLnNlbCA9IG5ldyBTZWxlY3Rpb24obWFwKGRvYy5zZWwucmFuZ2VzLCBmdW5jdGlvbiAocmFuZ2UpIHtcbiAgICAgIHJldHVybiBuZXcgUmFuZ2UoUG9zKHJhbmdlLmFuY2hvci5saW5lICsgZGlzdGFuY2UsIHJhbmdlLmFuY2hvci5jaCksIFBvcyhyYW5nZS5oZWFkLmxpbmUgKyBkaXN0YW5jZSwgcmFuZ2UuaGVhZC5jaCkpO1xuICAgIH0pLCBkb2Muc2VsLnByaW1JbmRleCk7XG5cbiAgICBpZiAoZG9jLmNtKSB7XG4gICAgICByZWdDaGFuZ2UoZG9jLmNtLCBkb2MuZmlyc3QsIGRvYy5maXJzdCAtIGRpc3RhbmNlLCBkaXN0YW5jZSk7XG5cbiAgICAgIGZvciAodmFyIGQgPSBkb2MuY20uZGlzcGxheSwgbCA9IGQudmlld0Zyb207IGwgPCBkLnZpZXdUbzsgbCsrKSB7XG4gICAgICAgIHJlZ0xpbmVDaGFuZ2UoZG9jLmNtLCBsLCBcImd1dHRlclwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gLy8gTW9yZSBsb3dlci1sZXZlbCBjaGFuZ2UgZnVuY3Rpb24sIGhhbmRsaW5nIG9ubHkgYSBzaW5nbGUgZG9jdW1lbnRcbiAgLy8gKG5vdCBsaW5rZWQgb25lcykuXG5cblxuICBmdW5jdGlvbiBtYWtlQ2hhbmdlU2luZ2xlRG9jKGRvYywgY2hhbmdlLCBzZWxBZnRlciwgc3BhbnMpIHtcbiAgICBpZiAoZG9jLmNtICYmICFkb2MuY20uY3VyT3ApIHtcbiAgICAgIHJldHVybiBvcGVyYXRpb24oZG9jLmNtLCBtYWtlQ2hhbmdlU2luZ2xlRG9jKShkb2MsIGNoYW5nZSwgc2VsQWZ0ZXIsIHNwYW5zKTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlLnRvLmxpbmUgPCBkb2MuZmlyc3QpIHtcbiAgICAgIHNoaWZ0RG9jKGRvYywgY2hhbmdlLnRleHQubGVuZ3RoIC0gMSAtIChjaGFuZ2UudG8ubGluZSAtIGNoYW5nZS5mcm9tLmxpbmUpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlLmZyb20ubGluZSA+IGRvYy5sYXN0TGluZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfSAvLyBDbGlwIHRoZSBjaGFuZ2UgdG8gdGhlIHNpemUgb2YgdGhpcyBkb2NcblxuXG4gICAgaWYgKGNoYW5nZS5mcm9tLmxpbmUgPCBkb2MuZmlyc3QpIHtcbiAgICAgIHZhciBzaGlmdCA9IGNoYW5nZS50ZXh0Lmxlbmd0aCAtIDEgLSAoZG9jLmZpcnN0IC0gY2hhbmdlLmZyb20ubGluZSk7XG4gICAgICBzaGlmdERvYyhkb2MsIHNoaWZ0KTtcbiAgICAgIGNoYW5nZSA9IHtcbiAgICAgICAgZnJvbTogUG9zKGRvYy5maXJzdCwgMCksXG4gICAgICAgIHRvOiBQb3MoY2hhbmdlLnRvLmxpbmUgKyBzaGlmdCwgY2hhbmdlLnRvLmNoKSxcbiAgICAgICAgdGV4dDogW2xzdChjaGFuZ2UudGV4dCldLFxuICAgICAgICBvcmlnaW46IGNoYW5nZS5vcmlnaW5cbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGxhc3QgPSBkb2MubGFzdExpbmUoKTtcblxuICAgIGlmIChjaGFuZ2UudG8ubGluZSA+IGxhc3QpIHtcbiAgICAgIGNoYW5nZSA9IHtcbiAgICAgICAgZnJvbTogY2hhbmdlLmZyb20sXG4gICAgICAgIHRvOiBQb3MobGFzdCwgZ2V0TGluZShkb2MsIGxhc3QpLnRleHQubGVuZ3RoKSxcbiAgICAgICAgdGV4dDogW2NoYW5nZS50ZXh0WzBdXSxcbiAgICAgICAgb3JpZ2luOiBjaGFuZ2Uub3JpZ2luXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNoYW5nZS5yZW1vdmVkID0gZ2V0QmV0d2Vlbihkb2MsIGNoYW5nZS5mcm9tLCBjaGFuZ2UudG8pO1xuXG4gICAgaWYgKCFzZWxBZnRlcikge1xuICAgICAgc2VsQWZ0ZXIgPSBjb21wdXRlU2VsQWZ0ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UpO1xuICAgIH1cblxuICAgIGlmIChkb2MuY20pIHtcbiAgICAgIG1ha2VDaGFuZ2VTaW5nbGVEb2NJbkVkaXRvcihkb2MuY20sIGNoYW5nZSwgc3BhbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1cGRhdGVEb2MoZG9jLCBjaGFuZ2UsIHNwYW5zKTtcbiAgICB9XG5cbiAgICBzZXRTZWxlY3Rpb25Ob1VuZG8oZG9jLCBzZWxBZnRlciwgc2VsX2RvbnRTY3JvbGwpO1xuICB9IC8vIEhhbmRsZSB0aGUgaW50ZXJhY3Rpb24gb2YgYSBjaGFuZ2UgdG8gYSBkb2N1bWVudCB3aXRoIHRoZSBlZGl0b3JcbiAgLy8gdGhhdCB0aGlzIGRvY3VtZW50IGlzIHBhcnQgb2YuXG5cblxuICBmdW5jdGlvbiBtYWtlQ2hhbmdlU2luZ2xlRG9jSW5FZGl0b3IoY20sIGNoYW5nZSwgc3BhbnMpIHtcbiAgICB2YXIgZG9jID0gY20uZG9jLFxuICAgICAgICBkaXNwbGF5ID0gY20uZGlzcGxheSxcbiAgICAgICAgZnJvbSA9IGNoYW5nZS5mcm9tLFxuICAgICAgICB0byA9IGNoYW5nZS50bztcbiAgICB2YXIgcmVjb21wdXRlTWF4TGVuZ3RoID0gZmFsc2UsXG4gICAgICAgIGNoZWNrV2lkdGhTdGFydCA9IGZyb20ubGluZTtcblxuICAgIGlmICghY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIHtcbiAgICAgIGNoZWNrV2lkdGhTdGFydCA9IGxpbmVObyh2aXN1YWxMaW5lKGdldExpbmUoZG9jLCBmcm9tLmxpbmUpKSk7XG4gICAgICBkb2MuaXRlcihjaGVja1dpZHRoU3RhcnQsIHRvLmxpbmUgKyAxLCBmdW5jdGlvbiAobGluZSkge1xuICAgICAgICBpZiAobGluZSA9PSBkaXNwbGF5Lm1heExpbmUpIHtcbiAgICAgICAgICByZWNvbXB1dGVNYXhMZW5ndGggPSB0cnVlO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZG9jLnNlbC5jb250YWlucyhjaGFuZ2UuZnJvbSwgY2hhbmdlLnRvKSA+IC0xKSB7XG4gICAgICBzaWduYWxDdXJzb3JBY3Rpdml0eShjbSk7XG4gICAgfVxuXG4gICAgdXBkYXRlRG9jKGRvYywgY2hhbmdlLCBzcGFucywgZXN0aW1hdGVIZWlnaHQoY20pKTtcblxuICAgIGlmICghY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIHtcbiAgICAgIGRvYy5pdGVyKGNoZWNrV2lkdGhTdGFydCwgZnJvbS5saW5lICsgY2hhbmdlLnRleHQubGVuZ3RoLCBmdW5jdGlvbiAobGluZSkge1xuICAgICAgICB2YXIgbGVuID0gbGluZUxlbmd0aChsaW5lKTtcblxuICAgICAgICBpZiAobGVuID4gZGlzcGxheS5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgICAgICAgZGlzcGxheS5tYXhMaW5lID0gbGluZTtcbiAgICAgICAgICBkaXNwbGF5Lm1heExpbmVMZW5ndGggPSBsZW47XG4gICAgICAgICAgZGlzcGxheS5tYXhMaW5lQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgcmVjb21wdXRlTWF4TGVuZ3RoID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVjb21wdXRlTWF4TGVuZ3RoKSB7XG4gICAgICAgIGNtLmN1ck9wLnVwZGF0ZU1heExpbmUgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gLy8gQWRqdXN0IGZyb250aWVyLCBzY2hlZHVsZSB3b3JrZXJcblxuXG4gICAgZG9jLmZyb250aWVyID0gTWF0aC5taW4oZG9jLmZyb250aWVyLCBmcm9tLmxpbmUpO1xuICAgIHN0YXJ0V29ya2VyKGNtLCA0MDApO1xuICAgIHZhciBsZW5kaWZmID0gY2hhbmdlLnRleHQubGVuZ3RoIC0gKHRvLmxpbmUgLSBmcm9tLmxpbmUpIC0gMTsgLy8gUmVtZW1iZXIgdGhhdCB0aGVzZSBsaW5lcyBjaGFuZ2VkLCBmb3IgdXBkYXRpbmcgdGhlIGRpc3BsYXlcblxuICAgIGlmIChjaGFuZ2UuZnVsbCkge1xuICAgICAgcmVnQ2hhbmdlKGNtKTtcbiAgICB9IGVsc2UgaWYgKGZyb20ubGluZSA9PSB0by5saW5lICYmIGNoYW5nZS50ZXh0Lmxlbmd0aCA9PSAxICYmICFpc1dob2xlTGluZVVwZGF0ZShjbS5kb2MsIGNoYW5nZSkpIHtcbiAgICAgIHJlZ0xpbmVDaGFuZ2UoY20sIGZyb20ubGluZSwgXCJ0ZXh0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWdDaGFuZ2UoY20sIGZyb20ubGluZSwgdG8ubGluZSArIDEsIGxlbmRpZmYpO1xuICAgIH1cblxuICAgIHZhciBjaGFuZ2VzSGFuZGxlciA9IGhhc0hhbmRsZXIoY20sIFwiY2hhbmdlc1wiKSxcbiAgICAgICAgY2hhbmdlSGFuZGxlciA9IGhhc0hhbmRsZXIoY20sIFwiY2hhbmdlXCIpO1xuXG4gICAgaWYgKGNoYW5nZUhhbmRsZXIgfHwgY2hhbmdlc0hhbmRsZXIpIHtcbiAgICAgIHZhciBvYmogPSB7XG4gICAgICAgIGZyb206IGZyb20sXG4gICAgICAgIHRvOiB0byxcbiAgICAgICAgdGV4dDogY2hhbmdlLnRleHQsXG4gICAgICAgIHJlbW92ZWQ6IGNoYW5nZS5yZW1vdmVkLFxuICAgICAgICBvcmlnaW46IGNoYW5nZS5vcmlnaW5cbiAgICAgIH07XG5cbiAgICAgIGlmIChjaGFuZ2VIYW5kbGVyKSB7XG4gICAgICAgIHNpZ25hbExhdGVyKGNtLCBcImNoYW5nZVwiLCBjbSwgb2JqKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNoYW5nZXNIYW5kbGVyKSB7XG4gICAgICAgIChjbS5jdXJPcC5jaGFuZ2VPYmpzIHx8IChjbS5jdXJPcC5jaGFuZ2VPYmpzID0gW10pKS5wdXNoKG9iaik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY20uZGlzcGxheS5zZWxGb3JDb250ZXh0TWVudSA9IG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBfcmVwbGFjZVJhbmdlKGRvYywgY29kZSwgZnJvbSwgdG8sIG9yaWdpbikge1xuICAgIGlmICghdG8pIHtcbiAgICAgIHRvID0gZnJvbTtcbiAgICB9XG5cbiAgICBpZiAoY21wKHRvLCBmcm9tKSA8IDApIHtcbiAgICAgIHZhciB0bXAgPSB0bztcbiAgICAgIHRvID0gZnJvbTtcbiAgICAgIGZyb20gPSB0bXA7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBjb2RlID09IFwic3RyaW5nXCIpIHtcbiAgICAgIGNvZGUgPSBkb2Muc3BsaXRMaW5lcyhjb2RlKTtcbiAgICB9XG5cbiAgICBtYWtlQ2hhbmdlKGRvYywge1xuICAgICAgZnJvbTogZnJvbSxcbiAgICAgIHRvOiB0byxcbiAgICAgIHRleHQ6IGNvZGUsXG4gICAgICBvcmlnaW46IG9yaWdpblxuICAgIH0pO1xuICB9IC8vIFJlYmFzaW5nL3Jlc2V0dGluZyBoaXN0b3J5IHRvIGRlYWwgd2l0aCBleHRlcm5hbGx5LXNvdXJjZWQgY2hhbmdlc1xuXG5cbiAgZnVuY3Rpb24gcmViYXNlSGlzdFNlbFNpbmdsZShwb3MsIGZyb20sIHRvLCBkaWZmKSB7XG4gICAgaWYgKHRvIDwgcG9zLmxpbmUpIHtcbiAgICAgIHBvcy5saW5lICs9IGRpZmY7XG4gICAgfSBlbHNlIGlmIChmcm9tIDwgcG9zLmxpbmUpIHtcbiAgICAgIHBvcy5saW5lID0gZnJvbTtcbiAgICAgIHBvcy5jaCA9IDA7XG4gICAgfVxuICB9IC8vIFRyaWVzIHRvIHJlYmFzZSBhbiBhcnJheSBvZiBoaXN0b3J5IGV2ZW50cyBnaXZlbiBhIGNoYW5nZSBpbiB0aGVcbiAgLy8gZG9jdW1lbnQuIElmIHRoZSBjaGFuZ2UgdG91Y2hlcyB0aGUgc2FtZSBsaW5lcyBhcyB0aGUgZXZlbnQsIHRoZVxuICAvLyBldmVudCwgYW5kIGV2ZXJ5dGhpbmcgJ2JlaGluZCcgaXQsIGlzIGRpc2NhcmRlZC4gSWYgdGhlIGNoYW5nZSBpc1xuICAvLyBiZWZvcmUgdGhlIGV2ZW50LCB0aGUgZXZlbnQncyBwb3NpdGlvbnMgYXJlIHVwZGF0ZWQuIFVzZXMgYVxuICAvLyBjb3B5LW9uLXdyaXRlIHNjaGVtZSBmb3IgdGhlIHBvc2l0aW9ucywgdG8gYXZvaWQgaGF2aW5nIHRvXG4gIC8vIHJlYWxsb2NhdGUgdGhlbSBhbGwgb24gZXZlcnkgcmViYXNlLCBidXQgYWxzbyBhdm9pZCBwcm9ibGVtcyB3aXRoXG4gIC8vIHNoYXJlZCBwb3NpdGlvbiBvYmplY3RzIGJlaW5nIHVuc2FmZWx5IHVwZGF0ZWQuXG5cblxuICBmdW5jdGlvbiByZWJhc2VIaXN0QXJyYXkoYXJyYXksIGZyb20sIHRvLCBkaWZmKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHN1YiA9IGFycmF5W2ldLFxuICAgICAgICAgIG9rID0gdHJ1ZTtcblxuICAgICAgaWYgKHN1Yi5yYW5nZXMpIHtcbiAgICAgICAgaWYgKCFzdWIuY29waWVkKSB7XG4gICAgICAgICAgc3ViID0gYXJyYXlbaV0gPSBzdWIuZGVlcENvcHkoKTtcbiAgICAgICAgICBzdWIuY29waWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ViLnJhbmdlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHJlYmFzZUhpc3RTZWxTaW5nbGUoc3ViLnJhbmdlc1tqXS5hbmNob3IsIGZyb20sIHRvLCBkaWZmKTtcbiAgICAgICAgICByZWJhc2VIaXN0U2VsU2luZ2xlKHN1Yi5yYW5nZXNbal0uaGVhZCwgZnJvbSwgdG8sIGRpZmYpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGokMSA9IDA7IGokMSA8IHN1Yi5jaGFuZ2VzLmxlbmd0aDsgKytqJDEpIHtcbiAgICAgICAgdmFyIGN1ciA9IHN1Yi5jaGFuZ2VzW2okMV07XG5cbiAgICAgICAgaWYgKHRvIDwgY3VyLmZyb20ubGluZSkge1xuICAgICAgICAgIGN1ci5mcm9tID0gUG9zKGN1ci5mcm9tLmxpbmUgKyBkaWZmLCBjdXIuZnJvbS5jaCk7XG4gICAgICAgICAgY3VyLnRvID0gUG9zKGN1ci50by5saW5lICsgZGlmZiwgY3VyLnRvLmNoKTtcbiAgICAgICAgfSBlbHNlIGlmIChmcm9tIDw9IGN1ci50by5saW5lKSB7XG4gICAgICAgICAgb2sgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIW9rKSB7XG4gICAgICAgIGFycmF5LnNwbGljZSgwLCBpICsgMSk7XG4gICAgICAgIGkgPSAwO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYmFzZUhpc3QoaGlzdCwgY2hhbmdlKSB7XG4gICAgdmFyIGZyb20gPSBjaGFuZ2UuZnJvbS5saW5lLFxuICAgICAgICB0byA9IGNoYW5nZS50by5saW5lLFxuICAgICAgICBkaWZmID0gY2hhbmdlLnRleHQubGVuZ3RoIC0gKHRvIC0gZnJvbSkgLSAxO1xuICAgIHJlYmFzZUhpc3RBcnJheShoaXN0LmRvbmUsIGZyb20sIHRvLCBkaWZmKTtcbiAgICByZWJhc2VIaXN0QXJyYXkoaGlzdC51bmRvbmUsIGZyb20sIHRvLCBkaWZmKTtcbiAgfSAvLyBVdGlsaXR5IGZvciBhcHBseWluZyBhIGNoYW5nZSB0byBhIGxpbmUgYnkgaGFuZGxlIG9yIG51bWJlcixcbiAgLy8gcmV0dXJuaW5nIHRoZSBudW1iZXIgYW5kIG9wdGlvbmFsbHkgcmVnaXN0ZXJpbmcgdGhlIGxpbmUgYXNcbiAgLy8gY2hhbmdlZC5cblxuXG4gIGZ1bmN0aW9uIGNoYW5nZUxpbmUoZG9jLCBoYW5kbGUsIGNoYW5nZVR5cGUsIG9wKSB7XG4gICAgdmFyIG5vID0gaGFuZGxlLFxuICAgICAgICBsaW5lID0gaGFuZGxlO1xuXG4gICAgaWYgKHR5cGVvZiBoYW5kbGUgPT0gXCJudW1iZXJcIikge1xuICAgICAgbGluZSA9IGdldExpbmUoZG9jLCBjbGlwTGluZShkb2MsIGhhbmRsZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBubyA9IGxpbmVObyhoYW5kbGUpO1xuICAgIH1cblxuICAgIGlmIChubyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAob3AobGluZSwgbm8pICYmIGRvYy5jbSkge1xuICAgICAgcmVnTGluZUNoYW5nZShkb2MuY20sIG5vLCBjaGFuZ2VUeXBlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGluZTtcbiAgfSAvLyBUaGUgZG9jdW1lbnQgaXMgcmVwcmVzZW50ZWQgYXMgYSBCVHJlZSBjb25zaXN0aW5nIG9mIGxlYXZlcywgd2l0aFxuICAvLyBjaHVuayBvZiBsaW5lcyBpbiB0aGVtLCBhbmQgYnJhbmNoZXMsIHdpdGggdXAgdG8gdGVuIGxlYXZlcyBvclxuICAvLyBvdGhlciBicmFuY2ggbm9kZXMgYmVsb3cgdGhlbS4gVGhlIHRvcCBub2RlIGlzIGFsd2F5cyBhIGJyYW5jaFxuICAvLyBub2RlLCBhbmQgaXMgdGhlIGRvY3VtZW50IG9iamVjdCBpdHNlbGYgKG1lYW5pbmcgaXQgaGFzXG4gIC8vIGFkZGl0aW9uYWwgbWV0aG9kcyBhbmQgcHJvcGVydGllcykuXG4gIC8vXG4gIC8vIEFsbCBub2RlcyBoYXZlIHBhcmVudCBsaW5rcy4gVGhlIHRyZWUgaXMgdXNlZCBib3RoIHRvIGdvIGZyb21cbiAgLy8gbGluZSBudW1iZXJzIHRvIGxpbmUgb2JqZWN0cywgYW5kIHRvIGdvIGZyb20gb2JqZWN0cyB0byBudW1iZXJzLlxuICAvLyBJdCBhbHNvIGluZGV4ZXMgYnkgaGVpZ2h0LCBhbmQgaXMgdXNlZCB0byBjb252ZXJ0IGJldHdlZW4gaGVpZ2h0XG4gIC8vIGFuZCBsaW5lIG9iamVjdCwgYW5kIHRvIGZpbmQgdGhlIHRvdGFsIGhlaWdodCBvZiB0aGUgZG9jdW1lbnQuXG4gIC8vXG4gIC8vIFNlZSBhbHNvIGh0dHA6Ly9tYXJpam5oYXZlcmJla2UubmwvYmxvZy9jb2RlbWlycm9yLWxpbmUtdHJlZS5odG1sXG5cblxuICBmdW5jdGlvbiBMZWFmQ2h1bmsobGluZXMpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcbiAgICB0aGlzLmxpbmVzID0gbGluZXM7XG4gICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgIHZhciBoZWlnaHQgPSAwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgbGluZXNbaV0ucGFyZW50ID0gdGhpcyQxO1xuICAgICAgaGVpZ2h0ICs9IGxpbmVzW2ldLmhlaWdodDtcbiAgICB9XG5cbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgfVxuXG4gIExlYWZDaHVuay5wcm90b3R5cGUgPSB7XG4gICAgY2h1bmtTaXplOiBmdW5jdGlvbiBjaHVua1NpemUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5saW5lcy5sZW5ndGg7XG4gICAgfSxcbiAgICAvLyBSZW1vdmUgdGhlIG4gbGluZXMgYXQgb2Zmc2V0ICdhdCcuXG4gICAgcmVtb3ZlSW5uZXI6IGZ1bmN0aW9uIHJlbW92ZUlubmVyKGF0LCBuKSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgaSA9IGF0LCBlID0gYXQgKyBuOyBpIDwgZTsgKytpKSB7XG4gICAgICAgIHZhciBsaW5lID0gdGhpcyQxLmxpbmVzW2ldO1xuICAgICAgICB0aGlzJDEuaGVpZ2h0IC09IGxpbmUuaGVpZ2h0O1xuICAgICAgICBjbGVhblVwTGluZShsaW5lKTtcbiAgICAgICAgc2lnbmFsTGF0ZXIobGluZSwgXCJkZWxldGVcIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGluZXMuc3BsaWNlKGF0LCBuKTtcbiAgICB9LFxuICAgIC8vIEhlbHBlciB1c2VkIHRvIGNvbGxhcHNlIGEgc21hbGwgYnJhbmNoIGludG8gYSBzaW5nbGUgbGVhZi5cbiAgICBjb2xsYXBzZTogZnVuY3Rpb24gY29sbGFwc2UobGluZXMpIHtcbiAgICAgIGxpbmVzLnB1c2guYXBwbHkobGluZXMsIHRoaXMubGluZXMpO1xuICAgIH0sXG4gICAgLy8gSW5zZXJ0IHRoZSBnaXZlbiBhcnJheSBvZiBsaW5lcyBhdCBvZmZzZXQgJ2F0JywgY291bnQgdGhlbSBhc1xuICAgIC8vIGhhdmluZyB0aGUgZ2l2ZW4gaGVpZ2h0LlxuICAgIGluc2VydElubmVyOiBmdW5jdGlvbiBpbnNlcnRJbm5lcihhdCwgbGluZXMsIGhlaWdodCkge1xuICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG4gICAgICB0aGlzLmhlaWdodCArPSBoZWlnaHQ7XG4gICAgICB0aGlzLmxpbmVzID0gdGhpcy5saW5lcy5zbGljZSgwLCBhdCkuY29uY2F0KGxpbmVzKS5jb25jYXQodGhpcy5saW5lcy5zbGljZShhdCkpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGxpbmVzW2ldLnBhcmVudCA9IHRoaXMkMTtcbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIFVzZWQgdG8gaXRlcmF0ZSBvdmVyIGEgcGFydCBvZiB0aGUgdHJlZS5cbiAgICBpdGVyTjogZnVuY3Rpb24gaXRlck4oYXQsIG4sIG9wKSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgZSA9IGF0ICsgbjsgYXQgPCBlOyArK2F0KSB7XG4gICAgICAgIGlmIChvcCh0aGlzJDEubGluZXNbYXRdKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIEJyYW5jaENodW5rKGNoaWxkcmVuKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIHZhciBzaXplID0gMCxcbiAgICAgICAgaGVpZ2h0ID0gMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBjaCA9IGNoaWxkcmVuW2ldO1xuICAgICAgc2l6ZSArPSBjaC5jaHVua1NpemUoKTtcbiAgICAgIGhlaWdodCArPSBjaC5oZWlnaHQ7XG4gICAgICBjaC5wYXJlbnQgPSB0aGlzJDE7XG4gICAgfVxuXG4gICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XG4gIH1cblxuICBCcmFuY2hDaHVuay5wcm90b3R5cGUgPSB7XG4gICAgY2h1bmtTaXplOiBmdW5jdGlvbiBjaHVua1NpemUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaXplO1xuICAgIH0sXG4gICAgcmVtb3ZlSW5uZXI6IGZ1bmN0aW9uIHJlbW92ZUlubmVyKGF0LCBuKSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcbiAgICAgIHRoaXMuc2l6ZSAtPSBuO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGNoaWxkID0gdGhpcyQxLmNoaWxkcmVuW2ldLFxuICAgICAgICAgICAgc3ogPSBjaGlsZC5jaHVua1NpemUoKTtcblxuICAgICAgICBpZiAoYXQgPCBzeikge1xuICAgICAgICAgIHZhciBybSA9IE1hdGgubWluKG4sIHN6IC0gYXQpLFxuICAgICAgICAgICAgICBvbGRIZWlnaHQgPSBjaGlsZC5oZWlnaHQ7XG4gICAgICAgICAgY2hpbGQucmVtb3ZlSW5uZXIoYXQsIHJtKTtcbiAgICAgICAgICB0aGlzJDEuaGVpZ2h0IC09IG9sZEhlaWdodCAtIGNoaWxkLmhlaWdodDtcblxuICAgICAgICAgIGlmIChzeiA9PSBybSkge1xuICAgICAgICAgICAgdGhpcyQxLmNoaWxkcmVuLnNwbGljZShpLS0sIDEpO1xuICAgICAgICAgICAgY2hpbGQucGFyZW50ID0gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoKG4gLT0gcm0pID09IDApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGF0ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhdCAtPSBzejtcbiAgICAgICAgfVxuICAgICAgfSAvLyBJZiB0aGUgcmVzdWx0IGlzIHNtYWxsZXIgdGhhbiAyNSBsaW5lcywgZW5zdXJlIHRoYXQgaXQgaXMgYVxuICAgICAgLy8gc2luZ2xlIGxlYWYgbm9kZS5cblxuXG4gICAgICBpZiAodGhpcy5zaXplIC0gbiA8IDI1ICYmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDEgfHwgISh0aGlzLmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgTGVhZkNodW5rKSkpIHtcbiAgICAgICAgdmFyIGxpbmVzID0gW107XG4gICAgICAgIHRoaXMuY29sbGFwc2UobGluZXMpO1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW25ldyBMZWFmQ2h1bmsobGluZXMpXTtcbiAgICAgICAgdGhpcy5jaGlsZHJlblswXS5wYXJlbnQgPSB0aGlzO1xuICAgICAgfVxuICAgIH0sXG4gICAgY29sbGFwc2U6IGZ1bmN0aW9uIGNvbGxhcHNlKGxpbmVzKSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHRoaXMkMS5jaGlsZHJlbltpXS5jb2xsYXBzZShsaW5lcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBpbnNlcnRJbm5lcjogZnVuY3Rpb24gaW5zZXJ0SW5uZXIoYXQsIGxpbmVzLCBoZWlnaHQpIHtcbiAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuICAgICAgdGhpcy5zaXplICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgIHRoaXMuaGVpZ2h0ICs9IGhlaWdodDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IHRoaXMkMS5jaGlsZHJlbltpXSxcbiAgICAgICAgICAgIHN6ID0gY2hpbGQuY2h1bmtTaXplKCk7XG5cbiAgICAgICAgaWYgKGF0IDw9IHN6KSB7XG4gICAgICAgICAgY2hpbGQuaW5zZXJ0SW5uZXIoYXQsIGxpbmVzLCBoZWlnaHQpO1xuXG4gICAgICAgICAgaWYgKGNoaWxkLmxpbmVzICYmIGNoaWxkLmxpbmVzLmxlbmd0aCA+IDUwKSB7XG4gICAgICAgICAgICAvLyBUbyBhdm9pZCBtZW1vcnkgdGhyYXNoaW5nIHdoZW4gY2hpbGQubGluZXMgaXMgaHVnZSAoZS5nLiBmaXJzdCB2aWV3IG9mIGEgbGFyZ2UgZmlsZSksIGl0J3MgbmV2ZXIgc3BsaWNlZC5cbiAgICAgICAgICAgIC8vIEluc3RlYWQsIHNtYWxsIHNsaWNlcyBhcmUgdGFrZW4uIFRoZXkncmUgdGFrZW4gaW4gb3JkZXIgYmVjYXVzZSBzZXF1ZW50aWFsIG1lbW9yeSBhY2Nlc3NlcyBhcmUgZmFzdGVzdC5cbiAgICAgICAgICAgIHZhciByZW1haW5pbmcgPSBjaGlsZC5saW5lcy5sZW5ndGggJSAyNSArIDI1O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBwb3MgPSByZW1haW5pbmc7IHBvcyA8IGNoaWxkLmxpbmVzLmxlbmd0aDspIHtcbiAgICAgICAgICAgICAgdmFyIGxlYWYgPSBuZXcgTGVhZkNodW5rKGNoaWxkLmxpbmVzLnNsaWNlKHBvcywgcG9zICs9IDI1KSk7XG4gICAgICAgICAgICAgIGNoaWxkLmhlaWdodCAtPSBsZWFmLmhlaWdodDtcbiAgICAgICAgICAgICAgdGhpcyQxLmNoaWxkcmVuLnNwbGljZSgrK2ksIDAsIGxlYWYpO1xuICAgICAgICAgICAgICBsZWFmLnBhcmVudCA9IHRoaXMkMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hpbGQubGluZXMgPSBjaGlsZC5saW5lcy5zbGljZSgwLCByZW1haW5pbmcpO1xuICAgICAgICAgICAgdGhpcyQxLm1heWJlU3BpbGwoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGF0IC09IHN6O1xuICAgICAgfVxuICAgIH0sXG4gICAgLy8gV2hlbiBhIG5vZGUgaGFzIGdyb3duLCBjaGVjayB3aGV0aGVyIGl0IHNob3VsZCBiZSBzcGxpdC5cbiAgICBtYXliZVNwaWxsOiBmdW5jdGlvbiBtYXliZVNwaWxsKCkge1xuICAgICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoIDw9IDEwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIG1lID0gdGhpcztcblxuICAgICAgZG8ge1xuICAgICAgICB2YXIgc3BpbGxlZCA9IG1lLmNoaWxkcmVuLnNwbGljZShtZS5jaGlsZHJlbi5sZW5ndGggLSA1LCA1KTtcbiAgICAgICAgdmFyIHNpYmxpbmcgPSBuZXcgQnJhbmNoQ2h1bmsoc3BpbGxlZCk7XG5cbiAgICAgICAgaWYgKCFtZS5wYXJlbnQpIHtcbiAgICAgICAgICAvLyBCZWNvbWUgdGhlIHBhcmVudCBub2RlXG4gICAgICAgICAgdmFyIGNvcHkgPSBuZXcgQnJhbmNoQ2h1bmsobWUuY2hpbGRyZW4pO1xuICAgICAgICAgIGNvcHkucGFyZW50ID0gbWU7XG4gICAgICAgICAgbWUuY2hpbGRyZW4gPSBbY29weSwgc2libGluZ107XG4gICAgICAgICAgbWUgPSBjb3B5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1lLnNpemUgLT0gc2libGluZy5zaXplO1xuICAgICAgICAgIG1lLmhlaWdodCAtPSBzaWJsaW5nLmhlaWdodDtcbiAgICAgICAgICB2YXIgbXlJbmRleCA9IGluZGV4T2YobWUucGFyZW50LmNoaWxkcmVuLCBtZSk7XG4gICAgICAgICAgbWUucGFyZW50LmNoaWxkcmVuLnNwbGljZShteUluZGV4ICsgMSwgMCwgc2libGluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzaWJsaW5nLnBhcmVudCA9IG1lLnBhcmVudDtcbiAgICAgIH0gd2hpbGUgKG1lLmNoaWxkcmVuLmxlbmd0aCA+IDEwKTtcblxuICAgICAgbWUucGFyZW50Lm1heWJlU3BpbGwoKTtcbiAgICB9LFxuICAgIGl0ZXJOOiBmdW5jdGlvbiBpdGVyTihhdCwgbiwgb3ApIHtcbiAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGNoaWxkID0gdGhpcyQxLmNoaWxkcmVuW2ldLFxuICAgICAgICAgICAgc3ogPSBjaGlsZC5jaHVua1NpemUoKTtcblxuICAgICAgICBpZiAoYXQgPCBzeikge1xuICAgICAgICAgIHZhciB1c2VkID0gTWF0aC5taW4obiwgc3ogLSBhdCk7XG5cbiAgICAgICAgICBpZiAoY2hpbGQuaXRlck4oYXQsIHVzZWQsIG9wKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKChuIC09IHVzZWQpID09IDApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGF0ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhdCAtPSBzejtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTsgLy8gTGluZSB3aWRnZXRzIGFyZSBibG9jayBlbGVtZW50cyBkaXNwbGF5ZWQgYWJvdmUgb3IgYmVsb3cgYSBsaW5lLlxuXG4gIGZ1bmN0aW9uIExpbmVXaWRnZXQoZG9jLCBub2RlLCBvcHRpb25zKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgZm9yICh2YXIgb3B0IGluIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaGFzT3duUHJvcGVydHkob3B0KSkge1xuICAgICAgICAgIHRoaXMkMVtvcHRdID0gb3B0aW9uc1tvcHRdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5kb2MgPSBkb2M7XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgfVxuXG4gIGV2ZW50TWl4aW4oTGluZVdpZGdldCk7XG5cbiAgZnVuY3Rpb24gYWRqdXN0U2Nyb2xsV2hlbkFib3ZlVmlzaWJsZShjbSwgbGluZSwgZGlmZikge1xuICAgIGlmIChfaGVpZ2h0QXRMaW5lKGxpbmUpIDwgKGNtLmN1ck9wICYmIGNtLmN1ck9wLnNjcm9sbFRvcCB8fCBjbS5kb2Muc2Nyb2xsVG9wKSkge1xuICAgICAgYWRkVG9TY3JvbGxQb3MoY20sIG51bGwsIGRpZmYpO1xuICAgIH1cbiAgfVxuXG4gIExpbmVXaWRnZXQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuICAgIHZhciBjbSA9IHRoaXMuZG9jLmNtLFxuICAgICAgICB3cyA9IHRoaXMubGluZS53aWRnZXRzLFxuICAgICAgICBsaW5lID0gdGhpcy5saW5lLFxuICAgICAgICBubyA9IGxpbmVObyhsaW5lKTtcblxuICAgIGlmIChubyA9PSBudWxsIHx8ICF3cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd3MubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmICh3c1tpXSA9PSB0aGlzJDEpIHtcbiAgICAgICAgd3Muc3BsaWNlKGktLSwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF3cy5sZW5ndGgpIHtcbiAgICAgIGxpbmUud2lkZ2V0cyA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGhlaWdodCA9IHdpZGdldEhlaWdodCh0aGlzKTtcbiAgICB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIE1hdGgubWF4KDAsIGxpbmUuaGVpZ2h0IC0gaGVpZ2h0KSk7XG5cbiAgICBpZiAoY20pIHtcbiAgICAgIHJ1bkluT3AoY20sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYWRqdXN0U2Nyb2xsV2hlbkFib3ZlVmlzaWJsZShjbSwgbGluZSwgLWhlaWdodCk7XG4gICAgICAgIHJlZ0xpbmVDaGFuZ2UoY20sIG5vLCBcIndpZGdldFwiKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBMaW5lV2lkZ2V0LnByb3RvdHlwZS5jaGFuZ2VkID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvbGRIID0gdGhpcy5oZWlnaHQsXG4gICAgICAgIGNtID0gdGhpcy5kb2MuY20sXG4gICAgICAgIGxpbmUgPSB0aGlzLmxpbmU7XG4gICAgdGhpcy5oZWlnaHQgPSBudWxsO1xuICAgIHZhciBkaWZmID0gd2lkZ2V0SGVpZ2h0KHRoaXMpIC0gb2xkSDtcblxuICAgIGlmICghZGlmZikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgbGluZS5oZWlnaHQgKyBkaWZmKTtcblxuICAgIGlmIChjbSkge1xuICAgICAgcnVuSW5PcChjbSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBjbS5jdXJPcC5mb3JjZVVwZGF0ZSA9IHRydWU7XG4gICAgICAgIGFkanVzdFNjcm9sbFdoZW5BYm92ZVZpc2libGUoY20sIGxpbmUsIGRpZmYpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGFkZExpbmVXaWRnZXQoZG9jLCBoYW5kbGUsIG5vZGUsIG9wdGlvbnMpIHtcbiAgICB2YXIgd2lkZ2V0ID0gbmV3IExpbmVXaWRnZXQoZG9jLCBub2RlLCBvcHRpb25zKTtcbiAgICB2YXIgY20gPSBkb2MuY207XG5cbiAgICBpZiAoY20gJiYgd2lkZ2V0Lm5vSFNjcm9sbCkge1xuICAgICAgY20uZGlzcGxheS5hbGlnbldpZGdldHMgPSB0cnVlO1xuICAgIH1cblxuICAgIGNoYW5nZUxpbmUoZG9jLCBoYW5kbGUsIFwid2lkZ2V0XCIsIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICB2YXIgd2lkZ2V0cyA9IGxpbmUud2lkZ2V0cyB8fCAobGluZS53aWRnZXRzID0gW10pO1xuXG4gICAgICBpZiAod2lkZ2V0Lmluc2VydEF0ID09IG51bGwpIHtcbiAgICAgICAgd2lkZ2V0cy5wdXNoKHdpZGdldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aWRnZXRzLnNwbGljZShNYXRoLm1pbih3aWRnZXRzLmxlbmd0aCAtIDEsIE1hdGgubWF4KDAsIHdpZGdldC5pbnNlcnRBdCkpLCAwLCB3aWRnZXQpO1xuICAgICAgfVxuXG4gICAgICB3aWRnZXQubGluZSA9IGxpbmU7XG5cbiAgICAgIGlmIChjbSAmJiAhbGluZUlzSGlkZGVuKGRvYywgbGluZSkpIHtcbiAgICAgICAgdmFyIGFib3ZlVmlzaWJsZSA9IF9oZWlnaHRBdExpbmUobGluZSkgPCBkb2Muc2Nyb2xsVG9wO1xuICAgICAgICB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIGxpbmUuaGVpZ2h0ICsgd2lkZ2V0SGVpZ2h0KHdpZGdldCkpO1xuXG4gICAgICAgIGlmIChhYm92ZVZpc2libGUpIHtcbiAgICAgICAgICBhZGRUb1Njcm9sbFBvcyhjbSwgbnVsbCwgd2lkZ2V0LmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBjbS5jdXJPcC5mb3JjZVVwZGF0ZSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICAgIHJldHVybiB3aWRnZXQ7XG4gIH0gLy8gVEVYVE1BUktFUlNcbiAgLy8gQ3JlYXRlZCB3aXRoIG1hcmtUZXh0IGFuZCBzZXRCb29rbWFyayBtZXRob2RzLiBBIFRleHRNYXJrZXIgaXMgYVxuICAvLyBoYW5kbGUgdGhhdCBjYW4gYmUgdXNlZCB0byBjbGVhciBvciBmaW5kIGEgbWFya2VkIHBvc2l0aW9uIGluIHRoZVxuICAvLyBkb2N1bWVudC4gTGluZSBvYmplY3RzIGhvbGQgYXJyYXlzIChtYXJrZWRTcGFucykgY29udGFpbmluZ1xuICAvLyB7ZnJvbSwgdG8sIG1hcmtlcn0gb2JqZWN0IHBvaW50aW5nIHRvIHN1Y2ggbWFya2VyIG9iamVjdHMsIGFuZFxuICAvLyBpbmRpY2F0aW5nIHRoYXQgc3VjaCBhIG1hcmtlciBpcyBwcmVzZW50IG9uIHRoYXQgbGluZS4gTXVsdGlwbGVcbiAgLy8gbGluZXMgbWF5IHBvaW50IHRvIHRoZSBzYW1lIG1hcmtlciB3aGVuIGl0IHNwYW5zIGFjcm9zcyBsaW5lcy5cbiAgLy8gVGhlIHNwYW5zIHdpbGwgaGF2ZSBudWxsIGZvciB0aGVpciBmcm9tL3RvIHByb3BlcnRpZXMgd2hlbiB0aGVcbiAgLy8gbWFya2VyIGNvbnRpbnVlcyBiZXlvbmQgdGhlIHN0YXJ0L2VuZCBvZiB0aGUgbGluZS4gTWFya2VycyBoYXZlXG4gIC8vIGxpbmtzIGJhY2sgdG8gdGhlIGxpbmVzIHRoZXkgY3VycmVudGx5IHRvdWNoLlxuICAvLyBDb2xsYXBzZWQgbWFya2VycyBoYXZlIHVuaXF1ZSBpZHMsIGluIG9yZGVyIHRvIGJlIGFibGUgdG8gb3JkZXJcbiAgLy8gdGhlbSwgd2hpY2ggaXMgbmVlZGVkIGZvciB1bmlxdWVseSBkZXRlcm1pbmluZyBhbiBvdXRlciBtYXJrZXJcbiAgLy8gd2hlbiB0aGV5IG92ZXJsYXAgKHRoZXkgbWF5IG5lc3QsIGJ1dCBub3QgcGFydGlhbGx5IG92ZXJsYXApLlxuXG5cbiAgdmFyIG5leHRNYXJrZXJJZCA9IDA7XG5cbiAgZnVuY3Rpb24gVGV4dE1hcmtlcihkb2MsIHR5cGUpIHtcbiAgICB0aGlzLmxpbmVzID0gW107XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmRvYyA9IGRvYztcbiAgICB0aGlzLmlkID0gKytuZXh0TWFya2VySWQ7XG4gIH1cblxuICBldmVudE1peGluKFRleHRNYXJrZXIpOyAvLyBDbGVhciB0aGUgbWFya2VyLlxuXG4gIFRleHRNYXJrZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuZXhwbGljaXRseUNsZWFyZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgY20gPSB0aGlzLmRvYy5jbSxcbiAgICAgICAgd2l0aE9wID0gY20gJiYgIWNtLmN1ck9wO1xuXG4gICAgaWYgKHdpdGhPcCkge1xuICAgICAgc3RhcnRPcGVyYXRpb24oY20pO1xuICAgIH1cblxuICAgIGlmIChoYXNIYW5kbGVyKHRoaXMsIFwiY2xlYXJcIikpIHtcbiAgICAgIHZhciBmb3VuZCA9IHRoaXMuZmluZCgpO1xuXG4gICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgc2lnbmFsTGF0ZXIodGhpcywgXCJjbGVhclwiLCBmb3VuZC5mcm9tLCBmb3VuZC50byk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG1pbiA9IG51bGwsXG4gICAgICAgIG1heCA9IG51bGw7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGluZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBsaW5lID0gdGhpcyQxLmxpbmVzW2ldO1xuICAgICAgdmFyIHNwYW4gPSBnZXRNYXJrZWRTcGFuRm9yKGxpbmUubWFya2VkU3BhbnMsIHRoaXMkMSk7XG5cbiAgICAgIGlmIChjbSAmJiAhdGhpcyQxLmNvbGxhcHNlZCkge1xuICAgICAgICByZWdMaW5lQ2hhbmdlKGNtLCBsaW5lTm8obGluZSksIFwidGV4dFwiKTtcbiAgICAgIH0gZWxzZSBpZiAoY20pIHtcbiAgICAgICAgaWYgKHNwYW4udG8gIT0gbnVsbCkge1xuICAgICAgICAgIG1heCA9IGxpbmVObyhsaW5lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzcGFuLmZyb20gIT0gbnVsbCkge1xuICAgICAgICAgIG1pbiA9IGxpbmVObyhsaW5lKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsaW5lLm1hcmtlZFNwYW5zID0gcmVtb3ZlTWFya2VkU3BhbihsaW5lLm1hcmtlZFNwYW5zLCBzcGFuKTtcblxuICAgICAgaWYgKHNwYW4uZnJvbSA9PSBudWxsICYmIHRoaXMkMS5jb2xsYXBzZWQgJiYgIWxpbmVJc0hpZGRlbih0aGlzJDEuZG9jLCBsaW5lKSAmJiBjbSkge1xuICAgICAgICB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIHRleHRIZWlnaHQoY20uZGlzcGxheSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjbSAmJiB0aGlzLmNvbGxhcHNlZCAmJiAhY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIHtcbiAgICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IHRoaXMubGluZXMubGVuZ3RoOyArK2kkMSkge1xuICAgICAgICB2YXIgdmlzdWFsID0gdmlzdWFsTGluZSh0aGlzJDEubGluZXNbaSQxXSksXG4gICAgICAgICAgICBsZW4gPSBsaW5lTGVuZ3RoKHZpc3VhbCk7XG5cbiAgICAgICAgaWYgKGxlbiA+IGNtLmRpc3BsYXkubWF4TGluZUxlbmd0aCkge1xuICAgICAgICAgIGNtLmRpc3BsYXkubWF4TGluZSA9IHZpc3VhbDtcbiAgICAgICAgICBjbS5kaXNwbGF5Lm1heExpbmVMZW5ndGggPSBsZW47XG4gICAgICAgICAgY20uZGlzcGxheS5tYXhMaW5lQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWluICE9IG51bGwgJiYgY20gJiYgdGhpcy5jb2xsYXBzZWQpIHtcbiAgICAgIHJlZ0NoYW5nZShjbSwgbWluLCBtYXggKyAxKTtcbiAgICB9XG5cbiAgICB0aGlzLmxpbmVzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5leHBsaWNpdGx5Q2xlYXJlZCA9IHRydWU7XG5cbiAgICBpZiAodGhpcy5hdG9taWMgJiYgdGhpcy5kb2MuY2FudEVkaXQpIHtcbiAgICAgIHRoaXMuZG9jLmNhbnRFZGl0ID0gZmFsc2U7XG5cbiAgICAgIGlmIChjbSkge1xuICAgICAgICByZUNoZWNrU2VsZWN0aW9uKGNtLmRvYyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNtKSB7XG4gICAgICBzaWduYWxMYXRlcihjbSwgXCJtYXJrZXJDbGVhcmVkXCIsIGNtLCB0aGlzKTtcbiAgICB9XG5cbiAgICBpZiAod2l0aE9wKSB7XG4gICAgICBlbmRPcGVyYXRpb24oY20pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgdGhpcy5wYXJlbnQuY2xlYXIoKTtcbiAgICB9XG4gIH07IC8vIEZpbmQgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgaW4gdGhlIGRvY3VtZW50LiBSZXR1cm5zIGEge2Zyb20sXG4gIC8vIHRvfSBvYmplY3QgYnkgZGVmYXVsdC4gU2lkZSBjYW4gYmUgcGFzc2VkIHRvIGdldCBhIHNwZWNpZmljIHNpZGVcbiAgLy8gLS0gMCAoYm90aCksIC0xIChsZWZ0KSwgb3IgMSAocmlnaHQpLiBXaGVuIGxpbmVPYmogaXMgdHJ1ZSwgdGhlXG4gIC8vIFBvcyBvYmplY3RzIHJldHVybmVkIGNvbnRhaW4gYSBsaW5lIG9iamVjdCwgcmF0aGVyIHRoYW4gYSBsaW5lXG4gIC8vIG51bWJlciAodXNlZCB0byBwcmV2ZW50IGxvb2tpbmcgdXAgdGhlIHNhbWUgbGluZSB0d2ljZSkuXG5cblxuICBUZXh0TWFya2VyLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKHNpZGUsIGxpbmVPYmopIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgIGlmIChzaWRlID09IG51bGwgJiYgdGhpcy50eXBlID09IFwiYm9va21hcmtcIikge1xuICAgICAgc2lkZSA9IDE7XG4gICAgfVxuXG4gICAgdmFyIGZyb20sIHRvO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgbGluZSA9IHRoaXMkMS5saW5lc1tpXTtcbiAgICAgIHZhciBzcGFuID0gZ2V0TWFya2VkU3BhbkZvcihsaW5lLm1hcmtlZFNwYW5zLCB0aGlzJDEpO1xuXG4gICAgICBpZiAoc3Bhbi5mcm9tICE9IG51bGwpIHtcbiAgICAgICAgZnJvbSA9IFBvcyhsaW5lT2JqID8gbGluZSA6IGxpbmVObyhsaW5lKSwgc3Bhbi5mcm9tKTtcblxuICAgICAgICBpZiAoc2lkZSA9PSAtMSkge1xuICAgICAgICAgIHJldHVybiBmcm9tO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzcGFuLnRvICE9IG51bGwpIHtcbiAgICAgICAgdG8gPSBQb3MobGluZU9iaiA/IGxpbmUgOiBsaW5lTm8obGluZSksIHNwYW4udG8pO1xuXG4gICAgICAgIGlmIChzaWRlID09IDEpIHtcbiAgICAgICAgICByZXR1cm4gdG87XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZnJvbSAmJiB7XG4gICAgICBmcm9tOiBmcm9tLFxuICAgICAgdG86IHRvXG4gICAgfTtcbiAgfTsgLy8gU2lnbmFscyB0aGF0IHRoZSBtYXJrZXIncyB3aWRnZXQgY2hhbmdlZCwgYW5kIHN1cnJvdW5kaW5nIGxheW91dFxuICAvLyBzaG91bGQgYmUgcmVjb21wdXRlZC5cblxuXG4gIFRleHRNYXJrZXIucHJvdG90eXBlLmNoYW5nZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBvcyA9IHRoaXMuZmluZCgtMSwgdHJ1ZSksXG4gICAgICAgIHdpZGdldCA9IHRoaXMsXG4gICAgICAgIGNtID0gdGhpcy5kb2MuY207XG5cbiAgICBpZiAoIXBvcyB8fCAhY20pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBydW5Jbk9wKGNtLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbGluZSA9IHBvcy5saW5lLFxuICAgICAgICAgIGxpbmVOID0gbGluZU5vKHBvcy5saW5lKTtcbiAgICAgIHZhciB2aWV3ID0gZmluZFZpZXdGb3JMaW5lKGNtLCBsaW5lTik7XG5cbiAgICAgIGlmICh2aWV3KSB7XG4gICAgICAgIGNsZWFyTGluZU1lYXN1cmVtZW50Q2FjaGVGb3Iodmlldyk7XG4gICAgICAgIGNtLmN1ck9wLnNlbGVjdGlvbkNoYW5nZWQgPSBjbS5jdXJPcC5mb3JjZVVwZGF0ZSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNtLmN1ck9wLnVwZGF0ZU1heExpbmUgPSB0cnVlO1xuXG4gICAgICBpZiAoIWxpbmVJc0hpZGRlbih3aWRnZXQuZG9jLCBsaW5lKSAmJiB3aWRnZXQuaGVpZ2h0ICE9IG51bGwpIHtcbiAgICAgICAgdmFyIG9sZEhlaWdodCA9IHdpZGdldC5oZWlnaHQ7XG4gICAgICAgIHdpZGdldC5oZWlnaHQgPSBudWxsO1xuICAgICAgICB2YXIgZEhlaWdodCA9IHdpZGdldEhlaWdodCh3aWRnZXQpIC0gb2xkSGVpZ2h0O1xuXG4gICAgICAgIGlmIChkSGVpZ2h0KSB7XG4gICAgICAgICAgdXBkYXRlTGluZUhlaWdodChsaW5lLCBsaW5lLmhlaWdodCArIGRIZWlnaHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgVGV4dE1hcmtlci5wcm90b3R5cGUuYXR0YWNoTGluZSA9IGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgaWYgKCF0aGlzLmxpbmVzLmxlbmd0aCAmJiB0aGlzLmRvYy5jbSkge1xuICAgICAgdmFyIG9wID0gdGhpcy5kb2MuY20uY3VyT3A7XG5cbiAgICAgIGlmICghb3AubWF5YmVIaWRkZW5NYXJrZXJzIHx8IGluZGV4T2Yob3AubWF5YmVIaWRkZW5NYXJrZXJzLCB0aGlzKSA9PSAtMSkge1xuICAgICAgICAob3AubWF5YmVVbmhpZGRlbk1hcmtlcnMgfHwgKG9wLm1heWJlVW5oaWRkZW5NYXJrZXJzID0gW10pKS5wdXNoKHRoaXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGluZXMucHVzaChsaW5lKTtcbiAgfTtcblxuICBUZXh0TWFya2VyLnByb3RvdHlwZS5kZXRhY2hMaW5lID0gZnVuY3Rpb24gKGxpbmUpIHtcbiAgICB0aGlzLmxpbmVzLnNwbGljZShpbmRleE9mKHRoaXMubGluZXMsIGxpbmUpLCAxKTtcblxuICAgIGlmICghdGhpcy5saW5lcy5sZW5ndGggJiYgdGhpcy5kb2MuY20pIHtcbiAgICAgIHZhciBvcCA9IHRoaXMuZG9jLmNtLmN1ck9wO1xuICAgICAgKG9wLm1heWJlSGlkZGVuTWFya2VycyB8fCAob3AubWF5YmVIaWRkZW5NYXJrZXJzID0gW10pKS5wdXNoKHRoaXMpO1xuICAgIH1cbiAgfTsgLy8gQ3JlYXRlIGEgbWFya2VyLCB3aXJlIGl0IHVwIHRvIHRoZSByaWdodCBsaW5lcywgYW5kXG5cblxuICBmdW5jdGlvbiBfbWFya1RleHQoZG9jLCBmcm9tLCB0bywgb3B0aW9ucywgdHlwZSkge1xuICAgIC8vIFNoYXJlZCBtYXJrZXJzIChhY3Jvc3MgbGlua2VkIGRvY3VtZW50cykgYXJlIGhhbmRsZWQgc2VwYXJhdGVseVxuICAgIC8vIChtYXJrVGV4dFNoYXJlZCB3aWxsIGNhbGwgb3V0IHRvIHRoaXMgYWdhaW4sIG9uY2UgcGVyXG4gICAgLy8gZG9jdW1lbnQpLlxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuc2hhcmVkKSB7XG4gICAgICByZXR1cm4gbWFya1RleHRTaGFyZWQoZG9jLCBmcm9tLCB0bywgb3B0aW9ucywgdHlwZSk7XG4gICAgfSAvLyBFbnN1cmUgd2UgYXJlIGluIGFuIG9wZXJhdGlvbi5cblxuXG4gICAgaWYgKGRvYy5jbSAmJiAhZG9jLmNtLmN1ck9wKSB7XG4gICAgICByZXR1cm4gb3BlcmF0aW9uKGRvYy5jbSwgX21hcmtUZXh0KShkb2MsIGZyb20sIHRvLCBvcHRpb25zLCB0eXBlKTtcbiAgICB9XG5cbiAgICB2YXIgbWFya2VyID0gbmV3IFRleHRNYXJrZXIoZG9jLCB0eXBlKSxcbiAgICAgICAgZGlmZiA9IGNtcChmcm9tLCB0byk7XG5cbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgY29weU9iaihvcHRpb25zLCBtYXJrZXIsIGZhbHNlKTtcbiAgICB9IC8vIERvbid0IGNvbm5lY3QgZW1wdHkgbWFya2VycyB1bmxlc3MgY2xlYXJXaGVuRW1wdHkgaXMgZmFsc2VcblxuXG4gICAgaWYgKGRpZmYgPiAwIHx8IGRpZmYgPT0gMCAmJiBtYXJrZXIuY2xlYXJXaGVuRW1wdHkgIT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gbWFya2VyO1xuICAgIH1cblxuICAgIGlmIChtYXJrZXIucmVwbGFjZWRXaXRoKSB7XG4gICAgICAvLyBTaG93aW5nIHVwIGFzIGEgd2lkZ2V0IGltcGxpZXMgY29sbGFwc2VkICh3aWRnZXQgcmVwbGFjZXMgdGV4dClcbiAgICAgIG1hcmtlci5jb2xsYXBzZWQgPSB0cnVlO1xuICAgICAgbWFya2VyLndpZGdldE5vZGUgPSBlbHQoXCJzcGFuXCIsIFttYXJrZXIucmVwbGFjZWRXaXRoXSwgXCJDb2RlTWlycm9yLXdpZGdldFwiKTtcbiAgICAgIG1hcmtlci53aWRnZXROb2RlLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJwcmVzZW50YXRpb25cIik7IC8vIGhpZGUgZnJvbSBhY2Nlc3NpYmlsaXR5IHRyZWVcblxuICAgICAgaWYgKCFvcHRpb25zLmhhbmRsZU1vdXNlRXZlbnRzKSB7XG4gICAgICAgIG1hcmtlci53aWRnZXROb2RlLnNldEF0dHJpYnV0ZShcImNtLWlnbm9yZS1ldmVudHNcIiwgXCJ0cnVlXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5pbnNlcnRMZWZ0KSB7XG4gICAgICAgIG1hcmtlci53aWRnZXROb2RlLmluc2VydExlZnQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtYXJrZXIuY29sbGFwc2VkKSB7XG4gICAgICBpZiAoY29uZmxpY3RpbmdDb2xsYXBzZWRSYW5nZShkb2MsIGZyb20ubGluZSwgZnJvbSwgdG8sIG1hcmtlcikgfHwgZnJvbS5saW5lICE9IHRvLmxpbmUgJiYgY29uZmxpY3RpbmdDb2xsYXBzZWRSYW5nZShkb2MsIHRvLmxpbmUsIGZyb20sIHRvLCBtYXJrZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkluc2VydGluZyBjb2xsYXBzZWQgbWFya2VyIHBhcnRpYWxseSBvdmVybGFwcGluZyBhbiBleGlzdGluZyBvbmVcIik7XG4gICAgICB9XG5cbiAgICAgIHNlZUNvbGxhcHNlZFNwYW5zKCk7XG4gICAgfVxuXG4gICAgaWYgKG1hcmtlci5hZGRUb0hpc3RvcnkpIHtcbiAgICAgIGFkZENoYW5nZVRvSGlzdG9yeShkb2MsIHtcbiAgICAgICAgZnJvbTogZnJvbSxcbiAgICAgICAgdG86IHRvLFxuICAgICAgICBvcmlnaW46IFwibWFya1RleHRcIlxuICAgICAgfSwgZG9jLnNlbCwgTmFOKTtcbiAgICB9XG5cbiAgICB2YXIgY3VyTGluZSA9IGZyb20ubGluZSxcbiAgICAgICAgY20gPSBkb2MuY20sXG4gICAgICAgIHVwZGF0ZU1heExpbmU7XG4gICAgZG9jLml0ZXIoY3VyTGluZSwgdG8ubGluZSArIDEsIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICBpZiAoY20gJiYgbWFya2VyLmNvbGxhcHNlZCAmJiAhY20ub3B0aW9ucy5saW5lV3JhcHBpbmcgJiYgdmlzdWFsTGluZShsaW5lKSA9PSBjbS5kaXNwbGF5Lm1heExpbmUpIHtcbiAgICAgICAgdXBkYXRlTWF4TGluZSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChtYXJrZXIuY29sbGFwc2VkICYmIGN1ckxpbmUgIT0gZnJvbS5saW5lKSB7XG4gICAgICAgIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgMCk7XG4gICAgICB9XG5cbiAgICAgIGFkZE1hcmtlZFNwYW4obGluZSwgbmV3IE1hcmtlZFNwYW4obWFya2VyLCBjdXJMaW5lID09IGZyb20ubGluZSA/IGZyb20uY2ggOiBudWxsLCBjdXJMaW5lID09IHRvLmxpbmUgPyB0by5jaCA6IG51bGwpKTtcbiAgICAgICsrY3VyTGluZTtcbiAgICB9KTsgLy8gbGluZUlzSGlkZGVuIGRlcGVuZHMgb24gdGhlIHByZXNlbmNlIG9mIHRoZSBzcGFucywgc28gbmVlZHMgYSBzZWNvbmQgcGFzc1xuXG4gICAgaWYgKG1hcmtlci5jb2xsYXBzZWQpIHtcbiAgICAgIGRvYy5pdGVyKGZyb20ubGluZSwgdG8ubGluZSArIDEsIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgIGlmIChsaW5lSXNIaWRkZW4oZG9jLCBsaW5lKSkge1xuICAgICAgICAgIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChtYXJrZXIuY2xlYXJPbkVudGVyKSB7XG4gICAgICBvbihtYXJrZXIsIFwiYmVmb3JlQ3Vyc29yRW50ZXJcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbWFya2VyLmNsZWFyKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAobWFya2VyLnJlYWRPbmx5KSB7XG4gICAgICBzZWVSZWFkT25seVNwYW5zKCk7XG5cbiAgICAgIGlmIChkb2MuaGlzdG9yeS5kb25lLmxlbmd0aCB8fCBkb2MuaGlzdG9yeS51bmRvbmUubGVuZ3RoKSB7XG4gICAgICAgIGRvYy5jbGVhckhpc3RvcnkoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWFya2VyLmNvbGxhcHNlZCkge1xuICAgICAgbWFya2VyLmlkID0gKytuZXh0TWFya2VySWQ7XG4gICAgICBtYXJrZXIuYXRvbWljID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoY20pIHtcbiAgICAgIC8vIFN5bmMgZWRpdG9yIHN0YXRlXG4gICAgICBpZiAodXBkYXRlTWF4TGluZSkge1xuICAgICAgICBjbS5jdXJPcC51cGRhdGVNYXhMaW5lID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1hcmtlci5jb2xsYXBzZWQpIHtcbiAgICAgICAgcmVnQ2hhbmdlKGNtLCBmcm9tLmxpbmUsIHRvLmxpbmUgKyAxKTtcbiAgICAgIH0gZWxzZSBpZiAobWFya2VyLmNsYXNzTmFtZSB8fCBtYXJrZXIudGl0bGUgfHwgbWFya2VyLnN0YXJ0U3R5bGUgfHwgbWFya2VyLmVuZFN0eWxlIHx8IG1hcmtlci5jc3MpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IGZyb20ubGluZTsgaSA8PSB0by5saW5lOyBpKyspIHtcbiAgICAgICAgICByZWdMaW5lQ2hhbmdlKGNtLCBpLCBcInRleHRcIik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1hcmtlci5hdG9taWMpIHtcbiAgICAgICAgcmVDaGVja1NlbGVjdGlvbihjbS5kb2MpO1xuICAgICAgfVxuXG4gICAgICBzaWduYWxMYXRlcihjbSwgXCJtYXJrZXJBZGRlZFwiLCBjbSwgbWFya2VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9IC8vIFNIQVJFRCBURVhUTUFSS0VSU1xuICAvLyBBIHNoYXJlZCBtYXJrZXIgc3BhbnMgbXVsdGlwbGUgbGlua2VkIGRvY3VtZW50cy4gSXQgaXNcbiAgLy8gaW1wbGVtZW50ZWQgYXMgYSBtZXRhLW1hcmtlci1vYmplY3QgY29udHJvbGxpbmcgbXVsdGlwbGUgbm9ybWFsXG4gIC8vIG1hcmtlcnMuXG5cblxuICBmdW5jdGlvbiBTaGFyZWRUZXh0TWFya2VyKG1hcmtlcnMsIHByaW1hcnkpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcbiAgICB0aGlzLm1hcmtlcnMgPSBtYXJrZXJzO1xuICAgIHRoaXMucHJpbWFyeSA9IHByaW1hcnk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcmtlcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgIG1hcmtlcnNbaV0ucGFyZW50ID0gdGhpcyQxO1xuICAgIH1cbiAgfVxuXG4gIGV2ZW50TWl4aW4oU2hhcmVkVGV4dE1hcmtlcik7XG5cbiAgU2hhcmVkVGV4dE1hcmtlci5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5leHBsaWNpdGx5Q2xlYXJlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZXhwbGljaXRseUNsZWFyZWQgPSB0cnVlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHRoaXMkMS5tYXJrZXJzW2ldLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgc2lnbmFsTGF0ZXIodGhpcywgXCJjbGVhclwiKTtcbiAgfTtcblxuICBTaGFyZWRUZXh0TWFya2VyLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKHNpZGUsIGxpbmVPYmopIHtcbiAgICByZXR1cm4gdGhpcy5wcmltYXJ5LmZpbmQoc2lkZSwgbGluZU9iaik7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFya1RleHRTaGFyZWQoZG9jLCBmcm9tLCB0bywgb3B0aW9ucywgdHlwZSkge1xuICAgIG9wdGlvbnMgPSBjb3B5T2JqKG9wdGlvbnMpO1xuICAgIG9wdGlvbnMuc2hhcmVkID0gZmFsc2U7XG4gICAgdmFyIG1hcmtlcnMgPSBbX21hcmtUZXh0KGRvYywgZnJvbSwgdG8sIG9wdGlvbnMsIHR5cGUpXSxcbiAgICAgICAgcHJpbWFyeSA9IG1hcmtlcnNbMF07XG4gICAgdmFyIHdpZGdldCA9IG9wdGlvbnMud2lkZ2V0Tm9kZTtcbiAgICBsaW5rZWREb2NzKGRvYywgZnVuY3Rpb24gKGRvYykge1xuICAgICAgaWYgKHdpZGdldCkge1xuICAgICAgICBvcHRpb25zLndpZGdldE5vZGUgPSB3aWRnZXQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgfVxuXG4gICAgICBtYXJrZXJzLnB1c2goX21hcmtUZXh0KGRvYywgX2NsaXBQb3MoZG9jLCBmcm9tKSwgX2NsaXBQb3MoZG9jLCB0byksIG9wdGlvbnMsIHR5cGUpKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkb2MubGlua2VkLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChkb2MubGlua2VkW2ldLmlzUGFyZW50KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHByaW1hcnkgPSBsc3QobWFya2Vycyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyBTaGFyZWRUZXh0TWFya2VyKG1hcmtlcnMsIHByaW1hcnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmluZFNoYXJlZE1hcmtlcnMoZG9jKSB7XG4gICAgcmV0dXJuIGRvYy5maW5kTWFya3MoUG9zKGRvYy5maXJzdCwgMCksIGRvYy5jbGlwUG9zKFBvcyhkb2MubGFzdExpbmUoKSkpLCBmdW5jdGlvbiAobSkge1xuICAgICAgcmV0dXJuIG0ucGFyZW50O1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY29weVNoYXJlZE1hcmtlcnMoZG9jLCBtYXJrZXJzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbWFya2VyID0gbWFya2Vyc1tpXSxcbiAgICAgICAgICBwb3MgPSBtYXJrZXIuZmluZCgpO1xuICAgICAgdmFyIG1Gcm9tID0gZG9jLmNsaXBQb3MocG9zLmZyb20pLFxuICAgICAgICAgIG1UbyA9IGRvYy5jbGlwUG9zKHBvcy50byk7XG5cbiAgICAgIGlmIChjbXAobUZyb20sIG1UbykpIHtcbiAgICAgICAgdmFyIHN1Yk1hcmsgPSBfbWFya1RleHQoZG9jLCBtRnJvbSwgbVRvLCBtYXJrZXIucHJpbWFyeSwgbWFya2VyLnByaW1hcnkudHlwZSk7XG5cbiAgICAgICAgbWFya2VyLm1hcmtlcnMucHVzaChzdWJNYXJrKTtcbiAgICAgICAgc3ViTWFyay5wYXJlbnQgPSBtYXJrZXI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGV0YWNoU2hhcmVkTWFya2VycyhtYXJrZXJzKSB7XG4gICAgdmFyIGxvb3AgPSBmdW5jdGlvbiBsb29wKGkpIHtcbiAgICAgIHZhciBtYXJrZXIgPSBtYXJrZXJzW2ldLFxuICAgICAgICAgIGxpbmtlZCA9IFttYXJrZXIucHJpbWFyeS5kb2NdO1xuICAgICAgbGlua2VkRG9jcyhtYXJrZXIucHJpbWFyeS5kb2MsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiBsaW5rZWQucHVzaChkKTtcbiAgICAgIH0pO1xuXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hcmtlci5tYXJrZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBzdWJNYXJrZXIgPSBtYXJrZXIubWFya2Vyc1tqXTtcblxuICAgICAgICBpZiAoaW5kZXhPZihsaW5rZWQsIHN1Yk1hcmtlci5kb2MpID09IC0xKSB7XG4gICAgICAgICAgc3ViTWFya2VyLnBhcmVudCA9IG51bGw7XG4gICAgICAgICAgbWFya2VyLm1hcmtlcnMuc3BsaWNlKGotLSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsb29wKGkpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBuZXh0RG9jSWQgPSAwO1xuXG4gIHZhciBEb2MgPSBmdW5jdGlvbiBEb2ModGV4dCwgbW9kZSwgZmlyc3RMaW5lLCBsaW5lU2VwKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIERvYykpIHtcbiAgICAgIHJldHVybiBuZXcgRG9jKHRleHQsIG1vZGUsIGZpcnN0TGluZSwgbGluZVNlcCk7XG4gICAgfVxuXG4gICAgaWYgKGZpcnN0TGluZSA9PSBudWxsKSB7XG4gICAgICBmaXJzdExpbmUgPSAwO1xuICAgIH1cblxuICAgIEJyYW5jaENodW5rLmNhbGwodGhpcywgW25ldyBMZWFmQ2h1bmsoW25ldyBMaW5lKFwiXCIsIG51bGwpXSldKTtcbiAgICB0aGlzLmZpcnN0ID0gZmlyc3RMaW5lO1xuICAgIHRoaXMuc2Nyb2xsVG9wID0gdGhpcy5zY3JvbGxMZWZ0ID0gMDtcbiAgICB0aGlzLmNhbnRFZGl0ID0gZmFsc2U7XG4gICAgdGhpcy5jbGVhbkdlbmVyYXRpb24gPSAxO1xuICAgIHRoaXMuZnJvbnRpZXIgPSBmaXJzdExpbmU7XG4gICAgdmFyIHN0YXJ0ID0gUG9zKGZpcnN0TGluZSwgMCk7XG4gICAgdGhpcy5zZWwgPSBzaW1wbGVTZWxlY3Rpb24oc3RhcnQpO1xuICAgIHRoaXMuaGlzdG9yeSA9IG5ldyBIaXN0b3J5KG51bGwpO1xuICAgIHRoaXMuaWQgPSArK25leHREb2NJZDtcbiAgICB0aGlzLm1vZGVPcHRpb24gPSBtb2RlO1xuICAgIHRoaXMubGluZVNlcCA9IGxpbmVTZXA7XG4gICAgdGhpcy5leHRlbmQgPSBmYWxzZTtcblxuICAgIGlmICh0eXBlb2YgdGV4dCA9PSBcInN0cmluZ1wiKSB7XG4gICAgICB0ZXh0ID0gdGhpcy5zcGxpdExpbmVzKHRleHQpO1xuICAgIH1cblxuICAgIHVwZGF0ZURvYyh0aGlzLCB7XG4gICAgICBmcm9tOiBzdGFydCxcbiAgICAgIHRvOiBzdGFydCxcbiAgICAgIHRleHQ6IHRleHRcbiAgICB9KTtcbiAgICBzZXRTZWxlY3Rpb24odGhpcywgc2ltcGxlU2VsZWN0aW9uKHN0YXJ0KSwgc2VsX2RvbnRTY3JvbGwpO1xuICB9O1xuXG4gIERvYy5wcm90b3R5cGUgPSBjcmVhdGVPYmooQnJhbmNoQ2h1bmsucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IERvYyxcbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGRvY3VtZW50LiBTdXBwb3J0cyB0d28gZm9ybXMgLS0gd2l0aCBvbmx5IG9uZVxuICAgIC8vIGFyZ3VtZW50LCBpdCBjYWxscyB0aGF0IGZvciBlYWNoIGxpbmUgaW4gdGhlIGRvY3VtZW50LiBXaXRoXG4gICAgLy8gdGhyZWUsIGl0IGl0ZXJhdGVzIG92ZXIgdGhlIHJhbmdlIGdpdmVuIGJ5IHRoZSBmaXJzdCB0d28gKHdpdGhcbiAgICAvLyB0aGUgc2Vjb25kIGJlaW5nIG5vbi1pbmNsdXNpdmUpLlxuICAgIGl0ZXI6IGZ1bmN0aW9uIGl0ZXIoZnJvbSwgdG8sIG9wKSB7XG4gICAgICBpZiAob3ApIHtcbiAgICAgICAgdGhpcy5pdGVyTihmcm9tIC0gdGhpcy5maXJzdCwgdG8gLSBmcm9tLCBvcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLml0ZXJOKHRoaXMuZmlyc3QsIHRoaXMuZmlyc3QgKyB0aGlzLnNpemUsIGZyb20pO1xuICAgICAgfVxuICAgIH0sXG4gICAgLy8gTm9uLXB1YmxpYyBpbnRlcmZhY2UgZm9yIGFkZGluZyBhbmQgcmVtb3ZpbmcgbGluZXMuXG4gICAgaW5zZXJ0OiBmdW5jdGlvbiBpbnNlcnQoYXQsIGxpbmVzKSB7XG4gICAgICB2YXIgaGVpZ2h0ID0gMDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBoZWlnaHQgKz0gbGluZXNbaV0uaGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICB0aGlzLmluc2VydElubmVyKGF0IC0gdGhpcy5maXJzdCwgbGluZXMsIGhlaWdodCk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShhdCwgbikge1xuICAgICAgdGhpcy5yZW1vdmVJbm5lcihhdCAtIHRoaXMuZmlyc3QsIG4pO1xuICAgIH0sXG4gICAgLy8gRnJvbSBoZXJlLCB0aGUgbWV0aG9kcyBhcmUgcGFydCBvZiB0aGUgcHVibGljIGludGVyZmFjZS4gTW9zdFxuICAgIC8vIGFyZSBhbHNvIGF2YWlsYWJsZSBmcm9tIENvZGVNaXJyb3IgKGVkaXRvcikgaW5zdGFuY2VzLlxuICAgIGdldFZhbHVlOiBmdW5jdGlvbiBnZXRWYWx1ZShsaW5lU2VwKSB7XG4gICAgICB2YXIgbGluZXMgPSBnZXRMaW5lcyh0aGlzLCB0aGlzLmZpcnN0LCB0aGlzLmZpcnN0ICsgdGhpcy5zaXplKTtcblxuICAgICAgaWYgKGxpbmVTZXAgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBsaW5lcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxpbmVzLmpvaW4obGluZVNlcCB8fCB0aGlzLmxpbmVTZXBhcmF0b3IoKSk7XG4gICAgfSxcbiAgICBzZXRWYWx1ZTogZG9jTWV0aG9kT3AoZnVuY3Rpb24gKGNvZGUpIHtcbiAgICAgIHZhciB0b3AgPSBQb3ModGhpcy5maXJzdCwgMCksXG4gICAgICAgICAgbGFzdCA9IHRoaXMuZmlyc3QgKyB0aGlzLnNpemUgLSAxO1xuICAgICAgbWFrZUNoYW5nZSh0aGlzLCB7XG4gICAgICAgIGZyb206IHRvcCxcbiAgICAgICAgdG86IFBvcyhsYXN0LCBnZXRMaW5lKHRoaXMsIGxhc3QpLnRleHQubGVuZ3RoKSxcbiAgICAgICAgdGV4dDogdGhpcy5zcGxpdExpbmVzKGNvZGUpLFxuICAgICAgICBvcmlnaW46IFwic2V0VmFsdWVcIixcbiAgICAgICAgZnVsbDogdHJ1ZVxuICAgICAgfSwgdHJ1ZSk7XG4gICAgICBzZXRTZWxlY3Rpb24odGhpcywgc2ltcGxlU2VsZWN0aW9uKHRvcCkpO1xuICAgIH0pLFxuICAgIHJlcGxhY2VSYW5nZTogZnVuY3Rpb24gcmVwbGFjZVJhbmdlKGNvZGUsIGZyb20sIHRvLCBvcmlnaW4pIHtcbiAgICAgIGZyb20gPSBfY2xpcFBvcyh0aGlzLCBmcm9tKTtcbiAgICAgIHRvID0gdG8gPyBfY2xpcFBvcyh0aGlzLCB0bykgOiBmcm9tO1xuXG4gICAgICBfcmVwbGFjZVJhbmdlKHRoaXMsIGNvZGUsIGZyb20sIHRvLCBvcmlnaW4pO1xuICAgIH0sXG4gICAgZ2V0UmFuZ2U6IGZ1bmN0aW9uIGdldFJhbmdlKGZyb20sIHRvLCBsaW5lU2VwKSB7XG4gICAgICB2YXIgbGluZXMgPSBnZXRCZXR3ZWVuKHRoaXMsIF9jbGlwUG9zKHRoaXMsIGZyb20pLCBfY2xpcFBvcyh0aGlzLCB0bykpO1xuXG4gICAgICBpZiAobGluZVNlcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGxpbmVzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGluZXMuam9pbihsaW5lU2VwIHx8IHRoaXMubGluZVNlcGFyYXRvcigpKTtcbiAgICB9LFxuICAgIGdldExpbmU6IGZ1bmN0aW9uIGdldExpbmUobGluZSkge1xuICAgICAgdmFyIGwgPSB0aGlzLmdldExpbmVIYW5kbGUobGluZSk7XG4gICAgICByZXR1cm4gbCAmJiBsLnRleHQ7XG4gICAgfSxcbiAgICBnZXRMaW5lSGFuZGxlOiBmdW5jdGlvbiBnZXRMaW5lSGFuZGxlKGxpbmUpIHtcbiAgICAgIGlmIChpc0xpbmUodGhpcywgbGluZSkpIHtcbiAgICAgICAgcmV0dXJuIGdldExpbmUodGhpcywgbGluZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRMaW5lTnVtYmVyOiBmdW5jdGlvbiBnZXRMaW5lTnVtYmVyKGxpbmUpIHtcbiAgICAgIHJldHVybiBsaW5lTm8obGluZSk7XG4gICAgfSxcbiAgICBnZXRMaW5lSGFuZGxlVmlzdWFsU3RhcnQ6IGZ1bmN0aW9uIGdldExpbmVIYW5kbGVWaXN1YWxTdGFydChsaW5lKSB7XG4gICAgICBpZiAodHlwZW9mIGxpbmUgPT0gXCJudW1iZXJcIikge1xuICAgICAgICBsaW5lID0gZ2V0TGluZSh0aGlzLCBsaW5lKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZpc3VhbExpbmUobGluZSk7XG4gICAgfSxcbiAgICBsaW5lQ291bnQ6IGZ1bmN0aW9uIGxpbmVDb3VudCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnNpemU7XG4gICAgfSxcbiAgICBmaXJzdExpbmU6IGZ1bmN0aW9uIGZpcnN0TGluZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpcnN0O1xuICAgIH0sXG4gICAgbGFzdExpbmU6IGZ1bmN0aW9uIGxhc3RMaW5lKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlyc3QgKyB0aGlzLnNpemUgLSAxO1xuICAgIH0sXG4gICAgY2xpcFBvczogZnVuY3Rpb24gY2xpcFBvcyhwb3MpIHtcbiAgICAgIHJldHVybiBfY2xpcFBvcyh0aGlzLCBwb3MpO1xuICAgIH0sXG4gICAgZ2V0Q3Vyc29yOiBmdW5jdGlvbiBnZXRDdXJzb3Ioc3RhcnQpIHtcbiAgICAgIHZhciByYW5nZSA9IHRoaXMuc2VsLnByaW1hcnkoKSxcbiAgICAgICAgICBwb3M7XG5cbiAgICAgIGlmIChzdGFydCA9PSBudWxsIHx8IHN0YXJ0ID09IFwiaGVhZFwiKSB7XG4gICAgICAgIHBvcyA9IHJhbmdlLmhlYWQ7XG4gICAgICB9IGVsc2UgaWYgKHN0YXJ0ID09IFwiYW5jaG9yXCIpIHtcbiAgICAgICAgcG9zID0gcmFuZ2UuYW5jaG9yO1xuICAgICAgfSBlbHNlIGlmIChzdGFydCA9PSBcImVuZFwiIHx8IHN0YXJ0ID09IFwidG9cIiB8fCBzdGFydCA9PT0gZmFsc2UpIHtcbiAgICAgICAgcG9zID0gcmFuZ2UudG8oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvcyA9IHJhbmdlLmZyb20oKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBvcztcbiAgICB9LFxuICAgIGxpc3RTZWxlY3Rpb25zOiBmdW5jdGlvbiBsaXN0U2VsZWN0aW9ucygpIHtcbiAgICAgIHJldHVybiB0aGlzLnNlbC5yYW5nZXM7XG4gICAgfSxcbiAgICBzb21ldGhpbmdTZWxlY3RlZDogZnVuY3Rpb24gc29tZXRoaW5nU2VsZWN0ZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZWwuc29tZXRoaW5nU2VsZWN0ZWQoKTtcbiAgICB9LFxuICAgIHNldEN1cnNvcjogZG9jTWV0aG9kT3AoZnVuY3Rpb24gKGxpbmUsIGNoLCBvcHRpb25zKSB7XG4gICAgICBzZXRTaW1wbGVTZWxlY3Rpb24odGhpcywgX2NsaXBQb3ModGhpcywgdHlwZW9mIGxpbmUgPT0gXCJudW1iZXJcIiA/IFBvcyhsaW5lLCBjaCB8fCAwKSA6IGxpbmUpLCBudWxsLCBvcHRpb25zKTtcbiAgICB9KSxcbiAgICBzZXRTZWxlY3Rpb246IGRvY01ldGhvZE9wKGZ1bmN0aW9uIChhbmNob3IsIGhlYWQsIG9wdGlvbnMpIHtcbiAgICAgIHNldFNpbXBsZVNlbGVjdGlvbih0aGlzLCBfY2xpcFBvcyh0aGlzLCBhbmNob3IpLCBfY2xpcFBvcyh0aGlzLCBoZWFkIHx8IGFuY2hvciksIG9wdGlvbnMpO1xuICAgIH0pLFxuICAgIGV4dGVuZFNlbGVjdGlvbjogZG9jTWV0aG9kT3AoZnVuY3Rpb24gKGhlYWQsIG90aGVyLCBvcHRpb25zKSB7XG4gICAgICBleHRlbmRTZWxlY3Rpb24odGhpcywgX2NsaXBQb3ModGhpcywgaGVhZCksIG90aGVyICYmIF9jbGlwUG9zKHRoaXMsIG90aGVyKSwgb3B0aW9ucyk7XG4gICAgfSksXG4gICAgZXh0ZW5kU2VsZWN0aW9uczogZG9jTWV0aG9kT3AoZnVuY3Rpb24gKGhlYWRzLCBvcHRpb25zKSB7XG4gICAgICBleHRlbmRTZWxlY3Rpb25zKHRoaXMsIGNsaXBQb3NBcnJheSh0aGlzLCBoZWFkcyksIG9wdGlvbnMpO1xuICAgIH0pLFxuICAgIGV4dGVuZFNlbGVjdGlvbnNCeTogZG9jTWV0aG9kT3AoZnVuY3Rpb24gKGYsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBoZWFkcyA9IG1hcCh0aGlzLnNlbC5yYW5nZXMsIGYpO1xuICAgICAgZXh0ZW5kU2VsZWN0aW9ucyh0aGlzLCBjbGlwUG9zQXJyYXkodGhpcywgaGVhZHMpLCBvcHRpb25zKTtcbiAgICB9KSxcbiAgICBzZXRTZWxlY3Rpb25zOiBkb2NNZXRob2RPcChmdW5jdGlvbiAocmFuZ2VzLCBwcmltYXJ5LCBvcHRpb25zKSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgICAgaWYgKCFyYW5nZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIG91dCA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBvdXRbaV0gPSBuZXcgUmFuZ2UoX2NsaXBQb3ModGhpcyQxLCByYW5nZXNbaV0uYW5jaG9yKSwgX2NsaXBQb3ModGhpcyQxLCByYW5nZXNbaV0uaGVhZCkpO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJpbWFyeSA9PSBudWxsKSB7XG4gICAgICAgIHByaW1hcnkgPSBNYXRoLm1pbihyYW5nZXMubGVuZ3RoIC0gMSwgdGhpcy5zZWwucHJpbUluZGV4KTtcbiAgICAgIH1cblxuICAgICAgc2V0U2VsZWN0aW9uKHRoaXMsIG5vcm1hbGl6ZVNlbGVjdGlvbihvdXQsIHByaW1hcnkpLCBvcHRpb25zKTtcbiAgICB9KSxcbiAgICBhZGRTZWxlY3Rpb246IGRvY01ldGhvZE9wKGZ1bmN0aW9uIChhbmNob3IsIGhlYWQsIG9wdGlvbnMpIHtcbiAgICAgIHZhciByYW5nZXMgPSB0aGlzLnNlbC5yYW5nZXMuc2xpY2UoMCk7XG4gICAgICByYW5nZXMucHVzaChuZXcgUmFuZ2UoX2NsaXBQb3ModGhpcywgYW5jaG9yKSwgX2NsaXBQb3ModGhpcywgaGVhZCB8fCBhbmNob3IpKSk7XG4gICAgICBzZXRTZWxlY3Rpb24odGhpcywgbm9ybWFsaXplU2VsZWN0aW9uKHJhbmdlcywgcmFuZ2VzLmxlbmd0aCAtIDEpLCBvcHRpb25zKTtcbiAgICB9KSxcbiAgICBnZXRTZWxlY3Rpb246IGZ1bmN0aW9uIGdldFNlbGVjdGlvbihsaW5lU2VwKSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcbiAgICAgIHZhciByYW5nZXMgPSB0aGlzLnNlbC5yYW5nZXMsXG4gICAgICAgICAgbGluZXM7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzZWwgPSBnZXRCZXR3ZWVuKHRoaXMkMSwgcmFuZ2VzW2ldLmZyb20oKSwgcmFuZ2VzW2ldLnRvKCkpO1xuICAgICAgICBsaW5lcyA9IGxpbmVzID8gbGluZXMuY29uY2F0KHNlbCkgOiBzZWw7XG4gICAgICB9XG5cbiAgICAgIGlmIChsaW5lU2VwID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gbGluZXM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbGluZXMuam9pbihsaW5lU2VwIHx8IHRoaXMubGluZVNlcGFyYXRvcigpKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldFNlbGVjdGlvbnM6IGZ1bmN0aW9uIGdldFNlbGVjdGlvbnMobGluZVNlcCkge1xuICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG4gICAgICB2YXIgcGFydHMgPSBbXSxcbiAgICAgICAgICByYW5nZXMgPSB0aGlzLnNlbC5yYW5nZXM7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzZWwgPSBnZXRCZXR3ZWVuKHRoaXMkMSwgcmFuZ2VzW2ldLmZyb20oKSwgcmFuZ2VzW2ldLnRvKCkpO1xuXG4gICAgICAgIGlmIChsaW5lU2VwICE9PSBmYWxzZSkge1xuICAgICAgICAgIHNlbCA9IHNlbC5qb2luKGxpbmVTZXAgfHwgdGhpcyQxLmxpbmVTZXBhcmF0b3IoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwYXJ0c1tpXSA9IHNlbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcnRzO1xuICAgIH0sXG4gICAgcmVwbGFjZVNlbGVjdGlvbjogZnVuY3Rpb24gcmVwbGFjZVNlbGVjdGlvbihjb2RlLCBjb2xsYXBzZSwgb3JpZ2luKSB7XG4gICAgICB2YXIgZHVwID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZWwucmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGR1cFtpXSA9IGNvZGU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVwbGFjZVNlbGVjdGlvbnMoZHVwLCBjb2xsYXBzZSwgb3JpZ2luIHx8IFwiK2lucHV0XCIpO1xuICAgIH0sXG4gICAgcmVwbGFjZVNlbGVjdGlvbnM6IGRvY01ldGhvZE9wKGZ1bmN0aW9uIChjb2RlLCBjb2xsYXBzZSwgb3JpZ2luKSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcbiAgICAgIHZhciBjaGFuZ2VzID0gW10sXG4gICAgICAgICAgc2VsID0gdGhpcy5zZWw7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcmFuZ2UgPSBzZWwucmFuZ2VzW2ldO1xuICAgICAgICBjaGFuZ2VzW2ldID0ge1xuICAgICAgICAgIGZyb206IHJhbmdlLmZyb20oKSxcbiAgICAgICAgICB0bzogcmFuZ2UudG8oKSxcbiAgICAgICAgICB0ZXh0OiB0aGlzJDEuc3BsaXRMaW5lcyhjb2RlW2ldKSxcbiAgICAgICAgICBvcmlnaW46IG9yaWdpblxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB2YXIgbmV3U2VsID0gY29sbGFwc2UgJiYgY29sbGFwc2UgIT0gXCJlbmRcIiAmJiBjb21wdXRlUmVwbGFjZWRTZWwodGhpcywgY2hhbmdlcywgY29sbGFwc2UpO1xuXG4gICAgICBmb3IgKHZhciBpJDEgPSBjaGFuZ2VzLmxlbmd0aCAtIDE7IGkkMSA+PSAwOyBpJDEtLSkge1xuICAgICAgICBtYWtlQ2hhbmdlKHRoaXMkMSwgY2hhbmdlc1tpJDFdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld1NlbCkge1xuICAgICAgICBzZXRTZWxlY3Rpb25SZXBsYWNlSGlzdG9yeSh0aGlzLCBuZXdTZWwpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmNtKSB7XG4gICAgICAgIGVuc3VyZUN1cnNvclZpc2libGUodGhpcy5jbSk7XG4gICAgICB9XG4gICAgfSksXG4gICAgdW5kbzogZG9jTWV0aG9kT3AoZnVuY3Rpb24gKCkge1xuICAgICAgbWFrZUNoYW5nZUZyb21IaXN0b3J5KHRoaXMsIFwidW5kb1wiKTtcbiAgICB9KSxcbiAgICByZWRvOiBkb2NNZXRob2RPcChmdW5jdGlvbiAoKSB7XG4gICAgICBtYWtlQ2hhbmdlRnJvbUhpc3RvcnkodGhpcywgXCJyZWRvXCIpO1xuICAgIH0pLFxuICAgIHVuZG9TZWxlY3Rpb246IGRvY01ldGhvZE9wKGZ1bmN0aW9uICgpIHtcbiAgICAgIG1ha2VDaGFuZ2VGcm9tSGlzdG9yeSh0aGlzLCBcInVuZG9cIiwgdHJ1ZSk7XG4gICAgfSksXG4gICAgcmVkb1NlbGVjdGlvbjogZG9jTWV0aG9kT3AoZnVuY3Rpb24gKCkge1xuICAgICAgbWFrZUNoYW5nZUZyb21IaXN0b3J5KHRoaXMsIFwicmVkb1wiLCB0cnVlKTtcbiAgICB9KSxcbiAgICBzZXRFeHRlbmRpbmc6IGZ1bmN0aW9uIHNldEV4dGVuZGluZyh2YWwpIHtcbiAgICAgIHRoaXMuZXh0ZW5kID0gdmFsO1xuICAgIH0sXG4gICAgZ2V0RXh0ZW5kaW5nOiBmdW5jdGlvbiBnZXRFeHRlbmRpbmcoKSB7XG4gICAgICByZXR1cm4gdGhpcy5leHRlbmQ7XG4gICAgfSxcbiAgICBoaXN0b3J5U2l6ZTogZnVuY3Rpb24gaGlzdG9yeVNpemUoKSB7XG4gICAgICB2YXIgaGlzdCA9IHRoaXMuaGlzdG9yeSxcbiAgICAgICAgICBkb25lID0gMCxcbiAgICAgICAgICB1bmRvbmUgPSAwO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhpc3QuZG9uZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIWhpc3QuZG9uZVtpXS5yYW5nZXMpIHtcbiAgICAgICAgICArK2RvbmU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSQxID0gMDsgaSQxIDwgaGlzdC51bmRvbmUubGVuZ3RoOyBpJDErKykge1xuICAgICAgICBpZiAoIWhpc3QudW5kb25lW2kkMV0ucmFuZ2VzKSB7XG4gICAgICAgICAgKyt1bmRvbmU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdW5kbzogZG9uZSxcbiAgICAgICAgcmVkbzogdW5kb25lXG4gICAgICB9O1xuICAgIH0sXG4gICAgY2xlYXJIaXN0b3J5OiBmdW5jdGlvbiBjbGVhckhpc3RvcnkoKSB7XG4gICAgICB0aGlzLmhpc3RvcnkgPSBuZXcgSGlzdG9yeSh0aGlzLmhpc3RvcnkubWF4R2VuZXJhdGlvbik7XG4gICAgfSxcbiAgICBtYXJrQ2xlYW46IGZ1bmN0aW9uIG1hcmtDbGVhbigpIHtcbiAgICAgIHRoaXMuY2xlYW5HZW5lcmF0aW9uID0gdGhpcy5jaGFuZ2VHZW5lcmF0aW9uKHRydWUpO1xuICAgIH0sXG4gICAgY2hhbmdlR2VuZXJhdGlvbjogZnVuY3Rpb24gY2hhbmdlR2VuZXJhdGlvbihmb3JjZVNwbGl0KSB7XG4gICAgICBpZiAoZm9yY2VTcGxpdCkge1xuICAgICAgICB0aGlzLmhpc3RvcnkubGFzdE9wID0gdGhpcy5oaXN0b3J5Lmxhc3RTZWxPcCA9IHRoaXMuaGlzdG9yeS5sYXN0T3JpZ2luID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeS5nZW5lcmF0aW9uO1xuICAgIH0sXG4gICAgaXNDbGVhbjogZnVuY3Rpb24gaXNDbGVhbihnZW4pIHtcbiAgICAgIHJldHVybiB0aGlzLmhpc3RvcnkuZ2VuZXJhdGlvbiA9PSAoZ2VuIHx8IHRoaXMuY2xlYW5HZW5lcmF0aW9uKTtcbiAgICB9LFxuICAgIGdldEhpc3Rvcnk6IGZ1bmN0aW9uIGdldEhpc3RvcnkoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkb25lOiBjb3B5SGlzdG9yeUFycmF5KHRoaXMuaGlzdG9yeS5kb25lKSxcbiAgICAgICAgdW5kb25lOiBjb3B5SGlzdG9yeUFycmF5KHRoaXMuaGlzdG9yeS51bmRvbmUpXG4gICAgICB9O1xuICAgIH0sXG4gICAgc2V0SGlzdG9yeTogZnVuY3Rpb24gc2V0SGlzdG9yeShoaXN0RGF0YSkge1xuICAgICAgdmFyIGhpc3QgPSB0aGlzLmhpc3RvcnkgPSBuZXcgSGlzdG9yeSh0aGlzLmhpc3RvcnkubWF4R2VuZXJhdGlvbik7XG4gICAgICBoaXN0LmRvbmUgPSBjb3B5SGlzdG9yeUFycmF5KGhpc3REYXRhLmRvbmUuc2xpY2UoMCksIG51bGwsIHRydWUpO1xuICAgICAgaGlzdC51bmRvbmUgPSBjb3B5SGlzdG9yeUFycmF5KGhpc3REYXRhLnVuZG9uZS5zbGljZSgwKSwgbnVsbCwgdHJ1ZSk7XG4gICAgfSxcbiAgICBzZXRHdXR0ZXJNYXJrZXI6IGRvY01ldGhvZE9wKGZ1bmN0aW9uIChsaW5lLCBndXR0ZXJJRCwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBjaGFuZ2VMaW5lKHRoaXMsIGxpbmUsIFwiZ3V0dGVyXCIsIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgIHZhciBtYXJrZXJzID0gbGluZS5ndXR0ZXJNYXJrZXJzIHx8IChsaW5lLmd1dHRlck1hcmtlcnMgPSB7fSk7XG4gICAgICAgIG1hcmtlcnNbZ3V0dGVySURdID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKCF2YWx1ZSAmJiBpc0VtcHR5KG1hcmtlcnMpKSB7XG4gICAgICAgICAgbGluZS5ndXR0ZXJNYXJrZXJzID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfSksXG4gICAgY2xlYXJHdXR0ZXI6IGRvY01ldGhvZE9wKGZ1bmN0aW9uIChndXR0ZXJJRCkge1xuICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG4gICAgICB0aGlzLml0ZXIoZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgaWYgKGxpbmUuZ3V0dGVyTWFya2VycyAmJiBsaW5lLmd1dHRlck1hcmtlcnNbZ3V0dGVySURdKSB7XG4gICAgICAgICAgY2hhbmdlTGluZSh0aGlzJDEsIGxpbmUsIFwiZ3V0dGVyXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxpbmUuZ3V0dGVyTWFya2Vyc1tndXR0ZXJJRF0gPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoaXNFbXB0eShsaW5lLmd1dHRlck1hcmtlcnMpKSB7XG4gICAgICAgICAgICAgIGxpbmUuZ3V0dGVyTWFya2VycyA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KSxcbiAgICBsaW5lSW5mbzogZnVuY3Rpb24gbGluZUluZm8obGluZSkge1xuICAgICAgdmFyIG47XG5cbiAgICAgIGlmICh0eXBlb2YgbGluZSA9PSBcIm51bWJlclwiKSB7XG4gICAgICAgIGlmICghaXNMaW5lKHRoaXMsIGxpbmUpKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBuID0gbGluZTtcbiAgICAgICAgbGluZSA9IGdldExpbmUodGhpcywgbGluZSk7XG5cbiAgICAgICAgaWYgKCFsaW5lKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG4gPSBsaW5lTm8obGluZSk7XG5cbiAgICAgICAgaWYgKG4gPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxpbmU6IG4sXG4gICAgICAgIGhhbmRsZTogbGluZSxcbiAgICAgICAgdGV4dDogbGluZS50ZXh0LFxuICAgICAgICBndXR0ZXJNYXJrZXJzOiBsaW5lLmd1dHRlck1hcmtlcnMsXG4gICAgICAgIHRleHRDbGFzczogbGluZS50ZXh0Q2xhc3MsXG4gICAgICAgIGJnQ2xhc3M6IGxpbmUuYmdDbGFzcyxcbiAgICAgICAgd3JhcENsYXNzOiBsaW5lLndyYXBDbGFzcyxcbiAgICAgICAgd2lkZ2V0czogbGluZS53aWRnZXRzXG4gICAgICB9O1xuICAgIH0sXG4gICAgYWRkTGluZUNsYXNzOiBkb2NNZXRob2RPcChmdW5jdGlvbiAoaGFuZGxlLCB3aGVyZSwgY2xzKSB7XG4gICAgICByZXR1cm4gY2hhbmdlTGluZSh0aGlzLCBoYW5kbGUsIHdoZXJlID09IFwiZ3V0dGVyXCIgPyBcImd1dHRlclwiIDogXCJjbGFzc1wiLCBmdW5jdGlvbiAobGluZSkge1xuICAgICAgICB2YXIgcHJvcCA9IHdoZXJlID09IFwidGV4dFwiID8gXCJ0ZXh0Q2xhc3NcIiA6IHdoZXJlID09IFwiYmFja2dyb3VuZFwiID8gXCJiZ0NsYXNzXCIgOiB3aGVyZSA9PSBcImd1dHRlclwiID8gXCJndXR0ZXJDbGFzc1wiIDogXCJ3cmFwQ2xhc3NcIjtcblxuICAgICAgICBpZiAoIWxpbmVbcHJvcF0pIHtcbiAgICAgICAgICBsaW5lW3Byb3BdID0gY2xzO1xuICAgICAgICB9IGVsc2UgaWYgKGNsYXNzVGVzdChjbHMpLnRlc3QobGluZVtwcm9wXSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGluZVtwcm9wXSArPSBcIiBcIiArIGNscztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfSksXG4gICAgcmVtb3ZlTGluZUNsYXNzOiBkb2NNZXRob2RPcChmdW5jdGlvbiAoaGFuZGxlLCB3aGVyZSwgY2xzKSB7XG4gICAgICByZXR1cm4gY2hhbmdlTGluZSh0aGlzLCBoYW5kbGUsIHdoZXJlID09IFwiZ3V0dGVyXCIgPyBcImd1dHRlclwiIDogXCJjbGFzc1wiLCBmdW5jdGlvbiAobGluZSkge1xuICAgICAgICB2YXIgcHJvcCA9IHdoZXJlID09IFwidGV4dFwiID8gXCJ0ZXh0Q2xhc3NcIiA6IHdoZXJlID09IFwiYmFja2dyb3VuZFwiID8gXCJiZ0NsYXNzXCIgOiB3aGVyZSA9PSBcImd1dHRlclwiID8gXCJndXR0ZXJDbGFzc1wiIDogXCJ3cmFwQ2xhc3NcIjtcbiAgICAgICAgdmFyIGN1ciA9IGxpbmVbcHJvcF07XG5cbiAgICAgICAgaWYgKCFjdXIpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoY2xzID09IG51bGwpIHtcbiAgICAgICAgICBsaW5lW3Byb3BdID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgZm91bmQgPSBjdXIubWF0Y2goY2xhc3NUZXN0KGNscykpO1xuXG4gICAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBlbmQgPSBmb3VuZC5pbmRleCArIGZvdW5kWzBdLmxlbmd0aDtcbiAgICAgICAgICBsaW5lW3Byb3BdID0gY3VyLnNsaWNlKDAsIGZvdW5kLmluZGV4KSArICghZm91bmQuaW5kZXggfHwgZW5kID09IGN1ci5sZW5ndGggPyBcIlwiIDogXCIgXCIpICsgY3VyLnNsaWNlKGVuZCkgfHwgbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfSksXG4gICAgYWRkTGluZVdpZGdldDogZG9jTWV0aG9kT3AoZnVuY3Rpb24gKGhhbmRsZSwgbm9kZSwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIGFkZExpbmVXaWRnZXQodGhpcywgaGFuZGxlLCBub2RlLCBvcHRpb25zKTtcbiAgICB9KSxcbiAgICByZW1vdmVMaW5lV2lkZ2V0OiBmdW5jdGlvbiByZW1vdmVMaW5lV2lkZ2V0KHdpZGdldCkge1xuICAgICAgd2lkZ2V0LmNsZWFyKCk7XG4gICAgfSxcbiAgICBtYXJrVGV4dDogZnVuY3Rpb24gbWFya1RleHQoZnJvbSwgdG8sIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBfbWFya1RleHQodGhpcywgX2NsaXBQb3ModGhpcywgZnJvbSksIF9jbGlwUG9zKHRoaXMsIHRvKSwgb3B0aW9ucywgb3B0aW9ucyAmJiBvcHRpb25zLnR5cGUgfHwgXCJyYW5nZVwiKTtcbiAgICB9LFxuICAgIHNldEJvb2ttYXJrOiBmdW5jdGlvbiBzZXRCb29rbWFyayhwb3MsIG9wdGlvbnMpIHtcbiAgICAgIHZhciByZWFsT3B0cyA9IHtcbiAgICAgICAgcmVwbGFjZWRXaXRoOiBvcHRpb25zICYmIChvcHRpb25zLm5vZGVUeXBlID09IG51bGwgPyBvcHRpb25zLndpZGdldCA6IG9wdGlvbnMpLFxuICAgICAgICBpbnNlcnRMZWZ0OiBvcHRpb25zICYmIG9wdGlvbnMuaW5zZXJ0TGVmdCxcbiAgICAgICAgY2xlYXJXaGVuRW1wdHk6IGZhbHNlLFxuICAgICAgICBzaGFyZWQ6IG9wdGlvbnMgJiYgb3B0aW9ucy5zaGFyZWQsXG4gICAgICAgIGhhbmRsZU1vdXNlRXZlbnRzOiBvcHRpb25zICYmIG9wdGlvbnMuaGFuZGxlTW91c2VFdmVudHNcbiAgICAgIH07XG4gICAgICBwb3MgPSBfY2xpcFBvcyh0aGlzLCBwb3MpO1xuICAgICAgcmV0dXJuIF9tYXJrVGV4dCh0aGlzLCBwb3MsIHBvcywgcmVhbE9wdHMsIFwiYm9va21hcmtcIik7XG4gICAgfSxcbiAgICBmaW5kTWFya3NBdDogZnVuY3Rpb24gZmluZE1hcmtzQXQocG9zKSB7XG4gICAgICBwb3MgPSBfY2xpcFBvcyh0aGlzLCBwb3MpO1xuICAgICAgdmFyIG1hcmtlcnMgPSBbXSxcbiAgICAgICAgICBzcGFucyA9IGdldExpbmUodGhpcywgcG9zLmxpbmUpLm1hcmtlZFNwYW5zO1xuXG4gICAgICBpZiAoc3BhbnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIHZhciBzcGFuID0gc3BhbnNbaV07XG5cbiAgICAgICAgICBpZiAoKHNwYW4uZnJvbSA9PSBudWxsIHx8IHNwYW4uZnJvbSA8PSBwb3MuY2gpICYmIChzcGFuLnRvID09IG51bGwgfHwgc3Bhbi50byA+PSBwb3MuY2gpKSB7XG4gICAgICAgICAgICBtYXJrZXJzLnB1c2goc3Bhbi5tYXJrZXIucGFyZW50IHx8IHNwYW4ubWFya2VyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1hcmtlcnM7XG4gICAgfSxcbiAgICBmaW5kTWFya3M6IGZ1bmN0aW9uIGZpbmRNYXJrcyhmcm9tLCB0bywgZmlsdGVyKSB7XG4gICAgICBmcm9tID0gX2NsaXBQb3ModGhpcywgZnJvbSk7XG4gICAgICB0byA9IF9jbGlwUG9zKHRoaXMsIHRvKTtcbiAgICAgIHZhciBmb3VuZCA9IFtdLFxuICAgICAgICAgIGxpbmVObyA9IGZyb20ubGluZTtcbiAgICAgIHRoaXMuaXRlcihmcm9tLmxpbmUsIHRvLmxpbmUgKyAxLCBmdW5jdGlvbiAobGluZSkge1xuICAgICAgICB2YXIgc3BhbnMgPSBsaW5lLm1hcmtlZFNwYW5zO1xuXG4gICAgICAgIGlmIChzcGFucykge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BhbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzcGFuID0gc3BhbnNbaV07XG5cbiAgICAgICAgICAgIGlmICghKHNwYW4udG8gIT0gbnVsbCAmJiBsaW5lTm8gPT0gZnJvbS5saW5lICYmIGZyb20uY2ggPj0gc3Bhbi50byB8fCBzcGFuLmZyb20gPT0gbnVsbCAmJiBsaW5lTm8gIT0gZnJvbS5saW5lIHx8IHNwYW4uZnJvbSAhPSBudWxsICYmIGxpbmVObyA9PSB0by5saW5lICYmIHNwYW4uZnJvbSA+PSB0by5jaCkgJiYgKCFmaWx0ZXIgfHwgZmlsdGVyKHNwYW4ubWFya2VyKSkpIHtcbiAgICAgICAgICAgICAgZm91bmQucHVzaChzcGFuLm1hcmtlci5wYXJlbnQgfHwgc3Bhbi5tYXJrZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICsrbGluZU5vO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZm91bmQ7XG4gICAgfSxcbiAgICBnZXRBbGxNYXJrczogZnVuY3Rpb24gZ2V0QWxsTWFya3MoKSB7XG4gICAgICB2YXIgbWFya2VycyA9IFtdO1xuICAgICAgdGhpcy5pdGVyKGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgIHZhciBzcHMgPSBsaW5lLm1hcmtlZFNwYW5zO1xuXG4gICAgICAgIGlmIChzcHMpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKHNwc1tpXS5mcm9tICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgbWFya2Vycy5wdXNoKHNwc1tpXS5tYXJrZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gbWFya2VycztcbiAgICB9LFxuICAgIHBvc0Zyb21JbmRleDogZnVuY3Rpb24gcG9zRnJvbUluZGV4KG9mZikge1xuICAgICAgdmFyIGNoLFxuICAgICAgICAgIGxpbmVObyA9IHRoaXMuZmlyc3QsXG4gICAgICAgICAgc2VwU2l6ZSA9IHRoaXMubGluZVNlcGFyYXRvcigpLmxlbmd0aDtcbiAgICAgIHRoaXMuaXRlcihmdW5jdGlvbiAobGluZSkge1xuICAgICAgICB2YXIgc3ogPSBsaW5lLnRleHQubGVuZ3RoICsgc2VwU2l6ZTtcblxuICAgICAgICBpZiAoc3ogPiBvZmYpIHtcbiAgICAgICAgICBjaCA9IG9mZjtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9mZiAtPSBzejtcbiAgICAgICAgKytsaW5lTm87XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBfY2xpcFBvcyh0aGlzLCBQb3MobGluZU5vLCBjaCkpO1xuICAgIH0sXG4gICAgaW5kZXhGcm9tUG9zOiBmdW5jdGlvbiBpbmRleEZyb21Qb3MoY29vcmRzKSB7XG4gICAgICBjb29yZHMgPSBfY2xpcFBvcyh0aGlzLCBjb29yZHMpO1xuICAgICAgdmFyIGluZGV4ID0gY29vcmRzLmNoO1xuXG4gICAgICBpZiAoY29vcmRzLmxpbmUgPCB0aGlzLmZpcnN0IHx8IGNvb3Jkcy5jaCA8IDApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZXBTaXplID0gdGhpcy5saW5lU2VwYXJhdG9yKCkubGVuZ3RoO1xuICAgICAgdGhpcy5pdGVyKHRoaXMuZmlyc3QsIGNvb3Jkcy5saW5lLCBmdW5jdGlvbiAobGluZSkge1xuICAgICAgICAvLyBpdGVyIGFib3J0cyB3aGVuIGNhbGxiYWNrIHJldHVybnMgYSB0cnV0aHkgdmFsdWVcbiAgICAgICAgaW5kZXggKz0gbGluZS50ZXh0Lmxlbmd0aCArIHNlcFNpemU7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9LFxuICAgIGNvcHk6IGZ1bmN0aW9uIGNvcHkoY29weUhpc3RvcnkpIHtcbiAgICAgIHZhciBkb2MgPSBuZXcgRG9jKGdldExpbmVzKHRoaXMsIHRoaXMuZmlyc3QsIHRoaXMuZmlyc3QgKyB0aGlzLnNpemUpLCB0aGlzLm1vZGVPcHRpb24sIHRoaXMuZmlyc3QsIHRoaXMubGluZVNlcCk7XG4gICAgICBkb2Muc2Nyb2xsVG9wID0gdGhpcy5zY3JvbGxUb3A7XG4gICAgICBkb2Muc2Nyb2xsTGVmdCA9IHRoaXMuc2Nyb2xsTGVmdDtcbiAgICAgIGRvYy5zZWwgPSB0aGlzLnNlbDtcbiAgICAgIGRvYy5leHRlbmQgPSBmYWxzZTtcblxuICAgICAgaWYgKGNvcHlIaXN0b3J5KSB7XG4gICAgICAgIGRvYy5oaXN0b3J5LnVuZG9EZXB0aCA9IHRoaXMuaGlzdG9yeS51bmRvRGVwdGg7XG4gICAgICAgIGRvYy5zZXRIaXN0b3J5KHRoaXMuZ2V0SGlzdG9yeSgpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRvYztcbiAgICB9LFxuICAgIGxpbmtlZERvYzogZnVuY3Rpb24gbGlua2VkRG9jKG9wdGlvbnMpIHtcbiAgICAgIGlmICghb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG5cbiAgICAgIHZhciBmcm9tID0gdGhpcy5maXJzdCxcbiAgICAgICAgICB0byA9IHRoaXMuZmlyc3QgKyB0aGlzLnNpemU7XG5cbiAgICAgIGlmIChvcHRpb25zLmZyb20gIT0gbnVsbCAmJiBvcHRpb25zLmZyb20gPiBmcm9tKSB7XG4gICAgICAgIGZyb20gPSBvcHRpb25zLmZyb207XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLnRvICE9IG51bGwgJiYgb3B0aW9ucy50byA8IHRvKSB7XG4gICAgICAgIHRvID0gb3B0aW9ucy50bztcbiAgICAgIH1cblxuICAgICAgdmFyIGNvcHkgPSBuZXcgRG9jKGdldExpbmVzKHRoaXMsIGZyb20sIHRvKSwgb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZU9wdGlvbiwgZnJvbSwgdGhpcy5saW5lU2VwKTtcblxuICAgICAgaWYgKG9wdGlvbnMuc2hhcmVkSGlzdCkge1xuICAgICAgICBjb3B5Lmhpc3RvcnkgPSB0aGlzLmhpc3Rvcnk7XG4gICAgICB9XG5cbiAgICAgICh0aGlzLmxpbmtlZCB8fCAodGhpcy5saW5rZWQgPSBbXSkpLnB1c2goe1xuICAgICAgICBkb2M6IGNvcHksXG4gICAgICAgIHNoYXJlZEhpc3Q6IG9wdGlvbnMuc2hhcmVkSGlzdFxuICAgICAgfSk7XG4gICAgICBjb3B5LmxpbmtlZCA9IFt7XG4gICAgICAgIGRvYzogdGhpcyxcbiAgICAgICAgaXNQYXJlbnQ6IHRydWUsXG4gICAgICAgIHNoYXJlZEhpc3Q6IG9wdGlvbnMuc2hhcmVkSGlzdFxuICAgICAgfV07XG4gICAgICBjb3B5U2hhcmVkTWFya2Vycyhjb3B5LCBmaW5kU2hhcmVkTWFya2Vycyh0aGlzKSk7XG4gICAgICByZXR1cm4gY29weTtcbiAgICB9LFxuICAgIHVubGlua0RvYzogZnVuY3Rpb24gdW5saW5rRG9jKG90aGVyKSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgICAgaWYgKG90aGVyIGluc3RhbmNlb2YgQ29kZU1pcnJvcikge1xuICAgICAgICBvdGhlciA9IG90aGVyLmRvYztcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMubGlua2VkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saW5rZWQubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICB2YXIgbGluayA9IHRoaXMkMS5saW5rZWRbaV07XG5cbiAgICAgICAgICBpZiAobGluay5kb2MgIT0gb3RoZXIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMkMS5saW5rZWQuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIG90aGVyLnVubGlua0RvYyh0aGlzJDEpO1xuICAgICAgICAgIGRldGFjaFNoYXJlZE1hcmtlcnMoZmluZFNoYXJlZE1hcmtlcnModGhpcyQxKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gLy8gSWYgdGhlIGhpc3RvcmllcyB3ZXJlIHNoYXJlZCwgc3BsaXQgdGhlbSBhZ2FpblxuXG5cbiAgICAgIGlmIChvdGhlci5oaXN0b3J5ID09IHRoaXMuaGlzdG9yeSkge1xuICAgICAgICB2YXIgc3BsaXRJZHMgPSBbb3RoZXIuaWRdO1xuICAgICAgICBsaW5rZWREb2NzKG90aGVyLCBmdW5jdGlvbiAoZG9jKSB7XG4gICAgICAgICAgcmV0dXJuIHNwbGl0SWRzLnB1c2goZG9jLmlkKTtcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIG90aGVyLmhpc3RvcnkgPSBuZXcgSGlzdG9yeShudWxsKTtcbiAgICAgICAgb3RoZXIuaGlzdG9yeS5kb25lID0gY29weUhpc3RvcnlBcnJheSh0aGlzLmhpc3RvcnkuZG9uZSwgc3BsaXRJZHMpO1xuICAgICAgICBvdGhlci5oaXN0b3J5LnVuZG9uZSA9IGNvcHlIaXN0b3J5QXJyYXkodGhpcy5oaXN0b3J5LnVuZG9uZSwgc3BsaXRJZHMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaXRlckxpbmtlZERvY3M6IGZ1bmN0aW9uIGl0ZXJMaW5rZWREb2NzKGYpIHtcbiAgICAgIGxpbmtlZERvY3ModGhpcywgZik7XG4gICAgfSxcbiAgICBnZXRNb2RlOiBmdW5jdGlvbiBnZXRNb2RlKCkge1xuICAgICAgcmV0dXJuIHRoaXMubW9kZTtcbiAgICB9LFxuICAgIGdldEVkaXRvcjogZnVuY3Rpb24gZ2V0RWRpdG9yKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY207XG4gICAgfSxcbiAgICBzcGxpdExpbmVzOiBmdW5jdGlvbiBzcGxpdExpbmVzKHN0cikge1xuICAgICAgaWYgKHRoaXMubGluZVNlcCkge1xuICAgICAgICByZXR1cm4gc3RyLnNwbGl0KHRoaXMubGluZVNlcCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzcGxpdExpbmVzQXV0byhzdHIpO1xuICAgIH0sXG4gICAgbGluZVNlcGFyYXRvcjogZnVuY3Rpb24gbGluZVNlcGFyYXRvcigpIHtcbiAgICAgIHJldHVybiB0aGlzLmxpbmVTZXAgfHwgXCJcXG5cIjtcbiAgICB9XG4gIH0pOyAvLyBQdWJsaWMgYWxpYXMuXG5cbiAgRG9jLnByb3RvdHlwZS5lYWNoTGluZSA9IERvYy5wcm90b3R5cGUuaXRlcjsgLy8gS2x1ZGdlIHRvIHdvcmsgYXJvdW5kIHN0cmFuZ2UgSUUgYmVoYXZpb3Igd2hlcmUgaXQnbGwgc29tZXRpbWVzXG4gIC8vIHJlLWZpcmUgYSBzZXJpZXMgb2YgZHJhZy1yZWxhdGVkIGV2ZW50cyByaWdodCBhZnRlciB0aGUgZHJvcCAoIzE1NTEpXG5cbiAgdmFyIGxhc3REcm9wID0gMDtcblxuICBmdW5jdGlvbiBvbkRyb3AoZSkge1xuICAgIHZhciBjbSA9IHRoaXM7XG4gICAgY2xlYXJEcmFnQ3Vyc29yKGNtKTtcblxuICAgIGlmIChzaWduYWxET01FdmVudChjbSwgZSkgfHwgZXZlbnRJbldpZGdldChjbS5kaXNwbGF5LCBlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGVfcHJldmVudERlZmF1bHQoZSk7XG5cbiAgICBpZiAoaWUpIHtcbiAgICAgIGxhc3REcm9wID0gK25ldyBEYXRlKCk7XG4gICAgfVxuXG4gICAgdmFyIHBvcyA9IHBvc0Zyb21Nb3VzZShjbSwgZSwgdHJ1ZSksXG4gICAgICAgIGZpbGVzID0gZS5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cbiAgICBpZiAoIXBvcyB8fCBjbS5pc1JlYWRPbmx5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IC8vIE1pZ2h0IGJlIGEgZmlsZSBkcm9wLCBpbiB3aGljaCBjYXNlIHdlIHNpbXBseSBleHRyYWN0IHRoZSB0ZXh0XG4gICAgLy8gYW5kIGluc2VydCBpdC5cblxuXG4gICAgaWYgKGZpbGVzICYmIGZpbGVzLmxlbmd0aCAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZSkge1xuICAgICAgdmFyIG4gPSBmaWxlcy5sZW5ndGgsXG4gICAgICAgICAgdGV4dCA9IEFycmF5KG4pLFxuICAgICAgICAgIHJlYWQgPSAwO1xuXG4gICAgICB2YXIgbG9hZEZpbGUgPSBmdW5jdGlvbiBsb2FkRmlsZShmaWxlLCBpKSB7XG4gICAgICAgIGlmIChjbS5vcHRpb25zLmFsbG93RHJvcEZpbGVUeXBlcyAmJiBpbmRleE9mKGNtLm9wdGlvbnMuYWxsb3dEcm9wRmlsZVR5cGVzLCBmaWxlLnR5cGUpID09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSBvcGVyYXRpb24oY20sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgY29udGVudCA9IHJlYWRlci5yZXN1bHQ7XG5cbiAgICAgICAgICBpZiAoL1tcXHgwMC1cXHgwOFxceDBlLVxceDFmXXsyfS8udGVzdChjb250ZW50KSkge1xuICAgICAgICAgICAgY29udGVudCA9IFwiXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGV4dFtpXSA9IGNvbnRlbnQ7XG5cbiAgICAgICAgICBpZiAoKytyZWFkID09IG4pIHtcbiAgICAgICAgICAgIHBvcyA9IF9jbGlwUG9zKGNtLmRvYywgcG9zKTtcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSB7XG4gICAgICAgICAgICAgIGZyb206IHBvcyxcbiAgICAgICAgICAgICAgdG86IHBvcyxcbiAgICAgICAgICAgICAgdGV4dDogY20uZG9jLnNwbGl0TGluZXModGV4dC5qb2luKGNtLmRvYy5saW5lU2VwYXJhdG9yKCkpKSxcbiAgICAgICAgICAgICAgb3JpZ2luOiBcInBhc3RlXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBtYWtlQ2hhbmdlKGNtLmRvYywgY2hhbmdlKTtcbiAgICAgICAgICAgIHNldFNlbGVjdGlvblJlcGxhY2VIaXN0b3J5KGNtLmRvYywgc2ltcGxlU2VsZWN0aW9uKHBvcywgY2hhbmdlRW5kKGNoYW5nZSkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlKTtcbiAgICAgIH07XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGxvYWRGaWxlKGZpbGVzW2ldLCBpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm9ybWFsIGRyb3BcbiAgICAgIC8vIERvbid0IGRvIGEgcmVwbGFjZSBpZiB0aGUgZHJvcCBoYXBwZW5lZCBpbnNpZGUgb2YgdGhlIHNlbGVjdGVkIHRleHQuXG4gICAgICBpZiAoY20uc3RhdGUuZHJhZ2dpbmdUZXh0ICYmIGNtLmRvYy5zZWwuY29udGFpbnMocG9zKSA+IC0xKSB7XG4gICAgICAgIGNtLnN0YXRlLmRyYWdnaW5nVGV4dChlKTsgLy8gRW5zdXJlIHRoZSBlZGl0b3IgaXMgcmUtZm9jdXNlZFxuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBjbS5kaXNwbGF5LmlucHV0LmZvY3VzKCk7XG4gICAgICAgIH0sIDIwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICB2YXIgdGV4dCQxID0gZS5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcIlRleHRcIik7XG5cbiAgICAgICAgaWYgKHRleHQkMSkge1xuICAgICAgICAgIHZhciBzZWxlY3RlZDtcblxuICAgICAgICAgIGlmIChjbS5zdGF0ZS5kcmFnZ2luZ1RleHQgJiYgIWNtLnN0YXRlLmRyYWdnaW5nVGV4dC5jb3B5KSB7XG4gICAgICAgICAgICBzZWxlY3RlZCA9IGNtLmxpc3RTZWxlY3Rpb25zKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2V0U2VsZWN0aW9uTm9VbmRvKGNtLmRvYywgc2ltcGxlU2VsZWN0aW9uKHBvcywgcG9zKSk7XG5cbiAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IHNlbGVjdGVkLmxlbmd0aDsgKytpJDEpIHtcbiAgICAgICAgICAgICAgX3JlcGxhY2VSYW5nZShjbS5kb2MsIFwiXCIsIHNlbGVjdGVkW2kkMV0uYW5jaG9yLCBzZWxlY3RlZFtpJDFdLmhlYWQsIFwiZHJhZ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjbS5yZXBsYWNlU2VsZWN0aW9uKHRleHQkMSwgXCJhcm91bmRcIiwgXCJwYXN0ZVwiKTtcbiAgICAgICAgICBjbS5kaXNwbGF5LmlucHV0LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25EcmFnU3RhcnQoY20sIGUpIHtcbiAgICBpZiAoaWUgJiYgKCFjbS5zdGF0ZS5kcmFnZ2luZ1RleHQgfHwgK25ldyBEYXRlKCkgLSBsYXN0RHJvcCA8IDEwMCkpIHtcbiAgICAgIGVfc3RvcChlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUpIHx8IGV2ZW50SW5XaWRnZXQoY20uZGlzcGxheSwgZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKFwiVGV4dFwiLCBjbS5nZXRTZWxlY3Rpb24oKSk7XG4gICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwiY29weU1vdmVcIjsgLy8gVXNlIGR1bW15IGltYWdlIGluc3RlYWQgb2YgZGVmYXVsdCBicm93c2VycyBpbWFnZS5cbiAgICAvLyBSZWNlbnQgU2FmYXJpICh+Ni4wLjIpIGhhdmUgYSB0ZW5kZW5jeSB0byBzZWdmYXVsdCB3aGVuIHRoaXMgaGFwcGVucywgc28gd2UgZG9uJ3QgZG8gaXQgdGhlcmUuXG5cbiAgICBpZiAoZS5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlICYmICFzYWZhcmkpIHtcbiAgICAgIHZhciBpbWcgPSBlbHQoXCJpbWdcIiwgbnVsbCwgbnVsbCwgXCJwb3NpdGlvbjogZml4ZWQ7IGxlZnQ6IDA7IHRvcDogMDtcIik7XG4gICAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUFBQUFDSDVCQUVLQUFFQUxBQUFBQUFCQUFFQUFBSUNUQUVBT3c9PVwiO1xuXG4gICAgICBpZiAocHJlc3RvKSB7XG4gICAgICAgIGltZy53aWR0aCA9IGltZy5oZWlnaHQgPSAxO1xuICAgICAgICBjbS5kaXNwbGF5LndyYXBwZXIuYXBwZW5kQ2hpbGQoaW1nKTsgLy8gRm9yY2UgYSByZWxheW91dCwgb3IgT3BlcmEgd29uJ3QgdXNlIG91ciBpbWFnZSBmb3Igc29tZSBvYnNjdXJlIHJlYXNvblxuXG4gICAgICAgIGltZy5fdG9wID0gaW1nLm9mZnNldFRvcDtcbiAgICAgIH1cblxuICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKGltZywgMCwgMCk7XG5cbiAgICAgIGlmIChwcmVzdG8pIHtcbiAgICAgICAgaW1nLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaW1nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvbkRyYWdPdmVyKGNtLCBlKSB7XG4gICAgdmFyIHBvcyA9IHBvc0Zyb21Nb3VzZShjbSwgZSk7XG5cbiAgICBpZiAoIXBvcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGRyYXdTZWxlY3Rpb25DdXJzb3IoY20sIHBvcywgZnJhZyk7XG5cbiAgICBpZiAoIWNtLmRpc3BsYXkuZHJhZ0N1cnNvcikge1xuICAgICAgY20uZGlzcGxheS5kcmFnQ3Vyc29yID0gZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1jdXJzb3JzIENvZGVNaXJyb3ItZHJhZ2N1cnNvcnNcIik7XG4gICAgICBjbS5kaXNwbGF5LmxpbmVTcGFjZS5pbnNlcnRCZWZvcmUoY20uZGlzcGxheS5kcmFnQ3Vyc29yLCBjbS5kaXNwbGF5LmN1cnNvckRpdik7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQoY20uZGlzcGxheS5kcmFnQ3Vyc29yLCBmcmFnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyRHJhZ0N1cnNvcihjbSkge1xuICAgIGlmIChjbS5kaXNwbGF5LmRyYWdDdXJzb3IpIHtcbiAgICAgIGNtLmRpc3BsYXkubGluZVNwYWNlLnJlbW92ZUNoaWxkKGNtLmRpc3BsYXkuZHJhZ0N1cnNvcik7XG4gICAgICBjbS5kaXNwbGF5LmRyYWdDdXJzb3IgPSBudWxsO1xuICAgIH1cbiAgfSAvLyBUaGVzZSBtdXN0IGJlIGhhbmRsZWQgY2FyZWZ1bGx5LCBiZWNhdXNlIG5haXZlbHkgcmVnaXN0ZXJpbmcgYVxuICAvLyBoYW5kbGVyIGZvciBlYWNoIGVkaXRvciB3aWxsIGNhdXNlIHRoZSBlZGl0b3JzIHRvIG5ldmVyIGJlXG4gIC8vIGdhcmJhZ2UgY29sbGVjdGVkLlxuXG5cbiAgZnVuY3Rpb24gZm9yRWFjaENvZGVNaXJyb3IoZikge1xuICAgIGlmICghZG9jdW1lbnQuYm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJ5Q2xhc3MgPSBkb2N1bWVudC5ib2R5LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJDb2RlTWlycm9yXCIpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBieUNsYXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY20gPSBieUNsYXNzW2ldLkNvZGVNaXJyb3I7XG5cbiAgICAgIGlmIChjbSkge1xuICAgICAgICBmKGNtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgZ2xvYmFsc1JlZ2lzdGVyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBlbnN1cmVHbG9iYWxIYW5kbGVycygpIHtcbiAgICBpZiAoZ2xvYmFsc1JlZ2lzdGVyZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZWdpc3Rlckdsb2JhbEhhbmRsZXJzKCk7XG4gICAgZ2xvYmFsc1JlZ2lzdGVyZWQgPSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXJHbG9iYWxIYW5kbGVycygpIHtcbiAgICAvLyBXaGVuIHRoZSB3aW5kb3cgcmVzaXplcywgd2UgbmVlZCB0byByZWZyZXNoIGFjdGl2ZSBlZGl0b3JzLlxuICAgIHZhciByZXNpemVUaW1lcjtcbiAgICBvbih3aW5kb3csIFwicmVzaXplXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChyZXNpemVUaW1lciA9PSBudWxsKSB7XG4gICAgICAgIHJlc2l6ZVRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmVzaXplVGltZXIgPSBudWxsO1xuICAgICAgICAgIGZvckVhY2hDb2RlTWlycm9yKG9uUmVzaXplKTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH1cbiAgICB9KTsgLy8gV2hlbiB0aGUgd2luZG93IGxvc2VzIGZvY3VzLCB3ZSB3YW50IHRvIHNob3cgdGhlIGVkaXRvciBhcyBibHVycmVkXG5cbiAgICBvbih3aW5kb3csIFwiYmx1clwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZm9yRWFjaENvZGVNaXJyb3Iob25CbHVyKTtcbiAgICB9KTtcbiAgfSAvLyBDYWxsZWQgd2hlbiB0aGUgd2luZG93IHJlc2l6ZXNcblxuXG4gIGZ1bmN0aW9uIG9uUmVzaXplKGNtKSB7XG4gICAgdmFyIGQgPSBjbS5kaXNwbGF5O1xuXG4gICAgaWYgKGQubGFzdFdyYXBIZWlnaHQgPT0gZC53cmFwcGVyLmNsaWVudEhlaWdodCAmJiBkLmxhc3RXcmFwV2lkdGggPT0gZC53cmFwcGVyLmNsaWVudFdpZHRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfSAvLyBNaWdodCBiZSBhIHRleHQgc2NhbGluZyBvcGVyYXRpb24sIGNsZWFyIHNpemUgY2FjaGVzLlxuXG5cbiAgICBkLmNhY2hlZENoYXJXaWR0aCA9IGQuY2FjaGVkVGV4dEhlaWdodCA9IGQuY2FjaGVkUGFkZGluZ0ggPSBudWxsO1xuICAgIGQuc2Nyb2xsYmFyc0NsaXBwZWQgPSBmYWxzZTtcbiAgICBjbS5zZXRTaXplKCk7XG4gIH1cblxuICB2YXIga2V5TmFtZXMgPSB7XG4gICAgMzogXCJFbnRlclwiLFxuICAgIDg6IFwiQmFja3NwYWNlXCIsXG4gICAgOTogXCJUYWJcIixcbiAgICAxMzogXCJFbnRlclwiLFxuICAgIDE2OiBcIlNoaWZ0XCIsXG4gICAgMTc6IFwiQ3RybFwiLFxuICAgIDE4OiBcIkFsdFwiLFxuICAgIDE5OiBcIlBhdXNlXCIsXG4gICAgMjA6IFwiQ2Fwc0xvY2tcIixcbiAgICAyNzogXCJFc2NcIixcbiAgICAzMjogXCJTcGFjZVwiLFxuICAgIDMzOiBcIlBhZ2VVcFwiLFxuICAgIDM0OiBcIlBhZ2VEb3duXCIsXG4gICAgMzU6IFwiRW5kXCIsXG4gICAgMzY6IFwiSG9tZVwiLFxuICAgIDM3OiBcIkxlZnRcIixcbiAgICAzODogXCJVcFwiLFxuICAgIDM5OiBcIlJpZ2h0XCIsXG4gICAgNDA6IFwiRG93blwiLFxuICAgIDQ0OiBcIlByaW50U2NyblwiLFxuICAgIDQ1OiBcIkluc2VydFwiLFxuICAgIDQ2OiBcIkRlbGV0ZVwiLFxuICAgIDU5OiBcIjtcIixcbiAgICA2MTogXCI9XCIsXG4gICAgOTE6IFwiTW9kXCIsXG4gICAgOTI6IFwiTW9kXCIsXG4gICAgOTM6IFwiTW9kXCIsXG4gICAgMTA2OiBcIipcIixcbiAgICAxMDc6IFwiPVwiLFxuICAgIDEwOTogXCItXCIsXG4gICAgMTEwOiBcIi5cIixcbiAgICAxMTE6IFwiL1wiLFxuICAgIDEyNzogXCJEZWxldGVcIixcbiAgICAxNzM6IFwiLVwiLFxuICAgIDE4NjogXCI7XCIsXG4gICAgMTg3OiBcIj1cIixcbiAgICAxODg6IFwiLFwiLFxuICAgIDE4OTogXCItXCIsXG4gICAgMTkwOiBcIi5cIixcbiAgICAxOTE6IFwiL1wiLFxuICAgIDE5MjogXCJgXCIsXG4gICAgMjE5OiBcIltcIixcbiAgICAyMjA6IFwiXFxcXFwiLFxuICAgIDIyMTogXCJdXCIsXG4gICAgMjIyOiBcIidcIixcbiAgICA2MzIzMjogXCJVcFwiLFxuICAgIDYzMjMzOiBcIkRvd25cIixcbiAgICA2MzIzNDogXCJMZWZ0XCIsXG4gICAgNjMyMzU6IFwiUmlnaHRcIixcbiAgICA2MzI3MjogXCJEZWxldGVcIixcbiAgICA2MzI3MzogXCJIb21lXCIsXG4gICAgNjMyNzU6IFwiRW5kXCIsXG4gICAgNjMyNzY6IFwiUGFnZVVwXCIsXG4gICAgNjMyNzc6IFwiUGFnZURvd25cIixcbiAgICA2MzMwMjogXCJJbnNlcnRcIlxuICB9OyAvLyBOdW1iZXIga2V5c1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgIGtleU5hbWVzW2kgKyA0OF0gPSBrZXlOYW1lc1tpICsgOTZdID0gU3RyaW5nKGkpO1xuICB9IC8vIEFscGhhYmV0aWMga2V5c1xuXG5cbiAgZm9yICh2YXIgaSQxID0gNjU7IGkkMSA8PSA5MDsgaSQxKyspIHtcbiAgICBrZXlOYW1lc1tpJDFdID0gU3RyaW5nLmZyb21DaGFyQ29kZShpJDEpO1xuICB9IC8vIEZ1bmN0aW9uIGtleXNcblxuXG4gIGZvciAodmFyIGkkMiA9IDE7IGkkMiA8PSAxMjsgaSQyKyspIHtcbiAgICBrZXlOYW1lc1tpJDIgKyAxMTFdID0ga2V5TmFtZXNbaSQyICsgNjMyMzVdID0gXCJGXCIgKyBpJDI7XG4gIH1cblxuICB2YXIga2V5TWFwID0ge307XG4gIGtleU1hcC5iYXNpYyA9IHtcbiAgICBcIkxlZnRcIjogXCJnb0NoYXJMZWZ0XCIsXG4gICAgXCJSaWdodFwiOiBcImdvQ2hhclJpZ2h0XCIsXG4gICAgXCJVcFwiOiBcImdvTGluZVVwXCIsXG4gICAgXCJEb3duXCI6IFwiZ29MaW5lRG93blwiLFxuICAgIFwiRW5kXCI6IFwiZ29MaW5lRW5kXCIsXG4gICAgXCJIb21lXCI6IFwiZ29MaW5lU3RhcnRTbWFydFwiLFxuICAgIFwiUGFnZVVwXCI6IFwiZ29QYWdlVXBcIixcbiAgICBcIlBhZ2VEb3duXCI6IFwiZ29QYWdlRG93blwiLFxuICAgIFwiRGVsZXRlXCI6IFwiZGVsQ2hhckFmdGVyXCIsXG4gICAgXCJCYWNrc3BhY2VcIjogXCJkZWxDaGFyQmVmb3JlXCIsXG4gICAgXCJTaGlmdC1CYWNrc3BhY2VcIjogXCJkZWxDaGFyQmVmb3JlXCIsXG4gICAgXCJUYWJcIjogXCJkZWZhdWx0VGFiXCIsXG4gICAgXCJTaGlmdC1UYWJcIjogXCJpbmRlbnRBdXRvXCIsXG4gICAgXCJFbnRlclwiOiBcIm5ld2xpbmVBbmRJbmRlbnRcIixcbiAgICBcIkluc2VydFwiOiBcInRvZ2dsZU92ZXJ3cml0ZVwiLFxuICAgIFwiRXNjXCI6IFwic2luZ2xlU2VsZWN0aW9uXCJcbiAgfTsgLy8gTm90ZSB0aGF0IHRoZSBzYXZlIGFuZCBmaW5kLXJlbGF0ZWQgY29tbWFuZHMgYXJlbid0IGRlZmluZWQgYnlcbiAgLy8gZGVmYXVsdC4gVXNlciBjb2RlIG9yIGFkZG9ucyBjYW4gZGVmaW5lIHRoZW0uIFVua25vd24gY29tbWFuZHNcbiAgLy8gYXJlIHNpbXBseSBpZ25vcmVkLlxuXG4gIGtleU1hcC5wY0RlZmF1bHQgPSB7XG4gICAgXCJDdHJsLUFcIjogXCJzZWxlY3RBbGxcIixcbiAgICBcIkN0cmwtRFwiOiBcImRlbGV0ZUxpbmVcIixcbiAgICBcIkN0cmwtWlwiOiBcInVuZG9cIixcbiAgICBcIlNoaWZ0LUN0cmwtWlwiOiBcInJlZG9cIixcbiAgICBcIkN0cmwtWVwiOiBcInJlZG9cIixcbiAgICBcIkN0cmwtSG9tZVwiOiBcImdvRG9jU3RhcnRcIixcbiAgICBcIkN0cmwtRW5kXCI6IFwiZ29Eb2NFbmRcIixcbiAgICBcIkN0cmwtVXBcIjogXCJnb0xpbmVVcFwiLFxuICAgIFwiQ3RybC1Eb3duXCI6IFwiZ29MaW5lRG93blwiLFxuICAgIFwiQ3RybC1MZWZ0XCI6IFwiZ29Hcm91cExlZnRcIixcbiAgICBcIkN0cmwtUmlnaHRcIjogXCJnb0dyb3VwUmlnaHRcIixcbiAgICBcIkFsdC1MZWZ0XCI6IFwiZ29MaW5lU3RhcnRcIixcbiAgICBcIkFsdC1SaWdodFwiOiBcImdvTGluZUVuZFwiLFxuICAgIFwiQ3RybC1CYWNrc3BhY2VcIjogXCJkZWxHcm91cEJlZm9yZVwiLFxuICAgIFwiQ3RybC1EZWxldGVcIjogXCJkZWxHcm91cEFmdGVyXCIsXG4gICAgXCJDdHJsLVNcIjogXCJzYXZlXCIsXG4gICAgXCJDdHJsLUZcIjogXCJmaW5kXCIsXG4gICAgXCJDdHJsLUdcIjogXCJmaW5kTmV4dFwiLFxuICAgIFwiU2hpZnQtQ3RybC1HXCI6IFwiZmluZFByZXZcIixcbiAgICBcIlNoaWZ0LUN0cmwtRlwiOiBcInJlcGxhY2VcIixcbiAgICBcIlNoaWZ0LUN0cmwtUlwiOiBcInJlcGxhY2VBbGxcIixcbiAgICBcIkN0cmwtW1wiOiBcImluZGVudExlc3NcIixcbiAgICBcIkN0cmwtXVwiOiBcImluZGVudE1vcmVcIixcbiAgICBcIkN0cmwtVVwiOiBcInVuZG9TZWxlY3Rpb25cIixcbiAgICBcIlNoaWZ0LUN0cmwtVVwiOiBcInJlZG9TZWxlY3Rpb25cIixcbiAgICBcIkFsdC1VXCI6IFwicmVkb1NlbGVjdGlvblwiLFxuICAgIGZhbGx0aHJvdWdoOiBcImJhc2ljXCJcbiAgfTsgLy8gVmVyeSBiYXNpYyByZWFkbGluZS9lbWFjcy1zdHlsZSBiaW5kaW5ncywgd2hpY2ggYXJlIHN0YW5kYXJkIG9uIE1hYy5cblxuICBrZXlNYXAuZW1hY3N5ID0ge1xuICAgIFwiQ3RybC1GXCI6IFwiZ29DaGFyUmlnaHRcIixcbiAgICBcIkN0cmwtQlwiOiBcImdvQ2hhckxlZnRcIixcbiAgICBcIkN0cmwtUFwiOiBcImdvTGluZVVwXCIsXG4gICAgXCJDdHJsLU5cIjogXCJnb0xpbmVEb3duXCIsXG4gICAgXCJBbHQtRlwiOiBcImdvV29yZFJpZ2h0XCIsXG4gICAgXCJBbHQtQlwiOiBcImdvV29yZExlZnRcIixcbiAgICBcIkN0cmwtQVwiOiBcImdvTGluZVN0YXJ0XCIsXG4gICAgXCJDdHJsLUVcIjogXCJnb0xpbmVFbmRcIixcbiAgICBcIkN0cmwtVlwiOiBcImdvUGFnZURvd25cIixcbiAgICBcIlNoaWZ0LUN0cmwtVlwiOiBcImdvUGFnZVVwXCIsXG4gICAgXCJDdHJsLURcIjogXCJkZWxDaGFyQWZ0ZXJcIixcbiAgICBcIkN0cmwtSFwiOiBcImRlbENoYXJCZWZvcmVcIixcbiAgICBcIkFsdC1EXCI6IFwiZGVsV29yZEFmdGVyXCIsXG4gICAgXCJBbHQtQmFja3NwYWNlXCI6IFwiZGVsV29yZEJlZm9yZVwiLFxuICAgIFwiQ3RybC1LXCI6IFwia2lsbExpbmVcIixcbiAgICBcIkN0cmwtVFwiOiBcInRyYW5zcG9zZUNoYXJzXCIsXG4gICAgXCJDdHJsLU9cIjogXCJvcGVuTGluZVwiXG4gIH07XG4gIGtleU1hcC5tYWNEZWZhdWx0ID0ge1xuICAgIFwiQ21kLUFcIjogXCJzZWxlY3RBbGxcIixcbiAgICBcIkNtZC1EXCI6IFwiZGVsZXRlTGluZVwiLFxuICAgIFwiQ21kLVpcIjogXCJ1bmRvXCIsXG4gICAgXCJTaGlmdC1DbWQtWlwiOiBcInJlZG9cIixcbiAgICBcIkNtZC1ZXCI6IFwicmVkb1wiLFxuICAgIFwiQ21kLUhvbWVcIjogXCJnb0RvY1N0YXJ0XCIsXG4gICAgXCJDbWQtVXBcIjogXCJnb0RvY1N0YXJ0XCIsXG4gICAgXCJDbWQtRW5kXCI6IFwiZ29Eb2NFbmRcIixcbiAgICBcIkNtZC1Eb3duXCI6IFwiZ29Eb2NFbmRcIixcbiAgICBcIkFsdC1MZWZ0XCI6IFwiZ29Hcm91cExlZnRcIixcbiAgICBcIkFsdC1SaWdodFwiOiBcImdvR3JvdXBSaWdodFwiLFxuICAgIFwiQ21kLUxlZnRcIjogXCJnb0xpbmVMZWZ0XCIsXG4gICAgXCJDbWQtUmlnaHRcIjogXCJnb0xpbmVSaWdodFwiLFxuICAgIFwiQWx0LUJhY2tzcGFjZVwiOiBcImRlbEdyb3VwQmVmb3JlXCIsXG4gICAgXCJDdHJsLUFsdC1CYWNrc3BhY2VcIjogXCJkZWxHcm91cEFmdGVyXCIsXG4gICAgXCJBbHQtRGVsZXRlXCI6IFwiZGVsR3JvdXBBZnRlclwiLFxuICAgIFwiQ21kLVNcIjogXCJzYXZlXCIsXG4gICAgXCJDbWQtRlwiOiBcImZpbmRcIixcbiAgICBcIkNtZC1HXCI6IFwiZmluZE5leHRcIixcbiAgICBcIlNoaWZ0LUNtZC1HXCI6IFwiZmluZFByZXZcIixcbiAgICBcIkNtZC1BbHQtRlwiOiBcInJlcGxhY2VcIixcbiAgICBcIlNoaWZ0LUNtZC1BbHQtRlwiOiBcInJlcGxhY2VBbGxcIixcbiAgICBcIkNtZC1bXCI6IFwiaW5kZW50TGVzc1wiLFxuICAgIFwiQ21kLV1cIjogXCJpbmRlbnRNb3JlXCIsXG4gICAgXCJDbWQtQmFja3NwYWNlXCI6IFwiZGVsV3JhcHBlZExpbmVMZWZ0XCIsXG4gICAgXCJDbWQtRGVsZXRlXCI6IFwiZGVsV3JhcHBlZExpbmVSaWdodFwiLFxuICAgIFwiQ21kLVVcIjogXCJ1bmRvU2VsZWN0aW9uXCIsXG4gICAgXCJTaGlmdC1DbWQtVVwiOiBcInJlZG9TZWxlY3Rpb25cIixcbiAgICBcIkN0cmwtVXBcIjogXCJnb0RvY1N0YXJ0XCIsXG4gICAgXCJDdHJsLURvd25cIjogXCJnb0RvY0VuZFwiLFxuICAgIGZhbGx0aHJvdWdoOiBbXCJiYXNpY1wiLCBcImVtYWNzeVwiXVxuICB9O1xuICBrZXlNYXBbXCJkZWZhdWx0XCJdID0gbWFjID8ga2V5TWFwLm1hY0RlZmF1bHQgOiBrZXlNYXAucGNEZWZhdWx0OyAvLyBLRVlNQVAgRElTUEFUQ0hcblxuICBmdW5jdGlvbiBub3JtYWxpemVLZXlOYW1lKG5hbWUpIHtcbiAgICB2YXIgcGFydHMgPSBuYW1lLnNwbGl0KC8tKD8hJCkvKTtcbiAgICBuYW1lID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG4gICAgdmFyIGFsdCwgY3RybCwgc2hpZnQsIGNtZDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICB2YXIgbW9kID0gcGFydHNbaV07XG5cbiAgICAgIGlmICgvXihjbWR8bWV0YXxtKSQvaS50ZXN0KG1vZCkpIHtcbiAgICAgICAgY21kID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoL15hKGx0KT8kL2kudGVzdChtb2QpKSB7XG4gICAgICAgIGFsdCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKC9eKGN8Y3RybHxjb250cm9sKSQvaS50ZXN0KG1vZCkpIHtcbiAgICAgICAgY3RybCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKC9ecyhoaWZ0KT8kL2kudGVzdChtb2QpKSB7XG4gICAgICAgIHNoaWZ0ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVucmVjb2duaXplZCBtb2RpZmllciBuYW1lOiBcIiArIG1vZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFsdCkge1xuICAgICAgbmFtZSA9IFwiQWx0LVwiICsgbmFtZTtcbiAgICB9XG5cbiAgICBpZiAoY3RybCkge1xuICAgICAgbmFtZSA9IFwiQ3RybC1cIiArIG5hbWU7XG4gICAgfVxuXG4gICAgaWYgKGNtZCkge1xuICAgICAgbmFtZSA9IFwiQ21kLVwiICsgbmFtZTtcbiAgICB9XG5cbiAgICBpZiAoc2hpZnQpIHtcbiAgICAgIG5hbWUgPSBcIlNoaWZ0LVwiICsgbmFtZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmFtZTtcbiAgfSAvLyBUaGlzIGlzIGEga2x1ZGdlIHRvIGtlZXAga2V5bWFwcyBtb3N0bHkgd29ya2luZyBhcyByYXcgb2JqZWN0c1xuICAvLyAoYmFja3dhcmRzIGNvbXBhdGliaWxpdHkpIHdoaWxlIGF0IHRoZSBzYW1lIHRpbWUgc3VwcG9ydCBmZWF0dXJlc1xuICAvLyBsaWtlIG5vcm1hbGl6YXRpb24gYW5kIG11bHRpLXN0cm9rZSBrZXkgYmluZGluZ3MuIEl0IGNvbXBpbGVzIGFcbiAgLy8gbmV3IG5vcm1hbGl6ZWQga2V5bWFwLCBhbmQgdGhlbiB1cGRhdGVzIHRoZSBvbGQgb2JqZWN0IHRvIHJlZmxlY3RcbiAgLy8gdGhpcy5cblxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZUtleU1hcChrZXltYXApIHtcbiAgICB2YXIgY29weSA9IHt9O1xuXG4gICAgZm9yICh2YXIga2V5bmFtZSBpbiBrZXltYXApIHtcbiAgICAgIGlmIChrZXltYXAuaGFzT3duUHJvcGVydHkoa2V5bmFtZSkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0ga2V5bWFwW2tleW5hbWVdO1xuXG4gICAgICAgIGlmICgvXihuYW1lfGZhbGx0aHJvdWdofChkZXxhdCl0YWNoKSQvLnRlc3Qoa2V5bmFtZSkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZSA9PSBcIi4uLlwiKSB7XG4gICAgICAgICAgZGVsZXRlIGtleW1hcFtrZXluYW1lXTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBrZXlzID0gbWFwKGtleW5hbWUuc3BsaXQoXCIgXCIpLCBub3JtYWxpemVLZXlOYW1lKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgdmFsID0gdm9pZCAwLFxuICAgICAgICAgICAgICBuYW1lID0gdm9pZCAwO1xuXG4gICAgICAgICAgaWYgKGkgPT0ga2V5cy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBuYW1lID0ga2V5cy5qb2luKFwiIFwiKTtcbiAgICAgICAgICAgIHZhbCA9IHZhbHVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuYW1lID0ga2V5cy5zbGljZSgwLCBpICsgMSkuam9pbihcIiBcIik7XG4gICAgICAgICAgICB2YWwgPSBcIi4uLlwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBwcmV2ID0gY29weVtuYW1lXTtcblxuICAgICAgICAgIGlmICghcHJldikge1xuICAgICAgICAgICAgY29weVtuYW1lXSA9IHZhbDtcbiAgICAgICAgICB9IGVsc2UgaWYgKHByZXYgIT0gdmFsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbmNvbnNpc3RlbnQgYmluZGluZ3MgZm9yIFwiICsgbmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGVsZXRlIGtleW1hcFtrZXluYW1lXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBwcm9wIGluIGNvcHkpIHtcbiAgICAgIGtleW1hcFtwcm9wXSA9IGNvcHlbcHJvcF07XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleW1hcDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvb2t1cEtleShrZXksIG1hcCwgaGFuZGxlLCBjb250ZXh0KSB7XG4gICAgbWFwID0gZ2V0S2V5TWFwKG1hcCk7XG4gICAgdmFyIGZvdW5kID0gbWFwLmNhbGwgPyBtYXAuY2FsbChrZXksIGNvbnRleHQpIDogbWFwW2tleV07XG5cbiAgICBpZiAoZm91bmQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gXCJub3RoaW5nXCI7XG4gICAgfVxuXG4gICAgaWYgKGZvdW5kID09PSBcIi4uLlwiKSB7XG4gICAgICByZXR1cm4gXCJtdWx0aVwiO1xuICAgIH1cblxuICAgIGlmIChmb3VuZCAhPSBudWxsICYmIGhhbmRsZShmb3VuZCkpIHtcbiAgICAgIHJldHVybiBcImhhbmRsZWRcIjtcbiAgICB9XG5cbiAgICBpZiAobWFwLmZhbGx0aHJvdWdoKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG1hcC5mYWxsdGhyb3VnaCkgIT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgICAgIHJldHVybiBsb29rdXBLZXkoa2V5LCBtYXAuZmFsbHRocm91Z2gsIGhhbmRsZSwgY29udGV4dCk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWFwLmZhbGx0aHJvdWdoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBsb29rdXBLZXkoa2V5LCBtYXAuZmFsbHRocm91Z2hbaV0sIGhhbmRsZSwgY29udGV4dCk7XG5cbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gLy8gTW9kaWZpZXIga2V5IHByZXNzZXMgZG9uJ3QgY291bnQgYXMgJ3JlYWwnIGtleSBwcmVzc2VzIGZvciB0aGVcbiAgLy8gcHVycG9zZSBvZiBrZXltYXAgZmFsbHRocm91Z2guXG5cblxuICBmdW5jdGlvbiBpc01vZGlmaWVyS2V5KHZhbHVlKSB7XG4gICAgdmFyIG5hbWUgPSB0eXBlb2YgdmFsdWUgPT0gXCJzdHJpbmdcIiA/IHZhbHVlIDoga2V5TmFtZXNbdmFsdWUua2V5Q29kZV07XG4gICAgcmV0dXJuIG5hbWUgPT0gXCJDdHJsXCIgfHwgbmFtZSA9PSBcIkFsdFwiIHx8IG5hbWUgPT0gXCJTaGlmdFwiIHx8IG5hbWUgPT0gXCJNb2RcIjtcbiAgfSAvLyBMb29rIHVwIHRoZSBuYW1lIG9mIGEga2V5IGFzIGluZGljYXRlZCBieSBhbiBldmVudCBvYmplY3QuXG5cblxuICBmdW5jdGlvbiBrZXlOYW1lKGV2ZW50LCBub1NoaWZ0KSB7XG4gICAgaWYgKHByZXN0byAmJiBldmVudC5rZXlDb2RlID09IDM0ICYmIGV2ZW50W1wiY2hhclwiXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBiYXNlID0ga2V5TmFtZXNbZXZlbnQua2V5Q29kZV0sXG4gICAgICAgIG5hbWUgPSBiYXNlO1xuXG4gICAgaWYgKG5hbWUgPT0gbnVsbCB8fCBldmVudC5hbHRHcmFwaEtleSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChldmVudC5hbHRLZXkgJiYgYmFzZSAhPSBcIkFsdFwiKSB7XG4gICAgICBuYW1lID0gXCJBbHQtXCIgKyBuYW1lO1xuICAgIH1cblxuICAgIGlmICgoZmxpcEN0cmxDbWQgPyBldmVudC5tZXRhS2V5IDogZXZlbnQuY3RybEtleSkgJiYgYmFzZSAhPSBcIkN0cmxcIikge1xuICAgICAgbmFtZSA9IFwiQ3RybC1cIiArIG5hbWU7XG4gICAgfVxuXG4gICAgaWYgKChmbGlwQ3RybENtZCA/IGV2ZW50LmN0cmxLZXkgOiBldmVudC5tZXRhS2V5KSAmJiBiYXNlICE9IFwiQ21kXCIpIHtcbiAgICAgIG5hbWUgPSBcIkNtZC1cIiArIG5hbWU7XG4gICAgfVxuXG4gICAgaWYgKCFub1NoaWZ0ICYmIGV2ZW50LnNoaWZ0S2V5ICYmIGJhc2UgIT0gXCJTaGlmdFwiKSB7XG4gICAgICBuYW1lID0gXCJTaGlmdC1cIiArIG5hbWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRLZXlNYXAodmFsKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWwgPT0gXCJzdHJpbmdcIiA/IGtleU1hcFt2YWxdIDogdmFsO1xuICB9IC8vIEhlbHBlciBmb3IgZGVsZXRpbmcgdGV4dCBuZWFyIHRoZSBzZWxlY3Rpb24ocyksIHVzZWQgdG8gaW1wbGVtZW50XG4gIC8vIGJhY2tzcGFjZSwgZGVsZXRlLCBhbmQgc2ltaWxhciBmdW5jdGlvbmFsaXR5LlxuXG5cbiAgZnVuY3Rpb24gZGVsZXRlTmVhclNlbGVjdGlvbihjbSwgY29tcHV0ZSkge1xuICAgIHZhciByYW5nZXMgPSBjbS5kb2Muc2VsLnJhbmdlcyxcbiAgICAgICAga2lsbCA9IFtdOyAvLyBCdWlsZCB1cCBhIHNldCBvZiByYW5nZXMgdG8ga2lsbCBmaXJzdCwgbWVyZ2luZyBvdmVybGFwcGluZ1xuICAgIC8vIHJhbmdlcy5cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdG9LaWxsID0gY29tcHV0ZShyYW5nZXNbaV0pO1xuXG4gICAgICB3aGlsZSAoa2lsbC5sZW5ndGggJiYgY21wKHRvS2lsbC5mcm9tLCBsc3Qoa2lsbCkudG8pIDw9IDApIHtcbiAgICAgICAgdmFyIHJlcGxhY2VkID0ga2lsbC5wb3AoKTtcblxuICAgICAgICBpZiAoY21wKHJlcGxhY2VkLmZyb20sIHRvS2lsbC5mcm9tKSA8IDApIHtcbiAgICAgICAgICB0b0tpbGwuZnJvbSA9IHJlcGxhY2VkLmZyb207XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAga2lsbC5wdXNoKHRvS2lsbCk7XG4gICAgfSAvLyBOZXh0LCByZW1vdmUgdGhvc2UgYWN0dWFsIHJhbmdlcy5cblxuXG4gICAgcnVuSW5PcChjbSwgZnVuY3Rpb24gKCkge1xuICAgICAgZm9yICh2YXIgaSA9IGtpbGwubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgX3JlcGxhY2VSYW5nZShjbS5kb2MsIFwiXCIsIGtpbGxbaV0uZnJvbSwga2lsbFtpXS50bywgXCIrZGVsZXRlXCIpO1xuICAgICAgfVxuXG4gICAgICBlbnN1cmVDdXJzb3JWaXNpYmxlKGNtKTtcbiAgICB9KTtcbiAgfSAvLyBDb21tYW5kcyBhcmUgcGFyYW1ldGVyLWxlc3MgYWN0aW9ucyB0aGF0IGNhbiBiZSBwZXJmb3JtZWQgb24gYW5cbiAgLy8gZWRpdG9yLCBtb3N0bHkgdXNlZCBmb3Iga2V5YmluZGluZ3MuXG5cblxuICB2YXIgY29tbWFuZHMgPSB7XG4gICAgc2VsZWN0QWxsOiBzZWxlY3RBbGwsXG4gICAgc2luZ2xlU2VsZWN0aW9uOiBmdW5jdGlvbiBzaW5nbGVTZWxlY3Rpb24oY20pIHtcbiAgICAgIHJldHVybiBjbS5zZXRTZWxlY3Rpb24oY20uZ2V0Q3Vyc29yKFwiYW5jaG9yXCIpLCBjbS5nZXRDdXJzb3IoXCJoZWFkXCIpLCBzZWxfZG9udFNjcm9sbCk7XG4gICAgfSxcbiAgICBraWxsTGluZTogZnVuY3Rpb24ga2lsbExpbmUoY20pIHtcbiAgICAgIHJldHVybiBkZWxldGVOZWFyU2VsZWN0aW9uKGNtLCBmdW5jdGlvbiAocmFuZ2UpIHtcbiAgICAgICAgaWYgKHJhbmdlLmVtcHR5KCkpIHtcbiAgICAgICAgICB2YXIgbGVuID0gZ2V0TGluZShjbS5kb2MsIHJhbmdlLmhlYWQubGluZSkudGV4dC5sZW5ndGg7XG5cbiAgICAgICAgICBpZiAocmFuZ2UuaGVhZC5jaCA9PSBsZW4gJiYgcmFuZ2UuaGVhZC5saW5lIDwgY20ubGFzdExpbmUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgZnJvbTogcmFuZ2UuaGVhZCxcbiAgICAgICAgICAgICAgdG86IFBvcyhyYW5nZS5oZWFkLmxpbmUgKyAxLCAwKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgZnJvbTogcmFuZ2UuaGVhZCxcbiAgICAgICAgICAgICAgdG86IFBvcyhyYW5nZS5oZWFkLmxpbmUsIGxlbilcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmcm9tOiByYW5nZS5mcm9tKCksXG4gICAgICAgICAgICB0bzogcmFuZ2UudG8oKVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZGVsZXRlTGluZTogZnVuY3Rpb24gZGVsZXRlTGluZShjbSkge1xuICAgICAgcmV0dXJuIGRlbGV0ZU5lYXJTZWxlY3Rpb24oY20sIGZ1bmN0aW9uIChyYW5nZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGZyb206IFBvcyhyYW5nZS5mcm9tKCkubGluZSwgMCksXG4gICAgICAgICAgdG86IF9jbGlwUG9zKGNtLmRvYywgUG9zKHJhbmdlLnRvKCkubGluZSArIDEsIDApKVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBkZWxMaW5lTGVmdDogZnVuY3Rpb24gZGVsTGluZUxlZnQoY20pIHtcbiAgICAgIHJldHVybiBkZWxldGVOZWFyU2VsZWN0aW9uKGNtLCBmdW5jdGlvbiAocmFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBmcm9tOiBQb3MocmFuZ2UuZnJvbSgpLmxpbmUsIDApLFxuICAgICAgICAgIHRvOiByYW5nZS5mcm9tKClcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZGVsV3JhcHBlZExpbmVMZWZ0OiBmdW5jdGlvbiBkZWxXcmFwcGVkTGluZUxlZnQoY20pIHtcbiAgICAgIHJldHVybiBkZWxldGVOZWFyU2VsZWN0aW9uKGNtLCBmdW5jdGlvbiAocmFuZ2UpIHtcbiAgICAgICAgdmFyIHRvcCA9IGNtLmNoYXJDb29yZHMocmFuZ2UuaGVhZCwgXCJkaXZcIikudG9wICsgNTtcbiAgICAgICAgdmFyIGxlZnRQb3MgPSBjbS5jb29yZHNDaGFyKHtcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgIH0sIFwiZGl2XCIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGZyb206IGxlZnRQb3MsXG4gICAgICAgICAgdG86IHJhbmdlLmZyb20oKVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBkZWxXcmFwcGVkTGluZVJpZ2h0OiBmdW5jdGlvbiBkZWxXcmFwcGVkTGluZVJpZ2h0KGNtKSB7XG4gICAgICByZXR1cm4gZGVsZXRlTmVhclNlbGVjdGlvbihjbSwgZnVuY3Rpb24gKHJhbmdlKSB7XG4gICAgICAgIHZhciB0b3AgPSBjbS5jaGFyQ29vcmRzKHJhbmdlLmhlYWQsIFwiZGl2XCIpLnRvcCArIDU7XG4gICAgICAgIHZhciByaWdodFBvcyA9IGNtLmNvb3Jkc0NoYXIoe1xuICAgICAgICAgIGxlZnQ6IGNtLmRpc3BsYXkubGluZURpdi5vZmZzZXRXaWR0aCArIDEwMCxcbiAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9LCBcImRpdlwiKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBmcm9tOiByYW5nZS5mcm9tKCksXG4gICAgICAgICAgdG86IHJpZ2h0UG9zXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHVuZG86IGZ1bmN0aW9uIHVuZG8oY20pIHtcbiAgICAgIHJldHVybiBjbS51bmRvKCk7XG4gICAgfSxcbiAgICByZWRvOiBmdW5jdGlvbiByZWRvKGNtKSB7XG4gICAgICByZXR1cm4gY20ucmVkbygpO1xuICAgIH0sXG4gICAgdW5kb1NlbGVjdGlvbjogZnVuY3Rpb24gdW5kb1NlbGVjdGlvbihjbSkge1xuICAgICAgcmV0dXJuIGNtLnVuZG9TZWxlY3Rpb24oKTtcbiAgICB9LFxuICAgIHJlZG9TZWxlY3Rpb246IGZ1bmN0aW9uIHJlZG9TZWxlY3Rpb24oY20pIHtcbiAgICAgIHJldHVybiBjbS5yZWRvU2VsZWN0aW9uKCk7XG4gICAgfSxcbiAgICBnb0RvY1N0YXJ0OiBmdW5jdGlvbiBnb0RvY1N0YXJ0KGNtKSB7XG4gICAgICByZXR1cm4gY20uZXh0ZW5kU2VsZWN0aW9uKFBvcyhjbS5maXJzdExpbmUoKSwgMCkpO1xuICAgIH0sXG4gICAgZ29Eb2NFbmQ6IGZ1bmN0aW9uIGdvRG9jRW5kKGNtKSB7XG4gICAgICByZXR1cm4gY20uZXh0ZW5kU2VsZWN0aW9uKFBvcyhjbS5sYXN0TGluZSgpKSk7XG4gICAgfSxcbiAgICBnb0xpbmVTdGFydDogZnVuY3Rpb24gZ29MaW5lU3RhcnQoY20pIHtcbiAgICAgIHJldHVybiBjbS5leHRlbmRTZWxlY3Rpb25zQnkoZnVuY3Rpb24gKHJhbmdlKSB7XG4gICAgICAgIHJldHVybiBsaW5lU3RhcnQoY20sIHJhbmdlLmhlYWQubGluZSk7XG4gICAgICB9LCB7XG4gICAgICAgIG9yaWdpbjogXCIrbW92ZVwiLFxuICAgICAgICBiaWFzOiAxXG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdvTGluZVN0YXJ0U21hcnQ6IGZ1bmN0aW9uIGdvTGluZVN0YXJ0U21hcnQoY20pIHtcbiAgICAgIHJldHVybiBjbS5leHRlbmRTZWxlY3Rpb25zQnkoZnVuY3Rpb24gKHJhbmdlKSB7XG4gICAgICAgIHJldHVybiBsaW5lU3RhcnRTbWFydChjbSwgcmFuZ2UuaGVhZCk7XG4gICAgICB9LCB7XG4gICAgICAgIG9yaWdpbjogXCIrbW92ZVwiLFxuICAgICAgICBiaWFzOiAxXG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdvTGluZUVuZDogZnVuY3Rpb24gZ29MaW5lRW5kKGNtKSB7XG4gICAgICByZXR1cm4gY20uZXh0ZW5kU2VsZWN0aW9uc0J5KGZ1bmN0aW9uIChyYW5nZSkge1xuICAgICAgICByZXR1cm4gbGluZUVuZChjbSwgcmFuZ2UuaGVhZC5saW5lKTtcbiAgICAgIH0sIHtcbiAgICAgICAgb3JpZ2luOiBcIittb3ZlXCIsXG4gICAgICAgIGJpYXM6IC0xXG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdvTGluZVJpZ2h0OiBmdW5jdGlvbiBnb0xpbmVSaWdodChjbSkge1xuICAgICAgcmV0dXJuIGNtLmV4dGVuZFNlbGVjdGlvbnNCeShmdW5jdGlvbiAocmFuZ2UpIHtcbiAgICAgICAgdmFyIHRvcCA9IGNtLmNoYXJDb29yZHMocmFuZ2UuaGVhZCwgXCJkaXZcIikudG9wICsgNTtcbiAgICAgICAgcmV0dXJuIGNtLmNvb3Jkc0NoYXIoe1xuICAgICAgICAgIGxlZnQ6IGNtLmRpc3BsYXkubGluZURpdi5vZmZzZXRXaWR0aCArIDEwMCxcbiAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9LCBcImRpdlwiKTtcbiAgICAgIH0sIHNlbF9tb3ZlKTtcbiAgICB9LFxuICAgIGdvTGluZUxlZnQ6IGZ1bmN0aW9uIGdvTGluZUxlZnQoY20pIHtcbiAgICAgIHJldHVybiBjbS5leHRlbmRTZWxlY3Rpb25zQnkoZnVuY3Rpb24gKHJhbmdlKSB7XG4gICAgICAgIHZhciB0b3AgPSBjbS5jaGFyQ29vcmRzKHJhbmdlLmhlYWQsIFwiZGl2XCIpLnRvcCArIDU7XG4gICAgICAgIHJldHVybiBjbS5jb29yZHNDaGFyKHtcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgIH0sIFwiZGl2XCIpO1xuICAgICAgfSwgc2VsX21vdmUpO1xuICAgIH0sXG4gICAgZ29MaW5lTGVmdFNtYXJ0OiBmdW5jdGlvbiBnb0xpbmVMZWZ0U21hcnQoY20pIHtcbiAgICAgIHJldHVybiBjbS5leHRlbmRTZWxlY3Rpb25zQnkoZnVuY3Rpb24gKHJhbmdlKSB7XG4gICAgICAgIHZhciB0b3AgPSBjbS5jaGFyQ29vcmRzKHJhbmdlLmhlYWQsIFwiZGl2XCIpLnRvcCArIDU7XG4gICAgICAgIHZhciBwb3MgPSBjbS5jb29yZHNDaGFyKHtcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgIH0sIFwiZGl2XCIpO1xuXG4gICAgICAgIGlmIChwb3MuY2ggPCBjbS5nZXRMaW5lKHBvcy5saW5lKS5zZWFyY2goL1xcUy8pKSB7XG4gICAgICAgICAgcmV0dXJuIGxpbmVTdGFydFNtYXJ0KGNtLCByYW5nZS5oZWFkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgICB9LCBzZWxfbW92ZSk7XG4gICAgfSxcbiAgICBnb0xpbmVVcDogZnVuY3Rpb24gZ29MaW5lVXAoY20pIHtcbiAgICAgIHJldHVybiBjbS5tb3ZlVigtMSwgXCJsaW5lXCIpO1xuICAgIH0sXG4gICAgZ29MaW5lRG93bjogZnVuY3Rpb24gZ29MaW5lRG93bihjbSkge1xuICAgICAgcmV0dXJuIGNtLm1vdmVWKDEsIFwibGluZVwiKTtcbiAgICB9LFxuICAgIGdvUGFnZVVwOiBmdW5jdGlvbiBnb1BhZ2VVcChjbSkge1xuICAgICAgcmV0dXJuIGNtLm1vdmVWKC0xLCBcInBhZ2VcIik7XG4gICAgfSxcbiAgICBnb1BhZ2VEb3duOiBmdW5jdGlvbiBnb1BhZ2VEb3duKGNtKSB7XG4gICAgICByZXR1cm4gY20ubW92ZVYoMSwgXCJwYWdlXCIpO1xuICAgIH0sXG4gICAgZ29DaGFyTGVmdDogZnVuY3Rpb24gZ29DaGFyTGVmdChjbSkge1xuICAgICAgcmV0dXJuIGNtLm1vdmVIKC0xLCBcImNoYXJcIik7XG4gICAgfSxcbiAgICBnb0NoYXJSaWdodDogZnVuY3Rpb24gZ29DaGFyUmlnaHQoY20pIHtcbiAgICAgIHJldHVybiBjbS5tb3ZlSCgxLCBcImNoYXJcIik7XG4gICAgfSxcbiAgICBnb0NvbHVtbkxlZnQ6IGZ1bmN0aW9uIGdvQ29sdW1uTGVmdChjbSkge1xuICAgICAgcmV0dXJuIGNtLm1vdmVIKC0xLCBcImNvbHVtblwiKTtcbiAgICB9LFxuICAgIGdvQ29sdW1uUmlnaHQ6IGZ1bmN0aW9uIGdvQ29sdW1uUmlnaHQoY20pIHtcbiAgICAgIHJldHVybiBjbS5tb3ZlSCgxLCBcImNvbHVtblwiKTtcbiAgICB9LFxuICAgIGdvV29yZExlZnQ6IGZ1bmN0aW9uIGdvV29yZExlZnQoY20pIHtcbiAgICAgIHJldHVybiBjbS5tb3ZlSCgtMSwgXCJ3b3JkXCIpO1xuICAgIH0sXG4gICAgZ29Hcm91cFJpZ2h0OiBmdW5jdGlvbiBnb0dyb3VwUmlnaHQoY20pIHtcbiAgICAgIHJldHVybiBjbS5tb3ZlSCgxLCBcImdyb3VwXCIpO1xuICAgIH0sXG4gICAgZ29Hcm91cExlZnQ6IGZ1bmN0aW9uIGdvR3JvdXBMZWZ0KGNtKSB7XG4gICAgICByZXR1cm4gY20ubW92ZUgoLTEsIFwiZ3JvdXBcIik7XG4gICAgfSxcbiAgICBnb1dvcmRSaWdodDogZnVuY3Rpb24gZ29Xb3JkUmlnaHQoY20pIHtcbiAgICAgIHJldHVybiBjbS5tb3ZlSCgxLCBcIndvcmRcIik7XG4gICAgfSxcbiAgICBkZWxDaGFyQmVmb3JlOiBmdW5jdGlvbiBkZWxDaGFyQmVmb3JlKGNtKSB7XG4gICAgICByZXR1cm4gY20uZGVsZXRlSCgtMSwgXCJjaGFyXCIpO1xuICAgIH0sXG4gICAgZGVsQ2hhckFmdGVyOiBmdW5jdGlvbiBkZWxDaGFyQWZ0ZXIoY20pIHtcbiAgICAgIHJldHVybiBjbS5kZWxldGVIKDEsIFwiY2hhclwiKTtcbiAgICB9LFxuICAgIGRlbFdvcmRCZWZvcmU6IGZ1bmN0aW9uIGRlbFdvcmRCZWZvcmUoY20pIHtcbiAgICAgIHJldHVybiBjbS5kZWxldGVIKC0xLCBcIndvcmRcIik7XG4gICAgfSxcbiAgICBkZWxXb3JkQWZ0ZXI6IGZ1bmN0aW9uIGRlbFdvcmRBZnRlcihjbSkge1xuICAgICAgcmV0dXJuIGNtLmRlbGV0ZUgoMSwgXCJ3b3JkXCIpO1xuICAgIH0sXG4gICAgZGVsR3JvdXBCZWZvcmU6IGZ1bmN0aW9uIGRlbEdyb3VwQmVmb3JlKGNtKSB7XG4gICAgICByZXR1cm4gY20uZGVsZXRlSCgtMSwgXCJncm91cFwiKTtcbiAgICB9LFxuICAgIGRlbEdyb3VwQWZ0ZXI6IGZ1bmN0aW9uIGRlbEdyb3VwQWZ0ZXIoY20pIHtcbiAgICAgIHJldHVybiBjbS5kZWxldGVIKDEsIFwiZ3JvdXBcIik7XG4gICAgfSxcbiAgICBpbmRlbnRBdXRvOiBmdW5jdGlvbiBpbmRlbnRBdXRvKGNtKSB7XG4gICAgICByZXR1cm4gY20uaW5kZW50U2VsZWN0aW9uKFwic21hcnRcIik7XG4gICAgfSxcbiAgICBpbmRlbnRNb3JlOiBmdW5jdGlvbiBpbmRlbnRNb3JlKGNtKSB7XG4gICAgICByZXR1cm4gY20uaW5kZW50U2VsZWN0aW9uKFwiYWRkXCIpO1xuICAgIH0sXG4gICAgaW5kZW50TGVzczogZnVuY3Rpb24gaW5kZW50TGVzcyhjbSkge1xuICAgICAgcmV0dXJuIGNtLmluZGVudFNlbGVjdGlvbihcInN1YnRyYWN0XCIpO1xuICAgIH0sXG4gICAgaW5zZXJ0VGFiOiBmdW5jdGlvbiBpbnNlcnRUYWIoY20pIHtcbiAgICAgIHJldHVybiBjbS5yZXBsYWNlU2VsZWN0aW9uKFwiXFx0XCIpO1xuICAgIH0sXG4gICAgaW5zZXJ0U29mdFRhYjogZnVuY3Rpb24gaW5zZXJ0U29mdFRhYihjbSkge1xuICAgICAgdmFyIHNwYWNlcyA9IFtdLFxuICAgICAgICAgIHJhbmdlcyA9IGNtLmxpc3RTZWxlY3Rpb25zKCksXG4gICAgICAgICAgdGFiU2l6ZSA9IGNtLm9wdGlvbnMudGFiU2l6ZTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHBvcyA9IHJhbmdlc1tpXS5mcm9tKCk7XG4gICAgICAgIHZhciBjb2wgPSBjb3VudENvbHVtbihjbS5nZXRMaW5lKHBvcy5saW5lKSwgcG9zLmNoLCB0YWJTaXplKTtcbiAgICAgICAgc3BhY2VzLnB1c2goc3BhY2VTdHIodGFiU2l6ZSAtIGNvbCAlIHRhYlNpemUpKTtcbiAgICAgIH1cblxuICAgICAgY20ucmVwbGFjZVNlbGVjdGlvbnMoc3BhY2VzKTtcbiAgICB9LFxuICAgIGRlZmF1bHRUYWI6IGZ1bmN0aW9uIGRlZmF1bHRUYWIoY20pIHtcbiAgICAgIGlmIChjbS5zb21ldGhpbmdTZWxlY3RlZCgpKSB7XG4gICAgICAgIGNtLmluZGVudFNlbGVjdGlvbihcImFkZFwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNtLmV4ZWNDb21tYW5kKFwiaW5zZXJ0VGFiXCIpO1xuICAgICAgfVxuICAgIH0sXG4gICAgLy8gU3dhcCB0aGUgdHdvIGNoYXJzIGxlZnQgYW5kIHJpZ2h0IG9mIGVhY2ggc2VsZWN0aW9uJ3MgaGVhZC5cbiAgICAvLyBNb3ZlIGN1cnNvciBiZWhpbmQgdGhlIHR3byBzd2FwcGVkIGNoYXJhY3RlcnMgYWZ0ZXJ3YXJkcy5cbiAgICAvL1xuICAgIC8vIERvZXNuJ3QgY29uc2lkZXIgbGluZSBmZWVkcyBhIGNoYXJhY3Rlci5cbiAgICAvLyBEb2Vzbid0IHNjYW4gbW9yZSB0aGFuIG9uZSBsaW5lIGFib3ZlIHRvIGZpbmQgYSBjaGFyYWN0ZXIuXG4gICAgLy8gRG9lc24ndCBkbyBhbnl0aGluZyBvbiBhbiBlbXB0eSBsaW5lLlxuICAgIC8vIERvZXNuJ3QgZG8gYW55dGhpbmcgd2l0aCBub24tZW1wdHkgc2VsZWN0aW9ucy5cbiAgICB0cmFuc3Bvc2VDaGFyczogZnVuY3Rpb24gdHJhbnNwb3NlQ2hhcnMoY20pIHtcbiAgICAgIHJldHVybiBydW5Jbk9wKGNtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByYW5nZXMgPSBjbS5saXN0U2VsZWN0aW9ucygpLFxuICAgICAgICAgICAgbmV3U2VsID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoIXJhbmdlc1tpXS5lbXB0eSgpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgY3VyID0gcmFuZ2VzW2ldLmhlYWQsXG4gICAgICAgICAgICAgIGxpbmUgPSBnZXRMaW5lKGNtLmRvYywgY3VyLmxpbmUpLnRleHQ7XG5cbiAgICAgICAgICBpZiAobGluZSkge1xuICAgICAgICAgICAgaWYgKGN1ci5jaCA9PSBsaW5lLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjdXIgPSBuZXcgUG9zKGN1ci5saW5lLCBjdXIuY2ggLSAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGN1ci5jaCA+IDApIHtcbiAgICAgICAgICAgICAgY3VyID0gbmV3IFBvcyhjdXIubGluZSwgY3VyLmNoICsgMSk7XG4gICAgICAgICAgICAgIGNtLnJlcGxhY2VSYW5nZShsaW5lLmNoYXJBdChjdXIuY2ggLSAxKSArIGxpbmUuY2hhckF0KGN1ci5jaCAtIDIpLCBQb3MoY3VyLmxpbmUsIGN1ci5jaCAtIDIpLCBjdXIsIFwiK3RyYW5zcG9zZVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VyLmxpbmUgPiBjbS5kb2MuZmlyc3QpIHtcbiAgICAgICAgICAgICAgdmFyIHByZXYgPSBnZXRMaW5lKGNtLmRvYywgY3VyLmxpbmUgLSAxKS50ZXh0O1xuXG4gICAgICAgICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgICAgICAgY3VyID0gbmV3IFBvcyhjdXIubGluZSwgMSk7XG4gICAgICAgICAgICAgICAgY20ucmVwbGFjZVJhbmdlKGxpbmUuY2hhckF0KDApICsgY20uZG9jLmxpbmVTZXBhcmF0b3IoKSArIHByZXYuY2hhckF0KHByZXYubGVuZ3RoIC0gMSksIFBvcyhjdXIubGluZSAtIDEsIHByZXYubGVuZ3RoIC0gMSksIGN1ciwgXCIrdHJhbnNwb3NlXCIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV3U2VsLnB1c2gobmV3IFJhbmdlKGN1ciwgY3VyKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjbS5zZXRTZWxlY3Rpb25zKG5ld1NlbCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIG5ld2xpbmVBbmRJbmRlbnQ6IGZ1bmN0aW9uIG5ld2xpbmVBbmRJbmRlbnQoY20pIHtcbiAgICAgIHJldHVybiBydW5Jbk9wKGNtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxzID0gY20ubGlzdFNlbGVjdGlvbnMoKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gc2Vscy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGNtLnJlcGxhY2VSYW5nZShjbS5kb2MubGluZVNlcGFyYXRvcigpLCBzZWxzW2ldLmFuY2hvciwgc2Vsc1tpXS5oZWFkLCBcIitpbnB1dFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbHMgPSBjbS5saXN0U2VsZWN0aW9ucygpO1xuXG4gICAgICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IHNlbHMubGVuZ3RoOyBpJDErKykge1xuICAgICAgICAgIGNtLmluZGVudExpbmUoc2Vsc1tpJDFdLmZyb20oKS5saW5lLCBudWxsLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVuc3VyZUN1cnNvclZpc2libGUoY20pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBvcGVuTGluZTogZnVuY3Rpb24gb3BlbkxpbmUoY20pIHtcbiAgICAgIHJldHVybiBjbS5yZXBsYWNlU2VsZWN0aW9uKFwiXFxuXCIsIFwic3RhcnRcIik7XG4gICAgfSxcbiAgICB0b2dnbGVPdmVyd3JpdGU6IGZ1bmN0aW9uIHRvZ2dsZU92ZXJ3cml0ZShjbSkge1xuICAgICAgcmV0dXJuIGNtLnRvZ2dsZU92ZXJ3cml0ZSgpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBsaW5lU3RhcnQoY20sIGxpbmVOKSB7XG4gICAgdmFyIGxpbmUgPSBnZXRMaW5lKGNtLmRvYywgbGluZU4pO1xuICAgIHZhciB2aXN1YWwgPSB2aXN1YWxMaW5lKGxpbmUpO1xuXG4gICAgaWYgKHZpc3VhbCAhPSBsaW5lKSB7XG4gICAgICBsaW5lTiA9IGxpbmVObyh2aXN1YWwpO1xuICAgIH1cblxuICAgIHZhciBvcmRlciA9IGdldE9yZGVyKHZpc3VhbCk7XG4gICAgdmFyIGNoID0gIW9yZGVyID8gMCA6IG9yZGVyWzBdLmxldmVsICUgMiA/IGxpbmVSaWdodCh2aXN1YWwpIDogbGluZUxlZnQodmlzdWFsKTtcbiAgICByZXR1cm4gUG9zKGxpbmVOLCBjaCk7XG4gIH1cblxuICBmdW5jdGlvbiBsaW5lRW5kKGNtLCBsaW5lTikge1xuICAgIHZhciBtZXJnZWQsXG4gICAgICAgIGxpbmUgPSBnZXRMaW5lKGNtLmRvYywgbGluZU4pO1xuXG4gICAgd2hpbGUgKG1lcmdlZCA9IGNvbGxhcHNlZFNwYW5BdEVuZChsaW5lKSkge1xuICAgICAgbGluZSA9IG1lcmdlZC5maW5kKDEsIHRydWUpLmxpbmU7XG4gICAgICBsaW5lTiA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIG9yZGVyID0gZ2V0T3JkZXIobGluZSk7XG4gICAgdmFyIGNoID0gIW9yZGVyID8gbGluZS50ZXh0Lmxlbmd0aCA6IG9yZGVyWzBdLmxldmVsICUgMiA/IGxpbmVMZWZ0KGxpbmUpIDogbGluZVJpZ2h0KGxpbmUpO1xuICAgIHJldHVybiBQb3MobGluZU4gPT0gbnVsbCA/IGxpbmVObyhsaW5lKSA6IGxpbmVOLCBjaCk7XG4gIH1cblxuICBmdW5jdGlvbiBsaW5lU3RhcnRTbWFydChjbSwgcG9zKSB7XG4gICAgdmFyIHN0YXJ0ID0gbGluZVN0YXJ0KGNtLCBwb3MubGluZSk7XG4gICAgdmFyIGxpbmUgPSBnZXRMaW5lKGNtLmRvYywgc3RhcnQubGluZSk7XG4gICAgdmFyIG9yZGVyID0gZ2V0T3JkZXIobGluZSk7XG5cbiAgICBpZiAoIW9yZGVyIHx8IG9yZGVyWzBdLmxldmVsID09IDApIHtcbiAgICAgIHZhciBmaXJzdE5vbldTID0gTWF0aC5tYXgoMCwgbGluZS50ZXh0LnNlYXJjaCgvXFxTLykpO1xuICAgICAgdmFyIGluV1MgPSBwb3MubGluZSA9PSBzdGFydC5saW5lICYmIHBvcy5jaCA8PSBmaXJzdE5vbldTICYmIHBvcy5jaDtcbiAgICAgIHJldHVybiBQb3Moc3RhcnQubGluZSwgaW5XUyA/IDAgOiBmaXJzdE5vbldTKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhcnQ7XG4gIH0gLy8gUnVuIGEgaGFuZGxlciB0aGF0IHdhcyBib3VuZCB0byBhIGtleS5cblxuXG4gIGZ1bmN0aW9uIGRvSGFuZGxlQmluZGluZyhjbSwgYm91bmQsIGRyb3BTaGlmdCkge1xuICAgIGlmICh0eXBlb2YgYm91bmQgPT0gXCJzdHJpbmdcIikge1xuICAgICAgYm91bmQgPSBjb21tYW5kc1tib3VuZF07XG5cbiAgICAgIGlmICghYm91bmQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gLy8gRW5zdXJlIHByZXZpb3VzIGlucHV0IGhhcyBiZWVuIHJlYWQsIHNvIHRoYXQgdGhlIGhhbmRsZXIgc2VlcyBhXG4gICAgLy8gY29uc2lzdGVudCB2aWV3IG9mIHRoZSBkb2N1bWVudFxuXG5cbiAgICBjbS5kaXNwbGF5LmlucHV0LmVuc3VyZVBvbGxlZCgpO1xuICAgIHZhciBwcmV2U2hpZnQgPSBjbS5kaXNwbGF5LnNoaWZ0LFxuICAgICAgICBkb25lID0gZmFsc2U7XG5cbiAgICB0cnkge1xuICAgICAgaWYgKGNtLmlzUmVhZE9ubHkoKSkge1xuICAgICAgICBjbS5zdGF0ZS5zdXBwcmVzc0VkaXRzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRyb3BTaGlmdCkge1xuICAgICAgICBjbS5kaXNwbGF5LnNoaWZ0ID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGRvbmUgPSBib3VuZChjbSkgIT0gUGFzcztcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY20uZGlzcGxheS5zaGlmdCA9IHByZXZTaGlmdDtcbiAgICAgIGNtLnN0YXRlLnN1cHByZXNzRWRpdHMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZG9uZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvb2t1cEtleUZvckVkaXRvcihjbSwgbmFtZSwgaGFuZGxlKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbS5zdGF0ZS5rZXlNYXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gbG9va3VwS2V5KG5hbWUsIGNtLnN0YXRlLmtleU1hcHNbaV0sIGhhbmRsZSwgY20pO1xuXG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNtLm9wdGlvbnMuZXh0cmFLZXlzICYmIGxvb2t1cEtleShuYW1lLCBjbS5vcHRpb25zLmV4dHJhS2V5cywgaGFuZGxlLCBjbSkgfHwgbG9va3VwS2V5KG5hbWUsIGNtLm9wdGlvbnMua2V5TWFwLCBoYW5kbGUsIGNtKTtcbiAgfVxuXG4gIHZhciBzdG9wU2VxID0gbmV3IERlbGF5ZWQoKTtcblxuICBmdW5jdGlvbiBkaXNwYXRjaEtleShjbSwgbmFtZSwgZSwgaGFuZGxlKSB7XG4gICAgdmFyIHNlcSA9IGNtLnN0YXRlLmtleVNlcTtcblxuICAgIGlmIChzZXEpIHtcbiAgICAgIGlmIChpc01vZGlmaWVyS2V5KG5hbWUpKSB7XG4gICAgICAgIHJldHVybiBcImhhbmRsZWRcIjtcbiAgICAgIH1cblxuICAgICAgc3RvcFNlcS5zZXQoNTAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGNtLnN0YXRlLmtleVNlcSA9PSBzZXEpIHtcbiAgICAgICAgICBjbS5zdGF0ZS5rZXlTZXEgPSBudWxsO1xuICAgICAgICAgIGNtLmRpc3BsYXkuaW5wdXQucmVzZXQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBuYW1lID0gc2VxICsgXCIgXCIgKyBuYW1lO1xuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSBsb29rdXBLZXlGb3JFZGl0b3IoY20sIG5hbWUsIGhhbmRsZSk7XG5cbiAgICBpZiAocmVzdWx0ID09IFwibXVsdGlcIikge1xuICAgICAgY20uc3RhdGUua2V5U2VxID0gbmFtZTtcbiAgICB9XG5cbiAgICBpZiAocmVzdWx0ID09IFwiaGFuZGxlZFwiKSB7XG4gICAgICBzaWduYWxMYXRlcihjbSwgXCJrZXlIYW5kbGVkXCIsIGNtLCBuYW1lLCBlKTtcbiAgICB9XG5cbiAgICBpZiAocmVzdWx0ID09IFwiaGFuZGxlZFwiIHx8IHJlc3VsdCA9PSBcIm11bHRpXCIpIHtcbiAgICAgIGVfcHJldmVudERlZmF1bHQoZSk7XG4gICAgICByZXN0YXJ0QmxpbmsoY20pO1xuICAgIH1cblxuICAgIGlmIChzZXEgJiYgIXJlc3VsdCAmJiAvXFwnJC8udGVzdChuYW1lKSkge1xuICAgICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiAhIXJlc3VsdDtcbiAgfSAvLyBIYW5kbGUgYSBrZXkgZnJvbSB0aGUga2V5ZG93biBldmVudC5cblxuXG4gIGZ1bmN0aW9uIGhhbmRsZUtleUJpbmRpbmcoY20sIGUpIHtcbiAgICB2YXIgbmFtZSA9IGtleU5hbWUoZSwgdHJ1ZSk7XG5cbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoZS5zaGlmdEtleSAmJiAhY20uc3RhdGUua2V5U2VxKSB7XG4gICAgICAvLyBGaXJzdCB0cnkgdG8gcmVzb2x2ZSBmdWxsIG5hbWUgKGluY2x1ZGluZyAnU2hpZnQtJykuIEZhaWxpbmdcbiAgICAgIC8vIHRoYXQsIHNlZSBpZiB0aGVyZSBpcyBhIGN1cnNvci1tb3Rpb24gY29tbWFuZCAoc3RhcnRpbmcgd2l0aFxuICAgICAgLy8gJ2dvJykgYm91bmQgdG8gdGhlIGtleW5hbWUgd2l0aG91dCAnU2hpZnQtJy5cbiAgICAgIHJldHVybiBkaXNwYXRjaEtleShjbSwgXCJTaGlmdC1cIiArIG5hbWUsIGUsIGZ1bmN0aW9uIChiKSB7XG4gICAgICAgIHJldHVybiBkb0hhbmRsZUJpbmRpbmcoY20sIGIsIHRydWUpO1xuICAgICAgfSkgfHwgZGlzcGF0Y2hLZXkoY20sIG5hbWUsIGUsIGZ1bmN0aW9uIChiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYiA9PSBcInN0cmluZ1wiID8gL15nb1tBLVpdLy50ZXN0KGIpIDogYi5tb3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gZG9IYW5kbGVCaW5kaW5nKGNtLCBiKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkaXNwYXRjaEtleShjbSwgbmFtZSwgZSwgZnVuY3Rpb24gKGIpIHtcbiAgICAgICAgcmV0dXJuIGRvSGFuZGxlQmluZGluZyhjbSwgYik7XG4gICAgICB9KTtcbiAgICB9XG4gIH0gLy8gSGFuZGxlIGEga2V5IGZyb20gdGhlIGtleXByZXNzIGV2ZW50XG5cblxuICBmdW5jdGlvbiBoYW5kbGVDaGFyQmluZGluZyhjbSwgZSwgY2gpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2hLZXkoY20sIFwiJ1wiICsgY2ggKyBcIidcIiwgZSwgZnVuY3Rpb24gKGIpIHtcbiAgICAgIHJldHVybiBkb0hhbmRsZUJpbmRpbmcoY20sIGIsIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIGxhc3RTdG9wcGVkS2V5ID0gbnVsbDtcblxuICBmdW5jdGlvbiBvbktleURvd24oZSkge1xuICAgIHZhciBjbSA9IHRoaXM7XG4gICAgY20uY3VyT3AuZm9jdXMgPSBhY3RpdmVFbHQoKTtcblxuICAgIGlmIChzaWduYWxET01FdmVudChjbSwgZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IC8vIElFIGRvZXMgc3RyYW5nZSB0aGluZ3Mgd2l0aCBlc2NhcGUuXG5cblxuICAgIGlmIChpZSAmJiBpZV92ZXJzaW9uIDwgMTEgJiYgZS5rZXlDb2RlID09IDI3KSB7XG4gICAgICBlLnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGNvZGUgPSBlLmtleUNvZGU7XG4gICAgY20uZGlzcGxheS5zaGlmdCA9IGNvZGUgPT0gMTYgfHwgZS5zaGlmdEtleTtcbiAgICB2YXIgaGFuZGxlZCA9IGhhbmRsZUtleUJpbmRpbmcoY20sIGUpO1xuXG4gICAgaWYgKHByZXN0bykge1xuICAgICAgbGFzdFN0b3BwZWRLZXkgPSBoYW5kbGVkID8gY29kZSA6IG51bGw7IC8vIE9wZXJhIGhhcyBubyBjdXQgZXZlbnQuLi4gd2UgdHJ5IHRvIGF0IGxlYXN0IGNhdGNoIHRoZSBrZXkgY29tYm9cblxuICAgICAgaWYgKCFoYW5kbGVkICYmIGNvZGUgPT0gODggJiYgIWhhc0NvcHlFdmVudCAmJiAobWFjID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkge1xuICAgICAgICBjbS5yZXBsYWNlU2VsZWN0aW9uKFwiXCIsIG51bGwsIFwiY3V0XCIpO1xuICAgICAgfVxuICAgIH0gLy8gVHVybiBtb3VzZSBpbnRvIGNyb3NzaGFpciB3aGVuIEFsdCBpcyBoZWxkIG9uIE1hYy5cblxuXG4gICAgaWYgKGNvZGUgPT0gMTggJiYgIS9cXGJDb2RlTWlycm9yLWNyb3NzaGFpclxcYi8udGVzdChjbS5kaXNwbGF5LmxpbmVEaXYuY2xhc3NOYW1lKSkge1xuICAgICAgc2hvd0Nyb3NzSGFpcihjbSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2hvd0Nyb3NzSGFpcihjbSkge1xuICAgIHZhciBsaW5lRGl2ID0gY20uZGlzcGxheS5saW5lRGl2O1xuICAgIGFkZENsYXNzKGxpbmVEaXYsIFwiQ29kZU1pcnJvci1jcm9zc2hhaXJcIik7XG5cbiAgICBmdW5jdGlvbiB1cChlKSB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09IDE4IHx8ICFlLmFsdEtleSkge1xuICAgICAgICBybUNsYXNzKGxpbmVEaXYsIFwiQ29kZU1pcnJvci1jcm9zc2hhaXJcIik7XG4gICAgICAgIG9mZihkb2N1bWVudCwgXCJrZXl1cFwiLCB1cCk7XG4gICAgICAgIG9mZihkb2N1bWVudCwgXCJtb3VzZW92ZXJcIiwgdXApO1xuICAgICAgfVxuICAgIH1cblxuICAgIG9uKGRvY3VtZW50LCBcImtleXVwXCIsIHVwKTtcbiAgICBvbihkb2N1bWVudCwgXCJtb3VzZW92ZXJcIiwgdXApO1xuICB9XG5cbiAgZnVuY3Rpb24gb25LZXlVcChlKSB7XG4gICAgaWYgKGUua2V5Q29kZSA9PSAxNikge1xuICAgICAgdGhpcy5kb2Muc2VsLnNoaWZ0ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgc2lnbmFsRE9NRXZlbnQodGhpcywgZSk7XG4gIH1cblxuICBmdW5jdGlvbiBvbktleVByZXNzKGUpIHtcbiAgICB2YXIgY20gPSB0aGlzO1xuXG4gICAgaWYgKGV2ZW50SW5XaWRnZXQoY20uZGlzcGxheSwgZSkgfHwgc2lnbmFsRE9NRXZlbnQoY20sIGUpIHx8IGUuY3RybEtleSAmJiAhZS5hbHRLZXkgfHwgbWFjICYmIGUubWV0YUtleSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBrZXlDb2RlID0gZS5rZXlDb2RlLFxuICAgICAgICBjaGFyQ29kZSA9IGUuY2hhckNvZGU7XG5cbiAgICBpZiAocHJlc3RvICYmIGtleUNvZGUgPT0gbGFzdFN0b3BwZWRLZXkpIHtcbiAgICAgIGxhc3RTdG9wcGVkS2V5ID0gbnVsbDtcbiAgICAgIGVfcHJldmVudERlZmF1bHQoZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHByZXN0byAmJiAoIWUud2hpY2ggfHwgZS53aGljaCA8IDEwKSAmJiBoYW5kbGVLZXlCaW5kaW5nKGNtLCBlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBjaCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUgPT0gbnVsbCA/IGtleUNvZGUgOiBjaGFyQ29kZSk7IC8vIFNvbWUgYnJvd3NlcnMgZmlyZSBrZXlwcmVzcyBldmVudHMgZm9yIGJhY2tzcGFjZVxuXG4gICAgaWYgKGNoID09IFwiXFx4MDhcIikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChoYW5kbGVDaGFyQmluZGluZyhjbSwgZSwgY2gpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY20uZGlzcGxheS5pbnB1dC5vbktleVByZXNzKGUpO1xuICB9IC8vIEEgbW91c2UgZG93biBjYW4gYmUgYSBzaW5nbGUgY2xpY2ssIGRvdWJsZSBjbGljaywgdHJpcGxlIGNsaWNrLFxuICAvLyBzdGFydCBvZiBzZWxlY3Rpb24gZHJhZywgc3RhcnQgb2YgdGV4dCBkcmFnLCBuZXcgY3Vyc29yXG4gIC8vIChjdHJsLWNsaWNrKSwgcmVjdGFuZ2xlIGRyYWcgKGFsdC1kcmFnKSwgb3IgeHdpblxuICAvLyBtaWRkbGUtY2xpY2stcGFzdGUuIE9yIGl0IG1pZ2h0IGJlIGEgY2xpY2sgb24gc29tZXRoaW5nIHdlIHNob3VsZFxuICAvLyBub3QgaW50ZXJmZXJlIHdpdGgsIHN1Y2ggYXMgYSBzY3JvbGxiYXIgb3Igd2lkZ2V0LlxuXG5cbiAgZnVuY3Rpb24gb25Nb3VzZURvd24oZSkge1xuICAgIHZhciBjbSA9IHRoaXMsXG4gICAgICAgIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuXG4gICAgaWYgKHNpZ25hbERPTUV2ZW50KGNtLCBlKSB8fCBkaXNwbGF5LmFjdGl2ZVRvdWNoICYmIGRpc3BsYXkuaW5wdXQuc3VwcG9ydHNUb3VjaCgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZGlzcGxheS5pbnB1dC5lbnN1cmVQb2xsZWQoKTtcbiAgICBkaXNwbGF5LnNoaWZ0ID0gZS5zaGlmdEtleTtcblxuICAgIGlmIChldmVudEluV2lkZ2V0KGRpc3BsYXksIGUpKSB7XG4gICAgICBpZiAoIXdlYmtpdCkge1xuICAgICAgICAvLyBCcmllZmx5IHR1cm4gb2ZmIGRyYWdnYWJpbGl0eSwgdG8gYWxsb3cgd2lkZ2V0cyB0byBkb1xuICAgICAgICAvLyBub3JtYWwgZHJhZ2dpbmcgdGhpbmdzLlxuICAgICAgICBkaXNwbGF5LnNjcm9sbGVyLmRyYWdnYWJsZSA9IGZhbHNlO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gZGlzcGxheS5zY3JvbGxlci5kcmFnZ2FibGUgPSB0cnVlO1xuICAgICAgICB9LCAxMDApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNsaWNrSW5HdXR0ZXIoY20sIGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0ID0gcG9zRnJvbU1vdXNlKGNtLCBlKTtcbiAgICB3aW5kb3cuZm9jdXMoKTtcblxuICAgIHN3aXRjaCAoZV9idXR0b24oZSkpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgLy8gIzMyNjE6IG1ha2Ugc3VyZSwgdGhhdCB3ZSdyZSBub3Qgc3RhcnRpbmcgYSBzZWNvbmQgc2VsZWN0aW9uXG4gICAgICAgIGlmIChjbS5zdGF0ZS5zZWxlY3RpbmdUZXh0KSB7XG4gICAgICAgICAgY20uc3RhdGUuc2VsZWN0aW5nVGV4dChlKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFydCkge1xuICAgICAgICAgIGxlZnRCdXR0b25Eb3duKGNtLCBlLCBzdGFydCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZV90YXJnZXQoZSkgPT0gZGlzcGxheS5zY3JvbGxlcikge1xuICAgICAgICAgIGVfcHJldmVudERlZmF1bHQoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAyOlxuICAgICAgICBpZiAod2Via2l0KSB7XG4gICAgICAgICAgY20uc3RhdGUubGFzdE1pZGRsZURvd24gPSArbmV3IERhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGFydCkge1xuICAgICAgICAgIGV4dGVuZFNlbGVjdGlvbihjbS5kb2MsIHN0YXJ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBkaXNwbGF5LmlucHV0LmZvY3VzKCk7XG4gICAgICAgIH0sIDIwKTtcbiAgICAgICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaWYgKGNhcHR1cmVSaWdodENsaWNrKSB7XG4gICAgICAgICAgb25Db250ZXh0TWVudShjbSwgZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsYXlCbHVyRXZlbnQoY20pO1xuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIGxhc3RDbGljaztcbiAgdmFyIGxhc3REb3VibGVDbGljaztcblxuICBmdW5jdGlvbiBsZWZ0QnV0dG9uRG93bihjbSwgZSwgc3RhcnQpIHtcbiAgICBpZiAoaWUpIHtcbiAgICAgIHNldFRpbWVvdXQoYmluZChlbnN1cmVGb2N1cywgY20pLCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY20uY3VyT3AuZm9jdXMgPSBhY3RpdmVFbHQoKTtcbiAgICB9XG5cbiAgICB2YXIgbm93ID0gK25ldyBEYXRlKCksXG4gICAgICAgIHR5cGU7XG5cbiAgICBpZiAobGFzdERvdWJsZUNsaWNrICYmIGxhc3REb3VibGVDbGljay50aW1lID4gbm93IC0gNDAwICYmIGNtcChsYXN0RG91YmxlQ2xpY2sucG9zLCBzdGFydCkgPT0gMCkge1xuICAgICAgdHlwZSA9IFwidHJpcGxlXCI7XG4gICAgfSBlbHNlIGlmIChsYXN0Q2xpY2sgJiYgbGFzdENsaWNrLnRpbWUgPiBub3cgLSA0MDAgJiYgY21wKGxhc3RDbGljay5wb3MsIHN0YXJ0KSA9PSAwKSB7XG4gICAgICB0eXBlID0gXCJkb3VibGVcIjtcbiAgICAgIGxhc3REb3VibGVDbGljayA9IHtcbiAgICAgICAgdGltZTogbm93LFxuICAgICAgICBwb3M6IHN0YXJ0XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0eXBlID0gXCJzaW5nbGVcIjtcbiAgICAgIGxhc3RDbGljayA9IHtcbiAgICAgICAgdGltZTogbm93LFxuICAgICAgICBwb3M6IHN0YXJ0XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBzZWwgPSBjbS5kb2Muc2VsLFxuICAgICAgICBtb2RpZmllciA9IG1hYyA/IGUubWV0YUtleSA6IGUuY3RybEtleSxcbiAgICAgICAgY29udGFpbmVkO1xuXG4gICAgaWYgKGNtLm9wdGlvbnMuZHJhZ0Ryb3AgJiYgZHJhZ0FuZERyb3AgJiYgIWNtLmlzUmVhZE9ubHkoKSAmJiB0eXBlID09IFwic2luZ2xlXCIgJiYgKGNvbnRhaW5lZCA9IHNlbC5jb250YWlucyhzdGFydCkpID4gLTEgJiYgKGNtcCgoY29udGFpbmVkID0gc2VsLnJhbmdlc1tjb250YWluZWRdKS5mcm9tKCksIHN0YXJ0KSA8IDAgfHwgc3RhcnQueFJlbCA+IDApICYmIChjbXAoY29udGFpbmVkLnRvKCksIHN0YXJ0KSA+IDAgfHwgc3RhcnQueFJlbCA8IDApKSB7XG4gICAgICBsZWZ0QnV0dG9uU3RhcnREcmFnKGNtLCBlLCBzdGFydCwgbW9kaWZpZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZWZ0QnV0dG9uU2VsZWN0KGNtLCBlLCBzdGFydCwgdHlwZSwgbW9kaWZpZXIpO1xuICAgIH1cbiAgfSAvLyBTdGFydCBhIHRleHQgZHJhZy4gV2hlbiBpdCBlbmRzLCBzZWUgaWYgYW55IGRyYWdnaW5nIGFjdHVhbGx5XG4gIC8vIGhhcHBlbiwgYW5kIHRyZWF0IGFzIGEgY2xpY2sgaWYgaXQgZGlkbid0LlxuXG5cbiAgZnVuY3Rpb24gbGVmdEJ1dHRvblN0YXJ0RHJhZyhjbSwgZSwgc3RhcnQsIG1vZGlmaWVyKSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LFxuICAgICAgICBzdGFydFRpbWUgPSArbmV3IERhdGUoKTtcbiAgICB2YXIgZHJhZ0VuZCA9IG9wZXJhdGlvbihjbSwgZnVuY3Rpb24gKGUyKSB7XG4gICAgICBpZiAod2Via2l0KSB7XG4gICAgICAgIGRpc3BsYXkuc2Nyb2xsZXIuZHJhZ2dhYmxlID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGNtLnN0YXRlLmRyYWdnaW5nVGV4dCA9IGZhbHNlO1xuICAgICAgb2ZmKGRvY3VtZW50LCBcIm1vdXNldXBcIiwgZHJhZ0VuZCk7XG4gICAgICBvZmYoZGlzcGxheS5zY3JvbGxlciwgXCJkcm9wXCIsIGRyYWdFbmQpO1xuXG4gICAgICBpZiAoTWF0aC5hYnMoZS5jbGllbnRYIC0gZTIuY2xpZW50WCkgKyBNYXRoLmFicyhlLmNsaWVudFkgLSBlMi5jbGllbnRZKSA8IDEwKSB7XG4gICAgICAgIGVfcHJldmVudERlZmF1bHQoZTIpO1xuXG4gICAgICAgIGlmICghbW9kaWZpZXIgJiYgK25ldyBEYXRlKCkgLSAyMDAgPCBzdGFydFRpbWUpIHtcbiAgICAgICAgICBleHRlbmRTZWxlY3Rpb24oY20uZG9jLCBzdGFydCk7XG4gICAgICAgIH0gLy8gV29yayBhcm91bmQgdW5leHBsYWluYWJsZSBmb2N1cyBwcm9ibGVtIGluIElFOSAoIzIxMjcpIGFuZCBDaHJvbWUgKCMzMDgxKVxuXG5cbiAgICAgICAgaWYgKHdlYmtpdCB8fCBpZSAmJiBpZV92ZXJzaW9uID09IDkpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuZm9jdXMoKTtcbiAgICAgICAgICAgIGRpc3BsYXkuaW5wdXQuZm9jdXMoKTtcbiAgICAgICAgICB9LCAyMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlzcGxheS5pbnB1dC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7IC8vIExldCB0aGUgZHJhZyBoYW5kbGVyIGhhbmRsZSB0aGlzLlxuXG4gICAgaWYgKHdlYmtpdCkge1xuICAgICAgZGlzcGxheS5zY3JvbGxlci5kcmFnZ2FibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGNtLnN0YXRlLmRyYWdnaW5nVGV4dCA9IGRyYWdFbmQ7XG4gICAgZHJhZ0VuZC5jb3B5ID0gbWFjID8gZS5hbHRLZXkgOiBlLmN0cmxLZXk7IC8vIElFJ3MgYXBwcm9hY2ggdG8gZHJhZ2dhYmxlXG5cbiAgICBpZiAoZGlzcGxheS5zY3JvbGxlci5kcmFnRHJvcCkge1xuICAgICAgZGlzcGxheS5zY3JvbGxlci5kcmFnRHJvcCgpO1xuICAgIH1cblxuICAgIG9uKGRvY3VtZW50LCBcIm1vdXNldXBcIiwgZHJhZ0VuZCk7XG4gICAgb24oZGlzcGxheS5zY3JvbGxlciwgXCJkcm9wXCIsIGRyYWdFbmQpO1xuICB9IC8vIE5vcm1hbCBzZWxlY3Rpb24sIGFzIG9wcG9zZWQgdG8gdGV4dCBkcmFnZ2luZy5cblxuXG4gIGZ1bmN0aW9uIGxlZnRCdXR0b25TZWxlY3QoY20sIGUsIHN0YXJ0LCB0eXBlLCBhZGROZXcpIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksXG4gICAgICAgIGRvYyA9IGNtLmRvYztcbiAgICBlX3ByZXZlbnREZWZhdWx0KGUpO1xuICAgIHZhciBvdXJSYW5nZSxcbiAgICAgICAgb3VySW5kZXgsXG4gICAgICAgIHN0YXJ0U2VsID0gZG9jLnNlbCxcbiAgICAgICAgcmFuZ2VzID0gc3RhcnRTZWwucmFuZ2VzO1xuXG4gICAgaWYgKGFkZE5ldyAmJiAhZS5zaGlmdEtleSkge1xuICAgICAgb3VySW5kZXggPSBkb2Muc2VsLmNvbnRhaW5zKHN0YXJ0KTtcblxuICAgICAgaWYgKG91ckluZGV4ID4gLTEpIHtcbiAgICAgICAgb3VyUmFuZ2UgPSByYW5nZXNbb3VySW5kZXhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3VyUmFuZ2UgPSBuZXcgUmFuZ2Uoc3RhcnQsIHN0YXJ0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb3VyUmFuZ2UgPSBkb2Muc2VsLnByaW1hcnkoKTtcbiAgICAgIG91ckluZGV4ID0gZG9jLnNlbC5wcmltSW5kZXg7XG4gICAgfVxuXG4gICAgaWYgKGNocm9tZU9TID8gZS5zaGlmdEtleSAmJiBlLm1ldGFLZXkgOiBlLmFsdEtleSkge1xuICAgICAgdHlwZSA9IFwicmVjdFwiO1xuXG4gICAgICBpZiAoIWFkZE5ldykge1xuICAgICAgICBvdXJSYW5nZSA9IG5ldyBSYW5nZShzdGFydCwgc3RhcnQpO1xuICAgICAgfVxuXG4gICAgICBzdGFydCA9IHBvc0Zyb21Nb3VzZShjbSwgZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICBvdXJJbmRleCA9IC0xO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRvdWJsZVwiKSB7XG4gICAgICB2YXIgd29yZCA9IGNtLmZpbmRXb3JkQXQoc3RhcnQpO1xuXG4gICAgICBpZiAoY20uZGlzcGxheS5zaGlmdCB8fCBkb2MuZXh0ZW5kKSB7XG4gICAgICAgIG91clJhbmdlID0gZXh0ZW5kUmFuZ2UoZG9jLCBvdXJSYW5nZSwgd29yZC5hbmNob3IsIHdvcmQuaGVhZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXJSYW5nZSA9IHdvcmQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwidHJpcGxlXCIpIHtcbiAgICAgIHZhciBsaW5lID0gbmV3IFJhbmdlKFBvcyhzdGFydC5saW5lLCAwKSwgX2NsaXBQb3MoZG9jLCBQb3Moc3RhcnQubGluZSArIDEsIDApKSk7XG5cbiAgICAgIGlmIChjbS5kaXNwbGF5LnNoaWZ0IHx8IGRvYy5leHRlbmQpIHtcbiAgICAgICAgb3VyUmFuZ2UgPSBleHRlbmRSYW5nZShkb2MsIG91clJhbmdlLCBsaW5lLmFuY2hvciwgbGluZS5oZWFkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91clJhbmdlID0gbGluZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb3VyUmFuZ2UgPSBleHRlbmRSYW5nZShkb2MsIG91clJhbmdlLCBzdGFydCk7XG4gICAgfVxuXG4gICAgaWYgKCFhZGROZXcpIHtcbiAgICAgIG91ckluZGV4ID0gMDtcbiAgICAgIHNldFNlbGVjdGlvbihkb2MsIG5ldyBTZWxlY3Rpb24oW291clJhbmdlXSwgMCksIHNlbF9tb3VzZSk7XG4gICAgICBzdGFydFNlbCA9IGRvYy5zZWw7XG4gICAgfSBlbHNlIGlmIChvdXJJbmRleCA9PSAtMSkge1xuICAgICAgb3VySW5kZXggPSByYW5nZXMubGVuZ3RoO1xuICAgICAgc2V0U2VsZWN0aW9uKGRvYywgbm9ybWFsaXplU2VsZWN0aW9uKHJhbmdlcy5jb25jYXQoW291clJhbmdlXSksIG91ckluZGV4KSwge1xuICAgICAgICBzY3JvbGw6IGZhbHNlLFxuICAgICAgICBvcmlnaW46IFwiKm1vdXNlXCJcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAocmFuZ2VzLmxlbmd0aCA+IDEgJiYgcmFuZ2VzW291ckluZGV4XS5lbXB0eSgpICYmIHR5cGUgPT0gXCJzaW5nbGVcIiAmJiAhZS5zaGlmdEtleSkge1xuICAgICAgc2V0U2VsZWN0aW9uKGRvYywgbm9ybWFsaXplU2VsZWN0aW9uKHJhbmdlcy5zbGljZSgwLCBvdXJJbmRleCkuY29uY2F0KHJhbmdlcy5zbGljZShvdXJJbmRleCArIDEpKSwgMCksIHtcbiAgICAgICAgc2Nyb2xsOiBmYWxzZSxcbiAgICAgICAgb3JpZ2luOiBcIiptb3VzZVwiXG4gICAgICB9KTtcbiAgICAgIHN0YXJ0U2VsID0gZG9jLnNlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVwbGFjZU9uZVNlbGVjdGlvbihkb2MsIG91ckluZGV4LCBvdXJSYW5nZSwgc2VsX21vdXNlKTtcbiAgICB9XG5cbiAgICB2YXIgbGFzdFBvcyA9IHN0YXJ0O1xuXG4gICAgZnVuY3Rpb24gZXh0ZW5kVG8ocG9zKSB7XG4gICAgICBpZiAoY21wKGxhc3RQb3MsIHBvcykgPT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxhc3RQb3MgPSBwb3M7XG5cbiAgICAgIGlmICh0eXBlID09IFwicmVjdFwiKSB7XG4gICAgICAgIHZhciByYW5nZXMgPSBbXSxcbiAgICAgICAgICAgIHRhYlNpemUgPSBjbS5vcHRpb25zLnRhYlNpemU7XG4gICAgICAgIHZhciBzdGFydENvbCA9IGNvdW50Q29sdW1uKGdldExpbmUoZG9jLCBzdGFydC5saW5lKS50ZXh0LCBzdGFydC5jaCwgdGFiU2l6ZSk7XG4gICAgICAgIHZhciBwb3NDb2wgPSBjb3VudENvbHVtbihnZXRMaW5lKGRvYywgcG9zLmxpbmUpLnRleHQsIHBvcy5jaCwgdGFiU2l6ZSk7XG4gICAgICAgIHZhciBsZWZ0ID0gTWF0aC5taW4oc3RhcnRDb2wsIHBvc0NvbCksXG4gICAgICAgICAgICByaWdodCA9IE1hdGgubWF4KHN0YXJ0Q29sLCBwb3NDb2wpO1xuXG4gICAgICAgIGZvciAodmFyIGxpbmUgPSBNYXRoLm1pbihzdGFydC5saW5lLCBwb3MubGluZSksIGVuZCA9IE1hdGgubWluKGNtLmxhc3RMaW5lKCksIE1hdGgubWF4KHN0YXJ0LmxpbmUsIHBvcy5saW5lKSk7IGxpbmUgPD0gZW5kOyBsaW5lKyspIHtcbiAgICAgICAgICB2YXIgdGV4dCA9IGdldExpbmUoZG9jLCBsaW5lKS50ZXh0LFxuICAgICAgICAgICAgICBsZWZ0UG9zID0gZmluZENvbHVtbih0ZXh0LCBsZWZ0LCB0YWJTaXplKTtcblxuICAgICAgICAgIGlmIChsZWZ0ID09IHJpZ2h0KSB7XG4gICAgICAgICAgICByYW5nZXMucHVzaChuZXcgUmFuZ2UoUG9zKGxpbmUsIGxlZnRQb3MpLCBQb3MobGluZSwgbGVmdFBvcykpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRleHQubGVuZ3RoID4gbGVmdFBvcykge1xuICAgICAgICAgICAgcmFuZ2VzLnB1c2gobmV3IFJhbmdlKFBvcyhsaW5lLCBsZWZ0UG9zKSwgUG9zKGxpbmUsIGZpbmRDb2x1bW4odGV4dCwgcmlnaHQsIHRhYlNpemUpKSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcmFuZ2VzLmxlbmd0aCkge1xuICAgICAgICAgIHJhbmdlcy5wdXNoKG5ldyBSYW5nZShzdGFydCwgc3RhcnQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFNlbGVjdGlvbihkb2MsIG5vcm1hbGl6ZVNlbGVjdGlvbihzdGFydFNlbC5yYW5nZXMuc2xpY2UoMCwgb3VySW5kZXgpLmNvbmNhdChyYW5nZXMpLCBvdXJJbmRleCksIHtcbiAgICAgICAgICBvcmlnaW46IFwiKm1vdXNlXCIsXG4gICAgICAgICAgc2Nyb2xsOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgY20uc2Nyb2xsSW50b1ZpZXcocG9zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBvbGRSYW5nZSA9IG91clJhbmdlO1xuICAgICAgICB2YXIgYW5jaG9yID0gb2xkUmFuZ2UuYW5jaG9yLFxuICAgICAgICAgICAgaGVhZCA9IHBvcztcblxuICAgICAgICBpZiAodHlwZSAhPSBcInNpbmdsZVwiKSB7XG4gICAgICAgICAgdmFyIHJhbmdlO1xuXG4gICAgICAgICAgaWYgKHR5cGUgPT0gXCJkb3VibGVcIikge1xuICAgICAgICAgICAgcmFuZ2UgPSBjbS5maW5kV29yZEF0KHBvcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJhbmdlID0gbmV3IFJhbmdlKFBvcyhwb3MubGluZSwgMCksIF9jbGlwUG9zKGRvYywgUG9zKHBvcy5saW5lICsgMSwgMCkpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY21wKHJhbmdlLmFuY2hvciwgYW5jaG9yKSA+IDApIHtcbiAgICAgICAgICAgIGhlYWQgPSByYW5nZS5oZWFkO1xuICAgICAgICAgICAgYW5jaG9yID0gbWluUG9zKG9sZFJhbmdlLmZyb20oKSwgcmFuZ2UuYW5jaG9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGVhZCA9IHJhbmdlLmFuY2hvcjtcbiAgICAgICAgICAgIGFuY2hvciA9IG1heFBvcyhvbGRSYW5nZS50bygpLCByYW5nZS5oZWFkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmFuZ2VzJDEgPSBzdGFydFNlbC5yYW5nZXMuc2xpY2UoMCk7XG4gICAgICAgIHJhbmdlcyQxW291ckluZGV4XSA9IG5ldyBSYW5nZShfY2xpcFBvcyhkb2MsIGFuY2hvciksIGhlYWQpO1xuICAgICAgICBzZXRTZWxlY3Rpb24oZG9jLCBub3JtYWxpemVTZWxlY3Rpb24ocmFuZ2VzJDEsIG91ckluZGV4KSwgc2VsX21vdXNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZWRpdG9yU2l6ZSA9IGRpc3BsYXkud3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTsgLy8gVXNlZCB0byBlbnN1cmUgdGltZW91dCByZS10cmllcyBkb24ndCBmaXJlIHdoZW4gYW5vdGhlciBleHRlbmRcbiAgICAvLyBoYXBwZW5lZCBpbiB0aGUgbWVhbnRpbWUgKGNsZWFyVGltZW91dCBpc24ndCByZWxpYWJsZSAtLSBhdFxuICAgIC8vIGxlYXN0IG9uIENocm9tZSwgdGhlIHRpbWVvdXRzIHN0aWxsIGhhcHBlbiBldmVuIHdoZW4gY2xlYXJlZCxcbiAgICAvLyBpZiB0aGUgY2xlYXIgaGFwcGVucyBhZnRlciB0aGVpciBzY2hlZHVsZWQgZmlyaW5nIHRpbWUpLlxuXG4gICAgdmFyIGNvdW50ZXIgPSAwO1xuXG4gICAgZnVuY3Rpb24gZXh0ZW5kKGUpIHtcbiAgICAgIHZhciBjdXJDb3VudCA9ICsrY291bnRlcjtcbiAgICAgIHZhciBjdXIgPSBwb3NGcm9tTW91c2UoY20sIGUsIHRydWUsIHR5cGUgPT0gXCJyZWN0XCIpO1xuXG4gICAgICBpZiAoIWN1cikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChjbXAoY3VyLCBsYXN0UG9zKSAhPSAwKSB7XG4gICAgICAgIGNtLmN1ck9wLmZvY3VzID0gYWN0aXZlRWx0KCk7XG4gICAgICAgIGV4dGVuZFRvKGN1cik7XG4gICAgICAgIHZhciB2aXNpYmxlID0gdmlzaWJsZUxpbmVzKGRpc3BsYXksIGRvYyk7XG5cbiAgICAgICAgaWYgKGN1ci5saW5lID49IHZpc2libGUudG8gfHwgY3VyLmxpbmUgPCB2aXNpYmxlLmZyb20pIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KG9wZXJhdGlvbihjbSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGNvdW50ZXIgPT0gY3VyQ291bnQpIHtcbiAgICAgICAgICAgICAgZXh0ZW5kKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLCAxNTApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgb3V0c2lkZSA9IGUuY2xpZW50WSA8IGVkaXRvclNpemUudG9wID8gLTIwIDogZS5jbGllbnRZID4gZWRpdG9yU2l6ZS5ib3R0b20gPyAyMCA6IDA7XG5cbiAgICAgICAgaWYgKG91dHNpZGUpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KG9wZXJhdGlvbihjbSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGNvdW50ZXIgIT0gY3VyQ291bnQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcCArPSBvdXRzaWRlO1xuICAgICAgICAgICAgZXh0ZW5kKGUpO1xuICAgICAgICAgIH0pLCA1MCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkb25lKGUpIHtcbiAgICAgIGNtLnN0YXRlLnNlbGVjdGluZ1RleHQgPSBmYWxzZTtcbiAgICAgIGNvdW50ZXIgPSBJbmZpbml0eTtcbiAgICAgIGVfcHJldmVudERlZmF1bHQoZSk7XG4gICAgICBkaXNwbGF5LmlucHV0LmZvY3VzKCk7XG4gICAgICBvZmYoZG9jdW1lbnQsIFwibW91c2Vtb3ZlXCIsIG1vdmUpO1xuICAgICAgb2ZmKGRvY3VtZW50LCBcIm1vdXNldXBcIiwgdXApO1xuICAgICAgZG9jLmhpc3RvcnkubGFzdFNlbE9yaWdpbiA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIG1vdmUgPSBvcGVyYXRpb24oY20sIGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoIWVfYnV0dG9uKGUpKSB7XG4gICAgICAgIGRvbmUoZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBleHRlbmQoZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdmFyIHVwID0gb3BlcmF0aW9uKGNtLCBkb25lKTtcbiAgICBjbS5zdGF0ZS5zZWxlY3RpbmdUZXh0ID0gdXA7XG4gICAgb24oZG9jdW1lbnQsIFwibW91c2Vtb3ZlXCIsIG1vdmUpO1xuICAgIG9uKGRvY3VtZW50LCBcIm1vdXNldXBcIiwgdXApO1xuICB9IC8vIERldGVybWluZXMgd2hldGhlciBhbiBldmVudCBoYXBwZW5lZCBpbiB0aGUgZ3V0dGVyLCBhbmQgZmlyZXMgdGhlXG4gIC8vIGhhbmRsZXJzIGZvciB0aGUgY29ycmVzcG9uZGluZyBldmVudC5cblxuXG4gIGZ1bmN0aW9uIGd1dHRlckV2ZW50KGNtLCBlLCB0eXBlLCBwcmV2ZW50KSB7XG4gICAgdmFyIG1YLCBtWTtcblxuICAgIHRyeSB7XG4gICAgICBtWCA9IGUuY2xpZW50WDtcbiAgICAgIG1ZID0gZS5jbGllbnRZO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAobVggPj0gTWF0aC5mbG9vcihjbS5kaXNwbGF5Lmd1dHRlcnMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHByZXZlbnQpIHtcbiAgICAgIGVfcHJldmVudERlZmF1bHQoZSk7XG4gICAgfVxuXG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICAgIHZhciBsaW5lQm94ID0gZGlzcGxheS5saW5lRGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgaWYgKG1ZID4gbGluZUJveC5ib3R0b20gfHwgIWhhc0hhbmRsZXIoY20sIHR5cGUpKSB7XG4gICAgICByZXR1cm4gZV9kZWZhdWx0UHJldmVudGVkKGUpO1xuICAgIH1cblxuICAgIG1ZIC09IGxpbmVCb3gudG9wIC0gZGlzcGxheS52aWV3T2Zmc2V0O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbS5vcHRpb25zLmd1dHRlcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBnID0gZGlzcGxheS5ndXR0ZXJzLmNoaWxkTm9kZXNbaV07XG5cbiAgICAgIGlmIChnICYmIGcuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgPj0gbVgpIHtcbiAgICAgICAgdmFyIGxpbmUgPSBfbGluZUF0SGVpZ2h0KGNtLmRvYywgbVkpO1xuXG4gICAgICAgIHZhciBndXR0ZXIgPSBjbS5vcHRpb25zLmd1dHRlcnNbaV07XG4gICAgICAgIHNpZ25hbChjbSwgdHlwZSwgY20sIGxpbmUsIGd1dHRlciwgZSk7XG4gICAgICAgIHJldHVybiBlX2RlZmF1bHRQcmV2ZW50ZWQoZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2xpY2tJbkd1dHRlcihjbSwgZSkge1xuICAgIHJldHVybiBndXR0ZXJFdmVudChjbSwgZSwgXCJndXR0ZXJDbGlja1wiLCB0cnVlKTtcbiAgfSAvLyBDT05URVhUIE1FTlUgSEFORExJTkdcbiAgLy8gVG8gbWFrZSB0aGUgY29udGV4dCBtZW51IHdvcmssIHdlIG5lZWQgdG8gYnJpZWZseSB1bmhpZGUgdGhlXG4gIC8vIHRleHRhcmVhIChtYWtpbmcgaXQgYXMgdW5vYnRydXNpdmUgYXMgcG9zc2libGUpIHRvIGxldCB0aGVcbiAgLy8gcmlnaHQtY2xpY2sgdGFrZSBlZmZlY3Qgb24gaXQuXG5cblxuICBmdW5jdGlvbiBvbkNvbnRleHRNZW51KGNtLCBlKSB7XG4gICAgaWYgKGV2ZW50SW5XaWRnZXQoY20uZGlzcGxheSwgZSkgfHwgY29udGV4dE1lbnVJbkd1dHRlcihjbSwgZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUsIFwiY29udGV4dG1lbnVcIikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjbS5kaXNwbGF5LmlucHV0Lm9uQ29udGV4dE1lbnUoZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjb250ZXh0TWVudUluR3V0dGVyKGNtLCBlKSB7XG4gICAgaWYgKCFoYXNIYW5kbGVyKGNtLCBcImd1dHRlckNvbnRleHRNZW51XCIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGd1dHRlckV2ZW50KGNtLCBlLCBcImd1dHRlckNvbnRleHRNZW51XCIsIGZhbHNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRoZW1lQ2hhbmdlZChjbSkge1xuICAgIGNtLmRpc3BsYXkud3JhcHBlci5jbGFzc05hbWUgPSBjbS5kaXNwbGF5LndyYXBwZXIuY2xhc3NOYW1lLnJlcGxhY2UoL1xccypjbS1zLVxcUysvZywgXCJcIikgKyBjbS5vcHRpb25zLnRoZW1lLnJlcGxhY2UoLyhefFxccylcXHMqL2csIFwiIGNtLXMtXCIpO1xuICAgIGNsZWFyQ2FjaGVzKGNtKTtcbiAgfVxuXG4gIHZhciBJbml0ID0ge1xuICAgIHRvU3RyaW5nOiBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICAgIHJldHVybiBcIkNvZGVNaXJyb3IuSW5pdFwiO1xuICAgIH1cbiAgfTtcbiAgdmFyIGRlZmF1bHRzID0ge307XG4gIHZhciBvcHRpb25IYW5kbGVycyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGRlZmluZU9wdGlvbnMoQ29kZU1pcnJvcikge1xuICAgIHZhciBvcHRpb25IYW5kbGVycyA9IENvZGVNaXJyb3Iub3B0aW9uSGFuZGxlcnM7XG5cbiAgICBmdW5jdGlvbiBvcHRpb24obmFtZSwgZGVmbHQsIGhhbmRsZSwgbm90T25Jbml0KSB7XG4gICAgICBDb2RlTWlycm9yLmRlZmF1bHRzW25hbWVdID0gZGVmbHQ7XG5cbiAgICAgIGlmIChoYW5kbGUpIHtcbiAgICAgICAgb3B0aW9uSGFuZGxlcnNbbmFtZV0gPSBub3RPbkluaXQgPyBmdW5jdGlvbiAoY20sIHZhbCwgb2xkKSB7XG4gICAgICAgICAgaWYgKG9sZCAhPSBJbml0KSB7XG4gICAgICAgICAgICBoYW5kbGUoY20sIHZhbCwgb2xkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gOiBoYW5kbGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgQ29kZU1pcnJvci5kZWZpbmVPcHRpb24gPSBvcHRpb247IC8vIFBhc3NlZCB0byBvcHRpb24gaGFuZGxlcnMgd2hlbiB0aGVyZSBpcyBubyBvbGQgdmFsdWUuXG5cbiAgICBDb2RlTWlycm9yLkluaXQgPSBJbml0OyAvLyBUaGVzZSB0d28gYXJlLCBvbiBpbml0LCBjYWxsZWQgZnJvbSB0aGUgY29uc3RydWN0b3IgYmVjYXVzZSB0aGV5XG4gICAgLy8gaGF2ZSB0byBiZSBpbml0aWFsaXplZCBiZWZvcmUgdGhlIGVkaXRvciBjYW4gc3RhcnQgYXQgYWxsLlxuXG4gICAgb3B0aW9uKFwidmFsdWVcIiwgXCJcIiwgZnVuY3Rpb24gKGNtLCB2YWwpIHtcbiAgICAgIHJldHVybiBjbS5zZXRWYWx1ZSh2YWwpO1xuICAgIH0sIHRydWUpO1xuICAgIG9wdGlvbihcIm1vZGVcIiwgbnVsbCwgZnVuY3Rpb24gKGNtLCB2YWwpIHtcbiAgICAgIGNtLmRvYy5tb2RlT3B0aW9uID0gdmFsO1xuICAgICAgbG9hZE1vZGUoY20pO1xuICAgIH0sIHRydWUpO1xuICAgIG9wdGlvbihcImluZGVudFVuaXRcIiwgMiwgbG9hZE1vZGUsIHRydWUpO1xuICAgIG9wdGlvbihcImluZGVudFdpdGhUYWJzXCIsIGZhbHNlKTtcbiAgICBvcHRpb24oXCJzbWFydEluZGVudFwiLCB0cnVlKTtcbiAgICBvcHRpb24oXCJ0YWJTaXplXCIsIDQsIGZ1bmN0aW9uIChjbSkge1xuICAgICAgcmVzZXRNb2RlU3RhdGUoY20pO1xuICAgICAgY2xlYXJDYWNoZXMoY20pO1xuICAgICAgcmVnQ2hhbmdlKGNtKTtcbiAgICB9LCB0cnVlKTtcbiAgICBvcHRpb24oXCJsaW5lU2VwYXJhdG9yXCIsIG51bGwsIGZ1bmN0aW9uIChjbSwgdmFsKSB7XG4gICAgICBjbS5kb2MubGluZVNlcCA9IHZhbDtcblxuICAgICAgaWYgKCF2YWwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgbmV3QnJlYWtzID0gW10sXG4gICAgICAgICAgbGluZU5vID0gY20uZG9jLmZpcnN0O1xuICAgICAgY20uZG9jLml0ZXIoZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgZm9yICh2YXIgcG9zID0gMDs7KSB7XG4gICAgICAgICAgdmFyIGZvdW5kID0gbGluZS50ZXh0LmluZGV4T2YodmFsLCBwb3MpO1xuXG4gICAgICAgICAgaWYgKGZvdW5kID09IC0xKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwb3MgPSBmb3VuZCArIHZhbC5sZW5ndGg7XG4gICAgICAgICAgbmV3QnJlYWtzLnB1c2goUG9zKGxpbmVObywgZm91bmQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpbmVObysrO1xuICAgICAgfSk7XG5cbiAgICAgIGZvciAodmFyIGkgPSBuZXdCcmVha3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgX3JlcGxhY2VSYW5nZShjbS5kb2MsIHZhbCwgbmV3QnJlYWtzW2ldLCBQb3MobmV3QnJlYWtzW2ldLmxpbmUsIG5ld0JyZWFrc1tpXS5jaCArIHZhbC5sZW5ndGgpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBvcHRpb24oXCJzcGVjaWFsQ2hhcnNcIiwgL1tcXHUwMDAwLVxcdTAwMWZcXHUwMDdmXFx1MDBhZFxcdTA2MWNcXHUyMDBiLVxcdTIwMGZcXHUyMDI4XFx1MjAyOVxcdWZlZmZdL2csIGZ1bmN0aW9uIChjbSwgdmFsLCBvbGQpIHtcbiAgICAgIGNtLnN0YXRlLnNwZWNpYWxDaGFycyA9IG5ldyBSZWdFeHAodmFsLnNvdXJjZSArICh2YWwudGVzdChcIlxcdFwiKSA/IFwiXCIgOiBcInxcXHRcIiksIFwiZ1wiKTtcblxuICAgICAgaWYgKG9sZCAhPSBJbml0KSB7XG4gICAgICAgIGNtLnJlZnJlc2goKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBvcHRpb24oXCJzcGVjaWFsQ2hhclBsYWNlaG9sZGVyXCIsIGRlZmF1bHRTcGVjaWFsQ2hhclBsYWNlaG9sZGVyLCBmdW5jdGlvbiAoY20pIHtcbiAgICAgIHJldHVybiBjbS5yZWZyZXNoKCk7XG4gICAgfSwgdHJ1ZSk7XG4gICAgb3B0aW9uKFwiZWxlY3RyaWNDaGFyc1wiLCB0cnVlKTtcbiAgICBvcHRpb24oXCJpbnB1dFN0eWxlXCIsIG1vYmlsZSA/IFwiY29udGVudGVkaXRhYmxlXCIgOiBcInRleHRhcmVhXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlucHV0U3R5bGUgY2FuIG5vdCAoeWV0KSBiZSBjaGFuZ2VkIGluIGEgcnVubmluZyBlZGl0b3JcIik7IC8vIEZJWE1FXG4gICAgfSwgdHJ1ZSk7XG4gICAgb3B0aW9uKFwic3BlbGxjaGVja1wiLCBmYWxzZSwgZnVuY3Rpb24gKGNtLCB2YWwpIHtcbiAgICAgIHJldHVybiBjbS5nZXRJbnB1dEZpZWxkKCkuc3BlbGxjaGVjayA9IHZhbDtcbiAgICB9LCB0cnVlKTtcbiAgICBvcHRpb24oXCJydGxNb3ZlVmlzdWFsbHlcIiwgIXdpbmRvd3MpO1xuICAgIG9wdGlvbihcIndob2xlTGluZVVwZGF0ZUJlZm9yZVwiLCB0cnVlKTtcbiAgICBvcHRpb24oXCJ0aGVtZVwiLCBcImRlZmF1bHRcIiwgZnVuY3Rpb24gKGNtKSB7XG4gICAgICB0aGVtZUNoYW5nZWQoY20pO1xuICAgICAgZ3V0dGVyc0NoYW5nZWQoY20pO1xuICAgIH0sIHRydWUpO1xuICAgIG9wdGlvbihcImtleU1hcFwiLCBcImRlZmF1bHRcIiwgZnVuY3Rpb24gKGNtLCB2YWwsIG9sZCkge1xuICAgICAgdmFyIG5leHQgPSBnZXRLZXlNYXAodmFsKTtcbiAgICAgIHZhciBwcmV2ID0gb2xkICE9IEluaXQgJiYgZ2V0S2V5TWFwKG9sZCk7XG5cbiAgICAgIGlmIChwcmV2ICYmIHByZXYuZGV0YWNoKSB7XG4gICAgICAgIHByZXYuZGV0YWNoKGNtLCBuZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5leHQuYXR0YWNoKSB7XG4gICAgICAgIG5leHQuYXR0YWNoKGNtLCBwcmV2IHx8IG51bGwpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG9wdGlvbihcImV4dHJhS2V5c1wiLCBudWxsKTtcbiAgICBvcHRpb24oXCJsaW5lV3JhcHBpbmdcIiwgZmFsc2UsIHdyYXBwaW5nQ2hhbmdlZCwgdHJ1ZSk7XG4gICAgb3B0aW9uKFwiZ3V0dGVyc1wiLCBbXSwgZnVuY3Rpb24gKGNtKSB7XG4gICAgICBzZXRHdXR0ZXJzRm9yTGluZU51bWJlcnMoY20ub3B0aW9ucyk7XG4gICAgICBndXR0ZXJzQ2hhbmdlZChjbSk7XG4gICAgfSwgdHJ1ZSk7XG4gICAgb3B0aW9uKFwiZml4ZWRHdXR0ZXJcIiwgdHJ1ZSwgZnVuY3Rpb24gKGNtLCB2YWwpIHtcbiAgICAgIGNtLmRpc3BsYXkuZ3V0dGVycy5zdHlsZS5sZWZ0ID0gdmFsID8gY29tcGVuc2F0ZUZvckhTY3JvbGwoY20uZGlzcGxheSkgKyBcInB4XCIgOiBcIjBcIjtcbiAgICAgIGNtLnJlZnJlc2goKTtcbiAgICB9LCB0cnVlKTtcbiAgICBvcHRpb24oXCJjb3Zlckd1dHRlck5leHRUb1Njcm9sbGJhclwiLCBmYWxzZSwgZnVuY3Rpb24gKGNtKSB7XG4gICAgICByZXR1cm4gdXBkYXRlU2Nyb2xsYmFycyhjbSk7XG4gICAgfSwgdHJ1ZSk7XG4gICAgb3B0aW9uKFwic2Nyb2xsYmFyU3R5bGVcIiwgXCJuYXRpdmVcIiwgZnVuY3Rpb24gKGNtKSB7XG4gICAgICBpbml0U2Nyb2xsYmFycyhjbSk7XG4gICAgICB1cGRhdGVTY3JvbGxiYXJzKGNtKTtcbiAgICAgIGNtLmRpc3BsYXkuc2Nyb2xsYmFycy5zZXRTY3JvbGxUb3AoY20uZG9jLnNjcm9sbFRvcCk7XG4gICAgICBjbS5kaXNwbGF5LnNjcm9sbGJhcnMuc2V0U2Nyb2xsTGVmdChjbS5kb2Muc2Nyb2xsTGVmdCk7XG4gICAgfSwgdHJ1ZSk7XG4gICAgb3B0aW9uKFwibGluZU51bWJlcnNcIiwgZmFsc2UsIGZ1bmN0aW9uIChjbSkge1xuICAgICAgc2V0R3V0dGVyc0ZvckxpbmVOdW1iZXJzKGNtLm9wdGlvbnMpO1xuICAgICAgZ3V0dGVyc0NoYW5nZWQoY20pO1xuICAgIH0sIHRydWUpO1xuICAgIG9wdGlvbihcImZpcnN0TGluZU51bWJlclwiLCAxLCBndXR0ZXJzQ2hhbmdlZCwgdHJ1ZSk7XG4gICAgb3B0aW9uKFwibGluZU51bWJlckZvcm1hdHRlclwiLCBmdW5jdGlvbiAoaW50ZWdlcikge1xuICAgICAgcmV0dXJuIGludGVnZXI7XG4gICAgfSwgZ3V0dGVyc0NoYW5nZWQsIHRydWUpO1xuICAgIG9wdGlvbihcInNob3dDdXJzb3JXaGVuU2VsZWN0aW5nXCIsIGZhbHNlLCB1cGRhdGVTZWxlY3Rpb24sIHRydWUpO1xuICAgIG9wdGlvbihcInJlc2V0U2VsZWN0aW9uT25Db250ZXh0TWVudVwiLCB0cnVlKTtcbiAgICBvcHRpb24oXCJsaW5lV2lzZUNvcHlDdXRcIiwgdHJ1ZSk7XG4gICAgb3B0aW9uKFwicmVhZE9ubHlcIiwgZmFsc2UsIGZ1bmN0aW9uIChjbSwgdmFsKSB7XG4gICAgICBpZiAodmFsID09IFwibm9jdXJzb3JcIikge1xuICAgICAgICBvbkJsdXIoY20pO1xuICAgICAgICBjbS5kaXNwbGF5LmlucHV0LmJsdXIoKTtcbiAgICAgICAgY20uZGlzcGxheS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjbS5kaXNwbGF5LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGNtLmRpc3BsYXkuaW5wdXQucmVhZE9ubHlDaGFuZ2VkKHZhbCk7XG4gICAgfSk7XG4gICAgb3B0aW9uKFwiZGlzYWJsZUlucHV0XCIsIGZhbHNlLCBmdW5jdGlvbiAoY20sIHZhbCkge1xuICAgICAgaWYgKCF2YWwpIHtcbiAgICAgICAgY20uZGlzcGxheS5pbnB1dC5yZXNldCgpO1xuICAgICAgfVxuICAgIH0sIHRydWUpO1xuICAgIG9wdGlvbihcImRyYWdEcm9wXCIsIHRydWUsIGRyYWdEcm9wQ2hhbmdlZCk7XG4gICAgb3B0aW9uKFwiYWxsb3dEcm9wRmlsZVR5cGVzXCIsIG51bGwpO1xuICAgIG9wdGlvbihcImN1cnNvckJsaW5rUmF0ZVwiLCA1MzApO1xuICAgIG9wdGlvbihcImN1cnNvclNjcm9sbE1hcmdpblwiLCAwKTtcbiAgICBvcHRpb24oXCJjdXJzb3JIZWlnaHRcIiwgMSwgdXBkYXRlU2VsZWN0aW9uLCB0cnVlKTtcbiAgICBvcHRpb24oXCJzaW5nbGVDdXJzb3JIZWlnaHRQZXJMaW5lXCIsIHRydWUsIHVwZGF0ZVNlbGVjdGlvbiwgdHJ1ZSk7XG4gICAgb3B0aW9uKFwid29ya1RpbWVcIiwgMTAwKTtcbiAgICBvcHRpb24oXCJ3b3JrRGVsYXlcIiwgMTAwKTtcbiAgICBvcHRpb24oXCJmbGF0dGVuU3BhbnNcIiwgdHJ1ZSwgcmVzZXRNb2RlU3RhdGUsIHRydWUpO1xuICAgIG9wdGlvbihcImFkZE1vZGVDbGFzc1wiLCBmYWxzZSwgcmVzZXRNb2RlU3RhdGUsIHRydWUpO1xuICAgIG9wdGlvbihcInBvbGxJbnRlcnZhbFwiLCAxMDApO1xuICAgIG9wdGlvbihcInVuZG9EZXB0aFwiLCAyMDAsIGZ1bmN0aW9uIChjbSwgdmFsKSB7XG4gICAgICByZXR1cm4gY20uZG9jLmhpc3RvcnkudW5kb0RlcHRoID0gdmFsO1xuICAgIH0pO1xuICAgIG9wdGlvbihcImhpc3RvcnlFdmVudERlbGF5XCIsIDEyNTApO1xuICAgIG9wdGlvbihcInZpZXdwb3J0TWFyZ2luXCIsIDEwLCBmdW5jdGlvbiAoY20pIHtcbiAgICAgIHJldHVybiBjbS5yZWZyZXNoKCk7XG4gICAgfSwgdHJ1ZSk7XG4gICAgb3B0aW9uKFwibWF4SGlnaGxpZ2h0TGVuZ3RoXCIsIDEwMDAwLCByZXNldE1vZGVTdGF0ZSwgdHJ1ZSk7XG4gICAgb3B0aW9uKFwibW92ZUlucHV0V2l0aEN1cnNvclwiLCB0cnVlLCBmdW5jdGlvbiAoY20sIHZhbCkge1xuICAgICAgaWYgKCF2YWwpIHtcbiAgICAgICAgY20uZGlzcGxheS5pbnB1dC5yZXNldFBvc2l0aW9uKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgb3B0aW9uKFwidGFiaW5kZXhcIiwgbnVsbCwgZnVuY3Rpb24gKGNtLCB2YWwpIHtcbiAgICAgIHJldHVybiBjbS5kaXNwbGF5LmlucHV0LmdldEZpZWxkKCkudGFiSW5kZXggPSB2YWwgfHwgXCJcIjtcbiAgICB9KTtcbiAgICBvcHRpb24oXCJhdXRvZm9jdXNcIiwgbnVsbCk7XG4gIH1cblxuICBmdW5jdGlvbiBndXR0ZXJzQ2hhbmdlZChjbSkge1xuICAgIHVwZGF0ZUd1dHRlcnMoY20pO1xuICAgIHJlZ0NoYW5nZShjbSk7XG4gICAgYWxpZ25Ib3Jpem9udGFsbHkoY20pO1xuICB9XG5cbiAgZnVuY3Rpb24gZHJhZ0Ryb3BDaGFuZ2VkKGNtLCB2YWx1ZSwgb2xkKSB7XG4gICAgdmFyIHdhc09uID0gb2xkICYmIG9sZCAhPSBJbml0O1xuXG4gICAgaWYgKCF2YWx1ZSAhPSAhd2FzT24pIHtcbiAgICAgIHZhciBmdW5jcyA9IGNtLmRpc3BsYXkuZHJhZ0Z1bmN0aW9ucztcbiAgICAgIHZhciB0b2dnbGUgPSB2YWx1ZSA/IG9uIDogb2ZmO1xuICAgICAgdG9nZ2xlKGNtLmRpc3BsYXkuc2Nyb2xsZXIsIFwiZHJhZ3N0YXJ0XCIsIGZ1bmNzLnN0YXJ0KTtcbiAgICAgIHRvZ2dsZShjbS5kaXNwbGF5LnNjcm9sbGVyLCBcImRyYWdlbnRlclwiLCBmdW5jcy5lbnRlcik7XG4gICAgICB0b2dnbGUoY20uZGlzcGxheS5zY3JvbGxlciwgXCJkcmFnb3ZlclwiLCBmdW5jcy5vdmVyKTtcbiAgICAgIHRvZ2dsZShjbS5kaXNwbGF5LnNjcm9sbGVyLCBcImRyYWdsZWF2ZVwiLCBmdW5jcy5sZWF2ZSk7XG4gICAgICB0b2dnbGUoY20uZGlzcGxheS5zY3JvbGxlciwgXCJkcm9wXCIsIGZ1bmNzLmRyb3ApO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHdyYXBwaW5nQ2hhbmdlZChjbSkge1xuICAgIGlmIChjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgICAgYWRkQ2xhc3MoY20uZGlzcGxheS53cmFwcGVyLCBcIkNvZGVNaXJyb3Itd3JhcFwiKTtcbiAgICAgIGNtLmRpc3BsYXkuc2l6ZXIuc3R5bGUubWluV2lkdGggPSBcIlwiO1xuICAgICAgY20uZGlzcGxheS5zaXplcldpZHRoID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcm1DbGFzcyhjbS5kaXNwbGF5LndyYXBwZXIsIFwiQ29kZU1pcnJvci13cmFwXCIpO1xuICAgICAgZmluZE1heExpbmUoY20pO1xuICAgIH1cblxuICAgIGVzdGltYXRlTGluZUhlaWdodHMoY20pO1xuICAgIHJlZ0NoYW5nZShjbSk7XG4gICAgY2xlYXJDYWNoZXMoY20pO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHVwZGF0ZVNjcm9sbGJhcnMoY20pO1xuICAgIH0sIDEwMCk7XG4gIH0gLy8gQSBDb2RlTWlycm9yIGluc3RhbmNlIHJlcHJlc2VudHMgYW4gZWRpdG9yLiBUaGlzIGlzIHRoZSBvYmplY3RcbiAgLy8gdGhhdCB1c2VyIGNvZGUgaXMgdXN1YWxseSBkZWFsaW5nIHdpdGguXG5cblxuICBmdW5jdGlvbiBDb2RlTWlycm9yKHBsYWNlLCBvcHRpb25zKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29kZU1pcnJvcikpIHtcbiAgICAgIHJldHVybiBuZXcgQ29kZU1pcnJvcihwbGFjZSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyA9IG9wdGlvbnMgPyBjb3B5T2JqKG9wdGlvbnMpIDoge307IC8vIERldGVybWluZSBlZmZlY3RpdmUgb3B0aW9ucyBiYXNlZCBvbiBnaXZlbiB2YWx1ZXMgYW5kIGRlZmF1bHRzLlxuXG4gICAgY29weU9iaihkZWZhdWx0cywgb3B0aW9ucywgZmFsc2UpO1xuICAgIHNldEd1dHRlcnNGb3JMaW5lTnVtYmVycyhvcHRpb25zKTtcbiAgICB2YXIgZG9jID0gb3B0aW9ucy52YWx1ZTtcblxuICAgIGlmICh0eXBlb2YgZG9jID09IFwic3RyaW5nXCIpIHtcbiAgICAgIGRvYyA9IG5ldyBEb2MoZG9jLCBvcHRpb25zLm1vZGUsIG51bGwsIG9wdGlvbnMubGluZVNlcGFyYXRvcik7XG4gICAgfVxuXG4gICAgdGhpcy5kb2MgPSBkb2M7XG4gICAgdmFyIGlucHV0ID0gbmV3IENvZGVNaXJyb3IuaW5wdXRTdHlsZXNbb3B0aW9ucy5pbnB1dFN0eWxlXSh0aGlzKTtcbiAgICB2YXIgZGlzcGxheSA9IHRoaXMuZGlzcGxheSA9IG5ldyBEaXNwbGF5KHBsYWNlLCBkb2MsIGlucHV0KTtcbiAgICBkaXNwbGF5LndyYXBwZXIuQ29kZU1pcnJvciA9IHRoaXM7XG4gICAgdXBkYXRlR3V0dGVycyh0aGlzKTtcbiAgICB0aGVtZUNoYW5nZWQodGhpcyk7XG5cbiAgICBpZiAob3B0aW9ucy5saW5lV3JhcHBpbmcpIHtcbiAgICAgIHRoaXMuZGlzcGxheS53cmFwcGVyLmNsYXNzTmFtZSArPSBcIiBDb2RlTWlycm9yLXdyYXBcIjtcbiAgICB9XG5cbiAgICBpbml0U2Nyb2xsYmFycyh0aGlzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAga2V5TWFwczogW10sXG4gICAgICAvLyBzdG9yZXMgbWFwcyBhZGRlZCBieSBhZGRLZXlNYXBcbiAgICAgIG92ZXJsYXlzOiBbXSxcbiAgICAgIC8vIGhpZ2hsaWdodGluZyBvdmVybGF5cywgYXMgYWRkZWQgYnkgYWRkT3ZlcmxheVxuICAgICAgbW9kZUdlbjogMCxcbiAgICAgIC8vIGJ1bXBlZCB3aGVuIG1vZGUvb3ZlcmxheSBjaGFuZ2VzLCB1c2VkIHRvIGludmFsaWRhdGUgaGlnaGxpZ2h0aW5nIGluZm9cbiAgICAgIG92ZXJ3cml0ZTogZmFsc2UsXG4gICAgICBkZWxheWluZ0JsdXJFdmVudDogZmFsc2UsXG4gICAgICBmb2N1c2VkOiBmYWxzZSxcbiAgICAgIHN1cHByZXNzRWRpdHM6IGZhbHNlLFxuICAgICAgLy8gdXNlZCB0byBkaXNhYmxlIGVkaXRpbmcgZHVyaW5nIGtleSBoYW5kbGVycyB3aGVuIGluIHJlYWRPbmx5IG1vZGVcbiAgICAgIHBhc3RlSW5jb21pbmc6IGZhbHNlLFxuICAgICAgY3V0SW5jb21pbmc6IGZhbHNlLFxuICAgICAgLy8gaGVscCByZWNvZ25pemUgcGFzdGUvY3V0IGVkaXRzIGluIGlucHV0LnBvbGxcbiAgICAgIHNlbGVjdGluZ1RleHQ6IGZhbHNlLFxuICAgICAgZHJhZ2dpbmdUZXh0OiBmYWxzZSxcbiAgICAgIGhpZ2hsaWdodDogbmV3IERlbGF5ZWQoKSxcbiAgICAgIC8vIHN0b3JlcyBoaWdobGlnaHQgd29ya2VyIHRpbWVvdXRcbiAgICAgIGtleVNlcTogbnVsbCxcbiAgICAgIC8vIFVuZmluaXNoZWQga2V5IHNlcXVlbmNlXG4gICAgICBzcGVjaWFsQ2hhcnM6IG51bGxcbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMuYXV0b2ZvY3VzICYmICFtb2JpbGUpIHtcbiAgICAgIGRpc3BsYXkuaW5wdXQuZm9jdXMoKTtcbiAgICB9IC8vIE92ZXJyaWRlIG1hZ2ljIHRleHRhcmVhIGNvbnRlbnQgcmVzdG9yZSB0aGF0IElFIHNvbWV0aW1lcyBkb2VzXG4gICAgLy8gb24gb3VyIGhpZGRlbiB0ZXh0YXJlYSBvbiByZWxvYWRcblxuXG4gICAgaWYgKGllICYmIGllX3ZlcnNpb24gPCAxMSkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzJDEuZGlzcGxheS5pbnB1dC5yZXNldCh0cnVlKTtcbiAgICAgIH0sIDIwKTtcbiAgICB9XG5cbiAgICByZWdpc3RlckV2ZW50SGFuZGxlcnModGhpcyk7XG4gICAgZW5zdXJlR2xvYmFsSGFuZGxlcnMoKTtcbiAgICBzdGFydE9wZXJhdGlvbih0aGlzKTtcbiAgICB0aGlzLmN1ck9wLmZvcmNlVXBkYXRlID0gdHJ1ZTtcbiAgICBhdHRhY2hEb2ModGhpcywgZG9jKTtcblxuICAgIGlmIChvcHRpb25zLmF1dG9mb2N1cyAmJiAhbW9iaWxlIHx8IHRoaXMuaGFzRm9jdXMoKSkge1xuICAgICAgc2V0VGltZW91dChiaW5kKG9uRm9jdXMsIHRoaXMpLCAyMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9uQmx1cih0aGlzKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBvcHQgaW4gb3B0aW9uSGFuZGxlcnMpIHtcbiAgICAgIGlmIChvcHRpb25IYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShvcHQpKSB7XG4gICAgICAgIG9wdGlvbkhhbmRsZXJzW29wdF0odGhpcyQxLCBvcHRpb25zW29wdF0sIEluaXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1heWJlVXBkYXRlTGluZU51bWJlcldpZHRoKHRoaXMpO1xuXG4gICAgaWYgKG9wdGlvbnMuZmluaXNoSW5pdCkge1xuICAgICAgb3B0aW9ucy5maW5pc2hJbml0KHRoaXMpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5pdEhvb2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpbml0SG9va3NbaV0odGhpcyQxKTtcbiAgICB9XG5cbiAgICBlbmRPcGVyYXRpb24odGhpcyk7IC8vIFN1cHByZXNzIG9wdGltaXplbGVnaWJpbGl0eSBpbiBXZWJraXQsIHNpbmNlIGl0IGJyZWFrcyB0ZXh0XG4gICAgLy8gbWVhc3VyaW5nIG9uIGxpbmUgd3JhcHBpbmcgYm91bmRhcmllcy5cblxuICAgIGlmICh3ZWJraXQgJiYgb3B0aW9ucy5saW5lV3JhcHBpbmcgJiYgZ2V0Q29tcHV0ZWRTdHlsZShkaXNwbGF5LmxpbmVEaXYpLnRleHRSZW5kZXJpbmcgPT0gXCJvcHRpbWl6ZWxlZ2liaWxpdHlcIikge1xuICAgICAgZGlzcGxheS5saW5lRGl2LnN0eWxlLnRleHRSZW5kZXJpbmcgPSBcImF1dG9cIjtcbiAgICB9XG4gIH0gLy8gVGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvcHRpb25zLlxuXG5cbiAgQ29kZU1pcnJvci5kZWZhdWx0cyA9IGRlZmF1bHRzOyAvLyBGdW5jdGlvbnMgdG8gcnVuIHdoZW4gb3B0aW9ucyBhcmUgY2hhbmdlZC5cblxuICBDb2RlTWlycm9yLm9wdGlvbkhhbmRsZXJzID0gb3B0aW9uSGFuZGxlcnM7IC8vIEF0dGFjaCB0aGUgbmVjZXNzYXJ5IGV2ZW50IGhhbmRsZXJzIHdoZW4gaW5pdGlhbGl6aW5nIHRoZSBlZGl0b3JcblxuICBmdW5jdGlvbiByZWdpc3RlckV2ZW50SGFuZGxlcnMoY20pIHtcbiAgICB2YXIgZCA9IGNtLmRpc3BsYXk7XG4gICAgb24oZC5zY3JvbGxlciwgXCJtb3VzZWRvd25cIiwgb3BlcmF0aW9uKGNtLCBvbk1vdXNlRG93bikpOyAvLyBPbGRlciBJRSdzIHdpbGwgbm90IGZpcmUgYSBzZWNvbmQgbW91c2Vkb3duIGZvciBhIGRvdWJsZSBjbGlja1xuXG4gICAgaWYgKGllICYmIGllX3ZlcnNpb24gPCAxMSkge1xuICAgICAgb24oZC5zY3JvbGxlciwgXCJkYmxjbGlja1wiLCBvcGVyYXRpb24oY20sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChzaWduYWxET01FdmVudChjbSwgZSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcG9zID0gcG9zRnJvbU1vdXNlKGNtLCBlKTtcblxuICAgICAgICBpZiAoIXBvcyB8fCBjbGlja0luR3V0dGVyKGNtLCBlKSB8fCBldmVudEluV2lkZ2V0KGNtLmRpc3BsYXksIGUpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICAgICAgdmFyIHdvcmQgPSBjbS5maW5kV29yZEF0KHBvcyk7XG4gICAgICAgIGV4dGVuZFNlbGVjdGlvbihjbS5kb2MsIHdvcmQuYW5jaG9yLCB3b3JkLmhlYWQpO1xuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbihkLnNjcm9sbGVyLCBcImRibGNsaWNrXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBzaWduYWxET01FdmVudChjbSwgZSkgfHwgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICAgIH0pO1xuICAgIH0gLy8gU29tZSBicm93c2VycyBmaXJlIGNvbnRleHRtZW51ICphZnRlciogb3BlbmluZyB0aGUgbWVudSwgYXRcbiAgICAvLyB3aGljaCBwb2ludCB3ZSBjYW4ndCBtZXNzIHdpdGggaXQgYW55bW9yZS4gQ29udGV4dCBtZW51IGlzXG4gICAgLy8gaGFuZGxlZCBpbiBvbk1vdXNlRG93biBmb3IgdGhlc2UgYnJvd3NlcnMuXG5cblxuICAgIGlmICghY2FwdHVyZVJpZ2h0Q2xpY2spIHtcbiAgICAgIG9uKGQuc2Nyb2xsZXIsIFwiY29udGV4dG1lbnVcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgcmV0dXJuIG9uQ29udGV4dE1lbnUoY20sIGUpO1xuICAgICAgfSk7XG4gICAgfSAvLyBVc2VkIHRvIHN1cHByZXNzIG1vdXNlIGV2ZW50IGhhbmRsaW5nIHdoZW4gYSB0b3VjaCBoYXBwZW5zXG5cblxuICAgIHZhciB0b3VjaEZpbmlzaGVkLFxuICAgICAgICBwcmV2VG91Y2ggPSB7XG4gICAgICBlbmQ6IDBcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZmluaXNoVG91Y2goKSB7XG4gICAgICBpZiAoZC5hY3RpdmVUb3VjaCkge1xuICAgICAgICB0b3VjaEZpbmlzaGVkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGQuYWN0aXZlVG91Y2ggPSBudWxsO1xuICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgcHJldlRvdWNoID0gZC5hY3RpdmVUb3VjaDtcbiAgICAgICAgcHJldlRvdWNoLmVuZCA9ICtuZXcgRGF0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzTW91c2VMaWtlVG91Y2hFdmVudChlKSB7XG4gICAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCAhPSAxKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRvdWNoID0gZS50b3VjaGVzWzBdO1xuICAgICAgcmV0dXJuIHRvdWNoLnJhZGl1c1ggPD0gMSAmJiB0b3VjaC5yYWRpdXNZIDw9IDE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmFyQXdheSh0b3VjaCwgb3RoZXIpIHtcbiAgICAgIGlmIChvdGhlci5sZWZ0ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBkeCA9IG90aGVyLmxlZnQgLSB0b3VjaC5sZWZ0LFxuICAgICAgICAgIGR5ID0gb3RoZXIudG9wIC0gdG91Y2gudG9wO1xuICAgICAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5ID4gMjAgKiAyMDtcbiAgICB9XG5cbiAgICBvbihkLnNjcm9sbGVyLCBcInRvdWNoc3RhcnRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmICghc2lnbmFsRE9NRXZlbnQoY20sIGUpICYmICFpc01vdXNlTGlrZVRvdWNoRXZlbnQoZSkpIHtcbiAgICAgICAgZC5pbnB1dC5lbnN1cmVQb2xsZWQoKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRvdWNoRmluaXNoZWQpO1xuICAgICAgICB2YXIgbm93ID0gK25ldyBEYXRlKCk7XG4gICAgICAgIGQuYWN0aXZlVG91Y2ggPSB7XG4gICAgICAgICAgc3RhcnQ6IG5vdyxcbiAgICAgICAgICBtb3ZlZDogZmFsc2UsXG4gICAgICAgICAgcHJldjogbm93IC0gcHJldlRvdWNoLmVuZCA8PSAzMDAgPyBwcmV2VG91Y2ggOiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGUudG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgIGQuYWN0aXZlVG91Y2gubGVmdCA9IGUudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgICAgICBkLmFjdGl2ZVRvdWNoLnRvcCA9IGUudG91Y2hlc1swXS5wYWdlWTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIG9uKGQuc2Nyb2xsZXIsIFwidG91Y2htb3ZlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChkLmFjdGl2ZVRvdWNoKSB7XG4gICAgICAgIGQuYWN0aXZlVG91Y2gubW92ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG9uKGQuc2Nyb2xsZXIsIFwidG91Y2hlbmRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciB0b3VjaCA9IGQuYWN0aXZlVG91Y2g7XG5cbiAgICAgIGlmICh0b3VjaCAmJiAhZXZlbnRJbldpZGdldChkLCBlKSAmJiB0b3VjaC5sZWZ0ICE9IG51bGwgJiYgIXRvdWNoLm1vdmVkICYmIG5ldyBEYXRlKCkgLSB0b3VjaC5zdGFydCA8IDMwMCkge1xuICAgICAgICB2YXIgcG9zID0gY20uY29vcmRzQ2hhcihkLmFjdGl2ZVRvdWNoLCBcInBhZ2VcIiksXG4gICAgICAgICAgICByYW5nZTtcblxuICAgICAgICBpZiAoIXRvdWNoLnByZXYgfHwgZmFyQXdheSh0b3VjaCwgdG91Y2gucHJldikpIC8vIFNpbmdsZSB0YXBcbiAgICAgICAgICB7XG4gICAgICAgICAgICByYW5nZSA9IG5ldyBSYW5nZShwb3MsIHBvcyk7XG4gICAgICAgICAgfSBlbHNlIGlmICghdG91Y2gucHJldi5wcmV2IHx8IGZhckF3YXkodG91Y2gsIHRvdWNoLnByZXYucHJldikpIC8vIERvdWJsZSB0YXBcbiAgICAgICAgICB7XG4gICAgICAgICAgICByYW5nZSA9IGNtLmZpbmRXb3JkQXQocG9zKTtcbiAgICAgICAgICB9IGVsc2UgLy8gVHJpcGxlIHRhcFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHJhbmdlID0gbmV3IFJhbmdlKFBvcyhwb3MubGluZSwgMCksIF9jbGlwUG9zKGNtLmRvYywgUG9zKHBvcy5saW5lICsgMSwgMCkpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgY20uc2V0U2VsZWN0aW9uKHJhbmdlLmFuY2hvciwgcmFuZ2UuaGVhZCk7XG4gICAgICAgIGNtLmZvY3VzKCk7XG4gICAgICAgIGVfcHJldmVudERlZmF1bHQoZSk7XG4gICAgICB9XG5cbiAgICAgIGZpbmlzaFRvdWNoKCk7XG4gICAgfSk7XG4gICAgb24oZC5zY3JvbGxlciwgXCJ0b3VjaGNhbmNlbFwiLCBmaW5pc2hUb3VjaCk7IC8vIFN5bmMgc2Nyb2xsaW5nIGJldHdlZW4gZmFrZSBzY3JvbGxiYXJzIGFuZCByZWFsIHNjcm9sbGFibGVcbiAgICAvLyBhcmVhLCBlbnN1cmUgdmlld3BvcnQgaXMgdXBkYXRlZCB3aGVuIHNjcm9sbGluZy5cblxuICAgIG9uKGQuc2Nyb2xsZXIsIFwic2Nyb2xsXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChkLnNjcm9sbGVyLmNsaWVudEhlaWdodCkge1xuICAgICAgICBzZXRTY3JvbGxUb3AoY20sIGQuc2Nyb2xsZXIuc2Nyb2xsVG9wKTtcbiAgICAgICAgc2V0U2Nyb2xsTGVmdChjbSwgZC5zY3JvbGxlci5zY3JvbGxMZWZ0LCB0cnVlKTtcbiAgICAgICAgc2lnbmFsKGNtLCBcInNjcm9sbFwiLCBjbSk7XG4gICAgICB9XG4gICAgfSk7IC8vIExpc3RlbiB0byB3aGVlbCBldmVudHMgaW4gb3JkZXIgdG8gdHJ5IGFuZCB1cGRhdGUgdGhlIHZpZXdwb3J0IG9uIHRpbWUuXG5cbiAgICBvbihkLnNjcm9sbGVyLCBcIm1vdXNld2hlZWxcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIHJldHVybiBvblNjcm9sbFdoZWVsKGNtLCBlKTtcbiAgICB9KTtcbiAgICBvbihkLnNjcm9sbGVyLCBcIkRPTU1vdXNlU2Nyb2xsXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICByZXR1cm4gb25TY3JvbGxXaGVlbChjbSwgZSk7XG4gICAgfSk7IC8vIFByZXZlbnQgd3JhcHBlciBmcm9tIGV2ZXIgc2Nyb2xsaW5nXG5cbiAgICBvbihkLndyYXBwZXIsIFwic2Nyb2xsXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBkLndyYXBwZXIuc2Nyb2xsVG9wID0gZC53cmFwcGVyLnNjcm9sbExlZnQgPSAwO1xuICAgIH0pO1xuICAgIGQuZHJhZ0Z1bmN0aW9ucyA9IHtcbiAgICAgIGVudGVyOiBmdW5jdGlvbiBlbnRlcihlKSB7XG4gICAgICAgIGlmICghc2lnbmFsRE9NRXZlbnQoY20sIGUpKSB7XG4gICAgICAgICAgZV9zdG9wKGUpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb3ZlcjogZnVuY3Rpb24gb3ZlcihlKSB7XG4gICAgICAgIGlmICghc2lnbmFsRE9NRXZlbnQoY20sIGUpKSB7XG4gICAgICAgICAgb25EcmFnT3ZlcihjbSwgZSk7XG4gICAgICAgICAgZV9zdG9wKGUpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KGUpIHtcbiAgICAgICAgcmV0dXJuIG9uRHJhZ1N0YXJ0KGNtLCBlKTtcbiAgICAgIH0sXG4gICAgICBkcm9wOiBvcGVyYXRpb24oY20sIG9uRHJvcCksXG4gICAgICBsZWF2ZTogZnVuY3Rpb24gbGVhdmUoZSkge1xuICAgICAgICBpZiAoIXNpZ25hbERPTUV2ZW50KGNtLCBlKSkge1xuICAgICAgICAgIGNsZWFyRHJhZ0N1cnNvcihjbSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIHZhciBpbnAgPSBkLmlucHV0LmdldEZpZWxkKCk7XG4gICAgb24oaW5wLCBcImtleXVwXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICByZXR1cm4gb25LZXlVcC5jYWxsKGNtLCBlKTtcbiAgICB9KTtcbiAgICBvbihpbnAsIFwia2V5ZG93blwiLCBvcGVyYXRpb24oY20sIG9uS2V5RG93bikpO1xuICAgIG9uKGlucCwgXCJrZXlwcmVzc1wiLCBvcGVyYXRpb24oY20sIG9uS2V5UHJlc3MpKTtcbiAgICBvbihpbnAsIFwiZm9jdXNcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIHJldHVybiBvbkZvY3VzKGNtLCBlKTtcbiAgICB9KTtcbiAgICBvbihpbnAsIFwiYmx1clwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgcmV0dXJuIG9uQmx1cihjbSwgZSk7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgaW5pdEhvb2tzID0gW107XG5cbiAgQ29kZU1pcnJvci5kZWZpbmVJbml0SG9vayA9IGZ1bmN0aW9uIChmKSB7XG4gICAgcmV0dXJuIGluaXRIb29rcy5wdXNoKGYpO1xuICB9OyAvLyBJbmRlbnQgdGhlIGdpdmVuIGxpbmUuIFRoZSBob3cgcGFyYW1ldGVyIGNhbiBiZSBcInNtYXJ0XCIsXG4gIC8vIFwiYWRkXCIvbnVsbCwgXCJzdWJ0cmFjdFwiLCBvciBcInByZXZcIi4gV2hlbiBhZ2dyZXNzaXZlIGlzIGZhbHNlXG4gIC8vICh0eXBpY2FsbHkgc2V0IHRvIHRydWUgZm9yIGZvcmNlZCBzaW5nbGUtbGluZSBpbmRlbnRzKSwgZW1wdHlcbiAgLy8gbGluZXMgYXJlIG5vdCBpbmRlbnRlZCwgYW5kIHBsYWNlcyB3aGVyZSB0aGUgbW9kZSByZXR1cm5zIFBhc3NcbiAgLy8gYXJlIGxlZnQgYWxvbmUuXG5cblxuICBmdW5jdGlvbiBpbmRlbnRMaW5lKGNtLCBuLCBob3csIGFnZ3Jlc3NpdmUpIHtcbiAgICB2YXIgZG9jID0gY20uZG9jLFxuICAgICAgICBzdGF0ZTtcblxuICAgIGlmIChob3cgPT0gbnVsbCkge1xuICAgICAgaG93ID0gXCJhZGRcIjtcbiAgICB9XG5cbiAgICBpZiAoaG93ID09IFwic21hcnRcIikge1xuICAgICAgLy8gRmFsbCBiYWNrIHRvIFwicHJldlwiIHdoZW4gdGhlIG1vZGUgZG9lc24ndCBoYXZlIGFuIGluZGVudGF0aW9uXG4gICAgICAvLyBtZXRob2QuXG4gICAgICBpZiAoIWRvYy5tb2RlLmluZGVudCkge1xuICAgICAgICBob3cgPSBcInByZXZcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlID0gZ2V0U3RhdGVCZWZvcmUoY20sIG4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciB0YWJTaXplID0gY20ub3B0aW9ucy50YWJTaXplO1xuICAgIHZhciBsaW5lID0gZ2V0TGluZShkb2MsIG4pLFxuICAgICAgICBjdXJTcGFjZSA9IGNvdW50Q29sdW1uKGxpbmUudGV4dCwgbnVsbCwgdGFiU2l6ZSk7XG5cbiAgICBpZiAobGluZS5zdGF0ZUFmdGVyKSB7XG4gICAgICBsaW5lLnN0YXRlQWZ0ZXIgPSBudWxsO1xuICAgIH1cblxuICAgIHZhciBjdXJTcGFjZVN0cmluZyA9IGxpbmUudGV4dC5tYXRjaCgvXlxccyovKVswXSxcbiAgICAgICAgaW5kZW50YXRpb247XG5cbiAgICBpZiAoIWFnZ3Jlc3NpdmUgJiYgIS9cXFMvLnRlc3QobGluZS50ZXh0KSkge1xuICAgICAgaW5kZW50YXRpb24gPSAwO1xuICAgICAgaG93ID0gXCJub3RcIjtcbiAgICB9IGVsc2UgaWYgKGhvdyA9PSBcInNtYXJ0XCIpIHtcbiAgICAgIGluZGVudGF0aW9uID0gZG9jLm1vZGUuaW5kZW50KHN0YXRlLCBsaW5lLnRleHQuc2xpY2UoY3VyU3BhY2VTdHJpbmcubGVuZ3RoKSwgbGluZS50ZXh0KTtcblxuICAgICAgaWYgKGluZGVudGF0aW9uID09IFBhc3MgfHwgaW5kZW50YXRpb24gPiAxNTApIHtcbiAgICAgICAgaWYgKCFhZ2dyZXNzaXZlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaG93ID0gXCJwcmV2XCI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhvdyA9PSBcInByZXZcIikge1xuICAgICAgaWYgKG4gPiBkb2MuZmlyc3QpIHtcbiAgICAgICAgaW5kZW50YXRpb24gPSBjb3VudENvbHVtbihnZXRMaW5lKGRvYywgbiAtIDEpLnRleHQsIG51bGwsIHRhYlNpemUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5kZW50YXRpb24gPSAwO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaG93ID09IFwiYWRkXCIpIHtcbiAgICAgIGluZGVudGF0aW9uID0gY3VyU3BhY2UgKyBjbS5vcHRpb25zLmluZGVudFVuaXQ7XG4gICAgfSBlbHNlIGlmIChob3cgPT0gXCJzdWJ0cmFjdFwiKSB7XG4gICAgICBpbmRlbnRhdGlvbiA9IGN1clNwYWNlIC0gY20ub3B0aW9ucy5pbmRlbnRVbml0O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGhvdyA9PSBcIm51bWJlclwiKSB7XG4gICAgICBpbmRlbnRhdGlvbiA9IGN1clNwYWNlICsgaG93O1xuICAgIH1cblxuICAgIGluZGVudGF0aW9uID0gTWF0aC5tYXgoMCwgaW5kZW50YXRpb24pO1xuICAgIHZhciBpbmRlbnRTdHJpbmcgPSBcIlwiLFxuICAgICAgICBwb3MgPSAwO1xuXG4gICAgaWYgKGNtLm9wdGlvbnMuaW5kZW50V2l0aFRhYnMpIHtcbiAgICAgIGZvciAodmFyIGkgPSBNYXRoLmZsb29yKGluZGVudGF0aW9uIC8gdGFiU2l6ZSk7IGk7IC0taSkge1xuICAgICAgICBwb3MgKz0gdGFiU2l6ZTtcbiAgICAgICAgaW5kZW50U3RyaW5nICs9IFwiXFx0XCI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvcyA8IGluZGVudGF0aW9uKSB7XG4gICAgICBpbmRlbnRTdHJpbmcgKz0gc3BhY2VTdHIoaW5kZW50YXRpb24gLSBwb3MpO1xuICAgIH1cblxuICAgIGlmIChpbmRlbnRTdHJpbmcgIT0gY3VyU3BhY2VTdHJpbmcpIHtcbiAgICAgIF9yZXBsYWNlUmFuZ2UoZG9jLCBpbmRlbnRTdHJpbmcsIFBvcyhuLCAwKSwgUG9zKG4sIGN1clNwYWNlU3RyaW5nLmxlbmd0aCksIFwiK2lucHV0XCIpO1xuXG4gICAgICBsaW5lLnN0YXRlQWZ0ZXIgPSBudWxsO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEVuc3VyZSB0aGF0LCBpZiB0aGUgY3Vyc29yIHdhcyBpbiB0aGUgd2hpdGVzcGFjZSBhdCB0aGUgc3RhcnRcbiAgICAgIC8vIG9mIHRoZSBsaW5lLCBpdCBpcyBtb3ZlZCB0byB0aGUgZW5kIG9mIHRoYXQgc3BhY2UuXG4gICAgICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCBkb2Muc2VsLnJhbmdlcy5sZW5ndGg7IGkkMSsrKSB7XG4gICAgICAgIHZhciByYW5nZSA9IGRvYy5zZWwucmFuZ2VzW2kkMV07XG5cbiAgICAgICAgaWYgKHJhbmdlLmhlYWQubGluZSA9PSBuICYmIHJhbmdlLmhlYWQuY2ggPCBjdXJTcGFjZVN0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgcG9zJDEgPSBQb3MobiwgY3VyU3BhY2VTdHJpbmcubGVuZ3RoKTtcbiAgICAgICAgICByZXBsYWNlT25lU2VsZWN0aW9uKGRvYywgaSQxLCBuZXcgUmFuZ2UocG9zJDEsIHBvcyQxKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gLy8gVGhpcyB3aWxsIGJlIHNldCB0byBhIHtsaW5lV2lzZTogYm9vbCwgdGV4dDogW3N0cmluZ119IG9iamVjdCwgc29cbiAgLy8gdGhhdCwgd2hlbiBwYXN0aW5nLCB3ZSBrbm93IHdoYXQga2luZCBvZiBzZWxlY3Rpb25zIHRoZSBjb3BpZWRcbiAgLy8gdGV4dCB3YXMgbWFkZSBvdXQgb2YuXG5cblxuICB2YXIgbGFzdENvcGllZCA9IG51bGw7XG5cbiAgZnVuY3Rpb24gc2V0TGFzdENvcGllZChuZXdMYXN0Q29waWVkKSB7XG4gICAgbGFzdENvcGllZCA9IG5ld0xhc3RDb3BpZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBseVRleHRJbnB1dChjbSwgaW5zZXJ0ZWQsIGRlbGV0ZWQsIHNlbCwgb3JpZ2luKSB7XG4gICAgdmFyIGRvYyA9IGNtLmRvYztcbiAgICBjbS5kaXNwbGF5LnNoaWZ0ID0gZmFsc2U7XG5cbiAgICBpZiAoIXNlbCkge1xuICAgICAgc2VsID0gZG9jLnNlbDtcbiAgICB9XG5cbiAgICB2YXIgcGFzdGUgPSBjbS5zdGF0ZS5wYXN0ZUluY29taW5nIHx8IG9yaWdpbiA9PSBcInBhc3RlXCI7XG4gICAgdmFyIHRleHRMaW5lcyA9IHNwbGl0TGluZXNBdXRvKGluc2VydGVkKSxcbiAgICAgICAgbXVsdGlQYXN0ZSA9IG51bGw7IC8vIFdoZW4gcGFzaW5nIE4gbGluZXMgaW50byBOIHNlbGVjdGlvbnMsIGluc2VydCBvbmUgbGluZSBwZXIgc2VsZWN0aW9uXG5cbiAgICBpZiAocGFzdGUgJiYgc2VsLnJhbmdlcy5sZW5ndGggPiAxKSB7XG4gICAgICBpZiAobGFzdENvcGllZCAmJiBsYXN0Q29waWVkLnRleHQuam9pbihcIlxcblwiKSA9PSBpbnNlcnRlZCkge1xuICAgICAgICBpZiAoc2VsLnJhbmdlcy5sZW5ndGggJSBsYXN0Q29waWVkLnRleHQubGVuZ3RoID09IDApIHtcbiAgICAgICAgICBtdWx0aVBhc3RlID0gW107XG5cbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RDb3BpZWQudGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbXVsdGlQYXN0ZS5wdXNoKGRvYy5zcGxpdExpbmVzKGxhc3RDb3BpZWQudGV4dFtpXSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0ZXh0TGluZXMubGVuZ3RoID09IHNlbC5yYW5nZXMubGVuZ3RoKSB7XG4gICAgICAgIG11bHRpUGFzdGUgPSBtYXAodGV4dExpbmVzLCBmdW5jdGlvbiAobCkge1xuICAgICAgICAgIHJldHVybiBbbF07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciB1cGRhdGVJbnB1dDsgLy8gTm9ybWFsIGJlaGF2aW9yIGlzIHRvIGluc2VydCB0aGUgbmV3IHRleHQgaW50byBldmVyeSBzZWxlY3Rpb25cblxuICAgIGZvciAodmFyIGkkMSA9IHNlbC5yYW5nZXMubGVuZ3RoIC0gMTsgaSQxID49IDA7IGkkMS0tKSB7XG4gICAgICB2YXIgcmFuZ2UgPSBzZWwucmFuZ2VzW2kkMV07XG4gICAgICB2YXIgZnJvbSA9IHJhbmdlLmZyb20oKSxcbiAgICAgICAgICB0byA9IHJhbmdlLnRvKCk7XG5cbiAgICAgIGlmIChyYW5nZS5lbXB0eSgpKSB7XG4gICAgICAgIGlmIChkZWxldGVkICYmIGRlbGV0ZWQgPiAwKSAvLyBIYW5kbGUgZGVsZXRpb25cbiAgICAgICAgICB7XG4gICAgICAgICAgICBmcm9tID0gUG9zKGZyb20ubGluZSwgZnJvbS5jaCAtIGRlbGV0ZWQpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY20uc3RhdGUub3ZlcndyaXRlICYmICFwYXN0ZSkgLy8gSGFuZGxlIG92ZXJ3cml0ZVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRvID0gUG9zKHRvLmxpbmUsIE1hdGgubWluKGdldExpbmUoZG9jLCB0by5saW5lKS50ZXh0Lmxlbmd0aCwgdG8uY2ggKyBsc3QodGV4dExpbmVzKS5sZW5ndGgpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGxhc3RDb3BpZWQgJiYgbGFzdENvcGllZC5saW5lV2lzZSAmJiBsYXN0Q29waWVkLnRleHQuam9pbihcIlxcblwiKSA9PSBpbnNlcnRlZCkge1xuICAgICAgICAgIGZyb20gPSB0byA9IFBvcyhmcm9tLmxpbmUsIDApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZUlucHV0ID0gY20uY3VyT3AudXBkYXRlSW5wdXQ7XG4gICAgICB2YXIgY2hhbmdlRXZlbnQgPSB7XG4gICAgICAgIGZyb206IGZyb20sXG4gICAgICAgIHRvOiB0byxcbiAgICAgICAgdGV4dDogbXVsdGlQYXN0ZSA/IG11bHRpUGFzdGVbaSQxICUgbXVsdGlQYXN0ZS5sZW5ndGhdIDogdGV4dExpbmVzLFxuICAgICAgICBvcmlnaW46IG9yaWdpbiB8fCAocGFzdGUgPyBcInBhc3RlXCIgOiBjbS5zdGF0ZS5jdXRJbmNvbWluZyA/IFwiY3V0XCIgOiBcIitpbnB1dFwiKVxuICAgICAgfTtcbiAgICAgIG1ha2VDaGFuZ2UoY20uZG9jLCBjaGFuZ2VFdmVudCk7XG4gICAgICBzaWduYWxMYXRlcihjbSwgXCJpbnB1dFJlYWRcIiwgY20sIGNoYW5nZUV2ZW50KTtcbiAgICB9XG5cbiAgICBpZiAoaW5zZXJ0ZWQgJiYgIXBhc3RlKSB7XG4gICAgICB0cmlnZ2VyRWxlY3RyaWMoY20sIGluc2VydGVkKTtcbiAgICB9XG5cbiAgICBlbnN1cmVDdXJzb3JWaXNpYmxlKGNtKTtcbiAgICBjbS5jdXJPcC51cGRhdGVJbnB1dCA9IHVwZGF0ZUlucHV0O1xuICAgIGNtLmN1ck9wLnR5cGluZyA9IHRydWU7XG4gICAgY20uc3RhdGUucGFzdGVJbmNvbWluZyA9IGNtLnN0YXRlLmN1dEluY29taW5nID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVQYXN0ZShlLCBjbSkge1xuICAgIHZhciBwYXN0ZWQgPSBlLmNsaXBib2FyZERhdGEgJiYgZS5jbGlwYm9hcmREYXRhLmdldERhdGEoXCJUZXh0XCIpO1xuXG4gICAgaWYgKHBhc3RlZCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAoIWNtLmlzUmVhZE9ubHkoKSAmJiAhY20ub3B0aW9ucy5kaXNhYmxlSW5wdXQpIHtcbiAgICAgICAgcnVuSW5PcChjbSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBhcHBseVRleHRJbnB1dChjbSwgcGFzdGVkLCAwLCBudWxsLCBcInBhc3RlXCIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdHJpZ2dlckVsZWN0cmljKGNtLCBpbnNlcnRlZCkge1xuICAgIC8vIFdoZW4gYW4gJ2VsZWN0cmljJyBjaGFyYWN0ZXIgaXMgaW5zZXJ0ZWQsIGltbWVkaWF0ZWx5IHRyaWdnZXIgYSByZWluZGVudFxuICAgIGlmICghY20ub3B0aW9ucy5lbGVjdHJpY0NoYXJzIHx8ICFjbS5vcHRpb25zLnNtYXJ0SW5kZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHNlbCA9IGNtLmRvYy5zZWw7XG5cbiAgICBmb3IgKHZhciBpID0gc2VsLnJhbmdlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIHJhbmdlID0gc2VsLnJhbmdlc1tpXTtcblxuICAgICAgaWYgKHJhbmdlLmhlYWQuY2ggPiAxMDAgfHwgaSAmJiBzZWwucmFuZ2VzW2kgLSAxXS5oZWFkLmxpbmUgPT0gcmFuZ2UuaGVhZC5saW5lKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgbW9kZSA9IGNtLmdldE1vZGVBdChyYW5nZS5oZWFkKTtcbiAgICAgIHZhciBpbmRlbnRlZCA9IGZhbHNlO1xuXG4gICAgICBpZiAobW9kZS5lbGVjdHJpY0NoYXJzKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbW9kZS5lbGVjdHJpY0NoYXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKGluc2VydGVkLmluZGV4T2YobW9kZS5lbGVjdHJpY0NoYXJzLmNoYXJBdChqKSkgPiAtMSkge1xuICAgICAgICAgICAgaW5kZW50ZWQgPSBpbmRlbnRMaW5lKGNtLCByYW5nZS5oZWFkLmxpbmUsIFwic21hcnRcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobW9kZS5lbGVjdHJpY0lucHV0KSB7XG4gICAgICAgIGlmIChtb2RlLmVsZWN0cmljSW5wdXQudGVzdChnZXRMaW5lKGNtLmRvYywgcmFuZ2UuaGVhZC5saW5lKS50ZXh0LnNsaWNlKDAsIHJhbmdlLmhlYWQuY2gpKSkge1xuICAgICAgICAgIGluZGVudGVkID0gaW5kZW50TGluZShjbSwgcmFuZ2UuaGVhZC5saW5lLCBcInNtYXJ0XCIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpbmRlbnRlZCkge1xuICAgICAgICBzaWduYWxMYXRlcihjbSwgXCJlbGVjdHJpY0lucHV0XCIsIGNtLCByYW5nZS5oZWFkLmxpbmUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvcHlhYmxlUmFuZ2VzKGNtKSB7XG4gICAgdmFyIHRleHQgPSBbXSxcbiAgICAgICAgcmFuZ2VzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNtLmRvYy5zZWwucmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbGluZSA9IGNtLmRvYy5zZWwucmFuZ2VzW2ldLmhlYWQubGluZTtcbiAgICAgIHZhciBsaW5lUmFuZ2UgPSB7XG4gICAgICAgIGFuY2hvcjogUG9zKGxpbmUsIDApLFxuICAgICAgICBoZWFkOiBQb3MobGluZSArIDEsIDApXG4gICAgICB9O1xuICAgICAgcmFuZ2VzLnB1c2gobGluZVJhbmdlKTtcbiAgICAgIHRleHQucHVzaChjbS5nZXRSYW5nZShsaW5lUmFuZ2UuYW5jaG9yLCBsaW5lUmFuZ2UuaGVhZCkpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgcmFuZ2VzOiByYW5nZXNcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZGlzYWJsZUJyb3dzZXJNYWdpYyhmaWVsZCwgc3BlbGxjaGVjaykge1xuICAgIGZpZWxkLnNldEF0dHJpYnV0ZShcImF1dG9jb3JyZWN0XCIsIFwib2ZmXCIpO1xuICAgIGZpZWxkLnNldEF0dHJpYnV0ZShcImF1dG9jYXBpdGFsaXplXCIsIFwib2ZmXCIpO1xuICAgIGZpZWxkLnNldEF0dHJpYnV0ZShcInNwZWxsY2hlY2tcIiwgISFzcGVsbGNoZWNrKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpZGRlblRleHRhcmVhKCkge1xuICAgIHZhciB0ZSA9IGVsdChcInRleHRhcmVhXCIsIG51bGwsIG51bGwsIFwicG9zaXRpb246IGFic29sdXRlOyBib3R0b206IC0xZW07IHBhZGRpbmc6IDA7IHdpZHRoOiAxcHg7IGhlaWdodDogMWVtOyBvdXRsaW5lOiBub25lXCIpO1xuICAgIHZhciBkaXYgPSBlbHQoXCJkaXZcIiwgW3RlXSwgbnVsbCwgXCJvdmVyZmxvdzogaGlkZGVuOyBwb3NpdGlvbjogcmVsYXRpdmU7IHdpZHRoOiAzcHg7IGhlaWdodDogMHB4O1wiKTsgLy8gVGhlIHRleHRhcmVhIGlzIGtlcHQgcG9zaXRpb25lZCBuZWFyIHRoZSBjdXJzb3IgdG8gcHJldmVudCB0aGVcbiAgICAvLyBmYWN0IHRoYXQgaXQnbGwgYmUgc2Nyb2xsZWQgaW50byB2aWV3IG9uIGlucHV0IGZyb20gc2Nyb2xsaW5nXG4gICAgLy8gb3VyIGZha2UgY3Vyc29yIG91dCBvZiB2aWV3LiBPbiB3ZWJraXQsIHdoZW4gd3JhcD1vZmYsIHBhc3RlIGlzXG4gICAgLy8gdmVyeSBzbG93LiBTbyBtYWtlIHRoZSBhcmVhIHdpZGUgaW5zdGVhZC5cblxuICAgIGlmICh3ZWJraXQpIHtcbiAgICAgIHRlLnN0eWxlLndpZHRoID0gXCIxMDAwcHhcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGUuc2V0QXR0cmlidXRlKFwid3JhcFwiLCBcIm9mZlwiKTtcbiAgICB9IC8vIElmIGJvcmRlcjogMDsgLS0gaU9TIGZhaWxzIHRvIG9wZW4ga2V5Ym9hcmQgKGlzc3VlICMxMjg3KVxuXG5cbiAgICBpZiAoaW9zKSB7XG4gICAgICB0ZS5zdHlsZS5ib3JkZXIgPSBcIjFweCBzb2xpZCBibGFja1wiO1xuICAgIH1cblxuICAgIGRpc2FibGVCcm93c2VyTWFnaWModGUpO1xuICAgIHJldHVybiBkaXY7XG4gIH0gLy8gVGhlIHB1YmxpY2x5IHZpc2libGUgQVBJLiBOb3RlIHRoYXQgbWV0aG9kT3AoZikgbWVhbnNcbiAgLy8gJ3dyYXAgZiBpbiBhbiBvcGVyYXRpb24sIHBlcmZvcm1lZCBvbiBpdHMgYHRoaXNgIHBhcmFtZXRlcicuXG4gIC8vIFRoaXMgaXMgbm90IHRoZSBjb21wbGV0ZSBzZXQgb2YgZWRpdG9yIG1ldGhvZHMuIE1vc3Qgb2YgdGhlXG4gIC8vIG1ldGhvZHMgZGVmaW5lZCBvbiB0aGUgRG9jIHR5cGUgYXJlIGFsc28gaW5qZWN0ZWQgaW50b1xuICAvLyBDb2RlTWlycm9yLnByb3RvdHlwZSwgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IGFuZFxuICAvLyBjb252ZW5pZW5jZS5cblxuXG4gIGZ1bmN0aW9uIGFkZEVkaXRvck1ldGhvZHMoQ29kZU1pcnJvcikge1xuICAgIHZhciBvcHRpb25IYW5kbGVycyA9IENvZGVNaXJyb3Iub3B0aW9uSGFuZGxlcnM7XG4gICAgdmFyIGhlbHBlcnMgPSBDb2RlTWlycm9yLmhlbHBlcnMgPSB7fTtcbiAgICBDb2RlTWlycm9yLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiBDb2RlTWlycm9yLFxuICAgICAgZm9jdXM6IGZ1bmN0aW9uIGZvY3VzKCkge1xuICAgICAgICB3aW5kb3cuZm9jdXMoKTtcbiAgICAgICAgdGhpcy5kaXNwbGF5LmlucHV0LmZvY3VzKCk7XG4gICAgICB9LFxuICAgICAgc2V0T3B0aW9uOiBmdW5jdGlvbiBzZXRPcHRpb24ob3B0aW9uLCB2YWx1ZSkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIG9sZCA9IG9wdGlvbnNbb3B0aW9uXTtcblxuICAgICAgICBpZiAob3B0aW9uc1tvcHRpb25dID09IHZhbHVlICYmIG9wdGlvbiAhPSBcIm1vZGVcIikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG9wdGlvbnNbb3B0aW9uXSA9IHZhbHVlO1xuXG4gICAgICAgIGlmIChvcHRpb25IYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShvcHRpb24pKSB7XG4gICAgICAgICAgb3BlcmF0aW9uKHRoaXMsIG9wdGlvbkhhbmRsZXJzW29wdGlvbl0pKHRoaXMsIHZhbHVlLCBvbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2lnbmFsKHRoaXMsIFwib3B0aW9uQ2hhbmdlXCIsIHRoaXMsIG9wdGlvbik7XG4gICAgICB9LFxuICAgICAgZ2V0T3B0aW9uOiBmdW5jdGlvbiBnZXRPcHRpb24ob3B0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNbb3B0aW9uXTtcbiAgICAgIH0sXG4gICAgICBnZXREb2M6IGZ1bmN0aW9uIGdldERvYygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZG9jO1xuICAgICAgfSxcbiAgICAgIGFkZEtleU1hcDogZnVuY3Rpb24gYWRkS2V5TWFwKG1hcCwgYm90dG9tKSB7XG4gICAgICAgIHRoaXMuc3RhdGUua2V5TWFwc1tib3R0b20gPyBcInB1c2hcIiA6IFwidW5zaGlmdFwiXShnZXRLZXlNYXAobWFwKSk7XG4gICAgICB9LFxuICAgICAgcmVtb3ZlS2V5TWFwOiBmdW5jdGlvbiByZW1vdmVLZXlNYXAobWFwKSB7XG4gICAgICAgIHZhciBtYXBzID0gdGhpcy5zdGF0ZS5rZXlNYXBzO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWFwcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGlmIChtYXBzW2ldID09IG1hcCB8fCBtYXBzW2ldLm5hbWUgPT0gbWFwKSB7XG4gICAgICAgICAgICBtYXBzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFkZE92ZXJsYXk6IG1ldGhvZE9wKGZ1bmN0aW9uIChzcGVjLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBtb2RlID0gc3BlYy50b2tlbiA/IHNwZWMgOiBDb2RlTWlycm9yLmdldE1vZGUodGhpcy5vcHRpb25zLCBzcGVjKTtcblxuICAgICAgICBpZiAobW9kZS5zdGFydFN0YXRlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT3ZlcmxheXMgbWF5IG5vdCBiZSBzdGF0ZWZ1bC5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBpbnNlcnRTb3J0ZWQodGhpcy5zdGF0ZS5vdmVybGF5cywge1xuICAgICAgICAgIG1vZGU6IG1vZGUsXG4gICAgICAgICAgbW9kZVNwZWM6IHNwZWMsXG4gICAgICAgICAgb3BhcXVlOiBvcHRpb25zICYmIG9wdGlvbnMub3BhcXVlLFxuICAgICAgICAgIHByaW9yaXR5OiBvcHRpb25zICYmIG9wdGlvbnMucHJpb3JpdHkgfHwgMFxuICAgICAgICB9LCBmdW5jdGlvbiAob3ZlcmxheSkge1xuICAgICAgICAgIHJldHVybiBvdmVybGF5LnByaW9yaXR5O1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zdGF0ZS5tb2RlR2VuKys7XG4gICAgICAgIHJlZ0NoYW5nZSh0aGlzKTtcbiAgICAgIH0pLFxuICAgICAgcmVtb3ZlT3ZlcmxheTogbWV0aG9kT3AoZnVuY3Rpb24gKHNwZWMpIHtcbiAgICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG4gICAgICAgIHZhciBvdmVybGF5cyA9IHRoaXMuc3RhdGUub3ZlcmxheXM7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvdmVybGF5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIHZhciBjdXIgPSBvdmVybGF5c1tpXS5tb2RlU3BlYztcblxuICAgICAgICAgIGlmIChjdXIgPT0gc3BlYyB8fCB0eXBlb2Ygc3BlYyA9PSBcInN0cmluZ1wiICYmIGN1ci5uYW1lID09IHNwZWMpIHtcbiAgICAgICAgICAgIG92ZXJsYXlzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIHRoaXMkMS5zdGF0ZS5tb2RlR2VuKys7XG4gICAgICAgICAgICByZWdDaGFuZ2UodGhpcyQxKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgaW5kZW50TGluZTogbWV0aG9kT3AoZnVuY3Rpb24gKG4sIGRpciwgYWdncmVzc2l2ZSkge1xuICAgICAgICBpZiAodHlwZW9mIGRpciAhPSBcInN0cmluZ1wiICYmIHR5cGVvZiBkaXIgIT0gXCJudW1iZXJcIikge1xuICAgICAgICAgIGlmIChkaXIgPT0gbnVsbCkge1xuICAgICAgICAgICAgZGlyID0gdGhpcy5vcHRpb25zLnNtYXJ0SW5kZW50ID8gXCJzbWFydFwiIDogXCJwcmV2XCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpciA9IGRpciA/IFwiYWRkXCIgOiBcInN1YnRyYWN0XCI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzTGluZSh0aGlzLmRvYywgbikpIHtcbiAgICAgICAgICBpbmRlbnRMaW5lKHRoaXMsIG4sIGRpciwgYWdncmVzc2l2ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgaW5kZW50U2VsZWN0aW9uOiBtZXRob2RPcChmdW5jdGlvbiAoaG93KSB7XG4gICAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuICAgICAgICB2YXIgcmFuZ2VzID0gdGhpcy5kb2Muc2VsLnJhbmdlcyxcbiAgICAgICAgICAgIGVuZCA9IC0xO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHJhbmdlID0gcmFuZ2VzW2ldO1xuXG4gICAgICAgICAgaWYgKCFyYW5nZS5lbXB0eSgpKSB7XG4gICAgICAgICAgICB2YXIgZnJvbSA9IHJhbmdlLmZyb20oKSxcbiAgICAgICAgICAgICAgICB0byA9IHJhbmdlLnRvKCk7XG4gICAgICAgICAgICB2YXIgc3RhcnQgPSBNYXRoLm1heChlbmQsIGZyb20ubGluZSk7XG4gICAgICAgICAgICBlbmQgPSBNYXRoLm1pbih0aGlzJDEubGFzdExpbmUoKSwgdG8ubGluZSAtICh0by5jaCA/IDAgOiAxKSkgKyAxO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gc3RhcnQ7IGogPCBlbmQ7ICsraikge1xuICAgICAgICAgICAgICBpbmRlbnRMaW5lKHRoaXMkMSwgaiwgaG93KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG5ld1JhbmdlcyA9IHRoaXMkMS5kb2Muc2VsLnJhbmdlcztcblxuICAgICAgICAgICAgaWYgKGZyb20uY2ggPT0gMCAmJiByYW5nZXMubGVuZ3RoID09IG5ld1Jhbmdlcy5sZW5ndGggJiYgbmV3UmFuZ2VzW2ldLmZyb20oKS5jaCA+IDApIHtcbiAgICAgICAgICAgICAgcmVwbGFjZU9uZVNlbGVjdGlvbih0aGlzJDEuZG9jLCBpLCBuZXcgUmFuZ2UoZnJvbSwgbmV3UmFuZ2VzW2ldLnRvKCkpLCBzZWxfZG9udFNjcm9sbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChyYW5nZS5oZWFkLmxpbmUgPiBlbmQpIHtcbiAgICAgICAgICAgIGluZGVudExpbmUodGhpcyQxLCByYW5nZS5oZWFkLmxpbmUsIGhvdywgdHJ1ZSk7XG4gICAgICAgICAgICBlbmQgPSByYW5nZS5oZWFkLmxpbmU7XG5cbiAgICAgICAgICAgIGlmIChpID09IHRoaXMkMS5kb2Muc2VsLnByaW1JbmRleCkge1xuICAgICAgICAgICAgICBlbnN1cmVDdXJzb3JWaXNpYmxlKHRoaXMkMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIC8vIEZldGNoIHRoZSBwYXJzZXIgdG9rZW4gZm9yIGEgZ2l2ZW4gY2hhcmFjdGVyLiBVc2VmdWwgZm9yIGhhY2tzXG4gICAgICAvLyB0aGF0IHdhbnQgdG8gaW5zcGVjdCB0aGUgbW9kZSBzdGF0ZSAoc2F5LCBmb3IgY29tcGxldGlvbikuXG4gICAgICBnZXRUb2tlbkF0OiBmdW5jdGlvbiBnZXRUb2tlbkF0KHBvcywgcHJlY2lzZSkge1xuICAgICAgICByZXR1cm4gdGFrZVRva2VuKHRoaXMsIHBvcywgcHJlY2lzZSk7XG4gICAgICB9LFxuICAgICAgZ2V0TGluZVRva2VuczogZnVuY3Rpb24gZ2V0TGluZVRva2VucyhsaW5lLCBwcmVjaXNlKSB7XG4gICAgICAgIHJldHVybiB0YWtlVG9rZW4odGhpcywgUG9zKGxpbmUpLCBwcmVjaXNlLCB0cnVlKTtcbiAgICAgIH0sXG4gICAgICBnZXRUb2tlblR5cGVBdDogZnVuY3Rpb24gZ2V0VG9rZW5UeXBlQXQocG9zKSB7XG4gICAgICAgIHBvcyA9IF9jbGlwUG9zKHRoaXMuZG9jLCBwb3MpO1xuICAgICAgICB2YXIgc3R5bGVzID0gZ2V0TGluZVN0eWxlcyh0aGlzLCBnZXRMaW5lKHRoaXMuZG9jLCBwb3MubGluZSkpO1xuICAgICAgICB2YXIgYmVmb3JlID0gMCxcbiAgICAgICAgICAgIGFmdGVyID0gKHN0eWxlcy5sZW5ndGggLSAxKSAvIDIsXG4gICAgICAgICAgICBjaCA9IHBvcy5jaDtcbiAgICAgICAgdmFyIHR5cGU7XG5cbiAgICAgICAgaWYgKGNoID09IDApIHtcbiAgICAgICAgICB0eXBlID0gc3R5bGVzWzJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAoOzspIHtcbiAgICAgICAgICAgIHZhciBtaWQgPSBiZWZvcmUgKyBhZnRlciA+PiAxO1xuXG4gICAgICAgICAgICBpZiAoKG1pZCA/IHN0eWxlc1ttaWQgKiAyIC0gMV0gOiAwKSA+PSBjaCkge1xuICAgICAgICAgICAgICBhZnRlciA9IG1pZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3R5bGVzW21pZCAqIDIgKyAxXSA8IGNoKSB7XG4gICAgICAgICAgICAgIGJlZm9yZSA9IG1pZCArIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0eXBlID0gc3R5bGVzW21pZCAqIDIgKyAyXTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGN1dCA9IHR5cGUgPyB0eXBlLmluZGV4T2YoXCJvdmVybGF5IFwiKSA6IC0xO1xuICAgICAgICByZXR1cm4gY3V0IDwgMCA/IHR5cGUgOiBjdXQgPT0gMCA/IG51bGwgOiB0eXBlLnNsaWNlKDAsIGN1dCAtIDEpO1xuICAgICAgfSxcbiAgICAgIGdldE1vZGVBdDogZnVuY3Rpb24gZ2V0TW9kZUF0KHBvcykge1xuICAgICAgICB2YXIgbW9kZSA9IHRoaXMuZG9jLm1vZGU7XG5cbiAgICAgICAgaWYgKCFtb2RlLmlubmVyTW9kZSkge1xuICAgICAgICAgIHJldHVybiBtb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIENvZGVNaXJyb3IuaW5uZXJNb2RlKG1vZGUsIHRoaXMuZ2V0VG9rZW5BdChwb3MpLnN0YXRlKS5tb2RlO1xuICAgICAgfSxcbiAgICAgIGdldEhlbHBlcjogZnVuY3Rpb24gZ2V0SGVscGVyKHBvcywgdHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRIZWxwZXJzKHBvcywgdHlwZSlbMF07XG4gICAgICB9LFxuICAgICAgZ2V0SGVscGVyczogZnVuY3Rpb24gZ2V0SGVscGVycyhwb3MsIHR5cGUpIHtcbiAgICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG4gICAgICAgIHZhciBmb3VuZCA9IFtdO1xuXG4gICAgICAgIGlmICghaGVscGVycy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoZWxwID0gaGVscGVyc1t0eXBlXSxcbiAgICAgICAgICAgIG1vZGUgPSB0aGlzLmdldE1vZGVBdChwb3MpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgbW9kZVt0eXBlXSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgaWYgKGhlbHBbbW9kZVt0eXBlXV0pIHtcbiAgICAgICAgICAgIGZvdW5kLnB1c2goaGVscFttb2RlW3R5cGVdXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG1vZGVbdHlwZV0pIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGVbdHlwZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB2YWwgPSBoZWxwW21vZGVbdHlwZV1baV1dO1xuXG4gICAgICAgICAgICBpZiAodmFsKSB7XG4gICAgICAgICAgICAgIGZvdW5kLnB1c2godmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobW9kZS5oZWxwZXJUeXBlICYmIGhlbHBbbW9kZS5oZWxwZXJUeXBlXSkge1xuICAgICAgICAgIGZvdW5kLnB1c2goaGVscFttb2RlLmhlbHBlclR5cGVdKTtcbiAgICAgICAgfSBlbHNlIGlmIChoZWxwW21vZGUubmFtZV0pIHtcbiAgICAgICAgICBmb3VuZC5wdXNoKGhlbHBbbW9kZS5uYW1lXSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCBoZWxwLl9nbG9iYWwubGVuZ3RoOyBpJDErKykge1xuICAgICAgICAgIHZhciBjdXIgPSBoZWxwLl9nbG9iYWxbaSQxXTtcblxuICAgICAgICAgIGlmIChjdXIucHJlZChtb2RlLCB0aGlzJDEpICYmIGluZGV4T2YoZm91bmQsIGN1ci52YWwpID09IC0xKSB7XG4gICAgICAgICAgICBmb3VuZC5wdXNoKGN1ci52YWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgIH0sXG4gICAgICBnZXRTdGF0ZUFmdGVyOiBmdW5jdGlvbiBnZXRTdGF0ZUFmdGVyKGxpbmUsIHByZWNpc2UpIHtcbiAgICAgICAgdmFyIGRvYyA9IHRoaXMuZG9jO1xuICAgICAgICBsaW5lID0gY2xpcExpbmUoZG9jLCBsaW5lID09IG51bGwgPyBkb2MuZmlyc3QgKyBkb2Muc2l6ZSAtIDEgOiBsaW5lKTtcbiAgICAgICAgcmV0dXJuIGdldFN0YXRlQmVmb3JlKHRoaXMsIGxpbmUgKyAxLCBwcmVjaXNlKTtcbiAgICAgIH0sXG4gICAgICBjdXJzb3JDb29yZHM6IGZ1bmN0aW9uIGN1cnNvckNvb3JkcyhzdGFydCwgbW9kZSkge1xuICAgICAgICB2YXIgcG9zLFxuICAgICAgICAgICAgcmFuZ2UgPSB0aGlzLmRvYy5zZWwucHJpbWFyeSgpO1xuXG4gICAgICAgIGlmIChzdGFydCA9PSBudWxsKSB7XG4gICAgICAgICAgcG9zID0gcmFuZ2UuaGVhZDtcbiAgICAgICAgfSBlbHNlIGlmIChfdHlwZW9mKHN0YXJ0KSA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgcG9zID0gX2NsaXBQb3ModGhpcy5kb2MsIHN0YXJ0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwb3MgPSBzdGFydCA/IHJhbmdlLmZyb20oKSA6IHJhbmdlLnRvKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX2N1cnNvckNvb3Jkcyh0aGlzLCBwb3MsIG1vZGUgfHwgXCJwYWdlXCIpO1xuICAgICAgfSxcbiAgICAgIGNoYXJDb29yZHM6IGZ1bmN0aW9uIGNoYXJDb29yZHMocG9zLCBtb2RlKSB7XG4gICAgICAgIHJldHVybiBfY2hhckNvb3Jkcyh0aGlzLCBfY2xpcFBvcyh0aGlzLmRvYywgcG9zKSwgbW9kZSB8fCBcInBhZ2VcIik7XG4gICAgICB9LFxuICAgICAgY29vcmRzQ2hhcjogZnVuY3Rpb24gY29vcmRzQ2hhcihjb29yZHMsIG1vZGUpIHtcbiAgICAgICAgY29vcmRzID0gZnJvbUNvb3JkU3lzdGVtKHRoaXMsIGNvb3JkcywgbW9kZSB8fCBcInBhZ2VcIik7XG4gICAgICAgIHJldHVybiBfY29vcmRzQ2hhcih0aGlzLCBjb29yZHMubGVmdCwgY29vcmRzLnRvcCk7XG4gICAgICB9LFxuICAgICAgbGluZUF0SGVpZ2h0OiBmdW5jdGlvbiBsaW5lQXRIZWlnaHQoaGVpZ2h0LCBtb2RlKSB7XG4gICAgICAgIGhlaWdodCA9IGZyb21Db29yZFN5c3RlbSh0aGlzLCB7XG4gICAgICAgICAgdG9wOiBoZWlnaHQsXG4gICAgICAgICAgbGVmdDogMFxuICAgICAgICB9LCBtb2RlIHx8IFwicGFnZVwiKS50b3A7XG4gICAgICAgIHJldHVybiBfbGluZUF0SGVpZ2h0KHRoaXMuZG9jLCBoZWlnaHQgKyB0aGlzLmRpc3BsYXkudmlld09mZnNldCk7XG4gICAgICB9LFxuICAgICAgaGVpZ2h0QXRMaW5lOiBmdW5jdGlvbiBoZWlnaHRBdExpbmUobGluZSwgbW9kZSwgaW5jbHVkZVdpZGdldHMpIHtcbiAgICAgICAgdmFyIGVuZCA9IGZhbHNlLFxuICAgICAgICAgICAgbGluZU9iajtcblxuICAgICAgICBpZiAodHlwZW9mIGxpbmUgPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgIHZhciBsYXN0ID0gdGhpcy5kb2MuZmlyc3QgKyB0aGlzLmRvYy5zaXplIC0gMTtcblxuICAgICAgICAgIGlmIChsaW5lIDwgdGhpcy5kb2MuZmlyc3QpIHtcbiAgICAgICAgICAgIGxpbmUgPSB0aGlzLmRvYy5maXJzdDtcbiAgICAgICAgICB9IGVsc2UgaWYgKGxpbmUgPiBsYXN0KSB7XG4gICAgICAgICAgICBsaW5lID0gbGFzdDtcbiAgICAgICAgICAgIGVuZCA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGluZU9iaiA9IGdldExpbmUodGhpcy5kb2MsIGxpbmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpbmVPYmogPSBsaW5lO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGludG9Db29yZFN5c3RlbSh0aGlzLCBsaW5lT2JqLCB7XG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIGxlZnQ6IDBcbiAgICAgICAgfSwgbW9kZSB8fCBcInBhZ2VcIiwgaW5jbHVkZVdpZGdldHMpLnRvcCArIChlbmQgPyB0aGlzLmRvYy5oZWlnaHQgLSBfaGVpZ2h0QXRMaW5lKGxpbmVPYmopIDogMCk7XG4gICAgICB9LFxuICAgICAgZGVmYXVsdFRleHRIZWlnaHQ6IGZ1bmN0aW9uIGRlZmF1bHRUZXh0SGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGV4dEhlaWdodCh0aGlzLmRpc3BsYXkpO1xuICAgICAgfSxcbiAgICAgIGRlZmF1bHRDaGFyV2lkdGg6IGZ1bmN0aW9uIGRlZmF1bHRDaGFyV2lkdGgoKSB7XG4gICAgICAgIHJldHVybiBjaGFyV2lkdGgodGhpcy5kaXNwbGF5KTtcbiAgICAgIH0sXG4gICAgICBnZXRWaWV3cG9ydDogZnVuY3Rpb24gZ2V0Vmlld3BvcnQoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZnJvbTogdGhpcy5kaXNwbGF5LnZpZXdGcm9tLFxuICAgICAgICAgIHRvOiB0aGlzLmRpc3BsYXkudmlld1RvXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgYWRkV2lkZ2V0OiBmdW5jdGlvbiBhZGRXaWRnZXQocG9zLCBub2RlLCBzY3JvbGwsIHZlcnQsIGhvcml6KSB7XG4gICAgICAgIHZhciBkaXNwbGF5ID0gdGhpcy5kaXNwbGF5O1xuICAgICAgICBwb3MgPSBfY3Vyc29yQ29vcmRzKHRoaXMsIF9jbGlwUG9zKHRoaXMuZG9jLCBwb3MpKTtcbiAgICAgICAgdmFyIHRvcCA9IHBvcy5ib3R0b20sXG4gICAgICAgICAgICBsZWZ0ID0gcG9zLmxlZnQ7XG4gICAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKFwiY20taWdub3JlLWV2ZW50c1wiLCBcInRydWVcIik7XG4gICAgICAgIHRoaXMuZGlzcGxheS5pbnB1dC5zZXRVbmVkaXRhYmxlKG5vZGUpO1xuICAgICAgICBkaXNwbGF5LnNpemVyLmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgICAgIGlmICh2ZXJ0ID09IFwib3ZlclwiKSB7XG4gICAgICAgICAgdG9wID0gcG9zLnRvcDtcbiAgICAgICAgfSBlbHNlIGlmICh2ZXJ0ID09IFwiYWJvdmVcIiB8fCB2ZXJ0ID09IFwibmVhclwiKSB7XG4gICAgICAgICAgdmFyIHZzcGFjZSA9IE1hdGgubWF4KGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQsIHRoaXMuZG9jLmhlaWdodCksXG4gICAgICAgICAgICAgIGhzcGFjZSA9IE1hdGgubWF4KGRpc3BsYXkuc2l6ZXIuY2xpZW50V2lkdGgsIGRpc3BsYXkubGluZVNwYWNlLmNsaWVudFdpZHRoKTsgLy8gRGVmYXVsdCB0byBwb3NpdGlvbmluZyBhYm92ZSAoaWYgc3BlY2lmaWVkIGFuZCBwb3NzaWJsZSk7IG90aGVyd2lzZSBkZWZhdWx0IHRvIHBvc2l0aW9uaW5nIGJlbG93XG5cbiAgICAgICAgICBpZiAoKHZlcnQgPT0gJ2Fib3ZlJyB8fCBwb3MuYm90dG9tICsgbm9kZS5vZmZzZXRIZWlnaHQgPiB2c3BhY2UpICYmIHBvcy50b3AgPiBub2RlLm9mZnNldEhlaWdodCkge1xuICAgICAgICAgICAgdG9wID0gcG9zLnRvcCAtIG5vZGUub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgIH0gZWxzZSBpZiAocG9zLmJvdHRvbSArIG5vZGUub2Zmc2V0SGVpZ2h0IDw9IHZzcGFjZSkge1xuICAgICAgICAgICAgdG9wID0gcG9zLmJvdHRvbTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobGVmdCArIG5vZGUub2Zmc2V0V2lkdGggPiBoc3BhY2UpIHtcbiAgICAgICAgICAgIGxlZnQgPSBoc3BhY2UgLSBub2RlLm9mZnNldFdpZHRoO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG5vZGUuc3R5bGUudG9wID0gdG9wICsgXCJweFwiO1xuICAgICAgICBub2RlLnN0eWxlLmxlZnQgPSBub2RlLnN0eWxlLnJpZ2h0ID0gXCJcIjtcblxuICAgICAgICBpZiAoaG9yaXogPT0gXCJyaWdodFwiKSB7XG4gICAgICAgICAgbGVmdCA9IGRpc3BsYXkuc2l6ZXIuY2xpZW50V2lkdGggLSBub2RlLm9mZnNldFdpZHRoO1xuICAgICAgICAgIG5vZGUuc3R5bGUucmlnaHQgPSBcIjBweFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChob3JpeiA9PSBcImxlZnRcIikge1xuICAgICAgICAgICAgbGVmdCA9IDA7XG4gICAgICAgICAgfSBlbHNlIGlmIChob3JpeiA9PSBcIm1pZGRsZVwiKSB7XG4gICAgICAgICAgICBsZWZ0ID0gKGRpc3BsYXkuc2l6ZXIuY2xpZW50V2lkdGggLSBub2RlLm9mZnNldFdpZHRoKSAvIDI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbm9kZS5zdHlsZS5sZWZ0ID0gbGVmdCArIFwicHhcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzY3JvbGwpIHtcbiAgICAgICAgICBzY3JvbGxJbnRvVmlldyh0aGlzLCBsZWZ0LCB0b3AsIGxlZnQgKyBub2RlLm9mZnNldFdpZHRoLCB0b3AgKyBub2RlLm9mZnNldEhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyT25LZXlEb3duOiBtZXRob2RPcChvbktleURvd24pLFxuICAgICAgdHJpZ2dlck9uS2V5UHJlc3M6IG1ldGhvZE9wKG9uS2V5UHJlc3MpLFxuICAgICAgdHJpZ2dlck9uS2V5VXA6IG9uS2V5VXAsXG4gICAgICBleGVjQ29tbWFuZDogZnVuY3Rpb24gZXhlY0NvbW1hbmQoY21kKSB7XG4gICAgICAgIGlmIChjb21tYW5kcy5oYXNPd25Qcm9wZXJ0eShjbWQpKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbW1hbmRzW2NtZF0uY2FsbChudWxsLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRyaWdnZXJFbGVjdHJpYzogbWV0aG9kT3AoZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgdHJpZ2dlckVsZWN0cmljKHRoaXMsIHRleHQpO1xuICAgICAgfSksXG4gICAgICBmaW5kUG9zSDogZnVuY3Rpb24gZmluZFBvc0goZnJvbSwgYW1vdW50LCB1bml0LCB2aXN1YWxseSkge1xuICAgICAgICB2YXIgdGhpcyQxID0gdGhpcztcbiAgICAgICAgdmFyIGRpciA9IDE7XG5cbiAgICAgICAgaWYgKGFtb3VudCA8IDApIHtcbiAgICAgICAgICBkaXIgPSAtMTtcbiAgICAgICAgICBhbW91bnQgPSAtYW1vdW50O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGN1ciA9IF9jbGlwUG9zKHRoaXMuZG9jLCBmcm9tKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFtb3VudDsgKytpKSB7XG4gICAgICAgICAgY3VyID0gX2ZpbmRQb3NIKHRoaXMkMS5kb2MsIGN1ciwgZGlyLCB1bml0LCB2aXN1YWxseSk7XG5cbiAgICAgICAgICBpZiAoY3VyLmhpdFNpZGUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXI7XG4gICAgICB9LFxuICAgICAgbW92ZUg6IG1ldGhvZE9wKGZ1bmN0aW9uIChkaXIsIHVuaXQpIHtcbiAgICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG4gICAgICAgIHRoaXMuZXh0ZW5kU2VsZWN0aW9uc0J5KGZ1bmN0aW9uIChyYW5nZSkge1xuICAgICAgICAgIGlmICh0aGlzJDEuZGlzcGxheS5zaGlmdCB8fCB0aGlzJDEuZG9jLmV4dGVuZCB8fCByYW5nZS5lbXB0eSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gX2ZpbmRQb3NIKHRoaXMkMS5kb2MsIHJhbmdlLmhlYWQsIGRpciwgdW5pdCwgdGhpcyQxLm9wdGlvbnMucnRsTW92ZVZpc3VhbGx5KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGRpciA8IDAgPyByYW5nZS5mcm9tKCkgOiByYW5nZS50bygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgc2VsX21vdmUpO1xuICAgICAgfSksXG4gICAgICBkZWxldGVIOiBtZXRob2RPcChmdW5jdGlvbiAoZGlyLCB1bml0KSB7XG4gICAgICAgIHZhciBzZWwgPSB0aGlzLmRvYy5zZWwsXG4gICAgICAgICAgICBkb2MgPSB0aGlzLmRvYztcblxuICAgICAgICBpZiAoc2VsLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHtcbiAgICAgICAgICBkb2MucmVwbGFjZVNlbGVjdGlvbihcIlwiLCBudWxsLCBcIitkZWxldGVcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlTmVhclNlbGVjdGlvbih0aGlzLCBmdW5jdGlvbiAocmFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBvdGhlciA9IF9maW5kUG9zSChkb2MsIHJhbmdlLmhlYWQsIGRpciwgdW5pdCwgZmFsc2UpO1xuXG4gICAgICAgICAgICByZXR1cm4gZGlyIDwgMCA/IHtcbiAgICAgICAgICAgICAgZnJvbTogb3RoZXIsXG4gICAgICAgICAgICAgIHRvOiByYW5nZS5oZWFkXG4gICAgICAgICAgICB9IDoge1xuICAgICAgICAgICAgICBmcm9tOiByYW5nZS5oZWFkLFxuICAgICAgICAgICAgICB0bzogb3RoZXJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgZmluZFBvc1Y6IGZ1bmN0aW9uIGZpbmRQb3NWKGZyb20sIGFtb3VudCwgdW5pdCwgZ29hbENvbHVtbikge1xuICAgICAgICB2YXIgdGhpcyQxID0gdGhpcztcbiAgICAgICAgdmFyIGRpciA9IDEsXG4gICAgICAgICAgICB4ID0gZ29hbENvbHVtbjtcblxuICAgICAgICBpZiAoYW1vdW50IDwgMCkge1xuICAgICAgICAgIGRpciA9IC0xO1xuICAgICAgICAgIGFtb3VudCA9IC1hbW91bnQ7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY3VyID0gX2NsaXBQb3ModGhpcy5kb2MsIGZyb20pO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW1vdW50OyArK2kpIHtcbiAgICAgICAgICB2YXIgY29vcmRzID0gX2N1cnNvckNvb3Jkcyh0aGlzJDEsIGN1ciwgXCJkaXZcIik7XG5cbiAgICAgICAgICBpZiAoeCA9PSBudWxsKSB7XG4gICAgICAgICAgICB4ID0gY29vcmRzLmxlZnQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvb3Jkcy5sZWZ0ID0geDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjdXIgPSBfZmluZFBvc1YodGhpcyQxLCBjb29yZHMsIGRpciwgdW5pdCk7XG5cbiAgICAgICAgICBpZiAoY3VyLmhpdFNpZGUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXI7XG4gICAgICB9LFxuICAgICAgbW92ZVY6IG1ldGhvZE9wKGZ1bmN0aW9uIChkaXIsIHVuaXQpIHtcbiAgICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG4gICAgICAgIHZhciBkb2MgPSB0aGlzLmRvYyxcbiAgICAgICAgICAgIGdvYWxzID0gW107XG4gICAgICAgIHZhciBjb2xsYXBzZSA9ICF0aGlzLmRpc3BsYXkuc2hpZnQgJiYgIWRvYy5leHRlbmQgJiYgZG9jLnNlbC5zb21ldGhpbmdTZWxlY3RlZCgpO1xuICAgICAgICBkb2MuZXh0ZW5kU2VsZWN0aW9uc0J5KGZ1bmN0aW9uIChyYW5nZSkge1xuICAgICAgICAgIGlmIChjb2xsYXBzZSkge1xuICAgICAgICAgICAgcmV0dXJuIGRpciA8IDAgPyByYW5nZS5mcm9tKCkgOiByYW5nZS50bygpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBoZWFkUG9zID0gX2N1cnNvckNvb3Jkcyh0aGlzJDEsIHJhbmdlLmhlYWQsIFwiZGl2XCIpO1xuXG4gICAgICAgICAgaWYgKHJhbmdlLmdvYWxDb2x1bW4gIT0gbnVsbCkge1xuICAgICAgICAgICAgaGVhZFBvcy5sZWZ0ID0gcmFuZ2UuZ29hbENvbHVtbjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBnb2Fscy5wdXNoKGhlYWRQb3MubGVmdCk7XG5cbiAgICAgICAgICB2YXIgcG9zID0gX2ZpbmRQb3NWKHRoaXMkMSwgaGVhZFBvcywgZGlyLCB1bml0KTtcblxuICAgICAgICAgIGlmICh1bml0ID09IFwicGFnZVwiICYmIHJhbmdlID09IGRvYy5zZWwucHJpbWFyeSgpKSB7XG4gICAgICAgICAgICBhZGRUb1Njcm9sbFBvcyh0aGlzJDEsIG51bGwsIF9jaGFyQ29vcmRzKHRoaXMkMSwgcG9zLCBcImRpdlwiKS50b3AgLSBoZWFkUG9zLnRvcCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHBvcztcbiAgICAgICAgfSwgc2VsX21vdmUpO1xuXG4gICAgICAgIGlmIChnb2Fscy5sZW5ndGgpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRvYy5zZWwucmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkb2Muc2VsLnJhbmdlc1tpXS5nb2FsQ29sdW1uID0gZ29hbHNbaV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIC8vIEZpbmQgdGhlIHdvcmQgYXQgdGhlIGdpdmVuIHBvc2l0aW9uIChhcyByZXR1cm5lZCBieSBjb29yZHNDaGFyKS5cbiAgICAgIGZpbmRXb3JkQXQ6IGZ1bmN0aW9uIGZpbmRXb3JkQXQocG9zKSB7XG4gICAgICAgIHZhciBkb2MgPSB0aGlzLmRvYyxcbiAgICAgICAgICAgIGxpbmUgPSBnZXRMaW5lKGRvYywgcG9zLmxpbmUpLnRleHQ7XG4gICAgICAgIHZhciBzdGFydCA9IHBvcy5jaCxcbiAgICAgICAgICAgIGVuZCA9IHBvcy5jaDtcblxuICAgICAgICBpZiAobGluZSkge1xuICAgICAgICAgIHZhciBoZWxwZXIgPSB0aGlzLmdldEhlbHBlcihwb3MsIFwid29yZENoYXJzXCIpO1xuXG4gICAgICAgICAgaWYgKChwb3MueFJlbCA8IDAgfHwgZW5kID09IGxpbmUubGVuZ3RoKSAmJiBzdGFydCkge1xuICAgICAgICAgICAgLS1zdGFydDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgKytlbmQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHN0YXJ0Q2hhciA9IGxpbmUuY2hhckF0KHN0YXJ0KTtcbiAgICAgICAgICB2YXIgY2hlY2sgPSBpc1dvcmRDaGFyKHN0YXJ0Q2hhciwgaGVscGVyKSA/IGZ1bmN0aW9uIChjaCkge1xuICAgICAgICAgICAgcmV0dXJuIGlzV29yZENoYXIoY2gsIGhlbHBlcik7XG4gICAgICAgICAgfSA6IC9cXHMvLnRlc3Qoc3RhcnRDaGFyKSA/IGZ1bmN0aW9uIChjaCkge1xuICAgICAgICAgICAgcmV0dXJuIC9cXHMvLnRlc3QoY2gpO1xuICAgICAgICAgIH0gOiBmdW5jdGlvbiAoY2gpIHtcbiAgICAgICAgICAgIHJldHVybiAhL1xccy8udGVzdChjaCkgJiYgIWlzV29yZENoYXIoY2gpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB3aGlsZSAoc3RhcnQgPiAwICYmIGNoZWNrKGxpbmUuY2hhckF0KHN0YXJ0IC0gMSkpKSB7XG4gICAgICAgICAgICAtLXN0YXJ0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHdoaWxlIChlbmQgPCBsaW5lLmxlbmd0aCAmJiBjaGVjayhsaW5lLmNoYXJBdChlbmQpKSkge1xuICAgICAgICAgICAgKytlbmQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBSYW5nZShQb3MocG9zLmxpbmUsIHN0YXJ0KSwgUG9zKHBvcy5saW5lLCBlbmQpKTtcbiAgICAgIH0sXG4gICAgICB0b2dnbGVPdmVyd3JpdGU6IGZ1bmN0aW9uIHRvZ2dsZU92ZXJ3cml0ZSh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSA9PSB0aGlzLnN0YXRlLm92ZXJ3cml0ZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm92ZXJ3cml0ZSA9ICF0aGlzLnN0YXRlLm92ZXJ3cml0ZSkge1xuICAgICAgICAgIGFkZENsYXNzKHRoaXMuZGlzcGxheS5jdXJzb3JEaXYsIFwiQ29kZU1pcnJvci1vdmVyd3JpdGVcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcm1DbGFzcyh0aGlzLmRpc3BsYXkuY3Vyc29yRGl2LCBcIkNvZGVNaXJyb3Itb3ZlcndyaXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2lnbmFsKHRoaXMsIFwib3ZlcndyaXRlVG9nZ2xlXCIsIHRoaXMsIHRoaXMuc3RhdGUub3ZlcndyaXRlKTtcbiAgICAgIH0sXG4gICAgICBoYXNGb2N1czogZnVuY3Rpb24gaGFzRm9jdXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpc3BsYXkuaW5wdXQuZ2V0RmllbGQoKSA9PSBhY3RpdmVFbHQoKTtcbiAgICAgIH0sXG4gICAgICBpc1JlYWRPbmx5OiBmdW5jdGlvbiBpc1JlYWRPbmx5KCkge1xuICAgICAgICByZXR1cm4gISEodGhpcy5vcHRpb25zLnJlYWRPbmx5IHx8IHRoaXMuZG9jLmNhbnRFZGl0KTtcbiAgICAgIH0sXG4gICAgICBzY3JvbGxUbzogbWV0aG9kT3AoZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgaWYgKHggIT0gbnVsbCB8fCB5ICE9IG51bGwpIHtcbiAgICAgICAgICByZXNvbHZlU2Nyb2xsVG9Qb3ModGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeCAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5jdXJPcC5zY3JvbGxMZWZ0ID0geDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh5ICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmN1ck9wLnNjcm9sbFRvcCA9IHk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgZ2V0U2Nyb2xsSW5mbzogZnVuY3Rpb24gZ2V0U2Nyb2xsSW5mbygpIHtcbiAgICAgICAgdmFyIHNjcm9sbGVyID0gdGhpcy5kaXNwbGF5LnNjcm9sbGVyO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6IHNjcm9sbGVyLnNjcm9sbExlZnQsXG4gICAgICAgICAgdG9wOiBzY3JvbGxlci5zY3JvbGxUb3AsXG4gICAgICAgICAgaGVpZ2h0OiBzY3JvbGxlci5zY3JvbGxIZWlnaHQgLSBzY3JvbGxHYXAodGhpcykgLSB0aGlzLmRpc3BsYXkuYmFySGVpZ2h0LFxuICAgICAgICAgIHdpZHRoOiBzY3JvbGxlci5zY3JvbGxXaWR0aCAtIHNjcm9sbEdhcCh0aGlzKSAtIHRoaXMuZGlzcGxheS5iYXJXaWR0aCxcbiAgICAgICAgICBjbGllbnRIZWlnaHQ6IGRpc3BsYXlIZWlnaHQodGhpcyksXG4gICAgICAgICAgY2xpZW50V2lkdGg6IGRpc3BsYXlXaWR0aCh0aGlzKVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIHNjcm9sbEludG9WaWV3OiBtZXRob2RPcChmdW5jdGlvbiAocmFuZ2UsIG1hcmdpbikge1xuICAgICAgICBpZiAocmFuZ2UgPT0gbnVsbCkge1xuICAgICAgICAgIHJhbmdlID0ge1xuICAgICAgICAgICAgZnJvbTogdGhpcy5kb2Muc2VsLnByaW1hcnkoKS5oZWFkLFxuICAgICAgICAgICAgdG86IG51bGxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKG1hcmdpbiA9PSBudWxsKSB7XG4gICAgICAgICAgICBtYXJnaW4gPSB0aGlzLm9wdGlvbnMuY3Vyc29yU2Nyb2xsTWFyZ2luO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcmFuZ2UgPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgIHJhbmdlID0ge1xuICAgICAgICAgICAgZnJvbTogUG9zKHJhbmdlLCAwKSxcbiAgICAgICAgICAgIHRvOiBudWxsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyYW5nZS5mcm9tID09IG51bGwpIHtcbiAgICAgICAgICByYW5nZSA9IHtcbiAgICAgICAgICAgIGZyb206IHJhbmdlLFxuICAgICAgICAgICAgdG86IG51bGxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyYW5nZS50bykge1xuICAgICAgICAgIHJhbmdlLnRvID0gcmFuZ2UuZnJvbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJhbmdlLm1hcmdpbiA9IG1hcmdpbiB8fCAwO1xuXG4gICAgICAgIGlmIChyYW5nZS5mcm9tLmxpbmUgIT0gbnVsbCkge1xuICAgICAgICAgIHJlc29sdmVTY3JvbGxUb1Bvcyh0aGlzKTtcbiAgICAgICAgICB0aGlzLmN1ck9wLnNjcm9sbFRvUG9zID0gcmFuZ2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHNQb3MgPSBjYWxjdWxhdGVTY3JvbGxQb3ModGhpcywgTWF0aC5taW4ocmFuZ2UuZnJvbS5sZWZ0LCByYW5nZS50by5sZWZ0KSwgTWF0aC5taW4ocmFuZ2UuZnJvbS50b3AsIHJhbmdlLnRvLnRvcCkgLSByYW5nZS5tYXJnaW4sIE1hdGgubWF4KHJhbmdlLmZyb20ucmlnaHQsIHJhbmdlLnRvLnJpZ2h0KSwgTWF0aC5tYXgocmFuZ2UuZnJvbS5ib3R0b20sIHJhbmdlLnRvLmJvdHRvbSkgKyByYW5nZS5tYXJnaW4pO1xuICAgICAgICAgIHRoaXMuc2Nyb2xsVG8oc1Bvcy5zY3JvbGxMZWZ0LCBzUG9zLnNjcm9sbFRvcCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgc2V0U2l6ZTogbWV0aG9kT3AoZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGludGVycHJldCA9IGZ1bmN0aW9uIGludGVycHJldCh2YWwpIHtcbiAgICAgICAgICByZXR1cm4gdHlwZW9mIHZhbCA9PSBcIm51bWJlclwiIHx8IC9eXFxkKyQvLnRlc3QoU3RyaW5nKHZhbCkpID8gdmFsICsgXCJweFwiIDogdmFsO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh3aWR0aCAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5kaXNwbGF5LndyYXBwZXIuc3R5bGUud2lkdGggPSBpbnRlcnByZXQod2lkdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhlaWdodCAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5kaXNwbGF5LndyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gaW50ZXJwcmV0KGhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgICAgICAgIGNsZWFyTGluZU1lYXN1cmVtZW50Q2FjaGUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGluZU5vID0gdGhpcy5kaXNwbGF5LnZpZXdGcm9tO1xuICAgICAgICB0aGlzLmRvYy5pdGVyKGxpbmVObywgdGhpcy5kaXNwbGF5LnZpZXdUbywgZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgICBpZiAobGluZS53aWRnZXRzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmUud2lkZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBpZiAobGluZS53aWRnZXRzW2ldLm5vSFNjcm9sbCkge1xuICAgICAgICAgICAgICAgIHJlZ0xpbmVDaGFuZ2UodGhpcyQxLCBsaW5lTm8sIFwid2lkZ2V0XCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgKytsaW5lTm87XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmN1ck9wLmZvcmNlVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgc2lnbmFsKHRoaXMsIFwicmVmcmVzaFwiLCB0aGlzKTtcbiAgICAgIH0pLFxuICAgICAgb3BlcmF0aW9uOiBmdW5jdGlvbiBvcGVyYXRpb24oZikge1xuICAgICAgICByZXR1cm4gcnVuSW5PcCh0aGlzLCBmKTtcbiAgICAgIH0sXG4gICAgICByZWZyZXNoOiBtZXRob2RPcChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvbGRIZWlnaHQgPSB0aGlzLmRpc3BsYXkuY2FjaGVkVGV4dEhlaWdodDtcbiAgICAgICAgcmVnQ2hhbmdlKHRoaXMpO1xuICAgICAgICB0aGlzLmN1ck9wLmZvcmNlVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgY2xlYXJDYWNoZXModGhpcyk7XG4gICAgICAgIHRoaXMuc2Nyb2xsVG8odGhpcy5kb2Muc2Nyb2xsTGVmdCwgdGhpcy5kb2Muc2Nyb2xsVG9wKTtcbiAgICAgICAgdXBkYXRlR3V0dGVyU3BhY2UodGhpcyk7XG5cbiAgICAgICAgaWYgKG9sZEhlaWdodCA9PSBudWxsIHx8IE1hdGguYWJzKG9sZEhlaWdodCAtIHRleHRIZWlnaHQodGhpcy5kaXNwbGF5KSkgPiAuNSkge1xuICAgICAgICAgIGVzdGltYXRlTGluZUhlaWdodHModGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBzaWduYWwodGhpcywgXCJyZWZyZXNoXCIsIHRoaXMpO1xuICAgICAgfSksXG4gICAgICBzd2FwRG9jOiBtZXRob2RPcChmdW5jdGlvbiAoZG9jKSB7XG4gICAgICAgIHZhciBvbGQgPSB0aGlzLmRvYztcbiAgICAgICAgb2xkLmNtID0gbnVsbDtcbiAgICAgICAgYXR0YWNoRG9jKHRoaXMsIGRvYyk7XG4gICAgICAgIGNsZWFyQ2FjaGVzKHRoaXMpO1xuICAgICAgICB0aGlzLmRpc3BsYXkuaW5wdXQucmVzZXQoKTtcbiAgICAgICAgdGhpcy5zY3JvbGxUbyhkb2Muc2Nyb2xsTGVmdCwgZG9jLnNjcm9sbFRvcCk7XG4gICAgICAgIHRoaXMuY3VyT3AuZm9yY2VTY3JvbGwgPSB0cnVlO1xuICAgICAgICBzaWduYWxMYXRlcih0aGlzLCBcInN3YXBEb2NcIiwgdGhpcywgb2xkKTtcbiAgICAgICAgcmV0dXJuIG9sZDtcbiAgICAgIH0pLFxuICAgICAgZ2V0SW5wdXRGaWVsZDogZnVuY3Rpb24gZ2V0SW5wdXRGaWVsZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGxheS5pbnB1dC5nZXRGaWVsZCgpO1xuICAgICAgfSxcbiAgICAgIGdldFdyYXBwZXJFbGVtZW50OiBmdW5jdGlvbiBnZXRXcmFwcGVyRWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGxheS53cmFwcGVyO1xuICAgICAgfSxcbiAgICAgIGdldFNjcm9sbGVyRWxlbWVudDogZnVuY3Rpb24gZ2V0U2Nyb2xsZXJFbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXNwbGF5LnNjcm9sbGVyO1xuICAgICAgfSxcbiAgICAgIGdldEd1dHRlckVsZW1lbnQ6IGZ1bmN0aW9uIGdldEd1dHRlckVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpc3BsYXkuZ3V0dGVycztcbiAgICAgIH1cbiAgICB9O1xuICAgIGV2ZW50TWl4aW4oQ29kZU1pcnJvcik7XG5cbiAgICBDb2RlTWlycm9yLnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24gKHR5cGUsIG5hbWUsIHZhbHVlKSB7XG4gICAgICBpZiAoIWhlbHBlcnMuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcbiAgICAgICAgaGVscGVyc1t0eXBlXSA9IENvZGVNaXJyb3JbdHlwZV0gPSB7XG4gICAgICAgICAgX2dsb2JhbDogW11cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgaGVscGVyc1t0eXBlXVtuYW1lXSA9IHZhbHVlO1xuICAgIH07XG5cbiAgICBDb2RlTWlycm9yLnJlZ2lzdGVyR2xvYmFsSGVscGVyID0gZnVuY3Rpb24gKHR5cGUsIG5hbWUsIHByZWRpY2F0ZSwgdmFsdWUpIHtcbiAgICAgIENvZGVNaXJyb3IucmVnaXN0ZXJIZWxwZXIodHlwZSwgbmFtZSwgdmFsdWUpO1xuXG4gICAgICBoZWxwZXJzW3R5cGVdLl9nbG9iYWwucHVzaCh7XG4gICAgICAgIHByZWQ6IHByZWRpY2F0ZSxcbiAgICAgICAgdmFsOiB2YWx1ZVxuICAgICAgfSk7XG4gICAgfTtcbiAgfSAvLyBVc2VkIGZvciBob3Jpem9udGFsIHJlbGF0aXZlIG1vdGlvbi4gRGlyIGlzIC0xIG9yIDEgKGxlZnQgb3JcbiAgLy8gcmlnaHQpLCB1bml0IGNhbiBiZSBcImNoYXJcIiwgXCJjb2x1bW5cIiAobGlrZSBjaGFyLCBidXQgZG9lc24ndFxuICAvLyBjcm9zcyBsaW5lIGJvdW5kYXJpZXMpLCBcIndvcmRcIiAoYWNyb3NzIG5leHQgd29yZCksIG9yIFwiZ3JvdXBcIiAodG9cbiAgLy8gdGhlIHN0YXJ0IG9mIG5leHQgZ3JvdXAgb2Ygd29yZCBvciBub24td29yZC1ub24td2hpdGVzcGFjZVxuICAvLyBjaGFycykuIFRoZSB2aXN1YWxseSBwYXJhbSBjb250cm9scyB3aGV0aGVyLCBpbiByaWdodC10by1sZWZ0XG4gIC8vIHRleHQsIGRpcmVjdGlvbiAxIG1lYW5zIHRvIG1vdmUgdG93YXJkcyB0aGUgbmV4dCBpbmRleCBpbiB0aGVcbiAgLy8gc3RyaW5nLCBvciB0b3dhcmRzIHRoZSBjaGFyYWN0ZXIgdG8gdGhlIHJpZ2h0IG9mIHRoZSBjdXJyZW50XG4gIC8vIHBvc2l0aW9uLiBUaGUgcmVzdWx0aW5nIHBvc2l0aW9uIHdpbGwgaGF2ZSBhIGhpdFNpZGU9dHJ1ZVxuICAvLyBwcm9wZXJ0eSBpZiBpdCByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGRvY3VtZW50LlxuXG5cbiAgZnVuY3Rpb24gX2ZpbmRQb3NIKGRvYywgcG9zLCBkaXIsIHVuaXQsIHZpc3VhbGx5KSB7XG4gICAgdmFyIGxpbmUgPSBwb3MubGluZSxcbiAgICAgICAgY2ggPSBwb3MuY2gsXG4gICAgICAgIG9yaWdEaXIgPSBkaXI7XG4gICAgdmFyIGxpbmVPYmogPSBnZXRMaW5lKGRvYywgbGluZSk7XG5cbiAgICBmdW5jdGlvbiBmaW5kTmV4dExpbmUoKSB7XG4gICAgICB2YXIgbCA9IGxpbmUgKyBkaXI7XG5cbiAgICAgIGlmIChsIDwgZG9jLmZpcnN0IHx8IGwgPj0gZG9jLmZpcnN0ICsgZG9jLnNpemUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBsaW5lID0gbDtcbiAgICAgIHJldHVybiBsaW5lT2JqID0gZ2V0TGluZShkb2MsIGwpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vdmVPbmNlKGJvdW5kVG9MaW5lKSB7XG4gICAgICB2YXIgbmV4dCA9ICh2aXN1YWxseSA/IG1vdmVWaXN1YWxseSA6IG1vdmVMb2dpY2FsbHkpKGxpbmVPYmosIGNoLCBkaXIsIHRydWUpO1xuXG4gICAgICBpZiAobmV4dCA9PSBudWxsKSB7XG4gICAgICAgIGlmICghYm91bmRUb0xpbmUgJiYgZmluZE5leHRMaW5lKCkpIHtcbiAgICAgICAgICBpZiAodmlzdWFsbHkpIHtcbiAgICAgICAgICAgIGNoID0gKGRpciA8IDAgPyBsaW5lUmlnaHQgOiBsaW5lTGVmdCkobGluZU9iaik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoID0gZGlyIDwgMCA/IGxpbmVPYmoudGV4dC5sZW5ndGggOiAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoID0gbmV4dDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHVuaXQgPT0gXCJjaGFyXCIpIHtcbiAgICAgIG1vdmVPbmNlKCk7XG4gICAgfSBlbHNlIGlmICh1bml0ID09IFwiY29sdW1uXCIpIHtcbiAgICAgIG1vdmVPbmNlKHRydWUpO1xuICAgIH0gZWxzZSBpZiAodW5pdCA9PSBcIndvcmRcIiB8fCB1bml0ID09IFwiZ3JvdXBcIikge1xuICAgICAgdmFyIHNhd1R5cGUgPSBudWxsLFxuICAgICAgICAgIGdyb3VwID0gdW5pdCA9PSBcImdyb3VwXCI7XG4gICAgICB2YXIgaGVscGVyID0gZG9jLmNtICYmIGRvYy5jbS5nZXRIZWxwZXIocG9zLCBcIndvcmRDaGFyc1wiKTtcblxuICAgICAgZm9yICh2YXIgZmlyc3QgPSB0cnVlOzsgZmlyc3QgPSBmYWxzZSkge1xuICAgICAgICBpZiAoZGlyIDwgMCAmJiAhbW92ZU9uY2UoIWZpcnN0KSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGN1ciA9IGxpbmVPYmoudGV4dC5jaGFyQXQoY2gpIHx8IFwiXFxuXCI7XG4gICAgICAgIHZhciB0eXBlID0gaXNXb3JkQ2hhcihjdXIsIGhlbHBlcikgPyBcIndcIiA6IGdyb3VwICYmIGN1ciA9PSBcIlxcblwiID8gXCJuXCIgOiAhZ3JvdXAgfHwgL1xccy8udGVzdChjdXIpID8gbnVsbCA6IFwicFwiO1xuXG4gICAgICAgIGlmIChncm91cCAmJiAhZmlyc3QgJiYgIXR5cGUpIHtcbiAgICAgICAgICB0eXBlID0gXCJzXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2F3VHlwZSAmJiBzYXdUeXBlICE9IHR5cGUpIHtcbiAgICAgICAgICBpZiAoZGlyIDwgMCkge1xuICAgICAgICAgICAgZGlyID0gMTtcbiAgICAgICAgICAgIG1vdmVPbmNlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZSkge1xuICAgICAgICAgIHNhd1R5cGUgPSB0eXBlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpciA+IDAgJiYgIW1vdmVPbmNlKCFmaXJzdCkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSBza2lwQXRvbWljKGRvYywgUG9zKGxpbmUsIGNoKSwgcG9zLCBvcmlnRGlyLCB0cnVlKTtcblxuICAgIGlmICghY21wKHBvcywgcmVzdWx0KSkge1xuICAgICAgcmVzdWx0LmhpdFNpZGUgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gLy8gRm9yIHJlbGF0aXZlIHZlcnRpY2FsIG1vdmVtZW50LiBEaXIgbWF5IGJlIC0xIG9yIDEuIFVuaXQgY2FuIGJlXG4gIC8vIFwicGFnZVwiIG9yIFwibGluZVwiLiBUaGUgcmVzdWx0aW5nIHBvc2l0aW9uIHdpbGwgaGF2ZSBhIGhpdFNpZGU9dHJ1ZVxuICAvLyBwcm9wZXJ0eSBpZiBpdCByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGRvY3VtZW50LlxuXG5cbiAgZnVuY3Rpb24gX2ZpbmRQb3NWKGNtLCBwb3MsIGRpciwgdW5pdCkge1xuICAgIHZhciBkb2MgPSBjbS5kb2MsXG4gICAgICAgIHggPSBwb3MubGVmdCxcbiAgICAgICAgeTtcblxuICAgIGlmICh1bml0ID09IFwicGFnZVwiKSB7XG4gICAgICB2YXIgcGFnZVNpemUgPSBNYXRoLm1pbihjbS5kaXNwbGF5LndyYXBwZXIuY2xpZW50SGVpZ2h0LCB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCk7XG4gICAgICB2YXIgbW92ZUFtb3VudCA9IE1hdGgubWF4KHBhZ2VTaXplIC0gLjUgKiB0ZXh0SGVpZ2h0KGNtLmRpc3BsYXkpLCAzKTtcbiAgICAgIHkgPSAoZGlyID4gMCA/IHBvcy5ib3R0b20gOiBwb3MudG9wKSArIGRpciAqIG1vdmVBbW91bnQ7XG4gICAgfSBlbHNlIGlmICh1bml0ID09IFwibGluZVwiKSB7XG4gICAgICB5ID0gZGlyID4gMCA/IHBvcy5ib3R0b20gKyAzIDogcG9zLnRvcCAtIDM7XG4gICAgfVxuXG4gICAgdmFyIHRhcmdldDtcblxuICAgIGZvciAoOzspIHtcbiAgICAgIHRhcmdldCA9IF9jb29yZHNDaGFyKGNtLCB4LCB5KTtcblxuICAgICAgaWYgKCF0YXJnZXQub3V0c2lkZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKGRpciA8IDAgPyB5IDw9IDAgOiB5ID49IGRvYy5oZWlnaHQpIHtcbiAgICAgICAgdGFyZ2V0LmhpdFNpZGUgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgeSArPSBkaXIgKiA1O1xuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH0gLy8gQ09OVEVOVEVESVRBQkxFIElOUFVUIFNUWUxFXG5cblxuICB2YXIgQ29udGVudEVkaXRhYmxlSW5wdXQgPSBmdW5jdGlvbiBDb250ZW50RWRpdGFibGVJbnB1dChjbSkge1xuICAgIHRoaXMuY20gPSBjbTtcbiAgICB0aGlzLmxhc3RBbmNob3JOb2RlID0gdGhpcy5sYXN0QW5jaG9yT2Zmc2V0ID0gdGhpcy5sYXN0Rm9jdXNOb2RlID0gdGhpcy5sYXN0Rm9jdXNPZmZzZXQgPSBudWxsO1xuICAgIHRoaXMucG9sbGluZyA9IG5ldyBEZWxheWVkKCk7XG4gICAgdGhpcy5jb21wb3NpbmcgPSBudWxsO1xuICAgIHRoaXMuZ3JhY2VQZXJpb2QgPSBmYWxzZTtcbiAgICB0aGlzLnJlYWRET01UaW1lb3V0ID0gbnVsbDtcbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChkaXNwbGF5KSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG4gICAgdmFyIGlucHV0ID0gdGhpcyxcbiAgICAgICAgY20gPSBpbnB1dC5jbTtcbiAgICB2YXIgZGl2ID0gaW5wdXQuZGl2ID0gZGlzcGxheS5saW5lRGl2O1xuICAgIGRpc2FibGVCcm93c2VyTWFnaWMoZGl2LCBjbS5vcHRpb25zLnNwZWxsY2hlY2spO1xuICAgIG9uKGRpdiwgXCJwYXN0ZVwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKHNpZ25hbERPTUV2ZW50KGNtLCBlKSB8fCBoYW5kbGVQYXN0ZShlLCBjbSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyBJRSBkb2Vzbid0IGZpcmUgaW5wdXQgZXZlbnRzLCBzbyB3ZSBzY2hlZHVsZSBhIHJlYWQgZm9yIHRoZSBwYXN0ZWQgY29udGVudCBpbiB0aGlzIHdheVxuXG5cbiAgICAgIGlmIChpZV92ZXJzaW9uIDw9IDExKSB7XG4gICAgICAgIHNldFRpbWVvdXQob3BlcmF0aW9uKGNtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKCFpbnB1dC5wb2xsQ29udGVudCgpKSB7XG4gICAgICAgICAgICByZWdDaGFuZ2UoY20pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSksIDIwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBvbihkaXYsIFwiY29tcG9zaXRpb25zdGFydFwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgdGhpcyQxLmNvbXBvc2luZyA9IHtcbiAgICAgICAgZGF0YTogZS5kYXRhLFxuICAgICAgICBkb25lOiBmYWxzZVxuICAgICAgfTtcbiAgICB9KTtcbiAgICBvbihkaXYsIFwiY29tcG9zaXRpb251cGRhdGVcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmICghdGhpcyQxLmNvbXBvc2luZykge1xuICAgICAgICB0aGlzJDEuY29tcG9zaW5nID0ge1xuICAgICAgICAgIGRhdGE6IGUuZGF0YSxcbiAgICAgICAgICBkb25lOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuICAgIG9uKGRpdiwgXCJjb21wb3NpdGlvbmVuZFwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKHRoaXMkMS5jb21wb3NpbmcpIHtcbiAgICAgICAgaWYgKGUuZGF0YSAhPSB0aGlzJDEuY29tcG9zaW5nLmRhdGEpIHtcbiAgICAgICAgICB0aGlzJDEucmVhZEZyb21ET01Tb29uKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzJDEuY29tcG9zaW5nLmRvbmUgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG9uKGRpdiwgXCJ0b3VjaHN0YXJ0XCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpbnB1dC5mb3JjZUNvbXBvc2l0aW9uRW5kKCk7XG4gICAgfSk7XG4gICAgb24oZGl2LCBcImlucHV0XCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghdGhpcyQxLmNvbXBvc2luZykge1xuICAgICAgICB0aGlzJDEucmVhZEZyb21ET01Tb29uKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBvbkNvcHlDdXQoZSkge1xuICAgICAgaWYgKHNpZ25hbERPTUV2ZW50KGNtLCBlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChjbS5zb21ldGhpbmdTZWxlY3RlZCgpKSB7XG4gICAgICAgIHNldExhc3RDb3BpZWQoe1xuICAgICAgICAgIGxpbmVXaXNlOiBmYWxzZSxcbiAgICAgICAgICB0ZXh0OiBjbS5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGUudHlwZSA9PSBcImN1dFwiKSB7XG4gICAgICAgICAgY20ucmVwbGFjZVNlbGVjdGlvbihcIlwiLCBudWxsLCBcImN1dFwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghY20ub3B0aW9ucy5saW5lV2lzZUNvcHlDdXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJhbmdlcyA9IGNvcHlhYmxlUmFuZ2VzKGNtKTtcbiAgICAgICAgc2V0TGFzdENvcGllZCh7XG4gICAgICAgICAgbGluZVdpc2U6IHRydWUsXG4gICAgICAgICAgdGV4dDogcmFuZ2VzLnRleHRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGUudHlwZSA9PSBcImN1dFwiKSB7XG4gICAgICAgICAgY20ub3BlcmF0aW9uKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNtLnNldFNlbGVjdGlvbnMocmFuZ2VzLnJhbmdlcywgMCwgc2VsX2RvbnRTY3JvbGwpO1xuICAgICAgICAgICAgY20ucmVwbGFjZVNlbGVjdGlvbihcIlwiLCBudWxsLCBcImN1dFwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZS5jbGlwYm9hcmREYXRhKSB7XG4gICAgICAgIGUuY2xpcGJvYXJkRGF0YS5jbGVhckRhdGEoKTtcbiAgICAgICAgdmFyIGNvbnRlbnQgPSBsYXN0Q29waWVkLnRleHQuam9pbihcIlxcblwiKTsgLy8gaU9TIGV4cG9zZXMgdGhlIGNsaXBib2FyZCBBUEksIGJ1dCBzZWVtcyB0byBkaXNjYXJkIGNvbnRlbnQgaW5zZXJ0ZWQgaW50byBpdFxuXG4gICAgICAgIGUuY2xpcGJvYXJkRGF0YS5zZXREYXRhKFwiVGV4dFwiLCBjb250ZW50KTtcblxuICAgICAgICBpZiAoZS5jbGlwYm9hcmREYXRhLmdldERhdGEoXCJUZXh0XCIpID09IGNvbnRlbnQpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IC8vIE9sZC1mYXNoaW9uZWQgYnJpZWZseS1mb2N1cy1hLXRleHRhcmVhIGhhY2tcblxuXG4gICAgICB2YXIga2x1ZGdlID0gaGlkZGVuVGV4dGFyZWEoKSxcbiAgICAgICAgICB0ZSA9IGtsdWRnZS5maXJzdENoaWxkO1xuICAgICAgY20uZGlzcGxheS5saW5lU3BhY2UuaW5zZXJ0QmVmb3JlKGtsdWRnZSwgY20uZGlzcGxheS5saW5lU3BhY2UuZmlyc3RDaGlsZCk7XG4gICAgICB0ZS52YWx1ZSA9IGxhc3RDb3BpZWQudGV4dC5qb2luKFwiXFxuXCIpO1xuICAgICAgdmFyIGhhZEZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICAgIHNlbGVjdElucHV0KHRlKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBjbS5kaXNwbGF5LmxpbmVTcGFjZS5yZW1vdmVDaGlsZChrbHVkZ2UpO1xuICAgICAgICBoYWRGb2N1cy5mb2N1cygpO1xuXG4gICAgICAgIGlmIChoYWRGb2N1cyA9PSBkaXYpIHtcbiAgICAgICAgICBpbnB1dC5zaG93UHJpbWFyeVNlbGVjdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9LCA1MCk7XG4gICAgfVxuXG4gICAgb24oZGl2LCBcImNvcHlcIiwgb25Db3B5Q3V0KTtcbiAgICBvbihkaXYsIFwiY3V0XCIsIG9uQ29weUN1dCk7XG4gIH07XG5cbiAgQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLnByZXBhcmVTZWxlY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IHByZXBhcmVTZWxlY3Rpb24odGhpcy5jbSwgZmFsc2UpO1xuICAgIHJlc3VsdC5mb2N1cyA9IHRoaXMuY20uc3RhdGUuZm9jdXNlZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIENvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5zaG93U2VsZWN0aW9uID0gZnVuY3Rpb24gKGluZm8sIHRha2VGb2N1cykge1xuICAgIGlmICghaW5mbyB8fCAhdGhpcy5jbS5kaXNwbGF5LnZpZXcubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGluZm8uZm9jdXMgfHwgdGFrZUZvY3VzKSB7XG4gICAgICB0aGlzLnNob3dQcmltYXJ5U2VsZWN0aW9uKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zaG93TXVsdGlwbGVTZWxlY3Rpb25zKGluZm8pO1xuICB9O1xuXG4gIENvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5zaG93UHJpbWFyeVNlbGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpLFxuICAgICAgICBwcmltID0gdGhpcy5jbS5kb2Muc2VsLnByaW1hcnkoKTtcbiAgICB2YXIgY3VyQW5jaG9yID0gZG9tVG9Qb3ModGhpcy5jbSwgc2VsLmFuY2hvck5vZGUsIHNlbC5hbmNob3JPZmZzZXQpO1xuICAgIHZhciBjdXJGb2N1cyA9IGRvbVRvUG9zKHRoaXMuY20sIHNlbC5mb2N1c05vZGUsIHNlbC5mb2N1c09mZnNldCk7XG5cbiAgICBpZiAoY3VyQW5jaG9yICYmICFjdXJBbmNob3IuYmFkICYmIGN1ckZvY3VzICYmICFjdXJGb2N1cy5iYWQgJiYgY21wKG1pblBvcyhjdXJBbmNob3IsIGN1ckZvY3VzKSwgcHJpbS5mcm9tKCkpID09IDAgJiYgY21wKG1heFBvcyhjdXJBbmNob3IsIGN1ckZvY3VzKSwgcHJpbS50bygpKSA9PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0ID0gcG9zVG9ET00odGhpcy5jbSwgcHJpbS5mcm9tKCkpO1xuICAgIHZhciBlbmQgPSBwb3NUb0RPTSh0aGlzLmNtLCBwcmltLnRvKCkpO1xuXG4gICAgaWYgKCFzdGFydCAmJiAhZW5kKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHZpZXcgPSB0aGlzLmNtLmRpc3BsYXkudmlldztcbiAgICB2YXIgb2xkID0gc2VsLnJhbmdlQ291bnQgJiYgc2VsLmdldFJhbmdlQXQoMCk7XG5cbiAgICBpZiAoIXN0YXJ0KSB7XG4gICAgICBzdGFydCA9IHtcbiAgICAgICAgbm9kZTogdmlld1swXS5tZWFzdXJlLm1hcFsyXSxcbiAgICAgICAgb2Zmc2V0OiAwXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoIWVuZCkge1xuICAgICAgLy8gRklYTUUgZGFuZ2Vyb3VzbHkgaGFja3lcbiAgICAgIHZhciBtZWFzdXJlID0gdmlld1t2aWV3Lmxlbmd0aCAtIDFdLm1lYXN1cmU7XG4gICAgICB2YXIgbWFwID0gbWVhc3VyZS5tYXBzID8gbWVhc3VyZS5tYXBzW21lYXN1cmUubWFwcy5sZW5ndGggLSAxXSA6IG1lYXN1cmUubWFwO1xuICAgICAgZW5kID0ge1xuICAgICAgICBub2RlOiBtYXBbbWFwLmxlbmd0aCAtIDFdLFxuICAgICAgICBvZmZzZXQ6IG1hcFttYXAubGVuZ3RoIC0gMl0gLSBtYXBbbWFwLmxlbmd0aCAtIDNdXG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBybmc7XG5cbiAgICB0cnkge1xuICAgICAgcm5nID0gcmFuZ2Uoc3RhcnQubm9kZSwgc3RhcnQub2Zmc2V0LCBlbmQub2Zmc2V0LCBlbmQubm9kZSk7XG4gICAgfSBjYXRjaCAoZSkge30gLy8gT3VyIG1vZGVsIG9mIHRoZSBET00gbWlnaHQgYmUgb3V0ZGF0ZWQsIGluIHdoaWNoIGNhc2UgdGhlIHJhbmdlIHdlIHRyeSB0byBzZXQgY2FuIGJlIGltcG9zc2libGVcblxuXG4gICAgaWYgKHJuZykge1xuICAgICAgaWYgKCFnZWNrbyAmJiB0aGlzLmNtLnN0YXRlLmZvY3VzZWQpIHtcbiAgICAgICAgc2VsLmNvbGxhcHNlKHN0YXJ0Lm5vZGUsIHN0YXJ0Lm9mZnNldCk7XG5cbiAgICAgICAgaWYgKCFybmcuY29sbGFwc2VkKSB7XG4gICAgICAgICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICAgIHNlbC5hZGRSYW5nZShybmcpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgIHNlbC5hZGRSYW5nZShybmcpO1xuICAgICAgfVxuXG4gICAgICBpZiAob2xkICYmIHNlbC5hbmNob3JOb2RlID09IG51bGwpIHtcbiAgICAgICAgc2VsLmFkZFJhbmdlKG9sZCk7XG4gICAgICB9IGVsc2UgaWYgKGdlY2tvKSB7XG4gICAgICAgIHRoaXMuc3RhcnRHcmFjZVBlcmlvZCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucmVtZW1iZXJTZWxlY3Rpb24oKTtcbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUuc3RhcnRHcmFjZVBlcmlvZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcbiAgICBjbGVhclRpbWVvdXQodGhpcy5ncmFjZVBlcmlvZCk7XG4gICAgdGhpcy5ncmFjZVBlcmlvZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcyQxLmdyYWNlUGVyaW9kID0gZmFsc2U7XG5cbiAgICAgIGlmICh0aGlzJDEuc2VsZWN0aW9uQ2hhbmdlZCgpKSB7XG4gICAgICAgIHRoaXMkMS5jbS5vcGVyYXRpb24oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzJDEuY20uY3VyT3Auc2VsZWN0aW9uQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIDIwKTtcbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUuc2hvd011bHRpcGxlU2VsZWN0aW9ucyA9IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQodGhpcy5jbS5kaXNwbGF5LmN1cnNvckRpdiwgaW5mby5jdXJzb3JzKTtcbiAgICByZW1vdmVDaGlsZHJlbkFuZEFkZCh0aGlzLmNtLmRpc3BsYXkuc2VsZWN0aW9uRGl2LCBpbmZvLnNlbGVjdGlvbik7XG4gIH07XG5cbiAgQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLnJlbWVtYmVyU2VsZWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgdGhpcy5sYXN0QW5jaG9yTm9kZSA9IHNlbC5hbmNob3JOb2RlO1xuICAgIHRoaXMubGFzdEFuY2hvck9mZnNldCA9IHNlbC5hbmNob3JPZmZzZXQ7XG4gICAgdGhpcy5sYXN0Rm9jdXNOb2RlID0gc2VsLmZvY3VzTm9kZTtcbiAgICB0aGlzLmxhc3RGb2N1c09mZnNldCA9IHNlbC5mb2N1c09mZnNldDtcbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUuc2VsZWN0aW9uSW5FZGl0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcblxuICAgIGlmICghc2VsLnJhbmdlQ291bnQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbm9kZSA9IHNlbC5nZXRSYW5nZUF0KDApLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyO1xuICAgIHJldHVybiBjb250YWlucyh0aGlzLmRpdiwgbm9kZSk7XG4gIH07XG5cbiAgQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLmZvY3VzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmNtLm9wdGlvbnMucmVhZE9ubHkgIT0gXCJub2N1cnNvclwiKSB7XG4gICAgICBpZiAoIXRoaXMuc2VsZWN0aW9uSW5FZGl0b3IoKSkge1xuICAgICAgICB0aGlzLnNob3dTZWxlY3Rpb24odGhpcy5wcmVwYXJlU2VsZWN0aW9uKCksIHRydWUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRpdi5mb2N1cygpO1xuICAgIH1cbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUuYmx1ciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmRpdi5ibHVyKCk7XG4gIH07XG5cbiAgQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLmdldEZpZWxkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmRpdjtcbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUuc3VwcG9ydHNUb3VjaCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUucmVjZWl2ZWRGb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaW5wdXQgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuc2VsZWN0aW9uSW5FZGl0b3IoKSkge1xuICAgICAgdGhpcy5wb2xsU2VsZWN0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJ1bkluT3AodGhpcy5jbSwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gaW5wdXQuY20uY3VyT3Auc2VsZWN0aW9uQ2hhbmdlZCA9IHRydWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2xsKCkge1xuICAgICAgaWYgKGlucHV0LmNtLnN0YXRlLmZvY3VzZWQpIHtcbiAgICAgICAgaW5wdXQucG9sbFNlbGVjdGlvbigpO1xuICAgICAgICBpbnB1dC5wb2xsaW5nLnNldChpbnB1dC5jbS5vcHRpb25zLnBvbGxJbnRlcnZhbCwgcG9sbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5wb2xsaW5nLnNldCh0aGlzLmNtLm9wdGlvbnMucG9sbEludGVydmFsLCBwb2xsKTtcbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUuc2VsZWN0aW9uQ2hhbmdlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIHJldHVybiBzZWwuYW5jaG9yTm9kZSAhPSB0aGlzLmxhc3RBbmNob3JOb2RlIHx8IHNlbC5hbmNob3JPZmZzZXQgIT0gdGhpcy5sYXN0QW5jaG9yT2Zmc2V0IHx8IHNlbC5mb2N1c05vZGUgIT0gdGhpcy5sYXN0Rm9jdXNOb2RlIHx8IHNlbC5mb2N1c09mZnNldCAhPSB0aGlzLmxhc3RGb2N1c09mZnNldDtcbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUucG9sbFNlbGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuY29tcG9zaW5nICYmIHRoaXMucmVhZERPTVRpbWVvdXQgPT0gbnVsbCAmJiAhdGhpcy5ncmFjZVBlcmlvZCAmJiB0aGlzLnNlbGVjdGlvbkNoYW5nZWQoKSkge1xuICAgICAgdmFyIHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSxcbiAgICAgICAgICBjbSA9IHRoaXMuY207XG4gICAgICB0aGlzLnJlbWVtYmVyU2VsZWN0aW9uKCk7XG4gICAgICB2YXIgYW5jaG9yID0gZG9tVG9Qb3MoY20sIHNlbC5hbmNob3JOb2RlLCBzZWwuYW5jaG9yT2Zmc2V0KTtcbiAgICAgIHZhciBoZWFkID0gZG9tVG9Qb3MoY20sIHNlbC5mb2N1c05vZGUsIHNlbC5mb2N1c09mZnNldCk7XG5cbiAgICAgIGlmIChhbmNob3IgJiYgaGVhZCkge1xuICAgICAgICBydW5Jbk9wKGNtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2V0U2VsZWN0aW9uKGNtLmRvYywgc2ltcGxlU2VsZWN0aW9uKGFuY2hvciwgaGVhZCksIHNlbF9kb250U2Nyb2xsKTtcblxuICAgICAgICAgIGlmIChhbmNob3IuYmFkIHx8IGhlYWQuYmFkKSB7XG4gICAgICAgICAgICBjbS5jdXJPcC5zZWxlY3Rpb25DaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUucG9sbENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucmVhZERPTVRpbWVvdXQgIT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVhZERPTVRpbWVvdXQpO1xuICAgICAgdGhpcy5yZWFkRE9NVGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGNtID0gdGhpcy5jbSxcbiAgICAgICAgZGlzcGxheSA9IGNtLmRpc3BsYXksXG4gICAgICAgIHNlbCA9IGNtLmRvYy5zZWwucHJpbWFyeSgpO1xuICAgIHZhciBmcm9tID0gc2VsLmZyb20oKSxcbiAgICAgICAgdG8gPSBzZWwudG8oKTtcblxuICAgIGlmIChmcm9tLmNoID09IDAgJiYgZnJvbS5saW5lID4gY20uZmlyc3RMaW5lKCkpIHtcbiAgICAgIGZyb20gPSBQb3MoZnJvbS5saW5lIC0gMSwgZ2V0TGluZShjbS5kb2MsIGZyb20ubGluZSAtIDEpLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYgKHRvLmNoID09IGdldExpbmUoY20uZG9jLCB0by5saW5lKS50ZXh0Lmxlbmd0aCAmJiB0by5saW5lIDwgY20ubGFzdExpbmUoKSkge1xuICAgICAgdG8gPSBQb3ModG8ubGluZSArIDEsIDApO1xuICAgIH1cblxuICAgIGlmIChmcm9tLmxpbmUgPCBkaXNwbGF5LnZpZXdGcm9tIHx8IHRvLmxpbmUgPiBkaXNwbGF5LnZpZXdUbyAtIDEpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgZnJvbUluZGV4LCBmcm9tTGluZSwgZnJvbU5vZGU7XG5cbiAgICBpZiAoZnJvbS5saW5lID09IGRpc3BsYXkudmlld0Zyb20gfHwgKGZyb21JbmRleCA9IGZpbmRWaWV3SW5kZXgoY20sIGZyb20ubGluZSkpID09IDApIHtcbiAgICAgIGZyb21MaW5lID0gbGluZU5vKGRpc3BsYXkudmlld1swXS5saW5lKTtcbiAgICAgIGZyb21Ob2RlID0gZGlzcGxheS52aWV3WzBdLm5vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZyb21MaW5lID0gbGluZU5vKGRpc3BsYXkudmlld1tmcm9tSW5kZXhdLmxpbmUpO1xuICAgICAgZnJvbU5vZGUgPSBkaXNwbGF5LnZpZXdbZnJvbUluZGV4IC0gMV0ubm9kZS5uZXh0U2libGluZztcbiAgICB9XG5cbiAgICB2YXIgdG9JbmRleCA9IGZpbmRWaWV3SW5kZXgoY20sIHRvLmxpbmUpO1xuICAgIHZhciB0b0xpbmUsIHRvTm9kZTtcblxuICAgIGlmICh0b0luZGV4ID09IGRpc3BsYXkudmlldy5sZW5ndGggLSAxKSB7XG4gICAgICB0b0xpbmUgPSBkaXNwbGF5LnZpZXdUbyAtIDE7XG4gICAgICB0b05vZGUgPSBkaXNwbGF5LmxpbmVEaXYubGFzdENoaWxkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b0xpbmUgPSBsaW5lTm8oZGlzcGxheS52aWV3W3RvSW5kZXggKyAxXS5saW5lKSAtIDE7XG4gICAgICB0b05vZGUgPSBkaXNwbGF5LnZpZXdbdG9JbmRleCArIDFdLm5vZGUucHJldmlvdXNTaWJsaW5nO1xuICAgIH1cblxuICAgIGlmICghZnJvbU5vZGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbmV3VGV4dCA9IGNtLmRvYy5zcGxpdExpbmVzKGRvbVRleHRCZXR3ZWVuKGNtLCBmcm9tTm9kZSwgdG9Ob2RlLCBmcm9tTGluZSwgdG9MaW5lKSk7XG4gICAgdmFyIG9sZFRleHQgPSBnZXRCZXR3ZWVuKGNtLmRvYywgUG9zKGZyb21MaW5lLCAwKSwgUG9zKHRvTGluZSwgZ2V0TGluZShjbS5kb2MsIHRvTGluZSkudGV4dC5sZW5ndGgpKTtcblxuICAgIHdoaWxlIChuZXdUZXh0Lmxlbmd0aCA+IDEgJiYgb2xkVGV4dC5sZW5ndGggPiAxKSB7XG4gICAgICBpZiAobHN0KG5ld1RleHQpID09IGxzdChvbGRUZXh0KSkge1xuICAgICAgICBuZXdUZXh0LnBvcCgpO1xuICAgICAgICBvbGRUZXh0LnBvcCgpO1xuICAgICAgICB0b0xpbmUtLTtcbiAgICAgIH0gZWxzZSBpZiAobmV3VGV4dFswXSA9PSBvbGRUZXh0WzBdKSB7XG4gICAgICAgIG5ld1RleHQuc2hpZnQoKTtcbiAgICAgICAgb2xkVGV4dC5zaGlmdCgpO1xuICAgICAgICBmcm9tTGluZSsrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGN1dEZyb250ID0gMCxcbiAgICAgICAgY3V0RW5kID0gMDtcbiAgICB2YXIgbmV3VG9wID0gbmV3VGV4dFswXSxcbiAgICAgICAgb2xkVG9wID0gb2xkVGV4dFswXSxcbiAgICAgICAgbWF4Q3V0RnJvbnQgPSBNYXRoLm1pbihuZXdUb3AubGVuZ3RoLCBvbGRUb3AubGVuZ3RoKTtcblxuICAgIHdoaWxlIChjdXRGcm9udCA8IG1heEN1dEZyb250ICYmIG5ld1RvcC5jaGFyQ29kZUF0KGN1dEZyb250KSA9PSBvbGRUb3AuY2hhckNvZGVBdChjdXRGcm9udCkpIHtcbiAgICAgICsrY3V0RnJvbnQ7XG4gICAgfVxuXG4gICAgdmFyIG5ld0JvdCA9IGxzdChuZXdUZXh0KSxcbiAgICAgICAgb2xkQm90ID0gbHN0KG9sZFRleHQpO1xuICAgIHZhciBtYXhDdXRFbmQgPSBNYXRoLm1pbihuZXdCb3QubGVuZ3RoIC0gKG5ld1RleHQubGVuZ3RoID09IDEgPyBjdXRGcm9udCA6IDApLCBvbGRCb3QubGVuZ3RoIC0gKG9sZFRleHQubGVuZ3RoID09IDEgPyBjdXRGcm9udCA6IDApKTtcblxuICAgIHdoaWxlIChjdXRFbmQgPCBtYXhDdXRFbmQgJiYgbmV3Qm90LmNoYXJDb2RlQXQobmV3Qm90Lmxlbmd0aCAtIGN1dEVuZCAtIDEpID09IG9sZEJvdC5jaGFyQ29kZUF0KG9sZEJvdC5sZW5ndGggLSBjdXRFbmQgLSAxKSkge1xuICAgICAgKytjdXRFbmQ7XG4gICAgfVxuXG4gICAgbmV3VGV4dFtuZXdUZXh0Lmxlbmd0aCAtIDFdID0gbmV3Qm90LnNsaWNlKDAsIG5ld0JvdC5sZW5ndGggLSBjdXRFbmQpLnJlcGxhY2UoL15cXHUyMDBiKy8sIFwiXCIpO1xuICAgIG5ld1RleHRbMF0gPSBuZXdUZXh0WzBdLnNsaWNlKGN1dEZyb250KS5yZXBsYWNlKC9cXHUyMDBiKyQvLCBcIlwiKTtcbiAgICB2YXIgY2hGcm9tID0gUG9zKGZyb21MaW5lLCBjdXRGcm9udCk7XG4gICAgdmFyIGNoVG8gPSBQb3ModG9MaW5lLCBvbGRUZXh0Lmxlbmd0aCA/IGxzdChvbGRUZXh0KS5sZW5ndGggLSBjdXRFbmQgOiAwKTtcblxuICAgIGlmIChuZXdUZXh0Lmxlbmd0aCA+IDEgfHwgbmV3VGV4dFswXSB8fCBjbXAoY2hGcm9tLCBjaFRvKSkge1xuICAgICAgX3JlcGxhY2VSYW5nZShjbS5kb2MsIG5ld1RleHQsIGNoRnJvbSwgY2hUbywgXCIraW5wdXRcIik7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUuZW5zdXJlUG9sbGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZm9yY2VDb21wb3NpdGlvbkVuZCgpO1xuICB9O1xuXG4gIENvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZvcmNlQ29tcG9zaXRpb25FbmQoKTtcbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUuZm9yY2VDb21wb3NpdGlvbkVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuY29tcG9zaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMucmVhZERPTVRpbWVvdXQpO1xuICAgIHRoaXMuY29tcG9zaW5nID0gbnVsbDtcblxuICAgIGlmICghdGhpcy5wb2xsQ29udGVudCgpKSB7XG4gICAgICByZWdDaGFuZ2UodGhpcy5jbSk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXYuYmx1cigpO1xuICAgIHRoaXMuZGl2LmZvY3VzKCk7XG4gIH07XG5cbiAgQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLnJlYWRGcm9tRE9NU29vbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgIGlmICh0aGlzLnJlYWRET01UaW1lb3V0ICE9IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnJlYWRET01UaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzJDEucmVhZERPTVRpbWVvdXQgPSBudWxsO1xuXG4gICAgICBpZiAodGhpcyQxLmNvbXBvc2luZykge1xuICAgICAgICBpZiAodGhpcyQxLmNvbXBvc2luZy5kb25lKSB7XG4gICAgICAgICAgdGhpcyQxLmNvbXBvc2luZyA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzJDEuY20uaXNSZWFkT25seSgpIHx8ICF0aGlzJDEucG9sbENvbnRlbnQoKSkge1xuICAgICAgICBydW5Jbk9wKHRoaXMkMS5jbSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiByZWdDaGFuZ2UodGhpcyQxLmNtKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwgODApO1xuICB9O1xuXG4gIENvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5zZXRVbmVkaXRhYmxlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICBub2RlLmNvbnRlbnRFZGl0YWJsZSA9IFwiZmFsc2VcIjtcbiAgfTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUub25LZXlQcmVzcyA9IGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgaWYgKCF0aGlzLmNtLmlzUmVhZE9ubHkoKSkge1xuICAgICAgb3BlcmF0aW9uKHRoaXMuY20sIGFwcGx5VGV4dElucHV0KSh0aGlzLmNtLCBTdHJpbmcuZnJvbUNoYXJDb2RlKGUuY2hhckNvZGUgPT0gbnVsbCA/IGUua2V5Q29kZSA6IGUuY2hhckNvZGUpLCAwKTtcbiAgICB9XG4gIH07XG5cbiAgQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLnJlYWRPbmx5Q2hhbmdlZCA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICB0aGlzLmRpdi5jb250ZW50RWRpdGFibGUgPSBTdHJpbmcodmFsICE9IFwibm9jdXJzb3JcIik7XG4gIH07XG5cbiAgQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLm9uQ29udGV4dE1lbnUgPSBmdW5jdGlvbiAoKSB7fTtcblxuICBDb250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUucmVzZXRQb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gIENvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5uZWVkc0NvbnRlbnRBdHRyaWJ1dGUgPSB0cnVlO1xuXG4gIGZ1bmN0aW9uIHBvc1RvRE9NKGNtLCBwb3MpIHtcbiAgICB2YXIgdmlldyA9IGZpbmRWaWV3Rm9yTGluZShjbSwgcG9zLmxpbmUpO1xuXG4gICAgaWYgKCF2aWV3IHx8IHZpZXcuaGlkZGVuKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbGluZSA9IGdldExpbmUoY20uZG9jLCBwb3MubGluZSk7XG4gICAgdmFyIGluZm8gPSBtYXBGcm9tTGluZVZpZXcodmlldywgbGluZSwgcG9zLmxpbmUpO1xuICAgIHZhciBvcmRlciA9IGdldE9yZGVyKGxpbmUpLFxuICAgICAgICBzaWRlID0gXCJsZWZ0XCI7XG5cbiAgICBpZiAob3JkZXIpIHtcbiAgICAgIHZhciBwYXJ0UG9zID0gZ2V0QmlkaVBhcnRBdChvcmRlciwgcG9zLmNoKTtcbiAgICAgIHNpZGUgPSBwYXJ0UG9zICUgMiA/IFwicmlnaHRcIiA6IFwibGVmdFwiO1xuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSBub2RlQW5kT2Zmc2V0SW5MaW5lTWFwKGluZm8ubWFwLCBwb3MuY2gsIHNpZGUpO1xuICAgIHJlc3VsdC5vZmZzZXQgPSByZXN1bHQuY29sbGFwc2UgPT0gXCJyaWdodFwiID8gcmVzdWx0LmVuZCA6IHJlc3VsdC5zdGFydDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gYmFkUG9zKHBvcywgYmFkKSB7XG4gICAgaWYgKGJhZCkge1xuICAgICAgcG9zLmJhZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGRvbVRleHRCZXR3ZWVuKGNtLCBmcm9tLCB0bywgZnJvbUxpbmUsIHRvTGluZSkge1xuICAgIHZhciB0ZXh0ID0gXCJcIixcbiAgICAgICAgY2xvc2luZyA9IGZhbHNlLFxuICAgICAgICBsaW5lU2VwID0gY20uZG9jLmxpbmVTZXBhcmF0b3IoKTtcblxuICAgIGZ1bmN0aW9uIHJlY29nbml6ZU1hcmtlcihpZCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtYXJrZXIpIHtcbiAgICAgICAgcmV0dXJuIG1hcmtlci5pZCA9PSBpZDtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gd2Fsayhub2RlKSB7XG4gICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PSAxKSB7XG4gICAgICAgIHZhciBjbVRleHQgPSBub2RlLmdldEF0dHJpYnV0ZShcImNtLXRleHRcIik7XG5cbiAgICAgICAgaWYgKGNtVGV4dCAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKGNtVGV4dCA9PSBcIlwiKSB7XG4gICAgICAgICAgICB0ZXh0ICs9IG5vZGUudGV4dENvbnRlbnQucmVwbGFjZSgvXFx1MjAwYi9nLCBcIlwiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGV4dCArPSBjbVRleHQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1hcmtlcklEID0gbm9kZS5nZXRBdHRyaWJ1dGUoXCJjbS1tYXJrZXJcIiksXG4gICAgICAgICAgICByYW5nZTtcblxuICAgICAgICBpZiAobWFya2VySUQpIHtcbiAgICAgICAgICB2YXIgZm91bmQgPSBjbS5maW5kTWFya3MoUG9zKGZyb21MaW5lLCAwKSwgUG9zKHRvTGluZSArIDEsIDApLCByZWNvZ25pemVNYXJrZXIoK21hcmtlcklEKSk7XG5cbiAgICAgICAgICBpZiAoZm91bmQubGVuZ3RoICYmIChyYW5nZSA9IGZvdW5kWzBdLmZpbmQoKSkpIHtcbiAgICAgICAgICAgIHRleHQgKz0gZ2V0QmV0d2VlbihjbS5kb2MsIHJhbmdlLmZyb20sIHJhbmdlLnRvKS5qb2luKGxpbmVTZXApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChub2RlLmdldEF0dHJpYnV0ZShcImNvbnRlbnRlZGl0YWJsZVwiKSA9PSBcImZhbHNlXCIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHdhbGsobm9kZS5jaGlsZE5vZGVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgvXihwcmV8ZGl2fHApJC9pLnRlc3Qobm9kZS5ub2RlTmFtZSkpIHtcbiAgICAgICAgICBjbG9zaW5nID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09IDMpIHtcbiAgICAgICAgdmFyIHZhbCA9IG5vZGUubm9kZVZhbHVlO1xuXG4gICAgICAgIGlmICghdmFsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsb3NpbmcpIHtcbiAgICAgICAgICB0ZXh0ICs9IGxpbmVTZXA7XG4gICAgICAgICAgY2xvc2luZyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGV4dCArPSB2YWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICg7Oykge1xuICAgICAgd2Fsayhmcm9tKTtcblxuICAgICAgaWYgKGZyb20gPT0gdG8pIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGZyb20gPSBmcm9tLm5leHRTaWJsaW5nO1xuICAgIH1cblxuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgZnVuY3Rpb24gZG9tVG9Qb3MoY20sIG5vZGUsIG9mZnNldCkge1xuICAgIHZhciBsaW5lTm9kZTtcblxuICAgIGlmIChub2RlID09IGNtLmRpc3BsYXkubGluZURpdikge1xuICAgICAgbGluZU5vZGUgPSBjbS5kaXNwbGF5LmxpbmVEaXYuY2hpbGROb2Rlc1tvZmZzZXRdO1xuXG4gICAgICBpZiAoIWxpbmVOb2RlKSB7XG4gICAgICAgIHJldHVybiBiYWRQb3MoY20uY2xpcFBvcyhQb3MoY20uZGlzcGxheS52aWV3VG8gLSAxKSksIHRydWUpO1xuICAgICAgfVxuXG4gICAgICBub2RlID0gbnVsbDtcbiAgICAgIG9mZnNldCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGluZU5vZGUgPSBub2RlOzsgbGluZU5vZGUgPSBsaW5lTm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICAgIGlmICghbGluZU5vZGUgfHwgbGluZU5vZGUgPT0gY20uZGlzcGxheS5saW5lRGl2KSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGluZU5vZGUucGFyZW50Tm9kZSAmJiBsaW5lTm9kZS5wYXJlbnROb2RlID09IGNtLmRpc3BsYXkubGluZURpdikge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbS5kaXNwbGF5LnZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBsaW5lVmlldyA9IGNtLmRpc3BsYXkudmlld1tpXTtcblxuICAgICAgaWYgKGxpbmVWaWV3Lm5vZGUgPT0gbGluZU5vZGUpIHtcbiAgICAgICAgcmV0dXJuIGxvY2F0ZU5vZGVJbkxpbmVWaWV3KGxpbmVWaWV3LCBub2RlLCBvZmZzZXQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGxvY2F0ZU5vZGVJbkxpbmVWaWV3KGxpbmVWaWV3LCBub2RlLCBvZmZzZXQpIHtcbiAgICB2YXIgd3JhcHBlciA9IGxpbmVWaWV3LnRleHQuZmlyc3RDaGlsZCxcbiAgICAgICAgYmFkID0gZmFsc2U7XG5cbiAgICBpZiAoIW5vZGUgfHwgIWNvbnRhaW5zKHdyYXBwZXIsIG5vZGUpKSB7XG4gICAgICByZXR1cm4gYmFkUG9zKFBvcyhsaW5lTm8obGluZVZpZXcubGluZSksIDApLCB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAobm9kZSA9PSB3cmFwcGVyKSB7XG4gICAgICBiYWQgPSB0cnVlO1xuICAgICAgbm9kZSA9IHdyYXBwZXIuY2hpbGROb2Rlc1tvZmZzZXRdO1xuICAgICAgb2Zmc2V0ID0gMDtcblxuICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZVZpZXcucmVzdCA/IGxzdChsaW5lVmlldy5yZXN0KSA6IGxpbmVWaWV3LmxpbmU7XG4gICAgICAgIHJldHVybiBiYWRQb3MoUG9zKGxpbmVObyhsaW5lKSwgbGluZS50ZXh0Lmxlbmd0aCksIGJhZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHRleHROb2RlID0gbm9kZS5ub2RlVHlwZSA9PSAzID8gbm9kZSA6IG51bGwsXG4gICAgICAgIHRvcE5vZGUgPSBub2RlO1xuXG4gICAgaWYgKCF0ZXh0Tm9kZSAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoID09IDEgJiYgbm9kZS5maXJzdENoaWxkLm5vZGVUeXBlID09IDMpIHtcbiAgICAgIHRleHROb2RlID0gbm9kZS5maXJzdENoaWxkO1xuXG4gICAgICBpZiAob2Zmc2V0KSB7XG4gICAgICAgIG9mZnNldCA9IHRleHROb2RlLm5vZGVWYWx1ZS5sZW5ndGg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgd2hpbGUgKHRvcE5vZGUucGFyZW50Tm9kZSAhPSB3cmFwcGVyKSB7XG4gICAgICB0b3BOb2RlID0gdG9wTm9kZS5wYXJlbnROb2RlO1xuICAgIH1cblxuICAgIHZhciBtZWFzdXJlID0gbGluZVZpZXcubWVhc3VyZSxcbiAgICAgICAgbWFwcyA9IG1lYXN1cmUubWFwcztcblxuICAgIGZ1bmN0aW9uIGZpbmQodGV4dE5vZGUsIHRvcE5vZGUsIG9mZnNldCkge1xuICAgICAgZm9yICh2YXIgaSA9IC0xOyBpIDwgKG1hcHMgPyBtYXBzLmxlbmd0aCA6IDApOyBpKyspIHtcbiAgICAgICAgdmFyIG1hcCA9IGkgPCAwID8gbWVhc3VyZS5tYXAgOiBtYXBzW2ldO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWFwLmxlbmd0aDsgaiArPSAzKSB7XG4gICAgICAgICAgdmFyIGN1ck5vZGUgPSBtYXBbaiArIDJdO1xuXG4gICAgICAgICAgaWYgKGN1ck5vZGUgPT0gdGV4dE5vZGUgfHwgY3VyTm9kZSA9PSB0b3BOb2RlKSB7XG4gICAgICAgICAgICB2YXIgbGluZSA9IGxpbmVObyhpIDwgMCA/IGxpbmVWaWV3LmxpbmUgOiBsaW5lVmlldy5yZXN0W2ldKTtcbiAgICAgICAgICAgIHZhciBjaCA9IG1hcFtqXSArIG9mZnNldDtcblxuICAgICAgICAgICAgaWYgKG9mZnNldCA8IDAgfHwgY3VyTm9kZSAhPSB0ZXh0Tm9kZSkge1xuICAgICAgICAgICAgICBjaCA9IG1hcFtqICsgKG9mZnNldCA/IDEgOiAwKV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBQb3MobGluZSwgY2gpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBmb3VuZCA9IGZpbmQodGV4dE5vZGUsIHRvcE5vZGUsIG9mZnNldCk7XG5cbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIHJldHVybiBiYWRQb3MoZm91bmQsIGJhZCk7XG4gICAgfSAvLyBGSVhNRSB0aGlzIGlzIGFsbCByZWFsbHkgc2hha3kuIG1pZ2h0IGhhbmRsZSB0aGUgZmV3IGNhc2VzIGl0IG5lZWRzIHRvIGhhbmRsZSwgYnV0IGxpa2VseSB0byBjYXVzZSBwcm9ibGVtc1xuXG5cbiAgICBmb3IgKHZhciBhZnRlciA9IHRvcE5vZGUubmV4dFNpYmxpbmcsIGRpc3QgPSB0ZXh0Tm9kZSA/IHRleHROb2RlLm5vZGVWYWx1ZS5sZW5ndGggLSBvZmZzZXQgOiAwOyBhZnRlcjsgYWZ0ZXIgPSBhZnRlci5uZXh0U2libGluZykge1xuICAgICAgZm91bmQgPSBmaW5kKGFmdGVyLCBhZnRlci5maXJzdENoaWxkLCAwKTtcblxuICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgIHJldHVybiBiYWRQb3MoUG9zKGZvdW5kLmxpbmUsIGZvdW5kLmNoIC0gZGlzdCksIGJhZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXN0ICs9IGFmdGVyLnRleHRDb250ZW50Lmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBiZWZvcmUgPSB0b3BOb2RlLnByZXZpb3VzU2libGluZywgZGlzdCQxID0gb2Zmc2V0OyBiZWZvcmU7IGJlZm9yZSA9IGJlZm9yZS5wcmV2aW91c1NpYmxpbmcpIHtcbiAgICAgIGZvdW5kID0gZmluZChiZWZvcmUsIGJlZm9yZS5maXJzdENoaWxkLCAtMSk7XG5cbiAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICByZXR1cm4gYmFkUG9zKFBvcyhmb3VuZC5saW5lLCBmb3VuZC5jaCArIGRpc3QkMSksIGJhZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXN0JDEgKz0gYmVmb3JlLnRleHRDb250ZW50Lmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG4gIH0gLy8gVEVYVEFSRUEgSU5QVVQgU1RZTEVcblxuXG4gIHZhciBUZXh0YXJlYUlucHV0ID0gZnVuY3Rpb24gVGV4dGFyZWFJbnB1dChjbSkge1xuICAgIHRoaXMuY20gPSBjbTsgLy8gU2VlIGlucHV0LnBvbGwgYW5kIGlucHV0LnJlc2V0XG5cbiAgICB0aGlzLnByZXZJbnB1dCA9IFwiXCI7IC8vIEZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciB3ZSBleHBlY3QgaW5wdXQgdG8gYXBwZWFyIHJlYWwgc29vblxuICAgIC8vIG5vdyAoYWZ0ZXIgc29tZSBldmVudCBsaWtlICdrZXlwcmVzcycgb3IgJ2lucHV0JykgYW5kIGFyZVxuICAgIC8vIHBvbGxpbmcgaW50ZW5zaXZlbHkuXG5cbiAgICB0aGlzLnBvbGxpbmdGYXN0ID0gZmFsc2U7IC8vIFNlbGYtcmVzZXR0aW5nIHRpbWVvdXQgZm9yIHRoZSBwb2xsZXJcblxuICAgIHRoaXMucG9sbGluZyA9IG5ldyBEZWxheWVkKCk7IC8vIFRyYWNrcyB3aGVuIGlucHV0LnJlc2V0IGhhcyBwdW50ZWQgdG8ganVzdCBwdXR0aW5nIGEgc2hvcnRcbiAgICAvLyBzdHJpbmcgaW50byB0aGUgdGV4dGFyZWEgaW5zdGVhZCBvZiB0aGUgZnVsbCBzZWxlY3Rpb24uXG5cbiAgICB0aGlzLmluYWNjdXJhdGVTZWxlY3Rpb24gPSBmYWxzZTsgLy8gVXNlZCB0byB3b3JrIGFyb3VuZCBJRSBpc3N1ZSB3aXRoIHNlbGVjdGlvbiBiZWluZyBmb3Jnb3R0ZW4gd2hlbiBmb2N1cyBtb3ZlcyBhd2F5IGZyb20gdGV4dGFyZWFcblxuICAgIHRoaXMuaGFzU2VsZWN0aW9uID0gZmFsc2U7XG4gICAgdGhpcy5jb21wb3NpbmcgPSBudWxsO1xuICB9O1xuXG4gIFRleHRhcmVhSW5wdXQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoZGlzcGxheSkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuICAgIHZhciBpbnB1dCA9IHRoaXMsXG4gICAgICAgIGNtID0gdGhpcy5jbTsgLy8gV3JhcHMgYW5kIGhpZGVzIGlucHV0IHRleHRhcmVhXG5cbiAgICB2YXIgZGl2ID0gdGhpcy53cmFwcGVyID0gaGlkZGVuVGV4dGFyZWEoKTsgLy8gVGhlIHNlbWloaWRkZW4gdGV4dGFyZWEgdGhhdCBpcyBmb2N1c2VkIHdoZW4gdGhlIGVkaXRvciBpc1xuICAgIC8vIGZvY3VzZWQsIGFuZCByZWNlaXZlcyBpbnB1dC5cblxuICAgIHZhciB0ZSA9IHRoaXMudGV4dGFyZWEgPSBkaXYuZmlyc3RDaGlsZDtcbiAgICBkaXNwbGF5LndyYXBwZXIuaW5zZXJ0QmVmb3JlKGRpdiwgZGlzcGxheS53cmFwcGVyLmZpcnN0Q2hpbGQpOyAvLyBOZWVkZWQgdG8gaGlkZSBiaWcgYmx1ZSBibGlua2luZyBjdXJzb3Igb24gTW9iaWxlIFNhZmFyaSAoZG9lc24ndCBzZWVtIHRvIHdvcmsgaW4gaU9TIDggYW55bW9yZSlcblxuICAgIGlmIChpb3MpIHtcbiAgICAgIHRlLnN0eWxlLndpZHRoID0gXCIwcHhcIjtcbiAgICB9XG5cbiAgICBvbih0ZSwgXCJpbnB1dFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA+PSA5ICYmIHRoaXMkMS5oYXNTZWxlY3Rpb24pIHtcbiAgICAgICAgdGhpcyQxLmhhc1NlbGVjdGlvbiA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlucHV0LnBvbGwoKTtcbiAgICB9KTtcbiAgICBvbih0ZSwgXCJwYXN0ZVwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKHNpZ25hbERPTUV2ZW50KGNtLCBlKSB8fCBoYW5kbGVQYXN0ZShlLCBjbSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjbS5zdGF0ZS5wYXN0ZUluY29taW5nID0gdHJ1ZTtcbiAgICAgIGlucHV0LmZhc3RQb2xsKCk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBwcmVwYXJlQ29weUN1dChlKSB7XG4gICAgICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGNtLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHtcbiAgICAgICAgc2V0TGFzdENvcGllZCh7XG4gICAgICAgICAgbGluZVdpc2U6IGZhbHNlLFxuICAgICAgICAgIHRleHQ6IGNtLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoaW5wdXQuaW5hY2N1cmF0ZVNlbGVjdGlvbikge1xuICAgICAgICAgIGlucHV0LnByZXZJbnB1dCA9IFwiXCI7XG4gICAgICAgICAgaW5wdXQuaW5hY2N1cmF0ZVNlbGVjdGlvbiA9IGZhbHNlO1xuICAgICAgICAgIHRlLnZhbHVlID0gbGFzdENvcGllZC50ZXh0LmpvaW4oXCJcXG5cIik7XG4gICAgICAgICAgc2VsZWN0SW5wdXQodGUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFjbS5vcHRpb25zLmxpbmVXaXNlQ29weUN1dCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmFuZ2VzID0gY29weWFibGVSYW5nZXMoY20pO1xuICAgICAgICBzZXRMYXN0Q29waWVkKHtcbiAgICAgICAgICBsaW5lV2lzZTogdHJ1ZSxcbiAgICAgICAgICB0ZXh0OiByYW5nZXMudGV4dFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZS50eXBlID09IFwiY3V0XCIpIHtcbiAgICAgICAgICBjbS5zZXRTZWxlY3Rpb25zKHJhbmdlcy5yYW5nZXMsIG51bGwsIHNlbF9kb250U2Nyb2xsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnB1dC5wcmV2SW5wdXQgPSBcIlwiO1xuICAgICAgICAgIHRlLnZhbHVlID0gcmFuZ2VzLnRleHQuam9pbihcIlxcblwiKTtcbiAgICAgICAgICBzZWxlY3RJbnB1dCh0ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGUudHlwZSA9PSBcImN1dFwiKSB7XG4gICAgICAgIGNtLnN0YXRlLmN1dEluY29taW5nID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvbih0ZSwgXCJjdXRcIiwgcHJlcGFyZUNvcHlDdXQpO1xuICAgIG9uKHRlLCBcImNvcHlcIiwgcHJlcGFyZUNvcHlDdXQpO1xuICAgIG9uKGRpc3BsYXkuc2Nyb2xsZXIsIFwicGFzdGVcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmIChldmVudEluV2lkZ2V0KGRpc3BsYXksIGUpIHx8IHNpZ25hbERPTUV2ZW50KGNtLCBlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNtLnN0YXRlLnBhc3RlSW5jb21pbmcgPSB0cnVlO1xuICAgICAgaW5wdXQuZm9jdXMoKTtcbiAgICB9KTsgLy8gUHJldmVudCBub3JtYWwgc2VsZWN0aW9uIGluIHRoZSBlZGl0b3IgKHdlIGhhbmRsZSBvdXIgb3duKVxuXG4gICAgb24oZGlzcGxheS5saW5lU3BhY2UsIFwic2VsZWN0c3RhcnRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmICghZXZlbnRJbldpZGdldChkaXNwbGF5LCBlKSkge1xuICAgICAgICBlX3ByZXZlbnREZWZhdWx0KGUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG9uKHRlLCBcImNvbXBvc2l0aW9uc3RhcnRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHN0YXJ0ID0gY20uZ2V0Q3Vyc29yKFwiZnJvbVwiKTtcblxuICAgICAgaWYgKGlucHV0LmNvbXBvc2luZykge1xuICAgICAgICBpbnB1dC5jb21wb3NpbmcucmFuZ2UuY2xlYXIoKTtcbiAgICAgIH1cblxuICAgICAgaW5wdXQuY29tcG9zaW5nID0ge1xuICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgIHJhbmdlOiBjbS5tYXJrVGV4dChzdGFydCwgY20uZ2V0Q3Vyc29yKFwidG9cIiksIHtcbiAgICAgICAgICBjbGFzc05hbWU6IFwiQ29kZU1pcnJvci1jb21wb3NpbmdcIlxuICAgICAgICB9KVxuICAgICAgfTtcbiAgICB9KTtcbiAgICBvbih0ZSwgXCJjb21wb3NpdGlvbmVuZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoaW5wdXQuY29tcG9zaW5nKSB7XG4gICAgICAgIGlucHV0LnBvbGwoKTtcbiAgICAgICAgaW5wdXQuY29tcG9zaW5nLnJhbmdlLmNsZWFyKCk7XG4gICAgICAgIGlucHV0LmNvbXBvc2luZyA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUucHJlcGFyZVNlbGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBSZWRyYXcgdGhlIHNlbGVjdGlvbiBhbmQvb3IgY3Vyc29yXG4gICAgdmFyIGNtID0gdGhpcy5jbSxcbiAgICAgICAgZGlzcGxheSA9IGNtLmRpc3BsYXksXG4gICAgICAgIGRvYyA9IGNtLmRvYztcbiAgICB2YXIgcmVzdWx0ID0gcHJlcGFyZVNlbGVjdGlvbihjbSk7IC8vIE1vdmUgdGhlIGhpZGRlbiB0ZXh0YXJlYSBuZWFyIHRoZSBjdXJzb3IgdG8gcHJldmVudCBzY3JvbGxpbmcgYXJ0aWZhY3RzXG5cbiAgICBpZiAoY20ub3B0aW9ucy5tb3ZlSW5wdXRXaXRoQ3Vyc29yKSB7XG4gICAgICB2YXIgaGVhZFBvcyA9IF9jdXJzb3JDb29yZHMoY20sIGRvYy5zZWwucHJpbWFyeSgpLmhlYWQsIFwiZGl2XCIpO1xuXG4gICAgICB2YXIgd3JhcE9mZiA9IGRpc3BsYXkud3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICBsaW5lT2ZmID0gZGlzcGxheS5saW5lRGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgcmVzdWx0LnRlVG9wID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oZGlzcGxheS53cmFwcGVyLmNsaWVudEhlaWdodCAtIDEwLCBoZWFkUG9zLnRvcCArIGxpbmVPZmYudG9wIC0gd3JhcE9mZi50b3ApKTtcbiAgICAgIHJlc3VsdC50ZUxlZnQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihkaXNwbGF5LndyYXBwZXIuY2xpZW50V2lkdGggLSAxMCwgaGVhZFBvcy5sZWZ0ICsgbGluZU9mZi5sZWZ0IC0gd3JhcE9mZi5sZWZ0KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICBUZXh0YXJlYUlucHV0LnByb3RvdHlwZS5zaG93U2VsZWN0aW9uID0gZnVuY3Rpb24gKGRyYXduKSB7XG4gICAgdmFyIGNtID0gdGhpcy5jbSxcbiAgICAgICAgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG4gICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQoZGlzcGxheS5jdXJzb3JEaXYsIGRyYXduLmN1cnNvcnMpO1xuICAgIHJlbW92ZUNoaWxkcmVuQW5kQWRkKGRpc3BsYXkuc2VsZWN0aW9uRGl2LCBkcmF3bi5zZWxlY3Rpb24pO1xuXG4gICAgaWYgKGRyYXduLnRlVG9wICE9IG51bGwpIHtcbiAgICAgIHRoaXMud3JhcHBlci5zdHlsZS50b3AgPSBkcmF3bi50ZVRvcCArIFwicHhcIjtcbiAgICAgIHRoaXMud3JhcHBlci5zdHlsZS5sZWZ0ID0gZHJhd24udGVMZWZ0ICsgXCJweFwiO1xuICAgIH1cbiAgfTsgLy8gUmVzZXQgdGhlIGlucHV0IHRvIGNvcnJlc3BvbmQgdG8gdGhlIHNlbGVjdGlvbiAob3IgdG8gYmUgZW1wdHksXG4gIC8vIHdoZW4gbm90IHR5cGluZyBhbmQgbm90aGluZyBpcyBzZWxlY3RlZClcblxuXG4gIFRleHRhcmVhSW5wdXQucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKHR5cGluZykge1xuICAgIGlmICh0aGlzLmNvbnRleHRNZW51UGVuZGluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtaW5pbWFsLFxuICAgICAgICBzZWxlY3RlZCxcbiAgICAgICAgY20gPSB0aGlzLmNtLFxuICAgICAgICBkb2MgPSBjbS5kb2M7XG5cbiAgICBpZiAoY20uc29tZXRoaW5nU2VsZWN0ZWQoKSkge1xuICAgICAgdGhpcy5wcmV2SW5wdXQgPSBcIlwiO1xuICAgICAgdmFyIHJhbmdlID0gZG9jLnNlbC5wcmltYXJ5KCk7XG4gICAgICBtaW5pbWFsID0gaGFzQ29weUV2ZW50ICYmIChyYW5nZS50bygpLmxpbmUgLSByYW5nZS5mcm9tKCkubGluZSA+IDEwMCB8fCAoc2VsZWN0ZWQgPSBjbS5nZXRTZWxlY3Rpb24oKSkubGVuZ3RoID4gMTAwMCk7XG4gICAgICB2YXIgY29udGVudCA9IG1pbmltYWwgPyBcIi1cIiA6IHNlbGVjdGVkIHx8IGNtLmdldFNlbGVjdGlvbigpO1xuICAgICAgdGhpcy50ZXh0YXJlYS52YWx1ZSA9IGNvbnRlbnQ7XG5cbiAgICAgIGlmIChjbS5zdGF0ZS5mb2N1c2VkKSB7XG4gICAgICAgIHNlbGVjdElucHV0KHRoaXMudGV4dGFyZWEpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA+PSA5KSB7XG4gICAgICAgIHRoaXMuaGFzU2VsZWN0aW9uID0gY29udGVudDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCF0eXBpbmcpIHtcbiAgICAgIHRoaXMucHJldklucHV0ID0gdGhpcy50ZXh0YXJlYS52YWx1ZSA9IFwiXCI7XG5cbiAgICAgIGlmIChpZSAmJiBpZV92ZXJzaW9uID49IDkpIHtcbiAgICAgICAgdGhpcy5oYXNTZWxlY3Rpb24gPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaW5hY2N1cmF0ZVNlbGVjdGlvbiA9IG1pbmltYWw7XG4gIH07XG5cbiAgVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUuZ2V0RmllbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dGFyZWE7XG4gIH07XG5cbiAgVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUuc3VwcG9ydHNUb3VjaCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUuZm9jdXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuY20ub3B0aW9ucy5yZWFkT25seSAhPSBcIm5vY3Vyc29yXCIgJiYgKCFtb2JpbGUgfHwgYWN0aXZlRWx0KCkgIT0gdGhpcy50ZXh0YXJlYSkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMudGV4dGFyZWEuZm9jdXMoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHt9IC8vIElFOCB3aWxsIHRocm93IGlmIHRoZSB0ZXh0YXJlYSBpcyBkaXNwbGF5OiBub25lIG9yIG5vdCBpbiBET01cblxuICAgIH1cbiAgfTtcblxuICBUZXh0YXJlYUlucHV0LnByb3RvdHlwZS5ibHVyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudGV4dGFyZWEuYmx1cigpO1xuICB9O1xuXG4gIFRleHRhcmVhSW5wdXQucHJvdG90eXBlLnJlc2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy53cmFwcGVyLnN0eWxlLnRvcCA9IHRoaXMud3JhcHBlci5zdHlsZS5sZWZ0ID0gMDtcbiAgfTtcblxuICBUZXh0YXJlYUlucHV0LnByb3RvdHlwZS5yZWNlaXZlZEZvY3VzID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2xvd1BvbGwoKTtcbiAgfTsgLy8gUG9sbCBmb3IgaW5wdXQgY2hhbmdlcywgdXNpbmcgdGhlIG5vcm1hbCByYXRlIG9mIHBvbGxpbmcuIFRoaXNcbiAgLy8gcnVucyBhcyBsb25nIGFzIHRoZSBlZGl0b3IgaXMgZm9jdXNlZC5cblxuXG4gIFRleHRhcmVhSW5wdXQucHJvdG90eXBlLnNsb3dQb2xsID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMucG9sbGluZ0Zhc3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnBvbGxpbmcuc2V0KHRoaXMuY20ub3B0aW9ucy5wb2xsSW50ZXJ2YWwsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMkMS5wb2xsKCk7XG5cbiAgICAgIGlmICh0aGlzJDEuY20uc3RhdGUuZm9jdXNlZCkge1xuICAgICAgICB0aGlzJDEuc2xvd1BvbGwoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTsgLy8gV2hlbiBhbiBldmVudCBoYXMganVzdCBjb21lIGluIHRoYXQgaXMgbGlrZWx5IHRvIGFkZCBvciBjaGFuZ2VcbiAgLy8gc29tZXRoaW5nIGluIHRoZSBpbnB1dCB0ZXh0YXJlYSwgd2UgcG9sbCBmYXN0ZXIsIHRvIGVuc3VyZSB0aGF0XG4gIC8vIHRoZSBjaGFuZ2UgYXBwZWFycyBvbiB0aGUgc2NyZWVuIHF1aWNrbHkuXG5cblxuICBUZXh0YXJlYUlucHV0LnByb3RvdHlwZS5mYXN0UG9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbWlzc2VkID0gZmFsc2UsXG4gICAgICAgIGlucHV0ID0gdGhpcztcbiAgICBpbnB1dC5wb2xsaW5nRmFzdCA9IHRydWU7XG5cbiAgICBmdW5jdGlvbiBwKCkge1xuICAgICAgdmFyIGNoYW5nZWQgPSBpbnB1dC5wb2xsKCk7XG5cbiAgICAgIGlmICghY2hhbmdlZCAmJiAhbWlzc2VkKSB7XG4gICAgICAgIG1pc3NlZCA9IHRydWU7XG4gICAgICAgIGlucHV0LnBvbGxpbmcuc2V0KDYwLCBwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlucHV0LnBvbGxpbmdGYXN0ID0gZmFsc2U7XG4gICAgICAgIGlucHV0LnNsb3dQb2xsKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5wdXQucG9sbGluZy5zZXQoMjAsIHApO1xuICB9OyAvLyBSZWFkIGlucHV0IGZyb20gdGhlIHRleHRhcmVhLCBhbmQgdXBkYXRlIHRoZSBkb2N1bWVudCB0byBtYXRjaC5cbiAgLy8gV2hlbiBzb21ldGhpbmcgaXMgc2VsZWN0ZWQsIGl0IGlzIHByZXNlbnQgaW4gdGhlIHRleHRhcmVhLCBhbmRcbiAgLy8gc2VsZWN0ZWQgKHVubGVzcyBpdCBpcyBodWdlLCBpbiB3aGljaCBjYXNlIGEgcGxhY2Vob2xkZXIgaXNcbiAgLy8gdXNlZCkuIFdoZW4gbm90aGluZyBpcyBzZWxlY3RlZCwgdGhlIGN1cnNvciBzaXRzIGFmdGVyIHByZXZpb3VzbHlcbiAgLy8gc2VlbiB0ZXh0IChjYW4gYmUgZW1wdHkpLCB3aGljaCBpcyBzdG9yZWQgaW4gcHJldklucHV0ICh3ZSBtdXN0XG4gIC8vIG5vdCByZXNldCB0aGUgdGV4dGFyZWEgd2hlbiB0eXBpbmcsIGJlY2F1c2UgdGhhdCBicmVha3MgSU1FKS5cblxuXG4gIFRleHRhcmVhSW5wdXQucHJvdG90eXBlLnBvbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG4gICAgdmFyIGNtID0gdGhpcy5jbSxcbiAgICAgICAgaW5wdXQgPSB0aGlzLnRleHRhcmVhLFxuICAgICAgICBwcmV2SW5wdXQgPSB0aGlzLnByZXZJbnB1dDsgLy8gU2luY2UgdGhpcyBpcyBjYWxsZWQgYSAqbG90KiwgdHJ5IHRvIGJhaWwgb3V0IGFzIGNoZWFwbHkgYXNcbiAgICAvLyBwb3NzaWJsZSB3aGVuIGl0IGlzIGNsZWFyIHRoYXQgbm90aGluZyBoYXBwZW5lZC4gaGFzU2VsZWN0aW9uXG4gICAgLy8gd2lsbCBiZSB0aGUgY2FzZSB3aGVuIHRoZXJlIGlzIGEgbG90IG9mIHRleHQgaW4gdGhlIHRleHRhcmVhLFxuICAgIC8vIGluIHdoaWNoIGNhc2UgcmVhZGluZyBpdHMgdmFsdWUgd291bGQgYmUgZXhwZW5zaXZlLlxuXG4gICAgaWYgKHRoaXMuY29udGV4dE1lbnVQZW5kaW5nIHx8ICFjbS5zdGF0ZS5mb2N1c2VkIHx8IGhhc1NlbGVjdGlvbihpbnB1dCkgJiYgIXByZXZJbnB1dCAmJiAhdGhpcy5jb21wb3NpbmcgfHwgY20uaXNSZWFkT25seSgpIHx8IGNtLm9wdGlvbnMuZGlzYWJsZUlucHV0IHx8IGNtLnN0YXRlLmtleVNlcSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciB0ZXh0ID0gaW5wdXQudmFsdWU7IC8vIElmIG5vdGhpbmcgY2hhbmdlZCwgYmFpbC5cblxuICAgIGlmICh0ZXh0ID09IHByZXZJbnB1dCAmJiAhY20uc29tZXRoaW5nU2VsZWN0ZWQoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gLy8gV29yayBhcm91bmQgbm9uc2Vuc2ljYWwgc2VsZWN0aW9uIHJlc2V0dGluZyBpbiBJRTkvMTAsIGFuZFxuICAgIC8vIGluZXhwbGljYWJsZSBhcHBlYXJhbmNlIG9mIHByaXZhdGUgYXJlYSB1bmljb2RlIGNoYXJhY3RlcnMgb25cbiAgICAvLyBzb21lIGtleSBjb21ib3MgaW4gTWFjICgjMjY4OSkuXG5cblxuICAgIGlmIChpZSAmJiBpZV92ZXJzaW9uID49IDkgJiYgdGhpcy5oYXNTZWxlY3Rpb24gPT09IHRleHQgfHwgbWFjICYmIC9bXFx1ZjcwMC1cXHVmN2ZmXS8udGVzdCh0ZXh0KSkge1xuICAgICAgY20uZGlzcGxheS5pbnB1dC5yZXNldCgpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChjbS5kb2Muc2VsID09IGNtLmRpc3BsYXkuc2VsRm9yQ29udGV4dE1lbnUpIHtcbiAgICAgIHZhciBmaXJzdCA9IHRleHQuY2hhckNvZGVBdCgwKTtcblxuICAgICAgaWYgKGZpcnN0ID09IDB4MjAwYiAmJiAhcHJldklucHV0KSB7XG4gICAgICAgIHByZXZJbnB1dCA9IFwiXFx1MjAwQlwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlyc3QgPT0gMHgyMWRhKSB7XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY20uZXhlY0NvbW1hbmQoXCJ1bmRvXCIpO1xuICAgICAgfVxuICAgIH0gLy8gRmluZCB0aGUgcGFydCBvZiB0aGUgaW5wdXQgdGhhdCBpcyBhY3R1YWxseSBuZXdcblxuXG4gICAgdmFyIHNhbWUgPSAwLFxuICAgICAgICBsID0gTWF0aC5taW4ocHJldklucHV0Lmxlbmd0aCwgdGV4dC5sZW5ndGgpO1xuXG4gICAgd2hpbGUgKHNhbWUgPCBsICYmIHByZXZJbnB1dC5jaGFyQ29kZUF0KHNhbWUpID09IHRleHQuY2hhckNvZGVBdChzYW1lKSkge1xuICAgICAgKytzYW1lO1xuICAgIH1cblxuICAgIHJ1bkluT3AoY20sIGZ1bmN0aW9uICgpIHtcbiAgICAgIGFwcGx5VGV4dElucHV0KGNtLCB0ZXh0LnNsaWNlKHNhbWUpLCBwcmV2SW5wdXQubGVuZ3RoIC0gc2FtZSwgbnVsbCwgdGhpcyQxLmNvbXBvc2luZyA/IFwiKmNvbXBvc2VcIiA6IG51bGwpOyAvLyBEb24ndCBsZWF2ZSBsb25nIHRleHQgaW4gdGhlIHRleHRhcmVhLCBzaW5jZSBpdCBtYWtlcyBmdXJ0aGVyIHBvbGxpbmcgc2xvd1xuXG4gICAgICBpZiAodGV4dC5sZW5ndGggPiAxMDAwIHx8IHRleHQuaW5kZXhPZihcIlxcblwiKSA+IC0xKSB7XG4gICAgICAgIGlucHV0LnZhbHVlID0gdGhpcyQxLnByZXZJbnB1dCA9IFwiXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzJDEucHJldklucHV0ID0gdGV4dDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMkMS5jb21wb3NpbmcpIHtcbiAgICAgICAgdGhpcyQxLmNvbXBvc2luZy5yYW5nZS5jbGVhcigpO1xuICAgICAgICB0aGlzJDEuY29tcG9zaW5nLnJhbmdlID0gY20ubWFya1RleHQodGhpcyQxLmNvbXBvc2luZy5zdGFydCwgY20uZ2V0Q3Vyc29yKFwidG9cIiksIHtcbiAgICAgICAgICBjbGFzc05hbWU6IFwiQ29kZU1pcnJvci1jb21wb3NpbmdcIlxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBUZXh0YXJlYUlucHV0LnByb3RvdHlwZS5lbnN1cmVQb2xsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucG9sbGluZ0Zhc3QgJiYgdGhpcy5wb2xsKCkpIHtcbiAgICAgIHRoaXMucG9sbGluZ0Zhc3QgPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUub25LZXlQcmVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA+PSA5KSB7XG4gICAgICB0aGlzLmhhc1NlbGVjdGlvbiA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5mYXN0UG9sbCgpO1xuICB9O1xuXG4gIFRleHRhcmVhSW5wdXQucHJvdG90eXBlLm9uQ29udGV4dE1lbnUgPSBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBpbnB1dCA9IHRoaXMsXG4gICAgICAgIGNtID0gaW5wdXQuY20sXG4gICAgICAgIGRpc3BsYXkgPSBjbS5kaXNwbGF5LFxuICAgICAgICB0ZSA9IGlucHV0LnRleHRhcmVhO1xuICAgIHZhciBwb3MgPSBwb3NGcm9tTW91c2UoY20sIGUpLFxuICAgICAgICBzY3JvbGxQb3MgPSBkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcDtcblxuICAgIGlmICghcG9zIHx8IHByZXN0bykge1xuICAgICAgcmV0dXJuO1xuICAgIH0gLy8gT3BlcmEgaXMgZGlmZmljdWx0LlxuICAgIC8vIFJlc2V0IHRoZSBjdXJyZW50IHRleHQgc2VsZWN0aW9uIG9ubHkgaWYgdGhlIGNsaWNrIGlzIGRvbmUgb3V0c2lkZSBvZiB0aGUgc2VsZWN0aW9uXG4gICAgLy8gYW5kICdyZXNldFNlbGVjdGlvbk9uQ29udGV4dE1lbnUnIG9wdGlvbiBpcyB0cnVlLlxuXG5cbiAgICB2YXIgcmVzZXQgPSBjbS5vcHRpb25zLnJlc2V0U2VsZWN0aW9uT25Db250ZXh0TWVudTtcblxuICAgIGlmIChyZXNldCAmJiBjbS5kb2Muc2VsLmNvbnRhaW5zKHBvcykgPT0gLTEpIHtcbiAgICAgIG9wZXJhdGlvbihjbSwgc2V0U2VsZWN0aW9uKShjbS5kb2MsIHNpbXBsZVNlbGVjdGlvbihwb3MpLCBzZWxfZG9udFNjcm9sbCk7XG4gICAgfVxuXG4gICAgdmFyIG9sZENTUyA9IHRlLnN0eWxlLmNzc1RleHQsXG4gICAgICAgIG9sZFdyYXBwZXJDU1MgPSBpbnB1dC53cmFwcGVyLnN0eWxlLmNzc1RleHQ7XG4gICAgaW5wdXQud3JhcHBlci5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjogYWJzb2x1dGVcIjtcbiAgICB2YXIgd3JhcHBlckJveCA9IGlucHV0LndyYXBwZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdGUuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246IGFic29sdXRlOyB3aWR0aDogMzBweDsgaGVpZ2h0OiAzMHB4O1xcbiAgICAgIHRvcDogXCIgKyAoZS5jbGllbnRZIC0gd3JhcHBlckJveC50b3AgLSA1KSArIFwicHg7IGxlZnQ6IFwiICsgKGUuY2xpZW50WCAtIHdyYXBwZXJCb3gubGVmdCAtIDUpICsgXCJweDtcXG4gICAgICB6LWluZGV4OiAxMDAwOyBiYWNrZ3JvdW5kOiBcIiArIChpZSA/IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAuMDUpXCIgOiBcInRyYW5zcGFyZW50XCIpICsgXCI7XFxuICAgICAgb3V0bGluZTogbm9uZTsgYm9yZGVyLXdpZHRoOiAwOyBvdXRsaW5lOiBub25lOyBvdmVyZmxvdzogaGlkZGVuOyBvcGFjaXR5OiAuMDU7IGZpbHRlcjogYWxwaGEob3BhY2l0eT01KTtcIjtcbiAgICB2YXIgb2xkU2Nyb2xsWTtcblxuICAgIGlmICh3ZWJraXQpIHtcbiAgICAgIG9sZFNjcm9sbFkgPSB3aW5kb3cuc2Nyb2xsWTtcbiAgICB9IC8vIFdvcmsgYXJvdW5kIENocm9tZSBpc3N1ZSAoIzI3MTIpXG5cblxuICAgIGRpc3BsYXkuaW5wdXQuZm9jdXMoKTtcblxuICAgIGlmICh3ZWJraXQpIHtcbiAgICAgIHdpbmRvdy5zY3JvbGxUbyhudWxsLCBvbGRTY3JvbGxZKTtcbiAgICB9XG5cbiAgICBkaXNwbGF5LmlucHV0LnJlc2V0KCk7IC8vIEFkZHMgXCJTZWxlY3QgYWxsXCIgdG8gY29udGV4dCBtZW51IGluIEZGXG5cbiAgICBpZiAoIWNtLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHtcbiAgICAgIHRlLnZhbHVlID0gaW5wdXQucHJldklucHV0ID0gXCIgXCI7XG4gICAgfVxuXG4gICAgaW5wdXQuY29udGV4dE1lbnVQZW5kaW5nID0gdHJ1ZTtcbiAgICBkaXNwbGF5LnNlbEZvckNvbnRleHRNZW51ID0gY20uZG9jLnNlbDtcbiAgICBjbGVhclRpbWVvdXQoZGlzcGxheS5kZXRlY3RpbmdTZWxlY3RBbGwpOyAvLyBTZWxlY3QtYWxsIHdpbGwgYmUgZ3JleWVkIG91dCBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gc2VsZWN0LCBzb1xuICAgIC8vIHRoaXMgYWRkcyBhIHplcm8td2lkdGggc3BhY2Ugc28gdGhhdCB3ZSBjYW4gbGF0ZXIgY2hlY2sgd2hldGhlclxuICAgIC8vIGl0IGdvdCBzZWxlY3RlZC5cblxuICAgIGZ1bmN0aW9uIHByZXBhcmVTZWxlY3RBbGxIYWNrKCkge1xuICAgICAgaWYgKHRlLnNlbGVjdGlvblN0YXJ0ICE9IG51bGwpIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkID0gY20uc29tZXRoaW5nU2VsZWN0ZWQoKTtcbiAgICAgICAgdmFyIGV4dHZhbCA9IFwiXFx1MjAwQlwiICsgKHNlbGVjdGVkID8gdGUudmFsdWUgOiBcIlwiKTtcbiAgICAgICAgdGUudmFsdWUgPSBcIlxcdTIxREFcIjsgLy8gVXNlZCB0byBjYXRjaCBjb250ZXh0LW1lbnUgdW5kb1xuXG4gICAgICAgIHRlLnZhbHVlID0gZXh0dmFsO1xuICAgICAgICBpbnB1dC5wcmV2SW5wdXQgPSBzZWxlY3RlZCA/IFwiXCIgOiBcIlxcdTIwMEJcIjtcbiAgICAgICAgdGUuc2VsZWN0aW9uU3RhcnQgPSAxO1xuICAgICAgICB0ZS5zZWxlY3Rpb25FbmQgPSBleHR2YWwubGVuZ3RoOyAvLyBSZS1zZXQgdGhpcywgaW4gY2FzZSBzb21lIG90aGVyIGhhbmRsZXIgdG91Y2hlZCB0aGVcbiAgICAgICAgLy8gc2VsZWN0aW9uIGluIHRoZSBtZWFudGltZS5cblxuICAgICAgICBkaXNwbGF5LnNlbEZvckNvbnRleHRNZW51ID0gY20uZG9jLnNlbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWhpZGUoKSB7XG4gICAgICBpbnB1dC5jb250ZXh0TWVudVBlbmRpbmcgPSBmYWxzZTtcbiAgICAgIGlucHV0LndyYXBwZXIuc3R5bGUuY3NzVGV4dCA9IG9sZFdyYXBwZXJDU1M7XG4gICAgICB0ZS5zdHlsZS5jc3NUZXh0ID0gb2xkQ1NTO1xuXG4gICAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA8IDkpIHtcbiAgICAgICAgZGlzcGxheS5zY3JvbGxiYXJzLnNldFNjcm9sbFRvcChkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcCA9IHNjcm9sbFBvcyk7XG4gICAgICB9IC8vIFRyeSB0byBkZXRlY3QgdGhlIHVzZXIgY2hvb3Npbmcgc2VsZWN0LWFsbFxuXG5cbiAgICAgIGlmICh0ZS5zZWxlY3Rpb25TdGFydCAhPSBudWxsKSB7XG4gICAgICAgIGlmICghaWUgfHwgaWUgJiYgaWVfdmVyc2lvbiA8IDkpIHtcbiAgICAgICAgICBwcmVwYXJlU2VsZWN0QWxsSGFjaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgcG9sbCA9IGZ1bmN0aW9uIHBvbGwoKSB7XG4gICAgICAgICAgaWYgKGRpc3BsYXkuc2VsRm9yQ29udGV4dE1lbnUgPT0gY20uZG9jLnNlbCAmJiB0ZS5zZWxlY3Rpb25TdGFydCA9PSAwICYmIHRlLnNlbGVjdGlvbkVuZCA+IDAgJiYgaW5wdXQucHJldklucHV0ID09IFwiXFx1MjAwQlwiKSB7XG4gICAgICAgICAgICBvcGVyYXRpb24oY20sIHNlbGVjdEFsbCkoY20pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaSsrIDwgMTApIHtcbiAgICAgICAgICAgIGRpc3BsYXkuZGV0ZWN0aW5nU2VsZWN0QWxsID0gc2V0VGltZW91dChwb2xsLCA1MDApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXNwbGF5LmlucHV0LnJlc2V0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGRpc3BsYXkuZGV0ZWN0aW5nU2VsZWN0QWxsID0gc2V0VGltZW91dChwb2xsLCAyMDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpZSAmJiBpZV92ZXJzaW9uID49IDkpIHtcbiAgICAgIHByZXBhcmVTZWxlY3RBbGxIYWNrKCk7XG4gICAgfVxuXG4gICAgaWYgKGNhcHR1cmVSaWdodENsaWNrKSB7XG4gICAgICBlX3N0b3AoZSk7XG5cbiAgICAgIHZhciBtb3VzZXVwID0gZnVuY3Rpb24gbW91c2V1cCgpIHtcbiAgICAgICAgb2ZmKHdpbmRvdywgXCJtb3VzZXVwXCIsIG1vdXNldXApO1xuICAgICAgICBzZXRUaW1lb3V0KHJlaGlkZSwgMjApO1xuICAgICAgfTtcblxuICAgICAgb24od2luZG93LCBcIm1vdXNldXBcIiwgbW91c2V1cCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFRpbWVvdXQocmVoaWRlLCA1MCk7XG4gICAgfVxuICB9O1xuXG4gIFRleHRhcmVhSW5wdXQucHJvdG90eXBlLnJlYWRPbmx5Q2hhbmdlZCA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICBpZiAoIXZhbCkge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cbiAgfTtcblxuICBUZXh0YXJlYUlucHV0LnByb3RvdHlwZS5zZXRVbmVkaXRhYmxlID0gZnVuY3Rpb24gKCkge307XG5cbiAgVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUubmVlZHNDb250ZW50QXR0cmlidXRlID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZnJvbVRleHRBcmVhKHRleHRhcmVhLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBjb3B5T2JqKG9wdGlvbnMpIDoge307XG4gICAgb3B0aW9ucy52YWx1ZSA9IHRleHRhcmVhLnZhbHVlO1xuXG4gICAgaWYgKCFvcHRpb25zLnRhYmluZGV4ICYmIHRleHRhcmVhLnRhYkluZGV4KSB7XG4gICAgICBvcHRpb25zLnRhYmluZGV4ID0gdGV4dGFyZWEudGFiSW5kZXg7XG4gICAgfVxuXG4gICAgaWYgKCFvcHRpb25zLnBsYWNlaG9sZGVyICYmIHRleHRhcmVhLnBsYWNlaG9sZGVyKSB7XG4gICAgICBvcHRpb25zLnBsYWNlaG9sZGVyID0gdGV4dGFyZWEucGxhY2Vob2xkZXI7XG4gICAgfSAvLyBTZXQgYXV0b2ZvY3VzIHRvIHRydWUgaWYgdGhpcyB0ZXh0YXJlYSBpcyBmb2N1c2VkLCBvciBpZiBpdCBoYXNcbiAgICAvLyBhdXRvZm9jdXMgYW5kIG5vIG90aGVyIGVsZW1lbnQgaXMgZm9jdXNlZC5cblxuXG4gICAgaWYgKG9wdGlvbnMuYXV0b2ZvY3VzID09IG51bGwpIHtcbiAgICAgIHZhciBoYXNGb2N1cyA9IGFjdGl2ZUVsdCgpO1xuICAgICAgb3B0aW9ucy5hdXRvZm9jdXMgPSBoYXNGb2N1cyA9PSB0ZXh0YXJlYSB8fCB0ZXh0YXJlYS5nZXRBdHRyaWJ1dGUoXCJhdXRvZm9jdXNcIikgIT0gbnVsbCAmJiBoYXNGb2N1cyA9PSBkb2N1bWVudC5ib2R5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmUoKSB7XG4gICAgICB0ZXh0YXJlYS52YWx1ZSA9IGNtLmdldFZhbHVlKCk7XG4gICAgfVxuXG4gICAgdmFyIHJlYWxTdWJtaXQ7XG5cbiAgICBpZiAodGV4dGFyZWEuZm9ybSkge1xuICAgICAgb24odGV4dGFyZWEuZm9ybSwgXCJzdWJtaXRcIiwgc2F2ZSk7IC8vIERlcGxvcmFibGUgaGFjayB0byBtYWtlIHRoZSBzdWJtaXQgbWV0aG9kIGRvIHRoZSByaWdodCB0aGluZy5cblxuICAgICAgaWYgKCFvcHRpb25zLmxlYXZlU3VibWl0TWV0aG9kQWxvbmUpIHtcbiAgICAgICAgdmFyIGZvcm0gPSB0ZXh0YXJlYS5mb3JtO1xuICAgICAgICByZWFsU3VibWl0ID0gZm9ybS5zdWJtaXQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgd3JhcHBlZFN1Ym1pdCA9IGZvcm0uc3VibWl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2F2ZSgpO1xuICAgICAgICAgICAgZm9ybS5zdWJtaXQgPSByZWFsU3VibWl0O1xuICAgICAgICAgICAgZm9ybS5zdWJtaXQoKTtcbiAgICAgICAgICAgIGZvcm0uc3VibWl0ID0gd3JhcHBlZFN1Ym1pdDtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgfVxuICAgIH1cblxuICAgIG9wdGlvbnMuZmluaXNoSW5pdCA9IGZ1bmN0aW9uIChjbSkge1xuICAgICAgY20uc2F2ZSA9IHNhdmU7XG5cbiAgICAgIGNtLmdldFRleHRBcmVhID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGV4dGFyZWE7XG4gICAgICB9O1xuXG4gICAgICBjbS50b1RleHRBcmVhID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjbS50b1RleHRBcmVhID0gaXNOYU47IC8vIFByZXZlbnQgdGhpcyBmcm9tIGJlaW5nIHJhbiB0d2ljZVxuXG4gICAgICAgIHNhdmUoKTtcbiAgICAgICAgdGV4dGFyZWEucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjbS5nZXRXcmFwcGVyRWxlbWVudCgpKTtcbiAgICAgICAgdGV4dGFyZWEuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG5cbiAgICAgICAgaWYgKHRleHRhcmVhLmZvcm0pIHtcbiAgICAgICAgICBvZmYodGV4dGFyZWEuZm9ybSwgXCJzdWJtaXRcIiwgc2F2ZSk7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIHRleHRhcmVhLmZvcm0uc3VibWl0ID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGV4dGFyZWEuZm9ybS5zdWJtaXQgPSByZWFsU3VibWl0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgdGV4dGFyZWEuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIHZhciBjbSA9IENvZGVNaXJyb3IoZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIHJldHVybiB0ZXh0YXJlYS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCB0ZXh0YXJlYS5uZXh0U2libGluZyk7XG4gICAgfSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIGNtO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkTGVnYWN5UHJvcHMoQ29kZU1pcnJvcikge1xuICAgIENvZGVNaXJyb3Iub2ZmID0gb2ZmO1xuICAgIENvZGVNaXJyb3Iub24gPSBvbjtcbiAgICBDb2RlTWlycm9yLndoZWVsRXZlbnRQaXhlbHMgPSB3aGVlbEV2ZW50UGl4ZWxzO1xuICAgIENvZGVNaXJyb3IuRG9jID0gRG9jO1xuICAgIENvZGVNaXJyb3Iuc3BsaXRMaW5lcyA9IHNwbGl0TGluZXNBdXRvO1xuICAgIENvZGVNaXJyb3IuY291bnRDb2x1bW4gPSBjb3VudENvbHVtbjtcbiAgICBDb2RlTWlycm9yLmZpbmRDb2x1bW4gPSBmaW5kQ29sdW1uO1xuICAgIENvZGVNaXJyb3IuaXNXb3JkQ2hhciA9IGlzV29yZENoYXJCYXNpYztcbiAgICBDb2RlTWlycm9yLlBhc3MgPSBQYXNzO1xuICAgIENvZGVNaXJyb3Iuc2lnbmFsID0gc2lnbmFsO1xuICAgIENvZGVNaXJyb3IuTGluZSA9IExpbmU7XG4gICAgQ29kZU1pcnJvci5jaGFuZ2VFbmQgPSBjaGFuZ2VFbmQ7XG4gICAgQ29kZU1pcnJvci5zY3JvbGxiYXJNb2RlbCA9IHNjcm9sbGJhck1vZGVsO1xuICAgIENvZGVNaXJyb3IuUG9zID0gUG9zO1xuICAgIENvZGVNaXJyb3IuY21wUG9zID0gY21wO1xuICAgIENvZGVNaXJyb3IubW9kZXMgPSBtb2RlcztcbiAgICBDb2RlTWlycm9yLm1pbWVNb2RlcyA9IG1pbWVNb2RlcztcbiAgICBDb2RlTWlycm9yLnJlc29sdmVNb2RlID0gcmVzb2x2ZU1vZGU7XG4gICAgQ29kZU1pcnJvci5nZXRNb2RlID0gZ2V0TW9kZTtcbiAgICBDb2RlTWlycm9yLm1vZGVFeHRlbnNpb25zID0gbW9kZUV4dGVuc2lvbnM7XG4gICAgQ29kZU1pcnJvci5leHRlbmRNb2RlID0gZXh0ZW5kTW9kZTtcbiAgICBDb2RlTWlycm9yLmNvcHlTdGF0ZSA9IGNvcHlTdGF0ZTtcbiAgICBDb2RlTWlycm9yLnN0YXJ0U3RhdGUgPSBzdGFydFN0YXRlO1xuICAgIENvZGVNaXJyb3IuaW5uZXJNb2RlID0gaW5uZXJNb2RlO1xuICAgIENvZGVNaXJyb3IuY29tbWFuZHMgPSBjb21tYW5kcztcbiAgICBDb2RlTWlycm9yLmtleU1hcCA9IGtleU1hcDtcbiAgICBDb2RlTWlycm9yLmtleU5hbWUgPSBrZXlOYW1lO1xuICAgIENvZGVNaXJyb3IuaXNNb2RpZmllcktleSA9IGlzTW9kaWZpZXJLZXk7XG4gICAgQ29kZU1pcnJvci5sb29rdXBLZXkgPSBsb29rdXBLZXk7XG4gICAgQ29kZU1pcnJvci5ub3JtYWxpemVLZXlNYXAgPSBub3JtYWxpemVLZXlNYXA7XG4gICAgQ29kZU1pcnJvci5TdHJpbmdTdHJlYW0gPSBTdHJpbmdTdHJlYW07XG4gICAgQ29kZU1pcnJvci5TaGFyZWRUZXh0TWFya2VyID0gU2hhcmVkVGV4dE1hcmtlcjtcbiAgICBDb2RlTWlycm9yLlRleHRNYXJrZXIgPSBUZXh0TWFya2VyO1xuICAgIENvZGVNaXJyb3IuTGluZVdpZGdldCA9IExpbmVXaWRnZXQ7XG4gICAgQ29kZU1pcnJvci5lX3ByZXZlbnREZWZhdWx0ID0gZV9wcmV2ZW50RGVmYXVsdDtcbiAgICBDb2RlTWlycm9yLmVfc3RvcFByb3BhZ2F0aW9uID0gZV9zdG9wUHJvcGFnYXRpb247XG4gICAgQ29kZU1pcnJvci5lX3N0b3AgPSBlX3N0b3A7XG4gICAgQ29kZU1pcnJvci5hZGRDbGFzcyA9IGFkZENsYXNzO1xuICAgIENvZGVNaXJyb3IuY29udGFpbnMgPSBjb250YWlucztcbiAgICBDb2RlTWlycm9yLnJtQ2xhc3MgPSBybUNsYXNzO1xuICAgIENvZGVNaXJyb3Iua2V5TmFtZXMgPSBrZXlOYW1lcztcbiAgfSAvLyBFRElUT1IgQ09OU1RSVUNUT1JcblxuXG4gIGRlZmluZU9wdGlvbnMoQ29kZU1pcnJvcik7XG4gIGFkZEVkaXRvck1ldGhvZHMoQ29kZU1pcnJvcik7IC8vIFNldCB1cCBtZXRob2RzIG9uIENvZGVNaXJyb3IncyBwcm90b3R5cGUgdG8gcmVkaXJlY3QgdG8gdGhlIGVkaXRvcidzIGRvY3VtZW50LlxuXG4gIHZhciBkb250RGVsZWdhdGUgPSBcIml0ZXIgaW5zZXJ0IHJlbW92ZSBjb3B5IGdldEVkaXRvciBjb25zdHJ1Y3RvclwiLnNwbGl0KFwiIFwiKTtcblxuICBmb3IgKHZhciBwcm9wIGluIERvYy5wcm90b3R5cGUpIHtcbiAgICBpZiAoRG9jLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSAmJiBpbmRleE9mKGRvbnREZWxlZ2F0ZSwgcHJvcCkgPCAwKSB7XG4gICAgICBDb2RlTWlycm9yLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KHRoaXMuZG9jLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgICAgfShEb2MucHJvdG90eXBlW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICBldmVudE1peGluKERvYyk7IC8vIElOUFVUIEhBTkRMSU5HXG5cbiAgQ29kZU1pcnJvci5pbnB1dFN0eWxlcyA9IHtcbiAgICBcInRleHRhcmVhXCI6IFRleHRhcmVhSW5wdXQsXG4gICAgXCJjb250ZW50ZWRpdGFibGVcIjogQ29udGVudEVkaXRhYmxlSW5wdXRcbiAgfTsgLy8gTU9ERSBERUZJTklUSU9OIEFORCBRVUVSWUlOR1xuICAvLyBFeHRyYSBhcmd1bWVudHMgYXJlIHN0b3JlZCBhcyB0aGUgbW9kZSdzIGRlcGVuZGVuY2llcywgd2hpY2ggaXNcbiAgLy8gdXNlZCBieSAobGVnYWN5KSBtZWNoYW5pc21zIGxpa2UgbG9hZG1vZGUuanMgdG8gYXV0b21hdGljYWxseVxuICAvLyBsb2FkIGEgbW9kZS4gKFByZWZlcnJlZCBtZWNoYW5pc20gaXMgdGhlIHJlcXVpcmUvZGVmaW5lIGNhbGxzLilcblxuICBDb2RlTWlycm9yLmRlZmluZU1vZGUgPSBmdW5jdGlvbiAobmFtZVxuICAvKiwgbW9kZSwg4oCmKi9cbiAgKSB7XG4gICAgaWYgKCFDb2RlTWlycm9yLmRlZmF1bHRzLm1vZGUgJiYgbmFtZSAhPSBcIm51bGxcIikge1xuICAgICAgQ29kZU1pcnJvci5kZWZhdWx0cy5tb2RlID0gbmFtZTtcbiAgICB9XG5cbiAgICBkZWZpbmVNb2RlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgQ29kZU1pcnJvci5kZWZpbmVNSU1FID0gZGVmaW5lTUlNRTsgLy8gTWluaW1hbCBkZWZhdWx0IG1vZGUuXG5cbiAgQ29kZU1pcnJvci5kZWZpbmVNb2RlKFwibnVsbFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRva2VuOiBmdW5jdGlvbiB0b2tlbihzdHJlYW0pIHtcbiAgICAgICAgcmV0dXJuIHN0cmVhbS5za2lwVG9FbmQoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbiAgQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwidGV4dC9wbGFpblwiLCBcIm51bGxcIik7IC8vIEVYVEVOU0lPTlNcblxuICBDb2RlTWlycm9yLmRlZmluZUV4dGVuc2lvbiA9IGZ1bmN0aW9uIChuYW1lLCBmdW5jKSB7XG4gICAgQ29kZU1pcnJvci5wcm90b3R5cGVbbmFtZV0gPSBmdW5jO1xuICB9O1xuXG4gIENvZGVNaXJyb3IuZGVmaW5lRG9jRXh0ZW5zaW9uID0gZnVuY3Rpb24gKG5hbWUsIGZ1bmMpIHtcbiAgICBEb2MucHJvdG90eXBlW25hbWVdID0gZnVuYztcbiAgfTtcblxuICBDb2RlTWlycm9yLmZyb21UZXh0QXJlYSA9IGZyb21UZXh0QXJlYTtcbiAgYWRkTGVnYWN5UHJvcHMoQ29kZU1pcnJvcik7XG4gIENvZGVNaXJyb3IudmVyc2lvbiA9IFwiNS4yMy4wXCI7XG4gIHJldHVybiBDb2RlTWlycm9yO1xufSk7Il0sImZpbGUiOiJhY2YtZmllbGRzL2NvZGVtaXJyb3IuanMifQ==
