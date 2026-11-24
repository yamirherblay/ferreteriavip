<template>
  <q-page class="about-page q-pa-lg">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="about-title text-center q-mb-lg">FERRETERÍA VIP</div>

        <div class="linea-vip q-mx-auto q-mb-lg" style="width: 60px;"></div>

        <div class="about-content">
          <p>En Ferretería VIP encuentras todo lo que necesitas para tu obra, reparación o proyecto del hogar. Herramientas, pintura, electricidad, plomería, materiales de construcción — todo en un solo lugar.</p>
          <p>Trabajamos con precios en CUP y puedes pedir por WhatsApp con atención personalizada.</p>
          <p>VIP no es solo un nombre: es cómo tratamos a cada cliente.</p>
        </div>

        <div class="linea-vip q-mx-auto q-my-lg" style="width: 60px;"></div>

        <div class="text-center text-gold" style="letter-spacing: 8px; font-size: 1.2rem;">
          ★ ★ ★
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { branding } from 'src/config/branding';
import { useMeta } from 'quasar';

const pageTitle = `Sobre nosotros | ${branding.name}`;
const pageDescription = `Conoce ${branding.name}: herramientas y materiales para tu obra, reparación o proyecto del hogar, con atención personalizada.`;

useMeta({
  title: pageTitle,
  meta: {
    description: { name: 'description', content: pageDescription },
    'og:title': { property: 'og:title', content: pageTitle },
    'og:description': { property: 'og:description', content: pageDescription },
    'og:image': { property: 'og:image', content: branding.siteUrl + branding.ogImage },
    'og:url': { property: 'og:url', content: branding.siteUrl + '/acerca' },
    'twitter:title': { name: 'twitter:title', content: pageTitle },
    'twitter:description': { name: 'twitter:description', content: pageDescription },
    'twitter:image': { name: 'twitter:image', content: branding.siteUrl + branding.ogImage },
  },
});
</script>

<style scoped>
.about-page {
  background: #F5F3EF;
  min-height: 60vh;
}

.about-title {
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  letter-spacing: 4px;
  color: #1A1A2E;
}

.about-content {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.7;
  color: #1A1A2E;
}

.about-content p {
  margin-bottom: 1rem;
}

.text-gold {
  color: #C8963E;
}
</style>
