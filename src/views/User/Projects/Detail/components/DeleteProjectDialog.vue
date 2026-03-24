<template>
  <v-dialog v-model="dialog" max-width="400">
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        class="bg-error"
        variant="flat"
        rounded="lg"
        prepend-icon="mdi-delete-outline"
      >
        Projeyi Sil
      </v-btn>
    </template>

    <v-card rounded="lg">
      <v-card-item class="pa-5">
        <template #prepend>
          <v-avatar class="bg-error" size="40" rounded="lg">
            <v-icon color="white">mdi-alert-outline</v-icon>
          </v-avatar>
        </template>
        <v-card-title class="text-body-1 font-weight-bold">
          Projeyi Sil
        </v-card-title>
        <v-card-subtitle class="mt-1">
          Bu işlem geri alınamaz.
        </v-card-subtitle>
      </v-card-item>

      <v-card-text class="px-5 pb-2">
        <p class="text-body-2 text-medium-emphasis">
          <strong>{{ projectTitle }}</strong> projesini ve tüm slotlarını kalıcı olarak
          silmek istediğinize emin misiniz?
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
import { useRouter } from "vue-router";
import { useProjectStore } from "@/stores/project";

const props = defineProps({
  projectId: { type: String, required: true },
  projectTitle: { type: String, default: "" },
});

const projectStore = useProjectStore();
const router = useRouter();
const dialog = ref(false);
const loading = ref(false);

async function confirm() {
  loading.value = true;
  const success = await projectStore.deleteProject(props.projectId);
  loading.value = false;
  dialog.value = false;
  if (success) router.push({ name: "Projects" });
}
</script>
