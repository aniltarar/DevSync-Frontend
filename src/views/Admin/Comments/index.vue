<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Yorum Yönetimi</h1>

    <!-- Arama -->
    <v-card rounded="lg" class="mb-4 pa-4">
      <v-row dense>
        <v-col cols="12">
          <v-text-field
            v-model="filters.search"
            label="Yorum Ara"
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
        :items="adminStore.comments"
        :loading="adminStore.status === 'loading'"
        :items-length="adminStore.commentsPagination?.totalComments || 0"
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
          <span class="text-body-2">{{ item.content?.substring(0, 100) }}{{ item.content?.length > 100 ? '...' : '' }}</span>
        </template>
        <template v-slot:[`item.postId`]="{ item }">
          <span class="text-body-2 text-medium-emphasis">
            {{ item.postId?.content?.substring(0, 30) || item.postId || '-' }}{{ item.postId?.content?.length > 30 ? '...' : '' }}
          </span>
        </template>
        <template v-slot:[`item.createdAt`]="{ item }">
          <span class="text-body-2">{{ formatDate(item.createdAt) }}</span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn size="small" class="bg-red" icon variant="text" color="error" @click="confirmDelete(item)">
            <v-icon size="18">mdi-delete-outline</v-icon>
            <v-tooltip activator="parent" location="top">Sil</v-tooltip>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Silme Onay Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1 font-weight-bold">Yorumu Sil</v-card-title>
        <v-card-text>Bu yorumu ve tüm alt yorumlarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</v-card-text>
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
const selectedComment = ref(null);

const headers = [
  { title: "Yazar", key: "author", sortable: false },
  { title: "Yorum", key: "content", sortable: false },
  { title: "Gönderi", key: "postId", sortable: false },
  { title: "Tarih", key: "createdAt", sortable: false },
  { title: "İşlem", key: "actions", sortable: false, width: 80 },
];

const loadComments = () => {
  const params = { page: filters.page, limit: filters.limit };
  if (filters.search) params.search = filters.search;
  adminStore.fetchComments(params);
};

const onTableOptions = ({ page, itemsPerPage }) => {
  filters.page = page;
  filters.limit = itemsPerPage;
  loadComments();
};

watch(() => filters.search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    filters.page = 1;
    loadComments();
  }, 400);
});

const confirmDelete = (comment) => {
  selectedComment.value = comment;
  deleteDialog.value = true;
};

const handleDelete = async () => {
  if (!selectedComment.value) return;
  deleting.value = true;
  const success = await adminStore.deleteComment(selectedComment.value._id);
  deleting.value = false;
  if (success) deleteDialog.value = false;
};

onMounted(() => loadComments());
</script>
