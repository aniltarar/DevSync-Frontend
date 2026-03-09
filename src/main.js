import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import router from "@/router";
import vuetify from '@/plugins/vuetify';

const pinia = createPinia();

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(vuetify);

// Tema değişimini store ile bağla (Pinia yüklendikten sonra)
import { useThemeStore } from '@/stores/theme';
import { watch } from 'vue';
app.mount("#app");

// Pinia yüklendikten sonra themeStore'u kullan
const themeStore = useThemeStore();
watch(() => themeStore.isDark, (val) => {
	vuetify.theme.global.name.value = val ? 'dark' : 'light';
});
