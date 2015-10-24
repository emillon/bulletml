opam install -y ocp-indent.1.5.2
ocp-indent -i *.ml bulletml/*.ml bulletml/*.mli tests/*.ml
[ -z "$(git diff)" ]
