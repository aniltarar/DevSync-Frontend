<template>
  <div>
    <!-- Geri butonu -->
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4 pa-2"
      :to="{ name: 'ProjectDetail', params: { projectId: route.params.projectId } }"
    >
      Projeye Dön
    </v-btn>

    <!-- Loading -->
    <template v-if="applicationStore.status === 'loading'">
      <v-skeleton-loader type="heading" rounded="lg" class="mb-4" />
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
        @click="loadApplications"
      >
        Tekrar Dene
      </v-btn>
    </div>

    <!-- İçerik -->
    <template v-else>
      <div class="mb-4">
        <h1 class="text-h5 font-weight-bold">Proje Başvuruları</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Projenize yapılan başvuruları yönetin
        </p>
      </div>

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
          {{ activeFilter === "all" ? "Bu projeye henüz başvuru yapılmamış." : "Bu filtrede başvuru bulunamadı." }}
        </p>
      </div>

      <!-- Liste -->
      <div class="d-flex flex-column ga-3">
        <ApplicationCard
          v-for="app in filteredApplications"
          :key="app._id"
          :application="app"
          show-applicant
          :show-actions="app.status === 'pending'"
        >
          <template #actions>
            <v-btn
              color="error"
              variant="tonal"
              size="small"
              rounded="lg"
              :loading="processingId === app._id && processingAction === 'reject'"
              :disabled="!!processingId"
              @click="reject(app._id)"
            >
              Reddet
            </v-btn>
            <v-btn
              color="success"
              variant="flat"
              size="small"
              rounded="lg"
              style="color: white"
              :loading="processingId === app._id && processingAction === 'accept'"
              :disabled="!!processingId"
              @click="accept(app._id)"
            >
              Kabul Et
            </v-btn>
          </template>
        </ApplicationCard>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useApplicationStore } from "@/stores/application";
import ApplicationCard from "../components/ApplicationCard.vue";

const route = useRoute();
const applicationStore = useApplicationStore();

const activeFilter = ref("all");
const processingId = ref(null);
const processingAction = ref(null);

const filterOptions = [
  { label: "Tümü", value: "all" },
  { label: "Beklemede", value: "pending" },
  { label: "Kabul Edildi", value: "accepted" },
  { label: "Reddedildi", value: "rejected" },
  { label: "İptal Edildi", value: "cancelled" },
];

const filteredApplications = computed(() => {
  if (activeFilter.value === "all") return applicationStore.applications;
  return applicationStore.applications.filter(
    (a) => a.status === activeFilter.value,
  );
});

function countByStatus(status) {
  return applicationStore.applications.filter((a) => a.status === status).length;
}

function loadApplications() {
  applicationStore.getApplicationsByProject(route.params.projectId);
}

async function accept(applicationId) {
  processingId.value = applicationId;
  processingAction.value = "accept";
  await applicationStore.acceptApplication(applicationId);
  processingId.value = null;
  processingAction.value = null;
  loadApplications();
}

async function reject(applicationId) {
  processingId.value = applicationId;
  processingAction.value = "reject";
  await applicationStore.rejectApplication(applicationId);
  processingId.value = null;
  processingAction.value = null;
  loadApplications();
}

onMounted(() => {
  loadApplications();
});
</script>
