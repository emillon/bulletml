let parse_string s = 
    let x = Xml.parse_string s in
    print_endline (Xml.to_string_fmt x)

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

let _ =
    let s = read_stdin () in
    parse_string s
