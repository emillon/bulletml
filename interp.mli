open Syntax
open Interp_types

val read_prog : t -> (action table * bullet table * fire table)

val build_prog : env -> opcode list -> subaction -> opcode list

val int_pos : position -> (int * int)

val initial_obj : opcode list -> position -> obj

val collect_obj : obj -> obj list

val animate : env -> obj -> obj
