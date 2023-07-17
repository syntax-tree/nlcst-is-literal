/**
 * @typedef {import('nlcst').Nodes} Nodes
 * @typedef {import('nlcst').Parents} Parents
 * @typedef {import('nlcst').RootContent} RootContent
 */

import {toString} from 'nlcst-to-string'

const single = [
  '-', // Hyphen-minus
  '–', // En dash
  '—', // Em dash
  ':', // Colon
  ';' // Semi-colon
]

/**
 * Pair delimiters.
 * From common sense, and WikiPedia:
 * <https://en.wikipedia.org/wiki/Quotation_mark>.
 *
 * @type {Record<string, Array<string>>}
 */
const pairs = {
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

const open = Object.keys(pairs)

/**
 * Check if the child in `parent` at `index` is enclosed by matching
 * delimiters.
 *
 * For example, `foo` is literal in the following samples:
 *
 * *   `Foo - is meant as a literal.`
 * *   `Meant as a literal is - foo.`
 * *   `The word “foo” is meant as a literal.`
 *
 * @template {Parents} ParentType
 *   Parent node.
 * @param {ParentType} parent
 *   Parent node.
 * @param {ParentType['children'][number] | number} index
 *   Child node of parent or index of child in parent.
 * @returns {boolean}
 *   Whether the child is a literal.
 */
export function isLiteral(parent, index) {
  if (!(parent && parent.children)) {
    throw new Error('Parent must be a node')
  }

  /** @type {Array<RootContent>} */
  const siblings = parent.children

  if (index !== null && typeof index === 'object' && 'type' in index) {
    index = siblings.indexOf(index)

    if (index === -1) {
      throw new Error('Node must be a child of `parent`')
    }
  }

  if (typeof index !== 'number' || Number.isNaN(index)) {
    throw new TypeError('Index must be a number')
  }

  return Boolean(
    (!containsWord(parent, -1, index) &&
      siblingDelimiter(parent, index, 1, single)) ||
      (!containsWord(parent, index, siblings.length) &&
        siblingDelimiter(parent, index, -1, single)) ||
      isWrapped(parent, index)
  )
}

/**
 * Check if the node in `parent` at `position` is enclosed by matching
 * delimiters.
 *
 * @param {Parents} parent
 *   Parent node.
 * @param {number} position
 *   Position to look around.
 * @returns {boolean}
 *   Whether a child is wrapped.
 */
function isWrapped(parent, position) {
  const previous = siblingDelimiter(parent, position, -1, open)

  if (previous) {
    return (
      siblingDelimiter(parent, position, 1, pairs[toString(previous)]) !==
      undefined
    )
  }

  return false
}

/**
 * Find the previous or next delimiter before or after `position` in `parent`.
 * Returns the delimiter node when found.
 *
 * @param {Parents} parent
 *   Parent node.
 * @param {number} position
 *   Start position in `parent`.
 * @param {number} step
 *   Step (`-1` to move back, `1` to move forward).
 * @param {Array<string>} delimiters
 *   Delimiters to look for.
 * @returns {Nodes | undefined}
 *   Delimiter, if found.
 */
function siblingDelimiter(parent, position, step, delimiters) {
  let index = position + step

  while (index > -1 && index < parent.children.length) {
    const sibling = parent.children[index]

    if (sibling.type === 'WordNode' || sibling.type === 'SourceNode') {
      break
    }

    if (sibling.type !== 'WhiteSpaceNode') {
      return delimiters.includes(toString(sibling)) ? sibling : undefined
    }

    index += step
  }
}

/**
 * Check if parent contains word nodes between `start` and `end` (both
 * excluding).
 *
 * @param {Parents} parent
 *   Parent node.
 * @param {number} start
 *   Start index in `parent` (excluding).
 * @param {number} end
 *   End index in `parent` (excluding).
 * @returns {boolean}
 *   Whether a child contains a word.
 */
function containsWord(parent, start, end) {
  while (++start < end) {
    if (parent.children[start].type === 'WordNode') {
      return true
    }
  }

  return false
}
