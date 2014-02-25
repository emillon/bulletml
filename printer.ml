open Syntax

let print_list prn l =
  "["^ String.concat ", " (List.map prn l) ^ "]"

let print_option prn = function
  | Some x -> "Some ("^prn x^")"
  | None -> "None"

let print_hv = function
  | NoDir      -> "NoDir"
  | Horizontal -> "Horizontal"
  | Vertical   -> "Vertical"

let rec print_ind prn = function
  | Direct x -> "Direct (" ^ prn x ^ ")"
  | Indirect (n, args) -> "Indirect (" ^ n ^ ", " ^ print_list print_expr args ^ ")"

and print_expr =
  let p_op = function
    | Add -> " + "
    | Sub -> " - "
    | Mul -> " * "
    | Div -> " / "
    | Mod -> " % "
  in
  function
  | Num f -> "Num " ^ string_of_float f
  | Op (op, x, y) -> "(" ^ print_expr x ^ p_op op ^ print_expr y ^ ")"
  | Param n -> "$" ^ string_of_int n
  | Rand -> "Rand"
  | Rank -> "Rank"

let print_dir = function
  | DirAbs e -> "DirAbs (" ^ print_expr e ^ ")"
  | DirSeq e -> "DirSeq (" ^ print_expr e ^ ")"
  | DirAim e -> "DirAim (" ^ print_expr e ^ ")"
  | DirRel e -> "DirRel (" ^ print_expr e ^ ")"

let print_spd = function
  | SpdAbs e -> "SpdAbs (" ^ print_expr e ^ ")"
  | SpdRel e -> "SpdRel (" ^ print_expr e ^ ")"
  | SpdSeq e -> "SpdSeq (" ^ print_expr e ^ ")"

let rec print_action a = print_list print_subaction a

and print_subaction = function
  | Repeat (e, ai) -> "Repeat (" ^ print_expr e ^ ", " ^  print_ind print_action ai^ ")"
  | Fire fi -> "Fire (" ^ print_ind print_fire fi ^ ")"
  | ChangeSpeed (sp, e) -> "ChangeSpeed (" ^ print_spd sp ^ ", " ^ print_expr e ^ ")"
  | ChangeDirection (dir, e) -> "ChangeDirection (" ^ print_dir dir ^ ", " ^ print_expr e ^ ")"
  | Accel (eo1, eo2, e) -> "Accel (" ^ print_option print_expr eo1
                           ^ ", " ^ print_option print_expr eo2
                           ^ ", " ^ print_expr e
                           ^ ")"
  | Wait e -> "Wait (" ^ print_expr e ^ ")"
  | Vanish -> "Vanish"
  | Action ai -> "Action (" ^ print_ind print_action ai ^ ")"

and print_bullet (Bullet (diro, spdo, acts)) =
  "Bullet (" ^ print_option print_dir diro
  ^ ", " ^ print_option print_spd spdo
  ^ ", " ^ print_list (print_ind print_action) acts
  ^ ")"

and print_fire (diro, spdo, bi) =
  "(" ^ print_option print_dir diro
  ^ ", " ^ print_option print_spd spdo
  ^ ", " ^ print_ind print_bullet bi
  ^ ")"

let print_elem = function
  | EBullet (l, b) -> "EBullet (" ^ l ^ ", " ^ print_bullet b ^ ")"
  | EAction (l, a) -> "EAction (" ^ l ^ ", " ^ print_action a ^ ")"
  | EFire (l, f)   -> "EFire (" ^ l ^ ", " ^ print_fire f ^ ")"

let print_bulletml (BulletML (hv, elems)) =
  "BulletML (" ^ print_hv hv ^ ", " ^ print_list print_elem elems ^ ")"
