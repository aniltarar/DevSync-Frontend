<template>
  <div>
    <!-- Geri dön -->
    <v-btn
      variant="text"
      rounded="lg"
      prepend-icon="mdi-arrow-left"
      :to="{ name: 'Reports' }"
      class="mb-4 pa-2 "
    >
      Raporlarıma Geri Dön
    </v-btn>

    <!-- Başlık -->
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold">Rapor Detayı</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">Raporun tam içeriği ve durumu</p>
    </div>

    <!-- Loading -->
    <template v-if="reportStore.status === 'loading'">
      <v-skeleton-loader type="article" rounded="lg" class="mb-3" />
      <v-skeleton-loader type="article" rounded="lg" />
    </template>

    <!-- Hata -->
    <div v-else-if="reportStore.status === 'error'" class="text-center py-16">
      <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
      <p class="text-body-1 mt-4">{{ reportStore.message }}</p>
      <v-btn class="mt-4" color="primary" variant="tonal" @click="load">
        Tekrar Dene
      </v-btn>
    </div>

    <template v-else-if="report">
      <!-- Rapor Meta Bilgileri -->
      <v-card border flat rounded="lg" class="mb-4">
        <div class="pa-4">
          <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip :color="statusInfo.color" variant="tonal">
                <v-icon start size="14">{{ statusInfo.icon }}</v-icon>
                {{ statusInfo.label }}
              </v-chip>
              <v-chip variant="outlined">
                <v-icon start size="14">{{ reportTypeIcon }}</v-icon>
                {{ reportTypeLabel }}
              </v-chip>
              <v-chip v-if="report.reason" variant="tonal" color="secondary">
                {{ reasonLabel }}
              </v-chip>
            </div>
            <span class="text-caption text-medium-emphasis d-flex align-center ga-1">
              <v-icon size="13">mdi-calendar-clock-outline</v-icon>
              {{ formatDate(report.createdAt) }}
            </span>
          </div>

          <!-- Açıklama -->
          <div v-if="report.description">
            <p class="text-body-2 font-weight-medium mb-1">Açıklama</p>
            <p class="text-body-2 text-medium-emphasis mb-0" style="white-space: pre-wrap">
              {{ report.description }}
            </p>
          </div>

          <!-- Admin Notu -->
          <div
            v-if="report.status?.adminNote"
            class="mt-4 pa-3 rounded-lg bg-info-lighten-5 border"
            style="border-color: rgb(var(--v-theme-info)) !important"
          >
            <div class="d-flex align-center ga-1 mb-1">
              <v-icon size="16" color="info">mdi-shield-check-outline</v-icon>
              <span class="text-body-2 font-weight-medium text-info">Moderatör Notu</span>
            </div>
            <p class="text-body-2 mb-0">{{ report.status.adminNote }}</p>
          </div>
        </div>

        <!-- İptal et (sadece pending) -->
        <template v-if="state === 'pending'">
          <v-divider />
          <v-card-actions class="pa-3">
            <v-spacer />
            <v-btn
              color="error"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-cancel"
              @click="confirmCancel = true"
            >
              Raporu İptal Et
            </v-btn>
          </v-card-actions>
        </template>
      </v-card>

      <!-- İptal onay dialog -->
      <v-dialog v-model="confirmCancel" max-width="360">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold pa-4">
            Raporu İptal Et
          </v-card-title>
          <v-card-text class="px-4 pb-2">
            Bu raporu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </v-card-text>
          <v-card-actions class="pa-4 pt-2">
            <v-spacer />
            <v-btn variant="text" rounded="lg" @click="confirmCancel = false">Vazgeç</v-btn>
            <v-btn
              color="error"
              variant="flat"
              rounded="lg"
              :loading="cancelling"
              @click="cancelReport"
            >
              İptal Et
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- İçerik Önizlemesi -->
      <div v-if="report.contentPreview">
        <p class="text-body-2 font-weight-medium text-medium-emphasis mb-2 d-flex align-center ga-1">
          <v-icon size="16">mdi-eye-outline</v-icon>
          Raporlanan İçerik
        </p>

        <!-- Post / Comment -->
        <v-card
          v-if="report.contentPreview.type === 'post' || report.contentPreview.type === 'comment'"
          border
          flat
          rounded="lg"
        >
          <v-card-item>
            <template #prepend>
              <v-avatar size="40" color="primary" variant="tonal" rounded="circle">
                <v-img
                  v-if="report.contentPreview.author?.profile?.avatarUrl"
                  :src="getMediaUrl(report.contentPreview.author.profile.avatarUrl)"
                />
                <span v-else class="text-body-2 font-weight-bold text-primary">
                  {{ previewAuthorInitials }}
                </span>
              </v-avatar>
            </template>
            <v-card-title class="text-body-1 font-weight-bold">
              @{{ report.contentPreview.author?.username ?? "—" }}
            </v-card-title>
            <v-card-subtitle class="text-caption">
              {{ report.contentPreview.createdAt ? formatDate(report.contentPreview.createdAt) : "" }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text class="pt-0">
            <p class="text-body-2 mb-0" style="white-space: pre-wrap">
              {{ report.contentPreview.content }}
              <span v-if="report.contentPreview.contentTruncated" class="text-caption text-medium-emphasis">
                <em> ... (içerik kısaltılmıştır)</em>
              </span>
            </p>
          </v-card-text>

          <div v-if="report.contentPreview.tags?.length" class="px-4 pb-3 d-flex ga-1 flex-wrap">
            <v-chip
              v-for="tag in report.contentPreview.tags"
              :key="tag"
              size="small"
              color="primary"
              variant="tonal"
              rounded="md"
            >
              #{{ tag }}
            </v-chip>
          </div>

          <div
            v-if="report.contentPreview.imageCount"
            class="px-4 pb-3 d-flex align-center ga-1 text-caption text-medium-emphasis"
          >
            <v-icon size="16">mdi-image-multiple-outline</v-icon>
            {{ report.contentPreview.imageCount }} görsel içeriyor
          </div>
        </v-card>

        <!-- User -->
        <v-card
          v-else-if="report.contentPreview.type === 'user'"
          border
          flat
          rounded="lg"
        >
          <v-card-item>
            <template #prepend>
              <v-avatar size="48" color="primary" variant="tonal" rounded="circle">
                <v-img
                  v-if="report.contentPreview.avatarUrl"
                  :src="getMediaUrl(report.contentPreview.avatarUrl)"
                />
                <span v-else class="text-body-1 font-weight-bold text-primary">
                  {{ userPreviewInitials }}
                </span>
              </v-avatar>
            </template>
            <v-card-title class="text-body-1 font-weight-bold">
              {{ report.contentPreview.name }} {{ report.contentPreview.surname }}
            </v-card-title>
            <v-card-subtitle>@{{ report.contentPreview.username }}</v-card-subtitle>
          </v-card-item>
          <v-card-text v-if="report.contentPreview.bio" class="pt-0">
            <p class="text-body-2 text-medium-emphasis mb-0">{{ report.contentPreview.bio }}</p>
          </v-card-text>
        </v-card>

        <!-- Project -->
        <v-card
          v-else-if="report.contentPreview.type === 'project'"
          border
          flat
          rounded="lg"
        >
          <v-card-item>
            <template #prepend>
              <v-avatar size="40" color="primary" variant="tonal" rounded="lg">
                <v-icon color="primary">mdi-folder-outline</v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-body-1 font-weight-bold">
              {{ report.contentPreview.title ?? "—" }}
            </v-card-title>
          </v-card-item>
          <v-card-text v-if="report.contentPreview.description" class="pt-0">
            <p class="text-body-2 text-medium-emphasis mb-0">{{ report.contentPreview.description }}</p>
          </v-card-text>
        </v-card>

        <!-- Generic fallback -->
        <v-card
          v-else-if="report.contentPreview.content"
          border
          flat
          rounded="lg"
        >
          <v-card-text>
            <p class="text-body-2 text-medium-emphasis mb-0" style="white-space: pre-wrap">
              {{ report.contentPreview.content }}
            </p>
          </v-card-text>
        </v-card>
      </div>

      <!-- contentPreview yok ama contentId var -->
      <div v-else-if="report.contentId" class="d-flex align-center ga-2 mt-2">
        <v-icon size="16" color="medium-emphasis">mdi-link-variant</v-icon>
        <span class="text-caption text-medium-emphasis font-weight-medium">
          İçerik ID: {{ report.contentId }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useReportStore } from "@/stores/report";
import { formatDate } from "@/utils/formatDate";
import { getMediaUrl } from "@/utils/mediaUrl";

const route = useRoute();
const router = useRouter();
const reportStore = useReportStore();
const cancelling = ref(false);
const confirmCancel = ref(false);

const report = computed(() => reportStore.currentReport);

const statusMap = {
  pending: { label: "Beklemede", color: "warning", icon: "mdi-clock-outline" },
  resolved: { label: "Çözüldü", color: "success", icon: "mdi-check-circle-outline" },
  rejected: { label: "Reddedildi", color: "error", icon: "mdi-close-circle-outline" },
  cancelled: { label: "İptal Edildi", color: "default", icon: "mdi-cancel" },
};

const reportTypeMap = {
  post: { label: "Gönderi", icon: "mdi-post-outline" },
  comment: { label: "Yorum", icon: "mdi-comment-outline" },
  project: { label: "Proje", icon: "mdi-folder-outline" },
  user: { label: "Kullanıcı", icon: "mdi-account-outline" },
  chat: { label: "Mesaj", icon: "mdi-chat-outline" },
  application: { label: "Başvuru", icon: "mdi-file-document-outline" },
  other: { label: "Diğer", icon: "mdi-dots-horizontal-circle-outline" },
};

const reasonMap = {
  spam: "Spam",
  abuse: "İstismar",
  harassment: "Taciz",
  "inappropriate content": "Uygunsuz İçerik",
  other: "Diğer",
};

const state = computed(() => report.value?.status?.state ?? report.value?.status);
const statusInfo = computed(() => statusMap[state.value] ?? { label: state.value, color: "default", icon: "mdi-help-circle-outline" });
const reportTypeLabel = computed(() => reportTypeMap[report.value?.reportType]?.label ?? report.value?.reportType);
const reportTypeIcon = computed(() => reportTypeMap[report.value?.reportType]?.icon ?? "mdi-flag-outline");
const reasonLabel = computed(() => reasonMap[report.value?.reason] ?? report.value?.reason);

const previewAuthorInitials = computed(() => {
  const author = report.value?.contentPreview?.author;
  const n = author?.profile?.name?.[0] ?? "";
  const s = author?.profile?.surname?.[0] ?? "";
  return (n + s).toUpperCase() || author?.username?.[0]?.toUpperCase() || "?";
});

const userPreviewInitials = computed(() => {
  const p = report.value?.contentPreview;
  const n = p?.name?.[0] ?? "";
  const s = p?.surname?.[0] ?? "";
  return (n + s).toUpperCase() || p?.username?.[0]?.toUpperCase() || "?";
});

async function load() {
  await reportStore.getReportById(route.params.reportId);
}

async function cancelReport() {
  cancelling.value = true;
  const success = await reportStore.cancelReport(route.params.reportId);
  cancelling.value = false;
  confirmCancel.value = false;
  if (success) {
    await load();
  }
}

onMounted(() => {
  load();
});
</script>
