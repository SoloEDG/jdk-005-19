import { defaultSoil } from "../features/fields/lib/soil";
const key = "meadow-post-v1";
const version = 2;
export function saveFarm(data: unknown) {
  localStorage.setItem(key, JSON.stringify({ version, data }));
}
export function loadFarm<T>(): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { version: number; data: unknown };
  if (parsed.version === 1) return migrate(parsed.data) as T;
  if (parsed.version !== version || !parsed.data)
    throw new Error("存档版本不支持");
  return parsed.data as T;
}
/* v1 → v2：旧田块按默认健康土壤迁移，库存与订单补齐有机标记 */
function migrate(data: any) {
  const fields = data?.fields;
  if (fields?.plots && !fields.soils) {
    fields.soils = fields.plots.map(() => defaultSoil());
    for (const plot of fields.plots) {
      plot.pending = null;
      if (plot.crop)
        plot.crop = {
          deficit: 0,
          chemical: false,
          composts: 0,
          inputs: [],
          ...plot.crop,
        };
    }
  }
  for (const b of data?.warehouse?.batches ?? []) b.organic = b.organic ?? false;
  for (const o of data?.orders?.orders ?? []) o.organic = o.organic ?? false;
  return data;
}
