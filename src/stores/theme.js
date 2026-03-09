import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const savedTheme = localStorage.getItem('theme');
  const isDark = ref(savedTheme ? savedTheme === 'dark' : true);

  function toggleTheme() {
    isDark.value = !isDark.value;
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  }

  return { isDark, toggleTheme };
});
