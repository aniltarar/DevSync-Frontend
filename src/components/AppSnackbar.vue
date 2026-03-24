<template>
  <v-snackbar
    v-model="appStore.snackbar.show"
    :color="appStore.snackbar.color"
    :timeout="appStore.snackbar.timeout"
    :location="appStore.snackbar.location"
    rounded="lg"
    elevation="4"
  >
    <div>
      <div>{{ appStore.snackbar.message }}</div>
      <div v-if="appStore.snackbar.detail" class="text-caption mt-1 opacity-80">
        {{ appStore.snackbar.detail }}
      </div>
    </div>
    <template #actions>
      <v-btn icon="mdi-close" variant="text" size="small" @click="appStore.close" />
    </template>
  </v-snackbar>
</template>

<script setup>
import { useAppStore } from "@/stores/app";
const appStore = useAppStore();
</script>
