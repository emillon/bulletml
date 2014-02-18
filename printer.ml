open Bulletml

let print_list prn l =
  "["^ String.concat ", " (List.map prn l) ^ "]"

let print_option prn = function
  | Some x -> "Some ("^prn x^")"
  | None -> "None"

let print_ind prn = function
  | Direct x -> prn x
  | Indirect n -> "*"^n

let print_hv = function
  | NoDir      -> "NoDir"
  | Horizontal -> "Horizontal"
  | Vertical   -> "Vertical"

let rec print_expr =
  let p_op = function
    | Add -> " + "
    | Sub -> " - "
    | Mul -> " * "
    | Div -> " / "
    | Mod -> " % "
  in
  function
  | Num f -> string_of_float f
  | Op (op, x, y) -> "(" ^ print_expr x ^ p_op op ^ print_expr y ^ ")"
  | Param n -> "$" ^ string_of_int n
  | Rand -> "$rand"
  | Rank -> "$rank"

let print_dir = function
  | DirAbs e -> "DirAbs (" ^ print_expr e ^ ")"
  | DirSeq e -> "DirSeq (" ^ print_expr e ^ ")"
  | DirAim e -> "DirAim (" ^ print_expr e ^ ")"

let print_spd = function
  | SpdAbs e -> "SpdAbs (" ^ print_expr e ^ ")"
  | SpdRel e -> "SpdRel (" ^ print_expr e ^ ")"
  | SpdSeq e -> "SpdSeq (" ^ print_expr e ^ ")"

let rec print_action a = print_list print_subaction a

and print_subaction = function
  | Repeat (e, ai) -> "Repeat (" ^ print_expr e ^ ", " ^  print_ind print_action ai^ ")"
  | Fire f -> "Fire " ^ print_fire f
  | FireRef -> "FireRef"
  | ChangeSpeed (sp, e) -> "ChangeSpeed (" ^ print_spd sp ^ ", " ^ print_expr e ^ ")"
  | ChangeDirection (dir, e) -> "ChangeDirection (" ^ print_dir dir ^ ", " ^ print_expr e ^ ")"
  | Accel (eo1, eo2, e) -> "Accel (" ^ print_option print_expr eo1
                           ^ ", " ^ print_option print_expr eo2
                           ^ ", " ^ print_expr e
                           ^ ")"
  | Wait e -> "Wait " ^ print_expr e
  | Vanish -> "Vanish"
  | Action -> "Action"
  | ActionRef s -> "*"^s

and print_bullet (Bullet (diro, spdo, acts)) =
  "Bullet (" ^ print_option print_dir diro
  ^ ", " ^ print_option print_spd spdo
  ^ ", " ^ print_list (print_ind print_action) acts
  ^ ")"

and print_fire (no, diro, spdo, bi) =
  "(" ^ print_option (fun x -> x) no
  ^ ", " ^ print_option print_dir diro
  ^ ", " ^ print_option print_spd spdo
  ^ ", " ^ print_ind print_bullet bi
  ^ ")"

let print_elem = function
  | EBullet b -> "EBullet " ^ print_bullet b
  | EAction a -> "EAction " ^ print_action a
  | EFire f   -> "EFire "   ^ print_fire f

let print_bulletml (BulletML (hv, elems)) =
  "BulletML (" ^ print_hv hv ^ ", " ^ print_list print_elem elems ^ ")"