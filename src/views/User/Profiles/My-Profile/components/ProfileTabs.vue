<template>
  <v-card rounded="xl" elevation="0" border>
    <v-tabs v-model="activeTab" color="primary" density="comfortable">
      <v-tab value="posts" prepend-icon="mdi-post-outline">Gönderiler</v-tab>
      <v-tab value="projects" prepend-icon="mdi-folder-outline">Projeler</v-tab>
    </v-tabs>

    <v-divider />

    <v-tabs-window v-model="activeTab">
      <!-- Posts Tab -->
      <v-tabs-window-item value="posts">
        <v-card-text class="d-flex flex-column ga-3">
          <div v-if="postStore.status === 'loading'" class="text-center py-10">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <div
            v-else-if="postStore.posts.length === 0"
            class="text-center py-10"
          >
            <v-icon size="48" color="medium-emphasis">mdi-post-outline</v-icon>
            <p class="text-body-2 text-medium-emphasis mt-3">
              Henüz gönderi yok.
            </p>
          </div>

          <template v-else>
            <PostCard
              v-for="post in postStore.posts"
              :key="post._id"
              :post="post"
            />

            <div class="d-flex justify-center mt-2">
              <v-pagination
                v-model="currentPage"
                :length="postStore.pagination.totalPages"
                :total-visible="5"
                density="comfortable"
                @update:model-value="loadPosts"
              />
            </div>
          </template>
        </v-card-text>
      </v-tabs-window-item>

      <!-- Projects Tab -->
      <v-tabs-window-item value="projects">
        <v-card-text>
          <div
            v-if="projectStore.status === 'loading'"
            class="text-center py-10"
          >
            <v-progress-circular indeterminate color="primary" />
          </div>

          <div
            v-else-if="projectStore.projects.length === 0"
            class="text-center py-10"
          >
            <v-icon size="48" color="medium-emphasis"
              >mdi-folder-open-outline</v-icon
            >
            <p class="text-body-2 text-medium-emphasis mt-3">
              Henüz proje yok.
            </p>
          </div>

          <v-row v-else>
            <v-col
              v-for="project in projectStore.projects"
              :key="project._id"
              cols="12"
              sm="6"
            >
              <ProjectCard :project="project" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { usePostStore } from "@/stores/post";
import { useProjectStore } from "@/stores/project";
import { useAuthStore } from "@/stores/auth";
import PostCard from "@/components/PostCard.vue";
import ProjectCard from "./ProjectCard.vue";

const postStore = usePostStore();
const projectStore = useProjectStore();
const authStore = useAuthStore();

const activeTab = ref("posts");
const currentPage = ref(1);
let projectsLoaded = false;

function loadPosts(page = currentPage.value) {
  postStore.getPostByUserId(authStore.user._id, { page, limit: 5 });
}

function loadProjects() {
  if (projectsLoaded) return;
  projectsLoaded = true;
  projectStore.fetchMyProjects();
}

watch(activeTab, (tab) => {
  if (tab === "projects") loadProjects();
});

onMounted(() => {
  loadPosts();
});
</script>
