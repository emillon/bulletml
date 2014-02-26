.PHONY: build check js
TESTEXEC=_obuild/bulletml_tests/bulletml_tests.asm

build:
	ocp-build

check: build
	./$(TESTEXEC)

js: build
	js_of_ocaml _obuild/app/app.byte
