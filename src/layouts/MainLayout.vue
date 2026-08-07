<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-primary text-white" elevated>
      <q-toolbar>
        <q-toolbar-title>
          <q-btn flat no-caps :to="'/'">
            <span class="text-white text-weight-bold" style="font-family: 'Oswald', sans-serif; letter-spacing: 2px; font-size: 1.15rem;">FERRETERÍA</span>
            <span class="text-gold q-ml-xs text-weight-bold" style="font-family: 'Oswald', sans-serif; letter-spacing: 2px; font-size: 1.15rem;">VIP</span>
          </q-btn>
        </q-toolbar-title>

        <div class="gt-sm row items-center q-gutter-x-sm">
          <q-btn flat dense label="Inicio" to="/" class="text-white" style="font-family: 'Inter', sans-serif; letter-spacing: 1px;" />
          <q-btn flat dense label="Catálogo" to="/catalogo" class="text-white" style="font-family: 'Inter', sans-serif; letter-spacing: 1px;" />
          <q-btn
            flat
            dense
            :href="whatsappUrl"
            target="_blank"
            icon="fa-brands fa-whatsapp"
            label="WhatsApp"
            class="text-white"
            style="font-family: 'Inter', sans-serif; letter-spacing: 1px;"
          />
        </div>

        <q-btn
          flat
          round
          dense
          icon="help_outline"
          class="q-ml-xs text-white"
          aria-label="Ayuda"
          @click="showHelp = true"
        />
        <q-btn
          flat
          round
          dense
          icon="admin_panel_settings"
          class="q-ml-sm text-white"
          :to="adminRoute"
        />

        <q-btn
          flat
          round
          dense
          icon="shopping_cart"
          class="q-ml-sm text-white"
          @click="showCart = true"
        >
          <q-badge color="accent" text-color="white" floating v-if="cart.count">
            {{ cart.count }}
          </q-badge>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="$q.screen.lt.md" class="bg-primary text-white bottom-nav" bordered fixed>
      <div class="search-panel" :class="{ 'search-open': searchActive }">
        <q-input
          ref="searchInputRef"
          v-model="searchQuery"
          dense
          filled
          placeholder="Buscar productos..."
          class="search-input q-px-sm q-py-xs"
          dark
          bg-color="primary"
          @keyup.enter="doSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-btn flat round dense icon="close" size="sm" color="white" @click="closeSearch" />
          </template>
        </q-input>
      </div>

      <q-tabs
        v-model="activeTab"
        active-color="secondary"
        indicator-color="transparent"
        class="text-grey-4"
        narrow-indicator
        dense
      >
        <q-route-tab name="home" icon="home" to="/" label="Inicio" />
        <q-route-tab name="store" icon="store" to="/catalogo" label="Catálogo" />
        <q-tab
          name="search"
          icon="search"
          label="Buscar"
          @click="toggleSearch"
        />
        <q-tab
          name="cart"
          icon="shopping_cart"
          label="Carrito"
          @click="showCart = true"
        />
        <q-tab
          name="whatsapp"
          icon="fa-brands fa-whatsapp"
          label="WhatsApp"
          @click="openWhatsApp"
        />
        <q-tab
          name="help"
          icon="help"
          label="Ayuda"
          @click="showHelp = true"
        />
      </q-tabs>
      
    </q-footer>

    <cart-modal v-model="showCart" />
    <HelpModal v-model="showHelp" />
    <ProductPreview />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useCartStore } from 'src/stores/cart';
import { useAuthStore } from 'src/stores/auth';
import { useGlobalSearch } from 'src/composables/useGlobalSearch';
import { formatWhatsAppUrl, whatsappConfig } from 'src/config/whatsapp';
import ProductPreview from 'components/catalog/ProductPreview.vue';
import CartModal from 'components/CartModal.vue';
import HelpModal from 'components/HelpModal.vue';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const showCart = ref(false);
const showHelp = ref(false);
const cart = useCartStore();
const auth = useAuthStore();
const adminRoute = computed(() =>
  auth.isAuthenticated ? { name: 'admin' } : { name: 'login' },
);

const searchActive = ref(false);
const searchInputRef = ref<{ focus: () => void } | null>(null);
const { searchQuery } = useGlobalSearch();

const whatsappUrl = formatWhatsAppUrl(whatsappConfig.messageTemplates.contact());

function activeTabFromRoute(path: string) {
  if (path === '/') return 'home';
  if (path === '/catalogo') return 'store';
  return 'home';
}

const activeTab = ref(activeTabFromRoute(route.path));

watch(() => route.path, (path) => {
  activeTab.value = activeTabFromRoute(path);
});

watch(showCart, (val) => {
  if (!val) {
    activeTab.value = activeTabFromRoute(route.path);
  }
});

watch(showHelp, (val) => {
  if (!val) {
    activeTab.value = activeTabFromRoute(route.path);
  }
});

function toggleSearch() {
  searchActive.value = !searchActive.value;
  if (searchActive.value) {
    activeTab.value = 'search';
    void nextTick(() => {
      searchInputRef.value?.focus();
    });
  } else {
    activeTab.value = activeTabFromRoute(route.path);
  }
}

function closeSearch() {
  searchActive.value = false;
  searchQuery.value = '';
  activeTab.value = activeTabFromRoute(route.path);
}

function doSearch() {
  const q = searchQuery.value.trim();
  if (!q) return;
  searchActive.value = false;
  searchQuery.value = '';
  void router.push({ path: '/catalogo', query: { q } });
}

function openWhatsApp() {
  window.open(whatsappUrl, '_blank');
  activeTab.value = activeTabFromRoute(route.path);
}
</script>

<style lang="scss">
.text-gold {
  color: #C8963E;
}

.search-panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;

  &.search-open {
    max-height: 56px;
  }
}

.search-input {
  :deep(.q-field__control) {
    border-radius: 0;
  }

  :deep(.q-field__native) {
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
  }
}

.bottom-nav {
  .q-tab {
    padding: 4px 0;
    min-height: 56px;
    transition: transform 0.12s ease;
  }

  .q-tab__icon {
    font-size: 1.6rem;
    transition: transform 0.12s ease;
  }

  .q-tab__label {
    font-size: 0.8rem;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
  }

  @media (hover: hover) {
    .q-tab:hover {
      transform: scale(1.08);
    }
  }

  .q-tab:active {
    transform: scale(1.08);
  }
}
</style>
