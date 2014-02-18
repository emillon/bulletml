open Bulletml

let parse_string s = 
  let x = Xml.parse_string s in
  print_endline (Xml.to_string_fmt x)

let parse_expr s :expr =
  let open MParser in
  let app op x y = Op (op, x, y) in
  let infix sym f assoc = Infix (Tokens.skip_symbol sym >> return (app f), assoc) in
  let operators:(('a, 's) operator list) list =
    [ [ infix "*" Mul Assoc_left
      ; infix "/" Div Assoc_left
      ; infix "%" Mod Assoc_left
      ]
    ; [ infix "+" Add Assoc_left
      ; infix "-" Sub Assoc_left
      ]] in
  let num =
    Tokens.decimal >>= fun n ->
    return (Num (float n))
  in
  let rand =
    string "$rand" >>
    return Rand
  in
  let rec term s =
    choice [ Tokens.parens expr
           ; num
           ; rand
           ] s
  and expr s = MParser.expression operators term s in
  match parse_string expr s () with
  | Success x -> x
  | Failed (msg, _) ->
    failwith ("Parse error: " ^ msg)

let rec parse_fire nodes :fire =
  let name = ref None in
  let dir = ref None in
  let speed = ref None in
  let bullet = ref None in
  List.iter (function
      | Xml.Element ("bullet", _, ns) ->
        begin
          assert (!bullet = None);
          let b = parse_bullet ns in
          bullet := Some (Direct b)
        end
      | Xml.Element ("bulletRef", ["label", s], []) ->
        begin
          assert (!bullet = None);
          bullet := Some (Indirect s)
        end
      | Xml.Element ("direction", [("type", "absolute")], [Xml.PCData s]) ->
        begin
          assert (!dir = None);
          let az = parse_expr s in
          dir := Some (DirAbs az)
        end
      | Xml.Element ("speed", [], [Xml.PCData s]) ->
        begin
          assert (!speed = None);
          let sp = parse_expr s in
          speed := Some sp
        end
      | Xml.Element (s, _, _) -> failwith ("parse_fire: " ^ s)
      | Xml.PCData _ -> failwith "parse_fire: PCData"
    ) nodes;
  let bul = match !bullet with
    | Some b -> b
    | None -> assert false
  in
  (!name, !dir, !speed, bul)

and parse_action nodes :action =
  List.map (function
      | Xml.Element ("accel", _,
                     [ Xml.Element ("vertical", _, [Xml.PCData s_vert])
                     ; Xml.Element ("term", _,     [Xml.PCData s_term])
                     ]) ->
        let vert = parse_expr s_vert in
        let term = parse_expr s_term in
        Accel (None, Some vert, term)
      | Xml.Element ("changeSpeed", _,
                     [ Xml.Element ("speed", _, [Xml.PCData s_speed])
                     ; Xml.Element ("term",  _, [Xml.PCData s_term])
                     ]) ->
        let speed = parse_expr s_speed in
        let term = parse_expr s_term in
        ChangeSpeed (speed, term)
      | Xml.Element ("wait", _, [Xml.PCData s]) ->
        let t = parse_expr s in
        Wait t
      | Xml.Element ("fire", _, ns) ->
        let f = parse_fire ns in
        Fire f
      | Xml.Element ("vanish", [], []) ->
        Vanish
      | Xml.Element ("repeat", [],
                     [ Xml.Element ("times", _, [Xml.PCData s_times])
                     ; Xml.Element ("action", [], ns)
                     ]) ->
        let times = parse_expr s_times in
        let act = parse_action ns in
        Repeat (times, Direct act)
      | Xml.Element (name, _, _) ->
        failwith ("parse_action: " ^ name)
      | Xml.PCData _ ->
        failwith "parse_action: PCData"
    ) nodes

and parse_bullet nodes :bullet =
  let dir = ref None in
  let speed = ref None in
  let acts = ref [] in
  List.iter (function
      | Xml.Element ("direction", [], [Xml.PCData s]) ->
        begin
          assert (!dir = None);
          dir := Some (DirDefault (parse_expr s))
        end
      | Xml.Element ("speed", _, [Xml.PCData s]) ->
        begin
          assert (!speed = None);
          speed := Some (parse_expr s)
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
