open Syntax
open Interp_types

(** Functions to build a BulletML interpreter. *)

(** Convert from (x, y) to (magnitude, dir) *)
val polar : position -> (float * angle)

(** Convert from (magnitude, dir) to (x, y) *)
val from_polar : (float * angle) -> position

(** The mathematical constant. It's not in Pervasives! *)
val pi : float

(** Pointwise addition. *)
val (+:) : (float * float) -> (float * float) -> (float * float)

(** Pointwise substraction. *)
val (-:) : (float * float) -> (float * float) -> (float * float)

(** Well-typed angle addition *)
val add_angle : angle -> angle -> angle

(** Well-typed angle substraction *)
val sub_angle : angle -> angle -> angle

(** Extract or convert angle value in degrees *)
val in_degs : angle -> float

(** Extract or convert angle value in radians *)
val in_rads : angle -> float

(** Build a list with n times the same element *)
val replicate : int -> 'a -> 'a list

(** 
   Convert a list {!Syntax.subaction} into a list of {!Interp_types.opcode}s.
   The extra list given as argument is the list to prepend to.
*)
val build_prog : 'a env -> opcode list -> subaction -> opcode list

(**
   Convert a (float) {!Interp_types.position} to a pair of ints.
*)
val int_pos : position -> (int * int)

(**
   Given a program and a position, build an {!Interp_types.obj} with default
   values.
*)
val initial_obj : opcode list -> position -> 'a -> 'a obj

(**
   Create the list of descendants of an {!Interp_types.obj}, including itself.

   This is done in a prefix order, so the argument is the head.
*)
val collect_obj : 'a obj -> 'a obj list

(**
   Compute the next state of an {!Interp_types.obj}:
     - delete out-of-bounds or vanished children
     - recursively {!animate} its remaining children
     - interpret its current instruction
     - handle physics (move it according to its current direction and speed)

   The interpretation phase can interpret several {!Interp_types.opcode}s, for
   example until a [OpWait] instruction is found.
*)
val animate : 'a env -> 'a obj -> 'a obj

(**
   Compile and prepare a program for interpretation.
   @return an environement, an initial object and the name of the top pattern
*)
val prepare
  :  Syntax.t
  -> init_params
  -> 'a
  -> 'a env * 'a obj * string
