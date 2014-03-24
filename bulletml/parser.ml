open Syntax

let parse_label = function
  | [(("label"|"LABEL"), l)] -> l
  | _ -> assert false

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
  let number =
    let num x = Num x in
    regexp (make_regexp "-?\\d+(\\.\\d*)?\\s*") >>= fun s ->
    s |> String.trim |> float_of_string |> num |> return
  in
  let rand = string "$rand" >> spaces >> return Rand in
  let rank = string "$rank" >> spaces >> return Rank in
  let param =
    char '$' >>
    Tokens.decimal >>= fun n ->
    return (Param n)
  in
  let rec term s =
    (spaces >> choice
       [ Tokens.parens expr
       ; number
       ; rand
       ; rank
       ; param
       ]) s
  and expr s = (spaces >> MParser.expression operators term) s in
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

let rec map_maybe f = function
  | [] -> []
  | x::xs ->
    begin
      match f x with
      | Some y -> y::map_maybe f xs
      | None -> map_maybe f xs
    end

let from_some ?msg = function
  | Some x -> x
  | _ ->
    failwith ("from_some" ^ (match msg with None -> "" | Some x -> ": "^x))

let parse_sub_list p ns =
  map_maybe p ns

let parse_sub p ns =
  match parse_sub_list p ns with
  | [x] -> Some x
  | [] -> None
  | _ -> assert false

let p_expr_named name = function
  | Xml.Element (n, _, [Xml.PCData s]) when n = name ->
    Some (parse_expr s)
  | _ -> None

let p_speed = function
  | Xml.Element ("speed", attrs, [Xml.PCData s]) ->
    Some (interp_speed (parse_expr s) attrs)
  | _ -> None

let p_dir = function
  | Xml.Element ("direction", attrs, [Xml.PCData s]) ->
    Some (interp_dir (parse_expr s) attrs)
  | _ -> None

let p_ind name_dir name_ind parse_dir = function
  | Xml.Element (name, _, ns) when name = name_dir ->
    Some (Direct (parse_dir ns))
  | Xml.Element (name, attrs, ns) when name = name_ind ->
    let l = parse_label attrs in
    let p = parse_params ns in
    Some (Indirect (l, p))
  | _ -> None

let rec parse_fire nodes :fire =
  let bullet = parse_sub p_bullet nodes in
  let dir = parse_sub p_dir nodes in
  let speed = parse_sub p_speed nodes in
  (dir, speed, from_some ~msg:"parse_fire" bullet)

and parse_action nodes :action =
  List.map (function
      | Xml.Element ("accel", _, ns) ->
        let h = parse_sub (p_expr_named "horizontal") ns in
        let v = parse_sub (p_expr_named "vertical") ns in
        let t = parse_sub (p_expr_named "term") ns in
        Accel (h, v, from_some t)
      | Xml.Element ("changeSpeed", [], ns) ->
        let speed = parse_sub p_speed ns in
        let term = parse_sub (p_expr_named "term") ns in
        ChangeSpeed (from_some speed, from_some term)
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
      | Xml.Element ("repeat", [], ns) ->
        let times = parse_sub (p_expr_named "times") ns in
        let act = parse_sub p_action ns in
        Repeat (from_some times, from_some act)
      | Xml.Element ("changeDirection", [], ns) ->
        let dir = parse_sub p_dir ns in
        let term = parse_sub (p_expr_named "term") ns in
        ChangeDirection (from_some dir, from_some term)
      | Xml.Element ("actionRef", [(("label"|"LABEL"), s)], ns) ->
        let params = parse_params ns in
        Action (Indirect (s, params))
      | x -> fail_parse "parse_action" x
    ) nodes

and parse_bullet nodes :bullet =
  let dir = parse_sub p_dir nodes in
  let speed = parse_sub p_speed nodes in
  let acts = parse_sub_list p_action nodes in
  Bullet (dir, speed, acts)

and p_action ns = p_ind "action" "actionRef" parse_action ns

and p_bullet ns = p_ind "bullet" "bulletRef" parse_bullet ns

let parse_elems =
  List.map (function
      | Xml.Element (n, attrs, ns) ->
        let l = parse_label attrs in
        begin
          match n with
          | "action" -> EAction (l, parse_action ns)
          | "bullet" -> EBullet (l, parse_bullet ns)
          | "fire" -> EFire (l, parse_fire ns)
          | _ -> assert false
        end
      | x -> fail_parse "parse_elems" x
    )

let parse_xml = function
  | Xml.Element ("bulletml", attrs, ns) ->
    let elems = parse_elems ns in
    let dir = begin match attrs with
      | [] -> NoDir
      | [("TYPE", "none")] -> NoDir
      | [("XMLNS", _);("TYPE", "none")] -> NoDir
      | [("XMLNS", _);("TYPE", "vertical")] -> Vertical
      | [("XMLNS", _);("TYPE", "horizontal")] -> Horizontal
      | x -> failwith ("parse_xml: attrs = " ^ print_attrs attrs ^ ")")
    end in
    BulletML (dir, elems)
  | _ -> assert false
