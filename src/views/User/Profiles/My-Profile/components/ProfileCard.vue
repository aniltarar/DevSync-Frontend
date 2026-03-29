<template>
  <v-card rounded="xl" elevation="0" border>
    <v-card-item>
      <template #prepend>
        <div
          class="position-relative d-inline-flex rounded-circle"
          :class="{ 'cursor-pointer': isOwner }"
        >
          <v-avatar
            size="80"
            color="primary"
            variant="tonal"
            rounded="circle"
            class="border-lg border-opacity-100 border-surface"
            @click="isOwner && (avatarMenu = true)"
          >
            <v-img v-if="user.profile.avatarUrl" :src="avatarUrl" />
            <span v-else class="text-h5 font-weight-bold text-primary">
              {{ initials }}
            </span>
            <div
              v-if="isOwner"
              class="avatar-overlay position-absolute rounded-circle d-flex align-center justify-center"
              style="
                inset: 0;
                background: rgba(0, 0, 0, 0.45);
                opacity: 0;
                transition: opacity 0.2s;
              "
            >
              <v-icon color="white" size="22">mdi-camera-outline</v-icon>
            </div>
          </v-avatar>
          <!-- Dropdown Menu -->
          <v-menu v-model="avatarMenu" :close-on-content-click="false" location="bottom" offset-y>
            <template #activator="{ props }">
              <!-- Hidden activator, menu is opened by avatar click -->
              <span v-bind="props"></span>
            </template>
            <v-list>
              <v-list-item v-if="!user.profile.avatarUrl" @click="triggerFileInput">
                <div class="d-flex align-center">
                  <v-icon color="primary" class="mr-2">mdi-upload</v-icon>
                  <span>Fotoğraf Yükle</span>
                </div>
              </v-list-item>
              <template v-else>
                <v-list-item @click="triggerFileInput">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-2">mdi-upload</v-icon>
                    <span>Fotoğrafı Yükle</span>
                  </div>
                </v-list-item>
                <v-list-item @click="handleDeleteAvatar">
                  <div class="d-flex align-center">
                    <v-icon color="error" class="mr-2">mdi-delete</v-icon>
                    <span>Fotoğrafı Kaldır</span>
                  </div>
                </v-list-item>
              </template>
            </v-list>
          </v-menu>
          <input
            v-if="isOwner"
            ref="fileInput"
            type="file"
            accept="image/*"
            class="d-none"
            @change="onAvatarChange"
          />
        </div>
      </template>

      <template #append>
        <div class="d-flex ga-2">
          <v-btn
            v-if="isOwner"
            variant="outlined"
            size="small"
            rounded="lg"
            prepend-icon="mdi-pencil-outline"
            @click="editDialog = true"
          >
            Düzenle
          </v-btn>
          <v-btn
            v-if="!isOwner && !isBlockedBy"
            :color="isBlocked ? 'error' : 'default'"
            :variant="isBlocked ? 'tonal' : 'outlined'"
            :prepend-icon="
              isBlocked ? 'mdi-account-cancel' : 'mdi-account-cancel-outline'
            "
            size="small"
            rounded="lg"
            @click="blockDialog = true"
          >
            {{ isBlocked ? "Engellendi" : "Engelle" }}
          </v-btn>
        </div>
      </template>
    </v-card-item>

    <!-- Engellendi bannerı (sen engelledin) -->
    <template v-if="isBlocked">
      <v-divider />
      <div
        class="d-flex flex-column align-center justify-center py-10 px-4 ga-4"
      >
        <v-avatar size="72" color="error" variant="tonal" rounded="circle">
          <v-icon size="36" color="error">mdi-account-cancel</v-icon>
        </v-avatar>
        <div class="text-center">
          <p class="text-body-1 font-weight-bold mb-1">
            Bu kullanıcıyı engellediniz
          </p>
          <p class="text-body-2 text-medium-emphasis">
            {{ user.profile.name }} {{ user.profile.surname }} adlı kullanıcının
            profilini ve gönderilerini göremezsiniz.
          </p>
        </div>
        <v-btn
          color="error"
          variant="outlined"
          rounded="lg"
          prepend-icon="mdi-account-check-outline"
          :loading="blockLoading"
          @click="blockDialog = true"
        >
          Engeli Kaldır
        </v-btn>
      </div>
    </template>

    <!-- Engellendi bannerı (seni engelledi) -->
    <template v-if="isBlockedBy">
      <v-divider />
      <div
        class="d-flex flex-column align-center justify-center py-10 px-4 ga-4"
      >
        <v-avatar size="72" color="warning" variant="tonal" rounded="circle">
          <v-icon size="36" color="warning">mdi-account-lock</v-icon>
        </v-avatar>
        <div class="text-center">
          <p class="text-body-1 font-weight-bold mb-1">
            Bu kullanıcı sizi engelledi
          </p>
          <p class="text-body-2 text-medium-emphasis">
            {{ user.profile.name }} {{ user.profile.surname }} adlı kullanıcının
            profilini görüntleştiremezsiniz.
          </p>
        </div>
      </div>
    </template>

    <!-- Name & Username -->
    <v-card-item v-if="!isBlocked && !isBlockedBy" class="pt-1 pb-0">
      <v-card-title class="text-h6 font-weight-bold pa-0">
        {{ user.profile.name }} {{ user.profile.surname }}
      </v-card-title>
      <v-card-subtitle class="pa-0 mt-1">
        <span class="text-caption text-medium-emphasis"
          >@{{ user.username }}</span
        >
        <v-chip
          class="ml-2"
          size="x-small"
          color="primary"
          variant="tonal"
          rounded="md"
        >
          {{ user.role }}
        </v-chip>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text v-if="!isBlocked && !isBlockedBy" class="px-4 pb-4 pt-2">
      <!-- Bio -->
      <div v-if="user.profile.bio" class="mb-4">
        <p class="text-body-2 text-medium-emphasis" style="line-height: 1.6">
          {{ user.profile.bio }}
        </p>
      </div>

      <!-- Meta: E-posta & Konum -->
      <div class="d-flex flex-wrap ga-3 mb-4">
        <div class="d-flex align-center ga-1">
          <v-icon size="16" color="primary">mdi-email-outline</v-icon>
          <span class="text-caption text-medium-emphasis">{{
            user.email || "E-posta eklenmedi"
          }}</span>
        </div>
        <div v-if="user.profile.location" class="d-flex align-center ga-1">
          <v-icon size="16" color="primary">mdi-map-marker-outline</v-icon>
          <span class="text-caption text-medium-emphasis">{{
            user.profile.location
          }}</span>
        </div>
      </div>

      <v-divider class="mb-4" />

      <!-- Unvanlar -->
      <div class="mb-4">
        <p
          class="text-caption text-medium-emphasis font-weight-medium text-uppercase mb-2"
        >
          Unvanlar
        </p>
        <div class="d-flex ga-2 flex-wrap">
          <v-chip
            v-for="title in user.titles"
            :key="title"
            size="small"
            color="secondary"
            variant="tonal"
            rounded="md"
            prepend-icon="mdi-medal-outline"
          >
            {{ title }}
          </v-chip>
          <span v-if="!user.titles?.length" class="text-caption text-disabled">
            Henüz unvan eklenmedi.
          </span>
        </div>
      </div>

      <!-- Yetenekler -->
      <div class="mb-4">
        <p
          class="text-caption text-medium-emphasis font-weight-medium text-uppercase mb-2"
        >
          Yetenekler
        </p>
        <div class="d-flex ga-2 flex-wrap">
          <v-chip
            v-for="skill in user.skills"
            :key="skill"
            size="small"
            color="primary"
            variant="tonal"
            rounded="md"
          >
            {{ skill }}
          </v-chip>
          <span v-if="!user.skills?.length" class="text-caption text-disabled">
            Henüz yetenek eklenmedi.
          </span>
        </div>
      </div>

      <!-- Sosyal Bağlantılar -->
      <div
        v-if="
          user.socialLinks.github ||
          user.socialLinks.linkedin ||
          user.socialLinks.portfolio
        "
      >
        <p
          class="text-caption text-medium-emphasis font-weight-medium text-uppercase mb-2"
        >
          Sosyal Bağlantılar
        </p>
        <div class="d-flex ga-2 flex-wrap">
          <v-btn
            v-if="user.socialLinks.github"
            :href="user.socialLinks.github"
            target="_blank"
            variant="tonal"
            size="small"
            rounded="lg"
            prepend-icon="mdi-github"
          >
            GitHub
          </v-btn>
          <v-btn
            v-if="user.socialLinks.linkedin"
            :href="user.socialLinks.linkedin"
            target="_blank"
            color="secondary"
            variant="tonal"
            size="small"
            rounded="lg"
            prepend-icon="mdi-linkedin"
          >
            LinkedIn
          </v-btn>
          <v-btn
            v-if="user.socialLinks.portfolio"
            :href="user.socialLinks.portfolio"
            target="_blank"
            color="accent"
            variant="tonal"
            size="small"
            rounded="lg"
            prepend-icon="mdi-web"
          >
            Portfolio
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>

  <UpdateProfileDialog v-if="isOwner" v-model="editDialog" />

  <!-- Engelleme onay dialogu -->
  <v-dialog v-model="blockDialog" max-width="380">
    <v-card rounded="xl">
      <v-card-title class="text-h6 font-weight-bold pa-4">
        {{ isBlocked ? "Engeli Kaldır" : "Kullanıcıyı Engelle" }}
      </v-card-title>
      <v-card-text class="px-4 pb-2">
        <span v-if="isBlocked">
          <strong>{{ user.profile.name }} {{ user.profile.surname }}</strong>
          adlı kullanıcının engelini kaldırmak istediğine emin misin?
        </span>
        <span v-else>
          <strong>{{ user.profile.name }} {{ user.profile.surname }}</strong>
          adlı kullanıcıyı engellemek istediğine emin misin?
        </span>
      </v-card-text>
      <v-card-actions class="pa-4 pt-2">
        <v-spacer />
        <v-btn variant="text" rounded="lg" @click="blockDialog = false"
          >İptal</v-btn
        >
        <v-btn
          :class="isBlocked ? 'bg-warning' : 'bg-error'"
          variant="flat"
          rounded="lg"
          :loading="blockLoading"
          @click="handleBlock"
        >
          {{ isBlocked ? "Engeli Kaldır" : "Engelle" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { getMediaUrl } from "@/utils/mediaUrl";
import UpdateProfileDialog from "./UpdateProfileDialog.vue";

const props = defineProps({
  user: { type: Object, required: true },
  isBlocked: { type: Boolean, default: false },
  isBlockedBy: { type: Boolean, default: false },
});

const authStore = useAuthStore();
const isOwner = computed(() => authStore.user?._id === props.user._id);
const avatarUrl = computed(() => getMediaUrl(props.user.profile?.avatarUrl));
const editDialog = ref(false);
const fileInput = ref(null);
const avatarMenu = ref(false);
const blockDialog = ref(false);
const blockLoading = ref(false);

const handleBlock = async () => {
  blockLoading.value = true;
  await authStore.blockUser(props.user._id);
  blockLoading.value = false;
  blockDialog.value = false;
};


const onAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  await authStore.uploadAvatar(file);
  event.target.value = "";
  avatarMenu.value = false;
};

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click();
};

const handleDeleteAvatar = async () => {
  await authStore.deleteAvatar();
  avatarMenu.value = false;
};

const initials = computed(() => {
  const name = props.user.profile.name?.[0] ?? "";
  const surname = props.user.profile.surname?.[0] ?? "";
  return (
    (name + surname).toUpperCase() ||
    props.user.username?.[0]?.toUpperCase() ||
    "?"
  );
});
</script>

<style scoped>
.avatar-overlay {
  opacity: 0;
  transition: opacity 0.2s;
}

.cursor-pointer:hover .avatar-overlay {
  opacity: 1 !important;
}
</style>
