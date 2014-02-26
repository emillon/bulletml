open Bulletml.Syntax

let pat = (* {{{ *)
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
let ship_pos = (200., 250.)

let create_canvas () =
  let c = Dom_html.createCanvas Dom_html.document in
  c##width <- screen_w;
  c##height <- screen_h;
  c

(* A clearRect would be better but it does not work *)
let clear_canvas ctx data =
  for i = 0 to screen_w do
    for j = 0 to screen_h do
      let p = 4 * (j * screen_w + i) in
      Dom_html.pixel_set data (p+0) 255;
      Dom_html.pixel_set data (p+1) 255;
      Dom_html.pixel_set data (p+2) 255;
      Dom_html.pixel_set data (p+3) 255;
    done
  done

let draw_px ctx data i j =
  let p = 4 * (j * screen_w + i) in
  Dom_html.pixel_set data (p+0) 0xfa;
  Dom_html.pixel_set data (p+1) 0x69;
  Dom_html.pixel_set data (p+2) 0x00;
  Dom_html.pixel_set data (p+3) 255;
  ()

let draw_bullet ctx data x y =
  let i = int_of_float x in
  let j = int_of_float y in
  draw_px ctx data i j;
  draw_px ctx data i (j+1);
  draw_px ctx data (i+1) j;
  draw_px ctx data (i+1) (j+1);
  ()

let _ =
  let open Bulletml.Interp in
  let open Bulletml.Interp_types in
  let (aenv, benv, fenv) = read_prog pat in
  let print_env e = String.concat ", " (List.map fst e) in
  Printf.printf "a: %s\nb: %s\nf: %s\n"
    (print_env aenv)
    (print_env benv)
    (print_env fenv);
  let act = List.assoc "top" aenv in
  let global_env =
    { frame = 0
    ; ship_pos = ship_pos
    ; screen_w = screen_w
    ; screen_h = screen_h
    ; actions = aenv
    ; bullets = benv
    ; fires = fenv
    }
  in
  let k = build_prog global_env [] (Action (Direct act)) in
  let canvas = create_canvas () in
  Dom.appendChild Dom_html.document##body canvas;
  let draw_frame ctx data root =
    let objs =
      List.filter
        (fun o -> not o.vanished)
        (collect_obj root)
    in
    List.iter (fun o -> let (x, y) = o.pos in draw_bullet ctx data x y) objs
  in
  let obj0 = initial_obj k enemy_pos in
  let open Lwt in
  let rec go frame obj =
    let env =
      { global_env with
        frame = frame
      }
    in
    let ctx = canvas##getContext (Dom_html._2d_) in
    let img = ctx##getImageData (0., 0., float screen_w, float screen_h) in
    let data = img##data in
    clear_canvas ctx data;
    draw_frame ctx data obj;
    ctx##putImageData (img, 0., 0.);
    Lwt_js.yield () >>= fun () ->
    go (frame + 1) (animate env obj);
  in
  go 1 obj0
