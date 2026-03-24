<template>
  <v-card border flat rounded="lg" class="pa-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <span class="text-body-2 font-weight-medium">
        Slot {{ index + 1 }}
      </span>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="x-small"
        color="error"
        @click="$emit('remove')"
      />
    </div>

    <v-text-field
      v-model="slotData.roleName"
      label="Rol Adı"
      placeholder="Ör: Frontend Developer"
      variant="outlined"
      density="comfortable"
      rounded="lg"
      :rules="[rules.required]"
      class="mb-2"
    />

    <v-combobox
      v-model="slotData.requiredSkills"
      label="Gerekli Beceriler"
      placeholder="Beceri yazıp Enter'a basın"
      variant="outlined"
      density="comfortable"
      rounded="lg"
      multiple
      chips
      closable-chips
      :rules="[rules.minOne]"
      class="mb-2"
    />

    <v-combobox
      v-model="slotData.optionalSkills"
      label="Tercih Edilen Beceriler"
      placeholder="Beceri yazıp Enter'a basın"
      variant="outlined"
      density="comfortable"
      rounded="lg"
      multiple
      chips
      closable-chips
      class="mb-2"
    />

    <v-text-field
      v-model.number="slotData.quota"
      label="Kontenjan"
      type="number"
      min="1"
      variant="outlined"
      density="comfortable"
      rounded="lg"
      :rules="[rules.required, rules.minQuota]"
    />
  </v-card>
</template>

<script setup>
defineProps({
  slotData: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

defineEmits(["remove"]);

const rules = {
  required: (v) => !!v || "Bu alan zorunludur.",
  minOne: (v) => (v && v.length > 0) || "En az bir beceri ekleyin.",
  minQuota: (v) => (v && v >= 1) || "Kontenjan en az 1 olmalıdır.",
};
</script>
