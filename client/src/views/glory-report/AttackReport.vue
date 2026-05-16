<script setup>
const props = defineProps({
  players: Array,
  getRankDisplay: Function,
  getPodiumClass: Function,
  getAvgClass: Function,
  formatWarValue: Function,
});
</script>

<template>
  <table class="glory-table">
    <thead>
      <tr class="row-main-head">
        <th rowspan="3" class="col-lp">L.P.</th>
        <th rowspan="3" class="col-player">GRACZ</th>
        <th rowspan="3" class="col-type">TYP</th>
        <th rowspan="3" class="col-total">SUMA</th>
        <th rowspan="3" class="col-avg">SKUTECZNOŚĆ</th>
        <th v-for="(war, i) in players[0]?.wars" :key="i" class="col-war">
          {{ war.warName }}
        </th>
      </tr>
      <tr class="row-date">
        <th
          class="col-war-data"
          v-for="war in players[0]?.wars"
          :key="'date-' + war.warName"
        >
          {{ war.date }}
        </th>
      </tr>
      <tr class="row-roman">
        <th
          class="col-war-data"
          v-for="war in players[0]?.wars"
          :key="'roman-' + war.warName"
        >
          {{ war.romanNum }}
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(p, idx) in players" :key="p.tag">
        <tr :class="['row-main', getPodiumClass(idx)]">
          <td rowspan="2" class="cell-rank">{{ getRankDisplay(idx) }}</td>
          <td rowspan="2" class="cell-name">
            <div class="name-wrapper">
              <span class="name">{{ p.name }}</span>
              <span class="tag">{{ p.tag }}</span>
            </div>
          </td>
          <td class="cell-type">Gwiazdki</td>
          <td class="cell-total">{{ p.totalAtkStars }}</td>
          <td :class="['cell-avg', getAvgClass(p)]">
            {{ p.avgAtkStarsPerHit }}
          </td>
          <td
            v-for="(war, wIdx) in p.wars"
            :key="'val-' + wIdx"
            :rowspan="!war.isParticipant ? 2 : 1"
            :class="['cell-val', { 'no-part': !war.isParticipant }]"
          >
            <template v-if="war.isParticipant">{{
              formatWarValue(war.atkStars, "★")
            }}</template>
            <template v-else>BRAK UDZIAŁU</template>
          </td>
        </tr>
        <tr
          v-if="p.wars.some((w) => w.isParticipant)"
          :class="['row-sub', getPodiumClass(idx)]"
        >
          <td class="cell-type">Zniszczenia</td>
          <td class="cell-total">{{ p.totalAtkDest + "%" }}</td>
          <td class="cell-avg">{{ p.avgAtkDestPerHit + "%" }}</td>
          <template v-for="(war, wIdx) in p.wars" :key="'sub-' + wIdx">
            <td v-if="war.isParticipant" class="cell-val sub-val">
              {{ formatWarValue(war.atkDest, "%") }}
            </td>
          </template>
        </tr>
      </template>
    </tbody>
  </table>
</template>
