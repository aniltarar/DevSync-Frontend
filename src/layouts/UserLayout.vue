<template>
  <v-layout style="min-height: 100vh;">
    <Sidebar />
    <v-main>
            <v-container fluid class="pa-0 fill-height">
              <v-row justify="center" class="fill-height">
                <v-col
                  cols="12"
                  md="10"
                  lg="8"

                  class="pa-6 pa-md-10 pa-lg-12 border-radius-lg bg-surface"
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
