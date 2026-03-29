<template>
  <v-dialog v-model="dialog" max-width="520" scrollable>
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        variant="tonal"
        color="primary"
        size="small"
        rounded="lg"
        prepend-icon="mdi-plus"
      >
        Slot Ekle
      </v-btn>
    </template>

    <v-card rounded="lg">
      <v-card-item class="pa-5">
        <v-card-title class="text-body-1 font-weight-bold">
          {{ editIndex !== null ? "Slot Düzenle" : "Yeni Slot Ekle" }}
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
            placeholder="Ör: Frontend Developer"
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
          @click="submit"
        >
          {{ editIndex !== null ? "Kaydet" : "Ekle" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive } from "vue";

const emit = defineEmits(["add", "update"]);

const dialog = ref(false);
const formRef = ref(null);
const editIndex = ref(null);

const defaultForm = {
  roleName: "",
  requiredSkills: [],
  optionalSkills: [],
  quota: 1,
};

const form = reactive({ ...defaultForm });

const rules = {
  required: (v) => !!v || "Bu alan zorunludur.",
  minOne: (v) => (v && v.length > 0) || "En az bir beceri ekleyin.",
  minQuota: (v) => (v && v >= 1) || "Kontenjan en az 1 olmalıdır.",
};

function open(slotData = null, index = null) {
  editIndex.value = index;
  if (slotData) {
    Object.assign(form, {
      roleName: slotData.roleName,
      requiredSkills: [...slotData.requiredSkills],
      optionalSkills: [...(slotData.optionalSkills || [])],
      quota: slotData.quota,
    });
  } else {
    Object.assign(form, { ...defaultForm, requiredSkills: [], optionalSkills: [] });
  }
  dialog.value = true;
}

function close() {
  dialog.value = false;
  editIndex.value = null;
  Object.assign(form, { ...defaultForm, requiredSkills: [], optionalSkills: [] });
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const slotData = {
    roleName: form.roleName,
    requiredSkills: [...form.requiredSkills],
    optionalSkills: [...form.optionalSkills],
    quota: form.quota,
  };

  if (editIndex.value !== null) {
    emit("update", editIndex.value, slotData);
  } else {
    emit("add", slotData);
  }
  close();
}

defineExpose({ open });
</script>
