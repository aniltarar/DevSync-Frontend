<template>
  <v-card rounded="lg" border flat class="h-100 d-flex flex-column">
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

      <v-card-subtitle class="d-flex align-center ga-1 mt-1">
        <v-avatar
          :image="project.ownerId.profile.avatarUrl || undefined"
          :color="!project.ownerId.profile.avatarUrl ? 'secondary' : undefined"
          size="18"
          class="mr-1"
        >
          <span v-if="!project.ownerId.profile.avatarUrl" class="text-caption">
            {{ project.ownerId.profile.name?.charAt(0) }}
          </span>
        </v-avatar>
        {{ project.ownerId.profile.name }} {{ project.ownerId.profile.surname }}
      </v-card-subtitle>

      <template #append>
        <v-chip :color="statusColor" size="x-small" variant="tonal">
          {{ statusLabel }}
        </v-chip>
      </template>
    </v-card-item>

    <!-- Description -->
    <v-card-text class="text-body-2 text-medium-emphasis flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
      {{ project.description }}
    </v-card-text>

    <!-- Chips: category & type -->
    <v-card-text class="pt-0 d-flex flex-wrap ga-1">
      <v-chip size="x-small" variant="tonal" color="primary" prepend-icon="mdi-tag-outline">
        {{ categoryLabel }}
      </v-chip>
      <v-chip size="x-small" variant="tonal" color="secondary" prepend-icon="mdi-account-group-outline">
        {{ project.projectType === 'team' ? 'Takım' : 'Solo' }}
      </v-chip>
    </v-card-text>

    <v-divider />

    <!-- Slots özeti -->
    <v-card-text class="py-3">
      <div class="text-caption text-medium-emphasis mb-2">Açık Pozisyonlar</div>
      <div class="d-flex flex-wrap ga-1">
        <v-chip
          v-for="slot in openSlots"
          :key="slot._id"
          size="x-small"
          variant="outlined"
          color="success"
          prepend-icon="mdi-account-plus-outline"
        >
          {{ slot.roleName }}
        </v-chip>
        <span v-if="openSlots.length === 0" class="text-caption text-disabled">
          Tüm pozisyonlar dolu
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
        size="small"
        color="primary"
        variant="tonal"
        rounded="lg"
        :to="`/projects/${project._id}`"
      >
        İncele
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const openSlots = computed(() =>
  props.project.slots.filter((s) => s.status === 'open')
);

const statusColor = computed(() => {
  const map = { draft: 'warning', active: 'success', closed: 'error', archived: 'default' };
  return map[props.project.status] ?? 'default';
});

const statusLabel = computed(() => {
  const map = { draft: 'Taslak', active: 'Aktif', closed: 'Kapalı', archived: 'Arşiv' };
  return map[props.project.status] ?? props.project.status;
});

const categoryLabel = computed(() => {
  const map = {
    web: 'Web',
    mobile: 'Mobil',
    desktop: 'Masaüstü',
    ai: 'Yapay Zeka',
    game: 'Oyun',
    other: 'Diğer',
  };
  return map[props.project.category] ?? props.project.category;
});

const formattedDate = computed(() =>
  new Date(props.project.createdAt).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
);
</script>
