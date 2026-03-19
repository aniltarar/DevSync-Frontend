<template>
  <v-card rounded="lg" elevation="0" border class="mb-3">
    <v-card-item>
      <template #prepend>
        <v-avatar color="primary" variant="tonal" size="36">
          <v-img v-if="avatarUrl" :src="avatarUrl" />
          <v-icon v-else size="20">mdi-account</v-icon>
        </v-avatar>
      </template>
      <v-card-title class="text-body-2 font-weight-medium">
        {{ post.author?.profile?.name }} {{ post.author?.profile?.surname }}
        <span class="text-medium-emphasis font-weight-regular">@{{ post.author?.username }}</span>
      </v-card-title>
      <v-card-subtitle class="text-caption">
        {{ formatDate(post.createdAt) }}
      </v-card-subtitle>
    </v-card-item>

    <v-card-text class="pt-0">
      <p class="text-body-2">{{ post.content }}</p>

      <div v-if="post.images?.length" class="mt-2 d-flex flex-wrap gap-2">
        <v-img
          v-for="img in post.images"
          :key="img._id"
          :src="baseUrl + img.url"
          width="80"
          height="80"
          cover
          rounded="md"
        />
      </div>

      <div v-if="post.tags?.length" class="mt-2 d-flex flex-wrap ga-1">
        <v-chip
          v-for="tag in post.tags"
          :key="tag"
          size="x-small"
          color="primary"
          variant="tonal"
          label
        >
          {{ tag }}
        </v-chip>
      </div>
    </v-card-text>

    <v-card-actions class="pt-0 px-4 pb-3">
      <v-icon size="18" color="medium-emphasis">mdi-heart-outline</v-icon>
      <span class="text-caption text-medium-emphasis ml-1">
        {{ post.engagement?.likes?.length ?? 0 }}
      </span>
      <v-icon size="18" color="medium-emphasis" class="ml-3">mdi-comment-outline</v-icon>
      <span class="text-caption text-medium-emphasis ml-1">
        {{ post.engagement?.commentsCount ?? 0 }}
      </span>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { formatDate } from '@/utils/formatDate';
import { getMediaUrl } from '@/utils/mediaUrl';

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const avatarUrl = computed(() => getMediaUrl(props.post.author?.profile?.avatarUrl));
</script>
