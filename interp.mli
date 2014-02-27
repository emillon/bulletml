open Syntax
open Interp_types

val build_prog : env -> opcode list -> subaction -> opcode list

val int_pos : position -> (int * int)

val initial_obj : opcode list -> position -> obj

val collect_obj : obj -> obj list

val animate : env -> obj -> obj

val prepare
  :  Syntax.t
  -> position (** enemy pos *)
  -> position (** ship pos *)
  -> int (** screen width *)
  -> int (** screen height *)
  -> env * obj * string (** env, root object, name of top pattern *)

val main_loop
  :  Syntax.t
  -> position                   (** enemy pos *)
  -> position                   (** ship pos *)
  -> int                        (** screen width *)
  -> int                        (** screen height *)
  -> (unit -> 'g)               (** make global context *)
  -> ('g -> 'l)                 (** make context *)
  -> ('l -> unit)               (** clear *)
  -> ('l -> obj -> unit)        (** draw *)
  -> ('l -> (unit -> 'r) -> 'r) (** how to run continuation *)
  -> 'r
