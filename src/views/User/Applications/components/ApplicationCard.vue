<template>
  <v-card border flat rounded="lg">
    <div class="pa-4">
      <!-- Üst: Durum badge + Tarih bilgileri -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="d-flex align-center ga-2">
          <v-chip :color="statusColor" variant="tonal" size="small">
            <v-icon start size="14">{{ statusIcon }}</v-icon>
            {{ statusLabel }}
          </v-chip>
          <v-chip variant="outlined" size="small" prepend-icon="mdi-briefcase-outline">
            {{ application.roleName }}
          </v-chip>
        </div>
        <div class="d-flex align-center ga-3 text-caption text-medium-emphasis">
          <div class="d-flex align-center ga-1">
            <v-icon size="13">mdi-calendar-clock-outline</v-icon>
            {{ formatDate(application.appliedAt) }}
          </div>
          <div
            v-if="application.respondedAt"
            class="d-flex align-center ga-1"
          >
            <v-icon size="13">mdi-check-circle-outline</v-icon>
            {{ formatDate(application.respondedAt) }}
          </div>
        </div>
      </div>

      <!-- Başvuran Profil Kartı (proje sahibi görünümü) -->
      <div v-if="showApplicant && applicant">
        <div class="d-flex ga-3">
          <!-- Avatar -->
          <v-avatar
            :color="!applicantAvatar ? 'primary' : undefined"
            :variant="!applicantAvatar ? 'tonal' : undefined"
            size="44"
            rounded="lg"
          >
            <v-img v-if="applicantAvatar" :src="applicantAvatar" />
            <span v-else class="text-body-2 font-weight-bold">
              {{ applicant.profile?.name?.charAt(0) }}{{ applicant.profile?.surname?.charAt(0) }}
            </span>
          </v-avatar>

          <!-- Bilgiler -->
          <div class="flex-grow-1" style="min-width: 0">
            <div class="d-flex align-center ga-2 flex-wrap">
              <router-link
                v-if="applicant._id"
                :to="{ name: 'UserProfile', params: { userId: applicant._id } }"
                class="text-body-2 font-weight-bold text-decoration-none"
              >
                {{ applicant.profile?.name }} {{ applicant.profile?.surname }}
              </router-link>
              <span class="text-caption text-medium-emphasis">
                @{{ applicant.username }}
              </span>

              <!-- Social Links (Inline) -->
              <div v-if="hasSocialLinks" class="d-flex align-center ga-0 ml-auto">
                <v-btn
                  v-if="applicant.socialLinks?.github"
                  :href="applicant.socialLinks.github"
                  target="_blank"
                  icon="mdi-github"
                  variant="text"
                  density="comfortable"
                />
                <v-btn
                  v-if="applicant.socialLinks?.linkedin"
                  :href="applicant.socialLinks.linkedin"
                  target="_blank"
                  icon="mdi-linkedin"
                  variant="text"
                  density="comfortable"
                />
                <v-btn
                  v-if="applicant.socialLinks?.portfolio"
                  :href="portfolioUrl"
                  target="_blank"
                  icon="mdi-web"
                  variant="text"
                  density="comfortable"
                />
              </div>
            </div>

            <!-- Titles -->
            <!-- Titles -->
            <div v-if="applicant.titles?.length" class="d-flex flex-wrap ga-1 mt-2">
              <v-chip
                v-for="title in applicant.titles"
                :key="title"
                size="small"
                variant="tonal"
                color="secondary"
              >
                {{ title }}
              </v-chip>
            </div>

            <!-- Skills -->
            <div v-if="applicant.skills?.length" class="d-flex flex-wrap ga-1 mt-2">
              <v-chip
                v-for="skill in applicant.skills"
                :key="skill"
                size="small"
                variant="tonal"
                color="primary"
              >
                {{ skill }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- Basit görünüm (kendi başvurularım) -->
      <div v-else-if="!showApplicant" class="d-flex align-center ga-3">
        <v-avatar color="primary" variant="tonal" size="40" rounded="md">
          <v-icon size="20">mdi-folder-open</v-icon>
        </v-avatar>
        <div>
          <router-link
            v-if="application.projectId?._id"
            :to="{
              name: 'ProjectDetail',
              params: { projectId: application.projectId._id },
            }"
            class="text-body-2 font-weight-bold text-decoration-none"
          >
            {{ application.projectId?.title || "—" }}
          </router-link>
          <span v-else class="text-body-2 font-weight-bold">
            {{ application.projectId?.title || "—" }}
          </span>
        </div>
      </div>
    </div>

    <template v-if="showActions">
      <v-divider />
      <v-card-actions class="pa-3">
        <v-spacer />
        <slot name="actions" />
      </v-card-actions>
    </template>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { formatDate } from "@/utils/formatDate";
import { getMediaUrl } from "@/utils/mediaUrl";

const props = defineProps({
  application: {
    type: Object,
    required: true,
  },
  showApplicant: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
});

const applicant = computed(() =>
  typeof props.application.userId === "object" ? props.application.userId : null,
);

const applicantAvatar = computed(() =>
  getMediaUrl(applicant.value?.profile?.avatarUrl),
);

const hasSocialLinks = computed(() => {
  const links = applicant.value?.socialLinks;
  return links && (links.github || links.linkedin || links.portfolio);
});

const portfolioUrl = computed(() => {
  const url = applicant.value?.socialLinks?.portfolio || "";
  return url.startsWith("http") ? url : `https://${url}`;
});

const statusMap = {
  pending: { label: "Beklemede", color: "warning", icon: "mdi-clock-outline" },
  accepted: { label: "Kabul Edildi", color: "success", icon: "mdi-check-circle-outline" },
  rejected: { label: "Reddedildi", color: "error", icon: "mdi-close-circle-outline" },
  cancelled: { label: "İptal Edildi", color: "default", icon: "mdi-cancel" },
};

const statusColor = computed(
  () => statusMap[props.application.status]?.color ?? "default",
);
const statusLabel = computed(
  () => statusMap[props.application.status]?.label ?? props.application.status,
);
const statusIcon = computed(
  () => statusMap[props.application.status]?.icon ?? "mdi-help-circle-outline",
);
</script>
