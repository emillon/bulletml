open Bulletml.Syntax
open Bulletml.Interp
open Bulletml.Interp_types

let screen_w = 800
let screen_h = 600

let enemy_pos = (float screen_w /. 2., float screen_h *. 0.3)

let ship_pos = (float screen_w /. 2., float screen_h *.0.9)

let make_global () =
  Sdl.init ~auto_clean:true [`VIDEO;`NOPARACHUTE];
  let surf = Sdlvideo.set_video_mode ~w:screen_w ~h:screen_h [] in
  let bullet = Sdlloader.load_image "bullet.png" in
  (surf, bullet)

let make_local (surf, bullet) =
  Sdlevent.pump ();
  begin
    match Sdlevent.poll () with
    | Some ( Sdlevent.MOUSEBUTTONDOWN _
           | Sdlevent.KEYDOWN { Sdlevent.keysym = Sdlkey.KEY_q } ) -> raise Exit
    | _ -> ()
  end;
  (surf, bullet)

let clear (surf, _) =
  let rect = Sdlvideo.rect ~x:0 ~y:0 ~h:screen_h ~w:screen_w in
  Sdlvideo.fill_rect ~rect surf 0x00ffffffl

let combine (surf, _) k =
  Sdlvideo.flip surf;
  k ()

let draw_bullet (window, bullet) b =
  let (px, py) = int_pos b.pos in
  let dst_rect = Sdlvideo.rect ~x:px ~y:py ~w:0 ~h:0 in
  Sdlvideo.blit_surface ~src:bullet ~dst:window ~dst_rect ()

let draw window root =
  let objs =
    List.filter
      (fun o -> not o.vanished)
      (collect_obj root)
  in
  List.iter (draw_bullet window) objs

let main () =
  let (fname, patname) = match Sys.argv with
    | [| _ ; a1 ; a2 |] -> (a1, a2)
    | [| _ ; a1 |] -> (a1, "top")
    | _ -> failwith "usage: bulletml pattern.xml name"
  in
  let x = Xml.parse_file fname in
  let bml = Bulletml.Parser.parse_xml x in
  main_loop
    bml enemy_pos ship_pos
    screen_w screen_h
    make_global make_local
    clear draw combine

let _ = main ()
