<template>
  <v-dialog v-model="dialog" max-width="560" scrollable>
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        variant="tonal"
        color="primary"
        rounded="lg"
        prepend-icon="mdi-pencil-outline"
      >
        Düzenle
      </v-btn>
    </template>

    <v-card rounded="lg">
      <v-card-item class="pa-5">
        <v-card-title class="text-body-1 font-weight-bold">
          Projeyi Düzenle
        </v-card-title>
        <template #append>
          <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
        </template>
      </v-card-item>

      <v-divider />

      <v-card-text class="pa-5">
        <v-form ref="formRef" class="d-flex flex-column ga-2">
          <v-text-field
            v-model="form.title"
            label="Proje Adı"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            :rules="[rules.required]"
          />

          <v-textarea
            v-model="form.description"
            label="Açıklama"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            rows="4"
            auto-grow
          />

          <v-select
            v-model="form.category"
            :items="categoryOptions"
            label="Kategori"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            :rules="[rules.required]"
          />

          <v-select
            v-model="form.projectType"
            :items="projectTypeOptions"
            label="Proje Tipi"
            variant="outlined"
            density="comfortable"
            rounded="lg"
          />

          <v-select
            v-model="form.status"
            :items="statusOptions"
            label="Durum"
            variant="outlined"
            density="comfortable"
            rounded="lg"
          />
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" rounded="lg" @click="close">İptal</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          style="color: white"
          :loading="projectStore.status === 'loading'"
          @click="submit"
        >
          Kaydet
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { useProjectStore } from "@/stores/project";

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const projectStore = useProjectStore();
const dialog = ref(false);
const formRef = ref(null);

const categoryOptions = [
  { title: "Web", value: "web" },
  { title: "Mobil", value: "mobile" },
  { title: "Masaüstü", value: "desktop" },
  { title: "Yapay Zeka", value: "ai" },
  { title: "Oyun", value: "game" },
  { title: "DevOps", value: "devops" },
  { title: "Diğer", value: "other" },
];

const projectTypeOptions = [
  { title: "Takım", value: "team" },
  { title: "Bireysel", value: "personal" },
  { title: "Açık Kaynak", value: "open-source" },
  { title: "Freelance", value: "freelance" },
];

const statusOptions = [
  { title: "Taslak", value: "draft" },
  { title: "Aktif", value: "active" },
  { title: "Kapalı", value: "closed" },
];

const form = reactive({
  title: "",
  description: "",
  category: null,
  projectType: null,
  status: null,
});

const rules = {
  required: (v) => !!v || "Bu alan zorunludur.",
};

watch(dialog, (val) => {
  if (val) {
    form.title = props.project.title;
    form.description = props.project.description;
    form.category = props.project.category;
    form.projectType = props.project.projectType;
    form.status = props.project.status;
  }
});

function close() {
  dialog.value = false;
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const success = await projectStore.updateProject(props.project._id, {
    title: form.title,
    description: form.description,
    category: form.category,
    projectType: form.projectType,
    status: form.status,
  });

  if (success) close();
}
</script>
