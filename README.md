λx. colored nonsense [![Build Status](https://secure.travis-ci.org/emillon/bulletml.png)](http://travis-ci.org/emillon/bulletml)
====================

BulletML is a language designed to express bullet behaviour in a shoot'em up
game (turn left, accelerate, spawn children, etc).

This repository contains a set of tools to manipulate BulletML in OCaml.

It contains:

  - a parser, to convert a representation (`xml-light`) to an AST
  - a printer
  - a graphic interpreter
  - a test suite

### How to build

#### Prereqs

Install [OCaml](http://ocaml.org/), [opam](http://opam.ocamlpro.com/), and
`libsdl-image1.2-dev` from your distribution.

Then, you can run `opam install ocp-build mparser xml-light sdl`.

Finish the installation by running `ocp-build -init`.

#### After

`make`. Run test suite with `make check`

### Bugs, contributing, etc

Contributors are welcome ! But please don't forget to follow the
[guidelines](https://github.com/emillon/bulletml/blob/master/CONTRIBUTING.md).

Feel free to report issues [on github](https://github.com/emillon/bulletml/issues).

### Links

  - [Official site](http://www.asahi-net.or.jp/~cs8k-cyu/bulletml/index_e.html)
  - [BulletML Ref](http://www.asahi-net.or.jp/~cs8k-cyu/bulletml/bulletml_ref_e.html)
