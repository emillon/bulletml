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

type continuation =
  | KPass
  | KSeq of subaction * continuation

let kseq_of_act a =
  List.fold_right (fun sa k -> KSeq (sa, k)) a KPass

let rec replicate n l =
  match n with
  | _ when n < 0 -> assert false
  | 0 -> []
  | _ -> replicate (n-1) l @ l

let build_cont aenv = function
  | Repeat (e_n, ai) ->
    let a = eval_ind aenv ai in
    let f_n = eval e_n in
    let n = int_of_float f_n in
    kseq_of_act (replicate n a)

let read_prog (BulletML (hv, ts)) =
  List.map (function
      | EAction (l, a) -> (l, a)
      | _ -> assert false
    ) ts

type state =
  { frame : int
  ; action_env : (action id * action) list
  ; cont : continuation
  }

let initial_state ae k =
  { frame = 0
  ; action_env = ae
  ; cont = k
  }

let next_cont = function
  | KSeq (sa, k) -> k
  | KPass -> failwith "Nothing left to do"

let next_state s =
  { frame = s.frame + 1
  ; action_env = s.action_env
  ; cont = next_cont s.cont
  }

let draw_frame (window:OcsfmlGraphics.render_window) state =
  let open OcsfmlGraphics in
  let background = new rectangle_shape () in
  window#draw background;
  let t = from_deg (10.0 *. float state.frame) in
  let sz = 50.0 in
  let delta = (sz *. cos t, sz *. sin t) in
  let center = (100., 100.) in
  let position = center +: delta in
  let texture = new texture  (`File "bullet.png") in
  let sprite = new sprite ~texture ~position () in
  window#draw sprite

let _ =
  let open OcsfmlWindow in
  let open OcsfmlGraphics in
  let (fname, patname) = match Sys.argv with
    | [| _ ; a1 ; a2 |] -> (a1, a2)
    | _ -> failwith "usage: bulletml pattern.xml name"
  in
  let x = Xml.parse_file fname in
  let bml = Parser.parse_xml x in
  let mode = VideoMode.create ~w:200 ~h:200 () in
  let window = new render_window mode "BulletML" in
  window#set_framerate_limit 60;
  window#set_vertical_sync_enabled true;
  let aenv = read_prog bml in
  let act = List.assoc patname aenv in
  let k = kseq_of_act act in
  let state = ref (initial_state aenv k) in
  while true; do
    if window#is_open
    then begin
      let s = !state in
      window#clear ();
      draw_frame window s;
      window#display;
      state := next_state s
    end;
  done
