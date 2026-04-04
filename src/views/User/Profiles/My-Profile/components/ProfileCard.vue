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
          <v-menu
            v-model="avatarMenu"
            :close-on-content-click="false"
            location="bottom"
            offset-y
          >
            <template #activator="{ props }">
              <!-- Hidden activator, menu is opened by avatar click -->
              <span v-bind="props"></span>
            </template>
            <v-list>
              <v-list-item
                v-if="!user.profile.avatarUrl"
                @click="triggerFileInput"
              >
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
        <div class="d-flex align-center ga-2">
          <!-- Kendi profili -->
          <v-btn
            v-if="isOwner"
            variant="tonal"
            size="small"
            rounded="lg"
            prepend-icon="mdi-pencil-outline"
            @click="editDialog = true"
          >
            Düzenle
          </v-btn>

          <!-- Başka kullanıcı profili -->
          <template v-if="!isOwner && !isBlockedBy">
            <!-- Follow butonu -->
            <v-btn
              v-if="!isBlocked"
              :color="isFollowing ? 'primary' : 'primary'"
              :variant="isFollowing ? 'tonal' : 'flat'"
              :prepend-icon="
                isFollowing ? 'mdi-account-check' : 'mdi-account-plus-outline'
              "
              rounded="lg"
              :loading="followLoading"
              @click="handleFollow"
            >
              {{ isFollowing ? "Takip Ediliyor" : "Takip Et" }}
            </v-btn>

            <!-- Daha fazla (rapor / engel) -->
            <v-menu location="bottom end">
              <template #activator="{ props: menuProps }">
                <v-btn
                  v-bind="menuProps"
                  icon
                  variant="tonal"
                  size="small"
                  rounded="lg"
                >
                  <v-icon size="18">mdi-dots-horizontal</v-icon>
                </v-btn>
              </template>
              <v-list rounded="lg" min-width="180" elevation="3">
                <v-list-item
                  prepend-icon="mdi-flag-outline"
                  title="Bildir"
                  @click="reportDialog = true"
                />
                <v-divider />
                <v-list-item
                  :prepend-icon="
                    isBlocked
                      ? 'mdi-account-check-outline'
                      : 'mdi-account-cancel-outline'
                  "
                  :title="isBlocked ? 'Engeli Kaldır' : 'Engelle'"
                  :class="isBlocked ? 'text-warning' : 'text-error'"
                  @click="blockDialog = true"
                />
              </v-list>
            </v-menu>
          </template>
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

      <!-- Takip sayaçları -->
      <div class="d-flex align-center ga-4 mt-3">
        <div
          class="d-flex flex-column align-center"
          :class="isOwner ? 'cursor-pointer' : ''"
          @click="isOwner && openFollowDialog('following')"
        >
          <span class="text-body-2 font-weight-bold">
            {{ isOwner ? authStore.following.length : (followingCount ?? "—") }}
          </span>
          <span class="text-caption text-medium-emphasis">Takip Edilen</span>
        </div>
        <v-divider vertical style="height: 28px" />
        <div
          class="d-flex flex-column align-center"
          :class="isOwner ? 'cursor-pointer' : ''"
          @click="isOwner && openFollowDialog('followers')"
        >
          <span class="text-body-2 font-weight-bold">
            {{ isOwner ? authStore.followers.length : (followersCount ?? "—") }}
          </span>
          <span class="text-caption text-medium-emphasis">Takipçi</span>
        </div>
        <v-chip
          v-if="!isOwner && isFollowedBy"
          color="secondary"
          variant="tonal"
          rounded="md"
          prepend-icon="mdi-account-arrow-left-outline"
          class="ml-1 text-caption text-medium-emphasis"
        >
          Sizi de takip ediyor
        </v-chip>
      </div>
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

  <!-- Takip listesi dialog -->
  <v-dialog v-model="followDialog" max-width="420" scrollable>
    <v-card rounded="xl">
      <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">
        {{ followDialogTab === "following" ? "Takip Edilenler" : "Takipçiler" }}
      </v-card-title>

      <v-tabs
        v-model="followDialogTab"
        color="primary"
        density="compact"
        class="px-2"
      >
        <v-tab value="following">Takip Edilen</v-tab>
        <v-tab value="followers">Takipçiler</v-tab>
      </v-tabs>

      <v-divider />

      <v-card-text class="pa-0" style="max-height: 420px">
        <!-- Yükleniyor -->
        <div
          v-if="authStore.status === 'loading'"
          class="d-flex justify-center py-8"
        >
          <v-progress-circular indeterminate color="primary" size="28" />
        </div>

        <template v-else>
          <v-list lines="two">
            <template v-if="followDialogTab === 'following'">
              <v-list-item
                v-for="u in authStore.following"
                :key="u._id"
                :subtitle="'@' + u.username"
                rounded="lg"
                class="cursor-pointer"
                @click="goToProfile(u._id)"
              >
                <template #prepend>
                  <v-avatar
                    size="40"
                    color="primary"
                    variant="tonal"
                    rounded="circle"
                  >
                    <v-img
                      v-if="u.profile?.avatarUrl"
                      :src="getMediaUrl(u.profile.avatarUrl)"
                    />
                    <span
                      v-else
                      class="text-body-2 font-weight-bold text-primary"
                    >
                      {{
                        (
                          u.profile?.name?.[0] ??
                          u.username?.[0] ??
                          "?"
                        ).toUpperCase()
                      }}
                    </span>
                  </v-avatar>
                </template>
                <template #title>
                  <span class="text-body-2 font-weight-medium">
                    {{ u.profile?.name }} {{ u.profile?.surname }}
                  </span>
                </template>
              </v-list-item>
              <div
                v-if="!authStore.following.length"
                class="text-center text-caption text-medium-emphasis py-8"
              >
                Henüz kimseyi takip etmiyorsunuz.
              </div>
            </template>

            <template v-else>
              <v-list-item
                v-for="u in authStore.followers"
                :key="u._id"
                :subtitle="'@' + u.username"
                rounded="lg"
                class="cursor-pointer"
                @click="goToProfile(u._id)"
              >
                <template #prepend>
                  <v-avatar
                    size="40"
                    color="primary"
                    variant="tonal"
                    rounded="circle"
                  >
                    <v-img
                      v-if="u.profile?.avatarUrl"
                      :src="getMediaUrl(u.profile.avatarUrl)"
                    />
                    <span
                      v-else
                      class="text-body-2 font-weight-bold text-primary"
                    >
                      {{
                        (
                          u.profile?.name?.[0] ??
                          u.username?.[0] ??
                          "?"
                        ).toUpperCase()
                      }}
                    </span>
                  </v-avatar>
                </template>
                <template #title>
                  <span class="text-body-2 font-weight-medium">
                    {{ u.profile?.name }} {{ u.profile?.surname }}
                  </span>
                </template>
              </v-list-item>
              <div
                v-if="!authStore.followers.length"
                class="text-center text-caption text-medium-emphasis py-8"
              >
                Henüz takipçiniz yok.
              </div>
            </template>
          </v-list>
        </template>
      </v-card-text>

      <v-card-actions class="pa-3 pt-0">
        <v-spacer />
        <v-btn variant="outlined"  rounded="lg" @click="followDialog = false"
          >Kapat</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Rapor dialog -->
  <ReportDialog
    v-if="!isOwner"
    v-model="reportDialog"
    report-type="user"
    :content-id="user._id"
  />

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
          class="text-white"
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getMediaUrl } from "@/utils/mediaUrl";
import UpdateProfileDialog from "./UpdateProfileDialog.vue";
import ReportDialog from "@/components/ReportDialog.vue";

