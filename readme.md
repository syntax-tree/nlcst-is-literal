# nlcst-is-literal

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[nlcst][] utility to check if a node is meant literally.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`isLiteral(parent, index|child)`](#isliteralparent-indexchild)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This utility can check if a node is meant literally.

## When should I use this?

This package is a tiny utility that helps when dealing with words.
It’s useful if a tool wants to exclude values that are possibly void of
meaning.
For example, a spell-checker could exclude these literal words, thus not warning
about “monsieur”.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install nlcst-is-literal
```

In Deno with [`esm.sh`][esmsh]:

```js
import {isLiteral} from 'https://esm.sh/nlcst-is-literal@3'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {isLiteral} from 'https://esm.sh/nlcst-is-literal@3?bundle'
</script>
```

## Use

Say our document `example.txt` contains:

```txt
The word “foo” is meant as a literal.

The word «bar» is meant as a literal.

The word (baz) is meant as a literal.

The word, qux, is meant as a literal.

The word — quux — is meant as a literal.
```

…and our module `example.js` looks as follows:

```js
import {read} from 'to-vfile'
import {ParseEnglish} from 'parse-english'
import {visit} from 'unist-util-visit'
import {toString} from 'nlcst-to-string'
import {isLiteral} from 'nlcst-is-literal'

const file = await read('example.txt')
const tree = new ParseEnglish().parse(String(file))

visit(tree, 'WordNode', function (node, index, parent) {
  if (isLiteral(parent, index)) {
    console.log(toString(node))
  }
})
```

…now running `node example.js` yields:

```txt
foo
bar
baz
qux
quux
```

## API

This package exports the identifier [`isLiteral`][api-is-literal].
There is no default export.

### `isLiteral(parent, index|child)`

Check if the child in `parent` at `index` is enclosed by matching delimiters.

For example, `foo` is literal in the following samples:

*   `Foo - is meant as a literal.`
*   `Meant as a literal is - foo.`
*   `The word “foo” is meant as a literal.`

###### Parameters

*   `parent` ([`Node`][node])
    — parent node
*   `index` (`number`)
    — index of child in parent
*   `child` ([`Node`][node])
    — child node of parent

###### Returns

Whether the child is a literal (`boolean`).

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `nlcst-is-literal@^3`,
compatible with Node.js 16.

## Related

*   [`nlcst-normalize`](https://github.com/syntax-tree/nlcst-normalize)
    — normalize a word for easier comparison
*   [`nlcst-search`](https://github.com/syntax-tree/nlcst-search)
    — search for patterns

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/nlcst-is-literal/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/nlcst-is-literal/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/nlcst-is-literal.svg

[coverage]: https://codecov.io/github/syntax-tree/nlcst-is-literal

[downloads-badge]: https://img.shields.io/npm/dm/nlcst-is-literal.svg

[downloads]: https://www.npmjs.com/package/nlcst-is-literal

[size-badge]: https://img.shields.io/badge/dynamic/json?label=minzipped%20size&query=$.size.compressedSize&url=https://deno.bundlejs.com/?q=nlcst-is-literal

[size]: https://bundlejs.com/?q=nlcst-is-literal

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[author]: https://wooorm.com

[health]: https://github.com/syntax-tree/.github

[contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/main/support.md

[coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[nlcst]: https://github.com/syntax-tree/nlcst

[node]: https://github.com/syntax-tree/nlcst#nodes

[api-is-literal]: #isliteralparent-indexchild
