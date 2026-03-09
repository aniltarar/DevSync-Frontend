<template>
  <v-app>
    <router-view />
    <AppSnackbar />
  </v-app>
</template>

<script setup>
import AppSnackbar from "@/components/AppSnackbar.vue";
</script>

<style>

</style>