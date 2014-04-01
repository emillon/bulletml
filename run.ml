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

type color = Blue | Purple

let hooks =
  [ "changecolor", fun _ -> Purple ]

let draw_bullet window (bulletb, bulletp) b =
  let (px, py) = int_pos b.pos in
  let src = match b.state with
    | Blue -> bulletb
    | Purple -> bulletp
  in
  let dst_rect = Sdlvideo.rect ~x:px ~y:py ~w:0 ~h:0 in
  Sdlvideo.blit_surface ~src ~dst:window ~dst_rect ()

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
  let font = open_font "/usr/share/fonts/truetype/ttf-dejavu/DejaVuSansMono.ttf" 10 in
  fun surface msg ->
    let text = render_text_solid font msg ~fg:Sdlvideo.black in
    let dst_rect = Sdlvideo.rect ~x:10 ~y:10 ~w:0 ~h:0 in
    Sdlvideo.blit_surface ~src:text ~dst:surface ~dst_rect ()

module Options = struct
  let parse_only = ref false
  let fname = ref None
  let limit_fps = ref None
end

let _ =
  let args =
    [ ("-p", Arg.Set Options.parse_only, "parse and print only")
    ; ("-f", Arg.String (fun s -> Options.limit_fps := Some (float_of_string s)), "limit FPS")
    ]
  in
  let usage = "Use the source, Luke" in
  Arg.parse args (fun s -> Options.fname := Some s) usage;
  let fname = match !Options.fname with
    | Some f -> f
    | None -> (print_endline usage;exit 1)
  in
  let bml = Bulletml.Parser.parse_auto fname in
  if !Options.parse_only then begin
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
  let bullets = (Sdlloader.load_image "bullet.png", Sdlloader.load_image "bullet2.png") in
  let ship =
    Sdlvideo.create_RGB_surface []
      ~w:8 ~h:8 ~bpp:32
      ~rmask:0l ~gmask:0l ~bmask:0l ~amask:0l
  in
  Sdlvideo.fill_rect ship 0xfa6900l;
  let (global_env, obj0, _top) = prepare bml params Blue in
  let global_env = { global_env with hooks } in
  let last_frame = ref (Unix.gettimeofday ()) in
  let msg = ref "xxx" in
  let rec go frame obj =
    handle_events ();
    let env =
      { global_env with
        frame = frame
      ; ship_pos = !ship_pos
      }
    in
    clear window;
    let nbullets = draw window bullets obj in
    draw_ship window bullets ship;
    let now = Unix.gettimeofday () in
    let frametime = now -. !last_frame in
    let fps = 1. /. frametime in
    if frame mod 20 = 0 then
      (msg := (Printf.sprintf "%d bullets %.1f fps %.1f bfps" nbullets fps (float nbullets *. fps)))
    ;
    draw_msg window !msg;
    Sdlvideo.flip window;
    let new_obj = (animate env obj) in
    begin match !Options.limit_fps with
      | None -> ()
      | Some f ->
        let time = !last_frame +. 1. /. f -. now in
        if time > 0. then
          ignore (Unix.select [] [] [] time)
    end;
    last_frame := now;
    go (frame + 1) new_obj
  in
  while true do
    try go 1 obj0 with Reset -> ()
  done
