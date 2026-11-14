import type { Batch } from "../../../shared/contracts";
import { items } from "../../../shared/catalog";
export function makeBatch(
  item: Batch["item"],
  quantity: number,
  quality: number,
  hour: number,
  id: string,
  source = "收获",
  organic = false,
): Batch {
  return {
    id,
    item,
    quantity,
    quality,
    source,
    expires: hour + items[item].life,
    organic,
  };
}
export function summarize(batches: readonly Readonly<Batch>[]) {
  return batches.reduce((n, b) => n + b.quantity, 0);
}
