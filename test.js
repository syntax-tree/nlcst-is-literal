'use strict'

var assert = require('assert')
var test = require('tape')
var visit = require('unist-util-visit')
var retext = require('retext')
var isLiteral = require('.')

test('isLiteral()', function (t) {
  t.throws(
    function () {
      isLiteral()
    },
    /Parent must be a node/,
    'should throw without arguments'
  )

  t.throws(
    function () {
      isLiteral({})
    },
    /Parent must be a node/,
    'should throw without parent'
  )

  t.throws(
    function () {
      isLiteral({children: []})
    },
    /Index must be a number/,
    'should throw without node'
  )

  t.throws(
    function () {
      isLiteral({children: []}, {type: 'a'})
    },
    /Node must be a child of `parent`/,
    'should throw if `node` is not in `parent`'
  )

  t.doesNotThrow(function () {
    var n = {type: 'a'}
    isLiteral({children: [n]}, n)
  }, 'should not throw if `node` is in `parent`')

  t.doesNotThrow(function () {
    process('Well? Ha! Funky', function (node, index, parent) {
      assert.strictEqual(isLiteral(parent, index), false)
    })
  }, 'should work on single word sentences')

  t.doesNotThrow(function () {
    var fixtures = [
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
    var index = -1

    while (++index < fixtures.length) {
      process(fixtures[index], function (node, index, parent) {
        assert.strictEqual(isLiteral(parent, index), index === 0, index)
      })
    }
  }, 'Initial')

  t.doesNotThrow(function () {
    var fixtures = [
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
    var index = -1

    while (++index < fixtures.length) {
      process(fixtures[index], function (node, index, parent) {
        assert.strictEqual(
          isLiteral(parent, index),
          index === parent.children.length - 2,
          index
        )
      })
    }
  }, 'Final')

  t.doesNotThrow(function () {
    var fixtures = [
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
    var index = -1

    while (++index < fixtures.length) {
      process(fixtures[index], function (node, place, parent) {
        var pos = 5

        // Adjacent hyphens are part of the word.
        if (index === 1) {
          pos = 4
        }

        // Tests for extra spaces.
        if (index === 4 || index === 5 || index === 6) {
          pos = 6
        }

        assert.strictEqual(isLiteral(parent, place), place === pos, index)
      })
    }
  }, 'Internal')

  t.end()
})

// Shortcut to process a fixture and invoke `visitor` for each of its word
// nodes.
function process(fixture, visitor) {
  visit(retext().parse(fixture), 'WordNode', visitor)
}
