
let testspecs =
  let open Bulletml in
  let bulletDefault = Bullet (None, None, []) in
  let ( +@ ) = fun x y -> Op (Add, x, y) in
  let ( -@ ) = fun x y -> Op (Sub, x, y) in
  let ( *@ ) = fun x y -> Op (Mul, x, y) in
  let ( /@ ) = fun x y -> Op (Div, x, y) in
  [ ("01.xml", `Bullet (
       Bullet (Some (DirAim (Num 270.)), Some (SpdAbs (Num 2.)), [
           Direct [Accel (None, Some (Num 3.), Num 120.)]
         ]
         )))
  ; ("02.xml", `Action
       [ ChangeSpeed (SpdAbs (Num 0.), Num 60.)
       ; Wait (Num 60.)
       ; Fire (Direct (None, None, None, Direct bulletDefault))
       ; Fire (Direct (None, Some (DirAbs (
           Num 330. +@ Rand *@ Num 25.
         )), None, Indirect "downAccel"))
       ; Vanish
       ])
  ; ("03.xml", `Fire
       (None, Some (DirAbs (Num 270.)), Some (SpdAbs (Num 2.)), Indirect "rocket"))
  ; ("04.xml", `Action
       [ Repeat (Num 100., Direct [
            Fire (Direct (None, Some (DirAbs (
                Num 220. +@ Rand *@ Num 100.
              )), None, Indirect "backBurst"))
          ; Wait (Num 6.)
          ])
       ])
  ; ("[Dodonpachi]_hibachi.xml"), `Bulletml ( (* {{{ *)
      BulletML (NoDir,
                [ EAction ("allWay",
                           [ Fire
                               ( Direct
                                   ( None
                                   , Some (DirAim (Op (Add, (Num (-50.)), Op (Mul, Rand, Num 20.))))
                                   , Some (SpdAbs (Op (Add, Num 1., Rank)))
                                   , Direct bulletDefault
                                   )
                               )
                           ; Repeat
                               ( Op (Add, Num 15., Op (Mul, Op (Mul, Num 16., Rank), Rank))
                               , Direct
                                   [ Fire
                                       ( Direct
                                           ( None
                                           , Some (DirSeq (Op (Sub, Num 24., Op (Mul, Rank, Num 12.))))
                                           , Some (SpdSeq (Num 0.))
                                           , Direct bulletDefault
                                           )
                                       )
                                   ])
                           ])
                ; EAction ("right",
                           [ ChangeDirection (DirAbs (Num 90.), Num 1.)
                           ; ChangeSpeed (SpdAbs (Num 1.), Num 1.)
                           ; Repeat
                               ( Num 25.
                               , Direct
                                   [ Action (Indirect "allWay")
                                   ; Wait (Num 3.)
                                   ])
                           ])

                ; EAction ("left",
                           [ ChangeDirection (DirAbs (Num (-90.)), Num 1.)
                           ; ChangeSpeed (SpdAbs (Num 1.), Num 1.)
                           ; Repeat
                               ( Num 25.
                               , Direct
                                   [ Action (Indirect "allWay")
                                   ; Wait (Num 3.)
                                   ])
                           ])

                ; EAction ("top",
                           [ Repeat
                               ( Num 2.
                               , Direct
                                   [ Action (Indirect "right")
                                   ; Action (Indirect "left")
                                   ; Action (Indirect "left")
                                   ; Action (Indirect "right")
                                   ])
                           ; ChangeSpeed (SpdAbs (Num 0.), Num 1.)
                           ; Wait (Num 1.)
                           ])
                ]))
  (* }}} *)
  ; ("[MDA]_circular_sun.xml", `Bulletml ( (* {{{ *)
      BulletML (Vertical,
                [ EAction ("top",
                           [ ChangeSpeed (SpdAbs (Num 0.75), Num 1.)
                           ; ChangeDirection (DirAbs (Num 90.), Num 1.)
                           ; Wait (Num 1.)
                           ; ChangeDirection (DirSeq (Num 0.7), Num 514.)
                           ; Wait (Num 2.)
                           ; Repeat (Num 32., (Direct
                                                 [ Action (Indirect "shoot")
                                                 ; Wait (Num 16.)
                                                 ]))
                           ; ChangeSpeed (SpdAbs (Num 0.), Num 1.)
                           ; Wait (Num 120.)
                           ])
                ; EAction ("shoot",
                           [ Repeat (Num 1. +@ Num 63. *@ Rank, Direct
                                       [ Fire (Direct
                                                 ( None
                                                 , Some (DirSeq (Num 360. /@ (Num 1. +@ Num 63. *@ Rank)))
                                                 , Some (SpdAbs (Num 1.28 +@ Num 0.08 *@ Rand))
                                                 , Indirect "curve"
                                                 ))])
                           ])
                ; EBullet ("curve",
                           Bullet (None, None, [ Direct
                                                   [ ChangeDirection (DirSeq (Num 1.25 -@ Num 1.6 *@ Rand), Num 360.)
                                                   ; Wait (Num 360.)
                                                   ; Vanish
                                                   ]
                                               ]))
                ])
    )
    )
  (* }}} *)
  ]

let tests () =
  let mk_test (n, s) =
    let run_test () =
      let fname = "examples/" ^ n in
      let x = Xml.parse_file fname in
      let str = Xml.to_string_fmt x in
      print_endline str;
      match s with
      | `Bullet bspec ->
        begin match x with
          | Xml.Element ("bullet", _, ns) ->
            let b = Parser.parse_bullet ns in
            OUnit.assert_equal b bspec
          | _ -> OUnit.assert_failure "not a bullet"
        end
      | `Action aspec ->
        begin match x with
          | Xml.Element ("action", [], ns) ->
            let a = Parser.parse_action ns in
            OUnit.assert_equal a aspec
          | _ -> OUnit.assert_failure "not an action"
        end
      | `Fire fspec ->
        begin match x with
          | Xml.Element ("fire", [], ns) ->
            let f = Parser.parse_fire ns in
            OUnit.assert_equal f fspec
          | _ -> OUnit.assert_failure "not a fire"
        end
      | `Bulletml bspec ->
        let b = Parser.parse_xml x in
        OUnit.assert_equal ~printer:Printer.print_bulletml bspec b
    in
    (n, `Quick, run_test)
  in
  List.map mk_test testspecs

let _ =
  Alcotest.run "BulletML" ["examples", tests ()]
