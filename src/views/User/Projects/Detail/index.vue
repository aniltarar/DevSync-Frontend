<template>
  <div>
  <!-- Geri butonu -->
  <v-btn
    variant="text"
    prepend-icon="mdi-arrow-left"
    class="mb-4 pa-2 align-self-start"
    :to="{ name: 'Projects' }"
  >
    Projelere Dön
  </v-btn>

  <!-- Loading -->
  <template v-if="projectStore.status === 'loading'">
    <v-skeleton-loader type="article" rounded="lg" class="mb-4" />
    <v-skeleton-loader type="article" rounded="lg" />
  </template>

  <!-- Hata -->
  <div v-else-if="projectStore.status === 'error'" class="text-center py-16">
    <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
    <p class="text-body-1 mt-4">{{ projectStore.message }}</p>
    <v-btn
      class="mt-4"
      color="primary"
      variant="tonal"
      :to="{ name: 'Projects' }"
    >
      Geri Dön
    </v-btn>
  </div>

  <!-- İçerik -->
  <template v-else-if="project">
    <!-- Header Card -->
    <v-card rounded="lg" border flat class="mb-4">
      <v-card-item>
        <template #prepend>
          <v-avatar color="primary" variant="tonal" size="48" rounded="md">
            <v-icon size="24">mdi-folder-open</v-icon>
          </v-avatar>
        </template>

        <v-card-title class="text-h6 font-weight-bold">
          {{ project.title }}
        </v-card-title>

        <v-card-subtitle class="d-flex align-center ga-1 mt-1">
          <v-avatar
            :image="project.ownerId.profile.avatarUrl || undefined"
            :color="
              !project.ownerId.profile.avatarUrl ? 'secondary' : undefined
            "
            size="18"
            class="mr-1"
          >
            <span
              v-if="!project.ownerId.profile.avatarUrl"
              class="text-caption"
            >
              {{ project.ownerId.profile.name?.charAt(0) }}
            </span>
          </v-avatar>
          {{ project.ownerId.profile.name }}
          {{ project.ownerId.profile.surname }}
          <span class="text-disabled mx-1">·</span>
          <v-icon size="13" class="mr-1">mdi-calendar-outline</v-icon>
          {{ formattedDate }}
        </v-card-subtitle>

        <template #append>
          <div class="d-flex align-center ga-2">
            <v-chip :color="statusColor" variant="tonal">
              {{ statusLabel }}
            </v-chip>
            <EditProjectDialog v-if="isOwner" :project="project" />
          </div>
        </template>
      </v-card-item>

      <v-card-text>
        <div class="d-flex flex-wrap ga-2 mb-4">
          <v-chip
            size="large"
            variant="tonal"
            color="primary"
            prepend-icon="mdi-tag-outline"
          >
            {{ categoryLabel }}
          </v-chip>
          <v-chip
            size="large"
            variant="tonal"
            color="secondary"
            prepend-icon="mdi-account-group-outline"
          >
            {{
              project.projectType === "team" ? "Takım Projesi" : "Solo Proje"
            }}
          </v-chip>
        </div>

        <p
          class="text-body-2 text-medium-emphasis"
          style="white-space: pre-line"
        >
          {{ project.description }}
        </p>
      </v-card-text>
    </v-card>

    <!-- Proje Ekibi Card (sadece üye varsa göster) -->
    <v-card v-if="projectMembers.length > 0" rounded="lg" border flat class="mb-4">
      <v-card-item>
        <v-card-title class="text-body-1 font-weight-bold">Proje Ekibi</v-card-title>
        <template #append>
          <span class="text-caption text-medium-emphasis">{{ projectMembers.length }} üye</span>
        </template>
      </v-card-item>
      <v-divider />
      <v-card-text class="pa-3">
        <div class="d-flex flex-wrap ga-3">
          <div
            v-for="member in projectMembers"
            :key="member.user._id"
            class="d-flex align-center ga-2 pa-2 rounded-lg member-chip"
          >
            <v-avatar size="36" color="primary" variant="tonal">
              <v-img v-if="member.user.profile?.avatarUrl" :src="member.user.profile.avatarUrl" />
              <span v-else class="text-caption font-weight-bold">
                {{ (member.user.profile?.name?.[0] || member.user.username?.[0] || '?').toUpperCase() }}
              </span>
            </v-avatar>
            <div>
              <div class="d-flex align-center ga-1">
                <span class="text-body-2 font-weight-medium">
                  {{ member.user.profile?.name }} {{ member.user.profile?.surname }}
                </span>
                <v-chip v-if="member.isOwner" size="x-small" color="warning" variant="tonal">Kurucu</v-chip>
              </div>
              <span class="text-caption text-medium-emphasis">{{ member.roleName }}</span>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Slots Card -->
    <v-card rounded="lg" border flat>
      <v-card-item>
        <v-card-title class="text-body-1 font-weight-bold">
          Açık Pozisyonlar
        </v-card-title>
        <template #append>
          <div class="d-flex align-center ga-2">
            <span class="text-caption text-medium-emphasis">
              {{ totalFilled }}/{{ totalQuota }} dolu
            </span>
            <AddSlotDialog v-if="isOwner" :project-id="project._id" />
          </div>
        </template>
      </v-card-item>

      <v-divider />

      <v-card-text class="pa-0">
        <div v-for="(slot, index) in project.slots" :key="slot._id">
          <div class="pa-4">
            <!-- Slot Header -->
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center ga-2">
                <v-avatar
                  :color="slot.status === 'open' ? 'success' : 'grey'"
                  variant="tonal"
                  size="32"
                  rounded="md"
                >
                  <v-icon size="16">
                    {{
                      slot.status === "open"
                        ? "mdi-account-plus-outline"
                        : "mdi-account-check-outline"
                    }}
                  </v-icon>
                </v-avatar>
                <div>
                  <span class="text-body-2 font-weight-medium">
                    {{ slot.roleName }}
                  </span>
                  <div class="d-flex align-center ga-2 mt-1">
                    <v-chip
                      :color="slot.status === 'open' ? 'success' : 'default'"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ slot.status === "open" ? "Açık" : "Dolu" }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">
                      {{ slot.filledBy.length }}/{{ slot.quota }} dolu
                    </span>
                  </div>
                </div>
              </div>

              <!-- Owner Actions -->
              <div v-if="isOwner" class="d-flex align-center ga-1">
                <EditSlotDialog :project-id="project._id" :slot-data="slot" />
                <DeleteSlotDialog
                  :project-id="project._id"
                  :slot-id="slot._id"
                  :slot-name="slot.roleName"
                />
              </div>
            </div>

            <!-- Skills -->
            <div v-if="slot.requiredSkills.length" class="mb-2">
              <span class="text-caption text-medium-emphasis d-block mb-1">
                Gerekli Beceriler
              </span>
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="skill in slot.requiredSkills"
                  :key="skill"
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  {{ skill }}
                </v-chip>
              </div>
            </div>

            <div v-if="slot.optionalSkills.length">
              <span class="text-caption text-medium-emphasis d-block mb-1">
                Tercih Edilen Beceriler
              </span>
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="skill in slot.optionalSkills"
                  :key="skill"
                  size="small"
                  variant="outlined"
                >
                  {{ skill }}
                </v-chip>
              </div>
            </div>
          </div>
          <v-divider v-if="index < project.slots.length - 1" />
        </div>

        <div v-if="!project.slots.length" class="pa-6 text-center">
          <v-icon size="40" color="medium-emphasis" class="mb-2">
            mdi-account-group-outline
          </v-icon>
          <p class="text-body-2 text-medium-emphasis">
            Bu proje için henüz pozisyon tanımlanmamış.
          </p>
          <AddSlotDialog
            v-if="isOwner"
            :project-id="project._id"
            class="mt-3"
          />
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="d-flex align-center justify-space-between pa-4 ga-4 flex-wrap">
        <v-btn
          v-if="isOwner"
          variant="tonal"
          color="secondary"
          rounded="lg"
          prepend-icon="mdi-clipboard-list-outline"
          :to="{
            name: 'ProjectApplications',
            params: { projectId: project._id },
          }"
        >
          Başvuruları Gör
          <v-badge
            v-if="project.activeApplicationCount"
            :content="project.activeApplicationCount"
            color="primary"
            floating
            offset-x="-4"
            offset-y="-4"
          />
        </v-btn>
        <DeleteProjectDialog
          v-if="isOwner"
          :project-id="project._id"
          :project-title="project.title"
        />
        <v-spacer />
        <v-btn
          v-if="canAccessProjectChat"
          variant="tonal"
          color="primary"
          rounded="lg"
          prepend-icon="mdi-message-text-outline"
          :loading="projectChatLoading"
          @click="openProjectChat"
        >
          Proje Sohbeti
        </v-btn>
        <ApplyDialog
          v-if="!isOwner"
          :project-id="project._id"
          :project-title="project.title"
          :slots="project.slots"
        />
      </v-card-actions>
    </v-card>
  </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectStore } from "@/stores/project";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import ApplyDialog from "./components/ApplyDialog.vue";
