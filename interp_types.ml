open Syntax

type position = (float * float)

type 'a env = ('a id * 'a) list

type 'a linear_map =
  { frame_start : int
  ; frame_end : int
  ; val_start : 'a
  ; val_end : 'a
  }

type opcode =
  | OpRepeatE of expr * action
  | OpWaitE of expr
  | OpWaitN of int
  | OpFire of fire
  | OpSpdE of speed * expr
  | OpSpdN of float linear_map
  | OpDirE of direction * expr
  | OpDirN of float linear_map
  | OpAccelE of expr * expr * expr
  | OpAccelN of (float * float) linear_map
  | OpVanish

type obj =
  { prog : opcode list
  ; speed : float
  ; dir : float
  ; children : obj list
  ; pos : position
  ; prev_dir : float
  ; prev_speed : float
  ; vanished : bool
  }

type state =
  { frame : int
  ; ship_pos : (float * float)
  ; screen_w : int
  ; screen_h : int
  ; action_env : action env
  ; bullet_env : bullet env
  ; fire_env : fire env
  ; main : obj
  }
