"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
(function (mod) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../xml/xml"), require("../javascript/javascript"), require("../css/css"));else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../xml/xml", "../javascript/javascript", "../css/css"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  var defaultTags = {
    script: [["lang", /(javascript|babel)/i, "javascript"], ["type", /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^$/i, "javascript"], ["type", /./, "text/plain"], [null, null, "javascript"]],
    style: [["lang", /^css$/i, "css"], ["type", /^(text\/)?(x-)?(stylesheet|css)$/i, "css"], ["type", /./, "text/plain"], [null, null, "css"]]
  };

  function maybeBackup(stream, pat, style) {
    var cur = stream.current(),
        close = cur.search(pat);

    if (close > -1) {
      stream.backUp(cur.length - close);
    } else if (cur.match(/<\/?$/)) {
      stream.backUp(cur.length);
      if (!stream.match(pat, false)) stream.match(cur);
    }

    return style;
  }

  var attrRegexpCache = {};

  function getAttrRegexp(attr) {
    var regexp = attrRegexpCache[attr];
    if (regexp) return regexp;
    return attrRegexpCache[attr] = new RegExp("\\s+" + attr + "\\s*=\\s*('|\")?([^'\"]+)('|\")?\\s*");
  }

  function getAttrValue(text, attr) {
    var match = text.match(getAttrRegexp(attr));
    return match ? /^\s*(.*?)\s*$/.exec(match[2])[1] : "";
  }

  function getTagRegexp(tagName, anchored) {
    return new RegExp((anchored ? "^" : "") + "<\/\s*" + tagName + "\s*>", "i");
  }

  function addTags(from, to) {
    for (var tag in from) {
      var dest = to[tag] || (to[tag] = []);
      var source = from[tag];

      for (var i = source.length - 1; i >= 0; i--) {
        dest.unshift(source[i]);
      }
    }
  }

  function findMatchingMode(tagInfo, tagText) {
    for (var i = 0; i < tagInfo.length; i++) {
      var spec = tagInfo[i];
      if (!spec[0] || spec[1].test(getAttrValue(tagText, spec[0]))) return spec[2];
    }
  }

  CodeMirror.defineMode("htmlmixed", function (config, parserConfig) {
    var htmlMode = CodeMirror.getMode(config, {
      name: "xml",
      htmlMode: true,
      multilineTagIndentFactor: parserConfig.multilineTagIndentFactor,
      multilineTagIndentPastTag: parserConfig.multilineTagIndentPastTag
    });
    var tags = {};
    var configTags = parserConfig && parserConfig.tags,
        configScript = parserConfig && parserConfig.scriptTypes;
    addTags(defaultTags, tags);
    if (configTags) addTags(configTags, tags);
    if (configScript) for (var i = configScript.length - 1; i >= 0; i--) {
      tags.script.unshift(["type", configScript[i].matches, configScript[i].mode]);
    }

    function html(stream, state) {
      var style = htmlMode.token(stream, state.htmlState),
          tag = /\btag\b/.test(style),
          tagName;

      if (tag && !/[<>\s\/]/.test(stream.current()) && (tagName = state.htmlState.tagName && state.htmlState.tagName.toLowerCase()) && tags.hasOwnProperty(tagName)) {
        state.inTag = tagName + " ";
      } else if (state.inTag && tag && />$/.test(stream.current())) {
        var inTag = /^([\S]+) (.*)/.exec(state.inTag);
        state.inTag = null;
        var modeSpec = stream.current() == ">" && findMatchingMode(tags[inTag[1]], inTag[2]);
        var mode = CodeMirror.getMode(config, modeSpec);
        var endTagA = getTagRegexp(inTag[1], true),
            endTag = getTagRegexp(inTag[1], false);

        state.token = function (stream, state) {
          if (stream.match(endTagA, false)) {
            state.token = html;
            state.localState = state.localMode = null;
            return null;
          }

          return maybeBackup(stream, endTag, state.localMode.token(stream, state.localState));
        };

        state.localMode = mode;
        state.localState = CodeMirror.startState(mode, htmlMode.indent(state.htmlState, ""));
      } else if (state.inTag) {
        state.inTag += stream.current();
        if (stream.eol()) state.inTag += " ";
      }

      return style;
    }

    ;
    return {
      startState: function startState() {
        var state = CodeMirror.startState(htmlMode);
        return {
          token: html,
          inTag: null,
          localMode: null,
          localState: null,
          htmlState: state
        };
      },
      copyState: function copyState(state) {
        var local;

        if (state.localState) {
          local = CodeMirror.copyState(state.localMode, state.localState);
        }

        return {
          token: state.token,
          inTag: state.inTag,
          localMode: state.localMode,
          localState: local,
          htmlState: CodeMirror.copyState(htmlMode, state.htmlState)
        };
      },
      token: function token(stream, state) {
        return state.token(stream, state);
      },
      indent: function indent(state, textAfter) {
        if (!state.localMode || /^\s*<\//.test(textAfter)) return htmlMode.indent(state.htmlState, textAfter);else if (state.localMode.indent) return state.localMode.indent(state.localState, textAfter);else return CodeMirror.Pass;
      },
      innerMode: function innerMode(state) {
        return {
          state: state.localState || state.htmlState,
          mode: state.localMode || htmlMode
        };
      }
    };
  }, "xml", "javascript", "css");
  CodeMirror.defineMIME("text/html", "htmlmixed");
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhY2YtZmllbGRzL2h0bWxtaXhlZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG4vLyBDb2RlTWlycm9yLCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG4oZnVuY3Rpb24gKG1vZCkge1xuICBpZiAoKHR5cGVvZiBleHBvcnRzID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2YoZXhwb3J0cykpID09IFwib2JqZWN0XCIgJiYgKHR5cGVvZiBtb2R1bGUgPT09IFwidW5kZWZpbmVkXCIgPyBcInVuZGVmaW5lZFwiIDogX3R5cGVvZihtb2R1bGUpKSA9PSBcIm9iamVjdFwiKSAvLyBDb21tb25KU1xuICAgIG1vZChyZXF1aXJlKFwiLi4vLi4vbGliL2NvZGVtaXJyb3JcIiksIHJlcXVpcmUoXCIuLi94bWwveG1sXCIpLCByZXF1aXJlKFwiLi4vamF2YXNjcmlwdC9qYXZhc2NyaXB0XCIpLCByZXF1aXJlKFwiLi4vY3NzL2Nzc1wiKSk7ZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgLy8gQU1EXG4gICAgZGVmaW5lKFtcIi4uLy4uL2xpYi9jb2RlbWlycm9yXCIsIFwiLi4veG1sL3htbFwiLCBcIi4uL2phdmFzY3JpcHQvamF2YXNjcmlwdFwiLCBcIi4uL2Nzcy9jc3NcIl0sIG1vZCk7ZWxzZSAvLyBQbGFpbiBicm93c2VyIGVudlxuICAgIG1vZChDb2RlTWlycm9yKTtcbn0pKGZ1bmN0aW9uIChDb2RlTWlycm9yKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBkZWZhdWx0VGFncyA9IHtcbiAgICBzY3JpcHQ6IFtbXCJsYW5nXCIsIC8oamF2YXNjcmlwdHxiYWJlbCkvaSwgXCJqYXZhc2NyaXB0XCJdLCBbXCJ0eXBlXCIsIC9eKD86dGV4dHxhcHBsaWNhdGlvbilcXC8oPzp4LSk/KD86amF2YXxlY21hKXNjcmlwdCR8XiQvaSwgXCJqYXZhc2NyaXB0XCJdLCBbXCJ0eXBlXCIsIC8uLywgXCJ0ZXh0L3BsYWluXCJdLCBbbnVsbCwgbnVsbCwgXCJqYXZhc2NyaXB0XCJdXSxcbiAgICBzdHlsZTogW1tcImxhbmdcIiwgL15jc3MkL2ksIFwiY3NzXCJdLCBbXCJ0eXBlXCIsIC9eKHRleHRcXC8pPyh4LSk/KHN0eWxlc2hlZXR8Y3NzKSQvaSwgXCJjc3NcIl0sIFtcInR5cGVcIiwgLy4vLCBcInRleHQvcGxhaW5cIl0sIFtudWxsLCBudWxsLCBcImNzc1wiXV1cbiAgfTtcblxuICBmdW5jdGlvbiBtYXliZUJhY2t1cChzdHJlYW0sIHBhdCwgc3R5bGUpIHtcbiAgICB2YXIgY3VyID0gc3RyZWFtLmN1cnJlbnQoKSxcbiAgICAgICAgY2xvc2UgPSBjdXIuc2VhcmNoKHBhdCk7XG5cbiAgICBpZiAoY2xvc2UgPiAtMSkge1xuICAgICAgc3RyZWFtLmJhY2tVcChjdXIubGVuZ3RoIC0gY2xvc2UpO1xuICAgIH0gZWxzZSBpZiAoY3VyLm1hdGNoKC88XFwvPyQvKSkge1xuICAgICAgc3RyZWFtLmJhY2tVcChjdXIubGVuZ3RoKTtcbiAgICAgIGlmICghc3RyZWFtLm1hdGNoKHBhdCwgZmFsc2UpKSBzdHJlYW0ubWF0Y2goY3VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3R5bGU7XG4gIH1cblxuICB2YXIgYXR0clJlZ2V4cENhY2hlID0ge307XG5cbiAgZnVuY3Rpb24gZ2V0QXR0clJlZ2V4cChhdHRyKSB7XG4gICAgdmFyIHJlZ2V4cCA9IGF0dHJSZWdleHBDYWNoZVthdHRyXTtcbiAgICBpZiAocmVnZXhwKSByZXR1cm4gcmVnZXhwO1xuICAgIHJldHVybiBhdHRyUmVnZXhwQ2FjaGVbYXR0cl0gPSBuZXcgUmVnRXhwKFwiXFxcXHMrXCIgKyBhdHRyICsgXCJcXFxccyo9XFxcXHMqKCd8XFxcIik/KFteJ1xcXCJdKykoJ3xcXFwiKT9cXFxccypcIik7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRBdHRyVmFsdWUodGV4dCwgYXR0cikge1xuICAgIHZhciBtYXRjaCA9IHRleHQubWF0Y2goZ2V0QXR0clJlZ2V4cChhdHRyKSk7XG4gICAgcmV0dXJuIG1hdGNoID8gL15cXHMqKC4qPylcXHMqJC8uZXhlYyhtYXRjaFsyXSlbMV0gOiBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VGFnUmVnZXhwKHRhZ05hbWUsIGFuY2hvcmVkKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoKGFuY2hvcmVkID8gXCJeXCIgOiBcIlwiKSArIFwiPFxcL1xccypcIiArIHRhZ05hbWUgKyBcIlxccyo+XCIsIFwiaVwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFRhZ3MoZnJvbSwgdG8pIHtcbiAgICBmb3IgKHZhciB0YWcgaW4gZnJvbSkge1xuICAgICAgdmFyIGRlc3QgPSB0b1t0YWddIHx8ICh0b1t0YWddID0gW10pO1xuICAgICAgdmFyIHNvdXJjZSA9IGZyb21bdGFnXTtcblxuICAgICAgZm9yICh2YXIgaSA9IHNvdXJjZS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBkZXN0LnVuc2hpZnQoc291cmNlW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBmaW5kTWF0Y2hpbmdNb2RlKHRhZ0luZm8sIHRhZ1RleHQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhZ0luZm8ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzcGVjID0gdGFnSW5mb1tpXTtcbiAgICAgIGlmICghc3BlY1swXSB8fCBzcGVjWzFdLnRlc3QoZ2V0QXR0clZhbHVlKHRhZ1RleHQsIHNwZWNbMF0pKSkgcmV0dXJuIHNwZWNbMl07XG4gICAgfVxuICB9XG5cbiAgQ29kZU1pcnJvci5kZWZpbmVNb2RlKFwiaHRtbG1peGVkXCIsIGZ1bmN0aW9uIChjb25maWcsIHBhcnNlckNvbmZpZykge1xuICAgIHZhciBodG1sTW9kZSA9IENvZGVNaXJyb3IuZ2V0TW9kZShjb25maWcsIHtcbiAgICAgIG5hbWU6IFwieG1sXCIsXG4gICAgICBodG1sTW9kZTogdHJ1ZSxcbiAgICAgIG11bHRpbGluZVRhZ0luZGVudEZhY3RvcjogcGFyc2VyQ29uZmlnLm11bHRpbGluZVRhZ0luZGVudEZhY3RvcixcbiAgICAgIG11bHRpbGluZVRhZ0luZGVudFBhc3RUYWc6IHBhcnNlckNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRQYXN0VGFnXG4gICAgfSk7XG4gICAgdmFyIHRhZ3MgPSB7fTtcbiAgICB2YXIgY29uZmlnVGFncyA9IHBhcnNlckNvbmZpZyAmJiBwYXJzZXJDb25maWcudGFncyxcbiAgICAgICAgY29uZmlnU2NyaXB0ID0gcGFyc2VyQ29uZmlnICYmIHBhcnNlckNvbmZpZy5zY3JpcHRUeXBlcztcbiAgICBhZGRUYWdzKGRlZmF1bHRUYWdzLCB0YWdzKTtcbiAgICBpZiAoY29uZmlnVGFncykgYWRkVGFncyhjb25maWdUYWdzLCB0YWdzKTtcbiAgICBpZiAoY29uZmlnU2NyaXB0KSBmb3IgKHZhciBpID0gY29uZmlnU2NyaXB0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB0YWdzLnNjcmlwdC51bnNoaWZ0KFtcInR5cGVcIiwgY29uZmlnU2NyaXB0W2ldLm1hdGNoZXMsIGNvbmZpZ1NjcmlwdFtpXS5tb2RlXSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaHRtbChzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB2YXIgc3R5bGUgPSBodG1sTW9kZS50b2tlbihzdHJlYW0sIHN0YXRlLmh0bWxTdGF0ZSksXG4gICAgICAgICAgdGFnID0gL1xcYnRhZ1xcYi8udGVzdChzdHlsZSksXG4gICAgICAgICAgdGFnTmFtZTtcblxuICAgICAgaWYgKHRhZyAmJiAhL1s8Plxcc1xcL10vLnRlc3Qoc3RyZWFtLmN1cnJlbnQoKSkgJiYgKHRhZ05hbWUgPSBzdGF0ZS5odG1sU3RhdGUudGFnTmFtZSAmJiBzdGF0ZS5odG1sU3RhdGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSAmJiB0YWdzLmhhc093blByb3BlcnR5KHRhZ05hbWUpKSB7XG4gICAgICAgIHN0YXRlLmluVGFnID0gdGFnTmFtZSArIFwiIFwiO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZS5pblRhZyAmJiB0YWcgJiYgLz4kLy50ZXN0KHN0cmVhbS5jdXJyZW50KCkpKSB7XG4gICAgICAgIHZhciBpblRhZyA9IC9eKFtcXFNdKykgKC4qKS8uZXhlYyhzdGF0ZS5pblRhZyk7XG4gICAgICAgIHN0YXRlLmluVGFnID0gbnVsbDtcbiAgICAgICAgdmFyIG1vZGVTcGVjID0gc3RyZWFtLmN1cnJlbnQoKSA9PSBcIj5cIiAmJiBmaW5kTWF0Y2hpbmdNb2RlKHRhZ3NbaW5UYWdbMV1dLCBpblRhZ1syXSk7XG4gICAgICAgIHZhciBtb2RlID0gQ29kZU1pcnJvci5nZXRNb2RlKGNvbmZpZywgbW9kZVNwZWMpO1xuICAgICAgICB2YXIgZW5kVGFnQSA9IGdldFRhZ1JlZ2V4cChpblRhZ1sxXSwgdHJ1ZSksXG4gICAgICAgICAgICBlbmRUYWcgPSBnZXRUYWdSZWdleHAoaW5UYWdbMV0sIGZhbHNlKTtcblxuICAgICAgICBzdGF0ZS50b2tlbiA9IGZ1bmN0aW9uIChzdHJlYW0sIHN0YXRlKSB7XG4gICAgICAgICAgaWYgKHN0cmVhbS5tYXRjaChlbmRUYWdBLCBmYWxzZSkpIHtcbiAgICAgICAgICAgIHN0YXRlLnRva2VuID0gaHRtbDtcbiAgICAgICAgICAgIHN0YXRlLmxvY2FsU3RhdGUgPSBzdGF0ZS5sb2NhbE1vZGUgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG1heWJlQmFja3VwKHN0cmVhbSwgZW5kVGFnLCBzdGF0ZS5sb2NhbE1vZGUudG9rZW4oc3RyZWFtLCBzdGF0ZS5sb2NhbFN0YXRlKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3RhdGUubG9jYWxNb2RlID0gbW9kZTtcbiAgICAgICAgc3RhdGUubG9jYWxTdGF0ZSA9IENvZGVNaXJyb3Iuc3RhcnRTdGF0ZShtb2RlLCBodG1sTW9kZS5pbmRlbnQoc3RhdGUuaHRtbFN0YXRlLCBcIlwiKSk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmluVGFnKSB7XG4gICAgICAgIHN0YXRlLmluVGFnICs9IHN0cmVhbS5jdXJyZW50KCk7XG4gICAgICAgIGlmIChzdHJlYW0uZW9sKCkpIHN0YXRlLmluVGFnICs9IFwiIFwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3R5bGU7XG4gICAgfVxuXG4gICAgO1xuICAgIHJldHVybiB7XG4gICAgICBzdGFydFN0YXRlOiBmdW5jdGlvbiBzdGFydFN0YXRlKCkge1xuICAgICAgICB2YXIgc3RhdGUgPSBDb2RlTWlycm9yLnN0YXJ0U3RhdGUoaHRtbE1vZGUpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRva2VuOiBodG1sLFxuICAgICAgICAgIGluVGFnOiBudWxsLFxuICAgICAgICAgIGxvY2FsTW9kZTogbnVsbCxcbiAgICAgICAgICBsb2NhbFN0YXRlOiBudWxsLFxuICAgICAgICAgIGh0bWxTdGF0ZTogc3RhdGVcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBjb3B5U3RhdGU6IGZ1bmN0aW9uIGNvcHlTdGF0ZShzdGF0ZSkge1xuICAgICAgICB2YXIgbG9jYWw7XG5cbiAgICAgICAgaWYgKHN0YXRlLmxvY2FsU3RhdGUpIHtcbiAgICAgICAgICBsb2NhbCA9IENvZGVNaXJyb3IuY29weVN0YXRlKHN0YXRlLmxvY2FsTW9kZSwgc3RhdGUubG9jYWxTdGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRva2VuOiBzdGF0ZS50b2tlbixcbiAgICAgICAgICBpblRhZzogc3RhdGUuaW5UYWcsXG4gICAgICAgICAgbG9jYWxNb2RlOiBzdGF0ZS5sb2NhbE1vZGUsXG4gICAgICAgICAgbG9jYWxTdGF0ZTogbG9jYWwsXG4gICAgICAgICAgaHRtbFN0YXRlOiBDb2RlTWlycm9yLmNvcHlTdGF0ZShodG1sTW9kZSwgc3RhdGUuaHRtbFN0YXRlKVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIHRva2VuOiBmdW5jdGlvbiB0b2tlbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS50b2tlbihzdHJlYW0sIHN0YXRlKTtcbiAgICAgIH0sXG4gICAgICBpbmRlbnQ6IGZ1bmN0aW9uIGluZGVudChzdGF0ZSwgdGV4dEFmdGVyKSB7XG4gICAgICAgIGlmICghc3RhdGUubG9jYWxNb2RlIHx8IC9eXFxzKjxcXC8vLnRlc3QodGV4dEFmdGVyKSkgcmV0dXJuIGh0bWxNb2RlLmluZGVudChzdGF0ZS5odG1sU3RhdGUsIHRleHRBZnRlcik7ZWxzZSBpZiAoc3RhdGUubG9jYWxNb2RlLmluZGVudCkgcmV0dXJuIHN0YXRlLmxvY2FsTW9kZS5pbmRlbnQoc3RhdGUubG9jYWxTdGF0ZSwgdGV4dEFmdGVyKTtlbHNlIHJldHVybiBDb2RlTWlycm9yLlBhc3M7XG4gICAgICB9LFxuICAgICAgaW5uZXJNb2RlOiBmdW5jdGlvbiBpbm5lck1vZGUoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdGF0ZTogc3RhdGUubG9jYWxTdGF0ZSB8fCBzdGF0ZS5odG1sU3RhdGUsXG4gICAgICAgICAgbW9kZTogc3RhdGUubG9jYWxNb2RlIHx8IGh0bWxNb2RlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSwgXCJ4bWxcIiwgXCJqYXZhc2NyaXB0XCIsIFwiY3NzXCIpO1xuICBDb2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L2h0bWxcIiwgXCJodG1sbWl4ZWRcIik7XG59KTsiXSwiZmlsZSI6ImFjZi1maWVsZHMvaHRtbG1peGVkLmpzIn0=
