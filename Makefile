.PHONY: build check js build-cov cov
TESTEXEC=_build/tests/tests.native
LIBDIR:=bulletml
SRC:=$(shell cd $(LIBDIR); ocamlfind ocamldep -sort -package js_of_ocaml.syntax -syntax camlp4o *.ml)
MLI=$(shell cd $(LIBDIR); ocamlfind ocamldep -sort -package js_of_ocaml.syntax -syntax camlp4o *.mli)

# remove from SRC files that are already there as a .mli
ML_OF_MLI=$(patsubst %.mli,%.ml,$(MLI))
SRC:=$(filter-out $(ML_OF_MLI),$(SRC))

OBJ=bulletml.cmi bulletml.cmxa bulletml.cma bulletml.a
OBJ:=$(addprefix _build/,$(OBJ))

_build/%:
	ocamlbuild -use-ocamlfind -plugin-tag "package(js_of_ocaml.ocamlbuild)" $*

build: _build/bulletml.cma _build/bulletml.cmxa

clean : 
	ocamlbuild -clean

check: $(TESTEXEC)
	./$(TESTEXEC)

js: _build/jsapp.js

%.mli:bulletml/%.ml 
	cp bulletml/$@ . 2>/dev/null ||  \
	ocamlfind ocamlc *.mli -package bulletml,js_of_ocaml.syntax -syntax camlp4o -c -i  $< > $@ || (rm $@; exit 1)

install: $(OBJ) uninstall
	ocamlfind install bulletml $(OBJ) META

uninstall:
	ocamlfind remove bulletml

doc :  install
	mkdir -p tmp
	for i in $(SRC); do \
	echo $$i; \
	echo "open Bulletml" > tmp/$$i; \
	cat bulletml/$$i >> tmp/$$i; \
	done
	for i in $(MLI); do \
	echo $$i; \
	echo "open Bulletml" > tmp/$$i; \
	cat bulletml/$$i >> tmp/$$i; \
	cd tmp && ocamlfind ocamlc -package bulletml -c $$i && cd .. ;\
	done
	mkdir -p docs
	ocamlfind ocamldoc -thread -I tmp -html -package bulletml -d docs tmp/*.mli tmp/*.ml 
	rm -rf tmp

build-cov:
	ocp-build build bulletml_tests_cov

cov: build-cov
	BISECT_FILE=bulletml ./_obuild/bulletml_tests_cov/bulletml_tests_cov.asm
	bisect-report -html coverage bulletml*.out
	rm bulletml*.out

mrproper: clean
	rm -rf tmp docs

indent:
	ocp-indent -i *.ml bulletml/*.ml bulletml/*.mli tests/*.ml
