<template>
  <div>
    <h1>Dev Sync - Akış'a hoş geldiniz!.</h1>
    <CreatePostCard class="mb-6" />
    <div v-if="hasMore" ref="sentinel" class="d-flex justify-center py-6">
      <v-progress-circular
        v-if="postStore.status === 'loading'"
        indeterminate
        color="primary"
        size="28"
      />
    </div>

    <!-- Post listesi -->
    <div class="d-flex flex-column ga-4">
      <PostCard v-for="post in postStore.posts" :key="post._id" :post="post" />
    </div>

    <!-- Infinite scroll sentinel -->

    <!-- Tüm postlar yüklendi -->
    <p
      v-if="!hasMore && postStore.posts.length"
      class="text-center text-caption text-medium-emphasis py-4"
    >
      Görünüşe göre tüm gönderiler yüklendi!
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { usePostStore } from "@/stores/post";
import CreatePostCard from "./components/CreatePostCard.vue";
import PostCard from "@/components/PostCard.vue";

const postStore = usePostStore();
const sentinel = ref(null);
let observer = null;

const hasMore = computed(
  () => postStore.pagination.currentPage < postStore.pagination.totalPages,
);

const loadMore = async () => {
  if (postStore.status === "loading" || !hasMore.value) return;
  const nextPage = postStore.pagination.currentPage + 1;
  await postStore.fetchPosts({ page: nextPage, append: true });
};

onMounted(async () => {
  await postStore.fetchPosts({ page: 1 });

  await nextTick();
  if (sentinel.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>
