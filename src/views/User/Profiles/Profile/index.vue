<template>
  <div v-if="authStore.status === 'loading'" class="d-flex justify-center py-10">
    <v-progress-circular indeterminate color="primary" />
  </div>
  <div v-else-if="authStore.profileUser" class="d-flex flex-column ga-4">
    <ProfileCard
      :user="authStore.profileUser"
      :is-blocked="authStore.profileIsBlocked"
      :is-blocked-by="authStore.profileIsBlockedBy"
    />
    <ProfileTabs v-if="!authStore.profileIsBlocked && !authStore.profileIsBlockedBy" :user-id="authStore.profileUser._id" />
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import ProfileCard from "../My-Profile/components/ProfileCard.vue";
import ProfileTabs from "../My-Profile/components/ProfileTabs.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

function loadProfile(userId) {
  if (userId === authStore.user?._id) {
    router.replace({ name: "Profile" });
    return;
  }
  authStore.fetchUserById(userId);
}

watch(() => route.params.userId, (id) => {
  if (id) loadProfile(id);
});

onMounted(() => {
  loadProfile(route.params.userId);
});
</script>