open Bulletml.Syntax
open Bulletml.Interp
open Bulletml.Interp_types

let screen_w = 800
let screen_h = 600

let enemy_pos = (float screen_w /. 2., float screen_h *. 0.3)

let ship_pos = (float screen_w /. 2., float screen_h *.0.9)

let make_global_ctx () =
  Sdl.init ~auto_clean:true [`VIDEO;`NOPARACHUTE];
  let surf = Sdlvideo.set_video_mode ~w:screen_w ~h:screen_h [] in
  let bullet = Sdlloader.load_image "bullet.png" in
  let ship =
    Sdlvideo.create_RGB_surface []
      ~w:8 ~h:8 ~bpp:32
      ~rmask:0l ~gmask:0l ~bmask:0l ~amask:0l
  in
  Sdlvideo.fill_rect ship 0x69D2E7l;
  (surf, bullet, ship)

let make_local_ctx ctx =
  Sdlevent.pump ();
  begin
    match Sdlevent.poll () with
    | Some ( Sdlevent.MOUSEBUTTONDOWN _
           | Sdlevent.KEYDOWN { Sdlevent.keysym = Sdlkey.KEY_q } ) -> raise Exit
    | _ -> ()
  end;
  ctx

let clear (surf, _, _) =
  let rect = Sdlvideo.rect ~x:0 ~y:0 ~h:screen_h ~w:screen_w in
  Sdlvideo.fill_rect ~rect surf 0x00ffffffl

let run_cont (surf, _, _) k =
  Sdlvideo.flip surf;
  k ()

let draw_bullet (window, bullet, _) b =
  let (px, py) = int_pos b.pos in
  let dst_rect = Sdlvideo.rect ~x:px ~y:py ~w:0 ~h:0 in
  Sdlvideo.blit_surface ~src:bullet ~dst:window ~dst_rect ()

let draw ctx root =
  let objs =
    List.filter
      (fun o -> not o.vanished)
      (collect_obj root)
  in
  List.iter (draw_bullet ctx) objs

let draw_ship (window, bullet, ship) pos =
  let (px, py) = int_pos pos in
  let dst_rect = Sdlvideo.rect ~x:px ~y:py ~w:0 ~h:0 in
  Sdlvideo.blit_surface ~src:ship ~dst:window ~dst_rect ()

let main () =
  let (fname, patname) = match Sys.argv with
    | [| _ ; a1 ; a2 |] -> (a1, a2)
    | [| _ ; a1 |] -> (a1, "top")
    | _ -> failwith "usage: bulletml pattern.xml name"
  in
  let x = Xml.parse_file fname in
  let bml = Bulletml.Parser.parse_xml x in
  main_loop
    bml
    { p_enemy = enemy_pos
    ; p_ship = ship_pos
    ; p_screen_w = screen_w
    ; p_screen_h = screen_h
    }
    { make_global_ctx
    ; make_local_ctx
    ; clear
    ; draw
    ; draw_ship
    ; move_ship = (fun _ p -> p)
    ; run_cont
    }

let _ = main ()
