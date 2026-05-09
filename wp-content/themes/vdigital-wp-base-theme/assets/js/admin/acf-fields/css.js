"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
(function (mod) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object") // CommonJS
    mod(require("../../lib/codemirror"));else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  CodeMirror.defineMode("css", function (config, parserConfig) {
    var inline = parserConfig.inline;
    if (!parserConfig.propertyKeywords) parserConfig = CodeMirror.resolveMode("text/css");
    var indentUnit = config.indentUnit,
        tokenHooks = parserConfig.tokenHooks,
        documentTypes = parserConfig.documentTypes || {},
        mediaTypes = parserConfig.mediaTypes || {},
        mediaFeatures = parserConfig.mediaFeatures || {},
        mediaValueKeywords = parserConfig.mediaValueKeywords || {},
        propertyKeywords = parserConfig.propertyKeywords || {},
        nonStandardPropertyKeywords = parserConfig.nonStandardPropertyKeywords || {},
        fontProperties = parserConfig.fontProperties || {},
        counterDescriptors = parserConfig.counterDescriptors || {},
        colorKeywords = parserConfig.colorKeywords || {},
        valueKeywords = parserConfig.valueKeywords || {},
        allowNested = parserConfig.allowNested,
        supportsAtComponent = parserConfig.supportsAtComponent === true;
    var type, override;

    function ret(style, tp) {
      type = tp;
      return style;
    } // Tokenizers


    function tokenBase(stream, state) {
      var ch = stream.next();

      if (tokenHooks[ch]) {
        var result = tokenHooks[ch](stream, state);
        if (result !== false) return result;
      }

      if (ch == "@") {
        stream.eatWhile(/[\w\\\-]/);
        return ret("def", stream.current());
      } else if (ch == "=" || (ch == "~" || ch == "|") && stream.eat("=")) {
        return ret(null, "compare");
      } else if (ch == "\"" || ch == "'") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      } else if (ch == "#") {
        stream.eatWhile(/[\w\\\-]/);
        return ret("atom", "hash");
      } else if (ch == "!") {
        stream.match(/^\s*\w*/);
        return ret("keyword", "important");
      } else if (/\d/.test(ch) || ch == "." && stream.eat(/\d/)) {
        stream.eatWhile(/[\w.%]/);
        return ret("number", "unit");
      } else if (ch === "-") {
        if (/[\d.]/.test(stream.peek())) {
          stream.eatWhile(/[\w.%]/);
          return ret("number", "unit");
        } else if (stream.match(/^-[\w\\\-]+/)) {
          stream.eatWhile(/[\w\\\-]/);
          if (stream.match(/^\s*:/, false)) return ret("variable-2", "variable-definition");
          return ret("variable-2", "variable");
        } else if (stream.match(/^\w+-/)) {
          return ret("meta", "meta");
        }
      } else if (/[,+>*\/]/.test(ch)) {
        return ret(null, "select-op");
      } else if (ch == "." && stream.match(/^-?[_a-z][_a-z0-9-]*/i)) {
        return ret("qualifier", "qualifier");
      } else if (/[:;{}\[\]\(\)]/.test(ch)) {
        return ret(null, ch);
      } else if (ch == "u" && stream.match(/rl(-prefix)?\(/) || ch == "d" && stream.match("omain(") || ch == "r" && stream.match("egexp(")) {
        stream.backUp(1);
        state.tokenize = tokenParenthesized;
        return ret("property", "word");
      } else if (/[\w\\\-]/.test(ch)) {
        stream.eatWhile(/[\w\\\-]/);
        return ret("property", "word");
      } else {
        return ret(null, null);
      }
    }

    function tokenString(quote) {
      return function (stream, state) {
        var escaped = false,
            ch;

        while ((ch = stream.next()) != null) {
          if (ch == quote && !escaped) {
            if (quote == ")") stream.backUp(1);
            break;
          }

          escaped = !escaped && ch == "\\";
        }

        if (ch == quote || !escaped && quote != ")") state.tokenize = null;
        return ret("string", "string");
      };
    }

    function tokenParenthesized(stream, state) {
      stream.next(); // Must be '('

      if (!stream.match(/\s*[\"\')]/, false)) state.tokenize = tokenString(")");else state.tokenize = null;
      return ret(null, "(");
    } // Context management


    function Context(type, indent, prev) {
      this.type = type;
      this.indent = indent;
      this.prev = prev;
    }

    function pushContext(state, stream, type, indent) {
      state.context = new Context(type, stream.indentation() + (indent === false ? 0 : indentUnit), state.context);
      return type;
    }

    function popContext(state) {
      if (state.context.prev) state.context = state.context.prev;
      return state.context.type;
    }

    function pass(type, stream, state) {
      return states[state.context.type](type, stream, state);
    }

    function popAndPass(type, stream, state, n) {
      for (var i = n || 1; i > 0; i--) {
        state.context = state.context.prev;
      }

      return pass(type, stream, state);
    } // Parser


    function wordAsValue(stream) {
      var word = stream.current().toLowerCase();
      if (valueKeywords.hasOwnProperty(word)) override = "atom";else if (colorKeywords.hasOwnProperty(word)) override = "keyword";else override = "variable";
    }

    var states = {};

    states.top = function (type, stream, state) {
      if (type == "{") {
        return pushContext(state, stream, "block");
      } else if (type == "}" && state.context.prev) {
        return popContext(state);
      } else if (supportsAtComponent && /@component/.test(type)) {
        return pushContext(state, stream, "atComponentBlock");
      } else if (/^@(-moz-)?document$/.test(type)) {
        return pushContext(state, stream, "documentTypes");
      } else if (/^@(media|supports|(-moz-)?document|import)$/.test(type)) {
        return pushContext(state, stream, "atBlock");
      } else if (/^@(font-face|counter-style)/.test(type)) {
        state.stateArg = type;
        return "restricted_atBlock_before";
      } else if (/^@(-(moz|ms|o|webkit)-)?keyframes$/.test(type)) {
        return "keyframes";
      } else if (type && type.charAt(0) == "@") {
        return pushContext(state, stream, "at");
      } else if (type == "hash") {
        override = "builtin";
      } else if (type == "word") {
        override = "tag";
      } else if (type == "variable-definition") {
        return "maybeprop";
      } else if (type == "interpolation") {
        return pushContext(state, stream, "interpolation");
      } else if (type == ":") {
        return "pseudo";
      } else if (allowNested && type == "(") {
        return pushContext(state, stream, "parens");
      }

      return state.context.type;
    };

    states.block = function (type, stream, state) {
      if (type == "word") {
        var word = stream.current().toLowerCase();

        if (propertyKeywords.hasOwnProperty(word)) {
          override = "property";
          return "maybeprop";
        } else if (nonStandardPropertyKeywords.hasOwnProperty(word)) {
          override = "string-2";
          return "maybeprop";
        } else if (allowNested) {
          override = stream.match(/^\s*:(?:\s|$)/, false) ? "property" : "tag";
          return "block";
        } else {
          override += " error";
          return "maybeprop";
        }
      } else if (type == "meta") {
        return "block";
      } else if (!allowNested && (type == "hash" || type == "qualifier")) {
        override = "error";
        return "block";
      } else {
        return states.top(type, stream, state);
      }
    };

    states.maybeprop = function (type, stream, state) {
      if (type == ":") return pushContext(state, stream, "prop");
      return pass(type, stream, state);
    };

    states.prop = function (type, stream, state) {
      if (type == ";") return popContext(state);
      if (type == "{" && allowNested) return pushContext(state, stream, "propBlock");
      if (type == "}" || type == "{") return popAndPass(type, stream, state);
      if (type == "(") return pushContext(state, stream, "parens");

      if (type == "hash" && !/^#([0-9a-fA-f]{3,4}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/.test(stream.current())) {
        override += " error";
      } else if (type == "word") {
        wordAsValue(stream);
      } else if (type == "interpolation") {
        return pushContext(state, stream, "interpolation");
      }

      return "prop";
    };

    states.propBlock = function (type, _stream, state) {
      if (type == "}") return popContext(state);

      if (type == "word") {
        override = "property";
        return "maybeprop";
      }

      return state.context.type;
    };

    states.parens = function (type, stream, state) {
      if (type == "{" || type == "}") return popAndPass(type, stream, state);
      if (type == ")") return popContext(state);
      if (type == "(") return pushContext(state, stream, "parens");
      if (type == "interpolation") return pushContext(state, stream, "interpolation");
      if (type == "word") wordAsValue(stream);
      return "parens";
    };

    states.pseudo = function (type, stream, state) {
      if (type == "word") {
        override = "variable-3";
        return state.context.type;
      }

      return pass(type, stream, state);
    };

    states.documentTypes = function (type, stream, state) {
      if (type == "word" && documentTypes.hasOwnProperty(stream.current())) {
        override = "tag";
        return state.context.type;
      } else {
        return states.atBlock(type, stream, state);
      }
    };

    states.atBlock = function (type, stream, state) {
      if (type == "(") return pushContext(state, stream, "atBlock_parens");
      if (type == "}" || type == ";") return popAndPass(type, stream, state);
      if (type == "{") return popContext(state) && pushContext(state, stream, allowNested ? "block" : "top");
      if (type == "interpolation") return pushContext(state, stream, "interpolation");

      if (type == "word") {
        var word = stream.current().toLowerCase();
        if (word == "only" || word == "not" || word == "and" || word == "or") override = "keyword";else if (mediaTypes.hasOwnProperty(word)) override = "attribute";else if (mediaFeatures.hasOwnProperty(word)) override = "property";else if (mediaValueKeywords.hasOwnProperty(word)) override = "keyword";else if (propertyKeywords.hasOwnProperty(word)) override = "property";else if (nonStandardPropertyKeywords.hasOwnProperty(word)) override = "string-2";else if (valueKeywords.hasOwnProperty(word)) override = "atom";else if (colorKeywords.hasOwnProperty(word)) override = "keyword";else override = "error";
      }

      return state.context.type;
    };

    states.atComponentBlock = function (type, stream, state) {
      if (type == "}") return popAndPass(type, stream, state);
      if (type == "{") return popContext(state) && pushContext(state, stream, allowNested ? "block" : "top", false);
      if (type == "word") override = "error";
      return state.context.type;
    };

    states.atBlock_parens = function (type, stream, state) {
      if (type == ")") return popContext(state);
      if (type == "{" || type == "}") return popAndPass(type, stream, state, 2);
      return states.atBlock(type, stream, state);
    };

    states.restricted_atBlock_before = function (type, stream, state) {
      if (type == "{") return pushContext(state, stream, "restricted_atBlock");

      if (type == "word" && state.stateArg == "@counter-style") {
        override = "variable";
        return "restricted_atBlock_before";
      }

      return pass(type, stream, state);
    };

    states.restricted_atBlock = function (type, stream, state) {
      if (type == "}") {
        state.stateArg = null;
        return popContext(state);
      }

      if (type == "word") {
        if (state.stateArg == "@font-face" && !fontProperties.hasOwnProperty(stream.current().toLowerCase()) || state.stateArg == "@counter-style" && !counterDescriptors.hasOwnProperty(stream.current().toLowerCase())) override = "error";else override = "property";
        return "maybeprop";
      }

      return "restricted_atBlock";
    };

    states.keyframes = function (type, stream, state) {
      if (type == "word") {
        override = "variable";
        return "keyframes";
      }

      if (type == "{") return pushContext(state, stream, "top");
      return pass(type, stream, state);
    };

    states.at = function (type, stream, state) {
      if (type == ";") return popContext(state);
      if (type == "{" || type == "}") return popAndPass(type, stream, state);
      if (type == "word") override = "tag";else if (type == "hash") override = "builtin";
      return "at";
    };

    states.interpolation = function (type, stream, state) {
      if (type == "}") return popContext(state);
      if (type == "{" || type == ";") return popAndPass(type, stream, state);
      if (type == "word") override = "variable";else if (type != "variable" && type != "(" && type != ")") override = "error";
      return "interpolation";
    };

    return {
      startState: function startState(base) {
        return {
          tokenize: null,
          state: inline ? "block" : "top",
          stateArg: null,
          context: new Context(inline ? "block" : "top", base || 0, null)
        };
      },
      token: function token(stream, state) {
        if (!state.tokenize && stream.eatSpace()) return null;
        var style = (state.tokenize || tokenBase)(stream, state);

        if (style && _typeof(style) == "object") {
          type = style[1];
          style = style[0];
        }

        override = style;
        state.state = states[state.state](type, stream, state);
        return override;
      },
      indent: function indent(state, textAfter) {
        var cx = state.context,
            ch = textAfter && textAfter.charAt(0);
        var indent = cx.indent;
        if (cx.type == "prop" && (ch == "}" || ch == ")")) cx = cx.prev;

        if (cx.prev) {
          if (ch == "}" && (cx.type == "block" || cx.type == "top" || cx.type == "interpolation" || cx.type == "restricted_atBlock")) {
            // Resume indentation from parent context.
            cx = cx.prev;
            indent = cx.indent;
          } else if (ch == ")" && (cx.type == "parens" || cx.type == "atBlock_parens") || ch == "{" && (cx.type == "at" || cx.type == "atBlock")) {
            // Dedent relative to current context.
            indent = Math.max(0, cx.indent - indentUnit);
            cx = cx.prev;
          }
        }

        return indent;
      },
      electricChars: "}",
      blockCommentStart: "/*",
      blockCommentEnd: "*/",
      fold: "brace"
    };
  });

  function keySet(array) {
    var keys = {};

    for (var i = 0; i < array.length; ++i) {
      keys[array[i].toLowerCase()] = true;
    }

    return keys;
  }

  var documentTypes_ = ["domain", "regexp", "url", "url-prefix"],
      documentTypes = keySet(documentTypes_);
  var mediaTypes_ = ["all", "aural", "braille", "handheld", "print", "projection", "screen", "tty", "tv", "embossed"],
      mediaTypes = keySet(mediaTypes_);
  var mediaFeatures_ = ["width", "min-width", "max-width", "height", "min-height", "max-height", "device-width", "min-device-width", "max-device-width", "device-height", "min-device-height", "max-device-height", "aspect-ratio", "min-aspect-ratio", "max-aspect-ratio", "device-aspect-ratio", "min-device-aspect-ratio", "max-device-aspect-ratio", "color", "min-color", "max-color", "color-index", "min-color-index", "max-color-index", "monochrome", "min-monochrome", "max-monochrome", "resolution", "min-resolution", "max-resolution", "scan", "grid", "orientation", "device-pixel-ratio", "min-device-pixel-ratio", "max-device-pixel-ratio", "pointer", "any-pointer", "hover", "any-hover"],
      mediaFeatures = keySet(mediaFeatures_);
  var mediaValueKeywords_ = ["landscape", "portrait", "none", "coarse", "fine", "on-demand", "hover", "interlace", "progressive"],
      mediaValueKeywords = keySet(mediaValueKeywords_);
  var propertyKeywords_ = ["align-content", "align-items", "align-self", "alignment-adjust", "alignment-baseline", "anchor-point", "animation", "animation-delay", "animation-direction", "animation-duration", "animation-fill-mode", "animation-iteration-count", "animation-name", "animation-play-state", "animation-timing-function", "appearance", "azimuth", "backface-visibility", "background", "background-attachment", "background-blend-mode", "background-clip", "background-color", "background-image", "background-origin", "background-position", "background-repeat", "background-size", "baseline-shift", "binding", "bleed", "bookmark-label", "bookmark-level", "bookmark-state", "bookmark-target", "border", "border-bottom", "border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius", "border-bottom-style", "border-bottom-width", "border-collapse", "border-color", "border-image", "border-image-outset", "border-image-repeat", "border-image-slice", "border-image-source", "border-image-width", "border-left", "border-left-color", "border-left-style", "border-left-width", "border-radius", "border-right", "border-right-color", "border-right-style", "border-right-width", "border-spacing", "border-style", "border-top", "border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-style", "border-top-width", "border-width", "bottom", "box-decoration-break", "box-shadow", "box-sizing", "break-after", "break-before", "break-inside", "caption-side", "clear", "clip", "color", "color-profile", "column-count", "column-fill", "column-gap", "column-rule", "column-rule-color", "column-rule-style", "column-rule-width", "column-span", "column-width", "columns", "content", "counter-increment", "counter-reset", "crop", "cue", "cue-after", "cue-before", "cursor", "direction", "display", "dominant-baseline", "drop-initial-after-adjust", "drop-initial-after-align", "drop-initial-before-adjust", "drop-initial-before-align", "drop-initial-size", "drop-initial-value", "elevation", "empty-cells", "fit", "fit-position", "flex", "flex-basis", "flex-direction", "flex-flow", "flex-grow", "flex-shrink", "flex-wrap", "float", "float-offset", "flow-from", "flow-into", "font", "font-feature-settings", "font-family", "font-kerning", "font-language-override", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-synthesis", "font-variant", "font-variant-alternates", "font-variant-caps", "font-variant-east-asian", "font-variant-ligatures", "font-variant-numeric", "font-variant-position", "font-weight", "grid", "grid-area", "grid-auto-columns", "grid-auto-flow", "grid-auto-rows", "grid-column", "grid-column-end", "grid-column-gap", "grid-column-start", "grid-gap", "grid-row", "grid-row-end", "grid-row-gap", "grid-row-start", "grid-template", "grid-template-areas", "grid-template-columns", "grid-template-rows", "hanging-punctuation", "height", "hyphens", "icon", "image-orientation", "image-rendering", "image-resolution", "inline-box-align", "justify-content", "left", "letter-spacing", "line-break", "line-height", "line-stacking", "line-stacking-ruby", "line-stacking-shift", "line-stacking-strategy", "list-style", "list-style-image", "list-style-position", "list-style-type", "margin", "margin-bottom", "margin-left", "margin-right", "margin-top", "marks", "marquee-direction", "marquee-loop", "marquee-play-count", "marquee-speed", "marquee-style", "max-height", "max-width", "min-height", "min-width", "move-to", "nav-down", "nav-index", "nav-left", "nav-right", "nav-up", "object-fit", "object-position", "opacity", "order", "orphans", "outline", "outline-color", "outline-offset", "outline-style", "outline-width", "overflow", "overflow-style", "overflow-wrap", "overflow-x", "overflow-y", "padding", "padding-bottom", "padding-left", "padding-right", "padding-top", "page", "page-break-after", "page-break-before", "page-break-inside", "page-policy", "pause", "pause-after", "pause-before", "perspective", "perspective-origin", "pitch", "pitch-range", "play-during", "position", "presentation-level", "punctuation-trim", "quotes", "region-break-after", "region-break-before", "region-break-inside", "region-fragment", "rendering-intent", "resize", "rest", "rest-after", "rest-before", "richness", "right", "rotation", "rotation-point", "ruby-align", "ruby-overhang", "ruby-position", "ruby-span", "shape-image-threshold", "shape-inside", "shape-margin", "shape-outside", "size", "speak", "speak-as", "speak-header", "speak-numeral", "speak-punctuation", "speech-rate", "stress", "string-set", "tab-size", "table-layout", "target", "target-name", "target-new", "target-position", "text-align", "text-align-last", "text-decoration", "text-decoration-color", "text-decoration-line", "text-decoration-skip", "text-decoration-style", "text-emphasis", "text-emphasis-color", "text-emphasis-position", "text-emphasis-style", "text-height", "text-indent", "text-justify", "text-outline", "text-overflow", "text-shadow", "text-size-adjust", "text-space-collapse", "text-transform", "text-underline-position", "text-wrap", "top", "transform", "transform-origin", "transform-style", "transition", "transition-delay", "transition-duration", "transition-property", "transition-timing-function", "unicode-bidi", "user-select", "vertical-align", "visibility", "voice-balance", "voice-duration", "voice-family", "voice-pitch", "voice-range", "voice-rate", "voice-stress", "voice-volume", "volume", "white-space", "widows", "width", "will-change", "word-break", "word-spacing", "word-wrap", "z-index", // SVG-specific
  "clip-path", "clip-rule", "mask", "enable-background", "filter", "flood-color", "flood-opacity", "lighting-color", "stop-color", "stop-opacity", "pointer-events", "color-interpolation", "color-interpolation-filters", "color-rendering", "fill", "fill-opacity", "fill-rule", "image-rendering", "marker", "marker-end", "marker-mid", "marker-start", "shape-rendering", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-rendering", "baseline-shift", "dominant-baseline", "glyph-orientation-horizontal", "glyph-orientation-vertical", "text-anchor", "writing-mode"],
      propertyKeywords = keySet(propertyKeywords_);
  var nonStandardPropertyKeywords_ = ["scrollbar-arrow-color", "scrollbar-base-color", "scrollbar-dark-shadow-color", "scrollbar-face-color", "scrollbar-highlight-color", "scrollbar-shadow-color", "scrollbar-3d-light-color", "scrollbar-track-color", "shape-inside", "searchfield-cancel-button", "searchfield-decoration", "searchfield-results-button", "searchfield-results-decoration", "zoom"],
      nonStandardPropertyKeywords = keySet(nonStandardPropertyKeywords_);
  var fontProperties_ = ["font-family", "src", "unicode-range", "font-variant", "font-feature-settings", "font-stretch", "font-weight", "font-style"],
      fontProperties = keySet(fontProperties_);
  var counterDescriptors_ = ["additive-symbols", "fallback", "negative", "pad", "prefix", "range", "speak-as", "suffix", "symbols", "system"],
      counterDescriptors = keySet(counterDescriptors_);
  var colorKeywords_ = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "grey", "green", "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"],
      colorKeywords = keySet(colorKeywords_);
  var valueKeywords_ = ["above", "absolute", "activeborder", "additive", "activecaption", "afar", "after-white-space", "ahead", "alias", "all", "all-scroll", "alphabetic", "alternate", "always", "amharic", "amharic-abegede", "antialiased", "appworkspace", "arabic-indic", "armenian", "asterisks", "attr", "auto", "auto-flow", "avoid", "avoid-column", "avoid-page", "avoid-region", "background", "backwards", "baseline", "below", "bidi-override", "binary", "bengali", "blink", "block", "block-axis", "bold", "bolder", "border", "border-box", "both", "bottom", "break", "break-all", "break-word", "bullets", "button", "button-bevel", "buttonface", "buttonhighlight", "buttonshadow", "buttontext", "calc", "cambodian", "capitalize", "caps-lock-indicator", "caption", "captiontext", "caret", "cell", "center", "checkbox", "circle", "cjk-decimal", "cjk-earthly-branch", "cjk-heavenly-stem", "cjk-ideographic", "clear", "clip", "close-quote", "col-resize", "collapse", "color", "color-burn", "color-dodge", "column", "column-reverse", "compact", "condensed", "contain", "content", "contents", "content-box", "context-menu", "continuous", "copy", "counter", "counters", "cover", "crop", "cross", "crosshair", "currentcolor", "cursive", "cyclic", "darken", "dashed", "decimal", "decimal-leading-zero", "default", "default-button", "dense", "destination-atop", "destination-in", "destination-out", "destination-over", "devanagari", "difference", "disc", "discard", "disclosure-closed", "disclosure-open", "document", "dot-dash", "dot-dot-dash", "dotted", "double", "down", "e-resize", "ease", "ease-in", "ease-in-out", "ease-out", "element", "ellipse", "ellipsis", "embed", "end", "ethiopic", "ethiopic-abegede", "ethiopic-abegede-am-et", "ethiopic-abegede-gez", "ethiopic-abegede-ti-er", "ethiopic-abegede-ti-et", "ethiopic-halehame-aa-er", "ethiopic-halehame-aa-et", "ethiopic-halehame-am-et", "ethiopic-halehame-gez", "ethiopic-halehame-om-et", "ethiopic-halehame-sid-et", "ethiopic-halehame-so-et", "ethiopic-halehame-ti-er", "ethiopic-halehame-ti-et", "ethiopic-halehame-tig", "ethiopic-numeric", "ew-resize", "exclusion", "expanded", "extends", "extra-condensed", "extra-expanded", "fantasy", "fast", "fill", "fixed", "flat", "flex", "flex-end", "flex-start", "footnotes", "forwards", "from", "geometricPrecision", "georgian", "graytext", "grid", "groove", "gujarati", "gurmukhi", "hand", "hangul", "hangul-consonant", "hard-light", "hebrew", "help", "hidden", "hide", "higher", "highlight", "highlighttext", "hiragana", "hiragana-iroha", "horizontal", "hsl", "hsla", "hue", "icon", "ignore", "inactiveborder", "inactivecaption", "inactivecaptiontext", "infinite", "infobackground", "infotext", "inherit", "initial", "inline", "inline-axis", "inline-block", "inline-flex", "inline-grid", "inline-table", "inset", "inside", "intrinsic", "invert", "italic", "japanese-formal", "japanese-informal", "justify", "kannada", "katakana", "katakana-iroha", "keep-all", "khmer", "korean-hangul-formal", "korean-hanja-formal", "korean-hanja-informal", "landscape", "lao", "large", "larger", "left", "level", "lighter", "lighten", "line-through", "linear", "linear-gradient", "lines", "list-item", "listbox", "listitem", "local", "logical", "loud", "lower", "lower-alpha", "lower-armenian", "lower-greek", "lower-hexadecimal", "lower-latin", "lower-norwegian", "lower-roman", "lowercase", "ltr", "luminosity", "malayalam", "match", "matrix", "matrix3d", "media-controls-background", "media-current-time-display", "media-fullscreen-button", "media-mute-button", "media-play-button", "media-return-to-realtime-button", "media-rewind-button", "media-seek-back-button", "media-seek-forward-button", "media-slider", "media-sliderthumb", "media-time-remaining-display", "media-volume-slider", "media-volume-slider-container", "media-volume-sliderthumb", "medium", "menu", "menulist", "menulist-button", "menulist-text", "menulist-textfield", "menutext", "message-box", "middle", "min-intrinsic", "mix", "mongolian", "monospace", "move", "multiple", "multiply", "myanmar", "n-resize", "narrower", "ne-resize", "nesw-resize", "no-close-quote", "no-drop", "no-open-quote", "no-repeat", "none", "normal", "not-allowed", "nowrap", "ns-resize", "numbers", "numeric", "nw-resize", "nwse-resize", "oblique", "octal", "opacity", "open-quote", "optimizeLegibility", "optimizeSpeed", "oriya", "oromo", "outset", "outside", "outside-shape", "overlay", "overline", "padding", "padding-box", "painted", "page", "paused", "persian", "perspective", "plus-darker", "plus-lighter", "pointer", "polygon", "portrait", "pre", "pre-line", "pre-wrap", "preserve-3d", "progress", "push-button", "radial-gradient", "radio", "read-only", "read-write", "read-write-plaintext-only", "rectangle", "region", "relative", "repeat", "repeating-linear-gradient", "repeating-radial-gradient", "repeat-x", "repeat-y", "reset", "reverse", "rgb", "rgba", "ridge", "right", "rotate", "rotate3d", "rotateX", "rotateY", "rotateZ", "round", "row", "row-resize", "row-reverse", "rtl", "run-in", "running", "s-resize", "sans-serif", "saturation", "scale", "scale3d", "scaleX", "scaleY", "scaleZ", "screen", "scroll", "scrollbar", "scroll-position", "se-resize", "searchfield", "searchfield-cancel-button", "searchfield-decoration", "searchfield-results-button", "searchfield-results-decoration", "semi-condensed", "semi-expanded", "separate", "serif", "show", "sidama", "simp-chinese-formal", "simp-chinese-informal", "single", "skew", "skewX", "skewY", "skip-white-space", "slide", "slider-horizontal", "slider-vertical", "sliderthumb-horizontal", "sliderthumb-vertical", "slow", "small", "small-caps", "small-caption", "smaller", "soft-light", "solid", "somali", "source-atop", "source-in", "source-out", "source-over", "space", "space-around", "space-between", "spell-out", "square", "square-button", "start", "static", "status-bar", "stretch", "stroke", "sub", "subpixel-antialiased", "super", "sw-resize", "symbolic", "symbols", "table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row", "table-row-group", "tamil", "telugu", "text", "text-bottom", "text-top", "textarea", "textfield", "thai", "thick", "thin", "threeddarkshadow", "threedface", "threedhighlight", "threedlightshadow", "threedshadow", "tibetan", "tigre", "tigrinya-er", "tigrinya-er-abegede", "tigrinya-et", "tigrinya-et-abegede", "to", "top", "trad-chinese-formal", "trad-chinese-informal", "transform", "translate", "translate3d", "translateX", "translateY", "translateZ", "transparent", "ultra-condensed", "ultra-expanded", "underline", "unset", "up", "upper-alpha", "upper-armenian", "upper-greek", "upper-hexadecimal", "upper-latin", "upper-norwegian", "upper-roman", "uppercase", "urdu", "url", "var", "vertical", "vertical-text", "visible", "visibleFill", "visiblePainted", "visibleStroke", "visual", "w-resize", "wait", "wave", "wider", "window", "windowframe", "windowtext", "words", "wrap", "wrap-reverse", "x-large", "x-small", "xor", "xx-large", "xx-small"],
      valueKeywords = keySet(valueKeywords_);
  var allWords = documentTypes_.concat(mediaTypes_).concat(mediaFeatures_).concat(mediaValueKeywords_).concat(propertyKeywords_).concat(nonStandardPropertyKeywords_).concat(colorKeywords_).concat(valueKeywords_);
  CodeMirror.registerHelper("hintWords", "css", allWords);

  function tokenCComment(stream, state) {
    var maybeEnd = false,
        ch;

    while ((ch = stream.next()) != null) {
      if (maybeEnd && ch == "/") {
        state.tokenize = null;
        break;
      }

      maybeEnd = ch == "*";
    }

    return ["comment", "comment"];
  }

  CodeMirror.defineMIME("text/css", {
    documentTypes: documentTypes,
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    mediaValueKeywords: mediaValueKeywords,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    fontProperties: fontProperties,
    counterDescriptors: counterDescriptors,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    tokenHooks: {
      "/": function _(stream, state) {
        if (!stream.eat("*")) return false;
        state.tokenize = tokenCComment;
        return tokenCComment(stream, state);
      }
    },
    name: "css"
  });
  CodeMirror.defineMIME("text/x-scss", {
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    mediaValueKeywords: mediaValueKeywords,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    fontProperties: fontProperties,
    allowNested: true,
    tokenHooks: {
      "/": function _(stream, state) {
        if (stream.eat("/")) {
          stream.skipToEnd();
          return ["comment", "comment"];
        } else if (stream.eat("*")) {
          state.tokenize = tokenCComment;
          return tokenCComment(stream, state);
        } else {
          return ["operator", "operator"];
        }
      },
      ":": function _(stream) {
        if (stream.match(/\s*\{/)) return [null, "{"];
        return false;
      },
      "$": function $(stream) {
        stream.match(/^[\w-]+/);
        if (stream.match(/^\s*:/, false)) return ["variable-2", "variable-definition"];
        return ["variable-2", "variable"];
      },
      "#": function _(stream) {
        if (!stream.eat("{")) return false;
        return [null, "interpolation"];
      }
    },
    name: "css",
    helperType: "scss"
  });
  CodeMirror.defineMIME("text/x-less", {
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    mediaValueKeywords: mediaValueKeywords,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    fontProperties: fontProperties,
    allowNested: true,
    tokenHooks: {
      "/": function _(stream, state) {
        if (stream.eat("/")) {
          stream.skipToEnd();
          return ["comment", "comment"];
        } else if (stream.eat("*")) {
          state.tokenize = tokenCComment;
          return tokenCComment(stream, state);
        } else {
          return ["operator", "operator"];
        }
      },
      "@": function _(stream) {
        if (stream.eat("{")) return [null, "interpolation"];
        if (stream.match(/^(charset|document|font-face|import|(-(moz|ms|o|webkit)-)?keyframes|media|namespace|page|supports)\b/, false)) return false;
        stream.eatWhile(/[\w\\\-]/);
        if (stream.match(/^\s*:/, false)) return ["variable-2", "variable-definition"];
        return ["variable-2", "variable"];
      },
      "&": function _() {
        return ["atom", "atom"];
      }
    },
    name: "css",
    helperType: "less"
  });
  CodeMirror.defineMIME("text/x-gss", {
    documentTypes: documentTypes,
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    fontProperties: fontProperties,
    counterDescriptors: counterDescriptors,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    supportsAtComponent: true,
    tokenHooks: {
      "/": function _(stream, state) {
        if (!stream.eat("*")) return false;
        state.tokenize = tokenCComment;
        return tokenCComment(stream, state);
      }
    },
    name: "css",
    helperType: "gss"
  });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhY2YtZmllbGRzL2Nzcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG4vLyBDb2RlTWlycm9yLCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG4oZnVuY3Rpb24gKG1vZCkge1xuICBpZiAoKHR5cGVvZiBleHBvcnRzID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2YoZXhwb3J0cykpID09IFwib2JqZWN0XCIgJiYgKHR5cGVvZiBtb2R1bGUgPT09IFwidW5kZWZpbmVkXCIgPyBcInVuZGVmaW5lZFwiIDogX3R5cGVvZihtb2R1bGUpKSA9PSBcIm9iamVjdFwiKSAvLyBDb21tb25KU1xuICAgIG1vZChyZXF1aXJlKFwiLi4vLi4vbGliL2NvZGVtaXJyb3JcIikpO2Vsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIC8vIEFNRFxuICAgIGRlZmluZShbXCIuLi8uLi9saWIvY29kZW1pcnJvclwiXSwgbW9kKTtlbHNlIC8vIFBsYWluIGJyb3dzZXIgZW52XG4gICAgbW9kKENvZGVNaXJyb3IpO1xufSkoZnVuY3Rpb24gKENvZGVNaXJyb3IpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgQ29kZU1pcnJvci5kZWZpbmVNb2RlKFwiY3NzXCIsIGZ1bmN0aW9uIChjb25maWcsIHBhcnNlckNvbmZpZykge1xuICAgIHZhciBpbmxpbmUgPSBwYXJzZXJDb25maWcuaW5saW5lO1xuICAgIGlmICghcGFyc2VyQ29uZmlnLnByb3BlcnR5S2V5d29yZHMpIHBhcnNlckNvbmZpZyA9IENvZGVNaXJyb3IucmVzb2x2ZU1vZGUoXCJ0ZXh0L2Nzc1wiKTtcbiAgICB2YXIgaW5kZW50VW5pdCA9IGNvbmZpZy5pbmRlbnRVbml0LFxuICAgICAgICB0b2tlbkhvb2tzID0gcGFyc2VyQ29uZmlnLnRva2VuSG9va3MsXG4gICAgICAgIGRvY3VtZW50VHlwZXMgPSBwYXJzZXJDb25maWcuZG9jdW1lbnRUeXBlcyB8fCB7fSxcbiAgICAgICAgbWVkaWFUeXBlcyA9IHBhcnNlckNvbmZpZy5tZWRpYVR5cGVzIHx8IHt9LFxuICAgICAgICBtZWRpYUZlYXR1cmVzID0gcGFyc2VyQ29uZmlnLm1lZGlhRmVhdHVyZXMgfHwge30sXG4gICAgICAgIG1lZGlhVmFsdWVLZXl3b3JkcyA9IHBhcnNlckNvbmZpZy5tZWRpYVZhbHVlS2V5d29yZHMgfHwge30sXG4gICAgICAgIHByb3BlcnR5S2V5d29yZHMgPSBwYXJzZXJDb25maWcucHJvcGVydHlLZXl3b3JkcyB8fCB7fSxcbiAgICAgICAgbm9uU3RhbmRhcmRQcm9wZXJ0eUtleXdvcmRzID0gcGFyc2VyQ29uZmlnLm5vblN0YW5kYXJkUHJvcGVydHlLZXl3b3JkcyB8fCB7fSxcbiAgICAgICAgZm9udFByb3BlcnRpZXMgPSBwYXJzZXJDb25maWcuZm9udFByb3BlcnRpZXMgfHwge30sXG4gICAgICAgIGNvdW50ZXJEZXNjcmlwdG9ycyA9IHBhcnNlckNvbmZpZy5jb3VudGVyRGVzY3JpcHRvcnMgfHwge30sXG4gICAgICAgIGNvbG9yS2V5d29yZHMgPSBwYXJzZXJDb25maWcuY29sb3JLZXl3b3JkcyB8fCB7fSxcbiAgICAgICAgdmFsdWVLZXl3b3JkcyA9IHBhcnNlckNvbmZpZy52YWx1ZUtleXdvcmRzIHx8IHt9LFxuICAgICAgICBhbGxvd05lc3RlZCA9IHBhcnNlckNvbmZpZy5hbGxvd05lc3RlZCxcbiAgICAgICAgc3VwcG9ydHNBdENvbXBvbmVudCA9IHBhcnNlckNvbmZpZy5zdXBwb3J0c0F0Q29tcG9uZW50ID09PSB0cnVlO1xuICAgIHZhciB0eXBlLCBvdmVycmlkZTtcblxuICAgIGZ1bmN0aW9uIHJldChzdHlsZSwgdHApIHtcbiAgICAgIHR5cGUgPSB0cDtcbiAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9IC8vIFRva2VuaXplcnNcblxuXG4gICAgZnVuY3Rpb24gdG9rZW5CYXNlKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG5cbiAgICAgIGlmICh0b2tlbkhvb2tzW2NoXSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdG9rZW5Ib29rc1tjaF0oc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIGlmIChyZXN1bHQgIT09IGZhbHNlKSByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuXG4gICAgICBpZiAoY2ggPT0gXCJAXCIpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFxcXFxcLV0vKTtcbiAgICAgICAgcmV0dXJuIHJldChcImRlZlwiLCBzdHJlYW0uY3VycmVudCgpKTtcbiAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI9XCIgfHwgKGNoID09IFwiflwiIHx8IGNoID09IFwifFwiKSAmJiBzdHJlYW0uZWF0KFwiPVwiKSkge1xuICAgICAgICByZXR1cm4gcmV0KG51bGwsIFwiY29tcGFyZVwiKTtcbiAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCJcXFwiXCIgfHwgY2ggPT0gXCInXCIpIHtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSB0b2tlblN0cmluZyhjaCk7XG4gICAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCIjXCIpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFxcXFxcLV0vKTtcbiAgICAgICAgcmV0dXJuIHJldChcImF0b21cIiwgXCJoYXNoXCIpO1xuICAgICAgfSBlbHNlIGlmIChjaCA9PSBcIiFcIikge1xuICAgICAgICBzdHJlYW0ubWF0Y2goL15cXHMqXFx3Ki8pO1xuICAgICAgICByZXR1cm4gcmV0KFwia2V5d29yZFwiLCBcImltcG9ydGFudFwiKTtcbiAgICAgIH0gZWxzZSBpZiAoL1xcZC8udGVzdChjaCkgfHwgY2ggPT0gXCIuXCIgJiYgc3RyZWFtLmVhdCgvXFxkLykpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3LiVdLyk7XG4gICAgICAgIHJldHVybiByZXQoXCJudW1iZXJcIiwgXCJ1bml0XCIpO1xuICAgICAgfSBlbHNlIGlmIChjaCA9PT0gXCItXCIpIHtcbiAgICAgICAgaWYgKC9bXFxkLl0vLnRlc3Qoc3RyZWFtLnBlZWsoKSkpIHtcbiAgICAgICAgICBzdHJlYW0uZWF0V2hpbGUoL1tcXHcuJV0vKTtcbiAgICAgICAgICByZXR1cm4gcmV0KFwibnVtYmVyXCIsIFwidW5pdFwiKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goL14tW1xcd1xcXFxcXC1dKy8pKSB7XG4gICAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFxcXFxcLV0vKTtcbiAgICAgICAgICBpZiAoc3RyZWFtLm1hdGNoKC9eXFxzKjovLCBmYWxzZSkpIHJldHVybiByZXQoXCJ2YXJpYWJsZS0yXCIsIFwidmFyaWFibGUtZGVmaW5pdGlvblwiKTtcbiAgICAgICAgICByZXR1cm4gcmV0KFwidmFyaWFibGUtMlwiLCBcInZhcmlhYmxlXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVhbS5tYXRjaCgvXlxcdystLykpIHtcbiAgICAgICAgICByZXR1cm4gcmV0KFwibWV0YVwiLCBcIm1ldGFcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoL1ssKz4qXFwvXS8udGVzdChjaCkpIHtcbiAgICAgICAgcmV0dXJuIHJldChudWxsLCBcInNlbGVjdC1vcFwiKTtcbiAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCIuXCIgJiYgc3RyZWFtLm1hdGNoKC9eLT9bX2Etel1bX2EtejAtOS1dKi9pKSkge1xuICAgICAgICByZXR1cm4gcmV0KFwicXVhbGlmaWVyXCIsIFwicXVhbGlmaWVyXCIpO1xuICAgICAgfSBlbHNlIGlmICgvWzo7e31cXFtcXF1cXChcXCldLy50ZXN0KGNoKSkge1xuICAgICAgICByZXR1cm4gcmV0KG51bGwsIGNoKTtcbiAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCJ1XCIgJiYgc3RyZWFtLm1hdGNoKC9ybCgtcHJlZml4KT9cXCgvKSB8fCBjaCA9PSBcImRcIiAmJiBzdHJlYW0ubWF0Y2goXCJvbWFpbihcIikgfHwgY2ggPT0gXCJyXCIgJiYgc3RyZWFtLm1hdGNoKFwiZWdleHAoXCIpKSB7XG4gICAgICAgIHN0cmVhbS5iYWNrVXAoMSk7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gdG9rZW5QYXJlbnRoZXNpemVkO1xuICAgICAgICByZXR1cm4gcmV0KFwicHJvcGVydHlcIiwgXCJ3b3JkXCIpO1xuICAgICAgfSBlbHNlIGlmICgvW1xcd1xcXFxcXC1dLy50ZXN0KGNoKSkge1xuICAgICAgICBzdHJlYW0uZWF0V2hpbGUoL1tcXHdcXFxcXFwtXS8pO1xuICAgICAgICByZXR1cm4gcmV0KFwicHJvcGVydHlcIiwgXCJ3b3JkXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJldChudWxsLCBudWxsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b2tlblN0cmluZyhxdW90ZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzdHJlYW0sIHN0YXRlKSB7XG4gICAgICAgIHZhciBlc2NhcGVkID0gZmFsc2UsXG4gICAgICAgICAgICBjaDtcblxuICAgICAgICB3aGlsZSAoKGNoID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChjaCA9PSBxdW90ZSAmJiAhZXNjYXBlZCkge1xuICAgICAgICAgICAgaWYgKHF1b3RlID09IFwiKVwiKSBzdHJlYW0uYmFja1VwKDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXNjYXBlZCA9ICFlc2NhcGVkICYmIGNoID09IFwiXFxcXFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoID09IHF1b3RlIHx8ICFlc2NhcGVkICYmIHF1b3RlICE9IFwiKVwiKSBzdGF0ZS50b2tlbml6ZSA9IG51bGw7XG4gICAgICAgIHJldHVybiByZXQoXCJzdHJpbmdcIiwgXCJzdHJpbmdcIik7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRva2VuUGFyZW50aGVzaXplZChzdHJlYW0sIHN0YXRlKSB7XG4gICAgICBzdHJlYW0ubmV4dCgpOyAvLyBNdXN0IGJlICcoJ1xuXG4gICAgICBpZiAoIXN0cmVhbS5tYXRjaCgvXFxzKltcXFwiXFwnKV0vLCBmYWxzZSkpIHN0YXRlLnRva2VuaXplID0gdG9rZW5TdHJpbmcoXCIpXCIpO2Vsc2Ugc3RhdGUudG9rZW5pemUgPSBudWxsO1xuICAgICAgcmV0dXJuIHJldChudWxsLCBcIihcIik7XG4gICAgfSAvLyBDb250ZXh0IG1hbmFnZW1lbnRcblxuXG4gICAgZnVuY3Rpb24gQ29udGV4dCh0eXBlLCBpbmRlbnQsIHByZXYpIHtcbiAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICB0aGlzLmluZGVudCA9IGluZGVudDtcbiAgICAgIHRoaXMucHJldiA9IHByZXY7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHVzaENvbnRleHQoc3RhdGUsIHN0cmVhbSwgdHlwZSwgaW5kZW50KSB7XG4gICAgICBzdGF0ZS5jb250ZXh0ID0gbmV3IENvbnRleHQodHlwZSwgc3RyZWFtLmluZGVudGF0aW9uKCkgKyAoaW5kZW50ID09PSBmYWxzZSA/IDAgOiBpbmRlbnRVbml0KSwgc3RhdGUuY29udGV4dCk7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb3BDb250ZXh0KHN0YXRlKSB7XG4gICAgICBpZiAoc3RhdGUuY29udGV4dC5wcmV2KSBzdGF0ZS5jb250ZXh0ID0gc3RhdGUuY29udGV4dC5wcmV2O1xuICAgICAgcmV0dXJuIHN0YXRlLmNvbnRleHQudHlwZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXNzKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHJldHVybiBzdGF0ZXNbc3RhdGUuY29udGV4dC50eXBlXSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb3BBbmRQYXNzKHR5cGUsIHN0cmVhbSwgc3RhdGUsIG4pIHtcbiAgICAgIGZvciAodmFyIGkgPSBuIHx8IDE7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgc3RhdGUuY29udGV4dCA9IHN0YXRlLmNvbnRleHQucHJldjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhc3ModHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSAvLyBQYXJzZXJcblxuXG4gICAgZnVuY3Rpb24gd29yZEFzVmFsdWUoc3RyZWFtKSB7XG4gICAgICB2YXIgd29yZCA9IHN0cmVhbS5jdXJyZW50KCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICh2YWx1ZUtleXdvcmRzLmhhc093blByb3BlcnR5KHdvcmQpKSBvdmVycmlkZSA9IFwiYXRvbVwiO2Vsc2UgaWYgKGNvbG9yS2V5d29yZHMuaGFzT3duUHJvcGVydHkod29yZCkpIG92ZXJyaWRlID0gXCJrZXl3b3JkXCI7ZWxzZSBvdmVycmlkZSA9IFwidmFyaWFibGVcIjtcbiAgICB9XG5cbiAgICB2YXIgc3RhdGVzID0ge307XG5cbiAgICBzdGF0ZXMudG9wID0gZnVuY3Rpb24gKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmICh0eXBlID09IFwie1wiKSB7XG4gICAgICAgIHJldHVybiBwdXNoQ29udGV4dChzdGF0ZSwgc3RyZWFtLCBcImJsb2NrXCIpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwifVwiICYmIHN0YXRlLmNvbnRleHQucHJldikge1xuICAgICAgICByZXR1cm4gcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnRzQXRDb21wb25lbnQgJiYgL0Bjb21wb25lbnQvLnRlc3QodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIHB1c2hDb250ZXh0KHN0YXRlLCBzdHJlYW0sIFwiYXRDb21wb25lbnRCbG9ja1wiKTtcbiAgICAgIH0gZWxzZSBpZiAoL15AKC1tb3otKT9kb2N1bWVudCQvLnRlc3QodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIHB1c2hDb250ZXh0KHN0YXRlLCBzdHJlYW0sIFwiZG9jdW1lbnRUeXBlc1wiKTtcbiAgICAgIH0gZWxzZSBpZiAoL15AKG1lZGlhfHN1cHBvcnRzfCgtbW96LSk/ZG9jdW1lbnR8aW1wb3J0KSQvLnRlc3QodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIHB1c2hDb250ZXh0KHN0YXRlLCBzdHJlYW0sIFwiYXRCbG9ja1wiKTtcbiAgICAgIH0gZWxzZSBpZiAoL15AKGZvbnQtZmFjZXxjb3VudGVyLXN0eWxlKS8udGVzdCh0eXBlKSkge1xuICAgICAgICBzdGF0ZS5zdGF0ZUFyZyA9IHR5cGU7XG4gICAgICAgIHJldHVybiBcInJlc3RyaWN0ZWRfYXRCbG9ja19iZWZvcmVcIjtcbiAgICAgIH0gZWxzZSBpZiAoL15AKC0obW96fG1zfG98d2Via2l0KS0pP2tleWZyYW1lcyQvLnRlc3QodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIFwia2V5ZnJhbWVzXCI7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgJiYgdHlwZS5jaGFyQXQoMCkgPT0gXCJAXCIpIHtcbiAgICAgICAgcmV0dXJuIHB1c2hDb250ZXh0KHN0YXRlLCBzdHJlYW0sIFwiYXRcIik7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJoYXNoXCIpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBcImJ1aWx0aW5cIjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgICBvdmVycmlkZSA9IFwidGFnXCI7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZS1kZWZpbml0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIFwibWF5YmVwcm9wXCI7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJpbnRlcnBvbGF0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHB1c2hDb250ZXh0KHN0YXRlLCBzdHJlYW0sIFwiaW50ZXJwb2xhdGlvblwiKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcIjpcIikge1xuICAgICAgICByZXR1cm4gXCJwc2V1ZG9cIjtcbiAgICAgIH0gZWxzZSBpZiAoYWxsb3dOZXN0ZWQgJiYgdHlwZSA9PSBcIihcIikge1xuICAgICAgICByZXR1cm4gcHVzaENvbnRleHQoc3RhdGUsIHN0cmVhbSwgXCJwYXJlbnNcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGF0ZS5jb250ZXh0LnR5cGU7XG4gICAgfTtcblxuICAgIHN0YXRlcy5ibG9jayA9IGZ1bmN0aW9uICh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgICB2YXIgd29yZCA9IHN0cmVhbS5jdXJyZW50KCkudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBpZiAocHJvcGVydHlLZXl3b3Jkcy5oYXNPd25Qcm9wZXJ0eSh3b3JkKSkge1xuICAgICAgICAgIG92ZXJyaWRlID0gXCJwcm9wZXJ0eVwiO1xuICAgICAgICAgIHJldHVybiBcIm1heWJlcHJvcFwiO1xuICAgICAgICB9IGVsc2UgaWYgKG5vblN0YW5kYXJkUHJvcGVydHlLZXl3b3Jkcy5oYXNPd25Qcm9wZXJ0eSh3b3JkKSkge1xuICAgICAgICAgIG92ZXJyaWRlID0gXCJzdHJpbmctMlwiO1xuICAgICAgICAgIHJldHVybiBcIm1heWJlcHJvcFwiO1xuICAgICAgICB9IGVsc2UgaWYgKGFsbG93TmVzdGVkKSB7XG4gICAgICAgICAgb3ZlcnJpZGUgPSBzdHJlYW0ubWF0Y2goL15cXHMqOig/Olxcc3wkKS8sIGZhbHNlKSA/IFwicHJvcGVydHlcIiA6IFwidGFnXCI7XG4gICAgICAgICAgcmV0dXJuIFwiYmxvY2tcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvdmVycmlkZSArPSBcIiBlcnJvclwiO1xuICAgICAgICAgIHJldHVybiBcIm1heWJlcHJvcFwiO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJtZXRhXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiYmxvY2tcIjtcbiAgICAgIH0gZWxzZSBpZiAoIWFsbG93TmVzdGVkICYmICh0eXBlID09IFwiaGFzaFwiIHx8IHR5cGUgPT0gXCJxdWFsaWZpZXJcIikpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBcImVycm9yXCI7XG4gICAgICAgIHJldHVybiBcImJsb2NrXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc3RhdGVzLnRvcCh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc3RhdGVzLm1heWJlcHJvcCA9IGZ1bmN0aW9uICh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcIjpcIikgcmV0dXJuIHB1c2hDb250ZXh0KHN0YXRlLCBzdHJlYW0sIFwicHJvcFwiKTtcbiAgICAgIHJldHVybiBwYXNzKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH07XG5cbiAgICBzdGF0ZXMucHJvcCA9IGZ1bmN0aW9uICh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcIjtcIikgcmV0dXJuIHBvcENvbnRleHQoc3RhdGUpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJ7XCIgJiYgYWxsb3dOZXN0ZWQpIHJldHVybiBwdXNoQ29udGV4dChzdGF0ZSwgc3RyZWFtLCBcInByb3BCbG9ja1wiKTtcbiAgICAgIGlmICh0eXBlID09IFwifVwiIHx8IHR5cGUgPT0gXCJ7XCIpIHJldHVybiBwb3BBbmRQYXNzKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgICAgaWYgKHR5cGUgPT0gXCIoXCIpIHJldHVybiBwdXNoQ29udGV4dChzdGF0ZSwgc3RyZWFtLCBcInBhcmVuc1wiKTtcblxuICAgICAgaWYgKHR5cGUgPT0gXCJoYXNoXCIgJiYgIS9eIyhbMC05YS1mQS1mXXszLDR9fFswLTlhLWZBLWZdezZ9fFswLTlhLWZBLWZdezh9KSQvLnRlc3Qoc3RyZWFtLmN1cnJlbnQoKSkpIHtcbiAgICAgICAgb3ZlcnJpZGUgKz0gXCIgZXJyb3JcIjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgICB3b3JkQXNWYWx1ZShzdHJlYW0pO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiaW50ZXJwb2xhdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBwdXNoQ29udGV4dChzdGF0ZSwgc3RyZWFtLCBcImludGVycG9sYXRpb25cIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBcInByb3BcIjtcbiAgICB9O1xuXG4gICAgc3RhdGVzLnByb3BCbG9jayA9IGZ1bmN0aW9uICh0eXBlLCBfc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCJ9XCIpIHJldHVybiBwb3BDb250ZXh0KHN0YXRlKTtcblxuICAgICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBcInByb3BlcnR5XCI7XG4gICAgICAgIHJldHVybiBcIm1heWJlcHJvcFwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RhdGUuY29udGV4dC50eXBlO1xuICAgIH07XG5cbiAgICBzdGF0ZXMucGFyZW5zID0gZnVuY3Rpb24gKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmICh0eXBlID09IFwie1wiIHx8IHR5cGUgPT0gXCJ9XCIpIHJldHVybiBwb3BBbmRQYXNzKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgICAgaWYgKHR5cGUgPT0gXCIpXCIpIHJldHVybiBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICAgIGlmICh0eXBlID09IFwiKFwiKSByZXR1cm4gcHVzaENvbnRleHQoc3RhdGUsIHN0cmVhbSwgXCJwYXJlbnNcIik7XG4gICAgICBpZiAodHlwZSA9PSBcImludGVycG9sYXRpb25cIikgcmV0dXJuIHB1c2hDb250ZXh0KHN0YXRlLCBzdHJlYW0sIFwiaW50ZXJwb2xhdGlvblwiKTtcbiAgICAgIGlmICh0eXBlID09IFwid29yZFwiKSB3b3JkQXNWYWx1ZShzdHJlYW0pO1xuICAgICAgcmV0dXJuIFwicGFyZW5zXCI7XG4gICAgfTtcblxuICAgIHN0YXRlcy5wc2V1ZG8gPSBmdW5jdGlvbiAodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBcInZhcmlhYmxlLTNcIjtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmNvbnRleHQudHlwZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhc3ModHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgfTtcblxuICAgIHN0YXRlcy5kb2N1bWVudFR5cGVzID0gZnVuY3Rpb24gKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmICh0eXBlID09IFwid29yZFwiICYmIGRvY3VtZW50VHlwZXMuaGFzT3duUHJvcGVydHkoc3RyZWFtLmN1cnJlbnQoKSkpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBcInRhZ1wiO1xuICAgICAgICByZXR1cm4gc3RhdGUuY29udGV4dC50eXBlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlcy5hdEJsb2NrKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzdGF0ZXMuYXRCbG9jayA9IGZ1bmN0aW9uICh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcIihcIikgcmV0dXJuIHB1c2hDb250ZXh0KHN0YXRlLCBzdHJlYW0sIFwiYXRCbG9ja19wYXJlbnNcIik7XG4gICAgICBpZiAodHlwZSA9PSBcIn1cIiB8fCB0eXBlID09IFwiO1wiKSByZXR1cm4gcG9wQW5kUGFzcyh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICAgIGlmICh0eXBlID09IFwie1wiKSByZXR1cm4gcG9wQ29udGV4dChzdGF0ZSkgJiYgcHVzaENvbnRleHQoc3RhdGUsIHN0cmVhbSwgYWxsb3dOZXN0ZWQgPyBcImJsb2NrXCIgOiBcInRvcFwiKTtcbiAgICAgIGlmICh0eXBlID09IFwiaW50ZXJwb2xhdGlvblwiKSByZXR1cm4gcHVzaENvbnRleHQoc3RhdGUsIHN0cmVhbSwgXCJpbnRlcnBvbGF0aW9uXCIpO1xuXG4gICAgICBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgICB2YXIgd29yZCA9IHN0cmVhbS5jdXJyZW50KCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKHdvcmQgPT0gXCJvbmx5XCIgfHwgd29yZCA9PSBcIm5vdFwiIHx8IHdvcmQgPT0gXCJhbmRcIiB8fCB3b3JkID09IFwib3JcIikgb3ZlcnJpZGUgPSBcImtleXdvcmRcIjtlbHNlIGlmIChtZWRpYVR5cGVzLmhhc093blByb3BlcnR5KHdvcmQpKSBvdmVycmlkZSA9IFwiYXR0cmlidXRlXCI7ZWxzZSBpZiAobWVkaWFGZWF0dXJlcy5oYXNPd25Qcm9wZXJ0eSh3b3JkKSkgb3ZlcnJpZGUgPSBcInByb3BlcnR5XCI7ZWxzZSBpZiAobWVkaWFWYWx1ZUtleXdvcmRzLmhhc093blByb3BlcnR5KHdvcmQpKSBvdmVycmlkZSA9IFwia2V5d29yZFwiO2Vsc2UgaWYgKHByb3BlcnR5S2V5d29yZHMuaGFzT3duUHJvcGVydHkod29yZCkpIG92ZXJyaWRlID0gXCJwcm9wZXJ0eVwiO2Vsc2UgaWYgKG5vblN0YW5kYXJkUHJvcGVydHlLZXl3b3Jkcy5oYXNPd25Qcm9wZXJ0eSh3b3JkKSkgb3ZlcnJpZGUgPSBcInN0cmluZy0yXCI7ZWxzZSBpZiAodmFsdWVLZXl3b3Jkcy5oYXNPd25Qcm9wZXJ0eSh3b3JkKSkgb3ZlcnJpZGUgPSBcImF0b21cIjtlbHNlIGlmIChjb2xvcktleXdvcmRzLmhhc093blByb3BlcnR5KHdvcmQpKSBvdmVycmlkZSA9IFwia2V5d29yZFwiO2Vsc2Ugb3ZlcnJpZGUgPSBcImVycm9yXCI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGF0ZS5jb250ZXh0LnR5cGU7XG4gICAgfTtcblxuICAgIHN0YXRlcy5hdENvbXBvbmVudEJsb2NrID0gZnVuY3Rpb24gKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmICh0eXBlID09IFwifVwiKSByZXR1cm4gcG9wQW5kUGFzcyh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICAgIGlmICh0eXBlID09IFwie1wiKSByZXR1cm4gcG9wQ29udGV4dChzdGF0ZSkgJiYgcHVzaENvbnRleHQoc3RhdGUsIHN0cmVhbSwgYWxsb3dOZXN0ZWQgPyBcImJsb2NrXCIgOiBcInRvcFwiLCBmYWxzZSk7XG4gICAgICBpZiAodHlwZSA9PSBcIndvcmRcIikgb3ZlcnJpZGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gc3RhdGUuY29udGV4dC50eXBlO1xuICAgIH07XG5cbiAgICBzdGF0ZXMuYXRCbG9ja19wYXJlbnMgPSBmdW5jdGlvbiAodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCIpXCIpIHJldHVybiBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICAgIGlmICh0eXBlID09IFwie1wiIHx8IHR5cGUgPT0gXCJ9XCIpIHJldHVybiBwb3BBbmRQYXNzKHR5cGUsIHN0cmVhbSwgc3RhdGUsIDIpO1xuICAgICAgcmV0dXJuIHN0YXRlcy5hdEJsb2NrKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH07XG5cbiAgICBzdGF0ZXMucmVzdHJpY3RlZF9hdEJsb2NrX2JlZm9yZSA9IGZ1bmN0aW9uICh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcIntcIikgcmV0dXJuIHB1c2hDb250ZXh0KHN0YXRlLCBzdHJlYW0sIFwicmVzdHJpY3RlZF9hdEJsb2NrXCIpO1xuXG4gICAgICBpZiAodHlwZSA9PSBcIndvcmRcIiAmJiBzdGF0ZS5zdGF0ZUFyZyA9PSBcIkBjb3VudGVyLXN0eWxlXCIpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBcInZhcmlhYmxlXCI7XG4gICAgICAgIHJldHVybiBcInJlc3RyaWN0ZWRfYXRCbG9ja19iZWZvcmVcIjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhc3ModHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgfTtcblxuICAgIHN0YXRlcy5yZXN0cmljdGVkX2F0QmxvY2sgPSBmdW5jdGlvbiAodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCJ9XCIpIHtcbiAgICAgICAgc3RhdGUuc3RhdGVBcmcgPSBudWxsO1xuICAgICAgICByZXR1cm4gcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICAgIGlmIChzdGF0ZS5zdGF0ZUFyZyA9PSBcIkBmb250LWZhY2VcIiAmJiAhZm9udFByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkoc3RyZWFtLmN1cnJlbnQoKS50b0xvd2VyQ2FzZSgpKSB8fCBzdGF0ZS5zdGF0ZUFyZyA9PSBcIkBjb3VudGVyLXN0eWxlXCIgJiYgIWNvdW50ZXJEZXNjcmlwdG9ycy5oYXNPd25Qcm9wZXJ0eShzdHJlYW0uY3VycmVudCgpLnRvTG93ZXJDYXNlKCkpKSBvdmVycmlkZSA9IFwiZXJyb3JcIjtlbHNlIG92ZXJyaWRlID0gXCJwcm9wZXJ0eVwiO1xuICAgICAgICByZXR1cm4gXCJtYXliZXByb3BcIjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFwicmVzdHJpY3RlZF9hdEJsb2NrXCI7XG4gICAgfTtcblxuICAgIHN0YXRlcy5rZXlmcmFtZXMgPSBmdW5jdGlvbiAodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBcInZhcmlhYmxlXCI7XG4gICAgICAgIHJldHVybiBcImtleWZyYW1lc1wiO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZSA9PSBcIntcIikgcmV0dXJuIHB1c2hDb250ZXh0KHN0YXRlLCBzdHJlYW0sIFwidG9wXCIpO1xuICAgICAgcmV0dXJuIHBhc3ModHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgfTtcblxuICAgIHN0YXRlcy5hdCA9IGZ1bmN0aW9uICh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcIjtcIikgcmV0dXJuIHBvcENvbnRleHQoc3RhdGUpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJ7XCIgfHwgdHlwZSA9PSBcIn1cIikgcmV0dXJuIHBvcEFuZFBhc3ModHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgICBpZiAodHlwZSA9PSBcIndvcmRcIikgb3ZlcnJpZGUgPSBcInRhZ1wiO2Vsc2UgaWYgKHR5cGUgPT0gXCJoYXNoXCIpIG92ZXJyaWRlID0gXCJidWlsdGluXCI7XG4gICAgICByZXR1cm4gXCJhdFwiO1xuICAgIH07XG5cbiAgICBzdGF0ZXMuaW50ZXJwb2xhdGlvbiA9IGZ1bmN0aW9uICh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcIn1cIikgcmV0dXJuIHBvcENvbnRleHQoc3RhdGUpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJ7XCIgfHwgdHlwZSA9PSBcIjtcIikgcmV0dXJuIHBvcEFuZFBhc3ModHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgICBpZiAodHlwZSA9PSBcIndvcmRcIikgb3ZlcnJpZGUgPSBcInZhcmlhYmxlXCI7ZWxzZSBpZiAodHlwZSAhPSBcInZhcmlhYmxlXCIgJiYgdHlwZSAhPSBcIihcIiAmJiB0eXBlICE9IFwiKVwiKSBvdmVycmlkZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBcImludGVycG9sYXRpb25cIjtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0U3RhdGU6IGZ1bmN0aW9uIHN0YXJ0U3RhdGUoYmFzZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRva2VuaXplOiBudWxsLFxuICAgICAgICAgIHN0YXRlOiBpbmxpbmUgPyBcImJsb2NrXCIgOiBcInRvcFwiLFxuICAgICAgICAgIHN0YXRlQXJnOiBudWxsLFxuICAgICAgICAgIGNvbnRleHQ6IG5ldyBDb250ZXh0KGlubGluZSA/IFwiYmxvY2tcIiA6IFwidG9wXCIsIGJhc2UgfHwgMCwgbnVsbClcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICB0b2tlbjogZnVuY3Rpb24gdG9rZW4oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgICBpZiAoIXN0YXRlLnRva2VuaXplICYmIHN0cmVhbS5lYXRTcGFjZSgpKSByZXR1cm4gbnVsbDtcbiAgICAgICAgdmFyIHN0eWxlID0gKHN0YXRlLnRva2VuaXplIHx8IHRva2VuQmFzZSkoc3RyZWFtLCBzdGF0ZSk7XG5cbiAgICAgICAgaWYgKHN0eWxlICYmIF90eXBlb2Yoc3R5bGUpID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICB0eXBlID0gc3R5bGVbMV07XG4gICAgICAgICAgc3R5bGUgPSBzdHlsZVswXTtcbiAgICAgICAgfVxuXG4gICAgICAgIG92ZXJyaWRlID0gc3R5bGU7XG4gICAgICAgIHN0YXRlLnN0YXRlID0gc3RhdGVzW3N0YXRlLnN0YXRlXSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICAgICAgcmV0dXJuIG92ZXJyaWRlO1xuICAgICAgfSxcbiAgICAgIGluZGVudDogZnVuY3Rpb24gaW5kZW50KHN0YXRlLCB0ZXh0QWZ0ZXIpIHtcbiAgICAgICAgdmFyIGN4ID0gc3RhdGUuY29udGV4dCxcbiAgICAgICAgICAgIGNoID0gdGV4dEFmdGVyICYmIHRleHRBZnRlci5jaGFyQXQoMCk7XG4gICAgICAgIHZhciBpbmRlbnQgPSBjeC5pbmRlbnQ7XG4gICAgICAgIGlmIChjeC50eXBlID09IFwicHJvcFwiICYmIChjaCA9PSBcIn1cIiB8fCBjaCA9PSBcIilcIikpIGN4ID0gY3gucHJldjtcblxuICAgICAgICBpZiAoY3gucHJldikge1xuICAgICAgICAgIGlmIChjaCA9PSBcIn1cIiAmJiAoY3gudHlwZSA9PSBcImJsb2NrXCIgfHwgY3gudHlwZSA9PSBcInRvcFwiIHx8IGN4LnR5cGUgPT0gXCJpbnRlcnBvbGF0aW9uXCIgfHwgY3gudHlwZSA9PSBcInJlc3RyaWN0ZWRfYXRCbG9ja1wiKSkge1xuICAgICAgICAgICAgLy8gUmVzdW1lIGluZGVudGF0aW9uIGZyb20gcGFyZW50IGNvbnRleHQuXG4gICAgICAgICAgICBjeCA9IGN4LnByZXY7XG4gICAgICAgICAgICBpbmRlbnQgPSBjeC5pbmRlbnQ7XG4gICAgICAgICAgfSBlbHNlIGlmIChjaCA9PSBcIilcIiAmJiAoY3gudHlwZSA9PSBcInBhcmVuc1wiIHx8IGN4LnR5cGUgPT0gXCJhdEJsb2NrX3BhcmVuc1wiKSB8fCBjaCA9PSBcIntcIiAmJiAoY3gudHlwZSA9PSBcImF0XCIgfHwgY3gudHlwZSA9PSBcImF0QmxvY2tcIikpIHtcbiAgICAgICAgICAgIC8vIERlZGVudCByZWxhdGl2ZSB0byBjdXJyZW50IGNvbnRleHQuXG4gICAgICAgICAgICBpbmRlbnQgPSBNYXRoLm1heCgwLCBjeC5pbmRlbnQgLSBpbmRlbnRVbml0KTtcbiAgICAgICAgICAgIGN4ID0gY3gucHJldjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5kZW50O1xuICAgICAgfSxcbiAgICAgIGVsZWN0cmljQ2hhcnM6IFwifVwiLFxuICAgICAgYmxvY2tDb21tZW50U3RhcnQ6IFwiLypcIixcbiAgICAgIGJsb2NrQ29tbWVudEVuZDogXCIqL1wiLFxuICAgICAgZm9sZDogXCJicmFjZVwiXG4gICAgfTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24ga2V5U2V0KGFycmF5KSB7XG4gICAgdmFyIGtleXMgPSB7fTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyArK2kpIHtcbiAgICAgIGtleXNbYXJyYXlbaV0udG9Mb3dlckNhc2UoKV0gPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBrZXlzO1xuICB9XG5cbiAgdmFyIGRvY3VtZW50VHlwZXNfID0gW1wiZG9tYWluXCIsIFwicmVnZXhwXCIsIFwidXJsXCIsIFwidXJsLXByZWZpeFwiXSxcbiAgICAgIGRvY3VtZW50VHlwZXMgPSBrZXlTZXQoZG9jdW1lbnRUeXBlc18pO1xuICB2YXIgbWVkaWFUeXBlc18gPSBbXCJhbGxcIiwgXCJhdXJhbFwiLCBcImJyYWlsbGVcIiwgXCJoYW5kaGVsZFwiLCBcInByaW50XCIsIFwicHJvamVjdGlvblwiLCBcInNjcmVlblwiLCBcInR0eVwiLCBcInR2XCIsIFwiZW1ib3NzZWRcIl0sXG4gICAgICBtZWRpYVR5cGVzID0ga2V5U2V0KG1lZGlhVHlwZXNfKTtcbiAgdmFyIG1lZGlhRmVhdHVyZXNfID0gW1wid2lkdGhcIiwgXCJtaW4td2lkdGhcIiwgXCJtYXgtd2lkdGhcIiwgXCJoZWlnaHRcIiwgXCJtaW4taGVpZ2h0XCIsIFwibWF4LWhlaWdodFwiLCBcImRldmljZS13aWR0aFwiLCBcIm1pbi1kZXZpY2Utd2lkdGhcIiwgXCJtYXgtZGV2aWNlLXdpZHRoXCIsIFwiZGV2aWNlLWhlaWdodFwiLCBcIm1pbi1kZXZpY2UtaGVpZ2h0XCIsIFwibWF4LWRldmljZS1oZWlnaHRcIiwgXCJhc3BlY3QtcmF0aW9cIiwgXCJtaW4tYXNwZWN0LXJhdGlvXCIsIFwibWF4LWFzcGVjdC1yYXRpb1wiLCBcImRldmljZS1hc3BlY3QtcmF0aW9cIiwgXCJtaW4tZGV2aWNlLWFzcGVjdC1yYXRpb1wiLCBcIm1heC1kZXZpY2UtYXNwZWN0LXJhdGlvXCIsIFwiY29sb3JcIiwgXCJtaW4tY29sb3JcIiwgXCJtYXgtY29sb3JcIiwgXCJjb2xvci1pbmRleFwiLCBcIm1pbi1jb2xvci1pbmRleFwiLCBcIm1heC1jb2xvci1pbmRleFwiLCBcIm1vbm9jaHJvbWVcIiwgXCJtaW4tbW9ub2Nocm9tZVwiLCBcIm1heC1tb25vY2hyb21lXCIsIFwicmVzb2x1dGlvblwiLCBcIm1pbi1yZXNvbHV0aW9uXCIsIFwibWF4LXJlc29sdXRpb25cIiwgXCJzY2FuXCIsIFwiZ3JpZFwiLCBcIm9yaWVudGF0aW9uXCIsIFwiZGV2aWNlLXBpeGVsLXJhdGlvXCIsIFwibWluLWRldmljZS1waXhlbC1yYXRpb1wiLCBcIm1heC1kZXZpY2UtcGl4ZWwtcmF0aW9cIiwgXCJwb2ludGVyXCIsIFwiYW55LXBvaW50ZXJcIiwgXCJob3ZlclwiLCBcImFueS1ob3ZlclwiXSxcbiAgICAgIG1lZGlhRmVhdHVyZXMgPSBrZXlTZXQobWVkaWFGZWF0dXJlc18pO1xuICB2YXIgbWVkaWFWYWx1ZUtleXdvcmRzXyA9IFtcImxhbmRzY2FwZVwiLCBcInBvcnRyYWl0XCIsIFwibm9uZVwiLCBcImNvYXJzZVwiLCBcImZpbmVcIiwgXCJvbi1kZW1hbmRcIiwgXCJob3ZlclwiLCBcImludGVybGFjZVwiLCBcInByb2dyZXNzaXZlXCJdLFxuICAgICAgbWVkaWFWYWx1ZUtleXdvcmRzID0ga2V5U2V0KG1lZGlhVmFsdWVLZXl3b3Jkc18pO1xuICB2YXIgcHJvcGVydHlLZXl3b3Jkc18gPSBbXCJhbGlnbi1jb250ZW50XCIsIFwiYWxpZ24taXRlbXNcIiwgXCJhbGlnbi1zZWxmXCIsIFwiYWxpZ25tZW50LWFkanVzdFwiLCBcImFsaWdubWVudC1iYXNlbGluZVwiLCBcImFuY2hvci1wb2ludFwiLCBcImFuaW1hdGlvblwiLCBcImFuaW1hdGlvbi1kZWxheVwiLCBcImFuaW1hdGlvbi1kaXJlY3Rpb25cIiwgXCJhbmltYXRpb24tZHVyYXRpb25cIiwgXCJhbmltYXRpb24tZmlsbC1tb2RlXCIsIFwiYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudFwiLCBcImFuaW1hdGlvbi1uYW1lXCIsIFwiYW5pbWF0aW9uLXBsYXktc3RhdGVcIiwgXCJhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uXCIsIFwiYXBwZWFyYW5jZVwiLCBcImF6aW11dGhcIiwgXCJiYWNrZmFjZS12aXNpYmlsaXR5XCIsIFwiYmFja2dyb3VuZFwiLCBcImJhY2tncm91bmQtYXR0YWNobWVudFwiLCBcImJhY2tncm91bmQtYmxlbmQtbW9kZVwiLCBcImJhY2tncm91bmQtY2xpcFwiLCBcImJhY2tncm91bmQtY29sb3JcIiwgXCJiYWNrZ3JvdW5kLWltYWdlXCIsIFwiYmFja2dyb3VuZC1vcmlnaW5cIiwgXCJiYWNrZ3JvdW5kLXBvc2l0aW9uXCIsIFwiYmFja2dyb3VuZC1yZXBlYXRcIiwgXCJiYWNrZ3JvdW5kLXNpemVcIiwgXCJiYXNlbGluZS1zaGlmdFwiLCBcImJpbmRpbmdcIiwgXCJibGVlZFwiLCBcImJvb2ttYXJrLWxhYmVsXCIsIFwiYm9va21hcmstbGV2ZWxcIiwgXCJib29rbWFyay1zdGF0ZVwiLCBcImJvb2ttYXJrLXRhcmdldFwiLCBcImJvcmRlclwiLCBcImJvcmRlci1ib3R0b21cIiwgXCJib3JkZXItYm90dG9tLWNvbG9yXCIsIFwiYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1c1wiLCBcImJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzXCIsIFwiYm9yZGVyLWJvdHRvbS1zdHlsZVwiLCBcImJvcmRlci1ib3R0b20td2lkdGhcIiwgXCJib3JkZXItY29sbGFwc2VcIiwgXCJib3JkZXItY29sb3JcIiwgXCJib3JkZXItaW1hZ2VcIiwgXCJib3JkZXItaW1hZ2Utb3V0c2V0XCIsIFwiYm9yZGVyLWltYWdlLXJlcGVhdFwiLCBcImJvcmRlci1pbWFnZS1zbGljZVwiLCBcImJvcmRlci1pbWFnZS1zb3VyY2VcIiwgXCJib3JkZXItaW1hZ2Utd2lkdGhcIiwgXCJib3JkZXItbGVmdFwiLCBcImJvcmRlci1sZWZ0LWNvbG9yXCIsIFwiYm9yZGVyLWxlZnQtc3R5bGVcIiwgXCJib3JkZXItbGVmdC13aWR0aFwiLCBcImJvcmRlci1yYWRpdXNcIiwgXCJib3JkZXItcmlnaHRcIiwgXCJib3JkZXItcmlnaHQtY29sb3JcIiwgXCJib3JkZXItcmlnaHQtc3R5bGVcIiwgXCJib3JkZXItcmlnaHQtd2lkdGhcIiwgXCJib3JkZXItc3BhY2luZ1wiLCBcImJvcmRlci1zdHlsZVwiLCBcImJvcmRlci10b3BcIiwgXCJib3JkZXItdG9wLWNvbG9yXCIsIFwiYm9yZGVyLXRvcC1sZWZ0LXJhZGl1c1wiLCBcImJvcmRlci10b3AtcmlnaHQtcmFkaXVzXCIsIFwiYm9yZGVyLXRvcC1zdHlsZVwiLCBcImJvcmRlci10b3Atd2lkdGhcIiwgXCJib3JkZXItd2lkdGhcIiwgXCJib3R0b21cIiwgXCJib3gtZGVjb3JhdGlvbi1icmVha1wiLCBcImJveC1zaGFkb3dcIiwgXCJib3gtc2l6aW5nXCIsIFwiYnJlYWstYWZ0ZXJcIiwgXCJicmVhay1iZWZvcmVcIiwgXCJicmVhay1pbnNpZGVcIiwgXCJjYXB0aW9uLXNpZGVcIiwgXCJjbGVhclwiLCBcImNsaXBcIiwgXCJjb2xvclwiLCBcImNvbG9yLXByb2ZpbGVcIiwgXCJjb2x1bW4tY291bnRcIiwgXCJjb2x1bW4tZmlsbFwiLCBcImNvbHVtbi1nYXBcIiwgXCJjb2x1bW4tcnVsZVwiLCBcImNvbHVtbi1ydWxlLWNvbG9yXCIsIFwiY29sdW1uLXJ1bGUtc3R5bGVcIiwgXCJjb2x1bW4tcnVsZS13aWR0aFwiLCBcImNvbHVtbi1zcGFuXCIsIFwiY29sdW1uLXdpZHRoXCIsIFwiY29sdW1uc1wiLCBcImNvbnRlbnRcIiwgXCJjb3VudGVyLWluY3JlbWVudFwiLCBcImNvdW50ZXItcmVzZXRcIiwgXCJjcm9wXCIsIFwiY3VlXCIsIFwiY3VlLWFmdGVyXCIsIFwiY3VlLWJlZm9yZVwiLCBcImN1cnNvclwiLCBcImRpcmVjdGlvblwiLCBcImRpc3BsYXlcIiwgXCJkb21pbmFudC1iYXNlbGluZVwiLCBcImRyb3AtaW5pdGlhbC1hZnRlci1hZGp1c3RcIiwgXCJkcm9wLWluaXRpYWwtYWZ0ZXItYWxpZ25cIiwgXCJkcm9wLWluaXRpYWwtYmVmb3JlLWFkanVzdFwiLCBcImRyb3AtaW5pdGlhbC1iZWZvcmUtYWxpZ25cIiwgXCJkcm9wLWluaXRpYWwtc2l6ZVwiLCBcImRyb3AtaW5pdGlhbC12YWx1ZVwiLCBcImVsZXZhdGlvblwiLCBcImVtcHR5LWNlbGxzXCIsIFwiZml0XCIsIFwiZml0LXBvc2l0aW9uXCIsIFwiZmxleFwiLCBcImZsZXgtYmFzaXNcIiwgXCJmbGV4LWRpcmVjdGlvblwiLCBcImZsZXgtZmxvd1wiLCBcImZsZXgtZ3Jvd1wiLCBcImZsZXgtc2hyaW5rXCIsIFwiZmxleC13cmFwXCIsIFwiZmxvYXRcIiwgXCJmbG9hdC1vZmZzZXRcIiwgXCJmbG93LWZyb21cIiwgXCJmbG93LWludG9cIiwgXCJmb250XCIsIFwiZm9udC1mZWF0dXJlLXNldHRpbmdzXCIsIFwiZm9udC1mYW1pbHlcIiwgXCJmb250LWtlcm5pbmdcIiwgXCJmb250LWxhbmd1YWdlLW92ZXJyaWRlXCIsIFwiZm9udC1zaXplXCIsIFwiZm9udC1zaXplLWFkanVzdFwiLCBcImZvbnQtc3RyZXRjaFwiLCBcImZvbnQtc3R5bGVcIiwgXCJmb250LXN5bnRoZXNpc1wiLCBcImZvbnQtdmFyaWFudFwiLCBcImZvbnQtdmFyaWFudC1hbHRlcm5hdGVzXCIsIFwiZm9udC12YXJpYW50LWNhcHNcIiwgXCJmb250LXZhcmlhbnQtZWFzdC1hc2lhblwiLCBcImZvbnQtdmFyaWFudC1saWdhdHVyZXNcIiwgXCJmb250LXZhcmlhbnQtbnVtZXJpY1wiLCBcImZvbnQtdmFyaWFudC1wb3NpdGlvblwiLCBcImZvbnQtd2VpZ2h0XCIsIFwiZ3JpZFwiLCBcImdyaWQtYXJlYVwiLCBcImdyaWQtYXV0by1jb2x1bW5zXCIsIFwiZ3JpZC1hdXRvLWZsb3dcIiwgXCJncmlkLWF1dG8tcm93c1wiLCBcImdyaWQtY29sdW1uXCIsIFwiZ3JpZC1jb2x1bW4tZW5kXCIsIFwiZ3JpZC1jb2x1bW4tZ2FwXCIsIFwiZ3JpZC1jb2x1bW4tc3RhcnRcIiwgXCJncmlkLWdhcFwiLCBcImdyaWQtcm93XCIsIFwiZ3JpZC1yb3ctZW5kXCIsIFwiZ3JpZC1yb3ctZ2FwXCIsIFwiZ3JpZC1yb3ctc3RhcnRcIiwgXCJncmlkLXRlbXBsYXRlXCIsIFwiZ3JpZC10ZW1wbGF0ZS1hcmVhc1wiLCBcImdyaWQtdGVtcGxhdGUtY29sdW1uc1wiLCBcImdyaWQtdGVtcGxhdGUtcm93c1wiLCBcImhhbmdpbmctcHVuY3R1YXRpb25cIiwgXCJoZWlnaHRcIiwgXCJoeXBoZW5zXCIsIFwiaWNvblwiLCBcImltYWdlLW9yaWVudGF0aW9uXCIsIFwiaW1hZ2UtcmVuZGVyaW5nXCIsIFwiaW1hZ2UtcmVzb2x1dGlvblwiLCBcImlubGluZS1ib3gtYWxpZ25cIiwgXCJqdXN0aWZ5LWNvbnRlbnRcIiwgXCJsZWZ0XCIsIFwibGV0dGVyLXNwYWNpbmdcIiwgXCJsaW5lLWJyZWFrXCIsIFwibGluZS1oZWlnaHRcIiwgXCJsaW5lLXN0YWNraW5nXCIsIFwibGluZS1zdGFja2luZy1ydWJ5XCIsIFwibGluZS1zdGFja2luZy1zaGlmdFwiLCBcImxpbmUtc3RhY2tpbmctc3RyYXRlZ3lcIiwgXCJsaXN0LXN0eWxlXCIsIFwibGlzdC1zdHlsZS1pbWFnZVwiLCBcImxpc3Qtc3R5bGUtcG9zaXRpb25cIiwgXCJsaXN0LXN0eWxlLXR5cGVcIiwgXCJtYXJnaW5cIiwgXCJtYXJnaW4tYm90dG9tXCIsIFwibWFyZ2luLWxlZnRcIiwgXCJtYXJnaW4tcmlnaHRcIiwgXCJtYXJnaW4tdG9wXCIsIFwibWFya3NcIiwgXCJtYXJxdWVlLWRpcmVjdGlvblwiLCBcIm1hcnF1ZWUtbG9vcFwiLCBcIm1hcnF1ZWUtcGxheS1jb3VudFwiLCBcIm1hcnF1ZWUtc3BlZWRcIiwgXCJtYXJxdWVlLXN0eWxlXCIsIFwibWF4LWhlaWdodFwiLCBcIm1heC13aWR0aFwiLCBcIm1pbi1oZWlnaHRcIiwgXCJtaW4td2lkdGhcIiwgXCJtb3ZlLXRvXCIsIFwibmF2LWRvd25cIiwgXCJuYXYtaW5kZXhcIiwgXCJuYXYtbGVmdFwiLCBcIm5hdi1yaWdodFwiLCBcIm5hdi11cFwiLCBcIm9iamVjdC1maXRcIiwgXCJvYmplY3QtcG9zaXRpb25cIiwgXCJvcGFjaXR5XCIsIFwib3JkZXJcIiwgXCJvcnBoYW5zXCIsIFwib3V0bGluZVwiLCBcIm91dGxpbmUtY29sb3JcIiwgXCJvdXRsaW5lLW9mZnNldFwiLCBcIm91dGxpbmUtc3R5bGVcIiwgXCJvdXRsaW5lLXdpZHRoXCIsIFwib3ZlcmZsb3dcIiwgXCJvdmVyZmxvdy1zdHlsZVwiLCBcIm92ZXJmbG93LXdyYXBcIiwgXCJvdmVyZmxvdy14XCIsIFwib3ZlcmZsb3cteVwiLCBcInBhZGRpbmdcIiwgXCJwYWRkaW5nLWJvdHRvbVwiLCBcInBhZGRpbmctbGVmdFwiLCBcInBhZGRpbmctcmlnaHRcIiwgXCJwYWRkaW5nLXRvcFwiLCBcInBhZ2VcIiwgXCJwYWdlLWJyZWFrLWFmdGVyXCIsIFwicGFnZS1icmVhay1iZWZvcmVcIiwgXCJwYWdlLWJyZWFrLWluc2lkZVwiLCBcInBhZ2UtcG9saWN5XCIsIFwicGF1c2VcIiwgXCJwYXVzZS1hZnRlclwiLCBcInBhdXNlLWJlZm9yZVwiLCBcInBlcnNwZWN0aXZlXCIsIFwicGVyc3BlY3RpdmUtb3JpZ2luXCIsIFwicGl0Y2hcIiwgXCJwaXRjaC1yYW5nZVwiLCBcInBsYXktZHVyaW5nXCIsIFwicG9zaXRpb25cIiwgXCJwcmVzZW50YXRpb24tbGV2ZWxcIiwgXCJwdW5jdHVhdGlvbi10cmltXCIsIFwicXVvdGVzXCIsIFwicmVnaW9uLWJyZWFrLWFmdGVyXCIsIFwicmVnaW9uLWJyZWFrLWJlZm9yZVwiLCBcInJlZ2lvbi1icmVhay1pbnNpZGVcIiwgXCJyZWdpb24tZnJhZ21lbnRcIiwgXCJyZW5kZXJpbmctaW50ZW50XCIsIFwicmVzaXplXCIsIFwicmVzdFwiLCBcInJlc3QtYWZ0ZXJcIiwgXCJyZXN0LWJlZm9yZVwiLCBcInJpY2huZXNzXCIsIFwicmlnaHRcIiwgXCJyb3RhdGlvblwiLCBcInJvdGF0aW9uLXBvaW50XCIsIFwicnVieS1hbGlnblwiLCBcInJ1Ynktb3ZlcmhhbmdcIiwgXCJydWJ5LXBvc2l0aW9uXCIsIFwicnVieS1zcGFuXCIsIFwic2hhcGUtaW1hZ2UtdGhyZXNob2xkXCIsIFwic2hhcGUtaW5zaWRlXCIsIFwic2hhcGUtbWFyZ2luXCIsIFwic2hhcGUtb3V0c2lkZVwiLCBcInNpemVcIiwgXCJzcGVha1wiLCBcInNwZWFrLWFzXCIsIFwic3BlYWstaGVhZGVyXCIsIFwic3BlYWstbnVtZXJhbFwiLCBcInNwZWFrLXB1bmN0dWF0aW9uXCIsIFwic3BlZWNoLXJhdGVcIiwgXCJzdHJlc3NcIiwgXCJzdHJpbmctc2V0XCIsIFwidGFiLXNpemVcIiwgXCJ0YWJsZS1sYXlvdXRcIiwgXCJ0YXJnZXRcIiwgXCJ0YXJnZXQtbmFtZVwiLCBcInRhcmdldC1uZXdcIiwgXCJ0YXJnZXQtcG9zaXRpb25cIiwgXCJ0ZXh0LWFsaWduXCIsIFwidGV4dC1hbGlnbi1sYXN0XCIsIFwidGV4dC1kZWNvcmF0aW9uXCIsIFwidGV4dC1kZWNvcmF0aW9uLWNvbG9yXCIsIFwidGV4dC1kZWNvcmF0aW9uLWxpbmVcIiwgXCJ0ZXh0LWRlY29yYXRpb24tc2tpcFwiLCBcInRleHQtZGVjb3JhdGlvbi1zdHlsZVwiLCBcInRleHQtZW1waGFzaXNcIiwgXCJ0ZXh0LWVtcGhhc2lzLWNvbG9yXCIsIFwidGV4dC1lbXBoYXNpcy1wb3NpdGlvblwiLCBcInRleHQtZW1waGFzaXMtc3R5bGVcIiwgXCJ0ZXh0LWhlaWdodFwiLCBcInRleHQtaW5kZW50XCIsIFwidGV4dC1qdXN0aWZ5XCIsIFwidGV4dC1vdXRsaW5lXCIsIFwidGV4dC1vdmVyZmxvd1wiLCBcInRleHQtc2hhZG93XCIsIFwidGV4dC1zaXplLWFkanVzdFwiLCBcInRleHQtc3BhY2UtY29sbGFwc2VcIiwgXCJ0ZXh0LXRyYW5zZm9ybVwiLCBcInRleHQtdW5kZXJsaW5lLXBvc2l0aW9uXCIsIFwidGV4dC13cmFwXCIsIFwidG9wXCIsIFwidHJhbnNmb3JtXCIsIFwidHJhbnNmb3JtLW9yaWdpblwiLCBcInRyYW5zZm9ybS1zdHlsZVwiLCBcInRyYW5zaXRpb25cIiwgXCJ0cmFuc2l0aW9uLWRlbGF5XCIsIFwidHJhbnNpdGlvbi1kdXJhdGlvblwiLCBcInRyYW5zaXRpb24tcHJvcGVydHlcIiwgXCJ0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvblwiLCBcInVuaWNvZGUtYmlkaVwiLCBcInVzZXItc2VsZWN0XCIsIFwidmVydGljYWwtYWxpZ25cIiwgXCJ2aXNpYmlsaXR5XCIsIFwidm9pY2UtYmFsYW5jZVwiLCBcInZvaWNlLWR1cmF0aW9uXCIsIFwidm9pY2UtZmFtaWx5XCIsIFwidm9pY2UtcGl0Y2hcIiwgXCJ2b2ljZS1yYW5nZVwiLCBcInZvaWNlLXJhdGVcIiwgXCJ2b2ljZS1zdHJlc3NcIiwgXCJ2b2ljZS12b2x1bWVcIiwgXCJ2b2x1bWVcIiwgXCJ3aGl0ZS1zcGFjZVwiLCBcIndpZG93c1wiLCBcIndpZHRoXCIsIFwid2lsbC1jaGFuZ2VcIiwgXCJ3b3JkLWJyZWFrXCIsIFwid29yZC1zcGFjaW5nXCIsIFwid29yZC13cmFwXCIsIFwiei1pbmRleFwiLCAvLyBTVkctc3BlY2lmaWNcbiAgXCJjbGlwLXBhdGhcIiwgXCJjbGlwLXJ1bGVcIiwgXCJtYXNrXCIsIFwiZW5hYmxlLWJhY2tncm91bmRcIiwgXCJmaWx0ZXJcIiwgXCJmbG9vZC1jb2xvclwiLCBcImZsb29kLW9wYWNpdHlcIiwgXCJsaWdodGluZy1jb2xvclwiLCBcInN0b3AtY29sb3JcIiwgXCJzdG9wLW9wYWNpdHlcIiwgXCJwb2ludGVyLWV2ZW50c1wiLCBcImNvbG9yLWludGVycG9sYXRpb25cIiwgXCJjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnNcIiwgXCJjb2xvci1yZW5kZXJpbmdcIiwgXCJmaWxsXCIsIFwiZmlsbC1vcGFjaXR5XCIsIFwiZmlsbC1ydWxlXCIsIFwiaW1hZ2UtcmVuZGVyaW5nXCIsIFwibWFya2VyXCIsIFwibWFya2VyLWVuZFwiLCBcIm1hcmtlci1taWRcIiwgXCJtYXJrZXItc3RhcnRcIiwgXCJzaGFwZS1yZW5kZXJpbmdcIiwgXCJzdHJva2VcIiwgXCJzdHJva2UtZGFzaGFycmF5XCIsIFwic3Ryb2tlLWRhc2hvZmZzZXRcIiwgXCJzdHJva2UtbGluZWNhcFwiLCBcInN0cm9rZS1saW5lam9pblwiLCBcInN0cm9rZS1taXRlcmxpbWl0XCIsIFwic3Ryb2tlLW9wYWNpdHlcIiwgXCJzdHJva2Utd2lkdGhcIiwgXCJ0ZXh0LXJlbmRlcmluZ1wiLCBcImJhc2VsaW5lLXNoaWZ0XCIsIFwiZG9taW5hbnQtYmFzZWxpbmVcIiwgXCJnbHlwaC1vcmllbnRhdGlvbi1ob3Jpem9udGFsXCIsIFwiZ2x5cGgtb3JpZW50YXRpb24tdmVydGljYWxcIiwgXCJ0ZXh0LWFuY2hvclwiLCBcIndyaXRpbmctbW9kZVwiXSxcbiAgICAgIHByb3BlcnR5S2V5d29yZHMgPSBrZXlTZXQocHJvcGVydHlLZXl3b3Jkc18pO1xuICB2YXIgbm9uU3RhbmRhcmRQcm9wZXJ0eUtleXdvcmRzXyA9IFtcInNjcm9sbGJhci1hcnJvdy1jb2xvclwiLCBcInNjcm9sbGJhci1iYXNlLWNvbG9yXCIsIFwic2Nyb2xsYmFyLWRhcmstc2hhZG93LWNvbG9yXCIsIFwic2Nyb2xsYmFyLWZhY2UtY29sb3JcIiwgXCJzY3JvbGxiYXItaGlnaGxpZ2h0LWNvbG9yXCIsIFwic2Nyb2xsYmFyLXNoYWRvdy1jb2xvclwiLCBcInNjcm9sbGJhci0zZC1saWdodC1jb2xvclwiLCBcInNjcm9sbGJhci10cmFjay1jb2xvclwiLCBcInNoYXBlLWluc2lkZVwiLCBcInNlYXJjaGZpZWxkLWNhbmNlbC1idXR0b25cIiwgXCJzZWFyY2hmaWVsZC1kZWNvcmF0aW9uXCIsIFwic2VhcmNoZmllbGQtcmVzdWx0cy1idXR0b25cIiwgXCJzZWFyY2hmaWVsZC1yZXN1bHRzLWRlY29yYXRpb25cIiwgXCJ6b29tXCJdLFxuICAgICAgbm9uU3RhbmRhcmRQcm9wZXJ0eUtleXdvcmRzID0ga2V5U2V0KG5vblN0YW5kYXJkUHJvcGVydHlLZXl3b3Jkc18pO1xuICB2YXIgZm9udFByb3BlcnRpZXNfID0gW1wiZm9udC1mYW1pbHlcIiwgXCJzcmNcIiwgXCJ1bmljb2RlLXJhbmdlXCIsIFwiZm9udC12YXJpYW50XCIsIFwiZm9udC1mZWF0dXJlLXNldHRpbmdzXCIsIFwiZm9udC1zdHJldGNoXCIsIFwiZm9udC13ZWlnaHRcIiwgXCJmb250LXN0eWxlXCJdLFxuICAgICAgZm9udFByb3BlcnRpZXMgPSBrZXlTZXQoZm9udFByb3BlcnRpZXNfKTtcbiAgdmFyIGNvdW50ZXJEZXNjcmlwdG9yc18gPSBbXCJhZGRpdGl2ZS1zeW1ib2xzXCIsIFwiZmFsbGJhY2tcIiwgXCJuZWdhdGl2ZVwiLCBcInBhZFwiLCBcInByZWZpeFwiLCBcInJhbmdlXCIsIFwic3BlYWstYXNcIiwgXCJzdWZmaXhcIiwgXCJzeW1ib2xzXCIsIFwic3lzdGVtXCJdLFxuICAgICAgY291bnRlckRlc2NyaXB0b3JzID0ga2V5U2V0KGNvdW50ZXJEZXNjcmlwdG9yc18pO1xuICB2YXIgY29sb3JLZXl3b3Jkc18gPSBbXCJhbGljZWJsdWVcIiwgXCJhbnRpcXVld2hpdGVcIiwgXCJhcXVhXCIsIFwiYXF1YW1hcmluZVwiLCBcImF6dXJlXCIsIFwiYmVpZ2VcIiwgXCJiaXNxdWVcIiwgXCJibGFja1wiLCBcImJsYW5jaGVkYWxtb25kXCIsIFwiYmx1ZVwiLCBcImJsdWV2aW9sZXRcIiwgXCJicm93blwiLCBcImJ1cmx5d29vZFwiLCBcImNhZGV0Ymx1ZVwiLCBcImNoYXJ0cmV1c2VcIiwgXCJjaG9jb2xhdGVcIiwgXCJjb3JhbFwiLCBcImNvcm5mbG93ZXJibHVlXCIsIFwiY29ybnNpbGtcIiwgXCJjcmltc29uXCIsIFwiY3lhblwiLCBcImRhcmtibHVlXCIsIFwiZGFya2N5YW5cIiwgXCJkYXJrZ29sZGVucm9kXCIsIFwiZGFya2dyYXlcIiwgXCJkYXJrZ3JlZW5cIiwgXCJkYXJra2hha2lcIiwgXCJkYXJrbWFnZW50YVwiLCBcImRhcmtvbGl2ZWdyZWVuXCIsIFwiZGFya29yYW5nZVwiLCBcImRhcmtvcmNoaWRcIiwgXCJkYXJrcmVkXCIsIFwiZGFya3NhbG1vblwiLCBcImRhcmtzZWFncmVlblwiLCBcImRhcmtzbGF0ZWJsdWVcIiwgXCJkYXJrc2xhdGVncmF5XCIsIFwiZGFya3R1cnF1b2lzZVwiLCBcImRhcmt2aW9sZXRcIiwgXCJkZWVwcGlua1wiLCBcImRlZXBza3libHVlXCIsIFwiZGltZ3JheVwiLCBcImRvZGdlcmJsdWVcIiwgXCJmaXJlYnJpY2tcIiwgXCJmbG9yYWx3aGl0ZVwiLCBcImZvcmVzdGdyZWVuXCIsIFwiZnVjaHNpYVwiLCBcImdhaW5zYm9yb1wiLCBcImdob3N0d2hpdGVcIiwgXCJnb2xkXCIsIFwiZ29sZGVucm9kXCIsIFwiZ3JheVwiLCBcImdyZXlcIiwgXCJncmVlblwiLCBcImdyZWVueWVsbG93XCIsIFwiaG9uZXlkZXdcIiwgXCJob3RwaW5rXCIsIFwiaW5kaWFucmVkXCIsIFwiaW5kaWdvXCIsIFwiaXZvcnlcIiwgXCJraGFraVwiLCBcImxhdmVuZGVyXCIsIFwibGF2ZW5kZXJibHVzaFwiLCBcImxhd25ncmVlblwiLCBcImxlbW9uY2hpZmZvblwiLCBcImxpZ2h0Ymx1ZVwiLCBcImxpZ2h0Y29yYWxcIiwgXCJsaWdodGN5YW5cIiwgXCJsaWdodGdvbGRlbnJvZHllbGxvd1wiLCBcImxpZ2h0Z3JheVwiLCBcImxpZ2h0Z3JlZW5cIiwgXCJsaWdodHBpbmtcIiwgXCJsaWdodHNhbG1vblwiLCBcImxpZ2h0c2VhZ3JlZW5cIiwgXCJsaWdodHNreWJsdWVcIiwgXCJsaWdodHNsYXRlZ3JheVwiLCBcImxpZ2h0c3RlZWxibHVlXCIsIFwibGlnaHR5ZWxsb3dcIiwgXCJsaW1lXCIsIFwibGltZWdyZWVuXCIsIFwibGluZW5cIiwgXCJtYWdlbnRhXCIsIFwibWFyb29uXCIsIFwibWVkaXVtYXF1YW1hcmluZVwiLCBcIm1lZGl1bWJsdWVcIiwgXCJtZWRpdW1vcmNoaWRcIiwgXCJtZWRpdW1wdXJwbGVcIiwgXCJtZWRpdW1zZWFncmVlblwiLCBcIm1lZGl1bXNsYXRlYmx1ZVwiLCBcIm1lZGl1bXNwcmluZ2dyZWVuXCIsIFwibWVkaXVtdHVycXVvaXNlXCIsIFwibWVkaXVtdmlvbGV0cmVkXCIsIFwibWlkbmlnaHRibHVlXCIsIFwibWludGNyZWFtXCIsIFwibWlzdHlyb3NlXCIsIFwibW9jY2FzaW5cIiwgXCJuYXZham93aGl0ZVwiLCBcIm5hdnlcIiwgXCJvbGRsYWNlXCIsIFwib2xpdmVcIiwgXCJvbGl2ZWRyYWJcIiwgXCJvcmFuZ2VcIiwgXCJvcmFuZ2VyZWRcIiwgXCJvcmNoaWRcIiwgXCJwYWxlZ29sZGVucm9kXCIsIFwicGFsZWdyZWVuXCIsIFwicGFsZXR1cnF1b2lzZVwiLCBcInBhbGV2aW9sZXRyZWRcIiwgXCJwYXBheWF3aGlwXCIsIFwicGVhY2hwdWZmXCIsIFwicGVydVwiLCBcInBpbmtcIiwgXCJwbHVtXCIsIFwicG93ZGVyYmx1ZVwiLCBcInB1cnBsZVwiLCBcInJlYmVjY2FwdXJwbGVcIiwgXCJyZWRcIiwgXCJyb3N5YnJvd25cIiwgXCJyb3lhbGJsdWVcIiwgXCJzYWRkbGVicm93blwiLCBcInNhbG1vblwiLCBcInNhbmR5YnJvd25cIiwgXCJzZWFncmVlblwiLCBcInNlYXNoZWxsXCIsIFwic2llbm5hXCIsIFwic2lsdmVyXCIsIFwic2t5Ymx1ZVwiLCBcInNsYXRlYmx1ZVwiLCBcInNsYXRlZ3JheVwiLCBcInNub3dcIiwgXCJzcHJpbmdncmVlblwiLCBcInN0ZWVsYmx1ZVwiLCBcInRhblwiLCBcInRlYWxcIiwgXCJ0aGlzdGxlXCIsIFwidG9tYXRvXCIsIFwidHVycXVvaXNlXCIsIFwidmlvbGV0XCIsIFwid2hlYXRcIiwgXCJ3aGl0ZVwiLCBcIndoaXRlc21va2VcIiwgXCJ5ZWxsb3dcIiwgXCJ5ZWxsb3dncmVlblwiXSxcbiAgICAgIGNvbG9yS2V5d29yZHMgPSBrZXlTZXQoY29sb3JLZXl3b3Jkc18pO1xuICB2YXIgdmFsdWVLZXl3b3Jkc18gPSBbXCJhYm92ZVwiLCBcImFic29sdXRlXCIsIFwiYWN0aXZlYm9yZGVyXCIsIFwiYWRkaXRpdmVcIiwgXCJhY3RpdmVjYXB0aW9uXCIsIFwiYWZhclwiLCBcImFmdGVyLXdoaXRlLXNwYWNlXCIsIFwiYWhlYWRcIiwgXCJhbGlhc1wiLCBcImFsbFwiLCBcImFsbC1zY3JvbGxcIiwgXCJhbHBoYWJldGljXCIsIFwiYWx0ZXJuYXRlXCIsIFwiYWx3YXlzXCIsIFwiYW1oYXJpY1wiLCBcImFtaGFyaWMtYWJlZ2VkZVwiLCBcImFudGlhbGlhc2VkXCIsIFwiYXBwd29ya3NwYWNlXCIsIFwiYXJhYmljLWluZGljXCIsIFwiYXJtZW5pYW5cIiwgXCJhc3Rlcmlza3NcIiwgXCJhdHRyXCIsIFwiYXV0b1wiLCBcImF1dG8tZmxvd1wiLCBcImF2b2lkXCIsIFwiYXZvaWQtY29sdW1uXCIsIFwiYXZvaWQtcGFnZVwiLCBcImF2b2lkLXJlZ2lvblwiLCBcImJhY2tncm91bmRcIiwgXCJiYWNrd2FyZHNcIiwgXCJiYXNlbGluZVwiLCBcImJlbG93XCIsIFwiYmlkaS1vdmVycmlkZVwiLCBcImJpbmFyeVwiLCBcImJlbmdhbGlcIiwgXCJibGlua1wiLCBcImJsb2NrXCIsIFwiYmxvY2stYXhpc1wiLCBcImJvbGRcIiwgXCJib2xkZXJcIiwgXCJib3JkZXJcIiwgXCJib3JkZXItYm94XCIsIFwiYm90aFwiLCBcImJvdHRvbVwiLCBcImJyZWFrXCIsIFwiYnJlYWstYWxsXCIsIFwiYnJlYWstd29yZFwiLCBcImJ1bGxldHNcIiwgXCJidXR0b25cIiwgXCJidXR0b24tYmV2ZWxcIiwgXCJidXR0b25mYWNlXCIsIFwiYnV0dG9uaGlnaGxpZ2h0XCIsIFwiYnV0dG9uc2hhZG93XCIsIFwiYnV0dG9udGV4dFwiLCBcImNhbGNcIiwgXCJjYW1ib2RpYW5cIiwgXCJjYXBpdGFsaXplXCIsIFwiY2Fwcy1sb2NrLWluZGljYXRvclwiLCBcImNhcHRpb25cIiwgXCJjYXB0aW9udGV4dFwiLCBcImNhcmV0XCIsIFwiY2VsbFwiLCBcImNlbnRlclwiLCBcImNoZWNrYm94XCIsIFwiY2lyY2xlXCIsIFwiY2prLWRlY2ltYWxcIiwgXCJjamstZWFydGhseS1icmFuY2hcIiwgXCJjamstaGVhdmVubHktc3RlbVwiLCBcImNqay1pZGVvZ3JhcGhpY1wiLCBcImNsZWFyXCIsIFwiY2xpcFwiLCBcImNsb3NlLXF1b3RlXCIsIFwiY29sLXJlc2l6ZVwiLCBcImNvbGxhcHNlXCIsIFwiY29sb3JcIiwgXCJjb2xvci1idXJuXCIsIFwiY29sb3ItZG9kZ2VcIiwgXCJjb2x1bW5cIiwgXCJjb2x1bW4tcmV2ZXJzZVwiLCBcImNvbXBhY3RcIiwgXCJjb25kZW5zZWRcIiwgXCJjb250YWluXCIsIFwiY29udGVudFwiLCBcImNvbnRlbnRzXCIsIFwiY29udGVudC1ib3hcIiwgXCJjb250ZXh0LW1lbnVcIiwgXCJjb250aW51b3VzXCIsIFwiY29weVwiLCBcImNvdW50ZXJcIiwgXCJjb3VudGVyc1wiLCBcImNvdmVyXCIsIFwiY3JvcFwiLCBcImNyb3NzXCIsIFwiY3Jvc3NoYWlyXCIsIFwiY3VycmVudGNvbG9yXCIsIFwiY3Vyc2l2ZVwiLCBcImN5Y2xpY1wiLCBcImRhcmtlblwiLCBcImRhc2hlZFwiLCBcImRlY2ltYWxcIiwgXCJkZWNpbWFsLWxlYWRpbmctemVyb1wiLCBcImRlZmF1bHRcIiwgXCJkZWZhdWx0LWJ1dHRvblwiLCBcImRlbnNlXCIsIFwiZGVzdGluYXRpb24tYXRvcFwiLCBcImRlc3RpbmF0aW9uLWluXCIsIFwiZGVzdGluYXRpb24tb3V0XCIsIFwiZGVzdGluYXRpb24tb3ZlclwiLCBcImRldmFuYWdhcmlcIiwgXCJkaWZmZXJlbmNlXCIsIFwiZGlzY1wiLCBcImRpc2NhcmRcIiwgXCJkaXNjbG9zdXJlLWNsb3NlZFwiLCBcImRpc2Nsb3N1cmUtb3BlblwiLCBcImRvY3VtZW50XCIsIFwiZG90LWRhc2hcIiwgXCJkb3QtZG90LWRhc2hcIiwgXCJkb3R0ZWRcIiwgXCJkb3VibGVcIiwgXCJkb3duXCIsIFwiZS1yZXNpemVcIiwgXCJlYXNlXCIsIFwiZWFzZS1pblwiLCBcImVhc2UtaW4tb3V0XCIsIFwiZWFzZS1vdXRcIiwgXCJlbGVtZW50XCIsIFwiZWxsaXBzZVwiLCBcImVsbGlwc2lzXCIsIFwiZW1iZWRcIiwgXCJlbmRcIiwgXCJldGhpb3BpY1wiLCBcImV0aGlvcGljLWFiZWdlZGVcIiwgXCJldGhpb3BpYy1hYmVnZWRlLWFtLWV0XCIsIFwiZXRoaW9waWMtYWJlZ2VkZS1nZXpcIiwgXCJldGhpb3BpYy1hYmVnZWRlLXRpLWVyXCIsIFwiZXRoaW9waWMtYWJlZ2VkZS10aS1ldFwiLCBcImV0aGlvcGljLWhhbGVoYW1lLWFhLWVyXCIsIFwiZXRoaW9waWMtaGFsZWhhbWUtYWEtZXRcIiwgXCJldGhpb3BpYy1oYWxlaGFtZS1hbS1ldFwiLCBcImV0aGlvcGljLWhhbGVoYW1lLWdlelwiLCBcImV0aGlvcGljLWhhbGVoYW1lLW9tLWV0XCIsIFwiZXRoaW9waWMtaGFsZWhhbWUtc2lkLWV0XCIsIFwiZXRoaW9waWMtaGFsZWhhbWUtc28tZXRcIiwgXCJldGhpb3BpYy1oYWxlaGFtZS10aS1lclwiLCBcImV0aGlvcGljLWhhbGVoYW1lLXRpLWV0XCIsIFwiZXRoaW9waWMtaGFsZWhhbWUtdGlnXCIsIFwiZXRoaW9waWMtbnVtZXJpY1wiLCBcImV3LXJlc2l6ZVwiLCBcImV4Y2x1c2lvblwiLCBcImV4cGFuZGVkXCIsIFwiZXh0ZW5kc1wiLCBcImV4dHJhLWNvbmRlbnNlZFwiLCBcImV4dHJhLWV4cGFuZGVkXCIsIFwiZmFudGFzeVwiLCBcImZhc3RcIiwgXCJmaWxsXCIsIFwiZml4ZWRcIiwgXCJmbGF0XCIsIFwiZmxleFwiLCBcImZsZXgtZW5kXCIsIFwiZmxleC1zdGFydFwiLCBcImZvb3Rub3Rlc1wiLCBcImZvcndhcmRzXCIsIFwiZnJvbVwiLCBcImdlb21ldHJpY1ByZWNpc2lvblwiLCBcImdlb3JnaWFuXCIsIFwiZ3JheXRleHRcIiwgXCJncmlkXCIsIFwiZ3Jvb3ZlXCIsIFwiZ3VqYXJhdGlcIiwgXCJndXJtdWtoaVwiLCBcImhhbmRcIiwgXCJoYW5ndWxcIiwgXCJoYW5ndWwtY29uc29uYW50XCIsIFwiaGFyZC1saWdodFwiLCBcImhlYnJld1wiLCBcImhlbHBcIiwgXCJoaWRkZW5cIiwgXCJoaWRlXCIsIFwiaGlnaGVyXCIsIFwiaGlnaGxpZ2h0XCIsIFwiaGlnaGxpZ2h0dGV4dFwiLCBcImhpcmFnYW5hXCIsIFwiaGlyYWdhbmEtaXJvaGFcIiwgXCJob3Jpem9udGFsXCIsIFwiaHNsXCIsIFwiaHNsYVwiLCBcImh1ZVwiLCBcImljb25cIiwgXCJpZ25vcmVcIiwgXCJpbmFjdGl2ZWJvcmRlclwiLCBcImluYWN0aXZlY2FwdGlvblwiLCBcImluYWN0aXZlY2FwdGlvbnRleHRcIiwgXCJpbmZpbml0ZVwiLCBcImluZm9iYWNrZ3JvdW5kXCIsIFwiaW5mb3RleHRcIiwgXCJpbmhlcml0XCIsIFwiaW5pdGlhbFwiLCBcImlubGluZVwiLCBcImlubGluZS1heGlzXCIsIFwiaW5saW5lLWJsb2NrXCIsIFwiaW5saW5lLWZsZXhcIiwgXCJpbmxpbmUtZ3JpZFwiLCBcImlubGluZS10YWJsZVwiLCBcImluc2V0XCIsIFwiaW5zaWRlXCIsIFwiaW50cmluc2ljXCIsIFwiaW52ZXJ0XCIsIFwiaXRhbGljXCIsIFwiamFwYW5lc2UtZm9ybWFsXCIsIFwiamFwYW5lc2UtaW5mb3JtYWxcIiwgXCJqdXN0aWZ5XCIsIFwia2FubmFkYVwiLCBcImthdGFrYW5hXCIsIFwia2F0YWthbmEtaXJvaGFcIiwgXCJrZWVwLWFsbFwiLCBcImtobWVyXCIsIFwia29yZWFuLWhhbmd1bC1mb3JtYWxcIiwgXCJrb3JlYW4taGFuamEtZm9ybWFsXCIsIFwia29yZWFuLWhhbmphLWluZm9ybWFsXCIsIFwibGFuZHNjYXBlXCIsIFwibGFvXCIsIFwibGFyZ2VcIiwgXCJsYXJnZXJcIiwgXCJsZWZ0XCIsIFwibGV2ZWxcIiwgXCJsaWdodGVyXCIsIFwibGlnaHRlblwiLCBcImxpbmUtdGhyb3VnaFwiLCBcImxpbmVhclwiLCBcImxpbmVhci1ncmFkaWVudFwiLCBcImxpbmVzXCIsIFwibGlzdC1pdGVtXCIsIFwibGlzdGJveFwiLCBcImxpc3RpdGVtXCIsIFwibG9jYWxcIiwgXCJsb2dpY2FsXCIsIFwibG91ZFwiLCBcImxvd2VyXCIsIFwibG93ZXItYWxwaGFcIiwgXCJsb3dlci1hcm1lbmlhblwiLCBcImxvd2VyLWdyZWVrXCIsIFwibG93ZXItaGV4YWRlY2ltYWxcIiwgXCJsb3dlci1sYXRpblwiLCBcImxvd2VyLW5vcndlZ2lhblwiLCBcImxvd2VyLXJvbWFuXCIsIFwibG93ZXJjYXNlXCIsIFwibHRyXCIsIFwibHVtaW5vc2l0eVwiLCBcIm1hbGF5YWxhbVwiLCBcIm1hdGNoXCIsIFwibWF0cml4XCIsIFwibWF0cml4M2RcIiwgXCJtZWRpYS1jb250cm9scy1iYWNrZ3JvdW5kXCIsIFwibWVkaWEtY3VycmVudC10aW1lLWRpc3BsYXlcIiwgXCJtZWRpYS1mdWxsc2NyZWVuLWJ1dHRvblwiLCBcIm1lZGlhLW11dGUtYnV0dG9uXCIsIFwibWVkaWEtcGxheS1idXR0b25cIiwgXCJtZWRpYS1yZXR1cm4tdG8tcmVhbHRpbWUtYnV0dG9uXCIsIFwibWVkaWEtcmV3aW5kLWJ1dHRvblwiLCBcIm1lZGlhLXNlZWstYmFjay1idXR0b25cIiwgXCJtZWRpYS1zZWVrLWZvcndhcmQtYnV0dG9uXCIsIFwibWVkaWEtc2xpZGVyXCIsIFwibWVkaWEtc2xpZGVydGh1bWJcIiwgXCJtZWRpYS10aW1lLXJlbWFpbmluZy1kaXNwbGF5XCIsIFwibWVkaWEtdm9sdW1lLXNsaWRlclwiLCBcIm1lZGlhLXZvbHVtZS1zbGlkZXItY29udGFpbmVyXCIsIFwibWVkaWEtdm9sdW1lLXNsaWRlcnRodW1iXCIsIFwibWVkaXVtXCIsIFwibWVudVwiLCBcIm1lbnVsaXN0XCIsIFwibWVudWxpc3QtYnV0dG9uXCIsIFwibWVudWxpc3QtdGV4dFwiLCBcIm1lbnVsaXN0LXRleHRmaWVsZFwiLCBcIm1lbnV0ZXh0XCIsIFwibWVzc2FnZS1ib3hcIiwgXCJtaWRkbGVcIiwgXCJtaW4taW50cmluc2ljXCIsIFwibWl4XCIsIFwibW9uZ29saWFuXCIsIFwibW9ub3NwYWNlXCIsIFwibW92ZVwiLCBcIm11bHRpcGxlXCIsIFwibXVsdGlwbHlcIiwgXCJteWFubWFyXCIsIFwibi1yZXNpemVcIiwgXCJuYXJyb3dlclwiLCBcIm5lLXJlc2l6ZVwiLCBcIm5lc3ctcmVzaXplXCIsIFwibm8tY2xvc2UtcXVvdGVcIiwgXCJuby1kcm9wXCIsIFwibm8tb3Blbi1xdW90ZVwiLCBcIm5vLXJlcGVhdFwiLCBcIm5vbmVcIiwgXCJub3JtYWxcIiwgXCJub3QtYWxsb3dlZFwiLCBcIm5vd3JhcFwiLCBcIm5zLXJlc2l6ZVwiLCBcIm51bWJlcnNcIiwgXCJudW1lcmljXCIsIFwibnctcmVzaXplXCIsIFwibndzZS1yZXNpemVcIiwgXCJvYmxpcXVlXCIsIFwib2N0YWxcIiwgXCJvcGFjaXR5XCIsIFwib3Blbi1xdW90ZVwiLCBcIm9wdGltaXplTGVnaWJpbGl0eVwiLCBcIm9wdGltaXplU3BlZWRcIiwgXCJvcml5YVwiLCBcIm9yb21vXCIsIFwib3V0c2V0XCIsIFwib3V0c2lkZVwiLCBcIm91dHNpZGUtc2hhcGVcIiwgXCJvdmVybGF5XCIsIFwib3ZlcmxpbmVcIiwgXCJwYWRkaW5nXCIsIFwicGFkZGluZy1ib3hcIiwgXCJwYWludGVkXCIsIFwicGFnZVwiLCBcInBhdXNlZFwiLCBcInBlcnNpYW5cIiwgXCJwZXJzcGVjdGl2ZVwiLCBcInBsdXMtZGFya2VyXCIsIFwicGx1cy1saWdodGVyXCIsIFwicG9pbnRlclwiLCBcInBvbHlnb25cIiwgXCJwb3J0cmFpdFwiLCBcInByZVwiLCBcInByZS1saW5lXCIsIFwicHJlLXdyYXBcIiwgXCJwcmVzZXJ2ZS0zZFwiLCBcInByb2dyZXNzXCIsIFwicHVzaC1idXR0b25cIiwgXCJyYWRpYWwtZ3JhZGllbnRcIiwgXCJyYWRpb1wiLCBcInJlYWQtb25seVwiLCBcInJlYWQtd3JpdGVcIiwgXCJyZWFkLXdyaXRlLXBsYWludGV4dC1vbmx5XCIsIFwicmVjdGFuZ2xlXCIsIFwicmVnaW9uXCIsIFwicmVsYXRpdmVcIiwgXCJyZXBlYXRcIiwgXCJyZXBlYXRpbmctbGluZWFyLWdyYWRpZW50XCIsIFwicmVwZWF0aW5nLXJhZGlhbC1ncmFkaWVudFwiLCBcInJlcGVhdC14XCIsIFwicmVwZWF0LXlcIiwgXCJyZXNldFwiLCBcInJldmVyc2VcIiwgXCJyZ2JcIiwgXCJyZ2JhXCIsIFwicmlkZ2VcIiwgXCJyaWdodFwiLCBcInJvdGF0ZVwiLCBcInJvdGF0ZTNkXCIsIFwicm90YXRlWFwiLCBcInJvdGF0ZVlcIiwgXCJyb3RhdGVaXCIsIFwicm91bmRcIiwgXCJyb3dcIiwgXCJyb3ctcmVzaXplXCIsIFwicm93LXJldmVyc2VcIiwgXCJydGxcIiwgXCJydW4taW5cIiwgXCJydW5uaW5nXCIsIFwicy1yZXNpemVcIiwgXCJzYW5zLXNlcmlmXCIsIFwic2F0dXJhdGlvblwiLCBcInNjYWxlXCIsIFwic2NhbGUzZFwiLCBcInNjYWxlWFwiLCBcInNjYWxlWVwiLCBcInNjYWxlWlwiLCBcInNjcmVlblwiLCBcInNjcm9sbFwiLCBcInNjcm9sbGJhclwiLCBcInNjcm9sbC1wb3NpdGlvblwiLCBcInNlLXJlc2l6ZVwiLCBcInNlYXJjaGZpZWxkXCIsIFwic2VhcmNoZmllbGQtY2FuY2VsLWJ1dHRvblwiLCBcInNlYXJjaGZpZWxkLWRlY29yYXRpb25cIiwgXCJzZWFyY2hmaWVsZC1yZXN1bHRzLWJ1dHRvblwiLCBcInNlYXJjaGZpZWxkLXJlc3VsdHMtZGVjb3JhdGlvblwiLCBcInNlbWktY29uZGVuc2VkXCIsIFwic2VtaS1leHBhbmRlZFwiLCBcInNlcGFyYXRlXCIsIFwic2VyaWZcIiwgXCJzaG93XCIsIFwic2lkYW1hXCIsIFwic2ltcC1jaGluZXNlLWZvcm1hbFwiLCBcInNpbXAtY2hpbmVzZS1pbmZvcm1hbFwiLCBcInNpbmdsZVwiLCBcInNrZXdcIiwgXCJza2V3WFwiLCBcInNrZXdZXCIsIFwic2tpcC13aGl0ZS1zcGFjZVwiLCBcInNsaWRlXCIsIFwic2xpZGVyLWhvcml6b250YWxcIiwgXCJzbGlkZXItdmVydGljYWxcIiwgXCJzbGlkZXJ0aHVtYi1ob3Jpem9udGFsXCIsIFwic2xpZGVydGh1bWItdmVydGljYWxcIiwgXCJzbG93XCIsIFwic21hbGxcIiwgXCJzbWFsbC1jYXBzXCIsIFwic21hbGwtY2FwdGlvblwiLCBcInNtYWxsZXJcIiwgXCJzb2Z0LWxpZ2h0XCIsIFwic29saWRcIiwgXCJzb21hbGlcIiwgXCJzb3VyY2UtYXRvcFwiLCBcInNvdXJjZS1pblwiLCBcInNvdXJjZS1vdXRcIiwgXCJzb3VyY2Utb3ZlclwiLCBcInNwYWNlXCIsIFwic3BhY2UtYXJvdW5kXCIsIFwic3BhY2UtYmV0d2VlblwiLCBcInNwZWxsLW91dFwiLCBcInNxdWFyZVwiLCBcInNxdWFyZS1idXR0b25cIiwgXCJzdGFydFwiLCBcInN0YXRpY1wiLCBcInN0YXR1cy1iYXJcIiwgXCJzdHJldGNoXCIsIFwic3Ryb2tlXCIsIFwic3ViXCIsIFwic3VicGl4ZWwtYW50aWFsaWFzZWRcIiwgXCJzdXBlclwiLCBcInN3LXJlc2l6ZVwiLCBcInN5bWJvbGljXCIsIFwic3ltYm9sc1wiLCBcInRhYmxlXCIsIFwidGFibGUtY2FwdGlvblwiLCBcInRhYmxlLWNlbGxcIiwgXCJ0YWJsZS1jb2x1bW5cIiwgXCJ0YWJsZS1jb2x1bW4tZ3JvdXBcIiwgXCJ0YWJsZS1mb290ZXItZ3JvdXBcIiwgXCJ0YWJsZS1oZWFkZXItZ3JvdXBcIiwgXCJ0YWJsZS1yb3dcIiwgXCJ0YWJsZS1yb3ctZ3JvdXBcIiwgXCJ0YW1pbFwiLCBcInRlbHVndVwiLCBcInRleHRcIiwgXCJ0ZXh0LWJvdHRvbVwiLCBcInRleHQtdG9wXCIsIFwidGV4dGFyZWFcIiwgXCJ0ZXh0ZmllbGRcIiwgXCJ0aGFpXCIsIFwidGhpY2tcIiwgXCJ0aGluXCIsIFwidGhyZWVkZGFya3NoYWRvd1wiLCBcInRocmVlZGZhY2VcIiwgXCJ0aHJlZWRoaWdobGlnaHRcIiwgXCJ0aHJlZWRsaWdodHNoYWRvd1wiLCBcInRocmVlZHNoYWRvd1wiLCBcInRpYmV0YW5cIiwgXCJ0aWdyZVwiLCBcInRpZ3JpbnlhLWVyXCIsIFwidGlncmlueWEtZXItYWJlZ2VkZVwiLCBcInRpZ3JpbnlhLWV0XCIsIFwidGlncmlueWEtZXQtYWJlZ2VkZVwiLCBcInRvXCIsIFwidG9wXCIsIFwidHJhZC1jaGluZXNlLWZvcm1hbFwiLCBcInRyYWQtY2hpbmVzZS1pbmZvcm1hbFwiLCBcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZVwiLCBcInRyYW5zbGF0ZTNkXCIsIFwidHJhbnNsYXRlWFwiLCBcInRyYW5zbGF0ZVlcIiwgXCJ0cmFuc2xhdGVaXCIsIFwidHJhbnNwYXJlbnRcIiwgXCJ1bHRyYS1jb25kZW5zZWRcIiwgXCJ1bHRyYS1leHBhbmRlZFwiLCBcInVuZGVybGluZVwiLCBcInVuc2V0XCIsIFwidXBcIiwgXCJ1cHBlci1hbHBoYVwiLCBcInVwcGVyLWFybWVuaWFuXCIsIFwidXBwZXItZ3JlZWtcIiwgXCJ1cHBlci1oZXhhZGVjaW1hbFwiLCBcInVwcGVyLWxhdGluXCIsIFwidXBwZXItbm9yd2VnaWFuXCIsIFwidXBwZXItcm9tYW5cIiwgXCJ1cHBlcmNhc2VcIiwgXCJ1cmR1XCIsIFwidXJsXCIsIFwidmFyXCIsIFwidmVydGljYWxcIiwgXCJ2ZXJ0aWNhbC10ZXh0XCIsIFwidmlzaWJsZVwiLCBcInZpc2libGVGaWxsXCIsIFwidmlzaWJsZVBhaW50ZWRcIiwgXCJ2aXNpYmxlU3Ryb2tlXCIsIFwidmlzdWFsXCIsIFwidy1yZXNpemVcIiwgXCJ3YWl0XCIsIFwid2F2ZVwiLCBcIndpZGVyXCIsIFwid2luZG93XCIsIFwid2luZG93ZnJhbWVcIiwgXCJ3aW5kb3d0ZXh0XCIsIFwid29yZHNcIiwgXCJ3cmFwXCIsIFwid3JhcC1yZXZlcnNlXCIsIFwieC1sYXJnZVwiLCBcIngtc21hbGxcIiwgXCJ4b3JcIiwgXCJ4eC1sYXJnZVwiLCBcInh4LXNtYWxsXCJdLFxuICAgICAgdmFsdWVLZXl3b3JkcyA9IGtleVNldCh2YWx1ZUtleXdvcmRzXyk7XG4gIHZhciBhbGxXb3JkcyA9IGRvY3VtZW50VHlwZXNfLmNvbmNhdChtZWRpYVR5cGVzXykuY29uY2F0KG1lZGlhRmVhdHVyZXNfKS5jb25jYXQobWVkaWFWYWx1ZUtleXdvcmRzXykuY29uY2F0KHByb3BlcnR5S2V5d29yZHNfKS5jb25jYXQobm9uU3RhbmRhcmRQcm9wZXJ0eUtleXdvcmRzXykuY29uY2F0KGNvbG9yS2V5d29yZHNfKS5jb25jYXQodmFsdWVLZXl3b3Jkc18pO1xuICBDb2RlTWlycm9yLnJlZ2lzdGVySGVscGVyKFwiaGludFdvcmRzXCIsIFwiY3NzXCIsIGFsbFdvcmRzKTtcblxuICBmdW5jdGlvbiB0b2tlbkNDb21tZW50KHN0cmVhbSwgc3RhdGUpIHtcbiAgICB2YXIgbWF5YmVFbmQgPSBmYWxzZSxcbiAgICAgICAgY2g7XG5cbiAgICB3aGlsZSAoKGNoID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgaWYgKG1heWJlRW5kICYmIGNoID09IFwiL1wiKSB7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIG1heWJlRW5kID0gY2ggPT0gXCIqXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtcImNvbW1lbnRcIiwgXCJjb21tZW50XCJdO1xuICB9XG5cbiAgQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwidGV4dC9jc3NcIiwge1xuICAgIGRvY3VtZW50VHlwZXM6IGRvY3VtZW50VHlwZXMsXG4gICAgbWVkaWFUeXBlczogbWVkaWFUeXBlcyxcbiAgICBtZWRpYUZlYXR1cmVzOiBtZWRpYUZlYXR1cmVzLFxuICAgIG1lZGlhVmFsdWVLZXl3b3JkczogbWVkaWFWYWx1ZUtleXdvcmRzLFxuICAgIHByb3BlcnR5S2V5d29yZHM6IHByb3BlcnR5S2V5d29yZHMsXG4gICAgbm9uU3RhbmRhcmRQcm9wZXJ0eUtleXdvcmRzOiBub25TdGFuZGFyZFByb3BlcnR5S2V5d29yZHMsXG4gICAgZm9udFByb3BlcnRpZXM6IGZvbnRQcm9wZXJ0aWVzLFxuICAgIGNvdW50ZXJEZXNjcmlwdG9yczogY291bnRlckRlc2NyaXB0b3JzLFxuICAgIGNvbG9yS2V5d29yZHM6IGNvbG9yS2V5d29yZHMsXG4gICAgdmFsdWVLZXl3b3JkczogdmFsdWVLZXl3b3JkcyxcbiAgICB0b2tlbkhvb2tzOiB7XG4gICAgICBcIi9cIjogZnVuY3Rpb24gXyhzdHJlYW0sIHN0YXRlKSB7XG4gICAgICAgIGlmICghc3RyZWFtLmVhdChcIipcIikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSB0b2tlbkNDb21tZW50O1xuICAgICAgICByZXR1cm4gdG9rZW5DQ29tbWVudChzdHJlYW0sIHN0YXRlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG5hbWU6IFwiY3NzXCJcbiAgfSk7XG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQveC1zY3NzXCIsIHtcbiAgICBtZWRpYVR5cGVzOiBtZWRpYVR5cGVzLFxuICAgIG1lZGlhRmVhdHVyZXM6IG1lZGlhRmVhdHVyZXMsXG4gICAgbWVkaWFWYWx1ZUtleXdvcmRzOiBtZWRpYVZhbHVlS2V5d29yZHMsXG4gICAgcHJvcGVydHlLZXl3b3JkczogcHJvcGVydHlLZXl3b3JkcyxcbiAgICBub25TdGFuZGFyZFByb3BlcnR5S2V5d29yZHM6IG5vblN0YW5kYXJkUHJvcGVydHlLZXl3b3JkcyxcbiAgICBjb2xvcktleXdvcmRzOiBjb2xvcktleXdvcmRzLFxuICAgIHZhbHVlS2V5d29yZHM6IHZhbHVlS2V5d29yZHMsXG4gICAgZm9udFByb3BlcnRpZXM6IGZvbnRQcm9wZXJ0aWVzLFxuICAgIGFsbG93TmVzdGVkOiB0cnVlLFxuICAgIHRva2VuSG9va3M6IHtcbiAgICAgIFwiL1wiOiBmdW5jdGlvbiBfKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCIvXCIpKSB7XG4gICAgICAgICAgc3RyZWFtLnNraXBUb0VuZCgpO1xuICAgICAgICAgIHJldHVybiBbXCJjb21tZW50XCIsIFwiY29tbWVudFwiXTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0uZWF0KFwiKlwiKSkge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gdG9rZW5DQ29tbWVudDtcbiAgICAgICAgICByZXR1cm4gdG9rZW5DQ29tbWVudChzdHJlYW0sIHN0YXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gW1wib3BlcmF0b3JcIiwgXCJvcGVyYXRvclwiXTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiOlwiOiBmdW5jdGlvbiBfKHN0cmVhbSkge1xuICAgICAgICBpZiAoc3RyZWFtLm1hdGNoKC9cXHMqXFx7LykpIHJldHVybiBbbnVsbCwgXCJ7XCJdO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgXCIkXCI6IGZ1bmN0aW9uICQoc3RyZWFtKSB7XG4gICAgICAgIHN0cmVhbS5tYXRjaCgvXltcXHctXSsvKTtcbiAgICAgICAgaWYgKHN0cmVhbS5tYXRjaCgvXlxccyo6LywgZmFsc2UpKSByZXR1cm4gW1widmFyaWFibGUtMlwiLCBcInZhcmlhYmxlLWRlZmluaXRpb25cIl07XG4gICAgICAgIHJldHVybiBbXCJ2YXJpYWJsZS0yXCIsIFwidmFyaWFibGVcIl07XG4gICAgICB9LFxuICAgICAgXCIjXCI6IGZ1bmN0aW9uIF8oc3RyZWFtKSB7XG4gICAgICAgIGlmICghc3RyZWFtLmVhdChcIntcIikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIFtudWxsLCBcImludGVycG9sYXRpb25cIl07XG4gICAgICB9XG4gICAgfSxcbiAgICBuYW1lOiBcImNzc1wiLFxuICAgIGhlbHBlclR5cGU6IFwic2Nzc1wiXG4gIH0pO1xuICBDb2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L3gtbGVzc1wiLCB7XG4gICAgbWVkaWFUeXBlczogbWVkaWFUeXBlcyxcbiAgICBtZWRpYUZlYXR1cmVzOiBtZWRpYUZlYXR1cmVzLFxuICAgIG1lZGlhVmFsdWVLZXl3b3JkczogbWVkaWFWYWx1ZUtleXdvcmRzLFxuICAgIHByb3BlcnR5S2V5d29yZHM6IHByb3BlcnR5S2V5d29yZHMsXG4gICAgbm9uU3RhbmRhcmRQcm9wZXJ0eUtleXdvcmRzOiBub25TdGFuZGFyZFByb3BlcnR5S2V5d29yZHMsXG4gICAgY29sb3JLZXl3b3JkczogY29sb3JLZXl3b3JkcyxcbiAgICB2YWx1ZUtleXdvcmRzOiB2YWx1ZUtleXdvcmRzLFxuICAgIGZvbnRQcm9wZXJ0aWVzOiBmb250UHJvcGVydGllcyxcbiAgICBhbGxvd05lc3RlZDogdHJ1ZSxcbiAgICB0b2tlbkhvb2tzOiB7XG4gICAgICBcIi9cIjogZnVuY3Rpb24gXyhzdHJlYW0sIHN0YXRlKSB7XG4gICAgICAgIGlmIChzdHJlYW0uZWF0KFwiL1wiKSkge1xuICAgICAgICAgIHN0cmVhbS5za2lwVG9FbmQoKTtcbiAgICAgICAgICByZXR1cm4gW1wiY29tbWVudFwiLCBcImNvbW1lbnRcIl07XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLmVhdChcIipcIikpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IHRva2VuQ0NvbW1lbnQ7XG4gICAgICAgICAgcmV0dXJuIHRva2VuQ0NvbW1lbnQoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFtcIm9wZXJhdG9yXCIsIFwib3BlcmF0b3JcIl07XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcIkBcIjogZnVuY3Rpb24gXyhzdHJlYW0pIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJ7XCIpKSByZXR1cm4gW251bGwsIFwiaW50ZXJwb2xhdGlvblwiXTtcbiAgICAgICAgaWYgKHN0cmVhbS5tYXRjaCgvXihjaGFyc2V0fGRvY3VtZW50fGZvbnQtZmFjZXxpbXBvcnR8KC0obW96fG1zfG98d2Via2l0KS0pP2tleWZyYW1lc3xtZWRpYXxuYW1lc3BhY2V8cGFnZXxzdXBwb3J0cylcXGIvLCBmYWxzZSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFxcXFxcLV0vKTtcbiAgICAgICAgaWYgKHN0cmVhbS5tYXRjaCgvXlxccyo6LywgZmFsc2UpKSByZXR1cm4gW1widmFyaWFibGUtMlwiLCBcInZhcmlhYmxlLWRlZmluaXRpb25cIl07XG4gICAgICAgIHJldHVybiBbXCJ2YXJpYWJsZS0yXCIsIFwidmFyaWFibGVcIl07XG4gICAgICB9LFxuICAgICAgXCImXCI6IGZ1bmN0aW9uIF8oKSB7XG4gICAgICAgIHJldHVybiBbXCJhdG9tXCIsIFwiYXRvbVwiXTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG5hbWU6IFwiY3NzXCIsXG4gICAgaGVscGVyVHlwZTogXCJsZXNzXCJcbiAgfSk7XG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQveC1nc3NcIiwge1xuICAgIGRvY3VtZW50VHlwZXM6IGRvY3VtZW50VHlwZXMsXG4gICAgbWVkaWFUeXBlczogbWVkaWFUeXBlcyxcbiAgICBtZWRpYUZlYXR1cmVzOiBtZWRpYUZlYXR1cmVzLFxuICAgIHByb3BlcnR5S2V5d29yZHM6IHByb3BlcnR5S2V5d29yZHMsXG4gICAgbm9uU3RhbmRhcmRQcm9wZXJ0eUtleXdvcmRzOiBub25TdGFuZGFyZFByb3BlcnR5S2V5d29yZHMsXG4gICAgZm9udFByb3BlcnRpZXM6IGZvbnRQcm9wZXJ0aWVzLFxuICAgIGNvdW50ZXJEZXNjcmlwdG9yczogY291bnRlckRlc2NyaXB0b3JzLFxuICAgIGNvbG9yS2V5d29yZHM6IGNvbG9yS2V5d29yZHMsXG4gICAgdmFsdWVLZXl3b3JkczogdmFsdWVLZXl3b3JkcyxcbiAgICBzdXBwb3J0c0F0Q29tcG9uZW50OiB0cnVlLFxuICAgIHRva2VuSG9va3M6IHtcbiAgICAgIFwiL1wiOiBmdW5jdGlvbiBfKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgICAgaWYgKCFzdHJlYW0uZWF0KFwiKlwiKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IHRva2VuQ0NvbW1lbnQ7XG4gICAgICAgIHJldHVybiB0b2tlbkNDb21tZW50KHN0cmVhbSwgc3RhdGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbmFtZTogXCJjc3NcIixcbiAgICBoZWxwZXJUeXBlOiBcImdzc1wiXG4gIH0pO1xufSk7Il0sImZpbGUiOiJhY2YtZmllbGRzL2Nzcy5qcyJ9
