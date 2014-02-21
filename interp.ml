open Bulletml

let from_deg x =
  let pi = acos (-1.) in
  2. *. pi *. x /. 360.

type position = (float * float)

let (+:) (xa, ya) (xb, yb) =
  (xa +. xb, ya +. yb)

let int_pos (x, y) =
  (int_of_float x, int_of_float y)

let rec eval e =
  let ev_op = function
    | Add -> ( +. )
    | Mul -> ( *. )
    | _ -> assert false
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
  }

type state =
  { frame : int
  ; action_env : (action id * action) list
  ; fire_env : (fire id * fire) list
  ; main : obj
  }

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
  let ae =
    List.map (function
        | EAction (l, a) -> (l, a)
        | _ -> assert false
      ) ts
  in
  let fe = [] in
  (ae, fe)

let initial_state ae fe k =
  { frame = 0
  ; action_env = ae
  ; fire_env = fe
  ; main =
      { prog = k
      ; speed = 0.0
      ; dir = 0.0
      ; children = []
      ; pos = (100.0, 100.0)
      }
  }

let repeat_prog st n act next =
  seq_prog st (List.concat (replicate n act)) next

let rec next_prog st self :obj = match self.prog with
  | [] -> failwith "Nothing left to do"
  | OpRepeatE (n_e, a)::k ->
    let n = int_of_float (eval n_e) in
    next_prog st { self with prog = repeat_prog st n a k }
  | OpWaitE n_e::k ->
    let n = int_of_float (eval n_e) in
    next_prog st { self with prog = OpWaitN n::k }
  | OpWaitN 0::k -> next_prog st { self with prog = k }
  | OpWaitN 1::k -> { self with prog = k }
  | OpWaitN n::k -> { self with prog = OpWaitN (n-1)::k }
  | OpFire f::k ->
    next_prog st { self with prog = k }
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
  | (OpSpdN m::k | OpDirN m::k) as ck ->
    let nk =
      if m.frame_end >= st.frame then
        k
      else
        ck
    in
    { self with prog = nk }
  | OpDirE (d_e, t_e)::k ->
    let dir = match d_e with
      | DirAbs e -> eval e
      | _ -> assert false
    in
    let t = int_of_float (eval t_e) in
    let m =
      { frame_start = st.frame
      ; frame_end = st.frame + t
      ; val_start = self.dir
      ; val_end = dir
      }
    in
    next_prog st { self with prog = OpDirN m::k }
  | OpVanish::_ -> next_prog st { self with prog = [] }
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
      if m.frame_end >= st.frame then
        k
      else
        ck
    in
    { self with prog = nk }

let next_state s =
  let next_m = next_prog s s.main in
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
  List.iter (draw_bullet window) (collect_obj state.main)

let clear surf =
  let rect = Sdlvideo.rect ~x:0 ~y:0 ~h:200 ~w:200 in
  Sdlvideo.fill_rect ~rect surf 0x00ffffffl

let _ =
  let (fname, patname) = match Sys.argv with
    | [| _ ; a1 ; a2 |] -> (a1, a2)
    | _ -> failwith "usage: bulletml pattern.xml name"
  in
  let x = Xml.parse_file fname in
  let bml = Parser.parse_xml x in
  Sdl.init ~auto_clean:true [`VIDEO];
  let surf = Sdlvideo.set_video_mode ~w:200 ~h:200 [] in
  let (aenv, fenv) = read_prog bml in
  let act = List.assoc patname aenv in
  let dummy_state = initial_state [] [] [] in
  let k = build_prog dummy_state [] (Action (Direct act)) in
  let state = ref (initial_state aenv fenv k) in
  while true; do
    let s = !state in
    Printf.printf "#%d\n" s.frame;
    flush stdout;
    clear surf;
    draw_frame surf s;
    Sdlvideo.flip surf;
    Sdltimer.delay (1000 / 60);
    state := next_state s;
  done;
  Sdl.quit ()
