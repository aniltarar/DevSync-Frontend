<template>
  <v-card border flat rounded="lg">
    <v-card-item
      class="cursor-pointer"
      @click="expanded = !expanded"
    >
      <template #prepend>
        <v-icon
          :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          size="small"
        />
      </template>

      <v-card-title class="text-body-2 font-weight-medium">
        {{ slotData.roleName }}
      </v-card-title>

      <v-card-subtitle class="text-caption">
        Kontenjan: {{ slotData.quota }}
      </v-card-subtitle>

      <template #append>
        <v-btn
          icon="mdi-pencil-outline"
          variant="text"
          size="x-small"
          color="primary"
          @click.stop="$emit('edit')"
        />
        <v-btn
          icon="mdi-close"
          variant="text"
          size="x-small"
          color="error"
          @click.stop="$emit('remove')"
        />
      </template>
    </v-card-item>

    <v-expand-transition>
      <div v-show="expanded">
        <v-divider />

        <v-card-text class="d-flex flex-column ga-2 text-body-2">
          <div>
            <span class="font-weight-medium">Gerekli Beceriler:</span>
            <div class="d-flex flex-wrap ga-1 mt-1">
              <v-chip
                v-for="skill in slotData.requiredSkills"
                :key="skill"
                size="small"
                color="primary"
                variant="tonal"
              >
                {{ skill }}
              </v-chip>
            </div>
          </div>

          <div v-if="slotData.optionalSkills?.length">
            <span class="font-weight-medium">Tercih Edilen Beceriler:</span>
            <div class="d-flex flex-wrap ga-1 mt-1">
              <v-chip
                v-for="skill in slotData.optionalSkills"
                :key="skill"
                size="small"
                variant="tonal"
              >
                {{ skill }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  slotData: {
    type: Object,
    required: true,
  },
});

defineEmits(["edit", "remove"]);

const expanded = ref(false);
</script>
