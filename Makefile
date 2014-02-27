.PHONY: build check js
TESTEXEC=_obuild/bulletml_tests/bulletml_tests.asm
SRC:=$(`ocamlfind ocamldep -sort -package js_of_ocaml.syntax -syntax camlp4o *.ml`)


MLI=$(SRC:.ml=.mli)

build:
	ocp-build || ocp-build -init

check: build
	./$(TESTEXEC)

js: build
	js_of_ocaml _obuild/app/app.byte

%.mli:%.ml 	
	ocamlfind ocamlc -package js_of_ocaml.syntax -syntax camlp4o -i $< > $@


install: build
	ocp-build install

doc : $(MLI) install
	ocamlfind ocamldoc -package bulletml -d docs *.mli




