<template>
  <v-card rounded="lg" elevation="0" border>
    <v-card-item>
      <template #prepend>
        <v-avatar color="primary" variant="tonal" size="36" rounded="md">
          <v-icon size="20">mdi-folder</v-icon>
        </v-avatar>
      </template>
      <v-card-title class="text-body-1 font-weight-medium">{{ project.title }}</v-card-title>
      <v-card-subtitle class="text-caption">{{ categoryLabel }} · {{ typeLabel }}</v-card-subtitle>
      <template #append>
        <v-chip :color="statusColor" size="x-small" variant="tonal" label>
          {{ statusLabel }}
        </v-chip>
      </template>
    </v-card-item>

    <v-card-text class="pt-0">
      <p class="text-body-2 text-medium-emphasis">{{ project.description }}</p>

      <div class="mt-3 d-flex flex-column ga-2">
        <v-sheet
          v-for="slot in project.slots"
          :key="slot._id"
          :color="slot.status === 'open' ? 'backgroundOverlay' : 'surface'"
          rounded="lg"
          border
          class="d-flex align-center justify-space-between pa-2"
        >
          <div>
            <span class="text-caption font-weight-medium">{{ slot.roleName }}</span>
            <div class="d-flex flex-wrap ga-1 mt-1">
              <v-chip
                v-for="skill in slot.requiredSkills"
                :key="skill"
                size="x-small"
                variant="tonal"
                color="secondary"
                label
              >
                {{ skill }}
              </v-chip>
            </div>
          </div>
          <div class="d-flex flex-column align-end ms-2">
            <v-chip
              :color="slot.status === 'open' ? 'success' : 'accent'"
              size="x-small"
              variant="tonal"
              label
            >
              {{ slot.status === 'open' ? 'Açık' : 'Dolu' }}
            </v-chip>
            <span class="text-caption text-medium-emphasis mt-1">
              {{ slot.filledBy.length }}/{{ slot.quota }}
            </span>
          </div>
        </v-sheet>
      </div>
    </v-card-text>

    <v-card-actions class="px-4 pb-3 pt-0">
      <span class="text-caption text-medium-emphasis">
        {{ formatDate(project.createdAt) }}
      </span>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { formatDate } from '@/utils/formatDate';
import { statusMap, categoryMap, typeMap } from '@/constants/project';

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const statusLabel = computed(() => statusMap[props.project.status]?.label ?? props.project.status);
const statusColor = computed(() => statusMap[props.project.status]?.color ?? 'default');
const categoryLabel = computed(() => categoryMap[props.project.category] ?? props.project.category);
const typeLabel = computed(() => typeMap[props.project.projectType] ?? props.project.projectType);
</script>
