<template>
  <div class="d-flex flex-column ga-4 ">
    <ProfileCard :user="authStore.user" />
    <ProfileTabs :user-id="authStore.user._id" />
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import ProfileCard from "./components/ProfileCard.vue";
import ProfileTabs from "./components/ProfileTabs.vue";

const authStore = useAuthStore();
</script>
