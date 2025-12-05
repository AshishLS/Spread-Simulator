export type GameStatus = 'IDLE' | 'RUNNING' | 'FINISHED';

export interface SimulationConfig {
  boxCount: number;
  speed: number;
}

export interface SimulationStats {
  infectedCount: number;
  elapsedTime: number;
}

export const ARENA_WIDTH = 40;
export const ARENA_DEPTH = 40;
export const BOX_SIZE = 1;
export const WALL_HEIGHT = 2;
