<template>
  <q-dialog
    v-model="innerVal"
    :position="$q.screen.lt.md ? 'bottom' : 'standard'"
    :full-width="$q.screen.lt.md"
    :maximized="$q.screen.lt.md"
    :persistent="$q.screen.lt.md"
  >
    <q-card :style="$q.screen.lt.md ? '' : 'min-width: 420px; max-width: 640px; width: 100%'">
      <q-card-section class="row items-center q-pb-none">
        <div class="row items-center">
          <q-icon name="help" color="secondary" size="md" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold">¿Necesitas ayuda?</div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator class="bg-grey-3" />

      <q-scroll-area style="height: 60vh; max-height: 480px;"
        class="q-pa-md"
      >
        <div
          v-for="section in faqConfig"
          :key="section.id"
          class="q-mb-lg"
        >
          <div class="row items-center q-mb-sm q-gutter-sm">
            <q-icon :name="section.icon" color="primary" size="sm" />
            <div class="faq-section-title">{{ section.title }}</div>
          </div>
          <q-list bordered separator class="faq-list">
            <q-expansion-item
              v-for="(item, i) in section.items"
              :key="i"
              icon="help_outline"
              :label="item.q"
              class="faq-item"
            >
              <q-card class="faq-answer-card">
                <q-card-section class="q-pt-none">
                  <div class="faq-answer">{{ item.a }}</div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </div>
      </q-scroll-area>

      <q-separator class="bg-grey-3" />

      <q-card-section class="row items-center justify-between q-gutter-sm">
        <div class="text-grey-7 text-caption">
          ¿No encuentras tu respuesta?
        </div>
        <q-btn
          color="positive"
          icon="fa-brands fa-whatsapp"
          label="Escríbenos"
          no-caps
          :href="whatsappUrl"
          target="_blank"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { faqConfig } from 'src/config/faq';
import { formatWhatsAppUrl, whatsappConfig } from 'src/config/whatsapp';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const $q = useQuasar();

const innerVal = ref<boolean>(props.modelValue);
watch(() => props.modelValue, (v) => (innerVal.value = v));
watch(innerVal, (v) => emit('update:modelValue', v));

const whatsappUrl = formatWhatsAppUrl(whatsappConfig.messageTemplates.contact());
</script>

<style scoped>
.fa-subtitle-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #1a1a2e;
}

.faq-item {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
}

.faq-answer {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #374151;
}

.faq-answer-card {
  border-radius: 0;
}

@media (prefers-reduced-motion: reduce) {
  .faq-item :deep(.q-expansion-item__container) {
    transition: none;
  }
}
</style>