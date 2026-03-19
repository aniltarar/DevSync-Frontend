<template>
  <v-dialog v-model="dialog" max-width="580" scrollable>
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-4 pb-3">
        <span class="text-h6 font-weight-bold">Profili Düzenle</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4 bg-backgroundOverlay">
        <v-tabs v-model="tab" color="primary" density="compact" class="mb-5">
          <v-tab value="basic" prepend-icon="mdi-account-outline">Temel Bilgiler</v-tab>
          <v-tab value="skills" prepend-icon="mdi-medal-outline">Unvan & Yetenekler</v-tab>
          <v-tab value="social" prepend-icon="mdi-link-variant">Sosyal</v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab">
          <!-- Temel Bilgiler -->
          <v-tabs-window-item class="pa-2" value="basic">
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model="form.name"
                  label="Ad"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.surname"
                  label="Soyad"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.username"
                  label="Kullanıcı Adı"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  prepend-inner-icon="mdi-at"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.location"
                  label="Konum"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  prepend-inner-icon="mdi-map-marker-outline"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.bio"
                  label="Hakkımda"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  rows="3"
                  auto-grow
                  :maxlength="160"
                  counter="160"
                />
              </v-col>
            </v-row>
          </v-tabs-window-item>

          <!-- Unvan & Yetenekler -->
          <v-tabs-window-item class="pa-2" value="skills">
            <v-combobox
              v-model="form.titles"
              label="Unvanlar"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              multiple
              chips
              closable-chips
              hide-selected
              prepend-inner-icon="mdi-medal-outline"
              hint="Enter'a basarak yeni unvan ekleyin"
              persistent-hint
              class="mb-5"
            >
              <template #chip="{ item, props }">
                <v-chip
                  v-bind="props"
                  :text="item.raw"
                  color="secondary"
                  variant="tonal"
                  rounded="md"
                  size="small"
                  prepend-icon="mdi-medal-outline"
                />
              </template>
            </v-combobox>

            <v-combobox
              v-model="form.skills"
              label="Yetenekler"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              multiple
              chips
              closable-chips
              hide-selected
              prepend-inner-icon="mdi-code-tags"
              hint="Enter'a basarak yeni yetenek ekleyin"
              persistent-hint
            >
              <template #chip="{ item, props }">
                <v-chip
                  v-bind="props"
                  :text="item.raw"
                  color="primary"
                  variant="tonal"
                  rounded="md"
                  size="small"
                />
              </template>
            </v-combobox>
          </v-tabs-window-item>

          <!-- Sosyal Bağlantılar -->
          <v-tabs-window-item class="pa-2" value="social">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="form.socialLinks.github"
                  label="GitHub"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  prepend-inner-icon="mdi-github"
                  placeholder="https://github.com/username"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.socialLinks.linkedin"
                  label="LinkedIn"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  prepend-inner-icon="mdi-linkedin"
                  placeholder="https://linkedin.com/in/username"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.socialLinks.portfolio"
                  label="Portfolio"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  prepend-inner-icon="mdi-web"
                  placeholder="https://portfolio.com"
                />
              </v-col>
            </v-row>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" rounded="lg" @click="dialog = false">İptal</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          :loading="authStore.status === 'loading'"
          @click="submit"
        >
          Kaydet
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";

const dialog = defineModel({ type: Boolean, default: false });

const authStore = useAuthStore();
const tab = ref("basic");

watch(dialog, (val) => { if (val) resetForm(); });

const buildForm = () => ({
  name: authStore.user?.profile?.name ?? "",
  surname: authStore.user?.profile?.surname ?? "",
  username: authStore.user?.username ?? "",
  location: authStore.user?.profile?.location ?? "",
  bio: authStore.user?.profile?.bio ?? "",
  titles: [...(authStore.user?.titles ?? [])],
  skills: [...(authStore.user?.skills ?? [])],
  socialLinks: {
    github: authStore.user?.socialLinks?.github ?? "",
    linkedin: authStore.user?.socialLinks?.linkedin ?? "",
    portfolio: authStore.user?.socialLinks?.portfolio ?? "",
  },
});

const form = ref(buildForm());

const resetForm = () => {
  form.value = buildForm();
  tab.value = "basic";
};

const submit = async () => {
  const payload = {
    name: form.value.name,
    surname: form.value.surname,
    username: form.value.username,
    location: form.value.location,
    bio: form.value.bio,
    titles: form.value.titles,
    skills: form.value.skills,
    socialLinks: form.value.socialLinks,
  };

  const success = await authStore.updateProfile(payload);
  if (success) dialog.value = false;
};
</script>
