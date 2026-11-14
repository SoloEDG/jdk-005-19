import type {
  Crop,
  Immutable,
  Family,
  Item,
  Nutrients,
  Soil,
  Weather,
} from "../../../shared/contracts";
export const clamp = (v: number) => Math.max(0, Math.min(100, v));
export interface CropDef {
  cost: number;
  duration: number;
  yield: number;
  repeat: number;
  family: Family;
  /** 三个生长阶段（苗期 / 生长期 / 结实期）每小时消耗的氮磷钾 */
  stages: [Nutrients, Nutrients, Nutrients];
}
export const crops: Partial<Record<Item, CropDef>> = {
  carrot: {
    cost: 5,
    duration: 12,
    yield: 3,
    repeat: 0,
    family: "root",
    stages: [
      { n: 0.4, p: 0.2, k: 0.2 },
      { n: 0.6, p: 0.3, k: 0.3 },
      { n: 0.3, p: 0.4, k: 0.7 },
    ],
  },
  corn: {
    cost: 9,
    duration: 18,
    yield: 4,
    repeat: 1,
    family: "grass",
    stages: [
      { n: 0.5, p: 0.3, k: 0.2 },
      { n: 0.8, p: 0.4, k: 0.4 },
      { n: 0.4, p: 0.5, k: 0.6 },
    ],
  },
  berry: {
    cost: 12,
    duration: 24,
    yield: 3,
    repeat: 2,
    family: "shrub",
    stages: [
      { n: 0.4, p: 0.3, k: 0.3 },
      { n: 0.5, p: 0.5, k: 0.5 },
      { n: 0.3, p: 0.6, k: 0.8 },
    ],
  },
};
export const familyNames: Record<Family, string> = {
  root: "根菜类",
  grass: "禾谷类",
  shrub: "浆果类",
};
export const stageNames = ["苗期", "生长期", "结实期"];
/** 肥料配方：每份按真实氮磷钾与有机质入土，与批次品质无关 */
export const fertilizers: Partial<
  Record<Item, { npk: Nutrients; organic: number; chemical: boolean }>
> = {
  compost: { npk: { n: 6, p: 4, k: 4 }, organic: 8, chemical: false },
  fertilizer: { npk: { n: 12, p: 6, k: 6 }, organic: -4, chemical: true },
};
export function stageOf(crop: Immutable<Crop>) {
  const duration = crops[crop.item]?.duration ?? 1;
  return Math.min(2, Math.floor((crop.growth / duration) * 3));
}
export function grow(
  crop: Immutable<Crop>,
  soil: Immutable<Soil>,
  weather: Weather,
  hours: number,
): { crop: Crop; soil: Soil } {
  const def = crops[crop.item]!;
  const fatigue = soil.fatigue[def.family];
  const evap = weather === "rain" ? 15 : soil.organic >= 40 ? -6 : -8;
  const water = clamp(crop.water + evap * hours);
  const rate =
    (water > 0 ? (weather === "wind" ? 0.6 : 1) : 0.15) * (1 - 0.15 * fatigue);
  const growth = crop.growth + hours * rate;
  const need =
    def.stages[Math.min(2, Math.floor((growth / def.duration) * 3))];
  const mult = hours * (1 + 0.25 * fatigue);
  const next: Soil = { ...soil, fatigue: { ...soil.fatigue } };
  let deficit = crop.deficit;
  for (const key of ["n", "p", "k"] as const) {
    const want = need[key] * mult;
    const taken = Math.min(next[key], want);
    next[key] = clamp(next[key] - taken);
    deficit += want - taken;
  }
  return {
    crop: {
      ...crop,
      water,
      growth,
      stress: crop.stress + (water === 0 ? hours : 0),
      deficit,
      inputs: [...crop.inputs],
    },
    soil: next,
  };
}
export function ready(crop: Immutable<Crop>) {
  return crop.growth >= (crops[crop.item]?.duration ?? Infinity);
}
