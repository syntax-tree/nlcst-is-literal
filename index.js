'use strict'

var toString = require('nlcst-to-string')

module.exports = isLiteral

var single = {
  '-': true, // Hyphen-minus
  '–': true, // En dash
  '—': true, // Em dash
  ':': true, // Colon
  ';': true // Semi-colon
}

// Pair delimiters.
// From common sense, and WikiPedia:
// <https://en.wikipedia.org/wiki/Quotation_mark>.
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
  "'": {
    "'": true
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

// Check if the node in `parent` at `position` is enclosed by matching
// delimiters.
function isLiteral(parent, index) {
  if (!(parent && parent.children)) {
    throw new Error('Parent must be a node')
  }

  if (index !== null && typeof index === 'object' && 'type' in index) {
    index = parent.children.indexOf(index)

    if (index === -1) {
      throw new Error('Node must be a child of `parent`')
    }
  }

  if (isNaN(index)) {
    throw new Error('Index must be a number')
  }

  if (
    (!containsWord(parent, -1, index) &&
      siblingDelimiter(parent, index, 1, single)) ||
    (!containsWord(parent, index, parent.children.length) &&
      siblingDelimiter(parent, index, -1, single)) ||
    isWrapped(parent, index, pairs)
  ) {
    return true
  }

  return false
}

// Check if the node in `parent` at `position` is enclosed by matching
// delimiters.
function isWrapped(parent, position, delimiters) {
  var previous = siblingDelimiter(parent, position, -1, delimiters)
  var next

  if (previous) {
    next = siblingDelimiter(parent, position, 1, delimiters[toString(previous)])
  }

  return next
}

// Find the previous or next delimiter before or after `position` in `parent`.
// Returns the delimiter node when found.
function siblingDelimiter(parent, position, step, delimiters) {
  var index = position + step
  var sibling

  while (index > -1 && index < parent.children.length) {
    sibling = parent.children[index]

    if (sibling.type === 'WordNode' || sibling.type === 'SourceNode') {
      return
    }

    if (sibling.type !== 'WhiteSpaceNode') {
      return toString(sibling) in delimiters && sibling
    }

    index += step
  }
}

// Check if parent contains word-nodes between `start` and `end` (both
// excluding).
function containsWord(parent, start, end) {
  while (++start < end) {
    if (parent.children[start].type === 'WordNode') {
      return true
    }
  }
}
