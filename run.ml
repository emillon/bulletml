let screen_w = 800
let screen_h = 600

let enemy_pos = (float screen_w /. 2., float screen_h *. 0.3)

let ship_pos = (float screen_w /. 2., float screen_h *.0.9)

let clear surf =
  let rect = Sdlvideo.rect ~x:0 ~y:0 ~h:screen_h ~w:screen_w in
  Sdlvideo.fill_rect ~rect surf 0x00ffffffl

let main () =
  let open Bulletml.Syntax in
  let open Bulletml.Interp in
  let open Bulletml.Interp_types in
  let (fname, patname) = match Sys.argv with
    | [| _ ; a1 ; a2 |] -> (a1, a2)
    | [| _ ; a1 |] -> (a1, "top")
    | _ -> failwith "usage: bulletml pattern.xml name"
  in
  let x = Xml.parse_file fname in
  let bml = Bulletml.Parser.parse_xml x in
  Sdl.init ~auto_clean:true [`VIDEO;`NOPARACHUTE];
  let surf = Sdlvideo.set_video_mode ~w:screen_w ~h:screen_h [] in
  let (aenv, benv, fenv) = read_prog bml in
  let print_env e = String.concat ", " (List.map fst e) in
  Printf.printf "a: %s\nb: %s\nf: %s\n"
    (print_env aenv)
    (print_env benv)
    (print_env fenv);
  let act = List.assoc patname aenv in
  let dummy_env =
    { frame = 0
    ; ship_pos = ship_pos
    ; screen_w = screen_w
    ; screen_h = screen_h
    ; actions = []
    ; bullets = []
    ; fires = []
    }
  in
  let k = build_prog dummy_env [] (Action (Direct act)) in
  let state = ref (initial_obj k ship_pos) in
  let bullet = Sdlloader.load_image "bullet.png" in
  let draw_bullet window b =
    let (px, py) = int_pos b.pos in
    let dst_rect = Sdlvideo.rect ~x:px ~y:py ~w:0 ~h:0 in
    Sdlvideo.blit_surface ~src:bullet ~dst:window ~dst_rect ()
  in
  let draw_frame window root =
    let objs =
      List.filter
        (fun o -> not o.vanished)
        (collect_obj root)
    in
    List.iter (draw_bullet window) objs
  in
  let f = ref 0 in
  while true; do
    let env =
      { dummy_env with
        frame = !f
      ; actions = aenv
      ; bullets = benv
      ; fires = fenv
      }
    in
    let o = !state in
    flush stdout;
    Sdlevent.pump ();
    begin
      match Sdlevent.poll () with
      | Some ( Sdlevent.MOUSEBUTTONDOWN _
             | Sdlevent.KEYDOWN { Sdlevent.keysym = Sdlkey.KEY_q } ) -> raise Exit
      | _ -> ()
    end;
    clear surf;
    draw_frame surf o;
    Sdlvideo.flip surf;
    state := animate env o;
    incr f;
  done;
  Sdl.quit ()

let _ = main ()
