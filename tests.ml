let testspecs =
  let open Bulletml in
  let bulletDefault = Bullet (None, None, []) in
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
           Op (Add, Num 330., Op (Mul, Rand, Num 25.))
         )), None, Indirect "downAccel"))
       ; Vanish
       ])
  ; ("03.xml", `Fire
       (None, Some (DirAbs (Num 270.)), Some (SpdAbs (Num 2.)), Indirect "rocket"))
  ; ("04.xml", `Action
       [ Repeat (Num 100., Direct [
            Fire (Direct (None, Some (DirAbs (
                Op (Add, Num 220., Op (Mul, Rand, Num 100.))
              )), None, Indirect "backBurst"))
          ; Wait (Num 6.)
          ])
       ])
  ; ("[Dodonpachi]_hibachi.xml"), `Bulletml (
      BulletML (NoDir,
                [ EAction
                    [ Fire
                        (Direct
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
                    ]
                ; EAction
                    [ ChangeDirection (DirAbs (Num 90.), Num 1.)
                    ; ChangeSpeed (SpdAbs (Num 1.), Num 1.)
                    ; Repeat
                        ( Num 25.
                        , Direct
                            [ Action (Indirect "allWay")
                            ; Wait (Num 3.)
                            ])
                    ]

                ; EAction
                    [ ChangeDirection (DirAbs (Num (-90.)), Num 1.)
                    ; ChangeSpeed (SpdAbs (Num 1.), Num 1.)
                    ; Repeat
                        ( Num 25.
                        , Direct
                            [ Action (Indirect "allWay")
                            ; Wait (Num 3.)
                            ])
                    ]

                ; EAction
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
                    ]
                ]))
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
        OUnit.assert_equal ~printer:Printer.print_bulletml b bspec
    in
    (n, `Quick, run_test)
  in
  List.map mk_test testspecs

let _ =
  Alcotest.run "BulletML" ["examples", tests ()]
