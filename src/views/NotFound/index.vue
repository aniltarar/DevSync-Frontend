<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh;">
      <v-container class="text-center" style="max-width: 480px;">
        <div class="text-h1 font-weight-black text-primary mb-2" style="font-size: 8rem !important; line-height: 1;">
          404
        </div>
        <h1 class="text-h5 font-weight-bold mb-2">Sayfa Bulunamadı</h1>
        <p class="text-body-1 text-medium-emphasis mb-8">
          Aradığınız sayfa mevcut değil, taşınmış veya kaldırılmış olabilir.
        </p>
        <div class="d-flex justify-center ga-3">
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            rounded="lg"
            prepend-icon="mdi-home-outline"
            @click="goHome"
          >
            Ana Sayfa
          </v-btn>
          <v-btn
            variant="tonal"
            size="large"
            rounded="lg"
            prepend-icon="mdi-arrow-left"
            @click="$router.back()"
          >
            Geri Dön
          </v-btn>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const goHome = () => {
  if (!authStore.user) return router.push("/");
  if (authStore.user.role === "admin") return router.push("/admin");
  return router.push("/feed");
};
</script>
