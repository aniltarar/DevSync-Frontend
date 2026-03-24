<template>
  <v-dialog v-model="dialog" max-width="400">
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        icon="mdi-delete-outline"
        variant="text"
        size="x-small"
        color="error"
      />
    </template>

    <v-card rounded="lg">
      <v-card-item class="pa-5">
        <template #prepend>
          <v-avatar class="bg-error" size="40" rounded="lg">
            <v-icon color="white">mdi-alert-outline</v-icon>
          </v-avatar>
        </template>
        <v-card-title class="text-body-1 font-weight-bold">
          Slot Sil
        </v-card-title>
        <v-card-subtitle class="mt-1">
          Bu işlem geri alınamaz.
        </v-card-subtitle>
      </v-card-item>

      <v-card-text class="px-5 pb-2">
        <p class="text-body-2 text-medium-emphasis">
          <strong>{{ slotName }}</strong> slotunu silmek istediğinize emin misiniz?
        </p>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" rounded="lg" @click="dialog = false">
          Vazgeç
        </v-btn>
        <v-btn
          class="bg-error"
          variant="flat"
          rounded="lg"
          :loading="loading"
          @click="confirm"
        >
          Sil
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useProjectStore } from "@/stores/project";

const props = defineProps({
  projectId: { type: String, required: true },
  slotId: { type: String, required: true },
  slotName: { type: String, default: "" },
});

const projectStore = useProjectStore();
const dialog = ref(false);
const loading = ref(false);

async function confirm() {
  loading.value = true;
  await projectStore.deleteSlot(props.projectId, props.slotId);
  loading.value = false;
  dialog.value = false;
}
</script>
