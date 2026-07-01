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

useMeta({
  title: 'Ferretería VIP | Catálogo',
  meta: {
    description: { name: 'description', content: 'Catálogo de productos Ferretería VIP' },
    'og:title': { property: 'og:title', content: 'Ferretería VIP | Catálogo' },
    'og:description': { property: 'og:description', content: 'Catálogo de productos Ferretería VIP' },
    'og:image': { property: 'og:image', content: branding.siteUrl + branding.logo },
    'og:url': { property: 'og:url', content: branding.siteUrl + '/catalogo' },
    'twitter:title': { name: 'twitter:title', content: 'Ferretería VIP | Catálogo' },
    'twitter:description': { name: 'twitter:description', content: 'Catálogo de productos Ferretería VIP' },
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
