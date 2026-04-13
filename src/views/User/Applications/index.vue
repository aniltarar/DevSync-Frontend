<template>
  <div>
    <!-- Başlık -->
    <div class="mb-4">
      <h1 class="text-h5 font-weight-bold">Başvurularım</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Projelere yaptığınız başvuruları takip edin
      </p>
    </div>

    <!-- Loading -->
    <template v-if="applicationStore.status === 'loading'">
      <v-skeleton-loader
        v-for="i in 3"
        :key="i"
        type="article"
        rounded="lg"
        class="mb-3"
      />
    </template>

    <!-- Hata -->
    <div
      v-else-if="applicationStore.status === 'error'"
      class="text-center py-16"
    >
      <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
      <p class="text-body-1 mt-4">{{ applicationStore.message }}</p>
      <v-btn
        class="mt-4"
        color="primary"
        variant="tonal"
        @click="load(currentPage)"
      >
        Tekrar Dene
      </v-btn>
    </div>

    <!-- İçerik -->
    <template v-else>
      <!-- Filtre Chips -->
      <div class="d-flex flex-wrap ga-2 mb-4">
        <v-chip
          v-for="opt in filterOptions"
          :key="opt.value"
          :variant="activeFilter === opt.value ? 'flat' : 'tonal'"
          :color="activeFilter === opt.value ? 'primary' : undefined"
          size="small"
          @click="activeFilter = opt.value"
        >
          {{ opt.label }}
          <template v-if="opt.value !== 'all'" #append>
            <span class="ml-1 text-caption">({{ countByStatus(opt.value) }})</span>
          </template>
        </v-chip>
      </div>

      <!-- Boş durum -->
      <div v-if="!filteredApplications.length" class="text-center py-16">
        <v-icon size="64" color="medium-emphasis">
          mdi-clipboard-text-outline
        </v-icon>
        <p class="text-body-1 mt-4 text-medium-emphasis">
          {{ activeFilter === "all" ? "Henüz başvurunuz yok." : "Bu filtrede başvuru bulunamadı." }}
        </p>
      </div>

      <!-- Liste -->
      <div v-else class="d-flex flex-column ga-3">
        <ApplicationCard
          v-for="app in filteredApplications"
          :key="app._id"
          :application="app"
          :show-actions="app.status === 'pending'"
        >
          <template #actions>
            <v-btn
              class="bg-error"
              variant="tonal"
              size="small"
              rounded="lg"
              :loading="cancellingId === app._id"
              @click="cancelApplication(app._id)"
            >
              Başvuruyu İptal Et
            </v-btn>
          </template>
        </ApplicationCard>
      </div>

      <!-- Pagination -->
      <div
        v-if="applicationStore.myApplicationsPagination.totalPages > 1"
        class="d-flex justify-center mt-6"
      >
        <v-pagination
          v-model="currentPage"
          :length="applicationStore.myApplicationsPagination.totalPages"
          :total-visible="5"
          density="comfortable"
          @update:model-value="load"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useApplicationStore } from "@/stores/application";
import ApplicationCard from "./components/ApplicationCard.vue";

const applicationStore = useApplicationStore();
const activeFilter = ref("all");
const cancellingId = ref(null);
const currentPage = ref(1);

const filterOptions = [
  { label: "Tümü", value: "all" },
  { label: "Beklemede", value: "pending" },
  { label: "Kabul Edildi", value: "accepted" },
  { label: "Reddedildi", value: "rejected" },
  { label: "İptal Edildi", value: "cancelled" },
];

const filteredApplications = computed(() => {
  if (activeFilter.value === "all") return applicationStore.myApplications;
  return applicationStore.myApplications.filter(
    (a) => a.status === activeFilter.value,
  );
});

function countByStatus(status) {
  return applicationStore.myApplications.filter((a) => a.status === status).length;
}

async function load(page = currentPage.value) {
  currentPage.value = page;
  await applicationStore.getMyApplications({ page });
}

async function cancelApplication(applicationId) {
  cancellingId.value = applicationId;
  const success = await applicationStore.cancelApplication({ applicationId });
  cancellingId.value = null;
  if (success) await load();
}

onMounted(() => {
  load(1);
});
</script>
