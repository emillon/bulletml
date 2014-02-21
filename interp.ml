open Bulletml

let from_deg x =
  let pi = acos (-1.) in
  2. *. pi *. x /. 360.

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
  | _ -> assert false

let eval_ind e = function
  | Direct x -> x
  | Indirect n -> List.assoc n e

type linear_map =
  { frame_start : int
  ; frame_end : int
  ; val_start : float
  ; val_end : float
  }

type state =
  { frame : int
  ; action_env : (action id * action) list
  ; fire_env : (fire id * fire) list
  ; cont : continuation
  ; speed : float
  }

and continuation =
  | KPass
  | KRepeatE of expr * action * continuation
  | KWaitE of expr * continuation
  | KWaitN of int  * continuation
  | KFire of fire * continuation
  | KSpdE of speed * expr * continuation
  | KSpdN of linear_map * continuation
  | KDirE of direction * expr * continuation
  | KAccelE of expr option * expr option * expr * continuation
  | KVanish of continuation

let rec replicate n x =
  match n with
  | _ when n < 0 -> assert false
  | 0 -> []
  | _ -> x ::  replicate (n-1) x

let rec build_cont st next = function
  | Repeat (e_n, ai) ->
    let a = eval_ind st.action_env ai in
    KRepeatE (e_n, a, next)
  | Wait e_n -> KWaitE (e_n, next)
  | Fire fi ->
    let f = eval_ind st.fire_env fi in
    KFire (f, next)
  | ChangeSpeed (s, e) -> KSpdE (s, e, next)
  | ChangeDirection (d, e) -> KDirE (d, e, next)
  | Accel (h, v, e) -> KAccelE (h, v, e, next)
  | Vanish -> KVanish next
  | Action ai ->
    let a = eval_ind st.action_env ai in
    seq_cont st a next

and seq_cont st act next =
  List.fold_right
    (fun a k -> build_cont st k a)
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
  ; cont = k
  ; speed = 0.0
  }

let repeat_cont st n act next =
  seq_cont st (List.concat (replicate n act)) next

let rec next_cont st = function
  | KPass -> failwith "Nothing left to do"
  | KRepeatE (n_e, a, k) ->
    let n = int_of_float (eval n_e) in
    next_cont st (repeat_cont st n a k)
  | KWaitE (n_e, k) ->
    let n = int_of_float (eval n_e) in
    next_cont st (KWaitN (n, k))
  | KWaitN (0, k) -> next_cont st k
  | KWaitN (1, k) -> k
  | KWaitN (n, k) -> KWaitN (n-1, k)
  | KFire (_, k) -> next_cont st k
  | KSpdE (sp_e, t_e, k) ->
    let sp = match sp_e with
      | SpdAbs e -> eval e
      | _ -> assert false
    in
    let t = int_of_float (eval t_e) in
    let m =
      { frame_start = st.frame
      ; frame_end = st.frame + t
      ; val_start = st.speed
      ; val_end = sp
      }
    in
    next_cont st (KSpdN (m, k))
  | KSpdN (m, k) as ck ->
    if m.frame_end >= st.frame then
      k
    else
      ck

let next_state s =
  { frame = s.frame + 1
  ; action_env = s.action_env
  ; fire_env = s.fire_env
  ; cont = next_cont s s.cont
  ; speed = s.speed
  }

let draw_frame window state =
  let t = from_deg (10.0 *. float state.frame) in
  let sz = 50.0 in
  let delta = (sz *. cos t, sz *. sin t) in
  let center = (100., 100.) in
  let (px, py) = int_pos (center +: delta) in
  let bullet = Sdlloader.load_image "bullet.png" in
  let dst_rect = Sdlvideo.rect ~x:px ~y:py ~w:0 ~h:0 in
  Sdlvideo.blit_surface ~src:bullet ~dst:window ~dst_rect ()

let clear surf =
  let rect = Sdlvideo.rect ~x:0 ~y:0 ~h:200 ~w:200 in
  Sdlvideo.fill_rect ~rect surf 0xffffff00l

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
  let dummy_state = initial_state [] [] KPass in
  let k = build_cont dummy_state KPass (Action (Direct act)) in
  let state = ref (initial_state aenv fenv k) in
  while true; do
    let s = !state in
    clear surf;
    draw_frame surf s;
    Sdltimer.delay (1000 / 60);
    state := next_state s;
  done;
  Sdl.quit ()
