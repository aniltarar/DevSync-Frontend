<template>
  <v-row no-gutters class="fill-height" style="min-height: 100vh;">
    <v-col cols="12" class="d-flex justify-center align-center pa-6">
      <v-sheet width="100%" max-width="480" rounded="xl" elevation="4" class="pa-8 text-center">

        <!-- Yükleniyor -->
        <template v-if="status === 'loading'">
          <v-progress-circular indeterminate color="primary" size="64" class="mb-6" />
          <p class="text-body-1">E-posta doğrulanıyor...</p>
        </template>

        <!-- Başarılı -->
        <template v-else-if="status === 'success'">
          <v-icon size="72" color="success" class="mb-6">mdi-check-circle-outline</v-icon>
          <h2 class="text-h5 font-weight-bold mb-3">E-posta Doğrulandı!</h2>
          <p class="text-body-2 text-medium-emphasis mb-6">
            Hesabınız etkinleştirildi. Artık giriş yapabilirsiniz.
          </p>
          <v-btn color="primary" style="color:white;" block size="large" rounded="lg" to="/auth/login">
            Giriş Yap
          </v-btn>
        </template>

        <!-- Hata -->
        <template v-else-if="status === 'error'">
          <v-icon size="72" color="error" class="mb-6">mdi-alert-circle-outline</v-icon>
          <h2 class="text-h5 font-weight-bold mb-3">Doğrulama Başarısız</h2>
          <p class="text-body-2 text-medium-emphasis mb-6">{{ errorMessage }}</p>
          <v-btn variant="outlined" color="primary" block size="large" rounded="lg" to="/auth/login">
            Giriş Sayfasına Dön
          </v-btn>
        </template>

      </v-sheet>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";

const route = useRoute();
const authStore = useAuthStore();

const status = ref("loading");
const errorMessage = ref("");

onMounted(async () => {
  const token = route.params.token;
  const result = await authStore.verifyEmail(token);
  if (result) {
    status.value = "success";
  } else {
    status.value = "error";
    errorMessage.value = authStore.message || "Geçersiz veya süresi dolmuş link.";
  }
});
</script>
