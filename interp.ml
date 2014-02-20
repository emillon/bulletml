let from_deg x =
  let pi = acos (-1.) in
  2. *. pi *. x /. 360.

let (+:) (xa, ya) (xb, yb) =
  (xa +. xb, ya +. yb)

let int_pos (x, y) =
  (int_of_float x, int_of_float y)

let bullet_spr = ref None

let bullet_sprite () :Graphics.image =
  let mk () =
    let o = Graphics.white in
    let x = Graphics.black in
    Graphics.make_image
      [| [|o;o;o;x;x;o;o;o|]
       ; [|o;o;x;x;x;x;o;o|]
       ; [|o;x;x;x;x;x;x;o|]
       ; [|x;x;x;x;x;x;x;x|]
       ; [|x;x;x;x;x;x;x;x|]
       ; [|o;x;x;x;x;x;x;o|]
       ; [|o;o;x;x;x;x;o;o|]
       ; [|o;o;o;x;x;o;o;o|]
      |]
  in
  match !bullet_spr with
  | Some s -> s
  | None -> begin
      let s = mk () in
      bullet_spr := Some s;
      s
    end

let draw_bullet p =
  let (x, y) = int_pos (p +: (-4., -4.)) in
  Printf.printf "(%d, %d)\n" x y;
  Graphics.draw_image (bullet_sprite ()) x y

let _ =
  Graphics.open_graph " 200x200";
  let center = (100., 100.) in
  for i = 0 to 36 do
    let t = from_deg (10.0 *. float i) in
    let sz = 50.0 in
    let delta = (sz *. cos t, sz *. sin t) in
    let pos = center +: delta in
    draw_bullet pos
  done;
  let _ = read_line () in
  Graphics.close_graph ()
