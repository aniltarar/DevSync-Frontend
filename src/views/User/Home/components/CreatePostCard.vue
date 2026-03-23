<template>
  <v-card rounded="xl" elevation="0" border>
    <v-card-text class="pa-4">
      <!-- Üst kısım: Avatar + Textarea -->
      <div class="d-flex ga-3">
        <v-avatar size="40" color="primary" variant="tonal" rounded="circle">
          <v-img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" />
          <span v-else class="text-body-1 font-weight-bold text-primary">
            {{ initials }}
          </span>
        </v-avatar>

        <v-textarea
          v-model="content"
          placeholder="Ne düşünüyorsun?"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          rows="2"
          auto-grow
          hide-details
          :maxlength="500"
          class="flex-grow-1"
        />
      </div>

      <!-- Seçilen görseller önizleme -->
      <div v-if="imagePreviews.length" class="d-flex ga-2 flex-wrap mt-3 ml-13">
        <div
          v-for="(preview, i) in imagePreviews"
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
            style="top: -6px; right: -6px"
            @click="removeImage(i)"
          />
        </div>
      </div>

      <!-- Seçilen tag'ler -->
      <div v-if="tags.length" class="d-flex ga-1 flex-wrap mt-3 ml-13">
        <v-chip
          v-for="(tag, i) in tags"
          :key="i"
          size="small"
          color="primary"
          variant="tonal"
          rounded="md"
          closable
          @click:close="tags.splice(i, 1)"
        >
          {{ tag }}
        </v-chip>
      </div>

      <v-divider class="mt-4 mb-3" />

      <!-- Alt kısım: Aksiyon butonları -->
      <div class="d-flex align-center justify-space-between ml-13">
        <div class="d-flex ga-1">
          <!-- Fotoğraf ekleme -->
          <v-btn
            icon="mdi-image-outline"
            variant="text"
            size="small"
            color="primary"
            @click="fileInput.click()"
          />
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="d-none"
            @change="onFilesSelected"
          />

          <!-- Tag ekleme -->
          <v-menu v-model="tagMenu" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-pound"
                variant="text"
                size="small"
                color="primary"
              />
            </template>
            <v-card rounded="lg" width="240" class="pa-3">
              <v-text-field
                v-model="tagInput"
                placeholder="Tag ekle"
                variant="outlined"
                rounded="lg"
                density="compact"
                hide-details
                autofocus
                @keydown.enter="addTag"
              >
                <template #append-inner>
                  <v-btn
                    icon="mdi-plus"
                    size="x-small"
                    variant="text"
                    color="primary"
                    @click="addTag"
                  />
                </template>
              </v-text-field>
            </v-card>
          </v-menu>
        </div>


        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          size="small"
          :loading="postStore.status === 'loading'"
          :disabled="!content.trim()"
          @click="submit"
        >
          <v-icon start>mdi-send</v-icon>
          Paylaş
        </v-btn>

      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { usePostStore } from "@/stores/post";

const authStore = useAuthStore();
const postStore = usePostStore();

const content = ref("");
const tags = ref([]);
const images = ref([]);
const imagePreviews = ref([]);
const tagInput = ref("");
const tagMenu = ref(false);
const fileInput = ref(null);

const initials = computed(() => {
  const n = authStore.user?.profile?.name?.[0] ?? "";
  const s = authStore.user?.profile?.surname?.[0] ?? "";
  return (
    (n + s).toUpperCase() || authStore.user?.username?.[0]?.toUpperCase() || "?"
  );
});

const onFilesSelected = (e) => {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    images.value.push(file);
    imagePreviews.value.push(URL.createObjectURL(file));
  });
  e.target.value = "";
};

const removeImage = (index) => {
  URL.revokeObjectURL(imagePreviews.value[index]);
  images.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};

const addTag = () => {
  const val = tagInput.value.trim();
  if (val && !tags.value.includes(val)) {
    tags.value.push(val);
  }
  tagInput.value = "";
};

const submit = async () => {
  const success = await postStore.createPost({
    content: content.value,
    tags: tags.value,
    images: images.value,
  });
  if (success) {
    content.value = "";
    tags.value = [];
    imagePreviews.value.forEach((url) => URL.revokeObjectURL(url));
    images.value = [];
    imagePreviews.value = [];
  }
};
</script>
