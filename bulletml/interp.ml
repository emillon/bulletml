open Interp_types
open Syntax

let from_deg x =
  let pi = acos (-1.) in
  2. *. pi *. x /. 360.

let (+:) (xa, ya) (xb, yb) =
  (xa +. xb, ya +. yb)

let (-:) (xa, ya) (xb, yb) =
  (xa -. xb, ya -. yb)

let ( *% ) (x, y) l =
  (x *. l, y *. l)

let unit_vec dir =
  let dir_rad = from_deg dir in
  (sin dir_rad, cos dir_rad) *% 0.4

let int_pos (x, y) =
  (int_of_float x, int_of_float y)

let eval_op = function
  | Add -> ( +. )
  | Mul -> ( *. )
  | Sub -> ( -. )
  | Div -> ( /. )
  | Mod -> fun x y -> float (int_of_float x mod int_of_float y)

let rec eval = function
  | Num f -> f
  | Op (op, x, y) -> eval_op op (eval x) (eval y)
  | Rand -> Random.float 1.0
  | Param _ -> failwith "Param"
  | Rank -> 0.5

let rec subst_expr p = function
  | (Num _ | Rand | Rank) as e -> e
  | Op (op, x, y) -> Op (op, subst_expr p x, subst_expr p y)
  | Param n -> List.assoc n p

let subst_dir p = function
  | DirAbs e -> DirAbs (subst_expr p e)
  | DirSeq e -> DirSeq (subst_expr p e)
  | DirAim e -> DirAim (subst_expr p e)
  | DirRel e -> DirRel (subst_expr p e)

let subst_spd p = function
  | SpdAbs e -> SpdAbs (subst_expr p e)
  | SpdRel e -> SpdRel (subst_expr p e)
  | SpdSeq e -> SpdSeq (subst_expr p e)

let subst_ind subst_elem p = function
  | Direct x -> Direct (subst_elem p x)
  | Indirect (s, args) -> Indirect (s, List.map (subst_expr p) args)

let subst_opt subst_elem p = function
  | Some x -> Some (subst_elem p x)
  | None -> None

let rec subst_action p =
  List.map (subst_subaction p)

and subst_subaction p = function
  | Repeat (e, ai) -> Repeat (subst_expr p e, subst_ind subst_action p ai)
  | Fire fi -> Fire (subst_ind subst_fire p fi)
  | ChangeSpeed (spd, e) -> ChangeSpeed (subst_spd p spd, subst_expr p e)
  | ChangeDirection (dir, e) -> ChangeDirection (subst_dir p dir, subst_expr p e)
  | Accel (eo1, eo2, e3) ->
    Accel (
      subst_opt subst_expr p eo1,
      subst_opt subst_expr p eo1,
      subst_expr p e3)
  | Wait e -> Wait (subst_expr p e)
  | Vanish -> Vanish
  | Action ai -> Action (subst_ind subst_action p ai)

and subst_fire p (diro, spdo, bi) =
  ( subst_opt subst_dir p diro
  , subst_opt subst_spd p spdo
  , subst_ind subst_bullet p bi
  )

and subst_bullet p (Bullet (diro, spdo, ais)) =
  Bullet (
    subst_opt subst_dir p diro,
    subst_opt subst_spd p spdo,
    List.map (subst_ind subst_action p) ais
  )

let number_params l =
  let i = ref 0 in
  List.map (fun p ->
      incr i;
      (!i, p)
    ) l

let ind_call getenv sub st = function
  | Direct x -> x
  | Indirect (n, params) ->
    let a = List.assoc n (getenv st) in
    let params_ev = List.map (
        fun e -> Num (eval e)
      ) params in
    let p = number_params params_ev in
    sub p a

let eval_ai = ind_call (fun st -> st.actions) (subst_action)
let eval_bi = ind_call (fun st -> st.bullets) (subst_bullet)
let eval_fi = ind_call (fun st -> st.fires) (subst_fire)

let interp_map st m =
  let frames_done = float (st.frame - m.frame_start) in
  let frames_total = float (m.frame_end - m.frame_start) in
  m.val_start +. frames_done *. (m.val_end -. m.val_start) /. frames_total

let interp_map_vec st (m:(float*float) linear_map) : (float*float) =
  let frames_done = float (st.frame - m.frame_start) in
  let frames_total = float (m.frame_end - m.frame_start) in
  m.val_start +: ((m.val_end -: m.val_start) *% (frames_done /. frames_total))

