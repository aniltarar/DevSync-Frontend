<template>
  <v-card
    rounded="lg"
    border
    flat
    class="h-100 d-flex flex-column"
    :to="`/projects/${project._id}`"
    style="cursor: pointer"
  >
    <!-- Header -->
    <v-card-item>
      <template #prepend>
        <v-avatar color="primary" variant="tonal" size="40" rounded="md">
          <v-icon>mdi-folder-open</v-icon>
        </v-avatar>
      </template>

      <v-card-title class="text-body-1 font-weight-bold">
        {{ project.title }}
      </v-card-title>

      <v-card-subtitle
        v-if="ownerProfile"
        class="d-flex align-center ga-1 mt-1"
      >
        <v-avatar
          :image="ownerProfile.avatarUrl || undefined"
          :color="!ownerProfile.avatarUrl ? 'secondary' : undefined"
          size="18"
          class="mr-1"
        >
          <span v-if="!ownerProfile.avatarUrl" class="text-caption">
            {{ ownerProfile.name?.charAt(0) }}
          </span>
        </v-avatar>
        {{ ownerProfile.name }} {{ ownerProfile.surname }}
      </v-card-subtitle>

      <template #append>
        <v-chip :color="statusColor" size="x-small" variant="tonal">
          {{ statusLabel }}
        </v-chip>
      </template>
    </v-card-item>

    <!-- Description -->
    <v-card-text
      class="text-body-2 text-medium-emphasis flex-grow-1"
      style="
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      "
    >
      {{ project.description }}
    </v-card-text>

    <!-- Chips: category & type -->
    <v-card-text class="pt-0 d-flex flex-wrap ga-1">
      <v-chip
        size="x-small"
        variant="tonal"
        color="primary"
        prepend-icon="mdi-tag-outline"
      >
        {{ categoryLabel }}
      </v-chip>
      <v-chip
        size="x-small"
        variant="tonal"
        color="secondary"
        prepend-icon="mdi-account-group-outline"
      >
        {{ project.projectType === "team" ? "Takım" : "Solo" }}
      </v-chip>
    </v-card-text>

    <v-divider />

    <!-- Slots özeti -->
    <v-card-text class="py-3">
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-caption text-medium-emphasis">Pozisyonlar</span>
        <span class="text-caption font-weight-medium">
          {{ totalFilled }}/{{ totalQuota }} dolu
        </span>
      </div>
      <div class="d-flex flex-column ga-1">
        <div
          v-for="slot in project.slots"
          :key="slot._id"
          class="d-flex align-center justify-space-between"
        >
          <div class="d-flex align-center ga-1">
            <v-icon
              :color="slot.status === 'open' ? 'success' : 'medium-emphasis'"
              size="12"
            >
              {{
                slot.status === "open"
                  ? "mdi-account-plus-outline"
                  : "mdi-account-check-outline"
              }}
            </v-icon>
            <span class="text-caption">{{ slot.roleName }}</span>
          </div>
          <v-chip
            :color="slot.status === 'open' ? 'success' : 'default'"
            size="large"
            variant="tonal"
          >
            {{ slot.filledBy.length }}/{{ slot.quota }}
          </v-chip>
        </div>
        <span
          v-if="project.slots.length === 0"
          class="text-caption text-disabled"
        >
          Slot tanımlanmamış
        </span>
      </div>
    </v-card-text>

    <!-- Footer -->
    <v-card-actions class="pt-0 px-4 pb-4">
      <div class="text-caption text-disabled">
        <v-icon size="14" class="mr-1">mdi-calendar-outline</v-icon>
        {{ formattedDate }}
      </div>
      <v-spacer />
      <v-btn
        v-if="!isOwner"
        icon="mdi-flag-outline"
        variant="text"
        size="small"
        class="text-medium-emphasis"
        @click.prevent="reportDialog = true"
      />
      <v-btn
        size="small"
        color="primary"
        variant="tonal"
        rounded="lg"
        append-icon="mdi-arrow-right"
      >
        İncele
      </v-btn>
    </v-card-actions>
  </v-card>

  <ReportDialog
    v-model="reportDialog"
    report-type="project"
    :content-id="project._id"
  />
</template>

<script setup>
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import ReportDialog from "@/components/ReportDialog.vue";

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const authStore = useAuthStore();
const reportDialog = ref(false);

const isOwner = computed(() => {
  const ownerId =
    typeof props.project.ownerId === "object"
      ? props.project.ownerId._id
      : props.project.ownerId;
  return authStore.user?._id === ownerId;
});

const ownerProfile = computed(() =>
  typeof props.project.ownerId === "object"
    ? props.project.ownerId.profile
    : null,
);

const totalQuota = computed(() =>
  props.project.slots.reduce((sum, s) => sum + s.quota, 0),
);

const totalFilled = computed(() =>
  props.project.slots.reduce((sum, s) => sum + s.filledBy.length, 0),
);

const statusColor = computed(() => {
  const map = {
    draft: "warning",
    pending: "info",
    active: "success",
    closed: "error",
    rejected: "error",
  };
  return map[props.project.status] ?? "default";
});

const statusLabel = computed(() => {
  const map = {
    draft: "Taslak",
    pending: "Beklemede",
    active: "Aktif",
    closed: "Kapalı",
    rejected: "Reddedildi",
  };
  return map[props.project.status] ?? props.project.status;
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
  return map[props.project.category] ?? props.project.category;
});

const formattedDate = computed(() =>
  new Date(props.project.createdAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
);
</script>
