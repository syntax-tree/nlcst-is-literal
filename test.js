/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist-util-visit').Visitor<Node>} Visitor
 */

import assert from 'assert'
import test from 'tape'
// @ts-expect-error remove when typed.
import retext from 'retext'
import {visit} from 'unist-util-visit'
import {isLiteral} from './index.js'

test('isLiteral()', (t) => {
  t.throws(
    () => {
      // @ts-expect-error runtime.
      isLiteral()
    },
    /Parent must be a node/,
    'should throw without arguments'
  )

  t.throws(
    () => {
      // @ts-expect-error runtime.
      isLiteral({})
    },
    /Parent must be a node/,
    'should throw without parent'
  )

  t.throws(
    () => {
      // @ts-expect-error runtime.
      isLiteral({children: []})
    },
    /Index must be a number/,
    'should throw without node'
  )

  t.throws(
    () => {
      // @ts-expect-error runtime.
      isLiteral({children: []}, {type: 'a'})
    },
    /Node must be a child of `parent`/,
    'should throw if `node` is not in `parent`'
  )

  t.doesNotThrow(() => {
    const n = {type: 'a'}
    // @ts-expect-error runtime.
    isLiteral({children: [n]}, n)
  }, 'should not throw if `node` is in `parent`')

  t.doesNotThrow(() => {
    process(
      'Well? Ha! Funky',
      /** @type {Visitor} */ (_, index, parent) => {
        assert.strictEqual(
          parent && index !== null && isLiteral(parent, index),
          false
        )
      }
    )
  }, 'should work on single word sentences')

  t.doesNotThrow(() => {
    const fixtures = [
      'Foo - is meant as a literal.',
      'Foo – is meant as a literal.',
      'Foo — is meant as a literal.',
      'Foo– is meant as a literal.',
      'Foo— is meant as a literal.',
      'Foo–is meant as a literal.',
      'Foo—is meant as a literal.',
      'Foo: is meant as a literal.',
      'Foo; is meant as a literal.'
    ]
    let index = -1

    while (++index < fixtures.length) {
      process(
        fixtures[index],
        /** @type {Visitor} */ (_, index, parent) => {
          assert.strictEqual(
            parent && index !== null && isLiteral(parent, index),
            index === 0,
            String(index)
          )
        }
      )
    }
  }, 'Initial')

  t.doesNotThrow(() => {
    const fixtures = [
      'Meant as a literal is - foo.',
      'Meant as a literal is – foo.',
      'Meant as a literal is — foo.',
      'Meant as a literal is –foo.',
      'Meant as a literal is —foo.',
      'Meant as a literal is–foo.',
      'Meant as a literal is—foo.',
      'Meant as a literal is: foo.',
      'Meant as a literal is; foo.'
    ]
    let index = -1

    while (++index < fixtures.length) {
      process(
        fixtures[index],
        /** @type {Visitor} */ (_, index, parent) => {
          assert.strictEqual(
            parent && index !== null && isLiteral(parent, index),
            parent && index === parent.children.length - 2,
            String(index)
          )
        }
      )
    }
  }, 'Final')

  t.doesNotThrow(() => {
    const fixtures = [
      'The word, foo, is meant as a literal.',
      'The word -foo- is meant as a literal.',
      'The word –foo– is meant as a literal.',
      'The word —foo— is meant as a literal.',
      'The word - foo - is meant as a literal.',
      'The word – foo – is meant as a literal.',
      'The word — foo — is meant as a literal.',
      'The word "foo" is meant as a literal.',
      "The word 'foo' is meant as a literal.",
      'The word ‘foo’ is meant as a literal.',
      'The word ‚foo’ is meant as a literal.',
      'The word ’foo’ is meant as a literal.,',
      'The word ‚foo’ is meant as a literal.',
      'The word “foo” is meant as a literal.',
      'The word ”foo” is meant as a literal.',
      'The word „foo” is meant as a literal.',
      'The word „foo“ is meant as a literal.',
      'The word «foo» is meant as a literal.',
      'The word »foo« is meant as a literal.',
      'The word ‹foo› is meant as a literal.',
      'The word ›foo‹ is meant as a literal.',
      'The word (foo) is meant as a literal.',
      'The word [foo] is meant as a literal.',
      'The word {foo} is meant as a literal.',
      'The word ⟨foo⟩ is meant as a literal.',
      'The word 「foo」 is meant as a literal.'
    ]
    let index = -1

    while (++index < fixtures.length) {
      process(
        fixtures[index],
        /** @type {Visitor} */ (_, place, parent) => {
          let pos = 5

          // Adjacent hyphens are part of the word.
          if (index === 1) {
            pos = 4
          }

          // Tests for extra spaces.
          if (index === 4 || index === 5 || index === 6) {
            pos = 6
          }

          assert.strictEqual(
            parent && place !== null && isLiteral(parent, place),
            place === pos,
            String(index)
          )
        }
      )
    }
  }, 'Internal')

  t.end()
})

/**
 * Shortcut to process a fixture and invoke `visitor` for each of its word
 * nodes.
 * @param {string} fixture
 * @param {Visitor} visitor
 */
function process(fixture, visitor) {
  visit(retext().parse(fixture), 'WordNode', visitor)
}
