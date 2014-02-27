open Syntax

type position = (float * float)

type 'a table = ('a id * 'a) list

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
  | OpCall of string * expr list

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

type env =
  { frame : int
  ; ship_pos : (float * float)
  ; screen_w : int
  ; screen_h : int
  ; actions : action table
  ; bullets : bullet table
  ; fires : fire table
  }

type init_params =
  { p_ship : position
  ; p_enemy : position
  ; p_screen_w : int
  ; p_screen_h : int
  }

type ('g, 'l, 'r) interpreter =
  { make_global_ctx : unit -> 'g
  ; make_local_ctx : 'g -> 'l
  ; clear : 'l -> unit
  ; draw : 'l -> obj -> unit
  ; run_cont : 'l -> (unit -> 'r) -> 'r
  }
