<template>
  <v-row no-gutters class="fill-height" style="min-height: 100vh;">
    <v-col cols="12" class="d-flex justify-center align-center pa-6">
      <v-sheet width="100%" max-width="480" rounded="xl" elevation="4" class="pa-8 text-center">
        <v-icon size="72" color="primary" class="mb-6">mdi-email-check-outline</v-icon>

        <h2 class="text-h5 font-weight-bold mb-3">E-postanızı Kontrol Edin</h2>
        <p class="text-body-2 text-medium-emphasis mb-6">
          <strong>{{ email }}</strong> adresine doğrulama linki gönderdik.
          Linke tıklayarak hesabınızı etkinleştirin.
        </p>

        <v-alert type="info" variant="tonal" class="mb-6 text-left text-body-2">
          Link <strong>24 saat</strong> geçerlidir. Spam/Junk klasörünü de kontrol edin.
        </v-alert>

        <v-btn
          block
          variant="outlined"
          color="primary"
          size="large"
          rounded="lg"
          :loading="loading"
          :disabled="cooldown > 0"
          class="mb-4"
          @click="resend"
        >
          {{ cooldown > 0 ? `Tekrar gönder (${cooldown}s)` : 'Tekrar Gönder' }}
        </v-btn>

        <router-link to="/auth/login" class="text-primary text-body-2 text-decoration-none">
          Giriş sayfasına dön
        </router-link>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";

const route = useRoute();
const authStore = useAuthStore();

const email = route.query.email || "";
const loading = ref(false);
const cooldown = ref(0);
let timer = null;

function startCooldown() {
  cooldown.value = 60;
  timer = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0) clearInterval(timer);
  }, 1000);
}

async function resend() {
  loading.value = true;
  await authStore.resendVerification(email);
  loading.value = false;
  startCooldown();
}

onUnmounted(() => clearInterval(timer));
</script>
