<template>
  <v-dialog v-model="open" max-width="480" @after-leave="resetForm">
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center ga-2 pa-5 pb-3">
        <v-icon color="error" size="22">mdi-flag-outline</v-icon>
        <span class="text-body-1 font-weight-bold">Rapor Oluştur</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="open = false" />
      </v-card-title>

      <v-card-text class="pa-5 pt-2">
        <!-- Rapor türü chip'leri (dışarıdan verilmemişse) -->
        <div v-if="!reportType" class="mb-4">
          <p class="text-body-2 font-weight-medium mb-2">Rapor Türü *</p>
          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="opt in reportTypeOptions"
              :key="opt.value"
              :variant="form.reportType === opt.value ? 'flat' : 'tonal'"
              :color="form.reportType === opt.value ? 'primary' : undefined"
              :prepend-icon="opt.icon"
              size="default"
              class="cursor-pointer"
              @click="form.reportType = opt.value; form.reason = ''"
            >
              {{ opt.label }}
            </v-chip>
          </div>
          <p v-if="typeError" class="text-caption text-error mt-1">
            Lütfen bir rapor türü seçin.
          </p>
        </div>

        <!-- Seçilen tür etiketi (dışarıdan verilmişse) -->
        <div v-else class="mb-4 d-flex align-center ga-2">
          <v-chip :prepend-icon="resolvedTypeIcon" color="primary" variant="tonal" size="small">
            {{ resolvedTypeLabel }}
          </v-chip>
          <span class="text-caption text-medium-emphasis">raporlanıyor</span>
        </div>

        <v-form ref="formRef" v-model="formValid">
          <!-- Neden (other ve chat hariç) -->
          <v-select
            v-if="showReason"
            v-model="form.reason"
            :items="reasonOptions"
            item-title="label"
            item-value="value"
            label="Rapor Nedeni *"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-3"
            :rules="[(v) => !!v || 'Rapor nedeni zorunludur.']"
          />

          <!-- Açıklama -->
          <v-textarea
            v-model="form.description"
            label="Açıklama (İsteğe bağlı)"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            rows="3"
            counter="500"
            :rules="[(v) => !v || v.length <= 500 || 'En fazla 500 karakter.']"
            placeholder="Durumu daha iyi açıklamak için ek bilgi ekleyin..."
          />
        </v-form>
      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-4">
        <v-btn variant="outlined" rounded="lg" @click="open = false">İptal</v-btn>
        <v-spacer />
        <v-btn
          color="error"
          variant="flat"
          rounded="lg"
          prepend-icon="mdi-flag-plus-outline"
          :loading="reportStore.status === 'loading'"
          @click="submit"
        >
          Raporu Gönder
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useReportStore } from "@/stores/report";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  reportType: { type: String, default: "" },
  contentId: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const reportStore = useReportStore();
const formRef = ref(null);
const formValid = ref(false);
const typeError = ref(false);

const form = ref({ reportType: "", reason: "", description: "" });

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

watch(open, (val) => {
  if (val) form.value.reportType = props.reportType || "";
});

const reportTypeOptions = [
  { value: "post", label: "Gönderi", icon: "mdi-post-outline" },
  { value: "comment", label: "Yorum", icon: "mdi-comment-outline" },
  { value: "project", label: "Proje", icon: "mdi-folder-outline" },
  { value: "user", label: "Kullanıcı", icon: "mdi-account-outline" },
  { value: "chat", label: "Mesaj", icon: "mdi-chat-outline" },
  { value: "application", label: "Başvuru", icon: "mdi-file-document-outline" },
  { value: "other", label: "Diğer", icon: "mdi-dots-horizontal-circle-outline" },
];

const reasonOptions = [
  { value: "spam", label: "Spam" },
  { value: "abuse", label: "İstismar" },
  { value: "harassment", label: "Taciz" },
  { value: "inappropriate content", label: "Uygunsuz İçerik" },
  { value: "other", label: "Diğer" },
];

const activeType = computed(() => props.reportType || form.value.reportType);

const showReason = computed(() => {
  const t = activeType.value;
  return t && t !== "other" && t !== "chat";
});

const resolvedTypeLabel = computed(() =>
  reportTypeOptions.find((o) => o.value === props.reportType)?.label ?? props.reportType,
);

const resolvedTypeIcon = computed(() =>
  reportTypeOptions.find((o) => o.value === props.reportType)?.icon ?? "mdi-flag-outline",
);

function resetForm() {
  form.value = { reportType: "", reason: "", description: "" };
  typeError.value = false;
  formRef.value?.reset();
}

async function submit() {
  if (!activeType.value) {
    typeError.value = true;
    return;
  }
  typeError.value = false;

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const payload = {
    reportType: activeType.value,
    description: form.value.description || undefined,
  };

  if (showReason.value) {
    payload.contentId = props.contentId || undefined;
    payload.reason = form.value.reason;
  }

  const result = await reportStore.createReport(payload);
  if (result) open.value = false;
}
</script>
