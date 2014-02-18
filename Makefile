TESTEXEC=_obuild/bulletml_tests/bulletml_tests.asm

$(TESTEXEC):
	ocp-build

.PHONY: check

check: $(TESTEXEC)
	./$<
