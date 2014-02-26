
let testspecs =
  let open Bulletml.Syntax in
  [ ("fragments/01.xml", `Bullet ( (*{{{*)
       Bullet (Some (DirAim (Num 270.)), Some (SpdAbs (Num 2.)), [
           Direct [Accel (None, Some (Num 3.), Num 120.)]
         ]
         ))) (*}}}*)
  ; ("fragments/02.xml", `Action (*{{{*)
       [ ChangeSpeed (SpdAbs (Num 0.), Num 60.)
       ; Wait (Num 60.)
       ; Fire (Direct (None, None, Direct bulletDefault))
       ; Fire (Direct (Some (DirAbs (
           Num 330. +@ Rand *@ Num 25.
         )), None, Indirect ("downAccel", [])))
       ; Vanish
       ]) (*}}}*)
  ; ("fragments/03.xml", `Fire (*{{{*)
       (Some (DirAbs (Num 270.)), Some (SpdAbs (Num 2.)), Indirect ("rocket", []))
    ) (*}}}*)
  ; ("fragments/04.xml", `Action (*{{{*)
       [ Repeat (Num 100., Direct [
            Fire (Direct (Some (DirAbs (
                Num 220. +@ Rand *@ Num 100.
              )), None, Indirect ("backBurst", [])))
          ; Wait (Num 6.)
          ])
       ]) (*}}}*)
  ; ("[Dodonpachi]_hibachi.xml"), `Bulletml ( (* {{{ *)
      BulletML (NoDir,
                [ EAction ("allWay",
                           [ Fire
                               ( Direct
                                   ( Some (DirAim (Op (Add, ~@ (Num 50.), Op (Mul, Rand, Num 20.))))
                                   , Some (SpdAbs (Op (Add, Num 1., Rank)))
                                   , Direct bulletDefault
                                   )
                               )
                           ; Repeat
                               ( Op (Add, Num 15., Op (Mul, Op (Mul, Num 16., Rank), Rank))
                               , Direct
                                   [ Fire
                                       ( Direct
                                           ( Some (DirSeq (Op (Sub, Num 24., Op (Mul, Rank, Num 12.))))
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
                                   [ Action (Indirect ("allWay", []))
                                   ; Wait (Num 3.)
                                   ])
                           ])

                ; EAction ("left",
                           [ ChangeDirection (DirAbs (~@ (Num 90.)), Num 1.)
                           ; ChangeSpeed (SpdAbs (Num 1.), Num 1.)
                           ; Repeat
                               ( Num 25.
                               , Direct
                                   [ Action (Indirect ("allWay", []))
                                   ; Wait (Num 3.)
                                   ])
                           ])

                ; EAction ("top",
                           [ Repeat
                               ( Num 2.
                               , Direct
                                   [ Action (Indirect ("right", []))
                                   ; Action (Indirect ("left", []))
                                   ; Action (Indirect ("left", []))
                                   ; Action (Indirect ("right", []))
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
                                                 [ Action (Indirect ("shoot", []))
                                                 ; Wait (Num 16.)
                                                 ]))
                           ; ChangeSpeed (SpdAbs (Num 0.), Num 1.)
                           ; Wait (Num 120.)
                           ])
                ; EAction ("shoot",
                           [ Repeat (Num 1. +@ Num 63. *@ Rank, Direct
                                       [ Fire (Direct
                                                 ( Some (DirSeq (Num 360. /@ (Num 1. +@ Num 63. *@ Rank)))
                                                 , Some (SpdAbs (Num 1.28 +@ Num 0.08 *@ Rand))
                                                 , Indirect ("curve", [])
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
  ; ("[1943]_rolling_fire.xml", `Bulletml ( (* {{{ *)
      BulletML (Vertical,
                [ EAction ("top",
                           [ Fire (Direct (None, None, Indirect ("roll", [])))
                           ])
                ; EBullet ("roll",
                           Bullet (None , None, [ Direct
                                                    [ Wait (Num 40. +@ Rand *@ Num 20.)
                                                    ; ChangeDirection (DirRel
                                                                         (~@ (Num 90.)), Num 4.)
                                                    ; ChangeSpeed (SpdAbs (Num 3.), Num 4.)
                                                    ; Wait (Num 4.)
                                                    ; ChangeDirection (DirSeq (Num 15.), Num 9999.)
                                                    ; Wait (Num 80. +@ Rand *@ Num 40.)
                                                    ; Vanish
                                                    ]]))
                ]
               )))
  (* }}} *)
  ; ("[Dodonpachi]_kitiku_1.xml", `Bulletml ( (* {{{ *)
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
                ])
    ))
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
            let b = Bulletml.Parser.parse_bullet ns in
            OUnit.assert_equal b bspec
          | _ -> OUnit.assert_failure "not a bullet"
        end
      | `Action aspec ->
        begin match x with
          | Xml.Element ("action", [], ns) ->
            let a = Bulletml.Parser.parse_action ns in
            OUnit.assert_equal a aspec
          | _ -> OUnit.assert_failure "not an action"
        end
      | `Fire fspec ->
        begin match x with
          | Xml.Element ("fire", [], ns) ->
            let f = Bulletml.Parser.parse_fire ns in
            OUnit.assert_equal f fspec
          | _ -> OUnit.assert_failure "not a fire"
        end
      | `Bulletml bspec ->
        let b = Bulletml.Parser.parse_xml x in
        OUnit.assert_equal ~printer:Bulletml.Printer.print_bulletml bspec b
    in
    (n, `Quick, run_test)
  in
  List.map mk_test testspecs

let parse_example n =
  let x = Xml.parse_file ("examples/" ^ n) in
  Bulletml.Parser.parse_xml x

let for_all_examples f () =
  let files_a = (Sys.readdir "examples") in
  Array.sort String.compare files_a;
  let files =
    List.filter
      ((<>) "fragments")
      (Array.to_list files_a)
  in
  List.iter (fun n ->
      f n (parse_example n)
    ) files

let compile b =
  let open Bulletml.Syntax in
  let open Bulletml.Interp_types in
  let (ae, be, fe) = Bulletml.Interp.read_prog b in
  let top =
    try
      List.assoc "top" ae
    with Not_found -> List.assoc "top1" ae
  in
  let env =
    { frame = 0
    ; ship_pos = (100., 50.)
    ; screen_w = 200
    ; screen_h = 200
    ; actions = ae
    ; bullets = be
    ; fires = fe
    }
  in
  Bulletml.Interp.build_prog env [] (Action (Direct top))

let compspecs =
  let open Bulletml.Syntax in
  let open Bulletml.Interp_types in
  [ ("[1943]_rolling_fire.xml", [OpFire ((None, None, Indirect ("roll", [])))])
  ]

let tests_compile () =
  let printer ops = Bulletml.Printer.print_list Bulletml.Printer.print_opcode ops in
  let mk_test (n, spec) =
    let f () =
      let got =
        compile (parse_example n)
      in
      OUnit.assert_equal ~printer got spec;
    in
    (n, `Quick, f)
  in
  List.map mk_test compspecs

let parse_all =
  for_all_examples (fun _n _b -> ())

let compile_all =
  for_all_examples (fun n b ->
      try
        let _ops = compile b in ()
      with Not_found ->
        OUnit.assert_failure ("Cannot compile " ^ n)
    )

let _ =
  Alcotest.run "BulletML"
    [ ("parse", [("Parse examples", `Quick, parse_all)])
    ; ("pspec", tests ())
    ; ("comp", [("Compile examples", `Quick, compile_all)])
    ; ("cspec", tests_compile ())
    ]