let rec replicate n x =
  match n with
  | _ when n < 0 -> assert false
  | 0 -> []
  | _ -> x ::  replicate (n-1) x

let rec build_prog st next = function
  | Repeat (e_n, ai) ->
    let a = eval_ai st ai in
    OpRepeatE (e_n, a) :: next
  | Wait e_n -> OpWaitE e_n :: next
  | Fire fi ->
    let f = eval_fi st fi in
    OpFire f :: next
  | ChangeSpeed (s, e) -> OpSpdE (s, e) :: next
  | ChangeDirection (d, e) -> OpDirE (d, e) :: next
  | Accel (ho, vo, e) ->
    let default = function
      | Some x -> x
      | None -> Num 0.0
    in
    OpAccelE (default ho, default vo, e)::next
  | Vanish -> OpVanish :: next
  | Action (Direct a) ->
    seq_prog st a next
  | Action (Indirect (n, exprs)) ->
    OpCall (n, exprs)::next

and seq_prog st act next =
  List.fold_right
    (fun a k -> build_prog st k a)
    act
    next

let read_prog (BulletML (hv, ts)) =
  let ae = ref [] in
  let be = ref [] in
  let fe = ref [] in
  List.iter (function
      | EAction (l, a) -> ae := (l, a)::!ae
      | EBullet (l, b) -> be := (l, b)::!be
      | EFire (l, f) -> fe := (l, f)::!fe
    ) ts;
  (!ae, !be, !fe)

let initial_obj k pos =
  { prog = k
  ; speed = 0.0
  ; dir = 0.0
  ; children = []
  ; pos = pos
  ; prev_dir = 0.0
  ; prev_speed = 0.0
  ; vanished = false
  }

let dir_to_ship st obj =
  let (vx, vy) = (st.ship_pos -: obj.pos) in
  atan2 vy vx

let dir_to_prev obj =
  obj.prev_dir

let repeat_prog st n act next =
  seq_prog st (List.concat (replicate n act)) next

let eval_dir st self = function
  | DirAbs e -> eval e
  | DirAim e -> eval e +. dir_to_ship st self
  | DirSeq e -> eval e +. dir_to_prev self
  | DirRel e -> eval e +. self.dir

let eval_speed self = function
  | SpdAbs e -> eval e
  | SpdRel e -> eval e +. self.speed
  | SpdSeq e -> eval e +. self.prev_speed

let oneof x y z =
  match x with
  | Some r -> r
  | None ->
    match y with
    | Some r -> r
    | None -> z

let rec next_prog st self :obj = match self.prog with
  | [] -> self
  | OpRepeatE (n_e, a)::k ->
    let n = int_of_float (eval n_e) in
    next_prog st { self with prog = repeat_prog st n a k }
  | OpWaitE n_e::k ->
    let n = int_of_float (eval n_e) in
    next_prog st { self with prog = OpWaitN n::k }
  | OpWaitN 0::k -> next_prog st { self with prog = k }
  | OpWaitN 1::k -> { self with prog = k }
  | OpWaitN n::k -> { self with prog = OpWaitN (n-1)::k }
  | OpFire (dir_f, spd_f, bi)::k ->
    let Bullet (dir_b, spd_b, ais) = eval_bi st bi in
    let dir = oneof dir_b dir_f (DirAbs (Num self.dir)) in
    let spd = oneof spd_b spd_f (SpdAbs (Num self.speed)) in
    let d = eval_dir st self dir in
    let s = eval_speed self spd in
    let sas: action = List.map (fun ai -> Action ai) ais in
    let ops: opcode list = seq_prog st sas [] in
    let o =
      { self with
        speed = s
      ; dir = d
      ; prog = ops
      ; children = []
      }
    in
    let pd = match dir with
      | DirSeq _ -> d
      | _ -> self.prev_dir
    in
    let ps = match spd with
      | SpdSeq _ -> s
      | _ -> self.prev_speed
    in
    { self with
      prog = k
    ; children = o::self.children
    ; prev_dir = pd
    ; prev_speed = ps
    }
  | OpSpdE (sp_e, t_e)::k ->
    let sp = eval_speed self sp_e in
    let t = int_of_float (eval t_e) in
    let m =
      { frame_start = st.frame
      ; frame_end = st.frame + t
      ; val_start = self.speed
      ; val_end = sp
      }
    in
    next_prog st { self with prog = OpSpdN m::k }
  | OpSpdN m::k ->
    if st.frame > m.frame_end then
      { self with prog = k }
    else
      { self with speed = interp_map st m }
  | OpDirN m::k ->
    if st.frame > m.frame_end then
      { self with prog = k }
    else
      { self with dir = interp_map st m }
  | OpDirE (d_e, t_e)::k ->
    let dir = eval_dir st self d_e in
    let t = int_of_float (eval t_e) in
    let m =
      { frame_start = st.frame
      ; frame_end = st.frame + t
      ; val_start = self.dir
      ; val_end = dir
      }
    in
    next_prog st { self with prog = OpDirN m::k }
  | OpVanish::_ -> next_prog st { self with prog = [] ; vanished = true }
  | OpAccelE (h_e, v_e, t_e)::k ->
    let h = eval h_e in
    let v = eval v_e in
    let t = eval t_e in
    let vec_spd = (unit_vec self.dir) *% self.speed in
    let m =
      { frame_start = st.frame
      ; frame_end = st.frame + int_of_float t
      ; val_start = vec_spd
      ; val_end = vec_spd +: (h, v)
      }
    in
    next_prog st { self with prog = OpAccelN m::k }
  | OpAccelN m::k ->
    if st.frame > m.frame_end then
      { self with prog = k }
    else
      let (vx, vy) = interp_map_vec st m in
      let ns = hypot vx vy in
      let nd = atan2 vx vy in
      { self with speed = ns ; dir = nd }
  | OpCall (n, params)::k ->
    let act_templ = List.assoc n st.actions in
    let params_ev = List.map (fun e -> Num (eval e)) params in
    let p = number_params params_ev in
    let act = subst_action p act_templ in
    next_prog st { self with prog = seq_prog st act k }

