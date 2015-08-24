# nlcst-is-literal [![Build Status](https://img.shields.io/travis/wooorm/nlcst-is-literal.svg)](https://travis-ci.org/wooorm/nlcst-is-literal) [![Coverage Status](https://img.shields.io/codecov/c/github/wooorm/nlcst-is-literal.svg)](https://codecov.io/github/wooorm/nlcst-is-literal)

Check whether an NLCST node is meant literally. Useful if a tool wants to
exclude these values possibly void of meaning.

As an example, a spell-checker could exclude these literal words, thus not
warning about “monsieur”.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install nlcst-is-literal
```

**nlcst-is-literal** is also available for [bower](http://bower.io/#install-packages),
[component](https://github.com/componentjs/component), and
[duo](http://duojs.org/#getting-started), and as an AMD, CommonJS, and globals
module, [uncompressed](nlcst-is-literal.js) and [compressed](nlcst-is-literal.min.js).

## Usage

```javascript
var retext = require('retext');
var visit = require('unist-util-visit');
var toString = require('nlcst-to-string');
var isLiteral = require('.');

retext().use(function () {
    return function (cst) {
        visit(cst, 'WordNode', function (node, index, parent) {
            if (isLiteral(parent, index)) {
                console.log(toString(node));
            }
        });
    }
}).process([
    'The word “foo” is meant as a literal.',
    'The word «bar» is meant as a literal.',
    'The word (baz) is meant as a literal.',
    'The word, qux, is meant as a literal.',
    'The word — quux — is meant as a literal.'
].join('\n\n'));
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

### isLiteral(parent, index)

Check if the node in `parent` at `position` is enclosed
by matching delimiters.

For example, in:

*   `Foo - is meant as a literal.`;
*   `Meant as a literal is - foo.`;
*   `The word “foo” is meant as a literal.`;

...`foo` is literal.

**Parameters**

*   `node` ([`NLCSTParentNode`](https://github.com/wooorm/nlcst#parent))
    — Parent to search.

*   `nodes` (`Array.<NLCSTNode>`) — Position of node to check.

**Returns**

`boolean` — Whether the node is literal.

**Throws**

*   `Error` — When no parent node is given;
*   `Error` — When no index is given.

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
