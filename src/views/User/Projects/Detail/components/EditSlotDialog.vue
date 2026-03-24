<template>
  <v-dialog v-model="dialog" max-width="520" scrollable>
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        icon="mdi-pencil-outline"
        variant="text"
        size="x-small"
        color="primary"
      />
    </template>

    <v-card rounded="lg">
      <v-card-item class="pa-5">
        <v-card-title class="text-body-1 font-weight-bold">
          Slot Düzenle
        </v-card-title>
        <template #append>
          <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
        </template>
      </v-card-item>

      <v-divider />

      <v-card-text class="pa-5">
        <v-form ref="formRef" class="d-flex flex-column ga-2">
          <v-text-field
            v-model="form.roleName"
            label="Rol Adı"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            :rules="[rules.required]"
          />

          <v-combobox
            v-model="form.requiredSkills"
            label="Gerekli Beceriler"
            placeholder="Beceri yazıp Enter'a basın"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            multiple
            chips
            closable-chips
            :rules="[rules.minOne]"
          />

          <v-combobox
            v-model="form.optionalSkills"
            label="Tercih Edilen Beceriler"
            placeholder="Beceri yazıp Enter'a basın"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            multiple
            chips
            closable-chips
          />

          <v-text-field
            v-model.number="form.quota"
            label="Kontenjan"
            type="number"
            min="1"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            :rules="[rules.required, rules.minQuota]"
          />

          <v-select
            v-model="form.status"
            :items="slotStatusOptions"
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
  projectId: {
    type: String,
    required: true,
  },
  slotData: {
    type: Object,
    required: true,
  },
});

const projectStore = useProjectStore();
const dialog = ref(false);
const formRef = ref(null);

const slotStatusOptions = [
  { title: "Açık", value: "open" },
  { title: "Dolu", value: "filled" },
];

const form = reactive({
  roleName: "",
  requiredSkills: [],
  optionalSkills: [],
  quota: 1,
  status: "open",
});

const rules = {
  required: (v) => !!v || "Bu alan zorunludur.",
  minOne: (v) => (v && v.length > 0) || "En az bir beceri ekleyin.",
  minQuota: (v) => (v && v >= 1) || "Kontenjan en az 1 olmalıdır.",
};

watch(dialog, (val) => {
  if (val) {
    form.roleName = props.slotData.roleName;
    form.requiredSkills = [...props.slotData.requiredSkills];
    form.optionalSkills = [...props.slotData.optionalSkills];
    form.quota = props.slotData.quota;
    form.status = props.slotData.status;
  }
});

function close() {
  dialog.value = false;
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const success = await projectStore.updateSlot(
    props.projectId,
    props.slotData._id,
    {
      roleName: form.roleName,
      requiredSkills: form.requiredSkills,
      optionalSkills: form.optionalSkills,
      quota: form.quota,
      status: form.status,
    },
  );

  if (success) close();
}
</script>
