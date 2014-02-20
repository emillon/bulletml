let from_deg x =
  let pi = acos (-1.) in
  2. *. pi *. x /. 360.

let (+:) (xa, ya) (xb, yb) =
  (xa +. xb, ya +. yb)

let int_pos (x, y) =
  (int_of_float x, int_of_float y)

let interp_elem = function
  | _ -> assert false

let interpret (Bulletml.BulletML (hv, es)) =
  List.iter interp_elem es

let draw_frame (window:OcsfmlGraphics.render_window) i =
  let open OcsfmlGraphics in
  let background = new rectangle_shape () in
  window#draw background;
  let t = from_deg (10.0 *. float i) in
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
  let mode = VideoMode.create ~w:200 ~h:200 () in
  let window = new render_window mode "BulletML" in
  window#set_framerate_limit 60;
  window#set_vertical_sync_enabled true;
  let nframe = ref 0 in
  while true; do
    if window#is_open
    then begin
      window#clear ();
      draw_frame window (!nframe);
      window#display;
    end;
    incr nframe
  done
