open Bulletml

let parse_string s = 
    let x = Xml.parse_string s in
    print_endline (Xml.to_string_fmt x)

let parse_action nodes :action=
    List.map (function
        | Xml.Element ("accel", _,
                [ Xml.Element ("vertical", _, [Xml.PCData s_vert])
                ; Xml.Element ("term", _,     [Xml.PCData s_term])
                ]) ->
            let vert = int_of_string s_vert in
            let term = int_of_string s_term in
            Accel (None, Some vert, term)
        | _ -> assert false
    ) nodes

let parse_bullet nodes =
    let dir = ref None in
    let speed = ref None in
    let acts = ref [] in
    List.iter (function
        | Xml.Element ("direction", _, [Xml.PCData s]) ->
                begin
                    assert (!dir = None);
                    dir := Some (int_of_string s)
                end
        | Xml.Element ("speed", _, [Xml.PCData s]) ->
                begin
                    assert (!speed = None);
                    speed := Some (int_of_string s)
                end
        | Xml.Element ("action", _, ns) ->
                let a = parse_action ns in
                acts := (Direct a) :: !acts
        | _ -> assert false
    ) nodes;
    Bullet (!dir, !speed, List.rev !acts)

let parse_bullet = function
    | Xml.Element ("bullet", _, ns) -> parse_bullet ns
    | _ -> assert false

let read_stdin () =
    let b = Buffer.create 0 in
    begin
        try
            while true do
                let l = read_line () in
                Buffer.add_string b l;
                Buffer.add_char b '\n'
            done
        with End_of_file -> ()
    end;
    Buffer.contents b

let parse_stdin () =
    let s = read_stdin () in
    parse_string s
