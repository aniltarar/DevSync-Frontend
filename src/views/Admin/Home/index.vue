<template>
  <div>
    <!-- Başlık -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Dashboard</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">Platforma genel bakış</p>
      </div>
      <v-chip variant="text" size="small" class="text-medium-emphasis" prepend-icon="mdi-clock-outline">
        {{ lastUpdateLabel }}
      </v-chip>
    </div>

    <!-- İstatistik Kartları -->
    <v-row class="mb-2">
      <v-col v-for="card in statCards" :key="card.title" cols="6" sm="4" lg>
        <v-card rounded="xl" class="overflow-hidden" :class="card.value > 0 && card.highlight ? 'border-opacity-100' : ''" :style="card.value > 0 && card.highlight ? `border: 1px solid rgb(var(--v-theme-${card.color}))` : ''">
          <div class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <v-avatar :color="card.color" variant="tonal" size="42" rounded="lg">
                <v-icon size="22">{{ card.icon }}</v-icon>
              </v-avatar>
              <v-chip v-if="card.highlight && card.value > 0" :color="card.color" size="small" variant="flat">
                Dikkat
              </v-chip>
            </div>
            <div class="text-h4 font-weight-bold mb-1">{{ card.value }}</div>
            <div class="text-caption text-medium-emphasis">{{ card.title }}</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Son Kullanıcılar -->
      <v-col cols="12" md="6">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between pa-4 pb-0">
            <div class="d-flex align-center ga-2">
              <v-avatar color="primary" variant="tonal" size="32" rounded="lg">
                <v-icon size="18">mdi-account-plus-outline</v-icon>
              </v-avatar>
              <span class="text-subtitle-1 font-weight-bold">Son Kayıtlar</span>
            </div>
            <v-btn variant="text" size="small" color="primary" to="/admin/users" append-icon="mdi-arrow-right">
              Tümü
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-2">
            <v-list lines="two">
              <v-list-item
                v-for="user in adminStore.recentUsers"
                :key="user._id"
                rounded="lg"
                class="mb-1"
              >
                <template #prepend>
                  <v-avatar size="40" color="primary" variant="tonal" class="mr-3">
                    <v-img v-if="user.profile?.avatarUrl" :src="getMediaUrl(user.profile.avatarUrl)" />
                    <span v-else class="text-body-2 font-weight-bold">
                      {{ (user.profile?.name || user.username)[0].toUpperCase() }}
                    </span>
                  </v-avatar>
                </template>
                <template #title>
                  <div class="d-flex align-center ga-2">
                    <span class="text-body-2 font-weight-medium">{{ user.profile?.name }} {{ user.profile?.surname }}</span>
                    <v-chip v-if="user.role === 'admin'" size="x-small" color="warning" variant="flat">Admin</v-chip>
                    <v-chip v-if="!user.status" size="x-small" color="error" variant="flat">Banlı</v-chip>
                  </div>
                </template>
                <template #subtitle>
                  <span class="text-caption">@{{ user.username }} · {{ formatDate(user.createdAt) }}</span>
                </template>
              </v-list-item>
              <v-list-item v-if="!adminStore.recentUsers.length">
                <div class="text-center py-4 text-medium-emphasis">
                  <v-icon size="32" class="mb-2">mdi-account-off-outline</v-icon>
                  <div class="text-body-2">Henüz kullanıcı yok.</div>
                </div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Son Raporlar -->
      <v-col cols="12" md="6">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between pa-4 pb-0">
            <div class="d-flex align-center ga-2">
              <v-avatar color="warning" variant="tonal" size="32" rounded="lg">
                <v-icon size="18">mdi-flag-outline</v-icon>
              </v-avatar>
              <span class="text-subtitle-1 font-weight-bold">Son Raporlar</span>
            </div>
            <v-btn variant="text" size="small" color="primary" to="/admin/reports" append-icon="mdi-arrow-right">
              Tümü
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-2">
            <v-list lines="two">
              <v-list-item
                v-for="report in adminStore.recentReports"
                :key="report._id"
                rounded="lg"
                class="mb-1"
              >
                <template #prepend>
                  <v-avatar :color="reportStateColor(report.status?.state)" variant="tonal" size="40" class="mr-3">
                    <v-icon size="20">{{ reportStateIcon(report.status?.state) }}</v-icon>
                  </v-avatar>
                </template>
                <template #title>
                  <div class="d-flex align-center ga-2">
                    <span class="text-body-2 font-weight-medium">{{ report.reporterId?.username || 'Anonim' }}</span>
                    <v-chip size="x-small" variant="tonal">{{ reportTypeLabel(report.reportType) }}</v-chip>
                  </div>
                </template>
                <template #subtitle>
                  <span class="text-caption">{{ report.reason ? reasonLabel(report.reason) + ' · ' : '' }}{{ formatDate(report.createdAt) }}</span>
                </template>
                <template #append>
                  <v-chip size="small" :color="reportStateColor(report.status?.state)" variant="tonal">
                    {{ reportStateLabel(report.status?.state) }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item v-if="!adminStore.recentReports.length">
                <div class="text-center py-4 text-medium-emphasis">
                  <v-icon size="32" class="mb-2">mdi-flag-off-outline</v-icon>
                  <div class="text-body-2">Henüz rapor yok.</div>
                </div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useAdminStore } from "@/stores/admin";
