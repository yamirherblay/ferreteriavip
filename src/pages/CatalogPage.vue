<template>
  <q-page padding class="catalog-page">
    <div class="catalog-title text-center q-mb-lg">CATÁLOGO</div>

    <CatalogView />
  </q-page>
</template>

<script setup lang="ts">
import { CatalogView } from 'src/components/catalog';
import { useMeta } from 'quasar';
import { branding } from 'src/config/branding';

const pageTitle = `Catálogo de productos | ${branding.name}`;
const pageDescription =
  'Explora herramientas, material eléctrico, grifería, cerraduras, pintura y más. Consulta precios y pide por WhatsApp.';

useMeta({
  title: pageTitle,
  meta: {
    description: { name: 'description', content: pageDescription },
    'og:title': { property: 'og:title', content: pageTitle },
    'og:description': { property: 'og:description', content: pageDescription },
    'og:image': { property: 'og:image', content: branding.siteUrl + branding.ogImage },
    'og:url': { property: 'og:url', content: branding.siteUrl + '/catalogo' },
    'twitter:title': { name: 'twitter:title', content: pageTitle },
    'twitter:description': { name: 'twitter:description', content: pageDescription },
    'twitter:image': { name: 'twitter:image', content: branding.siteUrl + branding.ogImage },
  },
});
</script>

<style scoped>
.catalog-page {
  background: #F5F3EF;
}

.catalog-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.75rem;
  letter-spacing: 3px;
  color: #1A1A2E;
}
</style>