(**
 * Detect if a bullet should be deleted.
 *
 * It's unclear what to do about orphan bullets:
 *  - Sometimes oob bullets continue to spawn bullets that will get in bounds.
 *  - Sometimes oob bullets should be pruned, but their children need to live
 *
 * To be conservative, a children = [] works.
 * At worst, the parent bullet will get deleted next frame.
 **)
let prunable st o =
  let is_oob (x, y) =
    x < 0.0 || y < 0.0 || x >= float st.screen_w || y >= float st.screen_w
  in
  o.children = [] && (o.vanished || is_oob o.pos)

let animate_physics o =
  { o with pos = (o.pos +: unit_vec o.dir *% o.speed) }

let rec animate st o =
  let new_children =
    List.map (animate st)
      ( List.filter (fun o -> not (prunable st o)) o.children)
  in
  let o1 = { o with children = new_children } in
  let o2 = next_prog st o1 in
  let o3 = animate_physics o2 in
  o3

let rec collect_obj p =
  [p] @ List.flatten (List.map collect_obj p.children)

let rec find_assoc env = function
  | [] -> raise Not_found
  | x::xs -> try (List.assoc x env, x) with Not_found -> find_assoc env xs

let prepare bml params =
  let (aenv, benv, fenv) = read_prog bml in
  let print_env e = String.concat ", " (List.map fst e) in
  Printf.printf "a: %s\nb: %s\nf: %s\n"
    (print_env aenv)
    (print_env benv)
    (print_env fenv);
  let (act, top) = find_assoc aenv ["top";"top1"] in
  let global_env =
    { frame = 0
    ; ship_pos = params.p_ship
    ; screen_w = params.p_screen_w
    ; screen_h = params.p_screen_h
    ; actions = aenv
    ; bullets = benv
    ; fires = fenv
    }
  in
  let k = build_prog global_env [] (Action (Direct act)) in
  let obj = initial_obj k params.p_enemy in
  (global_env, obj, top)

let main_loop bml params { make_global_ctx ; make_local_ctx ; clear ; draw ; draw_ship ; move_ship ; run_cont } =
  let global_ctx = make_global_ctx () in
  let (global_env, obj0, _top) = prepare bml params in
  let rec go frame obj ship_pos =
    let env =
      { global_env with
        frame = frame
      ; ship_pos
      }
    in
    let ctx = make_local_ctx global_ctx in
    let new_pos = move_ship ctx env.ship_pos in
    clear ctx;
    draw ctx obj;
    draw_ship ctx env.ship_pos;
    run_cont ctx (fun () -> go (frame + 1) (animate env obj) new_pos)
  in
  go 1 obj0 global_env.ship_pos
