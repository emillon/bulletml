%{
open Syntax
%}
%token ACTION
%token<string> IDENT
%token<float> NUM
%token EOF
%token REPEAT
%token LPAREN RPAREN
%token SEMICOLON
%token FIRE
%token WAIT
%token SPEED

%start prog
%type<Syntax.t> prog
%%

prog: elem_list EOF { BulletML (NoDir, $1) }

elem_list:
| { [] }
| elem elem_list { $1::$2 }

elem:
| ACTION IDENT LPAREN action RPAREN SEMICOLON { EAction ($2, $4) }

action:
| { [] }
| subaction SEMICOLON action { $1::$3 }

subaction:
| REPEAT expr LPAREN action RPAREN { Repeat ($2, Direct $4) }
| FIRE LPAREN action RPAREN { Fire (Direct (None, None, Direct (Bullet (None, None, [Direct $3])))) }
| WAIT expr { Wait $2 }
| SPEED expr { ChangeSpeed (SpdAbs $2, Num 1.) }

expr:
| NUM { Num $1 }
