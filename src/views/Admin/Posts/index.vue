<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Gönderi Yönetimi</h1>

    <!-- Arama -->
    <v-card rounded="lg" class="mb-4 pa-4">
      <v-row dense>
        <v-col cols="12">
          <v-text-field
            v-model="filters.search"
            label="Gönderi Ara"
            prepend-inner-icon="mdi-magnify"
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
        :items="adminStore.posts"
        :loading="adminStore.status === 'loading'"
        :items-length="adminStore.postsPagination?.totalPosts || 0"
        :items-per-page="filters.limit"
        :page="filters.page"
        :items-per-page-options="itemsPerPageOptions"
        items-per-page-text="Sayfa başına:"
        density="comfortable"
        @update:options="onTableOptions"
      >
        <template v-slot:[`item.author`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="32" color="primary" class="mr-3">
              <v-img v-if="item.author?.profile?.avatarUrl" :src="getMediaUrl(item.author.profile.avatarUrl)" />
              <span v-else class="text-caption text-white font-weight-bold">
                {{ (item.author?.username || '?')[0].toUpperCase() }}
              </span>
            </v-avatar>
            <span class="text-body-2">{{ item.author?.username || 'Silinmiş' }}</span>
          </div>
        </template>
        <template v-slot:[`item.content`]="{ item }">
          <span class="text-body-2">{{ item.content?.substring(0, 80) }}{{ item.content?.length > 80 ? '...' : '' }}</span>
        </template>
        <template v-slot:[`item.engagement`]="{ item }">
          <div class="d-flex ga-2">
            <v-chip size="default" variant="tonal" color="error">
              <v-icon start size="14">mdi-heart</v-icon>{{ item.engagement?.likes?.length || 0 }}
            </v-chip>
            <v-chip size="default" variant="tonal" color="info">
              <v-icon start size="14">mdi-comment</v-icon>{{ item.engagement?.commentsCount || 0 }}
            </v-chip>
          </div>
        </template>
        <template v-slot:[`item.createdAt`]="{ item }">
          <span class="text-body-2">{{ formatDate(item.createdAt) }}</span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex ga-2">
            <v-btn size="small" icon variant="text" color="primary" :href="`/posts/${item._id}`" target="_blank">
              <v-icon size="18">mdi-open-in-new</v-icon>
              <v-tooltip activator="parent" location="top">Gönderiye Git</v-tooltip>
            </v-btn>
            <v-btn size="small" icon variant="text" color="error" @click="confirmDelete(item)">
              <v-icon size="18">mdi-delete-outline</v-icon>
              <v-tooltip activator="parent" location="top">Sil</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Silme Onay Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1 font-weight-bold">Gönderiyi Sil</v-card-title>
        <v-card-text>Bu gönderiyi ve tüm yorumlarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">İptal</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="handleDelete">Sil</v-btn>
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
const filters = reactive({ page: 1, limit: 10, search: "" });
let searchTimer = null;
const deleteDialog = ref(false);
const deleting = ref(false);
const selectedPost = ref(null);

const headers = [
  { title: "Yazar", key: "author", sortable: false },
  { title: "İçerik", key: "content", sortable: false },
  { title: "Etkileşim", key: "engagement", sortable: false },
  { title: "Tarih", key: "createdAt", sortable: false },
  { title: "İşlem", key: "actions", sortable: false, width: 100 },
];

const loadPosts = () => {
  const params = { page: filters.page, limit: filters.limit };
  if (filters.search) params.search = filters.search;
  adminStore.fetchPosts(params);
};

const onTableOptions = ({ page, itemsPerPage }) => {
  filters.page = page;
  filters.limit = itemsPerPage;
  loadPosts();
};

watch(() => filters.search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    filters.page = 1;
    loadPosts();
  }, 400);
});

const confirmDelete = (post) => {
  selectedPost.value = post;
  deleteDialog.value = true;
};

const handleDelete = async () => {
  if (!selectedPost.value) return;
  deleting.value = true;
  const success = await adminStore.deletePost(selectedPost.value._id);
  deleting.value = false;
  if (success) deleteDialog.value = false;
};

onMounted(() => loadPosts());
</script>
