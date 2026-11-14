<script setup lang="ts">
import type { Batch, Immutable, Item, Plot, Soil } from "../../../shared/contracts";
import { items } from "../../../shared/catalog";
import { crops, ready, familyNames, stageNames, stageOf } from "../lib/crops";
import { organicEligible, qualityOf, fatigueText } from "../lib/soil";
defineProps<{
  plots: readonly Immutable<Plot>[];
  soils: readonly Immutable<Soil>[];
  selected: Item;
  active: number;
  fertilizers: readonly Readonly<Batch>[];
  free: (id: string) => number;
}>();
defineEmits<{
  select: [item: Item];
  plant: [id: number];
  water: [id: number];
  harvest: [id: number];
  clear: [id: number];
  fertilize: [batch: Readonly<Batch>];
  buyFertilizer: [];
}>();
const seeds: Item[] = ["carrot", "corn", "berry"];
const npk = (soil: Immutable<Soil>) => [
  { key: "氮", value: soil.n },
  { key: "磷", value: soil.p },
  { key: "钾", value: soil.k },
  { key: "有机质", value: soil.organic },
];
</script>
<template>
  <section class="panel seed-panel">
    <div class="panel-heading">
      <h2>土地与种植</h2>
      <span>轮作养地 · 12 块田</span>
    </div>
    <div class="seed-list">
      <button
        v-for="item in seeds"
        :key="item"
        :class="{ selected: selected === item }"
        @click="$emit('select', item)"
      >
        <b>{{ items[item].icon }}</b><strong>{{ items[item].name }}</strong
        ><small
          >{{ familyNames[crops[item]!.family] }} ·
          {{ crops[item]?.duration }}h · ¥{{ crops[item]?.cost }}</small
        >
      </button>
    </div>
    <template v-if="soils[active]">
      <div class="soil-grid">
        <div v-for="cell in npk(soils[active]!)" :key="cell.key" class="soil-cell">
          {{ cell.key }}<strong>{{ Math.round(cell.value) }}</strong
          ><span class="bar"><i :style="{ width: `${cell.value}%` }"></i></span>
        </div>
      </div>
      <p class="soil-note">
        {{ fatigueText(soils[active]!) }} · 连续有机
        {{ soils[active]!.organicStreak }} 轮<template
          v-if="soils[active]!.lastFamily"
          >· 上轮 {{ familyNames[soils[active]!.lastFamily!] }}</template
        >
      </p>
    </template>
    <div class="plot-details">
      <strong>土地 {{ active + 1 }}</strong
      ><template v-if="plots[active]?.crop"
        ><span
          >{{ stageNames[stageOf(plots[active]!.crop!)] }} · 生长
          {{ plots[active]!.crop!.growth.toFixed(1) }} /
          {{ crops[plots[active]!.crop!.item]?.duration }}h · 水分
          {{ plots[active]!.crop!.water }}% · 养分亏欠
          {{ plots[active]!.crop!.deficit.toFixed(1) }}<br />
          预计
          {{ "★".repeat(qualityOf(plots[active]!.crop!, soils[active]!)) }}
          <em
            v-if="organicEligible(soils[active]!, plots[active]!.crop!)"
            class="tag"
            >有机</em
          ><em v-else-if="plots[active]!.crop!.chemical" class="tag chem"
            >化肥</em
          >
          · 堆肥 ×{{ plots[active]!.crop!.composts }}</span
        ><button @click="$emit('water', active)">浇水 +</button
        ><button
          :disabled="!ready(plots[active]!.crop!)"
          @click="$emit('harvest', active)"
        >
          收获作物</button
        ><button @click="$emit('clear', active)">铲除</button></template
      ><template v-else
        ><span
          >翻好的土地，等待新种子<template v-if="plots[active]?.pending"
            >（已施基肥 {{ plots[active]!.pending!.inputs.length }} 次<em
              v-if="plots[active]!.pending!.chemical"
              class="tag chem"
              >化肥</em
            >）</template
          ></span
        ><button class="primary" @click="$emit('plant', active)">
          播种 {{ items[selected].name }}
        </button></template
      >
    </div>
    <div class="fertilize-row">
      <button
        v-for="b in fertilizers"
        :key="b.id"
        :disabled="!free(b.id)"
        @click="$emit('fertilize', b)"
      >
        施 {{ items[b.item].name }} {{ b.id }}<small>（余 {{ free(b.id) }}）</small>
      </button>
      <button @click="$emit('buyFertilizer')">
        买化肥 ¥12<small>（2 份）</small>
      </button>
      <small class="fertilize-hint"
        >肥效按配方入土，与品质无关 · 化肥会失去有机资格</small
      >
    </div>
  </section>
</template>
