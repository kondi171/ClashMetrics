<script setup>
import { computed } from "vue";

const props = defineProps({
  players: Array,
  getRankDisplay: Function,
  getPodiumClass: Function,
  formatWarValue: Function,
  getAvgClass: Function,
});

// Grupowanie rund w bloki sezonów dla nagłówka nadrzędnego[cite: 8]
const seasonHeaders = computed(() => {
  const wars = props.players[0]?.wars || [];
  const groups = [];
  wars.forEach((war) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.seasonLabel === war.seasonLabel) {
      lastGroup.colspan++;
    } else {
      groups.push({ seasonLabel: war.seasonLabel, colspan: 1 });
    }
  });
  return groups;
});

// Formatowanie surowego formatu daty (np. 2026-05) na czytelny tekst[cite: 7]
const formatSeason = (seasonStr) => {
  if (!seasonStr || typeof seasonStr !== "string") return seasonStr;
  if (seasonStr.includes(" - ") || seasonStr.includes("—")) return seasonStr;
  const parts = seasonStr.split("-");
  if (parts.length !== 2) return seasonStr;

  const [year, month] = parts;
  const monthNames = {
    "01": "Styczeń",
    "02": "Luty",
    "03": "Marzec",
    "04": "Kwiecień",
    "05": "Maj",
    "06": "Czerwiec",
    "07": "Lipiec",
    "08": "Sierpień",
    "09": "Wrzesień",
    10: "Październik",
    11: "Listopad",
    12: "Grudzień",
  };

  return `${monthNames[month] || month} ${year}`;
};
</script>

<template>
  <table class="scores-table">
    <thead>
      <tr class="row-season-head league" v-if="seasonHeaders.length > 0">
        <th rowspan="3" class="col-lp">L.P.</th>
        <th rowspan="3" class="col-player">GRACZ</th>
        <th rowspan="3" class="col-type">TYP</th>
        <th rowspan="3" class="col-total">SUMA</th>
        <th rowspan="3" class="col-avg">SKUTECZNOŚĆ</th>
        <th
          v-for="(s, idx) in seasonHeaders"
          :key="'season-h-' + idx"
          :colspan="s.colspan"
          class="col-season-title league"
        >
          {{ formatSeason(s.seasonLabel) }}
        </th>
      </tr>
      <tr class="row-main-head league">
        <th
          v-for="(war, i) in players[0]?.wars"
          :key="i"
          :class="['col-war', 'outcome-' + war.outcome]"
        >
          {{ war.warName }}
        </th>
      </tr>
      <tr class="row-roman">
        <th
          class="col-war-data"
          v-for="(war, i) in players[0]?.wars"
          :key="'opp-' + i"
          :class="['outcome-' + war.outcome]"
        >
          {{ war.opponentName }}
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(p, idx) in players" :key="p.tag">
        <tr :class="getPodiumClass(idx)">
          <td rowspan="2" class="cell-rank" v-html="getRankDisplay(idx)"></td>
          <td rowspan="2" class="player-info">
            <div class="name-wrapper">
              <span class="name">{{ p.name }}</span>
              <span class="tag">{{ p.tag }}</span>
            </div>
          </td>
          <td class="cell-type">Gwiazdki</td>
          <td class="cell-total main-total">{{ p.totalAtkStars }}</td>
          <td :class="['cell-avg', getAvgClass(p.avgAtkStars)]">
            {{ p.avgAtkStars }} ★
          </td>

          <td
            v-for="(war, wIdx) in p.wars"
            :key="'atk-stars-' + wIdx"
            :rowspan="!war.isParticipant ? 2 : 1"
            :class="['cell-val', { 'no-part': !war.isParticipant }]"
          >
            <template v-if="war.isParticipant">
              {{ formatWarValue(war.atkStars, "★") }}
            </template>
            <template v-else-if="war.isBenched">ŁAWKA</template>
            <template v-else>BRAK UDZIAŁU</template>
          </td>
        </tr>

        <tr
          v-if="p.wars.some((w) => w.isParticipant)"
          :class="['row-sub', getPodiumClass(idx)]"
        >
          <td class="cell-type">Zniszczenia</td>
          <td class="cell-total">{{ p.totalAtkDest }}%</td>
          <td class="cell-avg">{{ p.avgAtkDest }}%</td>
          <template v-for="(war, wIdx) in p.wars" :key="'atk-dest-' + wIdx">
            <td v-if="war.isParticipant" class="cell-val">
              {{ war.atkDest }}%
            </td>
          </template>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<style scoped lang="scss">
@use "@/assets/scss/_tables.scss";
</style>
