<template>
  <div>
    <v-btn
      variant="text"
      rounded="lg"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
      @click="router.back()"
    >
      Geri
    </v-btn>

    <div v-if="postStore.status === 'loading'" class="d-flex justify-center py-10">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else-if="postStore.currentPost">
      <PostCard :post="postStore.currentPost" disable-comments @deleted="router.push({ name: 'UserHome' })" />

      <!-- Yorum yazma alanı -->
      <v-card rounded="xl" elevation="0" border class="mt-4">
        <v-card-text class="pa-4">
          <div class="d-flex ga-3">
            <v-avatar size="36" color="primary" variant="tonal" rounded="circle">
              <v-img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" />
              <span v-else class="text-caption font-weight-bold text-primary">
                {{ myInitials }}
              </span>
            </v-avatar>
            <v-text-field
              v-model="newComment"
              placeholder="Yorum yaz..."
              variant="outlined"
              rounded="lg"
              density="compact"
              hide-details
              class="flex-grow-1"
              @keydown.enter="submitComment"
            >
              <template #append-inner>
                <v-btn
                  icon="mdi-send"
                  size="x-small"
                  variant="text"
                  color="primary"
                  :disabled="!newComment.trim()"
                  @click="submitComment"
                />
              </template>
            </v-text-field>
          </div>
        </v-card-text>
      </v-card>

      <!-- Yorumlar -->
      <v-card v-if="rootComments.length" rounded="xl" elevation="0" border class="mt-4">
        <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">
          Yorumlar ({{ commentStore.comments.length }})
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <div class="d-flex flex-column ga-4">
            <CommentCard
              v-for="comment in rootComments"
              :key="comment._id"
              :comment="comment"
              :all-comments="commentStore.comments"
            />
          </div>
        </v-card-text>
      </v-card>
    </template>

    <div v-else class="text-center py-10">
      <v-icon size="48" color="medium-emphasis">mdi-post-outline</v-icon>
      <p class="text-body-2 text-medium-emphasis mt-3">Gönderi bulunamadı.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePostStore } from "@/stores/post";
import { useAuthStore } from "@/stores/auth";
import { useCommentStore } from "@/stores/comment";
import PostCard from "@/components/PostCard.vue";
import CommentCard from "@/components/CommentCard.vue";

const route = useRoute();
const router = useRouter();
const postStore = usePostStore();
const authStore = useAuthStore();
const commentStore = useCommentStore();

const newComment = ref("");

const myInitials = computed(() => {
  const n = authStore.user?.profile?.name?.[0] ?? "";
  const s = authStore.user?.profile?.surname?.[0] ?? "";
  return (n + s).toUpperCase() || authStore.user?.username?.[0]?.toUpperCase() || "?";
});

const rootComments = computed(() =>
  commentStore.comments.filter((c) => !c.parentCommentId)
);

onMounted(async () => {
  await postStore.getPostById(route.params.postId);
  commentStore.fetchComments(route.params.postId);
});

watch(
  () => postStore.currentPost,
  (val) => {
    if (val === null && postStore.status === "success") {
      router.push({ name: "UserHome" });
    }
  }
);

const submitComment = async () => {
  if (!newComment.value.trim()) return;
  const result = await commentStore.createComment({
    postId: route.params.postId,
    content: newComment.value,
  });
  if (result) newComment.value = "";
};
</script>
