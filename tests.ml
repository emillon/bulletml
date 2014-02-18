let tests () =
    let res = Hashtbl.create 0 in
    let r01 =
        let open Bulletml in
        Bullet (Some 270, Some 2, [
            Direct [Accel (None, Some 3, 120)]
        ])
    in
    Hashtbl.add res "01.xml" r01;
    let ex01 () =
        let x = Xml.parse_file "examples/01.xml" in
        let s = Xml.to_string_fmt x in
        print_endline s;
        let b = Parser.parse_bullet x in
        OUnit.assert_equal (Hashtbl.find res "01.xml") b
    in
    [ ("01.xml", `Quick, ex01) ]

let _ =
    Alcotest.run "BulletML" ["examples", tests ()]
