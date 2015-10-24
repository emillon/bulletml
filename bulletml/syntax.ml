(** Abstract syntax of BulletML programs. *)

(** Binary operations *)
type op =
  | Add
  | Sub
  | Mul
  | Div
  | Mod

type expr =
  | Num of float (** Constant *)
  | Op of op * expr * expr (** Binary operation *)
  | Param of int (** Function parameter *)
  | Rand (** Random value between 0.0 and 1.0 *)
  | Rank (** Difficulty factor, between 0.0 and 1.0 *)

let rec show_expr =
  let p_op = function
    | Add -> " +@ "
    | Sub -> " -@ "
    | Mul -> " *@ "
    | Div -> " /@ "
    | Mod -> " %@ "
  in
  function
  | Num f -> "Num " ^ string_of_float f
  | Op (op, x, y) -> "(" ^ show_expr x ^ p_op op ^ show_expr y ^ ")"
  | Param n -> "Param " ^ string_of_int n
  | Rand -> "Rand"
  | Rank -> "Rank"

let pp_expr fmt e =
  Format.pp_print_string fmt (show_expr e)

type speed =
  | SpdAbs of expr
  | SpdRel of expr
  | SpdSeq of expr
  [@@deriving show]

type direction =
  | DirAbs of expr
  | DirSeq of expr
  | DirAim of expr
  | DirRel of expr
  [@@deriving show]

type 'a id = string
  [@@deriving show]

type 'a ind =
  | Direct of 'a
  | Indirect of 'a id * expr list
  [@@deriving show]

type subaction =
  | Repeat of expr * action ind
  | Fire of fire ind
  | ChangeSpeed of speed * expr
  | ChangeDirection of direction * expr
  | Accel of expr option * expr option * expr
  | Wait of expr
  | Vanish
  | Action of action ind
  [@@deriving show]

and action = subaction list

and bullet = Bullet of direction option * speed option * action ind list
  [@@deriving show]

and fire = direction option * speed option * bullet ind
  [@@deriving show]

type orientation =
  | Horizontal
  | Vertical
  [@@deriving show]

type elem =
  | EBullet of string * bullet
  | EAction of string * action
  | EFire of string * fire
  [@@deriving show]

type t = BulletML of orientation option * elem list
  [@@deriving show]

let ( +@ ) = fun x y -> Op (Add, x, y)
let ( -@ ) = fun x y -> Op (Sub, x, y)
let ( *@ ) = fun x y -> Op (Mul, x, y)
let ( /@ ) = fun x y -> Op (Div, x, y)
let ( %@ ) = fun x y -> Op (Mod, x, y)
let ( ~@ ) = fun x   -> Num 0. -@ x
let bulletDefault = Bullet (None, None, [])
