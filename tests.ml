let testspecs =
    let open Bulletml in
    [ ("01.xml", `Bullet (
        Bullet (Some 270, Some 2, [
            Direct [Accel (None, Some 3, 120)]
            ]
        )))
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
        in
        (n, `Quick, run_test)
    in
    List.map mk_test testspecs

let _ =
    Alcotest.run "BulletML" ["examples", tests ()]
