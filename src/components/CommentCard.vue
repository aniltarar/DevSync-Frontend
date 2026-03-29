<template>
  <div>
    <!-- Ana yorum -->
    <div class="d-flex ga-3">
      <v-avatar size="32" color="primary" variant="tonal" rounded="circle">
        <v-img v-if="authorAvatar" :src="authorAvatar" />
        <span v-else class="text-caption font-weight-bold text-primary">
          {{ authorInitials }}
        </span>
      </v-avatar>

      <div class="flex-grow-1">
        <div class="bg-backgroundOverlay border rounded-lg pa-3">
          <div class="d-flex align-center ga-2 mb-1">
            <span class="text-body-2 font-weight-bold">
              {{ comment.author?.profile?.name }} {{ comment.author?.profile?.surname }}
            </span>
            <span class="text-caption text-medium-emphasis">
              @{{ comment.author?.username }} · {{ formatDate(comment.createdAt) }}
            </span>
            <v-spacer />
            <!-- Sahip menüsü -->
            <v-menu v-if="isOwner">
              <template #activator="{ props: menuProps }">
                <v-btn
                  v-bind="menuProps"
                  icon="mdi-dots-horizontal"
                  variant="text"
                  size="x-small"
                />
              </template>
              <v-list density="compact" rounded="lg">
                <v-list-item
                  prepend-icon="mdi-pencil-outline"
                  title="Düzenle"
                  @click="startEdit"
                />
                <v-list-item
                  prepend-icon="mdi-delete-outline"
                  title="Sil"
                  base-color="error"
                  @click="handleDelete"
                />
              </v-list>
            </v-menu>
          </div>
          <!-- Düzenleme modu -->
          <div v-if="editing" class="d-flex ga-2">
            <v-text-field
              v-model="editContent"
              variant="outlined"
              rounded="lg"
              density="compact"
              hide-details
              class="flex-grow-1"
              @keydown.enter="saveEdit"
            />
            <v-btn icon="mdi-check" size="x-small" color="primary" variant="flat" rounded="lg" @click="saveEdit" />
            <v-btn icon="mdi-close" size="x-small" variant="text" @click="editing = false" />
          </div>
          <p v-else class="text-body-2" style="white-space: pre-wrap;">{{ comment.content }}</p>
        </div>

        <!-- Aksiyonlar -->
        <div class="d-flex align-center ga-2 mt-1 ml-1">
          <v-btn
            variant="text"
            size="x-small"
            rounded="lg"
            :prepend-icon="isLiked ? 'mdi-heart' : 'mdi-heart-outline'"
            :color="isLiked ? 'error' : undefined"
            :class="{ 'text-medium-emphasis': !isLiked }"
            @click="commentStore.likeComment(comment._id)"
          >
            {{ comment.likes?.length ?? 0 }}
          </v-btn>
          <v-btn
            variant="text"
            size="x-small"
            rounded="lg"
            prepend-icon="mdi-reply"
            class="text-medium-emphasis"
            @click="showReplyInput = !showReplyInput"
          >
            Yanıtla
          </v-btn>
          <v-btn
            v-if="!isOwner"
            icon="mdi-flag-outline"
            variant="text"
            size="x-small"
            class="text-medium-emphasis"
            @click="reportDialog = true"
          />
        </div>

        <!-- Rapor dialog -->
        <ReportDialog
          v-model="reportDialog"
          report-type="comment"
          :content-id="comment._id"
        />

        <!-- Yanıt yazma alanı -->
        <div v-if="showReplyInput" class="d-flex ga-2 mt-2 ml-1">
          <v-text-field
            v-model="replyContent"
            placeholder="Yanıt yaz..."
            variant="outlined"
            rounded="lg"
            density="compact"
            hide-details
            class="flex-grow-1"
            @keydown.enter="submitReply"
          />
          <v-btn
            icon="mdi-send"
            size="small"
            color="primary"
            variant="flat"
            rounded="lg"
            :disabled="!replyContent.trim()"
            @click="submitReply"
          />
        </div>

        <!-- Alt yorumlar (replies) -->
        <div v-if="replies.length" class="mt-3 ml-2 pl-3" style="border-left: 2px solid rgb(var(--v-theme-primary), 0.2);">
          <CommentCard
            v-for="reply in replies"
            :key="reply._id"
            :comment="reply"
            :all-comments="allComments"
            class="mb-3"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { getMediaUrl } from "@/utils/mediaUrl";
import { formatDate } from "@/utils/formatDate";
import { useAuthStore } from "@/stores/auth";
import { useCommentStore } from "@/stores/comment";
import ReportDialog from "@/components/ReportDialog.vue";

const props = defineProps({
  comment: { type: Object, required: true },
  allComments: { type: Array, default: () => [] },
});

const authStore = useAuthStore();
const commentStore = useCommentStore();

const showReplyInput = ref(false);
const replyContent = ref("");
const editing = ref(false);
const editContent = ref("");
const reportDialog = ref(false);

const isOwner = computed(
  () => authStore.user?._id === props.comment.author?._id
);

const isLiked = computed(() =>
  props.comment.likes?.includes(authStore.user?._id)
);

const authorAvatar = computed(() =>
  getMediaUrl(props.comment.author?.profile?.avatarUrl)
);

const authorInitials = computed(() => {
  const n = props.comment.author?.profile?.name?.[0] ?? "";
  const s = props.comment.author?.profile?.surname?.[0] ?? "";
  return (n + s).toUpperCase() || props.comment.author?.username?.[0]?.toUpperCase() || "?";
});

const replies = computed(() =>
  props.allComments.filter((c) => c.parentCommentId === props.comment._id)
);

const submitReply = async () => {
  if (!replyContent.value.trim()) return;
  const result = await commentStore.createComment({
    postId: props.comment.postId,
    content: replyContent.value,
    parentCommentId: props.comment._id,
  });
  if (result) {
    replyContent.value = "";
    showReplyInput.value = false;
  }
};

const startEdit = () => {
  editContent.value = props.comment.content;
  editing.value = true;
};

const saveEdit = async () => {
  if (!editContent.value.trim()) return;
  const success = await commentStore.updateComment(props.comment._id, editContent.value);
  if (success) editing.value = false;
};

const handleDelete = () => {
  commentStore.deleteComment(props.comment._id);
};
</script>
