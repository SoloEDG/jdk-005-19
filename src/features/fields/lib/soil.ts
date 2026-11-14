import type { Crop, Family, Immutable, Soil } from "../../../shared/contracts";
import { clamp, familyNames } from "./crops";
/** 旧田块迁移与新农场共用的默认健康土壤 */
export function defaultSoil(): Soil {
  return {
    n: 70,
    p: 70,
    k: 70,
    organic: 50,
    fatigue: { root: 0, grass: 0, shrub: 0 },
    lastFamily: null,
    organicStreak: 0,
  };
}
const clampFatigue = (v: number) => Math.max(0, Math.min(3, v));
/** 一轮作物结束：同科疲劳累积，换科轮作让地力恢复 */
export function endRound(
  soil: Immutable<Soil>,
  family: Family,
  chemical: boolean,
): Soil {
  const fatigue = { ...soil.fatigue };
  for (const f of Object.keys(fatigue) as Family[])
    fatigue[f] = clampFatigue(fatigue[f] + (f === family ? 1 : -1));
  return {
    ...soil,
    fatigue,
    lastFamily: family,
    organicStreak: chemical ? 0 : soil.organicStreak + 1,
  };
}
/** 有机资格：本轮未用化肥、地块已连续有机种植、本轮施过堆肥 */
export function organicEligible(
  soil: Immutable<Soil>,
  crop: Immutable<Crop>,
): boolean {
  return !crop.chemical && soil.organicStreak >= 1 && crop.composts >= 1;
}
/** 品质由整轮累计亏欠决定，最后一刻施肥无法抹去已受损的部分 */
export function qualityOf(crop: Immutable<Crop>, soil: Immutable<Soil>): number {
  return crop.stress <= 2 && crop.deficit <= 3 && soil.organic >= 25 ? 2 : 1;
}
export function fatigueText(soil: Immutable<Soil>): string {
  const entries = Object.entries(soil.fatigue) as [Family, number][];
  const max = Math.max(...entries.map(([, v]) => v));
  if (max <= 0) return "地力均衡";
  const family = entries.find(([, v]) => v === max)![0];
  return `${familyNames[family]}连作疲劳 ${"▮".repeat(max)}`;
}
export { clamp };
