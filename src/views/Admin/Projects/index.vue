<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Proje Yönetimi</h1>

    <!-- Filtreler -->
    <v-card rounded="lg" class="mb-4 pa-4">
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="filters.search"
            label="Proje Ara"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            variant="outlined"
            clearable
            hide-details
          />
        </v-col>
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
            v-model="filters.category"
            :items="categoryOptions"
            label="Kategori"
            density="compact"
            variant="outlined"
            clearable
            hide-details
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Tablo -->
    <v-card rounded="lg">
      <v-data-table-server
        :headers="headers"
        :items="adminStore.projects"
        :loading="adminStore.status === 'loading'"
        :items-length="adminStore.projectsPagination?.totalProjects || 0"
        :items-per-page="filters.limit"
        :page="filters.page"
        :items-per-page-options="itemsPerPageOptions"
        items-per-page-text="Sayfa başına:"
        density="comfortable"
        @update:options="onTableOptions"
      >
        <template v-slot:[`item.title`]="{ item }">
          <div class="py-2">
            <div class="text-body-2 font-weight-medium">{{ item.title }}</div>
            <div class="text-caption text-medium-emphasis" style="max-width: 300px; white-space: normal;">
              {{ item.description?.substring(0, 100) }}{{ item.description?.length > 100 ? '...' : '' }}
            </div>
          </div>
        </template>
        <template v-slot:[`item.owner`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="32" color="primary" class="mr-3">
              <v-img v-if="item.ownerId?.profile?.avatarUrl" :src="getMediaUrl(item.ownerId.profile.avatarUrl)" />
              <span v-else class="text-caption text-white font-weight-bold">
                {{ (item.ownerId?.username || '?')[0].toUpperCase() }}
              </span>
            </v-avatar>
            <span class="text-body-2">{{ item.ownerId?.username || 'Bilinmiyor' }}</span>
          </div>
        </template>
        <template v-slot:[`item.category`]="{ item }">
          <v-chip size="default" variant="tonal">{{ categoryLabel(item.category) }}</v-chip>
        </template>
        <template v-slot:[`item.projectType`]="{ item }">
          <v-chip size="default" variant="tonal" color="secondary">{{ projectTypeLabel(item.projectType) }}</v-chip>
        </template>
        <template v-slot:[`item.slots`]="{ item }">
          <div class="d-flex ga-2 align-center">
            <v-chip size="default" variant="tonal" color="info">
              {{ item.slots?.length || 0 }} Rol
            </v-chip>
            <v-chip size="default" variant="tonal" color="success">
              {{ filledSlotCount(item.slots) }}/{{ totalSlotQuota(item.slots) }} Dolu
            </v-chip>
          </div>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip size="default" :color="projectStatusColor(item.status)">
            {{ projectStatusLabel(item.status) }}
          </v-chip>
        </template>
        <template v-slot:[`item.createdAt`]="{ item }">
          <span class="text-body-2">{{ formatDate(item.createdAt) }}</span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex ga-2">
            <v-btn size="small" icon variant="text" @click="openDetailDialog(item)">
              <v-icon size="18">mdi-eye-outline</v-icon>
              <v-tooltip activator="parent" location="top">Detay</v-tooltip>
            </v-btn>
            <v-menu>
              <template #activator="{ props }">
                <v-btn size="small" icon variant="text" v-bind="props">
                  <v-icon size="18">mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item
                  v-for="s in availableStatuses(item.status)"
                  :key="s.value"
                  @click="changeStatus(item, s.value)"
                >
                  <v-list-item-title class="text-body-2">{{ s.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Detay Dialog -->
    <v-dialog v-model="detailDialog" max-width="600">
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1 font-weight-bold">Proje Detayı</v-card-title>
        <v-card-text v-if="selectedProject">
          <div class="text-h6 font-weight-bold mb-1">{{ selectedProject.title }}</div>
          <p class="text-body-2 text-medium-emphasis mb-3" style="white-space: pre-wrap;">{{ selectedProject.description || '-' }}</p>
          <v-divider class="mb-3" />

          <div class="d-flex flex-wrap ga-2 mb-3">
            <v-chip size="default" variant="tonal" color="primary">{{ categoryLabel(selectedProject.category) }}</v-chip>
            <v-chip size="default" variant="tonal" color="secondary">{{ projectTypeLabel(selectedProject.projectType) }}</v-chip>
            <v-chip size="default" :color="projectStatusColor(selectedProject.status)">{{ projectStatusLabel(selectedProject.status) }}</v-chip>
          </div>

          <div class="text-body-2 mb-1">
            <strong>Sahip:</strong> {{ selectedProject.ownerId?.username || 'Bilinmiyor' }}
          </div>
          <div class="text-body-2 mb-3">
            <strong>Oluşturulma:</strong> {{ formatDate(selectedProject.createdAt) }}
          </div>

          <v-divider class="mb-3" />
          <div class="text-subtitle-2 font-weight-bold mb-2">Roller ({{ selectedProject.slots?.length || 0 }})</div>
          <div v-if="selectedProject.slots?.length" class="d-flex flex-column ga-2">
            <v-card v-for="(slot, i) in selectedProject.slots" :key="i" variant="outlined" rounded="lg" class="pa-3">
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-body-2 font-weight-medium">{{ slot.roleName }}</span>
                <v-chip size="small" :color="slot.status === 'filled' ? 'success' : 'info'" variant="tonal">
                  {{ slot.filledBy?.length || 0 }}/{{ slot.quota }} {{ slot.status === 'filled' ? 'Dolu' : 'Açık' }}
                </v-chip>
              </div>
              <div v-if="slot.requiredSkills?.length" class="d-flex flex-wrap ga-1 mt-1">
                <v-chip v-for="skill in slot.requiredSkills" :key="skill" size="small" variant="tonal" color="primary">{{ skill }}</v-chip>
              </div>
              <div v-if="slot.optionalSkills?.length" class="d-flex flex-wrap ga-1 mt-1">
                <v-chip v-for="skill in slot.optionalSkills" :key="skill" size="small" variant="tonal" color="secondary">{{ skill }}</v-chip>
              </div>
            </v-card>
          </div>
          <div v-else class="text-body-2 text-medium-emphasis">Henüz rol eklenmemiş.</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="detailDialog = false">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
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
const filters = reactive({ page: 1, limit: 10, search: "", status: null, category: null });
let searchTimer = null;
const detailDialog = ref(false);
const selectedProject = ref(null);

const headers = [
  { title: "Proje", key: "title", sortable: false },
  { title: "Sahip", key: "owner", sortable: false },
  { title: "Kategori", key: "category", sortable: false },
  { title: "Tür", key: "projectType", sortable: false },
  { title: "Roller", key: "slots", sortable: false },
  { title: "Durum", key: "status", sortable: false },
  { title: "Tarih", key: "createdAt", sortable: false },
  { title: "İşlem", key: "actions", sortable: false, width: 100 },
];

const statusOptions = [
  { title: "Taslak", value: "draft" },
  { title: "Beklemede", value: "pending" },
  { title: "Aktif", value: "active" },
  { title: "Kapalı", value: "closed" },
  { title: "Reddedildi", value: "rejected" },
];

const categoryOptions = [
  { title: "Web", value: "web" },
  { title: "Mobil", value: "mobile" },
  { title: "Masaüstü", value: "desktop" },
  { title: "AI", value: "ai" },
  { title: "Oyun", value: "game" },
  { title: "DevOps", value: "devops" },
  { title: "Diğer", value: "other" },
];

const projectTypeLabel = (t) => ({ personal: "Kişisel", team: "Takım", "open-source": "Açık Kaynak", freelance: "Freelance" })[t] || t;
const projectStatusColor = (s) => ({ draft: "grey", pending: "warning", active: "success", closed: "info", rejected: "error" })[s] || "grey";
const projectStatusLabel = (s) => ({ draft: "Taslak", pending: "Beklemede", active: "Aktif", closed: "Kapalı", rejected: "Reddedildi" })[s] || s;
const categoryLabel = (c) => ({ web: "Web", mobile: "Mobil", desktop: "Masaüstü", ai: "AI", game: "Oyun", devops: "DevOps", other: "Diğer" })[c] || c;

const filledSlotCount = (slots) => slots?.reduce((acc, s) => acc + (s.filledBy?.length || 0), 0) || 0;
const totalSlotQuota = (slots) => slots?.reduce((acc, s) => acc + (s.quota || 0), 0) || 0;

const availableStatuses = (current) => {
  return statusOptions.filter((s) => s.value !== current);
};

const openDetailDialog = (project) => {
  selectedProject.value = project;
  detailDialog.value = true;
};

const changeStatus = async (project, newStatus) => {
  await adminStore.updateProjectStatus(project._id, newStatus);
};

const loadProjects = () => {
  const params = { page: filters.page, limit: filters.limit };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.category) params.category = filters.category;
  adminStore.fetchProjects(params);
};

const onTableOptions = ({ page, itemsPerPage }) => {
  filters.page = page;
  filters.limit = itemsPerPage;
  loadProjects();
};

watch(() => filters.search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    filters.page = 1;
    loadProjects();
  }, 400);
});

watch(() => [filters.status, filters.category], () => {
  filters.page = 1;
  loadProjects();
});

onMounted(() => loadProjects());
</script>
