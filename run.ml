open Bulletml.Syntax
open Bulletml.Interp
open Bulletml.Interp_types

exception Reset

let screen_w = 800
let screen_h = 600

let enemy_pos = (float screen_w /. 2., float screen_h *. 0.3)

let ship_pos = ref (float screen_w /. 2., float screen_h *.0.9)

type global_ctx =
  { window : Sdlvideo.surface
  ; bullet : Sdlvideo.surface
  ; ship : Sdlvideo.surface
  }

let move_x dx =
  let (x, y) = !ship_pos in
  ship_pos := (x +. dx, y)

let move_y dy =
  let (x, y) = !ship_pos in
  ship_pos := (x, y +. dy)

let make_local_ctx g_ctx =
  Sdlevent.pump ();
  begin
    match Sdlevent.poll () with
    | Some ( Sdlevent.MOUSEBUTTONDOWN { Sdlevent.mbe_button = Sdlmouse.BUTTON_LEFT }
           | Sdlevent.KEYDOWN { Sdlevent.keysym = Sdlkey.KEY_q } ) -> raise Exit
    | Some ( Sdlevent.MOUSEBUTTONDOWN { Sdlevent.mbe_button = Sdlmouse.BUTTON_RIGHT } ) ->
      raise Reset
    | Some ( Sdlevent.MOUSEMOTION { Sdlevent.mme_x ; Sdlevent.mme_y } ) ->
      ship_pos := (float mme_x, float mme_y)
    | Some ( Sdlevent.KEYDOWN { Sdlevent.keysym = Sdlkey.KEY_UP } ) -> move_y (-10.)
    | Some ( Sdlevent.KEYDOWN { Sdlevent.keysym = Sdlkey.KEY_DOWN } ) -> move_y (10.)
    | Some ( Sdlevent.KEYDOWN { Sdlevent.keysym = Sdlkey.KEY_LEFT } ) -> move_x (-10.)
    | Some ( Sdlevent.KEYDOWN { Sdlevent.keysym = Sdlkey.KEY_RIGHT } ) -> move_x (10.)
    | _ -> ()
  end;
  g_ctx

let clear window =
  let rect = Sdlvideo.rect ~x:0 ~y:0 ~h:screen_h ~w:screen_w in
  Sdlvideo.fill_rect ~rect window 0x00ffffffl

let draw_bullet {window;bullet} b =
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

let draw_ship window bullet ship =
  let (px, py) = int_pos (!ship_pos) in
  let dst_rect = Sdlvideo.rect ~x:px ~y:py ~w:0 ~h:0 in
  Sdlvideo.blit_surface ~src:ship ~dst:window ~dst_rect ()

let _ =
  let (fname, patname) = match Sys.argv with
    | [| _ ; a1 ; a2 |] -> (a1, a2)
    | [| _ ; a1 |] -> (a1, "top")
    | _ -> failwith "usage: bulletml pattern.xml name"
  in
  let x = Xml.parse_file fname in
  let bml = Bulletml.Parser.parse_xml x in
  let params =
    { p_enemy = enemy_pos
    ; p_ship = !ship_pos
    ; p_screen_w = screen_w
    ; p_screen_h = screen_h
    }
  in
  Sdl.init ~auto_clean:true [`VIDEO;`NOPARACHUTE];
  let window = Sdlvideo.set_video_mode ~w:screen_w ~h:screen_h [] in
  let bullet = Sdlloader.load_image "bullet.png" in
  let ship =
    Sdlvideo.create_RGB_surface []
      ~w:8 ~h:8 ~bpp:32
      ~rmask:0l ~gmask:0l ~bmask:0l ~amask:0l
  in
  Sdlvideo.fill_rect ship 0x69D2E7l;
  let global_ctx = { window ; bullet; ship } in
  let (global_env, obj0, _top) = prepare bml params in
  let rec go frame obj =
    let ctx = make_local_ctx global_ctx in
    let env =
      { global_env with
        frame = frame
      ; ship_pos = !ship_pos
      }
    in
    clear ctx.window;
    draw ctx obj;
    draw_ship ctx.window ctx.bullet ctx.ship;
    Sdlvideo.flip ctx.window;
    let new_obj = (animate env obj) in
    go (frame + 1) new_obj
  in
  while true do
    try go 1 obj0 with Reset -> ()
  done
