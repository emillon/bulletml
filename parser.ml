open Bulletml

let parse_string s = 
  let x = Xml.parse_string s in
  print_endline (Xml.to_string_fmt x)

let parse_expr s :expr =
  let open MParser in
  let app op x y = Op (op, x, y) in
  let infix sym f assoc = Infix  (Tokens.skip_symbol sym >> return (app f), assoc) in
  let prefix sym f      = Prefix (Tokens.skip_symbol sym >> return f) in
  let operators:(('a, 's) operator list) list =
    [ [ prefix "-" (fun x -> Op (Sub, Num 0., x)) ]
    ; [ infix "*" Mul Assoc_left
      ; infix "/" Div Assoc_left
      ; infix "%" Mod Assoc_left
      ]
    ; [ infix "+" Add Assoc_left
      ; infix "-" Sub Assoc_left
      ]
    ] in
  let mknum sign n = match sign with
    | Some '-' -> float (-n)
    | None -> float n
    | _ -> assert false
  in
  let num =
    option (char '-') >>= fun sign ->
    Tokens.decimal >>= fun n ->
    return (Num (mknum sign n))
  in
  let mknum_float sign n = match sign with
    | Some '-' -> (-. n)
    | None -> (n)
    | _ -> failwith "error in float"
  in
  let float_num =
    option (char '-') >>= fun sign ->
    Tokens.float >>= fun n ->
    return (Num (mknum_float sign ( n)))
  in
  let rand = string "$rand" >> return Rand in
  let rank = string "$rank" >> return Rank in
  let param =
    char '$' >>
    Tokens.decimal >>= fun n ->
    return (Param n)
  in
  let rec term s =
    (spaces >> choice
       [ Tokens.parens expr
       ; attempt float_num
       ; num
       ; rand
       ; rank
       ; param
       ]) s
  and expr s = MParser.expression operators term s in
  match parse_string expr s () with
  | Success x -> x
  | Failed (msg, _) ->
    failwith ("Parse error: " ^ msg)

let print_attrs attrs =
  Printer.print_list (fun (x, y) -> x^"="^y) attrs

let fail_parse msg = function
  | Xml.Element (s, attrs, _) ->
    failwith (msg ^ ": " ^ s ^ " (attrs: " ^ print_attrs attrs ^ ")")
  | Xml.PCData _ -> failwith (msg ^ ": PCData")

let interp_dir x = function
  | [(("type"|"TYPE"), "absolute")] -> DirAbs x
  | [(("type"|"TYPE"), "sequence")] -> DirSeq x
  | [(("type"|"TYPE"), "relative")] -> DirRel x
  | [(("type"|"TYPE"), "aim")]
  | [] -> DirAim x
  | a -> failwith ("interp_dir: " ^ print_attrs a)

let interp_speed x = function
  | [("TYPE", "sequence")] -> SpdSeq x
  | [("TYPE", "absolute")]
  | [] -> SpdAbs x
  | [("TYPE", "relative")] -> SpdRel x
  | a -> failwith ("interp_speed: " ^ print_attrs a)

let parse_params = List.map (function
    | Xml.Element ("param", [], [Xml.PCData s]) ->
      parse_expr s
    | _ -> failwith "parse_params"
  )

let rec parse_fire nodes :fire =
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
      | Xml.Element ("bulletRef", [("label" | "LABEL"), s], ns) ->
        begin
          assert (!bullet = None);
          let params = parse_params ns in
          bullet := Some (Indirect (s, params))
        end
      | Xml.Element ("direction", attrs, [Xml.PCData s]) ->
        begin
          assert (!dir = None);
          let az = parse_expr s in
          dir := Some (interp_dir az attrs)
        end
      | Xml.Element ("speed", attrs, [Xml.PCData s]) ->
        begin
          assert (!speed = None);
          let sp = parse_expr s in
          speed := Some (interp_speed sp attrs)
        end
      | Xml.Element (s, attrs, _) ->
        failwith ("parse_fire: " ^ s ^ " (attrs: "^print_attrs attrs^")")
      | Xml.PCData _ -> failwith "parse_fire: PCData"
    ) nodes;
  let bul = match !bullet with
    | Some b -> b
    | None -> assert false
  in
  (!dir, !speed, bul)

