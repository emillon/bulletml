{
open Parsepat
}

rule token = parse
| ' ' { token lexbuf } (* skip spaces *)
| '\n' { Lexing.new_line lexbuf;token lexbuf }
| '(' { LPAREN }
| ')' { RPAREN }
| ';' { SEMICOLON }
| "action" { ACTION }
| "fire" { FIRE }
| "repeat" { REPEAT }
| "wait" { WAIT }
| ['0'-'9']+ as i { NUM (float_of_string i) }
| ['a'-'z']+ as s { IDENT s }
| eof { EOF }
| _ as lx { failwith (Printf.sprintf "Lex error: '%c'" lx) }
