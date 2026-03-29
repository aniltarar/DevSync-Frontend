<template>
  
    <!-- Başlık -->
    <div class="mb-4">
      <h1 class="text-h5 font-weight-bold">Raporlarım</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Gönderdiğiniz raporları takip edin
      </p>
    </div>

    <!-- Loading -->
    <template v-if="reportStore.status === 'loading'">
      <v-skeleton-loader
        v-for="i in 4"
        :key="i"
        type="article"
        rounded="lg"
        class="mb-3"
      />
    </template>

    <!-- Hata -->
    <div
      v-else-if="reportStore.status === 'error'"
      class="text-center py-16"
    >
      <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
      <p class="text-body-1 mt-4">{{ reportStore.message }}</p>
      <v-btn class="mt-4" color="primary" variant="tonal" @click="load">
        Tekrar Dene
      </v-btn>
    </div>

    <!-- İçerik -->
    <template v-else>
      <!-- Filtreler -->
      <div class="d-flex flex-wrap ga-2 mb-4">
        <v-chip
          v-for="opt in filterOptions"
          :key="opt.value"
          :variant="activeFilter === opt.value ? 'flat' : 'tonal'"
          :color="activeFilter === opt.value ? 'primary' : undefined"
          size="small"
          @click="setFilter(opt.value)"
        >
          {{ opt.label }}
          <template v-if="opt.value !== 'all'" #append>
            <span class="ml-1 text-caption">({{ countByStatus(opt.value) }})</span>
          </template>
        </v-chip>
      </div>

      <!-- Boş durum -->
      <div v-if="!filteredReports.length" class="text-center py-16">
        <v-icon size="64" color="medium-emphasis">mdi-flag-off-outline</v-icon>
        <p class="text-body-1 mt-4 text-medium-emphasis">
          {{ activeFilter === "all" ? "Henüz raporunuz yok." : "Bu filtrede rapor bulunamadı." }}
        </p>
      </div>

      <!-- Liste -->
      <div v-else class="d-flex flex-column ga-3">
        <ReportCard
          v-for="report in filteredReports"
          :key="report._id"
          :report="report"
          :show-actions="getState(report) === 'pending'"
        >
          <template #actions>
            <v-btn
              color="error"
              variant="tonal"
              size="small"
              rounded="lg"
              @click="pendingCancelId = report._id"
            >
              İptal Et
            </v-btn>
          </template>
        </ReportCard>
      </div>

      <!-- Sayfalama -->
      <div v-if="reportStore.pagination.totalPages > 0" class="d-flex justify-center mt-6">
        <v-pagination
          v-model="currentPage"
          :length="reportStore.pagination.totalPages"
          :total-visible="5"
          density="comfortable"
          @update:model-value="load"
        />
      </div>
    </template>

  <!-- İptal onay dialog -->
  <v-dialog :model-value="!!pendingCancelId" max-width="360" @update:model-value="pendingCancelId = null">
    <v-card rounded="xl">
      <v-card-title class="text-h6 font-weight-bold pa-4">
        Raporu İptal Et
      </v-card-title>
      <v-card-text class="px-4 pb-2">
        Bu raporu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
      </v-card-text>
      <v-card-actions class="pa-4 pt-2">
        <v-spacer />
        <v-btn variant="text" rounded="lg" @click="pendingCancelId = null">Vazgeç</v-btn>
        <v-btn
          color="error"
          variant="flat"
          rounded="lg"
          :loading="cancellingId !== null"
          @click="cancelReport(pendingCancelId)"
        >
          İptal Et
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useReportStore } from "@/stores/report";
import ReportCard from "./components/ReportCard.vue";
const reportStore = useReportStore();
const activeFilter = ref("all");
const cancellingId = ref(null);
const pendingCancelId = ref(null);
const currentPage = ref(1);

const filterOptions = [
  { label: "Tümü", value: "all" },
  { label: "Beklemede", value: "pending" },
  { label: "Çözüldü", value: "resolved" },
  { label: "Reddedildi", value: "rejected" },
  { label: "İptal Edildi", value: "cancelled" },
];


function getState(report) {
  return report.status?.state ?? report.status;
}

const filteredReports = computed(() => {
  if (activeFilter.value === "all") return reportStore.myReports;
  return reportStore.myReports.filter((r) => getState(r) === activeFilter.value);
});

function countByStatus(status) {
  return reportStore.myReports.filter((r) => getState(r) === status).length;
}

function setFilter(value) {
  activeFilter.value = value;
}

async function load() {
  await reportStore.getMyReports({ page: currentPage.value, limit: 10 });
}


async function cancelReport(reportId) {
  cancellingId.value = reportId;
  const success = await reportStore.cancelReport(reportId);
  cancellingId.value = null;
  pendingCancelId.value = null;
  if (success) await load();
}

onMounted(() => {
  load();
});
</script>
