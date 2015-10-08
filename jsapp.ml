open Bulletml.Syntax
open Bulletml.Interp
open Bulletml.Interp_types

let stop = ref false

let bml = ref ((*{{{*)
    BulletML (Some Horizontal, [EAction ("top", [Repeat (Num 20.,Direct ([Fire (Direct ((Some (DirAim (((Num 0. -@ Num 60.) +@ (Rand *@ Num 120.)))), None, Indirect ("hmgLsr", [])))); Repeat (Num 8.,Direct ([Wait (Num 1.); Fire (Direct ((Some (DirSeq (Num 0.)), None, Indirect ("hmgLsr", []))))])); Wait (Num 10.)])); Wait (Num 60.)]); EBullet ("hmgLsr",Bullet (None,Some (SpdAbs (Num 2.)),[Direct ([ChangeSpeed (SpdAbs (Num 0.3),Num 30.); Wait (Num 100.); ChangeSpeed (SpdAbs (Num 5.),Num 100.)]); Direct ([Repeat (Num 12.,Direct ([ChangeDirection (DirAim (Num 0.),(Num 45. -@ (Rank *@ Num 30.))); Wait (Num 5.)]))])]))]))
(*}}}*)

let screen_w = 400
let screen_h = 300
let enemy_pos = (200., 100.)
let ship_pos = ref (200., 250.)

let params =
  { p_screen_w = screen_w
  ; p_screen_h = screen_h
  ; p_enemy = enemy_pos
  ; p_ship = !ship_pos
  ; p_rank = 0.5
  }

let mouse_handler c e =
  let get_hard z = Js.Optdef.get z (fun () -> assert false) in
  let px = get_hard (e##.pageX) in
  let py = get_hard (e##.pageY) in
  let x = px - c##.offsetLeft in
  let y = py - c##.offsetTop in
  ship_pos := (float x, float y);
  Js._true

let create_canvas () =
  let c = Dom_html.createCanvas Dom_html.document in
  c##.width := screen_w;
  c##.height := screen_h;
  c##.onmousemove := Dom_html.handler (mouse_handler c);
  c

let draw_px ~color ctx data i j =
  let (r, g, b) = color in
  let p = 4 * (j * screen_w + i) in
  Dom_html.pixel_set data (p+0) r;
  Dom_html.pixel_set data (p+1) g;
  Dom_html.pixel_set data (p+2) b;
  Dom_html.pixel_set data (p+3) 255;
  ()

(* A clearRect would be better but it does not work *)
let clear (ctx, img) =
  let data = img##.data in
  let color = (0xff, 0xff, 0xff) in
  for i = 0 to screen_w do
    for j = 0 to screen_h do
      draw_px ~color ctx data i j
    done
  done

let draw_bullet ?(color=(0xfa, 0x69, 0x00)) ctx img x y =
  let data = img##.data in
  let i0 = int_of_float x in
  let j0 = int_of_float y in
  let pix =
    [ -2,  0 ; -2,  1 ; -2,  2 ; -2, -1
    ; -1,  0 ; -1,  1 ; -1,  2 ; -1,  3
    ; -1, -1 ; -1, -2 ;  0,  0 ;  0,  1
    ;  0,  2 ;  0,  3 ;  0, -1 ;  0, -2
    ;  1,  0 ;  1,  1 ;  1,  2 ;  1,  3
    ;  1, -1 ;  1, -2 ;  2,  0 ;  2,  1
    ;  2,  2 ;  2,  3 ;  2, -1 ;  2, -2
    ;  3,  0 ;  3,  1 ;  3,  2 ;  3, -1
    ]
  in
  List.iter (fun (i, j) -> draw_px ~color ctx data (i0 + i) (j0 + j)) pix

let draw (ctx, img) root =
  let objs =
    List.filter
      (fun o -> not o.vanished)
      (collect_obj root)
  in
  let r = ref 0 in
  List.iter (fun o -> let (x, y) = o.pos in draw_bullet ctx img x y;incr r) objs;
  !r

let draw_ship (ctx, img) =
  let color = (0x69, 0xD2, 0xE7) in
  let (x, y) = !ship_pos in
  draw_bullet ~color ctx img x y

let draw_msg ctx msg =
  ctx##fillText (Js.string msg) 0. 10.

let reload elem =
  let s = Js.to_string elem##.value in
  bml := Bulletml.Parser.parse_pat_string s;
  stop := true

let setup_textarea elem =
  elem##.onkeyup := Dom_html.handler (fun e ->
      let cb = Js.wrap_callback (fun () -> reload elem) in
      let _ = Dom_html.window##setTimeout cb 10. in
      Js._true
    )

let iter_nl f nl =
  let n = nl##.length in
  for i = 0 to n - 1 do
    Js.Opt.iter (nl##item(i)) f
  done

let setup_demos ta =
  let demos = Dom_html.document##querySelectorAll(Js.string".demo") in
  iter_nl (fun e ->
      e##.onclick := Dom_html.handler (fun _ ->
          let cont = e##.innerHTML in
          ta##.innerHTML := cont;
          reload ta;
          Js._true
        )
    ) demos

let _ =
  let open Lwt in
  let canvas = create_canvas () in
  let doc = Dom_html.document in
  let textarea = Dom_html.createTextarea doc in
  Js.Opt.iter (doc##querySelector(Js.string"#shmup")) (fun e ->
      Dom.appendChild e canvas;
      Dom.appendChild e textarea;
    );
  setup_textarea textarea;
  setup_demos textarea;
  let (global_env, obj0, _top) = prepare (!bml) params () in
  canvas##.onclick := Dom_html.handler (fun e -> stop := true ; Js._true);
  let rec go frame obj () =
    let env =
      { global_env with
        frame = frame
      ; ship_pos = !ship_pos
      }
    in
    let ctx = canvas##getContext (Dom_html._2d_) in
    let img = ctx##getImageData 0. 0. (float screen_w) (float screen_h) in
    clear (ctx, img);
    let perf = draw (ctx, img) obj in
    draw_ship (ctx, img);
    ctx##putImageData img 0. 0.;
    draw_msg ctx (string_of_int perf ^ " bullets");
    let k = if !stop then begin
        stop := false;
        let (_, o, _)  = prepare (!bml) params () in
        go 1 o
      end else
        go (frame + 1) (animate env obj)
    in
    Lwt_js.yield () >>= k
  in
  go 1 obj0 ()
