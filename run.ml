let screen_w = 800
let screen_h = 600

let enemy_pos = (float screen_w /. 2., float screen_h *. 0.3)

let ship_pos = (float screen_w /. 2., float screen_h *.0.9)

let clear surf =
  let rect = Sdlvideo.rect ~x:0 ~y:0 ~h:screen_h ~w:screen_w in
  Sdlvideo.fill_rect ~rect surf 0x00ffffffl

let main () =
  let open Interp in
  let open Interp_types in
  let (fname, patname) = match Sys.argv with
    | [| _ ; a1 ; a2 |] -> (a1, a2)
    | [| _ ; a1 |] -> (a1, "top")
    | _ -> failwith "usage: bulletml pattern.xml name"
  in
  let x = Xml.parse_file fname in
  let bml = Parser.parse_xml x in
  Sdl.init ~auto_clean:true [`VIDEO;`NOPARACHUTE];
  let surf = Sdlvideo.set_video_mode ~w:screen_w ~h:screen_h [] in
  let (aenv, benv, fenv) = read_prog bml in
  let print_env e = String.concat ", " (List.map fst e) in
  Printf.printf "a: %s\nb: %s\nf: %s\n"
    (print_env aenv)
    (print_env benv)
    (print_env fenv);
  let act = List.assoc patname aenv in
  let init_s =
    initial_state
      (screen_w, screen_h)
      enemy_pos
      ship_pos
      aenv benv fenv
  in
  let dummy_state = init_s [] in
  let k = build_prog dummy_state [] (Syntax.Action (Syntax.Direct act)) in
  let state = ref (init_s k) in
  let bullet = Sdlloader.load_image "bullet.png" in
  let draw_bullet window b =
    let (px, py) = int_pos b.pos in
    let dst_rect = Sdlvideo.rect ~x:px ~y:py ~w:0 ~h:0 in
    Sdlvideo.blit_surface ~src:bullet ~dst:window ~dst_rect ()
  in
  let draw_frame window state =
    let objs =
      List.filter
        (fun o -> not o.vanished)
        (collect_obj state.main)
    in
    List.iter (draw_bullet window) objs
  in
  while true; do
    let s = !state in
    flush stdout;
    Sdlevent.pump ();
    begin
      match Sdlevent.poll () with
      | Some ( Sdlevent.MOUSEBUTTONDOWN _
             | Sdlevent.KEYDOWN { Sdlevent.keysym = Sdlkey.KEY_q } ) -> raise Exit
      | _ -> ()
    end;
    clear surf;
    draw_frame surf s;
    Sdlvideo.flip surf;
    state := next_state s;
  done;
  Sdl.quit ()

let _ = main ()