import AddSlotDialog from "./components/AddSlotDialog.vue";
import EditProjectDialog from "./components/EditProjectDialog.vue";
import EditSlotDialog from "./components/EditSlotDialog.vue";
import DeleteSlotDialog from "./components/DeleteSlotDialog.vue";
import DeleteProjectDialog from "./components/DeleteProjectDialog.vue";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();
const chatStore = useChatStore();

const projectChatLoading = ref(false);

onMounted(() => {
  projectStore.fetchProjectById(route.params.projectId);
});

const project = computed(() => projectStore.project);

const isOwner = computed(
  () => project.value?.ownerId?._id === authStore.user?._id,
);

const projectMembers = computed(() => {
  if (!project.value) return [];
  const members = [];
  members.push({
    user: project.value.ownerId,
    roleName: "Proje Sahibi",
    isOwner: true,
  });
  project.value.slots.forEach((slot) => {
    slot.filledBy.forEach((user) => {
      if (!members.find((m) => (m.user._id || m.user) === (user._id || user))) {
        members.push({ user, roleName: slot.roleName, isOwner: false });
      }
    });
  });
  return members;
});

const canAccessProjectChat = computed(() => {
  if (!project.value) return false;
  const userId = authStore.user?._id;
  if (project.value.ownerId?._id === userId) return true;
  return project.value.slots.some((s) =>
    s.filledBy.some((id) => (id._id || id) === userId),
  );
});

