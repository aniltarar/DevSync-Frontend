<template>
  <v-card border flat rounded="lg">
    <div class="pa-4">
      <!-- Üst: Durum + Tarih -->
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center ga-2 flex-wrap">
          <v-chip :color="statusInfo.color" variant="tonal" size="small">
            <v-icon start size="14">{{ statusInfo.icon }}</v-icon>
            {{ statusInfo.label }}
          </v-chip>
          <v-chip variant="outlined" size="small">
            <v-icon start size="14">{{ reportTypeIcon }}</v-icon>
            {{ reportTypeLabel }}
          </v-chip>
          <v-chip v-if="report.reason" variant="tonal" size="small" color="secondary">
            {{ reasonLabel }}
          </v-chip>
        </div>
        <span class="text-caption text-medium-emphasis d-flex align-center ga-1">
          <v-icon size="13">mdi-calendar-clock-outline</v-icon>
          {{ formatDate(report.createdAt) }}
        </span>
      </div>

      <!-- Content Preview -->
      <template v-if="report.contentPreview">
        <!-- Post / Comment preview -->
        <div
          v-if="report.contentPreview.type === 'post' || report.contentPreview.type === 'comment'"
          class="rounded-lg border pa-3 mb-3 bg-reportPreview"
        >
          <div class="d-flex align-center ga-2 mb-2">
            <v-avatar size="28" color="primary" variant="tonal" rounded="circle">
              <v-img
                v-if="report.contentPreview.author?.profile?.avatarUrl"
                :src="getMediaUrl(report.contentPreview.author.profile.avatarUrl)"
              />
              <span v-else class="text-caption font-weight-bold text-primary" style="font-size:11px">
                {{ previewAuthorInitials }}
              </span>
            </v-avatar>
            <span class="text-body-2 font-weight-medium">
              @{{ report.contentPreview.author?.username ?? "—" }}
            </span>
            <v-spacer />
            <span class="text-caption text-medium-emphasis">
              {{ report.contentPreview.createdAt ? formatDate(report.contentPreview.createdAt) : "" }}
            </span>
          </div>
          <p class="text-body-2 text-medium-emphasis mb-0" style="white-space: pre-wrap">
            {{ report.contentPreview.content }}
            <span v-if="report.contentPreview.contentTruncated" class="text-caption font-weight-medium">
              ... <em>devamı var</em>
            </span>
          </p>
          <div v-if="report.contentPreview.tags?.length" class="d-flex ga-1 flex-wrap mt-2">
            <v-chip
              v-for="tag in report.contentPreview.tags"
              :key="tag"
              size="x-small"
              color="primary"
              variant="tonal"
              rounded="md"
            >
              #{{ tag }}
            </v-chip>
          </div>
          <div
            v-if="report.contentPreview.imageCount"
            class="d-flex align-center ga-1 mt-2 text-caption text-medium-emphasis"
          >
            <v-icon size="14">mdi-image-multiple-outline</v-icon>
            {{ report.contentPreview.imageCount }} görsel
          </div>
        </div>

        <!-- User preview -->
        <div
          v-else-if="report.contentPreview.type === 'user'"
          class="rounded-lg border pa-3 mb-3 bg-reportPreview d-flex align-center ga-3"
        >
          <v-avatar size="40" color="primary" variant="tonal" rounded="circle">
            <v-img
              v-if="report.contentPreview.avatarUrl"
              :src="getMediaUrl(report.contentPreview.avatarUrl)"
            />
            <span v-else class="text-body-2 font-weight-bold text-primary">
              {{ userPreviewInitials }}
            </span>
          </v-avatar>
          <div>
            <p class="text-body-2 font-weight-medium mb-0">
              {{ report.contentPreview.name }} {{ report.contentPreview.surname }}
            </p>
            <p class="text-caption text-medium-emphasis mb-0">
              @{{ report.contentPreview.username }}
            </p>
            <p v-if="report.contentPreview.bio" class="text-caption text-medium-emphasis mt-1 mb-0">
              {{ report.contentPreview.bio }}
            </p>
          </div>
        </div>

        <!-- Project preview -->
        <div
          v-else-if="report.contentPreview.type === 'project'"
          class="rounded-lg border pa-3 mb-3 bg-reportPreview"
        >
          <div class="d-flex align-center ga-2 mb-1">
            <v-icon size="16" color="primary">mdi-folder-outline</v-icon>
            <span class="text-body-2 font-weight-medium">
              {{ report.contentPreview.title ?? "—" }}
            </span>
          </div>
          <p v-if="report.contentPreview.description" class="text-caption text-medium-emphasis mb-0">
            {{ report.contentPreview.description }}
          </p>
        </div>

        <!-- Generic / fallback preview -->
        <div
          v-else-if="report.contentPreview.content"
          class="rounded-lg border pa-3 mb-3 bg-reportPreview"
        >
          <p class="text-body-2 text-medium-emphasis mb-0" style="white-space: pre-wrap">
            {{ report.contentPreview.content }}
          </p>
        </div>
      </template>

      <!-- İçerik ID (preview yoksa) -->
      <div v-else-if="report.contentId" class="d-flex align-center ga-2 mb-2">
        <v-icon size="16" color="medium-emphasis">mdi-link-variant</v-icon>
        <span class="text-caption text-medium-emphasis font-weight-medium">
          İçerik: {{ report.contentId?.title || report.contentId?.description || report.contentId }}
        </span>
      </div>

      <!-- Açıklama -->
      <p v-if="report.description" class="text-body-2 text-medium-emphasis mt-1 mb-0">
        {{ report.description }}
      </p>

      <!-- Admin Notu -->
      <div
        v-if="report.status?.adminNote"
        class="mt-3 pa-3 rounded bg-reportPreview"
      >
        <div class="d-flex align-center ga-1 mb-1">
          <v-icon size="14" color="info">mdi-shield-check-outline</v-icon>
          <span class="text-caption font-weight-medium text-info">Admin Notu</span>
        </div>
        <p class="text-body-2 mb-0">{{ report.status.adminNote }}</p>
      </div>
    </div>

    <!-- Alt bar: detay linki + aksiyon slot -->
    <v-divider />
    <v-card-actions class="pa-3">
      <v-btn
        variant="text"
        size="small"
        rounded="lg"
        prepend-icon="mdi-eye-outline"
        :to="{ name: 'ReportDetail', params: { reportId: report._id } }"
      >
        Detaylar
      </v-btn>
      <v-spacer />
      <slot v-if="showActions" name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { formatDate } from "@/utils/formatDate";
