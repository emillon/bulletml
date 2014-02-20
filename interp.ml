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

let read_prog (BulletML (hv, ts)) =
  List.map (function
      | EAction (l, a) -> (l, a)
      | _ -> assert false
    ) ts

type state =
  { frame : int
  ; action_env : (action id * action) list
  }

let initial_state ae =
  { frame = 0
  ; action_env = ae
  }

let next_state s =
  { frame = s.frame + 1
  ; action_env = s.action_env
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
  let state = ref (initial_state aenv) in
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
