// src/state.ts
import { STORAGE_KEY, ECON, SIZES } from './constants';

export type State = any; // keep your original looseness

export type ShipType = 'drone' | 'battle';

/** NEW: recruitment slot shape (used by the recruitment UI/engine) */
export interface RecruitmentSlot {
  id: string;
  type: ShipType;
  remaining: number; // units still to produce
  unitTime: number;  // seconds per unit
  unitCost: number;  // money paid up-front per unit (for display)
  progress: number;  // accumulated seconds toward next unit
}

export const defaultState: State = {
  planet: { x: 0, y: 0, radius: SIZES.planet, level: 1 },
  territory: ECON.territory.base,

  moons: [],
  sats: [],

  money: ECON.startMoney,
  basalt: 0,
  energy: 0,

  lastProd: Date.now(),
  lastFrame: Date.now(),

  cam: { x: -innerWidth / 2, y: -innerHeight / 2, zoom: 1 },

  placing: null,
  selected: null,

  ships: { drone: 0, battle: 0 },

  queue: [],                 // keep existing queue
  missions: [],
  sendingFleet: null,
  stars: [],
  scraps: [],
  selectedScrapId: null,

  /** NEW: recruitment slots array */
  recruitment: [] as RecruitmentSlot[],
};

export function load(): State | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)!) || null; }
  catch { return null; }
}
export function save(state: State) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const state: State = (load() || structuredClone(defaultState));
