.PHONY: build check js build-cov cov
TESTEXEC=_build/tests/tests.native
LIBDIR:=bulletml

BASE_OBJ=bulletml.cmi bulletml.cmxa bulletml.cma bulletml.a
OBJ:=$(addprefix _build/,$(BASE_OBJ))

OCAMLBUILD=ocamlbuild -use-ocamlfind -plugin-tag "package(js_of_ocaml.ocamlbuild)"

_build/%:
	$(OCAMLBUILD) $*

build:
	$(OCAMLBUILD) $(BASE_OBJ)

clean:
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
	for f in bulletml/*.ml; do \
	i=$$(basename "$$f"); \
	echo $$i; \
	echo "open Bulletml" > tmp/$$i; \
	cat bulletml/$$i >> tmp/$$i; \
	done
	mkdir -p docs
	ocamlfind ocamldoc -thread -I tmp -html -package bulletml -d docs tmp/*.ml
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
