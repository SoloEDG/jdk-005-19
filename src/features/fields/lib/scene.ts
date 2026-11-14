import type { Immutable, Plot, Soil } from "../../../shared/contracts";
import { crops } from "./crops";
export function growthStage(plot: Immutable<Plot>) {
  if (!plot.crop) return 0;
  return Math.min(
    3,
    1 + Math.floor(plot.crop.growth / (crops[plot.crop.item]!.duration / 3)),
  );
}
export function soilWorn(soil: Immutable<Soil>) {
  const tired = Math.max(...Object.values(soil.fatigue)) >= 2;
  return (soil.n + soil.p + soil.k) / 3 < 35 || soil.organic < 25 || tired;
}
export const sceneTrees = Array.from({ length: 8 }, (_, i) => ({
  left: `${i * 13 + 1}%`,
  top: `${i % 2 ? 4 : 0}px`,
  scale: 1 + (i % 3) * 0.12,
}));