import { formatDate } from "@/utils/formatDate";
import { getMediaUrl } from "@/utils/mediaUrl";

const POLL_INTERVAL = 60000;
const adminStore = useAdminStore();
const lastUpdate = ref(null);
const now = ref(Date.now());
let pollTimer = null;
let tickTimer = null;

const lastUpdateLabel = computed(() => {
  if (!lastUpdate.value) return "Güncelleniyor...";
  const diff = Math.floor((now.value - lastUpdate.value) / 1000);
  if (diff < 5) return "Az önce güncellendi";
  if (diff < 60) return `${diff} sn önce güncellendi`;
  const min = Math.floor(diff / 60);
  return `${min} dk önce güncellendi`;
});

const refreshStats = async () => {
  await adminStore.fetchDashboardStats();
  lastUpdate.value = Date.now();
  now.value = Date.now();
};

onMounted(() => {
  refreshStats();
  pollTimer = setInterval(refreshStats, POLL_INTERVAL);
  tickTimer = setInterval(() => { now.value = Date.now(); }, 10000);
});

onBeforeUnmount(() => {
  clearInterval(pollTimer);
  clearInterval(tickTimer);
});

const statCards = computed(() => [
  { title: "Kullanıcılar", value: adminStore.stats?.totalUsers || 0, icon: "mdi-account-group-outline", color: "primary" },
  { title: "Gönderiler", value: adminStore.stats?.totalPosts || 0, icon: "mdi-post-outline", color: "info" },
  { title: "Projeler", value: adminStore.stats?.totalProjects || 0, icon: "mdi-folder-outline", color: "success" },
  { title: "Yorumlar", value: adminStore.stats?.totalComments || 0, icon: "mdi-comment-outline", color: "secondary" },
  { title: "Bekleyen Raporlar", value: adminStore.stats?.pendingReports || 0, icon: "mdi-flag-outline", color: "warning", highlight: true },
]);

const reportTypeLabel = (type) => {
  const map = { post: "Gönderi", comment: "Yorum", project: "Proje", user: "Kullanıcı", chat: "Sohbet", application: "Başvuru", other: "Diğer" };
  return map[type] || type;
};

const reasonLabel = (reason) => {
  const map = { spam: "Spam", abuse: "İstismar", harassment: "Taciz", "inappropriate content": "Uygunsuz İçerik", other: "Diğer" };
  return map[reason] || reason;
};

const reportStateColor = (state) => {
  const map = { pending: "warning", resolved: "success", rejected: "error", cancelled: "grey" };
  return map[state] || "grey";
};

const reportStateIcon = (state) => {
  const map = { pending: "mdi-clock-outline", resolved: "mdi-check-circle-outline", rejected: "mdi-close-circle-outline", cancelled: "mdi-cancel" };
  return map[state] || "mdi-help-circle-outline";
};

const reportStateLabel = (state) => {
  const map = { pending: "Bekliyor", resolved: "Çözüldü", rejected: "Reddedildi", cancelled: "İptal" };
  return map[state] || state;
};
</script>