const props = defineProps({
  user: { type: Object, required: true },
  isBlocked: { type: Boolean, default: false },
  isBlockedBy: { type: Boolean, default: false },
  isFollowing: { type: Boolean, default: false },
  isFollowedBy: { type: Boolean, default: false },
  followersCount: { type: Number, default: null },
  followingCount: { type: Number, default: null },
});

const authStore = useAuthStore();
const router = useRouter();
const isOwner = computed(() => authStore.user?._id === props.user._id);
const avatarUrl = computed(() => getMediaUrl(props.user.profile?.avatarUrl));
const editDialog = ref(false);
const fileInput = ref(null);
const avatarMenu = ref(false);
const blockDialog = ref(false);
const blockLoading = ref(false);
const followLoading = ref(false);
const reportDialog = ref(false);
const followDialog = ref(false);
const followDialogTab = ref("following");

const openFollowDialog = async (tab) => {
  followDialogTab.value = tab;
  followDialog.value = true;
  await Promise.all([authStore.fetchFollowing(), authStore.fetchFollowers()]);
};

const goToProfile = (userId) => {
  followDialog.value = false;
  router.push({ name: "UserProfile", params: { userId } });
};

onMounted(() => {
  if (isOwner.value) {
    authStore.fetchFollowing();
    authStore.fetchFollowers();
  }
});

const handleBlock = async () => {
  blockLoading.value = true;
  await authStore.blockUser(props.user._id);
  blockLoading.value = false;
  blockDialog.value = false;
};

const handleFollow = async () => {
  followLoading.value = true;
  await authStore.followUser(props.user._id);
  followLoading.value = false;
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
