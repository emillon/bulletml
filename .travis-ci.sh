install_opam() {
    PATH=$HOME/opam-install/bin:$PATH
    if [ -f $HOME/opam-install/bin/opam ] ; then
        return
    fi
    wget https://github.com/ocaml/opam/releases/download/1.2.2/opam-full-1.2.2.tar.gz
    tar xzvf opam-full-1.2.2.tar.gz
    cd opam-full-1.2.2
    ./configure --prefix=$HOME/opam-install
    make lib-ext
    make
    make install
    cd -
}

setup_opam() {
    opam init -y
    opam switch -y $OCAML_FULL_VERSION
}

travis_opam() {
    # If a fork of these scripts is specified, use that GitHub user instead
    fork_user=${FORK_USER:-ocaml}

    # If a branch of these scripts is specified, use that branch instead of 'master'
    fork_branch=${FORK_BRANCH:-master}

    ### Bootstrap

    set -uex

    get() {
      wget https://raw.githubusercontent.com/${fork_user}/ocaml-travisci-skeleton/${fork_branch}/$@
    }

    TMP_BUILD=$(mktemp -d 2>/dev/null || mktemp -d -t 'travistmpdir')
    cd ${TMP_BUILD}

    get yorick.mli
    get yorick.ml
    get travis_opam.ml

    export OPAMYES=1
    eval $(opam config env)

    # This could be removed with some OPAM variable plumbing into build commands
    opam install ocamlfind

    ocamlc.opt yorick.mli
    ocamlfind ocamlc -c yorick.ml

    ocamlfind ocamlc -o travis-opam -package unix -linkpkg yorick.cmo travis_opam.ml
    cd -

    ${TMP_BUILD}/travis-opam
}

install_opam
setup_opam

travis_opam

make js
make doc

bash -ex .ci-indent.sh