async function openProjectChat() {
  projectChatLoading.value = true;
  const conv = await chatStore.createOrGetProjectConversation(project.value._id);
  projectChatLoading.value = false;
  if (conv) {
    router.push({ name: "Messages", query: { conversationId: conv._id } });
  }
}

const totalQuota = computed(
  () => project.value?.slots.reduce((sum, s) => sum + s.quota, 0) ?? 0,
);

const totalFilled = computed(
  () =>
    project.value?.slots.reduce((sum, s) => sum + s.filledBy.length, 0) ?? 0,
);

const statusColor = computed(() => {
  const map = {
    draft: "warning",
    pending: "info",
    active: "success",
    closed: "error",
    rejected: "error",
  };
  return map[project.value?.status] ?? "default";
});

const statusLabel = computed(() => {
  const map = {
    draft: "Taslak",
    pending: "Beklemede",
    active: "Aktif",
    closed: "Kapalı",
    rejected: "Reddedildi",
  };
  return map[project.value?.status] ?? project.value?.status;
});

const categoryLabel = computed(() => {
  const map = {
    web: "Web",
    mobile: "Mobil",
    desktop: "Masaüstü",
    ai: "Yapay Zeka",
    game: "Oyun",
    other: "Diğer",
  };
  return map[project.value?.category] ?? project.value?.category;
});

const formattedDate = computed(() =>
  project.value
    ? new Date(project.value.createdAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "",
);
</script>

<style scoped>
.member-chip {
  background: rgba(var(--v-theme-surface-variant, 128, 128, 128), 0.06);
  border: 1px solid rgba(var(--v-border-color), 0.08);
  transition: background 0.2s;
}
.member-chip:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}
</style>
