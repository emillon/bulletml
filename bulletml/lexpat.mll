{
open Parsepat
}

rule token = parse
| eof { EOF }
