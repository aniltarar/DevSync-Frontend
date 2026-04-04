<template>
  <div class="d-flex flex-column ga-4 h-full">
    <!-- Başlık -->
    <div>
      <h1 class="text-h5 font-weight-bold mb-1">Kullanıcı Ara</h1>
      <p class="text-body-2 text-medium-emphasis">Geliştiricileri bulun ve takip edin.</p>
    </div>

    <!-- Arama Kutusu -->
    <v-text-field
      v-model="query"
      placeholder="İsim veya kullanıcı adıyla arayın..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      rounded="lg"
      clearable
      hide-details
      autofocus
      @input="onInput"
      @click:clear="onClear"
    />

    <!-- Yükleniyor -->
    <div v-if="authStore.searchStatus === 'loading'" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Sonuçlar -->
    <template v-else-if="authStore.searchResults.length">
      <p class="text-caption text-medium-emphasis">
        {{ authStore.searchResults.length }} sonuç bulundu
      </p>
      <v-card
        v-for="user in authStore.searchResults"
        :key="user._id"
        rounded="xl"
        elevation="0"
        border
        class="pa-4"
      >
        <div class="d-flex align-center ga-3">
          <!-- Avatar -->
          <v-avatar
            size="52"
            color="primary"
            variant="tonal"
            rounded="circle"
            class="cursor-pointer flex-shrink-0"
            @click="goToProfile(user._id)"
          >
            <v-img v-if="user.profile?.avatarUrl" :src="getMediaUrl(user.profile.avatarUrl)" />
            <span v-else class="text-body-1 font-weight-bold text-primary">
              {{ initials(user) }}
            </span>
          </v-avatar>

          <!-- Bilgi -->
          <div class="flex-grow-1 min-width-0">
            <div
              class="text-body-1 font-weight-bold cursor-pointer text-truncate"
              @click="goToProfile(user._id)"
            >
              {{ user.profile?.name }} {{ user.profile?.surname }}
            </div>
            <div class="d-flex align-center ga-1 flex-wrap">
              <span class="text-caption text-medium-emphasis">@{{ user.username }}</span>
            </div>
            <div v-if="user.profile?.bio" class="text-caption text-medium-emphasis mt-1 text-truncate">
              {{ user.profile.bio }}
            </div>
            <!-- Yetenekler -->
            <div v-if="user.skills?.length" class="d-flex ga-1 flex-wrap mt-1">
              <v-chip
                v-for="skill in user.skills.slice(0, 3)"
                :key="skill"
                size="x-small"
                variant="tonal"
                color="secondary"
                rounded="md"
              >
                {{ skill }}
              </v-chip>
              <span v-if="user.skills.length > 3" class="text-caption text-disabled align-self-center">
                +{{ user.skills.length - 3 }}
              </span>
            </div>
          </div>

          <!-- Aksiyonlar -->
          <div class="d-flex align-center ga-2 flex-shrink-0">
            <v-btn
              v-if="!isMe(user._id)"
              :color="followingIds.has(user._id) ? 'primary' : 'default'"
              :variant="followingIds.has(user._id) ? 'primary' : 'primary'"
              :prepend-icon="followingIds.has(user._id) ? 'mdi-account-check' : 'mdi-account-plus-outline'"
              size="small"
              rounded="lg"
              :loading="loadingIds.has(user._id)"
              @click="handleFollow(user._id)"
            >
              {{ followingIds.has(user._id) ? "Takip Ediliyor" : "Takip Et" }}
            </v-btn>
            <v-btn
              v-if="!isMe(user._id)"
              variant="outlined"
              size="small"
              rounded="lg"
              @click="goToProfile(user._id)"
            >
              Profil
            </v-btn>
          </div>
        </div>
      </v-card>
    </template>

    <!-- Boş durum: arama yapıldı ama sonuç yok -->
    <div
      v-else-if="authStore.searchStatus === 'success' && !authStore.searchResults.length && query"
      class="d-flex flex-column align-center justify-center py-12 ga-3"
    >
      <v-avatar size="72" color="surface-variant" rounded="circle">
        <v-icon size="36" color="medium-emphasis">mdi-account-search-outline</v-icon>
      </v-avatar>
      <div class="text-center">
        <p class="text-body-1 font-weight-medium">"{{ query }}" için sonuç bulunamadı</p>
        <p class="text-body-2 text-medium-emphasis">Farklı bir arama terimi deneyin.</p>
      </div>
    </div>

    <!-- İlk açılış: henüz arama yok -->
    <div
      v-else-if="!query"
      class="d-flex flex-column align-center justify-center py-12 ga-3"
    >
      <v-avatar size="72" color="primary" variant="tonal" rounded="circle">
        <v-icon size="36" color="primary">mdi-account-search</v-icon>
      </v-avatar>
      <div class="text-center">
        <p class="text-body-1 font-weight-medium">Geliştirici Ara</p>
        <p class="text-body-2 text-medium-emphasis">İsim veya kullanıcı adıyla arama yapın.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getMediaUrl } from "@/utils/mediaUrl";

const authStore = useAuthStore();
const router = useRouter();

const query = ref("");
const followingIds = reactive(new Set());
const loadingIds = reactive(new Set());

watch(() => authStore.searchResults, (results) => {
  followingIds.clear();
  results.forEach((u) => { if (u.isFollowing) followingIds.add(u._id); });
});

let debounceTimer = null;

const onInput = () => {
  clearTimeout(debounceTimer);
  if (!query.value?.trim()) {
    authStore.searchResults = [];
    authStore.searchStatus = "idle";
    return;
  }
  debounceTimer = setTimeout(() => {
    authStore.searchUsers(query.value.trim());
  }, 400);
};

const onClear = () => {
  query.value = "";
  authStore.searchResults = [];
  authStore.searchStatus = "idle";
};

const isMe = (userId) => authStore.user?._id === userId;

const goToProfile = (userId) => {
  if (isMe(userId)) {
    router.push({ name: "Profile" });
  } else {
    router.push({ name: "UserProfile", params: { userId } });
  }
};

const handleFollow = async (userId) => {
  loadingIds.add(userId);
  try {
    const result = await authStore.followUser(userId);
    if (result) {
      if (followingIds.has(userId)) {
        followingIds.delete(userId);
      } else {
        followingIds.add(userId);
      }
    }
  } finally {
    loadingIds.delete(userId);
  }
};

const initials = (user) => {
  const name = user.profile?.name?.[0] ?? "";
  const surname = user.profile?.surname?.[0] ?? "";
  return (name + surname).toUpperCase() || user.username?.[0]?.toUpperCase() || "?";
};
</script>
