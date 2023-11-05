# Matrix/Vector library for WebGL

This library/package/bundle of scripts&mdash;however I end up releasing
this[^1]&mdash;is a rewrite of some of the `Common` scripts that are distributed
as part of the 8th edition of [_Interactive Computer Graphics with
WebGL._][book-repo].

I'm rewriting these to provide current and future students of _COIS-4480H:
Computer Graphics_ at Trent University, which I'm assisting with, with a nicer
foundation with which to do their labs and assignments. The current code samples
included with the textbook are... of dubious quality, sadly. Not only are they
written in ancient JavaScript, but there are several bugs when you start to use
them beyond their most basic level[^2].

---

**This is still a work in progress.** I haven't decided how I want to bundle
this up yet. I'd like to do it in such a way that VS Code automatically gets all
the doc-comments I write for all the overloads without having to make students
configure a `jsconfig` or `tsconfig` or something. I may switch them to pure JS
with JSDoc annotations to make it as frictionless as possible.

...but first, I need to get caught up marking the assignments 😅

---

[book-repo]: https://github.com/jiayaozhang/Interactive-Computer-Graphics-WebGL

[^1]: However I end up releasing this, I still have a few more functions to
finish up. I may have to bring in a bundler to get the final output exactly as I
like.

[^2]: I can't blame the authors, though, since their README mentions some
struggles against the publisher.
