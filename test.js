/**
 * @typedef {import('nlcst').Root} Root
 * @typedef {import('unist-util-visit').BuildVisitor<Root, 'WordNode'>} Visitor
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {ParseEnglish} from 'parse-english'
import {visit} from 'unist-util-visit'
import {isLiteral} from './index.js'

test('isLiteral', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('./index.js')).sort(), [
      'isLiteral'
    ])
  })

  await t.test('should throw without arguments', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles a missing node.
      isLiteral()
    }, /Parent must be a node/)
  })

  await t.test('should throw without parent', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles a non-none.
      isLiteral({})
    }, /Parent must be a node/)
  })

  await t.test('should throw without node', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles a non-none.
      isLiteral({children: []})
    }, /Index must be a number/)
  })

  await t.test('should throw if `node` is not in `parent`', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles a non-none.
      isLiteral({children: []}, {type: 'a'})
    }, /Node must be a child of `parent`/)
  })

  await t.test('should not throw if `node` is in `parent`', async function () {
    assert.doesNotThrow(function () {
      const n = {type: 'a'}
      // @ts-expect-error: check how the runtime handles a non-none.
      isLiteral({children: [n]}, n)
    })
  })

  await t.test('should work on single word sentences', async function () {
    assert.doesNotThrow(function () {
      process('Well? Ha! Funky', function (_, index, parent) {
        assert(parent)
        assert(index !== undefined)
        assert.strictEqual(isLiteral(parent, index), false)
      })
    })
  })

  await t.test('should work on initial nodes', async function () {
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
      process(fixtures[index], function (_, index, parent) {
        assert(parent)
        assert(index !== undefined)
        assert.strictEqual(isLiteral(parent, index), index === 0)
      })
    }
  })

  await t.test('should work on final nodes', async function () {
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
      process(fixtures[index], function (_, index, parent) {
        assert(parent)
        assert(index !== undefined)
        assert.strictEqual(
          isLiteral(parent, index),
          index === parent.children.length - 2
        )
      })
    }
  })

  await t.test('should work on internal nodes', async function () {
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
      process(fixtures[index], function (_, place, parent) {
        let pos = 5

        // Adjacent hyphens are part of the word.
        if (index === 1) {
          pos = 4
        }

        // Tests for extra spaces.
        if (index === 4 || index === 5 || index === 6) {
          pos = 6
        }

        assert(parent)
        assert(place !== undefined)
        assert.strictEqual(isLiteral(parent, place), place === pos)
      })
    }
  })
})

/**
 * Shortcut to process a fixture and invoke `visitor` for each of its word
 * nodes.
 *
 * @param {string} fixture
 *   Natural language.
 * @param {Visitor} visitor
 *   Visitor.
 */
function process(fixture, visitor) {
  const tree = new ParseEnglish().parse(fixture)
  visit(tree, 'WordNode', visitor)
}
