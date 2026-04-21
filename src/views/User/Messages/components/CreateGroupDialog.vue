<template>
  <v-dialog v-model="model" max-width="480" scrollable>
    <v-card rounded="xl" elevation="0" class="dialog-card">
      <!-- Başlık -->
      <v-card-title class="text-subtitle-1 font-weight-bold pt-5 px-5 d-flex align-center ga-2">
        <v-icon size="20" color="primary">mdi-account-multiple-plus</v-icon>
        Grup Oluştur
        <v-spacer />
        <v-btn icon variant="text" size="small" @click="model = false">
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="px-5 pt-4 pb-2" style="max-height: 560px; overflow-y: auto">
        <!-- Grup adı -->
        <v-text-field
          v-model="groupTitle"
          label="Grup adı"
          variant="outlined"
          density="compact"
          rounded="lg"
          :counter="50"
          :rules="[v => v.length >= 2 || 'En az 2 karakter']"
          hide-details="auto"
          class="mb-4"
        />

        <!-- Seçilen üyeler -->
        <div v-if="selectedUsers.length" class="mb-3 d-flex flex-wrap ga-1">
          <v-chip
            v-for="u in selectedUsers"
            :key="u._id"
            size="small"
            color="primary"
            variant="tonal"
            closable
            @click:close="deselect(u._id)"
          >
            {{ u.profile?.name || u.username }}
          </v-chip>
        </div>
        <p v-else class="text-caption text-medium-emphasis mb-3">En az 2 kişi seçin</p>

        <!-- Mevcut direkt sohbet kişileri -->
        <p class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-1" style="letter-spacing:0.8px">
          Kişilerden Seç
        </p>
        <v-list density="compact" nav class="pa-0 mb-3">
          <v-list-item
            v-for="contact in contacts"
            :key="contact._id"
            rounded="xl"
            class="mb-1"
            :active="isSelected(contact._id)"
            active-color="primary"
            @click="toggle(contact)"
          >
            <template #prepend>
              <v-avatar size="36" color="primary" variant="tonal" class="mr-2">
                <v-img v-if="contact.profile?.avatarUrl" :src="getMediaUrl(contact.profile.avatarUrl)" />
                <span v-else class="text-caption font-weight-bold">
                  {{ (contact.profile?.name?.[0] || contact.username?.[0] || '?').toUpperCase() }}
                </span>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2">
              {{ contact.profile?.name }} {{ contact.profile?.surname }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">@{{ contact.username }}</v-list-item-subtitle>
            <template #append>
              <v-icon v-if="isSelected(contact._id)" size="18" color="primary">mdi-check-circle</v-icon>
            </template>
          </v-list-item>
          <p v-if="!contacts.length" class="text-caption text-medium-emphasis px-2 py-1">
            Henüz direkt sohbet yok
          </p>
        </v-list>

        <!-- Platform geneli arama -->
        <p class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-1" style="letter-spacing:0.8px">
          Daha Fazla Ara
        </p>
        <v-text-field
          v-model="searchQuery"
          placeholder="Kullanıcı ara..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          rounded="lg"
          hide-details
          clearable
          class="mb-2"
          @update:model-value="onSearch"
        />
        <v-list v-if="searchResults.length" density="compact" nav class="pa-0">
          <v-list-item
            v-for="u in searchResults"
            :key="u._id"
            rounded="xl"
            class="mb-1"
            :active="isSelected(u._id)"
            active-color="primary"
            @click="toggle(u)"
          >
            <template #prepend>
              <v-avatar size="36" color="secondary" variant="tonal" class="mr-2">
                <v-img v-if="u.profile?.avatarUrl" :src="getMediaUrl(u.profile.avatarUrl)" />
                <span v-else class="text-caption font-weight-bold">
                  {{ (u.profile?.name?.[0] || u.username?.[0] || '?').toUpperCase() }}
                </span>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2">
              {{ u.profile?.name }} {{ u.profile?.surname }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">@{{ u.username }}</v-list-item-subtitle>
            <template #append>
              <v-icon v-if="isSelected(u._id)" size="18" color="primary">mdi-check-circle</v-icon>
            </template>
          </v-list-item>
        </v-list>
        <div v-else-if="searchQuery.length >= 2 && authStore.searchStatus !== 'loading'" class="text-caption text-medium-emphasis px-2 py-1">
          Kullanıcı bulunamadı
        </div>
        <div v-if="authStore.searchStatus === 'loading'" class="d-flex justify-center py-3">
          <v-progress-circular indeterminate size="22" width="2" color="primary" />
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-5 py-4">
        <span class="text-caption text-medium-emphasis">{{ selectedUsers.length }} kişi seçildi</span>
        <v-spacer />
        <v-btn variant="text" rounded="pill" class="text-none" @click="model = false">İptal</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          rounded="pill"
          class="text-none px-5"
          :disabled="!canCreate"
          :loading="creating"
          @click="create"
        >
          Oluştur
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useChatStore } from "@/stores/chat";
import { useAuthStore } from "@/stores/auth";
import { getMediaUrl } from "@/utils/mediaUrl";

const model = defineModel({ type: Boolean, default: false });
const emit = defineEmits(["created"]);

const chatStore = useChatStore();
const authStore = useAuthStore();

const groupTitle = ref("");
const selectedUsers = ref([]);
const searchQuery = ref("");
const creating = ref(false);
let searchTimeout = null;

const currentUserId = computed(() => authStore.user?._id);

const contacts = computed(() =>
  chatStore.conversations
    .filter((c) => c.conversationType === "direct")
    .map((c) => c.participants?.find((p) => (p._id || p) !== currentUserId.value))
    .filter(Boolean)
    .filter((u, i, arr) => arr.findIndex((x) => x._id === u._id) === i),
);

const searchResults = computed(() =>
  authStore.searchResults.filter(
    (u) => u._id !== currentUserId.value && !contacts.value.find((c) => c._id === u._id),
  ),
);

const canCreate = computed(
  () => groupTitle.value.trim().length >= 2 && selectedUsers.value.length >= 2,
);

function isSelected(userId) {
  return selectedUsers.value.some((u) => u._id === userId);
}

function toggle(user) {
  if (isSelected(user._id)) {
    deselect(user._id);
  } else {
    selectedUsers.value.push(user);
  }
}

function deselect(userId) {
  selectedUsers.value = selectedUsers.value.filter((u) => u._id !== userId);
}

function onSearch(val) {
  clearTimeout(searchTimeout);
  if (!val || val.length < 2) return;
  searchTimeout = setTimeout(() => authStore.searchUsers(val), 300);
}

async function create() {
  creating.value = true;
  const conv = await chatStore.createGroupConversation(
    groupTitle.value.trim(),
    selectedUsers.value.map((u) => u._id),
  );
  creating.value = false;
  if (conv) {
    groupTitle.value = "";
    selectedUsers.value = [];
    searchQuery.value = "";
    model.value = false;
    emit("created", conv._id);
  }
}
</script>

<style scoped>
.dialog-card {
  border: 1px solid rgba(var(--v-border-color), 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}
</style>
