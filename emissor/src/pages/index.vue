<script setup lang="ts">
import { inject, reactive, ref } from "vue";
import Deck from "../components/deck.vue";
import { Tween, update } from "@tweenjs/tween.js";
import { usePlaylist } from "@/stores/counter";
import type { Mixer } from "@/audio/mixer/mixer";
import { ClockSource } from "@/audio/mixer/sources/clock";

const a = ref();
const b = ref();

const fader = ref(0.5);
const mixer = inject<Mixer>("mixer")!;

function loop() {
  window.requestAnimationFrame(loop);
  update();
}

loop();

const deckA = reactive({
  get volume() {
    return Math.min(0.5, 1 - fader.value);
  },
});

const deckB = reactive({
  get volume() {
    return Math.min(0.5, fader.value);
  },
});

function fadeTo(value: any, time = 1000, cb?: () => void) {
  return new Tween(fader)
    .to({ value }, time)
    .start()
    .onComplete(() => cb?.());
}

async function startAutoDJ() {
  if (!a.value.title) {
    await a.value.loadNext().then(() => a.value.play());
  }
  if (!b.value.title) {
    await b.value.loadNext();
  }
}

const playlist = usePlaylist();

function clock() {
  mixer.add(new ClockSource());
}
</script>

<template>
  <div style="width: 100%; max-width: 720px; margin: 0 auto">
    <div class="d-flex align-center">
      <Deck
        ref="a"
        v-bind="deckA"
        class="flex-fill"
        @ending="
          b?.play();
          fader = 0;
          fadeTo(1, 10000);
        "
      />
      <div class="deck">
        <input v-model="fader" type="range" min="0" max="1" step="0.001" />
        <br />
        <button
          @click="
            a.state !== 'playing' && a.play();
            fadeTo(0, 1000, b.loadNext);
          "
        >
          &lt;
        </button>
        <button @click="fadeTo(0.5)">=</button>
        <button
          @click="
            b.state !== 'playing' && b.play();
            fadeTo(1, 1000, a.loadNext);
          "
        >
          &gt;
        </button>
      </div>
      <Deck
        ref="b"
        v-bind="deckB"
        class="flex-fill"
        @ending="
          a?.play();
          fader = 1;
          fadeTo(0, 10000);
        "
      />
    </div>
    <div>
      <div class="d-flex">
        <button @click="clock">Falar hora</button>
        <button @click="startAutoDJ">Iniciar Auto DJ</button>
        <label class="btn">
          Adicionar
          <input
            v-show="false"
            type="file"
            accept="audio/*"
            multiple
            @input="
            playlist.import(($event.target as HTMLInputElement).files!);
            ($event.target as HTMLInputElement).value = ''
          "
          />
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 100%">Música</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in playlist.items" :key="index">
            <td>{{ item.name }}</td>
            <td>
              <button @click="playlist.remove(index)">Remover</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
