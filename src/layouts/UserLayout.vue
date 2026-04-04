<template>
  <v-layout style="height: 100vh; overflow: hidden;">
    <Sidebar />
    <v-main style="overflow-y: auto; padding-left: 64px; height: 100vh;">
      <v-container fluid class="pa-6" style="height: 100%">
        <v-row justify="center" style="height: 100%">
          <v-col
            cols="12"
            md="10"
            lg="8"
            class="pa-6 pa-md-10 pa-lg-12 bg-surface rounded-lg d-flex flex-column"
            style="height: calc(100vh - 48px); overflow: hidden"
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
