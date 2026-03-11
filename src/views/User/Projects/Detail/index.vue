<template>
  <!-- Geri butonu -->
  <v-btn
    variant="text"
    prepend-icon="mdi-arrow-left"
    class="mb-4 pa-2"
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
          <v-chip :color="statusColor" variant="tonal" size="small">
            {{ statusLabel }}
          </v-chip>
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

    <!-- Slots Card -->
    <v-card rounded="lg" border flat>
      <v-card-item>
        <v-card-title class="text-body-1 font-weight-bold">
          Açık Pozisyonlar
        </v-card-title>
        <template #append>
          <span class="text-caption text-medium-emphasis">
            {{ totalFilled }}/{{ totalQuota }} dolu
          </span>
        </template>
      </v-card-item>

      <v-divider />

      <v-card-text class="pa-0">
        <div v-for="(slot, index) in project.slots" :key="slot._id">
          <div class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center ga-2">
                <v-icon
                  :color="
                    slot.status === 'open' ? 'success' : 'medium-emphasis'
                  "
                  size="18"
                >
                  {{
                    slot.status === "open"
                      ? "mdi-account-plus-outline"
                      : "mdi-account-check-outline"
                  }}
                </v-icon>
                <span class="text-body-2 font-weight-medium">{{
                  slot.roleName
                }}</span>
              </div>
              <div class="d-flex align-center ga-2">
                <v-chip
                  :color="slot.status === 'open' ? 'success' : 'default'"
                  size="large"
                  variant="tonal"
                >
                  {{ slot.filledBy.length }}/{{ slot.quota }} dolu
                </v-chip>
                <v-chip
                  :color="slot.status === 'open' ? 'success' : 'default'"
                  size="large"
                  variant="outlined"
                >
                  {{ slot.status === "open" ? "Açık" : "Dolu" }}
                </v-chip>
              </div>
            </div>

            <div v-if="slot.requiredSkills.length" class="mb-2">
              <span class="text-caption text-medium-emphasis d-block mb-1"
                >Gerekli Beceriler</span
              >
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="skill in slot.requiredSkills"
                  :key="skill"
                  size="large"
                  color="primary"
                  variant="tonal"
                >
                  {{ skill }}
                </v-chip>
              </div>
            </div>

            <div v-if="slot.optionalSkills.length">
              <span class="text-caption text-medium-emphasis d-block mb-1"
                >Tercih Edilen Beceriler</span
              >
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="skill in slot.optionalSkills"
                  :key="skill"
                  size="large"
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
          <p class="text-caption text-disabled">
            Bu proje için henüz slot tanımlanmamış.
          </p>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          prepend-icon="mdi-send-outline"
          :disabled="totalFilled >= totalQuota"
          style="color: white"
        >
          Başvur
        </v-btn>
      </v-card-actions>
    </v-card>
  </template>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useProjectStore } from "@/stores/projectStore";

const route = useRoute();
const projectStore = useProjectStore();

onMounted(() => {
  projectStore.fetchProjectById(route.params.projectId);
});

const project = computed(() => projectStore.project);

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
