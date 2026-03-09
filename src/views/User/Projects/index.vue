<template>
  <v-container class="py-6">
    <!-- Başlık -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Projeler</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Açık pozisyonları olan projeleri keşfet ve ekibe katıl
        </p>
      </div>
    </div>

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
      <p class="text-body-1 text-medium-emphasis mt-4">Henüz hiç proje yok.</p>
    </div>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProjectStore } from '@/stores/projectStore';
import ProjectCard from './Components/ProjectCard.vue';

const projectStore = useProjectStore();

onMounted(() => {
  projectStore.fetchProjects();
});
</script>
