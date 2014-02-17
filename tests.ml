let tests () =
    let ex01 () =
        let x = Xml.parse_file "examples/01.xml" in
        let s = Xml.to_string_fmt x in
        print_endline s
    in
    [ ("01.xml", `Quick, ex01) ]


let _ =
    Alcotest.run "BulletML" ["examples", tests ()]
