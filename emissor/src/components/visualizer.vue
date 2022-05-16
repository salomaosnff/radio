<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { onBeforeUnmount, ref, triggerRef } from "vue";

const props = defineProps({
  analyser: {
    type: AnalyserNode,
    required: true,
  },
});

let frame = window.requestAnimationFrame(loop);
const data = ref(new Uint8Array(props.analyser.frequencyBinCount));

function loop() {
  frame = window.requestAnimationFrame(loop);

  props.analyser.getByteFrequencyData(data.value);

  triggerRef(data);
}

const avg = computed(
  () => data.value.reduce((a, b) => a + b, 0) / data.value.length
);

onBeforeUnmount(() => window.cancelAnimationFrame(frame));
</script>

<template>
  <!-- scale -->
  <circle
    cx="50"
    cy="50"
    :r="(1 + avg / 255) * 12.5"
    fill="var(--current-color)"
  />
</template>
