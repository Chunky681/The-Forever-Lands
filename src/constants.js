export const STORAGE_KEY = 'planetforge:v7';

export const ECON = {
  startMoney: 20000,
  moonCost: 100,
  satCost: 120,
  upgrade: { moonBase: 75, satBase: 90, planetBase: 500, mult: 1.5, planetMult: 1.4 },
  sellUnit: { basalt: 1, energy: 1.2 },
  territory: { base: 200, perLevel: 50, maxLevel: 10 },
  maxLevel: 10,
  ships: {
    drone:  { cost:25,  build:1.0, speed:180, cap:8 },
    battle: { cost:100, build:2.0, speed:120, cap:20 }
  },
  collectionSeconds: 60
};

export const SIZES = { planet: 32, moon: 10, sat: 8 }; // world units
export const ORBIT = { min: 60, gap: 24, speedBase: 0.35 };
export const STAR_COLORS = ['#ffffff','#ffd9a5','#a5c9ff','#fff8d1','#d1e0ff'];
