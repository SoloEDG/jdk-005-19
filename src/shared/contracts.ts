export type Item =
  | "carrot"
  | "corn"
  | "berry"
  | "jam"
  | "flour"
  | "residue"
  | "compost"
  | "fertilizer";
export type Weather = "sun" | "rain" | "wind";
export type Family = "root" | "grass" | "shrub";
export interface Nutrients {
  n: number;
  p: number;
  k: number;
}
export interface FertilizerLog {
  hour: number;
  batch: string;
  item: Item;
}
export interface RoundInputs {
  chemical: boolean;
  composts: number;
  inputs: FertilizerLog[];
}
export interface Soil extends Nutrients {
  organic: number;
  fatigue: Record<Family, number>;
  lastFamily: Family | null;
  organicStreak: number;
}
export interface Crop {
  item: Item;
  planted: number;
  growth: number;
  water: number;
  stress: number;
  harvests: number;
  deficit: number;
  chemical: boolean;
  composts: number;
  inputs: FertilizerLog[];
}
export interface Plot {
  id: number;
  crop: Crop | null;
  pending: RoundInputs | null;
}
export interface Receipt {
  quality: number;
  sources: readonly string[];
  quantity: number;
  organic: boolean;
}
export interface Batch {
  id: string;
  item: Item;
  quantity: number;
  quality: number;
  source: string;
  expires: number;
  organic: boolean;
}
export interface Allocation {
  batch: string;
  quantity: number;
}
export interface Reservation {
  id: string;
  owner: string;
  allocations: Allocation[];
}
export interface Job {
  id: string;
  recipe: string;
  reservation: string;
  receipt?: Receipt;
  finish: number;
  status: "queued" | "ready" | "claimed" | "failed";
}
export interface Order {
  id: string;
  item: Item;
  quantity: number;
  reward: number;
  minQuality: number;
  deadline: number;
  status: "open" | "reserved" | "delivered" | "expired";
  reservation?: string;
  organic: boolean;
}
export interface Tick {
  from: number;
  to: number;
  weather: Weather;
}
export type Notice = (message: string) => void;
/** 深度只读视图，用于组件属性与纯函数参数 */
export type Immutable<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly (infer U)[]
    ? readonly Immutable<U>[]
    : T extends object
      ? { readonly [P in keyof T]: Immutable<T[P]> }
      : T;
