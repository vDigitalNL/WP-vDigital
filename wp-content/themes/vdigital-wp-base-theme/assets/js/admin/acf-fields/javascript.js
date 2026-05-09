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

  function expressionAllowed(stream, state, backUp) {
    return /^(?:operator|sof|keyword c|case|new|export|default|[\[{}\(,;:]|=>)$/.test(state.lastType) || state.lastType == "quasi" && /\{\s*$/.test(stream.string.slice(0, stream.pos - (backUp || 0)));
  }

  CodeMirror.defineMode("javascript", function (config, parserConfig) {
    var indentUnit = config.indentUnit;
    var statementIndent = parserConfig.statementIndent;
    var jsonldMode = parserConfig.jsonld;
    var jsonMode = parserConfig.json || jsonldMode;
    var isTS = parserConfig.typescript;
    var wordRE = parserConfig.wordCharacters || /[\w$\xa1-\uffff]/; // Tokenizer

    var keywords = function () {
      function kw(type) {
        return {
          type: type,
          style: "keyword"
        };
      }

      var A = kw("keyword a"),
          B = kw("keyword b"),
          C = kw("keyword c");
      var operator = kw("operator"),
          atom = {
        type: "atom",
        style: "atom"
      };
      var jsKeywords = {
        "if": kw("if"),
        "while": A,
        "with": A,
        "else": B,
        "do": B,
        "try": B,
        "finally": B,
        "return": C,
        "break": C,
        "continue": C,
        "new": kw("new"),
        "delete": C,
        "throw": C,
        "debugger": C,
        "var": kw("var"),
        "const": kw("var"),
        "let": kw("var"),
        "function": kw("function"),
        "catch": kw("catch"),
        "for": kw("for"),
        "switch": kw("switch"),
        "case": kw("case"),
        "default": kw("default"),
        "in": operator,
        "typeof": operator,
        "instanceof": operator,
        "true": atom,
        "false": atom,
        "null": atom,
        "undefined": atom,
        "NaN": atom,
        "Infinity": atom,
        "this": kw("this"),
        "class": kw("class"),
        "super": kw("atom"),
        "yield": C,
        "export": kw("export"),
        "import": kw("import"),
        "extends": C,
        "await": C,
        "async": kw("async")
      }; // Extend the 'normal' keywords with the TypeScript language extensions

      if (isTS) {
        var type = {
          type: "variable",
          style: "variable-3"
        };
        var tsKeywords = {
          // object-like things
          "interface": kw("class"),
          "implements": C,
          "namespace": C,
          "module": kw("module"),
          "enum": kw("module"),
          "type": kw("type"),
          // scope modifiers
          "public": kw("modifier"),
          "private": kw("modifier"),
          "protected": kw("modifier"),
          "abstract": kw("modifier"),
          // operators
          "as": operator,
          // types
          "string": type,
          "number": type,
          "boolean": type,
          "any": type
        };

        for (var attr in tsKeywords) {
          jsKeywords[attr] = tsKeywords[attr];
        }
      }

      return jsKeywords;
    }();

    var isOperatorChar = /[+\-*&%=<>!?|~^]/;
    var isJsonldKeyword = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;

    function readRegexp(stream) {
      var escaped = false,
          next,
          inSet = false;

      while ((next = stream.next()) != null) {
        if (!escaped) {
          if (next == "/" && !inSet) return;
          if (next == "[") inSet = true;else if (inSet && next == "]") inSet = false;
        }

        escaped = !escaped && next == "\\";
      }
    } // Used as scratch variables to communicate multiple values without
    // consing up tons of objects.


    var type, content;

    function ret(tp, style, cont) {
      type = tp;
      content = cont;
      return style;
    }

    function tokenBase(stream, state) {
      var ch = stream.next();

      if (ch == '"' || ch == "'") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      } else if (ch == "." && stream.match(/^\d+(?:[eE][+\-]?\d+)?/)) {
        return ret("number", "number");
      } else if (ch == "." && stream.match("..")) {
        return ret("spread", "meta");
      } else if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
        return ret(ch);
      } else if (ch == "=" && stream.eat(">")) {
        return ret("=>", "operator");
      } else if (ch == "0" && stream.eat(/x/i)) {
        stream.eatWhile(/[\da-f]/i);
        return ret("number", "number");
      } else if (ch == "0" && stream.eat(/o/i)) {
        stream.eatWhile(/[0-7]/i);
        return ret("number", "number");
      } else if (ch == "0" && stream.eat(/b/i)) {
        stream.eatWhile(/[01]/i);
        return ret("number", "number");
      } else if (/\d/.test(ch)) {
        stream.match(/^\d*(?:\.\d*)?(?:[eE][+\-]?\d+)?/);
        return ret("number", "number");
      } else if (ch == "/") {
        if (stream.eat("*")) {
          state.tokenize = tokenComment;
          return tokenComment(stream, state);
        } else if (stream.eat("/")) {
          stream.skipToEnd();
          return ret("comment", "comment");
        } else if (expressionAllowed(stream, state, 1)) {
          readRegexp(stream);
          stream.match(/^\b(([gimyu])(?![gimyu]*\2))+\b/);
          return ret("regexp", "string-2");
        } else {
          stream.eatWhile(isOperatorChar);
          return ret("operator", "operator", stream.current());
        }
      } else if (ch == "`") {
        state.tokenize = tokenQuasi;
        return tokenQuasi(stream, state);
      } else if (ch == "#") {
        stream.skipToEnd();
        return ret("error", "error");
      } else if (isOperatorChar.test(ch)) {
        if (ch != ">" || !state.lexical || state.lexical.type != ">") stream.eatWhile(isOperatorChar);
        return ret("operator", "operator", stream.current());
      } else if (wordRE.test(ch)) {
        stream.eatWhile(wordRE);
        var word = stream.current(),
            known = keywords.propertyIsEnumerable(word) && keywords[word];
        return known && state.lastType != "." ? ret(known.type, known.style, word) : ret("variable", "variable", word);
      }
    }

    function tokenString(quote) {
      return function (stream, state) {
        var escaped = false,
            next;

        if (jsonldMode && stream.peek() == "@" && stream.match(isJsonldKeyword)) {
          state.tokenize = tokenBase;
          return ret("jsonld-keyword", "meta");
        }

        while ((next = stream.next()) != null) {
          if (next == quote && !escaped) break;
          escaped = !escaped && next == "\\";
        }

        if (!escaped) state.tokenize = tokenBase;
        return ret("string", "string");
      };
    }

    function tokenComment(stream, state) {
      var maybeEnd = false,
          ch;

      while (ch = stream.next()) {
        if (ch == "/" && maybeEnd) {
          state.tokenize = tokenBase;
          break;
        }

        maybeEnd = ch == "*";
      }

      return ret("comment", "comment");
    }

    function tokenQuasi(stream, state) {
      var escaped = false,
          next;

      while ((next = stream.next()) != null) {
        if (!escaped && (next == "`" || next == "$" && stream.eat("{"))) {
          state.tokenize = tokenBase;
          break;
        }

        escaped = !escaped && next == "\\";
      }

      return ret("quasi", "string-2", stream.current());
    }

    var brackets = "([{}])"; // This is a crude lookahead trick to try and notice that we're
    // parsing the argument patterns for a fat-arrow function before we
    // actually hit the arrow token. It only works if the arrow is on
    // the same line as the arguments and there's no strange noise
    // (comments) in between. Fallback is to only notice when we hit the
    // arrow, and not declare the arguments as locals for the arrow
    // body.

    function findFatArrow(stream, state) {
      if (state.fatArrowAt) state.fatArrowAt = null;
      var arrow = stream.string.indexOf("=>", stream.start);
      if (arrow < 0) return;

      if (isTS) {
        // Try to skip TypeScript return type declarations after the arguments
        var m = /:\s*(?:\w+(?:<[^>]*>|\[\])?|\{[^}]*\})\s*$/.exec(stream.string.slice(stream.start, arrow));
        if (m) arrow = m.index;
      }

      var depth = 0,
          sawSomething = false;

      for (var pos = arrow - 1; pos >= 0; --pos) {
        var ch = stream.string.charAt(pos);
        var bracket = brackets.indexOf(ch);

        if (bracket >= 0 && bracket < 3) {
          if (!depth) {
            ++pos;
            break;
          }

          if (--depth == 0) {
            if (ch == "(") sawSomething = true;
            break;
          }
        } else if (bracket >= 3 && bracket < 6) {
          ++depth;
        } else if (wordRE.test(ch)) {
          sawSomething = true;
        } else if (/["'\/]/.test(ch)) {
          return;
        } else if (sawSomething && !depth) {
          ++pos;
          break;
        }
      }

      if (sawSomething && !depth) state.fatArrowAt = pos;
    } // Parser


    var atomicTypes = {
      "atom": true,
      "number": true,
      "variable": true,
      "string": true,
      "regexp": true,
      "this": true,
      "jsonld-keyword": true
    };

    function JSLexical(indented, column, type, align, prev, info) {
      this.indented = indented;
      this.column = column;
      this.type = type;
      this.prev = prev;
      this.info = info;
      if (align != null) this.align = align;
    }

    function inScope(state, varname) {
      for (var v = state.localVars; v; v = v.next) {
        if (v.name == varname) return true;
      }

      for (var cx = state.context; cx; cx = cx.prev) {
        for (var v = cx.vars; v; v = v.next) {
          if (v.name == varname) return true;
        }
      }
    }

    function parseJS(state, style, type, content, stream) {
      var cc = state.cc; // Communicate our context to the combinators.
      // (Less wasteful than consing up a hundred closures on every call.)

      cx.state = state;
      cx.stream = stream;
      cx.marked = null, cx.cc = cc;
      cx.style = style;
      if (!state.lexical.hasOwnProperty("align")) state.lexical.align = true;

      while (true) {
        var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;

        if (combinator(type, content)) {
          while (cc.length && cc[cc.length - 1].lex) {
            cc.pop()();
          }

          if (cx.marked) return cx.marked;
          if (type == "variable" && inScope(state, content)) return "variable-2";
          return style;
        }
      }
    } // Combinator utils


    var cx = {
      state: null,
      column: null,
      marked: null,
      cc: null
    };

    function pass() {
      for (var i = arguments.length - 1; i >= 0; i--) {
        cx.cc.push(arguments[i]);
      }
    }

    function cont() {
      pass.apply(null, arguments);
      return true;
    }

    function register(varname) {
      function inList(list) {
        for (var v = list; v; v = v.next) {
          if (v.name == varname) return true;
        }

        return false;
      }

      var state = cx.state;
      cx.marked = "def";

      if (state.context) {
        if (inList(state.localVars)) return;
        state.localVars = {
          name: varname,
          next: state.localVars
        };
      } else {
        if (inList(state.globalVars)) return;
        if (parserConfig.globalVars) state.globalVars = {
          name: varname,
          next: state.globalVars
        };
      }
    } // Combinators


    var defaultVars = {
      name: "this",
      next: {
        name: "arguments"
      }
    };

    function pushcontext() {
      cx.state.context = {
        prev: cx.state.context,
        vars: cx.state.localVars
      };
      cx.state.localVars = defaultVars;
    }

    function popcontext() {
      cx.state.localVars = cx.state.context.vars;
      cx.state.context = cx.state.context.prev;
    }

    function pushlex(type, info) {
      var result = function result() {
        var state = cx.state,
            indent = state.indented;
        if (state.lexical.type == "stat") indent = state.lexical.indented;else for (var outer = state.lexical; outer && outer.type == ")" && outer.align; outer = outer.prev) {
          indent = outer.indented;
        }
        state.lexical = new JSLexical(indent, cx.stream.column(), type, null, state.lexical, info);
      };

      result.lex = true;
      return result;
    }

    function poplex() {
      var state = cx.state;

      if (state.lexical.prev) {
        if (state.lexical.type == ")") state.indented = state.lexical.indented;
        state.lexical = state.lexical.prev;
      }
    }

    poplex.lex = true;

    function expect(wanted) {
      function exp(type) {
        if (type == wanted) return cont();else if (wanted == ";") return pass();else return cont(exp);
      }

      ;
      return exp;
    }

    function statement(type, value) {
      if (type == "var") return cont(pushlex("vardef", value.length), vardef, expect(";"), poplex);
      if (type == "keyword a") return cont(pushlex("form"), parenExpr, statement, poplex);
      if (type == "keyword b") return cont(pushlex("form"), statement, poplex);
      if (type == "{") return cont(pushlex("}"), block, poplex);
      if (type == ";") return cont();

      if (type == "if") {
        if (cx.state.lexical.info == "else" && cx.state.cc[cx.state.cc.length - 1] == poplex) cx.state.cc.pop()();
        return cont(pushlex("form"), parenExpr, statement, poplex, maybeelse);
      }

      if (type == "function") return cont(functiondef);
      if (type == "for") return cont(pushlex("form"), forspec, statement, poplex);
      if (type == "variable") return cont(pushlex("stat"), maybelabel);
      if (type == "switch") return cont(pushlex("form"), parenExpr, pushlex("}", "switch"), expect("{"), block, poplex, poplex);
      if (type == "case") return cont(expression, expect(":"));
      if (type == "default") return cont(expect(":"));
      if (type == "catch") return cont(pushlex("form"), pushcontext, expect("("), funarg, expect(")"), statement, poplex, popcontext);
      if (type == "class") return cont(pushlex("form"), className, poplex);
      if (type == "export") return cont(pushlex("stat"), afterExport, poplex);
      if (type == "import") return cont(pushlex("stat"), afterImport, poplex);
      if (type == "module") return cont(pushlex("form"), pattern, pushlex("}"), expect("{"), block, poplex, poplex);
      if (type == "type") return cont(typeexpr, expect("operator"), typeexpr, expect(";"));
      if (type == "async") return cont(statement);
      return pass(pushlex("stat"), expression, expect(";"), poplex);
    }

    function expression(type) {
      return expressionInner(type, false);
    }

    function expressionNoComma(type) {
      return expressionInner(type, true);
    }

    function parenExpr(type) {
      if (type != "(") return pass();
      return cont(pushlex(")"), expression, expect(")"), poplex);
    }

    function expressionInner(type, noComma) {
      if (cx.state.fatArrowAt == cx.stream.start) {
        var body = noComma ? arrowBodyNoComma : arrowBody;
        if (type == "(") return cont(pushcontext, pushlex(")"), commasep(pattern, ")"), poplex, expect("=>"), body, popcontext);else if (type == "variable") return pass(pushcontext, pattern, expect("=>"), body, popcontext);
      }

      var maybeop = noComma ? maybeoperatorNoComma : maybeoperatorComma;
      if (atomicTypes.hasOwnProperty(type)) return cont(maybeop);
      if (type == "function") return cont(functiondef, maybeop);
      if (type == "class") return cont(pushlex("form"), classExpression, poplex);
      if (type == "keyword c" || type == "async") return cont(noComma ? maybeexpressionNoComma : maybeexpression);
      if (type == "(") return cont(pushlex(")"), maybeexpression, expect(")"), poplex, maybeop);
      if (type == "operator" || type == "spread") return cont(noComma ? expressionNoComma : expression);
      if (type == "[") return cont(pushlex("]"), arrayLiteral, poplex, maybeop);
      if (type == "{") return contCommasep(objprop, "}", null, maybeop);
      if (type == "quasi") return pass(quasi, maybeop);
      if (type == "new") return cont(maybeTarget(noComma));
      return cont();
    }

    function maybeexpression(type) {
      if (type.match(/[;\}\)\],]/)) return pass();
      return pass(expression);
    }

    function maybeexpressionNoComma(type) {
      if (type.match(/[;\}\)\],]/)) return pass();
      return pass(expressionNoComma);
    }

    function maybeoperatorComma(type, value) {
      if (type == ",") return cont(expression);
      return maybeoperatorNoComma(type, value, false);
    }

    function maybeoperatorNoComma(type, value, noComma) {
      var me = noComma == false ? maybeoperatorComma : maybeoperatorNoComma;
      var expr = noComma == false ? expression : expressionNoComma;
      if (type == "=>") return cont(pushcontext, noComma ? arrowBodyNoComma : arrowBody, popcontext);

      if (type == "operator") {
        if (/\+\+|--/.test(value)) return cont(me);
        if (value == "?") return cont(expression, expect(":"), expr);
        return cont(expr);
      }

      if (type == "quasi") {
        return pass(quasi, me);
      }

      if (type == ";") return;
      if (type == "(") return contCommasep(expressionNoComma, ")", "call", me);
      if (type == ".") return cont(property, me);
      if (type == "[") return cont(pushlex("]"), maybeexpression, expect("]"), poplex, me);
    }

    function quasi(type, value) {
      if (type != "quasi") return pass();
      if (value.slice(value.length - 2) != "${") return cont(quasi);
      return cont(expression, continueQuasi);
    }

    function continueQuasi(type) {
      if (type == "}") {
        cx.marked = "string-2";
        cx.state.tokenize = tokenQuasi;
        return cont(quasi);
      }
    }

    function arrowBody(type) {
      findFatArrow(cx.stream, cx.state);
      return pass(type == "{" ? statement : expression);
    }

    function arrowBodyNoComma(type) {
      findFatArrow(cx.stream, cx.state);
      return pass(type == "{" ? statement : expressionNoComma);
    }

    function maybeTarget(noComma) {
      return function (type) {
        if (type == ".") return cont(noComma ? targetNoComma : target);else return pass(noComma ? expressionNoComma : expression);
      };
    }

    function target(_, value) {
      if (value == "target") {
        cx.marked = "keyword";
        return cont(maybeoperatorComma);
      }
    }

    function targetNoComma(_, value) {
      if (value == "target") {
        cx.marked = "keyword";
        return cont(maybeoperatorNoComma);
      }
    }

    function maybelabel(type) {
      if (type == ":") return cont(poplex, statement);
      return pass(maybeoperatorComma, expect(";"), poplex);
    }

    function property(type) {
      if (type == "variable") {
        cx.marked = "property";
        return cont();
      }
    }

    function objprop(type, value) {
      if (type == "async") {
        cx.marked = "property";
        return cont(objprop);
      } else if (type == "variable" || cx.style == "keyword") {
        cx.marked = "property";
        if (value == "get" || value == "set") return cont(getterSetter);
        return cont(afterprop);
      } else if (type == "number" || type == "string") {
        cx.marked = jsonldMode ? "property" : cx.style + " property";
        return cont(afterprop);
      } else if (type == "jsonld-keyword") {
        return cont(afterprop);
      } else if (type == "modifier") {
        return cont(objprop);
      } else if (type == "[") {
        return cont(expression, expect("]"), afterprop);
      } else if (type == "spread") {
        return cont(expression);
      } else if (type == ":") {
        return pass(afterprop);
      }
    }

    function getterSetter(type) {
      if (type != "variable") return pass(afterprop);
      cx.marked = "property";
      return cont(functiondef);
    }

    function afterprop(type) {
      if (type == ":") return cont(expressionNoComma);
      if (type == "(") return pass(functiondef);
    }

    function commasep(what, end, sep) {
      function proceed(type, value) {
        if (sep ? sep.indexOf(type) > -1 : type == ",") {
          var lex = cx.state.lexical;
          if (lex.info == "call") lex.pos = (lex.pos || 0) + 1;
          return cont(function (type, value) {
            if (type == end || value == end) return pass();
            return pass(what);
          }, proceed);
        }

        if (type == end || value == end) return cont();
        return cont(expect(end));
      }

      return function (type, value) {
        if (type == end || value == end) return cont();
        return pass(what, proceed);
      };
    }

    function contCommasep(what, end, info) {
      for (var i = 3; i < arguments.length; i++) {
        cx.cc.push(arguments[i]);
      }

      return cont(pushlex(end, info), commasep(what, end), poplex);
    }

    function block(type) {
      if (type == "}") return cont();
      return pass(statement, block);
    }

    function maybetype(type, value) {
      if (isTS) {
        if (type == ":") return cont(typeexpr);
        if (value == "?") return cont(maybetype);
      }
    }

    function typeexpr(type) {
      if (type == "variable") {
        cx.marked = "variable-3";
        return cont(afterType);
      }

      if (type == "string" || type == "number" || type == "atom") return cont(afterType);
      if (type == "{") return cont(pushlex("}"), commasep(typeprop, "}", ",;"), poplex);
      if (type == "(") return cont(commasep(typearg, ")"), maybeReturnType);
    }

    function maybeReturnType(type) {
      if (type == "=>") return cont(typeexpr);
    }

    function typeprop(type, value) {
      if (type == "variable" || cx.style == "keyword") {
        cx.marked = "property";
        return cont(typeprop);
      } else if (value == "?") {
        return cont(typeprop);
      } else if (type == ":") {
        return cont(typeexpr);
      }
    }

    function typearg(type) {
      if (type == "variable") return cont(typearg);else if (type == ":") return cont(typeexpr);
    }

    function afterType(type, value) {
      if (value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType);
      if (value == "|" || type == ".") return cont(typeexpr);
      if (type == "[") return cont(expect("]"), afterType);
    }

    function vardef() {
      return pass(pattern, maybetype, maybeAssign, vardefCont);
    }

    function pattern(type, value) {
      if (type == "modifier") return cont(pattern);

      if (type == "variable") {
        register(value);
        return cont();
      }

      if (type == "spread") return cont(pattern);
      if (type == "[") return contCommasep(pattern, "]");
      if (type == "{") return contCommasep(proppattern, "}");
    }

    function proppattern(type, value) {
      if (type == "variable" && !cx.stream.match(/^\s*:/, false)) {
        register(value);
        return cont(maybeAssign);
      }

      if (type == "variable") cx.marked = "property";
      if (type == "spread") return cont(pattern);
      if (type == "}") return pass();
      return cont(expect(":"), pattern, maybeAssign);
    }

    function maybeAssign(_type, value) {
      if (value == "=") return cont(expressionNoComma);
    }

    function vardefCont(type) {
      if (type == ",") return cont(vardef);
    }

    function maybeelse(type, value) {
      if (type == "keyword b" && value == "else") return cont(pushlex("form", "else"), statement, poplex);
    }

    function forspec(type) {
      if (type == "(") return cont(pushlex(")"), forspec1, expect(")"), poplex);
    }

    function forspec1(type) {
      if (type == "var") return cont(vardef, expect(";"), forspec2);
      if (type == ";") return cont(forspec2);
      if (type == "variable") return cont(formaybeinof);
      return pass(expression, expect(";"), forspec2);
    }

    function formaybeinof(_type, value) {
      if (value == "in" || value == "of") {
        cx.marked = "keyword";
        return cont(expression);
      }

      return cont(maybeoperatorComma, forspec2);
    }

    function forspec2(type, value) {
      if (type == ";") return cont(forspec3);

      if (value == "in" || value == "of") {
        cx.marked = "keyword";
        return cont(expression);
      }

      return pass(expression, expect(";"), forspec3);
    }

    function forspec3(type) {
      if (type != ")") cont(expression);
    }

    function functiondef(type, value) {
      if (value == "*") {
        cx.marked = "keyword";
        return cont(functiondef);
      }

      if (type == "variable") {
        register(value);
        return cont(functiondef);
      }

      if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, maybetype, statement, popcontext);
    }

    function funarg(type) {
      if (type == "spread") return cont(funarg);
      return pass(pattern, maybetype, maybeAssign);
    }

    function classExpression(type, value) {
      // Class expressions may have an optional name.
      if (type == "variable") return className(type, value);
      return classNameAfter(type, value);
    }

    function className(type, value) {
      if (type == "variable") {
        register(value);
        return cont(classNameAfter);
      }
    }

    function classNameAfter(type, value) {
      if (value == "extends" || value == "implements") return cont(isTS ? typeexpr : expression, classNameAfter);
      if (type == "{") return cont(pushlex("}"), classBody, poplex);
    }

    function classBody(type, value) {
      if (type == "variable" || cx.style == "keyword") {
        if ((value == "static" || value == "get" || value == "set" || isTS && (value == "public" || value == "private" || value == "protected" || value == "readonly" || value == "abstract")) && cx.stream.match(/^\s+[\w$\xa1-\uffff]/, false)) {
          cx.marked = "keyword";
          return cont(classBody);
        }

        cx.marked = "property";
        return cont(isTS ? classfield : functiondef, classBody);
      }

      if (value == "*") {
        cx.marked = "keyword";
        return cont(classBody);
      }

      if (type == ";") return cont(classBody);
      if (type == "}") return cont();
    }

    function classfield(type, value) {
      if (value == "?") return cont(classfield);
      if (type == ":") return cont(typeexpr, maybeAssign);
      return pass(functiondef);
    }

    function afterExport(type, value) {
      if (value == "*") {
        cx.marked = "keyword";
        return cont(maybeFrom, expect(";"));
      }

      if (value == "default") {
        cx.marked = "keyword";
        return cont(expression, expect(";"));
      }

      if (type == "{") return cont(commasep(exportField, "}"), maybeFrom, expect(";"));
      return pass(statement);
    }

    function exportField(type, value) {
      if (value == "as") {
        cx.marked = "keyword";
        return cont(expect("variable"));
      }

      if (type == "variable") return pass(expressionNoComma, exportField);
    }

    function afterImport(type) {
      if (type == "string") return cont();
      return pass(importSpec, maybeMoreImports, maybeFrom);
    }

    function importSpec(type, value) {
      if (type == "{") return contCommasep(importSpec, "}");
      if (type == "variable") register(value);
      if (value == "*") cx.marked = "keyword";
      return cont(maybeAs);
    }

    function maybeMoreImports(type) {
      if (type == ",") return cont(importSpec, maybeMoreImports);
    }

    function maybeAs(_type, value) {
      if (value == "as") {
        cx.marked = "keyword";
        return cont(importSpec);
      }
    }

    function maybeFrom(_type, value) {
      if (value == "from") {
        cx.marked = "keyword";
        return cont(expression);
      }
    }

    function arrayLiteral(type) {
      if (type == "]") return cont();
      return pass(commasep(expressionNoComma, "]"));
    }

    function isContinuedStatement(state, textAfter) {
      return state.lastType == "operator" || state.lastType == "," || isOperatorChar.test(textAfter.charAt(0)) || /[,.]/.test(textAfter.charAt(0));
    } // Interface


    return {
      startState: function startState(basecolumn) {
        var state = {
          tokenize: tokenBase,
          lastType: "sof",
          cc: [],
          lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
          localVars: parserConfig.localVars,
          context: parserConfig.localVars && {
            vars: parserConfig.localVars
          },
          indented: basecolumn || 0
        };
        if (parserConfig.globalVars && _typeof(parserConfig.globalVars) == "object") state.globalVars = parserConfig.globalVars;
        return state;
      },
      token: function token(stream, state) {
        if (stream.sol()) {
          if (!state.lexical.hasOwnProperty("align")) state.lexical.align = false;
          state.indented = stream.indentation();
          findFatArrow(stream, state);
        }

        if (state.tokenize != tokenComment && stream.eatSpace()) return null;
        var style = state.tokenize(stream, state);
        if (type == "comment") return style;
        state.lastType = type == "operator" && (content == "++" || content == "--") ? "incdec" : type;
        return parseJS(state, style, type, content, stream);
      },
      indent: function indent(state, textAfter) {
        if (state.tokenize == tokenComment) return CodeMirror.Pass;
        if (state.tokenize != tokenBase) return 0;
        var firstChar = textAfter && textAfter.charAt(0),
            lexical = state.lexical,
            top; // Kludge to prevent 'maybelse' from blocking lexical scope pops

        if (!/^\s*else\b/.test(textAfter)) for (var i = state.cc.length - 1; i >= 0; --i) {
          var c = state.cc[i];
          if (c == poplex) lexical = lexical.prev;else if (c != maybeelse) break;
        }

        while ((lexical.type == "stat" || lexical.type == "form") && (firstChar == "}" || (top = state.cc[state.cc.length - 1]) && (top == maybeoperatorComma || top == maybeoperatorNoComma) && !/^[,\.=+\-*:?[\(]/.test(textAfter))) {
          lexical = lexical.prev;
        }

        if (statementIndent && lexical.type == ")" && lexical.prev.type == "stat") lexical = lexical.prev;
        var type = lexical.type,
            closing = firstChar == type;
        if (type == "vardef") return lexical.indented + (state.lastType == "operator" || state.lastType == "," ? lexical.info + 1 : 0);else if (type == "form" && firstChar == "{") return lexical.indented;else if (type == "form") return lexical.indented + indentUnit;else if (type == "stat") return lexical.indented + (isContinuedStatement(state, textAfter) ? statementIndent || indentUnit : 0);else if (lexical.info == "switch" && !closing && parserConfig.doubleIndentSwitch != false) return lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit);else if (lexical.align) return lexical.column + (closing ? 0 : 1);else return lexical.indented + (closing ? 0 : indentUnit);
      },
      electricInput: /^\s*(?:case .*?:|default:|\{|\})$/,
      blockCommentStart: jsonMode ? null : "/*",
      blockCommentEnd: jsonMode ? null : "*/",
      lineComment: jsonMode ? null : "//",
      fold: "brace",
      closeBrackets: "()[]{}''\"\"``",
      helperType: jsonMode ? "json" : "javascript",
      jsonldMode: jsonldMode,
      jsonMode: jsonMode,
      expressionAllowed: expressionAllowed,
      skipExpression: function skipExpression(state) {
        var top = state.cc[state.cc.length - 1];
        if (top == expression || top == expressionNoComma) state.cc.pop();
      }
    };
  });
  CodeMirror.registerHelper("wordChars", "javascript", /[\w$]/);
  CodeMirror.defineMIME("text/javascript", "javascript");
  CodeMirror.defineMIME("text/ecmascript", "javascript");
  CodeMirror.defineMIME("application/javascript", "javascript");
  CodeMirror.defineMIME("application/x-javascript", "javascript");
  CodeMirror.defineMIME("application/ecmascript", "javascript");
  CodeMirror.defineMIME("application/json", {
    name: "javascript",
    json: true
  });
  CodeMirror.defineMIME("application/x-json", {
    name: "javascript",
    json: true
  });
  CodeMirror.defineMIME("application/ld+json", {
    name: "javascript",
    jsonld: true
  });
  CodeMirror.defineMIME("text/typescript", {
    name: "javascript",
    typescript: true
  });
  CodeMirror.defineMIME("application/typescript", {
    name: "javascript",
    typescript: true
  });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhY2YtZmllbGRzL2phdmFzY3JpcHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBfdHlwZW9mKG9iaik7IH1cblxuLy8gQ29kZU1pcnJvciwgY29weXJpZ2h0IChjKSBieSBNYXJpam4gSGF2ZXJiZWtlIGFuZCBvdGhlcnNcbi8vIERpc3RyaWJ1dGVkIHVuZGVyIGFuIE1JVCBsaWNlbnNlOiBodHRwOi8vY29kZW1pcnJvci5uZXQvTElDRU5TRVxuKGZ1bmN0aW9uIChtb2QpIHtcbiAgaWYgKCh0eXBlb2YgZXhwb3J0cyA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBfdHlwZW9mKGV4cG9ydHMpKSA9PSBcIm9iamVjdFwiICYmICh0eXBlb2YgbW9kdWxlID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2YobW9kdWxlKSkgPT0gXCJvYmplY3RcIikgLy8gQ29tbW9uSlNcbiAgICBtb2QocmVxdWlyZShcIi4uLy4uL2xpYi9jb2RlbWlycm9yXCIpKTtlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSAvLyBBTURcbiAgICBkZWZpbmUoW1wiLi4vLi4vbGliL2NvZGVtaXJyb3JcIl0sIG1vZCk7ZWxzZSAvLyBQbGFpbiBicm93c2VyIGVudlxuICAgIG1vZChDb2RlTWlycm9yKTtcbn0pKGZ1bmN0aW9uIChDb2RlTWlycm9yKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGZ1bmN0aW9uIGV4cHJlc3Npb25BbGxvd2VkKHN0cmVhbSwgc3RhdGUsIGJhY2tVcCkge1xuICAgIHJldHVybiAvXig/Om9wZXJhdG9yfHNvZnxrZXl3b3JkIGN8Y2FzZXxuZXd8ZXhwb3J0fGRlZmF1bHR8W1xcW3t9XFwoLDs6XXw9PikkLy50ZXN0KHN0YXRlLmxhc3RUeXBlKSB8fCBzdGF0ZS5sYXN0VHlwZSA9PSBcInF1YXNpXCIgJiYgL1xce1xccyokLy50ZXN0KHN0cmVhbS5zdHJpbmcuc2xpY2UoMCwgc3RyZWFtLnBvcyAtIChiYWNrVXAgfHwgMCkpKTtcbiAgfVxuXG4gIENvZGVNaXJyb3IuZGVmaW5lTW9kZShcImphdmFzY3JpcHRcIiwgZnVuY3Rpb24gKGNvbmZpZywgcGFyc2VyQ29uZmlnKSB7XG4gICAgdmFyIGluZGVudFVuaXQgPSBjb25maWcuaW5kZW50VW5pdDtcbiAgICB2YXIgc3RhdGVtZW50SW5kZW50ID0gcGFyc2VyQ29uZmlnLnN0YXRlbWVudEluZGVudDtcbiAgICB2YXIganNvbmxkTW9kZSA9IHBhcnNlckNvbmZpZy5qc29ubGQ7XG4gICAgdmFyIGpzb25Nb2RlID0gcGFyc2VyQ29uZmlnLmpzb24gfHwganNvbmxkTW9kZTtcbiAgICB2YXIgaXNUUyA9IHBhcnNlckNvbmZpZy50eXBlc2NyaXB0O1xuICAgIHZhciB3b3JkUkUgPSBwYXJzZXJDb25maWcud29yZENoYXJhY3RlcnMgfHwgL1tcXHckXFx4YTEtXFx1ZmZmZl0vOyAvLyBUb2tlbml6ZXJcblxuICAgIHZhciBrZXl3b3JkcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGZ1bmN0aW9uIGt3KHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgIHN0eWxlOiBcImtleXdvcmRcIlxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB2YXIgQSA9IGt3KFwia2V5d29yZCBhXCIpLFxuICAgICAgICAgIEIgPSBrdyhcImtleXdvcmQgYlwiKSxcbiAgICAgICAgICBDID0ga3coXCJrZXl3b3JkIGNcIik7XG4gICAgICB2YXIgb3BlcmF0b3IgPSBrdyhcIm9wZXJhdG9yXCIpLFxuICAgICAgICAgIGF0b20gPSB7XG4gICAgICAgIHR5cGU6IFwiYXRvbVwiLFxuICAgICAgICBzdHlsZTogXCJhdG9tXCJcbiAgICAgIH07XG4gICAgICB2YXIganNLZXl3b3JkcyA9IHtcbiAgICAgICAgXCJpZlwiOiBrdyhcImlmXCIpLFxuICAgICAgICBcIndoaWxlXCI6IEEsXG4gICAgICAgIFwid2l0aFwiOiBBLFxuICAgICAgICBcImVsc2VcIjogQixcbiAgICAgICAgXCJkb1wiOiBCLFxuICAgICAgICBcInRyeVwiOiBCLFxuICAgICAgICBcImZpbmFsbHlcIjogQixcbiAgICAgICAgXCJyZXR1cm5cIjogQyxcbiAgICAgICAgXCJicmVha1wiOiBDLFxuICAgICAgICBcImNvbnRpbnVlXCI6IEMsXG4gICAgICAgIFwibmV3XCI6IGt3KFwibmV3XCIpLFxuICAgICAgICBcImRlbGV0ZVwiOiBDLFxuICAgICAgICBcInRocm93XCI6IEMsXG4gICAgICAgIFwiZGVidWdnZXJcIjogQyxcbiAgICAgICAgXCJ2YXJcIjoga3coXCJ2YXJcIiksXG4gICAgICAgIFwiY29uc3RcIjoga3coXCJ2YXJcIiksXG4gICAgICAgIFwibGV0XCI6IGt3KFwidmFyXCIpLFxuICAgICAgICBcImZ1bmN0aW9uXCI6IGt3KFwiZnVuY3Rpb25cIiksXG4gICAgICAgIFwiY2F0Y2hcIjoga3coXCJjYXRjaFwiKSxcbiAgICAgICAgXCJmb3JcIjoga3coXCJmb3JcIiksXG4gICAgICAgIFwic3dpdGNoXCI6IGt3KFwic3dpdGNoXCIpLFxuICAgICAgICBcImNhc2VcIjoga3coXCJjYXNlXCIpLFxuICAgICAgICBcImRlZmF1bHRcIjoga3coXCJkZWZhdWx0XCIpLFxuICAgICAgICBcImluXCI6IG9wZXJhdG9yLFxuICAgICAgICBcInR5cGVvZlwiOiBvcGVyYXRvcixcbiAgICAgICAgXCJpbnN0YW5jZW9mXCI6IG9wZXJhdG9yLFxuICAgICAgICBcInRydWVcIjogYXRvbSxcbiAgICAgICAgXCJmYWxzZVwiOiBhdG9tLFxuICAgICAgICBcIm51bGxcIjogYXRvbSxcbiAgICAgICAgXCJ1bmRlZmluZWRcIjogYXRvbSxcbiAgICAgICAgXCJOYU5cIjogYXRvbSxcbiAgICAgICAgXCJJbmZpbml0eVwiOiBhdG9tLFxuICAgICAgICBcInRoaXNcIjoga3coXCJ0aGlzXCIpLFxuICAgICAgICBcImNsYXNzXCI6IGt3KFwiY2xhc3NcIiksXG4gICAgICAgIFwic3VwZXJcIjoga3coXCJhdG9tXCIpLFxuICAgICAgICBcInlpZWxkXCI6IEMsXG4gICAgICAgIFwiZXhwb3J0XCI6IGt3KFwiZXhwb3J0XCIpLFxuICAgICAgICBcImltcG9ydFwiOiBrdyhcImltcG9ydFwiKSxcbiAgICAgICAgXCJleHRlbmRzXCI6IEMsXG4gICAgICAgIFwiYXdhaXRcIjogQyxcbiAgICAgICAgXCJhc3luY1wiOiBrdyhcImFzeW5jXCIpXG4gICAgICB9OyAvLyBFeHRlbmQgdGhlICdub3JtYWwnIGtleXdvcmRzIHdpdGggdGhlIFR5cGVTY3JpcHQgbGFuZ3VhZ2UgZXh0ZW5zaW9uc1xuXG4gICAgICBpZiAoaXNUUykge1xuICAgICAgICB2YXIgdHlwZSA9IHtcbiAgICAgICAgICB0eXBlOiBcInZhcmlhYmxlXCIsXG4gICAgICAgICAgc3R5bGU6IFwidmFyaWFibGUtM1wiXG4gICAgICAgIH07XG4gICAgICAgIHZhciB0c0tleXdvcmRzID0ge1xuICAgICAgICAgIC8vIG9iamVjdC1saWtlIHRoaW5nc1xuICAgICAgICAgIFwiaW50ZXJmYWNlXCI6IGt3KFwiY2xhc3NcIiksXG4gICAgICAgICAgXCJpbXBsZW1lbnRzXCI6IEMsXG4gICAgICAgICAgXCJuYW1lc3BhY2VcIjogQyxcbiAgICAgICAgICBcIm1vZHVsZVwiOiBrdyhcIm1vZHVsZVwiKSxcbiAgICAgICAgICBcImVudW1cIjoga3coXCJtb2R1bGVcIiksXG4gICAgICAgICAgXCJ0eXBlXCI6IGt3KFwidHlwZVwiKSxcbiAgICAgICAgICAvLyBzY29wZSBtb2RpZmllcnNcbiAgICAgICAgICBcInB1YmxpY1wiOiBrdyhcIm1vZGlmaWVyXCIpLFxuICAgICAgICAgIFwicHJpdmF0ZVwiOiBrdyhcIm1vZGlmaWVyXCIpLFxuICAgICAgICAgIFwicHJvdGVjdGVkXCI6IGt3KFwibW9kaWZpZXJcIiksXG4gICAgICAgICAgXCJhYnN0cmFjdFwiOiBrdyhcIm1vZGlmaWVyXCIpLFxuICAgICAgICAgIC8vIG9wZXJhdG9yc1xuICAgICAgICAgIFwiYXNcIjogb3BlcmF0b3IsXG4gICAgICAgICAgLy8gdHlwZXNcbiAgICAgICAgICBcInN0cmluZ1wiOiB0eXBlLFxuICAgICAgICAgIFwibnVtYmVyXCI6IHR5cGUsXG4gICAgICAgICAgXCJib29sZWFuXCI6IHR5cGUsXG4gICAgICAgICAgXCJhbnlcIjogdHlwZVxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAodmFyIGF0dHIgaW4gdHNLZXl3b3Jkcykge1xuICAgICAgICAgIGpzS2V5d29yZHNbYXR0cl0gPSB0c0tleXdvcmRzW2F0dHJdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBqc0tleXdvcmRzO1xuICAgIH0oKTtcblxuICAgIHZhciBpc09wZXJhdG9yQ2hhciA9IC9bK1xcLSomJT08PiE/fH5eXS87XG4gICAgdmFyIGlzSnNvbmxkS2V5d29yZCA9IC9eQChjb250ZXh0fGlkfHZhbHVlfGxhbmd1YWdlfHR5cGV8Y29udGFpbmVyfGxpc3R8c2V0fHJldmVyc2V8aW5kZXh8YmFzZXx2b2NhYnxncmFwaClcIi87XG5cbiAgICBmdW5jdGlvbiByZWFkUmVnZXhwKHN0cmVhbSkge1xuICAgICAgdmFyIGVzY2FwZWQgPSBmYWxzZSxcbiAgICAgICAgICBuZXh0LFxuICAgICAgICAgIGluU2V0ID0gZmFsc2U7XG5cbiAgICAgIHdoaWxlICgobmV4dCA9IHN0cmVhbS5uZXh0KCkpICE9IG51bGwpIHtcbiAgICAgICAgaWYgKCFlc2NhcGVkKSB7XG4gICAgICAgICAgaWYgKG5leHQgPT0gXCIvXCIgJiYgIWluU2V0KSByZXR1cm47XG4gICAgICAgICAgaWYgKG5leHQgPT0gXCJbXCIpIGluU2V0ID0gdHJ1ZTtlbHNlIGlmIChpblNldCAmJiBuZXh0ID09IFwiXVwiKSBpblNldCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZXNjYXBlZCA9ICFlc2NhcGVkICYmIG5leHQgPT0gXCJcXFxcXCI7XG4gICAgICB9XG4gICAgfSAvLyBVc2VkIGFzIHNjcmF0Y2ggdmFyaWFibGVzIHRvIGNvbW11bmljYXRlIG11bHRpcGxlIHZhbHVlcyB3aXRob3V0XG4gICAgLy8gY29uc2luZyB1cCB0b25zIG9mIG9iamVjdHMuXG5cblxuICAgIHZhciB0eXBlLCBjb250ZW50O1xuXG4gICAgZnVuY3Rpb24gcmV0KHRwLCBzdHlsZSwgY29udCkge1xuICAgICAgdHlwZSA9IHRwO1xuICAgICAgY29udGVudCA9IGNvbnQ7XG4gICAgICByZXR1cm4gc3R5bGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9rZW5CYXNlKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG5cbiAgICAgIGlmIChjaCA9PSAnXCInIHx8IGNoID09IFwiJ1wiKSB7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gdG9rZW5TdHJpbmcoY2gpO1xuICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICB9IGVsc2UgaWYgKGNoID09IFwiLlwiICYmIHN0cmVhbS5tYXRjaCgvXlxcZCsoPzpbZUVdWytcXC1dP1xcZCspPy8pKSB7XG4gICAgICAgIHJldHVybiByZXQoXCJudW1iZXJcIiwgXCJudW1iZXJcIik7XG4gICAgICB9IGVsc2UgaWYgKGNoID09IFwiLlwiICYmIHN0cmVhbS5tYXRjaChcIi4uXCIpKSB7XG4gICAgICAgIHJldHVybiByZXQoXCJzcHJlYWRcIiwgXCJtZXRhXCIpO1xuICAgICAgfSBlbHNlIGlmICgvW1xcW1xcXXt9XFwoXFwpLDtcXDpcXC5dLy50ZXN0KGNoKSkge1xuICAgICAgICByZXR1cm4gcmV0KGNoKTtcbiAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI9XCIgJiYgc3RyZWFtLmVhdChcIj5cIikpIHtcbiAgICAgICAgcmV0dXJuIHJldChcIj0+XCIsIFwib3BlcmF0b3JcIik7XG4gICAgICB9IGVsc2UgaWYgKGNoID09IFwiMFwiICYmIHN0cmVhbS5lYXQoL3gvaSkpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFxkYS1mXS9pKTtcbiAgICAgICAgcmV0dXJuIHJldChcIm51bWJlclwiLCBcIm51bWJlclwiKTtcbiAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCIwXCIgJiYgc3RyZWFtLmVhdCgvby9pKSkge1xuICAgICAgICBzdHJlYW0uZWF0V2hpbGUoL1swLTddL2kpO1xuICAgICAgICByZXR1cm4gcmV0KFwibnVtYmVyXCIsIFwibnVtYmVyXCIpO1xuICAgICAgfSBlbHNlIGlmIChjaCA9PSBcIjBcIiAmJiBzdHJlYW0uZWF0KC9iL2kpKSB7XG4gICAgICAgIHN0cmVhbS5lYXRXaGlsZSgvWzAxXS9pKTtcbiAgICAgICAgcmV0dXJuIHJldChcIm51bWJlclwiLCBcIm51bWJlclwiKTtcbiAgICAgIH0gZWxzZSBpZiAoL1xcZC8udGVzdChjaCkpIHtcbiAgICAgICAgc3RyZWFtLm1hdGNoKC9eXFxkKig/OlxcLlxcZCopPyg/OltlRV1bK1xcLV0/XFxkKyk/Lyk7XG4gICAgICAgIHJldHVybiByZXQoXCJudW1iZXJcIiwgXCJudW1iZXJcIik7XG4gICAgICB9IGVsc2UgaWYgKGNoID09IFwiL1wiKSB7XG4gICAgICAgIGlmIChzdHJlYW0uZWF0KFwiKlwiKSkge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gdG9rZW5Db21tZW50O1xuICAgICAgICAgIHJldHVybiB0b2tlbkNvbW1lbnQoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLmVhdChcIi9cIikpIHtcbiAgICAgICAgICBzdHJlYW0uc2tpcFRvRW5kKCk7XG4gICAgICAgICAgcmV0dXJuIHJldChcImNvbW1lbnRcIiwgXCJjb21tZW50XCIpO1xuICAgICAgICB9IGVsc2UgaWYgKGV4cHJlc3Npb25BbGxvd2VkKHN0cmVhbSwgc3RhdGUsIDEpKSB7XG4gICAgICAgICAgcmVhZFJlZ2V4cChzdHJlYW0pO1xuICAgICAgICAgIHN0cmVhbS5tYXRjaCgvXlxcYigoW2dpbXl1XSkoPyFbZ2lteXVdKlxcMikpK1xcYi8pO1xuICAgICAgICAgIHJldHVybiByZXQoXCJyZWdleHBcIiwgXCJzdHJpbmctMlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHJlYW0uZWF0V2hpbGUoaXNPcGVyYXRvckNoYXIpO1xuICAgICAgICAgIHJldHVybiByZXQoXCJvcGVyYXRvclwiLCBcIm9wZXJhdG9yXCIsIHN0cmVhbS5jdXJyZW50KCkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGNoID09IFwiYFwiKSB7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gdG9rZW5RdWFzaTtcbiAgICAgICAgcmV0dXJuIHRva2VuUXVhc2koc3RyZWFtLCBzdGF0ZSk7XG4gICAgICB9IGVsc2UgaWYgKGNoID09IFwiI1wiKSB7XG4gICAgICAgIHN0cmVhbS5za2lwVG9FbmQoKTtcbiAgICAgICAgcmV0dXJuIHJldChcImVycm9yXCIsIFwiZXJyb3JcIik7XG4gICAgICB9IGVsc2UgaWYgKGlzT3BlcmF0b3JDaGFyLnRlc3QoY2gpKSB7XG4gICAgICAgIGlmIChjaCAhPSBcIj5cIiB8fCAhc3RhdGUubGV4aWNhbCB8fCBzdGF0ZS5sZXhpY2FsLnR5cGUgIT0gXCI+XCIpIHN0cmVhbS5lYXRXaGlsZShpc09wZXJhdG9yQ2hhcik7XG4gICAgICAgIHJldHVybiByZXQoXCJvcGVyYXRvclwiLCBcIm9wZXJhdG9yXCIsIHN0cmVhbS5jdXJyZW50KCkpO1xuICAgICAgfSBlbHNlIGlmICh3b3JkUkUudGVzdChjaCkpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKHdvcmRSRSk7XG4gICAgICAgIHZhciB3b3JkID0gc3RyZWFtLmN1cnJlbnQoKSxcbiAgICAgICAgICAgIGtub3duID0ga2V5d29yZHMucHJvcGVydHlJc0VudW1lcmFibGUod29yZCkgJiYga2V5d29yZHNbd29yZF07XG4gICAgICAgIHJldHVybiBrbm93biAmJiBzdGF0ZS5sYXN0VHlwZSAhPSBcIi5cIiA/IHJldChrbm93bi50eXBlLCBrbm93bi5zdHlsZSwgd29yZCkgOiByZXQoXCJ2YXJpYWJsZVwiLCBcInZhcmlhYmxlXCIsIHdvcmQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRva2VuU3RyaW5nKHF1b3RlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgICAgdmFyIGVzY2FwZWQgPSBmYWxzZSxcbiAgICAgICAgICAgIG5leHQ7XG5cbiAgICAgICAgaWYgKGpzb25sZE1vZGUgJiYgc3RyZWFtLnBlZWsoKSA9PSBcIkBcIiAmJiBzdHJlYW0ubWF0Y2goaXNKc29ubGRLZXl3b3JkKSkge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gdG9rZW5CYXNlO1xuICAgICAgICAgIHJldHVybiByZXQoXCJqc29ubGQta2V5d29yZFwiLCBcIm1ldGFcIik7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoKG5leHQgPSBzdHJlYW0ubmV4dCgpKSAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKG5leHQgPT0gcXVvdGUgJiYgIWVzY2FwZWQpIGJyZWFrO1xuICAgICAgICAgIGVzY2FwZWQgPSAhZXNjYXBlZCAmJiBuZXh0ID09IFwiXFxcXFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFlc2NhcGVkKSBzdGF0ZS50b2tlbml6ZSA9IHRva2VuQmFzZTtcbiAgICAgICAgcmV0dXJuIHJldChcInN0cmluZ1wiLCBcInN0cmluZ1wiKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9rZW5Db21tZW50KHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHZhciBtYXliZUVuZCA9IGZhbHNlLFxuICAgICAgICAgIGNoO1xuXG4gICAgICB3aGlsZSAoY2ggPSBzdHJlYW0ubmV4dCgpKSB7XG4gICAgICAgIGlmIChjaCA9PSBcIi9cIiAmJiBtYXliZUVuZCkge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gdG9rZW5CYXNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgbWF5YmVFbmQgPSBjaCA9PSBcIipcIjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJldChcImNvbW1lbnRcIiwgXCJjb21tZW50XCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRva2VuUXVhc2koc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgdmFyIGVzY2FwZWQgPSBmYWxzZSxcbiAgICAgICAgICBuZXh0O1xuXG4gICAgICB3aGlsZSAoKG5leHQgPSBzdHJlYW0ubmV4dCgpKSAhPSBudWxsKSB7XG4gICAgICAgIGlmICghZXNjYXBlZCAmJiAobmV4dCA9PSBcImBcIiB8fCBuZXh0ID09IFwiJFwiICYmIHN0cmVhbS5lYXQoXCJ7XCIpKSkge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gdG9rZW5CYXNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgZXNjYXBlZCA9ICFlc2NhcGVkICYmIG5leHQgPT0gXCJcXFxcXCI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXQoXCJxdWFzaVwiLCBcInN0cmluZy0yXCIsIHN0cmVhbS5jdXJyZW50KCkpO1xuICAgIH1cblxuICAgIHZhciBicmFja2V0cyA9IFwiKFt7fV0pXCI7IC8vIFRoaXMgaXMgYSBjcnVkZSBsb29rYWhlYWQgdHJpY2sgdG8gdHJ5IGFuZCBub3RpY2UgdGhhdCB3ZSdyZVxuICAgIC8vIHBhcnNpbmcgdGhlIGFyZ3VtZW50IHBhdHRlcm5zIGZvciBhIGZhdC1hcnJvdyBmdW5jdGlvbiBiZWZvcmUgd2VcbiAgICAvLyBhY3R1YWxseSBoaXQgdGhlIGFycm93IHRva2VuLiBJdCBvbmx5IHdvcmtzIGlmIHRoZSBhcnJvdyBpcyBvblxuICAgIC8vIHRoZSBzYW1lIGxpbmUgYXMgdGhlIGFyZ3VtZW50cyBhbmQgdGhlcmUncyBubyBzdHJhbmdlIG5vaXNlXG4gICAgLy8gKGNvbW1lbnRzKSBpbiBiZXR3ZWVuLiBGYWxsYmFjayBpcyB0byBvbmx5IG5vdGljZSB3aGVuIHdlIGhpdCB0aGVcbiAgICAvLyBhcnJvdywgYW5kIG5vdCBkZWNsYXJlIHRoZSBhcmd1bWVudHMgYXMgbG9jYWxzIGZvciB0aGUgYXJyb3dcbiAgICAvLyBib2R5LlxuXG4gICAgZnVuY3Rpb24gZmluZEZhdEFycm93KHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmIChzdGF0ZS5mYXRBcnJvd0F0KSBzdGF0ZS5mYXRBcnJvd0F0ID0gbnVsbDtcbiAgICAgIHZhciBhcnJvdyA9IHN0cmVhbS5zdHJpbmcuaW5kZXhPZihcIj0+XCIsIHN0cmVhbS5zdGFydCk7XG4gICAgICBpZiAoYXJyb3cgPCAwKSByZXR1cm47XG5cbiAgICAgIGlmIChpc1RTKSB7XG4gICAgICAgIC8vIFRyeSB0byBza2lwIFR5cGVTY3JpcHQgcmV0dXJuIHR5cGUgZGVjbGFyYXRpb25zIGFmdGVyIHRoZSBhcmd1bWVudHNcbiAgICAgICAgdmFyIG0gPSAvOlxccyooPzpcXHcrKD86PFtePl0qPnxcXFtcXF0pP3xcXHtbXn1dKlxcfSlcXHMqJC8uZXhlYyhzdHJlYW0uc3RyaW5nLnNsaWNlKHN0cmVhbS5zdGFydCwgYXJyb3cpKTtcbiAgICAgICAgaWYgKG0pIGFycm93ID0gbS5pbmRleDtcbiAgICAgIH1cblxuICAgICAgdmFyIGRlcHRoID0gMCxcbiAgICAgICAgICBzYXdTb21ldGhpbmcgPSBmYWxzZTtcblxuICAgICAgZm9yICh2YXIgcG9zID0gYXJyb3cgLSAxOyBwb3MgPj0gMDsgLS1wb3MpIHtcbiAgICAgICAgdmFyIGNoID0gc3RyZWFtLnN0cmluZy5jaGFyQXQocG9zKTtcbiAgICAgICAgdmFyIGJyYWNrZXQgPSBicmFja2V0cy5pbmRleE9mKGNoKTtcblxuICAgICAgICBpZiAoYnJhY2tldCA+PSAwICYmIGJyYWNrZXQgPCAzKSB7XG4gICAgICAgICAgaWYgKCFkZXB0aCkge1xuICAgICAgICAgICAgKytwb3M7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoLS1kZXB0aCA9PSAwKSB7XG4gICAgICAgICAgICBpZiAoY2ggPT0gXCIoXCIpIHNhd1NvbWV0aGluZyA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYnJhY2tldCA+PSAzICYmIGJyYWNrZXQgPCA2KSB7XG4gICAgICAgICAgKytkZXB0aDtcbiAgICAgICAgfSBlbHNlIGlmICh3b3JkUkUudGVzdChjaCkpIHtcbiAgICAgICAgICBzYXdTb21ldGhpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKC9bXCInXFwvXS8udGVzdChjaCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoc2F3U29tZXRoaW5nICYmICFkZXB0aCkge1xuICAgICAgICAgICsrcG9zO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzYXdTb21ldGhpbmcgJiYgIWRlcHRoKSBzdGF0ZS5mYXRBcnJvd0F0ID0gcG9zO1xuICAgIH0gLy8gUGFyc2VyXG5cblxuICAgIHZhciBhdG9taWNUeXBlcyA9IHtcbiAgICAgIFwiYXRvbVwiOiB0cnVlLFxuICAgICAgXCJudW1iZXJcIjogdHJ1ZSxcbiAgICAgIFwidmFyaWFibGVcIjogdHJ1ZSxcbiAgICAgIFwic3RyaW5nXCI6IHRydWUsXG4gICAgICBcInJlZ2V4cFwiOiB0cnVlLFxuICAgICAgXCJ0aGlzXCI6IHRydWUsXG4gICAgICBcImpzb25sZC1rZXl3b3JkXCI6IHRydWVcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gSlNMZXhpY2FsKGluZGVudGVkLCBjb2x1bW4sIHR5cGUsIGFsaWduLCBwcmV2LCBpbmZvKSB7XG4gICAgICB0aGlzLmluZGVudGVkID0gaW5kZW50ZWQ7XG4gICAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICB0aGlzLnByZXYgPSBwcmV2O1xuICAgICAgdGhpcy5pbmZvID0gaW5mbztcbiAgICAgIGlmIChhbGlnbiAhPSBudWxsKSB0aGlzLmFsaWduID0gYWxpZ247XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5TY29wZShzdGF0ZSwgdmFybmFtZSkge1xuICAgICAgZm9yICh2YXIgdiA9IHN0YXRlLmxvY2FsVmFyczsgdjsgdiA9IHYubmV4dCkge1xuICAgICAgICBpZiAodi5uYW1lID09IHZhcm5hbWUpIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBjeCA9IHN0YXRlLmNvbnRleHQ7IGN4OyBjeCA9IGN4LnByZXYpIHtcbiAgICAgICAgZm9yICh2YXIgdiA9IGN4LnZhcnM7IHY7IHYgPSB2Lm5leHQpIHtcbiAgICAgICAgICBpZiAodi5uYW1lID09IHZhcm5hbWUpIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VKUyhzdGF0ZSwgc3R5bGUsIHR5cGUsIGNvbnRlbnQsIHN0cmVhbSkge1xuICAgICAgdmFyIGNjID0gc3RhdGUuY2M7IC8vIENvbW11bmljYXRlIG91ciBjb250ZXh0IHRvIHRoZSBjb21iaW5hdG9ycy5cbiAgICAgIC8vIChMZXNzIHdhc3RlZnVsIHRoYW4gY29uc2luZyB1cCBhIGh1bmRyZWQgY2xvc3VyZXMgb24gZXZlcnkgY2FsbC4pXG5cbiAgICAgIGN4LnN0YXRlID0gc3RhdGU7XG4gICAgICBjeC5zdHJlYW0gPSBzdHJlYW07XG4gICAgICBjeC5tYXJrZWQgPSBudWxsLCBjeC5jYyA9IGNjO1xuICAgICAgY3guc3R5bGUgPSBzdHlsZTtcbiAgICAgIGlmICghc3RhdGUubGV4aWNhbC5oYXNPd25Qcm9wZXJ0eShcImFsaWduXCIpKSBzdGF0ZS5sZXhpY2FsLmFsaWduID0gdHJ1ZTtcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGNvbWJpbmF0b3IgPSBjYy5sZW5ndGggPyBjYy5wb3AoKSA6IGpzb25Nb2RlID8gZXhwcmVzc2lvbiA6IHN0YXRlbWVudDtcblxuICAgICAgICBpZiAoY29tYmluYXRvcih0eXBlLCBjb250ZW50KSkge1xuICAgICAgICAgIHdoaWxlIChjYy5sZW5ndGggJiYgY2NbY2MubGVuZ3RoIC0gMV0ubGV4KSB7XG4gICAgICAgICAgICBjYy5wb3AoKSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjeC5tYXJrZWQpIHJldHVybiBjeC5tYXJrZWQ7XG4gICAgICAgICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiICYmIGluU2NvcGUoc3RhdGUsIGNvbnRlbnQpKSByZXR1cm4gXCJ2YXJpYWJsZS0yXCI7XG4gICAgICAgICAgcmV0dXJuIHN0eWxlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSAvLyBDb21iaW5hdG9yIHV0aWxzXG5cblxuICAgIHZhciBjeCA9IHtcbiAgICAgIHN0YXRlOiBudWxsLFxuICAgICAgY29sdW1uOiBudWxsLFxuICAgICAgbWFya2VkOiBudWxsLFxuICAgICAgY2M6IG51bGxcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcGFzcygpIHtcbiAgICAgIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgY3guY2MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbnQoKSB7XG4gICAgICBwYXNzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWdpc3Rlcih2YXJuYW1lKSB7XG4gICAgICBmdW5jdGlvbiBpbkxpc3QobGlzdCkge1xuICAgICAgICBmb3IgKHZhciB2ID0gbGlzdDsgdjsgdiA9IHYubmV4dCkge1xuICAgICAgICAgIGlmICh2Lm5hbWUgPT0gdmFybmFtZSkgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBzdGF0ZSA9IGN4LnN0YXRlO1xuICAgICAgY3gubWFya2VkID0gXCJkZWZcIjtcblxuICAgICAgaWYgKHN0YXRlLmNvbnRleHQpIHtcbiAgICAgICAgaWYgKGluTGlzdChzdGF0ZS5sb2NhbFZhcnMpKSByZXR1cm47XG4gICAgICAgIHN0YXRlLmxvY2FsVmFycyA9IHtcbiAgICAgICAgICBuYW1lOiB2YXJuYW1lLFxuICAgICAgICAgIG5leHQ6IHN0YXRlLmxvY2FsVmFyc1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGluTGlzdChzdGF0ZS5nbG9iYWxWYXJzKSkgcmV0dXJuO1xuICAgICAgICBpZiAocGFyc2VyQ29uZmlnLmdsb2JhbFZhcnMpIHN0YXRlLmdsb2JhbFZhcnMgPSB7XG4gICAgICAgICAgbmFtZTogdmFybmFtZSxcbiAgICAgICAgICBuZXh0OiBzdGF0ZS5nbG9iYWxWYXJzXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSAvLyBDb21iaW5hdG9yc1xuXG5cbiAgICB2YXIgZGVmYXVsdFZhcnMgPSB7XG4gICAgICBuYW1lOiBcInRoaXNcIixcbiAgICAgIG5leHQ6IHtcbiAgICAgICAgbmFtZTogXCJhcmd1bWVudHNcIlxuICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBwdXNoY29udGV4dCgpIHtcbiAgICAgIGN4LnN0YXRlLmNvbnRleHQgPSB7XG4gICAgICAgIHByZXY6IGN4LnN0YXRlLmNvbnRleHQsXG4gICAgICAgIHZhcnM6IGN4LnN0YXRlLmxvY2FsVmFyc1xuICAgICAgfTtcbiAgICAgIGN4LnN0YXRlLmxvY2FsVmFycyA9IGRlZmF1bHRWYXJzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvcGNvbnRleHQoKSB7XG4gICAgICBjeC5zdGF0ZS5sb2NhbFZhcnMgPSBjeC5zdGF0ZS5jb250ZXh0LnZhcnM7XG4gICAgICBjeC5zdGF0ZS5jb250ZXh0ID0gY3guc3RhdGUuY29udGV4dC5wcmV2O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHB1c2hsZXgodHlwZSwgaW5mbykge1xuICAgICAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uIHJlc3VsdCgpIHtcbiAgICAgICAgdmFyIHN0YXRlID0gY3guc3RhdGUsXG4gICAgICAgICAgICBpbmRlbnQgPSBzdGF0ZS5pbmRlbnRlZDtcbiAgICAgICAgaWYgKHN0YXRlLmxleGljYWwudHlwZSA9PSBcInN0YXRcIikgaW5kZW50ID0gc3RhdGUubGV4aWNhbC5pbmRlbnRlZDtlbHNlIGZvciAodmFyIG91dGVyID0gc3RhdGUubGV4aWNhbDsgb3V0ZXIgJiYgb3V0ZXIudHlwZSA9PSBcIilcIiAmJiBvdXRlci5hbGlnbjsgb3V0ZXIgPSBvdXRlci5wcmV2KSB7XG4gICAgICAgICAgaW5kZW50ID0gb3V0ZXIuaW5kZW50ZWQ7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUubGV4aWNhbCA9IG5ldyBKU0xleGljYWwoaW5kZW50LCBjeC5zdHJlYW0uY29sdW1uKCksIHR5cGUsIG51bGwsIHN0YXRlLmxleGljYWwsIGluZm8pO1xuICAgICAgfTtcblxuICAgICAgcmVzdWx0LmxleCA9IHRydWU7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvcGxleCgpIHtcbiAgICAgIHZhciBzdGF0ZSA9IGN4LnN0YXRlO1xuXG4gICAgICBpZiAoc3RhdGUubGV4aWNhbC5wcmV2KSB7XG4gICAgICAgIGlmIChzdGF0ZS5sZXhpY2FsLnR5cGUgPT0gXCIpXCIpIHN0YXRlLmluZGVudGVkID0gc3RhdGUubGV4aWNhbC5pbmRlbnRlZDtcbiAgICAgICAgc3RhdGUubGV4aWNhbCA9IHN0YXRlLmxleGljYWwucHJldjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwb3BsZXgubGV4ID0gdHJ1ZTtcblxuICAgIGZ1bmN0aW9uIGV4cGVjdCh3YW50ZWQpIHtcbiAgICAgIGZ1bmN0aW9uIGV4cCh0eXBlKSB7XG4gICAgICAgIGlmICh0eXBlID09IHdhbnRlZCkgcmV0dXJuIGNvbnQoKTtlbHNlIGlmICh3YW50ZWQgPT0gXCI7XCIpIHJldHVybiBwYXNzKCk7ZWxzZSByZXR1cm4gY29udChleHApO1xuICAgICAgfVxuXG4gICAgICA7XG4gICAgICByZXR1cm4gZXhwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0YXRlbWVudCh0eXBlLCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCJ2YXJcIikgcmV0dXJuIGNvbnQocHVzaGxleChcInZhcmRlZlwiLCB2YWx1ZS5sZW5ndGgpLCB2YXJkZWYsIGV4cGVjdChcIjtcIiksIHBvcGxleCk7XG4gICAgICBpZiAodHlwZSA9PSBcImtleXdvcmQgYVwiKSByZXR1cm4gY29udChwdXNobGV4KFwiZm9ybVwiKSwgcGFyZW5FeHByLCBzdGF0ZW1lbnQsIHBvcGxleCk7XG4gICAgICBpZiAodHlwZSA9PSBcImtleXdvcmQgYlwiKSByZXR1cm4gY29udChwdXNobGV4KFwiZm9ybVwiKSwgc3RhdGVtZW50LCBwb3BsZXgpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJ7XCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJ9XCIpLCBibG9jaywgcG9wbGV4KTtcbiAgICAgIGlmICh0eXBlID09IFwiO1wiKSByZXR1cm4gY29udCgpO1xuXG4gICAgICBpZiAodHlwZSA9PSBcImlmXCIpIHtcbiAgICAgICAgaWYgKGN4LnN0YXRlLmxleGljYWwuaW5mbyA9PSBcImVsc2VcIiAmJiBjeC5zdGF0ZS5jY1tjeC5zdGF0ZS5jYy5sZW5ndGggLSAxXSA9PSBwb3BsZXgpIGN4LnN0YXRlLmNjLnBvcCgpKCk7XG4gICAgICAgIHJldHVybiBjb250KHB1c2hsZXgoXCJmb3JtXCIpLCBwYXJlbkV4cHIsIHN0YXRlbWVudCwgcG9wbGV4LCBtYXliZWVsc2UpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZSA9PSBcImZ1bmN0aW9uXCIpIHJldHVybiBjb250KGZ1bmN0aW9uZGVmKTtcbiAgICAgIGlmICh0eXBlID09IFwiZm9yXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJmb3JtXCIpLCBmb3JzcGVjLCBzdGF0ZW1lbnQsIHBvcGxleCk7XG4gICAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJzdGF0XCIpLCBtYXliZWxhYmVsKTtcbiAgICAgIGlmICh0eXBlID09IFwic3dpdGNoXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJmb3JtXCIpLCBwYXJlbkV4cHIsIHB1c2hsZXgoXCJ9XCIsIFwic3dpdGNoXCIpLCBleHBlY3QoXCJ7XCIpLCBibG9jaywgcG9wbGV4LCBwb3BsZXgpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJjYXNlXCIpIHJldHVybiBjb250KGV4cHJlc3Npb24sIGV4cGVjdChcIjpcIikpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJkZWZhdWx0XCIpIHJldHVybiBjb250KGV4cGVjdChcIjpcIikpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJjYXRjaFwiKSByZXR1cm4gY29udChwdXNobGV4KFwiZm9ybVwiKSwgcHVzaGNvbnRleHQsIGV4cGVjdChcIihcIiksIGZ1bmFyZywgZXhwZWN0KFwiKVwiKSwgc3RhdGVtZW50LCBwb3BsZXgsIHBvcGNvbnRleHQpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJjbGFzc1wiKSByZXR1cm4gY29udChwdXNobGV4KFwiZm9ybVwiKSwgY2xhc3NOYW1lLCBwb3BsZXgpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJleHBvcnRcIikgcmV0dXJuIGNvbnQocHVzaGxleChcInN0YXRcIiksIGFmdGVyRXhwb3J0LCBwb3BsZXgpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJpbXBvcnRcIikgcmV0dXJuIGNvbnQocHVzaGxleChcInN0YXRcIiksIGFmdGVySW1wb3J0LCBwb3BsZXgpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJtb2R1bGVcIikgcmV0dXJuIGNvbnQocHVzaGxleChcImZvcm1cIiksIHBhdHRlcm4sIHB1c2hsZXgoXCJ9XCIpLCBleHBlY3QoXCJ7XCIpLCBibG9jaywgcG9wbGV4LCBwb3BsZXgpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJ0eXBlXCIpIHJldHVybiBjb250KHR5cGVleHByLCBleHBlY3QoXCJvcGVyYXRvclwiKSwgdHlwZWV4cHIsIGV4cGVjdChcIjtcIikpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJhc3luY1wiKSByZXR1cm4gY29udChzdGF0ZW1lbnQpO1xuICAgICAgcmV0dXJuIHBhc3MocHVzaGxleChcInN0YXRcIiksIGV4cHJlc3Npb24sIGV4cGVjdChcIjtcIiksIHBvcGxleCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhwcmVzc2lvbih0eXBlKSB7XG4gICAgICByZXR1cm4gZXhwcmVzc2lvbklubmVyKHR5cGUsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHByZXNzaW9uTm9Db21tYSh0eXBlKSB7XG4gICAgICByZXR1cm4gZXhwcmVzc2lvbklubmVyKHR5cGUsIHRydWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcmVuRXhwcih0eXBlKSB7XG4gICAgICBpZiAodHlwZSAhPSBcIihcIikgcmV0dXJuIHBhc3MoKTtcbiAgICAgIHJldHVybiBjb250KHB1c2hsZXgoXCIpXCIpLCBleHByZXNzaW9uLCBleHBlY3QoXCIpXCIpLCBwb3BsZXgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4cHJlc3Npb25Jbm5lcih0eXBlLCBub0NvbW1hKSB7XG4gICAgICBpZiAoY3guc3RhdGUuZmF0QXJyb3dBdCA9PSBjeC5zdHJlYW0uc3RhcnQpIHtcbiAgICAgICAgdmFyIGJvZHkgPSBub0NvbW1hID8gYXJyb3dCb2R5Tm9Db21tYSA6IGFycm93Qm9keTtcbiAgICAgICAgaWYgKHR5cGUgPT0gXCIoXCIpIHJldHVybiBjb250KHB1c2hjb250ZXh0LCBwdXNobGV4KFwiKVwiKSwgY29tbWFzZXAocGF0dGVybiwgXCIpXCIpLCBwb3BsZXgsIGV4cGVjdChcIj0+XCIpLCBib2R5LCBwb3Bjb250ZXh0KTtlbHNlIGlmICh0eXBlID09IFwidmFyaWFibGVcIikgcmV0dXJuIHBhc3MocHVzaGNvbnRleHQsIHBhdHRlcm4sIGV4cGVjdChcIj0+XCIpLCBib2R5LCBwb3Bjb250ZXh0KTtcbiAgICAgIH1cblxuICAgICAgdmFyIG1heWJlb3AgPSBub0NvbW1hID8gbWF5YmVvcGVyYXRvck5vQ29tbWEgOiBtYXliZW9wZXJhdG9yQ29tbWE7XG4gICAgICBpZiAoYXRvbWljVHlwZXMuaGFzT3duUHJvcGVydHkodHlwZSkpIHJldHVybiBjb250KG1heWJlb3ApO1xuICAgICAgaWYgKHR5cGUgPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gY29udChmdW5jdGlvbmRlZiwgbWF5YmVvcCk7XG4gICAgICBpZiAodHlwZSA9PSBcImNsYXNzXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJmb3JtXCIpLCBjbGFzc0V4cHJlc3Npb24sIHBvcGxleCk7XG4gICAgICBpZiAodHlwZSA9PSBcImtleXdvcmQgY1wiIHx8IHR5cGUgPT0gXCJhc3luY1wiKSByZXR1cm4gY29udChub0NvbW1hID8gbWF5YmVleHByZXNzaW9uTm9Db21tYSA6IG1heWJlZXhwcmVzc2lvbik7XG4gICAgICBpZiAodHlwZSA9PSBcIihcIikgcmV0dXJuIGNvbnQocHVzaGxleChcIilcIiksIG1heWJlZXhwcmVzc2lvbiwgZXhwZWN0KFwiKVwiKSwgcG9wbGV4LCBtYXliZW9wKTtcbiAgICAgIGlmICh0eXBlID09IFwib3BlcmF0b3JcIiB8fCB0eXBlID09IFwic3ByZWFkXCIpIHJldHVybiBjb250KG5vQ29tbWEgPyBleHByZXNzaW9uTm9Db21tYSA6IGV4cHJlc3Npb24pO1xuICAgICAgaWYgKHR5cGUgPT0gXCJbXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJdXCIpLCBhcnJheUxpdGVyYWwsIHBvcGxleCwgbWF5YmVvcCk7XG4gICAgICBpZiAodHlwZSA9PSBcIntcIikgcmV0dXJuIGNvbnRDb21tYXNlcChvYmpwcm9wLCBcIn1cIiwgbnVsbCwgbWF5YmVvcCk7XG4gICAgICBpZiAodHlwZSA9PSBcInF1YXNpXCIpIHJldHVybiBwYXNzKHF1YXNpLCBtYXliZW9wKTtcbiAgICAgIGlmICh0eXBlID09IFwibmV3XCIpIHJldHVybiBjb250KG1heWJlVGFyZ2V0KG5vQ29tbWEpKTtcbiAgICAgIHJldHVybiBjb250KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWF5YmVleHByZXNzaW9uKHR5cGUpIHtcbiAgICAgIGlmICh0eXBlLm1hdGNoKC9bO1xcfVxcKVxcXSxdLykpIHJldHVybiBwYXNzKCk7XG4gICAgICByZXR1cm4gcGFzcyhleHByZXNzaW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXliZWV4cHJlc3Npb25Ob0NvbW1hKHR5cGUpIHtcbiAgICAgIGlmICh0eXBlLm1hdGNoKC9bO1xcfVxcKVxcXSxdLykpIHJldHVybiBwYXNzKCk7XG4gICAgICByZXR1cm4gcGFzcyhleHByZXNzaW9uTm9Db21tYSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWF5YmVvcGVyYXRvckNvbW1hKHR5cGUsIHZhbHVlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcIixcIikgcmV0dXJuIGNvbnQoZXhwcmVzc2lvbik7XG4gICAgICByZXR1cm4gbWF5YmVvcGVyYXRvck5vQ29tbWEodHlwZSwgdmFsdWUsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXliZW9wZXJhdG9yTm9Db21tYSh0eXBlLCB2YWx1ZSwgbm9Db21tYSkge1xuICAgICAgdmFyIG1lID0gbm9Db21tYSA9PSBmYWxzZSA/IG1heWJlb3BlcmF0b3JDb21tYSA6IG1heWJlb3BlcmF0b3JOb0NvbW1hO1xuICAgICAgdmFyIGV4cHIgPSBub0NvbW1hID09IGZhbHNlID8gZXhwcmVzc2lvbiA6IGV4cHJlc3Npb25Ob0NvbW1hO1xuICAgICAgaWYgKHR5cGUgPT0gXCI9PlwiKSByZXR1cm4gY29udChwdXNoY29udGV4dCwgbm9Db21tYSA/IGFycm93Qm9keU5vQ29tbWEgOiBhcnJvd0JvZHksIHBvcGNvbnRleHQpO1xuXG4gICAgICBpZiAodHlwZSA9PSBcIm9wZXJhdG9yXCIpIHtcbiAgICAgICAgaWYgKC9cXCtcXCt8LS0vLnRlc3QodmFsdWUpKSByZXR1cm4gY29udChtZSk7XG4gICAgICAgIGlmICh2YWx1ZSA9PSBcIj9cIikgcmV0dXJuIGNvbnQoZXhwcmVzc2lvbiwgZXhwZWN0KFwiOlwiKSwgZXhwcik7XG4gICAgICAgIHJldHVybiBjb250KGV4cHIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZSA9PSBcInF1YXNpXCIpIHtcbiAgICAgICAgcmV0dXJuIHBhc3MocXVhc2ksIG1lKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUgPT0gXCI7XCIpIHJldHVybjtcbiAgICAgIGlmICh0eXBlID09IFwiKFwiKSByZXR1cm4gY29udENvbW1hc2VwKGV4cHJlc3Npb25Ob0NvbW1hLCBcIilcIiwgXCJjYWxsXCIsIG1lKTtcbiAgICAgIGlmICh0eXBlID09IFwiLlwiKSByZXR1cm4gY29udChwcm9wZXJ0eSwgbWUpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJbXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJdXCIpLCBtYXliZWV4cHJlc3Npb24sIGV4cGVjdChcIl1cIiksIHBvcGxleCwgbWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHF1YXNpKHR5cGUsIHZhbHVlKSB7XG4gICAgICBpZiAodHlwZSAhPSBcInF1YXNpXCIpIHJldHVybiBwYXNzKCk7XG4gICAgICBpZiAodmFsdWUuc2xpY2UodmFsdWUubGVuZ3RoIC0gMikgIT0gXCIke1wiKSByZXR1cm4gY29udChxdWFzaSk7XG4gICAgICByZXR1cm4gY29udChleHByZXNzaW9uLCBjb250aW51ZVF1YXNpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb250aW51ZVF1YXNpKHR5cGUpIHtcbiAgICAgIGlmICh0eXBlID09IFwifVwiKSB7XG4gICAgICAgIGN4Lm1hcmtlZCA9IFwic3RyaW5nLTJcIjtcbiAgICAgICAgY3guc3RhdGUudG9rZW5pemUgPSB0b2tlblF1YXNpO1xuICAgICAgICByZXR1cm4gY29udChxdWFzaSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXJyb3dCb2R5KHR5cGUpIHtcbiAgICAgIGZpbmRGYXRBcnJvdyhjeC5zdHJlYW0sIGN4LnN0YXRlKTtcbiAgICAgIHJldHVybiBwYXNzKHR5cGUgPT0gXCJ7XCIgPyBzdGF0ZW1lbnQgOiBleHByZXNzaW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcnJvd0JvZHlOb0NvbW1hKHR5cGUpIHtcbiAgICAgIGZpbmRGYXRBcnJvdyhjeC5zdHJlYW0sIGN4LnN0YXRlKTtcbiAgICAgIHJldHVybiBwYXNzKHR5cGUgPT0gXCJ7XCIgPyBzdGF0ZW1lbnQgOiBleHByZXNzaW9uTm9Db21tYSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWF5YmVUYXJnZXQobm9Db21tYSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgIGlmICh0eXBlID09IFwiLlwiKSByZXR1cm4gY29udChub0NvbW1hID8gdGFyZ2V0Tm9Db21tYSA6IHRhcmdldCk7ZWxzZSByZXR1cm4gcGFzcyhub0NvbW1hID8gZXhwcmVzc2lvbk5vQ29tbWEgOiBleHByZXNzaW9uKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGFyZ2V0KF8sIHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgPT0gXCJ0YXJnZXRcIikge1xuICAgICAgICBjeC5tYXJrZWQgPSBcImtleXdvcmRcIjtcbiAgICAgICAgcmV0dXJuIGNvbnQobWF5YmVvcGVyYXRvckNvbW1hKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0YXJnZXROb0NvbW1hKF8sIHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgPT0gXCJ0YXJnZXRcIikge1xuICAgICAgICBjeC5tYXJrZWQgPSBcImtleXdvcmRcIjtcbiAgICAgICAgcmV0dXJuIGNvbnQobWF5YmVvcGVyYXRvck5vQ29tbWEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1heWJlbGFiZWwodHlwZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCI6XCIpIHJldHVybiBjb250KHBvcGxleCwgc3RhdGVtZW50KTtcbiAgICAgIHJldHVybiBwYXNzKG1heWJlb3BlcmF0b3JDb21tYSwgZXhwZWN0KFwiO1wiKSwgcG9wbGV4KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcm9wZXJ0eSh0eXBlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIHtcbiAgICAgICAgY3gubWFya2VkID0gXCJwcm9wZXJ0eVwiO1xuICAgICAgICByZXR1cm4gY29udCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9ianByb3AodHlwZSwgdmFsdWUpIHtcbiAgICAgIGlmICh0eXBlID09IFwiYXN5bmNcIikge1xuICAgICAgICBjeC5tYXJrZWQgPSBcInByb3BlcnR5XCI7XG4gICAgICAgIHJldHVybiBjb250KG9ianByb3ApO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwidmFyaWFibGVcIiB8fCBjeC5zdHlsZSA9PSBcImtleXdvcmRcIikge1xuICAgICAgICBjeC5tYXJrZWQgPSBcInByb3BlcnR5XCI7XG4gICAgICAgIGlmICh2YWx1ZSA9PSBcImdldFwiIHx8IHZhbHVlID09IFwic2V0XCIpIHJldHVybiBjb250KGdldHRlclNldHRlcik7XG4gICAgICAgIHJldHVybiBjb250KGFmdGVycHJvcCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJudW1iZXJcIiB8fCB0eXBlID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgY3gubWFya2VkID0ganNvbmxkTW9kZSA/IFwicHJvcGVydHlcIiA6IGN4LnN0eWxlICsgXCIgcHJvcGVydHlcIjtcbiAgICAgICAgcmV0dXJuIGNvbnQoYWZ0ZXJwcm9wKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImpzb25sZC1rZXl3b3JkXCIpIHtcbiAgICAgICAgcmV0dXJuIGNvbnQoYWZ0ZXJwcm9wKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcIm1vZGlmaWVyXCIpIHtcbiAgICAgICAgcmV0dXJuIGNvbnQob2JqcHJvcCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJbXCIpIHtcbiAgICAgICAgcmV0dXJuIGNvbnQoZXhwcmVzc2lvbiwgZXhwZWN0KFwiXVwiKSwgYWZ0ZXJwcm9wKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcInNwcmVhZFwiKSB7XG4gICAgICAgIHJldHVybiBjb250KGV4cHJlc3Npb24pO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiOlwiKSB7XG4gICAgICAgIHJldHVybiBwYXNzKGFmdGVycHJvcCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0dGVyU2V0dGVyKHR5cGUpIHtcbiAgICAgIGlmICh0eXBlICE9IFwidmFyaWFibGVcIikgcmV0dXJuIHBhc3MoYWZ0ZXJwcm9wKTtcbiAgICAgIGN4Lm1hcmtlZCA9IFwicHJvcGVydHlcIjtcbiAgICAgIHJldHVybiBjb250KGZ1bmN0aW9uZGVmKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZnRlcnByb3AodHlwZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCI6XCIpIHJldHVybiBjb250KGV4cHJlc3Npb25Ob0NvbW1hKTtcbiAgICAgIGlmICh0eXBlID09IFwiKFwiKSByZXR1cm4gcGFzcyhmdW5jdGlvbmRlZik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tbWFzZXAod2hhdCwgZW5kLCBzZXApIHtcbiAgICAgIGZ1bmN0aW9uIHByb2NlZWQodHlwZSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHNlcCA/IHNlcC5pbmRleE9mKHR5cGUpID4gLTEgOiB0eXBlID09IFwiLFwiKSB7XG4gICAgICAgICAgdmFyIGxleCA9IGN4LnN0YXRlLmxleGljYWw7XG4gICAgICAgICAgaWYgKGxleC5pbmZvID09IFwiY2FsbFwiKSBsZXgucG9zID0gKGxleC5wb3MgfHwgMCkgKyAxO1xuICAgICAgICAgIHJldHVybiBjb250KGZ1bmN0aW9uICh0eXBlLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHR5cGUgPT0gZW5kIHx8IHZhbHVlID09IGVuZCkgcmV0dXJuIHBhc3MoKTtcbiAgICAgICAgICAgIHJldHVybiBwYXNzKHdoYXQpO1xuICAgICAgICAgIH0sIHByb2NlZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgPT0gZW5kIHx8IHZhbHVlID09IGVuZCkgcmV0dXJuIGNvbnQoKTtcbiAgICAgICAgcmV0dXJuIGNvbnQoZXhwZWN0KGVuZCkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHR5cGUsIHZhbHVlKSB7XG4gICAgICAgIGlmICh0eXBlID09IGVuZCB8fCB2YWx1ZSA9PSBlbmQpIHJldHVybiBjb250KCk7XG4gICAgICAgIHJldHVybiBwYXNzKHdoYXQsIHByb2NlZWQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb250Q29tbWFzZXAod2hhdCwgZW5kLCBpbmZvKSB7XG4gICAgICBmb3IgKHZhciBpID0gMzsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjeC5jYy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250KHB1c2hsZXgoZW5kLCBpbmZvKSwgY29tbWFzZXAod2hhdCwgZW5kKSwgcG9wbGV4KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBibG9jayh0eXBlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcIn1cIikgcmV0dXJuIGNvbnQoKTtcbiAgICAgIHJldHVybiBwYXNzKHN0YXRlbWVudCwgYmxvY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1heWJldHlwZSh0eXBlLCB2YWx1ZSkge1xuICAgICAgaWYgKGlzVFMpIHtcbiAgICAgICAgaWYgKHR5cGUgPT0gXCI6XCIpIHJldHVybiBjb250KHR5cGVleHByKTtcbiAgICAgICAgaWYgKHZhbHVlID09IFwiP1wiKSByZXR1cm4gY29udChtYXliZXR5cGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHR5cGVleHByKHR5cGUpIHtcbiAgICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIikge1xuICAgICAgICBjeC5tYXJrZWQgPSBcInZhcmlhYmxlLTNcIjtcbiAgICAgICAgcmV0dXJuIGNvbnQoYWZ0ZXJUeXBlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIiB8fCB0eXBlID09IFwibnVtYmVyXCIgfHwgdHlwZSA9PSBcImF0b21cIikgcmV0dXJuIGNvbnQoYWZ0ZXJUeXBlKTtcbiAgICAgIGlmICh0eXBlID09IFwie1wiKSByZXR1cm4gY29udChwdXNobGV4KFwifVwiKSwgY29tbWFzZXAodHlwZXByb3AsIFwifVwiLCBcIiw7XCIpLCBwb3BsZXgpO1xuICAgICAgaWYgKHR5cGUgPT0gXCIoXCIpIHJldHVybiBjb250KGNvbW1hc2VwKHR5cGVhcmcsIFwiKVwiKSwgbWF5YmVSZXR1cm5UeXBlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXliZVJldHVyblR5cGUodHlwZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCI9PlwiKSByZXR1cm4gY29udCh0eXBlZXhwcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHlwZXByb3AodHlwZSwgdmFsdWUpIHtcbiAgICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIiB8fCBjeC5zdHlsZSA9PSBcImtleXdvcmRcIikge1xuICAgICAgICBjeC5tYXJrZWQgPSBcInByb3BlcnR5XCI7XG4gICAgICAgIHJldHVybiBjb250KHR5cGVwcm9wKTtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT0gXCI/XCIpIHtcbiAgICAgICAgcmV0dXJuIGNvbnQodHlwZXByb3ApO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiOlwiKSB7XG4gICAgICAgIHJldHVybiBjb250KHR5cGVleHByKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0eXBlYXJnKHR5cGUpIHtcbiAgICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIikgcmV0dXJuIGNvbnQodHlwZWFyZyk7ZWxzZSBpZiAodHlwZSA9PSBcIjpcIikgcmV0dXJuIGNvbnQodHlwZWV4cHIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFmdGVyVHlwZSh0eXBlLCB2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlID09IFwiPFwiKSByZXR1cm4gY29udChwdXNobGV4KFwiPlwiKSwgY29tbWFzZXAodHlwZWV4cHIsIFwiPlwiKSwgcG9wbGV4LCBhZnRlclR5cGUpO1xuICAgICAgaWYgKHZhbHVlID09IFwifFwiIHx8IHR5cGUgPT0gXCIuXCIpIHJldHVybiBjb250KHR5cGVleHByKTtcbiAgICAgIGlmICh0eXBlID09IFwiW1wiKSByZXR1cm4gY29udChleHBlY3QoXCJdXCIpLCBhZnRlclR5cGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZhcmRlZigpIHtcbiAgICAgIHJldHVybiBwYXNzKHBhdHRlcm4sIG1heWJldHlwZSwgbWF5YmVBc3NpZ24sIHZhcmRlZkNvbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhdHRlcm4odHlwZSwgdmFsdWUpIHtcbiAgICAgIGlmICh0eXBlID09IFwibW9kaWZpZXJcIikgcmV0dXJuIGNvbnQocGF0dGVybik7XG5cbiAgICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIikge1xuICAgICAgICByZWdpc3Rlcih2YWx1ZSk7XG4gICAgICAgIHJldHVybiBjb250KCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlID09IFwic3ByZWFkXCIpIHJldHVybiBjb250KHBhdHRlcm4pO1xuICAgICAgaWYgKHR5cGUgPT0gXCJbXCIpIHJldHVybiBjb250Q29tbWFzZXAocGF0dGVybiwgXCJdXCIpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJ7XCIpIHJldHVybiBjb250Q29tbWFzZXAocHJvcHBhdHRlcm4sIFwifVwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcm9wcGF0dGVybih0eXBlLCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiICYmICFjeC5zdHJlYW0ubWF0Y2goL15cXHMqOi8sIGZhbHNlKSkge1xuICAgICAgICByZWdpc3Rlcih2YWx1ZSk7XG4gICAgICAgIHJldHVybiBjb250KG1heWJlQXNzaWduKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiKSBjeC5tYXJrZWQgPSBcInByb3BlcnR5XCI7XG4gICAgICBpZiAodHlwZSA9PSBcInNwcmVhZFwiKSByZXR1cm4gY29udChwYXR0ZXJuKTtcbiAgICAgIGlmICh0eXBlID09IFwifVwiKSByZXR1cm4gcGFzcygpO1xuICAgICAgcmV0dXJuIGNvbnQoZXhwZWN0KFwiOlwiKSwgcGF0dGVybiwgbWF5YmVBc3NpZ24pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1heWJlQXNzaWduKF90eXBlLCB2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlID09IFwiPVwiKSByZXR1cm4gY29udChleHByZXNzaW9uTm9Db21tYSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmFyZGVmQ29udCh0eXBlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcIixcIikgcmV0dXJuIGNvbnQodmFyZGVmKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXliZWVsc2UodHlwZSwgdmFsdWUpIHtcbiAgICAgIGlmICh0eXBlID09IFwia2V5d29yZCBiXCIgJiYgdmFsdWUgPT0gXCJlbHNlXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJmb3JtXCIsIFwiZWxzZVwiKSwgc3RhdGVtZW50LCBwb3BsZXgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcnNwZWModHlwZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCIoXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCIpXCIpLCBmb3JzcGVjMSwgZXhwZWN0KFwiKVwiKSwgcG9wbGV4KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb3JzcGVjMSh0eXBlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcInZhclwiKSByZXR1cm4gY29udCh2YXJkZWYsIGV4cGVjdChcIjtcIiksIGZvcnNwZWMyKTtcbiAgICAgIGlmICh0eXBlID09IFwiO1wiKSByZXR1cm4gY29udChmb3JzcGVjMik7XG4gICAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIHJldHVybiBjb250KGZvcm1heWJlaW5vZik7XG4gICAgICByZXR1cm4gcGFzcyhleHByZXNzaW9uLCBleHBlY3QoXCI7XCIpLCBmb3JzcGVjMik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm9ybWF5YmVpbm9mKF90eXBlLCB2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlID09IFwiaW5cIiB8fCB2YWx1ZSA9PSBcIm9mXCIpIHtcbiAgICAgICAgY3gubWFya2VkID0gXCJrZXl3b3JkXCI7XG4gICAgICAgIHJldHVybiBjb250KGV4cHJlc3Npb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udChtYXliZW9wZXJhdG9yQ29tbWEsIGZvcnNwZWMyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb3JzcGVjMih0eXBlLCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCI7XCIpIHJldHVybiBjb250KGZvcnNwZWMzKTtcblxuICAgICAgaWYgKHZhbHVlID09IFwiaW5cIiB8fCB2YWx1ZSA9PSBcIm9mXCIpIHtcbiAgICAgICAgY3gubWFya2VkID0gXCJrZXl3b3JkXCI7XG4gICAgICAgIHJldHVybiBjb250KGV4cHJlc3Npb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGFzcyhleHByZXNzaW9uLCBleHBlY3QoXCI7XCIpLCBmb3JzcGVjMyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm9yc3BlYzModHlwZSkge1xuICAgICAgaWYgKHR5cGUgIT0gXCIpXCIpIGNvbnQoZXhwcmVzc2lvbik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZnVuY3Rpb25kZWYodHlwZSwgdmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSA9PSBcIipcIikge1xuICAgICAgICBjeC5tYXJrZWQgPSBcImtleXdvcmRcIjtcbiAgICAgICAgcmV0dXJuIGNvbnQoZnVuY3Rpb25kZWYpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIHtcbiAgICAgICAgcmVnaXN0ZXIodmFsdWUpO1xuICAgICAgICByZXR1cm4gY29udChmdW5jdGlvbmRlZik7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlID09IFwiKFwiKSByZXR1cm4gY29udChwdXNoY29udGV4dCwgcHVzaGxleChcIilcIiksIGNvbW1hc2VwKGZ1bmFyZywgXCIpXCIpLCBwb3BsZXgsIG1heWJldHlwZSwgc3RhdGVtZW50LCBwb3Bjb250ZXh0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmdW5hcmcodHlwZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCJzcHJlYWRcIikgcmV0dXJuIGNvbnQoZnVuYXJnKTtcbiAgICAgIHJldHVybiBwYXNzKHBhdHRlcm4sIG1heWJldHlwZSwgbWF5YmVBc3NpZ24pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsYXNzRXhwcmVzc2lvbih0eXBlLCB2YWx1ZSkge1xuICAgICAgLy8gQ2xhc3MgZXhwcmVzc2lvbnMgbWF5IGhhdmUgYW4gb3B0aW9uYWwgbmFtZS5cbiAgICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIikgcmV0dXJuIGNsYXNzTmFtZSh0eXBlLCB2YWx1ZSk7XG4gICAgICByZXR1cm4gY2xhc3NOYW1lQWZ0ZXIodHlwZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsYXNzTmFtZSh0eXBlLCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiKSB7XG4gICAgICAgIHJlZ2lzdGVyKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGNvbnQoY2xhc3NOYW1lQWZ0ZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsYXNzTmFtZUFmdGVyKHR5cGUsIHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgPT0gXCJleHRlbmRzXCIgfHwgdmFsdWUgPT0gXCJpbXBsZW1lbnRzXCIpIHJldHVybiBjb250KGlzVFMgPyB0eXBlZXhwciA6IGV4cHJlc3Npb24sIGNsYXNzTmFtZUFmdGVyKTtcbiAgICAgIGlmICh0eXBlID09IFwie1wiKSByZXR1cm4gY29udChwdXNobGV4KFwifVwiKSwgY2xhc3NCb2R5LCBwb3BsZXgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsYXNzQm9keSh0eXBlLCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiIHx8IGN4LnN0eWxlID09IFwia2V5d29yZFwiKSB7XG4gICAgICAgIGlmICgodmFsdWUgPT0gXCJzdGF0aWNcIiB8fCB2YWx1ZSA9PSBcImdldFwiIHx8IHZhbHVlID09IFwic2V0XCIgfHwgaXNUUyAmJiAodmFsdWUgPT0gXCJwdWJsaWNcIiB8fCB2YWx1ZSA9PSBcInByaXZhdGVcIiB8fCB2YWx1ZSA9PSBcInByb3RlY3RlZFwiIHx8IHZhbHVlID09IFwicmVhZG9ubHlcIiB8fCB2YWx1ZSA9PSBcImFic3RyYWN0XCIpKSAmJiBjeC5zdHJlYW0ubWF0Y2goL15cXHMrW1xcdyRcXHhhMS1cXHVmZmZmXS8sIGZhbHNlKSkge1xuICAgICAgICAgIGN4Lm1hcmtlZCA9IFwia2V5d29yZFwiO1xuICAgICAgICAgIHJldHVybiBjb250KGNsYXNzQm9keSk7XG4gICAgICAgIH1cblxuICAgICAgICBjeC5tYXJrZWQgPSBcInByb3BlcnR5XCI7XG4gICAgICAgIHJldHVybiBjb250KGlzVFMgPyBjbGFzc2ZpZWxkIDogZnVuY3Rpb25kZWYsIGNsYXNzQm9keSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh2YWx1ZSA9PSBcIipcIikge1xuICAgICAgICBjeC5tYXJrZWQgPSBcImtleXdvcmRcIjtcbiAgICAgICAgcmV0dXJuIGNvbnQoY2xhc3NCb2R5KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUgPT0gXCI7XCIpIHJldHVybiBjb250KGNsYXNzQm9keSk7XG4gICAgICBpZiAodHlwZSA9PSBcIn1cIikgcmV0dXJuIGNvbnQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGFzc2ZpZWxkKHR5cGUsIHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgPT0gXCI/XCIpIHJldHVybiBjb250KGNsYXNzZmllbGQpO1xuICAgICAgaWYgKHR5cGUgPT0gXCI6XCIpIHJldHVybiBjb250KHR5cGVleHByLCBtYXliZUFzc2lnbik7XG4gICAgICByZXR1cm4gcGFzcyhmdW5jdGlvbmRlZik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWZ0ZXJFeHBvcnQodHlwZSwgdmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSA9PSBcIipcIikge1xuICAgICAgICBjeC5tYXJrZWQgPSBcImtleXdvcmRcIjtcbiAgICAgICAgcmV0dXJuIGNvbnQobWF5YmVGcm9tLCBleHBlY3QoXCI7XCIpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHZhbHVlID09IFwiZGVmYXVsdFwiKSB7XG4gICAgICAgIGN4Lm1hcmtlZCA9IFwia2V5d29yZFwiO1xuICAgICAgICByZXR1cm4gY29udChleHByZXNzaW9uLCBleHBlY3QoXCI7XCIpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUgPT0gXCJ7XCIpIHJldHVybiBjb250KGNvbW1hc2VwKGV4cG9ydEZpZWxkLCBcIn1cIiksIG1heWJlRnJvbSwgZXhwZWN0KFwiO1wiKSk7XG4gICAgICByZXR1cm4gcGFzcyhzdGF0ZW1lbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4cG9ydEZpZWxkKHR5cGUsIHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgPT0gXCJhc1wiKSB7XG4gICAgICAgIGN4Lm1hcmtlZCA9IFwia2V5d29yZFwiO1xuICAgICAgICByZXR1cm4gY29udChleHBlY3QoXCJ2YXJpYWJsZVwiKSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIikgcmV0dXJuIHBhc3MoZXhwcmVzc2lvbk5vQ29tbWEsIGV4cG9ydEZpZWxkKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZnRlckltcG9ydCh0eXBlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gY29udCgpO1xuICAgICAgcmV0dXJuIHBhc3MoaW1wb3J0U3BlYywgbWF5YmVNb3JlSW1wb3J0cywgbWF5YmVGcm9tKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbXBvcnRTcGVjKHR5cGUsIHZhbHVlKSB7XG4gICAgICBpZiAodHlwZSA9PSBcIntcIikgcmV0dXJuIGNvbnRDb21tYXNlcChpbXBvcnRTcGVjLCBcIn1cIik7XG4gICAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIHJlZ2lzdGVyKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA9PSBcIipcIikgY3gubWFya2VkID0gXCJrZXl3b3JkXCI7XG4gICAgICByZXR1cm4gY29udChtYXliZUFzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXliZU1vcmVJbXBvcnRzKHR5cGUpIHtcbiAgICAgIGlmICh0eXBlID09IFwiLFwiKSByZXR1cm4gY29udChpbXBvcnRTcGVjLCBtYXliZU1vcmVJbXBvcnRzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXliZUFzKF90eXBlLCB2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlID09IFwiYXNcIikge1xuICAgICAgICBjeC5tYXJrZWQgPSBcImtleXdvcmRcIjtcbiAgICAgICAgcmV0dXJuIGNvbnQoaW1wb3J0U3BlYyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWF5YmVGcm9tKF90eXBlLCB2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlID09IFwiZnJvbVwiKSB7XG4gICAgICAgIGN4Lm1hcmtlZCA9IFwia2V5d29yZFwiO1xuICAgICAgICByZXR1cm4gY29udChleHByZXNzaW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcnJheUxpdGVyYWwodHlwZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCJdXCIpIHJldHVybiBjb250KCk7XG4gICAgICByZXR1cm4gcGFzcyhjb21tYXNlcChleHByZXNzaW9uTm9Db21tYSwgXCJdXCIpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0NvbnRpbnVlZFN0YXRlbWVudChzdGF0ZSwgdGV4dEFmdGVyKSB7XG4gICAgICByZXR1cm4gc3RhdGUubGFzdFR5cGUgPT0gXCJvcGVyYXRvclwiIHx8IHN0YXRlLmxhc3RUeXBlID09IFwiLFwiIHx8IGlzT3BlcmF0b3JDaGFyLnRlc3QodGV4dEFmdGVyLmNoYXJBdCgwKSkgfHwgL1ssLl0vLnRlc3QodGV4dEFmdGVyLmNoYXJBdCgwKSk7XG4gICAgfSAvLyBJbnRlcmZhY2VcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0U3RhdGU6IGZ1bmN0aW9uIHN0YXJ0U3RhdGUoYmFzZWNvbHVtbikge1xuICAgICAgICB2YXIgc3RhdGUgPSB7XG4gICAgICAgICAgdG9rZW5pemU6IHRva2VuQmFzZSxcbiAgICAgICAgICBsYXN0VHlwZTogXCJzb2ZcIixcbiAgICAgICAgICBjYzogW10sXG4gICAgICAgICAgbGV4aWNhbDogbmV3IEpTTGV4aWNhbCgoYmFzZWNvbHVtbiB8fCAwKSAtIGluZGVudFVuaXQsIDAsIFwiYmxvY2tcIiwgZmFsc2UpLFxuICAgICAgICAgIGxvY2FsVmFyczogcGFyc2VyQ29uZmlnLmxvY2FsVmFycyxcbiAgICAgICAgICBjb250ZXh0OiBwYXJzZXJDb25maWcubG9jYWxWYXJzICYmIHtcbiAgICAgICAgICAgIHZhcnM6IHBhcnNlckNvbmZpZy5sb2NhbFZhcnNcbiAgICAgICAgICB9LFxuICAgICAgICAgIGluZGVudGVkOiBiYXNlY29sdW1uIHx8IDBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHBhcnNlckNvbmZpZy5nbG9iYWxWYXJzICYmIF90eXBlb2YocGFyc2VyQ29uZmlnLmdsb2JhbFZhcnMpID09IFwib2JqZWN0XCIpIHN0YXRlLmdsb2JhbFZhcnMgPSBwYXJzZXJDb25maWcuZ2xvYmFsVmFycztcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgfSxcbiAgICAgIHRva2VuOiBmdW5jdGlvbiB0b2tlbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICAgIGlmIChzdHJlYW0uc29sKCkpIHtcbiAgICAgICAgICBpZiAoIXN0YXRlLmxleGljYWwuaGFzT3duUHJvcGVydHkoXCJhbGlnblwiKSkgc3RhdGUubGV4aWNhbC5hbGlnbiA9IGZhbHNlO1xuICAgICAgICAgIHN0YXRlLmluZGVudGVkID0gc3RyZWFtLmluZGVudGF0aW9uKCk7XG4gICAgICAgICAgZmluZEZhdEFycm93KHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRlLnRva2VuaXplICE9IHRva2VuQ29tbWVudCAmJiBzdHJlYW0uZWF0U3BhY2UoKSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHZhciBzdHlsZSA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICBpZiAodHlwZSA9PSBcImNvbW1lbnRcIikgcmV0dXJuIHN0eWxlO1xuICAgICAgICBzdGF0ZS5sYXN0VHlwZSA9IHR5cGUgPT0gXCJvcGVyYXRvclwiICYmIChjb250ZW50ID09IFwiKytcIiB8fCBjb250ZW50ID09IFwiLS1cIikgPyBcImluY2RlY1wiIDogdHlwZTtcbiAgICAgICAgcmV0dXJuIHBhcnNlSlMoc3RhdGUsIHN0eWxlLCB0eXBlLCBjb250ZW50LCBzdHJlYW0pO1xuICAgICAgfSxcbiAgICAgIGluZGVudDogZnVuY3Rpb24gaW5kZW50KHN0YXRlLCB0ZXh0QWZ0ZXIpIHtcbiAgICAgICAgaWYgKHN0YXRlLnRva2VuaXplID09IHRva2VuQ29tbWVudCkgcmV0dXJuIENvZGVNaXJyb3IuUGFzcztcbiAgICAgICAgaWYgKHN0YXRlLnRva2VuaXplICE9IHRva2VuQmFzZSkgcmV0dXJuIDA7XG4gICAgICAgIHZhciBmaXJzdENoYXIgPSB0ZXh0QWZ0ZXIgJiYgdGV4dEFmdGVyLmNoYXJBdCgwKSxcbiAgICAgICAgICAgIGxleGljYWwgPSBzdGF0ZS5sZXhpY2FsLFxuICAgICAgICAgICAgdG9wOyAvLyBLbHVkZ2UgdG8gcHJldmVudCAnbWF5YmVsc2UnIGZyb20gYmxvY2tpbmcgbGV4aWNhbCBzY29wZSBwb3BzXG5cbiAgICAgICAgaWYgKCEvXlxccyplbHNlXFxiLy50ZXN0KHRleHRBZnRlcikpIGZvciAodmFyIGkgPSBzdGF0ZS5jYy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgIHZhciBjID0gc3RhdGUuY2NbaV07XG4gICAgICAgICAgaWYgKGMgPT0gcG9wbGV4KSBsZXhpY2FsID0gbGV4aWNhbC5wcmV2O2Vsc2UgaWYgKGMgIT0gbWF5YmVlbHNlKSBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlICgobGV4aWNhbC50eXBlID09IFwic3RhdFwiIHx8IGxleGljYWwudHlwZSA9PSBcImZvcm1cIikgJiYgKGZpcnN0Q2hhciA9PSBcIn1cIiB8fCAodG9wID0gc3RhdGUuY2Nbc3RhdGUuY2MubGVuZ3RoIC0gMV0pICYmICh0b3AgPT0gbWF5YmVvcGVyYXRvckNvbW1hIHx8IHRvcCA9PSBtYXliZW9wZXJhdG9yTm9Db21tYSkgJiYgIS9eWyxcXC49K1xcLSo6P1tcXChdLy50ZXN0KHRleHRBZnRlcikpKSB7XG4gICAgICAgICAgbGV4aWNhbCA9IGxleGljYWwucHJldjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0ZW1lbnRJbmRlbnQgJiYgbGV4aWNhbC50eXBlID09IFwiKVwiICYmIGxleGljYWwucHJldi50eXBlID09IFwic3RhdFwiKSBsZXhpY2FsID0gbGV4aWNhbC5wcmV2O1xuICAgICAgICB2YXIgdHlwZSA9IGxleGljYWwudHlwZSxcbiAgICAgICAgICAgIGNsb3NpbmcgPSBmaXJzdENoYXIgPT0gdHlwZTtcbiAgICAgICAgaWYgKHR5cGUgPT0gXCJ2YXJkZWZcIikgcmV0dXJuIGxleGljYWwuaW5kZW50ZWQgKyAoc3RhdGUubGFzdFR5cGUgPT0gXCJvcGVyYXRvclwiIHx8IHN0YXRlLmxhc3RUeXBlID09IFwiLFwiID8gbGV4aWNhbC5pbmZvICsgMSA6IDApO2Vsc2UgaWYgKHR5cGUgPT0gXCJmb3JtXCIgJiYgZmlyc3RDaGFyID09IFwie1wiKSByZXR1cm4gbGV4aWNhbC5pbmRlbnRlZDtlbHNlIGlmICh0eXBlID09IFwiZm9ybVwiKSByZXR1cm4gbGV4aWNhbC5pbmRlbnRlZCArIGluZGVudFVuaXQ7ZWxzZSBpZiAodHlwZSA9PSBcInN0YXRcIikgcmV0dXJuIGxleGljYWwuaW5kZW50ZWQgKyAoaXNDb250aW51ZWRTdGF0ZW1lbnQoc3RhdGUsIHRleHRBZnRlcikgPyBzdGF0ZW1lbnRJbmRlbnQgfHwgaW5kZW50VW5pdCA6IDApO2Vsc2UgaWYgKGxleGljYWwuaW5mbyA9PSBcInN3aXRjaFwiICYmICFjbG9zaW5nICYmIHBhcnNlckNvbmZpZy5kb3VibGVJbmRlbnRTd2l0Y2ggIT0gZmFsc2UpIHJldHVybiBsZXhpY2FsLmluZGVudGVkICsgKC9eKD86Y2FzZXxkZWZhdWx0KVxcYi8udGVzdCh0ZXh0QWZ0ZXIpID8gaW5kZW50VW5pdCA6IDIgKiBpbmRlbnRVbml0KTtlbHNlIGlmIChsZXhpY2FsLmFsaWduKSByZXR1cm4gbGV4aWNhbC5jb2x1bW4gKyAoY2xvc2luZyA/IDAgOiAxKTtlbHNlIHJldHVybiBsZXhpY2FsLmluZGVudGVkICsgKGNsb3NpbmcgPyAwIDogaW5kZW50VW5pdCk7XG4gICAgICB9LFxuICAgICAgZWxlY3RyaWNJbnB1dDogL15cXHMqKD86Y2FzZSAuKj86fGRlZmF1bHQ6fFxce3xcXH0pJC8sXG4gICAgICBibG9ja0NvbW1lbnRTdGFydDoganNvbk1vZGUgPyBudWxsIDogXCIvKlwiLFxuICAgICAgYmxvY2tDb21tZW50RW5kOiBqc29uTW9kZSA/IG51bGwgOiBcIiovXCIsXG4gICAgICBsaW5lQ29tbWVudDoganNvbk1vZGUgPyBudWxsIDogXCIvL1wiLFxuICAgICAgZm9sZDogXCJicmFjZVwiLFxuICAgICAgY2xvc2VCcmFja2V0czogXCIoKVtde30nJ1xcXCJcXFwiYGBcIixcbiAgICAgIGhlbHBlclR5cGU6IGpzb25Nb2RlID8gXCJqc29uXCIgOiBcImphdmFzY3JpcHRcIixcbiAgICAgIGpzb25sZE1vZGU6IGpzb25sZE1vZGUsXG4gICAgICBqc29uTW9kZToganNvbk1vZGUsXG4gICAgICBleHByZXNzaW9uQWxsb3dlZDogZXhwcmVzc2lvbkFsbG93ZWQsXG4gICAgICBza2lwRXhwcmVzc2lvbjogZnVuY3Rpb24gc2tpcEV4cHJlc3Npb24oc3RhdGUpIHtcbiAgICAgICAgdmFyIHRvcCA9IHN0YXRlLmNjW3N0YXRlLmNjLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAodG9wID09IGV4cHJlc3Npb24gfHwgdG9wID09IGV4cHJlc3Npb25Ob0NvbW1hKSBzdGF0ZS5jYy5wb3AoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbiAgQ29kZU1pcnJvci5yZWdpc3RlckhlbHBlcihcIndvcmRDaGFyc1wiLCBcImphdmFzY3JpcHRcIiwgL1tcXHckXS8pO1xuICBDb2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L2phdmFzY3JpcHRcIiwgXCJqYXZhc2NyaXB0XCIpO1xuICBDb2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L2VjbWFzY3JpcHRcIiwgXCJqYXZhc2NyaXB0XCIpO1xuICBDb2RlTWlycm9yLmRlZmluZU1JTUUoXCJhcHBsaWNhdGlvbi9qYXZhc2NyaXB0XCIsIFwiamF2YXNjcmlwdFwiKTtcbiAgQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwiYXBwbGljYXRpb24veC1qYXZhc2NyaXB0XCIsIFwiamF2YXNjcmlwdFwiKTtcbiAgQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwiYXBwbGljYXRpb24vZWNtYXNjcmlwdFwiLCBcImphdmFzY3JpcHRcIik7XG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL2pzb25cIiwge1xuICAgIG5hbWU6IFwiamF2YXNjcmlwdFwiLFxuICAgIGpzb246IHRydWVcbiAgfSk7XG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL3gtanNvblwiLCB7XG4gICAgbmFtZTogXCJqYXZhc2NyaXB0XCIsXG4gICAganNvbjogdHJ1ZVxuICB9KTtcbiAgQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwiYXBwbGljYXRpb24vbGQranNvblwiLCB7XG4gICAgbmFtZTogXCJqYXZhc2NyaXB0XCIsXG4gICAganNvbmxkOiB0cnVlXG4gIH0pO1xuICBDb2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L3R5cGVzY3JpcHRcIiwge1xuICAgIG5hbWU6IFwiamF2YXNjcmlwdFwiLFxuICAgIHR5cGVzY3JpcHQ6IHRydWVcbiAgfSk7XG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL3R5cGVzY3JpcHRcIiwge1xuICAgIG5hbWU6IFwiamF2YXNjcmlwdFwiLFxuICAgIHR5cGVzY3JpcHQ6IHRydWVcbiAgfSk7XG59KTsiXSwiZmlsZSI6ImFjZi1maWVsZHMvamF2YXNjcmlwdC5qcyJ9
