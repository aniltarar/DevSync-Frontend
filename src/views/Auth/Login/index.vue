<template>
  <v-row no-gutters class="fill-height" style="min-height: 100vh">
    <v-col
      cols="12"
      md="5"
      class="d-none d-md-flex flex-column justify-center align-center pa-12 fill-height auth-left-panel"
    >
      <v-icon size="72" class="mb-6">mdi-account-group</v-icon>
      <h1 class="text-h3 font-weight-bold mb-4 text-center">DevSync'e Giriş</h1>
      <p class="text-body-1 text-center opacity-80">
        DevSync topluluğuna giriş yapın, projelerinizi birlikte geliştirin ve
        geliştiricilerle iş birliği yapın.
      </p>
      <v-divider class="my-8 w-50 border-white" />
      <div class="d-flex flex-column ga-4 w-100" style="max-width: 320px">
        <div class="d-flex align-center ga-3">
          <v-icon size="28">mdi-rocket-launch</v-icon>
          <span class="text-body-1">Projelerine hemen başla</span>
        </div>
        <div class="d-flex align-center ga-3">
          <v-icon size="28">mdi-shield-check</v-icon>
          <span class="text-body-1">Güvenli ve özel hesabın</span>
        </div>
        <div class="d-flex align-center ga-3">
          <v-icon size="28">mdi-handshake</v-icon>
          <span class="text-body-1">Binlerce geliştirici ile bağlantı</span>
        </div>
      </div>
      <p class="text-caption mt-10 opacity-60">
        Hesabınız yok mu?
        <router-link to="/auth/register" class="text-white font-weight-bold"
          >Kayıt Ol</router-link
        >
      </p>
    </v-col>
    <v-col
      cols="12"
      md="7"
      class="d-flex justify-center align-center pa-6 pa-md-12"
    >
      <v-sheet
        width="100%"
        max-width="480"
        rounded="xl"
        elevation="4"
        class="pa-8"
      >
        <div class="mb-8">
          <h2 class="text-h5 font-weight-bold mb-1">Giriş Yap</h2>
          <p class="text-body-2 text-medium-emphasis">
            E-posta ve şifrenizle giriş yapın
          </p>
        </div>
        <v-form ref="formRef" v-model="valid" @submit.prevent="handleLogin">
          <v-text-field
            v-model="form.email"
            label="E-posta"
            prepend-icon="mdi-email"
            :rules="[rules.required, rules.email]"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            hide-details="auto"
          />
          <v-text-field
            v-model="form.password"
            label="Şifre"
            prepend-icon="mdi-lock"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :rules="[rules.required, rules.minLength]"
            variant="outlined"
            density="comfortable"
            class="mb-2"
            hide-details="auto"
          />
          <v-btn
            :loading="loading"
            color="primary"
            :disabled="!valid || loading"
            class="mt-4"
            block
            type="submit"
            >Giriş Yap</v-btn
          >
        </v-form>
        <p class="text-center text-body-2 text-medium-emphasis mt-6 d-md-none">
          Hesabınız yok mu?
          <router-link
            to="/auth/register"
            class="text-primary font-weight-bold text-decoration-none"
            >Kayıt Ol</router-link
          >
        </p>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useAuthStore } from "@/stores/auth";

const formRef = ref(null);
const valid = ref(false);
const loading = ref(false);
const showPassword = ref(false);

const form = reactive({
  email: "",
  password: "",
});

const rules = {
  required: (v) => !!v || "Bu alan zorunludur.",
  email: (v) => /.+@.+\..+/.test(v) || "Geçerli bir e-posta adresi girin.",
  minLength: (v) => v.length >= 8 || "Şifre en az 8 karakter olmalıdır.",
};

const authStore = useAuthStore();

async function handleLogin() {
  const { valid: isValid } = await formRef.value.validate();
  if (!isValid) return;
  loading.value = true;
  try {
    await authStore.login({ email: form.email, password: form.password });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-left-panel {
  background: var(--v-auth-panel-bg);
  min-height: 100vh;
}

@media (max-width: 960px) {
  .v-sheet {
    min-height: 50vh;
  }
}

.border-white {
  border-color: rgba(255, 255, 255, 0.4) !important;
}
.opacity-80 {
  opacity: 0.8;
}
.opacity-60 {
  opacity: 0.6;
}
a {
  text-decoration: none;
}
</style>
