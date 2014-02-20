let from_deg x =
  let pi = acos (-1.) in
  2. *. pi *. x /. 360.

let (+:) (xa, ya) (xb, yb) =
  (xa +. xb, ya +. yb)

let int_pos (x, y) =
  (int_of_float x, int_of_float y)

type state = { frame : int }

let initial_state =
  { frame = 0
  }

let next_state s =
  { frame = s.frame + 1
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
  let state = ref initial_state in
  let nframe = ref 0 in
  while true; do
    if window#is_open
    then begin
      let s = !state in
      window#clear ();
      draw_frame window s;
      window#display;
      state := next_state s
    end;
    incr nframe
  done
