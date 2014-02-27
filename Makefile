.PHONY: build check js
TESTEXEC=_obuild/bulletml_tests/bulletml_tests.asm
LIBDIR:=bulletml
SRC:=$(shell cd $(LIBDIR); ocamlfind ocamldep -sort -package js_of_ocaml.syntax -syntax camlp4o *.ml)
MLI=$(shell cd $(LIBDIR); ocamlfind ocamldep -sort -package js_of_ocaml.syntax -syntax camlp4o *.mli)

build:
	ocp-build 

clean : 
	ocp-build clean

check: build
	./$(TESTEXEC)

js: build
	js_of_ocaml _obuild/app/app.byte

%.mli:bulletml/%.ml 
	cp bulletml/$@ . 2>/dev/null ||  \
	ocamlfind ocamlc *.mli -package bulletml,js_of_ocaml.syntax -syntax camlp4o -c -i  $< > $@ || (rm $@; exit 1)


install: build uninstall
	ocp-build install
	cp _obuild/bulletml/*.cmi `ocamlfind query bulletml`

uninstall:
	ocp-build uninstall
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
	cd tmp && ocamlfind ocamlc -package bulletml -c $$i ;\
	done
	mkdir -p docs
	ocamlfind ocamldoc -thread -I tmp -html -package bulletml -d docs tmp/*.mli tmp/*.ml 
	rm -rf tmp




mrproper: clean
	rm -rf tmp docs