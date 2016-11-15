# nlcst-is-literal [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

Check if an NLCST node is meant literally.  Useful if a tool wants to
exclude these values possibly void of meaning.

As an example, a spell-checker could exclude these literal words, thus not
warning about “monsieur”.

## Installation

[npm][]:

```bash
npm install nlcst-is-literal
```

## Usage

```javascript
var retext = require('retext');
var visit = require('unist-util-visit');
var toString = require('nlcst-to-string');
var literal = require('nlcst-is-literal');

retext().use(plugin).process([
  'The word “foo” is meant as a literal.',
  'The word «bar» is meant as a literal.',
  'The word (baz) is meant as a literal.',
  'The word, qux, is meant as a literal.',
  'The word — quux — is meant as a literal.'
].join('\n\n'));

function plugin() {
  return transformer;
  function transformer(tree) {
    visit(tree, 'WordNode', visitor);
  }
  function visitor(node, index, parent) {
    if (literal(parent, index)) {
      console.log(toString(node));
    }
  }
}
```

Yields:

```text
foo
bar
baz
qux
quux
```

## API

### `isLiteral(parent, index)`

Check if the node in `parent` at `position` is enclosed
by matching delimiters.

For example, in:

*   `Foo - is meant as a literal.`;
*   `Meant as a literal is - foo.`;
*   `The word “foo” is meant as a literal.`;

...`foo` is literal.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[travis-badge]: https://img.shields.io/travis/wooorm/nlcst-is-literal.svg

[travis]: https://travis-ci.org/wooorm/nlcst-is-literal

[codecov-badge]: https://img.shields.io/codecov/c/github/wooorm/nlcst-is-literal.svg

[codecov]: https://codecov.io/github/wooorm/nlcst-is-literal

[npm]: https://docs.npmjs.com/cli/install

[license]: LICENSE

[author]: http://wooorm.com
