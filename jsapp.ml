open Bulletml.Syntax
open Bulletml.Interp
open Bulletml.Interp_types

let bml = (* {{{ *)
  BulletML (NoDir,
            [ EBullet ("fast",
                       Bullet (None, Some (SpdAbs (Num 10.)), [ Direct (
                           [ Wait (Num 6.)
                           ; ChangeSpeed (SpdAbs (Num 0.), Num 1.)
                           ; Wait (Num 20.)
                           ; Repeat ((Num 10. +@ Rank *@ Num 18.), Direct (
                               [ Fire (Direct (( Some (DirSeq (((~@ (Num 11.)) -@ Rand *@ Num 2.)))
                                               , Some (SpdAbs (Num 1.5))
                                               , Direct bulletDefault)))
                               ; Action (Indirect ("add3", []))
                               ; Repeat (Num 4., Direct (
                                   [ Fire (Direct (( Some (DirSeq (Num 0.))
                                                   , Some (SpdSeq ((Num 0.1 +@ (Rank *@ Num 0.2))))
                                                   , Direct bulletDefault)))
                                   ; Action (Indirect ("add3", []))
                                   ]))
                               ; Wait ((Num 336. /@ (Num 10. +@ Rank *@ Num 18.)))]))
                           ; Vanish
                           ])]))
            ; EAction ("add3",
                       [ Repeat (Num 3., Direct ([Fire (Direct (( Some (DirSeq (Num 90.))
                                                                , Some (SpdSeq (Num 0.))
                                                                , Direct bulletDefault)))]))
                       ])
            ; EFire ("slowColorChange",
                     ( Some (DirAbs ((Num 180. +@ Num 45. *@ Param 1)))
                     , Some (SpdAbs (Num 7.))
                     , Direct (Bullet (None, None, [Direct (
                         [ Wait (Num 6.)
                         ; ChangeSpeed (SpdAbs (Num 0.), Num 1.)
                         ; Repeat ((Num 50. +@ Rank *@ Num 50.), Direct (
                             [ Fire (Direct (( Some (DirSeq (((Num 8. -@ Rank *@ Num 4.) *@ Param 1)))
                                             , Some (SpdAbs (Num 1.2))
                                             , Direct bulletDefault)))
                             ; Action (Indirect ("add3", []))
                             ; Wait (((Num 8. -@ Rank *@ Num 4.) +@ Rand))
                             ]))
                         ; Vanish
                         ])]))))
            ; EFire ("slow",
                     ( None
                     , None
                     , Direct (Bullet (None, None, [Direct (
                         [ Fire (Indirect ("slowColorChange", [Param 1]))
                         ; Vanish
                         ])]))))
            ; EAction ("top",
                       [ Fire (Direct ((Some (DirAbs (~@ (Num 85.))), None, Indirect ("fast", []))))
                       ; Wait (Num 1.)
                       ; Fire (Direct ((Some (DirAbs (Num 85.)), None, Indirect ("fast", []))))
                       ; Wait (Num 1.)
                       ; Fire (Indirect ("slow", [Num (1.)]))
                       ; Wait (Num 1.)
                       ; Fire (Indirect ("slow", [~@ (Num 1.)]))
                       ; Wait (Num 430.)
                       ])
            ]) (* }}} *)

let screen_w = 400
let screen_h = 300
let enemy_pos = (200., 100.)
let ship_pos = ref (200., 250.)

let params =
  { p_screen_w = screen_w
  ; p_screen_h = screen_h
  ; p_enemy = enemy_pos
  ; p_ship = !ship_pos
  }

let mouse_handler e =
  ship_pos := (float e##clientX, float e##clientY);
  Js._true

let create_canvas () =
  let c = Dom_html.createCanvas Dom_html.document in
  c##width <- screen_w;
  c##height <- screen_h;
  c##onmousemove <- Dom_html.handler mouse_handler;
  c

let make_global_ctx () =
  let canvas = create_canvas () in
  Dom.appendChild Dom_html.document##body canvas;
  canvas

let make_local_ctx canvas =
  let ctx = canvas##getContext (Dom_html._2d_) in
  let img = ctx##getImageData (0., 0., float screen_w, float screen_h) in
  (ctx, img)

(* A clearRect would be better but it does not work *)
let clear (ctx, img) =
  let data = img##data in
  for i = 0 to screen_w do
    for j = 0 to screen_h do
      let p = 4 * (j * screen_w + i) in
      Dom_html.pixel_set data (p+0) 255;
      Dom_html.pixel_set data (p+1) 255;
      Dom_html.pixel_set data (p+2) 255;
      Dom_html.pixel_set data (p+3) 255;
    done
  done

let draw_px ~color ctx data i j =
  let (r, g, b) = color in
  let p = 4 * (j * screen_w + i) in
  Dom_html.pixel_set data (p+0) r;
  Dom_html.pixel_set data (p+1) g;
  Dom_html.pixel_set data (p+2) b;
  Dom_html.pixel_set data (p+3) 255;
  ()

let draw_bullet ?(color=(0xfa, 0x69, 0x00)) ctx img x y =
  let data = img##data in
  let i = int_of_float x in
  let j = int_of_float y in
  draw_px ~color ctx data i j;
  draw_px ~color ctx data i (j+1);
  draw_px ~color ctx data (i+1) j;
  draw_px ~color ctx data i (j-1);
  draw_px ~color ctx data (i-1) j;
  ()

let draw (ctx, img) root =
  let objs =
    List.filter
      (fun o -> not o.vanished)
      (collect_obj root)
  in
  List.iter (fun o -> let (x, y) = o.pos in draw_bullet ctx img x y) objs

let draw_ship (ctx, img) =
  let color = (0x69, 0xD2, 0xE7) in
  let (x, y) = !ship_pos in
  draw_bullet ~color ctx img x y

let run_cont (ctx, img) k =
  let open Lwt in
  ctx##putImageData (img, 0., 0.);
  Lwt_js.yield () >>= k

let _ =
  main_loop
    bml
    params
    { make_global_ctx
    ; make_local_ctx
    ; clear
    ; draw
    ; draw_ship
    ; run_cont
    }
