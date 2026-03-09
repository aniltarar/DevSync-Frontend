<template>
  <header class="d-flex align-center justify-space-between px-4 py-2">
    <h1>DevSync</h1>
    <v-btn @click="toggleTheme" :color="isDark ? 'primary' : 'secondary'" variant="outlined">
      {{ isDark ? 'Dark' : 'Light' }} Mode
    </v-btn>
  </header>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/theme';
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);
const { toggleTheme } = themeStore;
</script>

<style scoped>
header {
  background: transparent;
}
</style>
