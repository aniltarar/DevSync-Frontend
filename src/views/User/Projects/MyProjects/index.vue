<template>
  <div>
    <!-- Başlık -->
    <div class="d-flex align-center mb-4">
      <div>
        <h1 class="text-h5 font-weight-bold">Projelerim</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Oluşturduğunuz projeleri yönetin
        </p>
      </div>
      <v-spacer />
      <v-btn
        variant="flat"
        color="primary"
        rounded="lg"
        style="color: white"
        :to="{ name: 'CreateProject' }"
      >
        <v-icon left>mdi-plus</v-icon>
        Yeni Proje
      </v-btn>
    </div>

    <!-- Loading -->
    <v-row v-if="projectStore.status === 'loading'">
      <v-col v-for="n in 6" :key="n" cols="12" sm="6" lg="4">
        <v-skeleton-loader type="card" rounded="lg" />
      </v-col>
    </v-row>

    <!-- Hata -->
    <div
      v-else-if="projectStore.status === 'error'"
      class="text-center py-16"
    >
      <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
      <p class="text-body-1 mt-4">{{ projectStore.message }}</p>
      <v-btn
        class="mt-4"
        color="primary"
        variant="tonal"
        @click="load(currentPage)"
      >
        Tekrar Dene
      </v-btn>
    </div>

    <!-- Liste -->
    <template v-else-if="projectStore.projects.length">
      <v-row>
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

      <!-- Pagination -->
      <div
        v-if="projectStore.myProjectsPagination.totalPages > 1"
        class="d-flex justify-center mt-6"
      >
        <v-pagination
          v-model="currentPage"
          :length="projectStore.myProjectsPagination.totalPages"
          :total-visible="5"
          density="comfortable"
          @update:model-value="load"
        />
      </div>
    </template>

    <!-- Boş durum -->
    <div v-else class="text-center py-16">
      <v-icon size="64" color="medium-emphasis">
        mdi-folder-open-outline
      </v-icon>
      <p class="text-body-1 text-medium-emphasis mt-4">
        Henüz bir projeniz yok.
      </p>
      <v-btn
        class="mt-4"
        color="primary"
        variant="flat"
        rounded="lg"
        style="color: white"
        :to="{ name: 'CreateProject' }"
      >
        İlk Projenizi Oluşturun
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useProjectStore } from "@/stores/project";
import ProjectCard from "../Components/ProjectCard.vue";

const projectStore = useProjectStore();
const currentPage = ref(1);

async function load(page = currentPage.value) {
  currentPage.value = page;
  await projectStore.fetchMyProjects({ page });
}

onMounted(() => {
  load(1);
});
</script>
