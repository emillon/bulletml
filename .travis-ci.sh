bash -ex .travis-opam.sh
eval $(opam config env)
make js
make doc
bash -ex .ci-indent.sh
