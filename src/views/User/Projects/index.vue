<template>
  <!-- Başlık -->
  <div class="d-flex align-center mb-4">
    <div>
      <h1 class="text-h5 font-weight-bold">Projeler</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Açık pozisyonları olan projeleri keşfet ve ekibe katıl
      </p>
    </div>
    <v-spacer />
    <v-btn variant="flat" color="primary" rounded="lg" style="color: white">
      <v-icon left>mdi-plus</v-icon>
      Proje Oluştur
    </v-btn>
  </div>

  <!-- Filtreler -->
  <v-expansion-panels variant="flat" class="mb-6" rounded="lg">
    <v-expansion-panel>
      <v-expansion-panel-title>
        <div class="d-flex align-center ga-2">
          <v-icon size="18" color="medium-emphasis">mdi-filter-outline</v-icon>
          <span class="text-body-2 font-weight-medium">Filtrele</span>
          <div v-if="hasActiveFilters" class="d-flex align-center ga-1 ml-2">
            <v-chip
              v-for="chip in activeFilterChips"
              :key="chip.key"
              size="small"
              variant="tonal"
              color="primary"
              closable
              @click.stop="filters[chip.key] = null"
              @click:close.stop="filters[chip.key] = null"
            >
              {{ chip.label }}
            </v-chip>
          </div>
        </div>
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <div class="d-flex flex-column ga-2 pt-1">
          <div class="d-flex align-center flex-wrap ga-2">
            <span class="text-caption text-medium-emphasis filter-label"
              >Durum</span
            >
            <v-chip-group v-model="filters.status">
              <v-chip
                v-for="opt in statusOptions"
                :key="opt.value"
                :value="opt.value"
                size="small"
                :variant="filters.status === opt.value ? 'flat' : 'tonal'"
                :color="filters.status === opt.value ? 'primary' : undefined"
                filter
              >
                {{ opt.title }}
              </v-chip>
            </v-chip-group>
          </div>

          <v-divider />

          <div class="d-flex align-center flex-wrap ga-2">
            <span class="text-caption text-medium-emphasis filter-label"
              >Kategori</span
            >
            <v-chip-group v-model="filters.category">
              <v-chip
                v-for="opt in categoryOptions"
                :key="opt.value"
                :value="opt.value"
                size="small"
                :variant="filters.category === opt.value ? 'flat' : 'tonal'"
                :color="filters.category === opt.value ? 'primary' : undefined"
                filter
              >
                {{ opt.title }}
              </v-chip>
            </v-chip-group>
          </div>

          <v-divider />

          <div class="d-flex align-center flex-wrap ga-2">
            <span class="text-caption text-medium-emphasis filter-label"
              >Tip</span
            >
            <v-chip-group v-model="filters.projectType">
              <v-chip
                v-for="opt in projectTypeOptions"
                :key="opt.value"
                :value="opt.value"
                size="small"
                :variant="filters.projectType === opt.value ? 'flat' : 'tonal'"
                :color="
                  filters.projectType === opt.value ? 'primary' : undefined
                "
                filter
              >
                {{ opt.title }}
              </v-chip>
            </v-chip-group>
          </div>

          <div v-if="hasActiveFilters" class="d-flex justify-end pt-1">
            <v-btn
              class="rounded-lg"
              variant="outlined"
              size="small"
              color="error"
              prepend-icon="mdi-close-circle-outline"
              @click="clearFilters"
            >
              Tümünü Temizle
            </v-btn>
          </div>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>

  <!-- Loading -->
  <v-row v-if="projectStore.status === 'loading'">
    <v-col v-for="n in 6" :key="n" cols="12" sm="6" lg="4">
      <v-skeleton-loader type="card" rounded="lg" />
    </v-col>
  </v-row>

  <!-- Liste -->
  <v-row v-else-if="projectStore.projects.length">
    <v-col
      v-for="project in projectStore.projects"
      :key="project._id"
      cols="12"
      sm="6"
      lg="4"
    >
      <ProjectCard :project="project" />
    </v-col>
  </v-row>

  <!-- Boş durum -->
  <div v-else class="text-center py-16">
    <v-icon size="64" color="medium-emphasis">mdi-folder-open-outline</v-icon>
    <p class="text-body-1 text-medium-emphasis mt-4">
      {{
        hasActiveFilters
          ? "Filtrelere uygun proje bulunamadı."
          : "Henüz hiç proje yok."
      }}
    </p>
    <v-btn
      v-if="hasActiveFilters"
      variant="tonal"
      size="small"
      class="mt-3"
      @click="clearFilters"
    >
      Filtreleri Temizle
    </v-btn>
  </div>
</template>

<script setup>
import { reactive, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectStore } from "@/stores/project";
import { buildQuery } from "@/utils/buildQuery";
import ProjectCard from "./Components/ProjectCard.vue";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const statusOptions = [
  { title: "Aktif", value: "active" },
  { title: "Beklemede", value: "pending" },
  { title: "Kapalı", value: "closed" },
  { title: "Taslak", value: "draft" },
];

const categoryOptions = [
  { title: "Web", value: "web" },
  { title: "Mobil", value: "mobile" },
  { title: "Masaüstü", value: "desktop" },
  { title: "Yapay Zeka", value: "ai" },
  { title: "Oyun", value: "game" },
  { title: "DevOps", value: "devops" },
  { title: "Diğer", value: "other" },
];

const projectTypeOptions = [
  { title: "Takım", value: "team" },
  { title: "Solo", value: "solo" },
  { title: "Açık Kaynak", value: "open-source" },
  { title: "Freelance", value: "freelance" },
];

const filters = reactive({
  status: route.query.status || null,
  category: route.query.category || null,
  projectType: route.query.projectType || null,
});

const hasActiveFilters = computed(() => Object.values(filters).some(Boolean));

const activeFilterChips = computed(() =>
  [
    { key: "status", options: statusOptions },
    { key: "category", options: categoryOptions },
    { key: "projectType", options: projectTypeOptions },
  ]
    .filter(({ key }) => filters[key])
    .map(({ key, options }) => ({
      key,
      label: options.find((o) => o.value === filters[key])?.title,
    })),
);

function clearFilters() {
  filters.status = null;
  filters.category = null;
  filters.projectType = null;
}

watch(
  filters,
  () => {
    // v-chip-group seçimi kaldırınca undefined döner, null'a normalize et
    for (const key of Object.keys(filters)) {
      if (filters[key] === undefined) filters[key] = null;
    }
    router.replace({ query: buildQuery(filters) });
    projectStore.fetchProjects(filters);
  },
  { deep: true },
);

onMounted(() => {
  projectStore.fetchProjects(filters);
});
</script>

<style scoped>
.filter-label {
  min-width: 64px;
}
</style>
