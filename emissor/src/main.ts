import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "./audio/station";
import { Mixer } from "./audio/mixer/mixer";
import { broadcast } from "./audio/station";

const mixer = await Mixer.init();

mixer.returnPlayback = true;

const app = createApp(App);

broadcast(mixer);

app.provide("mixer", mixer);

app.use(createPinia());
app.use(router);

app.mount("#app");