and parse_action nodes :action =
  List.map (function
      | Xml.Element ("accel", _,
                     [ Xml.Element ("vertical", _, [Xml.PCData s_vert])
                     ; Xml.Element ("term", _,     [Xml.PCData s_term])
                     ]) ->
        let vert = parse_expr s_vert in
        let term = parse_expr s_term in
        Accel (None, Some vert, term)
      | Xml.Element ("changeSpeed", [],
                     [ Xml.Element ("speed", attrs, [Xml.PCData s_speed])
                     ; Xml.Element ("term", [], [Xml.PCData s_term])
                     ]) ->
        let speed = parse_expr s_speed in
        let term = parse_expr s_term in
        ChangeSpeed (interp_speed speed attrs, term)
      | Xml.Element ("wait", _, [Xml.PCData s]) ->
        let t = parse_expr s in
        Wait t
      | Xml.Element ("fire", _, ns) ->
        let f = parse_fire ns in
        Fire (Direct f)
      | Xml.Element ("fireRef", [("LABEL", l)], ns) ->
        let params = parse_params ns in
        Fire (Indirect (l, params))
      | Xml.Element ("vanish", [], _) ->
        Vanish
      | Xml.Element ("repeat", [],
                     [ Xml.Element ("times", _, [Xml.PCData s_times])
                     ; Xml.Element ("action", [], ns)
                     ]) ->
        let times = parse_expr s_times in
        let act = parse_action ns in
        Repeat (times, Direct act)
      | Xml.Element ("repeat", [],
                     [ Xml.Element ("times", _, [Xml.PCData s_times])
                     ; Xml.Element ("actionRef", [("LABEL", l)], ns)
                     ]) ->
        let times = parse_expr s_times in
        let p = parse_params ns in
        Repeat (times, Indirect (l, p))
      | Xml.Element ("changeDirection", [],
                     [Xml.Element ("direction", attrs, [Xml.PCData s_dir])
                     ;Xml.Element ("term", [], [Xml.PCData s_term])
                     ]) ->
        let dir = interp_dir (parse_expr s_dir) attrs in
        let term = parse_expr s_term in
        ChangeDirection (dir, term)
      | Xml.Element ("actionRef", [(("label"|"LABEL"), s)], ns) ->
        let params = parse_params ns in
        Action (Indirect (s, params))
      | x -> fail_parse "parse_action" x
    ) nodes

and parse_bullet nodes :bullet =
  let dir = ref None in
  let speed = ref None in
  let acts = ref [] in
  List.iter (function
      | Xml.Element ("direction", attrs, [Xml.PCData s]) ->
        begin
          assert (!dir = None);
          dir := Some (interp_dir (parse_expr s) attrs)
        end
      | Xml.Element ("speed", attrs, [Xml.PCData s]) ->
        begin
          assert (!speed = None);
          speed := Some (interp_speed (parse_expr s) attrs)
        end
      | Xml.Element ("action", _, ns) ->
        let a = parse_action ns in
        acts := (Direct a) :: !acts
      | Xml.Element ("actionRef", [("LABEL", l)], ns) ->
        let p = parse_params ns in
        acts := (Indirect (l, p)) :: !acts
      | x -> fail_parse "parse_bullet" x
    ) nodes;
  Bullet (!dir, !speed, List.rev !acts)

let parse_elems nodes =
  List.map (function
      | Xml.Element ("action", [(("label"|"LABEL"), l)], ns) ->
        let act = parse_action ns in
        EAction (l, act)
      | Xml.Element ("bullet", [(("label"|"LABEL"), l)], ns) ->
        let b = parse_bullet ns in
        EBullet (l, b)
      | Xml.Element ("fire", [(("label"|"LABEL"), l)], ns) ->
        let f = parse_fire ns in
        EFire (l, f)
      | x -> fail_parse "parse_elems" x
    ) nodes

let parse_xml = function
  | Xml.Element ("bulletml", attrs, ns) ->
    let elems = parse_elems ns in
    let dir = begin match attrs with
      | [] -> NoDir
      | [("XMLNS", _);("TYPE", "none")] -> NoDir
      | [("XMLNS", _);("TYPE", "vertical")] -> Vertical
      | [("XMLNS", _);("TYPE", "horizontal")] -> Horizontal
      | _ -> failwith ("parse_xml: attrs = " ^ print_attrs attrs ^ ")")
    end in
    BulletML (dir, elems)
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
