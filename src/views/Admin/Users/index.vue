<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Kullanıcı Yönetimi</h1>

    <!-- Arama ve Filtre -->
    <v-card rounded="lg" class="mb-4 pa-4">
      <v-row dense>
        <v-col cols="12" sm="3">
          <v-text-field
            v-model="filters.search"
            label="Kullanıcı Ara"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            variant="outlined"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="3">
          <v-select
            v-model="filters.role"
            :items="roleOptions"
            label="Rol"
            density="compact"
            variant="outlined"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="3">
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
        <v-col cols="12" sm="3">
          <v-select
            v-model="filters.sortBy"
            :items="sortOptions"
            label="Sıralama"
            density="compact"
            variant="outlined"
            hide-details
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Tablo -->
    <v-card rounded="lg">
      <v-data-table-server
        :headers="headers"
        :items="adminStore.users"
        :loading="adminStore.status === 'loading'"
        :items-length="adminStore.usersPagination?.totalUsers || 0"
        :items-per-page="filters.limit"
        :page="filters.page"
        :items-per-page-options="itemsPerPageOptions"
        items-per-page-text="Sayfa başına:"
        density="comfortable"
        @update:options="onTableOptions"
      >
        <template v-slot:[`item.user`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="32" color="primary" class="mr-3">
              <v-img v-if="item.profile?.avatarUrl" :src="getMediaUrl(item.profile.avatarUrl)" />
              <span v-else class="text-caption text-white font-weight-bold">
                {{ (item.profile?.name || item.username)[0].toUpperCase() }}
              </span>
            </v-avatar>
            <div>
              <div class="text-body-2 font-weight-medium">{{ item.username }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
            </div>
          </div>
        </template>
        <template v-slot:[`item.role`]="{ item }">
          <v-chip size="default" :color="item.role === 'admin' ? 'warning' : 'primary'" variant="tonal">
            {{ item.role === 'admin' ? 'Admin' : 'Kullanıcı' }}
          </v-chip>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip size="default" :color="item.status ? 'success' : 'error'" variant="tonal">
            {{ item.status ? 'Aktif' : 'Banlı' }}
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
            <v-btn
              size="small"
              icon
              variant="text"
              :color="item.status ? 'error' : 'success'"
              @click="toggleStatus(item)"
            >
              <v-icon size="18">{{ item.status ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
              <v-tooltip activator="parent" location="top">{{ item.status ? 'Banla' : 'Aktif Et' }}</v-tooltip>
            </v-btn>
            <v-btn
              size="small"
              icon
              variant="text"
              color="warning"
              @click="toggleRole(item)"
            >
              <v-icon size="18">{{ item.role === 'admin' ? 'mdi-shield-off' : 'mdi-shield-crown' }}</v-icon>
              <v-tooltip activator="parent" location="top">{{ item.role === 'admin' ? 'Admin Kaldır' : 'Admin Yap' }}</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Detay Dialog -->
    <v-dialog v-model="detailDialog" max-width="500">
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1 font-weight-bold">Kullanıcı Detayı</v-card-title>
        <v-card-text v-if="adminStore.currentUser">
          <div class="d-flex align-center mb-4">
            <v-avatar size="48" color="primary" class="mr-3">
              <v-img v-if="adminStore.currentUser.profile?.avatarUrl" :src="getMediaUrl(adminStore.currentUser.profile.avatarUrl)" />
              <span v-else class="text-white font-weight-bold">
                {{ (adminStore.currentUser.profile?.name || adminStore.currentUser.username)[0].toUpperCase() }}
              </span>
            </v-avatar>
            <div>
              <div class="text-body-1 font-weight-bold">{{ adminStore.currentUser.profile?.name }} {{ adminStore.currentUser.profile?.surname }}</div>
              <div class="text-body-2 text-medium-emphasis">@{{ adminStore.currentUser.username }}</div>
            </div>
          </div>
          <v-divider class="mb-3" />
          <div class="text-body-2 mb-1"><strong>Email:</strong> {{ adminStore.currentUser.email }}</div>
          <div class="text-body-2 mb-1"><strong>Rol:</strong> {{ adminStore.currentUser.role }}</div>
          <div class="text-body-2 mb-1"><strong>Durum:</strong> {{ adminStore.currentUser.status ? 'Aktif' : 'Banlı' }}</div>
          <div class="text-body-2 mb-1"><strong>Bio:</strong> {{ adminStore.currentUser.profile?.bio || '-' }}</div>
          <div class="text-body-2 mb-3"><strong>Kayıt:</strong> {{ formatDate(adminStore.currentUser.createdAt) }}</div>
          <v-divider class="mb-3" />
          <div v-if="adminStore.userStatistics" class="d-flex ga-2">
            <v-chip size="default" variant="tonal" color="info">{{ adminStore.userStatistics.postCount }} Gönderi</v-chip>
            <v-chip size="default" variant="tonal" color="success">{{ adminStore.userStatistics.projectCount }} Proje</v-chip>
            <v-chip size="default" variant="tonal" color="secondary">{{ adminStore.userStatistics.commentCount }} Yorum</v-chip>
            <v-chip size="default" variant="tonal" color="warning">{{ adminStore.userStatistics.reportCount }} Rapor</v-chip>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="detailDialog = false">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Onay Dialog -->
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1 font-weight-bold">{{ confirmTitle }}</v-card-title>
        <v-card-text>{{ confirmMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">İptal</v-btn>
          <v-btn :color="confirmColor" variant="flat" :loading="confirming" @click="confirmAction">Onayla</v-btn>
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
const filters = reactive({ page: 1, limit: 10, search: "", role: null, status: null, sortBy: "newest" });
let searchTimer = null;

const sortOptions = [
  { title: "En Yeni", value: "newest" },
  { title: "En Eski", value: "oldest" },
];
const detailDialog = ref(false);
const confirmDialog = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const confirmColor = ref("primary");
const confirming = ref(false);
let pendingAction = null;

const headers = [
  { title: "Kullanıcı", key: "user", sortable: false },
  { title: "Rol", key: "role", sortable: false },
  { title: "Durum", key: "status", sortable: false },
  { title: "Kayıt Tarihi", key: "createdAt", sortable: false },
  { title: "İşlemler", key: "actions", sortable: false },
];

const roleOptions = [
  { title: "Kullanıcı", value: "user" },
  { title: "Admin", value: "admin" },
];

const statusOptions = [
  { title: "Aktif", value: "true" },
  { title: "Banlı", value: "false" },
];

const loadUsers = () => {
  const params = { page: filters.page, limit: filters.limit };
  if (filters.search) params.search = filters.search;
  if (filters.role) params.role = filters.role;
  if (filters.status !== null && filters.status !== undefined) params.status = filters.status;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  adminStore.fetchUsers(params);
};

const onTableOptions = ({ page, itemsPerPage }) => {
  filters.page = page;
  filters.limit = itemsPerPage;
  loadUsers();
};

watch(() => filters.search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    filters.page = 1;
    loadUsers();
  }, 400);
});

watch(() => [filters.role, filters.status, filters.sortBy], () => {
  filters.page = 1;
  loadUsers();
});

const openDetailDialog = async (user) => {
  detailDialog.value = true;
  await adminStore.fetchUserById(user._id);
};

const toggleStatus = (user) => {
  const newStatus = !user.status;
  confirmTitle.value = newStatus ? "Kullanıcıyı Aktif Et" : "Kullanıcıyı Banla";
  confirmMessage.value = `${user.username} kullanıcısını ${newStatus ? "aktif etmek" : "banlamak"} istediğinize emin misiniz?`;
  confirmColor.value = newStatus ? "success" : "error";
  pendingAction = () => adminStore.updateUserStatus(user._id, newStatus);
  confirmDialog.value = true;
};

const toggleRole = (user) => {
  const newRole = user.role === "admin" ? "user" : "admin";
  confirmTitle.value = newRole === "admin" ? "Admin Yap" : "Admin Kaldır";
  confirmMessage.value = `${user.username} kullanıcısını ${newRole === "admin" ? "admin yapmak" : "admin olmaktan çıkarmak"} istediğinize emin misiniz?`;
  confirmColor.value = "warning";
  pendingAction = () => adminStore.updateUserRole(user._id, newRole);
  confirmDialog.value = true;
};

const confirmAction = async () => {
  if (!pendingAction) return;
  confirming.value = true;
  await pendingAction();
  confirming.value = false;
  confirmDialog.value = false;
  pendingAction = null;
};
</script>
