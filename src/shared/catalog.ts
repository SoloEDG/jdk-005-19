import type { Item } from "./contracts";
export const items: Record<
  Item,
  { name: string; icon: string; life: number; value: number }
> = {
  carrot: { name: "胡萝卜", icon: "🥕", life: 72, value: 8 },
  corn: { name: "玉米", icon: "🌽", life: 96, value: 12 },
  berry: { name: "蓝莓", icon: "🫐", life: 48, value: 15 },
  jam: { name: "莓果酱", icon: "🫙", life: 120, value: 40 },
  flour: { name: "玉米粉", icon: "🌾", life: 120, value: 32 },
  residue: { name: "秸秆残渣", icon: "🍂", life: 96, value: 1 },
  compost: { name: "堆肥", icon: "🪱", life: 240, value: 6 },
  fertilizer: { name: "化肥", icon: "🧪", life: 720, value: 10 },
};
export const itemName = (item: Item) => items[item].name;
export const hourLabel = (hour: number) =>
  `第${Math.floor(hour / 24) + 1}天 ${String(hour % 24).padStart(2, "0")}:00`;
