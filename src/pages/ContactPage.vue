<template>
  <q-page class="contact-page q-pa-lg">
    <div class="row justify-center">
      <div class="col-12 col-md-6 col-lg-5">
        <div class="contact-title text-center q-mb-lg">CONTACTO</div>

        <div class="linea-vip q-mx-auto q-mb-lg" style="width: 60px;"></div>

        <q-card flat bordered class="contact-card">
          <q-card-section>
            <q-list>
              <q-item v-if="branding.contact.email">
                <q-item-section avatar>
                  <q-icon name="email" color="secondary" size="1.5rem" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Email</q-item-label>
                  <q-item-label caption>{{ branding.contact.email }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="branding.contact.phone">
                <q-item-section avatar>
                  <q-icon name="phone" color="secondary" size="1.5rem" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Teléfono</q-item-label>
                  <q-item-label caption>{{ branding.contact.phone }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="branding.contact.address">
                <q-item-section avatar>
                  <q-icon name="location_on" color="secondary" size="1.5rem" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Dirección</q-item-label>
                  <q-item-label caption>{{ branding.contact.address }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <q-card-actions class="q-pa-md">
            <q-btn
              color="positive"
              icon="fa-brands fa-whatsapp"
              label="Escribir por WhatsApp"
              class="full-width"
              unelevated
              size="lg"
              no-caps
              @click="sendContactMessage"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { branding } from 'src/config/branding';
import { useWhatsApp } from 'src/composables/useWhatsApp';
import { useMeta } from 'quasar';

useMeta({
  title: `Contacto | ${branding.name}`,
  meta: {
    description: { name: 'description', content: `Contacta con ${branding.name}` },
    'og:title': { property: 'og:title', content: `Contacto | ${branding.name}` },
    'og:description': { property: 'og:description', content: `Contacta con ${branding.name}` },
    'og:image': { property: 'og:image', content: branding.siteUrl + branding.logo },
    'og:url': { property: 'og:url', content: branding.siteUrl + '/contacto' },
    'twitter:title': { name: 'twitter:title', content: `Contacto | ${branding.name}` },
    'twitter:description': { name: 'twitter:description', content: `Contacta con ${branding.name}` },
  },
});

const { sendContactMessage } = useWhatsApp();
</script>

<style scoped>
.contact-page {
  background: #F5F3EF;
  min-height: 60vh;
}

.contact-title {
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  letter-spacing: 4px;
  color: #1A1A2E;
}

.contact-card {
  border-radius: 4px;
}
</style>
