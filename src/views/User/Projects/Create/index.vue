<template>
  <div>
    <!-- Geri butonu -->
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4 pa-2"
      :to="{ name: 'Projects' }"
    >
      Projelere Dön
    </v-btn>

    <h1 class="text-h5 font-weight-bold mb-1">Yeni Proje</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Projenizi oluşturun ve ekip arkadaşları bulmaya başlayın
    </p>

    <v-form ref="formRef" @submit.prevent="submit">
      <!-- Proje Bilgileri -->
      <v-card border flat rounded="lg" class="mb-4">
        <v-card-item>
          <v-card-title class="text-body-1 font-weight-bold">
            Proje Bilgileri
          </v-card-title>
        </v-card-item>

        <v-divider />

        <v-card-text class="d-flex flex-column ga-2">
          <v-text-field
            v-model="form.title"
            label="Proje Adı"
            placeholder="Ör: DevSync"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            :rules="[rules.required]"
          />

          <v-textarea
            v-model="form.description"
            label="Açıklama"
            placeholder="Projenizi kısaca tanımlayın..."
            variant="outlined"
            density="comfortable"
            rounded="lg"
            rows="4"
            auto-grow
          />

          <div class="d-flex ga-4">
            <v-select
              v-model="form.category"
              :items="categoryOptions"
              label="Kategori"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="[rules.required]"
              class="flex-1-1"
            />

            <v-select
              v-model="form.projectType"
              :items="projectTypeOptions"
              label="Proje Tipi"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              class="flex-1-1"
            />
          </div>
        </v-card-text>
      </v-card>

      <!-- Slotlar -->
      <v-card border flat rounded="lg" class="mb-4">
        <v-card-item>
          <v-card-title class="text-body-1 font-weight-bold">
            Pozisyonlar (Slotlar)
          </v-card-title>
          <template #append>
            <SlotForm ref="slotFormRef" @add="onAddSlot" @update="onUpdateSlot" />
          </template>
        </v-card-item>

        <v-divider />

        <v-card-text>
          <div v-if="form.slots.length" class="d-flex flex-column ga-3">
            <SlotCard
              v-for="(s, i) in form.slots"
              :key="i"
              :slot-data="s"
              @edit="slotFormRef.open(s, i)"
              @remove="form.slots.splice(i, 1)"
            />
          </div>

          <div v-else class="text-center py-8">
            <v-icon size="48" color="medium-emphasis">
              mdi-account-group-outline
            </v-icon>
            <p class="text-body-2 text-medium-emphasis mt-2">
              Henüz pozisyon eklenmedi. Ekip arkadaşı arıyorsanız slot ekleyin.
            </p>
          </div>
        </v-card-text>
      </v-card>

      <!-- Gönder -->
      <div class="d-flex justify-end">
        <v-btn
          type="submit"
          color="primary"
          variant="flat"
          size="large"
          rounded="lg"
          prepend-icon="mdi-check"
          :loading="projectStore.status === 'loading'"
          style="color: white"
        >
          Proje Oluştur
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/stores/project";
import SlotForm from "../Components/SlotForm.vue";
import SlotCard from "../Components/SlotCard.vue";

const router = useRouter();
const projectStore = useProjectStore();
const formRef = ref(null);
const slotFormRef = ref(null);

const categoryOptions = [
  { title: "Web", value: "web" },
  { title: "Mobil", value: "mobile" },
  { title: "Masaüstü", value: "desktop" },
  { title: "Yapay Zeka", value: "ai" },
  { title: "Oyun", value: "game" },
  { title: "DevOps", value: "devops" },
  { title: "Diğer", value: "other" },
];

const projectTypeOptions = [
  { title: "Takım", value: "team" },
  { title: "Bireysel", value: "personal" },
  { title: "Açık Kaynak", value: "open-source" },
  { title: "Freelance", value: "freelance" },
];

const form = reactive({
  title: "",
  description: "",
  category: null,
  projectType: "team",
  slots: [],
});

const rules = {
  required: (v) => !!v || "Bu alan zorunludur.",
};

function onAddSlot(slotData) {
  form.slots.push(slotData);
}

function onUpdateSlot(index, slotData) {
  form.slots[index] = slotData;
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const project = await projectStore.createProject({
    title: form.title,
    description: form.description,
    category: form.category,
    projectType: form.projectType,
    slots: form.slots,
  });

  if (project) {
    router.push({
      name: "ProjectDetail",
      params: { projectId: project._id },
    });
  }
}
</script>
