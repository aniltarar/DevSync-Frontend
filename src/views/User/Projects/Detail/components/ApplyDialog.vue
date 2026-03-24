<template>
  <v-dialog v-model="dialog" max-width="560" scrollable>
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        color="primary"
        variant="flat"
        rounded="lg"
        prepend-icon="mdi-send-outline"
        :disabled="!hasOpenSlots"
        style="color: white"
      >
        Başvur
      </v-btn>
    </template>

    <v-card rounded="lg">
      <v-card-item class="pa-5">
        <v-card-title class="text-body-1 font-weight-bold">
          Projeye Başvur
        </v-card-title>
        <v-card-subtitle class="mt-1">
          {{ projectTitle }}
        </v-card-subtitle>
        <template #append>
          <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
        </template>
      </v-card-item>

      <v-divider />

      <v-card-text class="pa-5">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Başvurmak istediğiniz pozisyonu seçin.
        </p>

        <div class="d-flex flex-column ga-3">
          <v-card
            v-for="slot in openSlots"
            :key="slot._id"
            border
            flat
            rounded="lg"
            :class="[
              'slot-card pa-4 cursor-pointer',
              selectedSlotId === slot._id ? 'slot-card--selected' : '',
            ]"
            @click="selectedSlotId = slot._id"
          >
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-2">
                <v-icon color="success" size="18">
                  mdi-account-plus-outline
                </v-icon>
                <span class="text-body-2 font-weight-medium">
                  {{ slot.roleName }}
                </span>
              </div>
              <div class="d-flex align-center ga-2">
                <v-chip color="success" size="small" variant="tonal">
                  {{ slot.filledBy.length }}/{{ slot.quota }} dolu
                </v-chip>
                <v-icon
                  v-if="selectedSlotId === slot._id"
                  color="primary"
                  size="20"
                >
                  mdi-check-circle
                </v-icon>
                <v-icon v-else color="medium-emphasis" size="20">
                  mdi-circle-outline
                </v-icon>
              </div>
            </div>

            <div v-if="slot.requiredSkills.length" class="mt-3">
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

            <div v-if="slot.optionalSkills.length" class="mt-2">
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
          </v-card>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" rounded="lg" @click="close">İptal</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          :disabled="!selectedSlotId"
          :loading="applicationStore.status === 'loading'"
          style="color: white"
          @click="submit"
        >
          Başvur
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useApplicationStore } from "@/stores/application";

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  projectTitle: {
    type: String,
    default: "",
  },
  slots: {
    type: Array,
    default: () => [],
  },
});

const applicationStore = useApplicationStore();

const dialog = ref(false);
const selectedSlotId = ref(null);

const openSlots = computed(() =>
  props.slots.filter((s) => s.status === "open"),
);

const hasOpenSlots = computed(() => openSlots.value.length > 0);

function close() {
  dialog.value = false;
  selectedSlotId.value = null;
}

async function submit() {
  if (!selectedSlotId.value) return;
  const success = await applicationStore.applyToProject({
    projectId: props.projectId,
    slotId: selectedSlotId.value,
  });
  if (success) close();
}
</script>

<style scoped>
.slot-card {
  transition: border-color 0.2s, background-color 0.2s;
}

.slot-card--selected {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
