<template>
  <v-card rounded="xl" elevation="0" class="bg-surface" border @click="goToDetail"
    style="cursor: pointer;">
    <!-- Üst: Author bilgisi -->
    <v-card-item>
      <template #prepend>
        <v-avatar
          size="40"
          color="primary"
          variant="tonal"
          rounded="circle"
          style="cursor: pointer;"
          @click.stop="goToProfile"
        >
          <v-img v-if="authorAvatar" :src="authorAvatar" />
          <span v-else class="text-body-2 font-weight-bold text-primary">
            {{ authorInitials }}
          </span>
        </v-avatar>
      </template>

      <v-card-title
        class="text-body-1 font-weight-bold"
        style="cursor: pointer;"
        @click.stop="goToProfile"
      >
        {{ post.author?.profile?.name }} {{ post.author?.profile?.surname }}
      </v-card-title>
      <v-card-subtitle class="text-caption">
        @{{ post.author?.username }} · {{ formatDate(post.createdAt) }}
      </v-card-subtitle>

      <template v-if="isOwner" #append>
        <v-menu @click.stop>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
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
              @click="confirmDelete = true"
            />
          </v-list>
        </v-menu>
      </template>
    </v-card-item>

    <!-- Content (düzenleme modu) -->
    <v-card-text v-if="editing" class="px-4 pt-0 pb-3" @click.stop>
      <v-textarea
        v-model="editContent"
        variant="outlined"
        rounded="lg"
        density="comfortable"
        rows="2"
        auto-grow
        hide-details
        class="mb-2"
      />
      <v-combobox
        v-model="editTags"
        label="Tags"
        variant="outlined"
        rounded="lg"
        density="compact"
        multiple
        chips
        closable-chips
        hide-details
        class="mb-3"
      />

      <!-- Mevcut görseller (kaldırılabilir) -->
      <div v-if="editExistingImages.length" class="d-flex ga-2 flex-wrap mb-3">
        <div
          v-for="(img, i) in editExistingImages"
          :key="img.url"
          class="position-relative"
        >
          <v-img
            :src="getMediaUrl(img.url)"
            width="80"
            height="80"
            cover
            rounded="lg"
            class="border"
          />
          <v-btn
            icon="mdi-close-circle"
            size="x-small"
            variant="flat"
            color="error"
            class="position-absolute"
            style="top: -6px; right: -6px;"
            @click="removeExistingImage(i)"
          />
        </div>
      </div>

      <!-- Yeni eklenen görseller önizleme -->
      <div v-if="editNewPreviews.length" class="d-flex ga-2 flex-wrap mb-3">
        <div
          v-for="(preview, i) in editNewPreviews"
          :key="i"
          class="position-relative"
        >
          <v-img
            :src="preview"
            width="80"
            height="80"
            cover
            rounded="lg"
            class="border"
          />
          <v-btn
            icon="mdi-close-circle"
            size="x-small"
            variant="flat"
            color="error"
            class="position-absolute"
            style="top: -6px; right: -6px;"
            @click="removeNewImage(i)"
          />
        </div>
      </div>

      <div class="d-flex align-center ga-2 justify-space-between">
        <div>
          <v-btn
            icon="mdi-image-plus-outline"
            variant="text"
            size="small"
            color="primary"
            @click="editFileInput.click()"
          />
          <input
            ref="editFileInput"
            type="file"
            accept="image/*"
            multiple
            class="d-none"
            @change="onEditFilesSelected"
          />
        </div>
        <div class="d-flex ga-2">
          <v-btn variant="text" size="small" rounded="lg" @click="cancelEdit">
            İptal
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            rounded="lg"
            :loading="postStore.status === 'loading'"
            @click="saveEdit"
          >
            Kaydet
          </v-btn>
        </div>
      </div>
    </v-card-text>

    <!-- Content (normal görünüm) -->
    <v-card-text v-else class="px-4 pt-0 pb-3">
      <p class="text-body-2" style="white-space: pre-wrap">
        {{ post.content }}
      </p>
    </v-card-text>

    <!-- Görseller -->
    <div v-if="post.images?.length" class="px-4 pb-3">
      <v-row dense>
        <v-col
          v-for="(img, i) in post.images"
          :key="i"
          :cols="post.images.length === 1 ? 12 : 4"
        >
          <v-img
            :src="getMediaUrl(img.url)"
            :aspect-ratio="post.images.length === 1 ? 16 / 9 : 1"
            :cover="post.images.length > 1"
            :contain="post.images.length === 1"
            rounded="lg"
            class="border bg-grey-lighten-4"
            style="cursor: pointer;"
            @click.stop="lightboxImg = getMediaUrl(img.url)"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Tags -->
    <div v-if="post.tags?.length" class="px-4 py-3 d-flex ga-1 flex-wrap">
      <v-chip
        v-for="tag in post.tags"
        :key="tag"
        size="small"
        color="primary"
        variant="tonal"
        rounded="md"
      >
        #{{ tag }}
      </v-chip>
    </div>

    <v-divider />

    <!-- Alt: Like & Yorum -->
    <v-card-actions class="px-4 py-2" @click.stop>
      <v-btn
        variant="text"
        size="small"
        rounded="lg"
        :prepend-icon="isLiked ? 'mdi-heart' : 'mdi-heart-outline'"
        :color="isLiked ? 'error' : undefined"
        :class="{ 'text-medium-emphasis': !isLiked }"
        @click="toggleLike"
      >
        {{ post.engagement?.likes?.length ?? 0 }}
      </v-btn>
      <v-btn
        variant="text"
        size="small"
        rounded="lg"
        :prepend-icon="showComments ? 'mdi-comment' : 'mdi-comment-outline'"
        :color="showComments ? 'primary' : undefined"
        :class="{ 'text-medium-emphasis': !showComments }"
        @click="!disableComments && toggleComments()"
      >
        {{ post.engagement?.commentsCount ?? 0 }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="!isOwner"
        icon="mdi-flag-outline"
        variant="text"
        size="small"
        class="text-medium-emphasis"
        @click="reportDialog = true"
      />
    </v-card-actions>

    <!-- Yorum alanı -->
    <div v-if="showComments" class="px-4 pb-4" @click.stop>
      <v-divider class="mb-3" />

      <!-- Yorum yazma -->
      <div class="d-flex ga-3 mb-4">
        <v-avatar size="32" color="primary" variant="tonal" rounded="circle">
          <v-img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" />
          <span v-else class="text-caption font-weight-bold text-primary">
            {{ currentUserInitials }}
          </span>
        </v-avatar>
        <v-text-field
          v-model="commentContent"
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
              :disabled="!commentContent.trim()"
              @click="submitComment"
            />
          </template>
        </v-text-field>
      </div>

      <!-- Yorum listesi -->
      <div v-if="loadingComments" class="text-center py-2">
        <v-progress-circular indeterminate size="24" color="primary" />
      </div>
      <template v-else-if="localComments.length">
        <CommentCard
          v-for="comment in topLevelComments"
          :key="comment._id"
          :comment="comment"
          :all-comments="localComments"
          class="mb-3"
        />
      </template>
      <p v-else class="text-caption text-medium-emphasis text-center py-2">
        Henüz yorum yok.
      </p>
    </div>

    <!-- Rapor dialog -->
    <ReportDialog
      v-model="reportDialog"
      report-type="post"
      :content-id="post._id"
    />

    <!-- Görsel lightbox -->
    <v-dialog v-model="lightboxOpen" max-width="900" scrim="black">
      <div style="position: relative;" @click.stop>
        <v-btn
          icon="mdi-close"
          variant="flat"
          size="small"
          style="position: absolute; top: 8px; right: 8px; z-index: 1;"
          @click="lightboxImg = null"
        />
        <img
          :src="lightboxImg"
          style="display: block; max-width: 100%; max-height: 85vh; margin: 0 auto; border-radius: 12px; object-fit: contain;"
        />
      </div>
    </v-dialog>

    <!-- Silme onay dialog -->
    <v-dialog v-model="confirmDelete" max-width="360">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-4">
          Gönderiyi Sil
        </v-card-title>
        <v-card-text class="px-4 pb-2">
          Bu gönderiyi silmek istediğine emin misin? Bu işlem geri alınamaz.
        </v-card-text>
        <v-card-actions class="pa-4 pt-2">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="confirmDelete = false">İptal</v-btn>
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
            :loading="postStore.status === 'loading'"
            @click="handleDelete"
          >
            Sil
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { getMediaUrl } from "@/utils/mediaUrl";
import { formatDate } from "@/utils/formatDate";
import { usePostStore } from "@/stores/post";
import { useAuthStore } from "@/stores/auth";
import { useCommentStore } from "@/stores/comment";
import CommentCard from "@/components/CommentCard.vue";
import ReportDialog from "@/components/ReportDialog.vue";

const props = defineProps({
  post: { type: Object, required: true },
  disableComments: { type: Boolean, default: false },
});

const emit = defineEmits(["deleted"]);

const router = useRouter();
const postStore = usePostStore();
const authStore = useAuthStore();
const commentStore = useCommentStore();

const showComments = ref(false);
const commentContent = ref("");
const localComments = ref([]);
const loadingComments = ref(false);

const editing = ref(false);
const editContent = ref("");
const editTags = ref([]);
const editExistingImages = ref([]);
const removedImageUrls = ref([]);
const editNewImages = ref([]);
const editNewPreviews = ref([]);
const editFileInput = ref(null);
const confirmDelete = ref(false);
const reportDialog = ref(false);
const lightboxImg = ref(null);
const lightboxOpen = computed({
  get: () => !!lightboxImg.value,
  set: (v) => { if (!v) lightboxImg.value = null; },
});

const isOwner = computed(
  () => authStore.user?._id === props.post.author?._id
);

const currentUserInitials = computed(() => {
  const n = authStore.user?.profile?.name?.[0] ?? "";
  const s = authStore.user?.profile?.surname?.[0] ?? "";
  return (n + s).toUpperCase() || authStore.user?.username?.[0]?.toUpperCase() || "?";
});

const topLevelComments = computed(() =>
  localComments.value.filter((c) => !c.parentCommentId)
);

const isLiked = computed(() =>
  props.post.engagement?.likes?.includes(authStore.user?._id)
);

const authorAvatar = computed(() =>
  getMediaUrl(props.post.author?.profile?.avatarUrl),
);

const authorInitials = computed(() => {
  const n = props.post.author?.profile?.name?.[0] ?? "";
  const s = props.post.author?.profile?.surname?.[0] ?? "";
  return (
    (n + s).toUpperCase() ||
    props.post.author?.username?.[0]?.toUpperCase() ||
    "?"
  );
});

const startEdit = () => {
  editContent.value = props.post.content;
  editTags.value = [...(props.post.tags ?? [])];
  editExistingImages.value = [...(props.post.images ?? [])];
  removedImageUrls.value = [];
  editNewImages.value = [];
  editNewPreviews.value = [];
  editing.value = true;
};

const cancelEdit = () => {
  editNewPreviews.value.forEach((url) => URL.revokeObjectURL(url));
  editing.value = false;
};

const removeExistingImage = (index) => {
  removedImageUrls.value.push(editExistingImages.value[index].url);
  editExistingImages.value.splice(index, 1);
};

const onEditFilesSelected = (e) => {
  Array.from(e.target.files).forEach((file) => {
    editNewImages.value.push(file);
    editNewPreviews.value.push(URL.createObjectURL(file));
  });
  e.target.value = "";
};

const removeNewImage = (index) => {
  URL.revokeObjectURL(editNewPreviews.value[index]);
  editNewImages.value.splice(index, 1);
  editNewPreviews.value.splice(index, 1);
};

const saveEdit = async () => {
  const success = await postStore.updatePost(props.post._id, {
    content: editContent.value,
    tags: editTags.value,
    removedImageUrls: removedImageUrls.value,
    newImages: editNewImages.value,
  });
  if (success) {
    editNewPreviews.value.forEach((url) => URL.revokeObjectURL(url));
    editing.value = false;
  }
};

const handleDelete = async () => {
  const success = await postStore.deletePost(props.post._id);
  if (success) {
    confirmDelete.value = false;
    emit("deleted");
  }
};

const toggleLike = () => {
  postStore.likePost(props.post._id);
};

const toggleComments = async () => {
  showComments.value = !showComments.value;
  if (showComments.value && localComments.value.length === 0) {
    loadingComments.value = true;
    await commentStore.fetchComments(props.post._id);
    localComments.value = [...commentStore.comments];
    loadingComments.value = false;
  }
};

const submitComment = async () => {
  if (!commentContent.value.trim()) return;
  const result = await commentStore.createComment({
    postId: props.post._id,
    content: commentContent.value,
  });
  if (result) {
    localComments.value.unshift(result);
    commentContent.value = "";
  }
};

const goToDetail = () => {
  router.push({ name: "PostDetail", params: { postId: props.post._id } });
};

const goToProfile = () => {
  const authorId = props.post.author?._id;
  if (authorId === authStore.user?._id) {
    router.push({ name: "Profile" });
  } else {
    router.push({ name: "UserProfile", params: { userId: authorId } });
  }
};
</script>
