open Syntax
open Interp_types

val read_prog : t -> (action env * bullet env * fire env)

val initial_state
  :  (int * int)  (** Screen resolution *)
  -> position     (** Enemy pos *)
  -> position     (** Ship pos *)
  -> action env
  -> bullet env
  -> fire env
  -> opcode list
  -> state

val build_prog : state -> opcode list -> subaction -> opcode list

val int_pos : position -> (int * int)

val collect_obj : obj -> obj list

val next_state : state -> state
