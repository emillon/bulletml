open Syntax
open Interp_types

val read_prog : t -> (action table * bullet table * fire table)

val build_env
  :  (int * int)  (** Screen resolution *)
  -> position     (** Enemy pos *)
  -> position     (** Ship pos *)
  -> action table
  -> bullet table
  -> fire table
  -> opcode list
  -> env

val build_prog : env -> opcode list -> subaction -> opcode list

val int_pos : position -> (int * int)

val collect_obj : obj -> obj list

val next_state : env -> env
