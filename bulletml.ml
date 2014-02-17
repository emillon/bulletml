type speed = int

type direction = int

type 'a id = string

type 'a ind =
  | Direct of 'a
  | Indirect of 'a id

type subaction =
  | Repeat
  | Fire of fire
  | FireRef
  | ChangeSpeed
  | ChangeDirection
  | Accel
  | Wait
  | Vanish
  | Action
  | ActionRef

and action = subaction list

and bullet = Bullet of string * direction option * action ind list

and fire = string option * direction option * speed option * bullet ind

type hv = NoDir | Horizontal | Vertical

type elem =
  | EBullet of bullet
  | EAction of action
  | EFire of fire

type t = BulletML of hv * elem list
