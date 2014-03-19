open Bulletml.Syntax
open Bulletml.Interp
open Bulletml.Interp_types

exception Reset

let screen_w = 800
let screen_h = 600

let enemy_pos = (float screen_w /. 2., float screen_h *. 0.3)

let ship_pos = ref (float screen_w /. 2., float screen_h *.0.9)

let move_x dx =
  let (x, y) = !ship_pos in
  ship_pos := (x +. dx, y)

let move_y dy =
  let (x, y) = !ship_pos in
  ship_pos := (x, y +. dy)

let handle_events () =
  let open Sdlevent in
  let open Sdlkey in
  let open Sdlmouse in
  pump ();
  match poll () with
  | Some ( MOUSEBUTTONDOWN { mbe_button = BUTTON_LEFT }
         | KEYDOWN { keysym = KEY_q } ) -> raise Exit
  | Some ( MOUSEBUTTONDOWN { mbe_button = BUTTON_RIGHT } ) -> raise Reset
  | Some ( MOUSEMOTION { mme_x ; mme_y } ) ->
    ship_pos := (float mme_x, float mme_y)
  | Some ( KEYDOWN { keysym = KEY_UP } ) -> move_y (-10.)
  | Some ( KEYDOWN { keysym = KEY_DOWN } ) -> move_y (10.)
  | Some ( KEYDOWN { keysym = KEY_LEFT } ) -> move_x (-10.)
  | Some ( KEYDOWN { keysym = KEY_RIGHT } ) -> move_x (10.)
  | _ -> ()

let clear window =
  let rect = Sdlvideo.rect ~x:0 ~y:0 ~h:screen_h ~w:screen_w in
  Sdlvideo.fill_rect ~rect window 0x00ffffffl

let draw_bullet window bullet b =
  let (px, py) = int_pos b.pos in
  let dst_rect = Sdlvideo.rect ~x:px ~y:py ~w:0 ~h:0 in
  Sdlvideo.blit_surface ~src:bullet ~dst:window ~dst_rect ()

let draw window bullet root =
  let objs =
    List.filter
      (fun o -> not o.vanished)
      (collect_obj root)
  in
  let r = ref 0 in
  List.iter (fun b -> incr r; draw_bullet window bullet b) objs;
  !r

let draw_ship window bullet ship =
  let (px, py) = int_pos (!ship_pos) in
  let dst_rect = Sdlvideo.rect ~x:px ~y:py ~w:0 ~h:0 in
  Sdlvideo.blit_surface ~src:ship ~dst:window ~dst_rect ()

let draw_msg =
  let open Sdlttf in
  init ();
  let font = open_font "/usr/share/fonts/truetype/ttf-dejavu/DejaVuSans.ttf" 20 in
  fun surface msg ->
    let text = render_text_solid font msg ~fg:Sdlvideo.black in
    let dst_rect = Sdlvideo.rect ~x:10 ~y:10 ~w:0 ~h:0 in
    Sdlvideo.blit_surface ~src:text ~dst:surface ~dst_rect ()

let _ =
  let parse_only = ref false in
  let (fname, patname) = match Sys.argv with
    | [| _ ; "-p" ; a1 |] -> (parse_only := true ; (a1, "top"))
    | [| _ ; a1 ; a2 |] -> (a1, a2)
    | [| _ ; a1 |] -> (a1, "top")
    | _ -> failwith "usage: bulletml pattern.xml name"
  in
  let x = Xml.parse_file fname in
  let bml = Bulletml.Parser.parse_xml x in
  if !parse_only then begin
    print_endline (Bulletml.Printer.print_bulletml bml);
    exit 0
  end;
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
  let (global_env, obj0, _top) = prepare bml params in
  let rec go frame obj =
    handle_events ();
    let env =
      { global_env with
        frame = frame
      ; ship_pos = !ship_pos
      }
    in
    clear window;
    let perf = draw window bullet obj in
    draw_ship window bullet ship;
    draw_msg window (Printf.sprintf "%d bullets" perf);
    Sdlvideo.flip window;
    let new_obj = (animate env obj) in
    go (frame + 1) new_obj
  in
  while true do
    try go 1 obj0 with Reset -> ()
  done
