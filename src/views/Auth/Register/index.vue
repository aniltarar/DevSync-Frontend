<template>
  <v-row no-gutters class="fill-height" style="min-height: 100vh;">
    <v-col
      cols="12"
      md="5"
      class="d-none d-md-flex flex-column justify-center align-center pa-12 fill-height auth-left-panel"
    >
      <v-icon size="72" class="mb-6">mdi-account-group</v-icon>
      <h1 class="text-h3 font-weight-bold mb-4 text-center">
        Aramıza Katılın!
      </h1>
      <p class="text-body-1 text-center opacity-80">
        DevSync topluluğuna üye olun, projelerinizi birlikte geliştirin ve
        geliştiricilerle iş birliği yapın.
      </p>

      <v-divider class="my-8 w-50 border-white" />

      <div class="d-flex flex-column ga-4 w-100" style="max-width: 320px">
        <div class="d-flex align-center ga-3">
          <v-icon size="28">mdi-rocket-launch</v-icon>
          <span class="text-body-1">Hızlı ve kolay başlangıç</span>
        </div>
        <div class="d-flex align-center ga-3">
          <v-icon size="28">mdi-shield-check</v-icon>
          <span class="text-body-1">Güvenli ve özel hesabınız</span>
        </div>
        <div class="d-flex align-center ga-3">
          <v-icon size="28">mdi-handshake</v-icon>
          <span class="text-body-1">Binlerce geliştirici ile bağlantı</span>
        </div>
      </div>

      <p class="text-caption mt-10 opacity-60">
        Zaten hesabınız var mı?
        <router-link to="/auth/login" class="text-white font-weight-bold"
          >Giriş Yap</router-link
        >
      </p>
    </v-col>

    <!-- Sağ: Kayıt formu -->
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
          <h2 class="text-h5 font-weight-bold mb-1">Hesap Oluştur</h2>
          <p class="text-body-2 text-medium-emphasis">
            Bilgilerinizi girerek kayıt olun
          </p>
        </div>

        <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.username"
            label="Kullanıcı Adı"
            prepend-inner-icon="mdi-at"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-3"
            hide-details="auto"
          />

          <v-row dense class="mb-3">
            <v-col cols="6">
              <v-text-field
                v-model="form.name"
                label="Ad"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.surname"
                label="Soyad"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="form.email"
            label="E-posta"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.email]"
            class="mb-3"
            hide-details="auto"
          />

          <v-text-field
            v-model="form.password"
            label="Şifre"
            prepend-inner-icon="mdi-lock-outline"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.minLength]"
            class="mb-2"
            hide-details="auto"
          />

          <v-progress-linear
            v-if="form.password"
            :model-value="passwordStrength.score"
            :color="passwordStrength.color"
            rounded
            height="4"
            class="mb-1"
          />
          <p
            v-if="form.password"
            class="text-caption mb-4"
            :class="`text-${passwordStrength.color}`"
          >
            Şifre gücü: {{ passwordStrength.label }}
          </p>

          <v-checkbox
            v-model="acceptTerms"
            :rules="[rules.terms]"
            hide-details="auto"
            class="mb-4"
          >
            <template #label>
              <span class="text-body-2">
                <a href="#" class="text-primary text-decoration-none"
                  >Kullanım Koşulları</a
                >'nı ve
                <a href="#" class="text-primary text-decoration-none"
                  >Gizlilik Politikası</a
                >'nı kabul ediyorum
              </span>
            </template>
          </v-checkbox>

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            rounded="lg"
            :loading="loading"
            :disabled="!valid"
          >
            Kayıt Ol
          </v-btn>
        </v-form>

        <p class="text-center text-body-2 text-medium-emphasis mt-6 d-md-none">
          Zaten hesabınız var mı?
          <router-link
            to="/login"
            class="text-primary font-weight-bold text-decoration-none"
            >Giriş Yap</router-link
          >
        </p>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useAuthStore } from "@/stores/auth.js";


const formRef = ref(null);
const valid = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const acceptTerms = ref(false);

const authStore = useAuthStore();

const form = reactive({
  username: "",
  name: "",
  surname: "",
  email: "",
  password: "",
});

const rules = {
  required: (v) => !!v || "Bu alan zorunludur.",
  email: (v) => /.+@.+\..+/.test(v) || "Geçerli bir e-posta adresi girin.",
  minLength: (v) => v.length >= 8 || "Şifre en az 8 karakter olmalıdır.",
  terms: (v) => !!v || "Devam etmek için koşulları kabul etmelisiniz.",
};

const passwordStrength = computed(() => {
  const pwd = form.password;
  if (!pwd) return { score: 0, color: "grey", label: "" };

  let score = 0;
  if (pwd.length >= 8) score += 25;
  if (pwd.length >= 12) score += 15;
  if (/[A-Z]/.test(pwd)) score += 20;
  if (/[0-9]/.test(pwd)) score += 20;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 20;

  if (score <= 25) return { score, color: "error", label: "Zayıf" };
  if (score <= 50) return { score, color: "warning", label: "Orta" };
  if (score <= 75) return { score, color: "info", label: "İyi" };
  return { score, color: "success", label: "Güçlü" };
});

async function handleSubmit() {
  const { valid: isValid } = await formRef.value.validate();
  if (!isValid) return;

  loading.value = true;

  const { username, name, surname, email, password } = form;


  await authStore.register({ username, name, surname, email, password });

  // Simulate async request
  setTimeout(() => {
    loading.value = false;
  }, 1000);
}
</script>

<style scoped>
.auth-left-panel {
  background: var(--v-auth-panel-bg);
  min-height: 100vh;
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
</style>
