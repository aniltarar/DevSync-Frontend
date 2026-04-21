<template>
  <v-dialog v-model="model" max-width="440" scrollable>
    <v-card rounded="xl" elevation="0" class="dialog-card">
      <v-card-title class="text-subtitle-1 font-weight-bold pt-5 px-5 d-flex align-center ga-2">
        <v-icon size="20" color="primary">mdi-account-group-outline</v-icon>
        Katılımcılar
        <v-chip size="x-small" color="primary" variant="tonal" class="ml-1">{{ participants.length }}</v-chip>
        <v-spacer />
        <v-btn icon variant="text" size="small" @click="model = false">
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="px-3 py-3" style="max-height: 480px">
        <!-- Üye ekleme alanı (sadece grup + admin) -->
        <div v-if="isGroupAdmin" class="px-2 mb-3">
          <v-text-field
            v-model="addSearch"
            placeholder="Üye ekle..."
            prepend-inner-icon="mdi-account-plus-outline"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
            clearable
            @update:model-value="onAddSearch"
          />
          <v-list v-if="addResults.length" density="compact" nav class="pa-0 mt-1 rounded-lg" style="border:1px solid rgba(var(--v-border-color),0.1)">
            <v-list-item
              v-for="u in addResults"
              :key="u._id"
              rounded="lg"
              class="py-1"
              @click="addMember(u)"
            >
              <template #prepend>
                <v-avatar size="32" color="primary" variant="tonal" class="mr-2">
                  <v-img v-if="u.profile?.avatarUrl" :src="getMediaUrl(u.profile.avatarUrl)" />
                  <span v-else class="text-caption font-weight-bold">
                    {{ (u.profile?.name?.[0] || u.username?.[0] || '?').toUpperCase() }}
                  </span>
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2">{{ u.profile?.name }} {{ u.profile?.surname }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">@{{ u.username }}</v-list-item-subtitle>
              <template #append>
                <v-btn size="x-small" variant="tonal" color="primary" rounded="pill" :loading="addingId === u._id">Ekle</v-btn>
              </template>
            </v-list-item>
          </v-list>
        </div>

        <!-- Katılımcı listesi -->
        <v-list density="compact" nav>
          <v-list-item
            v-for="p in participants"
            :key="p._id"
            rounded="xl"
            class="mb-1 py-2"
          >
            <template #prepend>
              <div class="position-relative mr-2">
                <v-avatar size="40" color="primary" variant="tonal">
                  <v-img v-if="p.profile?.avatarUrl" :src="getMediaUrl(p.profile.avatarUrl)" />
                  <span v-else class="text-body-2 font-weight-bold">
                    {{ (p.profile?.name?.[0] || p.username?.[0] || '?').toUpperCase() }}
                  </span>
                </v-avatar>
                <span v-if="isOnline(p._id)" class="online-dot" />
              </div>
            </template>

            <v-list-item-title class="text-body-2 font-weight-medium d-flex align-center ga-1 flex-wrap">
              {{ p.profile?.name }} {{ p.profile?.surname }}
              <v-chip v-if="p._id === currentUserId" size="x-small" variant="tonal" color="secondary">Sen</v-chip>
              <v-chip v-if="isAdmin(p._id)" size="x-small" variant="tonal" color="warning">
                <v-icon start size="11">mdi-crown</v-icon>Lider
              </v-chip>
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption text-medium-emphasis">@{{ p.username }}</v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center ga-1">
                <span v-if="isOnline(p._id)" class="text-caption online-label">çevrimiçi</span>
                <!-- Admin: diğerlerini kick et -->
                <v-btn
                  v-if="isGroupAdmin && p._id !== currentUserId"
                  icon
                  variant="text"
                  size="x-small"
                  color="error"
                  :loading="removingId === p._id"
                  @click="kickMember(p._id)"
                >
                  <v-icon size="16">mdi-account-remove</v-icon>
                  <v-tooltip activator="parent" location="top">Gruptan Çıkar</v-tooltip>
                </v-btn>
                <!-- Kendisi: gruptan ayrıl (sadece grup) -->
                <v-btn
                  v-if="isGroup && p._id === currentUserId"
                  icon
                  variant="text"
                  size="x-small"
                  color="error"
                  :loading="removingId === p._id"
                  @click="leaveGroup"
                >
                  <v-icon size="16">mdi-exit-to-app</v-icon>
                  <v-tooltip activator="parent" location="top">Gruptan Ayrıl</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useSocketStore } from "@/stores/socket";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { getMediaUrl } from "@/utils/mediaUrl";

const model = defineModel({ type: Boolean, default: false });

const props = defineProps({
  participants: { type: Array, default: () => [] },
  adminId: { type: String, default: null },
  conversationId: { type: String, default: null },
  conversationType: { type: String, default: "direct" },
});

const socketStore = useSocketStore();
const authStore = useAuthStore();
const chatStore = useChatStore();

const addSearch = ref("");
const addResults = ref([]);
const addingId = ref(null);
const removingId = ref(null);
let searchTimeout = null;

const currentUserId = computed(() => authStore.user?._id);
const isGroup = computed(() => props.conversationType === "group");
const isGroupAdmin = computed(() => isGroup.value && props.adminId === currentUserId.value);

function isAdmin(userId) {
  return props.adminId === userId;
}

function isOnline(userId) {
  return socketStore.onlineUsers.some((u) => u.userId === userId);
}

function onAddSearch(val) {
  addResults.value = [];
  clearTimeout(searchTimeout);
  if (!val || val.length < 2) return;
  searchTimeout = setTimeout(async () => {
    await authStore.searchUsers(val);
    const participantIds = props.participants.map((p) => p._id);
    addResults.value = authStore.searchResults.filter(
      (u) => u._id !== currentUserId.value && !participantIds.includes(u._id),
    );
  }, 300);
}

async function addMember(user) {
  addingId.value = user._id;
  const ok = await chatStore.addGroupMember(props.conversationId, user._id);
  addingId.value = null;
  if (ok) {
    addResults.value = addResults.value.filter((u) => u._id !== user._id);
    addSearch.value = "";
  }
}

async function kickMember(targetUserId) {
  removingId.value = targetUserId;
  await chatStore.removeGroupMember(props.conversationId, targetUserId);
  removingId.value = null;
}

async function leaveGroup() {
  removingId.value = currentUserId.value;
  await chatStore.removeGroupMember(props.conversationId, currentUserId.value);
  removingId.value = null;
  model.value = false;
}
</script>

<style scoped>
.dialog-card {
  border: 1px solid rgba(var(--v-border-color), 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}
.online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  background: rgb(var(--v-theme-success));
  border: 2px solid rgb(var(--v-theme-surface));
  border-radius: 50%;
}
.online-label {
  color: rgb(var(--v-theme-success));
  font-size: 11px;
}
</style>
