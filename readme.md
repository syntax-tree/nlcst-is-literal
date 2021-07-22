# nlcst-is-literal

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**nlcst**][nlcst] utility to check if a node is meant literally.

Useful if a tool wants to exclude values that are possibly void of meaning.
For example, a spell-checker could exclude these literal words, thus not warning
about “monsieur”.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install nlcst-is-literal
```

## Use

Say we have the following file, `example.txt`:

```txt
The word “foo” is meant as a literal.

The word «bar» is meant as a literal.

The word (baz) is meant as a literal.

The word, qux, is meant as a literal.

The word — quux — is meant as a literal.
```

And our script, `example.js`, looks as follows:

```js
import {readSync} from 'to-vfile'
import {unified} from 'unified'
import retextEnglish from 'retext-english'
import {visit} from 'unist-util-visit'
import {toString} from 'nlcst-to-string'
import {isLiteral} from 'nlcst-is-literal'

const file = readSync('example.txt')

const tree = unified().use(retextEnglish).parse(file)

visit(tree, 'WordNode', visitor)

function visitor(node, index, parent) {
  if (isLiteral(parent, index)) {
    console.log(toString(node))
  }
}
```

Now, running `node example` yields:

```txt
foo
bar
baz
qux
quux
```

## API

This package exports the following identifiers: `isLiteral`.
There is no default export.

### `isLiteral(parent, index|child)`

Check if the `child` in `parent` is enclosed by matching delimiters.
If `index` is given, the [child][] of `parent` at that [index][] is checked.

For example, `foo` is literal in the following samples:

*   `Foo - is meant as a literal.`
*   `Meant as a literal is - foo.`
*   `The word “foo” is meant as a literal.`

## Related

*   [`nlcst-normalize`](https://github.com/syntax-tree/nlcst-normalize)
    — Normalize a word for easier comparison
*   [`nlcst-search`](https://github.com/syntax-tree/nlcst-search)
    — Search for patterns

## Contribute

See [`contributing.md` in `syntax-tree/.github`][contributing] for ways to get
started.
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

[size-badge]: https://img.shields.io/bundlephobia/minzip/nlcst-is-literal.svg

[size]: https://bundlephobia.com/result?p=nlcst-is-literal

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/syntax-tree/.github/blob/HEAD/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/HEAD/support.md

[coc]: https://github.com/syntax-tree/.github/blob/HEAD/code-of-conduct.md

[nlcst]: https://github.com/syntax-tree/nlcst

[index]: https://github.com/syntax-tree/unist#index

[child]: https://github.com/syntax-tree/unist#child
