.PHONY: build check
TESTEXEC=_obuild/bulletml_tests/bulletml_tests.asm

build:
	ocp-build

check: build
	./$(TESTEXEC)
