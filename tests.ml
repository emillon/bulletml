let testspecs =
  let open Bulletml in
  [ ("01.xml", `Bullet (
       Bullet (Some (DirDefault (Num 270.)), Some (Num 2.), [
           Direct [Accel (None, Some (Num 3.), Num 120.)]
         ]
         )))
  ; ("02.xml", `Action
       [ ChangeSpeed (Num 0., Num 60.)
       ; Wait (Num 60.)
       ; Fire (None, None, None, Direct (Bullet (None, None, [])))
       ; Fire (None, Some (DirAbs (
           Op (Add, Num 330., Op (Mul, Rand, Num 25.))
         )), None, Indirect "downAccel")
       ; Vanish
       ])
  ; ("03.xml", `Fire
       (None, Some (DirAbs (Num 270.)), Some (Num 2.), Indirect "rocket"))
  ; ("04.xml", `Action
       [ Repeat (Num 100., Direct [
            Fire (None, Some (DirAbs (
                Op (Add, Num 220., Op (Mul, Rand, Num 100.))
              )), None, Indirect "backBurst")
          ; Wait (Num 6.)
          ])
       ])
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
        let b = Parser.parse_bullet x in
        OUnit.assert_equal b bspec
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
    in
    (n, `Quick, run_test)
  in
  List.map mk_test testspecs

let _ =
  Alcotest.run "BulletML" ["examples", tests ()]
