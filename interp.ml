open Bulletml

let screen_w = 640
let screen_h = 480

let from_deg x =
  let pi = acos (-1.) in
  2. *. pi *. x /. 360.

type position = (float * float)

let (+:) (xa, ya) (xb, yb) =
  (xa +. xb, ya +. yb)

let (-:) (xa, ya) (xb, yb) =
  (xa -. xb, ya -. yb)

let ( *% ) (x, y) l =
  (x *. l, y *. l)

let unit_vec dir =
  (sin dir, cos dir)

let int_pos (x, y) =
  (int_of_float x, int_of_float y)

let rec eval e =
  let ev_op = function
    | Add -> ( +. )
    | Mul -> ( *. )
    | Sub -> ( -. )
    | Div -> ( /. )
    | Mod -> fun x y -> float (int_of_float x mod int_of_float y)
  in
  match e with
  | Num f -> f
  | Op (op, x, y) -> ev_op op (eval x) (eval y)
  | Rand -> Random.float 1.0
  | Param _ -> failwith "Param"
  | Rank -> 0.5

let eval_ind e = function
  | Direct x -> x
  | Indirect n -> List.assoc n e

type 'a linear_map =
  { frame_start : int
  ; frame_end : int
  ; val_start : 'a
  ; val_end : 'a
  }

type opcode =
  | OpRepeatE of expr * action
  | OpWaitE of expr
  | OpWaitN of int
  | OpFire of fire
  | OpSpdE of speed * expr
  | OpSpdN of float linear_map
  | OpDirE of direction * expr
  | OpDirN of float linear_map
  | OpAccelE of expr * expr * expr
  | OpAccelN of unit linear_map
  | OpVanish

type obj =
  { prog : opcode list
  ; speed : float
  ; dir : float
  ; children : obj list
  ; pos : position
  ; prev_dir : float
  ; vanished : bool
  }

type state =
  { frame : int
  ; action_env : (action id * action) list
  ; bullet_env : (bullet id * bullet) list
  ; fire_env : (fire id * fire) list
  ; main : obj
  }

let interp_map st m =
  let frames_done = float (st.frame - m.frame_start) in
  let frames_total = float (m.frame_end - m.frame_start) in
  m.val_start +. frames_done *. (m.val_end -. m.val_start) /. frames_total

let rec replicate n x =
  match n with
  | _ when n < 0 -> assert false
  | 0 -> []
  | _ -> x ::  replicate (n-1) x

let rec build_prog st next = function
  | Repeat (e_n, ai) ->
    let a = eval_ind st.action_env ai in
    OpRepeatE (e_n, a) :: next
  | Wait e_n -> OpWaitE e_n :: next
  | Fire fi ->
    let f = eval_ind st.fire_env fi in
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
  | Action ai ->
    let a = eval_ind st.action_env ai in
    seq_prog st a next

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

let initial_state ae be fe k =
  { frame = 0
  ; action_env = ae
  ; bullet_env = be
  ; fire_env = fe
  ; main =
      { prog = k
      ; speed = 0.0
      ; dir = 0.0
      ; children = []
      ; pos = (float screen_w /. 2., float screen_h *. 0.3)
      ; prev_dir = 0.0
      ; vanished = false
      }
  }

let dir_to_ship obj =
  let ship_pos = (float screen_w /. 2., float screen_h *.0.9) in
  let (vx, vy) = (ship_pos -: obj.pos) in
  atan2 vy vx

let dir_to_prev obj =
  obj.prev_dir

let repeat_prog st n act next =
  seq_prog st (List.concat (replicate n act)) next

let eval_dir self = function
  | DirAbs e -> eval e
  | DirAim e -> eval e +. dir_to_ship self
  | DirSeq e -> eval e +. dir_to_prev self

let make_bullet st self spd dir = function
  | Bullet (None, None, ais) ->
    let sas: action = List.map (fun ai -> Action ai) ais in
    let ops: opcode list = seq_prog st sas [] in
    { self with
      speed = spd
    ; dir = dir
    ; prog = ops
    ; children = []
    }

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
  | OpFire (Some dir, Some spd, bi)::k ->
    let d = eval_dir self dir in
    let s = match spd with
      | SpdAbs e -> eval e
      | SpdRel e -> eval e +. self.speed
      | SpdSeq e -> eval e (* FIXME *)
    in
    let bullet = eval_ind st.bullet_env bi in
    let o = make_bullet st self s d bullet in
    { self with prog = k ; children = o::self.children }
  | OpSpdE (sp_e, t_e)::k ->
    let sp = match sp_e with
      | SpdAbs e -> eval e
      | _ -> assert false
    in
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
    let dir = eval_dir self d_e in
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
    let _h = eval h_e in
    let _v = eval v_e in
    let t = eval t_e in
    let m =
      { frame_start = st.frame
      ; frame_end = st.frame + int_of_float t
      ; val_start = ()
      ; val_end = ()
      }
    in
    next_prog st { self with prog = OpAccelN m::k }
  | OpAccelN m::k as ck ->
    let nk =
      if st.frame > m.frame_end then
        k
      else
        ck
    in
    { self with prog = nk }

let animate_physics o =
  { o with pos = (o.pos +: unit_vec o.dir *% o.speed) }

let rec animate st o =
  let new_children =
    List.map (animate st) o.children in
  let o1 = { o with children = new_children ; prev_dir = o.dir } in
  let o2 = next_prog st o1 in
  let o3 = animate_physics o2 in
  o3

let next_state s =
  let next_m = animate s s.main in
  { s with
    frame = s.frame + 1
  ; main = next_m
  }

let rec collect_obj p =
  [p] @ List.flatten (List.map collect_obj p.children)

let draw_bullet window b =
  let (px, py) = int_pos b.pos in
  let dst_rect = Sdlvideo.rect ~x:px ~y:py ~w:0 ~h:0 in
  let bullet = Sdlloader.load_image "bullet.png" in
  Sdlvideo.blit_surface ~src:bullet ~dst:window ~dst_rect ()

let draw_frame window state =
  let objs =
    List.filter
      (fun o -> not o.vanished)
      (collect_obj state.main)
  in
  List.iter (draw_bullet window) objs

let clear surf =
  let rect = Sdlvideo.rect ~x:0 ~y:0 ~h:screen_h ~w:screen_w in
  Sdlvideo.fill_rect ~rect surf 0x00ffffffl

let _ =
  let (fname, patname) = match Sys.argv with
    | [| _ ; a1 ; a2 |] -> (a1, a2)
    | _ -> failwith "usage: bulletml pattern.xml name"
  in
  let x = Xml.parse_file fname in
  let bml = Parser.parse_xml x in
  Sdl.init ~auto_clean:true [`VIDEO;`NOPARACHUTE];
  let surf = Sdlvideo.set_video_mode ~w:screen_w ~h:screen_h [] in
  let (aenv, benv, fenv) = read_prog bml in
  let act = List.assoc patname aenv in
  let dummy_state = initial_state [] [] [] [] in
  let k = build_prog dummy_state [] (Action (Direct act)) in
  let state = ref (initial_state aenv benv fenv k) in
  while true; do
    let s = !state in
    flush stdout;
    Sdlevent.pump ();
    begin
      match Sdlevent.poll () with
      | Some ( Sdlevent.MOUSEBUTTONDOWN _
             | Sdlevent.KEYDOWN { keysym = Sdlkey.KEY_q } ) -> raise Exit
      | _ -> ()
    end;
    clear surf;
    draw_frame surf s;
    Sdlvideo.flip surf;
    Sdltimer.delay (1000 / 60);
    state := next_state s;
  done;
  Sdl.quit ()
