.PHONY: build check js
TESTEXEC=_obuild/bulletml_tests/bulletml_tests.asm
SRC:=$(shell ocamlfind ocamldep -sort -package js_of_ocaml.syntax -syntax camlp4o *.ml)
MLI=$(SRC:.ml=.mli)

build:
	ocp-build || ocp-build -init


clean : 
	ocp-build clean

check: build
	./$(TESTEXEC)

js: build
	js_of_ocaml _obuild/app/app.byte

%.mli:%.ml 	
	ocamlfind ocamlc -package bulletml,js_of_ocaml.syntax -linkpkg -syntax camlp4o -i  $< > $@ 


install: build
	ocp-build install

mli : $(MLI)

doc : $(MLI) install
	ocamlfind ocamldoc -html -package bulletml -d docs *.mli




