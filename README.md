λx. colored nonsense [![Build Status](https://secure.travis-ci.org/emillon/bulletml.png)](http://travis-ci.org/emillon/bulletml) [![Coverage Status](https://coveralls.io/repos/emillon/bulletml/badge.png)](https://coveralls.io/r/emillon/bulletml)
====================

BulletML is a language designed to express bullet behaviour in a shoot'em up
game (turn left, accelerate, spawn children, etc).

![A pattern](http://i.imgur.com/KsVnjFN.gif)
![Another pattern](http://i.imgur.com/uZv0jSc.gif)
![Yet another one](http://i.imgur.com/X9ogXAX.gif)

This repository contains a set of tools to manipulate BulletML in OCaml.

It contains:

  - a parser, to convert a representation (`xml-light`) to an AST
  - a printer
  - a graphic interpreter using SDL
  - a JS app using [js_of_ocaml](http://ocsigen.org/js_of_ocaml/)
  - a test suite

### Interpreter

An interpreter is available. Compile it using `make` and run
`./_obuild/bulletml_run/bulletml_run.asm examples/\[Original\]_btb_6.xml` (or
any other pattern!).

Left click quits, right click reloads the pattern (if you think this is
backwards, this is a great pull request to start contributing).

This particular example also displays the extensible nature of the interpreter:
bulletML has no language of colors, but there is a system of hooks. In that
case, this hook sets the state of bullets to `Purple`:

    let hooks =
      [ "changecolor", fun _ -> Purple ]

And the drawing code uses the state to determine the correct sprite.

    let draw_bullet window (bulleto, bulletp) b =
      let (px, py) = int_pos b.pos in
      let src = match b.state with
      | Blue -> bulleto
      | Purple -> bulletp
      in
      let dst_rect = Sdlvideo.rect ~x:px ~y:py ~w:0 ~h:0 in
      Sdlvideo.blit_surface ~src ~dst:window ~dst_rect ()

### API documentation

You can find it [here](http://emillon.github.io/bulletml/docs/).

### How to build

#### Prereqs

Install [OCaml](http://ocaml.org/), [opam](http://opam.ocamlpro.com/), and
`libsdl-image1.2-dev` from your distribution.

Then, you can run `opam install ocp-build mparser xml-light sdl`.

Finish the installation by running `ocp-build -init`.

#### After

`make`. Run test suite with `make check`. Build JS app with `make js`.

### Bugs, contributing, etc

Contributors are welcome ! But please don't forget to follow the
[guidelines](https://github.com/emillon/bulletml/blob/master/CONTRIBUTING.md).

Feel free to report issues [on github](https://github.com/emillon/bulletml/issues).

### Legal stuff

This can be redistributed under the BSD-2 clause license (see LICENSE).

(but you can totally buy me a beer if you think it's worth it)

### Links

  - [Official site](http://www.asahi-net.or.jp/~cs8k-cyu/bulletml/index_e.html)
  - [BulletML Ref](http://www.asahi-net.or.jp/~cs8k-cyu/bulletml/bulletml_ref_e.html)
