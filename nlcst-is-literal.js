(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.nlcstIsLiteral = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @author Titus Wormer
 * @copyright 2014-2015 Titus Wormer
 * @license MIT
 * @module nlcst:is-literal
 * @fileoverview Check whether an NLCST node is meant literally.
 */

'use strict';

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var toString = require('nlcst-to-string');

/*
 * Single delimiters.
 */

var single = {
    '-': true, // hyphen-minus
    '–': true, // en-dash
    '—': true, // em-dash
    ':': true, // colon
    ';': true // semicolon
};

/*
 * Pair delimiters. From common sense, and wikipedia:
 * Mostly from https://en.wikipedia.org/wiki/Quotation_mark.
 */

var pairs = {
    ',': {
        ',': true
    },
    '-': {
        '-': true
    },
    '–': {
        '–': true
    },
    '—': {
        '—': true
    },
    '"': {
        '"': true
    },
    '\'': {
        '\'': true
    },
    '‘': {
        '’': true
    },
    '‚': {
        '’': true
    },
    '’': {
        '’': true,
        '‚': true
    },
    '“': {
        '”': true
    },
    '”': {
        '”': true
    },
    '„': {
        '”': true,
        '“': true
    },
    '«': {
        '»': true
    },
    '»': {
        '«': true
    },
    '‹': {
        '›': true
    },
    '›': {
        '‹': true
    },
    '(': {
        ')': true
    },
    '[': {
        ']': true
    },
    '{': {
        '}': true
    },
    '⟨': {
        '⟩': true
    },
    '「': {
        '」': true
    }
}

/**
 * Check whether parent contains word-nodes between
 * `start` and `end`.
 *
 * @param {NLCSTParentNode} parent - Node with children.
 * @param {number} start - Starting point (inclusive).
 * @param {number} end - Ending point (exclusive).
 * @return {boolean} - Whether word-nodes are found.
 */
function containsWord(parent, start, end) {
    var siblings = parent.children;
    var index = start - 1;

    while (++index < end) {
        if (siblings[index].type === 'WordNode') {
            return true;
        }
    }

    return false;
}

/**
 * Check if there are word nodes before `position`
 * in `parent`.
 *
 * @param {NLCSTParentNode} parent - Node with children.
 * @param {number} position - Position before which to
 *   check.
 * @return {boolean} - Whether word-nodes are found.
 */
function hasWordsBefore(parent, position) {
    return containsWord(parent, 0, position);
}

/**
 * Check if there are word nodes before `position`
 * in `parent`.
 *
 * @param {NLCSTParentNode} parent - Node with children.
 * @param {number} position - Position afyer which to
 *   check.
 * @return {boolean} - Whether word-nodes are found.
 */
function hasWordsAfter(parent, position) {
    return containsWord(parent, position + 1, parent.children.length);
}

/**
 * Check if `node` is in `delimiters`.
 *
 * @param {Node} node - Node to check.
 * @param {Object} delimiters - Map of delimiters.
 * @return {(Node|boolean)?} - `false` if not, the given
 *   node when true, and `null` when this is a white-space
 *   node.
 */
function delimiterCheck(node, delimiters) {
    var type = node.type;

    if (type === 'WordNode' || type === 'SourceNode') {
        return false;
    }

    if (type === 'WhiteSpaceNode') {
        return null;
    }

    return toString(node) in delimiters ? node : false;
}

/**
 * Find the next delimiter after `position` in
 * `parent`. Returns the delimiter node when found.
 *
 * @param {NLCSTParentNode} parent - Parent to search.
 * @param {number} position - Position to search after.
 * @param {Object} delimiters - Map of delimiters.
 * @return {Node?} - Following delimiter.
 */
function nextDelimiter(parent, position, delimiters) {
    var siblings = parent.children;
    var index = position;
    var length = siblings.length;
    var result;

    while (++index < length) {
        result = delimiterCheck(siblings[index], delimiters);

        if (result === null) {
            continue;
        }

        return result;
    }

    return null;
}

/**
 * Find the previous delimiter before `position` in
 * `parent`. Returns the delimiter node when found.
 *
 * @param {NLCSTParentNode} parent - Parent to search.
 * @param {number} position - Position to search before.
 * @param {Object} delimiters - Map of delimiters.
 * @return {Node?} - Previous delimiter.
 */
function previousDelimiter(parent, position, delimiters) {
    var siblings = parent.children;
    var index = position;
    var result;

    while (index--) {
        result = delimiterCheck(siblings[index], delimiters);

        if (result === null) {
            continue;
        }

        return result;
    }

    return null;
}

/**
 * Check if the node in `parent` at `position` is enclosed
 * by matching delimiters.
 *
 * @param {NLCSTParentNode} parent - Parent to search.
 * @param {number} position - Position of node to check.
 * @param {Object} delimiters - Map of delimiters.
 * @return {boolean} - Whether the node is wrapped.
 */
function isWrapped(parent, position, delimiters) {
    var prev = previousDelimiter(parent, position, delimiters);
    var next;

    if (prev) {
        next = nextDelimiter(parent, position, delimiters[toString(prev)]);
    }

    return Boolean(next);
}

/**
 * Check if the node in `parent` at `position` is enclosed
 * by matching delimiters.
 *
 * For example, in:
 *
 * -   `Foo - is meant as a literal.`;
 * -   `Meant as a literal is - foo.`;
 * -   `The word “foo” is meant as a literal.`;
 *
 * ...`foo` is literal.
 *
 * @param {NLCSTParentNode} parent - Parent to search.
 * @param {number} index - Position of node to check.
 * @return {boolean} - Whether the node is wrapped.
 */
function isLiteral(parent, index) {
    if (!(parent && parent.children)) {
        throw new Error('Parent must be a node');
    }

    if (isNaN(index)) {
        throw new Error('Index must be a number');
    }

    if (
        (!hasWordsBefore(parent, index) && nextDelimiter(parent, index, single)) ||
        (!hasWordsAfter(parent, index) && previousDelimiter(parent, index, single)) ||
        isWrapped(parent, index, pairs)
    ) {
        return true;
    }

    return false;
}

/*
 * Expose.
 */

module.exports = isLiteral;

},{"nlcst-to-string":2}],2:[function(require,module,exports){
/**
 * @author Titus Wormer
 * @copyright 2014-2015 Titus Wormer
 * @license MIT
 * @module nlcst:to-string
 * @fileoverview Transform an NLCST node into a string.
 */

'use strict';

/* eslint-env commonjs */

/**
 * Stringify an NLCST node.
 *
 * @param {NLCSTNode|Array.<NLCSTNode>} node - Node to to
 *   stringify.
 * @return {string} - Stringified `node`.
 */
function nlcstToString(node) {
    var values;
    var length;
    var children;

    if (typeof node.value === 'string') {
        return node.value;
    }

    children = 'length' in node ? node : node.children;
    length = children.length;

    /*
     * Shortcut: This is pretty common, and a small performance win.
     */

    if (length === 1 && 'value' in children[0]) {
        return children[0].value;
    }

    values = [];

    while (length--) {
        values[length] = nlcstToString(children[length]);
    }

    return values.join('');
}

/*
 * Expose.
 */

module.exports = nlcstToString;

},{}]},{},[1])(1)
});