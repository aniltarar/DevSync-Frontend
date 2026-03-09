<template>
  <div>
    <!-- Header -->
    <v-app-bar  border="bottom" height="64">
      <v-icon size="28" color="primary" class="ml-4">mdi-code-tags</v-icon>
      <span class="text-h6 font-weight-bold ml-2">DevSync</span>
      <v-spacer />
      <v-btn
        :icon="themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="text"
        size="small"
        class="mr-1"
        @click="themeStore.toggleTheme"
      />
      <v-btn variant="text" :to="'/auth/login'" class="mr-1">Giriş Yap</v-btn>
      <v-btn
        color="primary"
        variant="flat"
        :to="'/auth/register'"
        class="mr-4"
        rounded="lg"
      >
        Kayıt Ol
      </v-btn>
    </v-app-bar>

    <v-main>
      <!-- Hero -->
      <v-container fluid class="py-16 text-center" style="max-width: 860px">
        <v-chip color="primary" variant="tonal" size="small" class="mb-6">
          Yazılımcılar için platform
        </v-chip>
        <h1
          class="text-h3 text-sm-h2 font-weight-black mb-4"
          style="line-height: 1.15"
        >
          Ekibini Bul,<br />
          <span class="text-primary">Beraber Geliştirmeye</span> Başla
        </h1>
        <p
          class="text-body-1 text-medium-emphasis mb-8"
          style="max-width: 520px; margin: 0 auto 2rem"
        >
          Projeni paylaş, takım arkadaşlarını bul ve yazılım dünyasında birlikte
          ilerlemeye başla.
        </p>
        <v-btn
          color="primary"
          size="large"
          variant="flat"
          :to="'/auth/register'"
          rounded="lg"
          min-width="180"
        >
          Şimdi Başla
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-container>

    

      <!-- Özellikler -->
      <v-container style="max-width: 1100px" class="pb-16">
        <h2 class="text-h5 font-weight-bold text-center mb-8">
          Neler Sunuyoruz?
        </h2>
        <v-row justify="center">
          <v-col
            v-for="feature in features"
            :key="feature.title"
            cols="12"
            md="4"
          >
            <v-card rounded="xl" border flat class="pa-8 d-flex flex-column justify-center align-center fill-height hover-card">
              <v-icon size="40" :color="feature.color" class="mb-4">{{
                feature.icon
              }}</v-icon>
              <div class="text-h6 font-weight-bold mb-2">
                {{ feature.title }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ feature.desc }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

        <!-- 4 Adım -->
      <v-container style="max-width: 1100px" class="pb-10">
        <h2 class="text-h5 font-weight-bold text-center mb-8">
          Nasıl Çalışır?
        </h2>
        <v-row justify="center" dense>
          <v-col
            v-for="step in steps"
            :key="step.number"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              rounded="xl"
              border
              flat
              class="pa-6 d-flex flex-column justify-center align-center fill-height hover-card"
            >
              <v-avatar color="primary" variant="tonal" size="48" class="mb-4">
                <span class="text-h6 font-weight-black text-primary">{{
                  step.number
                }}</span>
              </v-avatar>
              <v-icon size="32" :color="step.color" class="mb-3 d-block">{{
                step.icon
              }}</v-icon>
              <div class="text-subtitle-1 font-weight-semibold mb-2">
                {{ step.title }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ step.desc }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- CTA -->
      <v-container fluid class="py-16 text-center bg-primary">
        <h2 class="text-h5 font-weight-bold text-white mb-3">
          Projeye katılmaya hazır mısın?
        </h2>
        <p class="text-body-1 mb-6" style="color: rgba(255, 255, 255, 0.8)">
          Binlerce yazılımcı DevSync'te projelerini hayata geçiriyor.
        </p>
        <v-btn
          variant="flat"
          color="white"
          size="large"
          :to="'/auth/register'"
          rounded="lg"
          min-width="180"
        >
          <span class="text-primary font-weight-bold">Şimdi Başla</span>
          <v-icon end color="primary">mdi-arrow-right</v-icon>
        </v-btn>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme';
const themeStore = useThemeStore();

const steps = [
  {
    number: "1",
    icon: "mdi-account-edit-outline",
    color: "primary",
    title: "Profil Oluştur",
    desc: "Teknoloji stack'ini ve deneyimini belirt.",
  },
  {
    number: "2",
    icon: "mdi-folder-plus-outline",
    color: "secondary",
    title: "Proje Seç / Oluştur",
    desc: "Mevcut projelere katıl ya da kendi projen için ekip ara.",
  },
  {
    number: "3",
    icon: "mdi-account-group-outline",
    color: "accent",
    title: "Ekibini Kur",
    desc: "Rolleri dağıt, takım arkadaşlarını davet et.",
  },
  {
    number: "4",
    icon: "mdi-rocket-launch-outline",
    color: "success",
    title: "Kodlamaya Başla",
    desc: "Hedeflerinizi belirleyin ve birlikte geliştirin.",
  },
];

const features = [
  {
    icon: "mdi-compass-outline",
    color: "primary",
    title: "Proje Keşif",
    desc: "Teknolojiye, role ve ilgi alanına göre filtreleyerek sana uygun projeleri keşfet.",
  },
  {
    icon: "mdi-account-group-outline",
    color: "secondary",
    title: "Takım Çalışması",
    desc: "Görev takibi, üye yönetimi ve ortak karar alma araçlarıyla ekibinle senkronize çalış.",
  },
  {
    icon: "mdi-chat-processing-outline",
    color: "accent",
    title: "Canlı Chat",
    desc: "Proje bazlı anlık mesajlaşma ile takım iletişimini güçlendir.",
  },
];
</script>

<style scoped>
.hover-card {
  transition: background-color 0.2s ease;
}
.hover-card:hover {
  background-color: rgba(var(--v-theme-primary), 0.06) !important;
}
</style>
