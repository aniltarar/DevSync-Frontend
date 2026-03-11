<template>
  <v-layout style="height: 100vh; overflow: hidden;">
    <Sidebar />
    <v-main style="overflow-y: auto; --v-layout-left: 64px !important;">
      <v-container fluid class="pa-6">
        <v-row justify="center">
          <v-col
            cols="12"
            md="10"
            lg="8"
            class="pa-6 pa-md-10 pa-lg-12 bg-surface  rounded-lg"
          >
            <router-view />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
</script>

<style></style>
