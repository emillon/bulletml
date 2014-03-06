# Thanks to frenetic-lang/ocaml-topology
case "$OCAML_VERSION,$OPAM_VERSION" in
3.12.1,1.0.0) ppa=avsm/ocaml312+opam10 ;;
3.12.1,1.1.0) ppa=avsm/ocaml312+opam11 ;;
4.00.1,1.0.0) ppa=avsm/ocaml40+opam10 ;;
4.00.1,1.1.0) ppa=avsm/ocaml40+opam11 ;;
4.01.0,1.0.0) ppa=avsm/ocaml41+opam10 ;;
4.01.0,1.1.0) ppa=avsm/ocaml41+opam11 ;;
*) echo Unknown $OCAML_VERSION,$OPAM_VERSION; exit 1 ;;
esac

echo "yes" | sudo add-apt-repository ppa:$ppa
sudo apt-get update -qq
sudo apt-get install -qq ocaml ocaml-native-compilers camlp4-extra opam libsdl-image1.2-dev

export OPAMYES=1
export OPAMVERBOSE=1
echo OCaml version
ocaml -version
echo OPAM versions
opam --version
opam --git-version

opam init
eval `opam config env`
opam install ocp-build
opam install ${OPAM_DEPENDS}

opam install ocp-indent
ocp-indent -i *.ml bulletml/*.ml bulletml/*.mli tests/*.ml
[ -z "$(git diff)" ]

ocp-build -init
make check
make js
make doc

echo "0092a42114e7937ad06d1f19b6345c41a84196ad  Bisect.tar.gz" > bisect.SHA1SUMS
wget \
    http://sagotch.fr/Bisect.tar.gz \
    https://raw.github.com/sagotch/ocveralls/9069356076e886ad0913fbc8550330f45d3cc664/ocveralls.sh
sha1sum -c bisect.SHA1SUM
tar -xvf Bisect.tar.gz
cd Bisect
chmod +x configure
./configure
cat Makefile.config
make all
sudo make install
cd ..

ocp-build build bulletml_tests_cov
BISECT_FILE=bulletml ./_obuild/bulletml_tests_cov/bulletml_tests_cov.asm
chmod +x ocveralls.sh
./ocveralls.sh ./ocveralls.sh bulletml*.out
