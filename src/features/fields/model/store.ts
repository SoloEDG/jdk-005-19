import { reactive, readonly } from "vue";
import type {
  Batch,
  Crop,
  Item,
  Plot,
  Soil,
  Tick,
  Notice,
} from "../../../shared/contracts";
import { crops, grow, ready, fertilizers, clamp } from "../lib/crops";
import { defaultSoil, endRound, organicEligible, qualityOf } from "../lib/soil";
interface Ports {
  spend: (amount: number) => boolean;
  harvest: (item: Item, n: number, q: number, organic: boolean) => void;
  take: (batch: string, n: number) => Item | null;
}
export function createFields(ports: Ports, notice: Notice) {
  const state = reactive({
    plots: Array.from(
      { length: 12 },
      (_, id): Plot => ({ id, crop: null, pending: null }),
    ),
    soils: Array.from({ length: 12 }, (): Soil => defaultSoil()),
    selected: "carrot" as Item,
  });
  const finishRound = (id: number, crop: Crop) => {
    state.soils[id] = endRound(
      state.soils[id],
      crops[crop.item]!.family,
      crop.chemical,
    );
  };
  return {
    state: readonly(state),
    select: (item: Item) => {
      state.selected = item;
    },
    plant(id: number, hour: number) {
      const plot = state.plots[id],
        seed = crops[state.selected];
      if (!plot || plot.crop || !seed) return;
      if (!ports.spend(seed.cost)) {
        notice("资金不足，交付订单或出售库存后再试");
        return;
      }
      const pending = plot.pending;
      plot.crop = {
        item: state.selected,
        planted: hour,
        growth: 0,
        water: 70,
        stress: 0,
        harvests: 0,
        deficit: 0,
        chemical: pending?.chemical ?? false,
        composts: pending?.composts ?? 0,
        inputs: pending ? [...pending.inputs] : [],
      };
      plot.pending = null;
      if (state.soils[id].fatigue[seed.family] >= 2)
        notice("这块地连作疲劳，换一科种或堆肥养地吧");
      else notice("种下了新的希望");
    },
    water(id: number) {
      const c = state.plots[id]?.crop;
      if (c) c.water = 100;
    },
    fertilize(id: number, batch: Readonly<Batch>, hour: number) {
      const plot = state.plots[id];
      if (!plot) return;
      const def = fertilizers[batch.item];
      if (!def) {
        notice("这不是肥料，不能入土");
        return;
      }
      if (!ports.take(batch.id, 1)) {
        notice("这批肥料没有可用存量");
        return;
      }
      const soil = state.soils[id];
      soil.n = clamp(soil.n + def.npk.n);
      soil.p = clamp(soil.p + def.npk.p);
      soil.k = clamp(soil.k + def.npk.k);
      soil.organic = clamp(soil.organic + def.organic);
      const round =
        plot.crop ??
        (plot.pending ??= { chemical: false, composts: 0, inputs: [] });
      if (def.chemical) round.chemical = true;
      else round.composts++;
      round.inputs.push({ hour, batch: batch.id, item: batch.item });
      notice(
        def.chemical
          ? "化肥已入土，本轮作物将失去有机资格"
          : "堆肥已入土，土壤更松软了",
      );
    },
    clear(id: number) {
      const plot = state.plots[id];
      if (!plot?.crop) return;
      finishRound(id, plot.crop);
      plot.crop = null;
      notice("已铲除作物，施入的肥料不会退回");
    },
    harvest(id: number) {
      const plot = state.plots[id],
        crop = plot?.crop;
      if (!plot || !crop || !ready(crop)) return;
      const def = crops[crop.item]!,
        soil = state.soils[id],
        organic = organicEligible(soil, crop);
      ports.harvest(crop.item, def.yield, qualityOf(crop, soil), organic);
      ports.harvest("residue", 1, 1, organic);
      if (crop.harvests < def.repeat) {
        crop.growth = 0;
        crop.harvests++;
      } else {
        finishRound(id, crop);
        plot.crop = null;
      }
      notice(
        organic
          ? "有机收获已入仓，残渣可送工坊堆肥"
          : "收获已按品质分批入仓，残渣可堆肥",
      );
    },
    tick(tick: Tick) {
      const hours = tick.to - tick.from;
      for (let id = 0; id < state.plots.length; id++) {
        const plot = state.plots[id],
          soil = state.soils[id];
        if (plot.crop) {
          const r = grow(plot.crop, soil, tick.weather, hours);
          plot.crop = r.crop;
          r.soil.organic = clamp(r.soil.organic - 0.1 * hours);
          state.soils[id] = r.soil;
        } else if (soil.organic < 100)
          soil.organic = clamp(soil.organic + 0.05 * hours);
      }
    },
    snapshot: () => JSON.parse(JSON.stringify(state)) as typeof state,
    restore: (data: typeof state) => {
      Object.assign(state, data);
    },
  };
}
