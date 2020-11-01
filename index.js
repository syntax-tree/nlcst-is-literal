'use strict'

var toString = require('nlcst-to-string')

module.exports = isLiteral

var single = [
  '-', // Hyphen-minus
  '–', // En dash
  '—', // Em dash
  ':', // Colon
  ';' // Semi-colon
]

// Pair delimiters.
// From common sense, and WikiPedia:
// <https://en.wikipedia.org/wiki/Quotation_mark>.
var pairs = {
  ',': [','],
  '-': ['-'],
  '–': ['–'],
  '—': ['—'],
  '"': ['"'],
  "'": ["'"],
  '‘': ['’'],
  '‚': ['’'],
  '’': ['’', '‚'],
  '“': ['”'],
  '”': ['”'],
  '„': ['”', '“'],
  '«': ['»'],
  '»': ['«'],
  '‹': ['›'],
  '›': ['‹'],
  '(': [')'],
  '[': [']'],
  '{': ['}'],
  '⟨': ['⟩'],
  '「': ['」']
}

var open = []
var key

for (key in pairs) {
  open.push(key)
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

  return Boolean(
    (!containsWord(parent, -1, index) &&
      siblingDelimiter(parent, index, 1, single)) ||
      (!containsWord(parent, index, parent.children.length) &&
        siblingDelimiter(parent, index, -1, single)) ||
      isWrapped(parent, index)
  )
}

// Check if the node in `parent` at `position` is enclosed by matching
// delimiters.
function isWrapped(parent, position) {
  var previous = siblingDelimiter(parent, position, -1, open)

  if (previous) {
    return siblingDelimiter(parent, position, 1, pairs[toString(previous)])
  }
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
      return delimiters.indexOf(toString(sibling)) > -1 && sibling
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
