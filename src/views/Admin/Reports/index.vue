<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Rapor Yönetimi</h1>

    <!-- İstatistik Kartları -->
    <v-row v-if="adminStore.reportStatistics" class="mb-4">
      <v-col v-for="stat in reportStats" :key="stat.label" cols="6" sm="3">
        <v-card variant="tonal" :color="stat.color" rounded="lg" class="pa-3 text-center">
          <div class="text-h6 font-weight-bold">{{ stat.value }}</div>
          <div class="text-caption">{{ stat.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtreler -->
    <v-card rounded="lg" class="mb-4 pa-4">
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            label="Durum"
            density="compact"
            variant="outlined"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select
            v-model="filters.reportType"
            :items="typeOptions"
            label="Tür"
            density="compact"
            variant="outlined"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select
            v-model="filters.sortBy"
            :items="sortOptions"
            label="Sıralama"
            density="compact"
            variant="outlined"
            hide-details
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Tablo -->
    <v-card rounded="lg">
      <v-data-table-server
        :headers="headers"
        :items="adminStore.reports"
        :loading="adminStore.status === 'loading'"
        :items-length="adminStore.reportsPagination?.totalReports || 0"
        :items-per-page="filters.limit"
        :page="filters.page"
        :items-per-page-options="itemsPerPageOptions"
        items-per-page-text="Sayfa başına:"
        density="comfortable"
        @update:options="onTableOptions"
      >
        <template v-slot:[`item.reporterId`]="{ item }">
          <span class="text-body-2">{{ item.reporterId?.username || 'Silinmiş' }}</span>
        </template>
        <template v-slot:[`item.reportType`]="{ item }">
          <v-chip size="default" variant="tonal">{{ reportTypeLabel(item.reportType) }}</v-chip>
        </template>
        <template v-slot:[`item.reason`]="{ item }">
          <v-chip size="default" variant="tonal" color="secondary">{{ reasonLabel(item.reason) }}</v-chip>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip size="default" :color="stateColor(item.status?.state)">
            {{ stateLabel(item.status?.state) }}
          </v-chip>
        </template>
        <template v-slot:[`item.createdAt`]="{ item }">
          <span class="text-body-2">{{ formatDate(item.createdAt) }}</span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center ga-2">
            <v-btn size="small" icon variant="text" @click="openDetailDialog(item)">
              <v-icon size="18">mdi-eye-outline</v-icon>
              <v-tooltip activator="parent" location="top">Detay</v-tooltip>
            </v-btn>
            <v-btn
              v-if="item.status?.state === 'pending'"
              size="small"
              color="success"
              variant="tonal"
              @click="openResolveDialog(item)"
            >
              Çöz
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Detay Dialog -->
    <v-dialog v-model="detailDialog" max-width="600">
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center justify-space-between">
          Rapor Detayı
          <v-btn icon variant="text" size="small" @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="detailReport">
          <!-- Üst bilgiler -->
          <div class="d-flex flex-wrap ga-2 mb-3">
            <v-chip :color="stateColor(detailReport.status?.state)" variant="tonal" size="default">
              {{ stateLabel(detailReport.status?.state) }}
            </v-chip>
            <v-chip variant="outlined" size="default">
              <v-icon start size="16">{{ reportTypeIcon(detailReport.reportType) }}</v-icon>
              {{ reportTypeLabel(detailReport.reportType) }}
            </v-chip>
            <v-chip v-if="detailReport.reason" variant="tonal" size="default" color="secondary">
              {{ reasonLabel(detailReport.reason) }}
            </v-chip>
          </div>

          <div class="text-body-2 mb-1"><strong>Raporlayan:</strong> {{ detailReport.reporterId?.profile?.name }} {{ detailReport.reporterId?.profile?.surname }} ({{ detailReport.reporterId?.email }})</div>
          <div class="text-body-2 mb-1"><strong>Tarih:</strong> {{ formatDate(detailReport.createdAt) }}</div>
          <div v-if="detailReport.description" class="text-body-2 mb-3"><strong>Açıklama:</strong> {{ detailReport.description }}</div>

          <v-divider class="mb-3" />

          <!-- Şikayet Edilen İçerik -->
          <div class="text-subtitle-2 font-weight-bold mb-2">Şikayet Edilen İçerik</div>

          <template v-if="detailReport.contentPreview">
            <!-- Post / Comment -->
            <div
              v-if="detailReport.contentPreview.type === 'post' || detailReport.contentPreview.type === 'comment'"
              class="rounded-lg border pa-3 mb-3"
            >
              <div class="d-flex align-center ga-2 mb-2">
                <v-avatar size="32" color="primary" variant="tonal">
                  <v-img
                    v-if="detailReport.contentPreview.author?.profile?.avatarUrl"
                    :src="getMediaUrl(detailReport.contentPreview.author.profile.avatarUrl)"
                  />
                  <span v-else class="text-caption font-weight-bold text-primary">
                    {{ (detailReport.contentPreview.author?.username || '?')[0].toUpperCase() }}
                  </span>
                </v-avatar>
                <span class="text-body-2 font-weight-medium">@{{ detailReport.contentPreview.author?.username || '—' }}</span>
                <v-spacer />
                <span class="text-caption text-medium-emphasis">{{ detailReport.contentPreview.createdAt ? formatDate(detailReport.contentPreview.createdAt) : '' }}</span>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0" style="white-space: pre-wrap">
                {{ detailReport.contentPreview.content }}
                <span v-if="detailReport.contentPreview.contentTruncated" class="text-caption font-weight-medium">... <em>devamı var</em></span>
              </p>
              <div v-if="detailReport.contentPreview.tags?.length" class="d-flex ga-1 flex-wrap mt-2">
                <v-chip v-for="tag in detailReport.contentPreview.tags" :key="tag" size="small" color="primary" variant="tonal">#{{ tag }}</v-chip>
              </div>
              <div v-if="detailReport.contentPreview.imageCount" class="d-flex align-center ga-1 mt-2 text-caption text-medium-emphasis">
                <v-icon size="14">mdi-image-multiple-outline</v-icon>
                {{ detailReport.contentPreview.imageCount }} görsel
              </div>
              <v-btn
                class="mt-2"
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-open-in-new"
                :href="detailReport.contentPreview.type === 'post' ? `/posts/${detailReport.contentId}` : `/posts/${detailReport.contentPreview.postId}`"
                target="_blank"
              >
                {{ detailReport.contentPreview.type === 'post' ? 'Gönderiye Git' : 'Yorumun Gönderisine Git' }}
              </v-btn>
            </div>

            <!-- User -->
            <div
              v-else-if="detailReport.contentPreview.type === 'user'"
              class="rounded-lg border pa-3 mb-3 d-flex align-center ga-3"
            >
              <v-avatar size="40" color="primary" variant="tonal">
                <v-img v-if="detailReport.contentPreview.avatarUrl" :src="getMediaUrl(detailReport.contentPreview.avatarUrl)" />
                <span v-else class="text-body-2 font-weight-bold text-primary">
                  {{ (detailReport.contentPreview.name || detailReport.contentPreview.username || '?')[0].toUpperCase() }}
                </span>
              </v-avatar>
              <div class="flex-grow-1">
                <p class="text-body-2 font-weight-medium mb-0">{{ detailReport.contentPreview.name }} {{ detailReport.contentPreview.surname }}</p>
                <p class="text-caption text-medium-emphasis mb-0">@{{ detailReport.contentPreview.username }}</p>
                <p v-if="detailReport.contentPreview.bio" class="text-caption text-medium-emphasis mt-1 mb-0">{{ detailReport.contentPreview.bio }}</p>
                <v-btn
                  class="mt-2"
                  size="small"
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-open-in-new"
                  :href="`/profile/${detailReport.contentId}`"
                  target="_blank"
                >
                  Profile Git
                </v-btn>
              </div>
            </div>

            <!-- Project -->
            <div
              v-else-if="detailReport.contentPreview.type === 'project'"
              class="rounded-lg border pa-3 mb-3"
            >
              <div class="d-flex align-center ga-2 mb-1">
                <v-icon size="16" color="primary">mdi-folder-outline</v-icon>
                <span class="text-body-2 font-weight-medium">{{ detailReport.contentPreview.title || '—' }}</span>
              </div>
              <p v-if="detailReport.contentPreview.description" class="text-caption text-medium-emphasis mb-0">{{ detailReport.contentPreview.description }}</p>
              <v-btn
                class="mt-2"
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-open-in-new"
                :href="`/projects/${detailReport.contentId}`"
                target="_blank"
              >
                Projeye Git
              </v-btn>
            </div>

            <!-- Application -->
            <div
              v-else-if="detailReport.contentPreview.type === 'application'"
              class="rounded-lg border pa-3 mb-3"
            >
              <div class="text-body-2 font-weight-medium mb-1">{{ detailReport.contentPreview.roleName || 'Başvuru' }}</div>
              <p v-if="detailReport.contentPreview.message" class="text-caption text-medium-emphasis mb-0">{{ detailReport.contentPreview.message }}</p>
            </div>
          </template>

          <div v-else class="text-body-2 text-medium-emphasis pa-3 rounded-lg border mb-3">
            İçerik bulunamadı veya silinmiş olabilir.
          </div>

          <!-- Admin Notu -->
          <template v-if="detailReport.status?.state === 'resolved'">
            <v-divider class="mb-3" />
            <div class="text-subtitle-2 font-weight-bold mb-2">Çözüm Bilgileri</div>
            <div v-if="detailReport.status?.actionTaken" class="text-body-2 mb-1">
              <strong>Yapılan İşlem:</strong> {{ actionLabel(detailReport.status.actionTaken) }}
            </div>
            <div v-if="detailReport.status?.adminNote" class="pa-3 rounded-lg border">
              <div class="d-flex align-center ga-1 mb-1">
                <v-icon size="14" color="info">mdi-shield-check-outline</v-icon>
                <span class="text-caption font-weight-medium text-info">Admin Notu</span>
              </div>
              <p class="text-body-2 mb-0">{{ detailReport.status.adminNote }}</p>
            </div>
            <div v-if="detailReport.status?.resolvedAt" class="text-body-2 mt-2">
              <strong>Çözülme Tarihi:</strong> {{ formatDate(detailReport.status.resolvedAt) }}
            </div>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="detailReport?.status?.state === 'pending'"
            color="success"
            variant="flat"
            @click="detailDialog = false; openResolveDialog(detailReport)"
          >
            Çözümle
          </v-btn>
          <v-btn variant="text" @click="detailDialog = false">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Çözüm Dialog -->
    <v-dialog v-model="resolveDialog" max-width="500">
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1 font-weight-bold">Rapor Çözümle</v-card-title>
        <v-card-text>
          <v-select
            v-model="resolveForm.actionTaken"
            :items="actionOptions"
            label="Yapılacak İşlem"
            density="compact"
            variant="outlined"
            class="mb-3"
          />
          <v-textarea
            v-model="resolveForm.adminNote"
            label="Admin Notu"
            density="compact"
            variant="outlined"
            rows="3"
            maxlength="1000"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="resolveDialog = false">İptal</v-btn>
          <v-btn color="success" variant="flat" :loading="resolving" @click="handleResolve">Çözümle</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useAdminStore } from "@/stores/admin";
import { formatDate } from "@/utils/formatDate";
import { getMediaUrl } from "@/utils/mediaUrl";

const adminStore = useAdminStore();

const itemsPerPageOptions = [
  { value: 5, title: "5" },
  { value: 10, title: "10" },
  { value: 25, title: "25" },
  { value: 50, title: "50" },
];
const filters = reactive({ page: 1, limit: 10, status: null, reportType: null, sortBy: "newest" });
const resolveDialog = ref(false);
const resolving = ref(false);
const selectedReport = ref(null);
const resolveForm = reactive({ actionTaken: "none", adminNote: "" });
const detailDialog = ref(false);
const detailReport = ref(null);
const detailLoading = ref(false);

const headers = [
  { title: "Raporlayan", key: "reporterId", sortable: false },
  { title: "Tür", key: "reportType", sortable: false },
  { title: "Sebep", key: "reason", sortable: false },
  { title: "Durum", key: "status", sortable: false },
  { title: "Tarih", key: "createdAt", sortable: false },
  { title: "İşlem", key: "actions", sortable: false },
];

const statusOptions = [
  { title: "Bekliyor", value: "pending" },
  { title: "Çözüldü", value: "resolved" },
  { title: "Reddedildi", value: "rejected" },
  { title: "İptal", value: "cancelled" },
];

const typeOptions = [
  { title: "Gönderi", value: "post" },
  { title: "Yorum", value: "comment" },
  { title: "Proje", value: "project" },
  { title: "Kullanıcı", value: "user" },
  { title: "Sohbet", value: "chat" },
  { title: "Başvuru", value: "application" },
  { title: "Diğer", value: "other" },
];

const sortOptions = [
  { title: "En Yeni", value: "newest" },
  { title: "En Eski", value: "oldest" },
  { title: "Çözülme Tarihi", value: "resolved" },
];

const actionOptions = [
  { title: "İşlem Yok", value: "none" },
  { title: "Uyarı", value: "warning" },
  { title: "Askıya Alma", value: "suspension" },
  { title: "Ban", value: "ban" },
  { title: "İçerik Kaldırma", value: "content removal" },
];

const reportStats = computed(() => {
  const s = adminStore.reportStatistics;
  if (!s) return [];
  return [
    { label: "Bekliyor", value: s.pending, color: "warning" },
    { label: "Çözüldü", value: s.resolved, color: "success" },
    { label: "Reddedildi", value: s.rejected, color: "error" },
    { label: "İptal", value: s.cancelled, color: "grey" },
  ];
});

const reportTypeLabel = (type) => {
  const map = { post: "Gönderi", comment: "Yorum", project: "Proje", user: "Kullanıcı", chat: "Sohbet", application: "Başvuru", other: "Diğer" };
  return map[type] || type;
};

const reasonOptions = [
  { value: "spam", label: "Spam" },
  { value: "abuse", label: "İstismar" },
  { value: "harassment", label: "Taciz" },
  { value: "inappropriate content", label: "Uygunsuz İçerik" },
  { value: "other", label: "Diğer" },
];
const reasonMap = Object.fromEntries(reasonOptions.map((r) => [r.value, r.label]));

const stateColor = (state) => ({ pending: "warning", resolved: "success", rejected: "error", cancelled: "grey" })[state] || "grey";
const stateLabel = (state) => ({ pending: "Bekliyor", resolved: "Çözüldü", rejected: "Reddedildi", cancelled: "İptal" })[state] || state;
const reasonLabel = (reason) => reasonMap[reason] || reason;
const actionLabel = (action) => ({ none: "İşlem Yok", warning: "Uyarı", suspension: "Askıya Alma", ban: "Ban", "content removal": "İçerik Kaldırma" })[action] || action;

const reportTypeIconMap = {
  post: "mdi-post-outline", comment: "mdi-comment-outline", project: "mdi-folder-outline",
  user: "mdi-account-outline", chat: "mdi-chat-outline", application: "mdi-file-document-outline", other: "mdi-dots-horizontal-circle-outline",
};
const reportTypeIcon = (type) => reportTypeIconMap[type] || "mdi-flag-outline";

const loadReports = () => {
  const params = { page: filters.page, limit: filters.limit };
  if (filters.status) params.status = filters.status;
  if (filters.reportType) params.reportType = filters.reportType;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  adminStore.fetchReports(params);
};

const onTableOptions = ({ page, itemsPerPage }) => {
  filters.page = page;
  filters.limit = itemsPerPage;
  loadReports();
};

watch(() => [filters.status, filters.reportType, filters.sortBy], () => {
  filters.page = 1;
  loadReports();
});

const openDetailDialog = async (report) => {
  detailDialog.value = true;
  detailReport.value = null;
  detailLoading.value = true;
  await adminStore.fetchReportById(report._id);
  detailReport.value = adminStore.currentReport;
  detailLoading.value = false;
};

const openResolveDialog = (report) => {
  selectedReport.value = report;
  resolveForm.actionTaken = "none";
  resolveForm.adminNote = "";
  resolveDialog.value = true;
};

const handleResolve = async () => {
  if (!selectedReport.value) return;
  resolving.value = true;
  const success = await adminStore.resolveReport(selectedReport.value._id, {
    actionTaken: resolveForm.actionTaken,
    adminNote: resolveForm.adminNote,
  });
  resolving.value = false;
  if (success) {
    resolveDialog.value = false;
    loadReports();
  }
};
</script>
