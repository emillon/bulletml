open Syntax
open Interp_types

val build_prog : env -> opcode list -> subaction -> opcode list

val int_pos : position -> (int * int)

val initial_obj : opcode list -> position -> obj

val collect_obj : obj -> obj list

val animate : env -> obj -> obj

val prepare
  :  Syntax.t
  -> init_params
  -> env * obj * string (** env, root object, name of top pattern *)

val main_loop
  :  Syntax.t
  -> init_params
  -> ('g, 'l, 'r) interpreter
  -> 'r
