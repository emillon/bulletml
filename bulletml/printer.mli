(** Print syntactic values. *)

type 'a printer = 'a -> string

(** Print a list.

    Given a way to print an ['a], print a list of ['a].
*)
val print_list : 'a printer -> 'a list printer

(** Print a {!Syntax.t}. *)
val print_expr : Syntax.expr printer

(** Print a {!Syntax.t}. *)
val print_bulletml : Syntax.t printer

(** Print an {!Interp_types.opcode}. *)
val print_opcode : Interp_types.opcode printer

(** Print an {!Interp_types.position}. *)
val print_position : Interp_types.position printer
