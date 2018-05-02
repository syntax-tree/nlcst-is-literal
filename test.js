'use strict'

var assert = require('assert')
var test = require('tape')
var visit = require('unist-util-visit')
var retext = require('retext')
var isLiteral = require('.')

test('isLiteral()', function(t) {
  t.throws(
    function() {
      isLiteral()
    },
    /Parent must be a node/,
    'should throw without arguments'
  )

  t.throws(
    function() {
      isLiteral({})
    },
    /Parent must be a node/,
    'should throw without parent'
  )

  t.throws(
    function() {
      isLiteral({children: []})
    },
    /Index must be a number/,
    'should throw without index'
  )

  t.doesNotThrow(function() {
    process('Well? Ha! Funky', function(node, index, parent) {
      assert.strictEqual(isLiteral(parent, index), false)
    })
  }, 'should work on single word sentences')

  t.doesNotThrow(function() {
    ;[
      'Foo - is meant as a literal.',
      'Foo – is meant as a literal.',
      'Foo — is meant as a literal.',
      'Foo– is meant as a literal.',
      'Foo— is meant as a literal.',
      'Foo–is meant as a literal.',
      'Foo—is meant as a literal.',
      'Foo: is meant as a literal.',
      'Foo; is meant as a literal.'
    ].forEach(function(fixture) {
      process(fixture, function(node, index, parent) {
        assert.strictEqual(isLiteral(parent, index), index === 0, fixture)
      })
    })
  }, 'Initial')

  t.doesNotThrow(function() {
    ;[
      'Meant as a literal is - foo.',
      'Meant as a literal is – foo.',
      'Meant as a literal is — foo.',
      'Meant as a literal is –foo.',
      'Meant as a literal is —foo.',
      'Meant as a literal is–foo.',
      'Meant as a literal is—foo.',
      'Meant as a literal is: foo.',
      'Meant as a literal is; foo.'
    ].forEach(function(fixture) {
      process(fixture, function(node, index, parent) {
        assert.strictEqual(
          isLiteral(parent, index),
          index === parent.children.length - 2,
          fixture
        )
      })
    })
  }, 'Final')

  t.doesNotThrow(function() {
    ;[
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
    ].forEach(function(fixture, n) {
      process(fixture, function(node, index, parent) {
        var pos = 5

        /* Adjacent hyphens are part of the word. */
        if (n === 1) {
          pos = 4
        }

        /* Tests for extra spaces. */
        if (n === 4 || n === 5 || n === 6) {
          pos = 6
        }

        assert.strictEqual(isLiteral(parent, index), index === pos, fixture)
      })
    })
  }, 'Internal')

  t.end()
})

/* Shortcut to process a fixture and invoke `visitor`
 * for each of its word nodes. */
function process(fixture, visitor) {
  visit(retext().parse(fixture), 'WordNode', visitor)
}
