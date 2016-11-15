'use strict';

/* eslint-env mocha */

var assert = require('assert');
var visit = require('unist-util-visit');
var retext = require('retext');
var isLiteral = require('./');

describe('isLiteral()', function () {
  describe('should work', function () {
    it('should throw when not given a parent', function () {
      assert.throws(function () {
        isLiteral();
      }, /Parent must be a node/);

      assert.throws(function () {
        isLiteral({});
      }, /Parent must be a node/);
    });

    it('should throw when not given an index', function () {
      assert.throws(function () {
        isLiteral({children: []});
      }, /Index must be a number/);
    });

    it('should work on single word sentences', function () {
      assert.doesNotThrow(function () {
        process('Well? Ha! Funky', function (node, index, parent) {
          assert.strictEqual(isLiteral(parent, index), false);
        });
      });
    });
  });

  describe('Initial', function () {
    [
      'Foo - is meant as a literal.',
      'Foo – is meant as a literal.',
      'Foo — is meant as a literal.',
      'Foo– is meant as a literal.',
      'Foo— is meant as a literal.',
      'Foo–is meant as a literal.',
      'Foo—is meant as a literal.',
      'Foo: is meant as a literal.',
      'Foo; is meant as a literal.'
    ].forEach(function (fixture) {
      it('should detect `' + fixture + '`', function () {
        process(fixture, function (node, index, parent) {
          assert.strictEqual(isLiteral(parent, index), index === 0);
        });
      });
    });
  });

  describe('Final', function () {
    [
      'Meant as a literal is - foo.',
      'Meant as a literal is – foo.',
      'Meant as a literal is — foo.',
      'Meant as a literal is –foo.',
      'Meant as a literal is —foo.',
      'Meant as a literal is–foo.',
      'Meant as a literal is—foo.',
      'Meant as a literal is: foo.',
      'Meant as a literal is; foo.'
    ].forEach(function (fixture) {
      it('should detect `' + fixture + '`', function () {
        process(fixture, function (node, index, parent) {
          var seconLast = parent.children.length - 2;
          assert.strictEqual(isLiteral(parent, index), index === seconLast);
        });
      });
    });
  });

  describe('Internal', function () {
    [
      'The word, foo, is meant as a literal.',
      'The word -foo- is meant as a literal.',
      'The word –foo– is meant as a literal.',
      'The word —foo— is meant as a literal.',
      'The word - foo - is meant as a literal.',
      'The word – foo – is meant as a literal.',
      'The word — foo — is meant as a literal.',
      'The word "foo" is meant as a literal.',
      'The word \'foo\' is meant as a literal.',
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
    ].forEach(function (fixture, n) {
      var pos = 5;

      /* Adjacent hyphens are part of the word. */
      if (n === 1) {
        pos = 4;
      }

      /* Tests for extra spaces. */
      if (n === 4 || n === 5 || n === 6) {
        pos = 6;
      }

      it('should detect `' + fixture + '`', function () {
        process(fixture, function (node, index, parent) {
          assert.strictEqual(isLiteral(parent, index), index === pos);
        });
      });
    });
  });
});

/**
 * Shortcut to process a fixture and invoke `visitor`
 * for each of its word nodes.
 */
function process(fixture, visitor) {
  retext().process(fixture, function (err, file) {
    /* istanbul ignore next */
    if (err) {
      throw err;
    }

    visit(file.namespace('retext').cst, 'WordNode', visitor);
  });
}
