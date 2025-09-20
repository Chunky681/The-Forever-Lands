import { STORAGE_KEY, ECON, SIZES } from '../constants.js';

export const defaultState = {
  planet: { x: 0, y: 0, radius: SIZES.planet, level: 1 },
  territory: ECON.territory.base,
  moons: [],
  sats: [],
  money: ECON.startMoney,
  basalt: 0,
  energy: 0,
  lastProd: Date.now(),
  lastFrame: Date.now(),
  cam: { x: -innerWidth/2, y: -innerHeight/2, zoom: 1 },
  placing: null,
  selected: null,
  ships: { drone:0, battle:0 },
  queue: [],
  missions: [],
  sendingFleet: null,
  stars: [],
  scraps: [],
  selectedScrapId: null
};

export function load(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null } catch { return null } }
export function save(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

export const state = load() || structuredClone(defaultState);
