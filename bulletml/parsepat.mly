%{
open Syntax
%}
%token EOF

%start prog
%type<Syntax.t> prog
%%
prog: EOF { BulletML (NoDir, []) }
