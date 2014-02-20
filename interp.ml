let from_deg x =
  let pi = acos (-1.) in
  2. *. pi *. x /. 360.

let (+:) (xa, ya) (xb, yb) =
  (xa +. xb, ya +. yb)

let int_pos (x, y) =
  (int_of_float x, int_of_float y)

let draw_frame (window:OcsfmlGraphics.render_window) =
  let open OcsfmlGraphics in
  let background = new rectangle_shape () in
  window#draw background;
  for i = 0 to 36 do
    let t = from_deg (10.0 *. float i) in
    let sz = 50.0 in
    let delta = (sz *. cos t, sz *. sin t) in
    let center = (100., 100.) in
    let position = center +: delta in
    let texture = new texture  (`File "bullet.png") in
    let sprite = new sprite ~texture ~position () in
    window#draw sprite;
  done

let _ =
  let open OcsfmlWindow in
  let open OcsfmlGraphics in
  let mode = VideoMode.create ~w:200 ~h:200 () in
  let window = new render_window mode "BulletML" in
  let rec main_loop () =
    if window#is_open
    then begin
      window#clear ();
      draw_frame window;
      window#display;
      main_loop ()
    end
  in
  main_loop ()
