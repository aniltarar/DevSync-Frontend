<template>
  <div>
    <!-- Başlık -->
    <div class="d-flex align-center ga-3 mb-6">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        size="small"
        rounded="lg"
        :to="{ name: 'Reports' }"
      />
      <div>
        <h1 class="text-h5 font-weight-bold">Yeni Rapor Oluştur</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Uygunsuz içerikleri veya kullanıcıları bildirin
        </p>
      </div>
    </div>

    <v-form ref="formRef" v-model="formValid" @submit.prevent="submit">
      <v-card border flat rounded="lg">
        <div class="pa-6 d-flex flex-column ga-5">
          <!-- Rapor Türü -->
          <div>
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
                @click="selectType(opt.value)"
              >
                {{ opt.label }}
              </v-chip>
            </div>
            <p v-if="typeError" class="text-caption text-error mt-1">
              Lütfen bir rapor türü seçin.
            </p>
          </div>

          <!-- Content ID (other ve chat hariç) -->
          <v-text-field
            v-if="showContentId"
            v-model="form.contentId"
            label="İçerik ID"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            clearable
            :rules="contentIdRules"
            hint="Raporlamak istediğiniz içeriğin ID'sini girin"
            persistent-hint
          />

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
            :rules="[(v) => !!v || 'Rapor nedeni zorunludur.']"
          />

          <!-- Açıklama -->
          <v-textarea
            v-model="form.description"
            label="Açıklama (İsteğe bağlı)"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            rows="4"
            counter="500"
            :rules="[(v) => !v || v.length <= 500 || 'En fazla 500 karakter girilebilir.']"
            placeholder="Durumu daha iyi açıklamak için ek bilgi ekleyin..."
          />
        </div>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            rounded="lg"
            :to="{ name: 'Reports' }"
          >
            İptal
          </v-btn>
          <v-spacer />
          <v-btn
            type="submit"
            color="primary"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-flag-plus-outline"
            :loading="reportStore.status === 'loading'"
          >
            Raporu Gönder
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useReportStore } from "@/stores/report";

const router = useRouter();
const reportStore = useReportStore();

const formRef = ref(null);
const formValid = ref(false);
const typeError = ref(false);

const form = ref({
  reportType: "",
  contentId: "",
  reason: "",
  description: "",
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

const showContentId = computed(
  () => form.value.reportType && form.value.reportType !== "other" && form.value.reportType !== "chat",
);

const showReason = computed(() => showContentId.value);

const contentIdRules = computed(() => {
  if (!showContentId.value) return [];
  return [(v) => !!v || "İçerik ID zorunludur."];
});

function selectType(value) {
  form.value.reportType = value;
  form.value.contentId = "";
  form.value.reason = "";
  typeError.value = false;
}

async function submit() {
  if (!form.value.reportType) {
    typeError.value = true;
    return;
  }

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const payload = {
    reportType: form.value.reportType,
    description: form.value.description || undefined,
  };

  if (showContentId.value) {
    payload.contentId = form.value.contentId;
    payload.reason = form.value.reason;
  }

  const result = await reportStore.createReport(payload);
  if (result) {
    router.push({ name: "Reports" });
  }
}
</script>
