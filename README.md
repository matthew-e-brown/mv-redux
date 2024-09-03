# Matrix/Vector library for WebGL

This library is a rewrite of the "`Common`" scripts folder that is distributed
with the 8th edition of [_Interactive Computer Graphics with WebGL_][book-repo].

These have been rewritten to provide a nicer foundation for the labs and
assignments for _COIS-4480H: Computer Graphics_ at Trent University, which I'm
assisting with. The code samples included with the textbook are... of dubious
quality, sadly. Not only are they written in ancient JavaScript, but there are
more than a few bugs that start to appear as you use the library.

[book-repo]: https://github.com/jiayaozhang/Interactive-Computer-Graphics-WebGL

## Features

- Fully **backwards compatible** with `Common/MVNew.js`.
- All function overloads have full JSDoc **documentation,** including examples
  for several.
- **Performance** is a goal (see below):
  - Quality-of-life features like classes, closures, and even loops are avoided
    wherever practical: all operations are implemented by hand.
  - Matrix–vector operations are implemented with as few helper functions as
    possible to reduce overhead.
- **Error messages** have been massively improved:
  - Errors are no longer truncated in a `window.alert` popup; they appear in the
    console.
  - Shader compilation logs output with backticks around them.
  - All functions have in-depth argument checking.
- **Additional helper functions** provided for initialization:
  - `compileShader` and its variants `compileShaderFromURL` and
    `compileShaderFromScriptTag`, as well as `linkProgram`, provide an extended
    version of the functionality offered by the original `initShaders` from
    `Common/initShaders.js`.
  - `initCanvas` handles support for Hi-DPI/Retina displays as well as
    fullscreen canvases.

### Performance

It's mentioned above the "performance is a goal." While this is true, a few
trade-offs have been intentionally made.

1.  Because this library's primary use-case is to be used by students for
    _COIS-4480H,_ debugging support takes precedence. That's why functions which
    could otherwise be very simple have such in-depth error handling: better
    messages in the console means an easier time debugging.
2.  Some other libraries, like [glMatrix][glm], make use of an `out` parameter
    for many of their methods to avoid unnecessary allocations. Otherwise,
    operations like a matrix inverse end up allocating a bunch of tiny arrays.
    This library does not do this in an effort to simplify usage, make it more
    backwards compatible, and to keep it closer to the functions seen in GLSL.

[glm]: https://glmatrix.net/

## Usage

For right now, this package is only available as an ES Module. After adding it
to your project with `npm i -S mv-redux`, you can use it in one of two ways:

1.  Import everything directly. The `mv-redux`, `mv-redux/helpers`, and
    `mv-redux/init` entrypoints provide easy access all of the core
    matrix–vector functionality.
2.  Import from each individual module. The `mv-redux/vec`, `mv-redux/mat`,
    `mv-redux/ops`, and `mv-redux/transforms` modules can be imported from
    directly for more tree-shakable usage. The same goes for `init/shaders` and
    `init/canvas`.

## Roadmap

Some things I'd like to do eventually include:

- **(Maybe):** Helper library for creating interactive menus, i.e. ways to
  quickly generate `<input>` and `<select>` elements with auto-updating labels
  and event listeners. I will try to remember to revisit this idea after this
  coming semester is over.
- Configure `tsconfig`/`package.json` in such a way to allow elegantly importing
  this library both by a bundler and in the browser, as well as without needing
  to fiddle with VS Code's/Intellisense's auto-import settings. I wrestled with
  these config files more than I would like to ever need to again.
- Make this library even _more_ tree-shakable, with each function getting its
  own module. This will require winning the aforementioned bundler-wars.
