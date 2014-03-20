open Syntax
open Interp_types

type 'a printer = 'a -> string

let print_list prn l =
  "["^ String.concat "; " (List.map prn l) ^ "]"

let print_option prn = function
  | Some x -> "Some ("^prn x^")"
  | None -> "None"

let print_hv = function
  | NoDir      -> "NoDir"
  | Horizontal -> "Horizontal"
  | Vertical   -> "Vertical"

let print_variant n params =
  n ^ " (" ^ String.concat "," params ^ ")"

let rec print_ind prn = function
  | Direct x -> "Direct (" ^ prn x ^ ")"
  | Indirect (n, args) -> "Indirect (\"" ^ n ^ "\", " ^ print_list print_expr args ^ ")"

and print_expr =
  let p_op = function
    | Add -> " +@ "
    | Sub -> " -@ "
    | Mul -> " *@ "
    | Div -> " /@ "
    | Mod -> " %@ "
  in
  function
  | Num f -> "Num " ^ string_of_float f
  | Op (op, x, y) -> "(" ^ print_expr x ^ p_op op ^ print_expr y ^ ")"
  | Param n -> "Param " ^ string_of_int n
  | Rand -> "Rand"
  | Rank -> "Rank"

let print_dir = function
  | DirAbs e -> print_variant "DirAbs" [print_expr e]
  | DirSeq e -> print_variant "DirSeq" [print_expr e]
  | DirAim e -> print_variant "DirAim" [print_expr e]
  | DirRel e -> print_variant "DirRel" [print_expr e]

let print_spd = function
  | SpdAbs e -> print_variant "SpdAbs" [print_expr e]
  | SpdRel e -> print_variant "SpdRel" [print_expr e]
  | SpdSeq e -> print_variant "SpdSeq" [print_expr e]

let rec print_action a = print_list print_subaction a

and print_subaction = function
  | Repeat (e, ai) -> print_variant "Repeat" [print_expr e;print_ind print_action ai]
  | Fire fi -> print_variant "Fire" [print_ind print_fire fi]
  | ChangeSpeed (sp, e) -> print_variant "ChangeSpeed" [print_spd sp;print_expr e]
  | ChangeDirection (dir, e) -> print_variant "ChangeDirection" [print_dir dir;print_expr e]
  | Accel (eo1, eo2, e) ->
    print_variant "Accel"
      [ print_option print_expr eo1
      ; print_option print_expr eo2
      ; print_expr e
      ]
  | Wait e -> print_variant "Wait" [print_expr e]
  | Vanish -> "Vanish"
  | Action ai -> print_variant "Action" [print_ind print_action ai]

and print_bullet (Bullet (diro, spdo, acts)) =
  print_variant "Bullet"
    [ print_option print_dir diro
    ; print_option print_spd spdo
    ; print_list (print_ind print_action) acts
    ]

and print_fire (diro, spdo, bi) =
  "(" ^ print_option print_dir diro
  ^ ", " ^ print_option print_spd spdo
  ^ ", " ^ print_ind print_bullet bi
  ^ ")"

let print_elem = function
  | EBullet (l, b) -> print_variant "EBullet" ["\"" ^ l ^ "\"";print_bullet b]
  | EAction (l, a) -> print_variant "EAction" ["\"" ^ l ^ "\"";print_action a]
  | EFire (l, f) -> print_variant "EFire" ["\"" ^ l ^ "\"";print_fire f]

let print_bulletml (BulletML (hv, elems)) =
  "BulletML (" ^ print_hv hv ^ ", " ^ print_list print_elem elems ^ ")"

let print_linear_map prn m =
  Printf.sprintf
    "{ frame_start = %d ; frame_end = %d ; val_start = %s ; val_end = %s }"
    m.frame_start m.frame_end (prn m.val_start) (prn m.val_end)

let print_pos (x, y) = Printf.sprintf "(%f,%f)" x y

let print_opcode = function
  | OpRepeatE (e, a) -> print_variant "OpRepeatE " [print_expr e;print_action a]
  | OpWaitE e -> print_variant "OpWaitE" [print_expr e]
  | OpWaitN n -> print_variant "OpWaitN" [string_of_int n]
  | OpFire f -> print_variant "OpFire" [print_fire f]
  | OpSpdE (s, e) -> print_variant "OpSpdE" [print_spd s;print_expr e]
  | OpSpdN m -> print_variant "OpSpdN" [print_linear_map string_of_float m]
  | OpDirE (d, e) -> print_variant "OpDirE" [print_expr e]
  | OpDirN m -> print_variant "OpDirN" [print_linear_map string_of_float m]
  | OpAccelE (e1, e2, e3) -> print_variant "OpAccelE" [print_expr e1;print_expr e2;print_expr e3]
  | OpAccelN (h, v, t) -> print_variant "OpAccelN" [string_of_float h;string_of_float v;string_of_int t]
  | OpVanish -> "OpVanish"
  | OpCall (n, es) -> print_variant "OpCall" [n;print_list print_expr es]
