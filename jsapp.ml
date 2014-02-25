open Bulletml.Syntax

let pat =
  BulletML (NoDir,
            [ EBullet ("fast",
                       Bullet (None, Some (SpdAbs (Num 10.)), [ Direct (
                           [ Wait (Num 6.)
                           ; ChangeSpeed (SpdAbs (Num 0.), Num 1.)
                           ; Wait (Num 20.)
                           ; Repeat ((Num 10. +@ Rank *@ Num 18.), Direct (
                               [ Fire (Direct (( Some (DirSeq (((~@ (Num 11.)) -@ Rand *@ Num 2.)))
                                               , Some (SpdAbs (Num 1.5))
                                               , Direct bulletDefault)))
                               ; Action (Indirect ("add3", []))
                               ; Repeat (Num 4., Direct (
                                   [ Fire (Direct (( Some (DirSeq (Num 0.))
                                                   , Some (SpdSeq ((Num 0.1 +@ (Rank *@ Num 0.2))))
                                                   , Direct bulletDefault)))
                                   ; Action (Indirect ("add3", []))
                                   ]))
                               ; Wait ((Num 336. /@ (Num 10. +@ Rank *@ Num 18.)))]))
                           ; Vanish
                           ])]))
            ; EAction ("add3",
                       [ Repeat (Num 3., Direct ([Fire (Direct (( Some (DirSeq (Num 90.))
                                                                , Some (SpdSeq (Num 0.))
                                                                , Direct bulletDefault)))]))
                       ])
            ; EFire ("slowColorChange",
                     ( Some (DirAbs ((Num 180. +@ Num 45. *@ Param 1)))
                     , Some (SpdAbs (Num 7.))
                     , Direct (Bullet (None, None, [Direct (
                         [ Wait (Num 6.)
                         ; ChangeSpeed (SpdAbs (Num 0.), Num 1.)
                         ; Repeat ((Num 50. +@ Rank *@ Num 50.), Direct (
                             [ Fire (Direct (( Some (DirSeq (((Num 8. -@ Rank *@ Num 4.) *@ Param 1)))
                                             , Some (SpdAbs (Num 1.2))
                                             , Direct bulletDefault)))
                             ; Action (Indirect ("add3", []))
                             ; Wait (((Num 8. -@ Rank *@ Num 4.) +@ Rand))
                             ]))
                         ; Vanish
                         ])]))))
            ; EFire ("slow",
                     ( None
                     , None
                     , Direct (Bullet (None, None, [Direct (
                         [ Fire (Indirect ("slowColorChange", [Param 1]))
                         ; Vanish
                         ])]))))
            ; EAction ("top",
                       [ Fire (Direct ((Some (DirAbs (~@ (Num 85.))), None, Indirect ("fast", []))))
                       ; Wait (Num 1.)
                       ; Fire (Direct ((Some (DirAbs (Num 85.)), None, Indirect ("fast", []))))
                       ; Wait (Num 1.)
                       ; Fire (Indirect ("slow", [Num (1.)]))
                       ; Wait (Num 1.)
                       ; Fire (Indirect ("slow", [~@ (Num 1.)]))
                       ; Wait (Num 430.)
                       ])
            ])

let main () =
  let dom = Dom_html.window##document in
  let c = Dom_html.createCanvas dom in
  ()

let _ = main ()