import { getMediaUrl } from "@/utils/mediaUrl";

const props = defineProps({
  report: { type: Object, required: true },
  showActions: { type: Boolean, default: false },
});

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

const state = computed(() => props.report.status?.state ?? props.report.status);
const statusInfo = computed(() => statusMap[state.value] ?? { label: state.value, color: "default", icon: "mdi-help-circle-outline" });
const reportTypeLabel = computed(() => reportTypeMap[props.report.reportType]?.label ?? props.report.reportType);
const reportTypeIcon = computed(() => reportTypeMap[props.report.reportType]?.icon ?? "mdi-flag-outline");
const reasonLabel = computed(() => reasonMap[props.report.reason] ?? props.report.reason);

const previewAuthorInitials = computed(() => {
  const author = props.report.contentPreview?.author;
  const n = author?.profile?.name?.[0] ?? "";
  const s = author?.profile?.surname?.[0] ?? "";
  return (n + s).toUpperCase() || author?.username?.[0]?.toUpperCase() || "?";
});

const userPreviewInitials = computed(() => {
  const p = props.report.contentPreview;
  const n = p?.name?.[0] ?? "";
  const s = p?.surname?.[0] ?? "";
  return (n + s).toUpperCase() || p?.username?.[0]?.toUpperCase() || "?";
});
</script>
