<script setup lang="ts">
import { AudioSource } from "@/audio/mixer/sources/audio";
import type { Mixer } from "@/audio/mixer/mixer";
import { usePlaylist } from "@/stores/counter";
import {
  computed,
  customRef,
  inject,
  onBeforeUnmount,
  ref,
  watch,
  watchEffect,
} from "vue";
import Visualizer from "./visualizer.vue";

const props = defineProps({
  volume: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits<{
  (e: "ending"): void;
}>();

const mixer = inject<Mixer>("mixer")!;
const deck = new AudioSource();
const title = ref("");
const state = ref("stopped");
const duration = ref(0);

const progress = computed(() => time.value / Math.max(1, duration.value));
const dashOffset = computed(() => Math.max(0, 299 - progress.value * 299));

const time = customRef((track, trigger) => {
  deck.audio.addEventListener("timeupdate", trigger);

  return {
    get: () => {
      track();
      return deck.audio.currentTime;
    },
    set(value: number) {
      deck.audio.currentTime = value;
    },
  };
});

const ending = ref(false);

watchEffect(() => {
  if (
    !ending.value &&
    state.value === "playing" &&
    duration.value - time.value <= 15
  ) {
    ending.value = true;

    emit("ending");
  }
});

watch(
  () => props.volume,
  (vol) => {
    deck.volume = vol;
  }
);

deck.audio.addEventListener("loadedmetadata", () => {
  duration.value = deck.audio.duration;
});

deck.audio.addEventListener("ended", () => {
  state.value = "paused";
});

deck.audio.addEventListener("play", () => {
  ending.value = false;
  state.value = "playing";
});

deck.audio.addEventListener("pause", () => {
  state.value = "paused";
});

deck.audio.addEventListener("error", () => {
  state.value = "error";
});

deck.audio.addEventListener("abort", () => {
  state.value = "error";
});

deck.audio.addEventListener("ended", () => {
  title.value = "";
  state.value = "ended";

  loadAudio(playlist.next()?.src);
});

mixer?.add(deck);

onBeforeUnmount(() => mixer?.removeChannel(deck));

const playlist = usePlaylist();

async function loadAudio(file: File | string) {
  if (!file) return;
  state.value = "loading";
  try {
    URL.revokeObjectURL(deck.url);
  } finally {
    if (typeof file === "string") {
      title.value = file;
      await deck.load(file);
    } else {
      title.value = file.name;
      await deck.load(URL.createObjectURL(file));
    }
  }
}

const analyser = mixer.ctx.createAnalyser();

analyser.fftSize = 1024;
analyser.smoothingTimeConstant = 0.2;

deck.node.connect(analyser);

defineExpose({
  state,
  play: () => {
    deck.audio.play();
  },
  pause: () => {
    deck.audio.pause();
  },
  loadNext: () => loadAudio(playlist.next()?.src),
  loadAudio,
});
</script>
<template>
  <div :class="['deck', { 'deck--ending': duration - time <= 20 }]">
    <label>
      <h3 v-if="title">{{ title }}</h3>
      <h4>{{ state }}</h4>
      <input
        v-show="!title"
        type="file"
        accept="audio/*"
        @input="loadAudio(($event.target as HTMLInputElement).files?.[0]!)"
      />
    </label>
    <svg viewBox="0 0 100 100" style="width: 100%">
      <circle cx="50" cy="50" r="45" fill="#000" />
      <Visualizer :analyser="analyser" />
      <!-- Rotate -90deg -->
      <g transform="rotate(-90 50 50)">
        <circle
          cx="50"
          cy="50"
          r="47.5"
          fill="none"
          stroke="var(--current-color)"
          stroke-width="5"
          stroke-dasharray="299"
          :stroke-dashoffset="dashOffset"
        />
      </g>
    </svg>

    <input
      v-model="time"
      type="range"
      min="0"
      :max="duration"
      style="width: 100%"
    />

    <div>
      <button v-if="state !== 'playing'" @click="deck.audio.play()">
        Play
      </button>
      <button v-else-if="state === 'playing'" @click="deck.audio.pause()">
        Pause
      </button>
    </div>
  </div>
</template>

<style>
.deck {
  --current-color: #00aaff;
  background: #555;
  padding: 1rem;
  color: #f1f1f1;
}

.deck--ending {
  --current-color: #ff00aa;
}
</style>
