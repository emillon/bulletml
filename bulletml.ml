type op =
  | Add
  | Sub
  | Mul
  | Div
  | Mod

type expr =
  | Num of float
  | Op of op * expr * expr
  | Param of int
  | Rand
  | Rank

type speed = expr

type direction =
  | DirAbs of expr
  | DirDefault of expr

type 'a id = string

type 'a ind =
  | Direct of 'a
  | Indirect of 'a id

type subaction =
  | Repeat of expr * action ind
  | Fire of fire
  | FireRef
  | ChangeSpeed of expr * expr
  | ChangeDirection
  | Accel of expr option * expr option * expr
  | Wait of expr
  | Vanish
  | Action
  | ActionRef

and action = subaction list

and bullet = Bullet of direction option * speed option * action ind list

and fire = string option * direction option * speed option * bullet ind

type hv = NoDir | Horizontal | Vertical

type elem =
  | EBullet of bullet
  | EAction of action
  | EFire of fire

type t = BulletML of hv * elem list
